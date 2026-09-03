/**
 * Pulling an image for a single subject out of its English Wikipedia article.
 *
 * Used for in-copyright artworks (no free Commons image) and for portraits of
 * living artists. Shared by build-artworks.mjs and build-portraits.mjs.
 */
import { getJSON } from './details.mjs';


/** Artworks are photographs; anything vector is Wikipedia's own UI furniture. */
export const RASTER = /\.(jpg|jpeg|png|tiff?|gif|webp)$/i;

/**
 * Filenames that are never the artwork itself. Wikipedia infoboxes for public
 * sculptures often carry a location map, and Wikidata sometimes files a
 * banknote or stamp *depicting* a work as that work's image — Giacometti's
 * "L'Homme qui marche I" came back as the Swiss 100-franc note.
 */
export const NOT_THE_WORK =
  /osm-intl|staticmap|maps\.wikimedia|locator|location[_ ]map|banknote|CHF\d|\bstamp\b|postage|\bcoin[_ ]/i;

/**
 * Is this file a picture of the person's *work* rather than of the person?
 *
 * For artists whose article has no photograph of them, the infobox often shows
 * a piece instead — Dan Flavin's leads with `Site-specific installation by Dan
 * Flavin, 1996, Menil Collection`, which would otherwise have been served as
 * his face on the movement card. A filename saying "by <them>" is the giveaway,
 * as is one naming a medium.
 */
export function looksLikeTheirWork(url, name) {
  const file = decodeURIComponent(url.split('/').pop() ?? '').replace(/[_%]/g, ' ');
  const surname = name.trim().split(/\s+/).pop() ?? name;
  if (new RegExp(`\\bby\\s+.{0,24}${surname}\\b`, 'i').test(file)) return true;
  return /\b(installation|sculpture|painting|artwork|mural|exhibition|site-specific)\b/i.test(file);
}

/** Significant words from a string, for matching against an image filename. */
function tokens(...strings) {
  return strings
    .join(' ')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 4);
}

/**
 * The image for an in-copyright work, taken from its Wikipedia article, tried in
 * descending order of trustworthiness: the infobox's wikitext image parameter,
 * then an <img> rendered inside the infobox, then a body image whose filename
 * matches the work's title.
 *
 * The strictness is deliberate. An early version took "the first <img> on the
 * page" and quietly returned maintenance-template icons (Question_book-new.svg)
 * or, on articles with no infobox, an unrelated painting from a navbox — Joan
 * Mitchell's works all came back as a Mondrian. Returning null is the right
 * outcome: the artist then falls short of four works and gets benched rather
 * than showing something wrong.
 */
export async function articleImage(title, { allowBodyMatch = true } = {}) {
  // Preferred: the infobox's image parameter, straight from the wikitext.
  const rev = await getJSON(
    'https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2' +
      '&prop=revisions&rvprop=content&rvslots=main&titles=' +
      encodeURIComponent(title),
  );
  const wikitext = rev?.query?.pages?.[0]?.revisions?.[0]?.slots?.main?.content;
  if (wikitext) {
    const m = wikitext.match(
      /\|\s*(?:image_file|image_name|image|filename)\s*=\s*([^\n|}]+)/i,
    );
    const file = m?.[1]
      ?.trim()
      // Brackets first: "[[File:X.jpg]]" would otherwise keep its File: prefix.
      .replace(/\[\[|\]\]/g, '')
      .replace(/^(File|Image):/i, '')
      .trim();
    if (file && RASTER.test(file)) {
      // Special:FilePath resolves both locally-hosted and Commons files.
      return `https://en.wikipedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=1200`;
    }
  }

  const parsed = await getJSON(
    'https://en.wikipedia.org/w/api.php?action=parse&format=json&formatversion=2&prop=text&page=' +
      encodeURIComponent(title),
  );
  const html = parsed?.parse?.text;
  if (!html) return null;

  const clean = (raw) => {
    let src = raw.replace(/&amp;/g, '&').split('?')[0];
    if (src.startsWith('//')) src = 'https:' + src;
    // Upgrade thumbnails to a reasonable display width.
    src = src.replace(/\/thumb\/(.+?)\/\d+px-[^/]+$/, '/$1');
    return RASTER.test(src) ? src : null;
  };

  // Second choice: an <img> inside the rendered infobox.
  const inBox = html.match(/<table[^>]*infobox[\s\S]{0,4000}?<img[^>]+src="([^"]+)"/i);
  if (inBox) {
    const src = clean(inBox[1]);
    if (src) return src;
  }

  // Last resort, for articles with no infobox at all (common for performance
  // and installation pieces). Only accept a body image whose filename shares a
  // significant word with the work's *title*. Matching the artist's name too was
  // tried and is far too loose — it let a photo of "The Artist Is Present"
  // through as the image for "Rhythm 0".
  // Not safe for portraits: on an artist's page, a filename containing their
  // name is far more likely to be one of their paintings than a photo of them.
  // It handed back "'Grane' by Anselm Kiefer" as Kiefer's portrait.
  if (!allowBodyMatch) return null;

  const wanted = new Set(tokens(title.replace(/\s*\([^)]*\)\s*$/, '')));
  if (wanted.size === 0) return null;

  for (const m of html.matchAll(/<img[^>]+src="([^"]+)"/gi)) {
    const src = clean(m[1]);
    if (!src) continue;
    const filename = decodeURIComponent(src.split('/').pop() ?? '');
    if (tokens(filename).some((t) => wanted.has(t))) return src;
  }
  return null;
}

