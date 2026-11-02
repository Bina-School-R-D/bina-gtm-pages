# priorities.md — bina-gtm-pages

## /esa — open items

- **Wyoming 2027–28 dates not published** — WDE has announced nothing. The page says so and points at
  early July 2027 based on the 2026–27 cycle. Replace with real dates the day they land.
- **Re-verify all five application windows each August**, before the next cycle opens. Per-state
  provenance for the current dates is in `src/data/esa-states.json` under `_dates`.
- **Step 4 "Enroll at bina" email flow** — copy says the admissions contact emails the parent everything
  (invoice, enrollment letter, accreditation). Confirm with the admissions team that this matches the
  real process and wording.
- **The 45 retired state redirects are indefinite.** They exist because PR #36 briefly published a page
  per state. Once those URLs are out of Google and off any live link, the redirect block in
  `astro.config.mjs` and `allStates` in `esa-states.json` can both go. Review in ~6 months.

## /esa — competitive teardown + merge (2026-10-29)

Full write-up: Notion → Growth → [ESA Pages — Competitive Teardown & Recommendations (Oct 2026)](https://app.notion.com/p/408a520a69f38128a901d13817291d34).
Nothing below is built yet — change queue, build only on "apply changes".

**Open decisions (Akis)**
- Canonical home for the merged ESA hub — recommended `thebinaschool.com/esa`, built from go's content
  (go is being retired, decision #71). The other domain redirects.
- Class size: main site says "8 kids max", go says "average 6–8, cap 12". One number everywhere.
- Allow a secondary "Book an ESA call" CTA next to `Visit bina`? (Today: main-site CTA only.)
- Source of our ClassWallet / Odyssey listing names, vendor IDs and Cognia ID.
- Which S/O rows below to queue.

**Fix before the merge — main site contradicts go**
- `/esa/arizona` step 1 says "notice of intent… homeschool". Wrong: the real path is the state ESA portal → ClassWallet.
- FAQ says "zero tuition cost" (the remainder is $231–314/mo). 5 of 7 FAQ answers are empty in the served HTML.
- `/esa/new-hampshire`, `/utah`, `/idaho` (any slug) return 200 with the homepage — soft 404s.
- Duplicate `<title>` and canonical tags (www vs non-www) on `/esa` and `/esa/arizona`.
- go: `[state].astro` reuses chooser copy ("settled in these five states") — make it state-specific.
- go: no `sitemap.xml` (404) and no og:image.

**State pages — S1–S10**
- S1 "Approved ESA school" hero badge + exact ClassWallet/Odyssey listing name (Acellus, GT Anywhere, Bridgeway).
- S2 Visible "Facts checked on [date]" per state, from `_dates` in `esa-states.json` (Sora, Outschool).
- S3 FAQPage + EducationalOrganization + BreadcrumbList JSON-LD (Legacy, Brilliant, Laurel).
- S4 "You and bina must both be approved — apply for both at the same time" (Sora, Laurel).
- S5 "What we do / don't do for your application" (Brilliant).
- S6 Real "Book a 15-min ESA call" link — needs the CTA decision (Bridgeway, Novatio, Sora).
- S7 Portal walkthrough with screenshots, or a 1-page PDF per state (Outschool, Bridgeway, Prenda).
- S8 A parent quote about the ESA process itself — needs Family Success (Sora).
- S9 "Enter your award → see your monthly remainder" calculator (nobody has it).
- S10 Rewrite the shared copy per state (see the bug above).

**Overview — O1–O6**
- O1 Proof numbers on `/esa`, imported from the existing data files.
- O2 "What you pay after ESA" on each state card (Primer).
- O3 Name the big other states and why we can't take them, e.g. TX, FL, AR (Sora).
- O4 Cross-state FAQ + FAQPage schema.
- O5 Cognia accreditation ID next to the badges (Brilliant).
- O6 One canonical domain, redirects, soft-404 fixes.

**Positioning:** Novatio and K12 claim "$0 in Arizona". Our page must state the $231–314/mo remainder
up front and justify it (class size, results, reviews).

**Next:** Part 2 — compare competitors' ESA blog posts with ours.

## SEO data — Search Console + Semrush (2026-10-29)

- **Search Console = our real numbers** (clicks, impressions, position, CTR per URL and query), free.
  **Semrush = market data only** (volumes, difficulty, competitor rankings, keyword gaps, AI Overview,
  backlinks) — its traffic is modelled and near zero for a small subdomain. GA4/PostHog = conversions.
- **Chosen setup:** Search Console + Semrush MCP (`https://mcp.semrush.com/v2/mcp`). Skip the Trends API (separate paid plan).
- **Budget (Akis): stay within the ~$200/month plan.** Pro/Guru include 50k API units per cycle, usable via the MCP.
  Cost = rows returned × units per row; units are part of the plan, not dollars.
  - Month 1 setup ≈ 47k: our pages' keywords + history (7.4k), 15 competitor URLs (7.5k), top 10 for
    30 terms (3k), volume for 200 terms (2k), difficulty for 100 (5k), keyword gap 200 rows (16k),
    questions for 5 topics (6k).
  - Monthly refresh ≈ 15.5k (our pages, competitor URLs, top 10), leaving ~34k for new research.
  - Check the unit balance after every pull — never exceed the plan.
- **Blockers:** confirm the Semrush plan (Pro, Guru or Semrush One); connect the MCP
  (`claude mcp add semrush https://mcp.semrush.com/v2/mcp -t http`, then `/mcp`); Search Console access for
  thebinaschool.com and go.bina.school.
- **Then:** add an "SEO performance" section to the Notion teardown page.

## Upstream corrections owed to other teams (not this repo's to fix)

- `thebinaschool.com` still says ESA funding "covers tuition in full" for Utah, Arizona and Wyoming. It
  does not — the largest base award is $8,000 against $10,769 yearly tuition.
- `thebinaschool.com`'s homepage still names only Utah, Arizona and Wyoming. Five states are live.
- `bina-gtm/notes/ESA_State_Database.xlsx` never got the Wyoming and New Hampshire approvals, and still
  has New Hampshire as income-capped — the 350% FPL cap was removed by SB 295 in 2025.

## Notes

- ESA data source of truth = `bina-gtm/notes/ESA_State_Database.xlsx`. Sync `src/data/esa-states.json`
  from it; never invent numbers or dates.
- A state becomes a page the day its approval lands — never while it is pending. Add it to `programs` in
  `esa-states.json` and to `states` in `esa-landing.json`; the redirect for it disappears automatically.
