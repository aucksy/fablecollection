# PROGRESS — Fable Series 01 · ARCLIGHT

## Done

### Phase 1 — Design (2026-07-10) ✅
- `FABLE-Arclight-Showcase.html` — interactive simulator for all 5 faces (live clock, 5 themes each, layout presets, slot editor, AOD modes, spec sheets with NATIVE/PROVIDER/SIM/CUSTOM feasibility badges). QA'd via headless Chrome (`C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`; Bash sandbox can't exec it — needs sandbox off). Deep links: `#f=2&mode=aod&theme=1&cfg=Data-Rich`.
- Design fix from owner review: Solstice edge slots moved from 3/9 o'clock (collided with sunrise/sunset geometry) to sky positions 10:30/1:30.
- Owner approved: **build SOLSTICE first**.

### Phase 2 — Solstice build scaffold (2026-07-10, this session) ✅ (local, unpushed)
- `Arclight/` Gradle project: AGP 8.5.2, compileSdk 34, minSdk 33 (WFF v2 floor), `applicationId com.fable.arclight`, resource-only (`hasCode=false`).
- `res/raw/watchface.xml` — Solstice in WFF v2: gradient bg (interactive-only), 24-h night ring, two-tone day band 06:00→19:00 preset + ambient hairline twin, sunrise/sunset ticks, rotating sun/moon marker group (`angle = (h + m/60)*15 − 180`), config-gated sun halo + seconds orbit, 12/24-h via twin TimeTexts gated on `[IS_24_HOUR_MODE]`, AM/PM via `TimeText format="a"`, date via `[DAY_OF_WEEK_S]/[DAY_1_31]/[MONTH_S]`, 5 ComplicationSlots (3 rail + 2 sky; SHORT_TEXT/RANGED_VALUE; defaults SUNRISE_SUNSET/STEP_COUNT/NEXT_EVENT/HEART_RATE/WATCH_BATTERY), ambient variants hide slots/date/seconds/halo.
- 5 theme ColorOptions (First Light default, Alpenglow, Midnight Sun, Paper Dawn light, Pacific) — 8 colours each, indices documented in the XML header.
- Fonts bundled: `res/font/fraunces.ttf`, `res/font/jetbrainsmono.ttf` (variable TTFs from google/fonts, OFL).
- `preview.png` + `ic_launcher.png` cropped from the live simulator render.
- CI `.github/workflows/build.yml`: main→APK artifact, `v*` tag→GitHub Release with `arclight-<tag>.apk` (debug-signed; no secrets needed).

## Known risks / first-CI-run watchlist (WFF attributes written from memory)
1. `<LinearGradient>` inside `<Fill>` — syntax/attr names may differ; fallback = solid `themeColor.4` background.
2. `Font family="fraunces"` — bundled-font referencing convention unverified; fallback = `SYNC_TO_DEVICE`.
3. `hourFormat` attr on TimeText, `[IS_24_HOUR_MODE]` ternary alpha gating, boolean config in ternary (`[CONFIGURATION.secondsOrbit] ? 220 : 0`).
4. `DefaultProviderPolicy defaultDataSourceType` enum names (esp. `SUNRISE_SUNSET`, `NEXT_EVENT`).
5. Arc `endAngle="465"` (past 360) legality; `clipShape="CIRCLE"` on WatchFace root.
6. Consider adding google/watchface validator as a CI step when iterating.

## Gaps vs design (deliberate, for later fidelity pass — design-fidelity gate applies before "final" ship)
- Day-band gradient is 2-tone arcs, not a true sweep gradient.
- No sunrise/sunset time labels on the dial yet; moon is a ring, not a crescent.
- Rail complications are icon+text only (no mini ranged arcs yet); no serif↔geometric numeral toggle.
- Layout presets (Minimal/Balanced/Data-Rich/Fitness) not yet expressed as flavors.

## NEXT
1. **Owner action: create empty public repo `aucksy/fable-arclight`** (no README/license — we push everything).
2. Push main + tag `v0.1.0` → iterate CI until green (expect 1–3 rounds on WFF XML validity).
3. Sideload on watch → visual audit vs showcase → fidelity pass (fonts/gradients/labels) → adversarial review → proper `v0.2.0`.
4. Then Pulsar (face 02) — investigate multi-watchface-per-APK packaging in WFF at that point.
