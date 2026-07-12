/* CAT-A — VAKT INSTRUMENT SERIES (v2.1 — restored per direction, LCD column removed)
   The approved v2 family (flange + applied markers + skeleton bridges +
   machined registers), now PURE ANALOG: the right-hand digital LCD screen
   is deleted on every face and replaced with a framed date window.
   Design space: 450×450, center (225,225). All layers map to WFF v1
   mechanisms — depth/bevels/textures ship as pre-rendered static images,
   hands ship as artwork with baked shadows and lume. */

const F_LBL = "'Archivo', sans-serif";
const F_DIG = "'Saira SemiCondensed', sans-serif";

function T(id, name, desc, roles, finish) {
  return { id, name, desc, roles, finish };
}

/* ---------- construction helpers ---------- */

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

function registerScale(cx, cy, r) {
  return [
    { t: 'plate', cx, cy, r, rim: 3.5 },
    { t: 'ticks', cx, cy, r: r - 6, count: 25, len: 5, w: 1.1, color: 'muted', from: 30, to: 330 },
    { t: 'ticks', cx, cy, r: r - 6, count: 5, len: 10, w: 2, color: 'ink', from: 30, to: 330 },
    { t: 'numerals', cx, cy, vals: [0, 50, 100, 150, 200, 250], r: r - 21, size: 12.5, weight: 700, color: 'ink', from: 30, to: 330 },
    { t: 'icon', name: 'hr', x: cx, y: cy + r * 0.5, s: 8, color: 'muted' },
    { t: 'hand', kind: 'second', cx, cy, len: r - 10, tail: 13, w: 1.8, shape: 'needle', color: 'accent', hub: 4, shadow: true },
  ];
}

function registerBattery(cx, cy, r) {
  return [
    { t: 'plate', cx, cy, r, rim: 3 },
    { t: 'ticks', cx, cy, r: r - 5, count: 20, len: 4, w: 1, color: 'muted', from: 40, to: 320 },
    { t: 'numerals', cx, cy, vals: [0, 25, 50, 75, 100], r: r - 16, size: 10.5, weight: 700, color: 'ink', from: 40, to: 320 },
    { t: 'arc', cx, cy, r: r - 5, w: 2.5, from: 40, to: 320, color: 'lume', data: 'battery', track: 'muted', trackOpacity: 0.22 },
    { t: 'icon', name: 'bolt', x: cx, y: cy + r * 0.48, s: 8.5, color: 'muted', filled: true },
    { t: 'hand', kind: 'data', data: 'battery', from: 40, to: 320, cx, cy, len: r - 10, tail: 10, w: 1.6, shape: 'needle', color: 'lume', hub: 3.4, shadow: true },
  ];
}

function registerSteps(cx, cy, r) {
  return [
    { t: 'plate', cx, cy, r, rim: 3.5 },
    { t: 'ticks', cx, cy, r: r - 5, count: 50, len: 4, w: 0.9, color: 'muted' },
    { t: 'ticks', cx, cy, r: r - 5, count: 10, len: 9, w: 1.9, color: 'ink' },
    { t: 'numerals', cx, cy, vals: [0, null, 2, null, 4, null, 6, null, 8, null], r: r - 17, size: 12.5, weight: 700, color: 'ink' },
    { t: 'icon', name: 'steps', x: cx, y: cy - r * 0.45, s: 8.5, color: 'muted', filled: true },
    { t: 'hand', kind: 'data', data: 'stepsDial', cx, cy, len: r - 9, tail: 11, w: 1.6, shape: 'needle', color: 'lume', hub: 3.4, shadow: true },
  ];
}

/* framed date window — replaces the deleted LCD column */
function dateWindow(x, y) {
  return [
    { t: 'rect', x: x - 20, y: y - 15, w: 40, h: 30, rx: 4, color: 'shade:bg:-0.5', stroke: 'shade:bg:0.18', sw: 1.2 },
    { t: 'text', token: 'dnum', x, y: y + 1, size: 19, weight: 700, color: 'lume', font: F_DIG },
  ];
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
      wff: { version: 1, reason: 'No v2+ features required.' },
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
        ...registerScale(262, 148, 64),
        ...registerBattery(130, 234, 47),
        ...registerSteps(206, 324, 55),
        ...dateWindow(334, 246),
        { t: 'text', token: 'day3', x: 334, y: 274, size: 12, weight: 700, color: 'muted', font: F_DIG },
        { t: 'rect', x: 318, y: 288, w: 32, h: 19, rx: 3, color: 'shade:bg:-0.45', stroke: 'shade:bg:0.15', sw: 1 },
        { t: 'text', token: 'notif', x: 334, y: 298, size: 12.5, weight: 700, color: 'lume', font: F_DIG },
        { t: 'icon', name: 'msg', x: 360, y: 298, s: 9, color: 'muted' },
        ...mainHands(),
      ],
      aodLayers: vaktAOD(),
      complications: [
        { id: 'SLOT-A1-1', label: 'Top register (0–250 scale)', shape: 'circle', cx: 262, cy: 148, r: 64, types: ['RANGED_VALUE'], default: 'Empty — native running-seconds sub-hand', options: 'Heart rate (user-added), steps, battery', fallback: 'Seconds sub-hand', empty: 'Seconds sub-hand', tap: 'Provider chooser' },
        { id: 'SLOT-A1-2', label: 'Date window', shape: 'rect', x: 314, y: 231, w: 40, h: 30, types: ['SHORT_TEXT'], default: 'Date (native token)', options: 'Day+date, next event', fallback: 'Native date token', empty: 'Hidden via SET-A1-DATE', tap: 'Calendar' },
        { id: 'SLOT-A1-3', label: 'Unread chip', shape: 'rect', x: 318, y: 288, w: 48, h: 19, types: ['SHORT_TEXT'], default: 'Unread notifications (v1-legal)', options: 'Any short-text provider', fallback: 'Icon only', empty: 'Chip hidden', tap: 'Notification stream' },
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
      wff: { version: 1, reason: 'No v2+ features required.' },
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
        { t: 'arc', r: 221, w: 3.5, from: -32, to: -3, color: 'accent', value: 1, cap: 'butt' },
        ...skeletonWork(),
        { t: 'label', text: 'VAKT', x: 140, y: 120, size: 16, weight: 700, color: 'ink' },
        { t: 'label', text: 'GT', x: 140, y: 136, size: 9, weight: 700, color: 'accent' },
        ...registerScale(260, 150, 58),
        ...registerBattery(128, 230, 44),
        ...registerSteps(210, 318, 64),
        { t: 'arc', cx: 210, cy: 318, r: 71, w: 3.5, from: -150, to: 150, color: 'accent', data: 'steps', track: 'muted', trackOpacity: 0.22, cap: 'round' },
        ...dateWindow(336, 240),
        { t: 'text', token: 'day3', x: 336, y: 268, size: 12, weight: 700, color: 'muted', font: F_DIG },
        ...mainHands(),
      ],
      aodLayers: vaktAOD([
        { t: 'arc', r: 210, w: 3, from: -150, to: 150, color: 'muted', data: 'steps', cap: 'round' },
      ]),
      complications: [
        { id: 'SLOT-A2-1', label: 'Top register (0–250)', shape: 'circle', cx: 260, cy: 150, r: 58, types: ['RANGED_VALUE'], default: 'Empty — seconds sub-hand', options: 'HR (user-added), battery', fallback: 'Seconds sub-hand', empty: 'Seconds sub-hand', tap: 'Provider chooser' },
        { id: 'SLOT-A2-2', label: 'Hero counter override', shape: 'circle', cx: 210, cy: 318, r: 64, types: ['RANGED_VALUE'], default: 'Steps (native drawing)', options: 'Any ranged provider', fallback: 'Native step progress', empty: 'Native step progress', tap: 'Fitness app' },
        { id: 'SLOT-A2-3', label: 'Date window', shape: 'rect', x: 316, y: 225, w: 40, h: 30, types: ['SHORT_TEXT'], default: 'Date', options: 'Day+date, next event', fallback: 'Native tokens', empty: 'Hidden', tap: 'Calendar' },
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
      wff: { version: 1, reason: 'No v2+ features required.' },
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
        ...registerScale(258, 150, 56),
        ...registerBattery(130, 232, 44),
        ...registerSteps(204, 320, 50),
        ...dateWindow(334, 238),
        { t: 'label', text: 'NEXT', x: 334, y: 266, size: 8, weight: 700, color: 'accent' },
        { t: 'text', token: 'event', x: 334, y: 282, size: 14, weight: 600, color: 'ink', font: F_DIG },
        ...mainHands({ second: 'accent' }),
      ],
      aodLayers: vaktAOD(),
      complications: [
        { id: 'SLOT-A3-1', label: 'Top register (0–250)', shape: 'circle', cx: 258, cy: 150, r: 56, types: ['RANGED_VALUE'], default: 'Empty — seconds sub-hand', options: 'HR (user-added), steps, battery', fallback: 'Seconds sub-hand', empty: 'Seconds sub-hand', tap: 'Provider chooser' },
        { id: 'SLOT-A3-2', label: 'Event line', shape: 'rect', x: 300, y: 258, w: 70, h: 32, types: ['SHORT_TEXT'], default: 'Next event (v1-legal)', options: 'World clock, alarm', fallback: 'Line shows —', empty: 'Line hidden', tap: 'Agenda' },
        { id: 'SLOT-A3-3', label: 'Date window', shape: 'rect', x: 314, y: 223, w: 40, h: 30, types: ['SHORT_TEXT'], default: 'Date', options: 'Day+date', fallback: 'Native tokens', empty: 'Hidden', tap: 'Calendar' },
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
      wff: { version: 1, reason: 'No v2+ features required.' },
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
        ...registerScale(254, 148, 62),
        ...registerSteps(192, 318, 58),
        ...dateWindow(338, 254),
        { t: 'text', token: 'day3', x: 338, y: 282, size: 12, weight: 700, color: 'muted', font: F_DIG },
        ...mainHands(),
      ],
      aodLayers: vaktAOD(),
      complications: [
        { id: 'SLOT-A4-1', label: 'Top register (0–250)', shape: 'circle', cx: 254, cy: 148, r: 62, types: ['RANGED_VALUE'], default: 'Empty — seconds sub-hand', options: 'HR (user-added), steps, battery', fallback: 'Seconds sub-hand', empty: 'Seconds sub-hand', tap: 'Provider chooser' },
        { id: 'SLOT-A4-2', label: 'Steps register', shape: 'circle', cx: 192, cy: 318, r: 58, types: ['RANGED_VALUE'], default: 'Steps (native)', options: 'Any ranged provider', fallback: 'Native step progress', empty: 'Native step progress', tap: 'Fitness app' },
        { id: 'SLOT-A4-3', label: 'Date window', shape: 'rect', x: 318, y: 239, w: 40, h: 30, types: ['SHORT_TEXT'], default: 'Day + date', options: 'Next event, world clock', fallback: 'Native date tokens', empty: 'Hidden', tap: 'Calendar' },
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
      wff: { version: 1, reason: 'No v2+ features required.' },
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
        ...registerScale(256, 148, 56),
        ...registerBattery(128, 234, 44),
        ...registerSteps(200, 324, 48),
        { t: 'icon', name: 'sun', x: 312, y: 226, s: 8, color: 'muted' },
        { t: 'text', token: 'sunrise', x: 348, y: 226, size: 13, weight: 700, color: 'ink', font: F_DIG },
        { t: 'icon', name: 'moon', x: 312, y: 248, s: 8, color: 'lume', filled: true },
        { t: 'text', token: 'sunset', x: 348, y: 248, size: 13, weight: 700, color: 'ink', font: F_DIG },
        ...dateWindow(332, 284),
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
        { id: 'SLOT-A5-1', label: 'Top register (0–250)', shape: 'circle', cx: 256, cy: 148, r: 56, types: ['RANGED_VALUE'], default: 'Empty — seconds sub-hand', options: 'HR (user-added), battery', fallback: 'Seconds sub-hand', empty: 'Seconds sub-hand', tap: 'Provider chooser' },
        { id: 'SLOT-A5-2', label: 'Sunrise figure', shape: 'rect', x: 304, y: 214, w: 66, h: 22, types: ['SHORT_TEXT'], default: 'Sunrise (v1-legal)', options: 'World clock, alarm', fallback: '—', empty: 'Hidden', tap: 'Provider app' },
        { id: 'SLOT-A5-3', label: 'Sunset figure', shape: 'rect', x: 304, y: 236, w: 66, h: 22, types: ['SHORT_TEXT'], default: 'Sunset (v1-legal)', options: 'World clock, alarm', fallback: '—', empty: 'Hidden', tap: 'Provider app' },
        { id: 'SLOT-A5-4', label: 'Date window', shape: 'rect', x: 312, y: 269, w: 40, h: 30, types: ['SHORT_TEXT'], default: 'Day + date', options: 'Calendar', fallback: 'Native tokens', empty: 'Hidden', tap: 'Calendar' },
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
