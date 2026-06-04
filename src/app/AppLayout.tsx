import { Dumbbell, Settings } from "lucide-react"
import { useTranslation } from "react-i18next"
import { NavLink, Outlet } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { BottomTabBar } from "./BottomTabBar"

// App chrome shared by every route: a slim top bar (brand + settings) above the
// scrollable route outlet, with the bottom tab bar fixed below.
export function AppLayout() {
  const { t } = useTranslation()

  return (
    <div className="min-h-dvh bg-background">
      <header
        className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-sm"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <NavLink to="/" className="flex items-center gap-2" aria-label={t("nav.dashboard")}>
          <Dumbbell size={22} className="text-primary" aria-hidden="true" />
          <span className="font-display text-h3 font-semibold">Gym Tracker</span>
        </NavLink>
        <Button asChild variant="ghost" size="icon-lg" aria-label={t("nav.settings")}>
          <NavLink
            to="/settings"
            className={({ isActive }) => cn(isActive && "text-primary")}
          >
            <Settings aria-hidden="true" />
          </NavLink>
        </Button>
      </header>

      <main className="mx-auto w-full max-w-screen-sm px-4 pt-5 pb-[calc(var(--tap)+env(safe-area-inset-bottom)+1.5rem)]">
        <Outlet />
      </main>

      <BottomTabBar />
    </div>
  )
}
