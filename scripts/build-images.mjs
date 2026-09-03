/**
 * Resolve every image to a direct upload.wikimedia.org URL plus its native size.
 *
 * Why this exists
 * ---------------
 * Images were stored as `Special:FilePath/<name>?width=1200`. That URL works,
 * but it is a redirect *service*: every request walks
 *
 *   302 en.wikipedia.org  →  301 Special:Redirect/file  →  200 upload.wikimedia.org
 *
 * and the two redirects are served `cache-control: private, max-age=0,
 * must-revalidate`. So even with the picture itself sitting in the browser's
 * cache, re-displaying it costs two full round trips to Wikipedia before the
 * cached bytes can be used. That is the whole reason the app never felt
 * instant — the images weren't slow, the redirects were.
 *
 * Wikimedia also restricts thumbnails to a fixed set of widths now: a direct
 * request for any other width is a flat 400 ("Use thumbnail sizes listed on
 * https://w.wiki/GHai"). The old `?width=1200` only worked because
 * Special:FilePath rounds it up server-side — which is a redirect, which is the
 * problem. Going direct means the app has to ask for a standard width itself,
 * and to know when a width would exceed the original.
 *
 * So each record gains:
 *   src    — the original file on upload.wikimedia.org, no redirect, no query
 *   width  — native pixel width, so we never request a thumbnail bigger than
 *            the original (also a 400) and the viewer knows how far it may
 *            enlarge a small source
 *   height — native pixel height, so the frame can be sized before load
 *   thumb  — the thumbnail URL with the width left as `{w}`
 *   render — set when the original is a format browsers cannot display, so it
 *            must always be served as a rendered thumbnail
 *
 * `thumb` is taken from the API rather than derived, because the naming is not
 * one rule. A plain JPEG thumbnails to `500px-Name.jpg`, but Gauguin's "Manaò
 * tupapaú" is a TIFF and becomes `lossy-page1-500px-Name.tiff.jpg` — prefix and
 * suffix both. Deriving that by string surgery is what left it as a broken
 * image icon in the study guide.
 *
 * `image` is deliberately left in place: it is the stable identity key the UI
 * uses for load/error state, and it is the fallback if `src` is ever absent.
 *
 * Usage: node scripts/build-images.mjs        (incremental — only missing ones)
 *        FORCE=1 node scripts/build-images.mjs  (re-resolve everything)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const ARTWORKS = join(ROOT, 'src/data/artworks.json');
const PORTRAITS = join(ROOT, 'src/data/portraits.json');

const UA = 'artguessr/1.0 (local educational project; https://github.com/)';
/** The API caps anonymous multi-title queries at 50. */
const BATCH = 50;
const FORCE = process.env.FORCE === '1';

/**
 * Pull the wiki and the bare filename out of whichever URL shape a record uses.
 * Two are in the data: the Special:FilePath redirect service, and — for a
 * couple of dozen records — a direct upload.wikimedia.org path already.
 */
function parseFile(url) {
  const filePath = url.match(
    /^https:\/\/(commons\.wikimedia\.org|en\.wikipedia\.org)\/wiki\/Special:FilePath\/([^?]+)/,
  );
  if (filePath) {
    return {
      host: filePath[1],
      file: bareName(decodeURIComponent(filePath[2]).replace(/_/g, ' ')),
    };
  }

  const upload = url.match(
    /^https:\/\/upload\.wikimedia\.org\/wikipedia\/(commons|en)\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/?]+)/,
  );
  if (upload) {
    return {
      host: upload[1] === 'commons' ? 'commons.wikimedia.org' : 'en.wikipedia.org',
      file: bareName(decodeURIComponent(upload[2]).replace(/_/g, ' ')),
    };
  }

  return null;
}

/**
 * A few stored names carry a redundant namespace prefix — `Image:` is a legacy
 * alias for `File:`, which Special:FilePath accepts but the API does not.
 */
const bareName = (file) => file.replace(/^\s*(?:File|Image)\s*:\s*/i, '');

/** Titles come back normalised (underscores to spaces, first letter capped). */
const key = (title) => title.replace(/_/g, ' ').replace(/^File:/i, 'File:');

/** Formats a browser renders directly; anything else must be thumbnailed. */
const DISPLAYABLE = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

/**
 * Turn the 500px thumbnail URL into a template by swapping the width for `{w}`.
 * Only the final path segment is touched, and only its first `500px-`, so the
 * `lossy-page1-` prefix a TIFF thumbnail carries survives intact.
 */
function widthPlaceholder(thumburl) {
  if (!thumburl) return null;
  const clean = thumburl.split('?')[0];
  const cut = clean.lastIndexOf('/');
  const name = clean.slice(cut + 1);
  if (!name.includes('500px-')) return null;
  return clean.slice(0, cut + 1) + name.replace('500px-', '{w}px-');
}

async function imageinfo(host, files) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    prop: 'imageinfo',
    iiprop: 'url|size|mime',
    // A standard width, so the thumbnail it names is one the CDN will serve and
    // the pattern comes back clean rather than rounded up to another bucket.
    iiurlwidth: '500',
    titles: files.map((f) => `File:${f}`).join('|'),
  });

  // Wikimedia answers 429 readily on a bulk read like this one. Backing off and
  // retrying is the difference between one clean pass and a run that silently
  // leaves hundreds of records unresolved.
  let res;
  for (let attempt = 0; ; attempt++) {
    res = await fetch(`https://${host}/w/api.php?${params}`, {
      headers: { 'user-agent': UA },
    });
    if (res.status !== 429 || attempt === 5) break;
    const wait = 2000 * 2 ** attempt;
    process.stdout.write(`\n  429 — waiting ${wait / 1000}s\n`);
    await new Promise((r) => setTimeout(r, wait));
  }
  if (!res.ok) throw new Error(`${host} imageinfo ${res.status}`);
  const body = await res.json();

  const out = new Map();
  // Normalisation is reported separately, so map the name we asked for back to
  // the title the API answered under.
  const asked = new Map();
  for (const n of body.query?.normalized ?? []) asked.set(key(n.to), key(n.from));

  for (const page of body.query?.pages ?? []) {
    const info = page.imageinfo?.[0];
    if (!info) continue;
    const title = key(page.title);
    const record = {
      // The API tacks analytics query params onto the URL; they are noise and
      // they would fragment the browser cache.
      src: info.url.split('?')[0],
      width: info.width,
      height: info.height,
    };

    const template = widthPlaceholder(info.thumburl);
    if (template) record.thumb = template;
    // Everything else — TIFF here, and SVG or PDF if they ever get in — has to
    // be rendered before a browser will show it.
    if (!DISPLAYABLE.has(info.mime)) record.render = true;
    out.set(title, record);
    const original = asked.get(title);
    if (original) out.set(original, record);
  }
  return out;
}

async function resolveAll(entries) {
  /** Deduplicated: the same file backs several records in a handful of cases. */
  const wanted = new Map();
  for (const entry of entries) {
    const parsed = parseFile(entry.image);
    if (!parsed) {
      entry.unparsed = true;
      continue;
    }
    entry.parsed = parsed;
    const id = `${parsed.host}|${parsed.file}`;
    if (!wanted.has(id)) wanted.set(id, parsed);
  }

  const byHost = new Map();
  for (const { host, file } of wanted.values()) {
    if (!byHost.has(host)) byHost.set(host, []);
    byHost.get(host).push(file);
  }

  const resolved = new Map();
  for (const [host, files] of byHost) {
    for (let i = 0; i < files.length; i += BATCH) {
      const slice = files.slice(i, i + BATCH);
      process.stdout.write(
        `  ${host}  ${i + slice.length}/${files.length}\r`,
      );
      let info;
      try {
        info = await imageinfo(host, slice);
      } catch (err) {
        console.warn(`\n  batch failed on ${host}: ${err.message}`);
        continue;
      }
      for (const file of slice) {
        const hit = info.get(key(`File:${file}`));
        if (hit) resolved.set(`${host}|${file}`, hit);
      }
      // Courtesy pause; the API is generous but this is a bulk read.
      await new Promise((r) => setTimeout(r, 120));
    }
    process.stdout.write('\n');
  }
  return resolved;
}

function collect(works, portraits) {
  const entries = [];
  for (const [artistId, list] of Object.entries(works)) {
    for (const work of list) {
      if (!FORCE && work.src && work.width && work.thumb) continue;
      entries.push({ image: work.image, target: work, owner: artistId });
    }
  }
  for (const [id, portrait] of Object.entries(portraits)) {
    if (!FORCE && portrait.src && portrait.width && portrait.thumb) continue;
    entries.push({ image: portrait.image, target: portrait, owner: id });
  }
  return entries;
}

const works = JSON.parse(readFileSync(ARTWORKS, 'utf8'));
const portraits = JSON.parse(readFileSync(PORTRAITS, 'utf8'));

const entries = collect(works, portraits);
const totalImages =
  Object.values(works).reduce((n, l) => n + l.length, 0) + Object.keys(portraits).length;

if (entries.length === 0) {
  console.log(`nothing to do — all ${totalImages} images already resolved`);
  process.exit(0);
}

console.log(`resolving ${entries.length} of ${totalImages} images`);
const resolved = await resolveAll(entries);

let done = 0;
let missed = 0;
const failures = [];
for (const entry of entries) {
  if (!entry.parsed) {
    missed += 1;
    failures.push(`${entry.owner}: unrecognised URL ${entry.image}`);
    continue;
  }
  const hit = resolved.get(`${entry.parsed.host}|${entry.parsed.file}`);
  if (!hit) {
    missed += 1;
    failures.push(`${entry.owner}: no imageinfo for ${entry.parsed.file}`);
    continue;
  }
  Object.assign(entry.target, hit);
  done += 1;
}

writeFileSync(ARTWORKS, `${JSON.stringify(works, null, 2)}\n`);
writeFileSync(PORTRAITS, `${JSON.stringify(portraits, null, 2)}\n`);

console.log(`resolved ${done}, unresolved ${missed}`);
if (failures.length) {
  console.log('\nunresolved:');
  for (const line of failures.slice(0, 30)) console.log(`  ${line}`);
  if (failures.length > 30) console.log(`  …and ${failures.length - 30} more`);
  console.log('\nThese keep their Special:FilePath URL and still work, just slower.');
}
