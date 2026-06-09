import { createBrowserRouter, Navigate } from "react-router-dom"

import { RecompositionView } from "@/features/analysis/components/RecompositionView"
import { StrengthProgressionView } from "@/features/analysis/components/StrengthProgressionView"
import { DashboardPage } from "@/pages/DashboardPage"
import { LogPage } from "@/pages/LogPage"
import { ManagePage } from "@/pages/ManagePage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { ProgressComingSoon, ProgressPage } from "@/pages/ProgressPage"
import { SettingsPage } from "@/pages/SettingsPage"

import { AppLayout } from "./AppLayout"

// Route scaffolding per docs/screens.md. Nested Progress/Manage views resolve to
// section placeholders for now; their real content lands in later phases.
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },

      { path: "log", element: <LogPage /> },
      { path: "log/:sessionId", element: <LogPage /> },

      {
        path: "progress",
        element: <ProgressPage />,
        children: [
          { index: true, element: <Navigate to="/progress/recomposition" replace /> },
          { path: "recomposition", element: <RecompositionView /> },
          { path: "strength", element: <StrengthProgressionView /> },
          { path: "exercise/:exerciseId", element: <ProgressComingSoon /> },
          { path: "body", element: <ProgressComingSoon /> },
        ],
      },

      { path: "manage", element: <Navigate to="/manage/plans" replace /> },
      { path: "manage/plans", element: <ManagePage /> },
      { path: "manage/plans/:planId", element: <ManagePage /> },
      { path: "manage/plans/:planId/workouts/:workoutId", element: <ManagePage /> },
      { path: "manage/exercises", element: <ManagePage /> },
      { path: "manage/exercises/:exerciseId", element: <ManagePage /> },

      { path: "settings", element: <SettingsPage /> },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
])
