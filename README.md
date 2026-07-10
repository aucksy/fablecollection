# Fable Watch Faces — Series 01 · ARCLIGHT

Premium Wear OS watch faces built entirely from arcs, sweeps and orbital data, for Google Pixel Watch and Samsung Galaxy Watch. Watch Face Format v2, resource-only (no code runs on the watch).

**Series plan:** 5 categories → 5 standalone APKs × 5 faces each. This repo is Series 01 (ARCLIGHT).

## Contents

| Path | What |
|---|---|
| `FABLE-Arclight-Showcase.html` | The interactive design prototype / simulator — the design source of truth for all five faces. Open in any browser. |
| `Arclight/` | The Wear OS app (Gradle project, WFF v2, resource-only). |
| `.github/workflows/build.yml` | CI: every push to `main` builds the APK; pushing a `v*` tag also publishes a GitHub Release with the APK attached. |

## Faces

| # | Face | Status |
|---|---|---|
| 01 | **SOLSTICE** — 24-h solar ring, day-band, travelling sun/moon, serif time, 5 complication slots | in build (v0.1.x) |
| 02 | PULSAR — instrument gauge cluster | designed, not built |
| 03 | ECLIPSE — hour/minute crescents on black | designed, not built |
| 04 | MERIDIAN — day-progress meridian + curved agenda | designed, not built |
| 05 | TIDELINE — step-goal tide | designed, not built |

## Build

No local toolchain — cloud only. Push a tag:

```
git tag v0.1.0 && git push origin main --tags
```

CI builds `arclight-v0.1.0.apk` (debug-signed test build; Play keystore comes later) and attaches it to the release. Sideload with `adb install` over Wi-Fi debugging on the watch.

## Design rules

- Every capability in the spec sheets is labelled NATIVE / PROVIDER / SIMULATED / CUSTOM — the face must never claim data it can't get.
- AOD variants ship with every face: strokes only, low lit-pixel coverage, no animation.
- Fonts: Fraunces + JetBrains Mono (both OFL, bundled in `res/font/`).
