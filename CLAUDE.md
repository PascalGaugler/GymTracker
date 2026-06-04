# Gym Progress Tracker

Personal, single-user PWA to track strength training and body measurements during a
calorie deficit. The goal: see body measurements trend **down** while key-lift strength
stays **flat or rises**. Local-first, no backend, dark-mode only, mobile-first.

Detailed specs live in `/docs` (linked at the bottom). Read the relevant one before
working in that area. Capture the decision, not the debate — rationale lives in docs, not here.

## Commands

Package manager: **npm**.

- `npm install` — install dependencies
- `npm run dev` — start the Vite dev server
- `npm run build` — production build
- `npm run preview` — serve the production build locally
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint
- `npm run format` — Prettier
- `npm run test` — Vitest

Before considering a task done, run: `npm run typecheck && npm run lint && npm run test`.

## Stack

React + TypeScript + Vite · Tailwind CSS · shadcn/ui · Dexie (IndexedDB) + dexie-react-hooks ·
Zod · date-fns · Recharts · React Router · react-i18next · vite-plugin-pwa.
No backend in Phase 1. Hosting: Cloudflare Pages.

## Structure

- `src/app/` — shell: App, router, providers
- `src/components/ui/` — reusable presentational components (shadcn/ui-derived) ONLY
- `src/features/<feature>/` — feature code (`training`, `measurements`, `analysis`);
  each with `components/` and `hooks/`
- `src/pages/` — thin route components that compose feature views
- `src/data/` — persistence layer; the ONLY place that touches Dexie
  - `db.ts` stores · `schema.ts` Zod schemas + inferred types
  - `repositories/` interfaces + Dexie impls · `backup.ts` export/import
  - `seed.ts` first-run seed (PPL plan + exercises; runs only when the DB is empty)
- `src/services/` — external integrations (Yazio — Phase 2 only)
- `src/lib/` — generic utilities (date-fns wrappers, formatters)
- `src/i18n/` — react-i18next setup + locale files (`de` default, `en` optional)

## Rules

### Code quality
- TypeScript strict mode. No `any`.
- Apply YAGNI / KISS / separation of concerns. Prefer boring, proven solutions.
- Do NOT add speculative abstraction, a state-management library, or a forms library.
  App state = data via `useLiveQuery` + local `useState`.
- Keep changes focused and reviewable.

### Data
- All persistence goes through `src/data/repositories`. Nothing outside `src/data/`
  imports Dexie or touches IndexedDB directly.
- IDs are UUIDs (`crypto.randomUUID()`), never auto-increment.
- Validate with Zod on WRITE and on import only — reads from our own DB are trusted.
- Dates are stored as `Date`; schemas use `z.coerce.date()` so export/import round-trips.
- Booleans are not valid IndexedDB keys — never index a boolean (e.g. `isActive`).

### UI
- Mobile-first, but fully responsive — must look correct from small phones up to desktop.
- Cross-platform: must work in Android and iOS browsers. iOS install = "Add to Home Screen".
  Do not rely on native-only or non-WebKit-supported APIs.
- Dark mode only.
- Component-driven: small pure components composed upward. Reusable UI in `components/ui`,
  feature-specific components in their feature folder. Do NOT impose a strict
  atomic-design (atoms/molecules/organisms) folder taxonomy.
- Use shadcn/ui for standard interaction chrome: dialogs, dropdowns, tabs, sheets,
  settings/editor forms. Do NOT use shadcn for the weight-logging inputs (custom,
  gym-optimized: big tap targets, last-weight placeholder, fast numeric entry) or for
  charts (Recharts). Rule of thumb: shadcn for chrome, custom for the hero surfaces.
- Avoid prop drilling: pull data via feature hooks (over repositories); use composition
  (children/slots) for pass-through; use Context only for genuinely global concerns.

### i18n
- All UI strings go through `t()` (react-i18next). German (`de`) is the default locale.
- User data (exercise names, notes) is NOT translated — stored and shown verbatim.
  Mixed German/English exercise names (e.g. "Overhead Trizeps Extensions") are expected.

### Domain metrics (easy to get wrong — see docs/charts.md)
- Progression uses the SESSION TOP SET (heaviest set), not the average of sets.
- Strength Index: FIXED baseline = average/median of an exercise's first 2–3 sessions.
  An exercise enters the index only once it has a baseline. Never use a rolling baseline.
- Recomposition chart: index bodyweight AND strength to 100 at baseline on ONE shared
  axis. Never use dual y-axes.
- Calories: an untracked day is ABSENT, not zero. Days below a configurable threshold are
  flagged "likely incomplete" and excluded from averages BY DEFAULT, re-includable by the
  user. Averages compute over tracked days only, with a coverage indicator.

### Local-first / PWA
- No backend in Phase 1. Installable, offline-capable PWA.
- Call `navigator.storage.persist()` on first write.
- Export/import (JSON, Zod-validated) is the only backup. Never commit real export files.

## Out of scope
- Yazio calorie/weight integration → Phase 2 (serverless function in `src/services/yazio`).
  Do not build it yet.
- Training-frequency heatmap → Phase 3.
- Accounts, multi-user, sharing, cloud sync → never. Single-user by design.

## Docs
- `docs/architecture.md` — local-first rationale, Phase 2 Yazio plan
- `docs/data-model.md` — entities, Zod schemas, Dexie stores, repositories
- `docs/charts.md` — chart set + metric definitions
- `docs/screens.md` — screen & route inventory
