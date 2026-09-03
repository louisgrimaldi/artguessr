import { Suspense, lazy } from 'react';
import type { Pin } from '../types';

/**
 * Leaflet is ~180kB gzipped, and only two views need it, so it's split out of
 * the main bundle and fetched on demand.
 */
const WorksMap = lazy(() => import('./WorksMap'));

interface Props {
  pins: Pin[];
  showArtist?: boolean;
  height?: number;
}

export default function LazyMap({ pins, showArtist, height = 380 }: Props) {
  if (pins.length === 0) return null;
  return (
    <Suspense
      fallback={
        <div className="map-wrap">
          <div className="map map-loading" style={{ height }}>
            Loading map…
          </div>
        </div>
      }
    >
      <WorksMap pins={pins} showArtist={showArtist} height={height} />
    </Suspense>
  );
}
