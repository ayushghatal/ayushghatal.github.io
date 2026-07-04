import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Full site config lives here. Change `site` to your real domain before
// deploying — sitemap.xml, canonical URLs, and RSS all depend on it being
// correct, not the placeholder below.
export default defineConfig({
  site: 'https://example.com',
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      // Muted, warm-leaning dark theme — pairs well with the terracotta accent.
      theme: 'vitesse-dark',
      wrap: true,
    },
  },
});
