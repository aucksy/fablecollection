/* CAT-B — MERIDIAN DRESS SERIES
   Bauhaus-descended dress watches: restraint, proportion, typographic purity.
   Design space: 450×450, center (225,225). All layers map to WFF v1 mechanisms. */

const F_B = "'Jost', sans-serif";        // static weights 300/400/500/600
const F_BR = "'Marcellus', serif";       // roman variant numerals (400 only)

function T(id, name, desc, roles, finish, caseFinish) {
  return { id, name, desc, roles, finish, caseFinish };
}

const MER_SETTINGS = (fid) => ([
  { id: `SET-${fid}-THEME`, type: 'colorTheme', label: 'Colour theme', options: '5 swatch options (≤5 roles each)', default: 'Theme 01' },
  { id: `SET-${fid}-SECONDS`, type: 'toggle', label: 'Central seconds', options: 'on / off', default: 'on' },
  { id: `SET-${fid}-BATT`, type: 'toggle', label: 'Discreet battery arc at 6', options: 'on / off', default: 'off' },
  { id: `SET-${fid}-DARK`, type: 'toggle', label: 'Pure-black dark mode (universal light ink — strategy 5.2a)', options: 'on / off', default: 'off' },
]);

const MER_FEAS = () => ([
  { feature: 'Analog time, sweep seconds', badge: 'NATIVE', mech: 'Clock hands from artwork; platform sweep' },
  { feature: 'Date window / date text', badge: 'NATIVE', mech: 'Native day-number token in a framed window' },
  { feature: 'Discreet battery arc (optional)', badge: 'NATIVE', mech: 'Data-driven arc fill, toggle-gated layer' },
  { feature: 'Single discreet complication line', badge: 'PROVIDER', mech: 'SHORT_TEXT slot; v1-legal default (next event)' },
  { feature: 'Values shown in prototype', badge: 'SIMULATED', mech: 'Mock event/battery values' },
]);

const MER_BATTERY = 'Nothing on the dial updates faster than once per minute except optional central seconds. AOD is a two-hand poster at ~4% lit pixels — the most battery-frugal category in the collection.';

function merAOD(withDigits) {
  const L = [
    { t: 'dots', r: 205, count: 12, dot: 2, color: 'muted' },
    { t: 'hand', kind: 'hour', len: 110, tail: 10, w: 3.4, shape: 'baton', color: 'ink' },
    { t: 'hand', kind: 'minute', len: 168, tail: 12, w: 2.4, shape: 'baton', color: 'ink' },
    { t: 'circle', r: 4, cx: 225, cy: 225, color: 'ink' },
  ];
  if (withDigits) L.push({ t: 'text', token: 'hmm', x: 225, y: 330, size: 26, weight: 300, color: 'muted', font: F_B });
  return L;
}

function merHands(o) {
  o = o || {};
  return [
    { t: 'hand', kind: 'hour', len: 112, tail: 14, w: 5, shape: o.shape || 'baton', color: o.color || 'ink', lume: false },
    { t: 'hand', kind: 'minute', len: 176, tail: 18, w: 3.6, shape: o.shape || 'baton', color: o.color || 'ink' },
    { t: 'hand', kind: 'second', len: 188, tail: 30, w: 1.4, shape: 'needle', color: 'accent', hub: 0 },
    { t: 'circle', r: 4.5, cx: 225, cy: 225, color: o.color || 'ink' },
    { t: 'circle', r: 1.8, cx: 225, cy: 225, color: 'bg' },
  ];
}

function dateWindow(x, y) {
  return [
    { t: 'rect', x: x - 17, y: y - 13, w: 34, h: 26, rx: 3, color: 'shade:bg:-0.25', stroke: 'muted', sw: 1 },
    { t: 'text', token: 'dnum', x, y: y + 1, size: 17, weight: 500, color: 'ink', font: F_B },
  ];
}

export const category = {
  id: 'CAT-B',
  name: 'MERIDIAN',
  series: 'Dress Series',
  apk: 'watchfaces.meridian.dress',
  tagline: 'Bauhaus restraint for the wrist — five dress dials that make a smartwatch disappear into a watch.',
  description: 'The commercial counterweight to VAKT: minimal, typographic, quiet. Every face is built from proportion and negative space — thin batons, precise dot and line indices, one carefully framed piece of information. Complications are optional and discreet by design.',
  fonts: [
    { family: 'Jost', weights: [300, 400, 500, 600], role: 'Numerals, labels, digital accents' },
    { family: 'Marcellus', weights: [400], role: 'Roman numerals (WF-B5)' },
  ],
  faces: [

    {
      id: 'WF-B1', name: 'Meridian Classic', tagline: 'The essential dial.',
      concept: 'The purest expression: line indices, slim batons, a framed date at 3. The proportions follow a strict radial grid — indices at r208, numerals absent, everything earns its place.',
      audience: 'Design purists; the daily-wear dress buyer.',
      wff: { version: 1, reason: 'No v2+ features required.' },
      fontStack: F_B,
      caseFinish: 'steel',
      themes: [
        T('TH-B1-01', 'Gallery White', 'Warm-white lacquer, near-black ink, vermilion seconds — the light flagship.', { bg: '#e6e2d8', ink: '#1c1c1e', accent: '#b5442c', muted: '#98948a', lume: '#c8c4b8' }, 'lacquer', 'steel'),
        T('TH-B1-02', 'Anthracite', 'Deep anthracite, silver ink, vermilion thread.', { bg: '#17181a', ink: '#e6e5e1', accent: '#c25036', muted: '#5e5f61', lume: '#8a8b8d' }, 'matte', 'steel'),
        T('TH-B1-03', 'Prussian', 'Prussian blue sunray, warm silver, brass seconds.', { bg: '#101722', ink: '#e4e4dd', accent: '#c9a45c', muted: '#4f5a6b', lume: '#8a93a5' }, 'sunray', 'steel'),
        T('TH-B1-04', 'Loden', 'Loden green matte, bone ink, copper seconds.', { bg: '#151a14', ink: '#e6e3d7', accent: '#c07f4a', muted: '#5b6156', lume: '#969c8e' }, 'matte', 'gold'),
        T('TH-B1-05', 'Porcelain Noir', 'Black lacquer, gilt accents, gold case.', { bg: '#0e0e10', ink: '#eae6da', accent: '#c8a860', muted: '#57554e', lume: '#948f7f' }, 'lacquer', 'gold'),
      ],
      lightThemeIndex: 0,
      layers: [
        { t: 'dial', color: 'bg' },
        { t: 'ticks', r: 214, count: 60, len: 6, w: 1, color: 'muted', opacity: 0.85 },
        { t: 'ticks', r: 216, count: 12, len: 20, w: 2.6, color: 'ink' },
        { t: 'label', text: 'MERIDIAN', x: 225, y: 130, size: 14, weight: 500, color: 'ink' },
        { t: 'label', text: 'AUTOMATIC · 41', x: 225, y: 315, size: 9, weight: 400, color: 'muted' },
        ...dateWindow(330, 225),
        { t: 'arc', r: 196, w: 2, from: 165, to: 195, color: 'accent', data: 'battery', track: 'muted', trackOpacity: 0.3, cap: 'round' },
        ...merHands(),
      ],
      aodLayers: merAOD(false),
      complications: [
        { id: 'SLOT-B1-1', label: 'Date window', shape: 'rect', x: 313, y: 212, w: 34, h: 26, types: ['SHORT_TEXT'], defaultProvider: 'DATE', default: 'Date (native token fallback)', options: 'Day+date', fallback: 'Native date token', empty: 'Native date token', tap: 'Calendar' },
        { id: 'SLOT-B1-2', label: 'Line at 6 (hidden by default)', shape: 'rect', x: 165, y: 330, w: 120, h: 22, types: ['SHORT_TEXT'], default: 'Empty', options: 'Next event, world clock, alarm', fallback: '—', empty: 'Hidden', tap: 'Provider app' },
      ],
      settings: MER_SETTINGS('B1'),
      feasibility: MER_FEAS(),
      battery: MER_BATTERY,
      aodNote: 'Two baton hands + 12 dots. ~4% lit. No digits — deliberately the quietest AOD in the collection.',
      acceptance: [
        '12 major indices len 20 w2.6 at r216; 60 minor len 6 w1',
        'Date window 34×26 centered (330,225) with 1px muted keyline',
        'Battery arc renders only when SET-B1-BATT is on, spanning 165°–195° at r196',
      ],
    },

    {
      id: 'WF-B2', name: 'Meridian Sector', tagline: 'The draughtsman’s dial.',
      concept: 'A 1930s sector dial reborn: concentric hairline rings divide the dial into hour, minute, and seconds zones; crosshair through center; numerals at 12-3-6-9. Information lives in the ring grammar, not in boxes.',
      audience: 'Vintage-watch literates; architecture and print-design people.',
      wff: { version: 1, reason: 'No v2+ features required.' },
      fontStack: F_B,
      caseFinish: 'steel',
      themes: [
        T('TH-B2-01', 'Blueprint', 'Pale drafting-paper dial, indigo ink — light flagship.', { bg: '#dcdcd2', ink: '#232c40', accent: '#a34d2c', muted: '#8f9088', lume: '#b9bcb0' }, 'matte', 'steel'),
        T('TH-B2-02', 'Ink Sector', 'Iron-black dial, chalk rings, signal-red seconds.', { bg: '#131315', ink: '#e3e2dc', accent: '#bd4b33', muted: '#57575a', lume: '#8d8d90' }, 'matte', 'black'),
        T('TH-B2-03', 'Sepia Chart', 'Aged-chart cream, sepia ink, brass case.', { bg: '#ddd2bc', ink: '#3a2f22', accent: '#8a5a2c', muted: '#a5987e', lume: '#c2b698' }, 'matte', 'gold'),
        T('TH-B2-04', 'Nord', 'Fog-blue dial, graphite rings, amber seconds.', { bg: '#1a2026', ink: '#dfe3e6', accent: '#cf9a48', muted: '#5c6670', lume: '#93a0ab' }, 'matte', 'titanium'),
        T('TH-B2-05', 'Racing Green', 'British green, cream rings, gilt seconds.', { bg: '#0f1712', ink: '#e7e2d0', accent: '#c3a25a', muted: '#4f5c53', lume: '#95a196' }, 'sunray', 'steel'),
      ],
      lightThemeIndex: 0,
      layers: [
        { t: 'dial', color: 'bg' },
        { t: 'ring', r: 210, w: 1.2, color: 'ink' },
        { t: 'ticks', r: 210, count: 60, len: 10, w: 1, color: 'ink', opacity: 0.8 },
        { t: 'ring', r: 200, w: 1.2, color: 'ink' },
        { t: 'ring', r: 150, w: 1, color: 'muted' },
        { t: 'line', x1: 75, y1: 225, x2: 375, y2: 225, color: 'muted', w: 0.8, opacity: 0.7 },
        { t: 'line', x1: 225, y1: 75, x2: 225, y2: 375, color: 'muted', w: 0.8, opacity: 0.7 },
        { t: 'circle', r: 74, cx: 225, cy: 225, color: 'shade:bg:-0.08' },
        { t: 'ring', r: 74, w: 1, color: 'muted' },
        { t: 'numerals', vals: [12, null, null, 3, null, null, 6, null, null, 9, null, null], r: 176, size: 30, weight: 400, color: 'ink' },
        { t: 'label', text: 'MERIDIAN', x: 225, y: 152, size: 12, weight: 500, color: 'ink' },
        { t: 'label', text: 'SECTOR', x: 225, y: 166, size: 8, weight: 400, color: 'accent' },
        { t: 'text', token: 'day3', x: 225, y: 290, size: 11, weight: 500, color: 'muted' },
        { t: 'text', token: 'dnum', x: 225, y: 305, size: 15, weight: 500, color: 'ink' },
        ...merHands({ shape: 'dauphine' }),
      ],
      aodLayers: merAOD(false),
      complications: [
        { id: 'SLOT-B2-1', label: 'Lower sector text', shape: 'rect', x: 175, y: 278, w: 100, h: 36, types: ['SHORT_TEXT'], default: 'Day + date (v1-legal)', options: 'Next event, world clock', fallback: 'Native date tokens', empty: 'Native date tokens', tap: 'Calendar' },
      ],
      settings: MER_SETTINGS('B2'),
      feasibility: MER_FEAS(),
      battery: MER_BATTERY,
      aodNote: 'Family AOD (batons + dots); crosshair dropped to stay under lit-pixel budget.',
      acceptance: [
        'Ring radii exactly 210 / 200 / 150 / 74; crosshair 0.8px through center',
        'Numerals only at 12-3-6-9, 30px Jost 400, r176',
        'Center disc shade −8% of bg role',
      ],
    },

    {
      id: 'WF-B3', name: 'Meridian Petite Seconde', tagline: 'Seconds, set aside.',
      concept: 'The classical complication layout: running seconds demoted to a recessed register at 6, giving the main dial pure two-hand calm. The register doubles as the face’s single complication mount.',
      audience: 'Traditionalists; buyers upgrading from mechanical dress watches.',
      wff: { version: 1, reason: 'No v2+ features required.' },
      fontStack: F_B,
      caseFinish: 'steel',
      themes: [
        T('TH-B3-01', 'Silver Opaline', 'Opaline silver, charcoal ink — light flagship.', { bg: '#dcdad3', ink: '#26262a', accent: '#8a6d3b', muted: '#95928a', lume: '#bcb9b0' }, 'sunray', 'steel'),
        T('TH-B3-02', 'Slate Doctor', 'Slate dial, chalk ink, oxide-red seconds register.', { bg: '#1b1d20', ink: '#e2e1dd', accent: '#b0523a', muted: '#5d6064', lume: '#8e9195' }, 'matte', 'steel'),
        T('TH-B3-03', 'Champagne', 'Champagne sunray, umber ink, gold case.', { bg: '#d3c4a4', ink: '#332b1e', accent: '#8f5f2a', muted: '#a08e6e', lume: '#bfb08e' }, 'sunray', 'gold'),
        T('TH-B3-04', 'Abyss', 'Black-teal, silver ink, seafoam seconds.', { bg: '#0d1517', ink: '#e2e7e6', accent: '#76b3a4', muted: '#4e5c5e', lume: '#8fa5a3' }, 'matte', 'titanium'),
        T('TH-B3-05', 'Aubergine', 'Deep aubergine, warm silver, rose case.', { bg: '#171015', ink: '#e9e3e0', accent: '#bd7f68', muted: '#5c5158', lume: '#948a91' }, 'lacquer', 'rose'),
      ],
      lightThemeIndex: 0,
      layers: [
        { t: 'dial', color: 'bg' },
        { t: 'dots', r: 212, count: 60, dot: 1.1, color: 'muted', skipEvery: 5 },
        { t: 'ticks', r: 218, count: 12, len: 16, w: 2.4, color: 'ink' },
        { t: 'label', text: 'MERIDIAN', x: 225, y: 128, size: 14, weight: 500, color: 'ink' },
        { t: 'plate', cx: 225, cy: 312, r: 52, color: 'shade:bg:-0.15' },
        { t: 'ticks', cx: 225, cy: 312, r: 46, count: 12, len: 5, w: 1.2, color: 'muted' },
        { t: 'numerals', cx: 225, cy: 312, vals: [60, 15, 30, 45], r: 34, size: 11, weight: 500, color: 'ink' },
        { t: 'hand', kind: 'second', cx: 225, cy: 312, len: 44, tail: 10, w: 1.3, shape: 'needle', color: 'accent', hub: 2.8 },
        ...dateWindow(330, 225),
        { t: 'hand', kind: 'hour', len: 112, tail: 14, w: 5, shape: 'baton', color: 'ink' },
        { t: 'hand', kind: 'minute', len: 176, tail: 18, w: 3.6, shape: 'baton', color: 'ink' },
        { t: 'circle', r: 4.5, cx: 225, cy: 225, color: 'ink' },
        { t: 'circle', r: 1.8, cx: 225, cy: 225, color: 'bg' },
      ],
      aodLayers: merAOD(true),
      complications: [
        { id: 'SLOT-B3-2', label: 'Date window', shape: 'rect', x: 313, y: 212, w: 34, h: 26, types: ['SHORT_TEXT'], default: 'Date', options: 'Day+date', fallback: 'Native token', empty: 'Native token', tap: 'Calendar' },
      ],
      settings: MER_SETTINGS('B3').filter((s) => !s.id.includes('SECONDS')),
      feasibility: MER_FEAS(),
      battery: MER_BATTERY + ' The seconds register updates once per second in interactive mode only.',
      aodNote: 'Family AOD plus thin 26px h:mm below center (~5% lit).',
      acceptance: [
        'Seconds register recessed plate r52 at (225,312) with 60/15/30/45 quarters',
        'Main dial has exactly two hands; no central seconds ever',
        'Minute dots skip every 5th position (replaced by major ticks)',
      ],
    },

    {
      id: 'WF-B4', name: 'Meridian Calendrier', tagline: 'The week at a glance.',
      concept: 'The information dress watch: a typographic calendar row spans the upper dial (day · date · month, all native tokens), balanced by a discreet next-event line at 6. Still two hands, still silent.',
      audience: 'Calendar-driven professionals who refuse a data dashboard.',
      wff: { version: 1, reason: 'No v2+ features required.' },
      fontStack: F_B,
      caseFinish: 'steel',
      themes: [
        T('TH-B4-01', 'Paper', 'Warm paper dial, ink-black type — light flagship.', { bg: '#e2ddd1', ink: '#1f1e1c', accent: '#a8502e', muted: '#97917f', lume: '#c4bfae' }, 'matte', 'steel'),
        T('TH-B4-02', 'Ledger Black', 'Soft black, bone type, vermilion Sunday accent.', { bg: '#141415', ink: '#e7e4dc', accent: '#bf5638', muted: '#5b5a56', lume: '#918f88' }, 'matte', 'black'),
        T('TH-B4-03', 'Archive Green', 'Card-catalogue green, cream type.', { bg: '#1a231c', ink: '#e5e0cd', accent: '#c9a44e', muted: '#5f6a5f', lume: '#98a293' }, 'matte', 'steel'),
        T('TH-B4-04', 'Dove', 'Dove-grey sunray, graphite type, plum accent.', { bg: '#232326', ink: '#e5e4e6', accent: '#9c6b8f', muted: '#66666a', lume: '#98979c' }, 'sunray', 'steel'),
        T('TH-B4-05', 'Tabac', 'Tobacco brown, gilt type, gold case.', { bg: '#1c130c', ink: '#e9ddc9', accent: '#c99548', muted: '#6b5a45', lume: '#a3906f' }, 'lacquer', 'gold'),
      ],
      lightThemeIndex: 0,
      layers: [
        { t: 'dial', color: 'bg' },
        { t: 'ticks', r: 214, count: 60, len: 6, w: 1, color: 'muted', opacity: 0.85 },
        { t: 'ticks', r: 216, count: 12, len: 18, w: 2.4, color: 'ink' },
        { t: 'label', text: 'MERIDIAN', x: 225, y: 116, size: 13, weight: 500, color: 'ink' },
        { t: 'text', token: 'day3', x: 165, y: 160, size: 17, weight: 500, color: 'muted' },
        { t: 'text', token: 'dnum', x: 225, y: 160, size: 26, weight: 500, color: 'ink' },
        { t: 'text', token: 'mon3', x: 285, y: 160, size: 17, weight: 500, color: 'muted' },
        { t: 'line', x1: 196, y1: 160, x2: 204, y2: 160, color: 'accent', w: 1.4 },
        { t: 'line', x1: 246, y1: 160, x2: 254, y2: 160, color: 'accent', w: 1.4 },
        { t: 'text', token: 'event', x: 225, y: 306, size: 15, weight: 500, color: 'ink' },
        { t: 'label', text: 'NEXT', x: 225, y: 288, size: 8.5, weight: 600, color: 'accent' },
        ...merHands(),
      ],
      aodLayers: [
        ...merAOD(false),
        { t: 'text', token: 'dnum', x: 225, y: 330, size: 24, weight: 300, color: 'muted', font: F_B },
      ],
      complications: [
        // JUDGED (2026-07-22): keep NEXT_EVENT — the engraved 'NEXT' label above this line is
        // baked dial art, so a day+date default would read 'NEXT: Sun 19'; the calendar row
        // above is native tokens, so the face is never dataless. Event fills after permission.
        { id: 'SLOT-B4-1', label: 'Event line at 6', shape: 'rect', x: 155, y: 282, w: 140, h: 36, types: ['SHORT_TEXT'], default: 'Next event (v1-legal)', options: 'World clock, alarm, any short-text', fallback: '—', empty: 'Label hidden', tap: 'Agenda' },
      ],
      settings: MER_SETTINGS('B4'),
      feasibility: [
        ...MER_FEAS(),
        { feature: 'Day · date · month row', badge: 'NATIVE', mech: 'Three separate native date-token text elements' },
      ],
      battery: MER_BATTERY,
      aodNote: 'Family AOD plus date numeral — the calendar identity survives into ambient.',
      acceptance: [
        'Calendar row at y160: day3 (x165) / dnum 26px (x225) / mon3 (x285), separated by 8px accent dashes',
        'NEXT label uses accent role, 8.5px, above the event line at (225,306)',
      ],
    },

    {
      id: 'WF-B5', name: 'Meridian Roman', tagline: 'Grand feu, quietly modern.',
      concept: 'The formal flagship: Marcellus roman numerals XII–III–VI–IX rendered as static type, a railway minute track, and lacquer depth. The one face in the family with true evening-wear presence.',
      audience: 'Formalwear occasions; buyers who want heritage codes without pastiche.',
      wff: { version: 1, reason: 'No v2+ features required.' },
      fontStack: F_B,
      caseFinish: 'gold',
      themes: [
        T('TH-B5-01', 'Grand Feu', 'White enamel, oxidised numerals, blued seconds — light flagship.', { bg: '#e8e4da', ink: '#232326', accent: '#3a4f7a', muted: '#9b968b', lume: '#c6c2b6' }, 'lacquer', 'steel'),
        T('TH-B5-02', 'Onyx Roman', 'Black lacquer, gilt romans, gold case.', { bg: '#0e0e0f', ink: '#e3d9bd', accent: '#c8a860', muted: '#565349', lume: '#8f8a78' }, 'lacquer', 'gold'),
        T('TH-B5-03', 'Burgundy', 'Oxblood lacquer, champagne romans.', { bg: '#210f12', ink: '#e8dcc8', accent: '#c9954e', muted: '#6b5254', lume: '#9c8a80' }, 'lacquer', 'rose'),
        T('TH-B5-04', 'Verdigris', 'Patina green, bone romans, brass seconds.', { bg: '#16211d', ink: '#e4dfcd', accent: '#b0894a', muted: '#5c6a63', lume: '#96a198' }, 'sunray', 'gold'),
        T('TH-B5-05', 'Midnight Enamel', 'Blue-black enamel, silver romans.', { bg: '#0e1420', ink: '#e5e6e2', accent: '#98a8c4', muted: '#4e586b', lume: '#8f99ac' }, 'lacquer', 'steel'),
      ],
      lightThemeIndex: 0,
      layers: [
        { t: 'dial', color: 'bg' },
        { t: 'ring', r: 213, w: 1, color: 'muted' },
        { t: 'ticks', r: 212, count: 60, len: 7, w: 1, color: 'muted' },
        { t: 'ring', r: 205, w: 1, color: 'muted' },
        { t: 'numerals', vals: ['XII', null, null, 'III', null, null, 'VI', null, null, 'IX', null, null], r: 178, size: 34, weight: 400, color: 'ink', font: F_BR },
        { t: 'dots', r: 178, count: 12, dot: 1.6, color: 'muted', skipEvery: 3 },
        { t: 'label', text: 'MERIDIAN', x: 225, y: 140, size: 12, weight: 500, color: 'ink' },
        ...dateWindow(225, 300),
        ...merHands({ shape: 'dauphine' }),
      ],
      aodLayers: merAOD(false),
      complications: [
        { id: 'SLOT-B5-1', label: 'Window at 6', shape: 'rect', x: 208, y: 287, w: 34, h: 26, types: ['SHORT_TEXT'], default: 'Date', options: 'Day+date, next event', fallback: 'Native token', empty: 'Native token', tap: 'Calendar' },
      ],
      settings: MER_SETTINGS('B5'),
      feasibility: [
        ...MER_FEAS(),
        { feature: 'Roman numerals', badge: 'NATIVE', mech: 'Static text elements, Marcellus 400 static file — tight-set, no letterspacing' },
      ],
      battery: MER_BATTERY,
      aodNote: 'Family AOD; romans do not survive to ambient (lit-pixel budget) — dots carry the geometry.',
      acceptance: [
        'Romans XII/III/VI/IX at r178, Marcellus 400 34px; intermediate hours are 1.6px dots',
        'Railway track: double ring r213/r205 with 60 ticks between',
        'Date window relocated to 6 o’clock (225,300)',
      ],
    },
  ],
};
