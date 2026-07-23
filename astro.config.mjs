// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Deployed to GitHub Pages behind the custom domain go.bina.school.
// If the custom domain is ever removed, set base: '/bina-gtm-pages' as well.
export default defineConfig({
  site: 'https://go.bina.school',
  trailingSlash: 'never',
  // No homepage — the root bounces to the main site; old URLs stay alive.
  redirects: {
    '/': 'https://thebinaschool.com',
    '/esa-guide': '/esa',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
