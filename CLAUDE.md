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
| `/family-survey` | Family-satisfaction page for prospective parents — what current families say about bina. **The reference implementation of the three-audience rule above**: read it before building any new proof-led page. Leads on the quality claim (9.42/10 recommendation, NPS 80), publishes all seven dimension scores including the weakest, and uses the "70% of our families don't fit a standard classroom" stat for projection only, chained to a quality number. | `src/data/family-survey.json`, from the Growth team's "Family Survey Results + Insights" deck. **Two separate surveys — whole-school n=103 and middle-school n=108 — that must never be combined or summed.** Aggregates only. `_openQuestions` in the JSON tracks unverified claims; read it before editing. NPS bands cited to ISM — the source publishes no "average school NPS", so never claim one. |
| `/reviews` | Wall-of-love page — every review of bina in one place, plus links to every platform where families rate us. Reviews are copied **verbatim** and by hand; the page asserts only what the source states (Niche 5.0/5, world-schools 5.0/5) and links Trustpilot without quoting a score, because Trustpilot blocks automated reading. Survey figures are imported from `family-survey.json`, never re-typed. | `src/data/reviews.json` — 20 Niche reviews (15 parent, 5 staff, dated) + 6 permissioned testimonials from thebinaschool.com. `_openQuestions` lists what is unverified (Trustpilot text/score, the uncopied world-schools review, the write-a-review URL). Facebook is excluded on purpose: 0 reviews. Upstream registry: the Growth team's **Testimonial Management System v2** in Notion (57 rows) — only rows at `✅ Approved to Share` may be published here; `🔒 Needs Retrieval` and `🟡 Needs Permission` rows are Family Success's to clear first, never the page's to publish. Owning task: Asana `1216065802114937`. |

## Git workflow

- Branch from `main` → PR → merge. **Never push directly to `main`** (the initial scaffold was the only exception).
- Merging to `main` deploys to GitHub Pages automatically.
- Public marketing pages are indexable by default; sales-enablement/internal pages get `noindex={true}`.

## Content rules

- Factual claims about external programs (ESA amounts, deadlines, regulations) must carry a "verify with the official source" disclaimer and link to the official program.
- **Primary CTA on every family-facing page is the main site's own CTA — `Start your bina journey →` to `https://form.thebinaschool.com/new`.** These pages stand in for thebinaschool.com, so the conversion action must match it exactly; don't invent a page-specific one. `BaseLayout` keeps any `?ref=` from the current URL for 365 days and appends it to every `form.thebinaschool.com` link, mirroring the partner-attribution snippet on the main site (`bina-gtm/notes/partner-program-technical-plan.md` §4). `localStorage` is per-origin, so partner links that should attribute through go.bina.school must carry `?ref=` on the go.bina.school URL itself.
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
