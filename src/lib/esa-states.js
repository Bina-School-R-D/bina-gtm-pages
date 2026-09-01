/*
 * Shared content model for the ESA state pages.
 *
 * This is a straight lift of the branching that used to run in the browser inside
 * /esa's <script> — same states, same statuses, same copy. It now runs at build time so
 * every state is a real page a crawler can read. Nothing here invents a number: all
 * program facts come from esa-states.json, which is synced from the team's ESA database.
 */
import esaData from '../data/esa-states.json';

const { programs, allStates, noProgramNotes } = esaData;

export const WEBSITE = 'https://thebinaschool.com';
export const EMAIL = 'admissions@thebinaschool.com';

/** State name → URL slug. All 50 names are ASCII words, so spaces are the only join. */
export const stateSlug = (name) => name.toLowerCase().replace(/\s+/g, '-');

// Every state gets a page, so a family never has to guess whether silence means "no".
// States without a usable program get an honest answer instead of no answer.
export const stateNames = Array.from(new Set(allStates.concat(programs.map((d) => d.s)))).sort();

const byState = Object.fromEntries(programs.map((d) => [d.s, d]));

/** The program row for a state, or null when the state has nothing usable yet. */
export const programFor = (name) => byState[name] ?? null;

/** The extra "why not yet" line some no-program states carry. */
export const noteFor = (name) => (noProgramNotes || {})[name] ?? null;

export const CHIP = {
  bina: { label: 'with bina', cls: 'bg-bina-yellow' },
  state: { label: "on your state's site", cls: 'bg-bina-blue' },
  both: { label: 'together', cls: 'bg-bina-grass' },
};

export const BADGE = {
  approved: { label: '✓ bina is an approved provider', cls: 'bg-bina-grass' },
  'approved-reimb': { label: '✓ Ready to use for bina', cls: 'bg-bina-grass' },
  'coming-soon': { label: 'Coming soon', cls: 'bg-bina-orange' },
  exploring: { label: 'possible for some families — ask us', cls: 'bg-bina-blue' },
};

const PAY_FACT = {
  approved: 'Yes — the state pays bina directly from your account.',
  // Idaho-style: usable today, but the money reaches you rather than us.
  'approved-reimb': 'You pay bina, then the state gets the money back to you — and we give you every receipt and document your claim needs.',
  exploring: "It depends on your approval — we'll know your route and handle it with you.",
};

// Third fact tile: "does the state pay bina" is the wrong question for a coming-soon
// state, so those show where bina's approval actually stands instead.
const FACT_LABELS = {
  'coming-soon': ['Who the state funds', 'What it’s worth per child', 'Where bina stands'],
  'approved-reimb': ['Who can apply', 'How much for bina', 'How the money works'],
  default: ['Who can apply', 'How much for bina', 'Does the state pay bina directly?'],
};

/** The three fact tiles across the top of a state's panel. */
export function facts(d) {
  const labels = FACT_LABELS[d.status] || FACT_LABELS.default;
  return [
    { k: labels[0], v: d.who },
    { k: labels[1], v: d.howMuch },
    { k: labels[2], v: d.status === 'coming-soon' ? d.standing : PAY_FACT[d.status] },
  ];
}

// Step 5 — pay copy. Definite for approved states; conditional (Akis's ask) otherwise.
function payStep(d) {
  if (d.status === 'approved') {
    const acct = d.platform ? ' from your ' + d.platform + ' account' : ' from your account';
    return {
      w: 'both',
      t: 'Pay tuition from your account',
      x: 'bina is an approved ' + d.prog + ' provider, so the state pays bina directly' + acct + " — nothing comes out of your pocket. If your award doesn't cover full tuition, you only pay the difference.",
    };
  }
  if (d.status === 'approved-reimb') {
    return {
      w: 'both',
      t: 'Pay bina, then claim it back',
      x: 'You pay bina and claim it back through the ' + d.prog + '. We give you the itemized invoice, enrollment letter and accreditation details every time you need them, so your claim goes in clean and nothing gets held up over paperwork.',
    };
  }
  const acct = d.platform ? ' (from your ' + d.platform + ' account)' : '';
  return {
    w: 'both',
    t: 'Pay tuition — the way your approval allows',
    x:
      'How you pay depends on what your step-3 approval allows, and we handle it with you either way: ' +
      '(a) if it lets bina be paid directly, the state pays us' + acct + " and nothing comes out of your pocket; " +
      "(b) if it only allows reimbursement, you pay bina and we give you the itemized invoice, enrollment letter, and accreditation details to claim it back. " +
      "We'll know which one the moment you're approved.",
  };
}

// Coming-soon states get an honest picture instead of a path we can't yet deliver:
// what the program is, what's in the way, what bina is doing, and what a family can do now.
function comingSoonSteps(d) {
  const steps = [
    { w: 'state', t: 'The funding is real and worth planning for', x: d.soonWhy, link: { url: d.officialUrl, label: 'See the ' + d.s + ' program ↗' } },
  ];

  // Skip the dates block where the program itself is on hold — there's nothing to diary.
  if (d.applyWindow && !/^on hold/i.test(d.applyWindow))
    steps.push({
      w: 'state',
      t: 'Keep the dates on your radar',
      x: d.applyWindow + ' Applying keeps your state options open — and we’ll tell you straight the moment bina fits into them.',
      link: { url: d.applyUrl, label: 'Apply on the ' + d.s + ' site ↗' },
    });

  steps.push(
    { w: 'bina', t: 'What we’re doing about it', x: d.soonWork },
    {
      w: 'bina',
      t: 'How ' + d.s + ' families join bina today',
      x: 'Plenty of families choose bina without any state funding — small live classes of 6–8 with two teachers, and a real community your child belongs to. Book a call and we’ll be straight with you about timing, cost and exactly where the ' + d.prog + ' stands.',
      cta: 'book',
    },
    {
      w: 'bina',
      t: 'Be first in line when ' + d.s + ' opens',
      x: 'Send us one line saying you’re in ' + d.s + '. When this funding becomes usable at bina, you’ll hear from us before the next application window — not after it closes.',
      cta: 'notify',
    },
  );

  return [{ label: 'Where ' + d.s + ' stands today', steps: steps }];
}

/** The numbered step groups under the fact tiles. Numbering runs across all groups. */
export function buildSteps(d) {
  if (d.status === 'coming-soon') return comingSoonSteps(d);

  const talk =
    d.status === 'exploring'
      ? { w: 'bina', t: 'Talk to bina first', x: "The " + d.prog + " isn't a guaranteed fit for online schools yet, but families do make it work. Book a call and we'll map whether it works for your family — before you spend anything.", cta: 'book' }
      : { w: 'bina', t: 'Talk to bina first', x: "Book a call and tell us you're using the " + d.prog + ". We'll confirm your numbers, your timing, and exactly what to prepare — so the state steps are quick.", cta: 'book' };

  const apply = {
    w: 'state',
    t: 'Apply for the ' + d.prog,
    x: d.applyWindow,
    link: { url: d.applyUrl, label: 'Apply on the ' + d.s + ' site ↗' },
  };

  const approved = { w: 'state', t: 'Get approved & funded', x: d.approval };

  const enroll = {
    w: 'bina',
    t: 'Enroll at bina',
    x: "Finish admissions and pick a start date. Your bina admissions contact emails you everything your program needs — itemized invoice, enrollment letter, and accreditation details — and answers anything specific your state asks for. You won't have to figure the paperwork out alone.",
  };

  return [
    { label: 'Before you enroll — during bina admissions', steps: [talk, apply, approved] },
    { label: 'After you enroll', steps: [enroll, payStep(d)] },
  ];
}

/** Step groups with the running step number already resolved, for straightforward markup. */
export function numberedSteps(d) {
  let n = 0;
  return buildSteps(d).map((g) => ({ label: g.label, steps: g.steps.map((s) => ({ ...s, n: ++n })) }));
}

export const notifyHref = (name) => `mailto:${EMAIL}?subject=${encodeURIComponent(name + ' funding updates')}`;
