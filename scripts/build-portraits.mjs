#!/usr/bin/env node
/**
 * A portrait for every artist, so faces can be learned alongside names.
 *
 * Wikidata's `P18` on a *person* is their portrait — for older artists usually a
 * self-portrait or a period painting, for modern ones a photograph. That covers
 * most of the roster in a single batched query, since every QID is already in
 * scripts/.cache.json.
 *
 * Artists whose only likeness is in copyright have no P18, so they fall back to
 * their Wikipedia article's infobox image.
 *
 *   npm run data:portraits
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { sparql } from './lib/details.mjs';
import { NOT_THE_WORK, RASTER, articleImage, looksLikeTheirWork } from './lib/wikipedia.mjs';
import { resolveQid } from './lib/people.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const CACHE_PATH = join(__dir, '.cache.json');
const OUT_PATH = join(ROOT, 'src/data/portraits.json');

if (!existsSync(CACHE_PATH)) {
  console.error('No scripts/.cache.json — run `npm run data` first.');
  process.exit(1);
}

const cache = JSON.parse(readFileSync(CACHE_PATH, 'utf8'));
const artists = JSON.parse(readFileSync(join(ROOT, 'src/data/artists.json'), 'utf8'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** artistId -> QID, from the pipeline's cache. */
const qids = new Map();
for (const artist of artists) {
  const qid = cache[artist.id]?.qid;
  if (qid) qids.set(artist.id, qid);
}
const byQid = new Map([...qids].map(([id, qid]) => [qid, id]));

console.log(`${qids.size} artists with a resolved QID`);

/** P18 plus the English article title, for everyone at once. */
function portraitQuery(list) {
  return `
SELECT ?a ?img ?article WHERE {
  VALUES ?a { ${list.map((q) => 'wd:' + q).join(' ')} }
  OPTIONAL { ?a wdt:P18 ?img . }
  OPTIONAL { ?article schema:about ?a ; schema:isPartOf <https://en.wikipedia.org/> . }
}`;
}

const commonsUrl = (p18, width = 600) =>
  p18.replace(/^http:/, 'https:') + `?width=${width}`;

const portraits = {};
const articles = new Map();

// Chunked to keep the query well inside WDQS limits.
const allQids = [...byQid.keys()];
for (let i = 0; i < allQids.length; i += 60) {
  const chunk = allQids.slice(i, i + 60);
  for (const row of await sparql(portraitQuery(chunk))) {
    const qid = row.a.value.split('/').pop();
    const id = byQid.get(qid);
    if (!id) continue;

    if (row.img && RASTER.test(row.img.value) && !portraits[id]) {
      portraits[id] = { image: commonsUrl(row.img.value), source: 'commons' };
    }
    if (row.article && !articles.has(id)) {
      articles.set(id, decodeURIComponent(row.article.value.split('/wiki/')[1]).replace(/_/g, ' '));
    }
  }
  await sleep(400);
}

console.log(`${Object.keys(portraits).length} portraits from Commons`);

// Fall back to the Wikipedia infobox for anyone still missing.
const missing = [...qids.keys()].filter((id) => !portraits[id] && articles.has(id));
console.log(`trying Wikipedia articles for ${missing.length} more...`);

for (const id of missing) {
  const img = await articleImage(articles.get(id), { allowBodyMatch: false });
  // The artwork pipeline filters these at its call site; this one did not, so a
  // sculptor's infobox location map could have been served as their face.
  if (img && !NOT_THE_WORK.test(img)) {
    portraits[id] = { image: img, source: 'wikipedia' };
    console.log(`  ${id}: ${decodeURIComponent(img.split('/').pop()).slice(0, 54)}`);
  }
  await sleep(200);
}

// ---------------------------------------------------------------------------
// Movement key-artists. The reveal card shows a movement's leading figures with
// faces, and many of them (Donatello, Masaccio, Sol LeWitt...) aren't in the
// playable roster at all, so they need looking up by name.
// ---------------------------------------------------------------------------

const movementsSrc = readFileSync(join(ROOT, 'src/data/movements.ts'), 'utf8');

/**
 * Each name must be read as a string closed by the *same* quote that opened it.
 * A naive `['"]([^'"]+)['"]` treats any quote as a terminator, so one apostrophe
 * inside a double-quoted name derails the rest of the list: "Georgia O'Keeffe"
 * parsed as `Georgia O`, and then every following name was swallowed as the
 * junk between quotes — which is how American Modernism silently lost Demuth,
 * Dove and Hartley, and how a `name:` key with an empty slug got written.
 */
const STRING = /'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g;

const keyNames = new Set(
  [...movementsSrc.matchAll(/keyArtists:\s*\[([^\]]*)\]/g)].flatMap((m) =>
    [...m[1].matchAll(STRING)].map((x) => (x[1] ?? x[2]).replace(/\\(.)/g, '$1')),
  ),
);

const slug = (name) =>
  'name:' +
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Movement lists use short forms ("Rembrandt") of roster names. */
function rosterMatch(name) {
  const exact = artists.find((a) => a.name === name);
  if (exact) return exact;
  return artists.find(
    (a) => a.name.startsWith(`${name} `) || a.name.endsWith(` ${name}`),
  );
}

const unresolved = [...keyNames].filter((name) => !rosterMatch(name));
console.log(`\n${keyNames.size} movement key-artists, ${unresolved.length} outside the roster`);

let found = 0;
const faceless = [];
for (const name of unresolved) {
  const key = slug(name);
  if (portraits[key]) continue;

  const qid = await resolveQid(name);
  if (qid) {
    const rows = await sparql(`SELECT ?img WHERE { wd:${qid} wdt:P18 ?img . } LIMIT 1`);
    const img = rows[0]?.img?.value;
    if (img && RASTER.test(img)) {
      portraits[key] = { image: commonsUrl(img), source: 'commons' };
      found++;
      await sleep(250);
      continue;
    }
  }

  // No P18 — the same Wikipedia-infobox fallback the roster gets. Four of the
  // movement figures (LeWitt, Judd, Balla, Flavin) have no Wikidata portrait at
  // all and were showing as bare initials on the movement cards.
  const article = await articleImage(name, { allowBodyMatch: false });
  if (article && !NOT_THE_WORK.test(article) && !looksLikeTheirWork(article, name)) {
    portraits[key] = { image: article, source: 'wikipedia' };
    found++;
  } else {
    faceless.push(name);
  }
  await sleep(250);
}
console.log(`resolved ${found} of ${unresolved.length}`);
if (faceless.length) console.log(`  still without a face: ${faceless.join(', ')}`);

writeFileSync(OUT_PATH, JSON.stringify(portraits, null, 2));

const without = artists.filter((a) => !portraits[a.id]).map((a) => a.id);
console.log(`\nWrote ${OUT_PATH}`);
console.log(`artist portraits: ${artists.filter((a) => portraits[a.id]).length} of ${artists.length}`);
if (without.length) console.log(`no portrait: ${without.join(', ')}`);
