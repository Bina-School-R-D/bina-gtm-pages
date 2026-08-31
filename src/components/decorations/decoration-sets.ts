/*
 * The list of available decoration sets for `deco_layer.astro`. This is the file the
 * "adding new imagery" workflow (CLAUDE.md) tells people to edit — add one entry here, drop the
 * matching image file(s) into `src/assets/decorations/`, done. No changes to the component itself.
 *
 * Field-by-field, and why each one exists:
 *  - `file`         — filename only, must live in `src/assets/decorations/` (flat, no subfolders).
 *                      Resolved to an optimized, hashed image automatically by the component via
 *                      `import.meta.glob` — you never write an `import` statement for a new asset.
 *  - `side`          — 'left' | 'right'. Also what the `left`/`right` props on `DecoLayer`
 *                      gate against, so a set can have one or both sides defined.
 *  - `verticalEdge`  — 'top' | 'bottom', a per-decoration field (not an assumption baked into the
 *                      component) so a future set CAN anchor from a different edge if it genuinely
 *                      needs to — but both current sets anchor `left` and `right` from the SAME
 *                      edge (`top`) deliberately, not because the source did. See the STAGGER NOTE
 *                      below for why mixing edges within one set was a real bug, not a stylistic
 *                      source-fidelity choice worth keeping.
 *  - `verticalOffset` / `horizontalOffset` — the literal CSS value for that edge, AS A STRING, in
 *                      whatever unit the source site used (`%`, `vw`, `rem` — never converted to
 *                      px). Source pairs mix units freely (e.g. the lily/heron pair uses `vw` for
 *                      left/right/width/height) — this is exactly why these are strings, not
 *                      numbers-plus-one-shared-unit. `verticalOffset` is the field to tune per
 *                      decoration for vertical position/stagger — see the STAGGER NOTE below.
 *  - `width`         — CSS width, same string-with-unit rule as above.
 *  - `maxWidth`       (optional) — only present when the source caps a fluid `%`-width with a
 *                      `clamp()` ceiling so it doesn't grow unbounded on very wide screens (the
 *                      admissions palm leaves do this; the lily/heron pair, being flat `vw` values
 *                      with no cap in the source, doesn't need it).
 *  - `height`         (optional, pairs with `objectPosition`) — only present when the source
 *                      positions the image inside a box whose aspect ratio doesn't match the
 *                      image's own natural ratio (the lily/heron pair: a landscape-shaped box
 *                      holding a square image, via `object-fit: contain`). The admissions leaves
 *                      don't set this — they use `width` plus natural aspect ratio (`h-auto`).
 *  - `objectPosition`  (optional, only meaningful together with `height`) — where the image sits
 *                      within its box when the box and image aspect ratios differ, e.g.
 *                      `'left center'` / `'right center'`.
 *
 * `width`, `maxWidth`, `height`, and `horizontalOffset` are the source value × 0.48, not verbatim.
 * See the SCALE NOTE right above the `decorationSets` export below for the full reasoning (short
 * version: at literal 1:1 size these need a ~1900-2450px viewport to clear the 1200px container,
 * wider than almost any real browser window, so the decorations would basically never show).
 *
 * STAGGER NOTE — `verticalOffset` is NOT copied verbatim from the source, and deliberately isn't:
 * the source values (some `top`-anchored, some `bottom`-anchored, some large rem offsets meant to
 * bleed a `position: absolute` image off the edge of one specific section) were tuned for that
 * source site's own per-section `position: absolute` layout. `DecoLayer` is `position: fixed`
 * — viewport-relative, not section-relative — so those exact values don't carry over: a mix of
 * `top`/`bottom` anchoring within one set puts `left` and `right` at wildly different points on
 * screen (one near the top, one near the bottom, nothing in between), and the waterlily pair's
 * original `bottom: -30rem`/`-38rem` pushed BOTH images entirely below the viewport at any normal
 * screen height — invisible on every page using that set, not just mispositioned. Both sets now
 * use `verticalEdge: 'top'` for both `left` and `right`, with `verticalOffset` values 10-15
 * percentage points apart (`18%` / `30%`) — a deliberate, visible stagger, never a gap so large one
 * side of a section reads as empty. Tune `verticalOffset` here, per decoration, to adjust this —
 * never in `deco_layer.astro`, which has no positioning values of its own to edit.
 */

export interface DecorationImage {
  file: string;
  side: 'left' | 'right';
  verticalEdge: 'top' | 'bottom';
  verticalOffset: string;
  horizontalOffset: string;
  width: string;
  maxWidth?: string;
  height?: string;
  objectPosition?: string;
}

export interface DecorationSet {
  /** One-line note on where this set came from and what it's meant to evoke. */
  description: string;
  left?: DecorationImage;
  right?: DecorationImage;
}

/*
 * SCALE NOTE: every width/maxWidth/height/horizontalOffset value below is the literal source
 * value × 0.48 — not the raw 1:1 extraction. At 1:1 size these boxes require a ~1900-2450px
 * viewport to clear the 1200px container without overlap (see CLAUDE.md for the full per-image
 * breakdown), which is wider than almost any real browser window — the decorations would
 * essentially never be visible. 0.48 was solved so the WORST case (heron) clears the container by
 * 1600px, the show breakpoint `deco_layer.astro` actually uses. `verticalOffset` is
 * deliberately left UNSCALED — it doesn't affect the horizontal-overlap math this scale factor
 * solves for, and rescaling it wasn't necessary to hit the goal. If a future set is added at its
 * true 1:1 source size instead, either give it its own scale factor here or recompute the shared
 * breakpoint against the new worst case — don't assume 0.48/1600px still holds.
 */
/*
 * Naming convention: `deco_<name>`, all lowercase, underscore-separated — not the set's source
 * page or asset filenames (those live in `description` and `file` instead). This keeps set names
 * stable even if a set's imagery is later re-sourced from a different page, and keeps the naming
 * scheme open-ended for whatever comes next — `deco_flowers`, `deco_ocean`, `deco_mountains`,
 * whatever a future set turns out to be. Adding one is just adding another key to this object; see
 * "Adding new decoration imagery" in CLAUDE.md for the full step-by-step.
 */
export const decorationSets: Record<string, DecorationSet> = {
  deco_leaves: {
    description:
      'Palm/fern leaves flanking a section, extracted from thebinaschool.com/admissions (AdmissionsVideoSection.tsx). Scaled to 48% of source size — see the SCALE NOTE above.',
    left: {
      file: 'palm-leaf-left.png',
      side: 'left',
      verticalEdge: 'top',
      verticalOffset: '18%',
      horizontalOffset: '-2.4%',
      width: '12%',
      maxWidth: 'clamp(8.4rem, 11.11vw, 18rem)',
    },
    right: {
      file: 'palm-leaf-right.png',
      side: 'right',
      verticalEdge: 'top',
      verticalOffset: '30%',
      horizontalOffset: '-2.4%',
      width: '14.4%',
      maxWidth: 'clamp(10.08rem, 13.33vw, 21.6rem)',
    },
  },
  deco_waterlily: {
    description:
      'Lily pads + a flying heron, extracted from thebinaschool.com/open-house (WhatToExpectSection.tsx). Scaled to 48% of source size — see the SCALE NOTE above.',
    left: {
      file: 'lily-pads.png',
      side: 'left',
      verticalEdge: 'top',
      verticalOffset: '18%',
      horizontalOffset: '-12.48vw',
      width: '38.4vw',
      height: '26.11vw',
      objectPosition: 'left center',
    },
    right: {
      file: 'heron.png',
      side: 'right',
      verticalEdge: 'top',
      verticalOffset: '30%',
      horizontalOffset: '-8.64vw',
      width: '36vw',
      height: '28.22vw',
      objectPosition: 'right center',
    },
  },

  // Add more sets here as new decoration imagery is extracted — same shape as the two above:
  // deco_<name>: { description, left?: DecorationImage, right?: DecorationImage }. No other file
  // needs to change; deco_layer.astro and its `set` prop pick up new keys automatically.
};

export type DecorationSetName = keyof typeof decorationSets;
