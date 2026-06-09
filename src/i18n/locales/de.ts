// German (default locale). User data (exercise names, notes) is never translated.
const de = {
  nav: {
    dashboard: "Übersicht",
    log: "Trainieren",
    progress: "Fortschritt",
    manage: "Verwalten",
    settings: "Einstellungen",
  },
  dashboard: {
    title: "Auf Kurs?",
    cards: {
      bodyweight: "Körpergewicht",
      waist: "Taille",
      strength: "Kraft-Index",
      calories: "Kalorien",
      noData: "Noch keine Daten",
      soon: "Bald",
      strengthBaseline: "ggü. Start (100)",
      caloriesSoon: "Yazio-Sync folgt in Phase 2",
    },
    ratePerWeek: "{{value}} {{unit}}/Wo",
    sinceStart: "{{value}} seit Start",
    today: {
      title: "Heute dran",
      cta: "Workout starten",
    },
    empty: {
      title: "Willkommen",
      body: "Lege deinen ersten Plan an, um loszulegen.",
      steps: {
        plan: "Ersten Plan erstellen",
        exercises: "Übungen hinzufügen",
        session: "Erstes Training loggen",
      },
    },
  },
  log: {
    title: "Trainieren",
    pick: {
      title: "Workout wählen",
      subtitle: "Rotation · {{total}} Workouts",
      hint: "Als Nächstes dran: {{name}}. Wähle ein anderes, falls du eine Einheit überspringst oder nachholst.",
      next: "Als Nächstes",
    },
    rotation: "Rotation · {{n}} von {{total}}",
    summary: "{{exercises}} Übungen · {{sets}} Sätze",
    setsRepRange: "{{sets}} Sätze · {{low}}–{{high}} Whlg.",
    setsOnly: "{{sets}} Sätze",
    progress: "{{done}}/{{total}} Sätze",
    save: "Training speichern",
    saved: "Training gespeichert",
    saveError: "Speichern fehlgeschlagen",
    empty: {
      title: "Kein aktiver Plan",
      body: "Lege unter „Verwalten“ einen Plan mit Workouts an, um zu trainieren.",
    },
  },
  measurements: {
    quickAdd: "Messung erfassen",
    title: "Messung erfassen",
    description: "Trag ein, was du gemessen hast — leere Felder werden übersprungen.",
    last: "Zuletzt {{value}} {{unit}}",
    save: "Speichern",
    saved: "Messung gespeichert",
    saveError: "Speichern fehlgeschlagen",
    types: {
      bodyweight: "Körpergewicht",
      waist: "Taille",
      chest: "Brust",
      biceps: "Bizeps",
    },
  },
  progress: {
    title: "Fortschritt",
    tabs: {
      recomposition: "Recomposition",
      strength: "Kraft je Workout",
      exercise: "Einzelübung",
      body: "Körpermaße",
    },
    placeholder: "Diagramme erscheinen, sobald du Trainings und Messungen erfasst hast.",
    recomposition: {
      caption: "Kraft-Index und Körpergewicht, beide auf 100 zum Start indexiert.",
      strengthSeries: "Kraft-Index",
      bodyweightSeries: "Körpergewicht",
      baseline: "Start = 100",
      empty: {
        title: "Noch nichts zu zeigen",
        body: "Logge ein paar Trainings und wieg dich, dann erscheint hier dein Recomposition-Verlauf.",
      },
    },
    strength: {
      caption: "Top-Satz je Übung in diesem Workout. Stufen = doppelte Progression.",
      swapHint: "Getauschte Übung startet als neue Linie — ohne Brücke zur alten.",
      openExercise: "{{name}} im Detail ansehen",
      empty: {
        title: "Noch keine Trainings",
        body: "Logge dieses Workout ein paar Mal, dann erscheinen hier die Verläufe.",
      },
      noPlan: {
        title: "Kein aktiver Plan",
        body: "Lege unter „Verwalten“ einen Plan mit Workouts an, um Verläufe zu sehen.",
      },
    },
    exercise: {
      caption: "Top-Satz (Linie) über dem Min–Max-Bereich der Sätze je Einheit.",
      topSet: "Top-Satz",
      range: "Bereich",
      empty: {
        title: "Noch keine Einzeldaten",
        body: "Sobald du diese Übung geloggt hast, erscheint hier ihr Verlauf.",
      },
    },
  },
  manage: {
    title: "Verwalten",
    tabs: {
      plans: "Pläne",
      exercises: "Übungen",
    },
    placeholder: "Verwalte hier deine Pläne, Workouts und Übungen.",
    empty: {
      title: "Noch nichts angelegt",
      body: "Erstelle deinen ersten Plan und füge Übungen hinzu.",
    },
  },
  settings: {
    title: "Einstellungen",
    placeholder: "Backup, Einheiten und weitere Einstellungen folgen in einer späteren Phase.",
  },
  common: {
    comingSoon: "Kommt in einer späteren Phase",
    back: "Zurück",
    phase2: "Phase 2",
  },
}

export default de
