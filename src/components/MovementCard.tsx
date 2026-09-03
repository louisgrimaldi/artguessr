import { artistByName, shortName } from '../game';
import { eraLabel } from '../data/era';
import type { Movement } from '../data/movements';
import Face from './Face';

interface Props {
  movement: Movement;
  /** Omit this artist from the peer list — they're the subject of the card. */
  exclude?: string;
  /** Fuller account, shown on study pages but not in the quick reveal panel. */
  longText?: string;
}

/**
 * A movement summarised: era, one-line character, and its leading figures with
 * faces. Peers who are playable artists link through to their own page.
 */
export default function MovementCard({ movement, exclude, longText }: Props) {
  const peers = movement.keyArtists.filter((name) => name !== exclude);

  return (
    <div className="movement">
      <h3>
        {movement.name} <span className="movement-era">{eraLabel(movement.years)}</span>
      </h3>
      <p>{movement.blurb}</p>

      {longText && <p className="movement-long">{longText}</p>}

      {peers.length > 0 && (
        <>
          <p className="peers-label">Also central</p>
          <ul className="peers-faces">
            {peers.map((name) => {
              const artist = artistByName(name);
              const face = <Face name={name} artistId={artist?.id} size={36} />;
              return (
                <li key={name}>
                  {artist ? (
                    <a href={`#/study/${artist.id}`} title={name}>
                      {face}
                      <span>{shortName(name)}</span>
                    </a>
                  ) : (
                    <span className="peer-static" title={name}>
                      {face}
                      <span>{shortName(name)}</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
