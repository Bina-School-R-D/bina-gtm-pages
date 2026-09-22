/*
 * Shared content model for the ESA state pages.
 *
 * Scope, set by Akis on 2026-09-22: a state is on the site only if bina can accept its
 * students today. States that are pending, blocked or have no program are not pages — they
 * redirect to /esa (see astro.config.mjs). So the coming-soon and exploring branches this
 * module used to carry are gone with them.
 *
 * Nothing here invents a number: program facts come from esa-states.json (synced from the
 * team's ESA database), sales copy from esa-landing.json. The two are cross-checked at build
 * time in statePage() — a drift fails the build rather than shipping a wrong award.
 */
import esaData from '../data/esa-states.json';
import landing from '../data/esa-landing.json';

export const WEBSITE = 'https://thebinaschool.com';
export const EMAIL = 'admissions@thebinaschool.com';
export const CTA = 'https://form.thebinaschool.com/new';
export const CTA_LABEL = 'Start your bina journey →';

/** State name → URL slug. All 50 names are ASCII words, so spaces are the only join. */
export const stateSlug = (name) => name.toLowerCase().replace(/\s+/g, '-');

const byState = Object.fromEntries(esaData.programs.map((d) => [d.s, d]));

/** The program row for a state we serve, or null. */
export const programFor = (name) => byState[name] ?? null;

/** Every state that is not a page — these redirect to /esa. Exported for the build check. */
export const retiredStates = esaData.allStates.filter((name) => !byState[name]);

export const CHIP = {
  bina: { label: 'with bina', cls: 'bg-bina-yellow' },
  state: { label: "on your state's site", cls: 'bg-bina-blue' },
  both: { label: 'together', cls: 'bg-bina-grass' },
};

// Ordered by what a parent can act on today: rolling states first, because those are the only
// ones where reading this in September leads anywhere this school year.
const WINDOW_RANK = { rolling: 0, annual: 1, 'annual-unpublished': 2 };

export const WINDOW_BADGE = {
  rolling: { label: 'Apply any time', cls: 'bg-bina-grass' },
  annual: { label: 'One window a year', cls: 'bg-bina-blue' },
  'annual-unpublished': { label: 'Next dates not published', cls: 'bg-bina-orange' },
};

const usd = (n) => '$' + n.toLocaleString('en-US');
export { usd };

/**
 * Step 5 — how the money reaches bina. The only split left between served states: Idaho
 * pays the family back, the other four pay bina directly.
 */
function payStep(d, reimbursed) {
  if (reimbursed)
    return {
      who: 'both',
      t: 'Pay bina, then claim it back',
      d: `You pay bina and claim it back through the ${d.prog}. We give you the itemized invoice, enrollment letter and accreditation details every time you need them, so your claim goes in clean and nothing gets held up over paperwork.`,
    };
  return {
    who: 'both',
    t: 'Pay tuition from your account',
    d: `bina is an approved ${d.prog} provider, so ${d.s} pays bina directly from your ${d.platform} account — nothing comes out of your pocket. Where your award doesn't cover full tuition, you pay only the difference.`,
  };
}

/** The numbered step groups. Numbering runs across all groups. */
export function numberedSteps(d, reimbursed) {
  const groups = [
    {
      label: 'Before you enroll — during bina admissions',
      steps: [
        {
          who: 'bina',
          t: 'Talk to bina first',
          d: `One call. We tell you what bina costs, what the ${d.prog} covers in ${d.s}, and what is left for you — before you fill in anything.`,
        },
        {
          who: 'state',
          t: `Apply for the ${d.prog}`,
          d: d.applyWindow,
          url: d.applyUrl,
          urlLabel: `Apply on ${d.s}'s site ↗`,
        },
        { who: 'state', t: 'Get approved and funded', d: d.approval },
      ],
    },
    {
      label: 'After you enroll',
      steps: [
        {
          who: 'bina',
          t: 'Enroll at bina',
          d: "Finish admissions and pick a start date. Your bina admissions contact emails you everything your program needs — itemized invoice, enrollment letter and accreditation details — and answers anything specific your state asks for. You won't have to work the paperwork out alone.",
        },
        payStep(d, reimbursed),
      ],
    },
  ];
  let n = 0;
  return groups.map((g) => ({ label: g.label, steps: g.steps.map((s) => ({ ...s, n: ++n })) }));
}

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
export const words = WORDS;

/**
 * Everything a /esa/<state> page renders, resolved once: program facts, sales copy, the
 * money arithmetic and the steps. Throws rather than shipping a page built on a mismatch.
 */
export function statePage(slug) {
  const copy = landing.states.find((s) => s.slug === slug);
  if (!copy) throw new Error(`No esa-landing.json copy for /esa/${slug}.`);

  const program = programFor(copy.state);
  if (!program)
    throw new Error(`No esa-states.json entry for ${copy.state} — sync the ESA database first.`);

  // Fail the build if the database moves and this page's award drifts out of step with it.
  for (const n of new Set([copy.esaMin, copy.esaMax])) {
    if (!program.howMuch.includes(usd(n)))
      throw new Error(
        `${copy.state}: esa-landing.json says ${usd(n)} but esa-states.json says "${program.howMuch}" — reconcile them.`
      );
  }

  const { school } = landing;
  const reimbursed = copy.tier === 'reimbursed';
  const perMonth = (gap) => Math.round(gap / 12);
  // esaMax is the larger award, so it produces the smaller remainder.
  const monthLow = perMonth(school.tuitionYearly - copy.esaMax);
  const monthHigh = perMonth(school.tuitionYearly - copy.esaMin);

  const groups = numberedSteps(program, reimbursed);
  const allSteps = groups.flatMap((g) => g.steps);
  const countBy = (who) => WORDS[allSteps.filter((s) => s.who === who).length];

  return {
    copy,
    program,
    reimbursed,
    tier: landing.tierCopy[copy.tier],
    badge: WINDOW_BADGE[program.windowState],
    awardLabel: copy.esaMin === copy.esaMax ? usd(copy.esaMax) : `${usd(copy.esaMin)}–${usd(copy.esaMax)}`,
    // The base award is what we quote; several states pay more for children with special needs.
    awardNote: /special needs|disability/i.test(program.howMuch)
      ? 'The base award. Several states pay more for a child with special needs.'
      : `Paid through ${program.platform}.`,
    monthLabel: monthLow === monthHigh ? usd(monthHigh) : `${usd(monthLow)}–${usd(monthHigh)}`,
    gapLabel: reimbursed ? 'your net cost after the refund' : 'is what you cover yourself',
    groups,
    stepTotal: WORDS[allSteps.length],
    stepsBina: countBy('bina'),
    stepsState: countBy('state'),
    stepsBoth: countBy('both'),
    // This state's own questions lead; the ones every family asks follow.
    questions: [...copy.faq, ...landing.faq],
    otherStates: landing.states.filter((s) => s.slug !== slug),
  };
}

/** The /esa chooser: one card per served state, actionable ones first. */
export function chooserStates() {
  return landing.states
    .map((s) => {
      const program = programFor(s.state);
      if (!program) throw new Error(`No esa-states.json entry for ${s.state}.`);
      return {
        ...s,
        program,
        badge: WINDOW_BADGE[program.windowState],
        awardLabel:
          s.esaMin === s.esaMax ? usd(s.esaMax) : `${usd(s.esaMin)}–${usd(s.esaMax)}`,
      };
    })
    .sort(
      (a, b) =>
        WINDOW_RANK[a.program.windowState] - WINDOW_RANK[b.program.windowState] ||
        a.state.localeCompare(b.state)
    );
}
