import type { ReactNode } from "react"
import { I18nextProvider } from "react-i18next"

import { Toaster } from "@/components/ui/sonner"
import { SelectedDayProvider } from "@/features/day/SelectedDayContext"
import i18n from "@/i18n"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <SelectedDayProvider>{children}</SelectedDayProvider>
      <Toaster theme="dark" position="top-center" />
    </I18nextProvider>
  )
}
