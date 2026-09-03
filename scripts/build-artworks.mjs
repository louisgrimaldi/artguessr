#!/usr/bin/env node
/**
 * Resolves each seeded artist to their most notable artworks + image URLs.
 *
 * Two passes per artist:
 *  1. Wikidata SPARQL for works with a free Commons image (P18), ranked by how
 *     many Wikipedia language editions cover them. Works for anything in the
 *     public domain.
 *  2. For artists still in copyright (Kahlo, Picasso, Rothko...) P18 is empty,
 *     so we fall back to works that merely have an English Wikipedia article
 *     and scrape that article's lead image.
 *
 * Results are cached in scripts/.cache.json so re-runs are incremental.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { enrichWorks, sparql, year } from './lib/details.mjs';
import { NOT_THE_WORK, RASTER, articleImage } from './lib/wikipedia.mjs';
import { resolveQid } from './lib/people.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const CACHE_PATH = join(__dir, '.cache.json');
const OUT_PATH = join(ROOT, 'src/data/artworks.json');
/**
 * How many artworks each artist ends up with. Prolific, heavily-documented
 * artists (Van Gogh, Picasso) fill the upper end; artists known for one or two
 * pictures sit at the floor. See selectWorks().
 */
const MIN_WORKS = 3;
const MAX_WORKS = 8;
/** Candidates kept per artist so selection can be retuned without refetching. */
const POOL_MAX = 12;


const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, 'utf8')) : {};
const artists = JSON.parse(readFileSync(join(ROOT, 'src/data/artists.json'), 'utf8'));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));




/**
 * Wikidata types that count as a single artwork. A transitive
 * `P31/P279* wd:Q838948` lookup is correct but times out on WDQS, so we pin
 * the common types explicitly.
 */
const ARTWORK_TYPES = [
  'Q3305213', // painting
  'Q860861', // sculpture
  'Q11060274', // print
  'Q93184', // drawing
  'Q125191', // photograph
  'Q219423', // mural
  'Q22669139', // fresco
  'Q11835431', // woodblock print
  'Q83426', // ukiyo-e
  'Q20437094', // installation
  'Q75855', // altarpiece
  'Q15711026', // triptych
  'Q18218093', // etching
  'Q15123870', // lithograph
  'Q18761202', // watercolour painting
  'Q22669857', // collage
  'Q1783817', // readymade
  'Q134307', // portrait
  'Q2647254', // panel painting
  'Q46686', // relief
]
  .map((t) => 'wd:' + t)
  .join(' ');

/**
 * Things an artist can be the creator of that aren't artworks for our purposes.
 * The article pass can't require an artwork type — in-copyright works are often
 * untyped — so it excludes instead. Without this, Louise Bourgeois returned
 * "The Paris Review", a magazine she designed one cover for.
 */
const NON_ARTWORK_TYPES = [
  'Q1002697', // periodical
  'Q41298', // magazine
  'Q11032', // newspaper
  'Q571', // book
  'Q7725634', // literary work
  'Q11424', // film
  'Q41176', // building
  'Q4830453', // business
  'Q207628', // musical composition
  'Q482994', // album
  'Q134556', // single
  'Q1344', // opera
  'Q431289', // brand
  'Q13417114', // typeface
  'Q1368848', // literary magazine
  'Q737498', // academic journal
  'Q5633421', // scientific journal
  'Q1110794', // daily newspaper
  'Q732577', // publication
  'Q191067', // article
  'Q47461344', // written work
  'Q234460', // text
  'Q3331189', // version, edition or translation
  'Q16970', // church building — a site several artists may have decorated
  'Q811979', // architectural structure — a building near the artist, not by them
  // Burial grounds. A sculptor who carves a headstone becomes the "creator" of
  // the whole site, and the picture is then a photograph of the place: Kollwitz
  // led with mossy crosses at Vladslo German war cemetery, an article notable
  // enough (8 language editions) to outrank her own sculpture standing in it.
  // "Memorial" is deliberately absent — those are often genuinely the work.
  'Q39614', // cemetery
  'Q1241568', // war cemetery
  'Q1707610', // war cemetery (the other one)
  'Q173387', // grave
]
  .map((t) => 'wd:' + t)
  .join(' ');

/** Pass 1a: works with a free image AND an explicit artwork type. Highest precision. */
function typedWorksQuery(qid) {
  return `
SELECT ?w ?wLabel ?img ?date (COUNT(DISTINCT ?sl) AS ?links) WHERE {
  VALUES ?type { ${ARTWORK_TYPES} }
  ?w wdt:P170 wd:${qid} ; wdt:P18 ?img ; wdt:P31 ?type .
  OPTIONAL { ?w wdt:P571 ?date . }
  OPTIONAL { ?sl schema:about ?w . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} GROUP BY ?w ?wLabel ?img ?date
ORDER BY DESC(?links) LIMIT 25`;
}

/**
 * Pass 1b: any work with a free image. Catches works Wikidata hasn't typed —
 * but still excludes the non-artwork types, or a photo of the village church
 * near Giacometti's studio comes back as a Giacometti.
 */
function freeWorksQuery(qid) {
  return `
SELECT ?w ?wLabel ?img ?date (COUNT(DISTINCT ?sl) AS ?links) WHERE {
  ?w wdt:P170 wd:${qid} ; wdt:P18 ?img .
  FILTER NOT EXISTS {
    VALUES ?bad { ${NON_ARTWORK_TYPES} }
    ?w wdt:P31 ?bad .
  }
  OPTIONAL { ?w wdt:P571 ?date . }
  OPTIONAL { ?sl schema:about ?w . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} GROUP BY ?w ?wLabel ?img ?date
ORDER BY DESC(?links) LIMIT 25`;
}





/** Pass 2: works that at least have an English Wikipedia article. */
function articleWorksQuery(qid) {
  return `
SELECT ?w ?wLabel ?article ?date (COUNT(DISTINCT ?sl) AS ?links) WHERE {
  ?w wdt:P170 wd:${qid} .
  ?article schema:about ?w ; schema:isPartOf <https://en.wikipedia.org/> .
  FILTER NOT EXISTS {
    VALUES ?bad { ${NON_ARTWORK_TYPES} }
    ?w wdt:P31 ?bad .
  }
  OPTIONAL { ?w wdt:P571 ?date . }
  OPTIONAL { ?sl schema:about ?w . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} GROUP BY ?w ?wLabel ?article ?date
ORDER BY DESC(?links) LIMIT 20`;
}
/**
 * Skip Wikidata items that aren't really a single artwork. The plural forms
 * matter: "Views of Mount Fuji" is a print series but "View of Toledo" is a
 * painting, and "Three Studies of Lucian Freud" is a genuine triptych.
 */
const BAD_TITLE = new RegExp(
  [
    /\b(period|series|works?|list of|collection|catalogue|museum|exhibition|group of|style of|after )\b/
      .source,
    /\bviews of\b/.source,
    /\b(paintings|drawings|sculptures|prints|photographs|portraits) of\b/.source,
    // Numbered ukiyo-e print series, and bound sketchbook compilations.
    /\b(stations|scenes) of\b/.source,
    /\bmanga\b/.source,
    // A burial plot is a place, not a work. Wikidata files some as artworks
    // because a sculptor made the headstone, and the picture is then a
    // photograph of the grave — Giacometti's third card was autumn leaves on
    // Gerda Taro's grave in Père-Lachaise. "Tomb of…" is deliberately not here:
    // those are carved monuments and genuinely the sculptor's work.
    /\bgrave of\b/.source,
    /\bcemetery\b/.source,
  ].join('|'),
  'i',
);

/**
 * Explicit works that are art-historically significant but unwanted as quiz
 * cards. Matched on the Wikidata label; extend or empty as you see fit.
 */
/**
 * Locations Wikidata has plainly wrong, keyed by item. Applied after enrichment.
 *
 * Warhol's Marilyn Diptych carries `P276 → Riaillé`, a commune of 1,800 people
 * in the Loire-Atlantique, alongside a correct `P195 → Tate`. The pipeline
 * prefers the more specific P276, so the card read "Location: Riaillé". Nothing
 * distinguishes a wrong village from a right one programmatically, so the few
 * that turn up are corrected here rather than guessed at.
 */
const LOCATION_FIXES = {
  Q573949: [{ name: 'Tate Modern', lat: 51.5076, lon: -0.0994 }],
};

const BLOCKED = new Set([
  "the dream of the fisherman's wife",
  // The room, where "Sistine Chapel ceiling" is the work Michelangelo painted.
  'sistine chapel',
  // The series; the individual "Untitled Film Still #…" entries are the works.
  'untitled film stills',
]);

function commonsUrl(p18, width = 1200) {
  // P18 arrives as .../Special:FilePath/Foo.jpg — ask for a sized render.
  return p18.replace(/^http:/, 'https:') + `?width=${width}`;
}



const titleKey = (title) => title.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * The bare filename behind an image URL, so the same picture is recognised
 * whichever form it arrives in.
 *
 * The two forms are not interchangeable as strings — the Commons pass yields
 * `upload.wikimedia.org/.../David_-_Napoleon_crossing_the_Alps.jpg` while the
 * article pass yields `Special:FilePath/David%20-%20Napoleon...?width=1200` —
 * so comparing whole URLs let one file be handed to two different artists.
 */
export const fileKey = (url) => {
  const bare = url.split('?')[0];
  return decodeURIComponent(bare.slice(bare.lastIndexOf('/') + 1))
    .replace(/_/g, ' ')
    .toLowerCase();
};

/** Surnames on the roster, for spotting a file that belongs to someone else. */
const SURNAMES = artists.map((a) => ({
  id: a.id,
  surname: (a.name.split(/\s+/).pop() ?? a.name).toLowerCase(),
}));

/**
 * Does this filename name a *different* artist from the roster?
 *
 * Articles about a work that reworks an older one show both pictures, and the
 * body-image fallback matches on words from the title — so Kehinde Wiley's
 * "Napoleon Leading the Army Over the Alps" picked up a file called
 * "David - Napoleon crossing the Alps", every matched word being a word the two
 * paintings genuinely share. The other painter's name in the filename is the
 * thing that gives it away, and it is the only reliable signal available here.
 */
function namesAnotherArtist(url, artist) {
  const file = fileKey(url);
  const own = (artist.name.split(/\s+/).pop() ?? artist.name).toLowerCase();
  return SURNAMES.some(
    (s) =>
      s.id !== artist.id &&
      s.surname !== own &&
      s.surname.length >= 4 &&
      new RegExp(`\\b${s.surname}\\b`).test(file),
  );
}

/**
 * Drop repeats by title *and* by image. Wikidata often carries both a print
 * series and one of its individual works, which point at the same file.
 */
function dedupe(works) {
  const titles = new Set();
  const images = new Set();
  return works.filter((w) => {
    const key = titleKey(w.title);
    const file = fileKey(w.image);
    if (titles.has(key) || images.has(file)) return false;
    titles.add(key);
    images.add(file);
    return true;
  });
}

async function collect(artist) {
  // Always re-resolve: we only reach here when the artist has too few works,
  // and a bad QID is the most common cause.
  const qid = await resolveQid(artist.name, artist.birth);
  if (!qid) return { qid: null, works: [] };

  const usable = (row) => {
    const title = row.wLabel?.value;
    // Unlabelled items come back as the raw QID.
    if (!title || /^Q\d+$/.test(title)) return false;
    return !BAD_TITLE.test(title) && !BLOCKED.has(title.toLowerCase());
  };

  let candidates = [];
  const add = (row, image, source) => {
    candidates.push({
      title: row.wLabel.value,
      year: year(row.date?.value),
      image,
      source,
      links: Number(row.links?.value ?? 0),
      item: row.w.value.split('/').pop(),
    });
    candidates = dedupe(candidates);
  };

  // Free Commons images: typed query for precision, loose query to fill gaps.
  // Skip vector files — a P18 of "Three Flags" was an SVG diagram of the US
  // flag rather than a photograph of the Jasper Johns painting.
  const addCommons = (row) => {
    if (usable(row) && RASTER.test(row.img.value) && !NOT_THE_WORK.test(row.img.value)) {
      add(row, commonsUrl(row.img.value), 'commons');
    }
  };

  for (const row of await sparql(typedWorksQuery(qid))) addCommons(row);
  if (candidates.length < POOL_MAX) {
    for (const row of await sparql(freeWorksQuery(qid))) addCommons(row);
  }

  // An artist's best-known works are often the ones still in copyright, so they
  // have no free image and lose to obscure ones. Merge in Wikipedia-hosted
  // images and let notability (sitelink count) decide the ranking.
  const byLinks = (a, b) => b.links - a.links;
  const articleRows = (await sparql(articleWorksQuery(qid))).filter(usable).sort(byLinks);
  let fetches = 0;
  for (const row of articleRows) {
    if (fetches >= 14) break;
    const links = Number(row.links?.value ?? 0);
    const ranked = [...candidates].sort(byLinks);
    // Rows are sorted by notability, so once one can't beat the incumbent
    // last place, none of the rest can either.
    if (ranked.length >= POOL_MAX && links <= ranked[POOL_MAX - 1].links) break;
    const key = row.wLabel.value.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (candidates.some((c) => c.title.toLowerCase().replace(/[^a-z0-9]/g, '') === key)) continue;

    fetches++;
    const article = decodeURIComponent(row.article.value.split('/wiki/')[1]).replace(/_/g, ' ');
    const img = await articleImage(article);
    await sleep(150);
    if (img && !NOT_THE_WORK.test(img) && !namesAnotherArtist(img, artist)) {
      add(row, img, 'wikipedia');
    }
  }

  // Keep a ranked pool rather than a fixed set, so the 3-to-8 rule can be
  // retuned later without refetching anything.
  const works = candidates.sort(byLinks).slice(0, POOL_MAX);

  // Enrich the whole pool, so re-selection never needs another round trip.
  await enrichWorks(works);

  return { qid, works };
}

/**
 * Choose how many of a ranked pool to use, between MIN_WORKS and MAX_WORKS, so
 * the set always leads with the most recognisable picture.
 *
 * A work earns a slot on either of two tests, and needs only one:
 *
 *  - absolute: covered in at least FAME_FLOOR Wikipedia language editions, so
 *    famous in its own right;
 *  - relative: at least RELATIVE_FLOOR of the artist's own best-known work.
 *
 * Each alone gets a different case wrong, which is why both are here. Absolute
 * alone under-serves an artist whose individual works are thinly documented even
 * though the artist is major — Kandinsky's best sits at 12 sitelinks and his
 * next six cluster at 8-9, so a bar of 10 admitted two and dropped him to the
 * floor despite On White II and Yellow-Red-Blue being genuinely well known.
 * Relative alone punishes the opposite case: one towering masterpiece drags the
 * threshold above the artist's other famous work, which put Picasso (top work
 * 70, eighth still 16) at the floor too.
 *
 * Taken together, a flat pool reads as a deep catalogue and fills up, while a
 * steep one — Grant Wood at 45 then 9 — correctly stays near the floor.
 * Re-tune with `node scripts/tune-selection.mjs`.
 *
 * The absolute bar is **era-aware**, because sitelink counts are not comparable
 * across centuries. A work in copyright is written about far less on Wikipedia
 * than a public-domain one of equal standing: artists born before 1880 average
 * 7.2 works over ten language editions, artists born after average 1.5. A
 * single bar tuned to old masters therefore pinned two dozen major modern
 * artists — Warhol, Rothko, Bacon, Lichtenstein, O'Keeffe, Henry Moore — to the
 * three-work floor while Vermeer got eight. Warhol is the clearest case: only
 * Campbell's Soup Cans clears 10, and his steep head (26, then 16, then 7)
 * defeats the relative test too, so the Brillo Box, the Elvises and the
 * Coca-Cola bottles were all sitting in the cached pool unused.
 */
const FAME_FLOOR = 10;
const MODERN_FAME_FLOOR = 4;
/** Roughly where work stops being reliably out of copyright. */
const MODERN_BORN_FROM = 1880;
const RELATIVE_FLOOR = 0.3;

function selectWorks(pool, artist) {
  const ranked = [...pool].sort((a, b) => (b.links ?? 0) - (a.links ?? 0));
  if (ranked.length <= MIN_WORKS) return ranked;

  const floor = artist && artist.birth >= MODERN_BORN_FROM ? MODERN_FAME_FLOOR : FAME_FLOOR;
  const top = ranked[0].links ?? 0;
  const famous = ranked.filter(
    (w) => (w.links ?? 0) >= floor || (w.links ?? 0) >= top * RELATIVE_FLOOR,
  );
  const count = Math.min(MAX_WORKS, Math.max(MIN_WORKS, famous.length));
  return ranked.slice(0, count);
}

let done = 0;
for (const artist of artists) {
  done++;
  const cached = cache[artist.id];
  // The cached pool is the expensive part; selection is recomputed every run.
  if (cached?.works?.length && !process.env.FORCE) continue;

  process.stdout.write(`[${done}/${artists.length}] ${artist.name} ... `);
  const { qid, works } = await collect(artist);
  cache[artist.id] = { qid, works };
  console.log(`pool ${works.length}`);
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
  await sleep(250);
}

/**
 * A work credited to two artists can't be a fair question — whichever name you
 * pick, the other is equally right. Chagall and Léger both decorated the church
 * at Assy, so both pools carried the same photograph. Drop such items from
 * everyone and let selection backfill from the rest of the pool.
 *
 * Contested by *file* as well as by item, which is the case that actually got
 * through. Kehinde Wiley's "Napoleon Leading the Army Over the Alps" reworks
 * David's "Napoleon Crossing the Alps", so his article shows both side by side
 * — and the body-image heuristic, matching on the words "napoleon" and "alps",
 * handed David's painting back as the Wiley. Two different Wikidata items, one
 * file, so an item-only check saw nothing wrong and the game asked who painted
 * a David with David himself among the options.
 */
const itemOwners = new Map();
const fileOwners = new Map();
for (const artist of artists) {
  for (const work of cache[artist.id]?.works ?? []) {
    for (const [map, key] of [
      [itemOwners, work.item ?? work.image],
      [fileOwners, fileKey(work.image)],
    ]) {
      if (!map.has(key)) map.set(key, new Set());
      map.get(key).add(artist.id);
    }
  }
}
const sharedFiles = new Set(
  [...fileOwners].filter(([, owners]) => owners.size > 1).map(([key]) => key),
);
const contested = new Set(
  [...itemOwners].filter(([, owners]) => owners.size > 1).map(([key]) => key),
);
if (contested.size || sharedFiles.size) {
  console.log(
    `\ndropping ${contested.size} work(s) credited to more than one artist` +
      `, ${sharedFiles.size} file(s) claimed by more than one`,
  );
}

/**
 * Hand-added works for artists Wikidata cannot serve. Appended after selection
 * rather than fed into the pool, because the fame threshold would only throw
 * them straight back out: an artist reaches four works by having four works
 * that clear the bar, and these are here precisely because their artist has
 * one work in the whole database that does.
 */
const EXTRAS_PATH = join(ROOT, 'src/data/extra-works.json');
const extras = existsSync(EXTRAS_PATH)
  ? JSON.parse(readFileSync(EXTRAS_PATH, 'utf8'))
  : {};

const out = {};
let added = 0;
for (const artist of artists) {
  // Deduped again here, not just when the pool was built, because the pools are
  // cached: an artist whose entries predate the file-level check would keep
  // them until something forced a refetch. Two Kirchner "works" shared one
  // photograph, as did Rivera's "Man at the Crossroads" and the Mexico City
  // recreation he painted after it was destroyed — genuinely two works, but
  // only one picture between them, so the second is a duplicate card.
  const seenFiles = new Set();
  const pool = (cache[artist.id]?.works ?? []).filter((w) => {
    if (contested.has(w.item ?? w.image) || sharedFiles.has(fileKey(w.image))) return false;
    const file = fileKey(w.image);
    if (seenFiles.has(file)) return false;
    seenFiles.add(file);
    return true;
  });
  const selected = selectWorks(pool, artist).map((w) =>
    w.item && LOCATION_FIXES[w.item] ? { ...w, locations: LOCATION_FIXES[w.item] } : w,
  );

  const extra = Array.isArray(extras[artist.id]) ? extras[artist.id] : [];
  const have = new Set(selected.map((w) => titleKey(w.title)));
  for (const work of extra) {
    if (have.has(titleKey(work.title))) continue;
    selected.push(work);
    have.add(titleKey(work.title));
    added++;
  }

  out[artist.id] = selected;
}
if (added) console.log(`added ${added} hand-curated work(s) from extra-works.json`);

writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));

const counts = {};
for (const works of Object.values(out)) counts[works.length] = (counts[works.length] ?? 0) + 1;
const short = Object.entries(out).filter(([, w]) => w.length < MIN_WORKS);

console.log(`\nWrote ${OUT_PATH}`);
console.log(
  'works per artist: ' +
    Object.keys(counts)
      .sort((a, b) => a - b)
      .map((k) => `${k}→${counts[k]}`)
      .join('  '),
);
console.log(`Artists with fewer than ${MIN_WORKS} works: ${short.length}`);
for (const [id, w] of short) console.log(`  ${id}: ${w.length}`);
