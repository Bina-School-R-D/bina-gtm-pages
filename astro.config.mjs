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
    // Vite's dev-server Host header check blocks unrecognized hosts by default (DNS-rebinding
    // protection). Allow ngrok's free-tier subdomains so the dev server can be tunneled for
    // sharing previews — dev-only, has no effect on `astro build`/production.
    server: {
      allowedHosts: ['.ngrok-free.dev'],
    },
  },
});
