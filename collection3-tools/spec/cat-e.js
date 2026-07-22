/* CAT-E — AURUM ATELIER SERIES
   Evening luxury: guilloché, skeleton bridgework, gem-cut indices, gilt light.
   Design space: 450×450, center (225,225). All layers map to WFF v1 mechanisms.
   Textures shown as layered vector here ship as pre-rendered static dial images. */

const F_E = "'Marcellus', serif";   // numerals & brand (400 only)
const F_EL = "'Jost', sans-serif";  // small labels (300/400/500)

function T(id, name, desc, roles, finish, caseFinish) {
  return { id, name, desc, roles, finish, caseFinish };
}

const AURUM_SETTINGS = (fid) => ([
  { id: `SET-${fid}-THEME`, type: 'colorTheme', label: 'Colour theme', options: '5 swatch options (≤5 roles each)', default: 'Theme 01' },
  { id: `SET-${fid}-SECONDS`, type: 'toggle', label: 'Central seconds', options: 'on / off', default: 'off' },
  { id: `SET-${fid}-DATE`, type: 'toggle', label: 'Date display', options: 'on / off', default: 'on' },
  { id: `SET-${fid}-DARK`, type: 'toggle', label: 'Pure-black dark mode (universal light ink — strategy 5.2a)', options: 'on / off', default: 'off' },
]);

const AURUM_FEAS = () => ([
  { feature: 'Analog time', badge: 'NATIVE', mech: 'Clock hands from supplied artwork' },
  { feature: 'Guilloché / engine-turned texture', badge: 'NATIVE', mech: 'Pre-rendered static dial image per theme (the layered vectors in this prototype are the texture source art)' },
  { feature: 'Applied indices with facet light', badge: 'NATIVE', mech: 'Static artwork — light/dark facet pairs baked per theme' },
  { feature: 'Date at 6', badge: 'NATIVE', mech: 'Native day-number token' },
  { feature: 'Discreet event line', badge: 'PROVIDER', mech: 'SHORT_TEXT slot, next event default (v1-legal)' },
  { feature: 'Values shown in prototype', badge: 'SIMULATED', mech: 'Mock event/battery values' },
  { feature: 'Metallic shimmer in motion', badge: 'CUSTOM', mech: 'IMPOSSIBLE — no tilt/parallax source in WFF; the shimmer is baked into static texture and never animated' },
])

const AURUM_BATTERY = 'Two-hand faces with minute cadence throughout; seconds ship OFF by default. Texture is a single static image per theme — zero runtime cost. AOD ~5% lit.';

function aurumAOD() {
  return [
    { t: 'dots', r: 208, count: 12, dot: 1.8, color: 'muted' },
    { t: 'hand', kind: 'hour', len: 106, tail: 10, w: 3, shape: 'dauphine', color: 'ink' },
    { t: 'hand', kind: 'minute', len: 164, tail: 12, w: 2.2, shape: 'dauphine', color: 'ink' },
    { t: 'circle', r: 3.5, cx: 225, cy: 225, color: 'ink' },
    { t: 'text', token: 'hmm', x: 225, y: 328, size: 24, weight: 400, color: 'muted', font: F_EL },
  ];
}

function aurumHands(o) {
  o = o || {};
  return [
    { t: 'hand', kind: 'hour', len: 108, tail: 12, w: 6.5, shape: 'dauphine', color: o.color || 'accent', stroke: 'shade:bg:-0.5', sw: 0.8 },
    { t: 'hand', kind: 'minute', len: 172, tail: 16, w: 4.6, shape: 'dauphine', color: o.color || 'accent', stroke: 'shade:bg:-0.5', sw: 0.8 },
    { t: 'hand', kind: 'second', len: 184, tail: 28, w: 1.2, shape: 'needle', color: o.sec || 'ink', hub: 0 },
    { t: 'circle', r: 4.5, cx: 225, cy: 225, color: o.color || 'accent' },
    { t: 'circle', r: 1.6, cx: 225, cy: 225, color: 'bg' },
  ];
}

/* guilloché: concentric dot/ring lattice — prototype stand-in for the baked texture */
function guilloche(rMax, color) {
  const L = [];
  for (let r = 18; r <= rMax; r += 13) {
    L.push({ t: 'dots', r, count: Math.max(12, Math.round(r / 2.2)), dot: 0.9, color, opacity: 0.5 });
  }
  return L;
}

export const category = {
  id: 'CAT-E',
  name: 'AURUM',
  series: 'Atelier Series',
  apk: 'watchfaces.aurum.atelier',
  tagline: 'Haute-horlogerie light play for the evening wrist — engine-turned dials, gem-cut indices, gilt hands.',
  description: 'The prestige anchor of the portfolio. Every face is built around one crafted surface — guilloché lattice, skeleton bridgework, sunray lacquer — with restrained gilt information. Textures ship as pre-rendered per-theme dial images (zero runtime cost); nothing pretends to shimmer or move. This is the category buyers show to other people.',
  fonts: [
    { family: 'Marcellus', weights: [400], role: 'Numerals, brand' },
    { family: 'Jost', weights: [300, 400, 500], role: 'Small labels, AOD digits' },
  ],
  faces: [

    {
      id: 'WF-E1', name: 'Aurum Guilloché', tagline: 'Engine-turning, reborn.',
      concept: 'The flagship craft face: a full engine-turned dot lattice radiates from center, framed by a polished chapter ring with Marcellus numerals at 12 and 6. Dauphine hands in gilt. One whisper of date. Nothing else.',
      audience: 'The prestige buyer; gifting; evening wear.',
      wff: { version: 1, reason: 'No v2+ features required.' },
      fontStack: F_E,
      caseFinish: 'gold',
      themes: [
        T('TH-E1-01', 'Argent', 'Silver-white lattice, rhodium hands — light flagship.', { bg: '#dcd9d2', ink: '#2a2a2c', accent: '#6d6d72', muted: '#a09c93', lume: '#c2beb4' }, 'sunray', 'steel'),
        T('TH-E1-02', 'Or Noir', 'Black lacquer lattice, gilt hands, gold case.', { bg: '#101010', ink: '#e8e0cc', accent: '#c9a55c', muted: '#5a564c', lume: '#938c78' }, 'lacquer', 'gold'),
        T('TH-E1-03', 'Bleu Royale', 'Royal blue lattice, silver hands.', { bg: '#0e1526', ink: '#e6e7e4', accent: '#b8c0cc', muted: '#4c576e', lume: '#8e99ae' }, 'sunray', 'steel'),
        T('TH-E1-04', 'Émeraude', 'Emerald lattice, gilt hands.', { bg: '#0c1a13', ink: '#e6e3d4', accent: '#c8a45a', muted: '#4f6156', lume: '#96a494' }, 'sunray', 'gold'),
        T('TH-E1-05', 'Poudre', 'Powder-rose lattice, rose-gold hands.', { bg: '#221418', ink: '#eee2de', accent: '#d1907c', muted: '#6b565c', lume: '#b09298' }, 'lacquer', 'rose'),
      ],
      lightThemeIndex: 0,
      layers: [
        { t: 'dial', color: 'bg' },
        ...guilloche(150, 'muted'),
        { t: 'ring', r: 160, w: 1, color: 'muted', opacity: 0.8 },
        { t: 'ring', r: 186, w: 30, color: 'shade:bg:-0.12' },
        { t: 'ticks', r: 214, count: 60, len: 6, w: 0.9, color: 'muted' },
        { t: 'ticks', r: 216, count: 12, len: 14, w: 2, color: 'ink' },
        { t: 'numerals', vals: ['XII', null, null, null, null, null, 'VI', null, null, null, null, null], r: 186, size: 30, weight: 400, color: 'ink', font: F_E },
        { t: 'dots', r: 186, count: 12, dot: 2.2, color: 'accent', skipEvery: 6 },
        { t: 'label', text: 'AURUM', x: 225, y: 148, size: 15, weight: 400, color: 'ink', font: F_E },
        { t: 'text', token: 'dnum', x: 225, y: 296, size: 15, weight: 400, color: 'ink', font: F_EL },
        { t: 'label', text: '·', x: 225, y: 282, size: 12, weight: 400, color: 'accent' },
        ...aurumHands(),
      ],
      aodLayers: aurumAOD(),
      complications: [
        // W1.1 default fix (audit F2): the prose 'native token' used to map this slot to
        // EMPTY/EMPTY — nothing at all out of the box. DATE is a safe first-install source.
        { id: 'SLOT-E1-1', label: 'Whisper date', shape: 'rect', x: 200, y: 284, w: 50, h: 24, types: ['SHORT_TEXT'], defaultProvider: 'DATE', default: 'Date (native token)', options: 'Day+date, next event', fallback: 'Native token', empty: 'Hidden via SET-E1-DATE', tap: 'Calendar' },
      ],
      settings: AURUM_SETTINGS('E1'),
      feasibility: AURUM_FEAS(),
      battery: AURUM_BATTERY,
      aodNote: 'Dauphine ghosts + 12 dots + thin h:mm. Lattice never renders in ambient. ~5% lit.',
      acceptance: [
        'Lattice rings every 13px from r18 to r150, dot 0.9px at 50% opacity (baked image in production)',
        'Chapter ring 30px wide centered r186 at −12% shade',
        'Numerals only XII and VI, Marcellus 400 30px; other hours are 2.2px gilt dots',
      ],
    },

    {
      id: 'WF-E2', name: 'Aurum Squelette', tagline: 'The movement, imagined.',
      concept: 'An openworked composition: layered bridge rings, polished screws, and a deep central well suggest a movement beneath — all static baked art, honestly decorative. Gilt Breguet-style numerals at 12/3/9; the 6 position opens into the deepest visual layer.',
      audience: 'Mechanical-watch romantics who went smart.',
      wff: { version: 1, reason: 'No v2+ features required.' },
      fontStack: F_E,
      caseFinish: 'gold',
      themes: [
        T('TH-E2-01', 'Ivoire Ajouré', 'Bone plates, rhodium bridges — light flagship.', { bg: '#d8d4c8', ink: '#2c2a26', accent: '#8a6c3c', muted: '#a29c8c', lume: '#c0bab0' }, 'matte', 'gold'),
        T('TH-E2-02', 'Noir Ajouré', 'Charcoal plates, gilt bridges.', { bg: '#131211', ink: '#e7e0ce', accent: '#c8a256', muted: '#575349', lume: '#8f8874' }, 'matte', 'gold'),
        T('TH-E2-03', 'Anthracite Ajouré', 'Graphite plates, steel bridges, red jewel.', { bg: '#161718', ink: '#e8e7e2', accent: '#b8434a', muted: '#5c5d5f', lume: '#96979a' }, 'brushed', 'steel'),
        T('TH-E2-04', 'Marine Ajouré', 'Navy plates, rose bridges.', { bg: '#0f1420', ink: '#e7e6e0', accent: '#cf9a80', muted: '#4d566a', lume: '#909aad' }, 'matte', 'rose'),
        T('TH-E2-05', 'Champagne Ajouré', 'Champagne plates, umber bridges.', { bg: '#c9b988', ink: '#312717', accent: '#8f5f2a', muted: '#9c8c68', lume: '#b8a982' }, 'sunray', 'gold'),
      ],
      lightThemeIndex: 0,
      layers: [
        { t: 'dial', color: 'bg' },
        { t: 'ring', r: 150, w: 44, color: 'shade:bg:-0.3' },
        { t: 'ring', r: 128, w: 1, color: 'shade:bg:0.15', opacity: 0.6 },
        { t: 'ring', r: 172, w: 1, color: 'shade:bg:0.15', opacity: 0.6 },
        { t: 'circle', r: 96, cx: 225, cy: 225, color: 'shade:bg:-0.45' },
        ...guilloche(88, 'shade:bg:0.18'),
        { t: 'ring', r: 96, w: 2, color: 'shade:bg:0.1' },
        { t: 'screw', cx: 225, cy: 90, r: 6, a: 20 },
        { t: 'screw', cx: 108, cy: 292, r: 6, a: -40 },
        { t: 'screw', cx: 342, cy: 292, r: 6, a: 65 },
        { t: 'ticks', r: 218, count: 60, len: 7, w: 1, color: 'muted' },
        { t: 'ticks', r: 220, count: 12, len: 14, w: 2.2, color: 'ink' },
        { t: 'numerals', vals: ['12', null, null, '3', null, null, null, null, null, '9', null, null], r: 192, size: 26, weight: 400, color: 'accent', font: F_E },
        { t: 'label', text: 'AURUM', x: 225, y: 130, size: 13, weight: 400, color: 'ink', font: F_E },
        { t: 'label', text: 'SQUELETTE', x: 225, y: 146, size: 8, weight: 500, color: 'muted', font: F_EL },
        { t: 'circle', r: 3.2, cx: 225, cy: 322, color: 'accent' },
        { t: 'text', token: 'dnum', x: 225, y: 344, size: 14, weight: 400, color: 'ink', font: F_EL },
        ...aurumHands(),
      ],
      aodLayers: aurumAOD(),
      complications: [
        { id: 'SLOT-E2-1', label: 'Jewel window (date)', shape: 'rect', x: 200, y: 330, w: 50, h: 24, types: ['SHORT_TEXT'], default: 'Date', options: 'Day+date', fallback: 'Native token', empty: 'Hidden', tap: 'Calendar' },
      ],
      settings: AURUM_SETTINGS('E2'),
      feasibility: [
        ...AURUM_FEAS(),
        { feature: 'Moving balance wheel / gears', badge: 'CUSTOM', mech: 'IMPOSSIBLE as live motion (§2 — no property animation); the movement is baked still art and is presented as such' },
      ],
      battery: AURUM_BATTERY,
      aodNote: 'Family AOD; all bridgework drops — silhouette carried by 12 dots.',
      acceptance: [
        'Bridge ring: 44px annulus at r150 (−30%), central well r96 (−45%) with lattice inside',
        'Three screws at (225,90)/(108,292)/(342,292) r6',
        'Numerals 12/3/9 only, gilt accent role, Marcellus 26px; 6 stays open',
      ],
    },

    {
      id: 'WF-E3', name: 'Aurum Soir', tagline: 'The hour of aperitifs.',
      concept: 'A deep sunray lacquer dial with a single luxurious data gesture: a gilt crescent arc at the top that quietly fills toward sunset — evening as a complication. Slim batons, a hairline rehaut, date on the lower axis.',
      audience: 'Evening-first wearers; the AURUM entry point.',
      wff: { version: 1, reason: 'No v2+ features required.' },
      fontStack: F_E,
      caseFinish: 'gold',
      themes: [
        T('TH-E3-01', 'Heure Bleue', 'Twilight-blue sunray, gilt crescent.', { bg: '#0d1422', ink: '#e7e7e2', accent: '#cda85e', muted: '#4d586e', lume: '#93a0b8' }, 'sunray', 'gold'),
        T('TH-E3-02', 'Blanc Cassé', 'Off-white sunray, bronze crescent — light flagship.', { bg: '#ded9cc', ink: '#28251f', accent: '#a8783c', muted: '#a19a88', lume: '#c4bda9' }, 'sunray', 'gold'),
        T('TH-E3-03', 'Merlot', 'Black-cherry sunray, rose crescent.', { bg: '#1d0e13', ink: '#ede0dd', accent: '#d3937e', muted: '#66505a', lume: '#ab9098' }, 'sunray', 'rose'),
        T('TH-E3-04', 'Forêt', 'Black-forest sunray, brass crescent.', { bg: '#0d1710', ink: '#e5e2d3', accent: '#bfa050', muted: '#4f5e54', lume: '#95a293' }, 'sunray', 'gold'),
        T('TH-E3-05', 'Graphite Soir', 'Smoked graphite, silver crescent.', { bg: '#141517', ink: '#e9e8e6', accent: '#aeb2ba', muted: '#5a5c60', lume: '#a3a6ad' }, 'sunray', 'steel'),
      ],
      lightThemeIndex: 1,
      layers: [
        { t: 'dial', color: 'bg' },
        { t: 'ring', r: 220, w: 1, color: 'muted' },
        { t: 'ticks', r: 219, count: 12, len: 11, w: 1.8, color: 'ink' },
        { t: 'arc', r: 196, w: 5, from: -55, to: 55, color: 'accent', data: 'day', track: 'muted', trackOpacity: 0.25, cap: 'round' },
        { t: 'icon', name: 'sun', x: 122, y: 120, s: 8, color: 'muted' },
        { t: 'icon', name: 'moon', x: 328, y: 120, s: 8, color: 'accent', filled: true },
        { t: 'text', token: 'sunset', x: 225, y: 110, size: 13, weight: 400, color: 'accent', font: F_EL },
        { t: 'label', text: 'AURUM', x: 225, y: 158, size: 14, weight: 400, color: 'ink', font: F_E },
        { t: 'label', text: 'SOIR', x: 225, y: 174, size: 8.5, weight: 500, color: 'muted', font: F_EL },
        { t: 'text', token: 'day3', x: 196, y: 306, size: 12, weight: 400, color: 'muted', font: F_EL },
        { t: 'text', token: 'dnum', x: 246, y: 306, size: 15, weight: 500, color: 'ink', font: F_EL },
        ...aurumHands({ color: 'ink', sec: 'accent' }),
      ],
      aodLayers: aurumAOD(),
      complications: [
        { id: 'SLOT-E3-1', label: 'Sunset figure', shape: 'rect', x: 190, y: 98, w: 70, h: 24, types: ['SHORT_TEXT'], default: 'Sunset (v1-legal)', options: 'Sunrise, world clock', fallback: '—', empty: 'Hidden', tap: 'Provider app' },
        { id: 'SLOT-E3-2', label: 'Lower pair (date)', shape: 'rect', x: 178, y: 292, w: 94, h: 26, types: ['SHORT_TEXT'], default: 'Day + date', options: 'Next event', fallback: 'Native tokens', empty: 'Native tokens', tap: 'Calendar' },
      ],
      settings: AURUM_SETTINGS('E3'),
      feasibility: AURUM_FEAS(),
      battery: AURUM_BATTERY,
      aodNote: 'Family AOD; the crescent survives as a hairline muted arc (minute cadence).',
      acceptance: [
        'Crescent arc −55°→55° at r196 w5, gilt accent, sun/moon terminals at (122,120)/(328,120)',
        'Sunset figure centered at (225,110) in accent',
        'Hands are ink-coloured with accent seconds (inverted from family default)',
      ],
    },

    {
      id: 'WF-E4', name: 'Aurum Baguette', tagline: 'Twelve stones of light.',
      concept: 'Jewelled minimalism: twelve gem-cut baguette indices — each a two-facet polygon with baked light/dark faces — on a velvet-black ground. The dial is the jewellery; time is told by gilt dauphines gliding over the stones.',
      audience: 'Jewellery-first buyers; the dress-event face.',
      wff: { version: 1, reason: 'No v2+ features required.' },
      fontStack: F_E,
      caseFinish: 'gold',
      themes: [
        T('TH-E4-01', 'Diamant', 'Ice stones on velvet black.', { bg: '#0d0d0e', ink: '#eceae4', accent: '#cfd4dc', muted: '#55555a', lume: '#b8bcc6' }, 'matte', 'steel'),
        T('TH-E4-02', 'Citrine', 'Warm gold stones, gold case.', { bg: '#100f0c', ink: '#ece5d2', accent: '#d4ac52', muted: '#5c574a', lume: '#c0a870' }, 'matte', 'gold'),
        T('TH-E4-03', 'Saphir', 'Blue stones, rhodium hands.', { bg: '#0c1018', ink: '#e8e9ea', accent: '#7c9cd4', muted: '#4e5566', lume: '#a4b4d4' }, 'matte', 'steel'),
        T('TH-E4-04', 'Rubis', 'Red stones, rose case.', { bg: '#120c0e', ink: '#eee4e0', accent: '#cc6a70', muted: '#5e5054', lume: '#c39498' }, 'matte', 'rose'),
        T('TH-E4-05', 'Perle', 'Pearl-grey ground, white stones — light flagship.', { bg: '#d6d3cc', ink: '#232324', accent: '#8e8e96', muted: '#a09d94', lume: '#bebbb2' }, 'lacquer', 'steel'),
      ],
      lightThemeIndex: 4,
      layers: [
        { t: 'dial', color: 'bg' },
        { t: 'dots', r: 214, count: 60, dot: 0.8, color: 'muted', skipEvery: 5, opacity: 0.7 },
        /* 12 baguette stones: two-facet pairs */
        ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].flatMap((i) => {
          const a = i * 30;
          return [
            { t: 'poly', points: '-5,-22 5,-22 5,0 -5,0', color: 'accent', transform: `translate(${225 + 196 * Math.sin(a * Math.PI / 180)} ${225 - 196 * Math.cos(a * Math.PI / 180)}) rotate(${a})` },
            { t: 'poly', points: '-5,0 5,0 5,22 -5,22', color: 'shade:accent:-0.45', transform: `translate(${225 + 196 * Math.sin(a * Math.PI / 180)} ${225 - 196 * Math.cos(a * Math.PI / 180)}) rotate(${a})` },
          ];
        }),
        { t: 'label', text: 'AURUM', x: 225, y: 150, size: 13, weight: 400, color: 'ink', font: F_E },
        { t: 'text', token: 'dnum', x: 225, y: 302, size: 14, weight: 400, color: 'muted', font: F_EL },
        ...aurumHands(),
      ],
      aodLayers: aurumAOD(),
      complications: [
        { id: 'SLOT-E4-1', label: 'Whisper date', shape: 'rect', x: 200, y: 290, w: 50, h: 24, types: ['SHORT_TEXT'], default: 'Date', options: 'Day+date', fallback: 'Native token', empty: 'Hidden', tap: 'Calendar' },
      ],
      settings: AURUM_SETTINGS('E4'),
      feasibility: [
        ...AURUM_FEAS(),
        { feature: 'Stone sparkle animation', badge: 'CUSTOM', mech: 'IMPOSSIBLE live (§2) — facet contrast is baked; an optional tap-triggered animated WebP glint was costed and cut (§3, memory)' },
      ],
      battery: AURUM_BATTERY,
      aodNote: 'Family AOD; stones reduce to 12 muted dots in ambient.',
      acceptance: [
        'Stones: 10×44 two-facet baguettes at r196, top facet accent, lower facet −45% shade',
        'Ground is velvet matte (no sunray) except Perle theme (lacquer)',
        'Minute dots 0.8px with every 5th skipped for stone clearance',
      ],
    },

    {
      id: 'WF-E5', name: 'Aurum Éclat', tagline: 'One ray of morning.',
      concept: 'The purest AURUM: a monumental sunray dial where a single polished index at 12 anchors the geometry, Marcellus ‘XII’ engraved beneath it. A slim gilt battery crescent hides on the lower rehaut, off by default. Designed to be the most beautiful empty circle in the store.',
      audience: 'Understated-luxury buyers; the "clean but expensive" segment.',
      wff: { version: 1, reason: 'No v2+ features required.' },
      fontStack: F_E,
      caseFinish: 'gold',
      themes: [
        T('TH-E5-01', 'Aube', 'Dawn-silver sunray — light flagship.', { bg: '#d9d6ce', ink: '#26262a', accent: '#a8823f', muted: '#9f9a8e', lume: '#c1bcb0' }, 'sunray', 'gold'),
        T('TH-E5-02', 'Minuit', 'Black-blue sunray, gilt index.', { bg: '#0d1119', ink: '#e8e8e4', accent: '#caa452', muted: '#4d5462', lume: '#929bae' }, 'sunray', 'gold'),
        T('TH-E5-03', 'Cognac', 'Smoked cognac sunray, cream ink.', { bg: '#241206', ink: '#eee0cc', accent: '#d29a44', muted: '#75593c', lume: '#c2a074' }, 'sunray', 'gold'),
        T('TH-E5-04', 'Améthyste', 'Deep violet sunray, silver index.', { bg: '#150f1e', ink: '#eae6ee', accent: '#b0a6c4', muted: '#584f68', lume: '#a298b4' }, 'sunray', 'steel'),
        T('TH-E5-05', 'Olive Or', 'Smoked olive sunray, gilt index.', { bg: '#14150c', ink: '#e8e6d6', accent: '#c3a24e', muted: '#5c5c48', lume: '#a2a184' }, 'sunray', 'gold'),
      ],
      lightThemeIndex: 0,
      layers: [
        { t: 'dial', color: 'bg' },
        { t: 'ticks', r: 220, count: 60, len: 5, w: 0.8, color: 'muted', opacity: 0.8 },
        { t: 'poly', points: '219,20 231,20 228,58 222,58', color: 'accent' },
        { t: 'poly', points: '219,20 225,20 225,58 222,58', color: 'shade:accent:0.25' },
        { t: 'label', text: 'XII', x: 225, y: 82, size: 24, weight: 400, color: 'ink', font: F_E },
        { t: 'label', text: 'AURUM', x: 225, y: 168, size: 14, weight: 400, color: 'ink', font: F_E },
        { t: 'label', text: 'ÉCLAT', x: 225, y: 185, size: 8.5, weight: 500, color: 'muted', font: F_EL },
        { t: 'arc', r: 206, w: 3, from: 158, to: 202, color: 'accent', data: 'battery', track: 'muted', trackOpacity: 0.2, cap: 'round' },
        { t: 'text', token: 'dnum', x: 225, y: 300, size: 14, weight: 400, color: 'muted', font: F_EL },
        ...aurumHands(),
      ],
      aodLayers: aurumAOD(),
      complications: [
        { id: 'SLOT-E5-1', label: 'Whisper date', shape: 'rect', x: 200, y: 288, w: 50, h: 24, types: ['SHORT_TEXT'], default: 'Date', options: 'Day+date, next event', fallback: 'Native token', empty: 'Hidden', tap: 'Calendar' },
      ],
      settings: AURUM_SETTINGS('E5'),
      feasibility: AURUM_FEAS(),
      battery: AURUM_BATTERY,
      aodNote: 'Family AOD — the single index does not survive ambient; geometry carried by dots.',
      acceptance: [
        'Applied index 12×38 two-facet at 12 with XII engraved beneath (Marcellus 24px, y82)',
        'Battery crescent 158°→202° at r206 renders only when SET-E5-BATT/date toggle allows',
        'Sunray finish mandatory on all five themes',
      ],
    },
  ],
};
