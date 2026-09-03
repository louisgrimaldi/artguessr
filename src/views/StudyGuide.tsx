import { useMemo, useState } from 'react';
import { MOVEMENTS } from '../data/movements';
import {
  PLAYABLE_MOVEMENTS,
  artistById,
  dateOf,
  imageAt,
  genreOf,
  lifespan,
  bioFor,
  pinsFor,
  placeNames,
  recogniseFor,
  worksFor,
} from '../game';
import { isLearned, useSave } from '../store';
import LazyMap from '../components/LazyMap';
import Face from '../components/Face';
import { useLongform } from '../data/useLongform';
import MovementCard from '../components/MovementCard';
import { flagFor } from '../data/flags';
import { eraLabel } from '../data/era';

/** Detail page for one artist: their works, dates, movement, bio and map. */
function ArtistDetail({ artistId }: { artistId: string }) {
  const artist = artistById(artistId);
  const pins = useMemo(() => (artist ? pinsFor([artist]) : []), [artist]);
  const long = useLongform();

  if (!artist) {
    return (
      <div className="page">
        <h1 className="page-title">Not found</h1>
        <a className="button" href="#/study">
          Back to the study guide
        </a>
      </div>
    );
  }

  const movement = MOVEMENTS[artist.movement];
  const works = worksFor(artist.id);

  return (
    <div className="page">
      <a className="crumb" href="#/study">
        ← Study guide
      </a>

      <div className="who who-large">
        <Face artistId={artist.id} name={artist.name} size={104} />
        <div>
          <p className="eyebrow">{movement?.name ?? 'Artist'}</p>
          <h1 className="page-title">{artist.name}</h1>
          <p className="meta meta-tight">
            {lifespan(artist)} · <span
              className="flag"
              role="img"
              aria-label={artist.nationality}
              title={artist.nationality}
            >
              {flagFor(artist.nationality)}
            </span>
          </p>
        </div>
      </div>

      <p className="bio study-bio">{bioFor(artist)}</p>

      {long.artists[artist.id] && <p className="longform">{long.artists[artist.id]}</p>}

      {recogniseFor(artist.id) && (
        <div className="recognise">
          <h3>How to recognise them</h3>
          <p>{recogniseFor(artist.id)}</p>
        </div>
      )}


      {movement && (
        <MovementCard
          movement={movement}
          exclude={artist.name}
          longText={long.movements[movement.id]}
        />
      )}

      {pins.length > 0 && (
        <>
          <h2 className="section-title">Where the work is</h2>
          <LazyMap pins={pins} height={260} />
        </>
      )}

      <h2 className="section-title">Key works</h2>
      <div className="plates">
        {works.map((w) => (
          <a
            className="plate"
            key={w.image}
            href={w.item ? `#/work/${w.item}` : undefined}
          >
            <div className="plate-img">
              <img src={imageAt(w, 500)} alt={w.title} loading="lazy" decoding="async" />
            </div>
            <div className="plate-cap">
              <cite>{w.title}</cite>
              <dl className="factsheet tight">
                {dateOf(w) && (
                  <div>
                    <dt>Year</dt>
                    <dd>{dateOf(w)}</dd>
                  </div>
                )}
                {genreOf(w) && (
                  <div>
                    <dt>Genre</dt>
                    <dd>{genreOf(w)}</dd>
                  </div>
                )}
                {placeNames(w) && (
                  <div>
                    <dt>Location</dt>
                    <dd>{placeNames(w)}</dd>
                  </div>
                )}
              </dl>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function StudyGuide({ artistId }: { artistId?: string }) {
  const save = useSave();
  const [query, setQuery] = useState('');

  if (artistId) return <ArtistDetail artistId={artistId} />;

  const needle = query.trim().toLowerCase();
  const groups = PLAYABLE_MOVEMENTS.map((m) => ({
    ...m,
    matches: needle
      ? m.artists.filter(
          (a) =>
            a.name.toLowerCase().includes(needle) ||
            a.nationality.toLowerCase().includes(needle) ||
            m.name.toLowerCase().includes(needle),
        )
      : m.artists,
  })).filter((m) => m.matches.length > 0);

  return (
    <div className="page">
      <p className="eyebrow">Reference</p>
      <h1 className="page-title">Study guide</h1>
      <p className="lede">
        Every playable artist, grouped by movement. A tick marks the ones you’ve already identified
        correctly in a game.
      </p>

      <input
        className="search"
        type="search"
        value={query}
        placeholder="Search artist, movement or nationality…"
        onChange={(e) => setQuery(e.target.value)}
      />

      {groups.length === 0 && <p className="empty">Nothing matches “{query}”.</p>}

      {groups.map((m) => (
        <section className="study-group" key={m.id}>
          <h2 className="section-title">
            {m.name} <span className="movement-years">{eraLabel(m.years)}</span>
          </h2>
          <p className="group-blurb">{m.blurb}</p>
          <ul className="faces">
            {m.matches.map((a) => (
              <li key={a.id}>
                <a href={`#/study/${a.id}`} className={isLearned(save, a.id) ? 'known' : ''}>
                  <Face artistId={a.id} name={a.name} size={72} plain />
                  <span className="face-name">
                    {a.name}
                    {isLearned(save, a.id) && (
                      <span className="tick" aria-label="identified correctly">
                        {' '}
                        ✓
                      </span>
                    )}
                  </span>
                  <span className="face-years">{lifespan(a)}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
