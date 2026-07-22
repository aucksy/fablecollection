/* ============================================================================
   FIT CHECK — does everything a slot draws stay clear of the dial art around it?

   The polish skill's §7 says to verify this ARITHMETICALLY, not by eye. It was
   skipped once and the owner caught it: a provider icon was sized from
   `layerExtent` — a deliberately PADDED box meant for overlap tests — so it drew
   at nearly twice the engraved glyph it stands in for and printed over the
   battery register's "50". A collision box and a drawing box are not the same
   number, and a screenshot at page scale hid it.

   Run standalone, or let `tools/face-review/check.mjs` run it for you:
     node gen/fit-check.mjs [WF-A2 ...]
   Exits non-zero if anything overlaps.
   ========================================================================== */
import { iconBox, iconClearY } from './svglib.mjs';

const SPECS = ['cat-a2'];
const want = process.argv.slice(2);
const rad = (a) => a * Math.PI / 180;
let bad = 0;

for (const specName of SPECS) {
  const mod = await import(`../spec/${specName}.js`);
  for (const face of mod.category.faces) {
    if (want.length && !want.includes(face.id)) continue;
    for (const slot of (face.complications || []).filter(s => s.frame === 'plate')) {
      const icon = face.layers.find(L => L.t === 'icon'
        && Math.abs(L.x - slot.cx) < 2 && Math.abs(L.y - slot.cy) < slot.r);
      const nums = face.layers.find(L => L.t === 'numerals'
        && Math.abs((L.cx ?? -1e9) - slot.cx) < 2 && Math.abs((L.cy ?? -1e9) - slot.cy) < 2);
      if (!icon || !nums) continue;
      const box = iconBox(icon.name, icon.s);
      // measure where the generator ACTUALLY puts it, nudge included
      const drawY = iconClearY({ cx: slot.cx, cy: slot.cy, engravedScale: nums }, icon, box);
      const ix0 = icon.x - box / 2, ix1 = icon.x + box / 2;
      const iy0 = drawY - box / 2, iy1 = drawY + box / 2;
      const vals = nums.vals || [];
      const full = nums.to == null, from = nums.from || 0;
      const span = (nums.to != null ? nums.to : 360 + from) - from;
      let worst = Infinity, who = '';
      vals.forEach((v, i) => {
        if (v === null || v === '') return;
        const a = from + span * (i / (full ? vals.length : vals.length - 1));
        const nx = slot.cx + nums.r * Math.sin(rad(a));
        const ny = slot.cy - nums.r * Math.cos(rad(a));
        // glyph metrics for the dial's condensed faces: ~0.55 em advance, ~0.72 em cap
        const hw = String(v).length * 0.55 * nums.size / 2, hh = 0.72 * nums.size / 2;
        // two boxes are clear if they separate on EITHER axis
        const gap = Math.max(Math.max(nx - hw - ix1, ix0 - (nx + hw)),
                             Math.max(ny - hh - iy1, iy0 - (ny + hh)));
        if (gap < worst) { worst = gap; who = String(v); }
      });
      const ok = worst >= 0;
      if (!ok) bad++;
      console.log(`  ${ok ? 'OK  ' : 'FAIL'} ${face.id} ${slot.label.padEnd(18)} ` +
        `icon "${icon.name}" ${box}x${box}${Math.abs(drawY - icon.y) > 0.05 ? ` (nudged ${(icon.y - drawY).toFixed(1)} up)` : ''} vs numeral "${who}": ` +
        `${ok ? `clear by ${worst.toFixed(1)}` : `OVERLAPS by ${(-worst).toFixed(1)}`} units`);
    }
  }
}
console.log(bad ? `\n  ${bad} overlap(s) — fix before showing the face.` : '  slot content clears the dial art.');
process.exit(bad ? 1 : 0);
