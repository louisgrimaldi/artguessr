import { PLAYABLE_MOVEMENTS, worksFor } from '../game';
import { eraLabel } from '../data/era';
import { isLearned, useSave } from '../store';

export default function Movements() {
  const save = useSave();

  return (
    <div className="page">
      <p className="eyebrow">Practice</p>
      <h1 className="page-title">Movements</h1>
      <p className="lede">
        Each set asks only about artists from that movement, and draws the wrong answers from their
        own peers — harder than endless mode, and better for actually learning a style.
      </p>

      <div className="grid">
        {PLAYABLE_MOVEMENTS.map((m) => {
          const known = m.artists.filter((a) => isLearned(save, a.id)).length;
          const pct = Math.round((known / m.artists.length) * 100);
          const done = known === m.artists.length;
          // A representative work, for the card's thumbnail.
          const cover = worksFor(m.artists[0].id)[0];

          return (
            <a className="card" href={`#/movements/${m.id}`} key={m.id}>
              <div className="card-thumb">
                {cover && <img src={cover.image} alt="" loading="lazy" decoding="async" />}
              </div>
              <div className="card-body">
                <h2>{m.name}</h2>
                <p className="card-years">{eraLabel(m.years)}</p>
                <div className={`bar ${done ? 'done' : ''}`}>
                  <span style={{ width: `${pct}%` }} />
                </div>
                <p className="card-count">
                  {known} / {m.artists.length} artists
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
