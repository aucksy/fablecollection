# Twelve&Sixty design line — KINETIK · AETHER · SETTYPE · VESPERA

16 faces from the Twelve&Sixty design handoff (`1st Designs by Fable 5/# Premium
Smartwatch Face Collection/design_handoff_watch_faces/`), built as **one APK per
face** per the Fable Collection packaging rule. All are **Watch Face Format v2**
(min Wear OS 5 / API 34), canvas 300×300 (1:1 with the handoff coordinate space),
authored against the official v2 XSDs and validated with Google's wff-validator.

| Project | Package | Signature mechanism |
|---|---|---|
| Kinetik-Orrery | com.kinetik.orrery | planets = native hand rotation (arm sprites), comet = SecondHand Sweep |
| Kinetik-Escapement | com.kinetik.escapement | gears = MinuteHand (1 rev/h) + SecondHand Sweep (1 rev/min) sprites |
| Kinetik-Odometer | com.kinetik.odometer | bitmap-font drum columns + wrap-gated value peeks + gradient fade masks |
| Kinetik-Turbine | com.kinetik.turbine | rotor = SecondHand sprite w/ Sweep (1 rev/min), tinted 20% |
| Kinetik-Metronome | com.kinetik.metronome | 24-frame SequenceImages swing (ON_VISIBLE, repeat) + dotted native arc |
| Aether-Horizon | com.aether.horizon | 4 time-gated gradient skies + sun/moon on angle-Transform arm groups |
| Aether-Ember | com.aether.ember | native radial bg + tinted glow-pool sprite (static per design fallback) |
| Settype-Counterform | com.settype.counterform | 195 px Archivo Black; fill vs native Outline text, mode-gated pairs |
| Settype-Masthead | com.settype.masthead | native TextCircular curved date on paper; AOD inverts (light dial) |
| Settype-Marquee | com.settype.marquee | 24 tinted bulb sprites + native OutGlow on the time |
| Settype-Halftone | com.settype.halftone | dot-screen digits as two tinted bitmap fonts; AOD = vector outlines |
| Vespera-Aurum | com.vespera.aurum | baked guilloché moiré (metal-tinted) + dashed native minute track |
| Vespera-Noir | com.vespera.noir | 8 moonphase plates gated on [MOON_PHASE_TYPE]; native lacquer gradients |
| Vespera-Salon | com.vespera.salon | baked sunray fan + hexagon cartouche slots + rotated-square diamond cap |
| Vespera-Meteorite | com.vespera.meteorite | baked Widmanstätten lattice; rhodium dauphine hand sprites |
| Vespera-Opaline | com.vespera.opaline | porcelain radial + 120-tick railroad (native dashes); light dial |

## Rules honoured
- One APK per face; per-face complications (≤3 slots), each rendered in the
  face's own typography with live `[COMPLICATION.TITLE]` labels (fixed-label
  fallback when a provider has no title).
- Pure-black background toggle on every dark face; **Masthead and Opaline are
  exempt** (light dials — their AODs invert to ink-on-black by design).
- Every face ships a designed AOD (outlines/dim ink, no seconds, ≤~6% APL).
- 12/24-hour honoured everywhere (native TimeText or `[IS_24_HOUR_MODE]`-gated
  twins where full Font control was needed).
- Runtime-gotcha discipline: one risky expression per element; ambient Variant
  and config/time Transforms always on separate nested nodes; no ternaries in
  colour attributes (duplicate + alpha-gate instead); native Sweep for all
  smooth motion.

## Documented deviations from the handoff (WFF platform limits)
- No system providers exist for Weather / Calories / Distance / Alarm →
  affected slot defaults substitute STEP_COUNT / WATCH_BATTERY / NEXT_EVENT /
  SUNRISE_SUNSET; users can assign the intended provider in the editor.
- Horizon uses the showcase's fixed solar day (05:54–20:30) for the sun track
  (no sunrise/sunset data source in WFF); its horizon slots default to the live
  SUNRISE_SUNSET complication.
- Continuous ambient animation (sun pulse, gear speeds, bulb flicker, sparks,
  fog) ships as the design's own static/native-rate fallback.
- Ember's time renders solid cream (no gradient fills on glyphs in WFF v2).
- Odometer peeks show the previous/next value pair (10:07 / 10:09), which is
  mechanically truer than the showcase's per-digit strips.
- Noir's moonphase plates are astronomically ordered (new→full→new) rather
  than replicating the showcase's approximate slide math.

## Tooling (`tools/`)
- `make-projects.mjs` — stamps the per-face Gradle scaffolds.
- `copy-fonts.mjs` — installs each face's font subset from `tools/fonts`
  (static SIL-OFL TTFs, name tables normalised).
- `assets/gen-*.mjs` — resvg-based baked art + preview/icon generator
  (300-space geometry transcribed from the handoff HTML).

Ship loop per face: validate → tag `<series>-<face>-vX.Y.Z` → CI builds and
releases `<tag>.apk`. On-wrist verification checklist: theme picker (3 options),
pure-black toggle, complication reassignment + tap targets, AOD, 12/24-h, and
for Metronome whether the swing loop plays (falls back to a parked wand).
