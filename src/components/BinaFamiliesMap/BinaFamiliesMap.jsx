import React, { useCallback, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import DotMap from './DotMap';
import currentFamilies from './data/currentFamilies.json';
import exploringFamilies from './data/exploringFamilies.json';
import {
  CONTINENTS,
  EXPLORING_COLOR,
  studentDotRadius,
  exploringDotRadius,
} from './config';
import './BinaFamiliesMap.css';

// useLayoutEffect warns during server rendering; fall back to a no-op there.
const useIsoLayoutEffect = typeof window === 'undefined' ? () => {} : useLayoutEffect;

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * The two-tab map for the "Where our families connect" section.
 *
 * @param {object}   props
 * @param {Array}    [props.current]      Current-family places. Defaults to data/currentFamilies.json.
 * @param {Array}    [props.exploring]    Exploring-family countries. Defaults to data/exploringFamilies.json.
 * @param {string}   [props.imageBase]    Folder the collages are served from.
 * @param {Function} [props.getImageSrc]  (item) => url | null. Overrides imageBase, e.g. for a CDN.
 * @param {string}   [props.defaultTab]   'current' or 'exploring'.
 * @param {string}   [props.className]    Extra class on the outer element.
 */
export default function BinaFamiliesMap({
  current = currentFamilies,
  exploring = exploringFamilies,
  imageBase = '/images/landing/map/',
  getImageSrc,
  defaultTab = 'current',
  className = '',
}) {
  const uid = useId();
  const [tab, setTab] = useState(defaultTab);

  const colorById = useMemo(() => Object.fromEntries(CONTINENTS.map((c) => [c.id, c.color])), []);

  const TABS = useMemo(
    () => ({
      current: {
        label: 'Current bina families',
        mapLabel: 'Map of the places current bina families live in',
        items: current,
        radiusOf: (c) => studentDotRadius(c.students),
        colorOf: (c) => colorById[c.continent] || '#FFFFFF',
        describe: (c) => `${c.label}: ${plural(c.students, 'student')}`,
      },
      exploring: {
        label: 'Families exploring bina',
        mapLabel: 'Map of the countries where families are exploring bina',
        items: exploring,
        radiusOf: (r) => exploringDotRadius(r.size),
        colorOf: () => EXPLORING_COLOR,
        describe: (r) => r.label, // no student numbers on the public site
      },
    }),
    [current, exploring, colorById]
  );
  const order = ['current', 'exploring'];
  const active = TABS[tab];

  /* ---------- sliding yellow pill ---------- */
  const listRef = useRef(null);
  const tabRefs = useRef({});
  const [pill, setPill] = useState(null);

  const measurePill = useCallback(() => {
    const el = tabRefs.current[tab];
    if (el) setPill({ left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight });
  }, [tab]);

  useIsoLayoutEffect(() => {
    measurePill();
    const ro = new ResizeObserver(measurePill);
    if (listRef.current) ro.observe(listRef.current);
    return () => ro.disconnect();
  }, [measurePill]);

  /* ---------- keyboard: arrow keys move between tabs (WAI-ARIA tabs pattern) ---------- */
  const onTabKeyDown = (e) => {
    const i = order.indexOf(tab);
    let next = null;
    if (e.key === 'ArrowRight') next = order[(i + 1) % order.length];
    else if (e.key === 'ArrowLeft') next = order[(i - 1 + order.length) % order.length];
    else if (e.key === 'Home') next = order[0];
    else if (e.key === 'End') next = order[order.length - 1];
    if (!next) return;
    e.preventDefault();
    setTab(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className={`bfm ${className}`.trim()}>
      <div className="bfm-tabs-wrap">
        <div ref={listRef} className="bfm-tabs" role="tablist" aria-label="Choose which families to show">
          {pill && (
            <span
              className="bfm-pill"
              aria-hidden="true"
              style={{ width: pill.width, height: pill.height, transform: `translate(${pill.left}px, ${pill.top}px)` }}
            />
          )}
          {order.map((key) => (
            <button
              key={key}
              ref={(el) => { tabRefs.current[key] = el; }}
              type="button"
              role="tab"
              id={`${uid}-tab-${key}`}
              aria-selected={tab === key}
              aria-controls={`${uid}-panel`}
              tabIndex={tab === key ? 0 : -1}
              className={`bfm-tab${tab === key ? ' is-active' : ''}${pill ? '' : ' no-pill'}`}
              onClick={() => setTab(key)}
              onKeyDown={onTabKeyDown}
            >
              {TABS[key].label}
            </button>
          ))}
        </div>
      </div>

      <div className="bfm-panel" role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${tab}`}>
        <DotMap
          items={active.items}
          radiusOf={active.radiusOf}
          colorOf={active.colorOf}
          describe={active.describe}
          dataKey={tab}
          label={active.mapLabel}
          imageBase={imageBase}
          getImageSrc={getImageSrc}
        />

        {tab === 'current' ? (
          <React.Fragment key="current">
            <ul className="bsm-legend">
              {CONTINENTS.map((c) => (
                <li key={c.id}>
                  <i style={{ background: c.color }} aria-hidden="true" />
                  {c.label}
                </li>
              ))}
            </ul>
            <p className="bsm-legend bsm-legend-note bsm-legend-sub">
              <span className="bsm-size-key" aria-hidden="true">
                <i style={{ background: EXPLORING_COLOR }} />
                <i style={{ background: EXPLORING_COLOR }} />
              </span>
              Bigger circles mean more families learning with bina from that city
            </p>
          </React.Fragment>
        ) : (
          <p key="exploring" className="bsm-legend bsm-legend-note">
            <span className="bsm-size-key" aria-hidden="true">
              <i style={{ background: EXPLORING_COLOR }} />
              <i style={{ background: EXPLORING_COLOR }} />
            </span>
            Bigger circles mean more families exploring bina from that country
          </p>
        )}
      </div>
    </div>
  );
}
