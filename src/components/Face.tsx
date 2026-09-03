import { useState } from 'react';
import { IMAGE_FACE, imageAt, portraitByName, portraitFor } from '../game';

interface Props {
  name: string;
  /** Preferred when known; otherwise the portrait is resolved by name. */
  artistId?: string;
  /** Rendered pixel size; the shape is always a circle. */
  size?: number;
  /** Skip the ring — used where the face sits inside another bordered element. */
  plain?: boolean;
}

/**
 * A person's face. Falls back to their initials when there's no portrait or the
 * image fails, so layouts never collapse to an empty box.
 */
export default function Face({ name, artistId, size = 44, plain = false }: Props) {
  const [failed, setFailed] = useState(false);
  const portrait = artistId ? portraitFor(artistId) : portraitByName(name);

  const initials = name
    .split(/\s+/)
    .filter((part) => /^[A-Za-zÀ-ÿ]/.test(part))
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  const style = { width: size, height: size };

  if (!portrait || failed) {
    return (
      <span
        className={`face face-initials ${plain ? '' : 'face-ring'}`}
        style={style}
        aria-hidden="true"
      >
        {initials}
      </span>
    );
  }

  return (
    <img
      className={`face ${plain ? '' : 'face-ring'}`}
      style={style}
      // One width for every face, whatever the circle's size. The biggest is
      // 104px, so 250 covers even a retina panel — and asking for a single
      // width across the whole app means one cache entry per artist, warmed
      // once and reused by the reveal card, the study grid and the mistakes
      // list alike.
      src={imageAt(portrait, IMAGE_FACE)}
      alt={`Portrait of ${name}`}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
