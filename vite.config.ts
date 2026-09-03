import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // The main chunk is mostly data, not code: artworks, short bios and museum
    // labels (src/data/*.json), all of which the game needs up front — ~240kB
    // gzipped. The two genuinely deferrable pieces already are: Leaflet via
    // LazyMap, and the long-form text via useLongform.
    chunkSizeWarningLimit: 900,
  },
});
