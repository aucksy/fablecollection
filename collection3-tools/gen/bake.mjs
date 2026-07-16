// Asset baker — renders every PNG a face needs via resvg (the Fable Collection
// asset pipeline), from the same analysis the XML emitter uses, so bake and
// XML can never disagree about which layers are baked vs live.
//
// Per face:
//   dial_t0..t4.png  static layers, themed (finish/vignette/crystal baked)
//   dial_dark.png    static layers, fixed light ink on pure black (§5.2a)
//   preview.png      full render, theme 01, 10:08:36, SIM data (450px)
//   ic_launcher.png  192px round face render
//   hand/needle/subsec sprites per theme + dark + AOD, pivot geometry recorded
//   lbl_* / ic_* sprites for provider-block captions/icons

import { Resvg } from '@resvg/resvg-js';
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeCtx, faceSvg, layerSvg, handSpriteSvg, iconSpriteSvg, regionSvg, defs, isLive, tokenText } from './svglib.mjs';
import { fontFromStack, snapWeight, DARK_ROLES, AOD_MUT } from './data.mjs';
import { colFor, TOKEN_TPL, TIME_TOKENS, PROVIDER_ONLY, dashLayerFor } from './wff.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(__dirname, '../..');
const FONT_DIR = resolve(ROOT, 'collection3-tools/fonts');
const FONT_FILES = readdirSync(FONT_DIR).filter(f => f.endsWith('.ttf')).map(f => resolve(FONT_DIR, f));

export function render(svg, outPath, widthPx) {
  const r = new Resvg(svg, {
    background: 'rgba(0,0,0,0)',
    fitTo: { mode: 'width', value: widthPx },
    font: { loadSystemFonts: false, fontDirs: [FONT_DIR], fontFiles: FONT_FILES, defaultFontFamily: 'Archivo' },
  });
  const png = r.render().asPng();
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, png);
  return png.length;
}

/* Which layers belong in the static dial bake? Mirrors the emitter's analysis. */
const LIVE_KINDS = new Set(['mainHand', 'centerSecond', 'subSecond', 'dataNeedle', 'dataArc',
  'liveText', 'timeText', 'ampm', 'slotText', 'providerOnlyText', 'centerCap',
  'overlayStatic', 'dateGatedStatic', 'slotDecoration']);

function gateDefaultOn(item, toggles) {
  const L = item.L;
  if (item.kind === 'centerSecond') return toggles.seconds ? toggles.seconds.default : true;
  if (item.kind === 'dataArc') {
    const d = L.data;
    if (d === 'seconds') {
      if (toggles.secring) return toggles.secring.default;
      if (toggles.seconds) return toggles.seconds.default;
    }
    if (d === 'day' && toggles.dayarc) return toggles.dayarc.default;
    if (d === 'battery' && toggles.batt) return toggles.batt.default;
    if ((d === 'battery' || d === 'steps') && toggles.gauges) return toggles.gauges.default;
  }
  return true;
}
function arcIsGated(item, toggles) {
  const L = item.L;
  if (item.kind !== 'dataArc') return false;
  const d = L.data;
  if (d === 'seconds') return !!(toggles.secring || toggles.seconds);
  if (d === 'day') return !!toggles.dayarc;
  if (d === 'battery') return !!(toggles.batt || toggles.gauges);
  if (d === 'steps') return !!toggles.gauges;
  return false;
}

export function bakeFace(entry, emitted, log) {
  const { face, dir } = entry;
  const { analysis, sprites } = emitted;
  const outDrawableHi = (n) => resolve(ROOT, dir, 'app/src/main/res/drawable-nodpi', `${n}.png`);
  const outDrawable = (n) => resolve(ROOT, dir, 'app/src/main/res/drawable', `${n}.png`);
  const sizes = [];

  // ---------- static dial bakes ----------
  const staticItems = analysis.items.filter(it => !LIVE_KINDS.has(it.kind));
  // A tagged slot's '—' belongs to its empty state, so it bakes into that slot's art
  // sprite instead of the dial (where it could never react to a provider arriving).
  const dashes = analysis.slots.filter(s => s.dash && !s.tagged).map(dashLayerFor).filter(Boolean);
  // ungated data-arc tracks are baked (gated arcs carry their own track live). A tagged
  // arc is a slot's empty-state artwork: it takes its track into the EMPTY block with it,
  // or the track would survive on the dial after a provider replaced the arc.
  const bakedTracks = analysis.items
    .filter(it => it.kind === 'dataArc' && it.L.track && !it.inEmpty && !arcIsGated(it, analysis.toggles))
    .map(it => ({ ...it.L, __trackOnly: true }));

  face.themes.forEach((th, ti) => {
    const ctx = makeCtx(face, ti, 'bake');
    const body = [
      ...staticItems.map(it => layerSvg(ctx, it.L, true)),
      ...bakedTracks.map(L => layerSvg(ctx, L, true)),
      ...dashes.map(L => layerSvg(ctx, L, true)),
    ].join('\n');
    const svg = wrapFace(ctx, body);
    sizes.push(render(svg, outDrawableHi(`dial_t${ti}`), 900));
  });
  {
    const ctx = makeCtx(face, 0, 'dark');
    const body = [
      ...staticItems.map(it => layerSvg(ctx, it.L, true)),
      ...bakedTracks.map(L => layerSvg(ctx, L, true)),
      ...dashes.map(L => layerSvg(ctx, L, true)),
    ].join('\n');
    sizes.push(render(wrapFace(ctx, body), outDrawableHi('dial_dark'), 900));
  }

  // ---------- preview + launcher (theme 01, defaults respected) ----------
  {
    const ctx = makeCtx(face, 0, 'preview');
    const previewLayers = face.layers.filter((L, i) => {
      const item = analysis.items[i];
      if (item.kind === 'dataArc' && arcIsGated(item, analysis.toggles) && !gateDefaultOn(item, analysis.toggles)) return false;
      if (item.kind === 'centerSecond' && analysis.toggles.seconds && !analysis.toggles.seconds.default) return false;
      return true;
    });
    const body = previewLayers.map(L => layerSvg(ctx, L, false)).join('\n');
    const svg = wrapFace(ctx, body);
    render(svg, outDrawableHi('preview'), 450);
    render(svg, outDrawable('ic_launcher'), 192);
  }

  // ---------- sprites ----------
  for (const sp of sprites) {
    const mode = sp.tag === 'dark' ? 'dark' : sp.tag === 'aod' ? 'aodpreview' : 'bake';
    const themeIdx = sp.tag.startsWith('t') ? Number(sp.tag.slice(1)) : 0;
    const ctx = makeCtx(face, themeIdx, mode);
    if (sp.hands) {
      const svg = handSpriteSvg(ctx, sp.hands, sp.geom);
      sizes.push(render(svg, outDrawableHi(sp.name), sp.geom.W * 2));
    } else if (sp.slotart) {
      const { layers, box } = sp.slotart;
      sizes.push(render(regionSvg(ctx, layers, box), outDrawableHi(sp.name), box.w * 2));
    } else if (sp.icon) {
      const box = Math.round((sp.icon.s || 12) * 2);
      const svg = iconSpriteSvg(ctx, sp.icon, box);
      sizes.push(render(svg, outDrawableHi(sp.name), box * 2));
    } else if (sp.label) {
      const d = sp.label;
      const w = Math.ceil(String(d.text).length * d.size * 0.7) + 8;
      const h = Math.ceil(d.size * 1.5);
      const fm = fontFromStack(d.font || face.fontStack);
      const anchor = d.anchor || 'middle';
      const tx = anchor === 'start' ? 4 : anchor === 'end' ? w - 4 : w / 2;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<text x="${tx}" y="${h / 2}" fill="${colFor(ctx.roles, d.color)}" font-size="${d.size}" font-family="${fm.svg}" font-weight="${snapWeight(fm.res, d.weight || 500)}" text-anchor="${anchor === 'start' ? 'start' : anchor === 'end' ? 'end' : 'middle'}" dominant-baseline="central">${String(d.text).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>
</svg>`;
      sizes.push(render(svg, outDrawableHi(sp.name), w * 2));
    }
  }
  const total = sizes.reduce((a, b) => a + b, 0);
  log?.(`  baked ${sizes.length + 2} assets, ${(total / 1024).toFixed(0)} KB`);
}

function wrapFace(ctx, body) {
  const bg = ctx.aod || ctx.dark ? '#000' : ctx.roles.bg;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="450" height="450" viewBox="0 0 450 450">
${defs(ctx)}
<g clip-path="url(#dialclip)">
<circle cx="225" cy="225" r="225" fill="${bg}"/>
${body}
</g>
${ctx.dark ? '' : `<circle cx="225" cy="225" r="225" fill="url(#crystal)"/>`}
</svg>`;
}
