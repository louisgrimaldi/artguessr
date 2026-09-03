import { useEffect, useState } from 'react';

export interface Longform {
  artists: Record<string, string>;
  movements: Record<string, string>;
  works: Record<string, string>;
  /** What each picture depicts, keyed by Wikidata id. */
  stories: Record<string, string>;
}

const EMPTY: Longform = { artists: {}, movements: {}, works: {}, stories: {} };

/**
 * Long-form text and the per-picture stories are ~670kB together, and only
 * appear on study pages, artwork pages and in Spectator mode — so they're
 * fetched on demand rather than bundled into the initial load. Cached after the
 * first request, so navigating between pages doesn't refetch.
 */
let cache: Longform | null = null;
let inflight: Promise<Longform> | null = null;

function load(): Promise<Longform> {
  if (cache) return Promise.resolve(cache);
  inflight ??= Promise.all([import('./longform.json'), import('./stories.json')]).then(
    ([longform, stories]) => {
      cache = {
        ...(longform.default as Omit<Longform, 'stories'>),
        stories: stories.default as Record<string, string>,
      };
      return cache;
    },
  );
  return inflight;
}

export function useLongform(): Longform {
  const [data, setData] = useState<Longform>(() => cache ?? EMPTY);

  useEffect(() => {
    if (cache) return;
    let live = true;
    load().then((loaded) => {
      if (live) setData(loaded);
    });
    return () => {
      live = false;
    };
  }, []);

  return data;
}
