// SETTYPE series baked art + previews (Counterform, Masthead, Marquee, Halftone).
import { art, preview, txt, T, COMPS, F } from './lib.mjs';

// Halftone glyph cell geometry (1× units): advance 75, line cell 106,
// baseline at 92.4 inside the cell (Archivo asc .878/desc .21, line-height 0.9).
const HT = { w: 75, h: 106, base: 92.4 };

// ============================ 04·B COUNTERFORM ============================
{
  const DIR = 'Settype-Counterform';
  const A = '#FF5C3D';
  preview(DIR, `
    <rect width="300" height="300" fill="#08080A"/>
    <text x="-14" y="110" font-family="Archivo" font-weight="900" font-size="195" letter-spacing="-10" fill="${A}">10</text>
    <text x="312" y="290" text-anchor="end" font-family="Archivo" font-weight="900" font-size="195" letter-spacing="-10" fill="none" stroke="#ECE9E2" stroke-width="2">08</text>
    ${txt(236, 32, `${T.hh}:${T.mm}`, { size: 11, family: F.mono, weight: 500, fill: 'rgba(236,233,226,.6)', anchor: 'end' })}
    <text x="42" y="60" font-family="Archivo" font-weight="600" font-size="8" letter-spacing="2" fill="rgba(236,233,226,.4)" transform="rotate(90 42 60)">${T.dateLine}</text>
    ${txt(34, 168, COMPS.STEPS.value, { size: 15, family: F.barlow, weight: 600, fill: '#ECE9E2', anchor: 'start' })}
    ${txt(34, 178, COMPS.STEPS.label, { size: 6.5, family: F.archivo, weight: 600, fill: 'rgba(236,233,226,.4)', ls: 1.5, anchor: 'start' })}
    ${txt(34, 200, COMPS.BATTERY.value, { size: 15, family: F.barlow, weight: 600, fill: '#ECE9E2', anchor: 'start' })}
    ${txt(34, 210, COMPS.BATTERY.label, { size: 6.5, family: F.archivo, weight: 600, fill: 'rgba(236,233,226,.4)', ls: 1.5, anchor: 'start' })}
  `);
}

// ============================= 04·C MASTHEAD =============================
{
  const DIR = 'Settype-Masthead';
  const INK = '#171512';
  preview(DIR, `
    <rect width="300" height="300" fill="#EFE9DC"/>
    <defs><path id="arc12" d="M 34 150 A 116 116 0 0 1 266 150"/></defs>
    <text font-family="Archivo" font-weight="600" font-size="9.5" letter-spacing="3" fill="#8A8578">
      <textPath href="#arc12" startOffset="50%" text-anchor="middle">${T.fullDate}</textPath>
    </text>
    <rect x="56" y="64" width="188" height="2" fill="${INK}"/>
    ${txt(150, 79, 'THE PRESENT HOUR', { size: 10, family: F.archivo, weight: 600, fill: INK, ls: 4 })}
    <rect x="76" y="86" width="148" height="1" fill="rgba(23,21,18,.3)"/>
    ${txt(150, 156, `${T.hh}:${T.mm}`, { size: 78, family: F.cormorant, weight: 600, fill: INK })}
    ${txt(150, 193, `— as of this very ${T.ampm} —`, { size: 12, family: F.cormorant, weight: 500, fill: '#5E5648', style: 'font-style:italic' })}
    <rect x="64" y="206" width="172" height="1" fill="rgba(23,21,18,.25)"/>
    ${txt(96, 226, COMPS.STEPS.label, { size: 8, family: F.archivo, weight: 600, fill: '#8A8578', ls: 1.5, anchor: 'end' })}
    ${txt(102, 226, COMPS.STEPS.value, { size: 12, family: F.cormorant, weight: 700, fill: INK, anchor: 'start' })}
    <rect x="150" y="216" width="1" height="14" fill="rgba(23,21,18,.2)"/>
    ${txt(158, 226, COMPS.NEXT_EVENT.label, { size: 8, family: F.archivo, weight: 600, fill: '#8A8578', ls: 1.5, anchor: 'start' })}
    ${txt(226, 226, COMPS.NEXT_EVENT.value, { size: 12, family: F.cormorant, weight: 700, fill: INK, anchor: 'start' })}
    ${txt(150, 266, `VOL. XXVI · No. ${T.dateNum}`, { size: 8, family: F.mono, weight: 500, fill: '#8A8578' })}
  `);
}

// ============================== 04·D MARQUEE ==============================
{
  const DIR = 'Settype-Marquee';
  const A = '#FFC978';

  // Bulb sprite: white 6px bulb + warm glow, tinted at runtime.
  art(DIR, 'bulb', 28, 28, `
    <defs><radialGradient id="bg2"><stop offset=".2" stop-color="rgba(255,255,255,.5)"/><stop offset=".55" stop-color="rgba(255,255,255,.15)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient></defs>
    <circle cx="14" cy="14" r="12" fill="url(#bg2)"/>
    <circle cx="14" cy="14" r="3" fill="#FFFFFF"/>`);

  const bulbs = [];
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * Math.PI * 2;
    const x = 150 + 130 * Math.sin(a), y = 150 - 130 * Math.cos(a);
    bulbs.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="rgba(255,201,120,.18)"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="${A}"/>`);
  }
  preview(DIR, `
    <defs><radialGradient id="mbg" cx=".5" cy=".42" r=".9"><stop offset="0" stop-color="#191008"/><stop offset=".68" stop-color="#0B0705"/><stop offset="1" stop-color="#0B0705"/></radialGradient></defs>
    <rect width="300" height="300" fill="url(#mbg)"/>
    ${bulbs.join('')}
    ${txt(150, 83, 'NOW SHOWING', { size: 11, family: F.archivo, weight: 600, fill: A, ls: 5 })}
    ${txt(150, 156, `${T.hh}:${T.mm}`, { size: 74, family: F.barlow, weight: 700, fill: '#F6EBD8' })}
    <rect x="90" y="178" width="120" height="1" fill="rgba(246,235,216,.25)"/>
    ${txt(150, 194, `${T.dateLine} · ${T.ampm}`, { size: 9, family: F.archivo, weight: 600, fill: 'rgba(246,235,216,.55)', ls: 3 })}
    ${txt(146, 244, COMPS.NEXT_EVENT.label, { size: 8, family: F.archivo, weight: 600, fill: 'rgba(246,235,216,.45)', ls: 2, anchor: 'end' })}
    ${txt(152, 244, COMPS.NEXT_EVENT.value, { size: 13, family: F.barlow, weight: 600, fill: '#F6EBD8', anchor: 'start' })}
    ${txt(146, 262, COMPS.BATTERY.label, { size: 8, family: F.archivo, weight: 600, fill: 'rgba(246,235,216,.45)', ls: 2, anchor: 'end' })}
    ${txt(152, 262, COMPS.BATTERY.value, { size: 13, family: F.barlow, weight: 600, fill: '#F6EBD8', anchor: 'start' })}
  `);
}

// ============================= 04·E HALFTONE =============================
{
  const DIR = 'Settype-Halftone';
  const A = '#F2E9D8';

  // Bitmap glyphs: white dot-screen clipped to Archivo Black digits.
  // coarse: 7px pitch, r 1.7 · fine: 5px pitch, r 1.05, offset (3,3). Baked @2×.
  const glyph = (d, pitch, r, ox, oy) => `
    <defs>
      <pattern id="p" width="${pitch * 2}" height="${pitch * 2}" x="${ox * 2}" y="${oy * 2}" patternUnits="userSpaceOnUse">
        <circle cx="${pitch}" cy="${pitch}" r="${r * 2}" fill="#FFFFFF"/>
      </pattern>
      <mask id="m"><text x="${HT.w}" y="${(HT.base * 2).toFixed(1)}" text-anchor="middle" font-family="Archivo" font-weight="900" font-size="236" fill="#FFFFFF">${d}</text></mask>
    </defs>
    <rect width="${HT.w * 2}" height="${HT.h * 2}" fill="url(#p)" mask="url(#m)"/>`;
  for (let d = 0; d <= 9; d++) {
    art(DIR, `ht_coarse_${d}`, HT.w, HT.h, glyph(d, 7, 1.7, 0, 0));
    art(DIR, `ht_fine_${d}`, HT.w, HT.h, glyph(d, 5, 1.05, 3, 3));
  }

  // Preview reuses the same pattern/mask trick inline.
  const num = (s, top, pitch, r, ox, oy, id) => `
    <defs>
      <pattern id="hp${id}" width="${pitch}" height="${pitch}" x="${ox}" y="${oy}" patternUnits="userSpaceOnUse"><circle cx="${pitch / 2}" cy="${pitch / 2}" r="${r}" fill="${A}"/></pattern>
      <mask id="hm${id}"><text x="150" y="${top + HT.base}" text-anchor="middle" font-family="Archivo" font-weight="900" font-size="118" letter-spacing="-4" fill="#FFFFFF">${s}</text></mask>
    </defs>
    <rect width="300" height="300" fill="url(#hp${id})" mask="url(#hm${id})"/>`;
  preview(DIR, `
    <rect width="300" height="300" fill="#0A0A0B"/>
    ${num(T.hh, 34, 7, 1.7, 0, 0, 'c')}
    ${num(T.mm, 142, 5, 1.05, 3, 3, 'f')}
    ${txt(150, 31, T.dateLine, { size: 9, family: F.mono, weight: 500, fill: '#5E5A50', ls: 3 })}
    ${txt(146, 272, COMPS.STEPS.value, { size: 11, family: F.mono, weight: 500, fill: '#ECE9E2', anchor: 'end' })}
    ${txt(152, 272, COMPS.STEPS.label, { size: 7, family: F.archivo, weight: 600, fill: '#5E5A50', ls: 1.5, anchor: 'start' })}
  `);
}

console.log('SETTYPE assets done.');
