# CLAUDE.md — bina-gtm-pages

Growth, marketing, and sales-enablement pages for bina, published at **https://go.bina.school**.
Akis and Lorraine describe the page they need; Claude Code builds it here.

## Stack

- Astro 6 + Tailwind CSS v4 (static output). Same stack as thebinaschool.com and headerpath-website.
- Hosted on **GitHub Pages**. `.github/workflows/deploy.yml` builds and deploys on every push to `main`.
- `public/CNAME` pins the custom domain — never delete it.

## 🔴 Design rule — every page must look like thebinaschool.com

- Tokens live in `src/styles/global.css` (`@theme`): Rund Display (headings), Rund Text (body), coal blacks, chromatic accents (`bina-grass`, `bina-yellow`, `bina-purple`, `bina-pink`, `bina-blue`, `bina-green`, `bina-red`, `bina-orange`).
- House style: white background, black text, chunky `border-2 border-coal-black`, large radii (`card-bina` = 30px corners), yellow CTA that hovers pink and presses red (`btn-bina`), black pills with chromatic text (`pill-bina`).
- Fonts are self-hosted in `public/fonts/` (copied from the live site — same company, licensed).
- If the main site rebrands, re-extract tokens from the live site; don't invent new ones.

## 🔴 Brand rule

The company name is always lowercase: `bina`, `bina school`, `thebinaschool.com`, `hello@thebinaschool.com`. Ages are **4–15**. Scan every page for capitalized `Bina` before shipping.

## 🔴 Page philosophy — tools, not essays

Pages are **interactive tools for families**, not long SEO pages. Short, task-focused, multi-step. The reader should feel they're doing a smooth process **with bina** — some steps just happen to occur on state/official websites. Plain language only: no jargon a newcomer wouldn't know ("universal eligibility", "award disbursement" → say who can apply, when money arrives). Assume the reader won't study any official website themselves.

## Adding a page

1. Create `src/pages/<slug>.astro` wrapped in `BaseLayout` (props: `title`, `description`, `noindex` for internal/sales pages).
2. Put page data (state tables, pricing, lists) in `src/data/<slug>.json` — never inline large datasets in markup.
3. Interactivity: plain `<script>` in the page for simple widgets; add a framework island only if genuinely needed.
4. List the page in the table below.
5. `pnpm build` must pass before committing.

There is no homepage — `/` redirects to thebinaschool.com (see `astro.config.mjs`).

## Pages

| URL | Purpose | Data source |
|---|---|---|
| `/esa` | ESA funding tool for parents — pick a state, get the exact bina + state steps | `src/data/esa-states.json`, synced from `bina-gtm/notes/ESA_State_Database.xlsx` (the team's ESA database — never invent numbers; update the xlsx-derived JSON instead) |

## Git workflow

- Branch from `main` → PR → merge. **Never push directly to `main`** (the initial scaffold was the only exception).
- Merging to `main` deploys to GitHub Pages automatically.
- Public marketing pages are indexable by default; sales-enablement/internal pages get `noindex={true}`.

## Content rules

- Factual claims about external programs (ESA amounts, deadlines, regulations) must carry a "verify with the official source" disclaimer and link to the official program.
- CTA email is `admissions@thebinaschool.com` — these pages talk to prospective and current families, so email CTAs go to admissions, not the general `hello@` inbox. Main-site links go to `https://thebinaschool.com`.
