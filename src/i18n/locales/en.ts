import type de from "./de"

// English (optional). Mirrors the German key structure exactly.
const en: typeof de = {
  nav: {
    dashboard: "Dashboard",
    log: "Log",
    progress: "Progress",
    manage: "Manage",
    settings: "Settings",
  },
  dashboard: {
    title: "On track?",
    placeholder: "Your key stats appear here once you've logged some data.",
    empty: {
      title: "Welcome",
      body: "Create your first plan to get started.",
      steps: {
        plan: "Create your first plan",
        exercises: "Add exercises",
        session: "Log your first session",
      },
    },
  },
  log: {
    title: "Log",
    pick: {
      title: "Choose a workout",
      subtitle: "Rotation · {{total}} workouts",
      hint: "Up next: {{name}}. Pick another if you're skipping or catching up.",
      next: "Up next",
    },
    rotation: "Rotation · {{n}} of {{total}}",
    summary: "{{exercises}} exercises · {{sets}} sets",
    setsRepRange: "{{sets}} sets · {{low}}–{{high}} reps",
    setsOnly: "{{sets}} sets",
    progress: "{{done}}/{{total}} sets",
    save: "Save session",
    saved: "Session saved",
    saveError: "Saving failed",
    empty: {
      title: "No active plan",
      body: 'Create a plan with workouts under "Manage" to start training.',
    },
  },
  progress: {
    title: "Progress",
    tabs: {
      recomposition: "Recomposition",
      strength: "Strength per workout",
      exercise: "Single exercise",
      body: "Body",
    },
    placeholder: "Charts appear once you've logged sessions and measurements.",
  },
  manage: {
    title: "Manage",
    tabs: {
      plans: "Plans",
      exercises: "Exercises",
    },
    placeholder: "Manage your plans, workouts and exercises here.",
    empty: {
      title: "Nothing here yet",
      body: "Create your first plan and add exercises.",
    },
  },
  settings: {
    title: "Settings",
    placeholder: "Backup, units and more settings arrive in a later phase.",
  },
  common: {
    comingSoon: "Coming in a later phase",
    back: "Back",
  },
}

export default en
