# priorities.md — bina-gtm-pages

## /esa — open items

- **Arizona quarterly cutoffs unverified** — `azed.gov` blocks automated fetches, so the Jun 1 / Sep 1 /
  Dec 1 / Mar 1 funding-quarter cutoffs are still the team-database figures. Confirm by hand with ADE.
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
