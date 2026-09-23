// Actual inline gate in a minimal DOM. SDK doubles check the gate, not vendor ordering.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const layout = readFileSync(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');
const gate = [...layout.matchAll(/<script is:inline>([\s\S]*?)<\/script>/g)].map((m) => m[1]).find((s) => s.includes('window.posthog.init'));
assert.ok(gate);
function fixture(consent, hostname = 'go.bina.school', userAgent = 'LocalFixture') {
  const requests = [], calls = [], listeners = {};
  const window = { location: { hostname } };
  const document = {
    addEventListener: (name, callback) => { listeners[name] = callback; },
    createElement: () => ({ remove() {} }),
    getElementsByTagName: () => [{ parentNode: { insertBefore: (el) => requests.push(el) } }],
  };
  function set(value) {
    if (value === 'missing') delete window.getCkyConsent;
    else window.getCkyConsent = () => { if (value === 'throw') throw Error('blocked'); return value; };
  }
  set(consent);
  vm.runInNewContext(gate, { window, document, navigator: { userAgent } });
  return { requests, calls, set,
    event(name = 'cookieyes_consent_update', detail = { accepted: ['analytics'] }) { listeners[name]?.({ detail }); },
    arrive() {
      window.posthog = Object.fromEntries(['init', 'opt_in_capturing', 'opt_out_capturing', 'startSessionRecording', 'stopSessionRecording'].map((name) => [name, () => calls.push(name)]));
      requests.at(-1).onload?.();
    },
  };
}
const grant = { categories: { analytics: true }, isUserActionCompleted: false };
const denied = { categories: { analytics: false } };
for (const [name, returning, completed] of [['fresh explicit', false, true], ['fresh automatic', false, false], ['returning', true, true]]) test(`${name} grant waits for SDK and initializes once`, () => {
  const consent = { ...grant, isUserActionCompleted: completed };
  const f = fixture(returning ? consent : denied);
  f.set(consent); f.event('cookieyes_banner_load', { categories: { analytics: false } }); f.event();
  assert.equal(f.requests.length, 1); assert.deepEqual(f.calls, []);
  f.arrive(); f.event(); f.event('cookieyes_banner_load');
  assert.equal(f.requests.length, 1);
  assert.equal(f.calls.filter((c) => c === 'init').length, 1);
  assert.equal(f.calls.filter((c) => c === 'opt_in_capturing').length, 1);
});
test('revoke stops capture and replay; repeated rejection is idle; regrant resumes once', () => {
  const f = fixture(grant); f.arrive(); f.calls.length = 0;
  f.set(denied); f.event(); f.event();
  assert.deepEqual(f.calls, ['opt_out_capturing', 'stopSessionRecording']);
  f.set(grant); f.event(); f.event();
  assert.deepEqual(f.calls.slice(2), ['opt_in_capturing', 'startSessionRecording']);
  assert.equal(f.requests.length, 1);
});
for (const value of ['missing', 'throw', {}]) test(`API loss stops initialized capture: ${JSON.stringify(value)}`, () => {
  const f = fixture(grant); f.arrive(); f.calls.length = 0;
  f.set(value); f.event();
  assert.deepEqual(f.calls, ['opt_out_capturing', 'stopSessionRecording']);
});
for (const value of [denied, 'missing', 'throw', {}]) test(`SDK arriving after revoke/API loss cannot initialize: ${JSON.stringify(value)}`, () => {
  const f = fixture(grant); f.set(value); f.event(); f.arrive();
  assert.deepEqual(f.calls, []);
  f.set(grant); f.event();
  assert.equal(f.calls.filter((c) => c === 'init').length, 1);
  assert.equal(f.requests.length, 1);
});
test('grant/revoke/regrant during download uses final getter state', () => {
  const f = fixture(grant); f.set(denied); f.event(); f.set(grant); f.event(); f.arrive();
  assert.equal(f.requests.length, 1); assert.equal(f.calls.filter((c) => c === 'init').length, 1);
});
test('SDK failure can retry on a later grant event', () => {
  const f = fixture(grant); f.requests[0].onerror?.(); f.event();
  assert.equal(f.requests.length, 2); f.arrive();
  assert.equal(f.calls.filter((c) => c === 'init').length, 1);
});
for (const [host, ua] of [['localhost', 'LocalFixture'], ['go.bina.school.evil.test', 'LocalFixture'], ['go.bina.school', 'HeadlessChrome'], ['go.bina.school', 'ReactSnap']]) {
  test(`existing host/bot exclusion: ${host} ${ua}`, () => assert.equal(fixture(grant, host, ua).requests.length, 0));
}
for (const [name, value] of Object.entries({ missing: 'missing', throwing: 'throw', null: null, absentCategories: {}, absentAnalytics: { categories: {} }, false: denied, stringTrue: { categories: { analytics: 'true' } } })) {
  test(`denies ${name} even when event payload claims grant`, () => {
    const f = fixture(value); f.event('cookieyes_banner_load'); f.event();
    assert.equal(f.requests.length, 0); assert.deepEqual(f.calls, []);
  });
}

test('build includes the actual PostHog gate regression', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.match(pkg.scripts.build, /node scripts\/check-posthog-consent\.mjs/);
});
