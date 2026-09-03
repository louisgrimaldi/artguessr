import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Pin } from '../types';

/**
 * CARTO's label-light basemaps, which sit under the artwork pins without
 * shouting. Two URLs so the map follows the app's light/dark theme.
 */
const TILES = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
};
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>';

function prefersDark(): boolean {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === 'dark') return true;
  if (explicit === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

interface Props {
  pins: Pin[];
  /** Show which artist each pin belongs to — useful on the all-artists map. */
  showArtist?: boolean;
  height?: number;
}

export default function WorksMap({ pins, showArtist = false, height = 380 }: Props) {
  const holder = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!holder.current || pins.length === 0) return;

    const instance = L.map(holder.current, {
      // Scroll should page the document, not zoom the map out from under you.
      scrollWheelZoom: false,
      worldCopyJump: true,
    });
    map.current = instance;

    L.tileLayer(prefersDark() ? TILES.dark : TILES.light, {
      attribution: ATTRIBUTION,
      maxZoom: 18,
      subdomains: 'abcd',
    }).addTo(instance);

    // Vector markers rather than Leaflet's default icon, which relies on image
    // assets resolved via CSS and breaks under bundling.
    const accent =
      getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#7a1f1f';

    const group = L.featureGroup(
      pins.map((pin) => {
        const marker = L.circleMarker([pin.lat, pin.lon], {
          radius: 6,
          color: accent,
          weight: 2,
          fillColor: accent,
          fillOpacity: 0.55,
        });
        const lines = [
          `<strong>${escapeHtml(pin.title)}</strong>`,
          showArtist ? escapeHtml(pin.artist) : null,
          `${escapeHtml(pin.place)}${pin.year ? ` · ${pin.year}` : ''}`,
        ].filter(Boolean);
        marker.bindPopup(`<div class="pin">${lines.join('<br>')}</div>`);
        return marker;
      }),
    ).addTo(instance);

    const bounds = group.getBounds();
    if (bounds.isValid()) {
      instance.fitBounds(bounds, { padding: [36, 36], maxZoom: 6 });
    }

    return () => {
      instance.remove();
      map.current = null;
    };
  }, [pins, showArtist]);

  if (pins.length === 0) return null;

  return (
    <div className="map-wrap">
      <div className="map" style={{ height }} ref={holder} />
      <p className="map-note">
        {pins.length} located work{pins.length === 1 ? '' : 's'} · scroll-zoom is off, use the +/−
        controls
      </p>
    </div>
  );
}
