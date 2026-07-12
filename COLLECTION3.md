# Collection 3 — Premium Watch Face Collection (VAKT · MERIDIAN · TERRA · HALO · AURUM)

A third watch-face line living in this monorepo alongside the Fable series (Arclight…) and the
TwelveSixty-design series (Kinetik / Aether / Settype / Vespera). Same organising rule: **one face
= one APK**, each a standalone top-level `<Family>-<Face>/` Gradle project, built + released by the
existing `.github/workflows/build.yml` (per-face tag `<slug>-v*`).

Source: the Claude Design handoff `WatchFaces Collection 3/premium-smartwatch-face-collection`.
25 faces · 5 families · 125 art-directed themes · Watch Face Format **v1** (Wear OS 4+).

## Faces

| Family | Series | Faces |
|---|---|---|
| **VAKT** | Instrument | Vakt-One · Vakt-GT · Vakt-Meridian · Vakt-Ti · Vakt-NightWatch |
| **MERIDIAN** | Dress | Meridian-Classic · Meridian-Sector · Meridian-PetiteSeconde · Meridian-Calendrier · Meridian-Roman |
| **TERRA** | Expedition | Terra-Field24 · Terra-Solstice · Terra-Compass · Terra-Altimeter · Terra-MeridianLine |
| **HALO** | Type (digital) | Halo-Stack · Halo-Beacon · Halo-Quadrant · Halo-Orbit · Halo-Ledger |
| **AURUM** | Atelier | Aurum-Guilloche · Aurum-Squelette · Aurum-Soir · Aurum-Baguette · Aurum-Eclat |

applicationId = `watchfaces.<family>.<series>.<face>` (e.g. `watchfaces.vakt.instrument.vaktone`) —
distinct from the `com.<series>.<face>` ids the other lines use, so nothing collides.

Every face ships: 5 themes (structural `ListConfiguration` switch — each theme is its own baked
dial), a pure-black dark-mode toggle (§5.2a universal-readable fixed light ink #d8d4cc/#8f8877), a
deliberate AOD (≤15% lit), complications with readable text (≥16px in 450-space), and native sweep
seconds / stepping sub-registers / data-driven arcs and needles.

## Generated — never hand-edit a face

Everything under the 25 face dirs is produced by the compiler in `collection3-tools/`:

```
node collection3-tools/gen/build-all.mjs [face]   # all 25, or one by id/slug/dir
```

It reads the canonical spec (`collection3-tools/spec/cat-*.js`, vendored verbatim from the handoff)
and the normative renderer, bakes per-theme dial art + hand sprites via resvg, and emits
`watchface.xml` using only on-wrist-proven WFF patterns. Change the compiler or the spec and
regenerate all 25 — that's what keeps the faces consistent. (resvg `node_modules` is gitignored;
`collection3-tools/gen/node_modules` is symlinked to this repo's `tools/assets/node_modules`.)

Debug signing uses `collection3-debug.keystore` (a copy committed inside each face dir, referenced
as `$rootDir/collection3-debug.keystore`), mirroring the Arclight/TwelveSixty convention.

## Ship loop

`regenerate → validate (wff-validator 1 <xml>) → commit → push main (CI validates + smoke-builds) →
tag <face-slug>-vX.Y.Z → CI releases that face's APK → paste the direct .apk link.`

All 25 pass `wff-validator` 1.7.0 against WFF v1 and have been adversarially reviewed (5 reviewers,
one per family; findings fixed in the compiler). Deviation log + on-wrist watchlist:
`collection3-tools/spec/` comments and the commit that added this line.

### On-wrist watchlist (validator-green but unproven on a real watch — test these first)
Offset-AnalogClock sub-registers (VAKT registers, Meridian Petite Seconde); PartImage
angle-Transform data needles (VAKT/Terra registers); `%02d`/`%.0f` printf Templates; `tintColor` on
provider MONOCHROMATIC_IMAGE icons; BoundingArc tap targets (Halo-Orbit rings); multiple
scene-switch instances of one `ListConfiguration` id (theme reused per complication block).
