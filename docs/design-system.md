# Design System

The durable visual contract: **dark-only**, cool-slate surfaces, one electric-blue
primary, violet support, charts as the main event. Mobile-first, 48px touch targets.

**Use the tokens — never hard-code a color, size, font, radius, or shadow.** The tokens
live in `src/index.css` (the single source of truth the app consumes) and are mirrored as
Tailwind utilities via `@theme inline`. The visual reference is
`design-reference/Design System.html` + `tokens.css` (reference only — never imported).

There is no light theme. Tokens sit on `:root`; `<html>` carries `class="dark"` so any
shadcn `dark:` variants resolve.

## How tokens map to utilities

`@theme inline` exposes every token as a Tailwind utility:

- Colors → `bg-*`, `text-*`, `border-*`, `ring-*` (e.g. `bg-surface-2`, `text-subtle`,
  `border-border-strong`, `text-success`).
- Type families → `font-sans`, `font-display`, `font-mono`.
- Type scale → `text-display-xl`, `text-h1`, `text-body`, `text-micro`, … (line-height,
  tracking, and weight bake in where the spec defines them).
- Radii → `rounded-sm|md|lg|xl|full`.
- Elevation → `shadow-elev-1|2|3`, `shadow-inset-hi`.

Raw CSS variables (`var(--…)`) remain available for the cases utilities don't cover
(`--primary-soft` focus rings, `--grid`, `--dur`, `--tap`).

## Color

Layered cool-slate darkness; color is reserved for meaning and data.

### Surfaces (base → raised)

| Token | Hex | Use |
|---|---|---|
| `--background` | `#0a0c12` | App base — cool near-black slate |
| `--surface` / `--card` | `#11141d` | Card / raised surface |
| `--surface-2` / `--muted` | `#181c28` | Higher raise: inputs, hover rows |
| `--surface-3` | `#20253480` | Translucent overlays / progress tracks |
| `--popover` | `#141823` | Menus, dropdowns |
| `--sheet` | `#12161f` | Bottom sheets / dialogs |
| `--input` | `#1b2030` | Input fill |

### Foreground (text levels)

| Token | Hex | Use |
|---|---|---|
| `--foreground` | `#f3f5fa` | Primary text |
| `--muted-foreground` | `#9aa3b6` | Secondary text / labels |
| `--subtle` | `#69707f` | Tertiary / placeholders / hints |
| `--disabled` | `#454b58` | Disabled |

### Borders & lines

| Token | Hex | Use |
|---|---|---|
| `--border` | `#232936` | Default hairline |
| `--border-strong` | `#333a4b` | Emphasised / focus-adjacent |
| `--grid` | `#1a1f2c` | Chart gridlines (horizontal only) |

### Primary (electric blue) & accent (violet)

| Token | Hex | Use |
|---|---|---|
| `--primary` / `--ring` | `#3b82f6` | Primary action, focus ring |
| `--primary-hover` | `#5a97f8` | Hover |
| `--primary-pressed` | `#2f6fe0` | Active |
| `--primary-foreground` | `#06101f` | Dark text on blue (reads crisp) |
| `--primary-soft` | `#3b82f626` | ~15% tint: focus glow, soft fills |
| `--accent` | `#8b5cf6` | Violet support / accent buttons |
| `--accent-hover` | `#9d74f8` | Hover |
| `--accent-foreground` | `#0b0716` | Dark text on violet |
| `--accent-soft` | `#8b5cf626` | Tinted fill |

> **Note on `--accent`.** Per the design handoff, shadcn's `--accent`/`--accent-foreground`
> map to the **brand violet**, so `bg-accent` is a violet accent surface (matching the
> prototype's accent button). This differs from stock shadcn, where `--accent` is a subtle
> neutral hover. For subtle/secondary hovers use `--secondary` (`#181c28`, = `surface-2`).

### Semantic

Each ships with a `-soft` tinted-fill companion (≈13% alpha) for badges/backgrounds.

| Token | Hex | Soft |
|---|---|---|
| `--success` | `#34d399` | `--success-soft` `#34d39922` |
| `--warning` | `#fbbf24` | `--warning-soft` `#fbbf2422` |
| `--danger` / `--destructive` | `#f5544b` | `--danger-soft` `#f5544b22` |

Trend direction is **context-aware**: bodyweight ▼ is success, not danger.

## Chart palette

Six categorical series, each pairing a hue with a non-color cue (dash + marker) so charts
stay legible on slate and under common color-vision deficiencies. Implementation lives in
`docs/charts.md`; these are the colors.

| Token | Hex | Cue |
|---|---|---|
| `--chart-1` | `#3b82f6` blue | solid · circle |
| `--chart-2` | `#8b5cf6` violet | dashed · square |
| `--chart-3` | `#2dd4bf` teal | dotted · triangle |
| `--chart-4` | `#fbbf24` amber | dash-dot · diamond |
| `--chart-5` | `#f472b6` pink | long-dash · cross |
| `--chart-6` | `#a3e635` lime | thin · star |

**Recomposition pair** (defined explicitly, not borrowed from the categorical scale):

| Token | Hex | Story |
|---|---|---|
| `--recomp-strength` | `#3b82f6` blue, solid | holds / rises |
| `--recomp-bodyweight` | `#8b5cf6` violet, dashed | trends down |

Both indexed to **100** at baseline on one shared axis — never dual y-axes.

## Typography

**Space Grotesk** carries the sporty geometric tone (display, headings, UI; weights
400/500/600/700). **JetBrains Mono** renders every number — tabular, aligned,
instrument-like. Apply `.tnum` (or `font-mono`) to numeric readouts for tabular figures.

| Style | Utility | Size | Weight | Tracking | Use |
|---|---|---|---|---|---|
| Display XL | `text-display-xl` | 48px | 700 | −2% | Hero stat |
| Display | `text-display` | 36px | 700 | −1% | Big stat value |
| Heading 1 | `text-h1` | 28px | 700 | −1% | Screen titles |
| Heading 2 | `text-h2` | 22px | 600 | — | Section titles |
| Heading 3 | `text-h3` | 18px | 600 | — | Card / group titles |
| Body large | `text-body-lg` | 17px | 400 | — | Lead text |
| Body | `text-body` | 15px | 400 | — | Default text |
| Label | `text-label` | 14px | 500 | — | Controls, list rows |
| Caption | `text-caption` | 13px | 400–500 | — | Muted secondary detail |
| Overline / micro | `text-micro` | 11px | — | +16% | Uppercase mono overline |

## Spacing · radii · elevation

**Spacing** uses a 4px base grid — this matches Tailwind's default scale exactly, so use
`p-1`=4px, `p-2`=8px, `p-3`=12px, `p-4`=16px, `p-6`=24px, `p-8`=32px, `p-12`=48px, etc.
No custom spacing tokens are needed.

**Radii** are balanced; base (`--radius`) = `md`.

| Utility | Value |
|---|---|
| `rounded-sm` | 6px |
| `rounded-md` | 10px |
| `rounded-lg` | 14px |
| `rounded-xl` | 20px |
| `rounded-full` | 9999px |

**Elevation** — depth comes from hairline borders + soft shadows, **never glow**.

| Utility | Value | Use |
|---|---|---|
| `shadow-elev-1` | `0 1px 2px /.45` | Resting cards |
| `shadow-elev-2` | `0 6px 18px -4px /.55` | Popovers, menus |
| `shadow-elev-3` | `0 18px 44px -8px /.65` | Sheets, dialogs |
| `shadow-inset-hi` | `inset 0 1px 0 rgba(255,255,255,.04)` | Top highlight on raised cards |

## Motion & touch

- `--ease-standard` (`ease-standard` utility) = `cubic-bezier(.4,0,.2,1)`.
- Durations: `--dur-fast` 0.14s · `--dur` 0.22s · `--dur-slow` 0.4s.
- Minimum touch target `--tap` = 48px (= `h-12`); the whole control is the target.

## Notes & follow-ups

- **Fonts are loaded via Google Fonts `@import`**, mirroring the reference. This does not
  work offline — before the PWA ships, self-host Space Grotesk + JetBrains Mono via
  `@fontsource` packages and drop the remote import.
- Custom hero surfaces (per-set weight input, stat card) and charts are built by hand from
  these tokens — see `docs/charts.md` and the component notes in the HTML reference. This
  doc covers tokens only; no prototype screens are ported.
