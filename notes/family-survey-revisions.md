# /family-survey — revision round 2

Feedback from Akis, 2026-08-10. **Not yet implemented.** More to come before we build.

Live page: https://go.bina.school/family-survey

---

## Global changes

1. **Add `/10` to every rating number**, in small type next to the figure — `9.42/10`, not `9.42`. A bare `9.42` doesn't make sense on its own.
2. **Remove the 44% response rate from everywhere in the body.** 103 families is a big sample on its own; the response rate invites doubt we don't need. (Exception: it may live once at the bottom — see #3.)
3. **Remove the phrase "Whole-school family survey" from every caption.** Instead, put the sample size, the response rate, and the fact it was whole-school **once at the bottom of the page**, for the detail readers.

---

## Section-by-section

### Scorecard bars — "Here is every score we asked about"

- **Make all bars green.** Belonging is currently yellow, which singles it out as a failure.
- **Add a vertical line at the 8.0 mark** cutting across all bars.
- Goal: make it visually obvious that **everything is 80%+**, which is an excellent result. Right now the eye goes to the one different-coloured bar instead of to how high they all are.

### That section's intro copy — too defensive

- Current: *"The bars run the full width of the scale, so nothing is flattered by a cropped axis, and our weakest score sits in the same chart as our best."*
- **Too much fear text.** Just say how we calculated it. Don't write copy that presumes they distrust us.

### Hero

- Current headline is **too complex English**: *"bina families rate us 9.42 out of 10 on whether they'd recommend us"*
- Requested: **"9.42 of 10 families at bina recommend us."**
- ⚠️ **Accuracy flag — needs resolving before build.** These say different things. 9.42/10 is the *average rating* families gave on the recommend question; it is **not** a count of how many families recommend us. As written, the new line claims something the data doesn't show. Need an equally simple line that stays true — see Open questions.

### The four stat tiles

- **Cut the 9.42 tile** ("Parents would send their friends here" / "average answer to 'would you recommend bina to another family', out of 10") — it's already the hero.
- Leaves three tiles; decide whether to run 3-up or bring in a replacement fourth.

### "The two scores we'd stake the school on" (9.55 heard / 9.53 joy)

- **Repetitive, not value-add.** Both numbers already appear in the tiles above. Cut or replace with something that adds new information.

### "What do bina parents say matters most for their child's future?" (currently inside an expander)

- **Make it bigger** — promote it out of the expander.
- Reframe: this is **not a decision factor** for a parent. It's an **inclusion factor** — the thing they care about turns out to be the thing families like them also care about.

### The 70% — "You wouldn't be the odd one out here"

- **Nice but hard to reach.** Find a better way to frame it.
- Again: **inclusion, not "bina is better".** It shouldn't read as a comparative claim.
- **Summarise the small print.** Currently: *"69.9% — 38.8% said 'some differences, nothing formal' and 31.1% said their child needs support beyond standard education."*
  - Don't spell out the full breakdown. Just say that within that 70% there are **some families whose children need additional support**, and **many families who simply realised their child could learn better in a different environment**.

### "Your week as a bina parent" (65% weekly / 55% daily / 3% hands-off)

- **Problem: it makes every parent who doesn't want that intensity feel excluded.**
- Rebuild it to show a **balance** between families who want intense communication and engagement, and families who want something more relaxed.
- Message: **we support both. We're here for whatever level you want.**
  - The demanding parent sees this and feels satisfied.
  - The "I give you my kid, you do your thing" parent also sees bina is for them.

### Belonging 8.58 — "Our lowest score"

- **Don't market it as our lowest score.**
- Reframe as **the areas we're working on with families to cross 90%+ over the coming 12 months.**
- Tone: positive, strategic, with a plan. A roadmap for crossing that bridge — not a confession.

### Exam table — "One school, and no single track out of it"

- Frame it so a parent who wants a specific programme thinks: *"OK, so my kid can go to IB after bina — cool, we're safe."*
- **No misrepresentation.** Just remove the fear, without overdoing it or implying we deliver those programmes ourselves.

### Methodology accordion

- **The 2×2 accordion is visually broken**: opening one card stretches its row-mate into a tall empty white box.
- **Stack them one on top of the other** instead (single column), or otherwise decouple the row heights.

### Final CTA

- Current: *"Come and be one of the families we ask next year"*
- **Don't say "next year"** — we send this page to people enrolling within ~20 days.
- Replace with something like: **"Join the world of bina and get these benefits for your kid."**

---

## NPS — the real ISM data (full article, not the gated preview)

Source: ISM, *"Net Promoter Score Surveys: Is My School's Score 'Good'?"*, Ideas & Perspectives Vol. 47 No. 5, 1 May 2022. Sample: **28,477 parent responses across 95 schools**.

**This supersedes what's on the page now.** The live page cites the generic cross-industry bands (0–50 good, 50–70 excellent, 70–100 world class) — which the article explicitly describes as the *old* advice ISM moved away from, because ranges differ hugely by industry. There is a **parent-specific table**, and it's better for us.

### Table 2 — Parent NPS ranges (the one that applies to us)

| Range descriptor | NPS |
|---|---|
| Critical | Below 15 |
| Needs Improvement | 15 – 39 |
| Good | 40 – 54 |
| Great | 55 – 69 |
| **Excellent / World Class** | **70 and above** |

**bina's 80 sits in the top band — 10 points clear of the threshold, and 26 points above the top of "Good".** Now school-specific and parent-specific, not a generic business benchmark.

### What parent NPS actually predicts (the meaningful part)

ISM found parent NPS correlates with:

| Correlates with | r |
|---|---|
| Whether parents feel they get **value for the tuition they pay** | **0.66** |
| Their **re-enrolment intentions** | 0.29 |
| Their view of the **parent community** | 0.27 |

- The strongest correlate by far is **value for money**. A high parent NPS is, in ISM's data, mostly a statement that families think the fees are worth it. For a fee-paying school that's the most useful possible translation of "80".
- Useful framing: *"A parent's recommendation score is, above all, a verdict on whether the school is worth what they pay for it."*

### The retention finding — powerful, but flagged

> "At the highest-scoring NPS school, **89% of families reported they were planning to stay until graduation**, while only two of 259 families noted they were not likely to stay (the remaining 11% were undecided). However, at the **lowest-scoring school, 63%** of families reported they were likely to stay."

- This is the single most meaningful thing in the article: NPS band predicts whether families stay.
- ⚠️ **Risk — do not use without deciding this first.** These are ISM's schools, not bina. Citing "89% stay to graduation" invites a detail reader to ask what bina's number is, and bina's own survey put re-enrolment intent at **70%** — which we deliberately left off the page. Quoting the 89% reopens exactly the question we closed.
- If we use it, it must be unambiguously about the band, never implying bina's own figure: *"In ISM's study, schools in the top band saw around 9 in 10 families planning to stay through graduation, against roughly 6 in 10 at the lowest-scoring school."*

### How the score is calculated (replaces the defensive copy)

- Every family answers one question, 0–10: how likely are you to recommend the school?
- **0–6 = detractors · 7–8 = passives · 9–10 = promoters.** NPS = % promoters − % detractors. Range −100 to +100.
- Internal consistency worth stating plainly: bina's average answer is 9.42 and the NPS is 80, which only happens if the answers are overwhelmingly 9s and 10s.

### Context that shows why the parent table is the right one

- Student ranges swing wildly by age — world class is 65+ in grades 5–6 but only 30+ in upper school, because older students rate everything lower. ISM says an aggregate student NPS across grades 5–12 should never be used. Good evidence that quoting one universal NPS threshold is naive, and that we picked the correct table.
- Faculty world class is 75+ (Table 3) — not relevant to this page, but worth knowing if we ever publish a staff survey.

### What I'd write on the page

Roughly: **80 out of 100 on the one question that matters** → ISM's parent scale puts 70+ at Excellent/World Class, measured across 28,477 parents at 95 schools → and what that score tracks most closely is whether families think the school is worth what they pay. Then the calculation method in an expander for detail readers, and the ISM link.

### Data-file change this implies

`npsBenchmark` in `src/data/family-survey.json` currently stores the generic cross-industry bands. Replace with the Table 2 parent ranges, the three correlations, and the retention comparison, and drop the "the source publishes no average school NPS" caveat — it publishes bands, which is better.

---

## Open questions to settle before building

1. **Hero line accuracy.** "9.42 of 10 families at bina recommend us" misstates the metric. See Build Plan §1 for the recommended resolution (an NPS-derived count claim that IS true).
2. **Response rate placement.** Resolved: appears exactly twice for OCDers — once in the "Who did you ask" methodology expander, once in the footer note. Nowhere in the body.
3. **Tiles layout.** Resolved by the hero fix: if the hero becomes the count-style claim, the 9.42/10 tile no longer duplicates it and all four tiles stay.
4. **Belonging roadmap:** user directed the "cross 90%+ over the coming 12 months" framing — treat as decided; it is a public commitment.
5. **Do we cite ISM's 89%-stay-to-graduation finding?** Recommendation: omit (it invites the bina-retention question we closed). Pending user yes/no; build proceeds without it.
6. Still outstanding from earlier rounds: survey field dates, whether the belonging question measured the parent's or the child's sense of belonging, and 3–5 approved parent quotes.

---

# ROUND 3 FEEDBACK (2026-08-10, after round-2 shipped) — not yet implemented

- Hero → general, no stats/numbers: "What bina families think about bina" type headline.
- Scorecard section: remove the caption "'Would recommend bina' is the same question the 80 NPS is calculated from."
- NPS section: nobody understands it. Reframe as "How many parents recommend bina to others?" — simple cool copy, cut the marketing jargon (bands, benchmarking language).
- REMOVE: the "See how every parent answered" expander (full involvement chart).
- REMOVE: the 68% homework strip.
- Involvement: retitle "How involved are bina parents?" — the "Prefer to hand it to us? / Give us your kid, we do our thing" copy is aggressive tech-bro. Audience is mothers with busy lives: create belonging for lower involvement, never imply they care less.
- RESTRUCTURE the whole page as a story: what do they say about us → how do they feel → which things we offer matter to them → where we excel → the plan for the one area not at 90% yet → what happens after bina → where the numbers came from.

# BUILD PLAN — round 2 (approved feedback → implementation)

New section order after the rebuild:

1. Hero → 2. Four tiles → 3. Scorecard (all green + 8-line) → 4. NPS (rebuilt on ISM parent table) → 5. Priorities (promoted, inclusion) → 6. The 70% (inclusion reframe) → 7. Involvement (balance reframe) → 8. Belonging (roadmap reframe) → 9. Pathways (fear-removal reframe) → 10. Methodology (stacked) → 11. CTA.

## §1 Hero

- **Headline:** `More than 8 in 10 bina families give us a 9 or 10 when asked: "would you recommend bina?"`
  - Why it's true: NPS = %promoters − %detractors = 80, so %promoters (families answering 9–10) = 80 + %detractors ≥ 80%. The deck confirms detractors exist but are few → "more than 8 in 10" holds. This delivers the count-style simplicity the user asked for **without** the false claim.
- **Sub:** keep the "asked every family, published all of it" line, simplified.
- **NPS badge:** stays; sub-line becomes `world class on ISM's parent scale (70+)`.
- Pill: `family survey · 103 families` (drop "every score published" if crowded).

## §2 Global number formatting

- Every 0–10 rating renders as `9.42` + small `/10` suffix — a static `<span>` after the count-up span (no JS change; suffix sits outside `[data-count]`).
- Applies to: tiles, scorecard right-hand labels (`9.55/10` etc. — keep the small suffix lighter/smaller so the bars stay scannable), belonging number, any inline mentions.
- Percentages are untouched.

## §3 Global caption cleanup

- Delete "Whole-school family survey, 103 families…" and the 44% from **every** body caption.
- Body captions keep only what's needed to read the chart (e.g. "one choice each", "parents could pick more than one").
- Where a figure comes from the middle-school survey, the caption still says "middle-school parent survey, 108 responses" — the two-surveys-never-mixed rule survives; only the *whole-school* boilerplate moves down.
- Sample + 44% response rate + whole-school scope live in exactly two places: the "Who did you ask?" methodology expander and the footer note.

## §4 Tiles (keep all four)

- 9.42/10 Parents would send their friends here (note: "average answer to 'would you recommend bina to another family'")
- 9.55/10 Parents feel heard, not handed a login
- 9.53/10 Children are happy to log on
- 9.48/10 Families are satisfied, all in
- Remove the caption line under the grid (response rate gone; nothing else needed).

## §5 Scorecard

- **All seven bars `#03cb5b` (bina-green)** — belonging no longer yellow.
- **Vertical dashed line at x=8.0**, full chart height, labelled `8/10`; small annotation above the chart: `every single area scores above 8 out of 10`.
- **Intro copy replaced** (kill the defensive axis text): "Seven areas, rated 0–10 by the families already here. Every one of them lands above 8." + one plain sentence on how: "Each score is the average of all 103 families' answers."
- Caption reduced to the NPS↔recommend-question link only.

## §6 NPS section — rebuilt on the real ISM data

- Keep the black 80 panel; headline: `80 — world class on the scale built for school parents`.
- Body (focused layer, ~4 short lines):
  1. How it's calculated: every family answers 0–10; 9–10 promoters, 7–8 passives, 0–6 detractors; NPS = promoters − detractors; range −100 to +100. (Plain "how we calculated" — no "trust us" framing.)
  2. The parent-specific bands: ISM analysed **28,477 parent responses across 95 private schools** and set the parent ranges: below 15 critical · 15–39 needs improvement · 40–54 good · 55–69 great · **70+ excellent/world class**. bina: **80**.
  3. The meaning: ISM found parent NPS tracks, above all, **whether parents feel the school is worth the tuition they pay** (r = 0.66). "A recommendation score is a verdict on value for money."
  4. Internal consistency: average answer 9.42 + NPS 80 → the answers are overwhelmingly 9s and 10s.
- **New small SVG: the band scale.** Horizontal strip 0→100 segmented at 15/39/54/69 with band labels, black marker/needle at 80 labelled `bina · 80`. Scanner-readable in one glance.
- ISM retention stat (89% vs 63%): **omitted** pending decision #5.
- Update `npsBenchmark` in `family-survey.json`: parent bands, three correlations, calc method; drop the "no average published" caveat (bands are better); keep source + URL + trademark line.

## §7 Priorities section (was the expander under "two scores")

- **"The two scores we'd stake the school on" section is deleted** (repetitive — both numbers already in tiles).
- The "what matters most for your child's future" chart is **promoted to its own full section**, inclusion-framed:
  - H2: `The families here want what you want for your kid`
  - Copy: creativity & critical thinking 32%, strong academics 31.1%, confidence 25.2%, adaptability 11.7% — "whichever of these is yours, you'll find plenty of parents here who chose the same."
  - Keep the stacked bar + legend; caption: "103 families, one choice each."

## §8 The 70% — inclusion reframe

- Keep H2 `You wouldn't be the odd one out here`; keep big **70%** with small `69.9% exactly` beneath.
- **Small print summarised** (no decimal breakdown): "Within that 70%: some children who need additional support, and many families who simply realised their child could learn better in a different environment."
- Body copy warmer, non-comparative, no deficit framing (drop "run out of other options"): most bina families came from the same place — a bright kid, a classroom that didn't quite fit; here that's the norm. Close chained to quality: "and these are the families rating bina 9.48/10."

## §9 Involvement — balance reframe

- H2: `As involved as you want to be` (standalone-claim rule holds).
- Intro: one line — "bina parents run the whole range, and the school is built for all of it."
- **Two side-by-side cards (the core of the fix):**
  - `Want to be close to every detail?` — 65% check progress weekly, 55% talk about learning daily; you can see everything, any day. You'll never wait for a term report.
  - `Prefer to hand it to us?` — teachers teach: only 14% of parents sit in on lessons, and hands-off works too. Your involvement is your choice, not a requirement.
- Third strip below: 68% want ≤4h homework/week — "involved or relaxed, nobody's buried."
- Full chart stays in the expander (single, full-width, so no accordion-pairing bug here).

## §10 Belonging — roadmap reframe

- **No "our lowest score" framing.** H2: `The one score below 9 — and our 12-month plan to fix it`
- Structure:
  - `8.58/10 · sense of belonging` as the stat.
  - Why (kept, shortened): a school with no school gate has to *design* community rather than get it free with the building.
  - **The plan, straight from families:** the wishlist becomes "what we're building over the next 12 months, ranked by what families asked for" — in-person meetups & field trips, project work, social connection, academic challenge, entrepreneurship.
  - Goal line: "our target is every area above 9 out of 10 within the next 12 months."
- Tone positive/strategic; keep the black section but swap the yellow accent for grass-green (progress, not warning).

## §11 Pathways — fear-removal reframe

- H2: `Whatever comes after bina, the door stays open`
- Copy: bina families are preparing kids for every major route — US (SAT/AP), UK (GCSE/A-Levels), IB, regional programmes. "If IB or A-Levels is your plan, you'd be far from the only family here on that path." No claim that bina delivers those programmes; no misrepresentation — the stat is what families are preparing for.
- Table column header: `Families preparing for it`.
- Keep the multi-mention caption.

## §12 Methodology — layout fix + content update

- **Stack the four expanders in one column** (`grid-cols-1`, max-w-3xl) — fixes the broken paired-row-height accordion.
- "Who did you ask?" keeps: whole-school survey, 103 families, 44% response rate, separate middle-school survey of 108, never mixed.
- NPS expanders updated to the parent-table content (§6); drop the old cross-industry-bands phrasing.

## §13 CTA

- H2: `Join the world of bina — and give your kid all of this` (or close variant; no "next year").
- Sub + button unchanged (Visit bina → thebinaschool.com).

## §14 Footer note

- Keep: both surveys with n's + 44% + whole-school scope + never-combined + aggregates + self-selection + ISM citation (update wording to "parent NPS ranges") + NPS® trademark.

## Ship checklist

- `pnpm build` passes · capitalised-`Bina` scan clean · H1/H2 flat list still reads as a standalone argument · every rating shows `/10` · no body caption mentions 44% or "whole-school family survey" · JSON `_openQuestions` updated · PR → merge → verify live.
