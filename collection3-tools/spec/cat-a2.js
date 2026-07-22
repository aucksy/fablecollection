/* CAT-A — VAKT INSTRUMENT SERIES (v2.1 — restored per direction, LCD column removed)
   The approved v2 family (flange + applied markers + skeleton bridges +
   machined registers), now PURE ANALOG: the right-hand digital LCD screen
   is deleted on every face and replaced with a framed date window.
   Design space: 450×450, center (225,225). All layers map to WFF v1
   mechanisms — depth/bevels/textures ship as pre-rendered static images,
   hands ship as artwork with baked shadows and lume. */

const F_LBL = "'Archivo', sans-serif";
const F_DIG = "'Saira SemiCondensed', sans-serif";

/* Supported complication types per slot-frame style. Every VAKT slot accepts
   the full set its frame can render, so any provider the user picks lands
   cleanly (see faces/renderer.jsx complRender + handoff/04-complication-system.md). */
/* ⭐ The machined registers accept ONLY the two types a needle can be driven from
   (owner 2026-07-20: no text inside the chronos, only the original design). RANGED_VALUE
   carries value/min/max, GOAL_PROGRESS carries value/target — both reduce to a fraction the
   design's own needle and arc can show. Text and image types would have to draw something the
   design does not have, so the slot does not advertise them and the watch's editor cannot
   offer them there. Verified legal: `supportedTypes` is a free list of complicationType
   (2/complication/complicationSlotElement.xsd) and a trimmed list passes the validator. */
const GAUGE_TYPES = ['RANGED_VALUE', 'GOAL_PROGRESS'];
const CIRC_TYPES = ['SHORT_TEXT', 'LONG_TEXT', 'RANGED_VALUE', 'GOAL_PROGRESS', 'WEIGHTED_ELEMENTS', 'MONOCHROMATIC_IMAGE', 'SMALL_IMAGE', 'PHOTO_IMAGE'];
const PANEL_TYPES = ['SHORT_TEXT', 'LONG_TEXT', 'RANGED_VALUE', 'MONOCHROMATIC_IMAGE', 'SMALL_IMAGE'];
const OPEN_TYPES = ['SHORT_TEXT', 'LONG_TEXT', 'MONOCHROMATIC_IMAGE'];

function T(id, name, desc, roles, finish) {
  return { id, name, desc, roles, finish };
}

/* ---------- construction helpers ---------- */

/* Tag a slot's default artwork so the renderer hides it the instant the user
   assigns a real complication — the frame is then redrawn by the complication
   engine and the type-appropriate content takes the content's place. */
function withSlot(arr, slotId) {
  return slotId ? arr.map(function (l) { return Object.assign({ slot: slotId }, l); }) : arr;
}

function flangeAndMarkers(opts) {
  const o = opts || {};
  return [
    { t: 'flange', r0: 225, r1: 202, color: o.flange || 'shade:bg:-0.3', floor: 'bg' },
    { t: 'ticks', r: 222, count: 60, len: 7, w: 1.3, color: o.trackColor || 'muted' },
    { t: 'applied', r: 220, count: 12, w: 8, len: 17, lume: true, majorScale: 1.25, skip: o.skip || [] },
  ];
}

function skeletonWork() {
  return [
    { t: 'bridge', r0: 150, r1: 196, a0: 118, a1: 244, color: 'shade:bg:-0.42' },
    { t: 'bridge', r0: 150, r1: 196, a0: 258, a1: 356, color: 'shade:bg:-0.38' },
    { t: 'ring', r: 150, w: 1, color: 'shade:bg:0.14', opacity: 0.5 },
    { t: 'screw', cx: 129, cy: 320, r: 5.5, a: -35 },
    { t: 'screw', cx: 96, cy: 180, r: 5.5, a: 60 },
    { t: 'screw', cx: 300, cy: 372, r: 5.5, a: 15 },
  ];
}

function registerScale(cx, cy, r, slotId) {
  return withSlot([
    { t: 'plate', cx, cy, r, rim: 3.5 },
    { t: 'ticks', cx, cy, r: r - 6, count: 25, len: 5, w: 1.1, color: 'muted', from: 30, to: 330 },
    { t: 'ticks', cx, cy, r: r - 6, count: 5, len: 10, w: 2, color: 'ink', from: 30, to: 330 },
    { t: 'numerals', cx, cy, vals: [0, 50, 100, 150, 200, 250], r: r - 21, size: 12.5, weight: 700, color: 'ink', from: 30, to: 330 },
    { t: 'icon', name: 'hr', x: cx, y: cy + r * 0.5, s: 8, color: 'muted' },
    { t: 'hand', kind: 'second', cx, cy, len: r - 10, tail: 13, w: 1.8, shape: 'needle', color: 'accent', hub: 4, shadow: true },
  ], slotId);
}

function registerBattery(cx, cy, r, slotId) {
  return withSlot([
    { t: 'plate', cx, cy, r, rim: 3 },
    { t: 'ticks', cx, cy, r: r - 5, count: 20, len: 4, w: 1, color: 'muted', from: 40, to: 320 },
    { t: 'numerals', cx, cy, vals: [0, 25, 50, 75, 100], r: r - 16, size: 10.5, weight: 700, color: 'ink', from: 40, to: 320 },
    { t: 'arc', cx, cy, r: r - 5, w: 2.5, from: 40, to: 320, color: 'lume', data: 'battery', track: 'muted', trackOpacity: 0.22 },
    { t: 'icon', name: 'bolt', x: cx, y: cy + r * 0.48, s: 8.5, color: 'muted', filled: true },
    { t: 'hand', kind: 'data', data: 'battery', from: 40, to: 320, cx, cy, len: r - 10, tail: 10, w: 1.6, shape: 'needle', color: 'lume', hub: 3.4, shadow: true },
  ], slotId);
}

function registerSteps(cx, cy, r, slotId) {
  return withSlot([
    { t: 'plate', cx, cy, r, rim: 3.5 },
    { t: 'ticks', cx, cy, r: r - 5, count: 50, len: 4, w: 0.9, color: 'muted' },
    { t: 'ticks', cx, cy, r: r - 5, count: 10, len: 9, w: 1.9, color: 'ink' },
    { t: 'numerals', cx, cy, vals: [0, null, 2, null, 4, null, 6, null, 8, null], r: r - 17, size: 12.5, weight: 700, color: 'ink' },
    { t: 'icon', name: 'steps', x: cx, y: cy - r * 0.45, s: 8.5, color: 'muted', filled: true },
    { t: 'hand', kind: 'data', data: 'stepsDial', cx, cy, len: r - 9, tail: 11, w: 1.6, shape: 'needle', color: 'lume', hub: 3.4, shadow: true },
  ], slotId);
}

/* framed date window — replaces the deleted LCD column */
function dateWindow(x, y, slotId) {
  return withSlot([
    { t: 'rect', x: x - 20, y: y - 15, w: 40, h: 30, rx: 4, color: 'shade:bg:-0.5', stroke: 'shade:bg:0.18', sw: 1.2 },
    { t: 'text', token: 'dnum', x, y: y + 1, size: 19, weight: 700, color: 'lume', font: F_DIG },
  ], slotId);
}

/* ================= GT: complication-ready registers, SAME ARTWORK ==================
   The design's own `registerScale`/`registerSteps` wrap EVERY layer in `withSlot(...)`,
   which makes the whole machined register the slot's EMPTY-state artwork — so the
   instant a user assigns any complication, the ticks and numerals vanish and a bare
   plate is left. These variants change WHO OWNS each layer, not what is drawn:

     plate + tick sets  → UNTAGGED = permanent hardware, baked into the dial, so the
                          machined register survives under every complication type
     numerals           → tagged: they are the only metric-specific part, so they stay
                          the design's own numbers when the dial is empty, and the
                          generator redraws them from the provider's own scale when a
                          gauge is assigned
     icon + needle      → tagged, exactly as the design has them (a provider replaces them)

   Pixel-for-pixel identical to the design in the default state — verified by the
   fidelity gate, not by eye (`node check.mjs`). Since 2026-07-22 ALL FIVE VAKT faces
   use these variants (the settled instrument design, applied fleet-wide). */
function registerScaleGT(cx, cy, r, slotId) {
  return [
    { t: 'plate', cx, cy, r, rim: 3.5 },
    { t: 'ticks', cx, cy, r: r - 6, count: 25, len: 5, w: 1.1, color: 'muted', from: 30, to: 330 },
    { t: 'ticks', cx, cy, r: r - 6, count: 5, len: 10, w: 2, color: 'ink', from: 30, to: 330 },
    { t: 'numerals', cx, cy, vals: [0, 50, 100, 150, 200, 250], r: r - 21, size: 12.5, weight: 700, color: 'ink', from: 30, to: 330 },
    ...withSlot([
      // The icon is the ONE thing a complication may replace: it is what tells you which metric
      // the needle is following. Same spot, same size as the design's engraved glyph, so an
      // emptied dial shows the design's own heart again.
      { t: 'icon', name: 'hr', x: cx, y: cy + r * 0.5, s: 8, color: 'muted' },
      { t: 'hand', kind: 'second', cx, cy, len: r - 10, tail: 13, w: 1.8, shape: 'needle', color: 'accent', hub: 4, shadow: true },
    ], slotId),
  ];
}

function registerStepsGT(cx, cy, r, slotId) {
  return [
    { t: 'plate', cx, cy, r, rim: 3.5 },
    { t: 'ticks', cx, cy, r: r - 5, count: 50, len: 4, w: 0.9, color: 'muted' },
    { t: 'ticks', cx, cy, r: r - 5, count: 10, len: 9, w: 1.9, color: 'ink' },
    { t: 'numerals', cx, cy, vals: [0, null, 2, null, 4, null, 6, null, 8, null], r: r - 17, size: 12.5, weight: 700, color: 'ink' },
    ...withSlot([
      { t: 'icon', name: 'steps', x: cx, y: cy - r * 0.45, s: 8.5, color: 'muted', filled: true },
      { t: 'hand', kind: 'data', data: 'stepsDial', cx, cy, len: r - 9, tail: 11, w: 1.6, shape: 'needle', color: 'lume', hub: 3.4, shadow: true },
    ], slotId),
  ];
}

/* Battery register, made assignable — SAME ARTWORK, same ownership split as its two siblings.
   In the source design this register is not a slot at all: `registerBattery` is native art, so
   only two of GT's three chronos could ever take a complication. This variant changes WHO OWNS
   each layer, not what is drawn:

     plate + tick set + the engraved bolt → UNTAGGED = permanent hardware, baked into the dial
     numerals + gauge arc + needle        → tagged: the parts that must re-scale to whatever the
                                            user assigns (0–100 becomes 0–600 kcal, 40–200 bpm …)

   ⚠ The bolt stays ENGRAVED rather than swapping to the provider's own icon. That is the one
   deliberate trade here, and it is what makes the fresh install pixel-identical: the register's
   default is the real WATCH_BATTERY complication (never `EMPTY`, which the platform renders as a
   black hole on first install — audit L1), so the default state IS an assigned-provider state,
   and a provider icon there would replace the design's bolt with a different glyph in a different
   place. Cost: assign a non-battery source and the bolt is still engraved on the plate. */
function registerBatteryGT(cx, cy, r, slotId) {
  return [
    { t: 'plate', cx, cy, r, rim: 3 },
    { t: 'ticks', cx, cy, r: r - 5, count: 20, len: 4, w: 1, color: 'muted', from: 40, to: 320 },
    { t: 'numerals', cx, cy, vals: [0, 25, 50, 75, 100], r: r - 16, size: 10.5, weight: 700, color: 'ink', from: 40, to: 320 },
    ...withSlot([
      { t: 'icon', name: 'bolt', x: cx, y: cy + r * 0.48, s: 8.5, color: 'muted', filled: true },
      { t: 'arc', cx, cy, r: r - 5, w: 2.5, from: 40, to: 320, color: 'lume', data: 'battery', track: 'muted', trackOpacity: 0.22 },
      { t: 'hand', kind: 'data', data: 'battery', from: 40, to: 320, cx, cy, len: r - 10, tail: 10, w: 1.6, shape: 'needle', color: 'lume', hub: 3.4, shadow: true },
    ], slotId),
  ];
}

/* ---------- live-instrument registers (VAKT instrument design, owner-approved 2026-07-19) ----------
   Each machined register renders its home sensor as a real instrument: the scale bakes CLEAN
   (ticks only — numerals collide with the centre value at watch size), and the needle/ring +
   provider icon + value are drawn LIVE by the generator's taggedContent from the slot's default
   (battery→WATCH_BATTERY/RANGED_VALUE, HR→HEART_RATE/RANGED_VALUE, steps→STEP_COUNT/GOAL_PROGRESS),
   so the default looks identical to picking the home provider, and stays fully swappable. */

/* ⭐ FRAME vs CONTENT (the rule that makes these registers work — see VAKT-COMPLICATIONS-PLAN §1):
   the plate AND its engraved tick scale are permanent HARDWARE — they must stay UNTAGGED so they bake
   into the dial and are therefore visible under EVERY complication type. Only the parts a provider
   replaces (the baked icon, the empty-state needle) carry the slot tag and live in the EMPTY block.
   Tagging the ticks makes the machined scale vanish the instant any provider is assigned. */

/* Heart-rate needle register — 40..200 scale, gap at 6 o'clock (-150..150), heart above. */
function registerHR(cx, cy, r, slotId) {
  return [
    { t: 'plate', cx, cy, r, rim: 3.5 },
    { t: 'ticks', cx, cy, r: r - 5, count: 20, len: 5, w: 1.1, color: 'muted', from: -150, to: 150 },
    { t: 'ticks', cx, cy, r: r - 5, count: 4, len: 10, w: 2, color: 'ink', from: -150, to: 150 },
    ...withSlot([
      { t: 'icon', name: 'hr', x: cx, y: cy - r * 0.5, s: 9, color: 'muted' },
      { t: 'hand', kind: 'second', cx, cy, len: r - 12, tail: 13, w: 1.8, shape: 'needle', color: 'accent', hub: 3.4, shadow: true },
    ], slotId),
  ];
}

/* Battery needle register — 0..100 scale, gap at top where the bolt sits (40..320). */
function registerBatterySlot(cx, cy, r, slotId) {
  return [
    { t: 'plate', cx, cy, r, rim: 3 },
    { t: 'ticks', cx, cy, r: r - 5, count: 20, len: 4, w: 1, color: 'muted', from: 40, to: 320 },
    ...withSlot([
      { t: 'icon', name: 'bolt', x: cx, y: cy - r * 0.5, s: 8.5, color: 'muted', filled: true },
      { t: 'hand', kind: 'data', data: 'battery', from: 40, to: 320, cx, cy, len: r - 10, tail: 10, w: 1.6, shape: 'needle', color: 'lume', hub: 3.4, shadow: true },
    ], slotId),
  ];
}

/* Steps hero register — footprints above + the design's own lume needle. The needle is
   verbatim from the original `registerSteps` (handoff `faces/cat-a2.js` line 81): lume,
   len r-9, tail 11, w 1.6, hub 3.4. It is the register's personality — the goal ring alone
   is not this dial. Its external progress arc (r71, OUTSIDE the r64 plate) is a separate
   layer on the face, tagged to the same slot, exactly as the original had it. */
function registerStepsGoal(cx, cy, r, slotId) {
  return withSlot([
    { t: 'plate', cx, cy, r, rim: 3.5 },
    { t: 'icon', name: 'steps', x: cx, y: cy - r * 0.5, s: 9, color: 'muted', filled: true },
    { t: 'hand', kind: 'data', data: 'stepsDial', cx, cy, len: r - 9, tail: 11, w: 1.6, shape: 'needle', color: 'lume', hub: 3.4, shadow: true },
  ], slotId);
}

/* De-slotted native date — day number + weekday, gated by the Date toggle, non-customisable. */
function dateWindowLocked(x, y) {
  return [
    { t: 'text', token: 'dnum', x, y: y - 2, size: 20, weight: 700, color: 'lume', font: F_DIG, dateLock: true },
    { t: 'text', token: 'day3', x, y: y + 22, size: 12, weight: 700, color: 'muted', font: F_DIG, dateLock: true },
  ];
}

/* De-slotted native date WINDOW — the design's own recessed frame + dnum (+ day3 where the
   design has one), pixel-identical to `dateWindow`, but locked native: every layer answers
   only to the Date toggle (dateLock → dateLockStatic/dateLockText), no slot, non-customisable,
   never blank. Applied to the 4 non-GT VAKT faces per the settled instrument design's register
   map (docs/COMPLICATION-FIX-PROGRESS.md — "date→locked native"). */
function dateWindowNative(x, y, day3y) {
  const L = [
    { t: 'rect', x: x - 20, y: y - 15, w: 40, h: 30, rx: 4, color: 'shade:bg:-0.5', stroke: 'shade:bg:0.18', sw: 1.2, dateLock: true },
    { t: 'text', token: 'dnum', x, y: y + 1, size: 19, weight: 700, color: 'lume', font: F_DIG, dateLock: true },
  ];
  if (day3y != null) L.push({ t: 'text', token: 'day3', x, y: day3y, size: 12, weight: 700, color: 'muted', font: F_DIG, dateLock: true });
  return L;
}

function mainHands(o) {
  o = o || {};
  return [
    { t: 'hand', kind: 'hour', len: 122, tail: 22, w: 10, shape: 'arrow', metal: true, lume: true, stroke: '#0a0a0a', sw: 0.8 },
    { t: 'hand', kind: 'minute', len: 182, tail: 26, w: 7, shape: 'sword', metal: true, lume: true, stroke: '#0a0a0a', sw: 0.8 },
    { t: 'hand', kind: 'second', len: 194, tail: 38, w: 2, shape: 'needle', color: o.second || 'accent', shadow: true },
    { t: 'hand', kind: 'second', len: -26, tail: 38, w: 5, shape: 'baton', color: o.second || 'accent', shadow: false, hub: 8 },
  ];
}

function vaktAOD(extra) {
  return [
    { t: 'ticks', r: 220, count: 12, len: 13, w: 2.6, color: 'muted' },
    { t: 'hand', kind: 'hour', len: 114, tail: 16, w: 4, shape: 'baton', color: 'ink' },
    { t: 'hand', kind: 'minute', len: 174, tail: 20, w: 3, shape: 'baton', color: 'ink' },
    { t: 'circle', r: 5, cx: 225, cy: 225, color: 'ink' },
    { t: 'text', token: 'hmm', x: 225, y: 322, size: 34, weight: 600, color: 'ink', font: F_DIG },
    { t: 'text', token: 'battN', x: 225, y: 352, size: 15, weight: 600, color: 'muted', font: F_DIG },
    ...(extra || []),
  ];
}

const VAKT_SETTINGS = (fid) => ([
  { id: `SET-${fid}-THEME`, type: 'colorTheme', label: 'Colour theme (retints flange, lume, accents — all dial artwork, never the hardware)', options: '5 swatch options (≤5 roles each)', default: 'Theme 01' },
  { id: `SET-${fid}-SECONDS`, type: 'toggle', label: 'Central seconds hand', options: 'on / off', default: 'on' },
  { id: `SET-${fid}-DATE`, type: 'toggle', label: 'Date window', options: 'on / off', default: 'on' },
  { id: `SET-${fid}-DARK`, type: 'toggle', label: 'Pure-black dark mode (ink switches to fixed light ink — strategy 5.2a)', options: 'on / off', default: 'off' },
]);

const VAKT_FEAS = () => ([
  { feature: 'Analog hour / minute / sweep seconds', badge: 'NATIVE', mech: 'Clock hands from supplied artwork (shadows + lume baked into hand images); platform-driven sweep' },
  { feature: 'Dimensional dial (flange, bridges, machined registers, applied indices)', badge: 'NATIVE', mech: 'One pre-rendered static dial image per theme — WFF renders images; all depth is baked, nothing animates' },
  { feature: 'Battery register (needle + arc)', badge: 'NATIVE', mech: 'Data-driven arc fill + ranged hand bound to watch battery %' },
  { feature: 'Step register (1 = 1,000 steps)', badge: 'NATIVE', mech: 'Ranged hand bound to step progress (mod-10k scale baked into artwork)' },
  { feature: 'Framed date window', badge: 'NATIVE', mech: 'Native day-number token in a recessed frame' },
  { feature: 'Any-provider complication slots', badge: 'NATIVE', mech: 'Every slot renders all Wear OS complication types (short/long text, ranged value, goal progress, weighted elements, monochromatic/small/photo image) in the dial\'s own style — the machined frame is fixed hardware, only the content adapts, so no provider the user picks can break the composition' },
  { feature: '0–250 register needle (heart rate)', badge: 'PROVIDER', mech: 'RANGED_VALUE complication, user-added only (HR can never be a v1 default); ships as native seconds sub-hand' },
  { feature: 'Unread-messages chip', badge: 'PROVIDER', mech: 'SHORT_TEXT, unread-notifications provider (v1-legal default)' },
  { feature: 'Values shown in prototype', badge: 'SIMULATED', mech: 'Battery 68% · steps 6203 · 3 unread · HR 72 are mock values' },
]);

const VAKT_BATTERY = 'Registers update at minute-or-slower cadence except seconds elements (interactive-only, toggleable). AOD is a static 1-update-per-minute composition, ~7% lit pixels.';

/* =================================================================== */

export const category = {
  id: 'CAT-A',
  name: 'VAKT',
  series: 'Instrument Series',
  apk: 'watchfaces.vakt.instrument',
  tagline: 'The approved instrument family, now pure analog — skeleton depth, machined registers, applied lume indices. The digital screen is gone; the watch remains.',
  description: 'The v2 family restored per direction, with the right-hand LCD column deleted on every face and replaced by a recessed date window. Every face is constructed like hardware: a themeable metal flange carrying applied lume indices, skeleton bridgework one level down, and machine-turned recessed registers. The outer steel case in these renders is fixed presentation hardware — themes only ever retint dial artwork (flange, lume, accents), exactly as on a real watch.',
  referenceImage: 'assets/reference-assen.png',
  fonts: [
    { family: 'Archivo', weights: [500, 600, 700], role: 'Dial labels, register numerals' },
    { family: 'Saira SemiCondensed', weights: [600, 700], role: 'Date window, AOD digits' },
  ],
  faces: [

    /* ---------------- WF-A1 — the flagship ---------------- */
    {
      id: 'WF-A1', name: 'VAKT One', tagline: 'The instrument, undiluted.',
      concept: 'The flagship: three machined registers (0–250 scale top-right, battery left, steps bottom), skeleton bridges between them, applied faceted indices on a dark steel flange, broad-arrow hour hand with full lume slot — and a single recessed date window at 3 where the digital screen used to be.',
      audience: 'The buyer who wants tool-watch density with jewellery-grade finishing — analog only.',
      evolution: 'vs. approved v2: identical construction with the LCD column removed per direction; replaced by a framed date window at 3; unread chip retained above it.',
      wff: { version: 2, reason: 'GOAL_PROGRESS + WEIGHTED_ELEMENTS complication blocks are v2-only (v1 ends at RANGED_VALUE). Dialed ships via Watch Face Push = Wear OS 6, so v2 costs no coverage on that channel.' },
      fontStack: F_LBL,
      themes: [
        T('TH-A1-01', 'Phosphor Core', 'Charcoal skeleton, phosphor-green lume, steel-white ink — the genre-defining look.', { bg: '#131514', ink: '#eae8e2', accent: '#d3543e', muted: '#5f6259', lume: '#c9d8a4' }, 'brushRadial'),
        T('TH-A1-02', 'Arctic Panel', 'Light sandblasted dial, graphite ink, grey-green lume — the light option.', { bg: '#d4d4cd', ink: '#1a1b1d', accent: '#b0442e', muted: '#8b8b82', lume: '#b9c4a2' }, 'sandblast'),
        T('TH-A1-03', 'Amber Service', 'Warm black, amber lume, copper accents.', { bg: '#161210', ink: '#e9e0d5', accent: '#cd8a45', muted: '#6e6258', lume: '#e2b268' }, 'brushRadial'),
        T('TH-A1-04', 'Ice Watch', 'Blue-black, ice-blue lume.', { bg: '#101419', ink: '#e2e8ee', accent: '#4f9fc9', muted: '#59656f', lume: '#a5cde8' }, 'brushRadial'),
        T('TH-A1-05', 'NVG Ops', 'Blackout dial, night-vision green on every scale.', { bg: '#0e100e', ink: '#dfe5d5', accent: '#8fc44f', muted: '#525549', lume: '#bfe37e' }, 'matte'),
      ],
      lightThemeIndex: 1,
      layers: [
        { t: 'dial', color: 'bg' },
        ...flangeAndMarkers(),
        ...skeletonWork(),
        { t: 'label', text: 'VAKT', x: 140, y: 118, size: 16, weight: 700, color: 'ink' },
        { t: 'label', text: 'INSTRUMENT', x: 140, y: 134, size: 8.5, weight: 600, color: 'muted' },
        // ⭐ SETTLED VAKT INSTRUMENT DESIGN (owner 2026-07-20, applied fleet-wide 2026-07-22):
        // same artwork, GT ownership split — plate + tick sets + engraved numerals bake as
        // permanent hardware; only icon + needle (+ arc) carry the slot tag. All three chronos
        // are bare instrument slots (RANGED_VALUE GOAL_PROGRESS EMPTY); date → locked native.
        ...registerScaleGT(262, 148, 64, 'SLOT-A1-1'),
        ...registerBatteryGT(130, 234, 47, 'SLOT-A1-4'),
        ...registerStepsGT(206, 324, 55, 'SLOT-A1-5'),
        ...dateWindowNative(334, 246, 274),
        { t: 'rect', x: 318, y: 288, w: 32, h: 19, rx: 3, color: 'shade:bg:-0.45', stroke: 'shade:bg:0.15', sw: 1, slot: 'SLOT-A1-3' },
        { t: 'text', token: 'notif', x: 334, y: 298, size: 12.5, weight: 700, color: 'lume', font: F_DIG, slot: 'SLOT-A1-3' },
        { t: 'icon', name: 'msg', x: 360, y: 298, s: 9, color: 'muted', slot: 'SLOT-A1-3' },
        ...mainHands(),
      ],
      aodLayers: vaktAOD(),
      complications: [
        {
          id: 'SLOT-A1-1', label: 'Top register', shape: 'circle', cx: 262, cy: 148, r: 64, frame: 'plate', types: GAUGE_TYPES,
          bare: true,
          // ⚠ HEART_RATE only GUARANTEES SHORT_TEXT — an OEM that returns text/shortcut leaves
          // this dial blank until the wearer assigns a ranged pulse (wrist test; same as GT).
          defaultProvider: 'HEART_RATE', defaultProviderType: 'RANGED_VALUE',
          gauge: [30, 330],                            // the engraved 0–250 sweep
          arc: false,                                  // the design's registerScale has NO arc
          default: 'Empty — seconds sub-hand', options: 'Ranged/goal gauges only — the needle is the display', fallback: 'Seconds sub-hand', empty: 'Seconds sub-hand', tap: 'Provider chooser',
        },
        { id: 'SLOT-A1-3', label: 'Unread chip', shape: 'rect', x: 318, y: 288, w: 48, h: 19, frame: 'panel', types: ['SHORT_TEXT', 'MONOCHROMATIC_IMAGE', 'SMALL_IMAGE'], default: 'Unread notifications (v1-legal)', options: 'Short-text / icon providers', fallback: 'Icon only', empty: 'Chip hidden', tap: 'Notification stream' },
        {
          id: 'SLOT-A1-4', label: 'Battery register', shape: 'circle', cx: 130, cy: 234, r: 47, frame: 'plate', types: GAUGE_TYPES,
          bare: true,
          defaultProvider: 'WATCH_BATTERY', defaultProviderType: 'RANGED_VALUE',
          gauge: [40, 320],
          arc: { r: 42, w: 2.5, color: 'lume', track: 'muted', trackOpacity: 0.22, cap: 'butt' },
          default: 'Battery', options: 'Ranged/goal gauges only — rendered by the design\'s own needle + lume arc', fallback: 'Battery instrument', empty: 'Battery instrument', tap: 'Battery settings',
        },
        {
          id: 'SLOT-A1-5', label: 'Steps register', shape: 'circle', cx: 206, cy: 324, r: 55, frame: 'plate', types: GAUGE_TYPES,
          bare: true,
          gauge: [0, 360],                             // the design's step needle turns a full lap
          arc: false,                                  // One's steps register has no external arc
          defaultProvider: 'STEP_COUNT', defaultProviderType: 'RANGED_VALUE',
          default: 'Steps (native drawing)', options: 'Ranged/goal gauges only — full-turn needle', fallback: 'Native step progress', empty: 'Native step progress', tap: 'Fitness app',
        },
      ],
      settings: VAKT_SETTINGS('A1'),
      feasibility: VAKT_FEAS(),
      battery: VAKT_BATTERY,
      aodNote: 'Black canvas, fixed light ink #d8d4cc/#8f8877, thin batons + HH:MM + battery numeral. ~7% lit, minute updates.',
      acceptance: [
        'Flange annulus 225→202 with 12 applied faceted indices (8×17, majors ×1.25, lume slots) at r220',
        'Registers at (262,148) r64 / (130,234) r47 / (206,324) r55, each with raised metal rim and recessed machined floor',
        'NO digital time anywhere in the active state; date window 40×30 at (334,246) with day name beneath',
        'Hour hand broad-arrow len122 with baked lume slot and drop shadow; theme changes NEVER alter the outer hardware case',
      ],
    },

    /* ---------------- WF-A2 — the ceramic GT ---------------- */
    {
      id: 'WF-A2', name: 'VAKT GT', tagline: 'The chronograph goes grand touring.',
      concept: 'A racing-instrument evolution: the flange becomes a numbered 60-scale rally track, the steps register grows into a hero counter at 6 with an external progress arc, and red-line accents mark the top of every scale. Date sits framed at 3.',
      audience: 'Motorsport and racing-chronograph fans; the loudest seller of the family.',
      evolution: 'vs. approved v2: LCD removed per direction, date window at 3; rally flange, red-line arcs and hero counter unchanged.',
      wff: { version: 2, reason: 'GOAL_PROGRESS + WEIGHTED_ELEMENTS complication blocks are v2-only (v1 ends at RANGED_VALUE). Dialed ships via Watch Face Push = Wear OS 6, so v2 costs no coverage on that channel.' },
      fontStack: F_LBL,
      themes: [
        T('TH-A2-01', 'Pit Lane', 'Charcoal, signal-red line, white-lume markers.', { bg: '#141413', ink: '#ece9e2', accent: '#cf3e32', muted: '#5e5d57', lume: '#d8d6c8' }, 'brushRadial'),
        T('TH-A2-02', 'Chalk Circuit', 'Chalk dial, carbon ink, red line — the light option.', { bg: '#d8d6cf', ink: '#1a1b1c', accent: '#bd3a2c', muted: '#8e8d85', lume: '#c8c8ba' }, 'sandblast'),
        T('TH-A2-03', 'Gulf Racing', 'Blue-slate dial, orange line, ice lume.', { bg: '#12181e', ink: '#e4e9ed', accent: '#d97b2e', muted: '#566068', lume: '#a9cbe0' }, 'brushRadial'),
        T('TH-A2-04', 'Verde Legend', 'Racing green, gilt line, cream lume.', { bg: '#0f1611', ink: '#e7e4d5', accent: '#c8a44e', muted: '#556056', lume: '#d4c896' }, 'brushRadial'),
        T('TH-A2-05', 'Night Stage', 'Blackout, acid-yellow line and lume.', { bg: '#101010', ink: '#e9e8e0', accent: '#cfd23c', muted: '#585850', lume: '#e0e388' }, 'matte'),
      ],
      lightThemeIndex: 1,
      layers: [
        { t: 'dial', color: 'bg' },
        { t: 'flange', r0: 225, r1: 200, color: 'shade:bg:-0.32', floor: 'bg' },
        { t: 'ticks', r: 222, count: 60, len: 7, w: 1.3, color: 'muted' },
        { t: 'numerals', vals: [60, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55], r: 212, size: 13.5, weight: 700, color: 'ink' },
        // Rally-flange RED-LINE — restored VERBATIM from the original Collection-3 handoff design
        // (`…/Premium Smartwatch Face Collection-handoff/…/faces/cat-a2.js` line 223). Do not
        // "improve" this: it is a SHORT solid butt-capped zone marking sitting at the top of the
        // rally scale (a tachometer red-line), NOT a gauge. It is deliberately unlike Ti's flange
        // arc, which is a live battery instrument (track + fill + round caps + bolt, r212 w4.5
        // −58°→58°). Two different objects with two different jobs.
        { t: 'arc', r: 221, w: 3.5, from: -32, to: -3, color: 'accent', value: 1, cap: 'butt' },
        ...skeletonWork(),
        { t: 'label', text: 'VAKT', x: 140, y: 120, size: 16, weight: 700, color: 'ink' },
        { t: 'label', text: 'GT', x: 140, y: 136, size: 9, weight: 700, color: 'accent' },
        // ⛔ REGISTERS ARE VERBATIM FROM THE SOURCE OF TRUTH (handoff `faces/cat-a2.js`
        // lines 227–232). Do not substitute "instrument" variants here: the chrono design
        // must match the original exactly — same plates, both tick sets, numerals, icons and
        // needles. Complication behaviour is layered on AFTER the art matches, never by
        // redesigning the art.
        ...registerScaleGT(260, 150, 58, 'SLOT-A2-1'),
        ...registerBatteryGT(128, 230, 44, 'SLOT-A2-4'),
        ...registerStepsGT(210, 318, 64, 'SLOT-A2-2'),
        { t: 'arc', cx: 210, cy: 318, r: 71, w: 3.5, from: -150, to: 150, color: 'accent', data: 'steps', track: 'muted', trackOpacity: 0.22, cap: 'round', slot: 'SLOT-A2-2' },
        ...dateWindow(336, 240, 'SLOT-A2-3'),
        { t: 'text', token: 'day3', x: 336, y: 268, size: 12, weight: 700, color: 'muted', font: F_DIG, slot: 'SLOT-A2-3' },
        ...mainHands(),
      ],
      aodLayers: vaktAOD([
        { t: 'arc', r: 210, w: 3, from: -150, to: 150, color: 'muted', data: 'steps', cap: 'round' },
      ]),
      // ⛔ GEOMETRY IS VERBATIM from the source of truth — every plate, tick set, numeral, icon
      // and needle above is the original. What these entries add is only WHO OWNS each layer and
      // HOW an assigned provider is drawn inside the frame; none of it moves a design pixel, and
      // `node check.mjs` is the proof, not this comment.
      //
      // `gauge` = the sweep the register's own scale runs through, so a needle points at the
      //   number the plate is engraved with (top register 30→330, battery 40→320, hero full turn).
      //   Without it every needle fell back to a generic -150..150 and read 180° out on the top dial.
      // `arc`   = that register's own progress arc, verbatim from the design — or `false` where the
      //   design has none. `from`/`to` let the arc keep its own span when the needle turns further.
      complications: [
        {
          id: 'SLOT-A2-1', label: 'Top register', shape: 'circle', cx: 260, cy: 150, r: 58, frame: 'plate', types: GAUGE_TYPES,
          bare: true,                                  // needle + the provider's icon; scale and numerals are dial art
          // Owner 2026-07-20: the three dials are battery, steps and heart rate. This is the heart
          // one — which is what the engraved heart and the 0–250 scale always meant.
          // ⚠ HEART_RATE only GUARANTEES SHORT_TEXT; an OEM that returns text (or a health-app
          // shortcut) leaves this dial blank until the wearer assigns a ranged pulse themselves.
          // That is a wrist test, not something the validator can settle.
          defaultProvider: 'HEART_RATE', defaultProviderType: 'RANGED_VALUE',
          gauge: [30, 330],                            // the engraved 0–250 sweep, so the needle reads the numbers
          arc: false,                                  // the design's `registerScale` has NO arc
          default: 'Empty — seconds sub-hand', options: 'Any Wear OS type — rendered inside the register frame', fallback: 'Seconds sub-hand', empty: 'Seconds sub-hand', tap: 'Provider chooser',
        },
        {
          id: 'SLOT-A2-2', label: 'Hero counter', shape: 'circle', cx: 210, cy: 318, r: 64, frame: 'plate', types: GAUGE_TYPES,
          bare: true,                                  // needle + external arc + the provider's icon
          gauge: [0, 360],                             // the design's step needle turns a full lap
          arc: { r: 71, w: 3.5, from: -150, to: 150, color: 'accent', track: 'muted', trackOpacity: 0.22, cap: 'round' },
          defaultProvider: 'STEP_COUNT', defaultProviderType: 'RANGED_VALUE',
          default: 'Steps (native drawing)', options: 'Any Wear OS type — hero register frame + external arc', fallback: 'Native step progress', empty: 'Native step progress', tap: 'Fitness app',
        },
        { id: 'SLOT-A2-3', label: 'Date window', shape: 'rect', x: 316, y: 225, w: 40, h: 30, frame: 'panel', types: PANEL_TYPES, default: 'Date', options: 'Text / gauge / icon / image', fallback: 'Native tokens', empty: 'Hidden', tap: 'Calendar' },
        {
          // The third chrono, made assignable (owner, 2026-07-20 — "give me all three").
          // Its default is the REAL battery complication, not `EMPTY`: an EMPTY default renders
          // nothing at all on first install (audit L1, proven on-wrist), which would turn the one
          // register that always works today into a black hole. WATCH_BATTERY/RANGED_VALUE draws
          // the design's own instrument — same numerals, same lume arc, same needle — so the fresh
          // install is unchanged, and any other provider re-scales the engraved 0–100.
          id: 'SLOT-A2-4', label: 'Battery register', shape: 'circle', cx: 128, cy: 230, r: 44, frame: 'plate', types: GAUGE_TYPES,
          bare: true,
          defaultProvider: 'WATCH_BATTERY', defaultProviderType: 'RANGED_VALUE',
          gauge: [40, 320],
          arc: { r: 39, w: 2.5, color: 'lume', track: 'muted', trackOpacity: 0.22, cap: 'butt' },
          default: 'Battery', options: 'Any Wear OS type — rendered inside the register frame', fallback: 'Battery instrument', empty: 'Battery instrument', tap: 'Battery settings',
        },
      ],
      settings: VAKT_SETTINGS('A2'),
      feasibility: VAKT_FEAS(),
      battery: VAKT_BATTERY,
      aodNote: 'Family AOD plus a single muted steps arc — the hero counter survives ambient within budget.',
      acceptance: [
        'Rally flange: 60/5…55 numerals 13.5px at r212; red-line arc −32°→−3° at r221',
        'Hero steps register r64 at (210,318) with external arc r71 sweeping −150°→150°',
        'NO digital time; date window 40×30 at (336,240)',
      ],
    },

    /* ---------------- WF-A3 — the dress instrument ---------------- */
    {
      id: 'WF-A3', name: 'VAKT Meridian', tagline: 'The tool watch, tailored.',
      concept: 'The dressed member: skeleton work calms into one polished bridge, slim applied batons ride the flange, and the right side carries a framed date with a NEXT-event line beneath. Same instrument soul, cleaner shirt.',
      audience: 'Office-first wearers who still want the instrument density.',
      evolution: 'vs. approved v2: LCD removed per direction; its calendar/event duty moves to a date window + one event line at 3.',
      wff: { version: 2, reason: 'GOAL_PROGRESS + WEIGHTED_ELEMENTS complication blocks are v2-only (v1 ends at RANGED_VALUE). Dialed ships via Watch Face Push = Wear OS 6, so v2 costs no coverage on that channel.' },
      fontStack: F_LBL,
      themes: [
        T('TH-A3-01', 'Obsidian', 'Black lacquer, champagne accents, silver indices.', { bg: '#0f0f11', ink: '#eae7df', accent: '#b3a274', muted: '#5c5c58', lume: '#ddd2a8' }, 'lacquer'),
        T('TH-A3-02', 'Salon Ivory', 'Ivory lacquer, espresso ink, sage lume — the light option.', { bg: '#e0dbce', ink: '#241f19', accent: '#6a5a3a', muted: '#94897a', lume: '#c2c8a4' }, 'lacquer'),
        T('TH-A3-03', 'Slate Grand', 'Slate sunray, mint lume, cool ink.', { bg: '#161a1d', ink: '#e4e8ea', accent: '#8aa6a0', muted: '#5c6467', lume: '#b7d2c4' }, 'sunray'),
        T('TH-A3-04', 'Bordeaux', 'Oxblood lacquer, blush lume, rose accents.', { bg: '#170f11', ink: '#ece2dd', accent: '#b06a5c', muted: '#6a5a58', lume: '#dba892' }, 'lacquer'),
        T('TH-A3-05', 'Emerald Hour', 'Bottle green, gilt accents, champagne lume.', { bg: '#0d1510', ink: '#e7e5d8', accent: '#c2a35c', muted: '#57635a', lume: '#d8c88a' }, 'sunray'),
      ],
      lightThemeIndex: 1,
      layers: [
        { t: 'dial', color: 'bg' },
        { t: 'flange', r0: 225, r1: 204, color: 'shade:bg:-0.26', floor: 'bg' },
        { t: 'ticks', r: 222, count: 60, len: 6, w: 1.1, color: 'muted' },
        { t: 'applied', r: 220, count: 12, w: 6, len: 15, lume: false, majorScale: 1.3 },
        { t: 'bridge', r0: 156, r1: 194, a0: 130, a1: 232, color: 'shade:bg:-0.34' },
        { t: 'screw', cx: 112, cy: 300, r: 5, a: -30 },
        { t: 'label', text: 'VAKT', x: 142, y: 120, size: 15, weight: 700, color: 'ink' },
        { t: 'label', text: 'MERIDIAN', x: 142, y: 136, size: 8.5, weight: 600, color: 'accent' },
        // ⭐ Settled VAKT instrument design (see WF-A1 note): three bare chrono slots, date native.
        ...registerScaleGT(258, 150, 56, 'SLOT-A3-1'),
        ...registerBatteryGT(130, 232, 44, 'SLOT-A3-4'),
        ...registerStepsGT(204, 320, 50, 'SLOT-A3-5'),
        ...dateWindowNative(334, 238),
        { t: 'label', text: 'NEXT', x: 334, y: 266, size: 8, weight: 700, color: 'accent', slot: 'SLOT-A3-2' },
        { t: 'text', token: 'event', x: 334, y: 282, size: 14, weight: 600, color: 'ink', font: F_DIG, slot: 'SLOT-A3-2' },
        ...mainHands({ second: 'accent' }),
      ],
      aodLayers: vaktAOD(),
      complications: [
        {
          id: 'SLOT-A3-1', label: 'Top register', shape: 'circle', cx: 258, cy: 150, r: 56, frame: 'plate', types: GAUGE_TYPES,
          bare: true,
          defaultProvider: 'HEART_RATE', defaultProviderType: 'RANGED_VALUE',
          gauge: [30, 330],
          arc: false,
          default: 'Empty — seconds sub-hand', options: 'Ranged/goal gauges only — the needle is the display', fallback: 'Seconds sub-hand', empty: 'Seconds sub-hand', tap: 'Provider chooser',
        },
        // Event line KEPT as designed (owner). NEXT_EVENT is permission-gated (audit F8) but it
        // is a secondary slot on this face — the three chronos + native date carry first install.
        { id: 'SLOT-A3-2', label: 'Event line', shape: 'rect', x: 300, y: 258, w: 70, h: 32, frame: 'open', types: OPEN_TYPES, default: 'Next event (v1-legal)', options: 'Text / icon providers, laid out on the open dial', fallback: 'Line shows —', empty: 'Line hidden', tap: 'Agenda' },
        {
          id: 'SLOT-A3-4', label: 'Battery register', shape: 'circle', cx: 130, cy: 232, r: 44, frame: 'plate', types: GAUGE_TYPES,
          bare: true,
          defaultProvider: 'WATCH_BATTERY', defaultProviderType: 'RANGED_VALUE',
          gauge: [40, 320],
          arc: { r: 39, w: 2.5, color: 'lume', track: 'muted', trackOpacity: 0.22, cap: 'butt' },
          default: 'Battery', options: 'Ranged/goal gauges only — rendered by the design\'s own needle + lume arc', fallback: 'Battery instrument', empty: 'Battery instrument', tap: 'Battery settings',
        },
        {
          id: 'SLOT-A3-5', label: 'Steps register', shape: 'circle', cx: 204, cy: 320, r: 50, frame: 'plate', types: GAUGE_TYPES,
          bare: true,
          gauge: [0, 360],
          arc: false,
          defaultProvider: 'STEP_COUNT', defaultProviderType: 'RANGED_VALUE',
          default: 'Steps (native drawing)', options: 'Ranged/goal gauges only — full-turn needle', fallback: 'Native step progress', empty: 'Native step progress', tap: 'Fitness app',
        },
      ],
      settings: VAKT_SETTINGS('A3'),
      feasibility: [
        ...VAKT_FEAS(),
        { feature: 'NEXT event line', badge: 'PROVIDER', mech: 'SHORT_TEXT slot, next-event provider (v1-legal default)' },
      ],
      battery: VAKT_BATTERY,
      aodNote: 'Family AOD grammar; event line drops in ambient.',
      acceptance: [
        'Single polished bridge 130°→232°; exactly one screw remains',
        'Polished (non-lume) applied indices; NEXT label in accent above the event line at (334,282)',
        'Lacquer/sunray finishes only across the five themes; no digital time',
      ],
    },

    /* ---------------- WF-A4 — the clean titanium ---------------- */
    {
      id: 'WF-A4', name: 'VAKT Ti', tagline: 'The instrument, exhaled.',
      concept: 'The calm one: the battery register dissolves into a flange arc, leaving two registers and open brushed metal. A lone date window balances the right flank. Lowest visual pressure in the family, same construction depth.',
      audience: 'Buyers who want the identity without the density — the everyday pick.',
      evolution: 'vs. approved v2: LCD removed per direction; date window at 3 is now the only framed element.',
      wff: { version: 2, reason: 'GOAL_PROGRESS + WEIGHTED_ELEMENTS complication blocks are v2-only (v1 ends at RANGED_VALUE). Dialed ships via Watch Face Push = Wear OS 6, so v2 costs no coverage on that channel.' },
      fontStack: F_LBL,
      themes: [
        T('TH-A4-01', 'Ti Natural', 'Warm-grey brushed dial, ecru ink, pale lume.', { bg: '#191918', ink: '#e8e5dd', accent: '#a8a798', muted: '#63625c', lume: '#cfcdae' }, 'brushRadial'),
        T('TH-A4-02', 'Ti Chalk', 'Light brushed grey, graphite ink — the light option.', { bg: '#d6d3ca', ink: '#1c1d1e', accent: '#56544a', muted: '#918e83', lume: '#b4bd9c' }, 'brushRadial'),
        T('TH-A4-03', 'Ti Petrol', 'Deep petrol, seafoam accents.', { bg: '#101716', ink: '#e0e8e4', accent: '#6fae9d', muted: '#56645f', lume: '#a8d4c2' }, 'brushRadial'),
        T('TH-A4-04', 'Ti Graphite', 'Graphite monochrome, white lume.', { bg: '#141518', ink: '#e9e9ea', accent: '#9aa0ab', muted: '#5a5e66', lume: '#d6d9de' }, 'matte'),
        T('TH-A4-05', 'Ti Saffron', 'Graphite with one saffron thread.', { bg: '#151514', ink: '#eae7e0', accent: '#d09a3e', muted: '#63615b', lume: '#e2bc74' }, 'brushRadial'),
      ],
      lightThemeIndex: 1,
      layers: [
        { t: 'dial', color: 'bg' },
        ...flangeAndMarkers(),
        { t: 'arc', r: 212, w: 4.5, from: -58, to: 58, color: 'accent', data: 'battery', track: 'muted', trackOpacity: 0.22, cap: 'round' },
        { t: 'icon', name: 'bolt', x: 225, y: 52, s: 8, color: 'muted', filled: true },
        { t: 'bridge', r0: 152, r1: 192, a0: 210, a1: 330, color: 'shade:bg:-0.36' },
        { t: 'screw', cx: 100, cy: 225, r: 5.5, a: 45 },
        { t: 'label', text: 'VAKT', x: 136, y: 152, size: 16, weight: 700, color: 'ink' },
        { t: 'label', text: 'TITANIUM', x: 136, y: 168, size: 8.5, weight: 600, color: 'muted' },
        // ⭐ Settled VAKT instrument design (see WF-A1 note). Ti's battery is the FLANGE ARC
        // above (r212 −58°→58°, data:battery) — already a live native instrument, kept BAKED
        // per the register map ("Ti's battery is a flange ARC — adapt"): Ti has two chrono
        // dials (HR + steps); the arc stays the design's own dedicated battery gauge.
        ...registerScaleGT(254, 148, 62, 'SLOT-A4-1'),
        ...registerStepsGT(192, 318, 58, 'SLOT-A4-2'),
        ...dateWindowNative(338, 254, 282),
        ...mainHands(),
      ],
      aodLayers: vaktAOD(),
      complications: [
        {
          id: 'SLOT-A4-1', label: 'Top register', shape: 'circle', cx: 254, cy: 148, r: 62, frame: 'plate', types: GAUGE_TYPES,
          bare: true,
          defaultProvider: 'HEART_RATE', defaultProviderType: 'RANGED_VALUE',
          gauge: [30, 330],
          arc: false,
          default: 'Empty — seconds sub-hand', options: 'Ranged/goal gauges only — the needle is the display', fallback: 'Seconds sub-hand', empty: 'Seconds sub-hand', tap: 'Provider chooser',
        },
        {
          id: 'SLOT-A4-2', label: 'Steps register', shape: 'circle', cx: 192, cy: 318, r: 58, frame: 'plate', types: GAUGE_TYPES,
          bare: true,
          gauge: [0, 360],
          arc: false,
          defaultProvider: 'STEP_COUNT', defaultProviderType: 'RANGED_VALUE',
          default: 'Steps (native drawing)', options: 'Ranged/goal gauges only — full-turn needle', fallback: 'Native step progress', empty: 'Native step progress', tap: 'Fitness app',
        },
      ],
      settings: VAKT_SETTINGS('A4'),
      feasibility: VAKT_FEAS(),
      battery: VAKT_BATTERY,
      aodNote: 'Family AOD; battery numeral retained.',
      acceptance: [
        'Battery renders ONLY as flange arc −58°→58° at r212 w4.5 round-cap — no left register',
        'Exactly two circular registers; brushed radial dial texture visible on left flank',
        'Date window 40×30 at (338,254) with day name beneath; no digital time',
      ],
    },

    /* ---------------- WF-A5 — the night instrument ---------------- */
    {
      id: 'WF-A5', name: 'VAKT Night Watch', tagline: 'Built for the blackout.',
      concept: 'The maximal-lume expression: full-lume applied indices, lume register needles, sunrise/sunset figures on the right flank, and central seconds shipped OFF for battery. Reads instantly in total darkness — by lume alone now, with no glowing screen.',
      audience: 'Night-shift workers, aviation/tactical fans, lume collectors.',
      evolution: 'vs. approved v2: LCD removed per direction — its sunrise/sunset rows become dial-side figures; the AOD keeps the stacked digital time (ambient mode only).',
      wff: { version: 2, reason: 'GOAL_PROGRESS + WEIGHTED_ELEMENTS complication blocks are v2-only (v1 ends at RANGED_VALUE). Dialed ships via Watch Face Push = Wear OS 6, so v2 costs no coverage on that channel.' },
      fontStack: F_LBL,
      themes: [
        T('TH-A5-01', 'Phosphor Night', 'Blackout, full green-phosphor lume.', { bg: '#0d0e0d', ink: '#e0e4d6', accent: '#9fc44f', muted: '#525549', lume: '#c6e37e' }, 'matte'),
        T('TH-A5-02', 'Day Watch', 'Bone-white dial, ink numerals — the light counterpart.', { bg: '#d6d3c9', ink: '#17181a', accent: '#47542f', muted: '#8c897d', lume: '#aebd85' }, 'sandblast'),
        T('TH-A5-03', 'Blue Vault', 'Midnight, blue-white tritium-style lume.', { bg: '#0c1015', ink: '#e1e7ee', accent: '#6fa8cf', muted: '#4f5a64', lume: '#bcd9ee' }, 'matte'),
        T('TH-A5-04', 'Amber Watch', 'Blackout, aviation-amber lume.', { bg: '#110f0c', ink: '#ece3d4', accent: '#cf9a3f', muted: '#655d4e', lume: '#ecc274' }, 'matte'),
        T('TH-A5-05', 'Ghost Grey', 'Grey-on-grey stealth, white lume.', { bg: '#151617', ink: '#e8e9eb', accent: '#8e939c', muted: '#575b62', lume: '#dfe2e7' }, 'brushRadial'),
      ],
      lightThemeIndex: 1,
      layers: [
        { t: 'dial', color: 'bg' },
        { t: 'flange', r0: 225, r1: 202, color: 'shade:bg:-0.3', floor: 'bg' },
        { t: 'ticks', r: 222, count: 60, len: 7, w: 1.5, color: 'lume', opacity: 0.6 },
        { t: 'applied', r: 220, count: 12, w: 9, len: 18, lume: true, majorScale: 1.25 },
        ...skeletonWork(),
        { t: 'label', text: 'VAKT', x: 138, y: 118, size: 16, weight: 700, color: 'ink' },
        { t: 'label', text: 'NIGHT WATCH', x: 138, y: 134, size: 8.5, weight: 700, color: 'lume' },
        // ⭐ Settled VAKT instrument design (see WF-A1 note): three bare chrono slots, date native.
        ...registerScaleGT(256, 148, 56, 'SLOT-A5-1'),
        ...registerBatteryGT(128, 234, 44, 'SLOT-A5-5'),
        ...registerStepsGT(200, 324, 48, 'SLOT-A5-6'),
        { t: 'icon', name: 'sun', x: 312, y: 226, s: 8, color: 'muted', slot: 'SLOT-A5-2' },
        { t: 'text', token: 'sunrise', x: 348, y: 226, size: 13, weight: 700, color: 'ink', font: F_DIG, slot: 'SLOT-A5-2' },
        { t: 'icon', name: 'moon', x: 312, y: 248, s: 8, color: 'lume', filled: true, slot: 'SLOT-A5-3' },
        { t: 'text', token: 'sunset', x: 348, y: 248, size: 13, weight: 700, color: 'ink', font: F_DIG, slot: 'SLOT-A5-3' },
        ...dateWindowNative(332, 284),
        ...mainHands({ second: 'lume' }),
      ],
      aodLayers: [
        { t: 'ticks', r: 220, count: 12, len: 12, w: 2.5, color: 'muted' },
        { t: 'hand', kind: 'hour', len: 112, tail: 16, w: 4, shape: 'baton', color: 'ink' },
        { t: 'hand', kind: 'minute', len: 172, tail: 20, w: 3, shape: 'baton', color: 'ink' },
        { t: 'circle', r: 5, cx: 225, cy: 225, color: 'ink' },
        { t: 'text', token: 'hh', x: 225, y: 300, size: 40, weight: 600, color: 'ink', font: F_DIG },
        { t: 'text', token: 'mm', x: 225, y: 338, size: 40, weight: 600, color: 'muted', font: F_DIG },
      ],
      complications: [
        {
          id: 'SLOT-A5-1', label: 'Top register', shape: 'circle', cx: 256, cy: 148, r: 56, frame: 'plate', types: GAUGE_TYPES,
          bare: true,
          defaultProvider: 'HEART_RATE', defaultProviderType: 'RANGED_VALUE',
          gauge: [30, 330],
          arc: false,
          default: 'Empty — seconds sub-hand', options: 'Ranged/goal gauges only — the needle is the display', fallback: 'Seconds sub-hand', empty: 'Seconds sub-hand', tap: 'Provider chooser',
        },
        { id: 'SLOT-A5-2', label: 'Sunrise figure', shape: 'rect', x: 304, y: 214, w: 66, h: 22, frame: 'open', types: OPEN_TYPES, default: 'Sunrise (v1-legal)', options: 'Text / icon providers', fallback: '—', empty: 'Hidden', tap: 'Provider app' },
        // F9 duplicate-provider fix (plan W1.1): SUNRISE_SUNSET only ever reports the NEXT sun
        // event, so two windows on the same provider always show the same value. The sunset
        // figure defaults to WORLD_CLOCK instead; the wearer can still assign any provider.
        { id: 'SLOT-A5-3', label: 'Sunset figure', shape: 'rect', x: 304, y: 236, w: 66, h: 22, frame: 'open', types: OPEN_TYPES, defaultProvider: 'WORLD_CLOCK', default: 'World clock (was duplicate sunset — F9)', options: 'Text / icon providers', fallback: '—', empty: 'Hidden', tap: 'Provider app' },
        {
          id: 'SLOT-A5-5', label: 'Battery register', shape: 'circle', cx: 128, cy: 234, r: 44, frame: 'plate', types: GAUGE_TYPES,
          bare: true,
          defaultProvider: 'WATCH_BATTERY', defaultProviderType: 'RANGED_VALUE',
          gauge: [40, 320],
          arc: { r: 39, w: 2.5, color: 'lume', track: 'muted', trackOpacity: 0.22, cap: 'butt' },
          default: 'Battery', options: 'Ranged/goal gauges only — rendered by the design\'s own needle + lume arc', fallback: 'Battery instrument', empty: 'Battery instrument', tap: 'Battery settings',
        },
        {
          id: 'SLOT-A5-6', label: 'Steps register', shape: 'circle', cx: 200, cy: 324, r: 48, frame: 'plate', types: GAUGE_TYPES,
          bare: true,
          gauge: [0, 360],
          arc: false,
          defaultProvider: 'STEP_COUNT', defaultProviderType: 'RANGED_VALUE',
          default: 'Steps (native drawing)', options: 'Ranged/goal gauges only — full-turn needle', fallback: 'Native step progress', empty: 'Native step progress', tap: 'Fitness app',
        },
      ],
      settings: VAKT_SETTINGS('A5').map((s) => s.id.includes('SECONDS') ? Object.assign({}, s, { default: 'off' }) : s),
      feasibility: [
        ...VAKT_FEAS(),
        { feature: 'Sunrise / sunset figures', badge: 'PROVIDER', mech: 'Sunrise/sunset complication provider (v1-legal default)' },
      ],
      battery: VAKT_BATTERY + ' Central seconds ships OFF by default on this face.',
      aodNote: 'Night-first AOD: stacked 40px HH/MM digits beside batons, ~9% lit — verified against the 15% gate.',
      acceptance: [
        'Sunrise/sunset figures at (348,226)/(348,248) with sun/moon icons at x312',
        'Central seconds defaults OFF; applied indices 9×18 all carry lume slots',
        'No digital time in the ACTIVE state; AOD keeps stacked HH/MM digits (ambient only)',
      ],
    },
  ],
};
