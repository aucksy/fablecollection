# VAKT — "every slot renders every type" · implementation plan

**Status: BUILT 2026-07-16** (WF-A1..A5 regenerated; validator PASS at v2; `git diff` clean outside the
5 `Vakt-*` dirs). §7 below records where the build deviated from this plan and why — read it before
applying this plan to Meridian/Terra/Halo/Aurum, because three of the traps it hit are general.
**Scope: CAT-A / VAKT only (5 faces).**
**Design source:** `handoff/04-complication-system.md` + `spec/cat-a2.js` + `spec/renderer.jsx` (prototype).
**Why:** owner assigned HR to VAKT GT's top register on-wrist → "the design fell apart" (2026-07-16).

---

## 1. Root cause — confirmed in code, not inferred

Two separate defects, both real:

**(a) The flat-disc patch.** `slotContent()` (`gen/wff.mjs:668`) opens every circular slot with

```xml
<PartDraw name="patch_t0"><Ellipse x="6" y="6" width="104" height="104"><Fill color="#0c0c0b"/></Ellipse></PartDraw>
```

— an **opaque disc painted straight over the machined register** the instant a provider is assigned.
The plate, bevel and engraved scale are baked into `dial_t*.png`, so covering them was the only way to
show provider content at all. *That* is what the owner saw: a flat grey disc where a machined
instrument used to be.

**(b) Scene-layer decorations can't react to the slot.** `subsec_0` (seconds sub-hand) and
`needle_0/1` are emitted in the **Scene**, outside `<ComplicationSlot>` (verified on Vakt-GT:
inside-slot=0, in-scene=6/12). They are always drawn and cannot know a provider arrived.

Also: GT's registers advertise only `RANGED_VALUE EMPTY`, so most (SHORT_TEXT) providers can't be
assigned there at all.

## 2. The fix, and why it lands cleanly

The generator **already has** the machinery — it's just gated to the wrong slots:

- `LIVE_KINDS` (`gen/bake.mjs:39`) already contains `slotDecoration` → such layers are **excluded from
  the dial bake**. Nothing new needed on the bake side.
- `items` classification (`gen/wff.mjs:350`) only marks decorations `slotDecoration` when
  `s.patchMode === 'full'`. GT's registers compute `patchMode === 'text'` (`wff.mjs:274`, because
  `empty: 'Seconds sub-hand'` doesn't match `/hidden/i`) → decorations stay baked → hence the patch.
- `slotXml()` (`wff.mjs:797`) already loops `s.types` emitting one `<Complication type>` per type —
  it just **`continue`s past EMPTY**, so no empty-state block is ever produced.

**The new spec opts in explicitly**, which is what makes this safe: `withSlot()` tags each decorative
layer with `slot: 'SLOT-A2-1'`, and each slot gains `frame: 'plate'|'panel'|'open'` + a full `types`
list. **Only `cat-a2.js` carries these tags** — Meridian/Terra/Halo/Aurum specs are untouched, so
keying every change off `L.slot` / `s.frame` **cannot regress the other 20 faces.** Keep it that way.

## 3. Work items

1. **Classify by the explicit tag.** In the `items` map (`wff.mjs:317`), before the geometric
   `inSlot()` guessing: if `L.slot` is set → `kind = 'slotDecoration'`, `item.slot = slots.find(s => s.id === L.slot)`.
   This drops them from the dial bake for free (LIVE_KINDS) and hands them to the slot.
2. **Stop patching plate frames.** In `slotContent()`, skip the `patch_` Ellipse when `s.frame === 'plate'`.
   The machined plate is permanent dial art — the whole point. (Panels keep `frameRedraw()`.)
3. **Emit the EMPTY block.** In `slotXml()`, replace `if (type === 'EMPTY') continue;` with a real
   `<Complication type="EMPTY">` carrying that slot's decorations (register scale, numerals, date
   token, needle) — themed + dark like every other block. This is the whole architectural fix: the
   platform swaps it out automatically the moment any provider is assigned.
4. **The seconds sub-hand.** ⚠ `<SecondHand>`/`<AnalogClock>` are **illegal inside `<Complication>`**
   (verified: allowed children are Group/Condition/PartText/PartImage/PartAnimatedImage/PartDraw only).
   Draw it in the EMPTY block as `<PartImage>` + `<Transform target="angle" value="[SECOND] * 6">`
   using the existing `subsec_0_*` sprite and its recorded pivot. **This loses `<Sweep frequency="15">`
   smoothness → it will tick, not sweep.** Try `[SECOND_MILLISECOND]` for a smooth sweep and verify
   on-wrist; if neither reads well, fall back to a static parked sub-hand in EMPTY.
5. **Per-type treatments** in `slotContent()` per `handoff/04-complication-system.md` §3. Today only
   `RANGED_VALUE` has a real treatment; **every other type falls through to the SHORT_TEXT branch**
   (`wff.mjs:750`), which renders `[COMPLICATION.TEXT]` — that renders *nothing* for the image types.
   Needed: LONG_TEXT, MONOCHROMATIC_IMAGE, SMALL_IMAGE, PHOTO_IMAGE, GOAL_PROGRESS,
   WEIGHTED_ELEMENTS, plus the EMPTY/NO_PERMISSION states.
6. **Bump VAKT to WFF v2** (`scaffold.mjs` writes `com.google.wear.watchface.format.version`).

## 4. Verified facts — do not re-derive

- **`<Complication type>` enum, from Google's XSD** (`third_party/wff/specification/documents/<v>/complication/complicationElement.xsd`):
  - **v1:** `EMPTY LONG_TEXT MONOCHROMATIC_IMAGE PHOTO_IMAGE RANGED_VALUE SHORT_TEXT SMALL_IMAGE`
  - **v2 adds exactly:** `GOAL_PROGRESS`, `WEIGHTED_ELEMENTS`
- **`EMPTY` is a valid render block at v1** — the core fix needs no version bump. Only the two extra
  types do. Google's release notes confirm v2 introduced both.
- **The v2 bump is free for Dialed.** The faces declare v1 for "widest device coverage", but Dialed
  ships via Watch Face Push, which is **Wear OS 6 only** — coverage is moot on that channel. It only
  costs something if these faces are ever sold standalone to Wear OS 4/5 watches.
- **Proven with the real validator** (`wff-validator.jar` 1.7.0, from
  `github.com/google/watchface/releases/download/latest/`; needs JDK17 — the machine's default java is 8):
  `java -jar wff-validator.jar <version> <xml>`. A GOAL_PROGRESS slot **FAILS v1** and **PASSES v2**.
- **⭐⭐ TRAP: the validator does NOT check `[COMPLICATION.*]` expression names.** Both
  `[COMPLICATION.GOAL_PROGRESS_VALUE]` and the bogus `[COMPLICATION.VALUE]` pass v2 identically. A
  typo'd data source therefore ships green and silently renders nothing/zero on the wrist. **Only
  on-wrist testing catches it.** Use the names from Google's arithmetic-expression page, which shows a
  worked example: `[COMPLICATION.GOAL_PROGRESS_VALUE]`, `[COMPLICATION.GOAL_PROGRESS_TARGET_VALUE]`,
  `[COMPLICATION.GOAL_PROGRESS_COLORS]`, `[COMPLICATION.GOAL_PROGRESS_COLOR_INTERPOLATE]`.
  **`WEIGHTED_ELEMENTS` source names are NOT documented anywhere I could find — pin them before building
  that type, or drop it from `CIRC_TYPES` for now.**

## 5. Acceptance

- Assigning ANY provider to a VAKT register leaves the **machined plate pixel-identical** — no flat disc.
- The empty-state scale/needle/sub-hand vanish the moment a provider is assigned, and return when cleared.
- Every type in the slot's `types` renders inside the frame, in all 5 themes + dark + the light dial.
- Regenerate `WF-A1..A5` only (`node gen/build-all.mjs WF-A1` …); **`git diff` must show ZERO changes
  outside the 5 `Vakt-*` dirs** — that is the regression gate for the other 20 faces.
- Validate every changed face: `java -jar wff-validator.jar 2 <xml>` → PASS.
- Then Dialed: bump the submodule pointer → `node tools/gen-facepacks.mjs "<ABS-ROOT>"` → tag.

## 6. Not in scope

Meridian/Terra/Halo/Aurum (owner is having those designs updated). Their specs carry no `slot` tags,
so they keep today's behaviour until their own `withSlot()` pass lands.

---

## 7. What the build changed vs this plan (2026-07-16)

The architecture landed as specified — no patch, decorations in `EMPTY`, per-type treatments, v2.
Seven things this plan did not anticipate. The ⭐ ones are general WFF facts, not VAKT quirks.

1. **⭐ Slots render ABOVE the interactive group — the plan's fix alone would have put the register
   scale on top of the hands.** `ComplicationSlot` must be a direct child of `Scene` (inside the
   per-theme `ListConfiguration` it would be declared five times), so it can only be ordered against
   whole top-level groups — and it sits *after* them. Moving the decorations into `EMPTY` therefore
   moved them from under the hands (baked into the dial) to over them, in the **default** state.
   Fix: `emitFace` splits a tagged face's scene into `interactive` (dial + under-layers + sub-hands)
   → slots → `interactiveOver` (hour/minute/seconds) → AOD. This also fixes the *provider* state,
   where a flat disc used to occlude the minute hand. Referencing one `ListConfiguration id` from
   several Scene elements is safe — every slot's own type blocks already do it.
2. **⭐ `L.slot` was already taken.** In `svglib.mjs` `handParts` (and `renderer.jsx`), `L.slot` means
   *a lume slot milled into the hand*. `withSlot()` tags the register's seconds sub-hand, so the tag
   was truthy and milled a black channel into every tagged needle. Confirmed, not theorised: the
   sprites grew 1385 → 1515 bytes. Fix: test `L.slot === true` in both renderers. No spec sets
   `slot: true`, so nothing else changes.
3. **The frame must NOT join the slot** (work item 1, taken literally, deletes the plate). Frames stay
   dial art: the plate bakes; the **date-window frame stays `dateGatedStatic`** — baking it would have
   silently broken the Date toggle, since a baked layer cannot be gated. Only non-frame tagged layers
   move into `EMPTY`.
4. **⭐ WFF has no `min()`/`max()`** — but `clamp(v,min,max)` exists (v1+), and an `endAngle` outside
   `[start, start+360]` is **unspecified** in the spec (not clamped, not wrapped), so every gauge
   clamps its own fraction. `GOAL_PROGRESS` also guards `target = 0` (x/0 → Inf, `clamp(NaN)` → NaN).
   The overflow lap saturates at 2× target by design; the % readout keeps counting past it.
5. **⭐ `WEIGHTED_ELEMENTS` is renderable after all** — the plan said to pin the names or drop the type.
   Verified from the XSD: `<WeightedStroke colors= weights= thickness= discreteGap=>`, valid inside
   `<Arc>` at **v2+** but inside `<Line>` only at **v3+** (`discreteGap` is degrees on an arc, length
   on a line). Sources are `[COMPLICATION.WEIGHTED_ELEMENTS_COLORS]` / `_WEIGHTS` (+ `_BACKGROUND_COLOR`).
   ⚠ Still unconfirmed on-wrist — the validator cannot check expression names. Also: the validator does
   not check `Transform target` names either, so a typo'd target ships green and does nothing.
6. **Sub-hand: `[SECOND] * 6`** — a tick, not a sweep, exactly as the plan feared. But this is **not a
   regression**: the scene-level sub-hands already used `<Tick>`, never `<Sweep>`. `[SECOND_MILLISECOND]`
   was left alone deliberately — an unverifiable name that renders nothing is worse than a tick.
7. **Deliberate behaviour changes.** (a) Slot containers grow to cover tagged art outside the authored
   rect (GT's r71 external arc; the day name under a date window); the tap target stays on the authored
   frame. (b) Panels lay content out in the **frame** rect, not the slot rect or the grown container.
   (c) §3b's "title below when `w ≥ 58`" needs height too — VAKT's wide panels are 22–32 tall, so they
   render icon + value only. (d) Vakt-One's unread **chip frame is now permanent** (design §1: a panel is
   hardware), so a cleared chip shows an empty bevel where it used to show clean dial — this contradicts
   the older per-slot note `empty: 'Chip hidden'`; the system rule won. (e) In dark mode `lume`, `accent`
   and `ink` are the same fixed light ink, so the GOAL_PROGRESS overflow lap falls back to `muted` —
   otherwise it draws invisibly on top of the ring it is meant to overflow.

**Pre-existing, untouched, worth knowing:** both of Night Watch's sunrise/sunset slots default to the
same `SUNRISE_SUNSET` system provider (from the spec's `default:` strings), so they show the same value
out of the box.
