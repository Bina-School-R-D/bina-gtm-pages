/*
 * /local pages — URLs, the live switch, prices and placeholders, all from src/data/local-markets.json.
 *
 * Preview vs production:
 * - `pnpm dev` (localhost) is a preview: every market renders, and "[PENDING …]" text shows
 *   highlighted so the team sees what's missing. PUBLIC_LOCAL_PREVIEW=1 does the same in a build.
 * - A production build (`pnpm build`, the GitHub Pages deploy) emits only markets with
 *   `live: true`, emits /local only once one is live, and drops any section that still holds a
 *   placeholder. Nothing that is not live can reach go.bina.school by accident.
 */
import data from '../data/local-markets.json';
import eventData from '../data/local-events.json';
import landing from '../data/esa-landing.json';
import survey from '../data/family-survey.json';
import { CTA } from './esa-states.js';

export const PREVIEW = import.meta.env.DEV || import.meta.env.PUBLIC_LOCAL_PREVIEW === '1';

export const PENDING_RE = /\[PENDING[^\]]*\]/;
export const hasPending = (value) => PENDING_RE.test(JSON.stringify(value ?? ''));

export const HUB_PATH = '/local';
export const hub = data.hub;

/** /local/{country}/{state}/{market}[/{hub}], built from the tags; the state drops when it repeats the market. */
export function marketPath(m) {
  const { country, state, market, hub: h } = m.tags;
  const parts = ['local', country];
  if (state !== market) parts.push(state);
  parts.push(market);
  if (h) parts.push(h);
  return `/${parts.join('/')}`;
}

export const shownMarkets = () => data.markets.filter((m) => m.live || PREVIEW);
export const hubShown = () => shownMarkets().length > 0;

/**
 * The section list a page renders: on production, sections with a placeholder are dropped,
 * then any `group` band left with no section under it (up to the next group) is dropped too.
 * `community` and `faq` sections are the exception: they drop their placeholder items one by one
 * (keepReady), so one unverified answer never hides the whole FAQ (Akis, 2026-11-23).
 */
export const visibleSections = (m) => {
  const kept = m.sections.filter((s) => PREVIEW || s.kind === 'community' || s.kind === 'faq' || !hasPending(s));
  return kept.filter((s, i) => s.kind !== 'group' || (kept[i + 1] && kept[i + 1].kind !== 'group'));
};

/** Production: the items of a list without the ones still holding a placeholder. */
export const keepReady = (items) => (items ?? []).filter((x) => PREVIEW || !hasPending(x));

/** The page's sub-navbar: every rendered section with an `anchor` and a `navLabel`, in page order. */
export const navItems = (sections) => sections.filter((s) => s.anchor && s.navLabel).map((s) => ({ id: s.anchor, label: s.navLabel }));

/** Production: a card line that is still a placeholder shows without the line. */
export const cardLine = (m) => (PREVIEW || !hasPending(m.cardLine) ? m.cardLine : '');

/** "Join bina in {market}": the main site's "Start your bina journey" destination + ?market={id}. */
export const joinHref = (m) => `${CTA}?market=${encodeURIComponent(m.id)}`;

/**
 * Known parent levels (/local/canada, /local/canada/ontario, …) → the nearest shown page above.
 * GitHub Pages can't send a 302, so these become noindex hand-off pages.
 */
export function parentRedirects() {
  const pages = new Set(shownMarkets().map(marketPath));
  if (hubShown()) pages.add(HUB_PATH);
  const parents = new Set();
  for (const m of data.markets) {
    const segs = marketPath(m).split('/').filter(Boolean);
    for (let i = 2; i < segs.length; i += 1) parents.add(`/${segs.slice(0, i).join('/')}`);
  }
  const out = [];
  for (const from of [...parents].sort()) {
    if (pages.has(from)) continue;
    for (let up = from.split('/').filter(Boolean).slice(0, -1); up.length >= 1; up = up.slice(0, -1)) {
      const to = `/${up.join('/')}`;
      if (pages.has(to)) {
        out.push({ from, to });
        break;
      }
    }
  }
  return out;
}

/* ------------------------------------------------------------------ prices */

const round10 = (n) => Math.round(n / 10) * 10;
const fmt = (n) => n.toLocaleString('en-US');

/**
 * One price list for every page (brochure style, Akis 2026-11-23): USD from esa-landing.json
 * (copied from thebinaschool.com/tuition), local amounts computed from it at the rate in
 * local-markets.json, rounded to the nearest 10. Pages show the local amount only. No local
 * currency: USD.
 */
export function tuitionPlans(currency) {
  const s = landing.school;
  const r = currency ? data.rates[currency] : null;
  const local = (n) => (r ? `${r.prefix}${fmt(round10(n * r.rate))}` : null);
  const usd = (n) => `$${fmt(n)}`;
  const save = Math.round((1 - s.monthlyYearly / s.monthlyQuarterly) * 100);
  return {
    currency: r ? currency : null,
    rate: r ? r.rate : null,
    plans: [
      { name: 'Quarterly plan', big: local(s.monthlyQuarterly) ?? usd(s.monthlyQuarterly), usd: usd(s.monthlyQuarterly), billed: 'quarterly', line: 'Once a season, 4 times a year.' },
      { name: 'Annual plan', big: local(s.monthlyYearly) ?? usd(s.monthlyYearly), usd: usd(s.monthlyYearly), billed: 'yearly', save, line: 'Pay upfront for the year.' },
    ],
    sibling: { big: local(s.siblingDiscount) ?? usd(s.siblingDiscount), usd: usd(s.siblingDiscount) },
  };
}

/** "CA$1,280–1,380": the yearly-to-quarterly monthly range in a local currency. */
export function priceRange(currency) {
  const s = landing.school;
  const r = data.rates[currency];
  const lo = fmt(round10(s.monthlyYearly * r.rate));
  const hi = fmt(round10(s.monthlyQuarterly * r.rate));
  return `${r.prefix}${lo}–${hi}`;
}

/**
 * One FAQ answer as shown on the page and in the FAQ schema: the local price range for
 * `priceRange` items, and survey numbers read from the data file, never retyped.
 */
export function faqAnswer(f) {
  return String(f.a)
    .replace('{range}', f.priceRange ? priceRange(f.priceRange) : '{range}')
    .replaceAll('{recommendAvg}', String(survey.headline.recommendAvg))
    .replaceAll('{surveyN}', String(survey.surveyA.n));
}

/* ------------------------------------------------------------------ events */

/** Upcoming (soonest first) and past (newest first) for one market, split on the build date. */
export function marketEvents(marketId, today = new Date().toISOString().slice(0, 10)) {
  const mine = eventData.events.filter((e) => e.market === marketId);
  const upcoming = mine.filter((e) => e.date && e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = mine
    .filter((e) => !e.date || e.date < today)
    .map((e) => ({
      ...e,
      year: e.year ?? Number(e.date.slice(0, 4)),
      // A hand-added past event may have no month yet: the card then shows the year only.
      month: e.month ?? (e.date ? new Date(e.date + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' }) : undefined),
    }))
    .sort((a, b) => (b.date ?? `${b.year}`).localeCompare(a.date ?? `${a.year}`));
  return { upcoming, past };
}

/* ------------------------------------------------------------------ structured data */

const SITE = 'https://go.bina.school';

export function marketJsonLd(m, faqItems) {
  const crumbs = [
    { name: 'Home', url: 'https://thebinaschool.com' },
    ...(hubShown() ? [{ name: 'bina near you', url: `${SITE}${HUB_PATH}` }] : []),
    { name: m.name, url: `${SITE}${marketPath(m)}` },
  ];
  const out = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'bina',
      url: 'https://thebinaschool.com',
      areaServed: m.areaServed.map((a) => ({ '@type': a.type === 'State' ? 'State' : a.type, name: a.name })),
    },
  ];
  if (faqItems?.length) {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }
  return out;
}

export const accreditations = data.accreditations;

/**
 * Videos (Akis, 2026-11-24): `{ youtube | src, title, poster?, preview?, aspect?, placeholder? }`.
 * A video marked `placeholder: true` (a stand-in clip until the real one is filmed) shows on
 * localhost only; production renders the plain image instead, never the stand-in.
 */
export const showVideo = (v) => !!v && !!(v.youtube || v.src) && (PREVIEW || !v.placeholder);

/** The data-* attributes LocalVideoModal reads from a trigger button. */
export const videoAttrs = (v) => ({
  'data-local-video': '',
  'data-youtube': v.youtube,
  'data-src': v.src,
  'data-title': v.title,
  'data-poster': v.poster,
  'data-aspect': v.aspect,
});
