# Implementation Plan

Phased build plan for the Gym Progress Tracker. **Single source of truth** for build
progress — greedily maintained. Each phase is built independently in its own session with a
clean context (`clear context + proceed`). Build **one phase at a time**; never build ahead.

Decisions: fine-grained phases · **Log-first** order (logging runs on seed data before Manage
CRUD) · **PWA early** (manifest/SW/fonts/persist in Phase 0) · German (`de`) default.

## Status

| # | Phase | Status | Done-when (short) | Learnings |
|---|-------|--------|-------------------|-----------|
| 0 | Foundation (data + PWA + tooling) | done | data layer + PWA + tooling green | see Phase 0 notes ↓ |
| 1 | App shell + nav + i18n | done | tab bar + routes render, seed runs once | see Phase 1 notes ↓ |
| 2 | Log session (hero input) | done | log + save a session, placeholders work | see Phase 2 notes ↓ |
| 3 | Measurements quick-add | done | sheet writes a Measurement | see Phase 3 notes ↓ |
| 4 | Dashboard cards | done | live bodyweight + rate + quick actions | see Phase 4 notes ↓ |
| 5 | Progress: Recomposition chart | todo | one-axis indexed strength vs bodyweight | — |
| 6 | Progress: Strength progression | todo | per-workout top-set lines, swap-aware | — |
| 7 | Progress: Exercise drilldown | todo | top-set line + min–max band | — |
| 8 | Progress: Body chart | todo | bodyweight trend+rate + measurements | — |
| 9 | Manage: exercise catalog | todo | catalog CRUD + search | — |
| 10 | Manage: plans + workouts | todo | plan/workout/slot editor, set active | — |
| 11 | Settings + backup | todo | export/import round-trips, prefs persist | — |

`Status` ∈ `todo · in_progress · done`. Flip to `done` ONLY after
`npm run typecheck && npm run lint && npm run test` pass.

## Maintenance protocol (every phase, no exceptions)

- **On start:** set the phase row to `in_progress`; create native Tasks for its steps.
- **On finish:** after the gate passes, set the row to `done`.
- **Learnings column:** add a one-line note ONLY if something arose that affects later phases
  (a schema tweak, an index change, a shared util, a gotcha). If the phase went smoothly with
  nothing forward-affecting, leave it `—`. Do not narrate.
- Never edit a future phase's scope speculatively; only record facts that change it.
- **Native Tasks** are the in-session checklist; this table is the cross-session record. Keep both in sync.

## Cross-cutting rules (from CLAUDE.md / docs — apply to every phase)

- **Read/build only what the phase needs.** Do not open or build other phases' screens/charts/components.
- TS strict, no `any`. YAGNI/KISS. No new state/forms libraries — `useLiveQuery` + `useState`.
- Dexie touched **only** in `src/data/`. UUIDs via `crypto.randomUUID()`. Zod validate on
  write/import only. Dates as `Date` via `z.coerce.date()`. Never index a boolean.
- All UI strings through `t()`; `de` default. User data (exercise names) never translated.
- shadcn for chrome; **custom** for weight-logging inputs and charts (Recharts). Use tokens —
  never hard-code color/size/font.
- **Responsive (verify at 320px):** keep the app-shell layout (header + tab bar `flex-none`,
  only `<main>` scrolls; `h-dvh`, no `sticky`/`fixed` chrome over document scroll). No
  horizontal overflow — every flex/grid item with text or an input carries `min-w-0`
  (+ `truncate`/wrapping). See CLAUDE.md › UI.
- `/design-reference/` is **visual reference only** — never import; reproduce with our tokens + shadcn.
- **Done gate every phase:** `npm run typecheck && npm run lint && npm run test` all pass.

---

## Phase 0 — Foundation (data layer + PWA shell + tooling) · no feature UI
**Build:** npm scripts (`typecheck`, `format`, `test`); Vitest + Prettier config; `src/data/schema.ts`
(all Zod schemas + inferred types); `src/data/db.ts` (Dexie stores/indexes); `src/data/repositories/`
(interfaces + Dexie impls: Exercise, Plan, Workout, Session, Measurement); `src/data/seed.ts`
(PPL plan + exercises, first-run only); `src/data/backup.ts` (Zod-validated export/import);
`src/lib/persist.ts` (`navigator.storage.persist()` helper); PWA config in `vite.config.ts`
(manifest, service worker), self-hosted fonts via `@fontsource` (replace the Google Fonts `@import`
in `src/index.css`), app icons.
**Data/logic:** This phase *is* the data layer — every entity, store, repository per
`docs/data-model.md` (schemas; stores `trainingPlans/workouts/exercises/sessions/measurements` with
documented indexes; Session `getByDate/getRecent/getLastForWorkout/getExerciseHistory/save`,
Measurement `getByType/getLatest/add`, etc.).
**Visual reference:** none (no UI this phase).
**Charts:** none.
**Out of scope:** any screen, route, tab bar, i18n strings, component, or chart. No Dashboard, Log,
Manage, Settings. No Yazio. No `reps` field.
**Done when:** Vitest covers repositories (round-trip save/read) and `seed.ts` (seeds only when
empty; valid PPL plan with workouts + slots + catalog exercises) and backup round-trip; fonts
self-hosted; PWA manifest/SW generated by `npm run build`; gate passes.

**Learnings (affect later phases):**
- **Dexie `transaction`** with more than 3 stores needs the **array form**
  `db.transaction("rw", [t1, …, t5], fn)` — the positional overload only goes to 3 tables
  (relevant when P10/P11 write across many stores).
- **ESLint:** `react-refresh/only-export-components` is **off for `src/components/ui/**`** —
  shadcn chrome exports variant helpers (e.g. `buttonVariants`) next to the component. New
  shadcn components added in later phases are already covered.
- **PWA icons are SVG-only** (`public/app-icon.svg`, token-based dumbbell). Installable on
  Android/desktop, but **branded PNG icons + an iOS `apple-touch-icon` PNG are a pre-ship
  polish TODO** (iOS home-screen uses a screenshot fallback until then).
- **Self-hosted font families** are `'Space Grotesk Variable'` / `'JetBrains Mono Variable'`
  (already wired in `index.css` tokens + imported in `main.tsx`).
- **`navigator.storage.persist()`** lives in `src/lib/persist.ts` as `ensurePersistentStorage()`
  — Phase 1 must call it on the first write path; it is not invoked yet.

## Phase 1 — App shell + navigation + i18n
**Build:** `src/app/` (App, providers, router); bottom tab bar (Dashboard, Log, Progress, Manage) +
Settings header icon; route scaffolding with **empty/first-run states** and guiding prompts
("Create your first plan" → "Add exercises" → "Log your first session"); `src/i18n/` setup
(react-i18next, `de` default + `en`), provider wired; trigger seed-on-first-run; call `persist()`
on first write path.
**Data/logic:** i18n init; seed invocation; no new repositories. Routes per `docs/screens.md`
(`/`, `/log`, `/log/:sessionId`, `/progress/*`, `/manage/*`, `/settings`) as placeholders.
**Visual reference:** `design-reference/Gym Tracker Prototype.html` (overall chrome + bottom tab bar)
and `components.jsx` `Icon` set — chrome only, with our tokens + shadcn `tabs`/`button`.
**Charts:** none.
**Out of scope:** real screen content (cards, logging inputs, charts, Manage editors). Routes render
placeholders/empty states only.
**Carry-over from Phase 0 (wire these — they exist but are not yet invoked):**
- Call `seedIfEmpty()` from `src/data/seed.ts` once on app startup (first run) before the first
  data read, so the PPL plan is present.
- Call `ensurePersistentStorage()` from `src/lib/persist.ts` on the first write path (it is
  idempotent and degrades silently where the API is unavailable).
- Reach Dexie only through `src/data/repositories` (barrel exports the instances + interfaces);
  never import Dexie outside `src/data/`.
**Done when:** all routes navigable via tab bar; Settings icon opens `/settings` placeholder; `de`
strings render via `t()`; empty states show; seed runs once on a fresh DB; gate passes.

**Learnings (affect later phases):**
- **i18n strings:** add every new key to BOTH `src/i18n/locales/de.ts` and `en.ts`. `de.ts` must
  NOT be `as const` (its literals would otherwise make `en` impossible to satisfy). `t()` keys are
  type-checked via `src/i18n/i18next.d.ts` (CustomTypeOptions ← `resources.de`); use `ParseKeys`
  when a key is passed as a variable (see `BottomTabBar`).
- **App entry moved** to `src/app/App.tsx` (was `src/App.tsx`); `main.tsx` imports it. App gates
  rendering on `runStartup()` (`src/app/startup.ts` = persist + `seedIfEmpty`), so by the time any
  route mounts the **seed is guaranteed present** — later phases can read repos without re-seeding.
- **Routing:** data router in `src/app/router.tsx`. `/progress` and `/manage` redirect to their
  default sub-route; tab `NavLink`s use `end` only on `/`. Add real nested views by replacing the
  placeholder elements at the already-registered paths.
- **Icons:** `lucide-react` (line style, matches reference) is the icon source for chrome.

## Phase 2 — Log session (the gym hero surface)
**Build:** `src/features/training/` — workout picker (today's suggested workout via rotation, or
pick); active session view at `/log/:sessionId` with **custom** per-set weight inputs (big tap
targets, last-weight placeholder, fast numeric entry, +/- steppers); save session.
**Data/logic:** `SessionRepository` (`getLastForWorkout`, `save`); Workout/Exercise reads to render
slots; feature hooks wrap repos in `useLiveQuery`. Writes validated via `WorkoutSessionSchema`. Uses
seed data (no Manage yet). Per `docs/data-model.md`.
**Visual reference:** `design-reference/screens.jsx` `LogSession` (WorkoutPicker + LogForm) and
`components.jsx` `SetRow` — reproduce the per-set input row + stepper with our tokens; **custom, not shadcn**.
**Charts:** none.
**Out of scope:** editing plan/catalog (Manage, P9–P10), measurements, dashboard, charts. Reps input.
**Done when:** open today's workout, log sets with last-time placeholders, save a `WorkoutSession`;
reopening `/log/:sessionId` shows saved sets; gate passes.

**Learnings (affect later phases):**
- **`SessionRepository.getById(id)`** was added (interface + dexie impl) so
  `/log/:sessionId` can reload a saved session; later phases that open a specific
  session (drilldowns, corrections) reuse it.
- **New-session flow without DB pollution:** picking a workout mints a UUID and
  navigates to `/log/:sessionId` carrying `{ workoutId }` in **router state**; the
  session is persisted only on save. `useSession` returns `undefined` (loading) /
  `null` (unsaved draft) / object (saved) — the `null` sentinel via
  `(await getById()) ?? null` is what makes loading-vs-not-found distinguishable in
  `useLiveQuery`. A draft refreshed without router state redirects to `/log`.
- **shadcn `Toaster` (sonner) is now mounted** in `src/app/providers.tsx` with
  `theme="dark"` (overrides next-themes' `system` default; no ThemeProvider needed).
  Use `import { toast } from "sonner"` for transient feedback anywhere.
- **Custom `SetRow`** (`features/training/components`) is the reusable gym weight
  input (big tap targets, last-weight placeholder, ±2.5 stepper, decimal sanitise).
  Phase 3's measurement quick-add should reuse this pattern (per its spec).
- **Form-state-from-async pattern:** the lint rule `react-hooks/set-state-in-effect`
  forbids seeding state in an effect. Use a loader component that waits for data,
  then mounts an inner form **keyed by id** that seeds via a `useState` initializer.
- **App-shell layout (shared chrome) was refactored** to a fixed-height flex column —
  `AppLayout` is `h-dvh flex flex-col overflow-hidden`, header + `BottomTabBar` are
  `flex-none`, only `<main>` scrolls. The tab bar is no longer `fixed` (so pages need no
  bottom-padding hack). Build later screens inside this scrolling `<main>`; follow the new
  responsive rules in CLAUDE.md › UI (320px floor, `min-w-0` on flexible items).

## Phase 3 — Measurements quick-add
**Build:** `src/features/measurements/` — lightweight shadcn **sheet/dialog** launched from
Dashboard/Progress-Body to add bodyweight + circumference (biceps/chest/waist); numeric entry follows
the custom gym-input pattern; one-tap, not a navigation.
**Data/logic:** `MeasurementRepository` (`add`, `getLatest`, `getByType`); `MeasurementSchema`
validation on write; feature hook via `useLiveQuery`. Per `docs/data-model.md`.
**Visual reference:** `design-reference/components.jsx` `Sheet` (bottom sheet) + the numeric input
pattern from `SetRow`.
**Charts:** none.
**Out of scope:** the Body chart and trend math (P8), dashboard cards (P4), Yazio/calories.
**Done when:** quick-add sheet writes a `Measurement`; latest value retrievable; gate passes.

**Learnings (affect later phases):**
- **`MeasurementQuickAdd`** (`features/measurements/components`) is the reusable launch
  surface: pass the trigger as `children` (wrapped in `SheetTrigger asChild`), controlled
  open state inside. It's wired to a temporary button on the **Dashboard placeholder** now —
  **P4 should adopt it as the "log weight" quick-action** and **P8 should add the
  Progress-Body launch point** (both spec'd to launch this same sheet).
- **`useLatestMeasurements()`** (`features/measurements/hooks`) returns
  `Map<MeasurementType, Measurement | undefined>` (latest per type) via `useLiveQuery` —
  reuse it for P4 cards / P8 body chart placeholders instead of re-querying per type.
- **`MeasurementInput`** is the custom numeric input mirroring `SetRow` but with a label +
  configurable `unit`/`stepBy` (kg→0.1, cm→0.5); reuse it for any future single-value entry.
- Repo/schema needed **no change** — `measurementRepository.add/getLatest/getByType` and
  `MeasurementSchema` from Phase 0 covered the writes; only UI was added this phase.

## Phase 4 — Dashboard summary cards
**Build:** `src/features/analysis/` dashboard view — stat cards (bodyweight + weekly rate, waist
trend, strength index placeholder ok if no baseline yet) with trend badges; quick actions
(log weight → P3 sheet, start today's workout → P2).
**Data/logic:** read sessions + measurements via existing repos/hooks; compute simple readouts
(latest bodyweight, 7-day rate) per `docs/charts.md`. No new repository.
**Visual reference:** `design-reference/screens.jsx` `Dashboard` + `components.jsx` `StatCard` and
`Trend` badge — reproduce with tokens + shadcn `card`.
**Charts:** none (cards only; sparklines deferred unless trivially a StatCard element).
**Out of scope:** the four Progress charts (P5–P8), Manage, Settings.
**Done when:** Dashboard shows live bodyweight + rate and a workout quick-action; empty states when
no data; gate passes.

**Learnings (affect later phases):**
- **Reusable analysis primitives** now exist in `src/features/analysis/`: `StatCard` +
  `TrendBadge` (`components/`, tokens-only, colour keyed on *desirable* direction not the
  arrow) and `stats.ts` (pure presentation math: `summarizeSeries`/`weeklyRate` via OLS,
  `trendDir`). **P8 reuses `StatCard`/`TrendBadge` for the body-chart rate readout**; **P5's
  strength-index/indexing math belongs in `stats.ts`** alongside these (not in repos).
- **Strength-index + calories dashboard cards are static placeholders** (`SoonPill`,
  `muted`) — no baseline math was built (correctly deferred). **P5 must wire the real
  strength-index value into the strength card** (replace the placeholder); calories stays a
  placeholder until product-Phase 2.
- **`useMeasurementStats()`** (`analysis/hooks`) returns `{ bodyweight, waist }` summaries via
  `useLiveQuery`; reuse it rather than re-summarising in P8.
- No repo/schema/index changes this phase — existing `measurementRepository.getByType` +
  `useWorkoutRotation`/`useExerciseCatalog` (training) covered all reads.

## Phase 5 — Progress: Recomposition (hero chart)
**Build:** `/progress` hub shell (segmented control / nested routes) + `/progress/recomposition`
view; the indexed strength-vs-bodyweight chart in **Recharts**.
**Data/logic:** strength-index + indexing math lives in the analysis feature (presentation logic, not
repos). **Fixed baseline** = avg/median of each exercise's first 2–3 sessions; index both bodyweight
and strength to 100 at baseline on **one shared axis** (never dual y-axes). Top-set per session. Per
`docs/charts.md`.
**Visual reference:** `design-reference/charts.jsx` `LineChart` (grid, baseline reference line,
markers) + `--recomp-strength` / `--recomp-bodyweight` tokens — match styling, build in Recharts.
**Charts:** Recomposition (one shared 100-baseline axis, two series).
**Out of scope:** other Progress views (P6–P8), Manage, Settings. No rolling baseline.
**Done when:** recomposition chart renders from logged sessions + bodyweight, both indexed to 100 on
one axis; baseline from first 2–3 sessions; gate passes.

## Phase 6 — Progress: Per-workout strength progression
**Build:** `/progress/strength` — workout selector; one toggleable line per exercise (session **top
set**); swap-aware rendering (swapped exercise = separate series, no bridging segment).
**Data/logic:** `SessionRepository.getExerciseHistory`; top-set computation; series-per-exercise. Per
`docs/charts.md`.
**Visual reference:** `design-reference/charts.jsx` multi-series `LineChart` + chart palette markers (chart-1…6).
**Charts:** Per-workout progression (multi-line, toggleable, swap-aware).
**Out of scope:** drilldown band (P7), body chart (P8), Manage, Settings.
**Done when:** selecting a workout shows top-set lines per exercise; toggling works; a swap shows two
separate series with no bridge; gate passes.

## Phase 7 — Progress: Single-exercise drilldown
**Build:** `/progress/exercise/:exerciseId` — top-set line with a faint min–max band per session.
**Data/logic:** `SessionRepository.getExerciseHistory` for one exercise; per-session min/max + top
set. Per `docs/charts.md`.
**Visual reference:** `design-reference/charts.jsx` `LineChart` with band treatment.
**Charts:** Single-exercise drilldown (top-set line + min–max band).
**Out of scope:** other views, Manage, Settings.
**Done when:** drilldown shows top-set line with min–max band for a chosen exercise; gate passes.

## Phase 8 — Progress: Body chart
**Build:** `/progress/body` — smoothed bodyweight trend (raw points + 7-day moving average) with
kg/week rate; measurements chart (waist vs. biceps/chest), optionally normalized on one axis.
**Data/logic:** `MeasurementRepository.getByType`; 7-day MA + rate; measurement series. Per `docs/charts.md`.
**Visual reference:** `design-reference/charts.jsx` `LineChart` (smoothed) + `StatCard` rate readout.
**Charts:** Bodyweight trend (raw + 7-day MA + rate) and measurements (waist-down vs. muscle-holding).
**Out of scope:** Manage, Settings, calories/Yazio.
**Done when:** body chart shows raw weigh-ins + trend line + rate, and measurements comparison; gate passes.

## Phase 9 — Manage: exercise catalog
**Build:** `/manage/exercises` list/search + `/manage/exercises/:exerciseId` create/edit (name, type,
unit) using shadcn forms.
**Data/logic:** `ExerciseRepository` (CRUD); `ExerciseSchema` validation on write. Per `docs/data-model.md`.
**Visual reference:** no dedicated screen mockup — reproduce list/form chrome with our tokens +
shadcn (`card`, `input`, `dialog`/`sheet`, `dropdown-menu`). Consult `Gym Tracker Prototype.html` if present.
**Charts:** none.
**Out of scope:** plans/workouts editor (P10), Settings.
**Done when:** create/edit/search catalog exercises; new exercises appear in Log (P2) slots; gate passes.

## Phase 10 — Manage: plans + workouts editor
**Build:** `/manage/plans` (list, set active, archive) → `/manage/plans/:planId` (workouts) →
`/manage/plans/:planId/workouts/:workoutId` (slot editor: target sets, rep range, order, alternatives).
**Data/logic:** `PlanRepository` + `WorkoutRepository` (CRUD; `[planId+order]`); embedded
`WorkoutExercise[]`; `isActive` filtered in memory (never indexed). Per `docs/data-model.md`.
**Visual reference:** shadcn chrome (lists, editor forms, reorder) with our tokens; `Gym Tracker
Prototype.html` for any plan visuals.
**Charts:** none.
**Out of scope:** Settings, Yazio.
**Done when:** create a plan, add/edit workouts and slots, set active plan; Log rotation reflects the
active plan; editing a plan never alters past sessions; gate passes.

## Phase 11 — Settings + backup
**Build:** `/settings` — export/import backup (JSON, Zod-validated), unit preferences, calorie
incomplete-day threshold (stored for Phase 2), with shadcn forms.
**Data/logic:** wire `src/data/backup.ts` export/import (validate entire file before writing; replace
semantics); settings persisted. Per `docs/architecture.md` / `docs/data-model.md`.
**Visual reference:** shadcn settings forms with our tokens; `Gym Tracker Prototype.html` settings
section if present.
**Charts:** none.
**Out of scope:** Yazio connection UI beyond a disabled placeholder; calories charts (Phase 2).
**Done when:** export produces a Zod-valid JSON; import round-trips (dates intact) and restores state;
threshold + units persist; gate passes.

---

## Explicitly NOT in this plan (later project phases, per CLAUDE.md)
- Yazio calorie/weight integration + calories charts → **Phase 2** (`src/services/yazio`).
- Training-frequency heatmap → **Phase 3**.
- Accounts / multi-user / sharing / cloud sync → never.
