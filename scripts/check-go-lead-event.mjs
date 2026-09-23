// Exercise the actual go booking-page script with an in-memory DOM. No network or CRM writes.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const page = readFileSync(new URL('../src/pages/book-adventure.astro', import.meta.url), 'utf8');
const source = page.match(/<script define:vars=\{\{ ageGroups, campaign, WEBHOOK \}\}>([\s\S]*?)<\/script>/)?.[1];
assert.ok(source, 'booking-page inline script');
const { campaign, ageGroups } = JSON.parse(readFileSync(new URL('../src/data/book-adventure.json', import.meta.url), 'utf8'));

function fixture({ beacon = true, honeypot = '', childName = 'QA Child', email = 'qa@example.test', age = '6-8', search = '?utm_source=internal_qa&utm_medium=qa&utm_campaign=go_test&gclid=synthetic' } = {}) {
  const calls = [], listeners = {};
  const timers = new Map();
  let clock = 0, nextTimer = 0;
  const error = { textContent: '', classList: { toggle() {} } };
  const contactForm = {
    dataset: { step: '2' }, hidden: true,
    elements: { name: { value: '' }, email: { value: '' }, phone: { value: '' }, website: { value: honeypot } },
    addEventListener: (name, cb) => { listeners[`contact:${name}`] = cb; },
    querySelector: () => error,
  };
  const childForm = {
    dataset: { step: '3' }, hidden: true, elements: { child_name: { value: childName } },
    addEventListener: (name, cb) => { listeners[`child:${name}`] = cb; },
    querySelector: () => error,
    querySelectorAll: () => ageButtons,
  };
  const ageButtons = ageGroups.map((g) => ({ dataset: { age: g.value },
    addEventListener: (name, cb) => { listeners[`age:${g.value}:${name}`] = cb; },
    setAttribute() {} }));
  const intro = { dataset: { step: '1' }, hidden: false };
  const document = {
    referrer: '',
    querySelector: (selector) => ({ '[data-next]': { addEventListener: (name, cb) => { listeners[`next:${name}`] = cb; } },
      'form[data-step="2"]': contactForm, 'form[data-step="3"]': childForm,
      '.card-bina': { scrollIntoView() {} } })[selector],
    querySelectorAll: (selector) => selector === '[data-step]' ? [intro, contactForm, childForm] : [],
  };
  const location = { search,
    href: 'https://go.bina.school/book-adventure/?utm_source=internal_qa',
    assign: (url) => calls.push(['redirect', url]) };
  const queue = [];
  queue.push = (message) => { calls.push(['event', message]); return Array.prototype.push.call(queue, message); };
  const window = { dataLayer: queue,
    setTimeout: (callback, ms) => { const id = ++nextTimer; timers.set(id, { callback, due: clock + ms }); return id; },
    clearTimeout: (id) => timers.delete(id) };
  const navigator = { sendBeacon: (url, body) => {
    calls.push(['beacon', url, body]);
    if (beacon === 'throws') throw Error('beacon unavailable');
    return beacon;
  } };
  vm.runInNewContext(source, { window, document, location, navigator, URLSearchParams, Blob,
    crypto: { randomUUID: () => 'synthetic-uuid' }, ageGroups, campaign,
    WEBHOOK: 'https://example.test/webhook' });
  contactForm.elements.name.value = 'QA Parent';
  contactForm.elements.email.value = email;
  listeners['contact:submit']({ preventDefault() {} });
  if (age) listeners[`age:${age}:click`]?.();
  return { calls, window, childForm, submit: () => listeners['child:submit']({ preventDefault() {} }),
    completeTag: () => queue.find((x) => x.event === 'bina.lead_submitted')?.eventCallback(),
    advance(ms) {
      clock += ms;
      for (const [id, timer] of [...timers]) if (timer.due <= clock) { timers.delete(id); timer.callback(); }
    } };
}

const conversions = (f) => f.window.dataLayer?.filter((x) => x.event === 'bina.lead_submitted') || [];

test('a valid queued lead emits the existing GTM event before redirect, without personal data', async () => {
  const f = fixture();
  f.submit();
  assert.deepEqual(f.calls.map(([kind]) => kind), ['beacon', 'event']);
  assert.equal(f.calls[0][1], 'https://example.test/webhook');
  const payload = JSON.parse(await f.calls[0][2].text());
  assert.equal(payload.submission_id, 'book-adventure-synthetic-uuid');
  assert.equal(payload.email, 'qa@example.test');
  assert.equal(conversions(f).length, 1);
  const { eventCallback, eventTimeout, ...eventData } = conversions(f)[0];
  assert.equal(typeof eventCallback, 'function');
  assert.equal(eventTimeout, 500);
  assert.deepEqual(JSON.parse(JSON.stringify(eventData)), {
    event: 'bina.lead_submitted', bina_lead_form_name: 'book-adventure',
  });
  assert.ok(!JSON.stringify(conversions(f)).includes('qa@example.test'));
  assert.ok(!JSON.stringify(conversions(f)).includes('QA Parent'));
  assert.ok(!JSON.stringify(conversions(f)).includes('QA Child'));
  f.completeTag();
  assert.deepEqual(f.calls.map(([kind]) => kind), ['beacon', 'event', 'redirect']);
  assert.match(f.calls[2][1], /^https:\/\//);
  f.advance(500);
  assert.equal(f.calls.filter(([kind]) => kind === 'redirect').length, 1);
});

test('slow or missing GTM cannot hold the valid redirect beyond 500 ms', () => {
  const f = fixture(); f.submit();
  f.advance(499);
  assert.equal(f.calls.filter(([kind]) => kind === 'redirect').length, 0);
  f.advance(1);
  assert.deepEqual(f.calls.map(([kind]) => kind), ['beacon', 'event', 'redirect']);
  f.completeTag();
  assert.equal(f.calls.filter(([kind]) => kind === 'redirect').length, 1);
});

test('two final-submit attempts queue one lead and one conversion', async () => {
  const f = fixture(); f.submit(); f.submit();
  assert.deepEqual(f.calls.map(([kind]) => kind), ['beacon', 'event']);
  assert.equal(conversions(f).length, 1);
  const payload = JSON.parse(await f.calls[0][2].text());
  assert.equal(payload.submission_id, 'book-adventure-synthetic-uuid');
  f.completeTag(); f.submit(); f.advance(500);
  assert.deepEqual(f.calls.map(([kind]) => kind), ['beacon', 'event', 'redirect']);
});

test('untrusted campaign values never enter the analytics event', async () => {
  const f = fixture({ search: '?utm_source=qa_parent_jane_doe&utm_medium=qa&utm_campaign=alice%40example.test&utm_content=555-123-4567' });
  f.submit();
  assert.equal(conversions(f).length, 1);
  assert.equal(Object.hasOwn(conversions(f)[0], 'bina_lead_attribution'), false);
  assert.ok(!JSON.stringify(conversions(f)).includes('qa_parent_jane_doe'));
  assert.ok(!JSON.stringify(conversions(f)).includes('alice@example.test'));
  assert.ok(!JSON.stringify(conversions(f)).includes('555-123-4567'));
  const payload = JSON.parse(await f.calls[0][2].text());
  assert.equal(payload.utm_campaign, 'alice@example.test', 'the existing n8n webhook contract stays unchanged');
});

test('an invalid child form emits no lead event and does not redirect', () => {
  const f = fixture({ childName: '' }); f.submit();
  assert.deepEqual(f.calls, []); assert.equal(conversions(f).length, 0);
});

test('the honeypot skips beacon and lead event while preserving redirect', () => {
  const f = fixture({ honeypot: 'bot' }); f.submit();
  assert.deepEqual(f.calls.map(([kind]) => kind), ['redirect']); assert.equal(conversions(f).length, 0);
});

for (const beacon of [false, 'throws']) test(`a ${beacon} beacon does not count a queued lead`, () => {
  const f = fixture({ beacon }); f.submit();
  assert.equal(conversions(f).length, 0);
  assert.equal(f.calls.at(-1)[0], 'redirect');
});

test('build runs the go lead-event regression', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.match(pkg.scripts.build, /node scripts\/check-go-lead-event\.mjs/);
});
