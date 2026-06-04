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

  // App-shell layout: the viewport is a fixed-height flex column where the header
  // and tab bar stay put (flex-none) and ONLY <main> scrolls. This keeps chrome
  // visible at every size and avoids the sticky/fixed-over-document-scroll
  // glitches (header/footer vanishing) on mobile browsers. h-dvh tracks the
  // dynamic viewport so the address bar showing/hiding never clips content.
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <header
        className="flex h-14 flex-none items-center justify-between border-b border-border bg-background px-4"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <NavLink
          to="/"
          className="flex min-w-0 items-center gap-2"
          aria-label={t("nav.dashboard")}
        >
          <Dumbbell size={22} className="shrink-0 text-primary" aria-hidden="true" />
          <span className="truncate font-display text-h3 font-semibold">Gym Tracker</span>
        </NavLink>
        <Button asChild variant="ghost" size="icon-lg" aria-label={t("nav.settings")}>
          <NavLink
            to="/settings"
            className={({ isActive }) => cn("shrink-0", isActive && "text-primary")}
          >
            <Settings aria-hidden="true" />
          </NavLink>
        </Button>
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
