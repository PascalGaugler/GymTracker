import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import de from "./locales/de"
import en from "./locales/en"

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
  interpolation: { escapeValue: false },
})

export default i18n
