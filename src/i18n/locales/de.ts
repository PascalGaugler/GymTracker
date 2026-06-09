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
    body: {
      weight: {
        caption: "Rohwerte (Punkte) mit 7-Tage-Schnitt (Linie) — der Schnitt zeigt den Trend.",
        raw: "Gewicht",
        trend: "7-Tage-Schnitt",
      },
      comparison: {
        caption: "Umfänge auf 100 zum Start indexiert: Taille (Fett) runter, Brust/Bizeps (Muskel) halten.",
        baseline: "Start = 100",
      },
      empty: {
        title: "Noch keine Körperdaten",
        body: "Erfasse dein Körpergewicht und ein paar Umfänge, dann erscheint hier dein Verlauf.",
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
    exercises: {
      search: "Übung suchen",
      add: "Übung hinzufügen",
      count: "{{count}} Übung",
      count_other: "{{count}} Übungen",
      empty: {
        title: "Noch keine Übungen",
        body: "Lege deine erste Übung an, um sie in Workouts zu verwenden.",
      },
      noResults: "Keine Treffer für „{{query}}“",
      newTitle: "Neue Übung",
      editTitle: "Übung bearbeiten",
      newDescription: "Lege eine Übung für deinen Katalog an.",
      editDescription: "Name, Gerät und Einheit dieser Übung anpassen.",
      fields: {
        name: "Name",
        namePlaceholder: "z. B. Bankdrücken",
        type: "Gerät",
        unit: "Einheit",
      },
      save: "Speichern",
      saved: "Übung gespeichert",
      saveError: "Speichern fehlgeschlagen",
      delete: "Löschen",
      deleteConfirm: "Wirklich löschen?",
      deleteWarning:
        "Diese Übung hat {{count}} geloggte Einheit. Beim Löschen geht ihr Verlauf unwiederbringlich verloren.",
      deleteWarning_other:
        "Diese Übung hat {{count}} geloggte Einheiten. Beim Löschen geht ihr Verlauf unwiederbringlich verloren.",
      deleteAnyway: "Trotzdem löschen",
      deleted: "Übung gelöscht",
      deleteError: "Löschen fehlgeschlagen",
      types: {
        barbell: "Langhantel",
        dumbbell: "Kurzhantel",
        machine: "Maschine",
        cable: "Kabel",
        bodyweight: "Körpergewicht",
      },
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
