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
    placeholder: "Deine Kennzahlen erscheinen hier, sobald du Daten erfasst hast.",
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
  },
}

export default de
