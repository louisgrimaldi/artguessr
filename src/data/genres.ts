/**
 * Wikidata's `P136` genre is three different dimensions in one field: subject
 * genre ("portrait"), art movement ("Naturalism", "pop art") and medium or
 * format ("public art", "sculpture"). Shown raw, one Van Gogh reads "cityscape"
 * and the next "Naturalism", which invites a comparison that means nothing.
 *
 * This maps the values worth keeping onto a small vocabulary of *subject*
 * genres — what the picture shows — and drops the rest. Movements already have
 * their own card; medium is visible in the picture.
 *
 * Anything unmapped shows no genre at all, which is the honest outcome: a label
 * is only useful if it means the same thing every time.
 */
const SUBJECT_GENRES: Record<string, string> = {
  // People
  portrait: 'Portrait',
  'group portrait': 'Group portrait',
  'double portrait': 'Portrait',
  'family portrait': 'Portrait',
  'equestrian portrait': 'Portrait',
  'historiated portrait': 'Portrait',
  'catafalque portrait': 'Portrait',
  'portrait sculpture': 'Portrait',
  tronie: 'Portrait',
  'self-portrait': 'Self-portrait',
  'nude self-portrait': 'Self-portrait',
  nude: 'Nude',
  'venus pudica': 'Nude',
  'figure painting': 'Figures',
  figure: 'Figures',
  'figurative art': 'Figures',

  // Scenes
  'genre art': 'Everyday life',
  'genre painting': 'Everyday life',
  'atelier scene': 'Everyday life',
  'interior view': 'Interior',
  'fête galante': 'Everyday life',
  schutterstuk: 'Group portrait',

  // Places
  'landscape painting': 'Landscape',
  landscape: 'Landscape',
  veduta: 'Cityscape',
  cityscape: 'Cityscape',
  'marine art': 'Seascape',
  'meisho-e': 'Landscape',

  // Stories
  'mythological painting': 'Mythology',
  'mythological sculpture': 'Mythology',
  allegory: 'Allegory',
  'history painting': 'History',
  'battle painting': 'History',
  'religious art': 'Religious',
  'religious painting': 'Religious',
  'religious sculpture as genre': 'Religious',
  'funerary art': 'Religious',

  // Objects and surfaces
  'still life': 'Still life',
  'floral painting': 'Still life',
  "trompe-l'œil": 'Still life',
  'animal art': 'Animals',

  // Non-representational
  'abstract art': 'Abstract',
  'action painting': 'Abstract',
  'monochrome painting': 'Abstract',
};

/** A consistent subject genre, or undefined when the source value isn't one. */
export function normaliseGenre(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  return SUBJECT_GENRES[raw.trim().toLowerCase()];
}
