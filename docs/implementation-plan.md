# Implementation Plan — Day navigation

Build plan for **day navigation** (view and backfill past days). **Single source of truth** for
build progress, maintained greedily. It builds on Phases 0–11 and Design alignment (DA), which
are all `done`; their plan and notes live in git history (`git log -- docs/implementation-plan.md`).
Build **one phase at a time**, in order; never build ahead.

## Status

| #   | Phase                                             | Status | Done-when (short)                                   | Learnings                                                                                                                                                 |
| --- | ------------------------------------------------- | ------ | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DN1 | Data layer + selected-day state (no UI)           | done   | new repo methods + day context tested, ci green     | Context split: `dayContext.ts` + `SelectedDayContext.tsx` + `useSelectedDay.ts` (react-refresh rule); file names must differ by more than case (Windows). |
| DN2 | Dashboard navigation (calendar sheet + swipe)     | todo   | calendar + swipe + header change the selected day   | —                                                                                                                                                         |
| DN3 | Dashboard content as of day + day-aware quick-add | todo   | cards as of day; quick-add prefill + replace/delete | —                                                                                                                                                         |
| DN4 | Day-aware Log tab + Dashboard workout card        | todo   | Log opens the day's session or a backfill picker    | —                                                                                                                                                         |

`Status` ∈ `todo · in_progress · done`. Flip to `done` ONLY after `npm run ci` passes.

## Maintenance protocol (every phase, no exceptions)

- **On start:** set the phase row to `in_progress`.
- **On finish:** after `npm run ci` passes, set the row to `done`.
- **Learnings column:** a one-line note ONLY if something arose that affects later phases (a
  shared util, a repository signature, a gotcha). Otherwise leave it `—`. Do not narrate.
- Never edit a future phase's scope speculatively; only record facts that change it.
- Update the docs the phase names (`docs/data-model.md`, `docs/screens.md`).

## Cross-cutting rules (from CLAUDE.md — apply to every phase)

- TS strict, no `any`. YAGNI/KISS. No new state/forms libraries — `useLiveQuery` + `useState`.
- Dexie touched **only** in `src/data/`. UUIDs via `crypto.randomUUID()`. Zod validate on
  write/import only. Dates as `Date`. Never index a boolean.
- All UI strings through `t()`, in both `de.ts` and `en.ts`; `de` default. User data verbatim.
- shadcn for chrome; custom for weight-logging inputs and charts. Tokens only.
- **Responsive (verify at 320px):** app-shell layout unchanged (only `<main>` scrolls); every
  flex/grid item with text or an input carries `min-w-0`; tap targets ≥ `--tap` (48px).
- Carried-over DA learnings: custom `text-*`/`shadow-*` tokens must be registered in
  `src/lib/utils.ts` for `cn()`; Radix dialogs keep content mounted — re-seed draft state on
  open; decimals via `formatDecimal`/`formatSigned`; date labels use the date-fns `de` locale.

## Context

The app only knows "now": measurements are stamped `new Date()`, the Log tab always opens the
picker, and a saved session can't be reached again. A forgotten bodyweight or missed training
log can't be backfilled.

**Goal:** pick a **selected day** on the Dashboard (calendar icon top right, plus swipe). The
Dashboard and the Log tab then show that day: stat cards as of that day, quick-add writes to that
day (prefilled), and the Log tab opens that day's session directly (or the picker to backfill).
Progress and Manage stay global and ignore the selected day.

**Decisions (confirmed with the user):**

1. Stat cards show values **as of the selected day**. The Recomp preview stays global.
2. If a day already has a session (today included), the Log tab **opens it directly**, no
   picker — one workout per day. Legacy days with several sessions open the most recent one.
3. Quick-add uses **prefill + replace**: saving overwrites the day's values, clearing a prefilled
   field deletes that entry — one value per type per day.

The Log tab decides from the data: selected day has a session → show it; none → picker. On a past
day the picker is labelled as backfilling ("Nachtragen · Mi, 8. Okt") and its rotation
suggestion is computed from sessions _before_ that day.

## Shared design (applies across phases)

- **Selected-day state:** React Context (genuinely global, shared by Dashboard and Log) in
  `src/features/day/`:
  - `SelectedDayProvider` + `useSelectedDay()` →
    `{ day: Date (startOfDay), isToday, setDay, shiftDay(±1), goToToday }`.
  - Internal state `Date | null`, `null` = today; today is recomputed each render, so leaving the
    app open past midnight stays correct.
  - `setDay`/`shiftDay` clamp to today (no future days). A reload resets to today.
  - Mounted in `src/app/providers.tsx`.
  - Pure helpers in `src/features/day/day.ts`: `dayKey(date)` → `"yyyy-MM-dd"`, `clampToToday`,
    `stampOnDay(day)` (returns `now` for today, otherwise the day at the current time of day).
    Unit-tested.
- **Dates written for past days** use `stampOnDay(day)` (measurements and new sessions).
- **Date label** `EEEE · d. MMMM`, `de` locale — the existing Dashboard overline format,
  extracted to `src/lib/format.ts` as `formatDayLong`.
- All new strings through `t()`, in `de.ts` and `en.ts`.

---

## DN1 — Data layer + selected-day state (no UI)

- `src/data/repositories/types.ts` + `dexie/sessionRepository.ts`:
  - `getLastForWorkout(workoutId, before?: Date)` — latest session of that workout strictly
    before `before`; without `before`, unchanged behaviour. `[workoutId+date]` range with upper
    bound `[workoutId, before]`, exclusive.
  - `getLastBefore(date: Date)` — latest session strictly before `date`
    (`where("date").below(date).last()`); drives rotation for a past day.
  - Existing `getByDate(date)` is reused for "sessions on day".
- `measurementRepository`:
  - `getByDate(date)` — all types for that calendar day; one `[type+measuredAt]` range query per
    `MeasurementType` between `startOfDay` and `endOfDay`.
  - `save(m)` — Zod-validate + `put` (replace).
  - `remove(id)`.
- Tests in `src/data/repositories.test.ts` for each new/changed method: boundaries, exclusivity,
  empty case.
- `src/features/day/`: `day.ts` (+ `day.test.ts`), `SelectedDayContext.tsx`; mount the provider
  in `providers.tsx`.
- Docs: `docs/data-model.md` repository section.

## DN2 — Dashboard navigation (calendar sheet + swipe + header)

- `src/pages/PageHeader.tsx`: optional `action?: ReactNode` slot, right-aligned; title column
  gets `min-w-0 flex-1`.
- `DashboardView`: overline shows `formatDayLong(day)`; the `action` slot holds a **"Heute"** pill
  button (only when `!isToday`) and a ghost icon button with lucide `CalendarDays`
  (label `t("day.openCalendar")`) that opens the calendar sheet.
- **Calendar:** `npx shadcn@latest add calendar` (adds `react-day-picker` +
  `src/components/ui/calendar.tsx`), restyled to our tokens.
  `src/features/day/components/DayCalendarSheet.tsx` — bottom `Sheet` matching quick-add style;
  `de` locale, weeks start Monday, future days disabled, `endMonth` = current month, selected day
  highlighted, today emphasised. Custom `DayButton`: day number with a marker below — every
  past/today day a small neutral dot (`bg-border-strong`); training days a green circle
  (`bg-success`, `text-success-foreground`) with lucide `Check`. Tapping a day calls `setDay` and
  closes the sheet. Footer: "Heute" button.
- `src/features/day/hooks/useTrainingDays.ts`: `useLiveQuery` over `sessionRepository.getAll()` →
  `Set<dayKey>` of sessions with ≥ 1 set.
- **Swipe:** `src/features/day/hooks/useDaySwipe.ts`, touch events on the Dashboard content
  wrapper; triggers when `|dx| ≥ 60px` and `|dx| > 2·|dy|`; right → previous day, left → next day
  (no-op on today); ignores gestures starting inside inputs or `[data-no-swipe]`. Content keyed
  by `dayKey` with a subtle `tw-animate-css` slide/fade in the swipe direction.
- i18n: `day.*` namespace (`openCalendar`, `today`, `calendarTitle`, `backfill`, …).
- Docs: `docs/screens.md` (Dashboard: selected day, calendar, swipe).

## DN3 — Dashboard content as of the selected day + day-aware quick-add

- `useMeasurementStats(until: Date)` filters each series to `measuredAt ≤ endOfDay(day)` before
  `summarizeSeries`/`goalProgress`.
- `useStrengthIndex(until: Date)` filters sessions the same way before `strengthIndexSeries`.
- `DashboardView` passes `day`; a card with no data up to that day shows the existing "noData"
  state.
- `MeasurementQuickAdd` gets optional `day?: Date` (default today). Dashboard passes the selected
  day; `BodyView` passes nothing (Progress stays global). `MeasurementForm`:
  - Loads `measurementRepository.getByDate(day)` and prefills those as real values (field
    decimals). Placeholders still come from the latest value up to that day.
  - On save, per type: existing + new value → `save({...existing, value})`; new value, no entry →
    `add({ measuredAt: stampOnDay(day), … })`; prefilled entry cleared → `remove(id)`;
    unchanged → skip.
  - Save enabled when anything changed. Sheet title shows the date when the day is not today.
- Docs: `docs/screens.md` (quick-add semantics).

## DN4 — Day-aware Log tab + Dashboard workout card

- `src/features/training/hooks/useSessionLog.ts`: add `useSessionsOnDay(day)` (wraps
  `getByDate`); `useLastSession(workoutId, before?)` passes `before` through.
- `useWorkoutRotation(before?: Date)` uses `getLastBefore(before)` when given, else
  `getRecent(1)`.
- `src/pages/LogPage.tsx` at `/log`: loading → `null`; day has a session →
  `<ActiveSession sessionId={latest.id} returnTo="/" />` inline (no redirect — avoids a
  back-button loop); otherwise `<WorkoutPicker />`. `/log/:sessionId` unchanged.
- `WorkoutPicker`: reads `useSelectedDay()`; on a past day the overline reads
  `t("log.pick.backfill", { date })` and rotation uses `before = day`. The draft carries no extra
  state (the form reads the day from context).
- `ActiveSession`/`SessionForm`:
  - `returnTo` prop overrides router state.
  - New draft date = `stampOnDay(selectedDay)`, captured once at mount; a saved session keeps
    `session.date`.
  - Placeholders use `useLastSession(workoutId, session?.date ?? draftDate)` — editing an old
    session shows the session _before_ it.
  - When the session date is not today, the header overline shows `formatDayLong(date)` instead
    of the rotation label.
  - Saved weights are seeded via `buildInitialValues` and counted by `t("log.progress")`; verify
    a fully logged day reads e.g. "18/18 Sätze".
- `TodayWorkoutCard` (Dashboard), day-aware:
  - Day has a session → "Training am {date}" / "Heutiges Training", workout name, `done/total
Sätze` tally badge, green check when complete; tap → `navigate("/log")`.
  - No session on a past day → backfill card suggesting the rotation workout before that day;
    tap → `navigate("/log")` (opens the picker).
  - No session today → current behaviour.
- Tests: rotation with `before`; a pure helper for the day's tally, if extracted.
- Docs: `docs/screens.md` (Log: day-aware rules). Finalize the status rows.

---

## Verification (manual, dev server, at 320px and desktop width)

1. Calendar icon opens the sheet; logged days show a green check, other past days a neutral dot,
   future days disabled. Picking a day updates the overline and shows "Heute".
2. Swipe right/left changes the day; swiping left on today does nothing; vertical scroll is
   unaffected.
3. Past day: cards reflect values up to that day. Quick-add a bodyweight → stamped on that day;
   reopening shows it prefilled; editing replaces it (no duplicate); clearing deletes it.
4. Past day with a session → Training tab opens it directly, weights in the fields, "18/18 Sätze",
   no picker; saving updates the same session.
5. Past day without a session → picker shows "Nachtragen"; saving creates a session on that day
   and the calendar shows a check there.
6. Today after logging → Training tab shows today's session. Progress and Manage unchanged on any
   selected day.

## Explicitly NOT in this plan (later project phases, per CLAUDE.md)

- Yazio calorie/weight integration + calories charts → **Phase 2** (`src/services/yazio`).
- Training-frequency heatmap → **Phase 3**.
- Accounts / multi-user / sharing / cloud sync → never.
