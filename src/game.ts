import artistsRaw from './data/artists.json';
import artworksRaw from './data/artworks.json';
import portraitsRaw from './data/portraits.json';
import blurbsRaw from './data/blurbs.json';
import { ARTIST_FACTS, MOVEMENT_FACTS } from './data/funfacts';
import { RECOGNISE } from './data/recognise';
import { normaliseGenre } from './data/genres';
import biosRaw from './data/bios.json';
import { MOVEMENTS } from './data/movements';
import type { Artist, Artwork, ImageSource, Pin, Portrait, Round } from './types';

/** Fewest works an artist needs to be worth asking about. */
const MIN_WORKS = 3;
const CHOICES = 4;
/** How many temporal neighbours to draw distractors from. */
/**
 * How many of the best-matching artists the three wrong answers are drawn from.
 * Wide enough that the same artist doesn't always face the same three rivals,
 * narrow enough that everyone in it is a credible author of the picture — at
 * 22, which is what it was while distractors were chosen on period alone, the
 * tail of the list was far enough from the answer to give it away.
 */
const NEIGHBOUR_POOL = 9;

/**
 * A candidate stays in the running while it scores at least this fraction of
 * the best match. Keeps the pool wide where an artist has many peers and tight
 * where they have few.
 */
const SIMILAR_ENOUGH = 0.62;

const ARTWORKS = artworksRaw as Record<string, Artwork[]>;

/**
 * Only artists with enough resolved images are playable — some contemporary
 * names in the seed have no per-artwork records on Wikidata yet, and they
 * re-enter automatically once the pipeline can resolve them.
 */
export const ARTISTS: Artist[] = (artistsRaw as Artist[]).filter(
  (a) => (ARTWORKS[a.id]?.length ?? 0) >= MIN_WORKS,
);

export const TOTAL_WORKS = ARTISTS.reduce((n, a) => n + ARTWORKS[a.id].length, 0);

const BY_ID = new Map(ARTISTS.map((a) => [a.id, a]));

const PORTRAITS = portraitsRaw as Record<string, Portrait>;

/** Every seeded artist, including those benched for want of images. */
export const ALL_ARTISTS = artistsRaw as Artist[];

export const artistById = (id: string): Artist | undefined => BY_ID.get(id);
export const worksFor = (id: string): Artwork[] => ARTWORKS[id] ?? [];

/**
 * The artist's own likeness — a self-portrait for most old masters, a photograph
 * for modern ones. Undefined for the handful Wikidata has none for.
 */
export const portraitFor = (id: string): Portrait | undefined => PORTRAITS[id];

const slugOf = (name: string): string =>
  'name:' +
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Name particles that belong with the surname: "van Gogh", not "Gogh". */
const PARTICLES = new Set(['van', 'von', 'de', 'del', 'della', 'di', 'da', 'du', 'le', 'la', 'den', 'der', 'ten', 'ter']);

/**
 * Surname for compact labels, keeping any particles: "Pierre-Auguste Renoir"
 * becomes "Renoir" but "Vincent van Gogh" stays "van Gogh". Mononyms
 * ("Rembrandt", "Banksy") are returned unchanged.
 */
export function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name;
  let start = parts.length - 1;
  while (start > 0 && PARTICLES.has(parts[start - 1].toLowerCase())) start--;
  return parts.slice(start).join(' ');
}

/**
 * Match a name to a seeded artist. Movement key-artist lists use short forms —
 * "Rembrandt" for "Rembrandt van Rijn" — so a prefix/suffix match is needed.
 */
export function artistByName(name: string): Artist | undefined {
  return (
    ALL_ARTISTS.find((a) => a.name === name) ??
    ALL_ARTISTS.find((a) => a.name.startsWith(`${name} `) || a.name.endsWith(` ${name}`))
  );
}

/**
 * Portrait for anyone named in the data, including movement figures who aren't
 * playable artists (Donatello, Sol LeWitt…), stored under a name slug.
 */
export function portraitByName(name: string): Portrait | undefined {
  const artist = artistByName(name);
  return (artist && PORTRAITS[artist.id]) ?? PORTRAITS[slugOf(name)];
}

/** Movements that actually have playable artists, in chronological order. */
export const PLAYABLE_MOVEMENTS = Object.values(MOVEMENTS)
  .map((m) => ({ ...m, artists: ARTISTS.filter((a) => a.movement === m.id) }))
  .filter((m) => m.artists.length > 0)
  .sort((a, b) => parseInt(a.years, 10) - parseInt(b.years, 10));

export const artistsInMovement = (movementId: string): Artist[] =>
  ARTISTS.filter((a) => a.movement === movementId);

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Broad cultural spheres. This is the one that actually gives the answer away:
 * a Japanese printmaker offered against three European painters is answerable
 * without looking at the picture, and so is the only African name on the card.
 * Country matters much less — French against Italian gives away nothing.
 */
const SPHERES: Record<string, string> = {
  japanese: 'east-asia',
  chinese: 'east-asia',
  korean: 'east-asia',
  mexican: 'latin-america',
  brazilian: 'latin-america',
  colombian: 'latin-america',
  ghanaian: 'africa',
  nigerian: 'africa',
  ethiopian: 'africa',
  indian: 'south-asia',
};

/** Finer grouping, worth a nudge but not decisive. */
const REGIONS: Record<string, string> = {
  dutch: 'low-countries',
  flemish: 'low-countries',
  netherlandish: 'low-countries',
  belgian: 'low-countries',
  german: 'germanic',
  austrian: 'germanic',
  swiss: 'germanic',
  norwegian: 'nordic',
  swedish: 'nordic',
  danish: 'nordic',
  icelandic: 'nordic',
  finnish: 'nordic',
  russian: 'slavic',
  ukrainian: 'slavic',
  polish: 'slavic',
  serbian: 'slavic',
  romanian: 'slavic',
  spanish: 'iberian',
  portuguese: 'iberian',
  american: 'north-america',
  canadian: 'north-america',
};

/**
 * Hyphenated nationalities are genuinely dual — Japanese-American, Greek-Spanish
 * — so each part is kept and two artists count as matching if any part agrees.
 */
const partsOf = (nationality: string) => nationality.toLowerCase().split(/[-\s]+/).filter(Boolean);

const lookup = (nationality: string, table: Record<string, string>, fallback: string) =>
  new Set(partsOf(nationality).map((p) => table[p] ?? fallback));

const overlaps = (a: Set<string>, b: Set<string>) => [...a].some((v) => b.has(v));

/** Movements whose artists work in three dimensions. */
const SCULPTURAL = new Set(['contemporary-sculpture', 'modern-sculpture']);
const SCULPTURAL_GENRE = /sculpt|public art|installation|monument/i;

/**
 * Painter or sculptor. A lone sculptor among three painters is nearly as
 * obvious as a lone Japanese printmaker, because the works look different in
 * kind rather than in style.
 */
const sculpturalCache = new Map<string, boolean>();

function isSculptural(artist: Artist): boolean {
  const cached = sculpturalCache.get(artist.id);
  if (cached !== undefined) return cached;

  let verdict = SCULPTURAL.has(artist.movement);
  if (!verdict) {
    const works = worksFor(artist.id);
    const sculpted = works.filter((w) => SCULPTURAL_GENRE.test(w.genre ?? '')).length;
    verdict = works.length > 0 && sculpted * 2 > works.length;
  }
  sculpturalCache.set(artist.id, verdict);
  return verdict;
}

/**
 * How plausible `candidate` is as a wrong answer alongside `answer`. Higher is
 * a better distractor.
 *
 * Period alone — which is all this used to weigh — puts Hokusai next to
 * Constable and Turner, where the one Japanese name answers itself. Style,
 * origin and medium have to count too, so that every option on the card could
 * credibly have made the picture.
 */
function similarity(answer: Artist, candidate: Artist): number {
  let score = 0;

  const sphereA = lookup(answer.nationality, SPHERES, 'west');
  const sphereB = lookup(candidate.nationality, SPHERES, 'west');
  if (overlaps(sphereA, sphereB)) score += 55;

  if (answer.movement === candidate.movement) score += 45;

  const regionA = lookup(answer.nationality, REGIONS, 'europe');
  const regionB = lookup(candidate.nationality, REGIONS, 'europe');
  if (overlaps(regionA, regionB)) score += 18;

  if (isSculptural(answer) === isSculptural(candidate)) score += 22;

  // Period still counts, and still counts most within a lifetime or two.
  const gap = Math.abs(answer.birth - candidate.birth);
  score += 45 * Math.exp(-gap / 45);

  return score;
}

/**
 * Candidates worth offering against `to`, best first.
 *
 * The size adapts to how much company the artist actually has. A fixed count
 * fails at both ends: Warhol has a dozen equally plausible rivals, while
 * Hokusai has four — three ukiyo-e printmakers and a couple of other East
 * Asians — and padding his list out to a fixed nine reaches into 18th-century
 * Britain, where the one Japanese name on the card answers itself. So the cut
 * is relative to the best score rather than a position in the list, and only
 * falls back to filling the quota when there genuinely aren't enough close
 * matches to choose from.
 */
function nearest(pool: Artist[], to: Artist, count: number): Artist[] {
  const ranked = pool
    .map((a) => ({ artist: a, score: similarity(to, a) }))
    .sort((x, y) => y.score - x.score);

  if (ranked.length === 0) return [];

  const cutoff = ranked[0].score * SIMILAR_ENOUGH;
  const close = ranked.filter((r) => r.score >= cutoff);
  // Never fewer than the three wrong answers a round needs.
  const keep = Math.min(count, Math.max(close.length, CHOICES - 1));
  return ranked.slice(0, keep).map((x) => x.artist);
}

/**
 * Distractors come from the answer's rough contemporaries: offering Rothko
 * against Vermeer would give the period away, so a plausible wrong answer makes
 * the guess about style rather than century.
 *
 * `pool` narrows where they're drawn from (a single movement, say). Small pools
 * are topped up from the full roster so there are always four options.
 */
function pickChoices(answer: Artist, pool: Artist[]): Artist[] {
  const inPool = new Set(pool.map((a) => a.id));
  let options = nearest(
    pool.filter((a) => a.id !== answer.id),
    answer,
    NEIGHBOUR_POOL,
  );

  if (options.length < CHOICES - 1) {
    const topUp = nearest(
      ARTISTS.filter((a) => a.id !== answer.id && !inPool.has(a.id)),
      answer,
      NEIGHBOUR_POOL,
    );
    options = [...options, ...topUp];
  }

  return shuffle([answer, ...shuffle(options).slice(0, CHOICES - 1)]);
}

/**
 * Endless play without repeats: hands out a shuffled queue and only reshuffles
 * once it runs dry.
 *
 * The next round is built ahead of being asked for, so the UI can preload its
 * images and `next()` is guaranteed to return exactly what was preloaded.
 */
export interface DeckOptions {
  /** Where distractors come from; defaults to the same pool. */
  chooseFrom?: Artist[];
  /**
   * Reshuffle forever (endless mode) or stop after one pass through the pool
   * (a movement set, or the mistakes backlog), so the run can be completed.
   */
  loop?: boolean;
}

export class Deck {
  private queue: Artist[] = [];
  private upcoming: Round | null = null;
  private dealt = 0;
  private pool: Artist[];
  private chooseFrom: Artist[];
  private loop: boolean;

  constructor(pool: Artist[], options: DeckOptions = {}) {
    this.pool = pool;
    this.chooseFrom = options.chooseFrom ?? pool;
    this.loop = options.loop ?? true;
  }

  get size(): number {
    return this.pool.length;
  }

  /** How many rounds have been handed out. */
  get served(): number {
    return this.dealt;
  }

  get exhausted(): boolean {
    return !this.loop && this.dealt >= this.pool.length;
  }

  /** The round `next()` will return, without consuming it. Null when finished. */
  peek(): Round | null {
    if (this.pool.length === 0 || this.exhausted) return null;
    if (!this.upcoming) this.upcoming = this.build();
    return this.upcoming;
  }

  next(): Round | null {
    const round = this.peek();
    this.upcoming = null;
    if (round) this.dealt++;
    return round;
  }

  private build(): Round {
    if (this.queue.length === 0) this.queue = shuffle(this.pool);
    const answer = this.queue.pop()!;
    return {
      answer,
      // Kept in fame order, not shuffled: the first card should be the artist's
      // most recognisable work.
      works: worksFor(answer.id),
      choices: pickChoices(answer, this.chooseFrom),
    };
  }
}

export function lifespan(artist: Artist): string {
  return `${artist.birth}–${artist.death ?? 'present'}`;
}

/** Flatten works into mappable points; a work with several casts yields several. */
export function pinsFor(artists: Artist[]): Pin[] {
  const pins: Pin[] = [];
  for (const artist of artists) {
    for (const work of worksFor(artist.id)) {
      for (const place of work.locations ?? []) {
        if (place.lat === null || place.lon === null) continue;
        pins.push({
          lat: place.lat,
          lon: place.lon,
          place: place.name,
          title: work.title,
          artist: artist.name,
          artistId: artist.id,
          year: work.year,
        });
      }
    }
  }
  return pins;
}

/**
 * Countries Wikidata sometimes lists alongside the actual venue. "Kingdom of
 * the Netherlands · Kröller-Müller Museum" says nothing extra and doubles the
 * length of the line, so the country is dropped whenever a venue is present.
 */
const COUNTRIES = new Set([
  'France', 'Italy', 'Spain', 'Germany', 'Netherlands', 'Kingdom of the Netherlands',
  'Belgium', 'Norway', 'Sweden', 'Denmark', 'Austria', 'Switzerland', 'Japan',
  'China', 'Mexico', 'Russia', 'Russian Empire', 'Poland', 'Portugal', 'Greece',
  'Turkey', 'Canada', 'Australia', 'Brazil', 'India', 'England', 'Scotland',
  'Wales', 'United Kingdom', 'United States', 'United States of America', 'Ireland',
  'Czech Republic', 'Hungary', 'Romania', 'Finland', 'Israel', 'Ghana', 'Serbia',
]);

/**
 * Gallery hangs and exhibition titles that Wikidata files as a location.
 * "Post-Impressionism: French Painting 1850–1900" is a room at the National
 * Gallery, not a place — a date range or a colon gives them away.
 */
const NOT_A_PLACE = /\d{4}\s*[–—-]\s*\d{4}|:/;

/**
 * The only widths upload.wikimedia.org will render. Ask for anything else and
 * you get a flat `400 Use thumbnail sizes listed on https://w.wiki/GHai`, not a
 * picture. Every size the app requests must come from this list.
 */
const THUMB_WIDTHS = [20, 40, 60, 120, 250, 330, 500, 960, 1280, 1920, 3840];

/**
 * The sizes the app asks for, all of them standard widths. They live here
 * because a preload only helps if it requests the identical URL the view will
 * later render — a different width is a different cache entry, and the work is
 * wasted.
 */
export const IMAGE_THUMB = 250;
export const IMAGE_MAIN = 1280;
export const IMAGE_ZOOM = 1920;
/** Portraits, which are never rendered larger than a 104px circle. */
export const IMAGE_FACE = 250;

/**
 * How far a picture may be enlarged past its own pixels before it stops being
 * worth looking at. In-copyright works are hosted deliberately small — Koons's
 * "Michael Jackson and Bubbles" is 364px wide, Giacometti's "L'Homme qui marche
 * I" is 163px — and 21% of the collection is under 960px. Displaying those at
 * native size left them as postage stamps adrift in a black screen, which is
 * worse than a soft enlargement: you could not see the work at all.
 */
export const MAX_UPSCALE = 3;

/**
 * Fallback thumbnail URL, for records resolved before `thumb` was stored.
 *
 *   .../wikipedia/commons/f/f9/Name.jpg
 *   .../wikipedia/commons/thumb/f/f9/Name.jpg/1280px-Name.jpg
 *
 * Correct only for formats the browser displays directly. It is *not* the rule
 * for everything — a TIFF thumbnails to `lossy-page1-1280px-Name.tiff.jpg` —
 * which is why the real pattern is stored per record rather than derived here.
 */
function thumbnail(src: string, width: number): string {
  const name = src.slice(src.lastIndexOf('/') + 1);
  return `${src.replace(/\/wikipedia\/(commons|en)\//, '/wikipedia/$1/thumb/')}/${width}px-${name}`;
}

/**
 * The URL to render a picture at roughly `want` pixels wide.
 *
 * Resolved records point straight at upload.wikimedia.org. That matters more
 * than it sounds: the `Special:FilePath` URLs they replaced are a redirect
 * service, and its redirects carry `cache-control: max-age=0, must-revalidate`,
 * so every single display — even of a picture already sitting in the browser
 * cache — paid two round trips to Wikipedia before a byte could be reused.
 * Going direct makes repeat views genuinely instant, and makes preloading
 * worth doing at all.
 *
 * Never asks for more than the file holds: an upscale request is a 400, and
 * enlarging is the browser's job anyway.
 */
export function imageAt(source: ImageSource, want: number): string {
  const { src, width, thumb, render } = source;

  // Anything the resolver couldn't identify keeps its redirect URL: slower,
  // but it still shows a picture.
  if (!src) {
    return /[?&]width=\d+/.test(source.image)
      ? source.image.replace(/([?&])width=\d+/, `$1width=${want}`)
      : `${source.image}${source.image.includes('?') ? '&' : '?'}width=${want}`;
  }

  const at = (w: number) => (thumb ? thumb.replace('{w}', String(w)) : thumbnail(src, w));
  const ceiling = width ?? Infinity;

  // A handful of works are stored as TIFF, which no browser will display, so
  // handing back the original is handing back a broken image icon — which is
  // what Gauguin's "Manaò tupapaú" was. Those always go through the renderer,
  // at the largest size available, even when the caller asked for more.
  if (render) {
    const largest = [...THUMB_WIDTHS].reverse().find((w) => w < ceiling);
    const bucket = THUMB_WIDTHS.find((w) => w >= want && w < ceiling) ?? largest;
    return bucket ? at(bucket) : src;
  }

  if (want >= ceiling) return src;
  const bucket = THUMB_WIDTHS.find((w) => w >= want && w < ceiling);
  return bucket ? at(bucket) : src;
}

/** Subject genre, normalised; undefined when the source value isn't a genre. */
export const genreOf = (work: Artwork): string | undefined => normaliseGenre(work.genre);

/** Place names for display, most specific first. */
export function places(work: Artwork): string[] {
  const all = (work.locations ?? []).map((p) => p.name).filter((n) => !NOT_A_PLACE.test(n));
  const specific = all.filter((name) => !COUNTRIES.has(name));
  return specific.length > 0 ? specific : all;
}

/** Comma-separated place names for display. */
export const placeNames = (work: Artwork): string => places(work).join(' · ');

/**
 * What to print for a work's date: the exact year where known, otherwise a
 * coarser label like "1480s". Empty string when Wikidata has no date.
 */
export const dateOf = (work: Artwork): string =>
  work.dateLabel ?? (work.year !== null ? String(work.year) : '');

const BLURBS = blurbsRaw as Record<string, string>;

/** Short museum-label text for a work, drawn from its Wikipedia opening. */
export const blurbFor = (work: Artwork): string | undefined =>
  work.item ? BLURBS[work.item] : undefined;

/**
 * Wikidata's own descriptions are the last-resort source, and many are pure
 * boilerplate — "Painting by Camille Pissarro" tells a reader nothing they
 * cannot see. Those get replaced by a line composed from the facts we hold.
 */
const BOILERPLATE =
  /^(painting|artwork|sculpture|drawing|print|work|oil painting|woodblock printing|photograph|series|heritage site|mural|fresco)\b/i;

export function describeWork(work: Artwork, artistName: string): string {
  const blurb = blurbFor(work);
  if (blurb && !BOILERPLATE.test(blurb) && blurb.split(/\s+/).length > 8) return blurb;

  const parts = [`${work.genre ?? 'A work'} by ${artistName}`];
  const date = dateOf(work);
  if (date) parts.push(date);
  const where = placeNames(work);
  if (where) parts.push(`at ${where}`);
  const composed = `${work.title} — ${parts.join(', ')}.`;
  // Keep the sourced text if it somehow says more than we just assembled.
  return blurb && blurb.length > composed.length ? blurb : composed;
}

const BIOS = biosRaw as Record<string, string>;

/**
 * The card bio: Wikipedia's opening — who they were, when, and what for — with
 * the hand-written "did you know" detail folded onto the end. Facts and colour
 * read better as one paragraph than as a dry bio plus a novelty box beside it.
 */
export const bioFor = (artist: Artist): string => {
  const base = BIOS[artist.id] ?? artist.bio;
  const fact = ARTIST_FACTS[artist.id];
  return fact ? `${base} ${fact}` : base;
};

/** Visual tells for identifying an artist from an unfamiliar work. */
export const recogniseFor = (id: string): string | undefined => RECOGNISE[id];

export const factForArtist = (id: string): string | undefined => ARTIST_FACTS[id];
export const factForMovement = (id: string): string | undefined => MOVEMENT_FACTS[id];

/** Every artwork keyed by its Wikidata id, with the artist who made it. */
const WORK_INDEX = new Map<string, { work: Artwork; artist: Artist }>();
for (const artist of ARTISTS) {
  for (const work of worksFor(artist.id)) {
    if (work.item) WORK_INDEX.set(work.item, { work, artist });
  }
}

export const workByItem = (item: string) => WORK_INDEX.get(item);
