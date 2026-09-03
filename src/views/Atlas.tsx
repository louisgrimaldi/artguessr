import { useMemo, useState } from 'react';
import { ARTISTS, PLAYABLE_MOVEMENTS, artistsInMovement, pinsFor } from '../game';
import LazyMap from '../components/LazyMap';
import { eraLabel } from '../data/era';

const ALL = 'all';

export default function Atlas() {
  const [movement, setMovement] = useState(ALL);

  const pins = useMemo(
    () => pinsFor(movement === ALL ? ARTISTS : artistsInMovement(movement)),
    [movement],
  );

  // Where the work actually is, rather than where the artist was from.
  const cities = useMemo(() => {
    const tally = new Map<string, number>();
    for (const pin of pins) tally.set(pin.place, (tally.get(pin.place) ?? 0) + 1);
    return [...tally].sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [pins]);

  return (
    <div className="page">
      <p className="eyebrow">Reference</p>
      <h1 className="page-title">Atlas</h1>
      <p className="lede">
        Every located work in the deck, plotted where it actually hangs or stands. Casts and editions
        appear more than once — Bourgeois’s <cite>Maman</cite> shows up in four cities.
      </p>

      <div className="filter">
        <label htmlFor="movement-filter">Movement</label>
        <select
          id="movement-filter"
          value={movement}
          onChange={(e) => setMovement(e.target.value)}
        >
          <option value={ALL}>All movements</option>
          {PLAYABLE_MOVEMENTS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({eraLabel(m.years)})
            </option>
          ))}
        </select>
      </div>

      {pins.length === 0 ? (
        <p className="empty">No located works in this movement yet.</p>
      ) : (
        <>
          <LazyMap pins={pins} showArtist height={380} />

          <h2 className="section-title">Most represented places</h2>
          <ul className="tally">
            {cities.map(([place, count]) => (
              <li key={place}>
                <span>{place}</span>
                <span className="tally-count">{count}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
