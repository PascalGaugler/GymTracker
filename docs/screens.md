# Screens & Routes

Phone-first PWA, fully responsive up to desktop. Primary navigation is a **bottom tab
bar** with four destinations; settings is reached from a header icon, not a tab.

## Routes

- `/` — **Dashboard.** Landing screen. On-track summary as stat cards (bodyweight +
  weekly rate, waist trend, strength index, later calories) and quick actions (log weight,
  start today's workout). Hosts empty/first-run states.
- `/log` — **Log.** The gym screen. Shows today's suggested workout (via rotation) or a
  picker; tapping in opens the active session with per-set weight inputs and last-time
  placeholders.
  - `/log/:sessionId` — the active/editable session (also used to open a past session to
    correct it).
- `/progress` — **Progress.** Analysis hub with sub-views (segmented control or nested
  routes):
  - `/progress/recomposition` — the hero indexed strength-vs-bodyweight chart (default).
  - `/progress/strength` — per-workout exercise lines (workout selector, toggleable,
    swap-aware).
  - `/progress/exercise/:exerciseId` — single-exercise drilldown with the min–max band.
  - `/progress/body` — smoothed bodyweight trend + rate, and the measurements chart
    (waist-down vs. muscle-holding).
- `/manage` — **Manage** (plans, workouts, exercises):
  - `/manage/plans` — plan list (create, set active, archive).
  - `/manage/plans/:planId` — workouts within a plan.
  - `/manage/plans/:planId/workouts/:workoutId` — workout editor (slots: target sets, rep
    range, order, alternatives).
  - `/manage/exercises` — exercise catalog (list/search).
  - `/manage/exercises/:exerciseId` — create/edit a catalog exercise (name, type, unit).
- `/settings` — **Settings** (header, not a tab): export/import backup, unit preferences,
  the calorie incomplete-day threshold, and the Yazio connection (Phase 2).

## Quick-add measurements

Logging a bodyweight/measurement is a lightweight **modal/sheet** (shadcn) launched from
the Dashboard and `/progress/body` — one tap, not a navigation. Use a shadcn sheet/dialog;
the numeric input itself follows the custom gym-input pattern.

## Navigation notes

- Bottom tab bar destinations: Dashboard, Log, Progress, Manage. Settings via header icon.
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
