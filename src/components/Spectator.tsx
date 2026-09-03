import { useEffect, useRef, useState } from 'react';
import { hotspotsFor } from '../data/annotations';
import { IMAGE_ZOOM, MAX_UPSCALE, dateOf, genreOf, imageAt, placeNames } from '../game';
import type { Artwork } from '../types';

interface Props {
  work: Artwork;
  artist: string;
  /** What the picture depicts, when the article describes its subject. */
  story?: string;
  /** Full account when available; falls back to the short label. */
  description?: string;
  onClose: () => void;
  /** Step through the artist's other works without leaving the overlay. */
  onPrev?: () => void;
  onNext?: () => void;
  /**
   * Whether the answer is already known. Before that, Spectator shows the
   * picture and nothing else — the title, artist, location and annotations all
   * name the artist, so showing them would hand over the round.
   */
  revealed?: boolean;
}

/**
 * Spectator mode — the artwork on its own, full screen, with the written detail
 * beside it and hoverable points on the picture itself.
 */
export default function Spectator({
  work,
  artist,
  story,
  description,
  onClose,
  onPrev,
  onNext,
  revealed = true,
}: Props) {
  const [active, setActive] = useState<number | null>(null);
  /**
   * Native size, for the frame's aspect ratio (so hotspots land true) and for
   * how far the picture may be enlarged. Known up front from the dataset for
   * every resolved image, which means the frame is the right shape on the very
   * first paint — it used to be measured in `onLoad`, so the overlay opened at
   * a default 4:3 and snapped into shape once the picture arrived.
   */
  const [measured, setMeasured] = useState<{ width: number; height: number } | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  const size =
    work.width && work.height ? { width: work.width, height: work.height } : measured;

  const spots = revealed ? hotspotsFor(work.item) : [];

  // Stepping to another work clears any open annotation. This replaces keying
  // the component on the image, which remounted the overlay and replayed its
  // fade-in — the black flash between pictures.
  useEffect(() => {
    setActive(null);
  }, [work.item]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (active !== null) setActive(null);
        else onClose();
        return;
      }
      // Handled here rather than left to the view behind, so stepping through
      // works never depends on which keydown listener happens to run first.
      if (e.key === 'ArrowRight' && onNext) {
        e.stopPropagation();
        e.preventDefault();
        onNext();
      } else if (e.key === 'ArrowLeft' && onPrev) {
        e.stopPropagation();
        e.preventDefault();
        onPrev();
      }
    };
    window.addEventListener('keydown', onKey, true);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = overflow;
    };
  }, [onClose, active, onPrev, onNext]);

  const open = active === null ? null : spots[active];

  return (
    <div className="spectator" role="dialog" aria-modal="true" aria-label={revealed ? `${work.title}, full screen` : 'Artwork, full screen'}>
      <header className="spectator-bar">
        <p className="eyebrow">
          Spectator mode
        </p>
        <button ref={closeButton} className="spectator-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </header>

      <div className="spectator-body">
        <div className="spectator-stage">
          {/* Sized to the picture's own ratio so percentage hotspots line up. */}
          <div
            className="spectator-frame"
            style={{
              ...(size ? { aspectRatio: `${size.width} / ${size.height}` } : {}),
              // In-copyright works are hosted small by policy: Koons's "Michael
              // Jackson and Bubbles" is 364px wide, Giacometti's "L'Homme qui
              // marche I" 163px. Held to native size those sat as postage
              // stamps in the middle of a black screen — so the frame is
              // allowed to enlarge them, up to a limit past which there is
              // genuinely nothing more to see. Capped in both directions, so a
              // tall picture is bounded by its height rather than blowing out.
              ...(size
                ? {
                    maxWidth: `min(100%, ${size.width * MAX_UPSCALE}px)`,
                    maxHeight: `min(100%, ${size.height * MAX_UPSCALE}px)`,
                  }
                : {}),
            }}
            onClick={() => setActive(null)}
          >
            <img
              src={imageAt(work, IMAGE_ZOOM)}
              alt={work.title}
              decoding="async"
              // Only ever replaced, never cleared: nulling it between works
              // would snap the frame to the default ratio and jump. Only used
              // for the handful of images the resolver couldn't measure.
              onLoad={(e) => {
                const img = e.currentTarget;
                if (img.naturalHeight) {
                  setMeasured({ width: img.naturalWidth, height: img.naturalHeight });
                }
              }}
            />

            {spots.map((spot, i) => (
              <button
                key={spot.label}
                className={`hotspot ${active === i ? 'open' : ''}`}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={(e) => {
                  e.stopPropagation();
                  setActive(active === i ? null : i);
                }}
                aria-label={spot.label}
              >
                <span aria-hidden="true">{i + 1}</span>
              </button>
            ))}

            {/* The note itself, pinned to its marker and pointing back at it.
                It used to print in a line under the picture, which meant
                reading a description of a detail while looking away from the
                detail. `side` flips it to whichever half has room, so a marker
                near an edge doesn't push the callout off the picture. */}
            {open && (
              <div
                className={`callout ${open.x > 55 ? 'to-left' : 'to-right'} ${open.y > 62 ? 'to-top' : 'to-bottom'}`}
                style={{ left: `${open.x}%`, top: `${open.y}%` }}
                onClick={(e) => e.stopPropagation()}
              >
                <p className="callout-label">{open.label}</p>
                <p className="callout-text">{open.text}</p>
              </div>
            )}
          </div>

          {!revealed && (
            <p className="spectator-hint">
              <span className="muted">Details appear once you’ve named the artist.</span>
            </p>
          )}

          {/* Only the invitation now — the note itself is on the picture. Kept
              mounted while a callout is open so the row doesn't collapse and
              shift the frame underneath the cursor. */}
          {spots.length > 0 && (
            <p className="spectator-hint">
              <span className="muted" style={open ? { visibility: 'hidden' } : undefined}>
                {spots.length} points on the picture — hover one to read about it
              </span>
            </p>
          )}
        </div>

        {revealed && (
        <aside className="spectator-info">
          <h2>
            <cite>{work.title}</cite>
          </h2>
          <p className="spectator-by">
            {artist}
            {dateOf(work) && <span className="year"> · {dateOf(work)}</span>}
          </p>

          <dl className="factsheet">
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

          {story && (
            <>
              <h3 className="spectator-sub">The story</h3>
              <p className="spectator-text">{story}</p>
            </>
          )}

          {description && (
            <>
              <h3 className="spectator-sub">About the work</h3>
              <p className="spectator-text">{description}</p>
            </>
          )}

          {spots.length > 0 && (
            <>
              <h3 className="spectator-sub">Look closer</h3>
              <ol className="spectator-list">
                {spots.map((spot, i) => (
                  <li key={spot.label}>
                    <button
                      className={active === i ? 'active' : ''}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => setActive(active === i ? null : i)}
                    >
                      <span className="spectator-num">{i + 1}</span>
                      <span>
                        <strong>{spot.label}</strong> {spot.text}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </>
          )}
        </aside>
        )}
      </div>
    </div>
  );
}
