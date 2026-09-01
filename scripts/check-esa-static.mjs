/*
 * Acceptance check — the /esa state pages must be real static HTML, not a dropdown that
 * swaps content behind a ?state= parameter. Runs on the built output in dist/ so it proves
 * what a crawler actually receives, not what the source looks like.
 *
 * Dependency-free on purpose: node + the built files, nothing else. Runs as part of
 * `pnpm build`, so the build fails before a dynamic-variant regression can ship.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');
const SITE = 'https://go.bina.school';

const esa = JSON.parse(readFileSync(join(ROOT, 'src/data/esa-states.json'), 'utf8'));
const { programs, allStates, noProgramNotes } = esa;

/** Same slug rule the pages build with — kept here independently so a drift shows up. */
const slugify = (name) => name.toLowerCase().replace(/\s+/g, '-');

const stateNames = Array.from(new Set(allStates.concat(programs.map((p) => p.s)))).sort();
const byState = Object.fromEntries(programs.map((p) => [p.s, p]));

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

// 1 — every state the picker offers is a real built page, and nothing else lives under /esa.
const pages = {};
for (const name of stateNames) {
  const route = `/esa/${slugify(name)}`;
  pages[name] = read(route);
  if (pages[name] === null) fail(`${route}: no built page (expected dist${route}/index.html)`);
}
if (stateNames.length !== 50) fail(`expected 50 states from esa-states.json, got ${stateNames.length}`);

const builtDirs = existsSync(join(DIST, 'esa'))
  ? readdirSync(join(DIST, 'esa'), { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort()
  : [];
const expectedDirs = stateNames.map(slugify).sort();
const extra = builtDirs.filter((d) => !expectedDirs.includes(d));
if (extra.length) fail(`/esa has routes outside the state set (a second page system?): ${extra.join(', ')}`);

// 2 — every state page self-canonicals to its own static URL.
for (const name of stateNames) {
  const where = `/esa/${slugify(name)}`;
  must(pages[name], `rel="canonical" href="${SITE}/esa/${slugify(name)}"`, where);
  // Akis asked for a URL change only: keep the existing /esa title, hero and visible copy.
  must(pages[name], '<title>ESA Funding for bina — Parent Guide</title>', where);
  mustNot(pages[name], `</span> in ${name}?`, where);
  mustNot(pages[name], 'go.bina.school/esa/your-state', where);
}

// 3 — Arizona (an approved program state) is server-rendered, not injected at runtime.
{
  const az = byState.Arizona;
  const where = '/esa/arizona';
  const html = pages.Arizona;
  for (const text of [
    az.prog,
    az.who,
    az.howMuch,
    az.boost,
    az.applyWindow,
    az.approval,
    '✓ bina is an approved provider',
    'Yes — the state pays bina directly from your account.',
    'Before you enroll — during bina admissions',
    'After you enroll',
    'Talk to bina first',
    `Apply for the ${az.prog}`,
    'Get approved & funded',
    'Enroll at bina',
    'Pay tuition from your account',
    az.applyUrl,
    az.officialUrl,
    az.binaUrl,
  ]) {
    must(html, text, where);
  }
}

// 4 — a no-program state gives the same honest answer it gave in the dropdown.
{
  must(pages.California, "California doesn't have a program you can use for bina yet.", '/esa/california');
  must(pages.California, noProgramNotes.California, '/esa/california');
  must(pages.Alaska, "Alaska doesn't have a program you can use for bina yet.", '/esa/alaska');
}

// 5 — the index still picks states, but the picker's destinations are static URLs.
{
  const index = read('/esa');
  const where = '/esa';
  if (index === null) fail('/esa: no built page');
  for (const name of stateNames) must(index, `/esa/${slugify(name)}`, `${where} (destination for ${name})`);
  must(index, 'location.assign', where);
  must(index, 'target.search = location.search', `${where} (preserve attribution on picker navigation)`);
  must(index, "target.searchParams.delete('state')", `${where} (remove legacy state parameter)`);
  // 6 — legacy ?state=Arizona deep links still land on the matching static page.
  must(index, "get('state')", where);
  must(index, "url.searchParams.delete('state')", `${where} (preserve attribution on legacy redirect)`);
  // 7 — nothing renders a state result into the page at runtime any more.
  mustNot(index, 'history.replaceState', where);
  mustNot(index, 'id="result"', where);
  mustNot(index, 'box.innerHTML', where);
}

if (failures.length) {
  console.error(`✗ esa static pages: ${failures.length} failure(s)`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(`✓ esa static pages: ${stateNames.length} state routes, index picker, legacy ?state= redirect`);
