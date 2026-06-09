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
    cards: {
      bodyweight: "Bodyweight",
      waist: "Waist",
      strength: "Strength index",
      calories: "Calories",
      noData: "No data yet",
      soon: "Soon",
      strengthBaseline: "vs. baseline (100)",
      caloriesSoon: "Yazio sync arrives in Phase 2",
    },
    ratePerWeek: "{{value}} {{unit}}/wk",
    sinceStart: "{{value}} since start",
    today: {
      title: "Up today",
      cta: "Start workout",
    },
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
  measurements: {
    quickAdd: "Add measurement",
    title: "Add measurement",
    description: "Enter what you measured — empty fields are skipped.",
    last: "Last {{value}} {{unit}}",
    save: "Save",
    saved: "Measurement saved",
    saveError: "Saving failed",
    types: {
      bodyweight: "Bodyweight",
      waist: "Waist",
      chest: "Chest",
      biceps: "Biceps",
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
    recomposition: {
      caption: "Strength index and bodyweight, both indexed to 100 at the start.",
      strengthSeries: "Strength index",
      bodyweightSeries: "Bodyweight",
      baseline: "Baseline = 100",
      empty: {
        title: "Nothing to show yet",
        body: "Log a few sessions and weigh in, and your recomposition trend will appear here.",
      },
    },
    strength: {
      caption: "Top set per exercise in this workout. Steps = double progression.",
      swapHint: "A swapped exercise starts as a new line — no bridge to the old one.",
      openExercise: "View {{name}} in detail",
      empty: {
        title: "No sessions yet",
        body: "Log this workout a few times and the trends will appear here.",
      },
      noPlan: {
        title: "No active plan",
        body: 'Create a plan with workouts under "Manage" to see progression.',
      },
    },
    exercise: {
      caption: "Top set (line) over the min–max range of the session's sets.",
      topSet: "Top set",
      range: "Range",
      empty: {
        title: "No drilldown data yet",
        body: "Once you've logged this exercise, its history will appear here.",
      },
    },
    body: {
      weight: {
        caption: "Raw weigh-ins (points) with a 7-day average (line) — the average shows the trend.",
        raw: "Weight",
        trend: "7-day average",
      },
      comparison: {
        caption: "Circumferences indexed to 100 at the start: waist (fat) down, chest/biceps (muscle) holding.",
        baseline: "Baseline = 100",
      },
      empty: {
        title: "No body data yet",
        body: "Log your bodyweight and a few circumferences, and your trend will appear here.",
      },
    },
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
    exercises: {
      search: "Search exercises",
      add: "Add exercise",
      count: "{{count}} exercise",
      count_other: "{{count}} exercises",
      empty: {
        title: "No exercises yet",
        body: "Create your first exercise to use it in workouts.",
      },
      noResults: 'No matches for "{{query}}"',
      newTitle: "New exercise",
      editTitle: "Edit exercise",
      newDescription: "Add an exercise to your catalog.",
      editDescription: "Adjust this exercise's name, equipment and unit.",
      fields: {
        name: "Name",
        namePlaceholder: "e.g. Bench press",
        type: "Equipment",
        unit: "Unit",
      },
      save: "Save",
      saved: "Exercise saved",
      saveError: "Saving failed",
      delete: "Delete",
      deleteConfirm: "Delete for real?",
      deleteWarning:
        "This exercise has {{count}} logged session. Deleting it permanently loses that history.",
      deleteWarning_other:
        "This exercise has {{count}} logged sessions. Deleting it permanently loses that history.",
      deleteAnyway: "Delete anyway",
      deleted: "Exercise deleted",
      deleteError: "Delete failed",
      types: {
        barbell: "Barbell",
        dumbbell: "Dumbbell",
        machine: "Machine",
        cable: "Cable",
        bodyweight: "Bodyweight",
      },
    },
  },
  settings: {
    title: "Settings",
    placeholder: "Backup, units and more settings arrive in a later phase.",
  },
  common: {
    comingSoon: "Coming in a later phase",
    back: "Back",
    phase2: "Phase 2",
  },
}

export default en
