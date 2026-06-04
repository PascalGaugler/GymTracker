import type { defaultNS, resources } from "./index"

// Makes t() keys type-safe against the German resource shape.
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS
    resources: (typeof resources)["de"]
  }
}
