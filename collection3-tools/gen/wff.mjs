// WFF v1 emitter — compiles a spec face (tools/spec/cat-*.js) into watchface.xml.
//
// Architecture (each decision traced to a proven pattern or the v1 XSD):
// * Theme picker = ListConfiguration scene-switch: per-theme Groups hold that
//   theme's baked dial image + live layers in LITERAL colours. ColorConfiguration
//   cannot switch images (selection unreadable by design — runtime-gotchas §1);
//   platform-constraints §5.2(b) blesses the named-list theme.
// * Dark mode (§5.2a): twin content groups alpha-gated on [CONFIGURATION.dark]
//   (themed `? 0 : 255`, fixed-light `? 255 : 0`) — Solstice-proven single-boolean
//   gates, one per node, never stacked.
// * Complications: Scene-level slots; provider render blocks start with an opaque
//   theme-coloured patch so provider data cleanly replaces the native/empty look:
//   - patchMode 'text': patch covers just the primary text area (baked labels/
//     icons/frames stay; used for native-fallback windows and '—' rows)
//   - patchMode 'full': patch covers the slot; frames/icons live inside the block
//     so an emptied slot leaves clean dial (chips, gauge rows)
// * One risky expression per element; colours are literals or single refs; no
//   string-literal Template parameters (only %d/%02d/%.0f + %s with string SOURCES).
//
// Z-order inside a theme group: dial image → pre-hand live layers (spec order) →
// data needles → sub-second clocks → main clock → seconds clock → post-hand live
// layers (centre caps, overlays) — matches every spec's layer table.

import { AOD_INK, AOD_MUT, DARK_ROLES, fontFromStack, snapWeight } from './data.mjs';
import { shade, isLive, handSpriteGeom, mergedSpriteGeom, C, polar } from './svglib.mjs';

export const MIN_SLOT_TEXT = 16; // user requirement: complication texts must not be too small
export const MIN_LIVE_TEXT = 14;

/* ---------- XML helpers ---------- */
const A = (obj) => Object.entries(obj)
  .filter(([, v]) => v !== undefined && v !== null)
  .map(([k, v]) => ` ${k}="${String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')}"`)
  .join('');
function el(name, attrs, children) {
  const kids = (children || []).filter(Boolean);
  if (!kids.length) return `<${name}${A(attrs || {})} />`;
  return `<${name}${A(attrs || {})}>\n${kids.join('\n')}\n</${name}>`;
}

export function colFor(roles, c, fallback) {
  if (!c || typeof c !== 'string') return fallback || roles.ink;
  if (c[0] === '#') return c;
  if (c.startsWith('shade:')) {
    const [, role, amt] = c.split(':');
    return shade(roles[role] || roles.ink, parseFloat(amt));
  }
  return roles[c] || fallback || roles.ink;
}
function withOpacity(hex, opacity) {
  if (opacity == null || opacity >= 1) return hex;
  const a = Math.round(Math.max(0, Math.min(1, opacity)) * 255).toString(16).padStart(2, '0').toUpperCase();
  return `#${a}${hex.slice(1)}`;
}

/* ---------- tokens ---------- */
export const TOKEN_TPL = {
  day3:   { tpl: '%s',   src: '[DAY_OF_WEEK_S]' },
  mon3:   { tpl: '%s',   src: '[MONTH_S]' },
  dnum:   { tpl: '%02d', src: '[DAY]' },
  steps:  { tpl: '%d',   src: '[STEP_COUNT]' },
  batt:   { tpl: '%d%%', src: '[BATTERY_PERCENT]' },
  battN:  { tpl: '%d',   src: '[BATTERY_PERCENT]' },
  notif:  { tpl: '%d',   src: '[UNREAD_NOTIFICATION_COUNT]' },
  weeknr: { tpl: 'W%d',  src: '[WEEK_IN_YEAR]' },
};
export const TIME_TOKENS = { hmm: 'h:mm', hh: 'hh', mm: 'mm', ss: 'ss' };
export const PROVIDER_ONLY = new Set(['event', 'sunrise', 'sunset', 'hr']);

function arcEndExpr(data, from, to) {
  const span = to - from;
  switch (data) {
    case 'battery': return `${from} + ([BATTERY_PERCENT] * ${(span / 100).toFixed(6)})`;
    case 'steps': return `${from} + ([STEP_PERCENT] * ${(span / 100).toFixed(6)})`; // goal-relative (documented)
    case 'stepsDial': return `${from} + ((([STEP_COUNT] - (floor([STEP_COUNT] / 10000) * 10000)) / 10000) * ${span.toFixed(4)})`;
    case 'seconds': return `${from} + ([SECOND] * ${(span / 60).toFixed(6)})`;
    case 'minutes': return `${from} + ([MINUTE] * ${(span / 60).toFixed(6)})`;
    case 'day': return `${from} + (((([HOUR_0_23] * 60) + [MINUTE]) / 1440) * ${span.toFixed(4)})`;
    default: return `${from}`;
  }
}

/* ---------- text geometry ---------- */
function estWidth(str, size, condensed) {
  return Math.ceil(str.length * size * (condensed ? 0.54 : 0.64) + 10);
}
export function tokenWidth(token, size, fontSvg) {
  const condensed = /Shoulders|Semi Condensed/.test(fontSvg || '');
  switch (token) {
    case 'hmm': return estWidth('88:88', size, condensed);
    case 'hh': case 'mm': case 'ss': return estWidth('88', size, condensed);
    case 'dnum': return estWidth('88', size, condensed) + 6;
    case 'day3': case 'mon3': return estWidth('WED', size, condensed) + 6;
    case 'steps': return estWidth('88888', size, condensed);
    case 'batt': return estWidth('100%', size, condensed);
    case 'battN': case 'notif': return estWidth('888', size, condensed);
    case 'ampm': case 'ampmOnly': return estWidth('PM', size, condensed) + 4;
    case 'weeknr': return estWidth('W88', size, condensed);
    default: return estWidth('MMMMMMMM', size, condensed);
  }
}
function textBox(L, width) {
  const h = Math.ceil(L.size * 1.5);
  const anchor = L.anchor || 'middle';
  let x, align;
  if (anchor === 'start') { x = L.x; align = 'START'; }
  else if (anchor === 'end') { x = L.x - width; align = 'END'; }
  else { x = L.x - width / 2; align = 'CENTER'; }
  return { x: Math.round(x), y: Math.round(L.y - h / 2), w: Math.round(width), h, align };
}
function wffFont(faceStack, L, roles, colorOverride, sizeOverride) {
  const stack = L.font || faceStack;
  const fm = fontFromStack(stack);
  const w = snapWeight(fm.res, L.weight || 500);
  return {
    family: `${fm.res}_${w}`,
    size: sizeOverride != null ? sizeOverride : L.size,
    color: colorOverride || colFor(roles, L.color),
    svg: fm.svg,
  };
}

/* ---------- live element emitters ---------- */
function partTextFor(L, face, roles, { color, gate, name, minSize } = {}) {
  const t = TOKEN_TPL[L.token];
  if (!t) return null;
  const size = Math.max(L.size, minSize || 0);
  const f = wffFont(face.fontStack, L, roles, color, size);
  const w = tokenWidth(L.token, size, f.svg);
  const box = textBox({ ...L, size }, w);
  const inner = el('Text', { align: box.align }, [
    `<Font family="${f.family}" size="${f.size}" color="${f.color}"><Template>${t.tpl}<Parameter expression="${t.src}" /></Template></Font>`,
  ]);
  if (!gate) return el('PartText', { x: box.x, y: box.y, width: box.w, height: box.h, name }, [inner]);
  return el('PartText', { x: box.x, y: box.y, width: box.w, height: box.h, name }, [
    el('Transform', { target: 'alpha', value: gate }), inner,
  ]);
}
function timeTextFor(L, face, roles, { color, name } = {}) {
  const fmt = TIME_TOKENS[L.token];
  const f = wffFont(face.fontStack, L, roles, color);
  const w = tokenWidth(L.token, L.size, f.svg);
  const box = textBox(L, w);
  return el('DigitalClock', { x: box.x, y: box.y, width: box.w, height: box.h }, [
    el('TimeText', { format: fmt, x: 0, y: 0, width: box.w, height: box.h, align: box.align }, [
      `<Font family="${f.family}" size="${f.size}" color="${f.color}" />`,
    ]),
  ]);
}
function ampmFor(L, face, roles, { color, name } = {}) {
  const f = wffFont(face.fontStack, L, roles, color);
  const w = tokenWidth('ampmOnly', L.size, f.svg);
  const box = textBox(L, w);
  return el('Group', { x: box.x, y: box.y, width: box.w, height: box.h, name: name || `ampm_${box.x}_${box.y}` }, [
    el('Transform', { target: 'alpha', value: '[IS_24_HOUR_MODE] ? 0 : 255' }),
    el('PartText', { x: 0, y: 0, width: box.w, height: box.h }, [
      el('Text', { align: box.align }, [
        `<Font family="${f.family}" size="${f.size}" color="${f.color}"><Template>%s<Parameter expression="[AMPM_STRING_SHORT]" /></Template></Font>`,
      ]),
    ]),
  ]);
}
function drawArc(L, roles, { endExpr, name, includeTrack = true } = {}) {
  const cx = L.cx != null ? L.cx : C, cy = L.cy != null ? L.cy : C;
  const from = L.from != null ? L.from : 0;
  const to = L.to != null ? L.to : 360;
  const d = L.r * 2;
  const kids = [];
  if (L.track && includeTrack) {
    kids.push(el('Arc', { centerX: cx, centerY: cy, width: d, height: d, startAngle: from, endAngle: Math.min(to, from + 360), direction: 'CLOCKWISE' }, [
      `<Stroke color="${withOpacity(colFor(roles, L.track), L.trackOpacity != null ? L.trackOpacity : 0.35)}" thickness="${L.w}" cap="${(L.cap || 'butt').toUpperCase()}" />`,
    ]));
  }
  kids.push(el('Arc', { centerX: cx, centerY: cy, width: d, height: d, startAngle: from, endAngle: from, direction: 'CLOCKWISE' }, [
    el('Transform', { target: 'endAngle', value: endExpr }),
    `<Stroke color="${withOpacity(colFor(roles, L.color), L.opacity)}" thickness="${L.w}" cap="${(L.cap || 'butt').toUpperCase()}" />`,
  ]));
  return el('PartDraw', { x: 0, y: 0, width: 450, height: 450, name }, kids);
}
function drawCircle(L, roles, { color, name } = {}) {
  const cx = L.cx != null ? L.cx : C, cy = L.cy != null ? L.cy : C;
  const inner = [`<Fill color="${withOpacity(color || colFor(roles, L.color), L.opacity)}" />`];
  if (L.stroke) inner.push(`<Stroke color="${colFor(roles, L.stroke)}" thickness="${L.sw || 1}" />`);
  return el('PartDraw', { x: 0, y: 0, width: 450, height: 450, name }, [
    el('Ellipse', { x: (cx - L.r).toFixed(2), y: (cy - L.r).toFixed(2), width: L.r * 2, height: L.r * 2 }, inner),
  ]);
}
function drawRect(L, roles, { name } = {}) {
  const inner = [`<Fill color="${withOpacity(colFor(roles, L.color), L.opacity)}" />`];
  if (L.stroke) inner.push(`<Stroke color="${colFor(roles, L.stroke)}" thickness="${L.sw || 1}" />`);
  const shape = L.rx
    ? el('RoundRectangle', { x: L.x, y: L.y, width: L.w, height: L.h, cornerRadiusX: L.rx, cornerRadiusY: L.rx }, inner)
    : el('Rectangle', { x: L.x, y: L.y, width: L.w, height: L.h }, inner);
  return el('PartDraw', { x: 0, y: 0, width: 450, height: 450, name }, [shape]);
}
function drawLine(L, roles, { name } = {}) {
  return el('PartDraw', { x: 0, y: 0, width: 450, height: 450, name }, [
    el('Line', { startX: L.x1, startY: L.y1, endX: L.x2, endY: L.y2 }, [
      `<Stroke color="${withOpacity(colFor(roles, L.color), L.opacity)}" thickness="${L.w || 1}" cap="${(L.cap || 'butt').toUpperCase()}" />`,
    ]),
  ]);
}
function drawTicks(L, roles, { name } = {}) {
  const cx = L.cx != null ? L.cx : C, cy = L.cy != null ? L.cy : C;
  const n = L.count, from = L.from || 0, span = (L.to != null ? L.to : 360 + from) - from;
  const full = L.to == null;
  const color = withOpacity(colFor(roles, L.color), L.opacity);
  const kids = [];
  for (let i = 0; i < (full ? n : n + 1); i++) {
    if (L.skipEvery && i % L.skipEvery === 0) continue;
    if (L.onlyEvery && i % L.onlyEvery !== 0) continue;
    const a = from + (span * i) / n;
    const [x1, y1] = polar(cx, cy, L.r, a);
    const [x2, y2] = polar(cx, cy, L.r - L.len, a);
    kids.push(el('Line', { startX: x1.toFixed(2), startY: y1.toFixed(2), endX: x2.toFixed(2), endY: y2.toFixed(2) }, [
      `<Stroke color="${color}" thickness="${L.w || 1}" cap="${(L.cap || 'butt').toUpperCase()}" />`,
    ]));
  }
  return el('PartDraw', { x: 0, y: 0, width: 450, height: 450, name }, kids);
}
function drawDots(L, roles, { name } = {}) {
  const cx = L.cx != null ? L.cx : C, cy = L.cy != null ? L.cy : C;
  const color = withOpacity(colFor(roles, L.color), L.opacity);
  const kids = [];
  for (let i = 0; i < L.count; i++) {
    if (L.skipEvery && i % L.skipEvery === 0) continue;
    const a = (360 * i) / L.count;
    const [x, y] = polar(cx, cy, L.r, a);
    const r = L.dot || 1.5;
    kids.push(el('Ellipse', { x: (x - r).toFixed(2), y: (y - r).toFixed(2), width: r * 2, height: r * 2 }, [`<Fill color="${color}" />`]));
  }
  return el('PartDraw', { x: 0, y: 0, width: 450, height: 450, name }, kids);
}

/* =====================================================================
   Analysis
   ===================================================================== */
export function analyzeFace(face) {
  const toggles = {};
  for (const s of face.settings || []) {
    if (s.type !== 'toggle') continue;
    const m = /SET-[A-Z0-9]+-([A-Z]+)/.exec(s.id);
    if (!m) continue;
    const key = m[1].toLowerCase();
    toggles[key] = { id: key, label: s.label, default: /^on/i.test(s.default) };
  }
  // Spec-internal fix: WF-E5's acceptance ("battery crescent off by default") requires a
  // BATT toggle the family settings block omits.
  if (face.id === 'WF-E5' && !toggles.batt) toggles.batt = { id: 'batt', label: 'Battery arc', default: false };

  const slots = (face.complications || []).map((s, i) => {
    const bounds = s.shape === 'circle'
      ? { x: s.cx - s.r, y: s.cy - s.r, w: s.r * 2, h: s.r * 2 }
      : { x: s.x, y: s.y, w: s.w, h: s.h };
    const isRing = s.shape === 'circle' && Math.abs((s.cx ?? 0) - 225) < 2 && Math.abs((s.cy ?? 0) - 225) < 2 && s.r > 150;
    const d = s.default || '';
    let provider = 'EMPTY';
    const isNativeDefault = /native|^Empty/i.test(d) && !/v1-legal/i.test(d);
    if (!isNativeDefault) {
      if (/day ?\+ ?date/i.test(d)) provider = 'DAY_AND_DATE';
      else if (/^date/i.test(d)) provider = 'DATE';
      else if (/steps/i.test(d)) provider = 'STEP_COUNT';
      else if (/battery/i.test(d)) provider = 'WATCH_BATTERY';
      else if (/unread/i.test(d)) provider = 'UNREAD_NOTIFICATION_COUNT';
      else if (/event/i.test(d)) provider = 'NEXT_EVENT';
      else if (/sunrise|sunset/i.test(d)) provider = 'SUNRISE_SUNSET';
      else if (/world/i.test(d)) provider = 'WORLD_CLOCK';
    }
    const nativeUnder = /native/i.test(d) || /native/i.test(s.fallback || '') || /native/i.test(s.empty || '');
    const dash = /—/.test(s.fallback || '') || /—/.test(s.empty || '');
    const hiddenWhenEmpty = /hidden/i.test(s.empty || '');
    const dateGated = !!toggles.date && /date|jewel|whisper date/i.test(s.label || '');
    const gaugeGated = !!toggles.gauges && /steps|battery|figure|gauge|ring/i.test(`${s.label} ${d}`);
    // A slot whose empty-state artwork the spec tags explicitly (withSlot / slot:'SLOT-…')
    // opts into the frame+content architecture of handoff/04-complication-system.md: the
    // decorations move into the slot's EMPTY block, so no patch is ever painted over the
    // machined dial. patchMode 'slot' disables every legacy patch path below. Only CAT-A
    // (VAKT) carries these tags — every other face keeps its existing behaviour.
    const tagged = face.layers.some(L => L.slot === s.id);
    const patchMode = tagged ? 'slot' : (hiddenWhenEmpty && !dash && !nativeUnder) ? 'full' : 'text';
    return { ...s, idx: i, bounds, design: { ...bounds }, isRing, provider, nativeUnder, dash, hiddenWhenEmpty, dateGated, gaugeGated, patchMode, tagged };
  });

  const inSlotPad = (x, y, pad) => slots.find(s => {
    if (s.isRing) return Math.abs(Math.hypot(x - 225, y - 225) - s.r) <= 12;
    return x >= s.bounds.x - pad && x <= s.bounds.x + s.bounds.w + pad && y >= s.bounds.y - pad && y <= s.bounds.y + s.bounds.h + pad;
  });
  const inSlot = (x, y) => inSlotPad(x, y, 2);

  const firstLiveIdx = face.layers.findIndex(isLive);
  const handIdxs = face.layers.map((L, i) => (L.t === 'hand' && L.kind !== 'data'
    && (L.cx == null || Math.abs(L.cx - 225) < 2) && (L.cy == null || Math.abs(L.cy - 225) < 2)) ? i : -1).filter(i => i >= 0);
  const firstHandIdx = handIdxs.length ? Math.min(...handIdxs) : Infinity;

  // Approximate a layer as a circle or annulus band for overlap tests.
  const layerBounds = (L) => {
    const cx = L.cx != null ? L.cx : (L.x1 != null ? (L.x1 + L.x2) / 2 : (L.x != null ? L.x + (L.w ? L.w / 2 : 0) : C));
    const cy = L.cy != null ? L.cy : (L.y1 != null ? (L.y1 + L.y2) / 2 : (L.y != null ? L.y + (L.h ? L.h / 2 : 0) : C));
    switch (L.t) {
      case 'hand': return { cx, cy, r: Math.abs(L.len || 0) + (L.tail || 0) + (L.w || 4) * 2 };
      case 'arc': return { cx, cy, band: { rMid: L.r, half: (L.w || 2) / 2 + 2 } };
      case 'ring': return { cx, cy, band: { rMid: L.r, half: (L.w || 1) / 2 + 2 } };
      case 'ticks': return { cx, cy, band: { rMid: L.r - (L.len || 0) / 2, half: (L.len || 4) / 2 + 2 } };
      case 'dots': return { cx, cy, band: { rMid: L.r, half: (L.dot || 1.5) + 2 } };
      case 'circle': return { cx, cy, r: (L.r || 2) + 2 };
      case 'rect': return { cx: L.x + L.w / 2, cy: L.y + L.h / 2, r: Math.hypot(L.w, L.h) / 2 + 2 };
      case 'line': return { cx, cy, r: Math.hypot((L.x2 || 0) - (L.x1 || 0), (L.y2 || 0) - (L.y1 || 0)) / 2 + 2 };
      case 'text': case 'label': return { cx: L.x, cy: L.y, r: (L.size || 12) * 2 };
      default: return { cx, cy, r: 240 };
    }
  };
  const boundsOverlap = (a, b) => {
    const d = Math.hypot(a.cx - b.cx, a.cy - b.cy);
    if (a.band && b.band) {
      if (d < 12) return Math.abs(a.band.rMid - b.band.rMid) <= a.band.half + b.band.half;
      return d <= a.band.rMid + a.band.half + b.band.rMid + b.band.half;
    }
    if (a.band) return Math.abs(d - a.band.rMid) <= a.band.half + (b.r || 0);
    if (b.band) return Math.abs(d - b.band.rMid) <= b.band.half + (a.r || 0);
    return d <= (a.r || 0) + (b.r || 0);
  };

  const items = face.layers.map((L, i) => {
    const item = { L, i, kind: 'static', zone: i < firstHandIdx ? 'under' : 'over' };
    const lx = L.x != null ? L.x : (L.cx != null ? L.cx : C);
    const ly = L.y != null ? L.y : (L.cy != null ? L.cy : C);
    // An explicit spec tag names the slot a layer belongs to; it wins over the geometric
    // inSlot() guessing below, which cannot tell decoration from coincidence.
    const tag = typeof L.slot === 'string' ? slots.find(s => s.id === L.slot) : null;
    if (L.t === 'hand') {
      const cx = L.cx != null ? L.cx : C, cy = L.cy != null ? L.cy : C;
      const centered = Math.abs(cx - 225) < 2 && Math.abs(cy - 225) < 2;
      if (L.kind === 'hour' || L.kind === 'minute') item.kind = 'mainHand';
      else if (L.kind === 'second') item.kind = centered ? 'centerSecond' : 'subSecond';
      else if (L.kind === 'data') item.kind = 'dataNeedle';
      item.cx = cx; item.cy = cy;
      // A tagged register hand is empty-state default artwork: it keeps its sprite (so it
      // renders identically) but is drawn inside the EMPTY block instead of the scene.
      if (tag) { item.slot = tag; item.inEmpty = true; }
      return item;
    }
    // The FRAME is permanent hardware: it is dial art drawn BEHIND the slot and shared by
    // every type block, so frame geometry is pixel-identical across all content (§1, §4).
    // It deliberately falls through to the normal classification below rather than joining
    // the slot — a date window's frame is `dateGatedStatic` and must keep answering to the
    // Date toggle, which a baked layer could never do.
    const isFrame = tag && ((tag.frame === 'plate' && L.t === 'plate') || (tag.frame === 'panel' && L.t === 'rect'));
    if (tag && !isFrame) {
      // Everything else the tag names is the swappable CONTENT of the slot's empty state.
      item.slot = tag;
      item.inEmpty = true;
      if (L.t === 'arc' && L.data) item.kind = 'dataArc';
      else if (L.t === 'text' && L.token && !TIME_TOKENS[L.token]) item.kind = 'slotText';
      else item.kind = 'slotDecoration';
      return item;
    }
    if (L.t === 'arc' && L.data) { item.kind = 'dataArc'; item.slot = inSlot(lx, ly); return item; }
    if (L.t === 'text' && L.token) {
      const s = (!TIME_TOKENS[L.token] && L.token !== 'ampm' && L.token !== 'ampmOnly') ? inSlot(L.x, L.y) : null;
      if (TIME_TOKENS[L.token]) item.kind = 'timeText';
      else if (L.token === 'ampm' || L.token === 'ampmOnly') item.kind = 'ampm';
      else if (s && !s.isRing) { item.kind = 'slotText'; item.slot = s; }
      else if (PROVIDER_ONLY.has(L.token)) { item.kind = 'providerOnlyText'; item.slot = s || null; }
      else item.kind = 'liveText';
      return item;
    }
    if (L.t === 'circle' && i > firstLiveIdx && firstLiveIdx >= 0 && Math.abs(lx - 225) < 8 && Math.abs(ly - 225) < 8 && L.r <= 10) {
      item.kind = 'centerCap'; return item;
    }
    if (L.t === 'rect' || L.t === 'icon' || L.t === 'label' || L.t === 'circle') {
      const near = inSlotPad(lx, ly, 10);
      if (near && !near.isRing && near.dateGated
          && (L.t === 'rect' || L.t === 'circle' || (L.t === 'label' && L.text === '·'))) {
        item.kind = 'dateGatedStatic'; item.slot = near; return item;
      }
      const s = inSlot(lx, ly);
      if (s && !s.isRing && s.patchMode === 'full') { item.kind = 'slotDecoration'; item.slot = s; return item; }
      // patchMode 'text' → stays baked
    }
    // A static layer after a live one is emitted live ONLY if it visually overlaps that
    // live layer (z-order preservation); disjoint ones bake (e.g. B3's date frame vs the
    // petite-seconde register).
    if (i > firstLiveIdx && firstLiveIdx >= 0 && item.kind === 'static'
        && ['ring', 'circle', 'line', 'rect', 'ticks', 'dots'].includes(L.t)) {
      const me = layerBounds(L);
      const clash = face.layers.some((P, j) => j < i && isLive(P) && boundsOverlap(me, layerBounds(P)));
      if (clash) item.kind = 'overlayStatic';
    }
    return item;
  });

  for (const s of slots) {
    s.textLayers = items.filter(it => (it.kind === 'slotText' || it.kind === 'providerOnlyText') && it.slot === s).map(it => it.L);
    s.decorations = items.filter(it => (it.kind === 'slotDecoration' || it.kind === 'dateGatedStatic') && it.slot === s).map(it => it.L);
    // Native fallback tokens normally render at scene level, underneath the slot. A tagged
    // slot draws them inside its EMPTY block instead, so they vanish the moment the user
    // assigns a provider — which is the whole point of the tag.
    s.nativeTokens = (s.nativeUnder && !s.tagged) ? s.textLayers.filter(L => TOKEN_TPL[L.token]) : [];
    const plate = face.layers.find(L => L.t === 'plate' && s.shape === 'circle' && Math.abs((L.cx ?? C) - (s.cx ?? -1)) < 3 && Math.abs((L.cy ?? C) - (s.cy ?? -1)) < 3);
    s.plateColor = plate ? (plate.color || 'shade:bg:-0.4') : null;
    if (s.isRing) {
      const ringArc = face.layers.find(L => L.t === 'arc' && L.data && Math.abs(L.r - s.r) < 3);
      s.ringW = ringArc ? ringArc.w : 4;
      s.ringTrack = ringArc && ringArc.track
        ? { color: ringArc.track, opacity: ringArc.trackOpacity != null ? ringArc.trackOpacity : 0.35 }
        : null;
    }
    // primary/secondary text styling refs
    s.prim = s.textLayers.slice().sort((a, b) => (b.size || 0) - (a.size || 0))[0] || null;
    s.sec = s.textLayers.filter(L => L !== s.prim).sort((a, b) => (b.size || 0) - (a.size || 0))[0] || null;
    // Frame rect fully inside the slot: the provider patch redraws it (framed-window
    // signature survives a provider swap).
    s.frameRect = face.layers.find(L => L.t === 'rect'
      && L.x >= s.bounds.x - 4 && L.y >= s.bounds.y - 4
      && L.x + L.w <= s.bounds.x + s.bounds.w + 4 && L.y + L.h <= s.bounds.y + s.bounds.h + 4) || null;
    // Colour of the dial beneath a point: walk fill-bearing STATIC layers, last wins.
    const underColorAt = (px, py) => {
      let col = 'bg';
      face.layers.forEach((L, li) => {
        const k = items[li] ? items[li].kind : 'static';
        if (k !== 'static') return;
        if (L === s.frameRect) return;
        if (L.t === 'dial') col = L.color || 'bg';
        else if (L.t === 'rect' && px >= L.x && px <= L.x + L.w && py >= L.y && py <= L.y + L.h) col = L.color || col;
        else if (L.t === 'circle' && Math.hypot(px - (L.cx != null ? L.cx : C), py - (L.cy != null ? L.cy : C)) <= L.r) col = L.color || col;
        else if (L.t === 'plate' && Math.hypot(px - (L.cx != null ? L.cx : C), py - (L.cy != null ? L.cy : C)) <= L.r) col = L.color || 'shade:bg:-0.4';
        else if (L.t === 'panel' && px >= L.x && px <= L.x + L.w && py >= L.y && py <= L.y + L.h) col = L.color || col;
      });
      return col;
    };
    // Baked decorations the patch must NOT cover (icons/labels that stay on the dial).
    const forbidden = face.layers
      .filter((L, li) => (L.t === 'icon' || L.t === 'label') && (!items[li] || items[li].kind === 'static'))
      .map(L => {
        if (L.t === 'icon') { const r = (L.s || 12) * 0.55 + 1; return { x0: L.x - r, y0: L.y - r, x1: L.x + r, y1: L.y + r }; }
        const w = String(L.text || '').length * (L.size || 10) * 0.7 / 2 + 2;
        const h = (L.size || 10) * 0.62 + 2;
        const anchor = L.anchor || 'middle';
        const cx = anchor === 'start' ? L.x + w : anchor === 'end' ? L.x - w : L.x;
        return { x0: cx - w, y0: L.y - h, x1: cx + w, y1: L.y + h };
      })
      .filter(b => b.x1 >= s.bounds.x - 6 && b.x0 <= s.bounds.x + s.bounds.w + 6
                && b.y1 >= s.bounds.y - 6 && b.y0 <= s.bounds.y + s.bounds.h + 6);
    // One patch box per native token, each with its own underlying colour, clamped to the
    // slot and shrunk away from baked decorations.
    s.patchBoxes = s.textLayers.map(L => {
      const size = Math.max(MIN_SLOT_TEXT, L.size || 16);
      const w = tokenWidth(L.token || 'dnum', size, '');
      const anchor = L.anchor || 'middle';
      const bx = anchor === 'start' ? L.x : anchor === 'end' ? L.x - w : L.x - w / 2;
      const h = Math.ceil(size * 1.24) + 4;
      let x0 = bx - 3, y0 = L.y - h / 2, x1 = bx + w + 3, y1 = L.y + h / 2;
      // clamp to slot bounds
      x0 = Math.max(x0, s.bounds.x); y0 = Math.max(y0, s.bounds.y);
      x1 = Math.min(x1, s.bounds.x + s.bounds.w); y1 = Math.min(y1, s.bounds.y + s.bounds.h);
      // shrink away from each forbidden decoration box it intersects
      for (const f of forbidden) {
        if (x0 < f.x1 && x1 > f.x0 && y0 < f.y1 && y1 > f.y0) {
          if (f.x1 <= L.x) x0 = Math.max(x0, f.x1 + 1);         // decoration left of token centre
          else if (f.x0 >= L.x) x1 = Math.min(x1, f.x0 - 1);    // right of it
          else if (f.y1 <= L.y) y0 = Math.max(y0, f.y1 + 1);    // above it
          else if (f.y0 >= L.y) y1 = Math.min(y1, f.y0 - 1);    // below it
        }
      }
      const box = { x: Math.round(x0), y: Math.round(y0), w: Math.round(x1 - x0), h: Math.round(y1 - y0) };
      box.color = underColorAt(L.x, L.y);
      return box;
    }).filter(b => b.w > 4 && b.h > 4);
    s.underColor = underColorAt(s.bounds.x + s.bounds.w / 2, s.bounds.y + s.bounds.h / 2);
  }

  // ---- tagged slots: grow the container over their empty-state artwork ----
  // A slot's rect is authored around its frame, but tagged decorations can sit outside it
  // (GT's external steps arc at r71 on an r64 register; the day name under a date window).
  // Slot content is positioned relative to the container, so the container must cover them.
  // The tap target stays on the authored rect — see `design` in slotXml.
  for (const s of slots) {
    if (!s.tagged) continue;
    const ext = items.filter(it => it.slot === s && drawnInEmpty(s, it)).map(it => layerExtent(it.L)).filter(Boolean);
    if (!ext.length) continue;
    let x0 = Math.min(s.bounds.x, ...ext.map(e => e.x0));
    let y0 = Math.min(s.bounds.y, ...ext.map(e => e.y0));
    let x1 = Math.max(s.bounds.x + s.bounds.w, ...ext.map(e => e.x1));
    let y1 = Math.max(s.bounds.y + s.bounds.h, ...ext.map(e => e.y1));
    if (s.shape === 'circle') { // keep the centre on the register axis
      const R = Math.max(s.cx - x0, x1 - s.cx, s.cy - y0, y1 - s.cy);
      x0 = s.cx - R; x1 = s.cx + R; y0 = s.cy - R; y1 = s.cy + R;
    }
    x0 = Math.floor(x0); y0 = Math.floor(y0);
    s.bounds = { x: x0, y: y0, w: Math.ceil(x1) - x0, h: Math.ceil(y1) - y0 };
  }
  // ---- tagged slots: the static half of the empty state, baked as one sprite ----
  for (const s of slots) {
    if (!s.tagged) continue;
    s.artLayers = items.filter(it => it.slot === s && it.kind === 'slotDecoration').map(it => it.L);
    if (s.dash) { const d = dashLayerFor(s); if (d) s.artLayers.push(d); }
    s.emptyItems = items.filter(it => it.slot === s && it.inEmpty && it.kind !== 'slotDecoration');
  }

  return { toggles, slots, items, firstLiveIdx, firstHandIdx };
}

/* Will this tagged item actually be drawn in the slot's EMPTY block? A provider-only token
   (event / sunrise / hr) has no data source of its own, so the empty state shows the '—'
   from the slot's art sprite instead and the token layer only lends its type styling. It
   must therefore not be drawn — nor counted when sizing the container. */
function drawnInEmpty(s, it) {
  if (!it.inEmpty) return false;
  if (it.kind === 'slotText') return !!(s.nativeUnder && TOKEN_TPL[it.L.token]);
  return true;
}

/* The '—' an empty slot shows where its value would be (04-complication-system §3a/§3b). */
export function dashLayerFor(slot) {
  const prim = slot.prim;
  if (!prim) return null;
  return { t: 'label', text: '—', x: prim.x, y: prim.y, size: Math.max(14, prim.size), weight: 500, color: 'muted', anchor: prim.anchor, font: prim.font };
}

/* Approximate the drawn extent of a layer, in dial coordinates. */
function layerExtent(L) {
  const cx = L.cx != null ? L.cx : C, cy = L.cy != null ? L.cy : C;
  const box = (x0, y0, x1, y1) => ({ x0, y0, x1, y1 });
  const round = (r) => box(cx - r, cy - r, cx + r, cy + r);
  switch (L.t) {
    case 'plate': return round((L.r || 0) + (L.rim || 3));
    case 'arc': case 'ring': return round((L.r || 0) + (L.w || 2) / 2 + 1);
    case 'ticks': case 'dots': case 'numerals': return round((L.r || 0) + Math.max(L.w || 0, L.dot || 0, (L.size || 0) * 0.7) + 1);
    case 'circle': return round((L.r || 0) + (L.sw || 0));
    case 'hand': return round(Math.max(Math.abs(L.len || 0), L.tail || 0, L.hub || 0) + (L.w || 4));
    case 'rect': return box(L.x, L.y, L.x + L.w, L.y + L.h);
    case 'icon': { const r = (L.s || 12) * 0.7 + 2; return box(L.x - r, L.y - r, L.x + r, L.y + r); }
    case 'line': return box(Math.min(L.x1, L.x2), Math.min(L.y1, L.y2), Math.max(L.x1, L.x2), Math.max(L.y1, L.y2));
    case 'label': case 'text': {
      const size = L.size || 12;
      const w = L.token ? tokenWidth(L.token, size, '') : Math.max(String(L.text || '').length, 1) * size * 0.62;
      const anchor = L.anchor || 'middle';
      const x0 = anchor === 'start' ? L.x : anchor === 'end' ? L.x - w : L.x - w / 2;
      return box(x0, L.y - size * 0.9, x0 + w, L.y + size * 0.9);
    }
    default: return null;
  }
}

/* =====================================================================
   Sprite plan
   ===================================================================== */
export function planSprites(face, analysis) {
  const sprites = [];
  const { items } = analysis;
  const perTheme = (mk) => { face.themes.forEach((_, ti) => mk(`t${ti}`)); mk('dark'); };

  for (const it of items.filter(x => x.kind === 'mainHand')) {
    const geom = handSpriteGeom(it.L);
    perTheme(tag => sprites.push({ name: `hand_${it.L.kind}_${tag}`, hands: [it.L], geom, tag }));
  }
  const centerSeconds = items.filter(x => x.kind === 'centerSecond').map(x => x.L);
  if (centerSeconds.length) {
    const geom = mergedSpriteGeom(centerSeconds);
    perTheme(tag => sprites.push({ name: `hand_second_${tag}`, hands: centerSeconds, geom, tag }));
  }
  items.filter(x => x.kind === 'subSecond').forEach((it, n) => {
    const geom = handSpriteGeom(it.L);
    perTheme(tag => sprites.push({ name: `subsec_${n}_${tag}`, hands: [it.L], geom, tag, sub: { cx: it.cx, cy: it.cy } }));
  });
  items.filter(x => x.kind === 'dataNeedle').forEach((it, n) => {
    const geom = handSpriteGeom(it.L);
    perTheme(tag => sprites.push({ name: `needle_${n}_${tag}`, hands: [it.L], geom, tag }));
  });
  for (const L of (face.aodLayers || []).filter(L => L.t === 'hand')) {
    sprites.push({ name: `aod_${L.kind}`, hands: [L], geom: handSpriteGeom(L), tag: 'aod' });
  }
  // A tagged slot's empty-state artwork bakes as ONE sprite per theme, from the same layer
  // recipes the dial uses — so it looks exactly as it did when it was baked into the dial,
  // it has just moved into the EMPTY block where the platform can swap it out.
  for (const s of analysis.slots.filter(x => x.tagged)) {
    if (!s.artLayers || !s.artLayers.length) continue;
    perTheme(tag => sprites.push({ name: `slotart_${s.idx}_${tag}`, slotart: { layers: s.artLayers, box: s.bounds }, tag }));
  }
  // label sprites for 'full' slots (static captions that must vanish when slot is emptied)
  const labelSprites = [];
  for (const s of analysis.slots) {
    if (s.tagged) continue; // tagged slots carry their captions in slotart above
    s.decorations.filter(d => d.t === 'label' && d.text !== '·').forEach((d, k) => {
      perTheme(tag => sprites.push({ name: `lbl_${s.idx}_${k}_${tag}`, label: d, geom: null, tag }));
      labelSprites.push({ slot: s, layer: d, k });
    });
    s.decorations.filter(d => d.t === 'icon').forEach((d, k) => {
      perTheme(tag => sprites.push({ name: `ic_${s.idx}_${k}_${tag}`, icon: d, geom: null, tag }));
    });
  }
  return sprites;
}

/* =====================================================================
   Live layer emission
   ===================================================================== */
function gateForArc(L, toggles) {
  const d = L.data;
  if (d === 'seconds') {
    if (toggles.secring) return '[CONFIGURATION.secring] ? 255 : 0';
    if (toggles.seconds) return '[CONFIGURATION.seconds] ? 255 : 0';
  }
  if (d === 'day' && toggles.dayarc) return '[CONFIGURATION.dayarc] ? 255 : 0';
  if (d === 'battery' && toggles.batt) return '[CONFIGURATION.batt] ? 255 : 0';
  if ((d === 'battery' || d === 'steps') && toggles.gauges) return '[CONFIGURATION.gauges] ? 255 : 0';
  return null;
}

function emitLiveLayer(item, face, roles, tag, toggles) {
  const L = item.L;
  const nm = (b) => `${b}_${tag}_${item.i}`;
  switch (item.kind) {
    case 'dataArc': {
      if (item.inEmpty) return null; // owned by a tagged slot — drawn in its EMPTY block
      const from = L.from != null ? L.from : 0;
      const to = L.to != null ? L.to : 360;
      const gate = gateForArc(L, toggles);
      // Ungated arcs get their track baked into the dial; only gated arcs carry it live
      // (a toggled-off arc must take its track with it).
      const arc = drawArc(L, roles, { endExpr: arcEndExpr(L.data, from, to), name: nm('arc'), includeTrack: !!gate });
      return gate
        ? el('Group', { x: 0, y: 0, width: 450, height: 450, name: nm('arcG') }, [el('Transform', { target: 'alpha', value: gate }), arc])
        : arc;
    }
    case 'liveText': return partTextFor(L, face, roles, { name: nm('txt'), minSize: MIN_LIVE_TEXT });
    case 'timeText': return timeTextFor(L, face, roles, { name: nm('time') });
    case 'ampm': return ampmFor(L, face, roles, { name: nm('ampm') });
    case 'centerCap': return drawCircle(L, roles, { name: nm('cap') });
    case 'overlayStatic': {
      if (L.t === 'ring') return el('PartDraw', { x: 0, y: 0, width: 450, height: 450, name: nm('ring') }, [
        el('Ellipse', { x: (L.cx ?? C) - L.r, y: (L.cy ?? C) - L.r, width: L.r * 2, height: L.r * 2 }, [
          `<Stroke color="${withOpacity(colFor(roles, L.color), L.opacity)}" thickness="${L.w || 1}" />`,
        ]),
      ]);
      if (L.t === 'circle') return drawCircle(L, roles, { name: nm('circ') });
      if (L.t === 'line') return drawLine(L, roles, { name: nm('line') });
      if (L.t === 'rect') return drawRect(L, roles, { name: nm('rect') });
      if (L.t === 'ticks') return drawTicks(L, roles, { name: nm('ticks') });
      if (L.t === 'dots') return drawDots(L, roles, { name: nm('dots') });
      return null;
    }
    case 'dateGatedStatic': {
      const inner = L.t === 'rect' ? drawRect(L, roles, { name: nm('df') })
        : L.t === 'circle' ? drawCircle(L, roles, { name: nm('dd') })
        : (L.t === 'label' && L.text === '·') ? drawCircle({ cx: L.x, cy: L.y, r: Math.max(1.2, (L.size || 10) * 0.14), color: L.color }, roles, { name: nm('dd') })
        : null;
      if (!inner) return null;
      return el('Group', { x: 0, y: 0, width: 450, height: 450, name: nm('dg') }, [
        el('Transform', { target: 'alpha', value: '[CONFIGURATION.date] ? 255 : 0' }), inner,
      ]);
    }
    default: return null;
  }
}

const handEl = (kindEl, sp, cx = 225, cy = 225, boxR = null) => {
  const g = sp.geom;
  const ox = boxR != null ? boxR : cx;
  const oy = boxR != null ? boxR : cy;
  return el(kindEl, {
    resource: `@drawable/${sp.name}`,
    x: Math.round(ox - g.pivotX), y: Math.round(oy - g.pivotY),
    width: g.W, height: g.H,
    pivotX: (g.pivotX / g.W).toFixed(4), pivotY: (g.pivotY / g.H).toFixed(4),
  }, kindEl === 'SecondHand' ? [sp.tickMotion ? el('Tick', { strength: 0.5, duration: 0.3 }) : el('Sweep', { frequency: 15 })] : []);
};

// part: undefined = everything (default) | 'sub' = the sub-second registers that sit under
// the main hands | 'main' = the main hands + centre seconds. Split so a tagged face can put
// its complication slots between the two.
function clocksXml(face, sprites, tag, analysis, toggles, part) {
  const parts = [];
  // A sub-hand owned by a tagged slot is that slot's empty-state artwork and is drawn
  // inside its EMPTY block instead — here it would be unable to react to a provider.
  const inEmpty = new Set(analysis.items.filter(it => it.inEmpty && it.L.t === 'hand').map(it => it.L));
  if (part !== 'main') {
    // sub-second registers first (they sit under the main hands)
    sprites.filter(s => s.tag === tag && s.name.startsWith('subsec_') && !s.hands.some(L => inEmpty.has(L))).forEach(sp => {
      const g = sp.geom;
      const r = Math.max(g.pivotY, g.H - g.pivotY, g.W / 2) + 2;
      parts.push(el('AnalogClock', {
        x: Math.round(sp.sub.cx - r), y: Math.round(sp.sub.cy - r), width: Math.ceil(r * 2), height: Math.ceil(r * 2),
      }, [handEl('SecondHand', { ...sp, tickMotion: true }, 0, 0, r)]));
    });
  }
  if (part === 'sub') return parts;
  const main = sprites.filter(s => s.tag === tag && (s.name.startsWith('hand_hour') || s.name.startsWith('hand_minute')));
  if (main.length) {
    parts.push(el('AnalogClock', { x: 0, y: 0, width: 450, height: 450 },
      main.map(sp => handEl(sp.name.includes('hour') ? 'HourHand' : 'MinuteHand', sp))));
  }
  const second = sprites.find(s => s.tag === tag && s.name.startsWith('hand_second_'));
  if (second) {
    const clock = el('AnalogClock', { x: 0, y: 0, width: 450, height: 450 }, [handEl('SecondHand', second)]);
    parts.push(toggles.seconds
      ? el('Group', { x: 0, y: 0, width: 450, height: 450, name: `secG_${tag}` }, [
          el('Transform', { target: 'alpha', value: '[CONFIGURATION.seconds] ? 255 : 0' }), clock])
      : clock);
  }
  return parts;
}
function needlesXml(face, sprites, tag, analysis) {
  const parts = [];
  analysis.items.filter(it => it.kind === 'dataNeedle').forEach((it, n) => {
    if (it.inEmpty) return; // owned by a tagged slot — drawn in its EMPTY block instead
    const sp = sprites.find(s => s.tag === tag && s.name === `needle_${n}_${tag}`);
    if (!sp) return;
    const g = sp.geom;
    const L = it.L;
    const from = L.from != null ? L.from : 0;
    const to = L.to != null ? L.to : 360;
    parts.push(el('PartImage', {
      x: Math.round(it.cx - g.pivotX), y: Math.round(it.cy - g.pivotY),
      width: g.W, height: g.H,
      pivotX: (g.pivotX / g.W).toFixed(4), pivotY: (g.pivotY / g.H).toFixed(4),
      angle: from, name: `needle_${n}_${tag}`,
    }, [
      el('Transform', { target: 'angle', value: arcEndExpr(L.data, from, to) }),
      el('Image', { resource: `@drawable/${sp.name}` }),
    ]));
  });
  return parts;
}

/* =====================================================================
   Complication slots
   ===================================================================== */
function slotTextArea(s) {
  // Where provider text renders: the frame interior, the union of the per-token
  // patch boxes, or the whole slot.
  if (s.frameRect && s.patchMode !== 'full') {
    return {
      x: Math.round(s.frameRect.x - s.bounds.x) + 3, y: Math.round(s.frameRect.y - s.bounds.y) + 2,
      w: s.frameRect.w - 6, h: s.frameRect.h - 4,
    };
  }
  if (s.patchMode !== 'full' && s.patchBoxes && s.patchBoxes.length) {
    const x0 = Math.min(...s.patchBoxes.map(b => b.x));
    const y0 = Math.min(...s.patchBoxes.map(b => b.y));
    const x1 = Math.max(...s.patchBoxes.map(b => b.x + b.w));
    const y1 = Math.max(...s.patchBoxes.map(b => b.y + b.h));
    return { x: x0 - s.bounds.x, y: y0 - s.bounds.y, w: x1 - x0, h: y1 - y0 };
  }
  return { x: 2, y: 2, w: s.bounds.w - 4, h: s.bounds.h - 4 };
}
function frameRedraw(s, roles, tag) {
  const f = s.frameRect;
  return el('PartDraw', { x: 0, y: 0, width: s.bounds.w, height: s.bounds.h, name: `frame_${tag}` }, [
    el(f.rx ? 'RoundRectangle' : 'Rectangle', {
      x: Math.round(f.x - s.bounds.x), y: Math.round(f.y - s.bounds.y), width: f.w, height: f.h,
      ...(f.rx ? { cornerRadiusX: f.rx, cornerRadiusY: f.rx } : {}),
    }, [
      `<Fill color="${colFor(roles, f.color)}" />`,
      ...(f.stroke ? [`<Stroke color="${colFor(roles, f.stroke)}" thickness="${f.sw || 1}" />`] : []),
    ]),
  ]);
}
function slotContent(face, s, roles, tag, type, sprites) {
  const kids = [];
  const cw = s.bounds.w, ch = s.bounds.h;
  if (s.isRing) {
    // patch = cover the native ring, then redraw its engraved track, then provider fill
    kids.push(el('PartDraw', { x: 0, y: 0, width: cw, height: ch, name: `patch_${tag}` }, [
      el('Arc', { centerX: cw / 2, centerY: ch / 2, width: s.r * 2, height: s.r * 2, startAngle: 0, endAngle: 360, direction: 'CLOCKWISE' }, [
        `<Stroke color="${roles.bg}" thickness="${(s.ringW || 4) + 4}" />`,
      ]),
    ]));
    if (s.ringTrack) {
      kids.push(el('PartDraw', { x: 0, y: 0, width: cw, height: ch, name: `rvtrk_${tag}` }, [
        el('Arc', { centerX: cw / 2, centerY: ch / 2, width: s.r * 2, height: s.r * 2, startAngle: 0, endAngle: 360, direction: 'CLOCKWISE' }, [
          `<Stroke color="${withOpacity(colFor(roles, s.ringTrack.color), s.ringTrack.opacity)}" thickness="${s.ringW || 4}" />`,
        ]),
      ]));
    }
    kids.push(el('PartDraw', { x: 0, y: 0, width: cw, height: ch, name: `rv_${tag}` }, [
      el('Arc', { centerX: cw / 2, centerY: ch / 2, width: s.r * 2, height: s.r * 2, startAngle: 0, endAngle: 0, direction: 'CLOCKWISE' }, [
        el('Transform', { target: 'endAngle', value: '(([COMPLICATION.RANGED_VALUE_VALUE] - [COMPLICATION.RANGED_VALUE_MIN]) / ([COMPLICATION.RANGED_VALUE_MAX] - [COMPLICATION.RANGED_VALUE_MIN])) * 360' }),
        `<Stroke color="${roles.accent}" thickness="${s.ringW || 4}" cap="ROUND" />`,
      ]),
    ]));
    return el('Group', { x: 0, y: 0, width: cw, height: ch, name: `sc_${tag}` }, kids);
  }

  const isCircle = s.shape === 'circle';
  // ---------- patch ----------
  if (isCircle) {
    const patchColor = s.plateColor ? colFor(roles, s.plateColor) : roles.bg;
    kids.push(el('PartDraw', { x: 0, y: 0, width: cw, height: ch, name: `patch_${tag}` }, [
      el('Ellipse', { x: 6, y: 6, width: cw - 12, height: ch - 12 }, [`<Fill color="${patchColor}" />`]),
    ]));
  } else if (s.patchMode === 'full') {
    kids.push(el('PartDraw', { x: 0, y: 0, width: cw, height: ch, name: `patch_${tag}` }, [
      el('Rectangle', { x: 0, y: 0, width: cw, height: ch }, [`<Fill color="${colFor(roles, s.underColor || 'bg')}" />`]),
    ]));
  } else if (s.frameRect) {
    kids.push(frameRedraw(s, roles, tag));
  } else if (s.patchBoxes && s.patchBoxes.length) {
    kids.push(el('PartDraw', { x: 0, y: 0, width: cw, height: ch, name: `patch_${tag}` },
      s.patchBoxes.map(b => el('Rectangle', {
        x: b.x - s.bounds.x, y: b.y - s.bounds.y, width: b.w, height: b.h,
      }, [`<Fill color="${colFor(roles, b.color)}" />`]))));
  } else {
    kids.push(el('PartDraw', { x: 0, y: 0, width: cw, height: ch, name: `patch_${tag}` }, [
      el('Rectangle', { x: 0, y: 0, width: cw, height: ch }, [`<Fill color="${colFor(roles, s.underColor || 'bg')}" />`]),
    ]));
  }

  // frame + decorations move INTO the block for 'full' slots (vanish when emptied)
  if (s.patchMode === 'full') {
    const frame = s.decorations.find(d => d.t === 'rect');
    if (frame) {
      kids.push(el('PartDraw', { x: 0, y: 0, width: cw, height: ch, name: `dframe_${tag}` }, [
        el(frame.rx ? 'RoundRectangle' : 'Rectangle', {
          x: Math.round(frame.x - s.bounds.x), y: Math.round(frame.y - s.bounds.y), width: frame.w, height: frame.h,
          ...(frame.rx ? { cornerRadiusX: frame.rx, cornerRadiusY: frame.rx } : {}),
        }, [
          `<Fill color="${colFor(roles, frame.color)}" />`,
          ...(frame.stroke ? [`<Stroke color="${colFor(roles, frame.stroke)}" thickness="${frame.sw || 1}" />`] : []),
        ]),
      ]));
    }
    s.decorations.filter(d => d.t === 'icon').forEach((d, k) => {
      const sp = sprites.find(x => x.tag === tag && x.name === `ic_${s.idx}_${k}_${tag}`);
      if (!sp) return;
      const box = Math.round((d.s || 12) * 2);
      kids.push(el('PartImage', {
        x: Math.round(d.x - box / 2 - s.bounds.x), y: Math.round(d.y - box / 2 - s.bounds.y),
        width: box, height: box, name: `ic_${s.idx}_${k}_${tag}`,
      }, [el('Image', { resource: `@drawable/${sp.name}` })]));
    });
    s.decorations.filter(d => d.t === 'label' && d.text !== '·').forEach((d, k) => {
      const sp = sprites.find(x => x.tag === tag && x.name === `lbl_${s.idx}_${k}_${tag}`);
      if (!sp) return;
      const w = Math.ceil(String(d.text).length * d.size * 0.7) + 8;
      const h = Math.ceil(d.size * 1.5);
      const anchor = d.anchor || 'middle';
      const x = anchor === 'start' ? d.x : anchor === 'end' ? d.x - w : d.x - w / 2;
      kids.push(el('PartImage', {
        x: Math.round(x - s.bounds.x), y: Math.round(d.y - h / 2 - s.bounds.y), width: w, height: h, name: `lbl_${s.idx}_${k}_${tag}`,
      }, [el('Image', { resource: `@drawable/${sp.name}` })]));
    });
  }

  const area = slotTextArea(s);
  if (type === 'RANGED_VALUE') {
    const rr = Math.min(cw, ch) / 2 - 8;
    if (isCircle) {
      kids.push(el('PartDraw', { x: 0, y: 0, width: cw, height: ch, name: `rvarc_${tag}` }, [
        el('Arc', { centerX: cw / 2, centerY: ch / 2, width: rr * 2, height: rr * 2, startAngle: 30, endAngle: 30, direction: 'CLOCKWISE' }, [
          el('Transform', { target: 'endAngle', value: '30 + ((([COMPLICATION.RANGED_VALUE_VALUE] - [COMPLICATION.RANGED_VALUE_MIN]) / ([COMPLICATION.RANGED_VALUE_MAX] - [COMPLICATION.RANGED_VALUE_MIN])) * 300)' }),
          `<Stroke color="${roles.accent}" thickness="3" cap="ROUND" />`,
        ]),
      ]));
    }
    const vSize = Math.max(MIN_SLOT_TEXT + 2, Math.round(Math.min(cw, ch) * 0.28));
    const f = wffFont(face.fontStack, { size: vSize, weight: 700 }, roles, roles.ink, vSize);
    // provider icon only where it verifiably fits (big circular registers)
    if (isCircle && Math.min(cw, ch) >= 80) {
      kids.push(el('PartImage', { x: Math.round(cw / 2 - 9), y: Math.round(ch / 2 - vSize * 0.75 - 22), width: 18, height: 18, tintColor: roles.muted, name: `rvic_${tag}` }, [
        el('Image', { resource: '[COMPLICATION.MONOCHROMATIC_IMAGE]' }),
      ]));
    }
    kids.push(el('PartText', { x: 4, y: Math.round(ch / 2 - vSize * 0.75), width: cw - 8, height: Math.round(vSize * 1.5), name: `rvtxt_${tag}` }, [
      el('Text', { align: 'CENTER', ellipsis: 'TRUE' }, [
        `<Font family="${f.family}" size="${f.size}" color="${f.color}"><Template>%.0f<Parameter expression="[COMPLICATION.RANGED_VALUE_VALUE]" /></Template></Font>`,
      ]),
    ]));
  } else {
    const prim = s.prim;
    const pSize = Math.max(MIN_SLOT_TEXT, prim ? prim.size : 16);
    const pf = wffFont(face.fontStack, prim || { size: pSize, weight: 600 }, roles,
      prim ? colFor(roles, prim.color) : roles.ink, pSize);
    const useMonoIcon = s.patchMode === 'full' && !s.decorations.some(d => d.t === 'icon') && /unread|notif|chip/i.test(s.label || '');
    let tx = Math.round(area.x), tw = Math.round(area.w), ty = Math.round(area.y), th = Math.round(area.h);
    if (useMonoIcon) {
      kids.push(el('PartImage', { x: tx, y: Math.round(ty + th / 2 - 8), width: 16, height: 16, tintColor: roles.muted, name: `stic_${tag}` }, [
        el('Image', { resource: '[COMPLICATION.MONOCHROMATIC_IMAGE]' }),
      ]));
      tx += 18; tw -= 18;
    }
    if (s.sec && s.patchMode === 'full' && ch >= 44 && s.sec.y < (prim ? prim.y : 1e9)) {
      const sSize = Math.max(12, s.sec.size);
      const sf = wffFont(face.fontStack, s.sec, roles, colFor(roles, s.sec.color), sSize);
      kids.push(el('PartText', { x: 2, y: Math.round(s.sec.y - sSize * 0.75 - s.bounds.y), width: cw - 4, height: Math.round(sSize * 1.5), name: `sttl_${tag}` }, [
        el('Text', { align: 'CENTER', ellipsis: 'TRUE' }, [
          `<Font family="${sf.family}" size="${sf.size}" color="${sf.color}"><Template>%s<Parameter expression="[COMPLICATION.TITLE]" /></Template></Font>`,
        ]),
      ]));
    }
    kids.push(el('PartText', { x: tx, y: ty, width: tw, height: th, name: `sttx_${tag}` }, [
      el('Text', { align: prim && prim.anchor === 'end' ? 'END' : prim && prim.anchor === 'start' ? 'START' : 'CENTER', ellipsis: 'TRUE' }, [
        `<Font family="${pf.family}" size="${pf.size}" color="${pf.color}"><Template>%s<Parameter expression="[COMPLICATION.TEXT]" /></Template></Font>`,
      ]),
    ]));
  }
  return el('Group', { x: 0, y: 0, width: cw, height: ch, name: `sc_${tag}` }, kids);
}

/* =====================================================================
   Tagged slots — a FRAME plus swappable CONTENT
   (handoff/04-complication-system.md). The frame (machined plate, bevelled
   panel, open dial) is permanent dial art drawn behind the slot and shared by
   every type block, so it is pixel-identical across all content and NOTHING is
   ever patched over it. The empty-state decorations (register scale, needle,
   date token, '—') live in the EMPTY block only, so the platform swaps them out
   the instant any provider is assigned. Every treatment uses theme roles only.
   ===================================================================== */
const CX = (s, v) => Math.round(v - s.bounds.x);
const CY = (s, v) => Math.round(v - s.bounds.y);

function tFont(face, roles, size, weight, color) {
  return wffFont(face.fontStack, { size, weight }, roles, color, size);
}
function tText(f, x, y, w, h, expr, align, name) {
  return el('PartText', { x: Math.round(x), y: Math.round(y), width: Math.round(w), height: Math.round(h), name }, [
    el('Text', { align: align || 'CENTER', ellipsis: 'TRUE' }, [
      `<Font family="${f.family}" size="${f.size}" color="${f.color}"><Template>%s<Parameter expression="${expr}" /></Template></Font>`,
    ]),
  ]);
}
function tNum(f, x, y, w, h, tpl, expr, align, name) {
  return el('PartText', { x: Math.round(x), y: Math.round(y), width: Math.round(w), height: Math.round(h), name }, [
    el('Text', { align: align || 'CENTER', ellipsis: 'TRUE' }, [
      `<Font family="${f.family}" size="${f.size}" color="${f.color}"><Template>${tpl}<Parameter expression="${expr}" /></Template></Font>`,
    ]),
  ]);
}
function tImage(x, y, w, h, expr, name, tint) {
  return el('PartImage', { x: Math.round(x), y: Math.round(y), width: Math.round(w), height: Math.round(h), tintColor: tint, name }, [
    el('Image', { resource: expr }),
  ]);
}
function tArc(cx, cy, r, from, to, color, thick, name, endExpr, cap) {
  return el('PartDraw', { x: 0, y: 0, width: Math.ceil(cx * 2), height: Math.ceil(cy * 2), name }, [
    el('Arc', { centerX: cx, centerY: cy, width: r * 2, height: r * 2, startAngle: from, endAngle: endExpr ? from : to, direction: 'CLOCKWISE' },
      [
        ...(endExpr ? [el('Transform', { target: 'endAngle', value: endExpr })] : []),
        `<Stroke color="${color}" thickness="${thick}" cap="${cap || 'ROUND'}" />`,
      ]),
  ]);
}

// The WFF spec defines NO behaviour for an endAngle outside [startAngle, startAngle+360]
// — not clamped, not wrapped — so every gauge expression clamps its own fraction to 0..1.
// clamp(v,min,max) is verified from the XSD function enum (v1+); note that min()/max() do
// NOT exist in WFF, hence clamp() and ternaries throughout.
const RV_FRAC = 'clamp(([COMPLICATION.RANGED_VALUE_VALUE] - [COMPLICATION.RANGED_VALUE_MIN]) / ([COMPLICATION.RANGED_VALUE_MAX] - [COMPLICATION.RANGED_VALUE_MIN]), 0, 1)';
const GP_VAL = '[COMPLICATION.GOAL_PROGRESS_VALUE]';
const GP_TGT = '[COMPLICATION.GOAL_PROGRESS_TARGET_VALUE]';
// Never divide by a provider-supplied zero: x/0 is Inf (or NaN for 0/0), and clamp(NaN) is
// NaN — which would feed a garbage angle to the arc and print "Infinity" as the percentage.
const GP_DIV = `(${GP_TGT} > 0 ? ${GP_TGT} : 1)`;
const GP_FRAC = `clamp(${GP_VAL} / ${GP_DIV}, 0, 1)`;
// The excess beyond the target, as its own 0..1 lap (GOAL_PROGRESS may exceed its target).
const GP_OVER = `clamp((${GP_VAL} - ${GP_TGT}) / ${GP_DIV}, 0, 1)`;

function taggedContent(face, s, roles, tag, type, sprites) {
  const kids = [];
  const cw = s.bounds.w, ch = s.bounds.h;
  const isPlate = s.frame === 'plate';
  const ver = (face.wff && face.wff.version) || 1;
  // Content rect (slot-relative). A panel lays out inside the FRAME the designer drew —
  // not the authored slot rect, and certainly not the grown container. Vakt-One's unread
  // chip is the case that proves it: slot rect 48 wide, container grown to 51 to swallow
  // the message glyph, but the bevelled chip itself is only 32 — content centred on
  // anything but the frame prints the count over the chip's own bevel.
  const frameRect = s.frame === 'panel' ? s.frameRect : null;
  const D = frameRect
    ? { x: CX(s, frameRect.x), y: CY(s, frameRect.y), w: frameRect.w, h: frameRect.h }
    : { x: CX(s, s.design.x), y: CY(s, s.design.y), w: s.design.w, h: s.design.h };
  const ccx = isPlate ? CX(s, s.cx) : D.x + D.w / 2;
  const ccy = isPlate ? CY(s, s.cy) : D.y + D.h / 2;
  const ri = isPlate ? s.r - 4 : 0;              // content radius inside the register
  const gaugeR = isPlate ? s.r - 6 : 0;
  const dia = isPlate ? s.r * 2 : Math.min(D.w, D.h);
  const vSize = Math.max(MIN_SLOT_TEXT + 2, Math.round(dia * 0.28));
  // Register titles/units read at a glance or not at all: floor at 20 on a plate (the
  // polish skill's legibility gate). A panel is only ~40 wide — 20 would not fit, and its
  // own dial type is smaller still, so panels keep the dial's scale.
  const sSize = isPlate ? Math.max(20, Math.round(dia * 0.15)) : Math.max(12, Math.round(dia * 0.15));
  const ink = tFont(face, roles, vSize, 700, roles.ink);
  const accent = tFont(face, roles, sSize, 600, roles.accent);
  const muted = tFont(face, roles, sSize, 600, roles.muted);
  const nm = (b) => `${b}_${type}_${tag}`;

  /* ---------- 3a. circular register (machined plate) ---------- */
  if (isPlate) {
    const vBox = (y) => [ccx - ri, y, ri * 2, Math.round(vSize * 1.5)];
    const centred = (f, tpl, expr, name, dy = 0) => tNum(f, ccx - ri, ccy - vSize * 0.75 + dy, ri * 2, Math.round(vSize * 1.5), tpl, expr, 'CENTER', name);
    const iconAbove = (name) => tImage(ccx - 9, ccy - ri * 0.44 - 9, 18, 18, '[COMPLICATION.MONOCHROMATIC_IMAGE]', name, roles.muted);
    const titleBelow = (f, name) => tText(f, ccx - ri, ccy + ri * 0.45 - sSize * 0.75, ri * 2, Math.round(sSize * 1.5), '[COMPLICATION.TITLE]', 'CENTER', name);

    switch (type) {
      case 'SHORT_TEXT':
        kids.push(iconAbove(nm('ic')));
        kids.push(tText(ink, ccx - ri, ccy - vSize * 0.75, ri * 2, Math.round(vSize * 1.5), '[COMPLICATION.TEXT]', 'CENTER', nm('v')));
        kids.push(titleBelow(muted, nm('t')));
        break;
      case 'LONG_TEXT':
        kids.push(tText(accent, ccx - ri, ccy - ri * 0.52 - sSize * 0.75, ri * 2, Math.round(sSize * 1.5), '[COMPLICATION.TITLE]', 'CENTER', nm('t')));
        kids.push(tText(tFont(face, roles, Math.max(MIN_SLOT_TEXT, Math.round(dia * 0.19)), 600, roles.ink),
          ccx - ri, ccy - Math.round(dia * 0.19) * 0.75, ri * 2, Math.round(dia * 0.19 * 1.5), '[COMPLICATION.TEXT]', 'CENTER', nm('v')));
        kids.push(tImage(ccx - 8, ccy + ri * 0.5 - 8, 16, 16, '[COMPLICATION.MONOCHROMATIC_IMAGE]', nm('ic'), roles.muted));
        break;
      case 'RANGED_VALUE':
        // 300° gauge, gap at 6 o'clock: track, then accent fill to the value.
        kids.push(tArc(cw / 2, ch / 2, gaugeR, -150, 150, withOpacity(roles.muted, 0.35), 3, nm('trk'), null, 'BUTT'));
        kids.push(tArc(cw / 2, ch / 2, gaugeR, -150, 150, roles.accent, 3, nm('fill'), `-150 + (${RV_FRAC} * 300)`));
        kids.push(iconAbove(nm('ic')));
        kids.push(centred(ink, '%.0f', '[COMPLICATION.RANGED_VALUE_VALUE]', nm('v')));
        kids.push(titleBelow(muted, nm('t')));
        break;
      case 'GOAL_PROGRESS': {
        // Full ring. The value may exceed the target, so the fill is capped at one lap and
        // the excess draws a second 'overflow' lap on top of it. The lap saturates at 2x
        // target — beyond that it stays a full second lap (the % readout keeps counting).
        // In dark mode lume, accent and ink are all the same fixed light ink, so a lume lap
        // would be invisible against the full accent ring underneath: fall back to muted,
        // the only other colour that palette licenses.
        const lap = roles.lume === roles.accent ? roles.muted : roles.lume;
        kids.push(tArc(cw / 2, ch / 2, gaugeR, 0, 360, withOpacity(roles.muted, 0.35), 3, nm('trk'), null, 'BUTT'));
        kids.push(tArc(cw / 2, ch / 2, gaugeR, 0, 360, roles.accent, 3, nm('fill'), `${GP_FRAC} * 360`));
        kids.push(el('Group', { x: 0, y: 0, width: cw, height: ch, name: nm('ovg') }, [
          el('Transform', { target: 'alpha', value: `${GP_VAL} > ${GP_TGT} ? 255 : 0` }),
          tArc(cw / 2, ch / 2, gaugeR, 0, 360, lap, 3, nm('ov'), `${GP_OVER} * 360`),
        ]));
        kids.push(centred(ink, '%.0f', GP_VAL, nm('v')));
        kids.push(tNum(tFont(face, roles, sSize, 600, roles.muted), ccx - ri, ccy + ri * 0.45 - sSize * 0.75, ri * 2, Math.round(sSize * 1.5),
          '%.0f%%', `(${GP_VAL} / ${GP_DIV}) * 100`, 'CENTER', nm('pct')));
        break;
      }
      case 'WEIGHTED_ELEMENTS':
        // The provider's own colours carry the meaning; each element is an arc segment
        // sized by its weight. WeightedStroke is the only element that renders this.
        kids.push(el('PartDraw', { x: 0, y: 0, width: cw, height: ch, name: nm('we') }, [
          el('Arc', { centerX: cw / 2, centerY: ch / 2, width: gaugeR * 2, height: gaugeR * 2, startAngle: 0, endAngle: 360, direction: 'CLOCKWISE' }, [
            el('WeightedStroke', {
              colors: '[COMPLICATION.WEIGHTED_ELEMENTS_COLORS]',
              weights: '[COMPLICATION.WEIGHTED_ELEMENTS_WEIGHTS]',
              thickness: 4, discreteGap: 7, cap: 'BUTT',
            }),
          ]),
        ]));
        kids.push(tImage(ccx - 10, ccy - 10, 20, 20, '[COMPLICATION.MONOCHROMATIC_IMAGE]', nm('ic'), roles.muted));
        break;
      case 'MONOCHROMATIC_IMAGE': {
        const b = Math.round(ri * 0.9);
        kids.push(tImage(ccx - b / 2, ccy - b / 2, b, b, '[COMPLICATION.MONOCHROMATIC_IMAGE]', nm('ic'), roles.ink));
        break;
      }
      case 'SMALL_IMAGE': {
        const b = Math.round(ri * 1.3); // square inscribed in the register floor
        kids.push(tImage(ccx - b / 2, ccy - b / 2, b, b, '[COMPLICATION.SMALL_IMAGE]', nm('img')));
        break;
      }
      case 'PHOTO_IMAGE': {
        const b = Math.round(ri * 1.41); // fills the floor without spilling past the rim
        kids.push(tImage(ccx - b / 2, ccy - b / 2, b, b, '[COMPLICATION.PHOTO_IMAGE]', nm('img')));
        break;
      }
      default: break;
    }
    return el('Group', { x: 0, y: 0, width: cw, height: ch, name: `sc_${type}_${tag}` }, kids);
  }

  /* ---------- 3b/3c. bevelled panel + open dial region ---------- */
  // Same content; the open region simply has no panel behind it. Both lay out inside the
  // authored window, and only the primary text inherits the dial's own type styling.
  const prim = s.prim;
  const pSize = Math.max(MIN_SLOT_TEXT, prim ? prim.size : 16);
  const pf = wffFont(face.fontStack, prim || { size: pSize, weight: 700 }, roles, prim ? colFor(roles, prim.color) : roles.ink, pSize);
  // §3b lays a title BELOW the value on a wide panel — but that needs a second row's worth
  // of height, not just width. VAKT's widest panels (the 66x22 sunrise rows, the 70x32
  // event line) are single-row: stacking there would push the title outside the slot and
  // onto its neighbour. So the title needs BOTH dimensions; the icon only needs width.
  const canIcon = D.w >= 58;
  const canTitle = D.w >= 58 && D.h >= 34;
  const TITLE_H = 18;
  const pAlign = prim && prim.anchor === 'end' ? 'END' : prim && prim.anchor === 'start' ? 'START' : 'CENTER';
  // Keep a row inside the frame: a box taller than the panel would clip its own glyphs.
  const rowIn = (y, h) => {
    const hh = Math.min(Math.round(h), D.h);
    return { y: Math.max(D.y, Math.min(Math.round(y), D.y + D.h - hh)), h: hh };
  };
  switch (type) {
    case 'SHORT_TEXT': {
      let tx = D.x + 2, tw = D.w - 4;
      if (canIcon) { // room for the provider's own glyph beside the value
        kids.push(tImage(tx, ccy - 8, 16, 16, '[COMPLICATION.MONOCHROMATIC_IMAGE]', nm('ic'), roles.muted));
        tx += 18; tw -= 18;
      }
      const v = canTitle
        ? rowIn(D.y + 1, Math.min(pSize * 1.5, D.h - TITLE_H - 2))
        : rowIn(ccy - pSize * 0.75, pSize * 1.5);
      kids.push(tText(pf, tx, v.y, tw, v.h, '[COMPLICATION.TEXT]', pAlign, nm('v')));
      if (canTitle) {
        const t = rowIn(D.y + D.h - TITLE_H - 1, TITLE_H);
        kids.push(tText(tFont(face, roles, MIN_SLOT_TEXT, 600, roles.muted), tx, t.y, tw, t.h, '[COMPLICATION.TITLE]', pAlign, nm('t')));
      }
      break;
    }
    case 'LONG_TEXT': {
      // Same rule: only stack a title when there is a second row to put it in.
      if (canTitle) {
        const t = rowIn(D.y + 1, TITLE_H);
        kids.push(tText(tFont(face, roles, MIN_SLOT_TEXT, 600, roles.accent), D.x + 2, t.y, D.w - 4, t.h, '[COMPLICATION.TITLE]', pAlign, nm('t')));
        const v = rowIn(D.y + TITLE_H + 1, D.h - TITLE_H - 2);
        kids.push(tText(tFont(face, roles, Math.max(MIN_SLOT_TEXT, pSize - 2), 600, roles.ink), D.x + 2, v.y, D.w - 4, v.h, '[COMPLICATION.TEXT]', pAlign, nm('v')));
      } else {
        const v = rowIn(ccy - pSize * 0.75, pSize * 1.5);
        kids.push(tText(tFont(face, roles, Math.max(MIN_SLOT_TEXT, pSize - 2), 600, roles.ink), D.x + 2, v.y, D.w - 4, v.h, '[COMPLICATION.TEXT]', pAlign, nm('v')));
      }
      break;
    }
    case 'RANGED_VALUE': case 'GOAL_PROGRESS': case 'WEIGHTED_ELEMENTS': {
      // A panel cannot hold a ring: compact horizontal bar under the value.
      const barY = D.y + D.h - 6, barX = D.x + 3, barW = D.w - 6;
      const v = rowIn(D.y + 1, Math.min(pSize * 1.5, D.h - 7)); // leave the bar its row
      kids.push(tText(pf, D.x + 2, v.y, D.w - 4, v.h, '[COMPLICATION.TEXT]', pAlign, nm('v')));
      kids.push(el('PartDraw', { x: 0, y: 0, width: cw, height: ch, name: nm('bar') }, [
        el('Rectangle', { x: barX, y: barY, width: barW, height: 3 }, [`<Fill color="${withOpacity(roles.muted, 0.35)}" />`]),
      ]));
      if (type === 'WEIGHTED_ELEMENTS') {
        // WeightedStroke on a <Line> is WFF v3+ (on an <Arc> it is v2+). Below v3 a panel
        // has no way to draw proportional segments, so it shows the provider's text only.
        if (ver >= 3) {
          kids.push(el('PartDraw', { x: 0, y: 0, width: cw, height: ch, name: nm('wbar') }, [
            el('Line', { startX: barX, startY: barY + 1.5, endX: barX + barW, endY: barY + 1.5 }, [
              el('WeightedStroke', {
                colors: '[COMPLICATION.WEIGHTED_ELEMENTS_COLORS]',
                weights: '[COMPLICATION.WEIGHTED_ELEMENTS_WEIGHTS]',
                thickness: 3, discreteGap: 2, cap: 'BUTT',
              }),
            ]),
          ]));
        }
      } else {
        const frac = type === 'RANGED_VALUE' ? RV_FRAC : GP_FRAC;
        kids.push(el('PartDraw', { x: 0, y: 0, width: cw, height: ch, name: nm('fill') }, [
          el('Rectangle', { x: barX, y: barY, width: barW, height: 3 }, [
            el('Transform', { target: 'width', value: `${frac} * ${barW}` }),
            `<Fill color="${roles.accent}" />`,
          ]),
        ]));
      }
      break;
    }
    case 'MONOCHROMATIC_IMAGE': {
      const b = Math.min(D.w, D.h) - 6;
      kids.push(tImage(ccx - b / 2, ccy - b / 2, b, b, '[COMPLICATION.MONOCHROMATIC_IMAGE]', nm('ic'), roles.ink));
      break;
    }
    case 'SMALL_IMAGE': {
      const b = Math.min(D.w, D.h) - 4;
      kids.push(tImage(ccx - b / 2, ccy - b / 2, b, b, '[COMPLICATION.SMALL_IMAGE]', nm('img')));
      break;
    }
    case 'PHOTO_IMAGE':
      kids.push(tImage(D.x + 1, D.y + 1, D.w - 2, D.h - 2, '[COMPLICATION.PHOTO_IMAGE]', nm('img')));
      break;
    default: break;
  }
  return el('Group', { x: 0, y: 0, width: cw, height: ch, name: `sc_${type}_${tag}` }, kids);
}

/* The EMPTY state: the slot's own default artwork, exactly as the dial used to bake it —
   scale sprite, native tokens, register needle. The platform hides this whole block the
   moment any provider is assigned, which is the entire architectural fix. */
function taggedEmpty(face, s, roles, tag, sprites, analysis) {
  const kids = [];
  const cw = s.bounds.w, ch = s.bounds.h;
  const art = sprites.find(x => x.tag === tag && x.name === `slotart_${s.idx}_${tag}`);
  if (art) {
    kids.push(el('PartImage', { x: 0, y: 0, width: cw, height: ch, name: `slotart_${tag}` }, [
      el('Image', { resource: `@drawable/${art.name}` }),
    ]));
  }
  for (const it of s.emptyItems || []) {
    const L = it.L;
    if (!drawnInEmpty(s, it)) continue;
    if (it.kind === 'slotText') {
      const pt = partTextFor({ ...L, x: L.x - s.bounds.x, y: L.y - s.bounds.y }, face, roles,
        { name: `nt_${tag}_${L.token}`, minSize: MIN_LIVE_TEXT });
      if (pt) kids.push(pt);
      continue;
    }
    if (it.kind === 'dataArc') {
      const from = L.from != null ? L.from : 0;
      const to = L.to != null ? L.to : 360;
      const cx = (L.cx != null ? L.cx : C) - s.bounds.x, cy = (L.cy != null ? L.cy : C) - s.bounds.y;
      if (L.track) {
        kids.push(tArc(cx, cy, L.r, from, Math.min(to, from + 360), withOpacity(colFor(roles, L.track), L.trackOpacity != null ? L.trackOpacity : 0.35),
          L.w, `etrk_${tag}_${it.i}`, null, (L.cap || 'butt').toUpperCase()));
      }
      kids.push(tArc(cx, cy, L.r, from, to, withOpacity(colFor(roles, L.color), L.opacity), L.w,
        `earc_${tag}_${it.i}`, arcEndExpr(L.data, from, to), (L.cap || 'butt').toUpperCase()));
      continue;
    }
    if (L.t === 'hand') {
      // <AnalogClock>/<SecondHand> are illegal inside <Complication> (allowed children are
      // Group/Condition/PartText/PartImage/PartAnimatedImage/PartDraw), so a register hand
      // is drawn as its own sprite rotated by a Transform. Seconds step per second, which
      // is what the scene-level sub-hands did too (they used <Tick>, never <Sweep>).
      const spName = it.kind === 'subSecond'
        ? `subsec_${analysis.items.filter(x => x.kind === 'subSecond').indexOf(it)}_${tag}`
        : `needle_${analysis.items.filter(x => x.kind === 'dataNeedle').indexOf(it)}_${tag}`;
      const sp = sprites.find(x => x.tag === tag && x.name === spName);
      if (!sp) continue;
      const g = sp.geom;
      const from = L.from != null ? L.from : 0;
      const to = L.to != null ? L.to : 360;
      const expr = it.kind === 'subSecond' ? '[SECOND] * 6' : arcEndExpr(L.data, from, to);
      kids.push(el('PartImage', {
        x: Math.round(it.cx - s.bounds.x - g.pivotX), y: Math.round(it.cy - s.bounds.y - g.pivotY),
        width: g.W, height: g.H,
        pivotX: (g.pivotX / g.W).toFixed(4), pivotY: (g.pivotY / g.H).toFixed(4),
        angle: it.kind === 'subSecond' ? 0 : from, name: `${spName}_e`,
      }, [
        el('Transform', { target: 'angle', value: expr }),
        el('Image', { resource: `@drawable/${sp.name}` }),
      ]));
    }
  }
  return el('Group', { x: 0, y: 0, width: cw, height: ch, name: `se_${tag}` }, kids);
}

function slotXml(face, s, analysis, strings, sprites) {
  const nameKey = `slot_${s.idx + 1}`;
  strings[nameKey] = s.label.replace(/·/g, '-');
  const supported = Array.from(new Set([...s.types, 'EMPTY'])).join(' ');
  const provType = s.provider === 'EMPTY' ? 'EMPTY' : (s.types.includes('SHORT_TEXT') ? 'SHORT_TEXT' : s.types[0]);
  const kids = [
    el('Variant', { mode: 'AMBIENT', target: 'alpha', value: 0 }),
    el('DefaultProviderPolicy', { defaultSystemProvider: s.provider, defaultSystemProviderType: provType }),
    s.isRing
      ? el('BoundingArc', { centerX: s.bounds.w / 2, centerY: s.bounds.h / 2, width: s.r * 2, height: s.r * 2, thickness: 18, startAngle: 0, endAngle: 360 })
      // The tap target stays on the frame the designer drew, even when the container was
      // grown to cover artwork outside it.
      : (s.shape === 'circle'
        ? el('BoundingOval', { x: CX(s, s.cx - s.r), y: CY(s, s.cy - s.r), width: s.r * 2, height: s.r * 2, outlinePadding: 2 })
        : el('BoundingBox', { x: CX(s, s.design.x), y: CY(s, s.design.y), width: s.design.w, height: s.design.h, outlinePadding: 2 })),
  ];
  const gate = s.dateGated ? '[CONFIGURATION.date] ? 255 : 0'
    : s.gaugeGated ? '[CONFIGURATION.gauges] ? 255 : 0' : null;
  // A tagged slot renders one block per supported type INCLUDING EMPTY: the empty block
  // carries the slot's default artwork, so the platform swaps the decoration out for the
  // provider's content automatically. Untagged slots keep the legacy patch behaviour.
  const types = s.tagged ? Array.from(new Set([...s.types, 'EMPTY'])) : s.types;
  const body = (roles, tg, type) => (s.tagged
    ? (type === 'EMPTY' ? taggedEmpty(face, s, roles, tg, sprites, analysis) : taggedContent(face, s, roles, tg, type, sprites))
    : slotContent(face, s, roles, tg, type, sprites));
  for (const type of types) {
    if (type === 'EMPTY' && !s.tagged) continue;
    const themed = el('Group', { x: 0, y: 0, width: s.bounds.w, height: s.bounds.h, name: `scT_${type}` }, [
      el('Transform', { target: 'alpha', value: '[CONFIGURATION.dark] ? 0 : 255' }),
      el('ListConfiguration', { id: 'theme' },
        face.themes.map((th, ti) => el('ListOption', { id: `t${ti}` }, [body(th.roles, `t${ti}`, type)]))),
    ]);
    const dark = el('Group', { x: 0, y: 0, width: s.bounds.w, height: s.bounds.h, name: `scD_${type}` }, [
      el('Transform', { target: 'alpha', value: '[CONFIGURATION.dark] ? 255 : 0' }),
      body(DARK_ROLES, 'dark', type),
    ]);
    const inner = gate
      ? [el('Group', { x: 0, y: 0, width: s.bounds.w, height: s.bounds.h, name: `scG_${type}` }, [
          el('Transform', { target: 'alpha', value: gate }), themed, dark])]
      : [themed, dark];
    kids.push(el('Complication', { type }, inner));
  }
  return el('ComplicationSlot', {
    slotId: s.idx, name: `slot${s.idx + 1}`, displayName: nameKey,
    x: Math.round(s.bounds.x), y: Math.round(s.bounds.y),
    width: Math.round(s.bounds.w), height: Math.round(s.bounds.h),
    supportedTypes: supported, isCustomizable: 'TRUE',
  }, kids);
}

/* =====================================================================
   AOD
   ===================================================================== */
function aodXml(face, sprites, toggles) {
  const roles = { bg: '#000000', ink: AOD_INK, accent: AOD_INK, muted: AOD_MUT, lume: AOD_MUT };
  const kids = [];
  const aodHands = [];
  let n = 0;
  for (const L of face.aodLayers || []) {
    const name = `aod${n++}`;
    if (L.t === 'hand') { aodHands.push(L); continue; }
    if (L.t === 'ticks') kids.push(drawTicks(L, roles, { name }));
    else if (L.t === 'dots') kids.push(drawDots(L, roles, { name }));
    else if (L.t === 'line') kids.push(drawLine(L, roles, { name }));
    else if (L.t === 'circle') kids.push(drawCircle(L, roles, { name }));
    else if (L.t === 'numerals') {
      const vals = L.vals || [];
      const cnt = vals.length;
      const from = L.from || 0, span = (L.to != null ? L.to : 360 + from) - from;
      vals.forEach((v, i) => {
        if (v === null || v === '' || isNaN(Number(v))) return;
        const a = from + (span * i) / cnt;
        const [x, y] = polar(225, 225, L.r, a);
        const f = wffFont(face.fontStack, L, roles, colFor(roles, L.color));
        const w = Math.ceil(L.size * 1.8);
        kids.push(el('PartText', { x: Math.round(x - w / 2), y: Math.round(y - L.size * 0.75), width: w, height: Math.round(L.size * 1.5), name: `${name}_${i}` }, [
          el('Text', { align: 'CENTER' }, [
            `<Font family="${f.family}" size="${f.size}" color="${f.color}"><Template>%d<Parameter expression="${Number(v)}" /></Template></Font>`,
          ]),
        ]));
      });
    }
    else if (L.t === 'text' && L.token) {
      if (TIME_TOKENS[L.token]) kids.push(timeTextFor(L, face, roles, { name, color: colFor(roles, L.color) }));
      else {
        const pt = partTextFor(L, face, roles, { name, color: colFor(roles, L.color) });
        if (pt) kids.push(pt);
      }
    }
    else if (L.t === 'arc' && L.data) {
      const arc = drawArc(L, roles, { endExpr: arcEndExpr(L.data, L.from != null ? L.from : 0, L.to != null ? L.to : 360), name });
      const gate = gateForArc(L, toggles || {});
      kids.push(gate
        ? el('Group', { x: 0, y: 0, width: 450, height: 450, name: `${name}g` }, [el('Transform', { target: 'alpha', value: gate }), arc])
        : arc);
    }
  }
  const handKids = aodHands.map(L => {
    const sp = sprites.find(x => x.tag === 'aod' && x.name === `aod_${L.kind}`);
    return sp ? handEl(L.kind === 'hour' ? 'HourHand' : 'MinuteHand', sp) : null;
  }).filter(Boolean);
  if (handKids.length) kids.push(el('AnalogClock', { x: 0, y: 0, width: 450, height: 450 }, handKids));
  return el('Group', { x: 0, y: 0, width: 450, height: 450, name: 'aod', alpha: 0 }, [
    el('Variant', { mode: 'AMBIENT', target: 'alpha', value: 255 }),
    ...kids,
  ]);
}

/* =====================================================================
   Top-level emit
   ===================================================================== */
export function emitFace(entry) {
  const { face, cat } = entry;
  const analysis = analyzeFace(face);
  const sprites = planSprites(face, analysis);
  const strings = { app_name: face.name, theme_label: 'Colour theme' };
  const warnings = [];
  const T = analysis.toggles;

  face.themes.forEach((th, ti) => { strings[`theme_${ti}`] = th.name; });
  const tglLabel = {
    seconds: 'Seconds hand', date: 'Date display', batt: 'Battery arc',
    dayarc: 'Daylight arc', secring: 'Seconds arc', gauges: 'Data gauges', dark: 'Pure-black dark mode',
  };

  const liveKids = (roles, tag) => {
    const under = [], over = [];
    for (const item of analysis.items) {
      const x = emitLiveLayer(item, face, roles, tag, T);
      if (!x) {
        if (item.kind === 'providerOnlyText' && !item.slot) warnings.push(`${face.id}: provider-only token '${item.L.token}' outside any slot — dropped`);
        continue;
      }
      (item.zone === 'under' ? under : over).push(x);
    }
    // scene-level native tokens beneath native-fallback slots
    for (const s of analysis.slots) {
      for (const L of s.nativeTokens) {
        const gate = s.dateGated && T.date ? '[CONFIGURATION.date] ? 255 : 0' : null;
        const pt = partTextFor(L, face, roles, {
          name: `nt_${tag}_${s.idx}_${L.token}`, minSize: MIN_LIVE_TEXT, gate,
          color: tag === 'dark' ? (TOKEN_TPL[L.token] ? undefined : undefined) : undefined,
        });
        if (pt) under.push(pt);
      }
    }
    return { under, over };
  };

  // A face with tagged slots splits its scene in two so the slots sit BETWEEN the dial and
  // the hands. ComplicationSlot must be a direct child of Scene — inside the per-theme
  // ListConfiguration it would be declared five times over — so a slot can only be ordered
  // relative to whole top-level groups. Left after the entire interactive group (the layout
  // every other face uses), a slot draws its content, and its empty-state register scale,
  // ON TOP of the hour and minute hands. Splitting puts the hands back over the register,
  // where a real chronograph has them. Referencing one ListConfiguration id from several
  // Scene elements is already proven: every slot's own type blocks do exactly that.
  const hasTagged = analysis.slots.some(s => s.tagged);
  const liveCache = new Map();
  const kidsFor = (roles, tag) => {
    if (!liveCache.has(tag)) liveCache.set(tag, liveKids(roles, tag));
    return liveCache.get(tag);
  };
  const dialImg = (tag) => el('PartImage', { x: 0, y: 0, width: 450, height: 450, name: `dial_${tag}` }, [
    el('Image', { resource: `@drawable/dial_${tag}` }),
  ]);
  const sceneAll = (roles, tag) => {
    const { under, over } = kidsFor(roles, tag);
    return [dialImg(tag), ...under, ...needlesXml(face, sprites, tag, analysis), ...clocksXml(face, sprites, tag, analysis, T), ...over];
  };
  const sceneUnder = (roles, tag) => {
    const { under } = kidsFor(roles, tag);
    return [dialImg(tag), ...under, ...needlesXml(face, sprites, tag, analysis), ...clocksXml(face, sprites, tag, analysis, T, 'sub')];
  };
  const sceneOver = (roles, tag) => {
    const { over } = kidsFor(roles, tag);
    return [...clocksXml(face, sprites, tag, analysis, T, 'main'), ...over];
  };

  const themeOptionsFor = (build) => face.themes.map((th, ti) => el('ListOption', { id: `t${ti}` }, [
    el('Group', { x: 0, y: 0, width: 450, height: 450, name: `theme_t${ti}` }, build(th.roles, `t${ti}`)),
  ]));
  const themeOptions = themeOptionsFor(hasTagged ? sceneUnder : sceneAll);
  const darkKids = (hasTagged ? sceneUnder : sceneAll)(DARK_ROLES, 'dark');
  const themeOptionsOver = hasTagged ? themeOptionsFor(sceneOver) : [];
  const darkKidsOver = hasTagged ? sceneOver(DARK_ROLES, 'dark') : [];

  const slotsXml = analysis.slots.map(s => slotXml(face, s, analysis, strings, sprites));
  const clockType = cat.id === 'CAT-D' ? 'DIGITAL' : 'ANALOG';

  // Prune toggles that gate nothing (dead editor switches — spec settings blocks are
  // family-wide but some faces lack the corresponding layer, e.g. B2-B5 battery arc,
  // C1/C3/C4 day arc, D3 seconds arc). 'dark' is structural and always kept.
  const aodStr = aodXml(face, sprites, T);
  const bodyStr = themeOptions.join('') + darkKids.join('') + themeOptionsOver.join('')
    + darkKidsOver.join('') + slotsXml.join('') + aodStr;
  for (const key of Object.keys(T)) {
    if (key === 'dark') continue;
    if (!bodyStr.includes(`[CONFIGURATION.${key}]`)) {
      warnings.push(`pruned dead toggle '${key}' (declared in spec settings, gates nothing on this face)`);
      delete T[key];
    }
  }
  const toggleDefs = Object.keys(T).map(key => {
    strings[`cfg_${key}`] = tglLabel[key] || key;
    return el('BooleanConfiguration', { id: key, displayName: `cfg_${key}`, defaultValue: T[key].default ? 'TRUE' : 'FALSE' });
  });

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<!--
  ${face.id} — ${face.name} (${cat.name} - ${cat.series})
  Generated by tools/gen/build-all.mjs from the canonical handoff spec data.
  WFF v1 - theme switch = ListConfiguration (structural, baked per-theme dial art);
  dark mode = 5.2(a) universal-readable fixed light ink (${AOD_INK} / ${AOD_MUT}).
-->
${el('WatchFace', { width: 450, height: 450, clipShape: 'CIRCLE' }, [
    el('Metadata', { key: 'CLOCK_TYPE', value: clockType }),
    el('Metadata', { key: 'PREVIEW_TIME', value: '10:08:36' }),
    el('UserConfigurations', {}, [
      el('ListConfiguration', { id: 'theme', displayName: 'theme_label', defaultValue: 't0' },
        face.themes.map((_, ti) => el('ListOption', { id: `t${ti}`, displayName: `theme_${ti}` }))),
      ...toggleDefs,
    ]),
    el('Scene', { backgroundColor: '#FF000000' }, [
      el('Group', { x: 0, y: 0, width: 450, height: 450, name: 'interactive' }, [
        el('Variant', { mode: 'AMBIENT', target: 'alpha', value: 0 }),
        el('Group', { x: 0, y: 0, width: 450, height: 450, name: 'themed' }, [
          ...(T.dark ? [el('Transform', { target: 'alpha', value: '[CONFIGURATION.dark] ? 0 : 255' })] : []),
          el('ListConfiguration', { id: 'theme' }, themeOptions),
        ]),
        ...(T.dark ? [el('Group', { x: 0, y: 0, width: 450, height: 450, name: 'darkTwin' }, [
          el('Transform', { target: 'alpha', value: '[CONFIGURATION.dark] ? 255 : 0' }),
          ...darkKids,
        ])] : []),
      ]),
      ...(hasTagged ? [] : [aodXml(face, sprites, T)]),
      ...slotsXml,
      // The hands, re-laid OVER the slots (see the split above).
      ...(hasTagged ? [
        el('Group', { x: 0, y: 0, width: 450, height: 450, name: 'interactiveOver' }, [
          el('Variant', { mode: 'AMBIENT', target: 'alpha', value: 0 }),
          el('Group', { x: 0, y: 0, width: 450, height: 450, name: 'themedOver' }, [
            ...(T.dark ? [el('Transform', { target: 'alpha', value: '[CONFIGURATION.dark] ? 0 : 255' })] : []),
            el('ListConfiguration', { id: 'theme' }, themeOptionsOver),
          ]),
          ...(T.dark ? [el('Group', { x: 0, y: 0, width: 450, height: 450, name: 'darkTwinOver' }, [
            el('Transform', { target: 'alpha', value: '[CONFIGURATION.dark] ? 255 : 0' }),
            ...darkKidsOver,
          ])] : []),
        ]),
        aodXml(face, sprites, T),
      ] : []),
    ]),
  ])}
`;
  return { xml, strings, sprites, analysis, warnings };
}
