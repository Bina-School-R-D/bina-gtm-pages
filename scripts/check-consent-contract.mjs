// Offline proposal validation only. The compiled resource is evidence, never an editable export.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

const evidence = process.argv[2];
const baseline = process.argv[3] === 'baseline';
const readEvidence = (name) => readFileSync(resolve(evidence, name), 'utf8');
const oldKey = '815e2d032929805e004eec67b12f2714';
const goKey = 'a0152240f952608c3aef584b8e6b3210';
const resource = evidence && JSON.parse(readEvidence('current-gtm-resource.json'));
const contract = baseline ? {
  rows: [], defaultValue: resource.tags[15].vtp_websiteKey,
  goRuleCondition: JSON.parse(readEvidence('new-rules.json'))[0].condition,
} : JSON.parse(readFileSync(new URL('../docs/go-consent-proposal.json', import.meta.url), 'utf8'));
const lookup = (hostname) => contract.rows.find((row) => row.hostname === hostname)?.websiteKey ?? contract.defaultValue;
for (const host of ['go.bina.school', 'thebinaschool.com', 'www.thebinaschool.com', 'form.thebinaschool.com', 'other.bina.school', 'go.bina.school.evil.test', 'unrelated.example', '']) {
  test(`hostname lookup: ${host || '(empty)'}`, () => assert.equal(lookup(host), host === 'go.bina.school' ? goKey : oldKey));
}
test('go property preserves EU/UK-only selection', () => assert.equal(contract.goRuleCondition, "regionName IS 'EU_UK'"));
if (!baseline) test('proposal scope is one exact row and unchanged CMP settings', () => {
  assert.equal(contract.status, 'offline-proposal'); assert.equal(contract.input, 'Page Hostname');
  assert.deepEqual(contract.rows, [{ hostname: 'go.bina.school', websiteKey: goKey }]);
  assert.deepEqual(contract.preserve, { tag_id: 92, function: '__cvt_KDQSW', waitForTime: '2000', urlPassThrough: false, adsRedaction: false, firing: 'Consent Initialization - All Pages' });
  assert.equal(contract.goActiveLaw, 'gdpr');
});
if (evidence && !baseline) {
  test('saved compiled CMP matches the preservation contract; other tags stay identical in the proposal model', () => {
    const cmp = resource.tags[15];
    assert.equal(cmp.tag_id, contract.preserve.tag_id); assert.equal(cmp.function, contract.preserve.function);
    assert.equal(cmp.vtp_websiteKey, oldKey);
    for (const key of ['waitForTime', 'urlPassThrough', 'adsRedaction']) assert.equal(cmp[`vtp_${key}`], contract.preserve[key]);
    for (const host of ['go.bina.school', 'thebinaschool.com', 'form.thebinaschool.com']) {
      const modeled = structuredClone(resource);
      modeled.tags[15].vtp_websiteKey = lookup(host);
      if (host !== 'go.bina.school') assert.deepEqual(modeled, resource);
      modeled.tags[15].vtp_websiteKey = oldKey; assert.deepEqual(modeled, resource);
    }
    assert.match(JSON.stringify(resource), /generate_lead/); assert.match(JSON.stringify(resource), /bina\.lead_submitted/);
  });
  test('saved new rule differs; proposed selector matches established main rule without editing either', () => {
    assert.equal(JSON.parse(readEvidence('new-rules.json'))[0].condition, 'all');
    assert.equal(JSON.parse(readEvidence('old-rules.json'))[0].condition, contract.goRuleCondition);
    for (const name of ['new-config.json', 'old-config.json']) assert.equal(JSON.parse(readEvidence(name)).activeLaw, contract.goActiveLaw);
  });
  test('exact CookieYes getter and document dispatcher expose resolved booleans and distinct event details', () => {
    const source = readEvidence('new-banner.js');
    const start = source.indexOf('window.getCkyConsent=function()');
    assert.ok(start >= 0);
    let end = source.indexOf('{', start), depth = 1;
    while (depth && ++end < source.length) { if (source[end] === '{') depth++; if (source[end] === '}') depth--; }
    const getter = source.slice(start, end + 1);
    const dispatcher = source.match(/function f\(e,t\)\{const n=new CustomEvent\(e,\{detail:t\}\);document.dispatchEvent\(n\)\}/)?.[0];
    assert.ok(dispatcher, 'exact source dispatcher');
    assert.ok(source.includes('f("cookieyes_banner_load",getCkyConsent())'));
    assert.ok(source.includes('f("cookieyes_consent_update",t),v(),L()'), 'no-banner automatic grant dispatch');
    const state = { analytics: 'no', action: 'no' }, events = [];
    const context = { window: {}, e: { _ckyStore: { _bannerConfig: {}, _categories: [{ slug: 'analytics' }], _language: { _active: 'en' } }, _ckyGetFromStore: (key) => state[key] },
      document: { dispatchEvent: (event) => events.push(event) }, CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } } };
    vm.createContext(context); vm.runInContext(`${getter};${dispatcher}`, context);
    assert.equal(context.window.getCkyConsent().categories.analytics, false);
    state.analytics = 'yes'; assert.equal(context.window.getCkyConsent().categories.analytics, true);
    vm.runInContext('f("cookieyes_banner_load",window.getCkyConsent());f("cookieyes_consent_update",{accepted:["analytics"],rejected:[]})', context);
    assert.equal(events[0].detail.categories.analytics, true); assert.equal(events[1].detail.accepted[0], 'analytics');
    assert.equal(events[1].detail.categories, undefined);
  });
}
if (!baseline) test('build enforces the local attribution and consent proposal checks', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.match(pkg.scripts.build, /node scripts\/check-attribution\.mjs/);
  assert.match(pkg.scripts.build, /node scripts\/check-consent-contract\.mjs/);
});
