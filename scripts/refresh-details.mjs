#!/usr/bin/env node
/**
 * Re-run only the metadata step (places, genre, date) over the already-cached
 * candidate pools, patching the cache and regenerating artworks.json.
 *
 * Much cheaper than `FORCE=1 npm run data`: one SPARQL query per artist and no
 * article scraping, so minutes rather than half an hour. Use it after changing
 * anything in lib/details.mjs.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { enrichWorks } from './lib/details.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const CACHE_PATH = join(__dir, '.cache.json');
const OUT_PATH = join(ROOT, 'src/data/artworks.json');

if (!existsSync(CACHE_PATH)) {
  console.error('No scripts/.cache.json — run `npm run data` first.');
  process.exit(1);
}

const cache = JSON.parse(readFileSync(CACHE_PATH, 'utf8'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const entries = Object.entries(cache).filter(([, v]) => (v.works ?? []).length > 0);
console.log(`refreshing details for ${entries.length} artists\n`);

let done = 0;
for (const [id, entry] of entries) {
  done++;
  await enrichWorks(entry.works);
  const dated = entry.works.filter((w) => w.dateLabel).length;
  const located = entry.works.filter((w) => (w.locations ?? []).length > 0).length;
  console.log(
    `[${done}/${entries.length}] ${id}: ${dated}/${entry.works.length} dated, ${located}/${entry.works.length} located`,
  );
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
  await sleep(200);
}

console.log('\nRe-run `npm run data` to reselect and write artworks.json.');
console.log(`(cache updated: ${CACHE_PATH})`);
console.log(`(output written by the data script: ${OUT_PATH})`);
