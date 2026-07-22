// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Deployed to GitHub Pages behind the custom domain pages.thebinaschool.com.
// If the custom domain is ever removed, set base: '/bina-gtm-pages' as well.
export default defineConfig({
  site: 'https://pages.thebinaschool.com',
  trailingSlash: 'never',
  vite: {
    plugins: [tailwindcss()],
  },
});
