import { useSyncExternalStore } from 'react';

const KEY = 'artguessr:save:v1';

export interface ArtistRecord {
  right: number;
  wrong: number;
}

export interface Save {
  best: number;
  /** Per-artist tallies, used for movement progress and the study guide. */
  progress: Record<string, ArtistRecord>;
  /**
   * Legacy. Once a separate "artists answered wrong and not yet redeemed" list
   * behind its own Mistakes mode, which turned out to be asking the same
   * question as "artists never answered correctly" — an artist missed three
   * times appeared in both. Unsolved mode now derives from `progress` via
   * `isLearned`, and this is kept only so an existing save still parses.
   */
  mistakes?: string[];
}

const EMPTY: Save = { best: 0, progress: {} };

function load(): Save {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Save>;
    return { best: parsed.best ?? 0, progress: parsed.progress ?? {} };
  } catch {
    // Corrupt or unavailable storage shouldn't stop the game loading.
    return EMPTY;
  }
}

let state: Save = load();
const listeners = new Set<() => void>();

function commit(next: Save) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Private browsing / quota — keep playing with in-memory state.
  }
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSave(): Save {
  return useSyncExternalStore(subscribe, () => state);
}

/**
 * Record an answer.
 *
 * There is no separate backlog to maintain any more: an artist is unsolved
 * while `right` is zero, so a correct answer anywhere — endless, a movement
 * set, the unsolved list itself — takes them off it.
 */
export function recordAnswer(artistId: string, right: boolean) {
  const prev = state.progress[artistId] ?? { right: 0, wrong: 0 };
  commit({
    ...state,
    progress: {
      ...state.progress,
      [artistId]: {
        right: prev.right + (right ? 1 : 0),
        wrong: prev.wrong + (right ? 0 : 1),
      },
    },
  });
}

export function recordStreak(streak: number) {
  if (streak > state.best) commit({ ...state, best: streak });
}

export function resetProgress() {
  commit(EMPTY);
}

/** True once the artist has been identified correctly at least once. */
export const isLearned = (save: Save, artistId: string) =>
  (save.progress[artistId]?.right ?? 0) > 0;
