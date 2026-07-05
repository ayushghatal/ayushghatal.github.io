import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Full site config lives here. Change `site` to your real domain before
// deploying — sitemap.xml, canonical URLs, and RSS all depend on it being
// correct, the placeholder below.
export default defineConfig({
  site: 'https://example.com',
  output: 'server',
  adapter: vercel({ mode: 'serverless' }),
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      // Muted, warm-leaning dark theme — pairs well with the terracotta accent.
      theme: 'vitesse-dark',
      wrap: true,
    },
  },
});
