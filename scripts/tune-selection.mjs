#!/usr/bin/env node
/**
 * Explore the 3-to-8 selection thresholds against the cached candidate pools.
 * Read-only and offline — the pool is already fetched, so this is instant.
 *
 *   node scripts/tune-selection.mjs            # compare threshold combinations
 *   node scripts/tune-selection.mjs 8 0.45     # detail for one combination
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const cache = JSON.parse(readFileSync(join(__dir, '.cache.json'), 'utf8'));
const artists = JSON.parse(readFileSync(join(__dir, '../src/data/artists.json'), 'utf8'));
const names = Object.fromEntries(artists.map((a) => [a.id, a.name]));

const MIN = 3;
const MAX = 8;

function select(pool, absolute, relative) {
  const ranked = [...pool].sort((a, b) => (b.links ?? 0) - (a.links ?? 0));
  if (ranked.length <= MIN) return ranked;
  const top = ranked[0].links ?? 0;
  const bar = Math.max(absolute, top * relative);
  const famous = ranked.filter((w) => (w.links ?? 0) >= bar);
  return ranked.slice(0, Math.min(MAX, Math.max(MIN, famous.length)));
}

const entries = Object.entries(cache).filter(([, v]) => (v.works ?? []).length >= MIN);

const [absArg, relArg] = process.argv.slice(2);
if (absArg && relArg) {
  const absolute = Number(absArg);
  const relative = Number(relArg);
  const rows = entries
    .map(([id, v]) => ({ id, n: select(v.works, absolute, relative).length, pool: v.works.length }))
    .sort((a, b) => b.n - a.n || a.id.localeCompare(b.id));
  for (const r of rows) {
    console.log(`${String(r.n).padStart(2)}  ${names[r.id] ?? r.id}  (pool ${r.pool})`);
  }
  process.exit(0);
}

console.log(`${entries.length} artists with a usable pool\n`);
console.log('abs  rel   ' + [3, 4, 5, 6, 7, 8].map((n) => `${n}w`.padStart(5)).join('') + '   mean');

for (const absolute of [8, 10, 12, 14, 16, 20]) {
  for (const relative of [0, 0.15, 0.3]) {
    const counts = {};
    let total = 0;
    for (const [, v] of entries) {
      const n = select(v.works, absolute, relative).length;
      counts[n] = (counts[n] ?? 0) + 1;
      total += n;
    }
    const cells = [3, 4, 5, 6, 7, 8].map((n) => String(counts[n] ?? 0).padStart(5)).join('');
    console.log(
      `${String(absolute).padStart(3)}  ${relative.toFixed(2)}${cells}   ${(total / entries.length).toFixed(2)}`,
    );
  }
}
