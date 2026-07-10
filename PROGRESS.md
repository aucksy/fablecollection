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

## ROUND 7 — arclight-v0.1.11 (2026-07-10): v0.1.10 CONFIRMED on-wrist + both flagged gaps fixed
- **v0.1.10 confirmed good on the owner's Pixel Watch** (owner tested; universal readable dark mode holds — Paper Dawn legible under pure black). The two minor gaps flagged in ROUND 6 were the only follow-ups; owner (AskUserQuestion) asked to fix BOTH → shipped as v0.1.11 before starting Pulsar.
- **Gap 1 FIXED — faint seconds dot on Paper Dawn + pure black.** `tintColor` is a colorAttributeType (regex forbids a ternary), so the single seconds `AnalogClock` was TWINNED: `secondsThemed` (tint `[CONFIGURATION.themeColor.2]`, gated `[CONFIGURATION.pureBlack] ? 0 : 255`) + `secondsLight` (tint `#F4EFE4`, gated `? 255 : 0`), both nested UNDER the existing `secondsWrap` ambient-hide Variant + `secondsGate` secondsOrbit Transform (each node carries exactly ONE gate; alphas multiply down the tree — proven). On pure black the dot now stays visible on EVERY theme (Paper Dawn ink `#2D2418` was near-black → invisible on black). Effective opacity unchanged (220). Mutually exclusive copies → never a double dot.
- **Gap 2 FIXED — Paper Dawn dark ink in AOD.** `timeThemed` had NO ambient Variant → its themed ink drew on the black ambient bg (invisible on Paper Dawn, whose ink is `#2D2418`). Now: (a) `timeThemed` wrapped in `timeThemedGate` (`Variant AMBIENT alpha 0`) so themed ink never shows in AOD; (b) NEW `timeAodLight` = base `alpha="0"` + `Variant AMBIENT alpha="255"` (STRUCTURAL, zero expressions — a byte-for-byte clone of the proven `dayBandAmbient` pattern) draws light `#F4EFE4` ink ONLY in ambient, on every theme; (c) existing `timeLight` unchanged. **Scoped to the TIME only** — AM/PM, ticks, night ring, hairline all use *muted* `#8D7F68` (a legible mid-tone) and are intentionally subtle in AOD, so lightening only AM/PM would look inconsistent; the "dark ink" complaint was the near-black TIME.
- **4-state table (interactive/ambient × pureBlack on/off) verified** for both TIME and SECONDS: exactly ONE readable copy visible in each state; dark-ink-on-black never occurs; the only overlap (ambient + pureBlack: `timeLight` + `timeAodLight`) is identical light glyphs at the same geometry → harmless idempotent overdraw. No node stacks Variant+Transform; no tintColor holds a ternary; v0.1.10's confirmed-good interactive text twins are untouched.
- **Validator PASSED** (WFF v1, validator 1.7.0, run locally on the portable JRE17). **Independent adversarial logic review: SHIP, zero real defects** (state tables reproduced against the real nodes).

## FACE 02 · PULSAR — packaging DECIDED: Option A (one APK, in-face "Face" switch) [2026-07-10]
- **Owner chose A** (AskUserQuestion). Verified against the WFF XSD + discovery model FIRST (Gate 2): **pure WFF presents exactly ONE user-facing face per installed APK** — discovery = `format.version` + the fixed-name `res/raw/watchface.xml`; WFF declares **NO Service** (so gotchas §7's "multiple watch-face services in one APK" is a legacy AndroidX concept that does NOT exist in WFF); `watch_face_shapes.xml` only maps round/rect SHAPES of the *same* face; Watch Face Push = "single-face APK". **⇒ runtime-gotchas.md §7 option B (as written) is NOT achievable in pure WFF** — the only real alternative to A is separate APKs (5 applicationIds/listings) or a WFP marketplace app. [FOLLOW-UP: fold this correction into the shared Resources skill's §7.]
- **Mechanism = `ListConfiguration "Face"`** (Solstice / Pulsar / …) — a **v1 feature**, so multi-face needs **NO version bump** (Arclight stays WFF v1 / minSdk 33 / widest reach). Each face's whole element tree wraps in a `Group` gated on the selected face id; a `ListConfiguration` is comparable/branch-able (proven), unlike a `ColorConfiguration`.
- **Flavors** (a preset "Face · Theme" gallery — the clean way to tame the flat-config editor) require **WFF v2** (format.version 2 + minSdk 34 → drops Wear OS 4 / API 33). DEFERRED: build multi-face in v1 first; revisit v2/Flavors as a UX polish once the owner sees the editor on-wrist.
- **Theme model (DEFAULT, owner to confirm before the theme work): PER-FACE ColorConfigurations** — Solstice keeps its 5 (First Light…Pacific); Pulsar gets its 5 (Reactor/Redline/Night Ops/Ghost/Synthwave) per the showcase. Faithful to each face's identity; cost = the v1 editor shows each face's theme picker (only v2 Flavors mitigates). Alternative = one shared unified palette (clean editor, but departs from the showcase's per-face themes). The thin first pass does NOT depend on this.
- **Build plan (thin end-to-end FIRST — FableMode Gate 2):**
  1. Add `ListConfiguration "Face"`; wrap the CONFIRMED-GOOD Solstice scene in a `[CONFIGURATION.face] == 'solstice'` gate — **must NOT regress Solstice** (on-wrist-verified through v0.1.11).
  2. Add a minimal Pulsar skeleton gated `== 'pulsar'`: master gauge arc (140° hugging the left edge), condensed time, 1–2 satellite ring-gauges, a 60-tick seconds ring (interactive only), ambient variant. Prove face-switching + Pulsar rendering on-wrist BEFORE fleshing out all satellites/themes/complications.
  3. Iterate Pulsar to full showcase spec (master gauge + 3 satellites @1:30/3:00/4:30, header readout, bottom notif-dots, 5 themes, config presets Minimal/Balanced/Fitness/Data-Rich, options secDots/smooth/labels), validating + adversarially reviewing each ship.
- Pulsar design source: `FABLE-Arclight-Showcase.html` `#f=1` (JS render fn ~L771; spec block ~L1112). Accent `#45e0ee`; tagline "a mission-instrument cluster — one master gauge, three satellites, sixty ticks of light".

## ROUND 6 — arclight-v0.1.10 (2026-07-10): Paper Dawn pure-black bug FIXED (universal readable dark mode)
- **Root cause NAILED from the bundled WFF XSD** (not memory): a `ColorConfiguration` can NEVER be branched on. `groupElement.xsd` permits only `ListConfiguration` + `BooleanConfiguration` as scene-level switch elements — `ColorConfiguration` is deliberately absent — and `colorAttributeType`'s regex (`\[[A-Z0-9]+(\.\w+)*\]|#hex`) forbids ternaries in any colour attribute. So (a) `[CONFIGURATION.themeColor] == 3` was impossible, AND (b) conditional recolouring by expression is impossible. The ONLY proven, schema-valid way to change a colour by state is a duplicated element alpha-gated on the boolean.
- **Owner decision (AskUserQuestion): "Universal readable dark mode."** Since Paper Dawn can't be auto-detected, pure black now applies to EVERY theme and every ink-bearing TEXT element is drawn as a proven single-boolean pair — themed copy `[CONFIGURATION.pureBlack] ? 0 : 255`, light copy `? 255 : 0` (INK_LIGHT `#F4EFE4` for time+complications, MUTED_LIGHT `#B3AA9C` for date/AM-PM/sun-labels). The two copies are mutually exclusive so they never overlap.
- Elements twinned: TIME (Group-wrapped, no ambient Variant → AOD unchanged when toggle off), AM/PM (nested inside the 12/24h gate — two single-boolean gates on separate nodes, never stacked), DATE, sunrise/sunset labels (Group carries ambient-hide, PartTexts carry the pureBlack gate), and all 10 complication texts (extra `<PartText>` per Complication; `Transform` on a PartText is the same class as the proven sun-disc `Transform`-on-PartDraw). Decorative themed elements (night ring, ticks, day band, sun/halo/moon accents) are already visible on black → left themed to preserve identity.
- **DEAD `bgPaperDawn` group REMOVED.** Validator PASSED (v1, validator 1.7.0).
- **Two known minor gaps flagged for on-wrist check (deliberately NOT changed to keep the fix focused/low-risk):** (1) the seconds dot tint is `themeColor.2` (ink) with no ternary allowed → on Paper Dawn + pure black the dot is faint (a marker, not text; can add a light-tinted twin AnalogClock if wanted). (2) Paper Dawn in AOD (pure black OFF) still uses dark ink on the black ambient background — a pre-existing latent issue of the same nature, out of scope for this bug; can extend the same twin approach to AOD later if desired.

## ROUND 5 — arclight-v0.1.9 (2026-07-10): native smooth seconds + Paper Dawn pure-black exemption
- Owner: seconds dot janky (expression-driven `[SECOND_MILLISECOND]` rotation is at the mercy of frame scheduling) → replaced with WFF's NATIVE mechanism: `<AnalogClock><SecondHand resource="@drawable/second_dot" tintColor="[CONFIGURATION.themeColor.2]"><Sweep frequency="15"/></SecondHand></AnalogClock>` — the platform drives the sweep at 15 Hz itself. `second_dot.png` = 450px transparent PNG, white 6px dot at (222,12) (r=210 from pivot 0.5/0.5), tinted per theme. Sweep frequency enum: 2/5/10/15 only.
- Owner: pure-black toggle must NOT apply to Paper Dawn (dark ink on black = unreadable) → redundant `bgPaperDawn` layer gated `[CONFIGURATION.themeColor] == 3 ? 255 : 0` re-draws the themed bg on top when Paper Dawn selected. Graceful: if comparing a ColorConfiguration to its option id is unsupported at runtime, layer stays hidden = old behaviour (verify on wrist!).
- Validator PASSED.

### ✅ RESOLVED in v0.1.10 (see ROUND 6 above) — was: Paper Dawn exemption FAILED
`[CONFIGURATION.themeColor] == 3` does NOT work at runtime — a **ColorConfiguration** does not appear to expose a comparable selected-option-id to expressions (only ListConfiguration values are known-comparable, e.g. proven pattern `[CONFIGURATION.secondsOrbit] ? A : B` on a boolean). The `bgPaperDawn` layer never shows → Paper Dawn still goes black under the pure-black toggle. **This is the #1 task for the next session.** Candidate directions (pick after testing):
  1. Find the real WFF syntax to read a ColorConfiguration's active option id (grep XSD `xsd/1/` for configuration/expression tokens; check developer.android.com WFF expressions ref). If it exists, use it.
  2. If ColorConfiguration can't be branched on: replace the theme picker with a **ListConfiguration** whose option ids drive the palette AND are comparable — but this loses the native colour-swatch editor UI (tradeoff to weigh).
  3. Reframe the feature: make pure-black a **ListConfiguration "Background" {Themed, Pure black}** (comparable) — still global, doesn't auto-exempt Paper Dawn, but is honest; OR keep pure-black but when ON force a light ink so ANY theme stays readable (changes the requested behaviour — confirm with owner first).
  4. Simplest acceptable: drop the auto-exemption, and instead make Paper Dawn readable on black by gating a light-ink duplicate of the text on `[CONFIGURATION.pureBlack]` (proven boolean pattern). Confirm owner is OK with "Paper Dawn + pure black = paper text goes light" vs "background stays paper".
  Remember: the bgPaperDawn layer currently in watchface.xml is DEAD CODE — remove or replace it as part of the fix.

## ROUND 4 — arclight-v0.1.8 (2026-07-10): halo confirmed WORKING on-wrist; tuned down + lower slots to 4:30/7:30
- Owner photo of v0.1.7: **halo VISIBLE** ✓ (proven-pattern rebuild vindicated) but too prominent → outer 60px α30 → 50px α18; base 48px α80 → 38px α48.
- Owner's second green-circle sketch: lower-side slots inward+down → from ±112° r157 to **±135° (4:30 / 7:30) r=135** → 64-boxes at (97,288)/(289,288). Final pentagon: ±38° r130 · ±135° r135 · 180° r148.
- Showcase synced (anchors pol(144,225°)/pol(144,135°) in 480-space), preview/icon regenerated. Validator PASSED.

## ON-WRIST FEEDBACK ROUND 3 — arclight-v0.1.7 (2026-07-10): pentagon layout + proven-pattern halo
Owner tested v0.1.6: halo still absent (all 3 no's) + drew green circles on the showcase for desired slot positions.
**Key learning:** in v0.1.6 even the STATIC halo layers died → the failure was the GATE (config + two time comparisons chained in ONE ternary on a Group). Two patterns are PROVEN on this watch: (a) single-boolean group gate `[CONFIGURATION.x] ? A : B` (seconds comet), (b) time-range ternary on a PartDraw (sun disc). **v0.1.7 halo = ONLY those two patterns, nested** (haloCfg group: single-boolean → two discs each with the sun-disc time ternary, α30/α80). Pulse + tilt SHELVED — verdict still unknown (the gate masked them); do a dedicated diagnostic build later if wanted.
**Pentagon slot layout (from owner's green-circle sketch — symmetric ring around the centred time), 450-space:**
- upper pair ±38° r=130 → 64-boxes at (113,91)/(273,91), flanking PM above digits
- lower-side pair ±112° r=157 → 64-boxes at (47,252)/(339,252) (4 & 8 o'clock; slots 0/2 shrunk 72→64, sky-style 16px icon/14px text)
- bottom @180° r≈148 → 72-box at (189,337)
- Showcase HTML SYNCED to same layout + equinox 6:00/18:00 sim times; rail guide arc removed; preview.png/ic_launcher regenerated from the new render. Design source of truth back in step.

## ON-WRIST FEEDBACK ROUND 2 — arclight-v0.1.6 (2026-07-10)
Owner wrist-photo (Pixel Watch, pure black, First Light) + report: halo neither pulses nor tilts; complications feel asymmetric.
**Diagnosis from the photo:**
- Seconds comet HAD moved off 12 → `[SECOND_MILLISECOND]` + smooth rotation WORK at runtime.
- Halo absent entirely → a single element carrying ternary+`abs`/`%`+`clamp`+ACCELEROMETER transforms dies wholesale when any expression is rejected. **Rule: one risky expression per element; never stack unproven expressions on one element.**
- Sun-time labels absent → string-literal `Parameter expression="&quot;6:00&quot;"` fails at runtime (validator passed it!). **Rule: numeric params only — `%d:00` + `expression="6"`.**
- Perceived asymmetry root cause: the 06:00→19:00 band preset ends BELOW 3 o'clock while starting AT 9 o'clock → lopsided crown. Also the r=210 seconds track ring read as a stray third circle on OLED.
**v0.1.6 changes:**
- Day band → equinox preset 06:00→18:00 (270°→450°, split 360°): band, ticks (now 9 & 3 exactly), labels, sun path all mirror-symmetric. Day/night threshold updated to 18.0 in halo/sun/moon gates.
- Halo rebuilt as GRACEFUL LAYERS under one proven-ternary gate group: static outer(64px α26) + static base(50px α75) = guaranteed glow; pulse (58px, pure-arithmetic triangle α0–45) expendable; tilt (62px α24, `[ACCELEROMETER_ANGLE_X/Y]/12` on x/y, no clamp) expendable. Any rejected effect kills only its own layer.
- Labels via numeric `%d:00` params; seconds track ring REMOVED (comet stays).
- OWNER TEST CHECKLIST for v0.1.6: (1) static glow around sun now visible? (2) does it breathe? (3) does it drift on tilt? (4) crown symmetric? Report per-item — layers isolate which expression works.

## MOTION + FIDELITY PASS — arclight-v0.1.5 (2026-07-10)
Owner: "wrist-raise animation not working; ensure everything planned works + UI/dimensions clean."
**WFF animation facts (XSD-verified, v1–v5 identical):**
- There are NO vector property animations and NO time-since-wake source → a "day-band draws itself in on wrist-raise" is IMPOSSIBLE in WFF vectors. The only wake-triggered mechanism is `PartAnimatedImage`+`AnimationController play="ON_VISIBLE"` (pre-rendered animated WebP; per-theme assets — deferred, maybe never). System provides a brief AOD↔interactive crossfade automatically. → The showcase's "wake sweep = NATIVE animated transforms" claim was WRONG; correct the showcase in the next design-sync.
- Event triggers available: TAP, ON_VISIBLE, ON_NEXT_SECOND/MINUTE/HOUR (image sequences only).
- What IS native for motion: `[SECOND_MILLISECOND]` (smooth sub-second), `[MILLISECOND]`, accelerometer sources (`ACCELEROMETER_ANGLE_X/Y/Z`, `ACCELEROMETER_X/Y/Z`, `_IS_SUPPORTED`).
**Shipped in v0.1.5:**
- Seconds comet now GLIDES (`[SECOND_MILLISECOND] * 6`), moved to correct showcase radius r=210 (was 197), + faint orbit track (alpha ~18).
- Sun halo BREATHES: 4 s triangle-wave alpha 55↔90 via `abs`/`%` on `[SECOND_MILLISECOND]` (60 % 4 == 0 so no wrap glitch).
- TILT PARALLAX: halo drifts ±3 px with wrist via `clamp([ACCELEROMETER_ANGLE_X/Y],-45,45)/15` on Transform target x/y — the "responds to wrist movement" feel, continuous rather than one-shot.
- Sky depth restored: literal-color LinearGradient overlay `#73000000→transparent` (top 300 px) inside bgThemed — works with every theme + hidden in pureBlack/ambient. (ColorOption 5-colour cap made a config-colour gradient impossible; overlay sidesteps it.)
- Sunrise/sunset time labels added at the ticks ("6:00" / "19:00", static = matches the fixed preset).
- Gotcha: `<Template>` REQUIRES ≥1 `<Parameter>` — static label text must be `%s` + `Parameter expression="&quot;6:00&quot;"` (string literal expression).
- Font has NO letterSpacing attr in WFF (checked XSD) — the showcase's airy letterspaced captions can't be reproduced; accepted.
**Still unverifiable off-watch:** expression functions (`abs`, `clamp`, `%`) and accelerometer sources are schema-valid but their runtime behaviour needs the owner's wrist check.

## FEATURE — arclight-v0.1.4 (2026-07-10): "Pure black background" toggle
- Owner request: a setting to keep the themed background OR make it completely black.
- Impl: new `BooleanConfiguration pureBlack` (default FALSE). Background is now an outer Group (ambient→alpha 0) wrapping an inner `bgThemed` Group whose alpha = `[CONFIGURATION.pureBlack] ? 0 : 255`; when on, the Scene's true black shows through and only the luminous elements remain (same look as AOD, great for OLED battery). Validator PASSED.
- CAVEAT: pairs best with the 4 dark themes. With the one light theme (Paper Dawn) the ink is dark → low contrast on black; acceptable (user-controlled, off by default). Showcase HTML not yet synced with this toggle (design-source drift to reconcile in the fidelity pass).

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
1. **SOLSTICE is SETTLED** — shipped + owner-confirmed on-wrist through **arclight-v0.1.11** (v0.1.10 universal readable dark mode confirmed; v0.1.11 fixed the two ROUND-6 gaps: faint seconds dot + Paper Dawn AOD ink). No open Solstice bugs.
2. **Build PULSAR (face 02) as Option A** — see the "FACE 02 · PULSAR — packaging DECIDED" section above for the verified WFF finding, the `ListConfiguration "Face"` mechanism (v1, no version bump), the per-face-theme default, and the thin-first build plan. Start with step 1 (Face switch + wrap Solstice, no regression) → step 2 (minimal Pulsar skeleton, prove face-switching on-wrist) → step 3 (full Pulsar spec).
3. **Owner sub-decision before the theme work:** per-face themes (faithful to the showcase; v1 editor shows each face's picker) vs one shared unified palette (clean editor; departs from showcase). Thin pass doesn't block on it.
4. **Follow-up:** correct runtime-gotchas.md §7 in the shared Resources skill (option B isn't pure-WFF-achievable — re-zip with FORWARD-slash entry names to avoid corruption).
