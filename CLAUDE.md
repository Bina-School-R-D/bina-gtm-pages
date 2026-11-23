# CLAUDE.md — bina-gtm-pages

Growth, marketing, and sales-enablement pages for bina, published at **https://go.bina.school**.
Akis and Lorraine describe the page they need; Claude Code builds it here.

## 🔴 TOP RULE — reply in short bullets, never a wall of text

- **Short bullets only.** No paragraphs, no prose blocks, no endless analysis. Outranks everything else here.
- **Show an example, don't explain.** Proposing a page? Give the section list + the 5 headline numbers — not an essay about the narrative.
- **Ceiling:** ~10 bullets normally, ~15 for a page-strategy answer. Over that, cut.
- **Tables beat bullets** for stat lists, page inventories, and option comparisons — use them.
- **Always end with:** actions I'll take + decisions I need from you. If neither, say "no action needed."

## Stack

- Astro 6 + Tailwind CSS v4 (static output). Same stack as thebinaschool.com and headerpath-website. Design tokens: see the Design rule below.
- `@astrojs/react` (v5 — v6+ needs Vite 8, which breaks the Tailwind plugin on Astro 6) exists only for the `/families-map` island. Don't use it for new widgets that plain `<script>` can handle.
- Hosted on **GitHub Pages**. `.github/workflows/deploy.yml` builds and deploys on every push to `main`.
- `public/CNAME` pins the custom domain — never delete it.
- **Tracking is a mirror of thebinaschool.com, set in `BaseLayout`** — GTM container `GTM-M2HWS5K` (CookieYes CMP + GA4 live inside it; loaded first-party via Stape Custom Loader `https://sgtm.thebinaschool.com/8bkryjbnrubr.js`, whose encoded id param replaces the GTM ID in the loader call), PostHog, and `public/attribution.js`, a port of the main site's file. **PostHog sends to the main project** (`366401`, key `phc_u3t5…`, the same as thebinaschool.com and start.bina.school) through the first-party proxy `https://e.thebinaschool.com`, with the shared tracking settings object in code and all inputs masked (bina-gtm `notes/prd-posthog-health.md`, 2026-11-14). The old dedicated project `578193` is test/preview only and keeps its history. **PostHog now waits for resolved CookieYes analytics consent**: the local gate loads the SDK only when the getter reports literal `true`, rechecks after async loading, and stops capture/replay on revocation. GTM keeps its deferred loader (after load + 5s, or first interaction); attribution.js keeps its existing deferred script. This supersedes the eager replay behavior for this local consent candidate. All three are host-gated to `*.thebinaschool.com` / `*.bina.school`, so local dev and previews stay out of the numbers. Re-extract from the live site if the main site's stack changes — don't invent a second setup.
- **Attribution contract:** `attribution.js` stores the *first* `utm_*` / `gclid` / `fbclid` / `ref` set it sees (localStorage, 365 days) and appends it to every `form.thebinaschool.com` and `start.bina.school` HTTP(S) link (any path) and the observed `https://thebinaschool.com/` homepage destination (query/hash preserved), both on load and again in the click capture phase. Other main-site paths and hosts are excluded. The 8 keys are the one list shared with the `start.bina.school` app (`bina-start-school` decision #56) — change both repos together. `scripts/check-attribution.mjs` asserts every decorated host and every lookalike that must stay clean. `localStorage` is per-origin, so a first touch captured on go.bina.school is only carried across by those URL params — which is why the params, not a cookie, are the mechanism. Partner links that must attribute through go.bina.school still need `?ref=` on the go.bina.school URL itself.

- **Consent release evidence and limits:** `docs/go-consent-proposal.json` is a historical offline proposal, not an importable GTM export. Go-only CookieYes EU/UK targeting and the five-cookie inventory were published and read back on September 22, 2026. The shared GTM hostname lookup was saved in workspace 57; a local candidate running that draft passed controlled banner/consent checks, including same-document Analytics withdrawal and regrant. At that observation, the website fix and GTM draft had not been published. Forced banner preview does not prove live geographic routing, and PostHog bot filtering prevented delivery proof. Check current Pages and GTM versions before asserting release status; see `docs/go-consent-handoff.md` for the release sequence and limits.

## 🔴 Design rule — bina Foundation (rebrand, November 2026)

**Source of truth:** the Figma bina Foundation Library, published as the *bina Foundation* design system: https://claude.ai/artifact/QCWK6m47YnCzuwQSem3cov. Assets (logos, landscapes, collages, people) are in the Notion **Brand Assets** library: https://app.notion.com/p/415a363fa1074cfc95c02c00f46b31fa. The old white/yellow/pink theme and the October dark palette (turquoise, cream) are **retired**: nothing from them carries over.

Tokens live in `src/styles/global.css`. Tailwind's default palette is **switched off** (`--color-*: initial`), so only bina colors generate classes.

| Token | Hex | Role |
|---|---|---|
| `primary-base` | `#1C1C1C` | Default dark background. **Never text.** |
| `black` | `#000000` | Text on light/bright backgrounds; cards on bright backgrounds |
| `mint` | `#D8F6C8` | **Replaces white** (and the old cream): body text on dark |
| `lagoon` | `#55EED4` | Primary accent (replaces the old turquoise) |
| `lemon` | `#FFE916` | CTA color |
| `grape` `#632AA8` · `deep-ocean` `#025EB9` · `sky-blue` `#78C0FE` · `tangerine` `#FF8A3D` · `watermelon` `#FF7A71` · `dragon-fruit` `#FE49C1` · `clover` `#64E27B` · `poppy` `#F24500` | | Palette accents / section backgrounds |
| `deco-white` | `#FFFFFF` | Decorative only (plate behind third-party logos). Never text, icons or the logo. |

**Rules**
- **No white.** Mint does every job white used to do.
- **Every text pairing passes WCAG 2.2 AA**, and only pairings listed in the library's "Text on background" table are allowed. Don't guess: check the table.
- **One theme per section: background + text + one highlight. Three colors max.** **Exception: a chart whose slices need telling apart** (the `/family-survey` priorities donut) uses lagoon, deep ocean, lemon, tangerine, dragon fruit in that order, with a legend that names every slice and figure (Zeyu, 2026-11-04). A section is a band from one background change to the next. Cards reuse those colors and never add a fourth. CTA buttons/blocks, decorative tags, imagery and the logo don't count.
- **Use the theme classes, not raw color pairs.** Each sets `--t-bg/--t-fg/--t-hl/--t-line/--t-solid-*`, and every component reads them:

| Class | Background / text / highlight |
|---|---|
| `theme-base` (default) | primary base / mint / lagoon |
| `theme-black` | black / mint / lagoon (nav + footer) |
| `theme-lagoon` | lagoon / black / grape |
| `theme-lemon` | lemon / black / grape (**secondary button only**) |
| `theme-mint` | mint / black / deep ocean |
| `theme-grape` | grape / mint / lemon |
| `theme-deep-ocean` | deep ocean / mint / mint (lemon for large text only) |
| `theme-sky-blue` `theme-clover` `theme-tangerine` `theme-watermelon` `theme-dragon-fruit` | bright / black / black cards carrying the background color |

- **Typography — the library's table, enforced by the tokens:** one family, **Rund Display**. Each `text-*` token carries its size, line height and weight, so don't add weight classes that fight it:

| Token | Size | Weight | Use |
|---|---|---|---|
| `text-display-lg/md/sm` | 88/72/64 | Bold | the one big statement; hero `h1` is `text-title-3xl sm:text-display-sm` |
| `text-title-4xl…md` | 48→24 | Bold | section `h2` = `text-title-xl sm:text-title-3xl`; big numbers = `text-title-4xl` |
| `text-title-sm` | 20 | SemiBold | card and step headings |
| `text-body-xl` | 18 | Regular | default body (set on `body`); review quote cards on `/esa/<state>` |
| `text-body-lg` | 16 | Regular | **minimum for any content text**: card text, notes, captions, tables, answers |
| `text-body-md` | 14 | Regular | footer and footer notes only |
| `text-label` | 14 | Bold, UPPERCASE, 10% tracking | every label and tag (see below) |
| `text-button-lg/sm` | 24/16 | Bold | buttons |

  **Nothing on any page is below 14px, at any screen width** (Zeyu, 2026-11-04). The library's label/lg (12px) is raised to 14px — **one exception: the state-card tags on `/esa` use label/lg at 12px (`text-label-sm`, Zeyu, 2026-11-04)**; `body-sm` and `label/md`/`label/sm` are not defined. Medium (500) is used for FAQ questions, the `/esa` state cards ("per child, per year", the text after "You pay:") (Zeyu, 2026-11-04/05).

### Page patterns (set on `/esa` and `/esa/<state>`, Zeyu 2026-11-04 — apply to every page)

| Element | Rule | Class / component |
|---|---|---|
| Section width | Every section shares one container and one left/right edge; all text left-aligned. **Exception: the closing CTA block is centered** (Zeyu, 2026-11-04). The footer is full width (see Footer). Narrow things get a `max-w-*` inside it. | `mx-auto max-w-5xl px-5` |
| Hero | Top line is an uppercase label in the section's text color (never a pill). One word of the `h1` may be colored — deep ocean, no underline (grape on sky blue, where deep ocean fails). No divider lines in the hero. | `eyebrow-line` |
| Labels | Eyebrows above headings, group labels, tags: uppercase, bold, letter-spaced, 14px. **`bina` stays lowercase inside an uppercase label** — wrap it. | `eyebrow-bina`, `pill-bina`, `label-bina`, `<BrandText text={…} />` or `<span class="normal-case">bina</span>` |
| Cards | **Always filled, never outlined** (two exceptions: the outlined chart panel under "Charts & tables", and the per-level result boxes inside the `/student-results` level picker — black outline, no fill, black text, Zeyu 2026-11-04). The fill comes from the section: mint card on dark, deep ocean card on mint, black card on lemon/lagoon/clover/tangerine/sky, mint card on deep ocean. Inside, `text-hl`, `pill-bina` and `border-line` switch to the card's colors. | `card-bina-solid` (`card-bina-mint` = the mint card with deep ocean name/number/tag and black body) |
| Stats | Big number + a one-line claim. Dark section, mint cards: deep ocean number, bold deep ocean claim, black detail line (`/student-results`, `/esa/<state>` proof). | `card-bina-mint` / `card-bina-solid` |
| Step lists | Mint section, deep ocean cards with mint text, big number left, mint tag with deep ocean text right, black group label above each group; any number/✓ badges in the section are deep ocean with mint (Zeyu, 2026-11-04). | `EsaProcess` |
| Charts & tables | No filled card around them — they sit on the section. On a dark section a chart may sit in a thin mint outline, with a dashed-mint vs solid-lagoon line pair, no fills, and its data table open below (lagoon uppercase headers, mint row lines) — `/student-results` growth curves (Zeyu, 2026-11-04). Bar charts are HTML horizontal bars on dark: lagoon bars, bold group label + student count on the left, lagoon value after the bar, true zero baseline — same at every width (`/student-results` tenure). On phones, a chart whose labels would drop under 14px gets an HTML bar-list or legend version below `md`. | — |
| Accordions / FAQs | Full-width rows, thin line under each, question in title-sm (20px) Medium, answer in body-lg (16px), "+" on the right that turns into "×". No cards, no accent bars. | `<Accordion items={[{q,a}]} />` |
| Number and check badges | Filled, never outlined: lagoon circle with a black number or ✓ on dark sections, deep ocean circle with mint on mint. | — |
| Notes | A note under a block starts with `*`, no box, no icon (lagoon on dark, black on light). A single highlighted fact is a check-line: filled circle + bold text. | — |
| Dividers | No decorative rules between blocks (hero checklist, closing section). Only list rows (accordions, tables, checklists) get lines. **Divider lines are a neutral color, never the accent:** mint on dark, black on light — never lagoon (Zeyu, 2026-11-05). Set by `--t-line`, so use `border-line`. | `border-line` |
| Links | **The bina Foundation 'Text link' guidelines (Zeyu, 2026-11-10):** every link is underlined (1px), in its surface's text color — mint on dark, black on light — or a highlight that passes 'Text on background' for its surface (lagoon in the footer and on 'Explore bina →'). **Exception: footer links have no underline at rest; it appears (3px) on hover.** **Hover thickens the underline to 3px; the color never changes and nothing fades** (replaces the Nov 6 fade). **SemiBold (`font-semibold`) for links that stand on their own** (card links, 'Apply on …'s site →', footer, 'See more'); **links inside running text keep the paragraph's weight** (FAQ answers, notes, in-step links, the calendar's 'Start your bina journey →'). Cards don't react to hover; only the link inside does. Set once in `global.css`, unlayered, so don't add `underline`/`decoration-*`/weight classes that fight it. Buttons keep the dragon-fruit hover, and so do links that set their own `hover:bg-*` fill (the `/reviews` rating tags). | global `a` rule + `font-semibold` |
| Buttons | Primary lemon / secondary black. **Responsive: Small on phones (16px label, 48px tall, 8px corners), Large from 640px (24px, 16px corners)** — the library's two sizes, nothing in between. `btn-sm` keeps the nav CTA small at every width. **Two side by side: secondary left, primary right.** One primary per section. Hover dragon fruit. **No arrows on buttons** (Zeyu, 2026-11-05); text links keep their →. | `btn-bina`, `btn-bina-secondary` |
| Inputs | Outlined in the card's line color, never white-filled; errors in a passing color (grape on mint). | `input-bina` |
| Closing CTA | Every page ends with one CTA block: a tangerine rounded block on the dark background, inside the content column, centered black heading + copy, lemon button (secondary left, primary right). Never a full-bleed colored band. | `<CtaBlock>` with `cta-title` / `cta-copy` / `cta-actions` |
| Nav | Full-width black bar, logo and CTA at the window edges (not in the content column). | `BaseLayout` |
| Footer | **The main site's grouped ("column") footer, in bina colors** (Zeyu, 2026-11-06). It mirrors the version on the thebinaschool.com stage branch `edit/zeyu/go-pages-design` (Akis asked for grouped columns; production still has the old flat list): tagline column + five groups (School · Join bina · Results & reviews · Guides · About bina), the legal links (Imprint · Privacy · Legal · Partner T&Cs) in one row with no divider line, the **peeking logo** (`public/images/peeking-logo.svg`) edge to edge at the bottom, and the lagoon "Follow us" rail fixed on the right **from 1120px only**, where the side margin is wide enough that it never covers content (stakeholder, 2026-11-09); the footer keeps 96px clear on the right there. The peeking logo loads eagerly (lazy loading left a blank band in full-page screenshots). Mint tagline (24px, 28px from 1280px), group titles and legal links; lagoon group links, SemiBold, **with no underline until hover** (`footer-link`; the 3px underline appears on hover — Zeyu, 2026-11-10); 16px links (18px from 1280px). 2 columns on phones, 3 from 640px, tagline + 5 from 1024px. Change the groups on the main site first, then mirror them here. A page's `footer-note` (e.g. the ESA disclaimer) sits above the logo. | `BaseLayout` |
- **Radii:** `rounded-lg` 16px, `rounded-sm` 8px. These are the only two the library defines.
- **Logo:** directly on black, primary base or a dark, calm area of a photo only. Anywhere else, use the black round/square container version. Never recolor, outline or stretch it. Favicon = the b mark on lagoon. The peeking logo goes only on the bottom edge of a layout, large.
- **Landscapes** sit on a colorful sky (never black/base), edge to edge at the bottom; they close a bright hero into a dark section. No text on the land.
- **Imagery of children:** never alone, faces covered in photos, diverse groups, nothing scary. See the library's "People" and "Collages" rules before adding any image.
- **Never invent a color, radius or type size.** If a design needs one that the library lacks, flag it. It has to be added in Figma and approved first.

## 🔴 Migration — go.bina.school → thebinaschool.com

These pages are moving to the main domain. Workflow: restyle here on a branch → preview → design approval → port each approved page to thebinaschool.com (via the `bina-website` skill / stage host) → redirect the go.bina.school URL to its new home. **Done for every page except `/families-map` (Akis, 2026-11-23)** — see "Moved to thebinaschool.com" under Pages. Keep `/esa/<state>` static-page rules, attribution and consent behavior intact through the move. Design passes are **visual only**: never change `src/lib/` logic, data values, the lead payload or tracking during a restyle.

**`/families-map` is excluded from the rebrand** (Zeyu, 2026-11-04): it will be redesigned separately. Leave its page, `src/components/BinaFamiliesMap/` and its pinned Rund Text fonts (`public/fonts/RundText-Regular/Medium/Bold.woff2`) exactly as they are until then.

## 🔴 Brand rule

The company name is always lowercase: `bina`, `bina school`, `thebinaschool.com`, `hello@thebinaschool.com`. Ages are **4–15**. Scan every page for capitalized `Bina` before shipping.

## 🔴 Page philosophy — tools, not essays

Pages are **interactive tools for families**, not long SEO pages. Short, task-focused, multi-step. The reader should feel they're doing a smooth process **with bina** — some steps just happen to occur on state/official websites. Plain language only: no jargon a newcomer wouldn't know ("universal eligibility", "award disbursement" → say who can apply, when money arrives). Assume the reader won't study any official website themselves.

## 🔴 Audience rule — every page is built for three readers at once

Every family-facing page must work for all three of these, at the same time. Assume the reader is one of them and never make the other two pay for it.

| Reader | What they consume | What they must leave with |
|---|---|---|
| **Scanners** | The hero, 4–5 big numbers, and the section headings. Nothing else. | "This is a great school." Never a feeling that they missed the real point by not reading on. |
| **Focused** | The above plus 2–3 lines under each heading. | The same belief, plus the reasoning behind it. |
| **OCDers** | Every word, every expander, every source link, every footnote. | Total confidence that nothing is overstated. One loose claim loses them, and they're the ones who convert hardest. |

**How that translates into markup:**

- **Every heading and big-number label is a complete claim that stands alone.** A metric label is a failure. Write "Parents would send their friends here" (9.42), not "out of 10 on 'would you recommend'". Test: extract all `<h1>`/`<h2>`s and the tile headings into a flat list — it should read as a coherent argument on its own. If a number needs the paragraph beneath it to mean anything, the heading is wrong.
- **Nothing essential below line 3 of any section.** Focused readers stop there. If a fact matters, it's in the heading or the first two lines.
- **Detail goes in `<details>` expanders, figure captions, and the methodology section** — never in the main flow where it taxes the other two readers. Charts, correlation tables, per-option breakdowns and source caveats all belong there.
- **Volunteer the caveat rather than hiding it.** Publishing our weakest score, the response rate, and the limits of a cited benchmark reads as more confident than omitting them, and it's the only thing that holds an OCDer.

**The dual goal — both, or the page has failed:**

1. **Believe this is a great school** — needs proof numbers: satisfaction, recommendation, outcomes, independent benchmarks.
2. **Picture themselves inside it** — needs projection content: second-person copy ("your week as a bina parent"), families like theirs, what a normal Tuesday looks like.

**Sort your stats by which goal they serve, and never let a projection stat open the page.** A projection stat describes who our families *are*; it says nothing about whether we're any good. `/family-survey` originally opened on "70% of our families have a child who doesn't fit a standard classroom" — true, and useless as proof, because a terrible school would report the same 70%. It only works chained to a quality number ("…and those are the families rating us 9.48 out of 10"). Lead with proof; use projection to make it personal.

## 🔴 Indexable variants are static pages, never query parameters

If a page has per-option content a family could be linked to or Google could rank — a state, a grade, a program — **every option gets its own real URL, server-rendered at build time**. Never a dropdown that swaps content behind `?state=`: a query-parameter variant is one page to a crawler, has one canonical, and gives the family nothing to share.

- One shared page component + `getStaticPaths()` over the data file. Never hand-write the per-option pages, and never fork the shared component per option.
- **A page per option we can serve — not per option that exists.** `/esa` covers the five states bina can accept, not all 50: a page we cannot honor is a worse answer than a redirect. Options that once had a page and no longer qualify redirect to the index (see the `/esa` retired-state redirects in `astro.config.mjs`) rather than 404.
- The picker stays, but its options carry the static URLs and selecting one is a navigation (`location.assign`), not a client-side render.
- Keep old `?option=` deep links alive with a small client-side `location.replace` to the static URL — compatibility only, never the primary path.
- Assert on the built HTML in `dist/`, not the source, and run the check inside `pnpm build`. (The `/esa` pages that set this pattern moved to thebinaschool.com on 2026-11-23; their guard `check-esa-static.mjs` went with them.)

## Adding a page

1. Create `src/pages/<slug>.astro` wrapped in `BaseLayout` (props: `title`, `description`, `noindex` for internal/sales pages).
2. Put page data (state tables, pricing, lists) in `src/data/<slug>.json` — never inline large datasets in markup.
3. Interactivity: plain `<script>` in the page for simple widgets; add a framework island only if genuinely needed.
4. List the page in the table below.
5. `pnpm build` must pass before committing.

There is no homepage — `/` redirects to thebinaschool.com (see `astro.config.mjs`).

## Campaign lead-gen pages — the standard pattern

Ad-hoc lead-gen campaign forms (Tally replacements) are a **standard page type**, not one-offs. The reference implementation was `/book-adventure`, **retired 2026-11-09** (no longer needed; `/book-adventure` now redirects to thebinaschool.com). Its page, data file and form test (`scripts/check-go-lead-event.mjs`) are in git history at `ac7a8fd`; restore them as the starting point for the next campaign page. Every new campaign page follows the pattern:

1. Multi-step wizard in one `card-bina-solid` (intro → contact → qualify → redirect), plain inline script, no framework island. Form fields use `.input-bina` (defined in `global.css`); access inputs via `form.elements` (`form.name` is the form's own attribute — a real bug otherwise).
2. On final submit, `navigator.sendBeacon` posts the lead to the shared n8n **`[S] A4. Campaign Intake`** webhook (`https://binaschool.app.n8n.cloud/webhook/s-a4-campaign-intake`) as a `text/plain` blob (avoids a CORS preflight; the workflow parses JSON from the raw body), then `location.assign`s the redirect — capture is fire-and-forget and must never block or break the redirect.
3. Payload contract: `{ campaign, submission_id, name, email, phone, child_name, age_group, redirect_url, page_url, referrer, utm_* }`. `campaign` = the page slug; `submission_id` = `${campaign}-${crypto.randomUUID()}` (the workflow's dedupe key). New campaigns reuse the same webhook — a new page needs **zero** n8n changes.
4. Anti-bot: off-screen honeypot input (`website`) — if filled, skip the beacon but still redirect.
5. Contact prefill: `?name=&email=&phone=` URL params pre-fill and skip the contact step (parity with Tally hidden fields).
6. Campaign pages are `noindex={true}`.

The receiving workflow lives in `bina-gtm` (`automations/workflows/`) — it writes to Close (note + task, review-flagged lead creation for new emails, no opportunity/nurture) and posts to Slack `#growth-log`. Changing the payload contract means a PR in **both** repos.

## Pages

**History:** the move was first shipped (#64) and rolled back (#65) on 2026-11-10 because the main-site pages weren't ready. They are live there now, so it was redone on 2026-11-23 (Akis) — see below.

| URL | Purpose | Data source |
|---|---|---|
| `/families-map` | **Standalone share page (investors)** — the families world map from the thebinaschool.com homepage section, on its own: heading + two-tab map, dark background, no nav/footer (`BaseLayout bare`), `noindex`, linked from nowhere. Moved here from `thebinaschool.com/families-map` (2026-10-30): stakeholder rule — non-marketing standalone pages live on go.bina.school so the main domain stays clean. | `src/components/BinaFamiliesMap/` — **verbatim copy** of the main site's `src/components/landing/BinaFamiliesMap/` (component + data); collages in `public/images/landing/map/`. Change the map on the main site first, then copy it here. |

### Moved to thebinaschool.com (Akis, 2026-11-23) — redirect stubs only

The pages stay live on the main site; edit them in its `website` repo, not here. Each file here is a `src/components/MovedPage.astro` stub: client redirect that keeps the query string and hash (`?ref=`, `utm_*`, `gclid`, `?state=`, `?signup=`, `#start-dates`), canonical to the new URL, `noindex`, meta-refresh fallback. `scripts/check-moved-pages.mjs` guards them in `pnpm build`. The footer links point straight at the main site.

| go.bina.school URL | Now at |
|---|---|
| `/esa` | `https://thebinaschool.com/esa` (handles legacy `?state=` itself) |
| `/esa/<state>` — the 7 in `esa-landing.json` (arizona, florida, idaho, new-hampshire, utah, west-virginia, wyoming) | `https://thebinaschool.com/esa/<state>` |
| every other `/esa/<state>` + `/esa-guide` | `https://thebinaschool.com/esa` (`astro.config.mjs`) |
| `/student-results`, `/family-survey`, `/reviews`, `/calendar` | same path on `https://thebinaschool.com` |
| `/book-adventure` | retired 2026-11-09, never coming back (Akis, 2026-11-23): bounces to the thebinaschool.com homepage |

- `src/data/*.json` and `src/lib/esa-states.js` stay: the `/local` draft (branch `claude/local-pages`) imports them, and the footer/nav CTA reads `esa-states.js`. Their `_openQuestions` still apply to anything built from them.

## Git workflow

- Branch from `main` → PR → merge. **Never push directly to `main`** (the initial scaffold was the only exception).
- Merging to `main` deploys to GitHub Pages automatically.
- Public marketing pages are indexable by default; sales-enablement/internal pages get `noindex={true}`.

## Content rules

- Factual claims about external programs (ESA amounts, deadlines, regulations) must carry a "verify with the official source" disclaimer and link to the official program.
- **Every page's header button and closing CTA is `Start your bina journey` → `https://form.thebinaschool.com/new`**, the main site's own header button (stakeholder, 2026-11-09). It is the `BaseLayout` default and `CTA` / `CTA_LABEL` in `src/lib/esa-states.js`; don't invent a page-specific label. Campaign pages are the exception: a campaign page captures the lead itself. (The paid-search `/esa/<state>` landing pages sent every CTA to **`https://form.thebinaschool.com/new`** labelled **`Start your bina journey →`**, matching the main site's own conversion action — Akis, 2026-08-21. Those pages were replaced by the static state pages; reuse that CTA if paid-search landing pages come back.) `BaseLayout` keeps any `?ref=` from the current URL for 365 days and appends it to form links, `start.bina.school` links and the HTTPS main-site homepage, extending the partner-attribution snippet on the main site (`bina-gtm/notes/partner-program-technical-plan.md` §4); `localStorage` is per-origin, so partner links routed through go.bina.school must carry `?ref=` on the go.bina.school URL itself.
- CTA email is `admissions@thebinaschool.com` — these pages talk to prospective and current families, so email CTAs go to admissions, not the general `hello@` inbox. Main-site links go to `https://thebinaschool.com`.

### Publishing our own data (surveys, results, outcomes)

The OCDer reader is the one we lose permanently if a number is soft, so pages built on bina's own data follow these:

- **Never combine two different surveys or cohorts into one figure.** Label which survey every number came from, on the page itself.
- **Charts get an honest axis.** Bars on a 0–10 rating run the full 0–10; no cropped baselines to inflate a gap. Put the weakest score in the same chart as the best.
- **Disclose the response rate and self-selection bias** in the methodology section, not buried in the footer.
- **Never state a formula you haven't verified.** If a metric's derivation is unconfirmed, use a metric you *can* describe (`/family-survey` swapped an unverifiable FSI 9.5 for overall satisfaction 9.48 — costing 0.02 and closing the hole) rather than shipping a plausible guess.
- **Don't assert what a survey question measured** unless the wording is confirmed. Write copy that holds true either way.
- **No causal claims from correlational data** ("clubs increase retention" when the source attributes it to engagement).
- **Cite external benchmarks precisely, and only for what they actually say.** Include the sample size, link out, and never extrapolate a figure the source doesn't publish.
- **Track unverified claims in an `_openQuestions` array** in the page's JSON so the next session sees them before editing.
- No individual student or family data, ever. Aggregates only, and suppress groups too small to report.
