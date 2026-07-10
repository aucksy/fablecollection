# Fable Watch Faces — Series 01 · ARCLIGHT

Premium Wear OS watch faces built entirely from arcs, sweeps and orbital data, for Google Pixel Watch and Samsung Galaxy Watch. Watch Face Format v2, resource-only (no code runs on the watch).

**Series plan:** 5 categories → 5 standalone APKs × 5 faces each, all in this one **FableCollection** monorepo. Each category is an independent top-level Gradle project (`Arclight/`, then `Ledger/`, `Armature/`, `Wilder/`, `Afterglow/`) with its own `applicationId` and its own Play listing. They build and release independently via per-product tags.

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

No local toolchain — cloud only. Each product releases on its own **prefixed** tag:

```
git tag arclight-v0.1.0 && git push origin main --tags
```

The tag slug (`arclight`) selects which top-level project to build. CI builds `arclight-v0.1.0.apk` (debug-signed test build; Play keystore comes later) and attaches it to that release. A plain push to `main` smoke-builds every product as an artifact but publishes nothing. Sideload a release APK with `adb install` over Wi-Fi debugging on the watch.

Future products just add a folder — e.g. `Ledger/` with its own `settings.gradle` — and tag `ledger-v0.1.0`. No CI edits needed; a single shared signing keystore secret will cover all five at Play time.

## Design rules

- Every capability in the spec sheets is labelled NATIVE / PROVIDER / SIMULATED / CUSTOM — the face must never claim data it can't get.
- AOD variants ship with every face: strokes only, low lit-pixel coverage, no animation.
- Fonts: Fraunces + JetBrains Mono (both OFL, bundled in `res/font/`).
