/**
 * Per-artwork metadata from Wikidata: places (with coordinates), genre and a
 * trustworthy date.
 *
 * Shared between the main pipeline and `refresh-details.mjs`, which re-runs just
 * this step against already-cached pools — far cheaper than a full refetch,
 * since it needs no article scraping.
 */

const UA = 'artguessr/0.1 (https://github.com/local/artguessr; louis.grimaldi.24@gmail.com)';
const HEADERS = { 'User-Agent': UA, 'Accept-Encoding': 'gzip' };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function getJSON(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (res.status === 429 || res.status >= 500) {
        await sleep(2000 * (i + 1));
        continue;
      }
      if (!res.ok) return null;
      return await res.json();
    } catch {
      await sleep(1000 * (i + 1));
    }
  }
  return null;
}

export async function sparql(query) {
  const url = 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(query);
  const j = await getJSON(url);
  return j?.results?.bindings ?? [];
}

export function year(dateStr) {
  if (!dateStr) return null;
  const m = dateStr.match(/(-?\d{4})/);
  return m ? Number(m[1]) : null;
}

/**
 * Clean a Wikidata label for display.
 *
 * When a property is set to "unknown value" the label service hands back a
 * blank-node URI (`.well-known/genid/…`), which would otherwise be shown to the
 * player as the location. Venue hierarchies get trimmed to the venue.
 */
export function cleanLabel(value) {
  if (!value) return null;
  let text = value.trim();
  if (!text) return null;
  if (/^https?:\/\//i.test(text)) return null; // blank node / unknown value
  if (/^Q\d+$/.test(text)) return null; // unlabelled item

  // "Uffizi Gallery - Room 11-12, Botticelli's, Florence, Italy" → "Uffizi Gallery".
  text = text.split(' - ')[0].trim();
  if (text.length > 45 && text.includes(',')) text = text.split(',')[0].trim();

  if (/^room\b/i.test(text)) return null;
  // Gallery hangs and exhibition titles, not places: "Post-Impressionism:
  // French Painting 1850–1900" is a room, not somewhere you can visit.
  if (/\d{4}\s*[–—-]\s*\d{4}/.test(text) || text.includes(':')) return null;
  if (!text || text.length > 70) return null;
  return text;
}

/** `Point(lon lat)` → `{ lat, lon }`. */
export function parsePoint(wkt) {
  const m = wkt?.match(/Point\(\s*(-?[\d.]+)\s+(-?[\d.]+)\s*\)/i);
  return m ? { lat: Number(m[2]), lon: Number(m[1]) } : null;
}

const ordinal = (n) => {
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th';
  return `${n}${suffix}`;
};

/**
 * Turn a Wikidata time value + precision into something displayable.
 *
 * Precision 9 is a year, 8 a decade, 7 a century, and coarser values are stored
 * at a boundary: "21st century" is `2100-01-01`, which an unchecked parse reads
 * as the year 2100 — how Steilneset Memorial came to be dated 2100. So an exact
 * year is only claimed at precision >= 9; coarser dates become "1480s" or
 * "15th century" rather than being thrown away.
 */
export function describeDate(timeValue, precision) {
  const raw = year(timeValue);
  if (raw === null) return { year: null, dateLabel: null };
  // A stray statement gave Van Gogh's "Irises" the year 198. Nothing in this
  // collection predates the second millennium or postdates today.
  if (raw < 1000 || raw > new Date().getFullYear() + 1) return { year: null, dateLabel: null };

  const prec = Number(precision ?? 0);
  if (prec >= 9) return { year: raw, dateLabel: String(raw) };
  if (prec === 8) return { year: null, dateLabel: `${Math.floor(raw / 10) * 10}s` };
  if (prec === 7) {
    // The stored year is the century's closing boundary: 2100 → 21st century.
    return { year: null, dateLabel: `${ordinal(Math.floor((raw - 1) / 100) + 1)} century` };
  }
  return { year: null, dateLabel: null };
}

export function detailsQuery(itemQids) {
  const values = itemQids.map((q) => 'wd:' + q).join(' ');
  return `
SELECT ?w ?locLabel ?coord ?colLabel ?colCoord ?adminLabel ?adminCoord ?ownCoord ?genreLabel ?date ?prec WHERE {
  VALUES ?w { ${values} }
  OPTIONAL { ?w wdt:P276 ?loc . OPTIONAL { ?loc wdt:P625 ?coord . } }
  OPTIONAL { ?w wdt:P195 ?col . OPTIONAL { ?col wdt:P625 ?colCoord . } }
  OPTIONAL { ?w wdt:P131 ?admin . OPTIONAL { ?admin wdt:P625 ?adminCoord . } }
  OPTIONAL { ?w wdt:P625 ?ownCoord . }
  OPTIONAL { ?w wdt:P136 ?genre . }
  OPTIONAL { ?w p:P571/psv:P571 [ wikibase:timeValue ?date ; wikibase:timePrecision ?prec ] . }
  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "en,fr,de,it,es,nl,sv,da,nb,ru,ja,pt,pl,cs,hu" .
  }
}`;
}

/**
 * Fill in `locations`, `genre`, `year` and `dateLabel` on each work, in place.
 * One query covers the whole set.
 */
export async function enrichWorks(works) {
  const items = works.map((w) => w.item).filter(Boolean);
  if (items.length === 0) return works;

  const details = new Map();

  for (const row of await sparql(detailsQuery(items))) {
    const key = row.w.value.split('/').pop();
    const d = details.get(key) ?? { sites: new Map(), collections: new Map(), areas: new Map() };

    // A work can legitimately have several locations — Bourgeois's "Maman"
    // exists as casts in London, Ottawa, Bilbao and Tokyo — so collect them all
    // rather than taking the first.
    const site = cleanLabel(row.locLabel?.value);
    if (site && !d.sites.has(site)) {
      d.sites.set(site, parsePoint(row.coord?.value) ?? parsePoint(row.ownCoord?.value));
    }
    const collection = cleanLabel(row.colLabel?.value);
    if (collection && !d.collections.has(collection)) {
      d.collections.set(
        collection,
        parsePoint(row.colCoord?.value) ?? parsePoint(row.ownCoord?.value),
      );
    }

    // Third tier: many public sculptures name no venue at all, only the town
    // they stand in. Hepworth's "Square Forms and Circles" is simply Montreal.
    const area = cleanLabel(row.adminLabel?.value);
    if (area && !d.areas.has(area)) {
      d.areas.set(area, parsePoint(row.adminCoord?.value) ?? parsePoint(row.ownCoord?.value));
    }

    d.genre ??= cleanLabel(row.genreLabel?.value);

    if (row.date) {
      const described = describeDate(row.date.value, row.prec?.value);
      // Prefer the most precise statement seen for this work.
      if (described.dateLabel && (d.year === undefined || d.year === null)) {
        d.year = described.year;
        d.dateLabel = described.dateLabel;
      }
      d.sawDate = true;
    }

    details.set(key, d);
  }

  for (const w of works) {
    const d = details.get(w.item);
    if (!d) {
      w.locations = [];
      w.genre = null;
      w.dateLabel = w.year !== null && w.year !== undefined ? String(w.year) : null;
      continue;
    }
    // Prefer a named site, then the owning institution, then the town.
    const chosen =
      d.sites.size > 0 ? d.sites : d.collections.size > 0 ? d.collections : d.areas;
    w.locations = [...chosen].map(([name, point]) => ({
      name,
      lat: point?.lat ?? null,
      lon: point?.lon ?? null,
    }));
    w.genre = d.genre ?? null;

    // Only override the ranking query's year when a date was actually seen, so a
    // details miss doesn't wipe a good value.
    if (d.sawDate) {
      w.year = d.year ?? null;
      w.dateLabel = d.dateLabel ?? null;
    } else {
      w.dateLabel = w.year !== null && w.year !== undefined ? String(w.year) : null;
    }
  }

  return works;
}
