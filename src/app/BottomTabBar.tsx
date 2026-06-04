import type { ParseKeys } from "i18next"
import { Dumbbell, House, LineChart, SlidersHorizontal } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { NavLink } from "react-router-dom"

import { cn } from "@/lib/utils"

type TabItem = { to: string; labelKey: ParseKeys; icon: LucideIcon }

// Primary navigation. Settings is reached from the header, not a tab (screens.md).
const TABS: TabItem[] = [
  { to: "/", labelKey: "nav.dashboard", icon: House },
  { to: "/log", labelKey: "nav.log", icon: Dumbbell },
  { to: "/progress", labelKey: "nav.progress", icon: LineChart },
  { to: "/manage", labelKey: "nav.manage", icon: SlidersHorizontal },
]

export function BottomTabBar() {
  const { t } = useTranslation()

  return (
    <nav
      aria-label={t("nav.dashboard")}
      className="flex-none border-t border-border bg-surface"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-screen-sm grid-cols-4">
        {TABS.map(({ to, labelKey, icon: Icon }) => (
          <li key={to} className="min-w-0">
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex min-h-(--tap) w-full min-w-0 flex-col items-center justify-center gap-1 px-1 py-2 text-center text-caption font-medium transition-colors",
                  isActive ? "text-primary" : "text-subtle hover:text-foreground",
                )
              }
            >
              <Icon size={22} className="shrink-0" aria-hidden="true" />
              <span className="max-w-full truncate">{t(labelKey)}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
