// VESPERA series baked art + previews (Aurum, Noir, Salon, Meteorite, Opaline).
// Hands are baked pointing UP, pivot at the image's bottom-centre (pivotY=1.0).
import { art, preview, txt, T, COMPS, F } from './lib.mjs';

const rot = (deg, inner) => `<g transform="rotate(${deg} 150 150)">${inner}</g>`;

// Generic hand bake: white or fixed-colour vertical ramp, optional clip shape.
// Box (1×): w = handW+6, h = len+4; hand spans y 4..len+4; pivot bottom-centre.
function hand(dir, name, w, len, { c1 = '#FFFFFF', c2 = '#4D4D4D', rx = 0, clip = null, shadow = true } = {}) {
  const W = Math.ceil((w + 6) / 2) * 2, H = len + 4, x0 = (W - w) / 2, y0 = 4;
  const id = name.replace(/\W/g, '');
  const shape = clip
    ? `<polygon points="${clip.map(([px, py]) => `${(x0 + px * w).toFixed(2)},${(y0 + py * len).toFixed(2)}`).join(' ')}"`
    : `<rect x="${x0}" y="${y0}" width="${w}" height="${len}" rx="${rx}"`;
  art(dir, name, W, H, `
    <defs><linearGradient id="hg${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    ${shadow ? shape + ` fill="rgba(0,0,0,.45)" transform="translate(1.2 1.8)"/>` : ''}
    ${shape} fill="url(#hg${id})"/>`);
}
// Outline hand for AOD (1px stroke, fixed colour)
function handAod(dir, name, w, len, color, { rx = 0, clip = null } = {}) {
  const W = Math.ceil((w + 6) / 2) * 2, H = len + 4, x0 = (W - w) / 2, y0 = 4;
  const shape = clip
    ? `<polygon points="${clip.map(([px, py]) => `${(x0 + px * w).toFixed(2)},${(y0 + py * len).toFixed(2)}`).join(' ')}"`
    : `<rect x="${x0}" y="${y0}" width="${w}" height="${len}" rx="${rx}"`;
  art(dir, name, W, H, `${shape} fill="none" stroke="${color}" stroke-width="1"/>`);
}
// Plain bar hand (seconds), white for tinting or fixed colour
function barHand(dir, name, w, len, color = '#FFFFFF') {
  const W = 6, H = len + 4;
  art(dir, name, W, H, `<rect x="${(W - w) / 2}" y="4" width="${w}" height="${len}" fill="${color}"/>`);
}

// =============================== 05·A AURUM ===============================
{
  const DIR = 'Vespera-Aurum';
  const A = '#D4B36A';

  // Guilloché interference: two ring sets (pitch 7 / 8) with offset centres.
  // White art; runtime tint = metal accent, element alpha 26 (~10%).
  const rings = (cx, cy, pitch, n) => {
    let s = '';
    for (let i = 1; i <= n; i++) s += `<circle cx="${cx}" cy="${cy}" r="${i * pitch}" fill="none" stroke="#FFFFFF" stroke-width="1"/>`;
    return s;
  };
  art(DIR, 'guilloche', 300, 300, rings(150, 150, 7, 32) + rings(156, 159, 8, 29));

  hand(DIR, 'hour', 5, 70, { c1: '#FFFFFF', c2: '#7C633B', rx: 2.5 });      // gold ramp → tinted
  hand(DIR, 'minute', 3.5, 104, { c1: '#FFFFFF', c2: '#7C633B', rx: 1.75 });
  barHand(DIR, 'second', 1.5, 118);                                          // tinted accent
  handAod(DIR, 'hour_aod', 4, 70, 'rgba(212,179,106,.55)', { rx: 2 });
  handAod(DIR, 'minute_aod', 3, 104, 'rgba(212,179,106,.45)', { rx: 1.5 });

  const dashTrack = (() => {
    const C = 2 * Math.PI * 136, seg = C / 60;
    return `stroke-dasharray="${(seg * 0.1).toFixed(2)} ${(seg * 0.9).toFixed(2)}"`;
  })();
  preview(DIR, `
    <rect width="300" height="300" fill="#0E0C09"/>
    <g opacity=".10" stroke="${A}">${Array.from({ length: 32 }, (_, i) => `<circle cx="150" cy="150" r="${(i + 1) * 7}" fill="none" stroke-width="1"/>`).join('')}${Array.from({ length: 29 }, (_, i) => `<circle cx="156" cy="159" r="${(i + 1) * 8}" fill="none" stroke-width="1"/>`).join('')}</g>
    <circle cx="150" cy="150" r="136" fill="none" stroke="${A}" stroke-opacity=".4" stroke-width="3" ${dashTrack} transform="rotate(-90 150 150)"/>
    <circle cx="150" cy="150" r="58" fill="#14110C" stroke="${A}" stroke-opacity=".4" stroke-width="1"/>
    ${txt(150, 26, 'XII', { size: 13, family: F.marcellus, weight: 400, fill: A })}
    ${txt(150, 262, 'VI', { size: 13, family: F.marcellus, weight: 400, fill: A })}
    <circle cx="72" cy="150" r="30" fill="rgba(20,17,12,.85)" stroke="${A}" stroke-opacity=".2" stroke-width="1"/>
    <circle cx="72" cy="150" r="30" fill="none" stroke="${A}" stroke-width="2.5" stroke-linecap="round" pathLength="100" stroke-dasharray="62 100" transform="rotate(-90 72 150)"/>
    ${txt(72, 150, COMPS.HR.value, { size: 13, family: F.mono, weight: 500, fill: '#EDE3CC' })}
    ${txt(72, 160, COMPS.HR.label, { size: 6, family: F.archivo, weight: 600, fill: 'rgba(212,179,106,.6)', ls: 1 })}
    <circle cx="228" cy="150" r="30" fill="rgba(20,17,12,.85)" stroke="${A}" stroke-opacity=".2" stroke-width="1"/>
    <circle cx="228" cy="150" r="30" fill="none" stroke="${A}" stroke-width="2.5" stroke-linecap="round" pathLength="100" stroke-dasharray="84 100" transform="rotate(-90 228 150)"/>
    ${txt(228, 150, COMPS.STEPS.value, { size: 13, family: F.mono, weight: 500, fill: '#EDE3CC' })}
    ${txt(228, 160, COMPS.STEPS.label, { size: 6, family: F.archivo, weight: 600, fill: 'rgba(212,179,106,.6)', ls: 1 })}
    ${txt(150, 240, T.dateLine, { size: 9, family: F.mono, weight: 500, fill: 'rgba(237,227,204,.55)' })}
    ${rot(T.hourDeg, `<rect x="147.5" y="80" width="5" height="70" rx="2.5" fill="url(#au1)"/>`)}
    ${rot(T.minDeg, `<rect x="148.25" y="46" width="3.5" height="104" rx="1.75" fill="url(#au1)"/>`)}
    ${rot(T.secDeg, `<rect x="149.25" y="32" width="1.5" height="118" fill="${A}"/>`)}
    <defs><linearGradient id="au1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EDE0B5"/><stop offset="1" stop-color="#B8933F"/></linearGradient></defs>
    <circle cx="150" cy="150" r="4.5" fill="${A}"/>
  `);
}

// =============================== 05·B NOIR ===============================
{
  const DIR = 'Vespera-Noir';
  const A = '#C9CDD4';

  // 8 astronomically-honest moonphase plates in the design palette
  // (aperture 46, ring, cream moon 26, lacquer shadow) — indexed by MOON_PHASE_TYPE.
  const MOON = '#E8E4DA', DEEP = '#0A0F1E';
  const plate = (inner) => `
    <circle cx="23" cy="23" r="22.5" fill="${DEEP}"/>
    ${inner}
    <circle cx="23" cy="23" r="22.5" fill="none" stroke="rgba(201,205,212,.22)" stroke-width="1"/>`;
  const moonDisc = `<circle cx="23" cy="23" r="13" fill="${MOON}"/>`;
  const shadowAt = (dx) => `<circle cx="${23 + dx}" cy="23" r="13.6" fill="${DEEP}" fill-opacity=".96"/>`;
  const phases = [
    plate(moonDisc + shadowAt(0)),                    // 0 new (fully shadowed)
    plate(moonDisc + shadowAt(-8)),                   // 1 waxing crescent
    plate(moonDisc + shadowAt(-13.6)),                // 2 first quarter
    plate(moonDisc + shadowAt(-20)),                  // 3 waxing gibbous
    plate(moonDisc),                                  // 4 full
    plate(moonDisc + shadowAt(20)),                   // 5 waning gibbous
    plate(moonDisc + shadowAt(13.6)),                 // 6 last quarter
    plate(moonDisc + shadowAt(8)),                    // 7 waning crescent
  ];
  phases.forEach((svg, i) => art(DIR, `moon_${i}`, 46, 46, svg));

  hand(DIR, 'hour', 4, 66, { c1: '#E9EBEF', c2: '#9CA1AB', rx: 2 });        // fixed silver
  hand(DIR, 'minute', 3, 100, { c1: '#E9EBEF', c2: '#9CA1AB', rx: 1.5 });
  handAod(DIR, 'hour_aod', 4, 66, 'rgba(201,205,212,.5)', { rx: 2 });
  handAod(DIR, 'minute_aod', 3, 100, 'rgba(201,205,212,.4)', { rx: 1.5 });

  preview(DIR, `
    <defs>
      <radialGradient id="nbg" cx=".38" cy=".3" r="1"><stop offset="0" stop-color="#15151A"/><stop offset=".7" stop-color="#08080A"/><stop offset="1" stop-color="#08080A"/></radialGradient>
      <linearGradient id="sweep" x1="0" y1="0" x2=".62" y2="1"><stop offset="0" stop-color="rgba(255,255,255,.05)"/><stop offset=".34" stop-color="rgba(255,255,255,0)"/></linearGradient>
    </defs>
    <rect width="300" height="300" fill="url(#nbg)"/>
    <rect width="300" height="300" fill="url(#sweep)"/>
    <rect x="144" y="14" width="2.5" height="12" fill="${A}"/><rect x="150.5" y="14" width="2.5" height="12" fill="${A}"/>
    <rect x="148.75" y="274" width="2.5" height="12" fill="${A}" opacity=".4"/>
    <rect x="16" y="148.75" width="12" height="2.5" fill="${A}" opacity=".4"/>
    <rect x="272" y="148.75" width="12" height="2.5" fill="${A}" opacity=".4"/>
    <circle cx="150" cy="221" r="23" fill="#0A0F1E"/>
    <circle cx="150" cy="221" r="13" fill="#E8E4DA"/>
    <circle cx="130" cy="221" r="13.6" fill="#0A0F1E" fill-opacity=".96"/>
    <circle cx="150" cy="221" r="23" fill="none" stroke="rgba(201,205,212,.22)" stroke-width="1"/>
    <rect x="252" y="141" width="26" height="18" fill="none" stroke="rgba(201,205,212,.25)" stroke-width="1"/>
    ${txt(265, 154, T.dateNum, { size: 11, family: F.mono, weight: 500, fill: '#C9CDD4' })}
    ${txt(48, 150, COMPS.OUTSIDE.value, { size: 12, family: F.mono, weight: 500, fill: '#C9CDD4' })}
    ${txt(48, 160, COMPS.OUTSIDE.label, { size: 6, family: F.archivo, weight: 600, fill: 'rgba(201,205,212,.4)', ls: 1 })}
    ${rot(T.hourDeg, `<rect x="148" y="84" width="4" height="66" rx="2" fill="url(#nh)"/>`)}
    ${rot(T.minDeg, `<rect x="148.5" y="50" width="3" height="100" rx="1.5" fill="url(#nh)"/>`)}
    <defs><linearGradient id="nh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9EBEF"/><stop offset="1" stop-color="#9CA1AB"/></linearGradient></defs>
    <circle cx="150" cy="150" r="3.5" fill="#E9EBEF"/>
  `);
}

// =============================== 05·C SALON ===============================
{
  const DIR = 'Vespera-Salon';
  const A = '#D4B36A';

  // Sunray fan: 2.6° cream wedges from (150,174), faded out below 52–60%.
  const rays = (() => {
    let s = '';
    for (let a = -104; a < 104; a += 5.2) {
      const rad0 = (a - 90) * Math.PI / 180, rad1 = (a + 2.6 - 90) * Math.PI / 180;
      const R = 250;
      s += `<path d="M 150 174 L ${(150 + R * Math.cos(rad0)).toFixed(1)} ${(174 + R * Math.sin(rad0)).toFixed(1)} A ${R} ${R} 0 0 1 ${(150 + R * Math.cos(rad1)).toFixed(1)} ${(174 + R * Math.sin(rad1)).toFixed(1)} Z" fill="rgba(242,233,216,.05)"/>`;
    }
    return s;
  })();
  art(DIR, 'sunray', 300, 300, `
    <defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset=".52" stop-color="#FFF"/><stop offset=".6" stop-color="#000"/></linearGradient>
    <mask id="fm"><rect width="300" height="300" fill="url(#fade)"/></mask></defs>
    <g mask="url(#fm)">${rays}</g>`);

  // Cartouche: dark hexagon fill (fixed) + white 40% border (tinted accent)
  const hexPts = (w, h) => `${0.12 * w},0 ${0.88 * w},0 ${w},${h / 2} ${0.88 * w},${h} ${0.12 * w},${h} 0,${h / 2}`;
  art(DIR, 'cartouche_fill', 58, 42, `<polygon points="${hexPts(58, 42)}" fill="rgba(18,16,12,.8)"/>`);
  art(DIR, 'cartouche_border', 58, 42, `<polygon points="${hexPts(58, 42)}" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1"/>`);

  hand(DIR, 'hour', 6, 64, { c1: '#FFFFFF', c2: '#68542A', clip: [[0.5, 0], [1, 0.12], [0.72, 1], [0.28, 1], [0, 0.12]] }); // tinted gold
  hand(DIR, 'minute', 5, 96, { c1: '#F2E9D8', c2: '#B5AD98', clip: [[0.5, 0], [1, 0.10], [0.70, 1], [0.30, 1], [0, 0.10]] }); // fixed cream
  handAod(DIR, 'hour_aod', 5, 64, 'rgba(212,179,106,.55)', { clip: [[0.5, 0], [1, 0.12], [0.72, 1], [0.28, 1], [0, 0.12]] });
  handAod(DIR, 'minute_aod', 4, 96, 'rgba(212,179,106,.45)', { clip: [[0.5, 0], [1, 0.10], [0.70, 1], [0.30, 1], [0, 0.10]] });

  preview(DIR, `
    <rect width="300" height="300" fill="#12100C"/>
    <defs><linearGradient id="sf" x1="0" y1="0" x2="0" y2="1"><stop offset=".52" stop-color="#FFF"/><stop offset=".6" stop-color="#000" stop-opacity="0"/></linearGradient><mask id="sm"><rect width="300" height="300" fill="url(#sf)"/></mask></defs>
    <g mask="url(#sm)">${rays}</g>
    <circle cx="150" cy="150" r="116" fill="none" stroke="${A}" stroke-opacity=".2" stroke-width="1"/>
    <circle cx="150" cy="150" r="111" fill="none" stroke="${A}" stroke-opacity=".4" stroke-width="1"/>
    ${txt(150, 43, '12', { size: 26, family: F.marcellus, weight: 400, fill: A })}
    ${txt(150, 274, '6', { size: 26, family: F.marcellus, weight: 400, fill: A })}
    <polygon points="${(() => { const w = 58, h = 42, ox = 30, oy = 129; return `${ox + 0.12 * w},${oy} ${ox + 0.88 * w},${oy} ${ox + w},${oy + h / 2} ${ox + 0.88 * w},${oy + h} ${ox + 0.12 * w},${oy + h} ${ox},${oy + h / 2}`; })()}" fill="rgba(18,16,12,.8)" stroke="${A}" stroke-opacity=".4" stroke-width="1"/>
    ${txt(59, 149, COMPS.STEPS.value, { size: 12, family: F.mono, weight: 500, fill: '#F2E9D8' })}
    ${txt(59, 159, COMPS.STEPS.label, { size: 5.5, family: F.archivo, weight: 600, fill: A, ls: 1 })}
    <polygon points="${(() => { const w = 58, h = 42, ox = 212, oy = 129; return `${ox + 0.12 * w},${oy} ${ox + 0.88 * w},${oy} ${ox + w},${oy + h / 2} ${ox + 0.88 * w},${oy + h} ${ox + 0.12 * w},${oy + h} ${ox},${oy + h / 2}`; })()}" fill="rgba(18,16,12,.8)" stroke="${A}" stroke-opacity=".4" stroke-width="1"/>
    ${txt(241, 149, COMPS.OUTSIDE.value, { size: 12, family: F.mono, weight: 500, fill: '#F2E9D8' })}
    ${txt(241, 159, COMPS.OUTSIDE.label, { size: 5.5, family: F.archivo, weight: 600, fill: A, ls: 1 })}
    ${txt(150, 243, T.dateLine, { size: 9, family: F.mono, weight: 500, fill: 'rgba(242,233,216,.5)', ls: 2 })}
    ${rot(T.hourDeg, `<polygon points="150,86 153,93.7 152.2,150 147.8,150 147,93.7" fill="url(#sg1)"/>`)}
    ${rot(T.minDeg, `<polygon points="150,54 152.5,63.6 151.5,150 148.5,150 147.5,63.6" fill="url(#sg2)"/>`)}
    <defs>
      <linearGradient id="sg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${A}"/><stop offset="1" stop-color="#8A6F35"/></linearGradient>
      <linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2E9D8"/><stop offset="1" stop-color="#B5AD98"/></linearGradient>
    </defs>
    <rect x="145" y="145" width="10" height="10" fill="${A}" transform="rotate(45 150 150)"/>
  `);
}

// ============================= 05·D METEORITE =============================
{
  const DIR = 'Vespera-Meteorite';
  const A = '#C9CDD4';

  // Widmanstätten lattice: 3 rotated line families + top-left sheen (fixed silver)
  const lines = (angle, pitch, op) => {
    let s = `<g transform="rotate(${angle} 150 150)">`;
    for (let y = -160; y <= 460; y += pitch) s += `<rect x="-160" y="${y}" width="620" height="1" fill="rgba(201,205,212,${op})"/>`;
    return s + '</g>';
  };
  art(DIR, 'lattice', 300, 300, `
    ${lines(32, 9, .09)}${lines(-47, 12, .07)}${lines(81, 15, .05)}
    <defs><radialGradient id="sheen" cx=".4" cy=".32" r=".6"><stop offset="0" stop-color="rgba(255,255,255,.05)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient></defs>
    <rect width="300" height="300" fill="url(#sheen)"/>`);

  hand(DIR, 'hour', 6, 68, { c1: '#F2F4F8', c2: '#8F94A0', clip: [[0.5, 0], [1, 0.22], [1, 1], [0, 1], [0, 0.22]] });
  hand(DIR, 'minute', 5, 102, { c1: '#F2F4F8', c2: '#8F94A0', clip: [[0.5, 0], [1, 0.16], [1, 1], [0, 1], [0, 0.16]] });
  barHand(DIR, 'second', 1.5, 112);                                          // tinted accent
  handAod(DIR, 'hour_aod', 5, 68, 'rgba(223,226,232,.5)', { clip: [[0.5, 0], [1, 0.22], [1, 1], [0, 1], [0, 0.22]] });
  handAod(DIR, 'minute_aod', 4, 102, 'rgba(223,226,232,.4)', { clip: [[0.5, 0], [1, 0.16], [1, 1], [0, 1], [0, 0.16]] });

  preview(DIR, `
    <rect width="300" height="300" fill="#0C0D0F"/>
    ${lines(32, 9, .09)}${lines(-47, 12, .07)}${lines(81, 15, .05)}
    <rect x="149" y="18" width="2" height="14" fill="${A}"/>
    <rect x="149" y="268" width="2" height="14" fill="${A}" opacity=".4"/>
    <rect x="18" y="149" width="14" height="2" fill="${A}" opacity=".4"/>
    <rect x="268" y="149" width="14" height="2" fill="${A}" opacity=".4"/>
    ${txt(150, 62, COMPS.HR.value, { size: 13, family: F.mono, weight: 500, fill: '#DFE2E8' })}
    ${txt(150, 72, COMPS.HR.label, { size: 6, family: F.archivo, weight: 600, fill: 'rgba(223,226,232,.4)', ls: 1.5 })}
    ${txt(150, 240, COMPS.STEPS.value, { size: 13, family: F.mono, weight: 500, fill: '#DFE2E8' })}
    ${txt(150, 250, COMPS.STEPS.label, { size: 6, family: F.archivo, weight: 600, fill: 'rgba(223,226,232,.4)', ls: 1.5 })}
    ${rot(T.hourDeg, `<polygon points="150,82 153,97 153,150 147,150 147,97" fill="url(#mh)"/>`)}
    ${rot(T.minDeg, `<polygon points="150,48 152.5,64.3 152.5,150 147.5,150 147.5,64.3" fill="url(#mh)"/>`)}
    ${rot(T.secDeg, `<rect x="149.25" y="38" width="1.5" height="112" fill="${A}"/>`)}
    <defs><linearGradient id="mh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2F4F8"/><stop offset="1" stop-color="#8F94A0"/></linearGradient></defs>
    <circle cx="150" cy="150" r="4.5" fill="#F2F4F8"/>
  `);
}

// ============================== 05·E OPALINE ==============================
{
  const DIR = 'Vespera-Opaline';
  const A = '#3E5C8A';

  hand(DIR, 'hour', 5, 66, { c1: '#FFFFFF', c2: '#DCDCDC', rx: 2.5, shadow: true });   // tinted theme
  hand(DIR, 'minute', 3.5, 100, { c1: '#FFFFFF', c2: '#DCDCDC', rx: 1.75, shadow: true });
  barHand(DIR, 'second', 1.5, 114, '#B34A2E');                                          // fixed red
  handAod(DIR, 'hour_aod', 4, 66, 'rgba(235,230,218,.5)', { rx: 2 });
  handAod(DIR, 'minute_aod', 3, 100, 'rgba(235,230,218,.4)', { rx: 1.5 });

  const track = (() => {
    const C = 2 * Math.PI * 127, seg = C / 120;
    return `stroke-dasharray="${(seg * 0.06).toFixed(2)} ${(seg * 0.94).toFixed(2)}"`;
  })();
  preview(DIR, `
    <defs><radialGradient id="obg" cx=".46" cy=".4" r=".9"><stop offset="0" stop-color="#F7F4ED"/><stop offset=".78" stop-color="#EBE6DA"/><stop offset="1" stop-color="#EBE6DA"/></radialGradient></defs>
    <rect width="300" height="300" fill="url(#obg)"/>
    <circle cx="150" cy="150" r="132" fill="none" stroke="rgba(23,21,18,.35)" stroke-width="1"/>
    <circle cx="150" cy="150" r="127" fill="none" stroke="rgba(23,21,18,.3)" stroke-width="5" ${track}/>
    ${txt(150, 52, '12', { size: 22, family: F.cormorant, weight: 600, fill: '#2A2620' })}
    ${txt(150, 276, '6', { size: 22, family: F.cormorant, weight: 600, fill: '#2A2620' })}
    ${txt(48, 158, '9', { size: 22, family: F.cormorant, weight: 600, fill: '#2A2620' })}
    ${txt(252, 158, '3', { size: 22, family: F.cormorant, weight: 600, fill: '#2A2620' })}
    ${txt(150, 87, 'twelve & sixty', { size: 11, family: F.cormorant, weight: 500, fill: '#8A8272', style: 'font-style:italic' })}
    ${txt(90, 124, COMPS.STEPS.value, { size: 11, family: F.mono, weight: 500, fill: '#2A2620' })}
    ${txt(90, 133, COMPS.STEPS.label, { size: 5.5, family: F.archivo, weight: 600, fill: '#8A8272', ls: 1 })}
    ${txt(210, 124, COMPS.SUNSET.value, { size: 11, family: F.mono, weight: 500, fill: '#2A2620' })}
    ${txt(210, 133, COMPS.SUNSET.label, { size: 5.5, family: F.archivo, weight: 600, fill: '#8A8272', ls: 1 })}
    ${txt(150, 232, T.dateLine, { size: 9, family: F.mono, weight: 500, fill: '#8A8272', ls: 2 })}
    ${rot(T.hourDeg, `<rect x="147.5" y="84" width="5" height="66" rx="2.5" fill="${A}"/>`)}
    ${rot(T.minDeg, `<rect x="148.25" y="50" width="3.5" height="100" rx="1.75" fill="${A}"/>`)}
    ${rot(T.secDeg, `<rect x="149.25" y="36" width="1.5" height="114" fill="#B34A2E"/>`)}
    <circle cx="150" cy="150" r="4" fill="${A}"/>
  `);
}

console.log('VESPERA assets done.');
