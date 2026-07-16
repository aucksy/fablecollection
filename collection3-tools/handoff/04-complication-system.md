# Complication System — every slot renders every Wear OS type

**Why this document exists.** On a real Pixel Watch build, swapping the default
complication on a face (e.g. dropping a heart-rate provider into the GT top
register) produced a broken result: the register's decorative chrono scale and
seconds needle stayed on screen *under* the provider's own drawing, so the
sub-dial "lost its feel." The cause was an architecture mistake — decorative
sub-dial artwork was baked into the dial as if it were permanent, when in fact
the region is a **complication slot** whose content the user controls.

This document defines the fix as a **design-system rule** every face must obey,
and the exact per-type render treatment the build side implements in WFF.

---

## 1. The one rule

> **A slot is a FRAME plus swappable CONTENT.** The frame (the machined register
> plate, the bevelled panel, or an open dial region) is permanent hardware and
> never changes. The content is whatever complication the user assigns, drawn by
> the watch face **in the dial's own style**. Decorative "sub-dial" artwork
> (tick scales, register needles, 0–250 numerals) is the slot's **empty-state
> default only** — the instant a provider is assigned, that default is hidden and
> the type-appropriate content takes its place inside the same frame.

The platform hands the face **raw values**; the face is responsible for
formatting them for display. So "make it look native" is entirely our job, and
it must hold for *every* type a slot advertises — not just the default one.

Never again: a slot whose empty-state decoration (needle, scale, ticks) remains
visible once a complication is assigned. That is the specific defect this
system removes.

---

## 2. The complete Wear OS complication type set (target: WFF v1, forward-safe to Wear OS 4)

WFF's `<Complication type="…">` element accepts, in one slot, one block per
supported type. The renderable types:

| Type | Delivers | Optional extras | Typical providers |
|---|---|---|---|
| `SHORT_TEXT` | ≤7-char text | title, monochromatic icon / small image | HR, steps, temp, day+date |
| `LONG_TEXT` | longer text | title, icon / small image | next event, now-playing |
| `RANGED_VALUE` | value in [min,max] | text, title, icon, colour range | battery, goal, activity |
| `GOAL_PROGRESS` | value toward a target (min≡0, **value may exceed target**) | text, icon | step goal |
| `WEIGHTED_ELEMENTS` | array of (weight, colour) segments | text, title, icon | activity / sleep breakdown (pie) |
| `MONOCHROMATIC_IMAGE` | one tintable icon | — | app shortcut glyph |
| `SMALL_IMAGE` | small image (PHOTO or ICON style) | — | contact photo, app icon |
| `PHOTO_IMAGE` | large / background image | — | background slot |
| `EMPTY` / `NO_DATA` / `NOT_CONFIGURED` / `NO_PERMISSION` | no value — a state | — | placeholder handling |

Notes that shaped the treatments below:
- For every `RANGED_VALUE` variant, at least one of icon / text / title is
  guaranteed — never assume all three; lay out by what's present.
- `SHORT_TEXT` may arrive as text only, title+text, or icon+text — the layout
  must handle each. (Optional fields are never guaranteed.)
- `GOAL_PROGRESS` value can be **> target** (e.g. 11,200 / 10,000). A naïve 0–100%
  gauge clips or overflows ugly; our treatment draws a second "overflow lap."
- `WEIGHTED_ELEMENTS` colours carry the meaning (there's no room for labels) —
  render the segments in the provider's colours, mapped onto our role palette.
- `HR` and `weather` remain **forbidden as v1 defaults**; this system is about
  making them (and everything else) render correctly when a user *adds* them.

---

## 3. Per-frame render treatments (what the prototype's `complRender` proves)

Three frame styles cover the whole collection. Each renders all the types its
geometry can carry; every treatment uses only theme roles (`ink / accent /
muted / lume / bg`) so it re-tints with the dial.

### 3a. Circular register (machined plate — the instrument sub-dials)
Content lives inside inner radius `ri = r − 4`.

- **SHORT_TEXT** — big centred value (`Saira SemiCondensed`, tabular); optional
  icon above at `−0.44·ri`, optional title below at `+0.45·ri`. No ticks, no needle.
- **LONG_TEXT** — title (accent) top, value (ink) centred, icon bottom; ellipsised.
- **RANGED_VALUE** — 300° gauge arc (`−150°→150°`, gap at 6 o'clock): muted track +
  accent fill to `frac`; centred value; icon above; unit/title below.
- **GOAL_PROGRESS** — full ring: accent fill to `min(frac,1)`; if `frac>1` a **lume
  overflow lap** on top for the excess; centred count + `NNN%` (lume when >100%).
- **WEIGHTED_ELEMENTS** — segmented ring, each element an arc sized to its weight
  in its own colour with a 7° gap; optional centred icon.
- **MONOCHROMATIC_IMAGE** — single centred tinted icon at `~0.95·ri`.
- **SMALL_IMAGE** — circular photo well (`0.9·ri`) with a metal rim (PHOTO → contact
  silhouette placeholder; ICON → centred app glyph).
- **PHOTO_IMAGE** — image fills the register floor; neutral gallery placeholder.
- **EMPTY / NO_DATA** — faint centred ring + `—`. Intentional, not broken.
- **NO_PERMISSION** — centred lock glyph + `TAP`.

### 3b. Bevelled panel (framed date window / chip)
- **SHORT_TEXT** — value centred; icon left + title below only when the panel is
  wide enough (`w ≥ 58`), else value only (keeps a 40-px date window clean).
- **LONG_TEXT** — title top, text below.
- **RANGED_VALUE / GOAL_PROGRESS / WEIGHTED_ELEMENTS** — compact horizontal bar +
  value (a panel can't hold a ring).
- **MONOCHROMATIC_IMAGE / SMALL_IMAGE / PHOTO_IMAGE** — centred icon / image fill.
- **EMPTY** — `—`. **NO_PERMISSION** — lock glyph.

### 3c. Open dial region (event line, sunrise/sunset)
Same content as the panel treatments **without** the panel background — text /
icon laid directly on the dial. Realistically only offers text + icon types.

---

## 4. How this maps to WFF (build side)

Each slot is one `<ComplicationSlot>` whose `supportedTypes` lists exactly the
types in §3 for its frame. Inside it, provide **one `<Complication type="X">`
block per supported type** — the platform renders whichever block matches the
delivered data, so our "one treatment per type" is a 1:1 mapping:

- Text → `<PartText>` with `<Template>%s<Parameter expression="[COMPLICATION.TEXT]"/></Template>`
  (and `[COMPLICATION.TITLE]`); gate the title/icon parts on their presence.
- Icons/images → `<PartImage>` bound to `[COMPLICATION.MONOCHROMATIC_IMAGE]` /
  `[COMPLICATION.SMALL_IMAGE]` / `[COMPLICATION.PHOTO_IMAGE]`.
- Ranged gauge → an arc `PartDraw` whose sweep binds to `[COMPLICATION.RANGED_VALUE]`
  between `RANGED_VALUE_MIN`/`_MAX`.
- Goal → arc bound to `[COMPLICATION.GOAL_PROGRESS_VALUE]` / `_TARGET_VALUE`; the
  overflow lap is a second arc gated on value>target.
- Weighted → arcs coloured from `[COMPLICATION.WEIGHTED_ELEMENTS_COLORS]` sized by
  `[COMPLICATION.WEIGHTED_ELEMENTS_WEIGHTS]`.
- The empty-state default artwork (register scale + seconds sub-hand, date token,
  etc.) lives in the **`EMPTY`** block only — so it disappears automatically the
  moment any other type is delivered. This is the whole fix, expressed in WFF.

The machined plate / bevel is drawn by the dial layer **behind** the slot and is
shared by every type block, so the frame is pixel-identical across all content.

---

## 5. Slot inventory (VAKT Instrument Series — CAT-A)

Each face declares its slots with a `frame` (`plate` / `panel` / `open`) and the
full `types` set its frame supports. Circular registers advertise all eight
renderable types; panels advertise text + gauge + icon + image; open regions
advertise text + icon.

| Face | Slot | Frame | Types |
|---|---|---|---|
| A1 One | Top register / Date / Unread chip | plate / panel / panel | full / panel / text+icon |
| A2 GT | Top register / Hero counter / Date | plate / plate / panel | full / full / panel |
| A3 Meridian | Top register / Event line / Date | plate / open / panel | full / open / panel |
| A4 Ti | Top register / Steps register / Date | plate / plate / panel | full / full / panel |
| A5 Night Watch | Top register / Sunrise / Sunset / Date | plate / open / open / panel | full / open / open / panel |

Defaults are unchanged and v1-legal (seconds sub-hand, native steps/battery,
date tokens, unread, next-event, sunrise/sunset). HR/weather stay user-added.

---

## 6. Verify it live

In the showroom, open **SLOT TEST** on any face and change a slot's dropdown, or
hit **SHUFFLE ALL**. The watch above updates instantly: the frame holds, the
content swaps, nothing overlaps or clips. That interaction is the acceptance
demo for this system.

## 7. Acceptance criteria

- [ ] No slot shows decorative empty-state artwork (needle/scale/ticks/date token)
      once a non-empty complication is assigned.
- [ ] Every advertised type renders inside the slot frame with no overflow,
      overlap, or clipping, in all five themes + the light dial.
- [ ] `GOAL_PROGRESS` handles value > target (overflow lap, not a clipped bar).
- [ ] `WEIGHTED_ELEMENTS` renders provider colours as proportional segments.
- [ ] `EMPTY` / `NO_DATA` / `NO_PERMISSION` each read as intentional states.
- [ ] Optional-field variants of `SHORT_TEXT`/`RANGED_VALUE` (text-only,
      title+text, icon+text) all lay out correctly.
- [ ] Frame geometry is pixel-identical across every type for a given slot.
- [ ] AOD is unaffected (complications drop or collapse to ≤1 per §6 of the
      platform constraints).
