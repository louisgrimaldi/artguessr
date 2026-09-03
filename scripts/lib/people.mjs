/**
 * Resolving a person's name to a Wikidata entity.
 *
 * Shared by the artwork pipeline (which knows each artist's birth year and can
 * disambiguate hard) and the portrait pipeline (which also needs likenesses for
 * movement key-artists it has no birth year for).
 */
import { getJSON, year } from './details.mjs';

/** Occupations that mark a Wikidata human as the artist we're after. */
const ART_OCCUPATIONS = new Set([
  'Q1028181', // painter
  'Q1281618', // sculptor
  'Q483501', // artist
  'Q15296811', // draughtsperson
  'Q11569986', // printmaker
  'Q33231', // photographer
  'Q644687', // illustrator
  'Q42973', // architect
  'Q10862983', // etcher
  'Q18074503', // installation artist
  'Q2309784', // performance artist
]);

/**
 * Find the Wikidata QID for an artist. Plain name search is ambiguous —
 * "Raphael" and "Lee Krasner" both resolve to unrelated people — so score
 * candidates on being human, having an art occupation, and above all matching
 * the birth year we already hold in the seed data.
 */
export async function resolveQid(name, birth) {
  const j = await getJSON(
    'https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&type=item&limit=10&search=' +
      encodeURIComponent(name),
  );
  const hits = j?.search ?? [];
  if (!hits.length) return null;

  const ids = hits.map((h) => h.id).join('|');
  const ents = await getJSON(
    `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=claims&ids=${ids}`,
  );

  let best = null;
  for (const h of hits) {
    const claims = ents?.entities?.[h.id]?.claims ?? {};
    const isHuman = (claims.P31 ?? []).some((c) => c.mainsnak?.datavalue?.value?.id === 'Q5');
    if (!isHuman) continue;

    const occupations = (claims.P106 ?? []).map((c) => c.mainsnak?.datavalue?.value?.id);
    const born = year(claims.P569?.[0]?.mainsnak?.datavalue?.value?.time);

    let score = 0;
    if (occupations.some((o) => ART_OCCUPATIONS.has(o))) score += 5;
    if (born && birth) {
      if (born === birth) score += 10;
      else if (Math.abs(born - birth) <= 2) score += 6; // seed dates are sometimes approximate
      else score -= 8; // definitely a different person
    }
    if (!best || score > best.score) best = { id: h.id, score };
  }
  return best?.id ?? hits[0].id;
}

