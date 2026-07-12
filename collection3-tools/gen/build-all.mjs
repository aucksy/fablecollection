// Build driver: compiles spec faces → per-face Gradle projects with baked art
// and generated watchface.xml.  Usage:
//   node tools/gen/build-all.mjs              # all 25 faces
//   node tools/gen/build-all.mjs WF-A1        # one face (id, slug or dir name)

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { FACES, getFace } from './data.mjs';
import { emitFace } from './wff.mjs';
import { bakeFace, ROOT } from './bake.mjs';
import { scaffoldFace, copyFonts } from './scaffold.mjs';

const VERSION = { code: 1, name: '0.1.0' };

const arg = process.argv[2];
const targets = arg ? [getFace(arg)].filter(Boolean) : FACES;
if (!targets.length) {
  console.error(`unknown face '${arg}'`);
  process.exit(1);
}

let failed = 0;
for (const entry of targets) {
  const t0 = Date.now();
  try {
    const emitted = emitFace(entry);
    scaffoldFace(entry, emitted.strings, VERSION);
    writeFileSync(resolve(ROOT, entry.dir, 'app/src/main/res/raw/watchface.xml'), emitted.xml);
    // fonts referenced in the XML: family="<res>_<weight>"
    const fams = new Set();
    for (const m of emitted.xml.matchAll(/family="([a-z0-9_]+)"/g)) fams.add(m[1]);
    copyFonts(entry, fams);
    bakeFace(entry, emitted, (s) => console.log(s));
    const warn = emitted.warnings.length ? `  ⚠ ${emitted.warnings.join(' | ')}` : '';
    console.log(`✔ ${entry.face.id} ${entry.dir}  (${((Date.now() - t0) / 1000).toFixed(1)}s)${warn}`);
  } catch (e) {
    failed++;
    console.error(`✖ ${entry.face.id} ${entry.dir}: ${e.stack || e}`);
  }
}
console.log(failed ? `\n${failed} face(s) FAILED` : `\nall ${targets.length} face(s) built`);
process.exit(failed ? 1 : 0);
