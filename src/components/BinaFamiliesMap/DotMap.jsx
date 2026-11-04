import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { MAP, LAND_PATH } from './worldLand';
import { THEME, HOVER_SLOP } from './config';

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

const [VB_X, VB_Y, VB_W, VB_H] = MAP.viewBox;

/** Mercator, identical to the projection the land outline was built with. */
function project(lon, lat) {
  const l = Math.max(Math.min(lat, 83), -85);
  const my = Math.log(Math.tan(Math.PI / 4 + (l * Math.PI) / 180 / 2));
  return [((lon + 180) / 360) * MAP.width, (MAP.yTop - my) * MAP.k];
}

const CLOSE_DELAY = 110;   // ms before a popup closes, avoids flicker between close dots
const EXIT_MS = 160;       // must match the exit animation in the CSS
const TAP_MOVE_PX = 6;     // pointer travel that turns a tap into a scroll (ignored)
const OVERFLOW_TOP = 48;   // px a popup may extend above the map before flipping below

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * World map with sized, coloured dots that open a collage + label on hover or tap.
 * Used by <BinaFamiliesMap /> for both tabs; can also be used on its own.
 *
 * @param {object}   props
 * @param {Array}    props.items          Records with id, label, lat, lon and optional image.
 * @param {Function} props.radiusOf       (item) => dot radius in screen px.
 * @param {Function} props.colorOf        (item) => dot colour.
 * @param {Function} [props.describe]     (item) => text read out by screen readers. Defaults to the label.
 * @param {string}   [props.dataKey]      Change it when items change, to fade the new dots in.
 * @param {string}   [props.imageBase]    Folder the collage files are served from.
 * @param {Function} [props.getImageSrc]  (item) => url | null. Overrides imageBase, e.g. for a CDN.
 * @param {string}   [props.label]        Accessible name for the map.
 * @param {string}   [props.id]           id for the map element (used by the tabs).
 */
export default function DotMap({
  items,
  radiusOf,
  colorOf,
  describe = (item) => item.label,
  dataKey = 'default',
  imageBase = '/images/landing/map/',
  getImageSrc,
  label = 'World map',
  id,
}) {
  const uid = useId();
  const clipId = `bsm-clip-${uid.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const stageRef = useRef(null);

  const [fit, setFit] = useState(0);            // screen px per map unit
  const [stageW, setStageW] = useState(0);
  const [active, setActive] = useState(null);   // index into points
  const [shown, setShown] = useState(null);     // index currently rendered in the popup
  const [closing, setClosing] = useState(false);
  const [failedImages, setFailedImages] = useState(() => new Set());
  const [loadedImage, setLoadedImage] = useState(null);

  const closeTimer = useRef(null);
  const exitTimer = useRef(null);
  const tap = useRef(null);

  /* Dots are a little smaller on phones so dense regions stay readable. */
  const dotScale = stageW && stageW < 560 ? 0.62 : 1;

  /* Project every city once. */
  const points = useMemo(
    () =>
      items.map((c) => {
        const [x, y] = project(c.lon, c.lat);
        return { ...c, x, y, rpx: radiusOf(c) * dotScale, color: colorOf(c) };
      }),
    [items, dotScale, radiusOf, colorOf]
  );

  /* Draw big dots first so small ones stay on top and clickable. */
  const drawOrder = useMemo(
    () => points.map((_, i) => i).sort((a, b) => points[b].rpx - points[a].rpx),
    [points]
  );

  /* Keyboard order: west to east. */
  const keyOrder = useMemo(
    () => points.map((_, i) => i).sort((a, b) => points[a].lon - points[b].lon || points[b].lat - points[a].lat),
    [points]
  );

  /* ---------- size tracking ---------- */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const measure = () => {
      const w = el.clientWidth;
      setStageW(w);
      setFit(w / VB_W);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ---------- coordinate helpers ---------- */
  const toScreen = useCallback(
    (p) => [(p.x - VB_X) * fit, (p.y - VB_Y) * fit],
    [fit]
  );

  const pickAt = useCallback(
    (sx, sy, slop = HOVER_SLOP) => {
      let best = null;
      let bestD = Infinity;
      for (let i = 0; i < points.length; i += 1) {
        const [px, py] = toScreen(points[i]);
        const d = Math.hypot(px - sx, py - sy);
        if (d <= points[i].rpx + slop && d < bestD) {
          best = i;
          bestD = d;
        }
      }
      return best;
    },
    [points, toScreen]
  );

  const localXY = (e) => {
    const r = stageRef.current.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };

  /* ---------- open / close with exit animation ---------- */
  const open = useCallback((i) => {
    clearTimeout(closeTimer.current);
    clearTimeout(exitTimer.current);
    setActive(i);
    setShown(i);
    setClosing(false);
  }, []);

  const close = useCallback((delay = CLOSE_DELAY) => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setActive(null);
      setClosing(true);
      clearTimeout(exitTimer.current);
      exitTimer.current = setTimeout(() => {
        setShown(null);
        setClosing(false);
      }, EXIT_MS);
    }, delay);
  }, []);

  useEffect(() => () => {
    clearTimeout(closeTimer.current);
    clearTimeout(exitTimer.current);
  }, []);

  /* New data (tab switch): close any open popup straight away. This runs during render,
     so an index from the old data is never used against the new data. */
  const [prevKey, setPrevKey] = useState(dataKey);
  if (prevKey !== dataKey) {
    setPrevKey(dataKey);
    setActive(null);
    setShown(null);
    setClosing(false);
  }
  useEffect(() => {
    clearTimeout(closeTimer.current);
    clearTimeout(exitTimer.current);
  }, [dataKey]);

  /* ---------- pointer: hover and tap ---------- */
  const onPointerMove = (e) => {
    const [sx, sy] = localXY(e);
    const t = tap.current;
    if (t) {
      if (!t.moved && Math.hypot(sx - t.sx, sy - t.sy) > TAP_MOVE_PX) t.moved = true;
      if (e.pointerType !== 'mouse') return;
    }
    if (e.pointerType !== 'mouse') return;
    const hit = pickAt(sx, sy);
    if (hit !== null) {
      if (hit !== active) open(hit);
      else clearTimeout(closeTimer.current);
    } else if (active !== null) {
      close();
    }
  };

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    const [sx, sy] = localXY(e);
    tap.current = { sx, sy, moved: false, type: e.pointerType };
  };

  const onPointerUp = (e) => {
    const d = tap.current;
    tap.current = null;
    if (!d || d.moved) return;
    // A tap/click without moving. Touch has no hover, so tapping opens and closes.
    const [sx, sy] = localXY(e);
    const hit = pickAt(sx, sy, d.type === 'mouse' ? HOVER_SLOP : HOVER_SLOP * 1.8);
    if (hit === null) close(0);
    else if (hit === active && d.type !== 'mouse') close(0);
    else open(hit);
  };

  const onPointerLeave = (e) => {
    tap.current = null;
    if (e.pointerType === 'mouse') close();
  };

  /* ---------- keyboard ---------- */
  const onKeyDown = (e) => {
    const pos = active === null ? -1 : keyOrder.indexOf(active);
    let next = null;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = keyOrder[(pos + 1) % keyOrder.length];
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = keyOrder[(pos - 1 + keyOrder.length) % keyOrder.length];
        break;
      case 'Home':
        next = keyOrder[0];
        break;
      case 'End':
        next = keyOrder[keyOrder.length - 1];
        break;
      case 'Escape':
        if (active !== null) {
          e.preventDefault();
          close(0);
        }
        return;
      default:
        return;
    }
    e.preventDefault();
    open(next);
  };

  /* ---------- popup placement ---------- */
  const popup = useMemo(() => {
    if (shown === null || !fit || !points[shown]) return null;
    const p = points[shown];
    const [sx, sy] = toScreen(p);
    const src = failedImages.has(p.id) ? null : getImageSrc ? getImageSrc(p) : p.image ? imageBase + p.image : null;
    const cw = Math.round(Math.min(240, Math.max(132, stageW * 0.3)));
    const ch = src ? cw * 0.6 + 40 : 40;          // collage + label, estimated
    const gap = p.rpx + 8;
    // Prefer above; the popup may rise a little past the map's top edge before flipping below.
    const side = sy - gap - ch < -OVERFLOW_TOP ? 'below' : 'above';
    const edge = 6;
    const half = cw / 2;
    // slide the popup sideways so it never leaves the frame
    const shift = Math.max(0, edge - (sx - half)) + Math.min(0, stageW - edge - (sx + half));
    return { p, sx, sy, src, cw, gap, side, shift };
  }, [shown, fit, points, toScreen, stageW, failedImages, getImageSrc, imageBase]);

  const activePoint = active !== null ? points[active] || null : null;
  const unit = 1 / (fit || 1);    // map units per screen pixel

  return (
    <div
      className="bsm"
      style={{
        '--bsm-land': THEME.land,
        '--bsm-label-bg': THEME.labelBg,
        '--bsm-label-text': THEME.labelText,
      }}
    >
      <div
        ref={stageRef}
        id={id}
        className="bsm-stage"
        style={{ aspectRatio: `${VB_W} / ${VB_H}` }}
        tabIndex={0}
        role="group"
        aria-label={label}
        aria-describedby={`${uid}-help`}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        onPointerCancel={() => { tap.current = null; }}
        onKeyDown={onKeyDown}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) close(0);
        }}
      >
        <svg className="bsm-svg" viewBox={MAP.viewBox.join(' ')} aria-hidden="true" focusable="false">
          {/* The land outline reaches further north than the visible crop, so it is clipped to the
              map frame. Dots are not clipped, so edge dots (Fiji, Samoa) stay whole. */}
          <defs>
            <clipPath id={clipId}>
              <rect x={VB_X} y={VB_Y} width={VB_W} height={VB_H} />
            </clipPath>
          </defs>
          <g>
            <path className="bsm-land" d={LAND_PATH} clipPath={`url(#${clipId})`} />
            <g key={dataKey} className="bsm-dots">
              {drawOrder.map((i) => {
                const p = points[i];
                return (
                  <circle
                    key={p.id}
                    className="bsm-dot"
                    cx={p.x}
                    cy={p.y}
                    r={p.rpx * unit}
                    fill={p.color}
                    stroke={THEME.dotStroke}
                    strokeWidth={unit}
                  />
                );
              })}
            </g>
            {activePoint && (
              <g key={activePoint.id} className="bsm-active" transform={`translate(${activePoint.x} ${activePoint.y})`}>
                <circle className="bsm-glow" r={(activePoint.rpx + Math.min(activePoint.rpx * 1.8, 18)) * unit} fill={activePoint.color} />
                <circle
                  className="bsm-dot-active"
                  r={activePoint.rpx * unit * (activePoint.rpx > 14 ? 1.06 : 1.2)}
                  fill={activePoint.color}
                  stroke="#FFFFFF"
                  strokeWidth={1.5 * unit}
                />
              </g>
            )}
          </g>
        </svg>

        {popup && (
          <div
            className="bsm-pop"
            style={{ left: popup.sx, top: popup.sy }}
            data-side={popup.side}
            aria-hidden="true"
          >
            <div
              key={popup.p.id}
              className={`bsm-pop-inner${closing ? ' is-closing' : ''}`}
              style={{
                width: popup.cw,
                '--bsm-gap': `${popup.gap}px`,
                '--bsm-shift': `${popup.shift}px`,
                transformOrigin: `${popup.cw / 2 - popup.shift}px ${popup.side === 'above' ? '100%' : '0%'}`,
              }}
            >
              {popup.src && (
                <img
                  className={`bsm-collage${loadedImage === popup.p.id ? ' is-loaded' : ''}`}
                  src={popup.src}
                  alt=""
                  width={popup.cw}
                  decoding="async"
                  onLoad={() => setLoadedImage(popup.p.id)}
                  onError={() => setFailedImages((s) => new Set(s).add(popup.p.id))}
                />
              )}
              <span className="bsm-label">{popup.p.label}</span>
            </div>
          </div>
        )}

      </div>

      {/* Screen reader support */}
      <p id={`${uid}-help`} className="bsm-sr-only">
        Use the arrow keys to move between places, and Escape to close.
      </p>
      <p className="bsm-sr-only" aria-live="polite">
        {activePoint ? describe(activePoint) : ''}
      </p>
      <ul className="bsm-sr-only">
        {points.map((p) => (
          <li key={p.id}>{describe(p)}</li>
        ))}
      </ul>
    </div>
  );
}
