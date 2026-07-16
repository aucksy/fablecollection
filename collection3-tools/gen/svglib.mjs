// SVG engine — faithful port of the handoff's normative renderer
// (tools/spec/renderer.jsx, "WatchFaceRenderer v2") to plain SVG strings for
// resvg baking. Every layer type reproduces the renderer's exact recipes:
// finishes, flange, applied indices, plates, bridges, screws, hands (metal,
// lume, slot, ridge, shadow, hub). Bakes are per-theme; live layers (hands,
// data arcs, token texts, slot content) are rendered natively by WFF on top.

import { AOD_ROLES, DARK_ROLES, fontFromStack } from './data.mjs';

const TAU = Math.PI / 180;
export const C = 225;

export function polar(cx, cy, r, deg) {
  return [cx + r * Math.sin(deg * TAU), cy - r * Math.cos(deg * TAU)];
}
export function arcPath(cx, cy, r, a0, a1) {
  const sweep = a1 - a0;
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  const large = Math.abs(sweep) > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} ${sweep > 0 ? 1 : 0} ${x1} ${y1}`;
}
export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  r = Math.round(r + (t - r) * p);
  g = Math.round(g + (t - g) * p);
  b = Math.round(b + (t - b) * p);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export const SIM = { battery: 68, steps: 6203, notif: 3, hr: 72, event: '12:30', sunrise: '05:41', sunset: '21:12' };

const pad2 = (n) => String(n).padStart(2, '0');
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

// Preview time: 10:08:36 (spec verification state), FRI JUL 11 (matches Fable previews)
export const NOW = { h: 10, m: 8, s: 36, day: 5, date: 11, mon: 6 };

export function tokenText(token, hour12 = true) {
  const H = NOW.h, h12 = H % 12 === 0 ? 12 : H % 12;
  switch (token) {
    case 'hh': return hour12 ? pad2(h12) : pad2(H);
    case 'h': return hour12 ? String(h12) : pad2(H);
    case 'mm': return pad2(NOW.m);
    case 'ss': return pad2(NOW.s);
    case 'hmm': return (hour12 ? h12 : pad2(H)) + ':' + pad2(NOW.m);
    case 'ampm': case 'ampmOnly': return H < 12 ? 'AM' : 'PM';
    case 'day3': return DAYS[NOW.day];
    case 'dnum': return pad2(NOW.date);
    case 'mon3': return MONS[NOW.mon];
    case 'weeknr': return 'W28';
    case 'steps': return String(SIM.steps);
    case 'stepsK': return (SIM.steps / 1000).toFixed(1) + 'K';
    case 'batt': return SIM.battery + '%';
    case 'battN': return String(SIM.battery);
    case 'notif': return String(SIM.notif);
    case 'hr': return String(SIM.hr);
    case 'event': return SIM.event;
    case 'sunrise': return SIM.sunrise;
    case 'sunset': return SIM.sunset;
    default: return token || '';
  }
}

export function dataFrac(data) {
  switch (data) {
    case 'battery': return SIM.battery / 100;
    case 'steps': return Math.min(SIM.steps / 10000, 1);
    case 'stepsDial': return (SIM.steps / 1000) % 10 / 10;
    case 'seconds': return NOW.s / 60;
    case 'minutes': return (NOW.m + NOW.s / 60) / 60;
    case 'day': return (NOW.h * 60 + NOW.m) / 1440;
    case 'hr': return SIM.hr / 250;
    case 'notif': return Math.min(SIM.notif / 30, 1);
    default: return 0;
  }
}

export const ICONS = {
  sun: 'M0-5.5 0-3.5M0 3.5 0 5.5M-5.5 0-3.5 0M3.5 0 5.5 0M-3.9-3.9-2.5-2.5M2.5 2.5 3.9 3.9M-3.9 3.9-2.5 2.5M2.5-2.5 3.9-3.9',
  bolt: 'M1-6-4 1H0L-1 6 4-1H0Z',
  steps: 'M-3-5C-1-5-1-1-3-1-5-1-5-5-3-5ZM3 1C5 1 5 5 3 5 1 5 1 1 3 1Z',
  bell: 'M0-5C2.5-5 3.5-3 3.5-0.5L4.5 2.5H-4.5L-3.5-0.5C-3.5-3-2.5-5 0-5ZM-1 4A1 1 0 0 0 1 4',
  moon: 'M2-5A5.5 5.5 0 1 0 5 1 4.5 4.5 0 0 1 2-5Z',
  cal: 'M-4-3H4V4H-4ZM-4-1H4M-2-5V-3M2-5V-3',
  msg: 'M-4.5-3.5H4.5V2.5H-1L-3.5 5V2.5H-4.5Z',
  hr: 'M0 4.5-4.5-0.5C-6-2.5-4.5-5-2.2-5-1-5 0-4 0-3 0-4 1-5 2.2-5 4.5-5 6-2.5 4.5-0.5Z',
};

/* ---- hand shape path generators (0,0 = pivot, -len = tip) — verbatim port ---- */
export function handPath(shape, len, w, tail) {
  const t = tail || 0;
  switch (shape) {
    case 'sword':
      return `M0 ${t} L${-w} ${t * 0.4} L${-w} ${-len * 0.72} L0 ${-len} L${w} ${-len * 0.72} L${w} ${t * 0.4} Z`;
    case 'arrow':
      return `M0 ${t} L${-w * 0.55} ${t} L${-w * 0.55} ${-len * 0.42} L${-w * 1.5} ${-len * 0.52} L0 ${-len} L${w * 1.5} ${-len * 0.52} L${w * 0.55} ${-len * 0.42} L${w * 0.55} ${t} Z`;
    case 'baton':
      return `M${-w} ${t} L${-w} ${-len} L${w} ${-len} L${w} ${t} Z`;
    case 'needle':
      return `M${-w * 0.5} ${t} L0 ${-len} L${w * 0.5} ${t} Z`;
    case 'dauphine':
      return `M0 ${t} L${-w} ${-len * 0.1} L0 ${-len} L${w} ${-len * 0.1} Z`;
    case 'plate2':
      return `M ${-w * 0.7} ${t} L ${-w} ${t * 0.5} L ${-w} ${-len * 0.8} L 0 ${-len} L ${w} ${-len * 0.8} L ${w} ${t * 0.5} L ${w * 0.7} ${t} Z`;
    case 'syringe':
      return `M${-w * 0.35} ${t} L${-w * 0.35} ${-len} L${w * 0.35} ${-len} L${w * 0.35} ${t} Z`;
    default:
      return `M${-w * 0.5} ${t} L0 ${-len} L${w * 0.5} ${t} Z`;
  }
}
export function lumePath(shape, len, w, tail) {
  switch (shape) {
    case 'arrow':
      return `M0 ${-len * 0.93} L${-w * 1.05} ${-len * 0.55} L0 ${-len * 0.47} L${w * 1.05} ${-len * 0.55} Z`;
    case 'sword':
      return `M${-w * 0.45} ${-len * 0.68} L${-w * 0.45} ${-len * 0.3} L${w * 0.45} ${-len * 0.3} L${w * 0.45} ${-len * 0.68} L0 ${-len * 0.8} Z`;
    case 'baton':
      return `M${-w * 0.45} ${-len * 0.9} L${-w * 0.45} ${-len * 0.4} L${w * 0.45} ${-len * 0.4} L${w * 0.45} ${-len * 0.9} Z`;
    default:
      return `M${-w * 0.3} ${-len * 0.85} L${-w * 0.3} ${-len * 0.35} L${w * 0.3} ${-len * 0.85 + len * 0.5} L${w * 0.3} ${-len * 0.85} Z`;
  }
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ================= context ================= */
// mode: 'bake' (static layers, themed) | 'dark' (static layers, fixed light ink on black)
//       | 'preview' (all layers incl. live, themed, SIM data) | 'aodpreview'
export function makeCtx(face, themeIdx, mode) {
  const theme = face.themes[themeIdx] || face.themes[0];
  const dark = mode === 'dark';
  const aod = mode === 'aodpreview';
  const roles = aod ? AOD_ROLES : dark ? DARK_ROLES : theme.roles;
  const finish = (dark || aod) ? 'none' : (theme.finish || 'matte');
  const fontSvg = fontFromStack(face.fontStack).svg;
  const col = (c, fallback) => {
    if (!c) return fallback || roles.ink;
    if (typeof c !== 'string') return fallback || roles.ink;
    if (c[0] === '#') return c;
    if (c.startsWith('shade:')) {
      const [, role, amt] = c.split(':');
      return shade(roles[role] || roles.ink, parseFloat(amt));
    }
    return roles[c] || fallback || roles.ink;
  };
  const famOf = (fontStr) => fontStr ? fontFromStack(fontStr).svg : fontSvg;
  return { face, theme, roles, finish, mode, dark, aod, col, famOf };
}

/* ================= defs (gradients — verbatim ports) ================= */
export function defs(ctx) {
  return `<defs>
  <linearGradient id="metal" x1="0" y1="0" x2="0.4" y2="1">
    <stop offset="0" stop-color="#e8e9ea"/><stop offset="0.4" stop-color="#9a9da2"/>
    <stop offset="0.65" stop-color="#5f6267"/><stop offset="1" stop-color="#c9cbd0"/>
  </linearGradient>
  <linearGradient id="metalDark" x1="0" y1="0" x2="0.4" y2="1">
    <stop offset="0" stop-color="#55575c"/><stop offset="0.5" stop-color="#1c1d20"/><stop offset="1" stop-color="#3a3c41"/>
  </linearGradient>
  <linearGradient id="flange" x1="0" y1="0" x2="0.5" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity="0.12"/><stop offset="0.5" stop-color="#000" stop-opacity="0.15"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0.06"/>
  </linearGradient>
  <radialGradient id="vig">
    <stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="0.92" stop-color="#000" stop-opacity="0.26"/>
    <stop offset="1" stop-color="#000" stop-opacity="0.55"/>
  </radialGradient>
  <radialGradient id="matte" cx="0.42" cy="0.36">
    <stop offset="0" stop-color="#fff" stop-opacity="0.09"/><stop offset="0.7" stop-color="#fff" stop-opacity="0.015"/>
    <stop offset="1" stop-color="#000" stop-opacity="0.14"/>
  </radialGradient>
  <linearGradient id="brushed" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity="0.11"/><stop offset="0.35" stop-color="#fff" stop-opacity="0.02"/>
    <stop offset="0.6" stop-color="#000" stop-opacity="0.07"/><stop offset="1" stop-color="#fff" stop-opacity="0.08"/>
  </linearGradient>
  <radialGradient id="lacquer" cx="0.36" cy="0.28">
    <stop offset="0" stop-color="#fff" stop-opacity="0.18"/><stop offset="0.45" stop-color="#fff" stop-opacity="0.03"/>
    <stop offset="1" stop-color="#000" stop-opacity="0.18"/>
  </radialGradient>
  <radialGradient id="sunrayg" cx="0.5" cy="0.5">
    <stop offset="0.1" stop-color="#fff" stop-opacity="0.13"/><stop offset="0.55" stop-color="#fff" stop-opacity="0.02"/>
    <stop offset="1" stop-color="#000" stop-opacity="0.16"/>
  </radialGradient>
  <radialGradient id="sandblast" cx="0.5" cy="0.42">
    <stop offset="0" stop-color="#fff" stop-opacity="0.05"/><stop offset="1" stop-color="#000" stop-opacity="0.12"/>
  </radialGradient>
  <radialGradient id="inset" cx="0.42" cy="0.36">
    <stop offset="0.5" stop-color="#000" stop-opacity="0.05"/><stop offset="0.88" stop-color="#000" stop-opacity="0.32"/>
    <stop offset="1" stop-color="#000" stop-opacity="0.6"/>
  </radialGradient>
  <linearGradient id="lcdIn" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#000" stop-opacity="0.3"/><stop offset="0.18" stop-color="#000" stop-opacity="0.04"/>
    <stop offset="0.85" stop-color="#fff" stop-opacity="0.03"/><stop offset="1" stop-color="#fff" stop-opacity="0.1"/>
  </linearGradient>
  <radialGradient id="crystal" cx="0.5" cy="0.5">
    <stop offset="0.82" stop-color="#000" stop-opacity="0"/><stop offset="0.97" stop-color="#000" stop-opacity="0.35"/>
    <stop offset="1" stop-color="#000" stop-opacity="0.6"/>
  </radialGradient>
  <clipPath id="dialclip"><circle cx="225" cy="225" r="225"/></clipPath>
</defs>`;
}
const METAL = 'url(#metal)';
const METALD = 'url(#metalDark)';

/* ================= layer classification ================= */
// Live layers render natively in WFF; static layers bake into the dial image.
export function isLive(L) {
  if (L.t === 'hand') return true;
  if (L.t === 'arc' && L.data) return true;
  if (L.t === 'text' && L.token) return true;
  return false;
}

/* ================= single-layer SVG ================= */
// opts: { skipTrack:false } — for preview, arcs draw track+fill; bake draws track only.
export function layerSvg(ctx, L, forBake) {
  const { col, aod, dark, finish } = ctx;
  const cx = L.cx != null ? L.cx : C;
  const cy = L.cy != null ? L.cy : C;
  if (L.hidden) return '';
  const flat = dark || aod; // simplified hardware rendering on pure black
  switch (L.t) {
    case 'dial': {
      let s = `<circle cx="${C}" cy="${C}" r="225" fill="${flat ? '#000' : col(L.color, ctx.roles.bg)}"/>`;
      if (!flat) {
        if (finish === 'brushRadial' || finish === 'sunray') {
          const n = finish === 'sunray' ? 72 : 120;
          let lines = '';
          for (let i = 0; i < n; i++) {
            const a = (360 * i) / n;
            const [x1, y1] = polar(C, C, 30, a);
            const [x2, y2] = polar(C, C, 225, a);
            lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${i % 2 ? '#ffffff' : '#000000'}" stroke-width="${finish === 'sunray' ? 3.2 : 1}" opacity="${finish === 'sunray' ? 0.045 : 0.05}"/>`;
          }
          s += `<g>${lines}</g>`;
        }
        const fin = finish === 'brushRadial' ? 'matte' : (finish === 'sunray' ? 'sunrayg' : finish);
        if (fin !== 'none') s += `<circle cx="${C}" cy="${C}" r="225" fill="url(#${fin})"/>`;
        s += `<circle cx="${C}" cy="${C}" r="225" fill="url(#vig)"/>`;
      }
      return s;
    }
    case 'flange': {
      const r0 = L.r0 != null ? L.r0 : 225, r1 = L.r1 != null ? L.r1 : 200;
      let s = `<circle cx="${C}" cy="${C}" r="${r0}" fill="${col(L.color, shade(ctx.roles.bg, -0.35))}"/>`;
      if (!flat) s += `<circle cx="${C}" cy="${C}" r="${r0}" fill="url(#flange)"/>`;
      s += `<circle cx="${C}" cy="${C}" r="${r1}" fill="${flat ? '#000' : col(L.floor, ctx.roles.bg)}"/>`;
      if (!flat) {
        s += `<circle cx="${C}" cy="${C}" r="${r1}" fill="none" stroke="#000" stroke-width="5" opacity="0.4"/>`;
        s += `<circle cx="${C}" cy="${C}" r="${r1 - 4}" fill="none" stroke="#fff" stroke-width="1" opacity="0.07"/>`;
      } else {
        s += `<circle cx="${C}" cy="${C}" r="${r1}" fill="none" stroke="${ctx.roles.muted}" stroke-width="1" opacity="0.5"/>`;
      }
      return s;
    }
    case 'applied': {
      let items = '';
      const n = L.count || 12;
      for (let i = 0; i < n; i++) {
        if (L.skip && L.skip.includes(i)) continue;
        const a = (360 * i) / n;
        const major = i % 3 === 0;
        const w = (L.w || 7) * (major && L.majorScale ? L.majorScale : 1);
        const len = (L.len || 18) * (major && L.majorScale ? L.majorScale : 1);
        const [x, y] = polar(cx, cy, L.r, a);
        let g = '';
        if (!flat) g += `<rect x="${x - w / 2 + 1.2}" y="${y - 1.2 + 1.6}" width="${w}" height="${len}" fill="#000" opacity="0.45"/>`;
        g += `<rect x="${x - w / 2}" y="${y - 1.2}" width="${w}" height="${len}" fill="${flat ? ctx.roles.ink : (L.metal === 'dark' ? METALD : METAL)}"/>`;
        if (!flat) g += `<rect x="${x - w / 2}" y="${y - 1.2}" width="${w * 0.45}" height="${len}" fill="#fff" opacity="0.22"/>`;
        if (L.lume && !flat) g += `<rect x="${x - w * 0.22}" y="${y + 1.2}" width="${w * 0.44}" height="${len - 4.8}" fill="${col('lume')}" opacity="0.95"/>`;
        items += `<g transform="rotate(${a} ${x} ${y})">${g}</g>`;
      }
      return `<g>${items}</g>`;
    }
    case 'ring':
      return `<circle cx="${cx}" cy="${cy}" r="${L.r}" fill="none" stroke="${col(L.color)}" stroke-width="${L.w || 1}"${L.opacity != null ? ` opacity="${L.opacity}"` : ''}${L.dash ? ` stroke-dasharray="${L.dash}"` : ''}/>`;
    case 'circle':
      return `<circle cx="${cx}" cy="${cy}" r="${L.r}" fill="${col(L.color)}"${L.opacity != null ? ` opacity="${L.opacity}"` : ''}${L.stroke ? ` stroke="${col(L.stroke)}" stroke-width="${L.sw || 1}"` : ''}/>`;
    case 'rect':
      return `<rect x="${L.x}" y="${L.y}" width="${L.w}" height="${L.h}"${L.rx ? ` rx="${L.rx}"` : ''} fill="${col(L.color)}"${L.opacity != null ? ` opacity="${L.opacity}"` : ''}${L.stroke ? ` stroke="${col(L.stroke)}" stroke-width="${L.sw || 1}"` : ''}/>`;
    case 'line':
      return `<line x1="${L.x1}" y1="${L.y1}" x2="${L.x2}" y2="${L.y2}" stroke="${col(L.color)}" stroke-width="${L.w || 1}"${L.opacity != null ? ` opacity="${L.opacity}"` : ''} stroke-linecap="${L.cap || 'butt'}"/>`;
    case 'ticks': {
      const n = L.count, from = L.from || 0, span = (L.to != null ? L.to : 360 + from) - from;
      const full = L.to == null;
      let ticks = '';
      for (let i = 0; i < (full ? n : n + 1); i++) {
        if (L.skipEvery && i % L.skipEvery === 0) continue;
        if (L.onlyEvery && i % L.onlyEvery !== 0) continue;
        const a = from + (span * i) / n;
        const [x1, y1] = polar(cx, cy, L.r, a);
        const [x2, y2] = polar(cx, cy, L.r - L.len, a);
        ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col(L.color)}" stroke-width="${L.w || 1}" stroke-linecap="${L.cap || 'butt'}"/>`;
      }
      return `<g${L.opacity != null ? ` opacity="${L.opacity}"` : ''}>${ticks}</g>`;
    }
    case 'dots': {
      const n = L.count;
      let dots = '';
      for (let i = 0; i < n; i++) {
        const a = (360 * i) / n;
        if (L.skipEvery && i % L.skipEvery === 0) continue;
        const [x, y] = polar(cx, cy, L.r, a);
        dots += `<circle cx="${x}" cy="${y}" r="${L.dot || 1.5}" fill="${col(L.color)}"/>`;
      }
      return `<g${L.opacity != null ? ` opacity="${L.opacity}"` : ''}>${dots}</g>`;
    }
    case 'numerals': {
      const vals = L.vals, n = vals.length;
      const from = L.from || 0, span = (L.to != null ? L.to : 360 + from) - from;
      const full = L.to == null;
      let texts = '';
      vals.forEach((v, i) => {
        if (v === null || v === '') return;
        const a = from + (span * i) / (full ? n : n - 1);
        const [x, y] = polar(cx, cy, L.r, a);
        texts += `<text x="${x}" y="${y}" fill="${col(L.color)}" font-size="${L.size}" font-family="${ctx.famOf(L.font)}" font-weight="${L.weight || 600}" text-anchor="middle" dominant-baseline="central">${esc(v)}</text>`;
      });
      return `<g${L.opacity != null ? ` opacity="${L.opacity}"` : ''}>${texts}</g>`;
    }
    case 'label':
    case 'text': {
      const str = L.t === 'label' ? L.text : tokenText(L.token);
      if (str === '') return '';
      return `<text x="${L.x}" y="${L.y}" fill="${col(L.color)}" font-size="${L.size}" font-family="${ctx.famOf(L.font)}" font-weight="${L.weight || 500}" text-anchor="${L.anchor || 'middle'}" dominant-baseline="${L.baseline || 'central'}"${L.opacity != null ? ` opacity="${L.opacity}"` : ''}${L.rotate ? ` transform="rotate(${L.rotate} ${L.x} ${L.y})"` : ''}>${esc(str)}</text>`;
    }
    case 'arc': {
      const from = L.from != null ? L.from : 0;
      const to = L.to != null ? L.to : 360;
      let s = '';
      if (L.track) {
        s += `<path d="${arcPath(cx, cy, L.r, from, Math.min(to, from + 359.9))}" fill="none" stroke="${col(L.track)}" stroke-width="${L.w}" stroke-linecap="${L.cap || 'butt'}" opacity="${L.trackOpacity != null ? L.trackOpacity : 0.35}"/>`;
      }
      if (!(forBake && L.data)) {
        const frac = L.data ? dataFrac(L.data) : (L.value != null ? L.value : 1);
        const a1 = from + (to - from) * Math.max(0.002, Math.min(frac, 0.998));
        s += `<path d="${arcPath(cx, cy, L.r, from, a1)}" fill="none" stroke="${col(L.color)}" stroke-width="${L.w}" stroke-linecap="${L.cap || 'butt'}"${L.opacity != null ? ` opacity="${L.opacity}"` : ''}/>`;
      }
      return s;
    }
    case 'plate': {
      const rim = L.rim || 3;
      let s = '';
      if (!flat) s += `<circle cx="${cx + 1.5}" cy="${cy + 2.5}" r="${L.r + rim}" fill="#000" opacity="0.4"/>`;
      s += `<circle cx="${cx}" cy="${cy}" r="${L.r + rim}" fill="${flat ? '#111' : METAL}"/>`;
      s += `<circle cx="${cx}" cy="${cy}" r="${L.r}" fill="${col(L.color, flat ? '#000' : shade(ctx.roles.bg, -0.4))}"/>`;
      if (!flat) {
        s += `<circle cx="${cx}" cy="${cy}" r="${L.r}" fill="url(#inset)"/>`;
        for (let ri = L.r - 6; ri > 8; ri -= 7) {
          s += `<circle cx="${cx}" cy="${cy}" r="${ri}" fill="none" stroke="#fff" stroke-width="0.5" opacity="0.035"/>`;
        }
        s += `<circle cx="${cx}" cy="${cy}" r="${L.r + rim - 0.6}" fill="none" stroke="#fff" stroke-width="0.8" opacity="0.18"/>`;
      }
      return s;
    }
    case 'hand':
      return handSvg(ctx, L, cx, cy);
    case 'panel': {
      const fr = 4;
      let s = '';
      if (!flat) s += `<rect x="${L.x - fr + 1.5}" y="${L.y - fr + 2.5}" width="${L.w + fr * 2}" height="${L.h + fr * 2}" rx="${(L.rx || 6) + fr}" fill="#000" opacity="0.45"/>`;
      s += `<rect x="${L.x - fr}" y="${L.y - fr}" width="${L.w + fr * 2}" height="${L.h + fr * 2}" rx="${(L.rx || 6) + fr}" fill="${flat ? '#111' : METALD}"/>`;
      s += `<rect x="${L.x}" y="${L.y}" width="${L.w}" height="${L.h}" rx="${L.rx != null ? L.rx : 6}" fill="${col(L.color)}"/>`;
      if (!flat) {
        s += `<rect x="${L.x}" y="${L.y}" width="${L.w}" height="${L.h}" rx="${L.rx != null ? L.rx : 6}" fill="url(#lcdIn)"/>`;
        s += `<rect x="${L.x + 1}" y="${L.y + 1}" width="${L.w - 2}" height="${L.h - 2}" rx="${(L.rx != null ? L.rx : 6) - 1}" fill="none" stroke="#fff" stroke-width="0.8" opacity="0.14"/>`;
      }
      return s;
    }
    case 'icon': {
      const d = ICONS[L.name];
      if (!d) return '';
      return `<path d="${d}" transform="translate(${L.x} ${L.y}) scale(${(L.s || 12) / 12})" ${L.filled ? `fill="${col(L.color)}" stroke="none"` : `fill="none" stroke="${col(L.color)}"`} stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"${L.opacity != null ? ` opacity="${L.opacity}"` : ''}/>`;
    }
    case 'poly':
      return `<polygon points="${L.points}" fill="${L.metal ? (L.metal === 'dark' ? METALD : METAL) : col(L.color)}"${L.opacity != null ? ` opacity="${L.opacity}"` : ''}${L.transform ? ` transform="${L.transform}"` : ''}/>`;
    case 'screw': {
      if (flat) return '';
      const r = L.r || 5;
      return `<g${L.opacity != null ? ` opacity="${L.opacity}"` : ''}>
<circle cx="${cx + 0.8}" cy="${cy + 1.4}" r="${r + 0.8}" fill="#000" opacity="0.5"/>
<circle cx="${cx}" cy="${cy}" r="${r}" fill="${METAL}"/>
<circle cx="${cx}" cy="${cy}" r="${r - 0.8}" fill="none" stroke="#fff" stroke-width="0.6" opacity="0.25"/>
<line x1="${cx - r * 0.6}" y1="${cy}" x2="${cx + r * 0.6}" y2="${cy}" stroke="#0a0a0a" stroke-width="1.6" transform="rotate(${L.a || 30} ${cx} ${cy})"/></g>`;
    }
    case 'bridge': {
      if (flat) return '';
      const [ox0, oy0] = polar(cx, cy, L.r1, L.a0);
      const [ox1, oy1] = polar(cx, cy, L.r1, L.a1);
      const [ix1, iy1] = polar(cx, cy, L.r0, L.a1);
      const [ix0, iy0] = polar(cx, cy, L.r0, L.a0);
      const lg1 = Math.abs(L.a1 - L.a0) > 180 ? 1 : 0;
      const d = `M ${ox0} ${oy0} A ${L.r1} ${L.r1} 0 ${lg1} 1 ${ox1} ${oy1} L ${ix1} ${iy1} A ${L.r0} ${L.r0} 0 ${lg1} 0 ${ix0} ${iy0} Z`;
      return `<g><path d="${d}" fill="#000" opacity="0.5" transform="translate(1.5 2.5)"/>
<path d="${d}" fill="${col(L.color, shade(ctx.roles.bg, -0.5))}"/>
<path d="${d}" fill="none" stroke="#fff" stroke-width="0.7" opacity="0.08"/></g>`;
    }
    default:
      return '';
  }
}

/* ---- hand rendering (preview + sprite share this) ---- */
// Returns inner SVG for a hand drawn at pivot (0,0) pointing up; caller wraps in transform.
export function handParts(ctx, L, opts = {}) {
  const { col, dark, aod } = ctx;
  const flat = dark || aod;
  const shape = L.shape || 'needle';
  const w = L.w || 4;
  const body = handPath(shape, L.len, w, L.tail || 0);
  let s = '';
  if (!flat && L.shadow !== false) {
    s += `<path d="${body}" fill="#000" opacity="0.38" transform="translate(2.2 3.2)"/>`;
  }
  const fill = flat ? col(L.color) : (L.metal ? (L.metal === 'dark' ? METALD : METAL) : col(L.color));
  s += `<path d="${body}" fill="${fill}"${L.stroke && !flat ? ` stroke="${col(L.stroke)}" stroke-width="${L.sw || 0}"` : ''}/>`;
  if (!flat && (L.metal || w >= 4)) {
    s += `<path d="${handPath('needle', L.len * 0.96, w * 0.32, (L.tail || 0) * 0.9)}" fill="#fff" opacity="${L.metal ? 0.28 : 0.12}"/>`;
  }
  // `slot: true` = a lume slot milled down the hand. Must be an exact boolean test:
  // a complication-slot tag (slot: 'SLOT-A2-1') is also truthy and would mill a
  // black channel into every tagged register hand.
  if (L.slot === true && !flat) {
    s += `<rect x="${-w * 0.42}" y="${-L.len * 0.76}" width="${w * 0.84}" height="${L.len * 0.58}" rx="${w * 0.42}" fill="#0a0a0b" opacity="0.92"/>`;
    s += `<circle cx="0" cy="${(L.tail || 0) * 0.55}" r="${w * 0.3}" fill="#0a0a0b" opacity="0.92"/>`;
  }
  if (L.lume && !flat) {
    s += `<path d="${lumePath(shape, L.len, w, L.tail || 0)}" fill="${col(L.lume === true ? 'lume' : L.lume)}"/>`;
  }
  if (L.hub && opts.includeHub !== false) {
    if (!flat) s += `<circle cx="1" cy="1.6" r="${L.hub}" fill="#000" opacity="0.4"/>`;
    s += `<circle cx="0" cy="0" r="${L.hub}" fill="${flat ? col(L.hubColor || L.color) : METAL}"/>`;
    if (!flat) s += `<circle cx="0" cy="0" r="${L.hub * 0.45}" fill="${col(L.hubColor || L.color)}"/>`;
  }
  return s;
}

function handSvg(ctx, L, cx, cy) {
  let angle = 0;
  if (L.kind === 'hour') angle = ((NOW.h % 12) + NOW.m / 60) * 30;
  else if (L.kind === 'minute') angle = (NOW.m + NOW.s / 60) * 6;
  else if (L.kind === 'second') angle = (NOW.h * 3600 + NOW.m * 60 + NOW.s) % 60 * 6;
  else if (L.kind === 'data') {
    const f = dataFrac(L.data);
    angle = (L.from || 0) + ((L.to != null ? L.to : 360) - (L.from || 0)) * f;
  }
  // seconds angle: use seconds-in-minute for preview realism
  if (L.kind === 'second') angle = NOW.s * 6;
  return `<g transform="rotate(${angle} ${cx} ${cy})"><g transform="translate(${cx} ${cy})">${handParts(ctx, L)}</g></g>`;
}

/* ================= full-face SVG (bakes + previews) ================= */
export function faceSvg(ctx, layers, { withCrystal = true, forBake = false } = {}) {
  const body = layers.map(L => layerSvg(ctx, L, forBake)).join('\n');
  const bg = ctx.aod || ctx.dark ? '#000' : ctx.roles.bg;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="450" height="450" viewBox="0 0 450 450">
${defs(ctx)}
<g clip-path="url(#dialclip)">
<circle cx="225" cy="225" r="225" fill="${bg}"/>
${body}
</g>
${withCrystal && !ctx.aod ? `<circle cx="225" cy="225" r="225" fill="url(#crystal)"/>` : ''}
</svg>`;
}

/* ================= hand sprite geometry + SVG ================= */
// A sprite canvas tightly containing the hand incl. shadow/tail/hub, with pivot recorded.
export function handSpriteGeom(L) {
  const w = L.w || 4;
  const shape = L.shape || 'needle';
  const halfW = Math.max(
    shape === 'arrow' ? w * 1.5 : w,
    L.hub || 0
  );
  const up = Math.max(L.len, 0, L.hub || 0);           // reach above pivot
  const down = Math.max(L.tail || 0, L.len < 0 ? -L.len : 0, L.hub || 0); // below pivot
  const pad = 6; // room for shadow offset (2.2,3.2) + stroke
  const W = 2 * (halfW + pad);
  const H = up + down + 2 * pad;
  return { W: Math.ceil(W), H: Math.ceil(H), pivotX: W / 2, pivotY: pad + up };
}
// Merge several hand layers that rotate together (e.g. seconds needle + counterweight).
export function mergedSpriteGeom(hands) {
  const geoms = hands.map(handSpriteGeom);
  const up = Math.max(...hands.map(L => Math.max(L.len, 0, L.hub || 0)));
  const down = Math.max(...hands.map(L => Math.max(L.tail || 0, L.len < 0 ? -L.len : 0, L.hub || 0)));
  const halfW = Math.max(...geoms.map(g => g.W / 2 - 6));
  const pad = 6;
  const W = Math.ceil(2 * (halfW + pad));
  const H = Math.ceil(up + down + 2 * pad);
  return { W, H, pivotX: W / 2, pivotY: pad + up };
}
export function handSpriteSvg(ctx, hands, geom) {
  const inner = hands.map(L => handParts(ctx, L)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${geom.W}" height="${geom.H}" viewBox="0 0 ${geom.W} ${geom.H}">
${defs(ctx)}
<g transform="translate(${geom.pivotX} ${geom.pivotY})">${inner}</g>
</svg>`;
}

/* ================= region sprite (a slot's empty-state artwork) ================= */
// Renders `layers` in dial coordinates but cropped to `box`, on transparency. Used for
// the empty-state default art of a complication slot: the same layer recipes the dial
// bake uses, so the art is pixel-identical to when it was baked into dial_t*.png — it
// has merely moved into the slot's EMPTY block so the platform can swap it out.
export function regionSvg(ctx, layers, box) {
  const body = layers.map(L => layerSvg(ctx, L, true)).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${box.w}" height="${box.h}" viewBox="${box.x} ${box.y} ${box.w} ${box.h}">
${defs(ctx)}
${body}
</svg>`;
}

/* ================= icon sprite (for complication content) ================= */
export function iconSpriteSvg(ctx, L, box = 24) {
  const d = ICONS[L.name];
  const scale = (L.s || 12) / 12;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${box}" height="${box}" viewBox="0 0 ${box} ${box}">
<path d="${d}" transform="translate(${box / 2} ${box / 2}) scale(${scale})" ${L.filled ? `fill="${ctx.col(L.color)}" stroke="none"` : `fill="none" stroke="${ctx.col(L.color)}"`} stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}
