import { ARTISTS, PLAYABLE_MOVEMENTS, TOTAL_WORKS } from '../game';
import { isLearned, useSave } from '../store';

export default function Home() {
  const save = useSave();
  const learned = ARTISTS.filter((a) => isLearned(save, a.id)).length;
  const unsolved = ARTISTS.length - learned;
  const pct = Math.round((learned / ARTISTS.length) * 100);

  return (
    <div className="page">
      <p className="eyebrow">Guess the artist</p>
      <h1 className="page-title big">
        {ARTISTS.length} artists, {TOTAL_WORKS} works,
        <br />
        van Eyck to Banksy.
      </h1>

      <div className="overall">
        <div className="bar">
          <span style={{ width: `${pct}%` }} />
        </div>
        <p className="bar-label">
          {learned} of {ARTISTS.length} artists identified · {pct}%
        </p>
      </div>

      <div className="modes">
        <a className="mode" href="#/play">
          <span className="mode-icon" aria-hidden="true">
            ∞
          </span>
          <h2>Endless</h2>
          <p>Every artist in the deck, in random order, until you stop.</p>
        </a>

        <a className="mode" href="#/movements">
          <span className="mode-icon" aria-hidden="true">
            ◈
          </span>
          <h2>By movement</h2>
          <p>
            Drill one movement at a time — {PLAYABLE_MOVEMENTS.length} of them, from the Early
            Renaissance to street art. Harder: the wrong answers are the artist’s own peers.
          </p>
        </a>

        <a className="mode" href="#/unsolved">
          <span className="mode-icon" aria-hidden="true">
            ◇
          </span>
          <h2>Unsolved</h2>
          <p>
            {unsolved > 0
              ? `${unsolved} artist${unsolved === 1 ? '' : 's'} you haven’t named correctly yet.`
              : 'Every artist named. Nothing left unsolved.'}
          </p>
        </a>

        <a className="mode" href="#/study">
          <span className="mode-icon" aria-hidden="true">
            ❑
          </span>
          <h2>Study guide</h2>
          <p>Browse every artist and movement with their works, dates and locations.</p>
        </a>

        <a className="mode" href="#/atlas">
          <span className="mode-icon" aria-hidden="true">
            ◉
          </span>
          <h2>Atlas</h2>
          <p>Every located work on a map — see how an artist’s output is scattered, or clustered.</p>
        </a>
      </div>
    </div>
  );
}
