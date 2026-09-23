/*
 * bina — first-touch attribution for go.bina.school
 *
 * A port of https://thebinaschool.com/attribution.js (BINA-19 / BINA-20, Lorraine's
 * tracking review 2026-06-17). Same contract, same storage key, same decorate-on-click
 * mechanism, so a lead captured from these pages reaches the form — and Close — with the
 * identical parameter set a lead from the main site does.
 *
 * What it does
 *   1. Captures utm_source/medium/campaign/content/term + gclid + the affiliate `ref`
 *      from the landing URL and persists the FIRST set it ever sees (localStorage).
 *   2. Appends those params to form links and the observed HTTPS main-site homepage
 *      CTAs, carrying the first touch to the main helper and then the form.
 *
 * Three deliberate differences from the main-site file, all documented in CLAUDE.md:
 *   - Also decorates https://thebinaschool.com/ (query/hash allowed), the ESA CTA.
 *   - The stored set expires after 365 days (the main site keeps it forever). Matches the
 *     partner-program window and beats any real ad attribution window.
 *   - Reads the legacy `bina_ref` key written by the old inline snippet on this domain, so
 *     partner links shared before this shipped keep attributing.
 * localStorage is per-origin: a first touch stored here is NOT visible on
 * thebinaschool.com, which is exactly why the params are carried on the URL instead.
 */
(function () {
  'use strict';

  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  // Skip under headless prerenderers so snapshots / storage stay clean (mirrors the main site).
  if (typeof navigator !== 'undefined' && /ReactSnap|HeadlessChrome/i.test(navigator.userAgent || '')) return;

  var FORM_HOST = 'form.thebinaschool.com';
  var STORE_KEY = 'bina_attribution'; // same key name as the main site
  var STORE_TS_KEY = 'bina_attribution_ts';
  var LEGACY_REF_KEY = 'bina_ref';
  var MAX_DAYS = 365;
  var PARAM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'ref'];
  var DATA_ATTRS = ['data-href', 'data-url', 'data-link']; // non-anchor CTA patterns

  function readUrlParams() {
    var out = {};
    try {
      var sp = new URLSearchParams(window.location.search);
      for (var i = 0; i < PARAM_KEYS.length; i++) {
        var v = sp.get(PARAM_KEYS[i]);
        if (v) out[PARAM_KEYS[i]] = v;
      }
    } catch (e) {
      /* no-op */
    }
    return out;
  }

  // First-touch: persist the first non-empty set we see; never overwrite a later visit.
  function persistFirstTouch() {
    var current = readUrlParams();
    if (!Object.keys(current).length) return;
    try {
      if (!localStorage.getItem(STORE_KEY)) {
        localStorage.setItem(STORE_KEY, JSON.stringify(current));
        localStorage.setItem(STORE_TS_KEY, String(Date.now()));
      }
    } catch (e) {
      /* storage blocked (private mode / ITP) — degrade to URL-only */
    }
  }

  function storedParams() {
    try {
      var ts = parseInt(localStorage.getItem(STORE_TS_KEY) || '0', 10);
      if (ts && (Date.now() - ts) / 86400000 > MAX_DAYS) {
        localStorage.removeItem(STORE_KEY);
        localStorage.removeItem(STORE_TS_KEY);
        return {};
      }
      var out = JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {};
      // Legacy inline snippet stored a bare ref under its own key.
      if (!out.ref) {
        var legacy = localStorage.getItem(LEGACY_REF_KEY);
        if (legacy) out.ref = legacy;
      }
      return out;
    } catch (e) {
      return {};
    }
  }

  // First-touch wins; fall back to the live URL for anything not stored
  // (e.g. a same-session gclid that arrived after the stored first touch).
  function attribution() {
    var stored = storedParams();
    var current = readUrlParams();
    var merged = {};
    for (var i = 0; i < PARAM_KEYS.length; i++) {
      var k = PARAM_KEYS[i];
      if (stored[k] != null) merged[k] = stored[k];
      else if (current[k] != null) merged[k] = current[k];
    }
    return merged;
  }

  function isAttributionUrl(value) {
    if (!value) return false;
    try {
      var url = new URL(value, window.location.href);
      if (!/^https?:$/.test(url.protocol) || url.username || url.password) return false;
      return url.hostname === FORM_HOST ||
        (url.origin === 'https://thebinaschool.com' && url.pathname === '/');
    } catch (e) {
      return false;
    }
  }

  // Append attribution to an allowed URL. Never overwrites a param already there,
  // so re-running on the same element (or a manual ?ref= on the link) is a no-op.
  function withAttribution(value) {
    var data = attribution();
    var keys = Object.keys(data);
    if (!keys.length) return value;
    try {
      var url = new URL(value, window.location.href);
      for (var i = 0; i < keys.length; i++) {
        if (!url.searchParams.has(keys[i])) url.searchParams.set(keys[i], data[keys[i]]);
      }
      return url.toString();
    } catch (e) {
      return value;
    }
  }

  // Static pass: decorate CTAs present at load (covers right-click "copy link" too). Cheap.
  function decorate(scope) {
    var root = scope || document;
    var anchors = root.querySelectorAll('a[href]');
    for (var i = 0; i < anchors.length; i++) {
      var href = anchors[i].getAttribute('href');
      if (isAttributionUrl(href)) anchors[i].setAttribute('href', withAttribution(href));
    }
    for (var d = 0; d < DATA_ATTRS.length; d++) {
      var attr = DATA_ATTRS[d];
      var els = root.querySelectorAll('[' + attr + ']');
      for (var j = 0; j < els.length; j++) {
        var val = els[j].getAttribute(attr);
        if (isAttributionUrl(val)) els[j].setAttribute(attr, withAttribution(val));
      }
    }
  }

  // Click pass (capture phase): the just-in-time guarantee. Catches any CTA at the moment it
  // is clicked and rewrites the destination before navigation. Always correct on click.
  function onClick(e) {
    var node = e.target;
    while (node && node !== document) {
      if (node.tagName === 'A') {
        var href = node.getAttribute('href');
        if (isAttributionUrl(href)) {
          node.setAttribute('href', withAttribution(href));
          return;
        }
      }
      if (node.getAttribute) {
        for (var d = 0; d < DATA_ATTRS.length; d++) {
          var val = node.getAttribute(DATA_ATTRS[d]);
          if (val && isAttributionUrl(val)) {
            node.setAttribute(DATA_ATTRS[d], withAttribution(val));
            return;
          }
        }
      }
      node = node.parentNode;
    }
  }

  function start() {
    persistFirstTouch();
    document.addEventListener('click', onClick, true);
    // These pages are static HTML, so the static pass sticks (no React reconciliation to
    // fight). Deferred past first paint so it never competes with LCP.
    var initial = function () {
      decorate(document);
    };
    if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(initial, { timeout: 3000 });
    else window.setTimeout(initial, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
