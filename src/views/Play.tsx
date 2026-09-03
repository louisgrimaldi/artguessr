import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ARTISTS,
  Deck,
  artistsInMovement,
  dateOf,
  genreOf,
  IMAGE_FACE,
  IMAGE_MAIN,
  IMAGE_THUMB,
  IMAGE_ZOOM,
  imageAt,
  lifespan,
  bioFor,
  describeWork,
  placeNames,
  portraitFor,
  recogniseFor,
} from '../game';
import { MOVEMENTS } from '../data/movements';
import { isLearned, recordAnswer, recordStreak, useSave } from '../store';
import type { Artist, Mode, Round } from '../types';
import Face from '../components/Face';
import { scrollContentToTop } from '../scroll';
import MovementCard from '../components/MovementCard';
import Spectator from '../components/Spectator';
import { useLongform } from '../data/useLongform';
import FullscreenIcon from '../components/FullscreenIcon';
import { flagFor } from '../data/flags';

interface Props {
  mode: Mode;
  movementId?: string;
}

export default function Play({ mode, movementId }: Props) {
  const save = useSave();

  // Snapshot the set once per visit: naming an artist correctly removes them
  // from it, and a deck that shrank underneath you mid-run would be
  // disorienting. Lazily initialised so it isn't rebuilt on every render.
  const unsolvedArtists = useRef<Artist[] | null>(null);
  if (unsolvedArtists.current === null) {
    unsolvedArtists.current = ARTISTS.filter((a) => !isLearned(save, a.id));
  }

  const deck = useMemo(() => {
    if (mode === 'movement' && movementId) {
      const pool = artistsInMovement(movementId);
      // Guessing within one movement is the hard mode: keep distractors inside
      // it where possible so the answer can't be inferred from the period.
      return new Deck(pool, {
        chooseFrom: pool.length >= 4 ? pool : ARTISTS,
        loop: false,
      });
    }
    if (mode === 'unsolved') {
      // Distractors come from the whole roster, not just the unsolved pool —
      // drawing them from the same set would tell you that every name on
      // offer is one you have never got right, which is a real hint.
      return new Deck(unsolvedArtists.current ?? [], { chooseFrom: ARTISTS, loop: false });
    }
    return new Deck(ARTISTS);
  }, [mode, movementId]);

  const [round, setRound] = useState<Round | null>(() => deck.next());
  const [picked, setPicked] = useState<Artist | null>(null);
  const [slide, setSlide] = useState(0);
  const [broken, setBroken] = useState<Record<string, boolean>>({});
  /** Which full-size images have arrived, so the placeholder can fade out. */
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const [zoomed, setZoomed] = useState(false);
  const long = useLongform();
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const nextButton = useRef<HTMLButtonElement>(null);

  const answered = picked !== null;
  const correct = picked !== null && round !== null && picked.id === round.answer.id;

  /**
   * Warm every work in the current round at display size, so stepping through
   * with the arrows is instant rather than a fresh megabyte each time.
   */
  useEffect(() => {
    if (!round) return;
    const pending = [
      // Thumbnails first: they are tiny, and they are what the placeholder
      // under each picture is drawn from.
      ...round.works.map((w) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = imageAt(w, IMAGE_THUMB);
        return img;
      }),
      ...round.works.map((w, i) => {
        const img = new Image();
        img.decoding = 'async';
        // The one on screen first; the rest can trickle in behind it.
        if (i !== 0) img.fetchPriority = 'low';
        img.src = imageAt(w, IMAGE_MAIN);
        return img;
      }),
    ];
    return () => pending.forEach((img) => (img.src = ''));
  }, [round]);

  /**
   * Warm the full-resolution copy of *every* work in the round, so Spectator
   * mode is instant both to open and to step through.
   *
   * Warming only the visible slide wasn't enough: the overlay's arrows move
   * between works at zoom size, and the ones not yet visited had never been
   * asked for, so each step stalled for seconds on a fresh multi-megabyte
   * download right when the player was moving fastest.
   *
   * Fetched one at a time rather than all at once. Eight works at 1920px is a
   * lot of bytes, and firing them together would contend with the picture
   * actually on screen; a chain keeps exactly one extra request in flight.
   *
   * The next artist's pictures are appended to the same chain rather than
   * warmed by a separate effect, so the two can't race each other for
   * bandwidth: this round finishes first, then the next one is made ready
   * behind it, and pressing Next has nothing left to download.
   *
   * Free for the fifth of the collection whose original is smaller than the
   * display width: `imageAt` returns the same URL for both sizes, so those
   * resolve against the cache rather than the network.
   */
  useEffect(() => {
    if (!round) return;

    const upcoming = deck.peek();
    const portrait = upcoming && portraitFor(upcoming.answer.id);
    const queue: string[] = [
      // This round, full size, in the order the arrows will reach them.
      ...round.works.map((w) => imageAt(w, IMAGE_ZOOM)),
      // Then the next artist: filmstrip, then every picture at display size,
      // then the opening one at full size so their Spectator opens instantly.
      ...(upcoming?.works ?? []).map((w) => imageAt(w, IMAGE_THUMB)),
      ...(portrait ? [imageAt(portrait, IMAGE_FACE)] : []),
      ...(upcoming?.works ?? []).map((w) => imageAt(w, IMAGE_MAIN)),
      ...(upcoming?.works[0] ? [imageAt(upcoming.works[0], IMAGE_ZOOM)] : []),
    ];

    let cancelled = false;
    const chain = async () => {
      // A beat before starting, so the picture on screen gets the bandwidth.
      await new Promise((r) => setTimeout(r, 350));

      for (const url of queue) {
        if (cancelled) return;
        const img = new Image();
        img.decoding = 'async';
        img.fetchPriority = 'low';
        img.src = url;
        // Resolves either way: one broken image must not stall the queue.
        await new Promise<void>((resolve) => {
          if (img.complete) return resolve();
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      }
    };
    void chain();

    // Deliberately keyed on the round alone. Keying it on `slide` too meant
    // every arrow press tore down the chain and aborted whatever was
    // mid-flight, so fast stepping downloaded nothing to completion.
    return () => {
      cancelled = true;
    };
  }, [round, deck]);

  /**
   * Opening the overlay makes the zoom copy the thing the player is actually
   * waiting on, so ask for it again at high priority. Costs nothing when the
   * chain above already has it: same URL, so it comes from cache.
   */
  useEffect(() => {
    const current = round?.works[slide];
    if (!zoomed || !current) return;
    const img = new Image();
    img.decoding = 'async';
    img.fetchPriority = 'high';
    img.src = imageAt(current, IMAGE_ZOOM);
  }, [zoomed, slide, round]);

  const guess = useCallback(
    (artist: Artist) => {
      if (answered || !round) return;
      setPicked(artist);

      const right = artist.id === round.answer.id;
      const nextStreak = right ? streak + 1 : 0;

      setScore((s) => ({ right: s.right + (right ? 1 : 0), total: s.total + 1 }));
      setStreak(nextStreak);
      recordAnswer(round.answer.id, right);
      recordStreak(nextStreak);
    },
    [answered, round, streak],
  );

  const advance = useCallback(() => {
    setRound(deck.next());
    setPicked(null);
    setSlide(0);
    setBroken({});
    setZoomed(false);
    // A new artist is a fresh page; start it from the top.
    scrollContentToTop();
  }, [deck]);

  // Focus Next on reveal so Enter advances — but never scroll to reach it.
  // The button sits at the foot of a long panel, and a plain focus() drags the
  // viewport down (and sideways) to bring it into view, which read as "answering
  // throws you to the bottom of the page".
  useEffect(() => {
    if (answered) nextButton.current?.focus({ preventScroll: true });
  }, [answered]);

  useEffect(() => {
    if (!round) return;
    const onKey = (e: KeyboardEvent) => {
      // Space toggles Spectator mode, and is the only binding that still works
      // while it's open. Default is suppressed so it doesn't scroll or re-press
      // whichever button happens to hold focus.
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setZoomed((z) => !z);
        return;
      }

      // Arrows step through the artist's works in both views.
      const count = round.works.length;
      if (e.key === 'ArrowRight') {
        setSlide((s) => (s + 1) % count);
        return;
      }
      if (e.key === 'ArrowLeft') {
        setSlide((s) => (s - 1 + count) % count);
        return;
      }
      if (zoomed) return;

      if (e.key === 'Enter') {
        // The focused Next button already handles its own Enter; this covers the
        // case where focus has moved elsewhere, without advancing twice.
        if (!answered || e.target === nextButton.current) return;
        e.preventDefault();
        advance();
      } else if (!answered && /^[1-4]$/.test(e.key)) {
        const choice = round.choices[Number(e.key) - 1];
        if (choice) guess(choice);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answered, guess, round, zoomed, advance]);

  const movement = movementId ? MOVEMENTS[movementId] : null;
  const heading =
    mode === 'movement'
      ? (movement?.name ?? 'Movement')
      : mode === 'unsolved'
        ? 'Unsolved'
        : 'Endless';

  if (mode === 'unsolved' && unsolvedArtists.current.length === 0) {
    return (
      <div className="page">
        <h1 className="page-title">Unsolved</h1>
        <p className="empty">
          Nothing left — you’ve named every artist in the game correctly at least once.
        </p>
        <a className="button" href="#/play">
          Play endless
        </a>
      </div>
    );
  }

  // Finite modes (a movement set, the unsolved list) run out; endless doesn't.
  if (!round) {
    const finalPct = score.total ? Math.round((score.right / score.total) * 100) : 0;
    return (
      <div className="page">
        <p className="eyebrow">Complete</p>
        <h1 className="page-title">{heading}</h1>

        <p className="result">
          {score.right} <span>/ {score.total} correct</span>
        </p>
        <div className="overall">
          <div className={`bar ${finalPct === 100 ? 'done' : ''}`}>
            <span style={{ width: `${finalPct}%` }} />
          </div>
          <p className="bar-label">{finalPct}%</p>
        </div>

        {mode === 'unsolved' && (
          <p className="empty">
            {score.right === score.total
              ? 'Every one of them named first time — the list is that much shorter.'
              : `${score.right} of these ${score.total} have left the list. The rest are still unsolved.`}
          </p>
        )}

        <div className="row-actions">
          <a
            className="button"
            href={mode === 'unsolved' ? '#/unsolved' : '#/movements'}
          >
            {mode === 'unsolved' ? 'Back to unsolved' : 'All movements'}
          </a>
          <a className="button ghost" href="#/play">
            Play endless
          </a>
        </div>
      </div>
    );
  }

  const work = round.works[slide];
  const answerMovement = MOVEMENTS[round.answer.movement];

  return (
    <div className={`play ${answered ? 'answered' : ''}`}>
      {zoomed && (
        <Spectator
          work={work}
          artist={round.answer.name}
          story={work.item ? long.stories[work.item] : undefined}
          description={
            (work.item && long.works[work.item]) || describeWork(work, round.answer.name)
          }
          onClose={() => setZoomed(false)}
          onPrev={() => setSlide((s) => (s - 1 + round.works.length) % round.works.length)}
          onNext={() => setSlide((s) => (s + 1) % round.works.length)}
          revealed={answered}
        />
      )}
      <header className="play-head">
        <div>
          <p className="eyebrow">
            {mode === 'movement' ? 'Movement' : mode === 'unsolved' ? 'Practice' : 'Mode'}
          </p>
          <h1 className="page-title">{heading}</h1>
        </div>
      </header>

      <div className="stage">
        <section className="viewer">
          <div className="frame">
            {broken[work.image] ? (
              <p className="broken">
                This image didn’t load.
                <br />
                <span className="muted">Use ← → for another work by the same artist.</span>
              </p>
            ) : (
              <div className="frame-stack">
                {/* The 200px thumbnail is already in cache from the filmstrip,
                    so it paints instantly and stands in — blurred up — until
                    the full-size version arrives over the top of it. */}
                <img
                  className="frame-preview"
                  src={imageAt(work, IMAGE_THUMB)}
                  alt=""
                  aria-hidden="true"
                />
                <img
                  key={work.image}
                  className={`frame-full ${loaded[work.image] ? 'ready' : ''}`}
                  src={imageAt(work, IMAGE_MAIN)}
                  alt={work.title}
                  decoding="async"
                  onLoad={() => setLoaded((l) => ({ ...l, [work.image]: true }))}
                  onError={() => setBroken((b) => ({ ...b, [work.image]: true }))}
                />
              </div>
            )}
            {!broken[work.image] && (
              <button
                className="zoom-btn"
                onClick={() => setZoomed(true)}
                aria-label="View full screen"
                title="View full screen"
              >
                <FullscreenIcon />
              </button>
            )}
          </div>

          <div className="filmstrip">
            {round.works.map((w, i) => (
              <button
                key={w.image}
                className={`thumb ${i === slide ? 'active' : ''}`}
                onClick={() => setSlide(i)}
                aria-label={`Artwork ${i + 1} of ${round.works.length}`}
                aria-current={i === slide}
              >
                <img src={imageAt(w, IMAGE_THUMB)} alt="" decoding="async" />
              </button>
            ))}
          </div>

          {/* Everything about the work itself lives under it, museum-label
              style. The right-hand panel is for the verdict and the artist. */}
          {answered ? (
            <div className="label">
              <h2 className="label-title">
                {work.item ? (
                  <a href={`#/work/${work.item}`}>
                    <cite>{work.title}</cite>
                  </a>
                ) : (
                  <cite>{work.title}</cite>
                )}
                {dateOf(work) && <span className="year">, {dateOf(work)}</span>}
              </h2>

              <dl className="label-facts">
                {genreOf(work) && (
                  <div>
                    <dt>Genre</dt>
                    <dd>{genreOf(work)}</dd>
                  </div>
                )}
                {placeNames(work) && (
                  <div>
                    <dt>Location</dt>
                    <dd>{placeNames(work)}</dd>
                  </div>
                )}
              </dl>


            </div>
          ) : (
            <p className="caption">
              <span className="muted">
                Artwork {slide + 1} of {round.works.length}
              </span>
            </p>
          )}
          <ul className="keys" aria-label="Keyboard shortcuts">
            <li>
              <kbd>←</kbd>
              <kbd>→</kbd>
              <span>artworks</span>
            </li>
            <li>
              <kbd>space</kbd>
              <span>spectator mode</span>
            </li>
            <li>
              <kbd>↵</kbd>
              <span>next artist</span>
            </li>
          </ul>
        </section>

        <section className="panel">
          {!answered ? (
            <>
              <h2 className="prompt">Who made these?</h2>
              <ul className="choices">
                {round.choices.map((choice, i) => (
                  <li key={choice.id}>
                    <button className="choice" onClick={() => guess(choice)}>
                      <kbd>{i + 1}</kbd>
                      <span>{choice.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="reveal">
              <div className={`verdict-banner ${correct ? 'right' : 'wrong'}`} role="status">
                <span className="verdict-mark" aria-hidden="true">
                  {correct ? '✓' : '✕'}
                </span>
                <div className="verdict-copy">
                  <p className="verdict-word">{correct ? 'Correct' : 'Wrong'}</p>
                  {!correct && <p className="verdict-sub">You said {picked.name}</p>}
                </div>
              </div>

              {/* Artist first, then the movement, then this particular work. */}
              <a className="who who-link" href={`#/study/${round.answer.id}`}>
                <Face artistId={round.answer.id} name={round.answer.name} size={64} />
                <div>
                  <h2 className="artist-name">{round.answer.name}</h2>
                  <p className="meta meta-tight">
                    {lifespan(round.answer)} · <span
                      className="flag"
                      role="img"
                      aria-label={round.answer.nationality}
                      title={round.answer.nationality}
                    >
                      {flagFor(round.answer.nationality)}
                    </span>
                  </p>
                </div>
              </a>

              <p className="bio">{bioFor(round.answer)}</p>

              {recogniseFor(round.answer.id) && (
                <div className="recognise">
                  <h3>How to recognise them</h3>
                  <p>{recogniseFor(round.answer.id)}</p>
                </div>
              )}

              {answerMovement && (
                <MovementCard movement={answerMovement} exclude={round.answer.name} />
              )}

              <div className="reveal-actions">
                <button ref={nextButton} className="next" onClick={advance}>
                  Next artist <kbd>↵</kbd>
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
