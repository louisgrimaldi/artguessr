export interface Artist {
  id: string;
  name: string;
  birth: number;
  /** null while the artist is still living */
  death: number | null;
  nationality: string;
  /** key into MOVEMENTS */
  movement: string;
  bio: string;
}

export interface Artwork {
  title: string;
  /** Exact year, only when Wikidata records one to year precision. */
  year: number | null;
  /**
   * Display date. Usually the year, but "1480s" or "15th century" where that's
   * all Wikidata knows — better than showing nothing, and never a false exact
   * year. Null when there's no date at all.
   */
  dateLabel?: string | null;
  image: string;
  /** 'commons' = free licence, 'wikipedia' = in-copyright, article image */
  source: 'commons' | 'wikipedia';
  /**
   * Direct upload.wikimedia.org URL for the original file, and its native
   * pixel size. Written by `npm run data:images`. See `imageAt()`.
   */
  src?: string;
  width?: number;
  height?: number;
  thumb?: string;
  render?: boolean;
  /** Wikipedia language editions covering the work; our notability proxy. */
  links?: number;
  /** Wikidata item id, kept so the work can be re-enriched later. */
  item?: string;
  /**
   * Where it hangs or stands. Plural because casts and editions genuinely exist
   * in several places at once — Bourgeois's "Maman" is in London, Ottawa, Bilbao
   * and Tokyo. Coordinates are null when Wikidata has the place but not a point.
   */
  locations?: Place[];
  genre?: string | null;
}

/** An artist's likeness: self-portrait, period portrait or photograph. */
export interface Portrait {
  image: string;
  source: 'commons' | 'wikipedia';
  src?: string;
  width?: number;
  height?: number;
  thumb?: string;
  render?: boolean;
}

/**
 * Anything with a picture attached. `imageAt()` takes this rather than a bare
 * URL, because choosing a width correctly needs to know the native size.
 */
export interface ImageSource {
  image: string;
  src?: string;
  width?: number;
  /** Thumbnail URL with the width left as `{w}`. */
  thumb?: string;
  /** The original is a format browsers can't show; always use `thumb`. */
  render?: boolean;
}

export interface Place {
  name: string;
  lat: number | null;
  lon: number | null;
}

/** A single mappable point: one work at one place. */
export interface Pin {
  lat: number;
  lon: number;
  place: string;
  title: string;
  artist: string;
  artistId: string;
  year: number | null;
}

export interface Round {
  answer: Artist;
  works: Artwork[];
  choices: Artist[];
}

export type Mode = 'endless' | 'movement' | 'unsolved';
