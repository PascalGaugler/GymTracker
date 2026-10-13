import { Dumbbell, Settings } from "lucide-react"
import { useTranslation } from "react-i18next"
import { NavLink, Outlet } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { BottomTabBar } from "./BottomTabBar"

export function AppLayout() {
  const { t } = useTranslation()

  // Fixed-height flex column: only <main> scrolls; h-dvh so the mobile address bar never clips content.
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <header
        className="h-14 flex-none border-b border-border bg-background"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex h-full w-full max-w-screen-sm items-center justify-between px-4">
          <NavLink
            to="/"
            className="flex min-h-(--tap) min-w-0 items-center gap-2"
            aria-label={t("nav.dashboard")}
          >
            <Dumbbell size={22} className="shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate font-display text-h3 font-semibold">Gym Tracker</span>
          </NavLink>
          <Button asChild variant="ghost" size="icon" aria-label={t("nav.settings")}>
            <NavLink
              to="/settings"
              className={({ isActive }) => cn("shrink-0", isActive && "text-primary")}
            >
              <Settings aria-hidden="true" />
            </NavLink>
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-screen-sm px-4 pt-5 pb-8">
          <Outlet />
        </div>
      </main>

      <BottomTabBar />
    </div>
  )
}
