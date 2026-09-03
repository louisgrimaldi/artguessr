#!/usr/bin/env node
/**
 * A short museum-label description for each artwork.
 *
 * Taken from the opening of the work's English Wikipedia article, trimmed to a
 * couple of sentences. Sourced rather than written, so it stays factual — and the
 * openings usually carry the striking detail anyway ("sold for $140 million…").
 *
 *   npm run data:blurbs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { getJSON, sparql } from './lib/details.mjs';
import { cleanProse } from './lib/text.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const CACHE_PATH = join(__dir, '.cache.json');
const OUT_PATH = join(ROOT, 'src/data/blurbs.json');
/**
 * Blurbs are fetched for the whole candidate pool but only the works actually
 * selected get shipped — otherwise the bundle carries twice the text it shows.
 * Keeping the full set cached means re-selection never needs a refetch.
 */
const BLURB_CACHE = join(__dir, '.blurbs.json');

const MAX_WORDS = 48;

if (!existsSync(CACHE_PATH)) {
  console.error('No scripts/.cache.json — run `npm run data` first.');
  process.exit(1);
}

const cache = JSON.parse(readFileSync(CACHE_PATH, 'utf8'));
const blurbs = existsSync(BLURB_CACHE) ? JSON.parse(readFileSync(BLURB_CACHE, 'utf8')) : {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Every artwork QID across all cached pools. */
const items = [
  ...new Set(
    Object.values(cache)
      .flatMap((entry) => entry.works ?? [])
      .map((w) => w.item)
      .filter(Boolean),
  ),
];
console.log(`${items.length} artwork items`);

const todo = process.env.FORCE ? items : items.filter((qid) => !blurbs[qid]);
console.log(`${todo.length} still to fetch`);

// QID -> English article title.
const titles = new Map();
for (let i = 0; i < todo.length; i += 80) {
  const chunk = todo.slice(i, i + 80);
  const query = `
SELECT ?w ?article WHERE {
  VALUES ?w { ${chunk.map((q) => 'wd:' + q).join(' ')} }
  ?article schema:about ?w ; schema:isPartOf <https://en.wikipedia.org/> .
}`;
  for (const row of await sparql(query)) {
    const qid = row.w.value.split('/').pop();
    if (!titles.has(qid)) {
      titles.set(qid, decodeURIComponent(row.article.value.split('/wiki/')[1]).replace(/_/g, ' '));
    }
  }
  await sleep(400);
  process.stdout.write(`\r  articles resolved: ${titles.size}`);
}
console.log(`\n${titles.size} of ${todo.length} have an English article`);

/** Trim an intro to whole sentences within the word budget. */
function toLabel(text) {
  // Parenthetical glosses and pronunciations — see scripts/lib/text.mjs for
  // why this needs balanced matching rather than a regex.
  const cleaned = cleanProse(text.replace(/\[\d+\]/g, ''));

  // Split on sentence ends, but not on abbreviations or initials.
  const sentences = cleaned.split(/(?<![A-Z]\.)(?<=[.!?])\s+(?=[A-Z"'“])/);
  const out = [];
  let words = 0;
  for (const sentence of sentences) {
    const count = sentence.split(/\s+/).length;
    if (out.length > 0 && words + count > MAX_WORDS) break;
    out.push(sentence);
    words += count;
    if (words >= MAX_WORDS) break;
  }
  return out.join(' ').trim();
}

const byTitle = new Map([...titles].map(([qid, title]) => [title, qid]));
const allTitles = [...byTitle.keys()];

for (let i = 0; i < allTitles.length; i += 20) {
  const chunk = allTitles.slice(i, i + 20);
  const url =
    'https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2' +
    '&prop=extracts&exintro=1&explaintext=1&redirects=1&titles=' +
    encodeURIComponent(chunk.join('|'));
  const data = await getJSON(url);

  for (const page of data?.query?.pages ?? []) {
    // Redirects mean the returned title can differ from the one requested.
    const qid = byTitle.get(page.title);
    if (!qid || !page.extract) continue;
    const label = toLabel(page.extract);
    if (label.length > 40) blurbs[qid] = label;
  }
  process.stdout.write(`\r  blurbs: ${Object.keys(blurbs).length}`);
  await sleep(250);
}

// Works with no English Wikipedia article still deserve a line. Wikidata's own
// one-sentence description ("1910 painting by Henri Rousseau") is thin but true,
// and beats an empty label.
const artworksNow = JSON.parse(readFileSync(join(ROOT, 'src/data/artworks.json'), 'utf8'));
const stillMissing = [
  ...new Set(
    Object.values(artworksNow)
      .flat()
      .map((w) => w.item)
      .filter((qid) => qid && !blurbs[qid]),
  ),
];

if (stillMissing.length) {
  console.log(`\n\nfilling ${stillMissing.length} gaps from Wikidata descriptions...`);
  for (let i = 0; i < stillMissing.length; i += 50) {
    const chunk = stillMissing.slice(i, i + 50);
    const data = await getJSON(
      'https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=descriptions&languages=en&ids=' +
        chunk.join('|'),
    );
    for (const [qid, entity] of Object.entries(data?.entities ?? {})) {
      const text = entity?.descriptions?.en?.value;
      if (!text || text.length < 12) continue;
      // Capitalise and punctuate so it reads as a sentence beside the others.
      blurbs[qid] = text[0].toUpperCase() + text.slice(1).replace(/\.?$/, '.');
    }
    await sleep(300);
  }
}

writeFileSync(BLURB_CACHE, JSON.stringify(blurbs, null, 2));

// Ship only the works currently selected into artworks.json.
const artworks = JSON.parse(readFileSync(join(ROOT, 'src/data/artworks.json'), 'utf8'));
const shipped = {};
let selected = 0;
for (const works of Object.values(artworks)) {
  for (const w of works) {
    selected++;
    if (w.item && blurbs[w.item]) shipped[w.item] = blurbs[w.item];
  }
}
writeFileSync(OUT_PATH, JSON.stringify(shipped, null, 2));

console.log(`\n\ncached  ${Object.keys(blurbs).length} blurbs across the candidate pool`);
console.log(`shipped ${Object.keys(shipped).length} of ${selected} selected works -> ${OUT_PATH}`);
