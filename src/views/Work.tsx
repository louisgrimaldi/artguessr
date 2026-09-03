import { useMemo, useState } from 'react';
import { MOVEMENTS } from '../data/movements';
import {
  describeWork,
  dateOf,
  genreOf,
  IMAGE_MAIN,
  imageAt,
  lifespan,
  placeNames,
  workByItem,
  worksFor,
} from '../game';
import { flagFor } from '../data/flags';
import type { Pin } from '../types';
import Face from '../components/Face';
import MovementCard from '../components/MovementCard';
import LazyMap from '../components/LazyMap';
import Spectator from '../components/Spectator';
import FullscreenIcon from '../components/FullscreenIcon';
import { useLongform } from '../data/useLongform';

/** A single artwork, with its own label, map and route back to the artist. */
export default function Work({ item }: { item: string }) {
  const entry = workByItem(item);
  const long = useLongform();
  const [zoomed, setZoomed] = useState(false);

  const pins = useMemo<Pin[]>(() => {
    if (!entry) return [];
    return (entry.work.locations ?? [])
      .filter((p) => p.lat !== null && p.lon !== null)
      .map((p) => ({
        lat: p.lat as number,
        lon: p.lon as number,
        place: p.name,
        title: entry.work.title,
        artist: entry.artist.name,
        artistId: entry.artist.id,
        year: entry.work.year,
      }));
  }, [entry]);

  if (!entry) {
    return (
      <div className="page">
        <h1 className="page-title">Artwork not found</h1>
        <a className="button" href="#/study">
          Study guide
        </a>
      </div>
    );
  }

  const { work, artist } = entry;
  const movement = MOVEMENTS[artist.movement];
  const siblings = worksFor(artist.id).filter((w) => w.item !== work.item);
  const description = (work.item && long.works[work.item]) || describeWork(work, artist.name);

  return (
    <div className="page">
      <a className="crumb" href={`#/study/${artist.id}`}>
        ← {artist.name}
      </a>

      <div className="work-hero">
        <img src={imageAt(work, IMAGE_MAIN)} alt={work.title} decoding="async" />
        <button
          className="zoom-btn"
          onClick={() => setZoomed(true)}
          aria-label="View full screen"
          title="View full screen"
        >
          <FullscreenIcon />
        </button>
      </div>

      {zoomed && (
        <Spectator
          work={work}
          artist={artist.name}
          story={work.item ? long.stories[work.item] : undefined}
          description={description}
          onClose={() => setZoomed(false)}
        />
      )}

      <h1 className="page-title work-title">
        <cite>{work.title}</cite>
      </h1>

      <a className="work-by" href={`#/study/${artist.id}`}>
        <Face artistId={artist.id} name={artist.name} size={40} />
        <span>
          <strong>{artist.name}</strong>
          <span className="muted">
            {' '}
            {lifespan(artist)} · <span title={artist.nationality}>{flagFor(artist.nationality)}</span>
          </span>
        </span>
      </a>

      <dl className="factsheet">
        {dateOf(work) && (
          <div>
            <dt>Date</dt>
            <dd>{dateOf(work)}</dd>
          </div>
        )}
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

      {description && <p className="bio study-bio">{description}</p>}

      {pins.length > 0 && (
        <>
          <h2 className="section-title">Where it is</h2>
          <LazyMap pins={pins} height={240} />
        </>
      )}

      {movement && (
        <>
          <h2 className="section-title">Movement</h2>
          <MovementCard
            movement={movement}
            exclude={artist.name}
            longText={long.movements[movement.id]}
          />
        </>
      )}

      {siblings.length > 0 && (
        <>
          <h2 className="section-title">Also by {artist.name}</h2>
          <div className="plates">
            {siblings.map((w) => (
              <a className="plate" key={w.image} href={w.item ? `#/work/${w.item}` : undefined}>
                <div className="plate-img">
                  <img src={imageAt(w, 500)} alt={w.title} loading="lazy" decoding="async" />
                </div>
                <div className="plate-cap">
                  <cite>{w.title}</cite>
                  {dateOf(w) && <span className="year"> {dateOf(w)}</span>}
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
