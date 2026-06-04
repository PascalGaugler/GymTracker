# Architecture

## Local-first, no backend (Phase 1)

The entire dataset is small (a few hundred numeric rows per month) and single-user, so it
lives in on-device IndexedDB. This removes the biggest operational burdens by construction:
nothing to host or secure, no auth, no network layer, works offline at the gym. The one
real cost — backup/recovery — is covered by phone-level cloud backup plus an in-app
export/import. A managed backend (e.g. Supabase) was considered and rejected for Phase 1:
it would add an account model and network dependency for no single-user benefit.

## Data flow

```
React components  →  feature hooks (useLiveQuery)  →  repositories  →  Dexie / IndexedDB
```

- Components never import Dexie. They call feature hooks.
- Hooks wrap repository calls in `useLiveQuery` for reactive updates.
- Repositories (`src/data/repositories`) are the only code that touches Dexie.
- This seam is justified by separation of concerns and testability (mock a repository
  interface in tests), not by a planned backend swap.

## PWA

- `vite-plugin-pwa` (Workbox) generates the service worker + web app manifest, caches the
  app shell for offline use, and provides the "new version available" update prompt
  (enable it so the app never gets stuck on a stale cached build).
- Call `navigator.storage.persist()` on first write so the browser treats storage as
  durable rather than evictable. Installed PWAs are very likely to be granted persistence.
- Dark theme, installable.

## Cross-platform

- Must work in Android and iOS browsers and look correct from small phones to desktop.
- **iOS:** all iOS browsers use WebKit (third-party engines are permitted in the EU under
  the DMA but none have shipped in practice). So "use a different browser to avoid Safari
  storage eviction" does not work. The fix is **install to home screen** ("Add to Home
  Screen"), which exempts the PWA from WebKit's 7-day eviction of script-writable storage;
  combined with `persist()`, storage is durable. iOS install is a manual step (no install
  prompt), so document it for iOS users.
- **Android:** smoother install (prompt available); strongest PWA support.
- Do not rely on native-only APIs; none are needed.

## Backup

- Export/import as JSON. **Import is validated through Zod** before touching the DB, so a
  corrupt/edited file fails loudly instead of silently poisoning data.
- Decide and document: import **replaces** vs. **merges**. (Lean: replace for a personal
  single-device app; merge only matters once multiple data sources exist.)
- Never commit real export files to the repo (gitignore export output). No secrets exist
  in Phase 1, so there is nothing else sensitive to leak.

## Hosting

- **Cloudflare Pages.** Serves the static Vite build for free with auto-deploy from GitHub,
  and provides serverless functions (Workers) on the same platform for Phase 2 — so the
  Yazio function lives alongside the app with no second provider and no cross-service CORS.
- Configure **SPA fallback** (all routes serve `index.html`) so deep links and refreshes
  resolve, including offline.
- GitHub Pages was rejected: static-only, no serverless functions, which would force a
  second provider at Phase 2.

## Phase 2 — Yazio integration (do not build yet)

Goal: pull bodyweight and daily calories from Yazio to correlate calories ↔ bodyweight ↔
strength and tune the deficit, avoiding double data entry.

Hard constraint: Yazio's API is **undocumented/unofficial**, authenticates with
username+password, and is built for server runtimes. A browser PWA **cannot** call it
directly — credentials would be exposed and CORS blocks browser origins (only HTTP/localhost
clients bypass it). Therefore Yazio **requires a server-side caller**.

Design:
- A **single serverless function** (Cloudflare Worker) holds Yazio credentials as
  encrypted env vars, calls Yazio server-side, and returns plain JSON to the PWA.
- Lives behind `src/services/yazio` and feeds the **same repository/data layer**, so the
  rest of the app neither knows nor cares where the numbers came from.
- Implementation: either use the `juriadams/yazio` TypeScript client (handles OAuth token
  exchange/refresh; convenient) or hand-roll the 2–3 needed endpoints using the
  `saganos/yazio_public_api` swagger as the spec (fewer deps, more control). Lean toward
  hand-rolling given the tiny surface; the client is a fine shortcut.
- Data: add a **nutrition/intake entity** (calories are not a `Measurement`); use the
  existing `Measurement.source` field to dedupe Yazio vs. manual bodyweight.
- Treat as fragile/nice-to-have: the unofficial API can break or shift ToS. Containing it
  behind the seam keeps it from destabilizing the core app.

See charts.md for the calorie handling rules (absent ≠ zero, incomplete-day threshold,
coverage indicator, TDEE back-calculation).

## Phase 3

- Training-frequency heatmap (polish).

## Out of scope (never)

- Accounts, multi-user, sharing, cloud sync. Single-user by design. If a second real user
  ever materializes, that is a separate project phase with its own auth/multi-tenancy
  design — not something to design for speculatively now.
