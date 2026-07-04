import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// Full site config lives here. Change `site` to your real domain before deploying
// (needed for correct canonical URLs / sitemaps if you add them later).
export default defineConfig({
  site: 'https://example.com',
  integrations: [mdx()],
  markdown: {
    shikiConfig: {
      // Muted, warm-leaning dark theme — pairs well with the terracotta accent.
      theme: 'vitesse-dark',
      wrap: true,
    },
  },
});
