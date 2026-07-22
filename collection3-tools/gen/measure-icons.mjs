/* Measure what each engraved glyph ACTUALLY renders as — don't infer it from the path
   coordinates. The paths are not symmetric about their origin and their extreme vertices are
   thin tips that antialias away, so "max |coord|" overstates the height and misplaces the
   centre: the battery bolt reads 5x7 centred 1 unit ABOVE its anchor, not 5.7x8.5 centred on
   it. Renders each glyph exactly as `svglib` draws it, through the same rasteriser that bakes
   the dial, and reports the ink box. Run after touching ICONS.  node gen/measure-icons.mjs */
import { ICONS } from './svglib.mjs';
import { Resvg } from './node_modules/@resvg/resvg-js/index.js';

const S = 12, PAD = 40, Z = 8;           // draw at the authoring size, zoomed for precision
const FILLED = new Set(['bolt', 'steps', 'moon', 'msg']);   // svglib: filled:true in the specs
const out = {};
for (const [name, d] of Object.entries(ICONS)) {
  const paint = FILLED.has(name) ? 'fill="#fff" stroke="none"'
    : 'fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PAD * 2 * Z}" height="${PAD * 2 * Z}" viewBox="0 0 ${PAD * 2} ${PAD * 2}">`
    + `<rect width="100%" height="100%" fill="#000"/>`
    + `<path d="${d}" transform="translate(${PAD} ${PAD}) scale(${S / 12})" ${paint}/></svg>`;
  const rendered = new Resvg(svg).render();
  const width = rendered.width, height = rendered.height;
  const pix = rendered.pixels;   // RGBA bytes
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = pix[(y * width + x) * 4];       // red channel; glyph is white on black
      if (a > 60) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
  }
  const w = (x1 - x0 + 1) / Z, h = (y1 - y0 + 1) / Z;
  const cx = ((x0 + x1) / 2) / Z - PAD, cy = ((y0 + y1) / 2) / Z - PAD;   // offset from the anchor
  out[name] = { w: +w.toFixed(2), h: +h.toFixed(2), dx: +cx.toFixed(2), dy: +cy.toFixed(2) };
  console.log(`  ${name.padEnd(6)} ${w.toFixed(2)} x ${h.toFixed(2)}  centre offset (${cx.toFixed(2)}, ${cy.toFixed(2)})  @ size ${S}`);
}
console.log('\n' + JSON.stringify(out));
