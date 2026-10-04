# Design fix plan: aligning the app with the Claude Design prototype

Turns the 47 consolidated findings in [`docs/design-audit.md`](./design-audit.md)
(per-group detail in [`docs/design-audit/`](./design-audit/)) into small work
packages. Each one is sized so a single agent can implement it in one pass without
redesigning anything. Status lives in `docs/implementation-plan.md` (row "Design
alignment").

## 0. Decisions (user, 2026-10-03)

These override the recommendations in §4 wherever they differ.

- **Approved:** Q1 (O-03, O-04), Q2 (WP-17), Q3 (O-08), Q4 (O-05), Q5 (O-06), Q6 (O-02),
  Q7 (O-01), **Q8 (O-09, now IN scope, see the scoped spec in §2.9)**, Q10 (O-07), Q12
  (`.gitattributes`, done before WP-01).
- **Declined:** Q9 rest timer (O-10, not for now), Q11 custom keypad.
- **Bottom navigation keeps FOUR tabs** (Übersicht, Trainieren, Fortschritt, Verwalten),
  even though the prototype has three. Every screen stays one tap away. No package may
  remove or merge a tab. O-07 only emphasises the Log tab within the four.
- Execution order: WP-01 … WP-18, then O-11, then O-01 … O-09 (O-10 skipped), then WP-19.
- **Number format (user, 2026-10-03):** decimals use a DOT in every locale ("80.4 kg"),
  with a true minus "−" and an explicit "+" for signed values, via the shared signed-number
  helper. Do not switch to the German decimal comma.
- **Final-audit decisions (user, 2026-10-04):** the Log set-input value stays
  RIGHT-aligned (decimals line up across sets), unlike the prototype. The Dashboard waist
  badge stays a RATE (cm/Wo), not the prototype's % change. The Log session header overline
  shows the rotation position ("ROTATION · n VON N") as in the prototype (FP-3).
- **Added during implementation (user, 2026-10-03):** O-11, Progress tab strip as in the
  prototype's `.segmented2.seg-grid`: short labels ("Recomp" · "Kraft" · "Körper") in an
  equal-width, non-scrolling grid, so all tabs are visible at 320. And on
  `/progress/exercise/:id` the "Kraft" tab is highlighted, because the drilldown is entered from
  there. Page titles (h1) keep the descriptive names.

## 1. Intro

**Goal:** make the live app look and behave like the prototype
(`design-reference/`, default tweaks: mood electric, surface slate, form balanced)
wherever the prototype does not break a project rule, and fix every place where
the app itself breaks a rule.

**These rules win over the prototype** (CLAUDE.md, `docs/design-system.md`,
`docs/charts.md`):

- Tokens only. No hex, px font sizes, radii or shadows outside `src/index.css`.
  A prototype value with no token gets **a new token** (added to `src/index.css`
  and `docs/design-system.md`) or maps to the **nearest existing token** (see
  §3 C-3).
- Every interactive control is ≥ `--tap` (48px). Purely decorative elements (set
  index circle, icon tiles inside a larger button) may be smaller.
- App shell: `h-dvh flex flex-col overflow-hidden`, header and tab bar `flex-none`,
  and ONLY `<main>` scrolls. No sticky or fixed chrome, and no inner scrollers inside
  `<main>`.
- No horizontal overflow at 320px. Every flex/grid child that holds text or an
  input gets `min-w-0`, plus `truncate` or wrapping.
- shadcn for chrome (sheets, dialogs, tabs, menus, forms). The weight inputs and the
  charts stay custom (charts in Recharts, never ported SVG).
- Every UI string goes through `t()`, `de` is the default, and each key is added
  to both `de.ts` and `en.ts`. User data (exercise names) is shown verbatim.
- Chart domain rules: top set, fixed baseline, one shared axis, bodyweight = raw
  points + 7-day MA.
- iOS and Android browsers. Text fields stay ≥ 16px (no iOS focus-zoom), and
  nothing relies on non-WebKit APIs.

**Classification used here** (it replaces the audit's loose "CONFLICT" label):

- **APP BUG**: the app breaks a rule (overflow at 320px, clipped digits, a select
  blowing out a dialog, controls under 48px, dropped token classes, a wrong token,
  hard-coded strings). These are ordinary high-priority work and are scheduled as
  early as their dependencies allow.
- **TRUE CONFLICT**: the prototype does something a rule forbids. The rule wins
  and we build the rule-compliant version of the design. See §3.
- **Design**: a plain visual/structural difference with no rule involved. We match
  the prototype.
- **Question**: needs a product decision from the user (§4). The matching work
  packages are marked OPTIONAL.

**Verification (every package):**

1. Dev servers (already running, do not start or stop them): app at
   <http://localhost:5173>, prototype at
   <http://localhost:5174/Gym%20Tracker%20Prototype.html> (a fixed 390px phone
   frame, navigated by clicking inside it). Demo data is loaded, so compare
   presentation, not numbers. Do not write to the DB, import, export or delete.
2. Widths **390 + 320** through the same-origin iframe harness from the audit brief
   (`<scratchpad>/audit-brief.md` for this session). Open <http://localhost:5173/>,
   then run:

   ```js
   document.open()
   document.write(
     '<body style="margin:0;background:#333;display:flex;gap:16px;padding:8px;align-items:flex-start"><iframe id=a src="/ROUTE" style="width:320px;height:700px;border:0"></iframe><iframe id=b src="/ROUTE" style="width:390px;height:844px;border:0"></iframe></body>',
   )
   document.close()
   ```

   Drive each frame through `document.getElementById('a').contentDocument`. Check
   overflow with `doc.documentElement.scrollWidth > doc.documentElement.clientWidth`
   and look for any element whose right edge is past the frame width. For inputs,
   check `input.scrollWidth <= input.clientWidth`. Also do a desktop sanity check in
   a normal tab (~1500px).

3. `npm run ci` is green (typecheck + lint + test + format check). Run
   `export PATH="/c/Users/pgaug/AppData/Roaming/nvm/v22.20.0:$PATH"` first because
   the system Node is too old. Files written outside the editor skip
   format-on-save, so run `npx prettier --write <files>` before `ci`.
   **Known baseline blocker (not design work):** this checkout has
   `core.autocrlf=true`, so the working tree holds CRLF files. Prettier's default
   `endOfLine: "lf"` then fails `format:check` on about 136 untouched files, even though
   their committed content is formatted. This must be settled before any WP can show
   a green `ci` (§4 Q12). Until then, judge a WP by
   `npx prettier --check <changed files>` plus typecheck/lint/test.
4. Every package touches only the files it lists. If the change turns out to need
   another file, stop and report instead of widening the scope.

There are no component tests in the repo (only logic tests under
`src/**/*.test.ts`), so visual regressions are caught only by the
harness check in step 2. Typecheck catches removed props and variants.

## 2. Work packages

Order: foundations → shared primitives → screens → charts → copy/docs. OPTIONAL
packages (§2.9) run only after the user answers §4, between WP-18 and WP-19.

| WP    | Title                                                 | Kind          | Depends on        |
| ----- | ----------------------------------------------------- | ------------- | ----------------- |
| WP-01 | `cn()` understands the token type/shadow scale        | APP BUG       | —                 |
| WP-02 | New tokens + design-system doc refresh                | foundation    | WP-01             |
| WP-03 | Button: 48px size scale, radius tiers, variants       | APP BUG       | WP-01             |
| WP-04 | Input primitive + Manage tap-target sweep             | APP BUG       | WP-03             |
| WP-05 | Dialog primitive + slot-editor overflow               | APP BUG       | WP-02, WP-03      |
| WP-06 | Sheet primitive                                       | design/bug    | WP-02, WP-03, 05  |
| WP-07 | Card primitive + card-surface shadow                  | design        | WP-02             |
| WP-08 | Shared segmented control + pick chips                 | design        | WP-01             |
| WP-09 | Badge primitive (chips, tally, status, soon)          | design        | WP-01, WP-02      |
| WP-10 | Overline primitive (quiet grey default)               | design        | WP-01             |
| WP-11 | Dashboard stat cards: 320px-safe layout               | APP BUG       | WP-07, WP-09      |
| WP-12 | Log: hero set input (320px digits, done state)        | APP BUG       | WP-02, WP-09      |
| WP-13 | Dashboard: "Heute dran" card + quick action           | design        | WP-02, 03, 09, 10 |
| WP-14 | Log: session header, progress bar, workout picker     | design        | WP-03, 09, 10     |
| WP-15 | Progress: chart cards, captions, title, chip wrapping | design        | WP-07, WP-08      |
| WP-16 | Manage & Settings consistency                         | design/bug    | WP-03, 07, 09, 10 |
| WP-17 | Charts: stepped strength lines (Q2)                   | design        | —                 |
| WP-18 | Charts: series cues (dash + marker glyph)             | design (docs) | WP-17             |
| WP-19 | i18n sweep + docs close-out                           | copy/docs     | all above         |
| O-01… | Optional missing elements (see §2.9)                  | question      | per package       |

### 2.1 Foundations

#### WP-01: `cn()` understands the token type/shadow scale

- **Covers:** X-15 (APP BUG: tabs, chips and pills collapse to 16px). Also fixes the
  unlisted twin in `StatCard.tsx:37-41`: `cn("… text-display …", "text-disabled")`
  drops `text-display`, so the empty/muted em-dash renders at 16px.
- **Files:** `src/lib/utils.ts`, `src/lib/utils.test.ts` (new).
- **Change:**
  - Replace `twMerge` with an `extendTailwindMerge` instance (tailwind-merge 3.6) that
    registers the project scales, so custom `text-*` sizes stop being read as text
    **colours**, and custom `shadow-*` names stop being read as shadow colours:
    ```ts
    const twMerge = extendTailwindMerge({
      extend: {
        theme: {
          text: [
            "display-xl",
            "display",
            "h1",
            "h2",
            "h3",
            "body-lg",
            "body",
            "label",
            "caption",
            "micro",
          ],
          shadow: ["elev-1", "elev-2", "elev-3", "inset-hi"],
        },
      },
    })
    ```
    Keep `cn(...inputs) = twMerge(clsx(inputs))`.
  - Tests (Vitest): `cn("text-caption", "text-muted-foreground")` keeps both;
    `cn("text-sm", "text-body-lg") === "text-body-lg"`;
    `cn("text-display", false && "x", "text-disabled")` keeps both;
    `cn("shadow-elev-1", "shadow-inset-hi") === "shadow-inset-hi"`;
    `cn("text-caption font-medium", "text-foreground")` keeps `text-caption`.
- **Constraints:** no new dependency. Do not touch any component.
- **Verify:** `/progress/recomposition`, `/progress/strength`,
  `/progress/exercise/<id>`, `/manage/plans` at 390 + 320. The segmented tabs,
  workout pills and exercise chips compute `font-size: 13px` (they were 16px). On
  the Dashboard calories card, the em-dash is 36px.
- **Risk:** it changes merge results everywhere a custom size meets a Tailwind size.
  One example is Button's `text-sm` meeting a caller's `text-body-lg`, which now
  resolves to the caller's class; before, CSS order decided. Any screen may shift a
  few px, so check Dashboard, Log, Progress, Manage and Settings once at 390.
- **Depends on:** —

#### WP-02: New tokens + design-system doc refresh

- **Covers:** foundation for X-02, X-03, X-04, X-13, D-08 and the picker "next"
  card; X-11 (stale fonts note).
- **Files:** `src/index.css`, `docs/design-system.md`, `src/lib/utils.ts`,
  `src/lib/utils.test.ts`.
- **Change:**
  - `:root` in `src/index.css` (each value below is the prototype's hard-coded one, now tokenised):
    - `--success-foreground: #06140d;` (dark text on solid success, prototype
      `.set-idx2.done`)
    - `--scrim: #02030799;` (sheet/dialog overlay, prototype `rgba(2,3,7,.6)`)
    - `--surface-hero: #16203a;` (start stop of the "today" card gradient,
      `.today-card`)
    - `--surface-primary: color-mix(in oklch, var(--primary) 8%, var(--surface));`
      (the "next" workout card, `.wp-card.next`)
    - `--elev-card: var(--inset-hi), var(--elev-1);` (raised card: top highlight +
      resting shadow; `design-system.md` assigns both roles to cards)
  - `@theme inline`: `--color-success-foreground`, `--color-scrim`,
    `--color-surface-hero`, `--color-surface-primary`, `--shadow-card: var(--elev-card)`.
  - `src/lib/utils.ts`: add `"card"` to the `shadow` list from WP-01. Add a test that
    `cn("shadow-elev-1", "shadow-card") === "shadow-card"`.
  - `docs/design-system.md`: add the four colours to the Surfaces/Semantic tables and
    `shadow-card` to the Elevation table ("Resting raised cards: `Card`, list rows,
    empty states"). Replace the stale "Fonts are loaded via Google Fonts `@import`"
    follow-up with "Fonts are self-hosted via `@fontsource-variable` (imported in
    `src/main.tsx`)" (X-11).
- **Constraints:** do not change existing token values. Use hex-with-alpha, as the
  existing `-soft` tokens do.
- **Verify:** `npm run ci`. No visual change is expected yet (the new tokens are unused).
- **Risk:** none at runtime. `color-mix` is supported in current iOS Safari and
  Android Chrome.
- **Depends on:** WP-01.

### 2.2 Shared primitives

#### WP-03: Button: 48px size scale, radius tiers, variants

- **Covers:** X-01 root cause (APP BUG: no size step reaches 48px), X-09/T-08
  (radius one tier off), M-13 (destructive button has no border).
- **Files:** `src/components/ui/button.tsx`, `src/components/ui/sheet.tsx`,
  `src/components/ui/dialog.tsx`, `src/app/AppLayout.tsx`,
  `src/features/training/components/ActiveSession.tsx`.
- **Change** (`buttonVariants`):
  - Base: swap `rounded-lg` → `rounded-md`, `gap-1.5` → `gap-2`,
    `text-sm font-medium` → `text-label font-semibold`, and add
    `duration-(--dur-fast) ease-standard`. Keep the focus, disabled, aria-invalid and
    svg rules.
  - Variants:
    - `default`: `bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-pressed`
    - `outline` (= Design System `.btn-secondary`, `Design System.html:106`):
      `border-border-strong bg-surface-2 text-foreground hover:bg-[color-mix(in_oklch,var(--surface-2),var(--foreground)_5%)] aria-expanded:bg-surface-2`
    - `ghost`: `text-muted-foreground hover:bg-surface-2 hover:text-foreground aria-expanded:bg-surface-2`
    - `destructive` (`.btn-danger`, `Design System.html:110`):
      `border-danger/33 bg-danger-soft text-danger hover:bg-danger/20 focus-visible:border-danger/40 focus-visible:ring-danger/20`
    - `secondary` and `link`: unchanged.
  - Sizes (a "tap scale": every size is ≥ 48px):
    - `default`: `h-12 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3`
    - `lg` (`.btn-lg`): `h-14 rounded-lg px-6 text-body-lg`
    - `icon`: `size-12`
    - Delete `xs`, `sm`, `icon-xs`, `icon-sm`, `icon-lg` (YAGNI; the rule forbids
      them on touch screens).
  - Call sites of the removed sizes: `sheet.tsx:64` and `dialog.tsx:64`
    (`icon-sm` → `icon`; leave the positioning, which WP-05/06 restyle),
    `AppLayout.tsx:30` and `ActiveSession.tsx:168` (`icon-lg` → `icon`).
- **Constraints:** tokens only. The `color-mix` arbitrary value copies the pattern the
  existing `secondary` variant already uses. Do not touch other callers here (WP-04
  sweeps their `h-11`/`size-11` overrides).
- **Verify:** header settings button measures 48×48 at 320. Dialog/sheet close
  buttons measure 48×48. Default buttons (for example the empty-state "Plan
  hinzufügen" and `NotFoundPage`) are 48px tall. Destructive buttons (Settings
  import confirm, Manage delete confirm) show a faint red border. Compare with the
  `Design System.html` buttons.
- **Risk:** every default-size button grows from 32px to 48px, which may push layouts
  in empty states and dialog footers, so check them at 320. Typecheck flags any
  leftover removed size.
- **Depends on:** WP-01.

#### WP-04: Input primitive + Manage tap-target sweep

- **Covers:** X-01 (APP BUG, instances M-03/M-06/M-07 and T-01's `h-11`/`size-11`
  overrides that pin controls at 44px).
- **Files:** `src/components/ui/input.tsx`,
  `src/features/manage/components/ExerciseCatalogView.tsx`, `ExerciseEditorDialog.tsx`,
  `PlanEditorDialog.tsx`, `WorkoutEditorDialog.tsx`, `PlanListView.tsx`,
  `PlanDetailView.tsx`, `WorkoutSlotsView.tsx` (all under
  `src/features/manage/components/`).
- **Change:**
  - `Input` (Design System `.input`, `Design System.html:116`, but at 17px because of
    iOS, see §3 C-6):
    `h-12 w-full min-w-0 rounded-md border border-border bg-input px-3.5 text-body-lg text-foreground transition-colors outline-none placeholder:text-subtle focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20`.
    Drop `text-base md:text-sm`, the `file:` classes and the `dark:` duplicates
    (the app is dark-only).
  - In the seven Manage files: delete every `className` `h-11`, `size-11` and
    `h-12`/`size-12` override on `<Button>` and `<Input>`. The primitives now
    supply 48px, and the overrides would otherwise **win** in `cn()`. Keep layout
    classes (`flex-1`, `shrink-0`, `w-full`, `sm:mr-auto`, margins).
- **Constraints:** ≥ 48px, tokens only, `min-w-0` stays on the input.
  `SlotEditorDialog.tsx` is **not** in this package (WP-05 owns it).
- **Verify:** `/manage/plans`, a plan detail page, a workout's slots page and
  `/manage/exercises` at 320 + 390. Every icon button and the search field measure
  48px. Open each editor dialog: fields and footer buttons measure 48px, with no
  horizontal overflow.
- **Risk:** the header rows (search + add button) get 4px taller. Check they still
  fit at 320.
- **Depends on:** WP-03.

#### WP-05: Dialog primitive + slot-editor overflow

- **Covers:** M-01 (APP BUG: a native `<select>` drags the form to 505px),
  X-03/M-02/M-04/M-05/M-15 (dialog chrome), M-14 (no max-height), and two issues found
  while planning: **N-02** (hard-coded English "Close") and **N-03** (the select and
  rep inputs are 15px, so iOS zooms on focus).
- **Files:** `src/components/ui/dialog.tsx`,
  `src/features/manage/components/SlotEditorDialog.tsx`, `src/i18n/locales/de.ts`,
  `src/i18n/locales/en.ts`.
- **Change:**
  - `DialogOverlay`: `bg-black/10 … backdrop-blur-xs` → `bg-scrim` (no blur).
  - `DialogContent`: keep the positioning, the width caps and the animations.
    - Change the surface to `rounded-xl border border-border bg-sheet text-body text-foreground shadow-elev-3`
      (drop `bg-popover`, `ring-1 ring-foreground/10` and `text-sm`).
    - Add `grid-cols-1` (`repeat(1,minmax(0,1fr))`). **This is the M-01 fix:** the
      implicit `auto` grid track grew to the select's intrinsic width.
    - Add `max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain` (M-14).
  - Close button: `size="icon"` stays ghost, repositioned `absolute top-2 right-2`. The
    sr-only text becomes `t("common.close")` via `useTranslation()` (N-02), and the
    same change applies to `DialogFooter`'s optional "Close" button.
    `DialogHeader`: add `pr-12` so the title never runs under the close button.
  - `DialogTitle`: `font-heading text-base leading-none font-medium` →
    `font-display text-h3 text-foreground` (`font-heading` is an undefined utility;
    the prototype sheet/dialog title is 18-19px/600, so nearest token `text-h3`).
    `DialogDescription`: `text-sm` → `text-body text-muted-foreground`.
  - No grab handle on the centred dialog (it cannot be dragged).
  - `SlotEditorDialog.tsx`:
    - `ExerciseSelect` wrapper → `relative w-full min-w-0`.
    - The select → `h-12 w-full max-w-full min-w-0 … text-body-lg` (N-03, ≥ 16px).
    - `RepInput` → `h-12 … text-body-lg`.
    - The alternative-remove `<button>` goes from `size-11` to `size-12`.
    - `AlternativePicker`'s `<Button size="icon" className="size-11 shrink-0">` →
      `className="shrink-0"`.
    - Remove the `h-11` overrides on the three footer Buttons.
  - i18n: `common.close`: de `"Schließen"`, en `"Close"`.
- **Constraints:** shadcn/Radix Dialog stays. No custom listbox (the native select is a
  documented Phase-10 decision). ≥ 48px, `min-w-0`, tokens only.
- **Verify:** at 320 and 390, edit a workout slot whose exercise is "Schrägbankdrücken
  Kurzhantel" and add two alternatives. Then check:
  - `form.getBoundingClientRect().right <= dialogContent.getBoundingClientRect().right`
  - no document horizontal overflow
  - Save and Delete fully visible and tappable
  - in a 320×568 frame, the dialog scrolls internally and the footer is reachable
  - all four Manage editor dialogs: `bg-sheet`, elevation shadow, 60% scrim, 18px/600 title
- **Risk:** `overflow-y-auto` makes the footer (with its `-mx-4 -mb-4` bleed) scroll
  with the content, which is intended. Dialog descriptions grow from 14px to 15px.
- **Depends on:** WP-02 (scrim), WP-03 (icon size).

#### WP-06: Sheet primitive

- **Covers:** X-02/D-11…D-15 (wrong background token, no radius token, no elevation,
  under-dimmed scrim, no grab handle; APP BUG against `design-system.md`'s token table),
  N-02 for the sheet.
- **Files:** `src/components/ui/sheet.tsx`,
  `src/features/measurements/components/MeasurementQuickAdd.tsx`.
- **Change:**
  - `SheetOverlay`: → `bg-scrim` (drop the blur).
  - `SheetContent`:
    - Swap `bg-popover text-sm text-popover-foreground shadow-lg` for `bg-sheet text-body text-foreground shadow-elev-3`.
    - For `side="bottom"`: `data-[side=bottom]:rounded-t-xl data-[side=bottom]:border-border-strong`
      (the top border already exists) plus
      `data-[side=bottom]:pb-[max(1rem,env(safe-area-inset-bottom))]` (iOS home
      indicator).
    - Slide from the full height: `slide-in-from-bottom` and `slide-out-to-bottom`
      instead of the `-10` variants.
  - Grab handle: when `side === "bottom"`, render
    `<div aria-hidden="true" className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-border-strong" />`
    as the first child (`prototype.css:191`).
  - Close: `variant="outline" size="icon"` (the prototype `.icon-btn` look at 48px),
    `absolute top-4 right-4`, sr-only `t("common.close")`. `SheetHeader`:
    `flex flex-col gap-1 p-4 pr-16`.
  - `SheetTitle`: `font-display text-h3 text-foreground`. `SheetDescription`:
    `text-body text-muted-foreground`.
  - `MeasurementQuickAdd.tsx:63`: remove `rounded-t-2xl` (the primitive owns the radius).
- **Constraints:** radius = `--radius-xl` (20px), per the Design System's own
  "Bottom sheet / dialog" demo (`Design System.html:374`). The prototype's 24px has
  no token (§3 C-2). Keep the Radix Dialog base.
- **Verify:** Dashboard → "Messung erfassen" at 320 + 390 against the prototype's
  weight sheet (Dashboard → "Gewicht eintragen"):
  - scrim dims about 60%
  - grab pill centred
  - 20px top corners
  - close button 48×48 and not overlapping the title
  - fields scroll inside `max-h-[90dvh]`
  - the Save button clears the iOS home indicator
- **Risk:** the full-height slide runs a bit longer. Check that the sheet still
  closes on scrim tap and on Esc.
- **Depends on:** WP-02, WP-03, WP-05 (`common.close`).

#### WP-07: Card primitive + card-surface shadow

- **Covers:** X-04/T-03/D-20 (Card radius one tier too big, ring instead of border, no
  shadow).
- **Files:** `src/components/ui/card.tsx`, `src/pages/EmptyState.tsx`,
  `src/features/settings/components/SettingsSection.tsx`.
- **Change:**
  - `Card` base: `rounded-xl … ring-1 ring-foreground/10 … text-sm` →
    `rounded-lg border border-border bg-card text-body text-card-foreground shadow-card`
    (keep `group/card flex flex-col gap-4 overflow-hidden py-4` and the `data-[size=sm]` rules).
  - Change the `*:[img:*]:rounded-{t,b}-xl`, `CardHeader rounded-t-xl` and
    `CardFooter rounded-b-xl` classes to `-lg`.
  - `CardTitle`: `font-heading text-base leading-snug font-medium …` → `text-h3`.
    `CardDescription`: `text-sm` → `text-caption`.
  - `EmptyState.tsx` and `SettingsSection.tsx`: `shadow-elev-1` → `shadow-card`.
- **Constraints:** tokens only. Screen-level hand-rolled cards switch to `shadow-card`
  in their own screen packages (WP-12…WP-16), so this package stays small.
- **Verify:** Progress tabs, the Dashboard stat cards and Settings at 390 against the
  prototype's `.chart-card` and `.statcard-btn`: 14px radius, hairline border, faint top
  highlight.
- **Risk:** Card children that relied on the inherited `text-sm` (14px) now inherit
  15px. The chart axes are unaffected (explicit props).
- **Depends on:** WP-02.

#### WP-08: Shared segmented control + pick chips

- **Covers:** X-08/T-07/P-01/M-09/M-10 (three different "selected" styles; the
  prototype uses one solid primary pill). P-02's 16px labels are already fixed by
  WP-01.
- **Files:** `src/components/ui/segmented.tsx` (new), `src/pages/ProgressPage.tsx`,
  `src/pages/ManagePage.tsx`,
  `src/features/analysis/components/StrengthProgressionView.tsx`,
  `src/features/analysis/components/ExerciseDrilldownView.tsx`,
  `src/features/manage/components/ExerciseEditorDialog.tsx`,
  `src/features/settings/components/PreferencesSection.tsx`.
- **Change:**
  - New `segmented.tsx` (presentational `cva` helpers; react-refresh is off for
    `components/ui`):
    - `segmentedListVariants`: base
      `gap-1 rounded-md border border-border bg-surface-2 p-1`, with variant
      `layout: { inline: "inline-flex", wrap: "flex flex-wrap", fill: "grid auto-cols-fr grid-flow-col" }`
      (default `inline`).
    - `segmentedItemVariants`: base
      `flex min-h-(--tap) min-w-0 items-center justify-center rounded-sm px-4 text-caption font-semibold whitespace-nowrap transition-colors duration-(--dur-fast)`,
      with variant
      `active: { true: "bg-primary text-primary-foreground", false: "text-muted-foreground hover:text-foreground" }`.
    - `pickChipVariants` (`.chip-pick`, `prototype.css:180-181`): base
      `flex min-h-(--tap) shrink-0 items-center rounded-full border px-4 text-caption font-semibold whitespace-nowrap transition-colors`,
      with variant
      `active: { true: "border-primary bg-primary text-primary-foreground", false: "border-border bg-surface-2 text-muted-foreground hover:text-foreground" }`.
    - `SegmentedScroller({ children, className })`: a
      `div` with `-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`.
      This replaces the no-op `scrollbar-none` class currently copied into three files.
  - Consumers:
    - `ProgressNav` / `ManageNav`: `<nav>` → `<SegmentedScroller>` →
      `div.segmentedListVariants()` → `NavLink className={({isActive}) => segmentedItemVariants({active: isActive})}`.
    - `WorkoutSelector`: same shape with `<button aria-pressed>`.
    - `ExercisePicker`: keep the scroller, links use `pickChipVariants`.
    - `SegmentedField` (exercise editor): `segmentedListVariants({layout:"wrap"})`
      plus items.
    - `UnitsSection`: `segmentedListVariants({layout:"fill"})` plus items with an
      extra `font-mono text-body`.
  - Leave `src/components/ui/tabs.tsx` untouched. It has no consumer, and route nav
    must not use Radix Tabs.
- **Constraints:** ≥ 48px items (the prototype's segments are about 34px, §3 C-1).
  `t()` labels unchanged. Keep the aria attributes (`aria-current` from NavLink,
  `aria-pressed`).
- **Verify:** at 320 + 390, check `/progress/*`, `/manage/*`, the strength workout
  pills, the exercise chips, the exercise editor type/unit fields and Settings units.
  The active item is solid blue with dark text, 13px/600. The strips scroll
  horizontally at 320 without page overflow. Compare with the prototype's Progress
  segmented control and exercise picker.
- **Risk:** strong visual change on every hub screen. The exercise-editor field is
  now wrapped in a container, so check it still wraps at 320.
- **Depends on:** WP-01.

#### WP-09: Badge primitive (chips, tally, status, soon)

- **Covers:** X-16/D-09/M-12 (chips not pill-shaped, no border), L-04 (set tally is
  bare text), the picker's "Als Nächstes" badge (`.wp-badge` is solid primary),
  D-22 (the calories pill says "Phase 2" where the prototype says "bald").
- **Files:** `src/components/ui/badge.tsx` (new),
  `src/features/analysis/components/TodayWorkoutCard.tsx`,
  `src/features/analysis/components/DashboardView.tsx`,
  `src/features/training/components/WorkoutPicker.tsx`,
  `src/features/training/components/ExerciseLogCard.tsx`,
  `src/features/manage/components/ExerciseCatalogView.tsx`.
- **Change:**
  - `badge.tsx`: `badgeVariants` base
    `inline-flex max-w-full shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 whitespace-nowrap`.
    The `variant` options are:

    | variant     | classes                                                                                              |
    | ----------- | ---------------------------------------------------------------------------------------------------- |
    | `tag`       | `inline-block truncate border-border bg-surface-2 text-caption text-muted-foreground`                |
    | `more`      | `border-border bg-surface-2 text-caption text-subtle`                                                |
    | `status`    | `border-primary bg-primary font-mono text-micro font-semibold text-primary-foreground uppercase`     |
    | `neutral`   | `border-border bg-surface-2 font-mono text-micro font-semibold tracking-normal text-subtle`          |
    | `tally`     | `border-border bg-surface-2 font-mono text-caption font-semibold tabular-nums text-muted-foreground` |
    | `tallyDone` | `border-success bg-success-soft font-mono text-caption font-semibold tabular-nums text-success`      |

    `export function Badge({ className, variant, ...props }: ComponentProps<"span"> & VariantProps<…>)`.

  - `TodayWorkoutCard` / `WorkoutPicker`: exercise chips → `<Badge>` and the "+N" chip →
    `variant="more"`. The picker's next badge → `variant="status"`.
  - `ExerciseLogCard` tally → `<Badge variant={complete ? "tallyDone" : "tally"}>`.
  - `ExerciseCatalogView` type chip → `<Badge>`.
  - `DashboardView`: delete `SoonPill` and use `<Badge variant="neutral">{t("dashboard.cards.soon")}</Badge>`.
    `dashboard.cards.soon` ("Bald") already exists and was unused. Keep `common.phase2`,
    because Settings still uses it.

- **Constraints:** `TrendBadge` stays as it is (it already matches the Design System
  `.badge`). Tokens only.
- **Verify:** at 320 + 390, check the Dashboard "Heute dran" chips, the `/log`
  picker cards, the active-session exercise cards (the tally turns green at n/n),
  the catalog rows and the calories card. Long exercise names in chips truncate
  instead of overflowing.
- **Risk:** chips gain 2px (border). The `inline-block truncate` override on `tag`
  depends on WP-01's merge fix to beat the base `inline-flex`.
- **Depends on:** WP-01, WP-02.

#### WP-10: Overline primitive (quiet grey default)

- **Covers:** X-05/T-04/D-19/L-11/M-08 (every overline is hard-coded primary blue, and
  `tracking-[0.16em]` duplicates the token).
- **Files:** `src/components/ui/overline.tsx` (new), `src/pages/PageHeader.tsx`,
  `src/features/analysis/components/TodayWorkoutCard.tsx`,
  `src/features/training/components/WorkoutPicker.tsx`,
  `src/features/training/components/ActiveSession.tsx`,
  `src/features/manage/components/PlanListView.tsx`,
  `src/features/manage/components/PlanDetailView.tsx`,
  `src/features/manage/components/WorkoutSlotsView.tsx`.
- **Change:**
  - `Overline({ className, ...props }: ComponentProps<"div">)` renders
    `<div className={cn("font-mono text-micro text-subtle uppercase", className)} …/>`.
    The tracking (0.16em) comes from the `text-micro` token.
  - Replace all seven
    `font-mono text-micro tracking-[0.16em] text-primary uppercase` divs with
    `<Overline>`, including "AKTIV" and "ROTATION · PLATZ N". Grey is the prototype's
    default everywhere, even on "next" and "active" cards (`screens.jsx:98`).
- **Constraints:** no `tone` prop yet (YAGNI). O-05 adds `tone="primary"` only if the
  Dashboard recomposition preview is approved.
- **Verify:** every screen header plus the Dashboard card, picker cards, session
  header and Manage labels at 390. Compare with prototype `.overline` (`prototype.css:41`).
- **Risk:** the active plan loses its blue "AKTIV" label, but its primary border still
  marks it.
- **Depends on:** WP-01.

### 2.3 Dashboard

#### WP-11: Dashboard stat cards: 320px-safe layout

- **Covers:** X-12/D-01 (APP BUG: label computed to 0px width at 320px, badge clipped),
  D-02 (mid-word truncation at 390), X-14 (sub-line colour), X-06 mapping for `.sc-v`.
- **Files:** `src/features/analysis/components/StatCard.tsx`,
  `src/features/analysis/components/DashboardView.tsx` (only if spacing tweaks are needed;
  otherwise leave it).
- **Change** (`StatCard`):
  - Card: `className="min-w-0 gap-0 p-3.5"`.
  - Top row (`.sc-top`, `prototype.css:52`):
    `mb-2.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5`, so the
    badge wraps to its own line instead of squeezing the label.
  - Label (`.sc-k`, 11.5px/600/.05em): `min-w-0 max-w-full text-micro font-semibold tracking-wider text-muted-foreground uppercase hyphens-auto wrap-break-word`.
    No `truncate`: `<html lang="de">` lets "KÖRPER-GEWICHT" hyphenate at 320.
  - Value (`.sc-v` 32px): `flex flex-wrap items-baseline gap-x-1 font-mono text-h1 font-semibold tabular-nums`
    (28px, the nearest token that still fits "103.4 kg" in a 108px card at 320, see
    §3 C-3). The unit `<small>` becomes `text-body font-medium text-subtle`.
    Muted/empty value: `text-disabled`.
  - Sub-line (`.sc-sub`): `mt-2 text-caption text-subtle`, with no `truncate` (it
    wraps, so no meaning is lost).
- **Constraints:** `min-w-0` + wrapping, no hidden text at 320, tokens only. Do not add
  the goal bar or interactivity (§4 Q5/Q8).
- **Verify:** Dashboard at 320: every label is fully visible (hyphenated if needed), the
  badge is either beside or below the label and never past the card edge, and no
  element's right edge is past the card. At 390, compare with the prototype stat grid.
  Also check `/progress/body` (the full-width `RateCard` uses StatCard).
- **Risk:** cards may become unequal heights when one badge wraps, but grid rows
  stretch so the two cards in a row stay equal.
- **Depends on:** WP-07, WP-09.

#### WP-13: Dashboard: "Heute dran" card + quick action

(Numbered after WP-12 on purpose: WP-12 is an APP BUG and runs first.)

- **Covers:** X-13/D-07 (go-icon soft instead of solid), D-06 (CTA reads as plain
  text), D-08 (flat surface, blue border), plus the quick-action button's height and
  variant.
- **Files:** `src/features/analysis/components/TodayWorkoutCard.tsx`,
  `src/features/analysis/components/DashboardView.tsx`.
- **Change** (`.today-card`, `prototype.css:80-88`):
  - Button:
    `w-full rounded-lg border border-border-strong bg-linear-155 from-surface-hero to-surface to-60% p-4.5 text-left shadow-card transition-transform duration-(--dur-fast) active:scale-99`
    (drop `border-primary/60`, `bg-surface` and `hover:border-primary`).
  - Name: `mt-0.5 text-h2` (26px → `text-h2` 22px, keeping it below the 28px page
    title, §3 C-3).
  - Go tile: `flex size-12 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground`
    (decorative, not its own tap target).
  - Chips: `mt-3.5 flex flex-wrap gap-1.5` (Badge from WP-09).
  - CTA: `mt-3.5 flex h-12 items-center justify-center gap-1 rounded-md bg-primary-soft text-body font-semibold text-primary`
    with the existing text and chevron.
  - `DashboardView` quick add: `<Button variant="outline" size="lg" className="mt-3 w-full">`
    (drop `h-12 text-body-lg`, which `size="lg"` now covers).
- **Constraints:** the card stays one `<button>` (tap target = whole card). No glow.
  Tokens only (gradient stops are tokens from WP-02).
- **Verify:** Dashboard at 390 against the prototype (subtle navy-to-surface gradient,
  neutral strong border, solid blue go tile, filled CTA pill) and at 320 (no overflow,
  name wraps if long).
- **Risk:** `bg-linear-155` and `to-60%` are Tailwind v4 syntax, so confirm in the
  computed style that the gradient applies.
- **Depends on:** WP-02, WP-03, WP-09, WP-10.

### 2.4 Log

#### WP-12: Log: hero set input (320px digits, done state)

- **Covers:** L-01 (APP BUG: `71.5` renders "71." at 320), L-02 (hero value 17px/400
  vs 24px/600), X-13/L-03 (the done index is a soft tint where the prototype uses
  solid success + dark text, plus the shape), X-13/L-07 (a filled input keeps a primary
  border), X-09/L-08 (stepper radius/colours), X-14/L-10 (unit/meta caption colour),
  and **N-01** found while planning (hard-coded aria-labels `"Satz"`, `"2,5 weniger"`,
  `"2,5 mehr"` in `SetRow.tsx:65,78,86`).
- **Files:** `src/features/training/components/SetRow.tsx`,
  `src/features/training/components/ExerciseLogCard.tsx`,
  `src/features/measurements/components/MeasurementInput.tsx`,
  `src/i18n/locales/de.ts`, `src/i18n/locales/en.ts`.
- **Change:**
  - Space budget at 320 (card content = 254px): shrink the **decorative** index badge
    48 → 34px and tighten gaps below the `@2xs` container width (288px), so the input
    gets about 66px, enough for "102.25" at 17px mono (61px). At ≥ 288px the value
    grows to the hero size.
  - `ExerciseLogCard`:
    - card `shadow-elev-1` → `shadow-card`
    - meta line → `font-mono text-caption text-subtle` (`.ex-meta`)
    - the set list wrapper → `@container flex flex-col gap-2.5`
  - `SetRow`:
    - Row: `flex items-center gap-1.5 @2xs:gap-2.5`.
    - Index (`.set-idx2`, `prototype.css:139-140`):
      `flex size-8.5 shrink-0 items-center justify-center rounded-full border font-mono text-caption`.
      Filled: `border-success bg-success text-success-foreground` with
      `<Check className="size-4"/>`. Empty: `border-border-strong text-muted-foreground`.
    - Field `<label>` (`.weight-input2`):
      `flex h-14 min-w-0 flex-1 cursor-text items-center gap-1 rounded-md border bg-surface-2 px-2.5 transition-colors @2xs:gap-1.5 @2xs:px-3.5`.
      Focused: `border-primary ring-3 ring-primary-soft`. Filled: `border-primary`.
      Otherwise: `border-border`.
    - `<input>` (`.wi-field`):
      `min-w-0 flex-1 bg-transparent text-right font-mono text-body-lg font-semibold tabular-nums outline-none placeholder:font-medium placeholder:text-subtle @2xs:text-h2`.
    - Unit: `font-mono text-caption text-subtle`.
    - Steppers (`.stepper2`, 44px in the prototype → 48px, §3 C-1): group
      `flex shrink-0 gap-1 @2xs:gap-1.5`; buttons
      `flex size-12 items-center justify-center rounded-sm border border-border-strong bg-surface text-foreground transition-colors active:translate-y-px active:bg-surface-2`.
    - aria-labels (N-01): `t("log.setLabel", { n: index })`,
      `t("log.stepDown", { step: "2,5" })`, `t("log.stepUp", { step: "2,5" })`.
  - `MeasurementInput` (same custom-input pattern): apply the same stepper classes, the
    focus/filled border classes and `font-semibold` on the input. Keep its `h-12` and
    `text-body-lg` (the quick-add sheet has four rows).
  - i18n (de/en):
    - `log.setLabel` "Satz {{n}}" / "Set {{n}}"
    - `log.stepDown` "{{step}} weniger" / "{{step}} less"
    - `log.stepUp` "{{step}} mehr" / "{{step}} more"
- **Constraints:** custom input (not shadcn). Steppers ≥ 48px. `min-w-0` on the label
  and input. Text inputs ≥ 16px (17px floor). Tokens only. Tailwind v4 built-in
  container queries (no new breakpoint token).
- **Verify:**
  - Open an existing past session (`/log/<id>` of a demo session; do not save
    anything) at **320**. Type "102.25" into a set and confirm
    `input.scrollWidth <= input.clientWidth` for every SetRow, and that placeholders
    (last weights) are fully visible.
  - At 390: value 22px/600, filled row shows a green circle with a check plus a blue
    border, steppers 48px with a strong border.
  - Compare with the prototype's Workout screen (tab bar dumbbell → pick → set rows).
  - Quick-add sheet at 320: rows still fit.
- **Risk:** row height 48 → 56px makes sessions longer to scroll. If 66px turns out
  tight on a real device, fall back to `px-2` at base. Do not shrink the steppers.
- **Depends on:** WP-02 (`success-foreground`), WP-09 (tally in the same file).

#### WP-14: Log: session header, progress bar, workout picker

- **Covers:** L-05 (in-page header structure), L-09 (progress gradient), L-14 (back
  target after a Dashboard direct start), L-15 (hint copy + bold name), X-12/L-12
  (picker overline wraps mid-phrase at 320), X-14 (picker summary colour), and the
  picker card styling (`.wp-card`, `.wp-card.next`).
- **Files:** `src/features/training/components/ActiveSession.tsx`,
  `src/features/training/components/WorkoutPicker.tsx`,
  `src/features/analysis/components/TodayWorkoutCard.tsx`,
  `src/i18n/locales/de.ts`, `src/i18n/locales/en.ts`.
- **Change:**
  - `ActiveSession` header (`.log-head`, `prototype.css:105-107`):
    - Header:
      `-mx-4 -mt-5 mb-3 flex items-center gap-3 border-b border-border px-4 py-3`,
      scrolling with `<main>` (no sticky, §3 C-7).
    - Back button: `<Button variant="outline" size="icon">`.
    - Centre: `min-w-0 flex-1 text-center`, containing `<Overline>{t("nav.log")}</Overline>`
      plus `<h1 className="truncate text-h3">`.
    - Right: `<span aria-hidden="true" className="size-12 shrink-0" />` as a balancing
      spacer (the rest-timer slot, §4 Q9).
  - Progress row: `mb-4 flex items-center gap-3`. Fill:
    `bg-linear-to-r from-primary to-accent` (L-09). Count stays
    `font-mono text-caption text-muted-foreground`.
  - Save: `<Button size="lg" className="mt-5 w-full">` (drop `h-12 text-body-lg`).
  - L-14:
    - `LocationState` gains `returnTo?: string`. `ActiveSession` reads it and passes it
      to `SessionForm`, whose back button does `navigate(returnTo ?? "/log")`.
    - `TodayWorkoutCard` navigates with `state: { workoutId: next.id, returnTo: "/" }`.
    - The picker keeps the default.
  - `WorkoutPicker`:
    - Card:
      `w-full rounded-lg border p-4 text-left shadow-card transition-colors active:bg-surface-2`,
      plus `border-primary bg-surface-primary` for next and
      `border-border bg-surface hover:border-border-strong` otherwise.
    - Top row: `flex flex-wrap items-start justify-between gap-x-3 gap-y-2`. The
      overline gets `whitespace-nowrap` (L-12: at 320 the badge wraps below instead of
      breaking "ROTATION · 1 VON 3").
    - Name: `mt-0.5 text-h2` (20px → 22px).
    - Summary: `mt-2 font-mono text-micro tracking-normal text-subtle` (`.wp-ex`).
    - Hint (L-15): `<p className="mb-4 text-caption text-muted-foreground">` using
      `<Trans i18nKey="log.pick.hint" values={{ name: next.name }} components={{ strong: <strong className="font-semibold text-foreground" /> }} />`.
  - i18n `log.pick.hint`:
    - de: "Als Nächstes ist <strong>{{name}}</strong> dran — oder wähle ein anderes, falls du eine Einheit überspringst oder nachholst."
    - en: "Up next: <strong>{{name}}</strong> — or pick another if you're skipping or catching up on a session."
- **Constraints:** app shell (the header scrolls inside `<main>`, no sticky/fixed, no
  inner scroller). ≥ 48px back button. `t()` with the workout name interpolated
  verbatim (user data). Tokens only.
- **Verify:**
  - `/log` at 320 + 390 against the prototype's "Workout wählen": the next card has a
    tinted background and blue border, a solid "ALS NÄCHSTES" badge wraps below at
    320, and the hint shows the name in bold.
  - Dashboard → "Heute dran" → back arrow returns to `/` (not `/log`). `/log` →
    pick → back returns to `/log`.
  - Session header centred at 390, no overflow at 320 with a long workout name
    (truncates).
- **Risk:** `-mx-4 -mt-5` couples the header to AppLayout's `px-4 pt-5`, so comment it
  in code. A `<Trans>` key typo fails silently, so check the rendered text.
- **Depends on:** WP-03, WP-09, WP-10.

### 2.5 Progress

#### WP-15: Progress: chart cards, captions, title, chip wrapping

- **Covers:** X-14/P-08 (captions should be the tertiary mono note), P-14 (toggle chip
  names truncate at 320), and **N-04** found while planning: the hub shows overline
  "FORTSCHRITT" above title "Fortschritt" (duplicated), where the prototype's title
  names the active view (`screens.jsx:313`).
- **Files:** `src/pages/ProgressPage.tsx`,
  `src/features/analysis/components/RecompositionView.tsx`,
  `StrengthProgressionView.tsx`, `ExerciseDrilldownView.tsx`, `BodyView.tsx` (same
  folder), `src/i18n/locales/de.ts`, `src/i18n/locales/en.ts`.
- **Change:**
  - Chart cards (`.chart-card`, 18/14/16px): `<Card className="gap-3.5 px-3.5 pt-4.5 pb-4">`
    in all four views.
  - Captions (`.cc-note`): `font-mono text-micro tracking-normal text-subtle`, with the
    copy shortened to the prototype's terse note style:

    | key                                | de                                                    | en                                                 |
    | ---------------------------------- | ----------------------------------------------------- | -------------------------------------------------- |
    | `progress.recomposition.caption`   | "Beide auf 100 indexiert · eine Achse"                | "Both indexed to 100 · one axis"                   |
    | `progress.strength.caption`        | "Top-Satz je Einheit · Stufen = doppelte Progression" | "Top set per session · steps = double progression" |
    | `progress.exercise.caption`        | "Top-Satz (Linie) · Min–Max der Sätze (Band)"         | "Top set (line) · set min–max (band)"              |
    | `progress.body.weight.caption`     | "Rohwerte (Punkte) · 7-Tage-Schnitt (Linie)"          | "Raw weigh-ins (dots) · 7-day average (line)"      |
    | `progress.body.comparison.caption` | "Auf 100 zum Start indexiert · eine Achse"            | "Indexed to 100 at start · one axis"               |

    If §4 Q1 (insight boxes) is **declined**, keep the thesis clause "Taille runter,
    Brust/Bizeps halten" in the comparison caption. Otherwise it moves into the insight
    (O-04).

  - Swap hint (`StrengthProgressionView.tsx:126`): keep the text, style
    `text-caption text-subtle` (O-04 turns it into an insight box if approved).
  - P-14 toggle chips: the container `rounded-full` → `rounded-xl`, the inner halves
    `rounded-l-xl`/`rounded-r-xl`, and the name span `truncate` →
    `line-clamp-2 text-left wrap-break-word`. A 48px chip holds two 13px lines, so
    full names stay readable at 320.
  - N-04 `ProgressPage`: title = the active sub-view. Derive the second path segment
    from `useLocation().pathname` (`recomposition|strength|exercise|body`) →
    `t(\`progress.tabs.${seg}\`)`, falling back to `t("progress.title")`. The overline
stays `t("nav.progress")`. No new keys (`progress.tabs.exercise` = "Einzelübung"
    already exists).

- **Constraints:** `t()` for all copy (de + en). Tokens only. `min-w-0` on legend
  items stays. Charts are untouched here (WP-17/18).
- **Verify:** all four Progress views at 320 + 390 against the prototype's Progress
  tabs: grey mono note above each chart, 14px card radius, header title changes per
  tab ("Recomposition", "Kraft je Workout", "Einzelübung", "Körpermaße"), and
  toggle chips wrap names to two lines at 320 instead of "Schrägbankdrücken K…".
- **Risk:** caption copy loses some explanation. The insight boxes (Q1) are where that
  meaning returns.
- **Depends on:** WP-07, WP-08.

### 2.6 Manage & Settings

#### WP-16: Manage & Settings consistency

- **Covers:** M-11 (numbered list badge is a square filled chip), residual X-01
  (`BackupSection.tsx:127,136` `h-11`), and card surfaces → `shadow-card`.
- **Files:** `src/features/manage/components/PlanListView.tsx`, `PlanDetailView.tsx`,
  `WorkoutSlotsView.tsx`, `ExerciseCatalogView.tsx` (same folder),
  `src/features/settings/components/BackupSection.tsx`.
- **Change:**
  - M-11 (`PlanDetailView.tsx:159`, `WorkoutSlotsView.tsx:166`): the index span →
    `flex size-9 shrink-0 items-center justify-center rounded-full border border-border-strong font-mono text-caption text-muted-foreground tabular-nums`
    (the same circular index motif as the Log set index; decorative).
  - Every list-row/card element with `shadow-elev-1` → `shadow-card`.
  - `BackupSection`: remove the two `h-11` overrides (the Button default is 48px).
- **Constraints:** ≥ 48px, tokens only. No structural change (these screens have no
  prototype equivalent, so the goal is internal consistency).
- **Verify:** `/manage/plans`, a plan detail page, a workout page, `/manage/exercises`
  and `/settings` at 320 + 390. There should be no overflow, and the import-confirm
  buttons should measure 48px.
- **Risk:** minimal.
- **Depends on:** WP-03, WP-07, WP-09, WP-10.

### 2.7 Charts

#### WP-17: Charts: stepped strength lines (§4 Q2)

- **Covers:** P-03, and partly P-09. Not a conflict: `docs/charts.md` says "Expect
  stair-stepped lines (flat then a jump)". That describes the **data** under double
  progression, not a curve type. Recommended option: top set is a discrete per-session
  value held until the next session, so draw strength series as steps (this matches the
  prototype's `stepped: true`, `charts.jsx:38-46`). Smoothing (`monotone`) invents
  in-between values that never happened.
- **Files:** `src/features/analysis/components/StrengthProgressionChart.tsx`,
  `ExerciseDrilldownChart.tsx`, `RecompositionChart.tsx` (same folder),
  `docs/charts.md`.
- **Change:**
  - Strength progression `<Line type="stepAfter">`.
  - Drilldown top-set `<Line type="stepAfter">` **and** band
    `<Area type="stepAfter">` (the band must follow the steps).
  - Recomposition: strength `stepAfter`, bodyweight index stays `monotone` (the
    prototype's bodyweight series is not stepped).
  - Body charts (MA line, circumferences) unchanged.
  - `docs/charts.md` › Top set: add one sentence: "Strength series render as
    `stepAfter` steps; bodyweight/measurement series stay smoothed."
- **Constraints:** Recharts. `connectNulls` settings unchanged (swap-awareness).
- **Verify:** `/progress/strength`, `/progress/exercise/<id>` and
  `/progress/recomposition` at 390: flat-then-jump steps, no bridging across a
  swapped exercise, the band hugs the steps.
- **Risk:** the Recomposition strength line is still saw-toothed (steps up and down),
  which is P-09 and §4 Q3.
- **Depends on:** — (can run any time; kept after the screens so chart changes review
  together). **Gated by §4 Q2.**

#### WP-18: Charts: series cues (dash + marker glyph)

- **Covers:** P-04. `docs/design-system.md` › Chart palette says each series pairs a
  hue with a dash **and** a marker. The app draws only colour + round dots, so this is
  a docs-backed design fix.
- **Files:** `src/features/analysis/components/chartCues.tsx` (new),
  `RecompositionChart.tsx`, `StrengthProgressionChart.tsx`,
  `ExerciseDrilldownChart.tsx`, `MeasurementComparisonChart.tsx`,
  `RecompositionView.tsx`, `BodyView.tsx` (same folder), `docs/design-system.md`.
- **Change:**
  - `chartCues.tsx` exports:
    - `SERIES_CUES`, indexed like `--chart-1..6`:
      `[{marker:"circle"}, {dash:"7 5",marker:"square"}, {dash:"2 5",marker:"triangle"}, {dash:"10 4 2 4",marker:"diamond"}, {dash:"14 6",marker:"cross"}, {thin:true,marker:"star"}]`
      (values from `design-reference/data.jsx`; star = five-point polygon).
    - `MarkerShape({ marker, cx, cy, color, r = 3 })`: an SVG glyph, per
      `charts.jsx:12-21`.
    - `markerDot(cue, color)`: a Recharts `dot` render function. Return `null` when
      `cx`/`cy` are nullish. If React warns about keys, key on `${dataKey}-${index}`.
    - `LegendSwatch({ cue, color, label })`: a 34×12 SVG line with the dash plus the
      marker, and a `truncate text-caption text-muted-foreground` label.
    - `TooltipSwatch({ cue, color })`: a 10×10 marker.
  - Apply them:
    - `StrengthProgressionChart`: cue = `SERIES_CUES[data.series.indexOf(s) % 6]`,
      giving `strokeDasharray`, `strokeWidth` (2 if thin, else 2.6) and `dot`.
    - `MeasurementComparisonChart`: export its `SERIES` as `COMPARISON_SERIES` with a
      `cue` (waist = chart-5 slot, chest = chart-1, biceps = chart-3), and let
      `BodyView` reuse it instead of its duplicate `LEGEND`.
    - `RecompositionChart`: strength slot 0, bodyweight slot 1 (dash "7 5" replaces
      "6 4").
    - `ExerciseDrilldownChart`: slot 0.
    - Tooltips use `TooltipSwatch`. The legends in `RecompositionView` and `BodyView`
      use `LegendSwatch`.
    - Strength toggle chips keep their plain dot (the prototype's `.tog-sw`).
  - `docs/design-system.md` › Chart palette: add the exact dash arrays to the Cue
    column.
- **Constraints:** Recharts (no ported SVG charts; only the marker glyph is custom
  SVG). Colours via `var(--chart-N)`/`var(--recomp-*)`.
- **Verify:** all Progress charts at 390 against the prototype: distinct glyphs per
  series on the line, in the legend and in the tooltip. Check at 320 that legends wrap
  without overflow.
- **Risk:** custom `dot` functions are the fiddliest Recharts typing, so keep them
  loosely typed (as the Phase-5 tooltip learning advises).
  `strengthProgression.test.ts` is unaffected (no data change).
- **Depends on:** WP-17 (same files; avoids merge churn).

### 2.8 Copy / i18n + close-out

#### WP-19: i18n sweep + docs close-out

- **Covers:** **N-05** found while planning: the tab bar `<nav>` is labelled
  `t("nav.dashboard")` ("Übersicht"). Also a final hard-coded-string sweep and
  documentation.
- **Files:** `src/app/BottomTabBar.tsx`, `src/i18n/locales/de.ts`,
  `src/i18n/locales/en.ts`, `docs/design-system.md`, `docs/implementation-plan.md`.
- **Change:**
  - `nav.primary`: de "Hauptnavigation", en "Main navigation". Use it as the tab bar
    `aria-label`.
  - Sweep: grep `src/**/*.tsx` for literal UI strings in JSX text, `aria-label="…"`
    and `sr-only`. Everything must be `t()` except the brand name "Gym Tracker" and
    glyphs ("—", "?"). The planning pass found no others beyond N-01/N-02/N-05.
  - `docs/design-system.md`: add a short "Components" section. It covers the Button
    sizes (`default` 48, `lg` 56, `icon` 48; no smaller sizes), Segmented, Badge,
    Overline, Card = `shadow-card`, Sheet/Dialog = `bg-sheet` + `shadow-elev-3` +
    `bg-scrim`, and the nearest-token mapping table from §3 C-3.
  - `docs/implementation-plan.md`: flip the "Design alignment" row to `done`, and add
    learnings only if something affects later work.
- **Verify:** `npm run ci`. A full pass of every route at 320 + 390 plus the desktop
  sanity check.
- **Risk:** none.
- **Depends on:** all other packages (and any approved OPTIONAL packages).

### 2.9 OPTIONAL packages (only if the user approves the matching §4 question)

Each adds real UI scope. They run between WP-18 and WP-19.

#### O-01: Body: per-measurement delta tiles (Q7, P-07)

- **Files:** `src/features/analysis/body.ts`, `src/features/analysis/body.test.ts`,
  `src/features/analysis/components/StatTile.tsx` (new),
  `src/features/analysis/components/BodyView.tsx`.
- **Change:**
  - `MeasurementComparison` gains
    `changeSinceStart: Record<ComparisonType, number | null>` (raw latest − first, in cm,
    rounded to 1 decimal; `null` with fewer than 2 points). Add a unit test.
  - `StatTile({ value, unit, label, tone })` (`.ex-stats > div`, `prototype.css:183-186`):
    - tile: `min-w-0 rounded-md border border-border bg-surface-2 p-2.5`
    - value row: `flex flex-wrap items-baseline gap-x-0.5 font-mono text-body-lg font-semibold tabular-nums @xs:text-h2`
    - unit: `text-caption text-subtle`
    - label: `mt-1 text-micro tracking-normal text-subtle`
    - `tone="good"`: `text-success`
  - In `BodyView`, above the comparison chart, render `@container grid grid-cols-3 gap-2`
    with one tile per present series. The sign uses "−". `good` means waist < 0, or
    chest/biceps > 0. The label row carries the series' `TooltipSwatch` if WP-18 has
    landed.
- **Verify:** at 320, no tile overflows with a "−10.5 cm" value (the unit wraps
  below if needed).
- **Depends on:** WP-15 (and WP-18 for swatches).

#### O-02: Exercise drilldown stat tiles (Q6, P-06)

- **Files:** `src/features/analysis/exerciseDrilldown.ts`,
  `src/features/analysis/exerciseDrilldown.test.ts`,
  `src/features/analysis/components/ExerciseDrilldownView.tsx`,
  `src/features/analysis/components/StatTile.tsx` (create it as in O-01 if absent),
  `src/i18n/locales/de.ts`, `src/i18n/locales/en.ts`.
- **Change:**
  - `DrilldownData` gains `latestTop: number | null` and
    `changeSinceStart: number | null` (last top − first top). Add tests.
  - Show three `StatTile`s above the chart inside the card:
    - `progress.exercise.stats.current` "Aktuell" / "Current" (with unit)
    - `progress.exercise.stats.sinceStart` "seit Start" / "since start" (signed,
      `tone="good"` if > 0)
    - `progress.exercise.stats.sessions` "Einheiten" / "Sessions"
- **Verify:** at 320 with a 6-character weight ("102.25"), the tiles don't overflow.
- **Depends on:** WP-15.

#### O-03: Insight box: component + Recomposition (Q1, P-05)

- **Files:** `src/features/analysis/components/Insight.tsx` (new),
  `src/features/analysis/insights.ts` (new), `src/features/analysis/insights.test.ts`
  (new), `src/features/analysis/recomposition.ts`,
  `src/features/analysis/recomposition.test.ts`,
  `src/features/analysis/components/RecompositionView.tsx`,
  `src/i18n/locales/de.ts`, `src/i18n/locales/en.ts`.
- **Change:**
  - `Insight({ badge?, children })` (`.insight`, `prototype.css:172`):
    `flex items-center gap-2.5 rounded-md bg-surface-2 p-3 text-caption text-muted-foreground`.
  - `RecompositionData` gains `latestBodyweightIndex: number | null`. Add a test.
  - `recompositionInsight(strengthDelta, bwDelta)` (pure, ε = 0.5, tested) returns
    `{ tone, badgeKey, textKey }`:

    | case                          | badge             | text                                                                    |
    | ----------------------------- | ----------------- | ----------------------------------------------------------------------- |
    | bodyweight ↓, strength ≥ −ε   | good "Kraft hält" | "Gewicht fällt, Kraft hält — Recomposition läuft."                      |
    | bodyweight ↓, strength ↓      | bad "Kraft sinkt" | "Gewicht fällt, aber auch die Kraft — Defizit und Regeneration prüfen." |
    | bodyweight flat/↑, strength ↑ | —                 | "Kraft steigt, Gewicht hält noch."                                      |
    | otherwise                     | —                 | "Noch kein klarer Trend — mehr Daten sammeln."                          |
    | no strength baseline yet      | —                 | "Der Kraft-Index startet nach 3 Einheiten je Übung."                    |

    Add en equivalents for all keys.

  - Render it under the legend in `RecompositionView` with `TrendBadge`.

- **Constraints:** read the numbers from the fixed-baseline series only (no new
  baseline logic). No `warn` badge tone (X-10 stays YAGNI).
- **Depends on:** WP-15.

#### O-04: Insight boxes: Strength + Body (Q1, P-05)

- **Files:** `src/features/analysis/components/StrengthProgressionView.tsx`,
  `src/features/analysis/components/BodyView.tsx`, `src/features/analysis/insights.ts`,
  `src/i18n/locales/de.ts`, `src/i18n/locales/en.ts`.
- **Change:**
  - Strength: the swap hint becomes `<Insight>` with no badge.
  - Body weight: `<Insight badge={TrendBadge(changeSinceStart)}>` with "Tageswerte
    schwanken — der Trend zählt, nicht der einzelne Tag."
  - Body comparison: `<Insight badge={TrendBadge("Taille −X")}>` with "Taille runter,
    Brust & Bizeps halten — Fett verlieren, Muskel halten." This needs O-01's
    `changeSinceStart`. If O-01 is declined, add that field here.
- **Depends on:** O-03 (and O-01).

#### O-05: Dashboard recomposition preview (Q4, D-03)

- **Files:** `src/features/analysis/components/RecompositionPreview.tsx` (new),
  `src/features/analysis/components/RecompositionChart.tsx`,
  `src/features/analysis/components/DashboardView.tsx`,
  `src/components/ui/overline.tsx`, `src/i18n/locales/de.ts`,
  `src/i18n/locales/en.ts`.
- **Change:**
  - `RecompositionChart` gains an optional `height` prop (default 280).
  - `Overline` gains `tone?: "subtle" | "primary"`. This preview is the prototype's
    one deliberate primary overline.
  - `RecompositionPreview` is a `Link` to `/progress/recomposition`, styled
    `block rounded-lg border border-border bg-surface px-4 pt-4 pb-2 shadow-card active:scale-99`.
    It contains:
    - a head row with the `Overline tone="primary"` "Recomposition" and a
      `text-caption text-muted-foreground` "Öffnen ›"
    - the thesis line `text-body`: "Kraft **+X %** · Gewicht **−Y %** über N Wochen",
      with the numbers coloured `text-recomp-strength` / `text-recomp-bodyweight`
      via `<Trans>`
    - the chart at `height={150}`
  - Place it between the stat grid and "Heute dran", and render nothing if there is
    no data. It needs `latestBodyweightIndex` from O-03; if O-03 is declined, add
    that field here.
- **Depends on:** WP-13 (and O-03).

#### O-06: Interactive stat cards (Q5, D-04)

- **Files:** `src/features/analysis/components/StatCard.tsx`,
  `src/features/analysis/components/DashboardView.tsx`.
- **Change:**
  - `StatCard` accepts either `to?: string` (renders a `Link`) or any button props
    via `asChild`-style composition (`Slot` from `radix-ui`, as `Button` does). Add
    `hover:border-border-strong active:scale-99 transition-transform`.
  - Wiring:
    - bodyweight card = the `MeasurementQuickAdd` trigger (`SheetTrigger asChild`)
    - waist → `/progress/body`
    - strength → `/progress/recomposition`
    - the calories card stays static
- **Constraints:** the whole card is the tap target (≥ 48px, trivially met). Keep
  focus-visible rings.
- **Depends on:** WP-11.

#### O-07: Log tab emphasis without glow (Q10, X-07)

- **Files:** `src/app/BottomTabBar.tsx`.
- **Change:** keep the four tabs. Render the Log icon inside
  `flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-elev-2`
  (the whole `NavLink` stays the ≥ 48px target; `shadow-elev-2` because the prototype's
  primary-coloured glow is forbidden, §3 C-5). The active state keeps the label
  `text-primary`.
- **Depends on:** —

#### O-08: Recomposition display smoothing (Q3, P-09)

- **Files:** `src/features/analysis/recomposition.ts`,
  `src/features/analysis/recomposition.test.ts`,
  `src/features/analysis/components/RecompositionChart.tsx`.
- **Change:** add `strengthDisplay` to each point: a trailing mean over the last 3
  strength-index points, computed after indexing. The baseline and
  `latestStrengthIndex` stay untouched, which is the display-only smoothing
  `docs/charts.md` explicitly permits. The chart plots `strengthDisplay` and the
  tooltip shows both. Add a test that the baseline is unchanged.
- **Depends on:** WP-17.

#### O-09: Bodyweight goal bar (Q8, D-05): APPROVED

Scoped to the minimum (YAGNI): store only the target. The start is DERIVED, not stored.

- **Data:** `src/data/settings.ts`: add an optional `targetWeight` (kg, positive number,
  Zod-validated on write, same precision rules as bodyweight measurements). It must
  round-trip through export/import via the existing settings backup block. Add
  tests in `settings.test.ts` / `backup.test.ts`. No Dexie schema bump unless the settings
  storage actually requires one; if it does, follow `docs/data-model.md`.
- **Start weight:** the FIRST bodyweight measurement (by `measuredAt`). Current = the latest.
  Progress = `(start − current) / (start − target)`, clamped to 0–1. Hidden when there is no
  target, fewer than 1 bodyweight measurement, or `target >= start`.
- **Settings UI:** a "Ziel" (goal) row in `SettingsPage` / `src/features/settings/components`
  to set or clear the target, using the WP-04 Input (≥ 48px, `inputMode="decimal"`), saved
  through the settings repository, with all strings via `t()` (de + any other locale).
- **Dashboard:** a `goal` prop on the bodyweight `StatCard`: `.sc-goalbar` =
  `h-1.5 rounded-full bg-surface-2` with fill `bg-linear-to-r from-accent to-primary`
  (width = progress %), plus a mono caption row "Start X · Ziel Y kg" (prototype
  `screens.jsx` Dashboard stat card, `prototype.css` `.sc-goalbar`). Must fit at 320px.
- **Docs:** `docs/data-model.md` (settings field), `docs/screens.md` (settings row).
- **Depends on:** WP-04, WP-07, WP-11.

#### O-10: Rest timer (Q9, L-06): recommended to decline

If approved: a header chip (`rounded-md border border-border bg-surface-2 px-3 font-mono text-label font-semibold text-primary`,
≥ 48px as a button) that starts a 2:00 countdown on tap, with local `useState` plus
`setInterval`. **No vibration or sound**: `navigator.vibrate` is unsupported on iOS
Safari (cross-platform rule).

## 3. CONFLICT / OUT-OF-SCOPE

### True conflicts (the prototype breaks a rule; the rule wins)

| #   | Prototype does                                                                                                                                                                                         | Rule that wins                                                          | Treatment (where)                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-1 | Undersized controls: `.icon-btn` 40px, `.btn` 44px, `.stepper2` 44px, `.tc-go`/`.fab-ico` 46px, `.segmented2` about 34px, `.chip-pick`/`.tog` about 33px (part of X-01)                                | CLAUDE.md ≥ `--tap` 48px                                                | Every interactive control is 48px (`h-12`, `size-12`, `min-h-(--tap)`). Decorative items (set index 34px) keep the prototype size (WP-03, 08, 12)                                                                                                                                                                                                                                                                                                  |
| C-2 | Hard-coded values: `#16203a` gradient, `#06140d` text-on-success, `rgba(2,3,7,.6)` scrim, `color-mix(… 8%)` next card, `#f5544b55` danger border, `#20253a` hover, `#0c0f17ee` bars, 24px sheet radius | CLAUDE.md / design-system.md "use the tokens, never hard-code"          | New tokens `--surface-hero`, `--success-foreground`, `--scrim`, `--surface-primary` (WP-02). Alpha modifiers on existing tokens (`border-danger/33`). The existing `color-mix` hover pattern. Sheet radius = `--radius-xl` (20px, which the Design System's own sheet demo uses). The bar translucency is not adopted (not in the audit)                                                                                                           |
| C-3 | Bespoke px type sizes (X-06): 30, 32, 26, 20, 19, 17, 24, 22, 12.5, 12, 11.5, 11, 10.5, 10                                                                                                             | Token type scale only                                                   | Nearest token (tie → the one that fits 320 or keeps hierarchy): page h1 30→`text-h1` 28 · stat value 32→`text-h1` 28 · today name 26→`text-h2` 22 · picker name 20→`text-h2` · session/sheet title 19→`text-h3` 18 · exercise name 17→`text-h3` · hero input 24→`text-h2` 22 (17px below 288px container) · tile value 22→`text-h2` · 12–12.5→`text-caption` 13 · 10–11.5→`text-micro` 11. Overline tracking stays the token's 0.16em (documented) |
| C-4 | Bodyweight tab draws a raw connected line only (P-11)                                                                                                                                                  | charts.md: raw points + 7-day MA                                        | No action. The app is already compliant; do not "fix" it to match                                                                                                                                                                                                                                                                                                                                                                                  |
| C-5 | Log FAB uses a primary-coloured glow `box-shadow: 0 6px 18px -4px var(--primary)` (X-07)                                                                                                               | design-system.md "depth … never glow"                                   | If Q10 is approved (O-07), use `shadow-elev-2`, no glow                                                                                                                                                                                                                                                                                                                                                                                            |
| C-6 | Form text at 13–15px (Design System `.input` = `text-body` 15px; the slot editor's select/rep inputs follow suit)                                                                                      | CLAUDE.md cross-platform iOS: Safari zooms on focused fields under 16px | Text inputs/selects use `text-body-lg` (17px) (WP-04, WP-05)                                                                                                                                                                                                                                                                                                                                                                                       |
| C-7 | The Log screen replaces the shell with its own `.log-head` + inner `.log-body` scroller + persistent `.log-foot` finish bar                                                                            | CLAUDE.md app-shell: only `<main>` scrolls, no sticky/fixed chrome      | The session header is an in-flow element inside `<main>`, Save stays at the end of the list, no inner scroller (WP-14)                                                                                                                                                                                                                                                                                                                             |

**Not conflicts (re-classified):**

- **P-03** (stepped vs. monotone) is a design choice. `docs/charts.md`'s "expect
  stair-stepped lines" describes the data, not the interpolation (§4 Q2, WP-17).
- **X-01, X-12, L-01, M-01, X-15** are **APP BUGs** (the app breaks a rule), not
  conflicts.
- **X-02, X-03** are APP BUGs against `design-system.md`'s token table (`--sheet`,
  `shadow-elev-3`), plus the undefined `font-heading` utility.
- **X-04** is a primitive that was never restyled: a design fix.
- **P-10** (indexed vs. raw cm) is allowed either way by `docs/charts.md`. No action.
- **X-07 (4 tabs vs. 3), L-13 (picker is a tab destination), P-12 (3 Progress tabs + a
  param drilldown)** are documented IA decisions (`docs/screens.md`, Phases 7/8). No
  action beyond Q10.

### Out of scope (later phases per `docs/implementation-plan.md`; not planned)

- **Calories data** on the Dashboard card (the prototype shows a placeholder too).
  Yazio sync is product **Phase 2**. Only the pill copy changes (D-22, WP-09).
- **Training-frequency heatmap** is product **Phase 3**. The prototype has none.
- **Prototype tweaks** (mood/surface/form variants), `Explorations.html` and design
  canvas are not product features.
- **Sparklines** (`Sparkline`, Design System stat-card demo): Phase 4 deferred them
  and the audit did not flag them. Not planned.

## 4. Open questions for the user

| Q   | Decision                                                                                                    | Recommendation                                                                                                                                                                                                                       | Unblocks             |
| --- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| Q1  | Adopt the prototype's **insight boxes** (a plain-language Trend takeaway under each chart)? (P-05)          | **Yes.** They carry the app's core thesis in words. Wording is rule-based from fixed-baseline numbers, not free text                                                                                                                 | O-03, O-04           |
| Q2  | **Stepped** strength lines (`stepAfter`) instead of smooth curves? (P-03)                                   | **Yes, for strength series only** (strength progression, drilldown line + band, recomposition strength). Bodyweight/measurement lines stay smooth                                                                                    | WP-17                |
| Q3  | Smooth the **Recomposition strength line** with a short display-only moving average? (P-09)                 | **Yes, trailing 3 points, display only** (`docs/charts.md` permits it). Decide after seeing WP-17's steps                                                                                                                            | O-08                 |
| Q4  | Add the **Dashboard recomposition preview** card (thesis line + mini chart)? (D-03)                         | **Yes.** It is the prototype's hero-screen answer to "am I on track?", and the chart already exists                                                                                                                                  | O-05                 |
| Q5  | Make **stat cards tappable** (bodyweight → quick-add sheet, waist → Body, strength → Recomposition)? (D-04) | **Yes.** Cheap, and it also gives the one-tap weight entry D-10 asks for                                                                                                                                                             | O-06                 |
| Q6  | Add **drilldown stat tiles** (Aktuell / seit Start / Einheiten)? (P-06)                                     | **Yes.** Small derived fields plus a reusable tile                                                                                                                                                                                   | O-02                 |
| Q7  | Add **per-measurement delta tiles** above the body comparison chart? (P-07)                                 | **Yes.** It is the at-a-glance readout `docs/charts.md`'s measurements section is built around                                                                                                                                       | O-01                 |
| Q8  | Add a **bodyweight goal** (start/target + progress bar)? (D-05)                                             | **Defer.** It needs a new setting (data + Settings UI + backup) outside Phase-1 scope                                                                                                                                                | O-09                 |
| Q9  | Add a **rest timer**? (L-06)                                                                                | **Decline for now.** A new feature, and no vibration or sound is possible on iOS Safari. The session header keeps a spacer slot for it                                                                                               | O-10                 |
| Q10 | **Emphasise the Log tab** (filled primary icon tile, no glow) while keeping four tabs? (X-07)               | **Yes, subtle.** It is the gym screen and deserves the primary cue                                                                                                                                                                   | O-07                 |
| Q11 | Replace the consolidated quick-add form with a **single-purpose weight sheet + custom keypad**? (D-10)      | **No keypad.** The native decimal keyboard (`inputMode="decimal"`) is faster and accessible on both platforms. Q5 already gives a one-tap bodyweight entry                                                                           | — (no WP)            |
| Q12 | **Line endings:** how should the CRLF working tree stop failing `npm run ci`'s format check (§1 step 3)?    | Add a `.gitattributes` with `* text=auto eol=lf` and re-checkout (`git add --renormalize .`), a one-off repo-config commit before WP-01. The alternative, `"endOfLine": "auto"` in `.prettierrc`, is quicker but hides mixed endings | all WPs (green `ci`) |

## 5. Coverage

Every consolidated audit ID (47) plus the planning-pass findings (N-01…N-05):

| ID   | Kind            | Covered by                                          |
| ---- | --------------- | --------------------------------------------------- |
| X-01 | APP BUG (+C-1)  | WP-03, WP-04 (residuals in WP-05, WP-16)            |
| X-02 | APP BUG         | WP-06                                               |
| X-03 | APP BUG         | WP-05                                               |
| X-04 | design          | WP-07 (+ `shadow-card` swaps in WP-12…16)           |
| X-05 | design          | WP-10                                               |
| X-06 | conflict (C-3)  | conflict: nearest-token mapping applied in WPs      |
| X-07 | question (+C-5) | question Q10 → O-07                                 |
| X-08 | design          | WP-08                                               |
| X-09 | design          | WP-03 (T-08), WP-12 (L-08)                          |
| X-10 | design          | no action (YAGNI: no caller needs a `warn` tone)    |
| X-11 | docs            | WP-02                                               |
| X-12 | APP BUG         | WP-11 (D-01/D-02), WP-14 (L-12)                     |
| X-13 | design          | WP-13 (D-07), WP-12 (L-03, L-07)                    |
| X-14 | design          | WP-11, WP-12 (L-10), WP-14 (picker), WP-15 (P-08)   |
| X-15 | APP BUG         | WP-01                                               |
| X-16 | design          | WP-09                                               |
| D-03 | question        | question Q4 → O-05                                  |
| D-04 | question        | question Q5 → O-06                                  |
| D-05 | question        | question Q8 → O-09 (defer)                          |
| D-06 | design          | WP-13                                               |
| D-08 | design          | WP-13                                               |
| D-10 | question        | question Q11 (no WP)                                |
| D-21 | —               | no action (no prototype reference)                  |
| D-22 | copy            | WP-09                                               |
| L-01 | APP BUG         | WP-12                                               |
| L-02 | design          | WP-12                                               |
| L-04 | design          | WP-09                                               |
| L-05 | design          | WP-14                                               |
| L-06 | question        | question Q9 → O-10 (decline)                        |
| L-09 | design          | WP-14                                               |
| L-13 | documented IA   | no action                                           |
| L-14 | design (flow)   | WP-14                                               |
| L-15 | copy            | WP-14                                               |
| P-03 | question        | question Q2 → WP-17                                 |
| P-04 | design (docs)   | WP-18                                               |
| P-05 | question        | question Q1 → O-03, O-04                            |
| P-06 | question        | question Q6 → O-02                                  |
| P-07 | question        | question Q7 → O-01                                  |
| P-09 | question        | question Q3 → O-08                                  |
| P-10 | —               | no action (charts.md allows either)                 |
| P-11 | conflict (C-4)  | conflict: no action, app already compliant          |
| P-12 | documented IA   | no action                                           |
| P-13 | copy            | no action (descriptive labels fit the scroll strip) |
| P-14 | design          | WP-15                                               |
| M-01 | APP BUG         | WP-05                                               |
| M-11 | design          | WP-16                                               |
| M-13 | design          | WP-03                                               |
| N-01 | APP BUG (i18n)  | WP-12: SetRow hard-coded aria-labels                |
| N-02 | APP BUG (i18n)  | WP-05, WP-06: "Close" in dialog/sheet               |
| N-03 | APP BUG (iOS)   | WP-05: 15px select/rep inputs trigger focus-zoom    |
| N-04 | design          | WP-15: Progress title duplicates its overline       |
| N-05 | APP BUG (a11y)  | WP-19: tab bar landmark labelled "Übersicht"        |
