import { MOVEMENTS } from '../data/movements';
import { ARTISTS, lifespan } from '../game';
import { isLearned, useSave } from '../store';
import Face from '../components/Face';

/**
 * Everyone still to crack.
 *
 * This replaces two modes that turned out to be the same question asked twice.
 * "Mistakes" tracked artists answered wrongly and not yet redeemed; "New to
 * you" tracked artists never answered correctly. An artist you had got wrong
 * three times sat in both, and the second list's name promised someone you had
 * never met — which is why a Sargent you had faced repeatedly still showed up
 * as new. One list, one rule: you haven't named them right yet.
 */
export default function Unsolved() {
  const save = useSave();
  const artists = ARTISTS.filter((a) => !isLearned(save, a.id));
  const attempted = artists.filter((a) => (save.progress[a.id]?.wrong ?? 0) > 0);

  return (
    <div className="page">
      <p className="eyebrow">Practice</p>
      <h1 className="page-title">Unsolved</h1>

      {artists.length === 0 ? (
        <>
          <p className="empty">
            Nothing left — you’ve named every artist in the game correctly at least once.
          </p>
          <a className="button" href="#/play">
            Play endless
          </a>
        </>
      ) : (
        <>
          <p className="lede">
            {artists.length} artist{artists.length === 1 ? '' : 's'} you haven’t named correctly
            yet
            {attempted.length > 0 && `, ${attempted.length} of them already missed at least once`}.
            Get one right anywhere and it leaves the list.
          </p>

          <div className="row-actions">
            <a className="button" href="#/unsolved/play">
              Start
            </a>
          </div>

          <ul className="tablist">
            {artists.map((a) => {
              const wrong = save.progress[a.id]?.wrong ?? 0;
              return (
                <li key={a.id}>
                  <a href={`#/study/${a.id}`}>
                    <span className="tablist-who">
                      <Face artistId={a.id} name={a.name} size={34} />
                      <span className="tablist-name">{a.name}</span>
                    </span>
                    <span className="tablist-meta">
                      {MOVEMENTS[a.movement]?.name ?? '—'} · {lifespan(a)}
                    </span>
                    <span className="tablist-score">
                      {wrong > 0 ? `${wrong} wrong` : 'not yet seen'}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
