// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Where the site is served from.
 *
 * GitHub Pages serves a repository named `<owner>.github.io` at the domain root,
 * and any other repository at `https://<owner>.github.io/<repo>/`.
 *
 *   - Project site (current):   SITE_URL=https://dialoginteractiveintelligence.github.io  SITE_BASE=/dialog.github.io
 *   - Org/user site:            SITE_URL=https://dialoginteractiveintelligence.github.io  SITE_BASE=/
 *   - Custom domain:            SITE_URL=https://www.example.org                          SITE_BASE=/
 *
 * Both values can be overridden with environment variables (see .github/workflows/deploy.yml),
 * so moving the site later is a one-line change here or in the workflow.
 */
const SITE_URL = process.env.SITE_URL ?? 'https://dialoginteractiveintelligence.github.io';
const SITE_BASE = process.env.SITE_BASE ?? '/dialog.github.io';

export default defineConfig({
  site: SITE_URL,
  base: SITE_BASE,
  trailingSlash: 'always',
  // JSX-style whitespace: line breaks between elements are dropped, so inline
  // lists (authors, link pills) render without stray spaces. Add {' '} where a
  // space between two elements on different lines is intended.
  compressHTML: 'jsx',
  build: {
    format: 'directory',
  },
  markdown: {
    // Plain code blocks styled by global.css instead of a dark syntax theme.
    syntaxHighlight: false,
  },
  integrations: [
    sitemap({
      // Feeds and machine-readable files are linked from <head>/robots.txt; keep them out of the sitemap.
      filter: (page) => !/\/(rss\.xml|llms(-full)?\.txt|publications\.bib|404)\/?$/.test(page),
    }),
  ],
});
