#!/usr/bin/env node
/**
 * Sanity checks over the generated dataset. Run after `npm run data`.
 * `--images` additionally HEAD-checks every image URL (slow, rate-limited).
 */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const artists = JSON.parse(readFileSync(join(ROOT, 'src/data/artists.json'), 'utf8'));
const artworks = JSON.parse(readFileSync(join(ROOT, 'src/data/artworks.json'), 'utf8'));
const portraits = existsSync(join(ROOT, 'src/data/portraits.json'))
  ? JSON.parse(readFileSync(join(ROOT, 'src/data/portraits.json'), 'utf8'))
  : {};
const movementsSrc = readFileSync(join(ROOT, 'src/data/movements.ts'), 'utf8');

/** Bare filename behind an image URL — see the shared-image check below. */
const fileKey = (url) => {
  const bare = url.split('?')[0];
  return decodeURIComponent(bare.slice(bare.lastIndexOf('/') + 1)).replace(/_/g, ' ').toLowerCase();
};

const TARGET = 3; // minimum works for an artist to be playable
const problems = [];
const warn = (msg) => problems.push(msg);

const playable = artists.filter((a) => (artworks[a.id] ?? []).length >= TARGET);
const benched = artists.filter((a) => (artworks[a.id] ?? []).length < TARGET);

// --- artists -----------------------------------------------------------------
const ids = new Set();
for (const a of artists) {
  if (ids.has(a.id)) warn(`duplicate artist id: ${a.id}`);
  ids.add(a.id);
  if (!movementsSrc.includes(`id: '${a.movement}'`)) {
    warn(`${a.name}: movement '${a.movement}' is not defined in movements.ts`);
  }
  if (a.death !== null && a.death < a.birth) warn(`${a.name}: dies before birth`);
  const words = a.bio.trim().split(/\s+/).length;
  if (words < 35 || words > 75) warn(`${a.name}: bio is ${words} words (want ~60)`);
}

// Portraits are a learning aid, so every playable artist should have one.
for (const a of playable) {
  if (!portraits[a.id]) warn(`${a.name}: no portrait`);
}

// --- artworks ----------------------------------------------------------------
const ICONISH = /searchtool|symbol[_ ]|question[_ ]book|commons-logo|ambox|disambig|magnify|edit-|padlock/i;
const RASTER = /\.(jpg|jpeg|png|tiff?|gif|webp)/i;
const imageOwners = new Map();

for (const a of playable) {
  for (const w of artworks[a.id]) {
    if (!w.image) warn(`${a.name} / ${w.title}: no image`);
    if (ICONISH.test(w.image)) warn(`${a.name} / ${w.title}: image looks like a Wikipedia icon`);
    if (!RASTER.test(w.image)) warn(`${a.name} / ${w.title}: image is not a raster file`);
    // Wikidata "unknown value" surfaces as a blank-node URI; it must never
    // reach the reveal card as a location.
    for (const label of [w.genre, ...(w.locations ?? []).map((p) => p.name)]) {
      if (!label) continue;
      if (/^https?:\/\//i.test(label)) {
        warn(`${a.name} / ${w.title}: "${label}" is a raw URI, not a label`);
      }
      if (label.length > 70) warn(`${a.name} / ${w.title}: label suspiciously long`);
    }
    for (const p of w.locations ?? []) {
      const bad =
        (p.lat !== null && (p.lat < -90 || p.lat > 90)) ||
        (p.lon !== null && (p.lon < -180 || p.lon > 180));
      if (bad) warn(`${a.name} / ${w.title}: coordinates out of range for ${p.name}`);
    }
    if (w.year !== null && w.year !== undefined && (w.year < 1200 || w.year > 2030)) {
      warn(`${a.name} / ${w.title}: implausible year ${w.year}`);
    }
    // Keyed on the bare filename, not the URL. The same picture reaches the
    // dataset in two forms — a direct upload.wikimedia.org path from the
    // Commons pass, a Special:FilePath link from the article pass — so a
    // URL-keyed check let Kehinde Wiley's "Napoleon Leading the Army Over the
    // Alps" ship as a photograph of the David it reworks, with David himself
    // among the four options.
    const file = fileKey(w.image);
    if (imageOwners.has(file)) {
      warn(`shared image between "${imageOwners.get(file)}" and "${a.name} / ${w.title}"`);
    } else {
      imageOwners.set(file, `${a.name} / ${w.title}`);
    }
  }
}

// --- report ------------------------------------------------------------------
const allWorks = playable.flatMap((a) => artworks[a.id]);
const pct = (n) => `${Math.round((n / allWorks.length) * 100)}%`;
const located = allWorks.filter((w) => (w.locations ?? []).length > 0);
const mappable = allWorks.filter((w) => (w.locations ?? []).some((p) => p.lat !== null));

const spread = {};
for (const a of playable) spread[artworks[a.id].length] = (spread[artworks[a.id].length] ?? 0) + 1;

console.log(`seeded artists   ${artists.length}`);
console.log(`playable         ${playable.length}  (${allWorks.length} artworks)`);
console.log(`benched          ${benched.length}  ${benched.map((a) => a.id).join(', ')}`);
console.log(
  `works per artist ` +
    Object.keys(spread)
      .sort((a, b) => a - b)
      .map((k) => `${k}→${spread[k]}`)
      .join('  '),
);
console.log(`with a date      ${pct(allWorks.filter((w) => w.dateLabel || w.year).length)}` +
    `  (exact year ${pct(allWorks.filter((w) => w.year).length)})`);
console.log(`with location    ${pct(located.length)}`);
console.log(`with coordinates ${pct(mappable.length)}`);
console.log(`with genre       ${pct(allWorks.filter((w) => w.genre).length)}`);
console.log(
  `portraits        ${playable.filter((a) => portraits[a.id]).length}/${playable.length} playable artists`,
);

// Anything unresolved still displays, but by way of the Special:FilePath
// redirect service — three round trips instead of one, and uncacheable. Flag it
// so it can be picked up by a later `npm run data:images`.
const resolved = allWorks.filter((w) => w.src && w.width);
console.log(`direct image URLs ${pct(resolved.length)}`);
for (const a of playable) {
  for (const w of artworks[a.id] ?? []) {
    if (!w.src || !w.width) warn(`${a.name} — "${w.title}": unresolved image (run data:images)`);
  }
}

// The point of storing a native width is choosing a thumbnail that exists.
const small = resolved.filter((w) => w.width < 960).length;
console.log(`under 960px wide  ${pct(small)}  (enlarged up to 3x in spectator mode)`);

// Faces on the movement cards, which come from a different lookup than the
// roster's and so can regress independently — they did once, when a quote-
// parsing bug silently dropped three names from a movement's list.
const STRING = /'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g;
const keyNames = new Set();
for (const m of movementsSrc.matchAll(/keyArtists:\s*\[([^\]]*)\]/g)) {
  for (const x of m[1].matchAll(STRING)) keyNames.add((x[1] ?? x[2]).replace(/\\(.)/g, '$1'));
}
const nameSlug = (n) =>
  'name:' +
  n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
const byName = (n) =>
  artists.find((a) => a.name === n) ??
  artists.find((a) => a.name.startsWith(`${n} `) || a.name.endsWith(` ${n}`));
const facelessFigures = [...keyNames].filter((n) => {
  const a = byName(n);
  return !((a && portraits[a.id]) ?? portraits[nameSlug(n)]);
});
console.log(
  `movement figures  ${keyNames.size - facelessFigures.length}/${keyNames.size} with a face` +
    (facelessFigures.length ? `  (${facelessFigures.join(', ')})` : ''),
);
if (portraits['name:']) warn('portraits.json has an empty name slug — check the movements parser');

if (process.argv.includes('--images')) {
  for (const a of playable) {
    const p = portraits[a.id];
    if (p && !imageOwners.has(p.image)) imageOwners.set(p.image, `${a.name} (portrait)`);
  }
  // Check the URL the app will actually request, not the redirect URL kept for
  // identity — a stored `src` that 404s would break the picture even though the
  // Special:FilePath form still resolved.
  const byImage = new Map();
  for (const w of allWorks) byImage.set(w.image, w.src);
  for (const p of Object.values(portraits)) byImage.set(p.image, p.src);

  const urls = [];
  for (const [image, owner] of [...imageOwners]) {
    const url = byImage.get(image) ?? image;
    imageOwners.set(url, owner);
    urls.push(url);
  }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  console.log(`\nchecking ${urls.length} image URLs (slow — Wikimedia rate-limits)...`);

  let bad = 0;
  let throttled = 0;
  for (const [i, url] of urls.entries()) {
    let status = 0;
    let error = null;

    // Wikimedia answers 429 readily; back off rather than reporting a false dead link.
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'HEAD',
          headers: { 'User-Agent': 'artguessr/0.1 (louis.grimaldi.24@gmail.com)' },
        });
        status = res.status;
        if (status !== 429) break;
        throttled++;
        await sleep(3000 * (attempt + 1));
      } catch (e) {
        error = e.message;
        await sleep(1500 * (attempt + 1));
      }
    }

    if (error && !status) {
      bad++;
      console.log(`  ERR  ${imageOwners.get(url)}  ${error}`);
    } else if (status && status !== 200) {
      bad++;
      console.log(`  ${status}  ${imageOwners.get(url)}`);
    }

    if (i % 50 === 49) console.log(`  ...${i + 1}/${urls.length}`);
    await new Promise((r) => setTimeout(r, 400));
  }
  console.log(`unreachable images: ${bad}  (429s retried: ${throttled})`);
  if (bad) warn(`${bad} image URL(s) did not return 200`);
}

console.log(`\n${problems.length ? `${problems.length} problem(s):` : 'no problems found'}`);
for (const p of problems) console.log(`  - ${p}`);
process.exit(problems.length ? 1 : 0);
