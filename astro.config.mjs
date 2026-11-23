// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import esaData from './src/data/esa-states.json' with { type: 'json' };

// The ESA pages moved to thebinaschool.com (Akis, 2026-11-23); the served states are redirect stubs
// in src/pages/esa/[state].astro. The other states had a page each until 2026-09-22 — links are
// still out there, so they go straight to the main site's /esa rather than 404.
const servedStates = new Set(esaData.programs.map((p) => p.s));
const MAIN_ESA = 'https://thebinaschool.com/esa';
const esaSlug = (name) => name.toLowerCase().replace(/\s+/g, '-');
const retiredStateRedirects = Object.fromEntries(
  esaData.allStates.filter((name) => !servedStates.has(name)).map((name) => [`/esa/${esaSlug(name)}`, MAIN_ESA])
);

// Deployed to GitHub Pages behind the custom domain go.bina.school.
// If the custom domain is ever removed, set base: '/bina-gtm-pages' as well.
export default defineConfig({
  site: 'https://go.bina.school',
  trailingSlash: 'never',
  // No homepage — the root bounces to the main site; old URLs stay alive.
  redirects: {
    '/': 'https://thebinaschool.com',
    '/esa-guide': MAIN_ESA,
    // /book-adventure was retired on 2026-11-09 and is not coming back (Akis, 2026-11-23); old links land on the homepage.
    '/book-adventure': 'https://thebinaschool.com',
    ...retiredStateRedirects,
  },
  // React only for the /families-map island (the component is shared with thebinaschool.com).
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
