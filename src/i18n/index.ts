import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import de from "./locales/de"
import en from "./locales/en"

// German is the default and fallback locale; English is optional. UI strings only
// — user data (exercise names, notes) is stored and shown verbatim, never translated.
export const defaultNS = "translation"

export const resources = {
  de: { translation: de },
  en: { translation: en },
} as const

void i18n.use(initReactI18next).init({
  resources,
  lng: "de",
  fallbackLng: "de",
  defaultNS,
  interpolation: { escapeValue: false }, // React already escapes
})

export default i18n
