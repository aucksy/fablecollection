// Face registry — binds the canonical spec data (tools/spec/cat-*.js, verbatim from
// the design handoff) to per-face packaging facts from 01-naming-and-traceability.md.
// One face = one APK (§5.1). Dir naming follows the Fable Collection convention
// <Series>-<Face>/ ; tags are <dir-lowercase>-vX.Y.Z.

import { category as catA } from '../spec/cat-a2.js';
import { category as catB } from '../spec/cat-b.js';
import { category as catC } from '../spec/cat-c.js';
import { category as catD } from '../spec/cat-d.js';
import { category as catE } from '../spec/cat-e.js';

export const CATS = [catA, catB, catC, catD, catE];

// AOD constants (02-design-tokens.md) — fixed, theme-independent.
export const AOD_INK = '#d8d4cc';
export const AOD_MUT = '#8f8877';
// Dark-mode (§5.2a universal-readable): fixed light ink on pure black.
export const DARK_ROLES = { bg: '#000000', ink: AOD_INK, accent: AOD_INK, muted: AOD_MUT, lume: AOD_INK };
export const AOD_ROLES  = { bg: '#000000', ink: AOD_INK, accent: AOD_INK, muted: AOD_MUT, lume: AOD_MUT };

// APK ids from 01-naming-and-traceability.md (exact, including 'aurumguilloch'/'aurumclat').
const PKG = {
  'WF-A1': ['Vakt-One',                'watchfaces.vakt.instrument.vaktone'],
  'WF-A2': ['Vakt-GT',                 'watchfaces.vakt.instrument.vaktgt'],
  'WF-A3': ['Vakt-Meridian',           'watchfaces.vakt.instrument.vaktmeridian'],
  'WF-A4': ['Vakt-Ti',                 'watchfaces.vakt.instrument.vaktti'],
  'WF-A5': ['Vakt-NightWatch',         'watchfaces.vakt.instrument.vaktnightwatch'],
  'WF-B1': ['Meridian-Classic',        'watchfaces.meridian.dress.meridianclassic'],
  'WF-B2': ['Meridian-Sector',         'watchfaces.meridian.dress.meridiansector'],
  'WF-B3': ['Meridian-PetiteSeconde',  'watchfaces.meridian.dress.meridianpetiteseconde'],
  'WF-B4': ['Meridian-Calendrier',     'watchfaces.meridian.dress.meridiancalendrier'],
  'WF-B5': ['Meridian-Roman',          'watchfaces.meridian.dress.meridianroman'],
  'WF-C1': ['Terra-Field24',           'watchfaces.terra.expedition.terrafield24'],
  'WF-C2': ['Terra-Solstice',          'watchfaces.terra.expedition.terrasolstice'],
  'WF-C3': ['Terra-Compass',           'watchfaces.terra.expedition.terracompass'],
  'WF-C4': ['Terra-Altimeter',         'watchfaces.terra.expedition.terraaltimeter'],
  'WF-C5': ['Terra-MeridianLine',      'watchfaces.terra.expedition.terrameridianline'],
  'WF-D1': ['Halo-Stack',              'watchfaces.halo.type.halostack'],
  'WF-D2': ['Halo-Beacon',             'watchfaces.halo.type.halobeacon'],
  'WF-D3': ['Halo-Quadrant',           'watchfaces.halo.type.haloquadrant'],
  'WF-D4': ['Halo-Orbit',              'watchfaces.halo.type.haloorbit'],
  'WF-D5': ['Halo-Ledger',             'watchfaces.halo.type.haloledger'],
  'WF-E1': ['Aurum-Guilloche',         'watchfaces.aurum.atelier.aurumguilloch'],
  'WF-E2': ['Aurum-Squelette',         'watchfaces.aurum.atelier.aurumsquelette'],
  'WF-E3': ['Aurum-Soir',              'watchfaces.aurum.atelier.aurumsoir'],
  'WF-E4': ['Aurum-Baguette',          'watchfaces.aurum.atelier.aurumbaguette'],
  'WF-E5': ['Aurum-Eclat',             'watchfaces.aurum.atelier.aurumclat'],
};

// Spec fontStack CSS string → { svg family name, WFF res/font file prefix }
export const FONT_MAP = {
  'Archivo':               { svg: 'Archivo',               res: 'archivo' },
  'Saira SemiCondensed':   { svg: 'Saira Semi Condensed',  res: 'sairasemicondensed' },
  'Jost':                  { svg: 'Jost',                  res: 'jost' },
  'Marcellus':             { svg: 'Marcellus',             res: 'marcellus' },
  'Barlow SemiCondensed':  { svg: 'Barlow Semi Condensed', res: 'barlowsemicondensed' },
  'Space Grotesk':         { svg: 'Space Grotesk',         res: 'spacegrotesk' },
  'Big Shoulders Display': { svg: 'Big Shoulders Display', res: 'bigshouldersdisplay' },
};
// Weights actually shipped per family (matching tools/fonts/*.ttf)
export const FONT_WEIGHTS = {
  archivo: [500, 600, 700],
  sairasemicondensed: [600, 700],
  jost: [300, 400, 500, 600],
  marcellus: [400],
  barlowsemicondensed: [500, 600, 700],
  spacegrotesk: [500, 700],
  bigshouldersdisplay: [400, 600, 800],
};

export function fontFromStack(stack) {
  const m = /'([^']+)'/.exec(stack || '');
  const fam = m ? m[1] : 'Archivo';
  return FONT_MAP[fam] || FONT_MAP['Archivo'];
}
// Snap a requested weight to the nearest shipped file for the family.
export function snapWeight(res, w) {
  const avail = FONT_WEIGHTS[res] || [400];
  let best = avail[0];
  for (const a of avail) if (Math.abs(a - (w || 500)) < Math.abs(best - (w || 500))) best = a;
  return best;
}

export const FACES = [];
for (const cat of CATS) {
  for (const face of cat.faces) {
    const [dir, appId] = PKG[face.id];
    FACES.push({
      cat, face, dir, appId,
      slug: dir.toLowerCase(),
      label: face.name,                       // launcher label
      appName: `${cat.name === face.name.split(' ')[0].toUpperCase() ? '' : ''}${face.name}`,
    });
  }
}

export function getFace(idOrSlug) {
  const k = idOrSlug.toLowerCase();
  return FACES.find(f => f.face.id.toLowerCase() === k || f.slug === k || f.dir.toLowerCase() === k);
}
