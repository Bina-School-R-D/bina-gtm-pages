// Executes the actual helper in a synthetic DOM. Optional saved HTML/main helper are fixture-only.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import test from 'node:test';

const source = readFileSync(new URL('../public/attribution.js', import.meta.url), 'utf8');
const evidence = process.argv[2];
const campaign = '?utm_source=test-source&utm_medium=cpc&utm_campaign=test-campaign&utm_content=cta&utm_term=school&gclid=test-click&ref=test-partner&email=excluded';
const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'ref'];
function element(value, attr = 'href') {
  const attrs = { [attr]: value };
  return { tagName: attr === 'href' ? 'A' : 'BUTTON', parentNode: null,
    getAttribute: (name) => attrs[name] ?? null, setAttribute: (name, v) => { attrs[name] = v; } };
}
function run({ elements = [], search = campaign, stored = {}, blocked = false, code = source, host = 'go.bina.school', ready = 'complete', agent = 'LocalFixture' } = {}) {
  const data = new Map(Object.entries(stored));
  const listeners = {}, timers = [];
  const document = { readyState: ready,
    addEventListener: (name, fn, capture) => { listeners[name] = { fn, capture }; },
    querySelectorAll: (selector) => elements.filter((el) => el.getAttribute(selector === 'a[href]' ? 'href' : selector.slice(1, -1)) !== null) };
  const storage = (fn) => (...args) => { if (blocked) throw Error('Storage blocked'); return fn(...args); };
  const window = { location: { hostname: host, href: `https://${host}/esa/arizona${search}`, search },
    setTimeout: (fn) => timers.push(fn), requestIdleCallback: (fn) => timers.push(fn) };
  vm.runInNewContext(code, { window, document, navigator: { userAgent: agent }, URL, URLSearchParams, Date,
    localStorage: { getItem: storage((k) => data.get(k) ?? null), setItem: storage((k, v) => data.set(k, v)), removeItem: storage((k) => data.delete(k)) } });
  return { data, document, start: () => listeners.DOMContentLoaded?.fn(), flush: () => timers.splice(0).forEach((fn) => fn()),
    click: (el) => { assert.equal(listeners.click.capture, true); listeners.click.fn({ target: { parentNode: el } }); } };
}
function params(el, attr = 'href') { return new URL(el.getAttribute(attr)).searchParams; }
function allParams(el, attr = 'href') {
  for (const key of keys) assert.equal(params(el, attr).get(key), new URLSearchParams(campaign).get(key), key);
  assert.equal(params(el, attr).has('email'), false);
}
for (const state of ['arizona', 'idaho', 'new-hampshire', 'utah', 'wyoming']) {
  test(`${state}: actual page main-site CTAs carry the whitelisted first touch`, () => {
    const file = evidence ? resolve(evidence, `${state}.html`) : new URL(`../dist/esa/${state}/index.html`, import.meta.url);
    const html = readFileSync(file, 'utf8');
    const links = [...html.matchAll(/<a\b[^>]*\bhref="(https:\/\/thebinaschool\.com(?:\/)?(?:\?[^"#]*)?(?:#[^"]*)?)"/g)].map((m) => element(m[1].replaceAll('&amp;', '&')));
    assert.ok(links.length > 0, 'observed main-site CTA must exist');
    run({ elements: links }).flush();
    links.forEach((el) => allParams(el));
  });
}
for (const attr of ['href', 'data-href', 'data-url', 'data-link']) {
  for (const host of ['thebinaschool.com', 'form.thebinaschool.com']) {
    test(`${host} ${attr}: static and dynamic nested click`, () => {
      const staticEl = element(`https://${host}/`, attr);
      const dynamicEl = element(`https://${host}/`, attr);
      const env = run({ elements: [staticEl], ready: 'loading' });
      env.start(); env.flush(); env.click(dynamicEl); env.click(dynamicEl);
      allParams(staticEl, attr); allParams(dynamicEl, attr);
    });
  }
}
test('destination values, hash and unrelated query survive', () => {
  const el = element('https://thebinaschool.com/?ref=manual&utm_source=destination&other=keep#apply');
  run({ elements: [el] }).flush();
  assert.equal(params(el).get('ref'), 'manual'); assert.equal(params(el).get('utm_source'), 'destination');
  assert.equal(params(el).get('other'), 'keep'); assert.equal(new URL(el.getAttribute('href')).hash, '#apply');
});
test('first touch wins; missing keys use current URL; legacy ref survives', () => {
  const el = element('https://form.thebinaschool.com/new');
  const stored = { bina_attribution: JSON.stringify({ utm_source: 'first', email: 'excluded' }), bina_ref: 'legacy' };
  const env = run({ elements: [el], stored }); env.flush();
  assert.equal(params(el).get('utm_source'), 'first'); assert.equal(params(el).get('ref'), 'legacy');
  assert.equal(params(el).get('gclid'), 'test-click'); assert.equal(params(el).has('email'), false);
  assert.equal(env.data.get('bina_attribution'), stored.bina_attribution);
});
test('365-day expiry and storage failures retain URL fallback', () => {
  for (const options of [
    { stored: { bina_attribution: '{"utm_source":"expired"}', bina_attribution_ts: String(Date.now() - 366 * 86400000) } },
    { blocked: true }, { stored: { bina_attribution: '{broken' } },
  ]) { const el = element('https://thebinaschool.com'); run({ ...options, elements: [el] }).flush(); allParams(el); }
});
test('first touch persists; no attribution and headless controls stay unchanged', () => {
  const env = run(); assert.equal(JSON.parse(env.data.get('bina_attribution')).ref, 'test-partner');
  for (const options of [{ search: '' }, { agent: 'HeadlessChrome' }]) {
    const el = element('https://thebinaschool.com'); run({ ...options, elements: [el] }).flush();
    assert.equal(el.getAttribute('href'), 'https://thebinaschool.com');
  }
});
test('no leakage to external/lookalike hosts, unsupported schemes, or unobserved main paths', () => {
  for (const value of ['https://external.example', 'https://thebinaschool.com.evil.test', 'https://form.thebinaschool.com.evil.test',
    'https://thebinaschool.com@evil.test', 'https://www.thebinaschool.com', 'https://thebinaschool.com/privacy',
    'ftp://form.thebinaschool.com/new', 'javascript://form.thebinaschool.com/new', 'mailto:form.thebinaschool.com', 'http://thebinaschool.com', 'https://[bad']) {
    for (const attr of ['href', 'data-href', 'data-url', 'data-link']) {
      const el = element(value, attr); const env = run({ elements: [el] }); env.flush(); env.click(el);
      assert.equal(el.getAttribute(attr), value, value);
    }
  }
});
test('existing HTTP form and protocol-relative form controls', () => {
  for (const value of ['http://form.thebinaschool.com/new', '//form.thebinaschool.com/new']) {
    const el = element(value); run({ elements: [el] }).flush(); allParams(el);
  }
});
if (evidence) test('fixture-only go to main to form executes the saved real main helper', () => {
  const main = element('https://thebinaschool.com'); run({ elements: [main] }).flush();
  const form = element('https://form.thebinaschool.com/new#apply');
  const env = run({ code: readFileSync(resolve(evidence, 'main-attribution.js'), 'utf8'), host: 'thebinaschool.com', search: new URL(main.getAttribute('href')).search, elements: [form] });
  env.flush(); env.click(form); allParams(form);
});
