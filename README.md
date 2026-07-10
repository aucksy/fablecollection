# Fable Watch Faces — Series 01 · ARCLIGHT

Premium Wear OS watch faces built entirely from arcs, sweeps and orbital data, for Google Pixel Watch and Samsung Galaxy Watch. Watch Face Format **v1** (Wear OS 4+ / minSdk 33 — widest device reach), resource-only (no code runs on the watch).

**Series plan:** 5 series × 5 faces = **25 faces**, all in this one **FableCollection** monorepo. **One APK per face** — each face is an independent top-level Gradle project (`Arclight-Solstice/`, `Arclight-Pulsar/`, … `Ledger-*/`, `Armature-*/`, `Wilder-*/`, `Afterglow-*/`) with its own `applicationId` (`com.<series>.<face>`, e.g. `com.arclight.solstice`) and its own Play listing, built/released independently via per-product tags (`arclight-solstice-v*`). **Why one-per-face and not one-per-series:** WFF complication slots are Scene-global (Scene-only, max 8, can't be gated per face inside a multi-face APK), so giving each face its own independently-configured complications *requires* a package per face (decided 2026-07-10; full rationale in `PROGRESS.md`).

## Contents

| Path | What |
|---|---|
| `FABLE-Arclight-Showcase.html` | The interactive design prototype / simulator — the design source of truth for all five faces. Open in any browser. |
| `Arclight-Solstice/`, `Arclight-Pulsar/` | One Gradle project per face (WFF v1, resource-only). Each new face = a new top-level folder. |
| `.github/workflows/build.yml` | CI: every push to `main` builds the APK; pushing a `v*` tag also publishes a GitHub Release with the APK attached. |

## Faces

| # | Face | Status |
|---|---|---|
| 01 | **SOLSTICE** — 24-h solar ring, day-band, travelling sun/moon, serif time, 5 complication slots | shipped · own APK `arclight-solstice-v0.2.0` |
| 02 | **PULSAR** — instrument cluster: dashed battery gauge, live seconds rim, 4 own complications | shipped · own APK `arclight-pulsar-v0.2.0` |
| 03 | ECLIPSE — hour/minute crescents on black | designed, not built |
| 04 | MERIDIAN — day-progress meridian + curved agenda | designed, not built |
| 05 | TIDELINE — step-goal tide | designed, not built |

## Build

No local toolchain — cloud only. Each product releases on its own **prefixed** tag:

```
git tag arclight-solstice-v0.2.0 && git push origin main --tags
```

The tag slug (everything before `-v`, e.g. `arclight-solstice`) selects the matching top-level folder to build. CI builds `arclight-solstice-v0.2.0.apk` (debug-signed test build; Play keystore comes later) and attaches it to that release. A plain push to `main` smoke-builds every face as an artifact but publishes nothing. Sideload a release APK with `adb install` over Wi-Fi debugging on the watch.

Future faces just add a folder — e.g. `Ledger-Numerus/` with its own `settings.gradle` — and tag `ledger-numerus-v0.1.0`. No CI edits needed; one shared signing keystore secret will cover them all at Play time.

## Design rules

- Every capability in the spec sheets is labelled NATIVE / PROVIDER / SIMULATED / CUSTOM — the face must never claim data it can't get.
- AOD variants ship with every face: strokes only, low lit-pixel coverage, no animation.
- Fonts: Fraunces + JetBrains Mono (both OFL, bundled in `res/font/`).
