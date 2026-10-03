import { useTranslation } from "react-i18next"
import { NavLink, Outlet } from "react-router-dom"

import {
  SegmentedScroller,
  segmentedItemVariants,
  segmentedListVariants,
} from "@/components/ui/segmented"

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
    <SegmentedScroller className="mb-5">
      <div className={segmentedListVariants()}>
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) => segmentedItemVariants({ active: isActive })}
          >
            {t(tab.key)}
          </NavLink>
        ))}
      </div>
    </SegmentedScroller>
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
