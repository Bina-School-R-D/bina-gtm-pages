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

## Campaign lead-gen pages — the standard pattern

Ad-hoc lead-gen campaign forms (Tally replacements) are a **standard page type**, not one-offs. `/book-adventure` is the reference implementation. Every new campaign page follows it:

1. Multi-step wizard in one `card-bina` (intro → contact → qualify → redirect), plain inline script, no framework island. Form fields use `.input-bina` (defined in `global.css`); access inputs via `form.elements` (`form.name` is the form's own attribute — a real bug otherwise).
2. On final submit, `navigator.sendBeacon` posts the lead to the shared n8n **`[S] A4. Campaign Intake`** webhook (`https://binaschool.app.n8n.cloud/webhook/s-a4-campaign-intake`) as a `text/plain` blob (avoids a CORS preflight; the workflow parses JSON from the raw body), then `location.assign`s the redirect — capture is fire-and-forget and must never block or break the redirect.
3. Payload contract: `{ campaign, submission_id, name, email, phone, child_name, age_group, redirect_url, page_url, referrer, utm_* }`. `campaign` = the page slug; `submission_id` = `${campaign}-${crypto.randomUUID()}` (the workflow's dedupe key). New campaigns reuse the same webhook — a new page needs **zero** n8n changes.
4. Anti-bot: off-screen honeypot input (`website`) — if filled, skip the beacon but still redirect.
5. Contact prefill: `?name=&email=&phone=` URL params pre-fill and skip the contact step (parity with Tally hidden fields).
6. Campaign pages are `noindex={true}`.

The receiving workflow lives in `bina-gtm` (`automations/workflows/`) — it writes to Close (note + task, review-flagged lead creation for new emails, no opportunity/nurture) and posts to Slack `#growth-log`. Changing the payload contract means a PR in **both** repos.

## Pages

| URL | Purpose | Data source |
|---|---|---|
| `/esa` | ESA funding tool for parents — pick a state, get the exact bina + state steps | `src/data/esa-states.json`, synced from `bina-gtm/notes/ESA_State_Database.xlsx` (the team's ESA database — never invent numbers; update the xlsx-derived JSON instead) |
| `/student-results` | Academic-outcomes page for prospective parents — STAR results, growth curves, per-level picker. Every CTA points at thebinaschool.com (we want form submissions, not inbound email), so this page deliberately has no `mailto:` links. | `src/data/student-results.json`, aggregated from the CSO's STAR dashboard (Oct '25–May '26). Aggregates only, N<10 suppressed, no student names ever. Level→age labels are inferred, not from STAR — see `_ageNote`. |
| `/book-adventure` | Campaign lead-gen page (replaces Tally `NpBVq0`) — book a bina Adventure class: intro → contact → child + age group → redirect to the age group's cal.com booking link with `?name=&email=`. Captures the lead via the Campaign Intake webhook (see pattern above). | `src/data/book-adventure.json` (copy + age-group → cal.com URL map, extracted from the Tally form config) |

## Git workflow

- Branch from `main` → PR → merge. **Never push directly to `main`** (the initial scaffold was the only exception).
- Merging to `main` deploys to GitHub Pages automatically.
- Public marketing pages are indexable by default; sales-enablement/internal pages get `noindex={true}`.

## Content rules

- Factual claims about external programs (ESA amounts, deadlines, regulations) must carry a "verify with the official source" disclaimer and link to the official program.
- CTA email is `admissions@thebinaschool.com` — these pages talk to prospective and current families, so email CTAs go to admissions, not the general `hello@` inbox. Main-site links go to `https://thebinaschool.com`.
