#!/usr/bin/env node
/**
 * Repair prose already written into the data files, and into the caches behind
 * them so a re-run doesn't reintroduce it.
 *
 *   node scripts/clean-text.mjs           report what would change
 *   node scripts/clean-text.mjs --apply   write it
 *
 * Offline. The generators now clean correctly at the source (see
 * scripts/lib/text.mjs), but their caches hold text that was cleaned by the old
 * broken rule, and re-deriving would mean refetching a thousand articles.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { cleanKeepingParens } from './lib/text.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const APPLY = process.argv.includes('--apply');

/**
 * Everything here has already had its parentheses handled by the generator, so
 * repair only: orphan brackets, phonetic spans, stranded punctuation.
 */
const FILES = [
  { path: join(ROOT, 'src/data/longform.json'), nested: true },
  { path: join(ROOT, 'src/data/blurbs.json'), nested: false },
  { path: join(ROOT, 'src/data/stories.json'), nested: false },
  { path: join(HERE, '.blurbs.json'), nested: false },
  { path: join(HERE, '.stories.json'), nested: false },
];

let totalChanged = 0;
const samples = [];

for (const { path, nested } of FILES) {
  const data = JSON.parse(readFileSync(path, 'utf8'));
  let changed = 0;

  const fix = (obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value !== 'string') continue;
      const next = cleanKeepingParens(value);
      if (next === value) continue;
      changed += 1;
      if (samples.length < 12) {
        samples.push({ file: path.split('/').pop(), key, before: value, after: next });
      }
      obj[key] = next;
    }
  };

  if (nested) for (const section of Object.values(data)) fix(section);
  else fix(data);

  console.log(`${path.split('/').pop().padEnd(18)} ${changed} entr${changed === 1 ? 'y' : 'ies'} changed`);
  totalChanged += changed;

  if (APPLY && changed) writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

console.log(`\n${totalChanged} total\n`);
for (const s of samples) {
  const at = Math.max(0, s.before.search(/[\]ˈˌːʁʃʒŋɡ]|\s[,;.]/) - 45);
  console.log(`[${s.file} / ${s.key}]`);
  console.log(`  −  …${s.before.slice(at, at + 110)}…`);
  console.log(`  +  …${s.after.slice(Math.max(0, at - 10), at + 110)}…`);
}

if (!APPLY) console.log('\nRe-run with --apply to write.');
else console.log(`\nWritten. Tidy is idempotent, so this is safe to re-run.`);
