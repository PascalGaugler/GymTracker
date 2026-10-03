import { describe, expect, it } from "vitest"

import { cn } from "./utils"

// cn() = tailwind-merge + clsx. Our custom type scale (text-display, …,
// text-micro) and shadow scale (shadow-elev-1, …, shadow-inset-hi) are
// defined in src/index.css's @theme block, but plain tailwind-merge doesn't
// know about them: it reads `text-display` as a text *colour* utility (so it
// collides with `text-disabled`/`text-muted-foreground`) and `shadow-elev-1`
// as a shadow *colour* (so it never collides with another shadow size like
// `shadow-card`). Both bugs silently drop a class. These tests prove the
// extendTailwindMerge config in utils.ts fixes both.
describe("cn", () => {
  it("keeps a custom type-scale class alongside an unrelated text-colour class", () => {
    expect(cn("text-caption", "text-muted-foreground")).toBe("text-caption text-muted-foreground")
  })

  it("still merges two classes that are genuinely in the same size scale", () => {
    expect(cn("text-sm", "text-body-lg")).toBe("text-body-lg")
  })

  it("keeps a custom type-scale class through a conditional merge with a colour class", () => {
    const condition = false
    expect(cn("text-display", condition && "x", "text-disabled")).toBe("text-display text-disabled")
  })

  it("lets a later shadow-scale class win over an earlier one", () => {
    expect(cn("shadow-elev-1", "shadow-inset-hi")).toBe("shadow-inset-hi")
  })

  it("lets shadow-card replace a resting shadow-elev class", () => {
    expect(cn("shadow-elev-1", "shadow-card")).toBe("shadow-card")
  })

  it("keeps a custom type-scale class when combined with weight and a colour override", () => {
    expect(cn("text-caption font-medium", "text-foreground")).toBe(
      "text-caption font-medium text-foreground",
    )
  })

  it("keeps a custom type-scale class alongside a colour class even with Tailwind's own color util in between", () => {
    // Regression for StatCard.tsx: text-display must survive next to text-disabled.
    expect(cn("mt-2 font-mono text-display font-semibold tabular-nums", "text-disabled")).toBe(
      "mt-2 font-mono text-display font-semibold tabular-nums text-disabled",
    )
  })
})
