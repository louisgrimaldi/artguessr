import { useEffect, useState } from 'react';
import { scrollContentToTop } from './scroll';
import { ARTISTS } from './game';
import { isLearned, useSave } from './store';
import Home from './views/Home';
import Play from './views/Play';
import Movements from './views/Movements';
import Unsolved from './views/Unsolved';
import StudyGuide from './views/StudyGuide';
import Atlas from './views/Atlas';
import Work from './views/Work';

/** Minimal hash router — enough for six views, no dependency. */
function useRoute(): string[] {
  const [hash, setHash] = useState(() => window.location.hash.slice(1) || '/');
  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash.slice(1) || '/');
      // Hash navigation leaves the scroll position alone, so following a link
      // from halfway down the study guide dropped you halfway down the next
      // page. Every route change here is a new page, so go back to the top.
      scrollContentToTop();
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash.split('/').filter(Boolean);
}

const NAV = [
  { href: '#/', label: 'Home', icon: '⌂' },
  { href: '#/play', label: 'Endless', icon: '∞' },
  { href: '#/unsolved', label: 'Unsolved', icon: '◇' },
  { href: '#/movements', label: 'Movements', icon: '◈' },
  { href: '#/study', label: 'Study guide', icon: '❑' },
  { href: '#/atlas', label: 'Atlas', icon: '◉' },
];

export default function App() {
  const route = useRoute();
  const save = useSave();
  const [section = ''] = route;

  // Keep the document title in step with the view.
  useEffect(() => {
    const current = NAV.find((n) => n.href === `#/${section}`);
    document.title = current && section ? `${current.label} · Artguessr` : 'Artguessr';
  }, [section]);

  // Play is keyed per mode so switching decks remounts it rather than reusing
  // the previous mode's in-progress round.
  const unsolvedCount = ARTISTS.filter((a) => !isLearned(save, a.id)).length;

  let view;
  if (section === 'play') view = <Play key="endless" mode="endless" />;
  else if (section === 'unsolved') {
    view = route[1] === 'play' ? <Play key="unsolved" mode="unsolved" /> : <Unsolved />;
  }
  else if (section === 'movements') {
    view = route[1] ? (
      <Play key={`movement:${route[1]}`} mode="movement" movementId={route[1]} />
    ) : (
      <Movements />
    );
  } else if (section === 'study') view = <StudyGuide artistId={route[1]} />;
  else if (section === 'atlas') view = <Atlas />;
  else if (section === 'work' && route[1]) view = <Work key={route[1]} item={route[1]} />;
  else view = <Home />;

  return (
    <div className="shell">
      <nav className="sidebar">
        <a className="brand" href="#/">
          Art<span>guessr</span>
        </a>

        <ul className="nav">
          {NAV.map((item) => {
            const active = item.href === `#/${section}`;
            return (
              <li key={item.href}>
                <a href={item.href} className={active ? 'active' : ''}>
                  <span className="nav-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  {item.label}
                  {/* How many are left, so the entry doubles as the counter
                      for the "artists known" figure below. */}
                  {item.label === 'Unsolved' && unsolvedCount > 0 && (
                    <span className="badge">{unsolvedCount}</span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        <dl className="sidebar-stats">
          <div>
            <dt>Best streak</dt>
            <dd>{save.best}</dd>
          </div>
          <div>
            <dt>Artists known</dt>
            <dd>
              {Object.values(save.progress).filter((p) => p.right > 0).length}
              <span className="of"> / {ARTISTS.length}</span>
            </dd>
          </div>
        </dl>
      </nav>

      <main className="content">{view}</main>
    </div>
  );
}
