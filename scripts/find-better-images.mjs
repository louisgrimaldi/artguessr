#!/usr/bin/env node
/**
 * Look for a higher-resolution file for works we hold at low resolution.
 *
 *   node scripts/find-better-images.mjs           report only
 *   node scripts/find-better-images.mjs --apply   rewrite artworks.json
 *
 * Only free (`source: commons`) works are considered. The in-copyright ones are
 * small because English Wikipedia's non-free content policy *requires* them to
 * be: Bacon's "Three Studies of Lucian Freud" is 482px and there is no legal
 * larger copy to find. Chasing those is chasing nothing.
 *
 * Candidates come from one place only: additional `P18` statements on the
 * work's own Wikidata item. That is the same curated source the pipeline
 * already trusts for the primary image, and crucially it is *not* a filename
 * search.
 *
 * Filename matching is unsafe here, and the case that proves it is instructive.
 * Spanish, Italian and Polish Wikipedia all illustrate "Three Studies of Lucian
 * Freud" with a 1500px file called `After "1969" Three Studies of Lucian
 * Freud.jpg` — three times the resolution, on Commons, freely licensed, and
 * every word of the title in the name. It is a photographic restaging by Michel
 * Platnic, not the Bacon. Only the file description says so. So: curated
 * statements, nothing inferred.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ARTWORKS = join(ROOT, 'src/data/artworks.json');
const UA = 'artguessr/1.0 (educational; local)';
const APPLY = process.argv.includes('--apply');

/** Below this a picture is visibly soft on a full-screen view. */
const LOW = 960;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function json(url) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { headers: { 'user-agent': UA } });
    if (res.status === 429) {
      await sleep(3000 * (attempt + 1));
      continue;
    }
    if (!res.ok) return null;
    return res.json();
  }
  return null;
}

const works = JSON.parse(readFileSync(ARTWORKS, 'utf8'));

const targets = [];
for (const [artist, list] of Object.entries(works)) {
  for (const work of list) {
    if (work.source !== 'commons') continue;
    if (!work.item || !work.width || work.width >= LOW) continue;
    targets.push({ artist, work });
  }
}

console.log(`${targets.length} free works held under ${LOW}px — checking Wikidata for better files\n`);

/** Every P18 on a batch of items. */
async function imagesFor(qids) {
  const data = await json(
    'https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=claims&ids=' +
      qids.join('|'),
  );
  const out = new Map();
  for (const [qid, entity] of Object.entries(data?.entities ?? {})) {
    const files = (entity.claims?.P18 ?? [])
      .map((c) => c.mainsnak?.datavalue?.value)
      .filter(Boolean);
    out.set(qid, files);
  }
  return out;
}

/** Size of a Commons file, plus a direct URL and thumbnail template. */
async function measure(file) {
  const data = await json(
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2' +
      '&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=500&titles=' +
      encodeURIComponent(`File:${file}`),
  );
  const info = data?.query?.pages?.[0]?.imageinfo?.[0];
  if (!info) return null;
  return {
    file,
    width: info.width,
    height: info.height,
    mime: info.mime,
    src: info.url.split('?')[0],
    thumburl: info.thumburl?.split('?')[0] ?? null,
  };
}

const upgrades = [];
for (let i = 0; i < targets.length; i += 40) {
  const slice = targets.slice(i, i + 40);
  const byItem = await imagesFor(slice.map((t) => t.work.item));

  for (const { artist, work } of slice) {
    const files = byItem.get(work.item) ?? [];
    if (files.length < 2) continue;

    // The file we already hold, by name, so it isn't offered back to us.
    const current = decodeURIComponent(work.src.slice(work.src.lastIndexOf('/') + 1)).replace(
      /_/g,
      ' ',
    );

    let best = null;
    for (const file of files) {
      if (file.replace(/_/g, ' ') === current) continue;
      const info = await measure(file);
      await sleep(200);
      if (!info) continue;
      if (info.width <= work.width) continue;
      if (!best || info.width > best.width) best = info;
    }
    if (best) upgrades.push({ artist, work, best });
  }
  await sleep(300);
}

console.log(`${upgrades.length} work(s) have a larger file on their own Wikidata item:\n`);
for (const { artist, work, best } of upgrades) {
  console.log(
    `  ${artist} — ${work.title}\n` +
      `    ${work.width}x${work.height}  →  ${best.width}x${best.height}   ${best.file.slice(0, 70)}`,
  );
}

if (!APPLY) {
  console.log(upgrades.length ? '\nRe-run with --apply to write these in.' : '');
  process.exit(0);
}

const DISPLAYABLE = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
const template = (thumburl) => {
  if (!thumburl) return null;
  const cut = thumburl.lastIndexOf('/');
  const name = thumburl.slice(cut + 1);
  return name.includes('500px-') ? thumburl.slice(0, cut + 1) + name.replace('500px-', '{w}px-') : null;
};

for (const { work, best } of upgrades) {
  work.image = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(best.file)}?width=1200`;
  work.src = best.src;
  work.width = best.width;
  work.height = best.height;
  const tpl = template(best.thumburl);
  if (tpl) work.thumb = tpl;
  else delete work.thumb;
  if (DISPLAYABLE.has(best.mime)) delete work.render;
  else work.render = true;
}

writeFileSync(ARTWORKS, `${JSON.stringify(works, null, 2)}\n`);
console.log(`\nApplied ${upgrades.length} upgrade(s) to ${ARTWORKS}`);
