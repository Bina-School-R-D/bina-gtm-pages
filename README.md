# bina-gtm-pages

Growth, marketing, and sales-enablement pages for [bina](https://thebinaschool.com), published at **https://go.bina.school** via GitHub Pages.

- Astro 6 + Tailwind v4, design tokens extracted from thebinaschool.com (`src/styles/global.css`).
- Push to `main` → `.github/workflows/deploy.yml` builds and deploys.
- Workflow and page conventions: see `CLAUDE.md`.

```sh
pnpm install
pnpm dev      # local dev
pnpm build    # must pass before committing
```
