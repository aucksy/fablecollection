// Rescale a WFF watchface.xml from a 300-unit canvas to 450 (×1.5) so it renders at ~native
// resolution on 450–456px Wear OS 6 displays instead of being upscaled 1.5× (which softens all
// vector/text). This is a uniform geometric zoom: identical layout, higher render buffer.
//
// Scales ONLY absolute-pixel attributes; leaves normalized pivots (0–1), em letterSpacing,
// alpha, angles (angle/startAngle/endAngle), gradient positions, colors, and all expressions
// untouched. Verified against the 16 faces: no <Transform> targets geometry, all pivots ≤ 1.
//
// Usage:  node tools/rescale-canvas.mjs <watchface.xml> [factor]   (default factor 1.5)

import fs from 'node:fs';

const file = process.argv[2];
const K = Number(process.argv[3] ?? 1.5);
if (!file) { console.error('usage: rescale-canvas.mjs <file> [factor]'); process.exit(1); }

// Absolute-pixel attributes (scale). x/y are matched case-sensitively so pivotX/centerX/startX
// etc. (capital second letter) are NOT caught by the bare x=/y= rule — they have their own rules.
const SCALE_ATTRS = [
  'width', 'height', 'size', 'thickness', 'radius',
  'centerX', 'centerY', 'startX', 'startY', 'endX', 'endY',
];

function fmt(n) {
  // trim to 4dp, drop trailing zeros / dot
  const r = Math.round(n * 1e4) / 1e4;
  return String(r);
}

let xml = fs.readFileSync(file, 'utf8');

// Named pixel attributes: attr="<number>"
for (const attr of SCALE_ATTRS) {
  const re = new RegExp(`(\\b${attr}=")(-?[0-9]*\\.?[0-9]+)(")`, 'g');
  xml = xml.replace(re, (_m, a, num, b) => a + fmt(Number(num) * K) + b);
}

// Bare position x=/y= — lowercase only, word-boundary before, so pivotX/startY/etc. are excluded.
for (const axis of ['x', 'y']) {
  const re = new RegExp(`(\\b${axis}=")(-?[0-9]*\\.?[0-9]+)(")`, 'g');
  xml = xml.replace(re, (_m, a, num, b) => a + fmt(Number(num) * K) + b);
}

// dashIntervals="1 6" — a space-separated pixel list; scale each token.
xml = xml.replace(/(\bdashIntervals=")([^"]+)(")/g, (_m, a, list, b) =>
  a + list.trim().split(/\s+/).map((t) => fmt(Number(t) * K)).join(' ') + b,
);

fs.writeFileSync(file, xml);
console.log(`rescaled ${file} ×${K}`);
