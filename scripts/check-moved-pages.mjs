/*
 * The pages that moved to thebinaschool.com (2026-11-23). Runs on dist/, so it proves what a
 * visitor receives: a redirect to the exact new URL that keeps the query string and hash, a
 * canonical to the new URL, noindex, and none of the old page content. Also: every retired ESA
 * state goes to the main site's /esa, and /book-adventure only bounces to the homepage (retired 2026-11-09).
 * Dependency-free on purpose.
 */
import { existsSync, readFileSync } from 'node:fs';

const landing = JSON.parse(readFileSync(new URL('../src/data/esa-landing.json', import.meta.url), 'utf8'));
const esa = JSON.parse(readFileSync(new URL('../src/data/esa-states.json', import.meta.url), 'utf8'));
const slug = (name) => name.toLowerCase().replace(/\s+/g, '-');
const dist = (path) => new URL(`../dist/${path}/index.html`, import.meta.url);

const MOVED = ['esa', ...landing.states.map((s) => `esa/${s.slug}`), 'student-results', 'family-survey', 'reviews', 'calendar'];
let failed = 0;
const fail = (msg) => { failed += 1; console.error(`  FAIL ${msg}`); };

for (const path of MOVED) {
  const file = dist(path);
  if (!existsSync(file)) { fail(`/${path}: dist/${path}/index.html missing`); continue; }
  const html = readFileSync(file, 'utf8');
  const to = `https://thebinaschool.com/${path}`;
  if (!html.includes(`<link rel="canonical" href="${to}"`)) fail(`/${path}: canonical is not ${to}`);
  if (!/<meta name="robots" content="noindex"/.test(html)) fail(`/${path}: not noindex`);
  if (!html.includes('location.replace(to + location.search + location.hash)')) fail(`/${path}: redirect drops query/hash`);
  if (!html.includes(JSON.stringify(to))) fail(`/${path}: redirect target is not ${to}`);
  if (!html.includes(`content="0;url=${to}"`)) fail(`/${path}: no meta-refresh fallback to ${to}`);
  if (html.length > 3000) fail(`/${path}: ${html.length} bytes, old page content still shipped?`);
}

const served = new Set(landing.states.map((s) => s.slug));
const retired = esa.allStates.map(slug).filter((s) => !served.has(s));
for (const s of [...retired.map((s) => `esa/${s}`), 'esa-guide']) {
  const file = dist(s);
  if (!existsSync(file)) { fail(`/${s}: redirect missing`); continue; }
  if (!readFileSync(file, 'utf8').includes('https://thebinaschool.com/esa"')) fail(`/${s}: does not redirect to thebinaschool.com/esa`);
}

const adventure = dist('book-adventure');
if (!existsSync(adventure) || !readFileSync(adventure, 'utf8').includes('url=https://thebinaschool.com/"') || readFileSync(adventure, 'utf8').length > 3000) {
  fail('/book-adventure must be only a redirect to the thebinaschool.com homepage');
}

if (failed) { console.error(`check-moved-pages: ${failed} failure(s)`); process.exit(1); }
console.log(`check-moved-pages: ${MOVED.length} moved pages redirect to thebinaschool.com with query + hash; ${retired.length} retired states + /esa-guide → thebinaschool.com/esa; /book-adventure → homepage`);
