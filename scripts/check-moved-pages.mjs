/*
 * Checks the pages that moved to thebinaschool.com (Asana 1217839991568791). Runs on dist/,
 * so it proves what a visitor receives: a redirect to the exact new URL that keeps the query
 * string and hash, a canonical to the new URL, noindex, and none of the old page content.
 * Dependency-free on purpose.
 */
import { existsSync, readFileSync } from 'node:fs';

const MOVED = ['student-results', 'family-survey', 'reviews', 'calendar'];
let failed = 0;
const fail = (msg) => { failed += 1; console.error(`  FAIL ${msg}`); };

for (const slug of MOVED) {
  const file = new URL(`../dist/${slug}/index.html`, import.meta.url);
  if (!existsSync(file)) { fail(`/${slug}: dist/${slug}/index.html missing`); continue; }
  const html = readFileSync(file, 'utf8');
  const to = `https://thebinaschool.com/${slug}`;
  if (!html.includes(`<link rel="canonical" href="${to}"`)) fail(`/${slug}: canonical is not ${to}`);
  if (!/<meta name="robots" content="noindex"/.test(html)) fail(`/${slug}: not noindex`);
  if (!html.includes('location.replace(to + location.search + location.hash)')) fail(`/${slug}: redirect drops query/hash`);
  if (!html.includes(JSON.stringify(to))) fail(`/${slug}: redirect target is not ${to}`);
  if (!html.includes(`content="0;url=${to}"`)) fail(`/${slug}: no meta-refresh fallback to ${to}`);
  if (html.length > 3000) fail(`/${slug}: ${html.length} bytes, old page content still shipped?`);
}

const adventure = new URL('../dist/book-adventure/index.html', import.meta.url);
if (!existsSync(adventure) || readFileSync(adventure, 'utf8').includes('location.replace(to +')) {
  fail('/book-adventure must stay a real page');
}

if (failed) { console.error(`check-moved-pages: ${failed} failure(s)`); process.exit(1); }
console.log(`check-moved-pages: ${MOVED.length} moved pages redirect to thebinaschool.com with query + hash; /book-adventure untouched`);
