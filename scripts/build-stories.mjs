#!/usr/bin/env node
/**
 * The story a painting tells, as opposed to what the painting is.
 *
 * Wikipedia's opening paragraph is bibliographic — medium, date, museum, which
 * composer it later inspired. That is exactly what a viewer does *not* need
 * standing in front of the picture. The narrative is further down, in a section
 * called Subject, Description, Background or similar, so this pulls from there.
 *
 *   npm run data:stories
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { getJSON, sparql } from './lib/details.mjs';
import { cleanKeepingParens } from './lib/text.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const CACHE_PATH = join(__dir, '.cache.json');
const STORY_CACHE = join(__dir, '.stories.json');
const OUT_PATH = join(ROOT, 'src/data/stories.json');

const MAX_WORDS = 90;

/** Sections that carry the narrative, best first. */
const WANTED = [
  /^subject/i,
  /^visual analysis/i,
  /^(the )?story/i,
  /^description/i,
  /^background/i,
  /^scene/i,
  /^narrative/i,
  /^iconograph/i,
  /^(the )?painting$/i,
  /^content/i,
  /^composition/i,
  /^theme/i,
  /^interpretation/i,
  /^analysis/i,
  /^location/i,
  /^setting/i,
  /^aesthetic/i,
];

/**
 * Sections that are about the object's career rather than its content. Anything
 * not on this list can serve as a fallback, because article headings are far
 * too idiosyncratic to enumerate — "Bathers at Asnières" files its social
 * history under "Seurat's suburb".
 */
const NOT_ABOUT_THE_PICTURE =
  /^(reception|history|provenance|legacy|influence|exhibition|bibliograph|reference|note|see also|external|gallery|source|further reading|footnote|citation|literature|gallery|gallery of|in popular culture|adaptations|versions|copies|restoration|conservation|theft|sale|market|dimensions|technical)/i;

const cache = JSON.parse(readFileSync(CACHE_PATH, 'utf8'));
const artworks = JSON.parse(readFileSync(join(ROOT, 'src/data/artworks.json'), 'utf8'));
const stories = existsSync(STORY_CACHE) ? JSON.parse(readFileSync(STORY_CACHE, 'utf8')) : {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const items = [
  ...new Set(
    Object.values(cache)
      .flatMap((e) => e.works ?? [])
      .map((w) => w.item)
      .filter(Boolean),
  ),
];
const todo = process.env.FORCE ? items : items.filter((q) => stories[q] === undefined);
console.log(`${items.length} works, ${todo.length} to check`);

// QID -> English article title.
const titles = new Map();
for (let i = 0; i < todo.length; i += 80) {
  const chunk = todo.slice(i, i + 80);
  const rows = await sparql(`
SELECT ?w ?article WHERE {
  VALUES ?w { ${chunk.map((q) => 'wd:' + q).join(' ')} }
  ?article schema:about ?w ; schema:isPartOf <https://en.wikipedia.org/> .
}`);
  for (const row of rows) {
    const qid = row.w.value.split('/').pop();
    if (!titles.has(qid)) {
      titles.set(qid, decodeURIComponent(row.article.value.split('/wiki/')[1]).replace(/_/g, ' '));
    }
  }
  await sleep(400);
  process.stdout.write(`\r  articles: ${titles.size}`);
}
console.log(`\n${titles.size} have an English article`);

const clean = (html) =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<sup[\s\S]*?<\/sup>/gi, '')
    .replace(/<table[\s\S]*?<\/table>/gi, '')
    // Figure captions sit inline once tags are stripped, and read as dimensions
    // and museum names before the prose starts.
    .replace(/<figure[\s\S]*?<\/figure>/gi, '')
    .replace(/<div class="thumb[\s\S]*?<\/div>\s*<\/div>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#\d+;/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\[\d+\]/g, '')
    // Only literal once the anchor tags are gone.
    .replace(/\[\s*edit\s*\]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Stories keep their parentheses — the asides are usually part of the account —
 * so only the phonetic spans and the punctuation left stranded by stripping
 * tags and reference markers get cleaned up. That stranding is what put the
 * space in "in Philip IV's alcázar palace in Madrid ." on the Las Meninas card.
 */
const finish = (text) => cleanKeepingParens(text);

function trim(text) {
  const sentences = text.split(/(?<![A-Z]\.)(?<=[.!?])\s+(?=[A-Z"'“])/);
  const out = [];
  let words = 0;
  for (const s of sentences) {
    const n = s.split(/\s+/).length;
    if (out.length > 0 && words + n > MAX_WORDS) break;
    out.push(s);
    words += n;
    if (words >= MAX_WORDS) break;
  }
  return finish(out.join(' '));
}

let found = 0;
let done = 0;
for (const [qid, title] of titles) {
  done++;
  stories[qid] = null; // remember we looked, even when there's nothing

  const meta = await getJSON(
    'https://en.wikipedia.org/w/api.php?action=parse&format=json&formatversion=2&prop=sections&page=' +
      encodeURIComponent(title),
  );
  const sections = meta?.parse?.sections ?? [];

  // Take the highest-priority matching section that exists.
  let chosen = null;
  for (const pattern of WANTED) {
    const hit = sections.find((s) => pattern.test(s.line.trim()));
    if (hit) {
      chosen = hit;
      break;
    }
  }

  // Otherwise the first top-level section that isn't about the work's career.
  chosen ??= sections.find(
    (s) => Number(s.toclevel) === 1 && !NOT_ABOUT_THE_PICTURE.test(s.line.trim()),
  );

  if (chosen) {
    const body = await getJSON(
      'https://en.wikipedia.org/w/api.php?action=parse&format=json&formatversion=2&prop=text&section=' +
        chosen.index +
        '&page=' +
        encodeURIComponent(title),
    );
    const text = clean(body?.parse?.text ?? '');
    // Drop the heading itself, which the parser includes.
    // Escaped: section names contain brackets and parentheses often enough.
    const heading = chosen.line.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const withoutHeading = text.replace(new RegExp('^' + heading + '\\s*', 'i'), '');
    const story = trim(withoutHeading);
    if (story.split(/\s+/).length >= 20) {
      stories[qid] = story;
      found++;
    }
    await sleep(150);
  }

  if (done % 25 === 0) {
    writeFileSync(STORY_CACHE, JSON.stringify(stories, null, 2));
    process.stdout.write(`\r  ${done}/${titles.size} checked, ${found} stories`);
  }
  await sleep(120);
}

writeFileSync(STORY_CACHE, JSON.stringify(stories, null, 2));

// Ship only the works currently selected.
const shipped = {};
for (const works of Object.values(artworks)) {
  for (const w of works) if (w.item && stories[w.item]) shipped[w.item] = stories[w.item];
}
writeFileSync(OUT_PATH, JSON.stringify(shipped, null, 2));

console.log(`\n\ncached  ${Object.values(stories).filter(Boolean).length} stories`);
console.log(`shipped ${Object.keys(shipped).length} -> ${OUT_PATH}`);
