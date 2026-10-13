import { useTranslation } from "react-i18next"
import { NavLink, Outlet, useLocation } from "react-router-dom"

import { segmentedItemVariants, segmentedListVariants } from "@/components/ui/segmented"

import { PageHeader } from "./PageHeader"
import { Placeholder } from "./Placeholder"

// The drilldown has no segment of its own; it highlights "Kraft" via `alsoActiveFor`.
const TABS: readonly {
  to: string
  key:
    | "progress.tabs.short.recomposition"
    | "progress.tabs.short.strength"
    | "progress.tabs.short.body"
  alsoActiveFor?: string
}[] = [
  { to: "/progress/recomposition", key: "progress.tabs.short.recomposition" },
  {
    to: "/progress/strength",
    key: "progress.tabs.short.strength",
    alsoActiveFor: "/progress/exercise",
  },
  { to: "/progress/body", key: "progress.tabs.short.body" },
]

// NavLink sets aria-current only on the exact route; the drilldown gets just the visual highlight.
function ProgressNav() {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  return (
    <nav className="mb-5">
      <div className={segmentedListVariants({ layout: "fill" })}>
        {TABS.map((tab) => {
          const drilldown =
            tab.alsoActiveFor !== undefined && pathname.startsWith(tab.alsoActiveFor)
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) => segmentedItemVariants({ active: isActive || drilldown })}
            >
              {t(tab.key)}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

const VIEW_SEGMENTS = ["recomposition", "strength", "exercise", "body"] as const

function useViewTitle(): string {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const seg = pathname.split("/")[2]
  const view = VIEW_SEGMENTS.find((v) => v === seg)
  return view ? t(`progress.tabs.${view}`) : t("progress.title")
}

export function ProgressPage() {
  const { t } = useTranslation()
  const title = useViewTitle()

  return (
    <>
      <PageHeader overline={t("nav.progress")} title={title} />
      <ProgressNav />
      <Outlet />
    </>
  )
}

export function ProgressComingSoon() {
  const { t } = useTranslation()
  return <Placeholder>{t("progress.placeholder")}</Placeholder>
}
