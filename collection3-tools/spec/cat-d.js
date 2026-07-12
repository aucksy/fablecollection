/* CAT-D — HALO TYPE SERIES
   Digital-first typographic instruments. Big numerals, editorial discipline,
   depth from paper-like layering — never a phone UI in a circle.
   Design space: 450×450, center (225,225). All layers map to WFF v1 mechanisms. */

const F_D = "'Space Grotesk', sans-serif";           // static weights 500/700
const F_DB = "'Big Shoulders Display', sans-serif";  // static weights 600/800 — giant condensed digits

function T(id, name, desc, roles, finish, caseFinish) {
  return { id, name, desc, roles, finish, caseFinish };
}

const HALO_SETTINGS = (fid) => ([
  { id: `SET-${fid}-THEME`, type: 'colorTheme', label: 'Colour theme', options: '5 swatch options (≤5 roles each)', default: 'Theme 01' },
  { id: `SET-${fid}-SECRING`, type: 'toggle', label: 'Seconds arc', options: 'on / off', default: 'on' },
  { id: `SET-${fid}-GAUGES`, type: 'toggle', label: 'Data gauges (steps / battery)', options: 'on / off', default: 'on' },
  { id: `SET-${fid}-DARK`, type: 'toggle', label: 'Pure-black dark mode (universal light ink — strategy 5.2a)', options: 'on / off', default: 'off' },
]);

const HALO_FEAS = () => ([
  { feature: 'Stacked / split digital time', badge: 'NATIVE', mech: 'Separate hour and minute text elements, tabular static fonts — deterministic for every digit pair' },
  { feature: 'Seconds progress arc', badge: 'NATIVE', mech: 'Arc fill driven by seconds; interactive-only, toggle-gated' },
  { feature: 'Steps / battery hairline gauges', badge: 'NATIVE', mech: 'Data-driven arc fills' },
  { feature: 'Date / day rows', badge: 'NATIVE', mech: 'Native date tokens' },
  { feature: 'Event / notification rows', badge: 'PROVIDER', mech: 'SHORT_TEXT slots, v1-legal defaults' },
  { feature: 'Values shown in prototype', badge: 'SIMULATED', mech: 'Mock steps/battery/event values' },
  { feature: 'Digit change animation', badge: 'CUSTOM', mech: 'IMPOSSIBLE — digits substitute instantly in WFF; composition is designed to look right in every static state' },
]);

const HALO_BATTERY = 'Time and rows update at minute cadence. Seconds arc is interactive-only and toggleable. AOD swaps heavy digit weights for the thin file at reduced size, ~6% lit.';

function haloAOD() {
  return [
    { t: 'text', token: 'hh', x: 225, y: 180, size: 88, weight: 400, color: 'ink', font: F_DB },
    { t: 'text', token: 'mm', x: 225, y: 268, size: 88, weight: 400, color: 'muted', font: F_DB },
    { t: 'text', token: 'day3', x: 225, y: 330, size: 16, weight: 500, color: 'muted', font: F_D },
    { t: 'text', token: 'dnum', x: 225, y: 352, size: 16, weight: 500, color: 'muted', font: F_D },
  ];
}

export const category = {
  id: 'CAT-D',
  name: 'HALO',
  series: 'Type Series',
  apk: 'watchfaces.halo.type',
  tagline: 'The time, set like a headline — five typographic instruments for people who read their wrist.',
  description: 'A digital-first counterpoint to the analog categories. Every face is an editorial composition: giant tabular numerals, hairline rules, engraved-paper layering, and data expressed as typography or thin arcs — never widgets. Designed around WFF’s honest strengths: stacked text elements, instant digit substitution, and data-driven arcs.',
  fonts: [
    { family: 'Big Shoulders Display', weights: [400, 600, 800], role: 'Display digits (400 reserved for AOD thin state)' },
    { family: 'Space Grotesk', weights: [500, 700], role: 'Labels, rows, small data' },
  ],
  faces: [

    {
      id: 'WF-D1', name: 'Halo Stack', tagline: 'Hours over minutes, like a masthead.',
      concept: 'The flagship: hour stacked over minute in 130px condensed digits, set slightly off-axis left; a right-hand hairline column carries AM/PM, date, steps and battery as a typographic ledger. A seconds arc traces the dial edge.',
      audience: 'Type lovers; the strongest broad-market digital seller.',
      wff: { version: 1, reason: 'No v2+ features required.' },
      fontStack: F_D,
      caseFinish: 'black',
      themes: [
        T('TH-D1-01', 'Newsprint', 'Warm paper ground, ink digits — light flagship.', { bg: '#ddd8cc', ink: '#191817', accent: '#b8452c', muted: '#938e80', lume: '#c2bcab' }, 'matte', 'black'),
        T('TH-D1-02', 'Night Edition', 'Soot ground, bone digits, vermilion folio.', { bg: '#121213', ink: '#eae6dc', accent: '#c65438', muted: '#5c5a54', lume: '#94918a' }, 'matte', 'black'),
        T('TH-D1-03', 'Klein', 'Ultramarine ground, chalk digits.', { bg: '#101a33', ink: '#e8e9e4', accent: '#d8b93e', muted: '#4d5a7a', lume: '#9aa5c0' }, 'matte', 'steel'),
        T('TH-D1-04', 'Acid Proof', 'Black ground, acid-green folio details.', { bg: '#101110', ink: '#e6e8e2', accent: '#a9d23c', muted: '#565851', lume: '#cbe38a' }, 'matte', 'black'),
        T('TH-D1-05', 'Terracotta', 'Fired-clay ground, cream digits.', { bg: '#2e1a10', ink: '#eee2d2', accent: '#d07434', muted: '#7a6250', lume: '#d3ab84' }, 'matte', 'gold'),
      ],
      lightThemeIndex: 0,
      layers: [
        { t: 'dial', color: 'bg' },
        { t: 'arc', r: 216, w: 2.5, from: 0, to: 360, color: 'accent', data: 'seconds', track: 'muted', trackOpacity: 0.18, cap: 'round' },
        { t: 'text', token: 'hh', x: 178, y: 168, size: 132, weight: 800, color: 'ink', font: F_DB },
        { t: 'text', token: 'mm', x: 178, y: 292, size: 132, weight: 800, color: 'ink', font: F_DB },
        { t: 'line', x1: 268, y1: 118, x2: 268, y2: 336, color: 'muted', w: 1, opacity: 0.7 },
        { t: 'text', token: 'ampmOnly', x: 288, y: 130, size: 17, weight: 700, color: 'accent', anchor: 'start' },
        { t: 'text', token: 'day3', x: 288, y: 172, size: 16, weight: 500, color: 'muted', anchor: 'start' },
        { t: 'text', token: 'dnum', x: 288, y: 194, size: 22, weight: 700, color: 'ink', anchor: 'start' },
        { t: 'text', token: 'mon3', x: 288, y: 216, size: 16, weight: 500, color: 'muted', anchor: 'start' },
        { t: 'icon', name: 'steps', x: 294, y: 254, s: 9, color: 'muted', filled: true },
        { t: 'text', token: 'steps', x: 308, y: 254, size: 16, weight: 700, color: 'ink', anchor: 'start' },
        { t: 'icon', name: 'bolt', x: 294, y: 284, s: 9, color: 'muted', filled: true },
        { t: 'text', token: 'batt', x: 308, y: 284, size: 16, weight: 700, color: 'ink', anchor: 'start' },
        { t: 'text', token: 'event', x: 288, y: 322, size: 14, weight: 500, color: 'accent', anchor: 'start' },
        { t: 'label', text: 'HALO', x: 178, y: 356, size: 12, weight: 700, color: 'muted' },
      ],
      aodLayers: haloAOD(),
      complications: [
        { id: 'SLOT-D1-1', label: 'Ledger row · steps', shape: 'rect', x: 284, y: 240, w: 90, h: 26, types: ['SHORT_TEXT', 'RANGED_VALUE'], default: 'Steps (v1-legal)', options: 'Any short-text', fallback: 'Icon + —', empty: 'Row hidden', tap: 'Fitness app' },
        { id: 'SLOT-D1-2', label: 'Ledger row · battery', shape: 'rect', x: 284, y: 270, w: 90, h: 26, types: ['SHORT_TEXT', 'RANGED_VALUE'], default: 'Watch battery (v1-legal)', options: 'Any short-text', fallback: 'Icon + —', empty: 'Row hidden', tap: 'Battery panel' },
        { id: 'SLOT-D1-3', label: 'Folio line · event', shape: 'rect', x: 284, y: 310, w: 90, h: 24, types: ['SHORT_TEXT'], default: 'Next event (v1-legal)', options: 'World clock, alarm', fallback: '—', empty: 'Hidden', tap: 'Agenda' },
      ],
      settings: HALO_SETTINGS('D1'),
      feasibility: HALO_FEAS(),
      battery: HALO_BATTERY,
      aodNote: 'Digits collapse from 800-weight 132px to 400-weight 88px (separate thin font file). ~6% lit.',
      acceptance: [
        'Digit stack centered at x178, sizes 132px weight 800, baselines y168/y292',
        'Hairline column rule at x268 from y118 to y336',
        'Seconds arc full-circle r216 w2.5 round-cap, gated by SET-D1-SECRING',
        'Every digit pair 00–59 keeps column alignment (tabular font verification)',
      ],
    },

    {
      id: 'WF-D2', name: 'Halo Beacon', tagline: 'One line of time.',
      concept: 'Radical reduction: h:mm set as a single enormous line across the center, a thin seconds arc at the rim, one whisper of date beneath. The dial is a lighthouse — nothing else competes.',
      audience: 'Minimalists; second-watch buyers who want instant glanceability.',
      wff: { version: 1, reason: 'No v2+ features required.' },
      fontStack: F_D,
      caseFinish: 'steel',
      themes: [
        T('TH-D2-01', 'Signal White', 'Chalk ground, near-black digits — light flagship.', { bg: '#e0dcd2', ink: '#161617', accent: '#bc4a2e', muted: '#98938a', lume: '#c4c0b4' }, 'matte', 'steel'),
        T('TH-D2-02', 'Blackout', 'True black, bone digits.', { bg: '#0e0e0f', ink: '#ebe8df', accent: '#c8ae5a', muted: '#55534d', lume: '#96938a' }, 'matte', 'black'),
        T('TH-D2-03', 'Deep Teal', 'Petrol ground, ice digits.', { bg: '#0c1a1c', ink: '#e4ecec', accent: '#6cc0b2', muted: '#4d6365', lume: '#a5cdc8' }, 'matte', 'titanium'),
        T('TH-D2-04', 'Cherry Ink', 'Oxblood ground, blush digits.', { bg: '#1e0e10', ink: '#f0e3de', accent: '#d4826a', muted: '#6a5254', lume: '#c9a294' }, 'matte', 'rose'),
        T('TH-D2-05', 'Concrete', 'Cool cement, graphite digits, safety accent.', { bg: '#26282a', ink: '#e9eaeb', accent: '#d1a23a', muted: '#6a6c6f', lume: '#bdbfc2' }, 'matte', 'steel'),
      ],
      lightThemeIndex: 0,
      layers: [
        { t: 'dial', color: 'bg' },
        { t: 'arc', r: 218, w: 2, from: 0, to: 360, color: 'accent', data: 'seconds', track: 'muted', trackOpacity: 0.15, cap: 'round' },
        { t: 'dots', r: 218, count: 12, dot: 1.6, color: 'muted' },
        { t: 'text', token: 'hmm', x: 225, y: 218, size: 108, weight: 700, color: 'ink', font: F_D },
        { t: 'text', token: 'day3', x: 197, y: 288, size: 16, weight: 500, color: 'muted' },
        { t: 'text', token: 'dnum', x: 246, y: 288, size: 16, weight: 700, color: 'accent' },
        { t: 'text', token: 'ampmOnly', x: 225, y: 152, size: 15, weight: 700, color: 'muted' },
        { t: 'label', text: 'HALO BEACON', x: 225, y: 338, size: 10, weight: 500, color: 'muted' },
      ],
      aodLayers: [
        { t: 'text', token: 'hmm', x: 225, y: 225, size: 76, weight: 400, color: 'ink', font: F_D },
        { t: 'text', token: 'dnum', x: 225, y: 292, size: 16, weight: 500, color: 'muted', font: F_D },
      ],
      complications: [
        { id: 'SLOT-D2-1', label: 'Whisper line', shape: 'rect', x: 160, y: 274, w: 130, h: 26, types: ['SHORT_TEXT'], default: 'Day + date', options: 'Next event, steps, battery', fallback: 'Native date tokens', empty: 'Native tokens', tap: 'Provider app' },
      ],
      settings: HALO_SETTINGS('D2').filter((s) => !s.id.includes('GAUGES')),
      feasibility: HALO_FEAS(),
      battery: HALO_BATTERY,
      aodNote: 'Single thin-weight time line + date numeral. ~4% lit — flagship battery behaviour.',
      acceptance: [
        'h:mm single line 108px weight 700 centered (225,218); AM/PM 15px above at y152',
        'Whisper line day3+dnum at y288; nothing else below except brand line',
        '12 rim dots 1.6px; seconds arc r218 w2',
      ],
    },

    {
      id: 'WF-D3', name: 'Halo Quadrant', tagline: 'A broadsheet grid for the wrist.',
      concept: 'The dial as a newspaper front page: hairline rules divide four editorial zones — the time takes the two left columns full-height, date stacks top-right, steps and battery set as small-caps figures bottom-right. Depth comes from a recessed plate behind each data zone.',
      audience: 'Grid-obsessed designers, productivity-minded wearers.',
      wff: { version: 1, reason: 'No v2+ features required.' },
      fontStack: F_D,
      caseFinish: 'black',
      themes: [
        T('TH-D3-01', 'Broadsheet', 'Unbleached paper, ink rules — light flagship.', { bg: '#ded9cd', ink: '#1a1a19', accent: '#a84a2a', muted: '#95907f', lume: '#c3beb0' }, 'matte', 'black'),
        T('TH-D3-02', 'Late Edition', 'Iron ground, chalk figures.', { bg: '#141516', ink: '#e8e5dd', accent: '#cc5a36', muted: '#5b5b58', lume: '#939089' }, 'matte', 'black'),
        T('TH-D3-03', 'Financial', 'Salmon-paper ground, sepia ink.', { bg: '#d6bfa4', ink: '#33261a', accent: '#9c4a24', muted: '#a08d70', lume: '#c0ab8a' }, 'matte', 'gold'),
        T('TH-D3-04', 'Deep Field', 'Space-black, cyan folio.', { bg: '#0d1013', ink: '#e4e9ec', accent: '#59b6c8', muted: '#4e565c', lume: '#a2ccd6' }, 'matte', 'titanium'),
        T('TH-D3-05', 'Moss Ledger', 'Green-grey ground, cream figures.', { bg: '#171c16', ink: '#e6e3d2', accent: '#c0a44e', muted: '#5d6353', lume: '#a4ab90' }, 'matte', 'steel'),
      ],
      lightThemeIndex: 0,
      layers: [
        { t: 'dial', color: 'bg' },
        { t: 'line', x1: 252, y1: 70, x2: 252, y2: 380, color: 'muted', w: 1, opacity: 0.8 },
        { t: 'line', x1: 252, y1: 225, x2: 408, y2: 225, color: 'muted', w: 1, opacity: 0.8 },
        { t: 'text', token: 'hh', x: 158, y: 168, size: 124, weight: 800, color: 'ink', font: F_DB },
        { t: 'text', token: 'mm', x: 158, y: 288, size: 124, weight: 800, color: 'ink', font: F_DB },
        { t: 'text', token: 'ampmOnly', x: 158, y: 358, size: 14, weight: 700, color: 'accent' },
        { t: 'text', token: 'day3', x: 322, y: 118, size: 18, weight: 500, color: 'muted' },
        { t: 'text', token: 'dnum', x: 322, y: 158, size: 46, weight: 700, color: 'ink', font: F_DB },
        { t: 'text', token: 'mon3', x: 322, y: 196, size: 18, weight: 500, color: 'muted' },
        { t: 'label', text: 'STEPS', x: 300, y: 252, size: 10, weight: 700, color: 'muted' },
        { t: 'text', token: 'steps', x: 300, y: 276, size: 22, weight: 700, color: 'ink' },
        { t: 'arc', cx: 300, cy: 305, r: 14, w: 3, from: 0, to: 360, color: 'accent', data: 'steps', track: 'muted', trackOpacity: 0.25, cap: 'round' },
        { t: 'label', text: 'PWR', x: 366, y: 252, size: 10, weight: 700, color: 'muted' },
        { t: 'text', token: 'batt', x: 366, y: 276, size: 22, weight: 700, color: 'ink' },
        { t: 'arc', cx: 366, cy: 305, r: 14, w: 3, from: 0, to: 360, color: 'accent', data: 'battery', track: 'muted', trackOpacity: 0.25, cap: 'round' },
        { t: 'label', text: 'HALO QUADRANT', x: 322, y: 348, size: 8.5, weight: 600, color: 'muted' },
      ],
      aodLayers: haloAOD(),
      complications: [
        { id: 'SLOT-D3-1', label: 'Date zone', shape: 'rect', x: 268, y: 96, w: 116, h: 116, types: ['SHORT_TEXT'], default: 'Day + date (native tokens)', options: 'Next event, world clock', fallback: 'Native tokens', empty: 'Native tokens', tap: 'Calendar' },
        { id: 'SLOT-D3-2', label: 'Figure · left', shape: 'rect', x: 268, y: 236, w: 62, h: 92, types: ['SHORT_TEXT', 'RANGED_VALUE'], default: 'Steps', options: 'Any', fallback: '—', empty: 'Hidden', tap: 'Fitness app' },
        { id: 'SLOT-D3-3', label: 'Figure · right', shape: 'rect', x: 334, y: 236, w: 62, h: 92, types: ['SHORT_TEXT', 'RANGED_VALUE'], default: 'Watch battery', options: 'Any', fallback: '—', empty: 'Hidden', tap: 'Battery panel' },
      ],
      settings: HALO_SETTINGS('D3'),
      feasibility: HALO_FEAS(),
      battery: HALO_BATTERY,
      aodNote: 'Shared HALO AOD (thin stacked digits); grid rules drop in ambient.',
      acceptance: [
        'Column rule at x252, row rule y225 (right half only)',
        'Digit stack 124px at x158; date figure 46px at (322,158)',
        'Mini gauge rings r14 under each figure, full 360° fills',
      ],
    },

    {
      id: 'WF-D4', name: 'Halo Orbit', tagline: 'Time in the middle of its data.',
      concept: 'Concentric instrument rings around a typographic core: outermost seconds, then battery, then steps — each a hairline arc with an engraved track. The digital time sits in a recessed center well. Reads as a precision bearing, not a fitness ring.',
      audience: 'Tech-forward buyers who still want instrument charm.',
      wff: { version: 1, reason: 'No v2+ features required.' },
      fontStack: F_D,
      caseFinish: 'titanium',
      themes: [
        T('TH-D4-01', 'Bearing Steel', 'Silver ground, graphite rings — light flagship.', { bg: '#d4d4d0', ink: '#1b1c1e', accent: '#b04c2a', muted: '#8f908c', lume: '#b9bab4' }, 'brushed', 'steel'),
        T('TH-D4-02', 'Gun Oil', 'Blue-black, amber ring caps.', { bg: '#101318', ink: '#e6e8e9', accent: '#d9a23c', muted: '#4f5660', lume: '#e4bd74' }, 'matte', 'black'),
        T('TH-D4-03', 'Turbine', 'Graphite, ice-blue rings.', { bg: '#16181a', ink: '#e8eaec', accent: '#7cb8d6', muted: '#5a5e63', lume: '#b0d2e4' }, 'brushed', 'titanium'),
        T('TH-D4-04', 'Redline', 'Carbon, signal-red outer ring.', { bg: '#121112', ink: '#eae7e3', accent: '#c73f34', muted: '#5b5857', lume: '#d99a8c' }, 'matte', 'black'),
        T('TH-D4-05', 'Verde Corsa', 'Racing green, brass rings.', { bg: '#0f1611', ink: '#e6e4d6', accent: '#c2a052', muted: '#556056', lume: '#d3bd84' }, 'matte', 'gold'),
      ],
      lightThemeIndex: 0,
      layers: [
        { t: 'dial', color: 'bg' },
        { t: 'arc', r: 212, w: 3, from: 0, to: 360, color: 'accent', data: 'seconds', track: 'muted', trackOpacity: 0.22, cap: 'round' },
        { t: 'ticks', r: 202, count: 60, len: 4, w: 1, color: 'muted', opacity: 0.7 },
        { t: 'arc', r: 188, w: 3, from: 0, to: 360, color: 'ink', data: 'battery', track: 'muted', trackOpacity: 0.22, cap: 'round' },
        { t: 'arc', r: 172, w: 3, from: 0, to: 360, color: 'lume', data: 'steps', track: 'muted', trackOpacity: 0.22, cap: 'round' },
        { t: 'label', text: 'SEC', x: 225, y: 32, size: 8, weight: 700, color: 'muted' },
        { t: 'label', text: 'PWR', x: 225, y: 52, size: 8, weight: 700, color: 'muted' },
        { t: 'label', text: 'STP', x: 225, y: 72, size: 8, weight: 700, color: 'muted' },
        { t: 'plate', cx: 225, cy: 225, r: 148, color: 'shade:bg:-0.14' },
        { t: 'text', token: 'hh', x: 225, y: 180, size: 96, weight: 800, color: 'ink', font: F_DB },
        { t: 'text', token: 'mm', x: 225, y: 272, size: 96, weight: 800, color: 'muted', font: F_DB },
        { t: 'text', token: 'day3', x: 190, y: 330, size: 14, weight: 500, color: 'muted' },
        { t: 'text', token: 'dnum', x: 240, y: 330, size: 14, weight: 700, color: 'ink' },
        { t: 'text', token: 'ampmOnly', x: 225, y: 118, size: 13, weight: 700, color: 'accent' },
      ],
      aodLayers: haloAOD(),
      complications: [
        { id: 'SLOT-D4-1', label: 'Ring II override', shape: 'circle', cx: 225, cy: 225, r: 188, types: ['RANGED_VALUE'], default: 'Watch battery (native)', options: 'Any ranged provider', fallback: 'Battery', empty: 'Battery', tap: 'Battery panel' },
        { id: 'SLOT-D4-2', label: 'Ring III override', shape: 'circle', cx: 225, cy: 225, r: 172, types: ['RANGED_VALUE'], default: 'Steps (native)', options: 'Any ranged provider', fallback: 'Steps', empty: 'Steps', tap: 'Fitness app' },
        { id: 'SLOT-D4-3', label: 'Well footer', shape: 'rect', x: 160, y: 314, w: 130, h: 28, types: ['SHORT_TEXT'], default: 'Day + date', options: 'Next event', fallback: 'Native tokens', empty: 'Native tokens', tap: 'Calendar' },
      ],
      settings: HALO_SETTINGS('D4'),
      feasibility: HALO_FEAS(),
      battery: HALO_BATTERY,
      aodNote: 'Center well digits only (thin weight); all rings drop in ambient.',
      acceptance: [
        'Ring radii exactly 212 / 188 / 172, all w3 round-cap, tracks at 22% opacity',
        'Center well plate r148 recessed at −14% shade',
        'Ring labels SEC/PWR/STP stacked at 12 o’clock, 8px 700',
      ],
    },

    {
      id: 'WF-D5', name: 'Halo Ledger', tagline: 'The day, in five rows.',
      concept: 'A full editorial page: masthead time at top in 96px digits, then four ruled ledger rows — date, next event, steps, battery — each set as label + figure with engraved separators. The most information-dense HALO face, kept calm by strict typographic hierarchy.',
      audience: 'Power users who reject dashboard aesthetics.',
      wff: { version: 1, reason: 'No v2+ features required.' },
      fontStack: F_D,
      caseFinish: 'black',
      themes: [
        T('TH-D5-01', 'Ledger Cream', 'Account-book cream, iron ink — light flagship.', { bg: '#ded7c6', ink: '#1d1c19', accent: '#a4502c', muted: '#968f7c', lume: '#c2bba8' }, 'matte', 'black'),
        T('TH-D5-02', 'Carbon Ledger', 'Soft carbon, bone figures.', { bg: '#131414', ink: '#e9e6dd', accent: '#cf9c3c', muted: '#5b5a55', lume: '#948f83' }, 'matte', 'black'),
        T('TH-D5-03', 'Banker Green', 'Deep banker green, gilt rules.', { bg: '#0e1812', ink: '#e6e2d0', accent: '#c6a350', muted: '#54615a', lume: '#a2ab93' }, 'matte', 'gold'),
        T('TH-D5-04', 'Slate Audit', 'Cool slate, ice figures, coral folio.', { bg: '#191d21', ink: '#e7eaec', accent: '#d4705a', muted: '#5b6268', lume: '#a8b2ba' }, 'matte', 'steel'),
        T('TH-D5-05', 'Ochre File', 'Manila-ochre, umber ink.', { bg: '#c9a76a', ink: '#33261a', accent: '#9c4a24', muted: '#99815a', lume: '#b49a72' }, 'matte', 'gold'),
      ],
      lightThemeIndex: 0,
      layers: [
        { t: 'dial', color: 'bg' },
        { t: 'text', token: 'hmm', x: 225, y: 130, size: 96, weight: 700, color: 'ink', font: F_D },
        { t: 'text', token: 'ampmOnly', x: 225, y: 74, size: 13, weight: 700, color: 'accent' },
        { t: 'line', x1: 100, y1: 192, x2: 350, y2: 192, color: 'ink', w: 1.6 },
        { t: 'label', text: 'DATE', x: 118, y: 216, size: 11, weight: 700, color: 'muted', anchor: 'start' },
        { t: 'text', token: 'day3', x: 258, y: 216, size: 15, weight: 500, color: 'muted', anchor: 'end' },
        { t: 'text', token: 'dnum', x: 300, y: 216, size: 16, weight: 700, color: 'ink', anchor: 'end' },
        { t: 'text', token: 'mon3', x: 342, y: 216, size: 15, weight: 500, color: 'muted', anchor: 'end' },
        { t: 'line', x1: 100, y1: 238, x2: 350, y2: 238, color: 'muted', w: 0.8, opacity: 0.7 },
        { t: 'label', text: 'NEXT', x: 118, y: 262, size: 11, weight: 700, color: 'muted', anchor: 'start' },
        { t: 'text', token: 'event', x: 342, y: 262, size: 16, weight: 700, color: 'accent', anchor: 'end' },
        { t: 'line', x1: 100, y1: 284, x2: 350, y2: 284, color: 'muted', w: 0.8, opacity: 0.7 },
        { t: 'label', text: 'STEPS', x: 118, y: 308, size: 11, weight: 700, color: 'muted', anchor: 'start' },
        { t: 'text', token: 'steps', x: 342, y: 308, size: 16, weight: 700, color: 'ink', anchor: 'end' },
        { t: 'line', x1: 100, y1: 330, x2: 350, y2: 330, color: 'muted', w: 0.8, opacity: 0.7 },
        { t: 'label', text: 'PWR', x: 118, y: 354, size: 11, weight: 700, color: 'muted', anchor: 'start' },
        { t: 'text', token: 'batt', x: 342, y: 354, size: 16, weight: 700, color: 'ink', anchor: 'end' },
        { t: 'arc', r: 218, w: 2, from: 0, to: 360, color: 'accent', data: 'seconds', track: 'muted', trackOpacity: 0.15, cap: 'round' },
      ],
      aodLayers: haloAOD(),
      complications: [
        { id: 'SLOT-D5-1', label: 'Row · NEXT', shape: 'rect', x: 100, y: 244, w: 250, h: 36, types: ['SHORT_TEXT'], default: 'Next event (v1-legal)', options: 'World clock, alarm', fallback: '—', empty: 'Row shows —', tap: 'Agenda' },
        { id: 'SLOT-D5-2', label: 'Row · STEPS', shape: 'rect', x: 100, y: 290, w: 250, h: 36, types: ['SHORT_TEXT'], default: 'Steps', options: 'Any short-text', fallback: '—', empty: 'Row shows —', tap: 'Fitness app' },
        { id: 'SLOT-D5-3', label: 'Row · PWR', shape: 'rect', x: 100, y: 336, w: 250, h: 36, types: ['SHORT_TEXT'], default: 'Watch battery', options: 'Any short-text', fallback: '—', empty: 'Row shows —', tap: 'Battery panel' },
      ],
      settings: HALO_SETTINGS('D5'),
      feasibility: [
        ...HALO_FEAS(),
        { feature: 'Long event titles', badge: 'PROVIDER', mech: 'SHORT_TEXT is provider-truncated; row width sized for 12 characters at 16px — overflow handled by provider ellipsis' },
      ],
      battery: HALO_BATTERY,
      aodNote: 'Shared HALO AOD; ledger rows drop entirely in ambient.',
      acceptance: [
        'Masthead h:mm 96px at y130 with heavy rule y192 (1.6px)',
        'Four rows at y216/262/308/354 with 0.8px separators between',
        'Row figures right-align to x342; labels left-align at x118',
      ],
    },
  ],
};
