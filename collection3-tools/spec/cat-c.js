/* CAT-C — TERRA EXPEDITION SERIES
   Field, navigation and daylight instruments. Rugged, legible, honest.
   Design space: 450×450, center (225,225). All layers map to WFF v1 mechanisms. */

const F_C = "'Barlow SemiCondensed', sans-serif"; // static weights 500/600/700

function T(id, name, desc, roles, finish, caseFinish) {
  return { id, name, desc, roles, finish, caseFinish };
}

const TERRA_SETTINGS = (fid) => ([
  { id: `SET-${fid}-THEME`, type: 'colorTheme', label: 'Colour theme', options: '5 swatch options (≤5 roles each)', default: 'Theme 01' },
  { id: `SET-${fid}-SECONDS`, type: 'toggle', label: 'Central seconds', options: 'on / off', default: 'on' },
  { id: `SET-${fid}-DAYARC`, type: 'toggle', label: 'Daylight progress arc', options: 'on / off', default: 'on' },
  { id: `SET-${fid}-DARK`, type: 'toggle', label: 'Pure-black dark mode (universal light ink — strategy 5.2a)', options: 'on / off', default: 'off' },
]);

const TERRA_FEAS = () => ([
  { feature: 'Analog time, 24h inner ring, sweep seconds', badge: 'NATIVE', mech: 'Clock hands + static numeral rings' },
  { feature: 'Daylight progress arc (dawn→dusk sweep)', badge: 'NATIVE', mech: 'Arc fill driven by time-of-day; round end-cap doubles as the sun marker' },
  { feature: 'Sunrise / sunset times', badge: 'PROVIDER', mech: 'Sunrise/sunset complication provider (v1-legal default)' },
  { feature: 'Steps & battery gauges', badge: 'NATIVE', mech: 'Data-driven arc fills / ranged hands' },
  { feature: 'Compass rose / bearing marks', badge: 'NATIVE', mech: 'Static artwork only — no live heading (sensor data unavailable to WFF)' },
  { feature: 'Values shown in prototype', badge: 'SIMULATED', mech: 'Mock sunrise 05:41 / sunset 21:12 / steps / battery' },
]);

const TERRA_BATTERY = 'Day-arc and gauges update at minute cadence. Seconds interactive-only. AOD ~6% lit.';

function terraAOD(extra) {
  return [
    { t: 'ticks', r: 218, count: 12, len: 14, w: 2.6, color: 'muted' },
    { t: 'numerals', vals: [12, null, null, 3, null, null, 6, null, null, 9, null, null], r: 188, size: 26, weight: 500, color: 'muted' },
    { t: 'hand', kind: 'hour', len: 110, tail: 14, w: 4.4, shape: 'baton', color: 'ink' },
    { t: 'hand', kind: 'minute', len: 168, tail: 18, w: 3, shape: 'baton', color: 'ink' },
    { t: 'circle', r: 5, cx: 225, cy: 225, color: 'ink' },
    ...(extra || []),
  ];
}

function terraHands(o) {
  o = o || {};
  return [
    { t: 'hand', kind: 'hour', len: 116, tail: 18, w: 8, shape: 'sword', color: 'ink', stroke: 'shade:bg:-0.55', sw: 1, lume: true },
    { t: 'hand', kind: 'minute', len: 178, tail: 22, w: 5.5, shape: 'sword', color: 'ink', stroke: 'shade:bg:-0.55', sw: 1, lume: true },
    { t: 'hand', kind: 'second', len: 190, tail: 32, w: 1.7, shape: 'needle', color: o.second || 'accent', hub: 0 },
    { t: 'circle', r: 6.5, cx: 225, cy: 225, color: 'ink', stroke: 'shade:bg:-0.55', sw: 1.4 },
    { t: 'circle', r: 2.4, cx: 225, cy: 225, color: 'shade:bg:-0.5' },
  ];
}

export const category = {
  id: 'CAT-C',
  name: 'TERRA',
  series: 'Expedition Series',
  apk: 'watchfaces.terra.expedition',
  tagline: 'Field instruments for daylight hours — navigation-bred dials that treat sunrise and sunset as first-class data.',
  description: 'A rugged, warm-blooded category between VAKT’s machine density and MERIDIAN’s silence. Big legible field numerals, 24-hour inner rings, and a signature daylight arc whose sweeping end-cap acts as a sun position marker. Sunrise/sunset providers are the hero complication — a v1-legal default that almost no commercial face uses well.',
  fonts: [
    { family: 'Barlow SemiCondensed', weights: [500, 600, 700], role: 'All numerals and labels' },
  ],
  faces: [

    {
      id: 'WF-C1', name: 'Terra Field 24', tagline: 'The pattern-room field watch.',
      concept: 'A canonical field layout — bold 1-to-12 outer numerals, small 13-to-24 inner ring, syringe hands — modernised with a framed date and a sunrise/sunset pair at 6. Zero learning curve, maximum trust.',
      audience: 'Everyday adventurers; the largest commercial segment in the category.',
      wff: { version: 1, reason: 'No v2+ features required.' },
      fontStack: F_C,
      caseFinish: 'black',
      themes: [
        T('TH-C1-01', 'Canvas', 'Bone-canvas light dial, black numerals, brass seconds.', { bg: '#d9d2c0', ink: '#211e19', accent: '#a06a2e', muted: '#95896f', lume: '#c0b494' }, 'matte', 'black'),
        T('TH-C1-02', 'Field Black', 'Soot dial, bone numerals, khaki lume.', { bg: '#121210', ink: '#e7e2d3', accent: '#b98e42', muted: '#5e5a4c', lume: '#cdbe8c' }, 'matte', 'black'),
        T('TH-C1-03', 'Marsh', 'Deep marsh green, cream numerals, orange seconds.', { bg: '#131a12', ink: '#e6e0cc', accent: '#c56a30', muted: '#5a634f', lume: '#c3bd8f' }, 'matte', 'titanium'),
        T('TH-C1-04', 'Overcast', 'Storm-grey dial, white numerals, yellow seconds.', { bg: '#1d2023', ink: '#eceae4', accent: '#d3ac3c', muted: '#61656a', lume: '#c9c8ba' }, 'matte', 'steel'),
        T('TH-C1-05', 'Dune', 'Sand dial, umber numerals, oxide accents.', { bg: '#cdb78f', ink: '#2e2417', accent: '#9c4f26', muted: '#98835d', lume: '#b7a276' }, 'sandblast', 'gold'),
      ],
      lightThemeIndex: 0,
      layers: [
        { t: 'dial', color: 'bg' },
        { t: 'ticks', r: 220, count: 60, len: 9, w: 1.6, color: 'ink', opacity: 0.9 },
        { t: 'ticks', r: 222, count: 12, len: 16, w: 3.4, color: 'ink' },
        { t: 'numerals', vals: [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], r: 185, size: 34, weight: 700, color: 'ink' },
        { t: 'numerals', vals: [24, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], r: 142, size: 13, weight: 600, color: 'muted' },
        { t: 'label', text: 'TERRA', x: 225, y: 118, size: 14, weight: 700, color: 'ink' },
        { t: 'label', text: 'FIELD 24', x: 225, y: 133, size: 9, weight: 600, color: 'accent' },
        { t: 'rect', x: 205, y: 268, w: 40, h: 26, rx: 3, color: 'shade:bg:-0.25', stroke: 'muted', sw: 1 },
        { t: 'text', token: 'dnum', x: 225, y: 282, size: 17, weight: 700, color: 'ink' },
        { t: 'icon', name: 'sun', x: 176, y: 316, s: 8, color: 'accent' },
        { t: 'text', token: 'sunrise', x: 202, y: 316, size: 13, weight: 600, color: 'ink' },
        { t: 'icon', name: 'moon', x: 244, y: 316, s: 8, color: 'muted', filled: true },
        { t: 'text', token: 'sunset', x: 271, y: 316, size: 13, weight: 600, color: 'ink' },
        ...terraHands(),
      ],
      aodLayers: terraAOD(),
      complications: [
        { id: 'SLOT-C1-1', label: 'Date window', shape: 'rect', x: 205, y: 268, w: 40, h: 26, types: ['SHORT_TEXT'], default: 'Date', options: 'Day+date', fallback: 'Native token', empty: 'Native token', tap: 'Calendar' },
        { id: 'SLOT-C1-2', label: 'Sunrise cell', shape: 'rect', x: 164, y: 304, w: 60, h: 24, types: ['SHORT_TEXT'], default: 'Sunrise (v1-legal)', options: 'World clock, alarm', fallback: '—', empty: 'Hidden', tap: 'Provider app' },
        { id: 'SLOT-C1-3', label: 'Sunset cell', shape: 'rect', x: 230, y: 304, w: 60, h: 24, types: ['SHORT_TEXT'], default: 'Sunset (v1-legal)', options: 'World clock, alarm', fallback: '—', empty: 'Hidden', tap: 'Provider app' },
      ],
      settings: TERRA_SETTINGS('C1'),
      feasibility: TERRA_FEAS(),
      battery: TERRA_BATTERY,
      aodNote: 'Batons + 12/3/6/9 ghost numerals in fixed light ink. ~6% lit.',
      acceptance: [
        'Outer numerals 1–12 Barlow SemiCondensed 700 34px at r185; inner 13–24 13px at r142',
        'Sunrise/sunset pair flanks 6 o’clock at y316 with sun/moon icons',
        'Hands are sword profile with baked lume inserts',
      ],
    },

    {
      id: 'WF-C2', name: 'Terra Solstice', tagline: 'The day, drawn as an arc.',
      concept: 'The category signature at full size: a 270° daylight arc dominates the upper dial — its glowing round end-cap IS the sun, sweeping from dawn position to dusk as the day passes. Sunrise and sunset anchor the arc ends. Time stays analog underneath.',
      audience: 'Outdoor photographers, golden-hour chasers, northern-latitude users.',
      wff: { version: 1, reason: 'No v2+ features required.' },
      fontStack: F_C,
      caseFinish: 'titanium',
      themes: [
        T('TH-C2-01', 'Dawn Chalk', 'Pale morning dial, charcoal ink, sun-gold arc — light flagship.', { bg: '#ded9cc', ink: '#232220', accent: '#d19a3a', muted: '#96917f', lume: '#e0bc7a' }, 'matte', 'titanium'),
        T('TH-C2-02', 'Bluff Night', 'Iron-blue dusk dial, amber sun arc.', { bg: '#11161e', ink: '#e4e5e0', accent: '#e0a944', muted: '#525a66', lume: '#ecc27a' }, 'matte', 'titanium'),
        T('TH-C2-03', 'Alpenglow', 'Slate dial, rose-gold arc, blush lume.', { bg: '#1a1719', ink: '#ece5e2', accent: '#d38a64', muted: '#5f585c', lume: '#e8b494' }, 'matte', 'rose'),
        T('TH-C2-04', 'Boreal', 'Green-black dial, chartreuse arc.', { bg: '#0f1410', ink: '#e3e4d8', accent: '#b9cf56', muted: '#545c50', lume: '#d5e394' }, 'matte', 'black'),
        T('TH-C2-05', 'High Desert', 'Clay dial, oxide arc, bone ink.', { bg: '#28190f', ink: '#eadfd0', accent: '#d0703a', muted: '#77604c', lume: '#dda478' }, 'matte', 'gold'),
      ],
      lightThemeIndex: 0,
      layers: [
        { t: 'dial', color: 'bg' },
        { t: 'ticks', r: 220, count: 60, len: 7, w: 1.3, color: 'muted' },
        { t: 'ticks', r: 222, count: 12, len: 13, w: 2.8, color: 'ink' },
        { t: 'arc', r: 190, w: 7, from: -135, to: 135, color: 'accent', data: 'day', track: 'muted', trackOpacity: 0.22, cap: 'round' },
        { t: 'icon', name: 'sun', x: 122, y: 130, s: 9, color: 'accent' },
        { t: 'icon', name: 'moon', x: 328, y: 130, s: 9, color: 'muted', filled: true },
        { t: 'text', token: 'sunrise', x: 122, y: 156, size: 14, weight: 600, color: 'ink' },
        { t: 'text', token: 'sunset', x: 328, y: 156, size: 14, weight: 600, color: 'ink' },
        { t: 'label', text: 'TERRA SOLSTICE', x: 225, y: 108, size: 11, weight: 700, color: 'ink' },
        { t: 'numerals', vals: [12, null, null, 3, null, null, 6, null, null, 9, null, null], r: 160, size: 28, weight: 600, color: 'ink' },
        { t: 'text', token: 'day3', x: 195, y: 300, size: 13, weight: 600, color: 'muted' },
        { t: 'text', token: 'dnum', x: 248, y: 300, size: 17, weight: 700, color: 'ink' },
        { t: 'arc', r: 210, w: 3, from: 150, to: 210, color: 'lume', data: 'battery', track: 'muted', trackOpacity: 0.25, cap: 'round' },
        ...terraHands(),
      ],
      aodLayers: terraAOD([
        { t: 'arc', r: 200, w: 3, from: -135, to: 135, color: 'muted', data: 'day', cap: 'round' },
      ]),
      complications: [
        { id: 'SLOT-C2-1', label: 'Sunrise anchor', shape: 'rect', x: 90, y: 142, w: 64, h: 26, types: ['SHORT_TEXT'], default: 'Sunrise (v1-legal)', options: 'World clock', fallback: '—', empty: 'Hidden', tap: 'Provider app' },
        { id: 'SLOT-C2-2', label: 'Sunset anchor', shape: 'rect', x: 296, y: 142, w: 64, h: 26, types: ['SHORT_TEXT'], default: 'Sunset (v1-legal)', options: 'World clock', fallback: '—', empty: 'Hidden', tap: 'Provider app' },
        { id: 'SLOT-C2-3', label: 'Date pair at 6', shape: 'rect', x: 168, y: 286, w: 114, h: 28, types: ['SHORT_TEXT'], default: 'Day + date', options: 'Next event', fallback: 'Native tokens', empty: 'Native tokens', tap: 'Calendar' },
      ],
      settings: TERRA_SETTINGS('C2'),
      feasibility: TERRA_FEAS(),
      battery: TERRA_BATTERY + ' The day arc moves ~0.25°/minute — effectively free.',
      aodNote: 'AOD keeps a thin muted day arc — the signature survives ambient within budget.',
      acceptance: [
        'Day arc spans −135°→135° at r190 w7 round-cap; cap position = current time-of-day fraction',
        'Sunrise/sunset anchor texts at (122,156)/(328,156) beside sun/moon icons',
        'Battery arc bottom 150°→210° uses lume role, 3px',
      ],
    },

    {
      id: 'WF-C3', name: 'Terra Compass', tagline: 'Bearings for the city and the hill.',
      concept: 'A navigation dial built on a static compass rose — N·E·S·W cardinal artwork, mils-style outer graduation, and a fat orange north-arrow seconds hand. The rose is honest decoration: WFF has no heading sensor, and the design never pretends otherwise.',
      audience: 'Hikers and military-aesthetic collectors.',
      wff: { version: 1, reason: 'No v2+ features required.' },
      fontStack: F_C,
      caseFinish: 'black',
      themes: [
        T('TH-C3-01', 'Topo Bone', 'Map-paper dial, ink rose, safety-orange arrow — light flagship.', { bg: '#d8d3c4', ink: '#25231e', accent: '#c25a24', muted: '#928d7b', lume: '#b9b294' }, 'matte', 'black'),
        T('TH-C3-02', 'Ranger Black', 'Charcoal dial, bone rose, orange arrow.', { bg: '#141412', ink: '#e6e1d4', accent: '#cf6428', muted: '#5c584c', lume: '#c2b790' }, 'matte', 'black'),
        T('TH-C3-03', 'Tundra', 'Cold grey-green, ice ink, signal-red arrow.', { bg: '#171d1a', ink: '#e2e7e2', accent: '#c04434', muted: '#576059', lume: '#a4b3a4' }, 'matte', 'titanium'),
        T('TH-C3-04', 'Night March', 'Blue-black, phosphor rose.', { bg: '#0e1216', ink: '#dfe6e8', accent: '#8fc65c', muted: '#4f5960', lume: '#c0e08c' }, 'matte', 'black'),
        T('TH-C3-05', 'Canyon', 'Red-clay dial, cream rose, sky arrow.', { bg: '#31160d', ink: '#ecdfcd', accent: '#5f9bb0', muted: '#7c5c48', lume: '#c7a887' }, 'matte', 'gold'),
      ],
      lightThemeIndex: 0,
      layers: [
        { t: 'dial', color: 'bg' },
        { t: 'ticks', r: 222, count: 72, len: 8, w: 1.2, color: 'muted' },
        { t: 'ticks', r: 222, count: 12, len: 15, w: 3, color: 'ink' },
        { t: 'numerals', vals: ['N', 30, 60, 'E', 120, 150, 'S', 210, 240, 'W', 300, 330], r: 190, size: 20, weight: 700, color: 'ink' },
        { t: 'ring', r: 168, w: 1.2, color: 'muted' },
        { t: 'poly', points: '225,105 233,225 225,240 217,225', color: 'shade:bg:-0.3', opacity: 0.9 },
        { t: 'poly', points: '225,345 233,225 225,210 217,225', color: 'shade:bg:-0.18', opacity: 0.9 },
        { t: 'poly', points: '105,225 225,217 240,225 225,233', color: 'shade:bg:-0.18', opacity: 0.9 },
        { t: 'poly', points: '345,225 225,217 210,225 225,233', color: 'shade:bg:-0.3', opacity: 0.9 },
        { t: 'label', text: 'TERRA', x: 225, y: 148, size: 13, weight: 700, color: 'ink' },
        { t: 'label', text: 'COMPASS', x: 225, y: 163, size: 8, weight: 600, color: 'muted' },
        { t: 'rect', x: 190, y: 280, w: 70, h: 26, rx: 3, color: 'shade:bg:-0.25', stroke: 'muted', sw: 1 },
        { t: 'text', token: 'day3', x: 210, y: 294, size: 13, weight: 600, color: 'muted' },
        { t: 'text', token: 'dnum', x: 244, y: 294, size: 15, weight: 700, color: 'ink' },
        { t: 'arc', r: 150, w: 3, from: -50, to: 50, color: 'accent', data: 'steps', track: 'muted', trackOpacity: 0.25, cap: 'round' },
        { t: 'icon', name: 'steps', x: 225, y: 92, s: 8, color: 'muted', filled: true },
        { t: 'hand', kind: 'hour', len: 112, tail: 18, w: 8, shape: 'sword', color: 'ink', stroke: 'shade:bg:-0.55', sw: 1, lume: true },
        { t: 'hand', kind: 'minute', len: 172, tail: 22, w: 5.5, shape: 'sword', color: 'ink', stroke: 'shade:bg:-0.55', sw: 1, lume: true },
        { t: 'hand', kind: 'second', len: 186, tail: 34, w: 2, shape: 'dauphine', color: 'accent', hub: 0 },
        { t: 'circle', r: 6.5, cx: 225, cy: 225, color: 'ink', stroke: 'shade:bg:-0.55', sw: 1.4 },
        { t: 'circle', r: 2.4, cx: 225, cy: 225, color: 'shade:bg:-0.5' },
      ],
      aodLayers: terraAOD(),
      complications: [
        { id: 'SLOT-C3-1', label: 'Date plaque', shape: 'rect', x: 190, y: 280, w: 70, h: 26, types: ['SHORT_TEXT'], default: 'Day + date', options: 'Next event, alarm', fallback: 'Native tokens', empty: 'Native tokens', tap: 'Calendar' },
        { id: 'SLOT-C3-2', label: 'North gauge (steps)', shape: 'rect', x: 175, y: 78, w: 100, h: 30, types: ['RANGED_VALUE'], default: 'Steps (native)', options: 'Battery, any ranged', fallback: 'Native steps', empty: 'Native steps', tap: 'Fitness app' },
      ],
      settings: TERRA_SETTINGS('C3'),
      feasibility: [
        ...TERRA_FEAS(),
        { feature: 'Live compass heading', badge: 'CUSTOM', mech: 'IMPOSSIBLE in WFF (no sensor source) — rose is explicitly static artwork; never promised' },
      ],
      battery: TERRA_BATTERY,
      aodNote: 'Family AOD; rose drops entirely in ambient.',
      acceptance: [
        'Cardinal ring reads N/30/60/E/… at r190, 20px 700',
        'Rose is four static polys with light/dark facet pairs; no rotation anywhere',
        'Steps arc spans −50°→50° at r150 under the N cardinal',
      ],
    },

    {
      id: 'WF-C4', name: 'Terra Altimeter', tagline: 'Instrument-panel drama, honest data.',
      concept: 'Cockpit-instrument styling applied to legal data: a large altimeter-style register reads steps ×1000 on a three-hand-look dial (one real data hand + printed reference needles), and a smaller gauge reads battery like a fuel dial. Aviation bezel graduations complete the panel.',
      audience: 'Aviation-watch fans; instrument-panel aesthetes.',
      wff: { version: 1, reason: 'No v2+ features required.' },
      fontStack: F_C,
      caseFinish: 'black',
      themes: [
        T('TH-C4-01', 'Panel Ivory', 'Ivory instrument dial, black gauges — light flagship.', { bg: '#ddd8ca', ink: '#1e1d1a', accent: '#b8382e', muted: '#94907f', lume: '#bdb79e' }, 'matte', 'black'),
        T('TH-C4-02', 'Cockpit Black', 'Matte black panel, bone markings, radium lume.', { bg: '#121211', ink: '#e8e3d5', accent: '#c9973d', muted: '#5d594b', lume: '#d3c184' }, 'matte', 'black'),
        T('TH-C4-03', 'Gauge Green', 'Instrument green, cream markings.', { bg: '#12190f', ink: '#e5e0c9', accent: '#c46a2c', muted: '#59624c', lume: '#c8c088' }, 'matte', 'titanium'),
        T('TH-C4-04', 'Night Flight', 'Blue-black, red-gauge accents, ice ink.', { bg: '#0d1117', ink: '#e3e8ee', accent: '#c34a3c', muted: '#4e5763', lume: '#a9c4dc' }, 'matte', 'black'),
        T('TH-C4-05', 'Bare Metal', 'Aluminium dial, riveted grey, oxide needles.', { bg: '#2a2c2e', ink: '#eceae6', accent: '#c9622e', muted: '#6e7073', lume: '#c6c4bc' }, 'brushed', 'steel'),
      ],
      lightThemeIndex: 0,
      layers: [
        { t: 'dial', color: 'bg' },
        { t: 'ticks', r: 221, count: 60, len: 8, w: 1.5, color: 'ink', opacity: 0.85 },
        { t: 'numerals', vals: [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], r: 198, size: 24, weight: 700, color: 'ink' },
        { t: 'label', text: 'TERRA ALTIMETER', x: 225, y: 112, size: 11, weight: 700, color: 'ink' },
        { t: 'plate', cx: 160, cy: 258, r: 62, color: 'shade:bg:-0.3' },
        { t: 'ticks', cx: 160, cy: 258, r: 56, count: 50, len: 4, w: 0.9, color: 'muted' },
        { t: 'ticks', cx: 160, cy: 258, r: 56, count: 10, len: 8, w: 1.8, color: 'ink' },
        { t: 'numerals', cx: 160, cy: 258, vals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], r: 42, size: 13, weight: 700, color: 'ink' },
        { t: 'label', text: 'STEPS ×1000', x: 160, y: 285, size: 6.5, weight: 600, color: 'muted' },
        { t: 'hand', kind: 'data', data: 'stepsDial', cx: 160, cy: 258, len: 50, tail: 12, w: 2, shape: 'needle', color: 'accent', hub: 4 },
        { t: 'plate', cx: 300, cy: 272, r: 44, color: 'shade:bg:-0.3' },
        { t: 'ticks', cx: 300, cy: 272, r: 38, count: 8, len: 6, w: 1.6, color: 'ink', from: -60, to: 60 },
        { t: 'numerals', cx: 300, cy: 272, vals: ['E', null, 'F'], r: 27, size: 11, weight: 700, color: 'ink', from: -55, to: 55 },
        { t: 'label', text: 'PWR', x: 300, y: 294, size: 7, weight: 600, color: 'muted' },
        { t: 'arc', cx: 300, cy: 272, r: 33, w: 2.5, from: -60, to: 60, color: 'accent', data: 'battery', track: 'muted', trackOpacity: 0.25 },
        { t: 'hand', kind: 'data', data: 'battery', from: -60, to: 60, cx: 300, cy: 272, len: 33, tail: 8, w: 1.8, shape: 'needle', color: 'ink', hub: 3.5 },
        { t: 'rect', x: 196, y: 148, w: 58, h: 24, rx: 3, color: 'shade:bg:-0.3', stroke: 'muted', sw: 1 },
        { t: 'text', token: 'day3', x: 213, y: 161, size: 12, weight: 600, color: 'muted' },
        { t: 'text', token: 'dnum', x: 241, y: 161, size: 14, weight: 700, color: 'ink' },
        ...terraHands(),
      ],
      aodLayers: terraAOD(),
      complications: [
        { id: 'SLOT-C4-1', label: 'Altimeter register', shape: 'circle', cx: 160, cy: 258, r: 62, types: ['RANGED_VALUE'], default: 'Steps (native drawing)', options: 'Any ranged provider', fallback: 'Native steps', empty: 'Native steps', tap: 'Fitness app' },
        { id: 'SLOT-C4-2', label: 'Fuel gauge', shape: 'circle', cx: 300, cy: 272, r: 44, types: ['RANGED_VALUE'], default: 'Watch battery (native)', options: 'Phone battery provider', fallback: 'Watch battery', empty: 'Watch battery', tap: 'Battery panel' },
        { id: 'SLOT-C4-3', label: 'Placard (date)', shape: 'rect', x: 196, y: 148, w: 58, h: 24, types: ['SHORT_TEXT'], default: 'Day + date', options: 'Next event', fallback: 'Native tokens', empty: 'Native tokens', tap: 'Calendar' },
      ],
      settings: TERRA_SETTINGS('C4'),
      feasibility: TERRA_FEAS(),
      battery: TERRA_BATTERY,
      aodNote: 'Family AOD; gauges drop, placard date optionally retained as single muted numeral.',
      acceptance: [
        'Altimeter register r62 at (160,258), 0–9 scale, STEPS ×1000 placard',
        'Fuel gauge r44 at (300,272), E–F over −60°→60°',
        'No gauge pretends to read altitude/heading — placards name real data sources',
      ],
    },

    {
      id: 'WF-C5', name: 'Terra Meridian Line', tagline: 'A sundial you can trust indoors.',
      concept: 'The poetic one: a horizon line splits the dial into sky and ground. Above it, the daylight arc and sun cap; below, a serene reflection zone carrying date and event. At night the sky zone simply feels darker through theme discipline (two sky tones ship as separate themes — no forbidden conditional colour).',
      audience: 'Design-forward buyers who want calm with one glance of real data.',
      wff: { version: 1, reason: 'No v2+ features required.' },
      fontStack: F_C,
      caseFinish: 'titanium',
      themes: [
        T('TH-C5-01', 'Morning Line', 'Pale sky over chalk ground — light flagship.', { bg: '#d6d4c9', ink: '#26251f', accent: '#cf9433', muted: '#93907f', lume: '#dcb672' }, 'matte', 'titanium'),
        T('TH-C5-02', 'Evening Line', 'Deep indigo sky over slate ground.', { bg: '#12141d', ink: '#e5e4de', accent: '#e0aa48', muted: '#525667', lume: '#ecc47e' }, 'matte', 'titanium'),
        T('TH-C5-03', 'Fog Line', 'Grey-green monochrome, brass sun.', { bg: '#1a1e1b', ink: '#e2e4dd', accent: '#c0964a', muted: '#5b605c', lume: '#d2b380' }, 'matte', 'steel'),
        T('TH-C5-04', 'Ash Line', 'Warm ash, ember sun, bone ink.', { bg: '#1c1815', ink: '#eae4da', accent: '#cd6b35', muted: '#655c53', lume: '#dfa87c' }, 'matte', 'black'),
        T('TH-C5-05', 'Polar Line', 'Blue-white sky, steel ground, cold sun.', { bg: '#171c22', ink: '#e7ebef', accent: '#d3b768', muted: '#57616c', lume: '#e2cc90' }, 'matte', 'steel'),
      ],
      lightThemeIndex: 0,
      layers: [
        { t: 'dial', color: 'bg' },
        { t: 'rect', x: 0, y: 225, w: 450, h: 225, color: 'shade:bg:-0.22' },
        { t: 'line', x1: 25, y1: 225, x2: 425, y2: 225, color: 'ink', w: 1.2, opacity: 0.7 },
        { t: 'ticks', r: 221, count: 12, len: 12, w: 2.4, color: 'ink' },
        { t: 'ticks', r: 219, count: 60, len: 6, w: 1, color: 'muted', opacity: 0.7 },
        { t: 'arc', r: 178, w: 6, from: -90, to: 90, color: 'accent', data: 'day', track: 'muted', trackOpacity: 0.2, cap: 'round' },
        { t: 'text', token: 'sunrise', x: 92, y: 246, size: 13, weight: 600, color: 'muted' },
        { t: 'text', token: 'sunset', x: 358, y: 246, size: 13, weight: 600, color: 'muted' },
        { t: 'label', text: 'TERRA', x: 225, y: 130, size: 13, weight: 700, color: 'ink' },
        { t: 'label', text: 'MERIDIAN LINE', x: 225, y: 145, size: 8, weight: 600, color: 'muted' },
        { t: 'text', token: 'day3', x: 180, y: 300, size: 14, weight: 600, color: 'muted' },
        { t: 'text', token: 'dnum', x: 228, y: 300, size: 19, weight: 700, color: 'ink' },
        { t: 'text', token: 'mon3', x: 276, y: 300, size: 14, weight: 600, color: 'muted' },
        { t: 'text', token: 'event', x: 225, y: 330, size: 13, weight: 600, color: 'accent' },
        ...terraHands(),
      ],
      aodLayers: terraAOD([
        { t: 'line', x1: 105, y1: 225, x2: 345, y2: 225, color: 'muted', w: 1 },
      ]),
      complications: [
        { id: 'SLOT-C5-1', label: 'Sunrise (horizon left)', shape: 'rect', x: 62, y: 234, w: 60, h: 24, types: ['SHORT_TEXT'], default: 'Sunrise (v1-legal)', options: 'World clock', fallback: '—', empty: 'Hidden', tap: 'Provider app' },
        { id: 'SLOT-C5-2', label: 'Sunset (horizon right)', shape: 'rect', x: 328, y: 234, w: 60, h: 24, types: ['SHORT_TEXT'], default: 'Sunset (v1-legal)', options: 'World clock', fallback: '—', empty: 'Hidden', tap: 'Provider app' },
        { id: 'SLOT-C5-3', label: 'Ground event line', shape: 'rect', x: 145, y: 318, w: 160, h: 24, types: ['SHORT_TEXT'], default: 'Next event (v1-legal)', options: 'Alarm, world clock', fallback: '—', empty: 'Hidden', tap: 'Agenda' },
      ],
      settings: TERRA_SETTINGS('C5'),
      feasibility: [
        ...TERRA_FEAS(),
        { feature: 'Sky darkening at night', badge: 'NATIVE', mech: 'Achieved by theme choice only — two sky moods ship as separate themes; no conditional colour exists in WFF' },
      ],
      battery: TERRA_BATTERY,
      aodNote: 'Family AOD + single horizon hairline. ~6% lit.',
      acceptance: [
        'Horizon at exactly y225 with −22% ground shade below',
        'Day arc −90°→90° (horizon-to-horizon) at r178 w6',
        'Calendar row day3/dnum/mon3 at y300; event line y330 in accent',
      ],
    },
  ],
};
