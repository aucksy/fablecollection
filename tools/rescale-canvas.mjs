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

// WFF requires INTEGER position/size geometry (x/y/width/height and the drawing coords) — the
// valid faces are all-integer here. Round these after scaling. font `size` and stroke `thickness`
// are float-OK (proven: original size="9.5", Arclight thickness="1.4" both validate) → keep decimal.
const ROUND_ATTRS = [
  'width', 'height', 'radius', 'centerX', 'centerY', 'startX', 'startY', 'endX', 'endY',
];
const FLOAT_ATTRS = ['size', 'thickness'];

// trim a float to 4dp, drop trailing zeros / dot
const fmtFloat = (n) => String(Math.round(n * 1e4) / 1e4);
const fmtInt = (n) => String(Math.round(n));

let xml = fs.readFileSync(file, 'utf8');

for (const attr of ROUND_ATTRS) {
  const re = new RegExp(`(\\b${attr}=")(-?[0-9]*\\.?[0-9]+)(")`, 'g');
  xml = xml.replace(re, (_m, a, num, b) => a + fmtInt(Number(num) * K) + b);
}
for (const attr of FLOAT_ATTRS) {
  const re = new RegExp(`(\\b${attr}=")(-?[0-9]*\\.?[0-9]+)(")`, 'g');
  xml = xml.replace(re, (_m, a, num, b) => a + fmtFloat(Number(num) * K) + b);
}

// Bare position x=/y= (integers) — lowercase only, word-boundary, so pivotX/startY/etc. excluded.
for (const axis of ['x', 'y']) {
  const re = new RegExp(`(\\b${axis}=")(-?[0-9]*\\.?[0-9]+)(")`, 'g');
  xml = xml.replace(re, (_m, a, num, b) => a + fmtInt(Number(num) * K) + b);
}

// dashIntervals="1 6" — space-separated pixel list; scale each token, round to int.
xml = xml.replace(/(\bdashIntervals=")([^"]+)(")/g, (_m, a, list, b) =>
  a + list.trim().split(/\s+/).map((t) => fmtInt(Number(t) * K)).join(' ') + b,
);

fs.writeFileSync(file, xml);
console.log(`rescaled ${file} ×${K}`);
