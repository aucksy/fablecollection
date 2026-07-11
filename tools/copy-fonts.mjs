// Copies the per-face font sets from tools/fonts into each face's res/font.
// Family name in watchface.xml = the ttf filename without extension.
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'tools/fonts');

const MAP = {
  'Kinetik-Orrery': ['ibm_plex_mono_medium', 'archivo_semibold'],
  'Kinetik-Escapement': ['ibm_plex_mono_semibold', 'ibm_plex_mono_medium', 'archivo_semibold'],
  'Kinetik-Odometer': ['ibm_plex_mono_medium', 'archivo_semibold', 'barlow_condensed_bold'],
  'Kinetik-Turbine': ['barlow_condensed_bold', 'barlow_condensed_medium', 'barlow_condensed_semibold', 'archivo_semibold'],
  'Kinetik-Metronome': ['ibm_plex_mono_semibold', 'ibm_plex_mono_medium', 'archivo_semibold'],
  'Aether-Horizon': ['barlow_condensed_semibold', 'barlow_condensed_medium', 'archivo_semibold', 'ibm_plex_mono_medium'],
  'Aether-Ember': ['barlow_condensed_bold', 'barlow_condensed_semibold', 'barlow_condensed_medium', 'archivo_semibold'],
  'Settype-Counterform': ['archivo_black', 'ibm_plex_mono_medium', 'archivo_semibold', 'barlow_condensed_semibold'],
  'Settype-Masthead': ['cormorant_garamond_semibold', 'cormorant_garamond_medium', 'cormorant_garamond_medium_italic', 'cormorant_garamond_bold', 'archivo_semibold', 'ibm_plex_mono_medium'],
  'Settype-Marquee': ['barlow_condensed_bold', 'barlow_condensed_medium', 'barlow_condensed_semibold', 'archivo_semibold'],
  'Settype-Halftone': ['archivo_black', 'ibm_plex_mono_medium', 'archivo_semibold'],
  'Vespera-Aurum': ['marcellus_regular', 'ibm_plex_mono_medium', 'archivo_semibold'],
  'Vespera-Noir': ['ibm_plex_mono_medium', 'archivo_semibold'],
  'Vespera-Salon': ['marcellus_regular', 'ibm_plex_mono_medium', 'archivo_semibold'],
  'Vespera-Meteorite': ['ibm_plex_mono_medium', 'archivo_semibold'],
  'Vespera-Opaline': ['cormorant_garamond_semibold', 'cormorant_garamond_medium', 'cormorant_garamond_medium_italic', 'ibm_plex_mono_medium', 'archivo_semibold'],
};

for (const [dir, fonts] of Object.entries(MAP)) {
  const dst = resolve(ROOT, dir, 'app/src/main/res/font');
  mkdirSync(dst, { recursive: true });
  for (const f of fonts) copyFileSync(resolve(SRC, `${f}.ttf`), resolve(dst, `${f}.ttf`));
  console.log(`${dir}: ${fonts.length} fonts`);
}
