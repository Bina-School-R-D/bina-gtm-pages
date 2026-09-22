// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import esaData from './src/data/esa-states.json' with { type: 'json' };

// ESA pages exist only for states where bina can accept students (Akis, 2026-09-22). The other
// 45 states had a page each until then, so they redirect to /esa rather than 404 — links are
// already out there. Generated from the data so a new approval only needs a `programs` entry.
const servedStates = new Set(esaData.programs.map((p) => p.s));
const esaSlug = (name) => name.toLowerCase().replace(/\s+/g, '-');
const retiredStateRedirects = Object.fromEntries(
  esaData.allStates.filter((name) => !servedStates.has(name)).map((name) => [`/esa/${esaSlug(name)}`, '/esa'])
);

// Deployed to GitHub Pages behind the custom domain go.bina.school.
// If the custom domain is ever removed, set base: '/bina-gtm-pages' as well.
export default defineConfig({
  site: 'https://go.bina.school',
  trailingSlash: 'never',
  // No homepage — the root bounces to the main site; old URLs stay alive.
  redirects: {
    '/': 'https://thebinaschool.com',
    '/esa-guide': '/esa',
    ...retiredStateRedirects,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
