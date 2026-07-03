// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://leovoon.github.io',
  integrations: [react()],
  vite: {
    optimizeDeps: {
      exclude: ['@electric-sql/pglite'],
    },
  },
});
