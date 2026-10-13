# Screens & Routes

Phone-first PWA, fully responsive up to desktop. Primary navigation is a **bottom tab
bar** with four destinations; settings is reached from a header icon, not a tab.

## Routes

- `/` — **Dashboard.** Landing screen. On-track summary as stat cards (bodyweight +
  weekly rate, waist trend, strength index, later calories) and quick actions (log weight,
  start today's workout). Hosts empty/first-run states. Shows a recomposition preview (one-line
  thesis + mini chart, only once both series have a baseline) linking to
  `/progress/recomposition`. The bodyweight, waist and strength-index cards are tappable
  (bodyweight opens quick-add, the others link to their trend); the bodyweight card shows a
  goal bar when a goal is set in Settings. The strength card reads "Baseline 100 · +x.x %".
  - **Day navigation.** The overline shows the _selected_ day (`EEEE · d. MMMM`, `de`
    locale), not necessarily today. The header's action slot (top right) holds a "Heute"
    pill — shown only when the selected day isn't today, returns to today — and a ghost
    `CalendarDays` icon button that opens a bottom-sheet calendar (`DayCalendarSheet`).
    The calendar highlights the selected day, disables future days, and marks every
    past/today day with a small neutral dot or, when a session was logged that day, a
    green check; tapping a day selects it and closes the sheet. The content below the
    header also responds to a horizontal swipe (right = previous day, left = next day,
    no-op on today) with a short directional slide/fade; vertical scroll is never
    intercepted. The stat cards (bodyweight, waist, strength index) read **as of the selected
    day** — entries logged later are excluded, so backfilling a past day shows that day's
    standing, not today's; a card with nothing up to that day shows its normal empty state. The
    Recomposition preview stays global regardless of the selected day.
  - **Workout card, day-aware.** The selected day already has a session → the card shows its
    progress instead of a suggestion: "Heutiges Training" (today) / "Training am {date}" (past),
    the workout name, a `done/total Sätze` tally badge, and a green check once every planned set
    is logged. Tapping opens `/log`, which (per below) shows that same session directly. No
    session on a **past** day → a backfill suggestion instead, labelled "Nachtragen · {date}",
    using the rotation workout that would follow the session _before_ that day; tapping opens
    `/log`, which opens the picker. No session **today** → unchanged: the card suggests today's
    rotation workout and tapping starts logging it directly (bypassing the picker).
- `/log` — **Log.** The gym screen, day-aware. The selected day already has a session (today or
  backfilled) → that session opens directly — no picker, since there's only one workout per day;
  a legacy day with several sessions opens the most recently dated one. No session on the
  selected day → the workout picker. On a **past** day the picker is labelled as backfilling
  ("Nachtragen · {date}") and its rotation suggestion is computed from the session _before_ that
  day (a session logged on or after it doesn't count). A freshly picked workout carries no day
  information through router state — the session form reads the selected day from context itself.
  A brand-new session is dated with `stampOnDay(selectedDay)` (today's time-of-day, on that
  calendar day), captured once when the form mounts; a saved session keeps its own date and is
  never re-stamped on edit. Last-weight placeholders come from the session before THAT session's
  date, so correcting an old session shows the session before it, not a later one. When the
  session's date isn't today, the header overline shows the full date instead of the rotation
  position.
  - `/log/:sessionId` — the active/editable session (also used to open a past session to
    correct it), independent of the selected day.
- `/progress` — **Progress.** Analysis hub with nested-route sub-views. The tab strip is an
  equal-width, non-scrolling grid with short labels ("Recomp" · "Kraft" · "Körper") so all
  three fit at 320; page titles keep the long names. Each view ends in an insight box (trend
  pill + plain-language takeaway):
  - `/progress/recomposition` — the hero indexed strength-vs-bodyweight chart (default).
  - `/progress/strength` — per-workout exercise lines (workout selector, toggleable,
    swap-aware).
  - `/progress/exercise/:exerciseId` — single-exercise drilldown with the min–max band and stat tiles; entered from "Kraft", which stays highlighted.
  - `/progress/body` — smoothed bodyweight trend + rate, and the measurements chart
    (waist-down vs. muscle-holding), with insight boxes and measurement tiles.
- `/manage` — **Manage** (plans, workouts, exercises):
  - `/manage/plans` — plan list (create, set active, archive).
  - `/manage/plans/:planId` — workouts within a plan.
  - `/manage/plans/:planId/workouts/:workoutId` — workout editor (slots: target sets, rep
    range, order, alternatives).
  - `/manage/exercises` — exercise catalog (list/search).
  - `/manage/exercises/:exerciseId` — create/edit a catalog exercise (name, type, unit).
- `/settings` — **Settings** (header, not a tab): export/import backup, unit preferences,
  the bodyweight goal ("Ziel" row: target weight in kg, set or clear; drives the Dashboard
  goal bar), the calorie incomplete-day threshold, and the Yazio connection (Phase 2).

## Quick-add measurements

Logging a bodyweight/measurement is a lightweight **modal/sheet** (shadcn) launched from
the Dashboard and `/progress/body` — one tap, not a navigation. Use a shadcn sheet/dialog;
the numeric input itself follows the custom gym-input pattern.

The sheet writes to a **day**: the Dashboard trigger passes the currently selected day; the
`/progress/body` trigger always writes to **today** (Progress stays global). The sheet shows
the day in its header (an overline above the title) only when that day isn't today.

**Prefill + replace semantics** — one value per type per day:

- Opening the sheet loads that day's existing entries (per measurement type) and prefills them
  as real input values, formatted to the field's usual decimals. The last-value placeholder
  shown for an empty field is the latest value **up to and including that day**, not a later one.
- Saving a changed value **replaces** the day's existing entry for that type (no duplicate).
- Clearing a prefilled field **deletes** that day's entry for that type.
- A field left unchanged is skipped — saving never rewrites an identical value.
- The save button is enabled only once something changed versus what was loaded.

## Navigation notes

- Bottom tab bar destinations: Dashboard, Log, Progress, Manage (always four, all styled alike; no emphasised tab). The `<nav>` landmark is labelled "Hauptnavigation" (`nav.primary`). Settings via header icon.
- SPA fallback must be configured on the host so deep links / refreshes resolve (see
  architecture.md, hosting).

## First run

No separate onboarding wizard. On first launch the seed creates the Push/Pull/Legs plan +
its exercises (see data-model.md, seed), so the user can log immediately. Empty states
remain as a fallback for anyone who deletes everything: Dashboard and Manage show guiding
prompts ("Create your first plan" → "Add exercises" → "Log your first session").

## Component sourcing (see CLAUDE.md)

- **shadcn/ui** for chrome: tab bar, dialogs/sheets (quick-add, confirms), dropdowns, tabs,
  the Manage editors and Settings forms.
- **Custom** for the two hero surfaces: the weight-logging inputs (big tap targets,
  last-weight placeholder, fast numeric entry) and the charts (Recharts).
