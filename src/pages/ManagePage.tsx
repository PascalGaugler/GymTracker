import { useTranslation } from "react-i18next"
import { NavLink, Outlet } from "react-router-dom"

import { cn } from "@/lib/utils"

import { PageHeader } from "./PageHeader"

// Manage sub-views reached from the segmented control: the plan/workout editor
// and the exercise catalog.
const TABS = [
  { to: "/manage/plans", key: "manage.tabs.plans" },
  { to: "/manage/exercises", key: "manage.tabs.exercises" },
] as const

function ManageNav() {
  const { t } = useTranslation()

  return (
    <nav className="-mx-4 mb-5 overflow-x-auto px-4 scrollbar-none [&::-webkit-scrollbar]:hidden">
      <div className="inline-flex gap-1 rounded-lg bg-surface-2 p-1">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                "flex min-h-(--tap) items-center rounded-md px-4 text-caption font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "bg-surface text-foreground shadow-elev-1"
                  : "text-muted-foreground hover:text-foreground",
              )
            }
          >
            {t(tab.key)}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export function ManagePage() {
  const { t } = useTranslation()

  return (
    <>
      <PageHeader overline={t("nav.manage")} title={t("manage.title")} />
      <ManageNav />
      <Outlet />
    </>
  )
}
