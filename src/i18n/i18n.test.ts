import { describe, expect, it } from "vitest"

import i18n from "./index"

describe("i18n", () => {
  it("defaults to German", () => {
    expect(i18n.language).toBe("de")
    expect(i18n.options.fallbackLng).toContain("de")
  })

  it("resolves keys for the default locale", () => {
    expect(i18n.t("nav.dashboard")).toBe("Übersicht")
    expect(i18n.t("nav.settings")).toBe("Einstellungen")
  })

  it("has matching keys across locales", () => {
    i18n.changeLanguage("en")
    expect(i18n.t("nav.dashboard")).toBe("Dashboard")
    i18n.changeLanguage("de")
    expect(i18n.t("nav.dashboard")).toBe("Übersicht")
  })
})
