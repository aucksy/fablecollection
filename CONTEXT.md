# CONTEXT — kickoff for a fresh chat

You are continuing **Fable Watch Faces Series 01 · ARCLIGHT** at `D:\Apps\WearOS Apps\WatchFaces\Fable Collection`.

1. Read `PROGRESS.md` (state + next steps + risk watchlist) and `README.md` (structure).
2. Design source of truth: `FABLE-Arclight-Showcase.html` (open in browser; deep links like `#f=0&cfg=Data-Rich`). Do NOT look at the separate TwelveSixty project — owner wants this line independent.
3. Build rules: cloud-only (no local Android toolchain on this machine — never download it). Ship loop: push main → tag `v*` → GitHub Actions builds and releases the APK → paste the direct `.apk` download link in chat. Adversarial review BEFORE tagging.
4. Repo: `github.com/aucksy/fable-arclight` (owner must create if it doesn't exist yet). Git author: simpleapps108@gmail.com.
5. Current phase: getting Solstice (face 01) CI-green and on-wrist, then a design-fidelity pass against the showcase, then face 02 (PULSAR).
