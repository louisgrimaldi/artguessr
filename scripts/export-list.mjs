#!/usr/bin/env node
/**
 * Plain-text list of every artist and their works, as bullet points.
 *
 *   npm run export        →  artists-and-works.txt
 *
 * Benched artists (fewer than the 3 works needed to be playable) are listed at
 * the end rather than dropped, so the file accounts for the whole roster.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const artists = JSON.parse(readFileSync(join(ROOT, 'src/data/artists.json'), 'utf8'));
const artworks = JSON.parse(readFileSync(join(ROOT, 'src/data/artworks.json'), 'utf8'));
const OUT = join(ROOT, 'artists-and-works.txt');

const TARGET = 3;
const worksFor = (id) => artworks[id] ?? [];
const dated = (w) => (w.dateLabel ? ` (${w.dateLabel})` : w.year ? ` (${w.year})` : '');
const lived = (a) => `${a.birth}–${a.death ?? ''}`;

function block(a) {
  const lines = [`${a.name} — ${a.nationality}, ${lived(a)}`];
  for (const w of worksFor(a.id)) lines.push(`  - ${w.title}${dated(w)}`);
  return lines.join('\n');
}

const playable = artists.filter((a) => worksFor(a.id).length >= TARGET);
const benched = artists.filter((a) => worksFor(a.id).length < TARGET);

const out = [
  'ARTGUESSR — ARTISTS AND THEIR WORKS',
  `${playable.length} artists, ${playable.reduce((n, a) => n + worksFor(a.id).length, 0)} works`,
  '',
  playable.map(block).join('\n\n'),
];

if (benched.length) {
  out.push(
    '',
    '',
    `NOT IN PLAY — fewer than ${TARGET} works with a usable image`,
    '',
    benched.map(block).join('\n\n'),
  );
}

writeFileSync(OUT, `${out.join('\n')}\n`);
console.log(`Wrote ${OUT}`);
