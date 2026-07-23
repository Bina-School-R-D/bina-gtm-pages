# priorities.md — bina-gtm-pages

## /esa — open data gaps (team input needed)

These were implemented with honest fallbacks; replace with real data when available:

- **Alabama exact 2026 application dates** — not in `ESA_State_Database.xlsx`. Card currently says "spring, exact dates TBC". Add when published.
- **Direct apply-page URLs for tier-4 states** — Indiana, Mississippi, Missouri, Ohio, Oklahoma, Tennessee, Wisconsin, Iowa, Kansas, North Carolina currently point to the program site / a search. Replace with the real parent application URL as we confirm each.
- **Step 4 "Enroll at bina" email flow** — copy says the admissions contact emails the parent everything (invoice, enrollment letter, accreditation). Confirm with the admissions team that this matches the real process and wording.
- **Per-state approval detail for tier-4 states** — currently generic ("timelines vary, we'll tell you on the call"). Enrich from the xlsx as those rows get filled in.

## Notes

- ESA data source of truth = `bina-gtm/notes/ESA_State_Database.xlsx`. Sync `src/data/esa-states.json` from it; never invent numbers or dates.
