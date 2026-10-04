# Design audit: final verification

## 1. What was compared

Final re-run of the prototype-vs-app comparison after the 35 design-alignment commits
(`git log main..HEAD`), against the original audit in [`docs/design-audit.md`](./design-audit.md)
and the decisions in [`docs/design-fix-plan.md`](./design-fix-plan.md) §0 (user decisions override
the prototype: four tabs, dot decimals, short Progress tab labels, no rest timer, no keypad, no glow).

- Date: 2026-10-04. Branch: `design-alignment`. App: `localhost:5173` (demo DB: 1 plan, 3 workouts,
  17 exercises, 48 sessions, 91 measurements). Prototype: `localhost:5174`, default tweaks
  (electric / slate / balanced), 390px phone frame.
- App widths: **320** and **390** (same-origin iframe harness) plus **1280** (desktop iframe).
  Computed values via `getComputedStyle` / `getBoundingClientRect`; overflow via `scrollWidth`.
- No data was written (no import/export, no saved sessions, dialogs opened and cancelled only).
- Part A (Shell, Dashboard, Log) and part B (Progress, Manage, Settings) were done as two passes and
  merged here. Screenshots live outside the repo:
  `C:\Users\pgaug\AppData\Local\Temp\gymtracker-design-alignment\screens\final\A\` and `...\final\B\`
  (B: `proto-progress-*`, `app-progress-*`, `app-manage-*`, `app-*-dialog-*`, `app-settings-*`).

Global checks for part B (all pass): no horizontal page overflow at 320 / 390 / 1280 on
`/progress/{recomposition,strength,exercise/:id,body}`, `/manage/{plans,plans/:id,plans/:id/workouts/:id,exercises}`
and `/settings`; every dialog fits (slot editor 668px high in a 700px frame, scrolls inside);
desktop content is capped at 640px. Every interactive element is >= 48px except the items in F-06.

## 2. Summary

76 original IDs (the 47 consolidated items cover them via the coverage table), each verdict once:

| Verdict  | Count |
| -------- | ----- |
| RESOLVED | 61    |
| PARTIAL  | 4     |
| OPEN     | 0     |
| ACCEPTED | 11    |

New differences found by this pass (F-): **9** (F-01..F-05 from part A, F-06..F-09 from part B).
No blockers. No APP BUG (overflow, clipping, dropped class) remains; the only tap-target issue is the
2px shortfall in F-06.

## 3. All original IDs

Verdict key: RESOLVED / PARTIAL / OPEN / ACCEPTED (intentional: rule, user decision, out of scope).

### Tokens / shell (T-)

| ID   | Cons. | Element                | Verdict  | Evidence / reason                                                                                                                             |
| ---- | ----- | ---------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| T-01 | X-01  | tap targets            | RESOLVED | All screens measured >= 48px (header gear, sheet/dialog close 48x48, Manage icon buttons 48x48, dialog fields and buttons 48). Residual: F-06 |
| T-02 | X-02  | sheet chrome           | RESOLVED | Sheet bg rgb(18,22,31) = `--sheet`, scrim rgba(2,3,7,.6), grab pill. Radius 20 vs 24: ACCEPTED (C-2 token)                                    |
| T-03 | X-04  | card surface           | RESOLVED | Chart cards radius 14px, border rgb(35,41,54), padding 18/14/16 = prototype `.chart-card`                                                     |
| T-04 | X-05  | overline colour        | RESOLVED | `AKTIV` / `ROTATION` / header overlines rgb(105,112,127), mono 11px; only the Recomposition CTA is primary                                    |
| T-05 | X-06  | type scale             | ACCEPTED | Nearest-token rule C-3 (28 vs 30 etc.)                                                                                                        |
| T-06 | X-07  | Log tab emphasis       | ACCEPTED | Four tabs + solid tile, no glow: user decision Q10, glow forbidden                                                                            |
| T-07 | X-08  | segmented active state | RESOLVED | Progress strip and workout selector: active bg rgb(59,130,246), fg rgb(6,16,31), 13px; dialogs and Settings use the same solid pill           |
| T-08 | X-09  | radius tiers           | RESOLVED | Buttons 10px, stepper 6px (part A), tab triggers 6px in a 10px track (= prototype `.segmented2`)                                              |
| T-09 | X-10  | warn badge tone        | ACCEPTED | Not built, no caller (YAGNI)                                                                                                                  |
| T-10 | X-11  | fonts doc note         | RESOLVED | No Google Fonts note left in `docs/design-system.md`                                                                                          |

### Dashboard (D-)

| ID   | Cons. | Element                     | Verdict  | Evidence / reason                                                                                                                                                                                        |
| ---- | ----- | --------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-01 | X-12  | stat label hidden at 320    | RESOLVED | All four labels visible at 320, no overflow (part A)                                                                                                                                                     |
| D-02 | X-12  | stat label truncated at 390 | RESOLVED | Label row wraps; badge placement detail: F-03                                                                                                                                                            |
| D-03 | D-03  | Recomposition preview       | PARTIAL  | Card, thesis, chart present; chart readability: F-01                                                                                                                                                     |
| D-04 | D-04  | tappable stat cards         | RESOLVED | Weight is a button (opens sheet), Taille / Kraft-Index are links                                                                                                                                         |
| D-05 | D-05  | goal bar                    | PARTIAL  | Implemented (`StatCard` `goal` prop); Settings "Ziel" row verified at 320/390 (input, unit, "Entfernen" fit, 48px). Bar itself not seen: no target stored and writes are forbidden. Check by hand (FP-2) |
| D-06 | D-06  | CTA row                     | RESOLVED | 48px, primary-soft bg                                                                                                                                                                                    |
| D-07 | X-13  | go tile                     | RESOLVED | Solid primary tile, radius 10                                                                                                                                                                            |
| D-08 | D-08  | Heute dran surface          | RESOLVED | Gradient 155deg, border rgb(51,58,75), radius 14 = prototype                                                                                                                                             |
| D-09 | X-16  | chips pill + border         | RESOLVED | radius 9999, border rgb(35,41,54)                                                                                                                                                                        |
| D-10 | D-10  | weight sheet + keypad       | ACCEPTED | User decision Q11 (keypad declined)                                                                                                                                                                      |
| D-11 | X-02  | sheet background            | RESOLVED | see T-02                                                                                                                                                                                                 |
| D-12 | X-02  | sheet radius                | RESOLVED | see T-02                                                                                                                                                                                                 |
| D-13 | X-02  | sheet shadow                | RESOLVED | see T-02                                                                                                                                                                                                 |
| D-14 | X-02  | scrim                       | RESOLVED | see T-02                                                                                                                                                                                                 |
| D-15 | X-02  | grab handle                 | RESOLVED | see T-02                                                                                                                                                                                                 |
| D-16 | X-01  | header icon                 | RESOLVED | 48x48                                                                                                                                                                                                    |
| D-17 | X-01  | other chrome taps           | RESOLVED | see T-01                                                                                                                                                                                                 |
| D-18 | X-07  | Log FAB                     | ACCEPTED | see T-06                                                                                                                                                                                                 |
| D-19 | X-05  | overline colour             | RESOLVED | see T-04                                                                                                                                                                                                 |
| D-20 | X-04  | card surface                | RESOLVED | see T-03                                                                                                                                                                                                 |
| D-21 | D-21  | empty state                 | ACCEPTED | No prototype reference; not re-verifiable without clearing data                                                                                                                                          |
| D-22 | D-22  | calories pill copy          | RESOLVED | "Bald"                                                                                                                                                                                                   |

### Log (L-)

| ID   | Cons. | Element                          | Verdict  | Evidence / reason                                                     |
| ---- | ----- | -------------------------------- | -------- | --------------------------------------------------------------------- |
| L-01 | L-01  | set input at 320                 | RESOLVED | 0 of 18 inputs clipped (66px wide at 320)                             |
| L-02 | L-02  | hero input size/weight/alignment | PARTIAL  | 22px/600 (proto 24 = ACCEPTED C-3); right-aligned vs proto left: F-02 |
| L-03 | X-13  | done index                       | RESOLVED | Filled success circle, dark text, 34px                                |
| L-04 | L-04  | tally chip                       | RESOLVED | Pill + border, done = success tint                                    |
| L-05 | L-05  | session header                   | PARTIAL  | Border, centred title, spacer ok; overline text differs: F-04         |
| L-06 | L-06  | rest timer                       | ACCEPTED | User decision Q9 (declined)                                           |
| L-07 | X-13  | filled input border              | RESOLVED | Primary border when filled                                            |
| L-08 | X-09  | stepper radius                   | RESOLVED | 6px, 48x48                                                            |
| L-09 | L-09  | progress fill                    | RESOLVED | primary to accent gradient                                            |
| L-10 | X-14  | unit/meta colour                 | RESOLVED | `text-subtle`                                                         |
| L-11 | X-05  | picker overline                  | RESOLVED | grey                                                                  |
| L-12 | X-12  | picker overline wrap             | RESOLVED | single line, badge wraps below                                        |
| L-13 | L-13  | picker close                     | ACCEPTED | Picker is a tab destination (docs/screens.md)                         |
| L-14 | L-14  | back target                      | RESOLVED | `returnTo: "/"` from Heute dran (source)                              |
| L-15 | L-15  | hint copy                        | RESOLVED | bold workout name                                                     |

### Progress (P-)

| ID   | Cons. | Element                | Verdict  | Evidence / reason                                                                                                                                                |
| ---- | ----- | ---------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P-01 | X-08  | tab strip active state | RESOLVED | Solid primary pill; 3-col grid, tabs 114x48 at 390, all visible and no overflow at 320 (`app-progress-recomp-320-390`). 48px vs prototype 33px = tap rule        |
| P-02 | X-15  | label size collapse    | RESOLVED | Tabs, selector, chips compute 13px                                                                                                                               |
| P-03 | P-03  | stepped lines          | RESOLVED | Strength + drilldown use `stepAfter` (visible stairs, band follows steps). Recomposition index is a smoothed moving average (O-08), permitted by docs/charts.md  |
| P-04 | P-04  | series glyphs          | RESOLVED | Distinct marker + dash per series on lines, legend and tooltip (circle, square, triangle, diamond, cross, star)                                                  |
| P-05 | P-05  | insight boxes          | RESOLVED | Recomposition ("Kraft steigt", Gewicht −6.5 %, Kraft +54.9 %), Body weight and comparison ("Taille −3.8"); Strength has the swap note box, same as the prototype |
| P-06 | P-06  | drilldown stat tiles   | RESOLVED | Aktuell / seit Start (+22.5) / Einheiten tiles, 3-col at 320 and 390                                                                                             |
| P-07 | P-07  | body delta tiles       | RESOLVED | Per-measurement signed delta + marker, true minus (U+2212). 320 wrap of unit: F-07                                                                               |
| P-08 | X-14  | caption style          | RESOLVED | Mono grey notes in all four views, terse copy                                                                                                                    |
| P-09 | P-09  | recomp noise           | RESOLVED | Smoothed display line (O-08); dense dots: F-01                                                                                                                   |
| P-10 | P-10  | indexed vs raw axis    | ACCEPTED | docs/charts.md allows both; app indexes to 100                                                                                                                   |
| P-11 | P-11  | raw + 7-day MA         | ACCEPTED | Rule (docs/charts.md); app compliant (dots + MA line, tooltip shows both)                                                                                        |
| P-12 | P-12  | tab structure          | ACCEPTED | Deliberate IA; drilldown highlights "Kraft" (user decision O-11)                                                                                                 |
| P-13 | P-13  | tab labels             | RESOLVED | Short labels "Recomp / Kraft / Körper" per O-11; h1 follows the active view ("Recomposition", "Kraft je Workout", "Einzelübung", "Körpermaße")                   |
| P-14 | P-14  | chip truncation at 320 | RESOLVED | Names wrap to two lines ("Schrägbankdrücken Kurzhantel" fully visible)                                                                                           |

### Manage & Settings (M-)

| ID   | Cons. | Element                     | Verdict  | Evidence / reason                                                                                                       |
| ---- | ----- | --------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| M-01 | M-01  | slot-editor select overflow | RESOLVED | Dialog 288 (320) / 358 (390) wide, select right edge 272 / 358, form 287 / 358 inside it, no page overflow              |
| M-02 | X-03  | dialog surface              | RESOLVED | bg rgb(18,22,31), radius 20, border rgb(35,41,54), shadow `0 18px 44px -8px rgba(0,0,0,.65)`                            |
| M-03 | X-01  | Manage icon buttons         | RESOLVED | edit / add 48x48, move buttons 48                                                                                       |
| M-04 | X-03  | dialog title                | RESOLVED | 18px / 600 (was 16 / 500)                                                                                               |
| M-05 | X-03  | scrim                       | RESOLVED | rgba(2,3,7,.6)                                                                                                          |
| M-06 | X-01  | dialog footer buttons       | RESOLVED | Speichern / Löschen 48px high, full width                                                                               |
| M-07 | X-01  | RepInput / steppers         | RESOLVED | all 48px in the slot editor                                                                                             |
| M-08 | X-05  | overlines                   | RESOLVED | `AKTIV`, `ROTATION · PLATZ 1` rgb(105,112,127)                                                                          |
| M-09 | X-08  | Manage Pläne/Übungen nav    | RESOLVED | solid primary active pill                                                                                               |
| M-10 | X-08  | type / unit segmented       | RESOLVED | Gerät and kg/lb use the same solid pill (exercise editor, Settings)                                                     |
| M-11 | M-11  | index badge                 | RESOLVED | circular, bordered, 36px                                                                                                |
| M-12 | X-16  | catalog type chips          | RESOLVED | pill + border                                                                                                           |
| M-13 | M-13  | destructive border          | RESOLVED | Source: `destructive` variant has `border-danger/33`. The import-confirm dialog needs a file, so it was not opened live |
| M-14 | X-03  | dialog max-height           | RESOLVED | Slot editor 668px in a 700px frame, scrolls internally                                                                  |
| M-15 | X-03  | dialog description          | RESOLVED | token size, 2-line wrap fits at 320                                                                                     |

### New differences (F-)

| ID   | Screen                        | Element                              | Severity | Verdict         | Evidence                                                                                                                                   |
| ---- | ----------------------------- | ------------------------------------ | -------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| F-01 | Dashboard preview, Recomp tab | per-session dots, baseline label     | med      | OPEN            | 48 dots form a beaded smear; "Start = 100" label sits on the bodyweight line (`app-progress-recomp-320-390`, part A dashboard shots)       |
| F-02 | Log                           | set value alignment                  | low      | OPEN (decision) | right-aligned, prototype left                                                                                                              |
| F-03 | Dashboard                     | TrendBadge size and placement        | low      | OPEN            | 11px, 4/10px padding wraps below the label at 390; waist badge shows cm/Wo, not %                                                          |
| F-04 | Log                           | session header overline              | low      | OPEN            | "TRAINIEREN" vs "ROTATION · n VON N"                                                                                                       |
| F-05 | shell, desktop                | nav spans full 1280, content 640     | low      | OPEN            | tab icons far from the content column                                                                                                      |
| F-06 | Progress strength, drilldown  | toggle chip halves, "im Detail" link | low      | OPEN            | inner buttons / links 46.4px high inside a 48px bordered container (`Bankdrücken 120x46`, `im Detail 48x46`); about 2px under the tap rule |
| F-07 | Progress body                 | delta tile at 320                    | low      | OPEN            | "-3.8" and "cm" stack on two lines at 320 (one line at 390)                                                                                |
| F-08 | Progress drilldown            | exercise chip row                    | low      | ACCEPTED        | horizontal inner scroller as in the prototype, no page overflow                                                                            |
| F-09 | Manage slots / plan rows      | long names                           | low      | OPEN            | "Schrägbankdrück…" truncated at 320 and 390 although the row could wrap to two lines                                                       |

## 4. Still open (in scope)

Four packages, each doable by one agent. Run `npm run ci` after each.

**FP-1: Chart density and clarity (F-01, D-03)**

- Files: `src/features/analysis/components/RecompositionChart.tsx`, `RecompositionPreview.tsx`.
- Preview (`height <= 200`): `dot={false}` on both `<Line>`s, keep `activeDot`. In the full chart do the same for the strength index line (it is a smoothed series anyway).
- Move the "Start = 100" `ReferenceLine` label (`position="insideTopRight"` with a small `dy`) so it does not sit on the bodyweight line.

**FP-2: Tap-target and fit leftovers (F-06, F-07, F-09, D-05 check)**

- `StrengthProgressionView.tsx` toggle chip halves and the "im Detail" link: make the inner button and link fill the container (`h-full min-h-(--tap)`) or move the border to an inset ring so they measure 48px.
- `BodyView.tsx` delta tile: `whitespace-nowrap` on value + unit, tile padding `px-2.5`, or `flex-wrap items-baseline`, so "-3.8 cm" fits on one line at 320.
- `WorkoutSlotsView.tsx`, `PlanDetailView.tsx`: replace `truncate` on the exercise / workout name with `line-clamp-2 wrap-break-word`.
- By hand: set a target in Settings "Ziel" and check the Dashboard weight-card goal bar at 320 and 390 (D-05).

**FP-3: Log header and set input (F-02, F-04, L-02, L-05)**

- `src/features/training/components/SetRow.tsx` (around line 67): `text-right` to `text-left` only if the user wants prototype alignment (needs a decision, otherwise move to ACCEPTED).
- `ActiveSession.tsx` header `Overline`: show the rotation position ("Rotation · n von N", existing `log.pick` rotation key) instead of `t("nav.log")` when the workout's position is known.

**FP-4: Dashboard badge and desktop nav (F-03, F-05)**

- `src/components/ui/` TrendBadge: `px-2 py-0.5` so shorter badges fit beside the label at 390; decide whether the waist badge shows % (prototype) or the rate.
- `BottomTabBar.tsx` and the app header: wrap the inner row in `mx-auto max-w-screen-sm` so the tabs sit under the 640px content column on desktop.

## 5. Accepted differences

| Item                                                           | Reason                                                                      |
| -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| T-05 type sizes 28/36/22 vs 30/32/26                           | Rule: tokens only, nearest-token mapping (fix plan C-3)                     |
| Sheet/dialog radius 20 vs 24; overline tracking .16em vs .14em | Documented tokens (`--radius-xl`, `--text-micro`)                           |
| Tap sizes 48 vs prototype 33 to 46 (strip, steppers, go tile)  | Rule: CLAUDE.md `--tap` 48px                                                |
| T-06 / D-18 Log tab: four tabs, solid tile, no glow            | User decision (four tabs, Q10); design-system rule against glow             |
| D-10 weight sheet + keypad                                     | User decision Q11                                                           |
| L-06 rest timer                                                | User decision Q9                                                            |
| L-13 picker close                                              | Documented IA (picker is a tab)                                             |
| T-09 warn badge                                                | No caller (YAGNI)                                                           |
| D-21 empty state                                               | No prototype reference                                                      |
| P-10 indexed body chart axis                                   | docs/charts.md allows either                                                |
| P-11 raw + 7-day MA                                            | Rule (docs/charts.md); the prototype breaks it                              |
| P-12 three Progress tabs, drilldown by route                   | Documented IA; tab labels per user decision O-11                            |
| F-08 scrolling chip row on the drilldown                       | Same as prototype, no page overflow                                         |
| Dot decimals, true minus, explicit plus                        | User decision (2026-10-03)                                                  |
| Not verified live (no data writes allowed)                     | goal bar with a stored target, import-confirm dialog, empty/first-run state |
