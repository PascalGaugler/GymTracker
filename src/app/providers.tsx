import type { ReactNode } from "react"
import { I18nextProvider } from "react-i18next"

import { Toaster } from "@/components/ui/sonner"
import i18n from "@/i18n"

// App-wide context providers. i18n initialises on import (de default); wrapping
// here keeps the instance explicit and ready for future global providers. The
// Toaster surfaces transient feedback (e.g. session saved).
export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      {children}
      <Toaster theme="dark" position="top-center" />
    </I18nextProvider>
  )
}
