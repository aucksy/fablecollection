// Shared helpers for the Fable Collection asset generator (resvg-based).
// All face geometry is authored in the design handoff's 300×300 space; art is
// baked at 2× (600-space) for crispness and previews render at 450 px.

import { Resvg } from '@resvg/resvg-js';
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(__dirname, '../..');
const FONT_DIR = resolve(ROOT, 'tools/fonts');
const FONT_FILES = readdirSync(FONT_DIR).filter(f => f.endsWith('.ttf')).map(f => resolve(FONT_DIR, f));

// Preview time = 10:08:32 (matches PREVIEW_TIME metadata in every watchface.xml)
export const T = {
  hh: '10', mm: '08', hourDeg: 304, minDeg: 51.2, secDeg: 192,
  dateLine: 'FRI 11', ampm: 'AM',
  fullDate: 'FRIDAY · JULY 11 · 2026', dateNum: '11',
};

// Showcase sample complication values (from the design handoff)
export const COMPS = {
  HR: { label: 'HEART RATE', value: '62', pct: 0.62 },
  STEPS: { label: 'STEPS', value: '8,432', pct: 0.84 },
  BATTERY: { label: 'BATTERY', value: '78%', pct: 0.78 },
  OUTSIDE: { label: 'OUTSIDE', value: '72°', pct: 0.72 },
  CALORIES: { label: 'CALORIES', value: '486', pct: 0.49 },
  DISTANCE: { label: 'DISTANCE KM', value: '6.2', pct: 0.62 },
  SUNSET: { label: 'SUNSET', value: '8:42', pct: 0.86 },
  NEXT_EVENT: { label: 'NEXT EVENT', value: '9:30', pct: 0.4 },
  ALARM: { label: 'ALARM', value: '6:30', pct: 0.27 },
};

// Font family names as used in SVG (mapped by resvg from the TTF name tables)
export const F = {
  barlow: 'Barlow Condensed',
  archivo: 'Archivo',
  mono: 'IBM Plex Mono',
  cormorant: 'Cormorant Garamond',
  marcellus: 'Marcellus',
};

export function render(svg, outPath, widthPx) {
  const r = new Resvg(svg, {
    background: 'rgba(0,0,0,0)',
    fitTo: { mode: 'width', value: widthPx },
    font: {
      loadSystemFonts: false,
      fontDirs: [FONT_DIR],
      fontFiles: FONT_FILES,
      defaultFontFamily: 'Archivo',
    },
  });
  const png = r.render().asPng();
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, png);
  console.log(`  ${outPath.replace(ROOT + '\\', '').replace(ROOT + '/', '')}  (${(png.length / 1024).toFixed(1)} KB @ ${widthPx}px)`);
}

// Bake a piece of face art authored in a wpx×hpx box, rendered at 2× into the
// face's drawable-nodpi directory.
export function art(faceDir, name, wpx, hpx, inner) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${wpx}" height="${hpx}" viewBox="0 0 ${wpx} ${hpx}">${inner}</svg>`;
  render(svg, resolve(ROOT, faceDir, 'app/src/main/res/drawable-nodpi', `${name}.png`), wpx * 2);
}

// Render the 300-space preview SVG → preview.png (450px) + ic_launcher.png (192px).
export function preview(faceDir, inner) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <defs><clipPath id="dial"><circle cx="150" cy="150" r="150"/></clipPath></defs>
  <g clip-path="url(#dial)">${inner}</g>
</svg>`;
  render(svg, resolve(ROOT, faceDir, 'app/src/main/res/drawable-nodpi/preview.png'), 450);
  render(svg, resolve(ROOT, faceDir, 'app/src/main/res/drawable/ic_launcher.png'), 192);
}

// Convenience text helper for preview SVGs.
// ls is CSS letter-spacing in px (at the given size).
export function txt(x, y, str, { size, family = F.archivo, weight = 600, fill = '#FFFFFF', ls = 0, anchor = 'middle', style = '' } = {}) {
  const esc = String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return `<text x="${x}" y="${y}" fill="${fill}" text-anchor="${anchor}" font-family="${family}" font-weight="${weight}" font-size="${size}"${ls ? ` letter-spacing="${ls}"` : ''}${style ? ` style="${style}"` : ''}>${esc}</text>`;
}

// A slot readout (value over micro-caps label), centered.
export function slotText(x, yValue, comp, { valueSize = 14, valueFont = F.mono, valueWeight = 500, valueFill = '#EDE7DA', labelSize = 7, labelFill = '#6B6858', labelLs = 1.5, gap = 4, anchor = 'middle' } = {}) {
  return txt(x, yValue, comp.value, { size: valueSize, family: valueFont, weight: valueWeight, fill: valueFill, anchor })
    + txt(x, yValue + labelSize + gap, comp.label, { size: labelSize, family: F.archivo, weight: 600, fill: labelFill, ls: labelLs, anchor });
}

// Ease-in-out (matches CSS ease-in-out closely enough for frame baking)
export const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// Annular sector path (for turbine blades etc.), angles in degrees, 0° = 12 o'clock, clockwise.
export function annularSector(cx, cy, rIn, rOut, a0, a1) {
  const p = (r, a) => {
    const rad = (a - 90) * Math.PI / 180;
    return `${(cx + r * Math.cos(rad)).toFixed(2)} ${(cy + r * Math.sin(rad)).toFixed(2)}`;
  };
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${p(rOut, a0)} A ${rOut} ${rOut} 0 ${large} 1 ${p(rOut, a1)} L ${p(rIn, a1)} A ${rIn} ${rIn} 0 ${large} 0 ${p(rIn, a0)} Z`;
}
