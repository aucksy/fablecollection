// KINETIK series baked art + previews. Geometry transcribed 1:1 from the
// design handoff HTML (300×300 dial space). Run: node gen-kinetik.mjs
import { art, preview, txt, slotText, easeInOut, annularSector, T, COMPS, F } from './lib.mjs';

// ============================== 02·A ORRERY ==============================
{
  const DIR = 'Kinetik-Orrery';
  const A = '#FFC978'; // signature sun

  // Starfield (fixed, from the HTML box-shadow list; base star + 11 shadows + 2 twinkles)
  const stars = [
    [53, 41, 1], [113, 59, .7], [193, 35, .5], [243, 81, .8], [39, 111, .4],
    [263, 151, .5], [83, 191, .35], [233, 231, .6], [33, 241, .5], [143, 269, .4],
    [203, 137, .3], [61, 151, .55],
  ];
  const twinkles = [[70.75, 66.75], [216.75, 180.75]];
  art(DIR, 'starfield', 300, 300,
    stars.map(([x, y, o]) => `<circle cx="${x}" cy="${y}" r="1" fill="rgba(255,255,255,${o})"/>`).join('')
    + twinkles.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="0.75" fill="rgba(255,255,255,0.55)"/>`).join(''));

  // Sun sprite: 18px disc + glow (0 0 22px a66, 0 0 44px a33) — WHITE, tinted at runtime.
  // Box-shadow glow falls off fast: strong within ~11px of the disc edge, faint to ~44px.
  art(DIR, 'sun', 96, 96, `
    <defs>
      <radialGradient id="g1"><stop offset=".09" stop-color="rgba(255,255,255,.5)"/><stop offset=".2" stop-color="rgba(255,255,255,.22)"/><stop offset=".45" stop-color="rgba(255,255,255,.07)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient>
    </defs>
    <circle cx="48" cy="48" r="46" fill="url(#g1)"/>
    <circle cx="48" cy="48" r="9" fill="#FFFFFF"/>`);
  // AOD sun: 14px outline ring (fixed dim gold per design AOD)
  art(DIR, 'sun_aod', 20, 20, `<circle cx="10" cy="10" r="7" fill="none" stroke="rgba(255,201,120,.5)" stroke-width="1"/>`);

  // Planet hand arms. Hand image drawn pointing at 12; pivot (0.5, 1.0) = dial center.
  // Hour planet: cream 12px dot, orbit r=70 → arm h = 70 + 12 (dot r 6 + glow pad 6).
  art(DIR, 'planet_hour', 28, 82, `
    <defs><radialGradient id="pg"><stop offset="0" stop-color="rgba(237,231,218,.5)"/><stop offset="1" stop-color="rgba(237,231,218,0)"/></radialGradient></defs>
    <circle cx="14" cy="12" r="11" fill="url(#pg)"/>
    <circle cx="14" cy="12" r="6" fill="#EDE7DA"/>`);
  // Minute planet: #9BB8FF 8px dot, orbit r=106 → arm h = 106 + 10
  art(DIR, 'planet_min', 24, 116, `
    <defs><radialGradient id="pg2"><stop offset="0" stop-color="rgba(155,184,255,.6)"/><stop offset="1" stop-color="rgba(155,184,255,0)"/></radialGradient></defs>
    <circle cx="12" cy="10" r="9" fill="url(#pg2)"/>
    <circle cx="12" cy="10" r="4" fill="#9BB8FF"/>`);
  // Seconds comet: white 3px dot, orbit r=132.5 → arm h = 132.5 + 4.5 = 137
  art(DIR, 'comet', 12, 137, `<circle cx="6" cy="4.5" r="1.5" fill="rgba(255,255,255,.9)"/>`);
  // AOD outline planets (10px / 6px rings, cream 55/45%)
  art(DIR, 'planet_hour_aod', 24, 80, `<circle cx="12" cy="10" r="5" fill="none" stroke="rgba(237,231,218,.55)" stroke-width="1"/>`);
  art(DIR, 'planet_min_aod', 20, 112, `<circle cx="10" cy="6" r="3" fill="none" stroke="rgba(237,231,218,.45)" stroke-width="1"/>`);

  const orbit = (r, dash, op) => `<circle cx="150" cy="150" r="${r}" fill="none" stroke="rgba(255,255,255,${op})" stroke-width="1"${dash ? ' stroke-dasharray="3 4"' : ''}/>`;
  const rot = (deg, inner) => `<g transform="rotate(${deg} 150 150)">${inner}</g>`;
  preview(DIR, `
    <rect width="300" height="300" fill="#030309"/>
    ${stars.map(([x, y, o]) => `<circle cx="${x}" cy="${y}" r="1" fill="rgba(255,255,255,${o})"/>`).join('')}
    ${orbit(70, false, .1)}${orbit(106, false, .07)}${orbit(132, true, .05)}
    <defs><radialGradient id="sunGlow"><stop offset=".18" stop-color="rgba(255,201,120,.5)"/><stop offset=".4" stop-color="rgba(255,201,120,.18)"/><stop offset="1" stop-color="rgba(255,201,120,0)"/></radialGradient></defs>
    <circle cx="150" cy="150" r="46" fill="url(#sunGlow)"/>
    <circle cx="150" cy="150" r="9" fill="${A}"/>
    ${rot(T.hourDeg, `<circle cx="150" cy="80" r="6" fill="#EDE7DA"/>`)}
    ${rot(T.minDeg, `<circle cx="150" cy="44" r="4" fill="#9BB8FF"/>`)}
    ${rot(T.secDeg, `<circle cx="150" cy="17.5" r="1.5" fill="rgba(255,255,255,.9)"/>`)}
    ${txt(150, 36, `${T.hh}:${T.mm}`, { size: 13, family: F.mono, weight: 500, fill: 'rgba(242,240,234,.85)', ls: 2 })}
    ${slotText(90, 250, COMPS.BATTERY)}
    ${slotText(210, 250, COMPS.SUNSET)}
    ${txt(150, 281, T.dateLine, { size: 8, family: F.mono, weight: 500, fill: '#494638', ls: 2 })}
  `);
}

// ============================ 02·B ESCAPEMENT ============================
{
  const DIR = 'Kinetik-Escapement';
  const A = '#C9A96A';

  // Gears — WHITE art (tinted + alpha'd at runtime). Teeth = dashed thick ring.
  // pathLength=48 & dasharray .5/.5 in the HTML → 48 teeth (tooth = C/96); small gear 32 teeth.
  const gearLarge = (() => {
    const c = 96, rT = 80, rIn = 52, rHub = 8;
    const C = 2 * Math.PI * rT, dash = C / 96; // 48 teeth
    return `
    <circle cx="${c}" cy="${c}" r="${rT}" fill="none" stroke="#FFFFFF" stroke-width="16" stroke-dasharray="${dash.toFixed(2)} ${dash.toFixed(2)}"/>
    <circle cx="${c}" cy="${c}" r="${rIn}" fill="none" stroke="#FFFFFF" stroke-width="1.5"/>
    <circle cx="${c}" cy="${c}" r="${rHub}" fill="none" stroke="#FFFFFF" stroke-width="1.5"/>`;
  })();
  art(DIR, 'gear_large', 192, 192, gearLarge);
  const gearSmall = (() => {
    const c = 66, rT = 54, rIn = 32;
    const C = 2 * Math.PI * rT, dash = C / 64; // 32 teeth
    return `
    <circle cx="${c}" cy="${c}" r="${rT}" fill="none" stroke="#FFFFFF" stroke-width="12" stroke-dasharray="${dash.toFixed(2)} ${dash.toFixed(2)}"/>
    <circle cx="${c}" cy="${c}" r="${rIn}" fill="none" stroke="#FFFFFF" stroke-width="1.5"/>`;
  })();
  art(DIR, 'gear_small', 132, 132, gearSmall);

  const gearsPreview = `
    <g opacity=".16">
      <g transform="rotate(20 220 90)" fill="none" stroke="${A}">
        <circle cx="220" cy="90" r="80" stroke-width="16" stroke-dasharray="5.24 5.24"/>
        <circle cx="220" cy="90" r="52" stroke-width="1.5"/><circle cx="220" cy="90" r="8" stroke-width="1.5"/>
      </g>
      <g transform="rotate(-14 52 190)" fill="none" stroke="${A}">
        <circle cx="52" cy="190" r="54" stroke-width="12" stroke-dasharray="5.3 5.3"/>
        <circle cx="52" cy="190" r="32" stroke-width="1.5"/>
      </g>
    </g>`;
  preview(DIR, `
    <rect width="300" height="300" fill="#0A0908"/>
    ${gearsPreview}
    ${txt(150, 100, `${T.hh}:${T.mm}`, { size: 54, family: F.mono, weight: 600, fill: '#EDE7DA', ls: 2 })}
    ${txt(150, 129, `${T.dateLine} · CAL. TS-01 · 21,600 VPH`, { size: 8.5, family: F.mono, weight: 500, fill: '#6B6858', ls: 3 })}
    <g transform="rotate(14 150 194)">
      <circle cx="150" cy="194" r="34" fill="none" stroke="${A}" stroke-width="2"/>
      <rect x="149" y="158" width="2" height="72" fill="${A}"/>
      <rect x="122" y="193.5" width="56" height="1" fill="${A}" opacity=".4"/>
    </g>
    <circle cx="150" cy="194" r="3.5" fill="#EDE7DA"/>
    <circle cx="58" cy="190" r="32" fill="none" stroke="rgba(237,231,218,.18)" stroke-width="1"/>
    ${slotText(58, 188, COMPS.HR, { labelSize: 6.5, labelLs: 1, gap: 3 })}
    <circle cx="242" cy="190" r="32" fill="none" stroke="rgba(237,231,218,.18)" stroke-width="1"/>
    ${slotText(242, 188, COMPS.STEPS, { labelSize: 6.5, labelLs: 1, gap: 3 })}
    ${txt(150, 281, 'FREE-SPRUNG BALANCE', { size: 7.5, family: F.mono, weight: 500, fill: '#494638', ls: 2 })}
  `);
}

// ============================= 02·C ODOMETER =============================
{
  const DIR = 'Kinetik-Odometer';
  const A = '#F2E9D8';

  // Bitmap-font drum digits: Barlow Condensed Bold, white, centered in fixed
  // 54×84 cells (rendered @2×: 108×168). Cap height 0.7em → 64px font ⇒ 44.8px.
  for (let d = 0; d <= 9; d++) {
    art(DIR, `drum_${d}`, 54, 84,
      txt(27, 42 + 22.4, String(d), { size: 64, family: F.barlow, weight: 700, fill: '#FFFFFF' }));
  }

  const digitCol = (x, s, fill, dim) => txt(x, 150 + 22.4, s, { size: 64, family: F.barlow, weight: 700, fill, style: dim ? 'opacity:.28' : '' });
  const peek = (x, s, fill, dy) => txt(x, 150 + 22.4 + dy, s, { size: 64, family: F.barlow, weight: 700, fill, style: 'opacity:.22' });
  preview(DIR, `
    <rect width="300" height="300" fill="#080807"/>
    ${txt(150, 30, `${T.dateLine} · ${T.ampm}`, { size: 9, family: F.mono, weight: 500, fill: '#6B6858', ls: 3 })}
    ${digitCol(62, '1', '#F2E9D8')}${digitCol(116, '0', '#F2E9D8')}
    ${digitCol(184, '0', A)}${digitCol(238, '8', A)}
    ${peek(62, '0', '#F2E9D8', -84)}${peek(116, '9', '#F2E9D8', -84)}${peek(184, '0', A, -84)}${peek(238, '7', A, -84)}
    ${peek(62, '1', '#F2E9D8', 84)}${peek(116, '1', '#F2E9D8', 84)}${peek(184, '0', A, 84)}${peek(238, '9', A, 84)}
    <rect x="0" y="44" width="300" height="46" fill="url(#odoFadeT)"/>
    <rect x="0" y="210" width="300" height="46" fill="url(#odoFadeB)"/>
    <defs>
      <linearGradient id="odoFadeT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#080807"/><stop offset="1" stop-color="#080807" stop-opacity="0"/></linearGradient>
      <linearGradient id="odoFadeB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#080807" stop-opacity="0"/><stop offset="1" stop-color="#080807"/></linearGradient>
    </defs>
    <circle cx="150" cy="142" r="3" fill="${A}"/><circle cx="150" cy="158" r="3" fill="${A}"/>
    <path d="M 50 118 L 40 118 L 40 182 L 50 182" fill="none" stroke="rgba(242,233,216,.25)" stroke-width="1"/>
    <path d="M 250 118 L 260 118 L 260 182 L 250 182" fill="none" stroke="rgba(242,233,216,.25)" stroke-width="1"/>
    <rect x="68" y="238" width="78" height="32" fill="none" stroke="rgba(242,233,216,.16)" stroke-width="1"/>
    ${slotText(107, 254, COMPS.STEPS, { valueSize: 13, valueFill: '#F2E9D8', labelSize: 6.5, gap: 3 })}
    <rect x="154" y="238" width="78" height="32" fill="none" stroke="rgba(242,233,216,.16)" stroke-width="1"/>
    ${slotText(193, 254, COMPS.BATTERY, { valueSize: 13, valueFill: '#F2E9D8', labelSize: 6.5, gap: 3 })}
  `);
}

// ============================= 02·D TURBINE =============================
{
  const DIR = 'Kinetik-Turbine';
  const A = '#6EE7F9';

  // Rotor: 8 blades, 16° wide every 45°, annulus r 36.7→88.6 with soft edges.
  // WHITE art; runtime: tintColor=accent, alpha=51 (20%). AOD reuses at alpha 23.
  const blades = [];
  for (let i = 0; i < 8; i++) blades.push(`<path d="${annularSector(108, 108, 37, 88.5, i * 45, i * 45 + 16)}" fill="#FFFFFF"/>`);
  art(DIR, 'rotor', 216, 216, `
    <defs>
      <radialGradient id="rm"><stop offset=".33" stop-color="#000"/><stop offset=".35" stop-color="#fff"/><stop offset=".80" stop-color="#fff"/><stop offset=".83" stop-color="#000"/></radialGradient>
      <mask id="ringmask"><rect width="216" height="216" fill="#000"/><circle cx="108" cy="108" r="108" fill="url(#rm)"/></mask>
    </defs>
    <g mask="url(#ringmask)">${blades.join('')}</g>`);

  const rotorPrev = [];
  for (let i = 0; i < 8; i++) rotorPrev.push(`<path d="${annularSector(150, 150, 37, 88.5, i * 45 + 20, i * 45 + 36)}" fill="${A}" opacity=".2"/>`);
  preview(DIR, `
    <rect width="300" height="300" fill="#07080A"/>
    ${rotorPrev.join('')}
    <circle cx="150" cy="150" r="114" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="1"/>
    <circle cx="150" cy="150" r="72" fill="#0A0B0E" stroke="rgba(255,255,255,.12)" stroke-width="1"/>
    ${txt(150, 155, `${T.hh}:${T.mm}`, { size: 44, family: F.barlow, weight: 700, fill: '#F2F0EA' })}
    ${txt(150, 172, T.dateLine, { size: 8, family: F.archivo, weight: 600, fill: '#7C786D', ls: 2 })}
    ${txt(150, 38, COMPS.STEPS.value, { size: 16, family: F.barlow, weight: 600, fill: A })}
    ${txt(150, 48, COMPS.STEPS.label, { size: 6.5, family: F.archivo, weight: 600, fill: '#7C786D', ls: 1.5 })}
    ${txt(150, 264, COMPS.BATTERY.value, { size: 16, family: F.barlow, weight: 600, fill: '#F2F0EA' })}
    ${txt(150, 274, COMPS.BATTERY.label, { size: 6.5, family: F.archivo, weight: 600, fill: '#7C786D', ls: 1.5 })}
  `);
}

// ============================ 02·E METRONOME ============================
{
  const DIR = 'Kinetik-Metronome';
  const A = '#E0704F';

  // Wand swing frames (24 frames = one full 2 s L→R→L cycle, ease-in-out).
  // Region: x 88..212, y 130..250 (pivot at 150,248) → 124×120 per frame.
  // WHITE art (white→30% ramp = accent→dark tail after tint).
  for (let i = 0; i < 24; i++) {
    const ph = i / 12; // 0..2
    const p = ph <= 1 ? ph : 2 - ph;
    const angle = -24 + 48 * easeInOut(p);
    art(DIR, `wand_${String(i).padStart(2, '0')}`, 124, 120, `
      <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#4D4D4D"/></linearGradient></defs>
      <g transform="rotate(${angle.toFixed(2)} 62 118)">
        <rect x="60.5" y="6" width="3" height="112" rx="1.5" fill="url(#wg)"/>
        <path d="M 62 20 L 68.5 38 L 55.5 38 Z" fill="#FFFFFF"/>
      </g>`);
  }
  // Static parked wand (fallback + first frame parity) and AOD outline wand.
  art(DIR, 'wand_static', 124, 120, `
    <defs><linearGradient id="wg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#4D4D4D"/></linearGradient></defs>
    <rect x="60.5" y="6" width="3" height="112" rx="1.5" fill="url(#wg2)"/>
    <path d="M 62 20 L 68.5 38 L 55.5 38 Z" fill="#FFFFFF"/>`);
  art(DIR, 'wand_aod', 124, 120, `<rect x="61" y="6" width="2" height="112" fill="none" stroke="rgba(224,112,79,.4)" stroke-width="1"/>`);

  preview(DIR, `
    <rect width="300" height="300" fill="#0B0908"/>
    ${txt(150, 74, `${T.hh}:${T.mm}`, { size: 52, family: F.mono, weight: 600, fill: '#EDE7DA', ls: 1 })}
    ${txt(150, 101, `${T.dateLine} · ${T.ampm}`, { size: 8.5, family: F.mono, weight: 500, fill: '#6B6858', ls: 3 })}
    <path d="M 82 158 A 92 92 0 0 1 218 158" fill="none" stroke="rgba(237,231,218,.15)" stroke-width="1" stroke-dasharray="1 6"/>
    <g transform="rotate(14 150 248)">
      <rect x="148.5" y="136" width="3" height="112" rx="1.5" fill="url(#mwg)"/>
      <path d="M 150 150 L 156.5 168 L 143.5 168 Z" fill="${A}"/>
    </g>
    <defs><linearGradient id="mwg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${A}"/><stop offset="1" stop-color="#5E4A3A"/></linearGradient></defs>
    <circle cx="150" cy="248" r="8" fill="#EDE7DA"/>
    ${slotText(64, 212, COMPS.HR, { labelFill: A, labelSize: 6.5, labelLs: 1, gap: 3 })}
    ${slotText(236, 212, COMPS.NEXT_EVENT, { labelSize: 6.5, labelLs: 1, gap: 3 })}
    ${txt(150, 275, 'TEMPO 60 · LARGO', { size: 7, family: F.mono, weight: 500, fill: '#494638', ls: 2 })}
  `);
}

console.log('KINETIK assets done.');
