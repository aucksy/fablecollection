# CONTEXT — kickoff for a fresh chat

You are continuing **Fable Watch Faces Series 01 · ARCLIGHT** at `D:\Apps\WearOS Apps\WatchFaces\Fable Collection`.

1. Read `PROGRESS.md` (state + next steps + risk watchlist) and `README.md` (structure).
2. Design source of truth: `FABLE-Arclight-Showcase.html` (open in browser; deep links like `#f=0&cfg=Data-Rich`). Do NOT look at the separate TwelveSixty project — owner wants this line independent.
3. Build rules: cloud-only (no local Android toolchain on this machine — never download it). Ship loop: push main → tag `v*` → GitHub Actions builds and releases the APK → paste the direct `.apk` download link in chat. Adversarial review BEFORE tagging.
4. Repo: ONE monorepo `github.com/aucksy/FableCollection` (owner must create if it doesn't exist yet) holding all 5 category APKs, each an independent top-level Gradle project. Per-product tag prefix drives releases: `arclight-v0.1.0` builds+releases the `Arclight/` project. Git author: simpleapps108@gmail.com.
5. Current phase: Solstice (ARCLIGHT face 01) has shipped through **arclight-v0.1.9**, owner-tested on a real Pixel Watch across many rounds (layout, halo, native smooth seconds all confirmed good). See PROGRESS.md top for the full round-by-round history and every WFF gotcha learned.
6. **IMMEDIATE OPEN BUG** (see PROGRESS.md "⛔ OPEN BUG"): the "Pure black background" toggle still blacks out the light **Paper Dawn** theme (dark ink → unreadable). My `[CONFIGURATION.themeColor] == 3` exemption does NOT work at runtime (ColorConfiguration option-id isn't comparable in expressions). Fix this FIRST — candidate approaches are listed in PROGRESS.md. There is DEAD `bgPaperDawn` code in watchface.xml to remove/replace.
7. After that: design-fidelity polish if any, then face 02 (**PULSAR**) — a SECOND FACE INSIDE the Arclight APK, not a new project. Open engineering decision: how to pack 5 faces into one WFF APK (one scene + a style/ListConfiguration face-switcher, vs multiple watch-face services). Decide at the start of the Pulsar phase.

## Key workflow facts (don't relearn the hard way)
- **Validate before every ship:** WFF XML is NOT checked by the Gradle build. Run google/watchface `wff-validator.jar` (needs Java 17; a portable JRE17 + the jar + `wff-xsd.zip` are in the last session's scratchpad, or re-download from the `latest` release). CI also runs it as a hard gate.
- **Ship loop:** edit → validate → bump versionCode/versionName in Arclight/app/build.gradle → commit → push main (CI validates+builds) → `git tag arclight-vX.Y.Z` + push tag (CI releases the APK). Poll the DIRECT release URL for HTTP 302 (GitHub unauth API rate-limits fast). Paste the direct .apk link to the owner every time.
- **Stable debug key** is committed (`Arclight/arclight-debug.keystore`) so `adb install -r` updates in place — never regenerate it.
- **WFF expression rules proven on-device:** only simple patterns survive — single-boolean gate `[CONFIG.x] ? A : B` and time-range ternary on a PartDraw. Do NOT stack config+time+math on one element (kills it). No string-literal Parameters (numeric `%d` only). Smooth seconds = native `AnalogClock > SecondHand > Sweep frequency="15"`, NOT expression rotation. Fonts have no letterSpacing.
