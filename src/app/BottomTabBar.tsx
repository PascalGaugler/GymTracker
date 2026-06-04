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
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur-sm"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-screen-sm grid-cols-4">
        {TABS.map(({ to, labelKey, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex min-h-[var(--tap)] flex-col items-center justify-center gap-1 py-2 text-caption font-medium transition-colors",
                  isActive ? "text-primary" : "text-subtle hover:text-foreground",
                )
              }
            >
              <Icon size={22} aria-hidden="true" />
              <span>{t(labelKey)}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
