#!/usr/bin/env node
/**
 * Long-form descriptions, for the study pages.
 *
 * Everything in the app now has two registers: a short line on cards and the
 * reveal panel (hand-written for artists and movements, Wikipedia's opening
 * sentence for artworks), and this — the fuller account you get when you open
 * something's own page.
 *
 * All three are Wikipedia article intros, kept to ~140 words.
 *
 *   npm run data:longform
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { getJSON, sparql } from './lib/details.mjs';
import { cleanProse } from './lib/text.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const CACHE_PATH = join(__dir, '.cache.json');
const OUT_PATH = join(ROOT, 'src/data/longform.json');

const MAX_WORDS = 140;

const cache = JSON.parse(readFileSync(CACHE_PATH, 'utf8'));
const artists = JSON.parse(readFileSync(join(ROOT, 'src/data/artists.json'), 'utf8'));
const artworks = JSON.parse(readFileSync(join(ROOT, 'src/data/artworks.json'), 'utf8'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Movements don't carry a Wikipedia title in the data, so map them here. */
const MOVEMENT_ARTICLES = {
  'early-renaissance': 'Italian Renaissance painting',
  'high-renaissance': 'High Renaissance',
  'northern-renaissance': 'Northern Renaissance',
  mannerism: 'Mannerism',
  baroque: 'Baroque painting',
  'dutch-golden-age': 'Dutch Golden Age painting',
  rococo: 'Rococo',
  neoclassicism: 'Neoclassicism',
  romanticism: 'Romanticism',
  realism: 'Realism (arts)',
  'pre-raphaelite': 'Pre-Raphaelite Brotherhood',
  impressionism: 'Impressionism',
  'post-impressionism': 'Post-Impressionism',
  symbolism: 'Symbolism (arts)',
  fauvism: 'Fauvism',
  expressionism: 'Expressionism',
  cubism: 'Cubism',
  futurism: 'Futurism',
  'abstract-pioneers': 'Abstract art',
  dada: 'Dada',
  surrealism: 'Surrealism',
  'mexican-muralism': 'Mexican muralism',
  'harlem-renaissance': 'Harlem Renaissance',
  'american-regionalism': 'Regionalism (art)',
  'abstract-expressionism': 'Abstract expressionism',
  'pop-art': 'Pop art',
  minimalism: 'Minimalism (visual arts)',
  'conceptual-performance': 'Conceptual art',
  'contemporary-figuration': 'Figurative art',
  neoexpressionism: 'Neo-expressionism',
  'contemporary-sculpture': 'Installation art',
  'modern-sculpture': 'Modern sculpture',
  'ukiyo-e': 'Ukiyo-e',
  'british-portraiture': 'Grand Manner',
  'belle-epoque-portraiture': 'Portrait painting',
  'american-modernism': 'American modernism',
  'art-deco': 'Art Deco',
  'street-art': 'Street art',
};

/** Leading whole sentences of an already-cleaned text, within a word budget. */
function firstSentences(text, maxWords) {
  const sentences = text.split(/(?<![A-Z]\.)(?<=[.!?])\s+(?=[A-Z"'“])/);
  const out = [];
  let words = 0;
  for (const sentence of sentences) {
    const count = sentence.split(/\s+/).length;
    if (out.length > 0 && words + count > maxWords) break;
    out.push(sentence);
    words += count;
    if (words >= maxWords) break;
  }
  return out.join(' ').trim();
}

/** Trim to whole sentences within the word budget. */
function trim(text) {
  // Balanced paren stripping plus phonetic cleanup — see scripts/lib/text.mjs.
  // The obvious `\([^)]*\)` stops at the first `)`, which Wikipedia's nested
  // pronunciation blocks defeat.
  const cleaned = cleanProse(text.replace(/\[\d+\]/g, ''));
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

/** Fetch intros for a batch of article titles, keyed by the title requested. */
async function extracts(titles) {
  const found = {};
  for (let i = 0; i < titles.length; i += 20) {
    const chunk = titles.slice(i, i + 20);
    const data = await getJSON(
      'https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2' +
        '&prop=extracts&exintro=1&explaintext=1&redirects=1&titles=' +
        encodeURIComponent(chunk.join('|')),
    );
    // Redirects rewrite titles, so map normalised names back to what we asked for.
    const alias = new Map();
    for (const r of data?.query?.redirects ?? []) alias.set(r.to, r.from);
    for (const n of data?.query?.normalized ?? []) alias.set(n.to, n.from);

    for (const page of data?.query?.pages ?? []) {
      if (!page.extract) continue;
      const requested = alias.get(page.title) ?? page.title;
      found[requested] = trim(page.extract);
    }
    process.stdout.write(`\r  ${Object.keys(found).length}/${titles.length}`);
    await sleep(250);
  }
  return found;
}

const out = existsSync(OUT_PATH)
  ? JSON.parse(readFileSync(OUT_PATH, 'utf8'))
  : { artists: {}, movements: {}, works: {} };

// --- artists ---------------------------------------------------------------
console.log('artists...');
const artistArticles = new Map();
const qids = artists.map((a) => cache[a.id]?.qid).filter(Boolean);
for (let i = 0; i < qids.length; i += 80) {
  const chunk = qids.slice(i, i + 80);
  const rows = await sparql(`
SELECT ?a ?article WHERE {
  VALUES ?a { ${chunk.map((q) => 'wd:' + q).join(' ')} }
  ?article schema:about ?a ; schema:isPartOf <https://en.wikipedia.org/> .
}`);
  for (const row of rows) {
    const qid = row.a.value.split('/').pop();
    const artist = artists.find((a) => cache[a.id]?.qid === qid);
    if (artist && !artistArticles.has(artist.id)) {
      artistArticles.set(
        artist.id,
        decodeURIComponent(row.article.value.split('/wiki/')[1]).replace(/_/g, ' '),
      );
    }
  }
  await sleep(400);
}
const artistText = await extracts([...artistArticles.values()]);
const shortBios = {};
for (const [id, title] of artistArticles) {
  if (!artistText[title]) continue;
  out.artists[id] = artistText[title];
  // The card bio: Wikipedia's opening states plainly who someone was, where and
  // when, and what they are known for — which is exactly what a quick reveal
  // needs, and what hand-written character sketches tend to bury.
  shortBios[id] = firstSentences(artistText[title], 42);
}
writeFileSync(join(ROOT, 'src/data/bios.json'), JSON.stringify(shortBios, null, 2));
console.log(`\n  ${Object.keys(out.artists).length} artist descriptions, ${Object.keys(shortBios).length} short bios`);

// --- movements -------------------------------------------------------------
console.log('movements...');
const movementText = await extracts(Object.values(MOVEMENT_ARTICLES));
for (const [id, title] of Object.entries(MOVEMENT_ARTICLES)) {
  if (movementText[title]) out.movements[id] = movementText[title];
}
console.log(`\n  ${Object.keys(out.movements).length} movement descriptions`);

// --- artworks (only the ones actually shipped) ------------------------------
console.log('artworks...');
const items = [...new Set(Object.values(artworks).flat().map((w) => w.item).filter(Boolean))];
const workArticles = new Map();
for (let i = 0; i < items.length; i += 80) {
  const chunk = items.slice(i, i + 80);
  const rows = await sparql(`
SELECT ?w ?article WHERE {
  VALUES ?w { ${chunk.map((q) => 'wd:' + q).join(' ')} }
  ?article schema:about ?w ; schema:isPartOf <https://en.wikipedia.org/> .
}`);
  for (const row of rows) {
    const qid = row.w.value.split('/').pop();
    if (!workArticles.has(qid)) {
      workArticles.set(
        qid,
        decodeURIComponent(row.article.value.split('/wiki/')[1]).replace(/_/g, ' '),
      );
    }
  }
  await sleep(400);
}
const workText = await extracts([...workArticles.values()]);
for (const [qid, title] of workArticles) {
  if (workText[title]) out.works[qid] = workText[title];
}
console.log(`\n  ${Object.keys(out.works).length} artwork descriptions of ${items.length}`);

writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
console.log(`\nWrote ${OUT_PATH}`);
