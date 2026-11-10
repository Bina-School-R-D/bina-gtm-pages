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
// Button label: no arrow on buttons (Zeyu, 2026-11-05); text links keep theirs.
export const CTA_LABEL = 'Start your bina journey';

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
    d: `bina is an approved ${d.prog} provider, so ${d.s} pays bina directly from your ${d.platform} account. Where your award doesn't cover full tuition, you pay the difference.`,
  };
}

/** The numbered step groups. Numbering runs across all groups. */
export function numberedSteps(d, reimbursed, callStep) {
  const groups = [
    {
      label: 'Before you enroll — during bina admissions',
      steps: [
        // A state's own call step (Arizona: the named ESA call) replaces the generic one.
        callStep
          ? { who: 'bina', ...callStep }
          : {
              who: 'bina',
              t: 'Talk to bina first',
              d: `One call. We tell you what bina costs, what the ${d.prog} covers in ${d.s}, and what is left for you — before you fill in anything.`,
            },
        {
          who: 'state',
          t: `Apply for the ${d.prog}`,
          d: d.applyWindow,
          url: d.applyUrl,
          urlLabel: `Apply on ${d.s}'s site →`,
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

const DISCLAIMER_Q = 'Is bina responsible for this program?';
function withDisclaimer(faq, d) {
  if (faq.some((f) => f.q === DISCLAIMER_Q)) return faq;
  return [
    ...faq,
    {
      q: DISCLAIMER_Q,
      a: `The ${d.prog} is run by the state of ${d.s}, not by bina. Program amounts, eligibility and deadlines are subject to change. Always confirm with the official program site before you rely on a number here.`,
      link: { text: 'the official program site', url: d.officialUrl },
    },
  ];
}

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
  // Partial-support pages (Florida) have no single award to check.
  for (const n of copy.tier === 'partial' ? [] : new Set([copy.esaMin, copy.esaMax])) {
    if (!program.howMuch.includes(usd(n)))
      throw new Error(
        `${copy.state}: esa-landing.json says ${usd(n)} but esa-states.json says "${program.howMuch}" — reconcile them.`
      );
  }

  const reimbursed = copy.tier === 'reimbursed';

  // Steps come from the state's Notion draft (copy.process.groups, 2026-11-09), numbered across
  // groups; a state without its own steps falls back to the generic ones.
  let groups;
  if (copy.process?.groups) {
    let n = 0;
    groups = copy.process.groups.map((g) => ({ label: g.label, steps: g.steps.map((st) => ({ ...st, n: ++n })) }));
  } else {
    groups = numberedSteps(program, reimbursed, copy.callStep);
  }
  const allSteps = groups.flatMap((g) => g.steps);

  // The money, the steps and every other section are the state's Notion draft, word for word
  // (esa-landing.json); nothing on the page is computed here any more.
  return {
    copy,
    program,
    reimbursed,
    groups,
    stepTotal: WORDS[allSteps.length],
    // Every state's Notion draft is a complete FAQ ending with the disclaimer; a state without
    // one gets the disclaimer in Arizona's wording.
    questions: withDisclaimer(copy.faq, program),
  };
}

/** The /esa chooser: one card per approved state, in the Notion table's order. */
export function chooserStates() {
  // The approved-state cards, in the order of the Notion table (2026-11-09). Each card carries
  // the table's columns word for word (copy.card); partial-support states (Florida) are not cards.
  return landing.states
    .filter((s) => s.tier !== 'partial')
    .map((s) => {
      const program = programFor(s.state);
      if (!program) throw new Error(`No esa-states.json entry for ${s.state}.`);
      if (!s.card) throw new Error(`${s.state}: no chooser card copy (esa-landing.json states[].card).`);
      return { ...s, program };
    });
}
