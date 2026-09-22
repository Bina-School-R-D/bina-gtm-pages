/*
 * Acceptance check for the /esa pages. Runs on the built output in dist/, so it proves what
 * a crawler actually receives, not what the source looks like. Part of `pnpm build`, so the
 * build fails before a regression can ship.
 *
 * The contract changed on 2026-09-22 (Akis). This file previously asserted the opposite of
 * what it asserts now, and the change was deliberate:
 *   - was: all 50 states are pages, and a state page is /esa with the URL changed.
 *   - now: ONLY states bina can accept are pages; the other 45 redirect to /esa; and a
 *          state page is the merged page (hero → how it works → money → process → FAQ).
 * Keep the static-not-query-parameter rule from the original — that part still holds.
 *
 * Dependency-free on purpose: node + the built files, nothing else.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');
const SITE = 'https://go.bina.school';

const esa = JSON.parse(readFileSync(join(ROOT, 'src/data/esa-states.json'), 'utf8'));
const landing = JSON.parse(readFileSync(join(ROOT, 'src/data/esa-landing.json'), 'utf8'));

/** Same slug rule the pages build with — kept here independently so a drift shows up. */
const slugify = (name) => name.toLowerCase().replace(/\s+/g, '-');

const served = esa.programs.map((p) => p.s);
const byState = Object.fromEntries(esa.programs.map((p) => [p.s, p]));
const retired = esa.allStates.filter((name) => !byState[name]);

const failures = [];
const fail = (msg) => failures.push(msg);

/** Astro escapes quotes and apostrophes; compare on decoded text so copy checks are literal. */
const decode = (s) =>
  s
    .replace(/&#39;/g, "'")
    .replace(/&#34;|&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

const read = (route) => {
  const file = join(DIST, route === '/esa' ? 'esa/index.html' : `${route.slice(1)}/index.html`);
  return existsSync(file) ? decode(readFileSync(file, 'utf8')) : null;
};

const must = (haystack, needle, where) => {
  if (haystack === null) return;
  if (!haystack.includes(needle)) fail(`${where}: missing ${JSON.stringify(needle)}`);
};

const mustNot = (haystack, needle, where) => {
  if (haystack === null) return;
  if (haystack.includes(needle)) fail(`${where}: must not contain ${JSON.stringify(needle)}`);
};

// 1 — the served states, and only those, are real pages. Every page has copy, every copy a page.
if (served.length === 0) fail('esa-states.json has no programs — there would be nothing to serve');
const copySlugs = landing.states.map((s) => s.slug).sort();
const servedSlugs = served.map(slugify).sort();
if (copySlugs.join() !== servedSlugs.join())
  fail(`esa-landing.json covers [${copySlugs}] but esa-states.json serves [${servedSlugs}] — reconcile them`);

const pages = {};
for (const name of served) {
  const route = `/esa/${slugify(name)}`;
  pages[name] = read(route);
  if (pages[name] === null) fail(`${route}: no built page (expected dist${route}/index.html)`);
}

const builtDirs = existsSync(join(DIST, 'esa'))
  ? readdirSync(join(DIST, 'esa'), { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort()
  : [];
// Retired states still have a directory — it holds the redirect stub, not a page.
const allowedDirs = [...servedSlugs, ...retired.map(slugify)].sort();
const extra = builtDirs.filter((d) => !allowedDirs.includes(d));
if (extra.length) fail(`/esa has routes outside the state set (a second page system?): ${extra.join(', ')}`);

// 2 — every state we cannot serve redirects to /esa, and is not indexable.
for (const name of retired) {
  const route = `/esa/${slugify(name)}`;
  const html = read(route);
  if (html === null) {
    fail(`${route}: no redirect stub — a link that used to work now 404s`);
    continue;
  }
  must(html, 'http-equiv="refresh"', route);
  must(html, 'url=/esa', route);
  must(html, 'name="robots" content="noindex"', route);
  // A redirect stub must not carry the sales copy of a state we cannot actually serve.
  mustNot(html, 'Start your bina journey', route);
  mustNot(html, 'per child, per year', route);
}

// 3 — no page anywhere sells a state we cannot serve.
{
  const index = read('/esa');
  for (const name of retired) {
    must(index === null ? null : index, '', '/esa'); // no-op guard when the index is missing
    if (index && index.includes(`/esa/${slugify(name)}`))
      fail(`/esa: links to ${name}, which is a redirect, not a page`);
  }
  for (const name of served) {
    for (const other of retired) {
      if (pages[name] && pages[name].includes(`/esa/${slugify(other)}`))
        fail(`/esa/${slugify(name)}: links to ${other}, which is a redirect, not a page`);
    }
  }
}

// 4 — every served state page self-canonicals and carries its own title, not the shared one.
for (const name of served) {
  const slug = slugify(name);
  const where = `/esa/${slug}`;
  const copy = landing.states.find((s) => s.slug === slug);
  must(pages[name], `rel="canonical" href="${SITE}/esa/${slug}"`, where);
  must(pages[name], `<title>${copy.seoTitle}</title>`, where);
  mustNot(pages[name], '<title>ESA Funding for bina — Parent Guide</title>', where);
}

// 5 — the merged page structure is present on every served state, server-rendered.
for (const name of served) {
  const slug = slugify(name);
  const where = `/esa/${slug}`;
  const copy = landing.states.find((s) => s.slug === slug);
  const d = byState[name];
  for (const text of [
    copy.h1, // hero
    copy.intro,
    landing.howItWorks.heroSchool,
    landing.howItWorks.fundingTitle, // how it works
    landing.howItWorks.schoolTitle,
    d.howMuch === undefined ? '' : copy.coverTitle, // the money
    'per child, per year',
    'a full year at bina, on the yearly plan',
    'Before you enroll — during bina admissions', // process
    'After you enroll',
    'Talk to bina first',
    `Apply for the ${d.prog}`,
    'Get approved and funded',
    'Enroll at bina',
    copy.timingTitle,
    d.applyWindow,
    d.approval,
    d.who,
    d.applyUrl,
    d.officialUrl,
    'id="process"',
  ]) {
    if (text) must(pages[name], text, where);
  }
  // The award has to be the same number the database holds — the page computes the remainder
  // from it, so a mismatch here is a wrong price in front of a parent.
  for (const n of new Set([copy.esaMin, copy.esaMax])) {
    const money = '$' + n.toLocaleString('en-US');
    if (!d.howMuch.includes(money))
      fail(`${where}: esa-landing.json says ${money} but esa-states.json says "${d.howMuch}"`);
  }
  // This state's own FAQ leads, and every question is really on the page.
  if (!copy.faq || copy.faq.length < 3) fail(`${where}: fewer than 3 state-specific FAQ entries`);
  for (const f of [...(copy.faq || []), ...landing.faq]) must(pages[name], f.q, where);
  // Idaho is a reimbursement; the other four are paid to bina. Never mix the two up.
  const reimbursed = copy.tier === 'reimbursed';
  must(pages[name], reimbursed ? 'Pay bina, then claim it back' : 'Pay tuition from your account', where);
  mustNot(pages[name], reimbursed ? 'Pay tuition from your account' : 'Pay bina, then claim it back', where);
}

// 6 — the index is a chooser with static destinations, and the legacy ?state= link still lands.
{
  const index = read('/esa');
  const where = '/esa';
  if (index === null) fail('/esa: no built page');
  for (const name of served) must(index, `/esa/${slugify(name)}`, `${where} (destination for ${name})`);
  must(index, "get('state')", `${where} (legacy ?state= deep link)`);
  must(index, "url.searchParams.delete('state')", `${where} (drop the legacy parameter)`);
  // 7 — nothing renders a state's answer into the page at runtime any more.
  mustNot(index, 'history.replaceState', where);
  mustNot(index, 'id="result"', where);
  mustNot(index, 'box.innerHTML', where);
  // 8 — the retired tiers are gone from the built output entirely.
  for (const gone of ['Coming soon', 'possible for some families — ask us', "doesn't have a program you can use"])
    mustNot(index, gone, where);
}

if (failures.length) {
  console.error(`✗ esa pages: ${failures.length} failure(s)`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `✓ esa pages: ${served.length} served state pages (${servedSlugs.join(', ')}), ` +
    `${retired.length} retired states redirecting to /esa, index chooser, legacy ?state= redirect`
);
