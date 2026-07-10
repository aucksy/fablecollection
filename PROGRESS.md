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

## WFF v1 validation — PASSED (2026-07-10). Real constraints learned (apply to all 5 faces)
Validated with google/watchface `wff-validator.jar` (needs Java 17). Local one-off: portable Temurin JRE 17 unzipped in scratchpad; the XSD is in `wff-xsd.zip` (dir per version: `xsd/1/…`) — grep it for tokens/enums. CI runs the validator as a hard gate on every push, so normally you don't need local.
Fixes made to reach PASSED:
1. **ColorOption `colors` = max 5 colours.** Had 8 → consolidated palette to 5 roles: 0 dayStart · 1 dayEnd(+sun/moon/halo) · 2 ink · 3 muted(+ring/ticks/date/hairline) · 4 bg(solid). Dropped the background gradient (fidelity gap, see below).
2. **`DigitalClock` children may only be `{TimeText, Variant, Localization}`** — NOT `Group`. To alpha-gate a clock, wrap the DigitalClock in a Group and put the Transform on the Group.
3. **`TimeText format` only accepts `h`/`m`/`s` patterns** — no `a` (AM/PM), no uppercase `H`. So: (a) TimeText auto-follows the system 12/24-h setting → ONE clock with `format="h:mm"`, no twin-clock hack, no `hourFormat` attr (invalid). (b) AM/PM comes from the `[AMPM_STRING]` data source in a PartText, alpha-gated by `[IS_24_HOUR_MODE] ? 0 : 255`.
4. **Day-of-month token is `[DAY]`**, not `[DAY_1_31]`. Verified tokens: IS_24_HOUR_MODE, HOUR_0_23, MINUTE, SECOND, DAY, DAY_OF_WEEK_S, MONTH_S, AMPM_STRING.
5. **No `HEART_RATE` system provider exists.** Full v1 system-provider enum: APP_SHORTCUT, DATE, DAY_AND_DATE, DAY_OF_WEEK, EMPTY, FAVORITE_CONTACT, NEXT_EVENT, STEP_COUNT, SUNRISE_SUNSET, TIME_AND_DATE, UNREAD_NOTIFICATION_COUNT, WATCH_BATTERY, WORLD_CLOCK. (No weather either in v1.) HR/weather can still be user-ADDED to a slot; they just can't be a `DefaultProviderPolicy`. Sky-left default → UNREAD_NOTIFICATION_COUNT.
6. `DefaultProviderPolicy` attrs = `defaultSystemProvider` + `defaultSystemProviderType` (both required).
7. Confirmed OK by schema: boolean/config ternaries in Transform (`[CONFIGURATION.secondsOrbit] ? 220 : 0`), Arc `endAngle="465"` (>360), `clipShape="CIRCLE"`, solid `<Fill>`, custom font `family` (binds to `res/font/<family>.ttf`).

## Runtime risks still unverified until on-wrist (schema can't catch these)
- Variable-font weight rendering (Fraunces/JBMono are variable TTFs; `weight` may map to default axis → may need static instances).
- `[COMPLICATION.TEXT]` / `[COMPLICATION.MONOCHROMATIC_IMAGE]` expression tokens at runtime.
- Arc 270→465 wrap direction; sun-marker angle math; exact anchor positions of rail/sky slots.
- `[AMPM_STRING]` localised output + whether TimeText truly auto-switches 12/24 on device.

## Gaps vs design (deliberate, for later fidelity pass — design-fidelity gate applies before "final" ship)
- Background is a solid colour (gradient dropped to fit the 5-colour ColorOption limit); true sky gradient deferred.
- Day-band gradient is 2-tone arcs, not a true sweep gradient.
- No sunrise/sunset time labels on the dial yet; moon is a ring, not a crescent.
- Rail complications are icon+text only (no mini ranged arcs yet); no serif↔geometric numeral toggle.
- Layout presets (Minimal/Balanced/Data-Rich/Fitness) not yet expressed as flavors.

## Repo structure (decided 2026-07-10): ONE monorepo `aucksy/FableCollection`
- All 5 category APKs live here, each an independent top-level Gradle project (`Arclight/`, later `Ledger/` `Armature/` `Wilder/` `Afterglow/`), each its own `applicationId` + Play listing.
- CI (`.github/workflows/build.yml`) is product-aware via **per-product tag prefix**: tag `arclight-v0.1.0` → builds the `Arclight` dir (case-insensitive slug match) → releases `arclight-v0.1.0.apk`. Plain `main` push smoke-builds every product (any `*/settings.gradle`) as artifacts, releases nothing. Adding a product = add a folder; no CI edit.
- Remote already set to `https://github.com/aucksy/FableCollection.git`.

## FIX — arclight-v0.1.3 (2026-07-10): stable signing key (in-place updates)
- Symptom: `adb install -r` of v0.1.2 over v0.1.1 → `INSTALL_FAILED_UPDATE_INCOMPATIBLE: signatures do not match`.
- Cause: GitHub Actions generates a fresh RANDOM debug keystore on every run, so each build had a different signature → can't update in place.
- Fix: committed a STABLE debug keystore `Arclight/arclight-debug.keystore` (throwaway key, password `android`, alias `androiddebugkey`) and pointed `signingConfigs.debug.storeFile` at `$rootDir/arclight-debug.keystore` in app/build.gradle. Every CI build now shares one signature → future test builds update in place, no uninstall.
- NOT a Play key — real release signing will use a secret-provisioned keystore at store time (see [[colorcloset-play-store]] pattern).
- Owner must UNINSTALL ONCE to move off the old random-key builds: `adb uninstall com.fable.arclight` then install v0.1.3. After that, v0.1.3→v0.1.4→… update in place.

## FIX — arclight-v0.1.2 (2026-07-10): face was not editable on-watch
- Symptom (owner on real watch): installs + renders fine, but NOTHING is customizable (no themes/toggles/complication editor).
- Cause: `res/xml/watch_face_info.xml` was missing **`<Editable value="true" />`** — I'd invented `<AvailableInRetail>` and omitted Editable. Wear OS renders a non-editable face by default; Editable=true is what surfaces the auto-generated editor. The wff-validator does NOT check watch_face_info.xml, so it slipped past.
- Fix: match Google's official sample exactly — `Preview` + `MultipleInstancesAllowed=false` + `Editable=true`. (Reference: google/watchface .../test-samples/sample-wf.) `watch_face_info.xml` is auto-discovered by path; no manifest ref needed.
- LESSON for all 5 faces: editability lives in watch_face_info.xml, NOT watchface.xml, and is unvalidated — always include `Editable=true`.

## SHIPPED — arclight-v0.1.1 (2026-07-10) ✅ (superseded by v0.1.2 — v0.1.1 renders but is NOT editable)
- Repo LIVE: github.com/aucksy/fablecollection (GitHub lowercased it). main green; per-product tag release green.
- **Validated APK: https://github.com/aucksy/fablecollection/releases/download/arclight-v0.1.1/arclight-v0.1.1.apk** (WFF v1, debug-signed test build, ~563 KB).
- CI is a 2-gate pipeline: (1) google/watchface wff-validator on every push [hard gate], (2) assembleDebug. Both green.
- `arclight-v0.1.0` = DEFUNCT (built before validation, invalid WFF, wrong format version); tag left in place (can't move a published tag), superseded by v0.1.1.

## NEXT
1. **Owner action: sideload on the watch** — `adb install arclight-v0.1.1.apk` over Wi-Fi debugging (Pixel Watch / Galaxy Watch, Wear OS 4+). Then long-press the face → check: does it render, is the sun on the ring at the right spot, do the 5 themes/2 toggles/5 complication slots work, does AOD look right, 12/24h follow system.
2. Report on-wrist findings → fix the runtime-risk list above (fonts/gradient/positions) → design-fidelity pass vs showcase → adversarial review → proper `arclight-v0.2.0`.
3. Then Pulsar (face 02). NOTE: the 5 ARCLIGHT faces all go in the ONE Arclight APK (product model), so Pulsar is a second face INSIDE Arclight, not a new top-level project. Open decision: multi-face packaging in WFF (one scene + a ListConfiguration "Face" style-switcher, vs multiple watch-face services). Revisit then.
