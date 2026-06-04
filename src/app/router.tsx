import { createBrowserRouter, Navigate } from "react-router-dom"

import { DashboardPage } from "@/pages/DashboardPage"
import { LogPage } from "@/pages/LogPage"
import { ManagePage } from "@/pages/ManagePage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { ProgressPage } from "@/pages/ProgressPage"
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

      { path: "progress", element: <Navigate to="/progress/recomposition" replace /> },
      { path: "progress/recomposition", element: <ProgressPage /> },
      { path: "progress/strength", element: <ProgressPage /> },
      { path: "progress/exercise/:exerciseId", element: <ProgressPage /> },
      { path: "progress/body", element: <ProgressPage /> },

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
