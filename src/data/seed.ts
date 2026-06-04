import { db } from "./db"
import {
  ExerciseSchema,
  TrainingPlanSchema,
  WorkoutSchema,
  type Exercise,
  type ExerciseType,
  type TrainingPlan,
  type WeightUnit,
  type Workout,
} from "./schema"

// First-run template: a Push/Pull/Legs plan with its workouts and a catalog of
// exercises — structure only, no sessions or measurements. Names are stored
// verbatim (mixed German/English is expected) and never translated. Contains no
// personal performance data, so it is safe to ship in a public repo.

type CatalogEntry = { name: string; type: ExerciseType; unit: WeightUnit }
type SeedSlot = { exercise: string; targetSets: number; repRange: [number, number] }
type SeedWorkout = { name: string; slots: SeedSlot[] }

const CATALOG: CatalogEntry[] = [
  // Push
  { name: "Bankdrücken", type: "barbell", unit: "kg" },
  { name: "Schrägbankdrücken Kurzhantel", type: "dumbbell", unit: "kg" },
  { name: "Schulterdrücken Kurzhantel", type: "dumbbell", unit: "kg" },
  { name: "Seitheben", type: "dumbbell", unit: "kg" },
  { name: "Trizeps Pushdown", type: "cable", unit: "kg" },
  { name: "Overhead Trizeps Extensions", type: "cable", unit: "kg" },
  // Pull
  { name: "Klimmzüge", type: "bodyweight", unit: "kg" },
  { name: "Langhantelrudern", type: "barbell", unit: "kg" },
  { name: "Latzug", type: "cable", unit: "kg" },
  { name: "Face Pulls", type: "cable", unit: "kg" },
  { name: "Bizeps Curls Kurzhantel", type: "dumbbell", unit: "kg" },
  { name: "Hammer Curls", type: "dumbbell", unit: "kg" },
  // Legs
  { name: "Kniebeugen", type: "barbell", unit: "kg" },
  { name: "Beinpresse", type: "machine", unit: "kg" },
  { name: "Rumänisches Kreuzheben", type: "barbell", unit: "kg" },
  { name: "Beinbeuger", type: "machine", unit: "kg" },
  { name: "Wadenheben", type: "machine", unit: "kg" },
]

const WORKOUTS: SeedWorkout[] = [
  {
    name: "Push",
    slots: [
      { exercise: "Bankdrücken", targetSets: 3, repRange: [6, 8] },
      { exercise: "Schrägbankdrücken Kurzhantel", targetSets: 3, repRange: [8, 10] },
      { exercise: "Schulterdrücken Kurzhantel", targetSets: 3, repRange: [8, 10] },
      { exercise: "Seitheben", targetSets: 3, repRange: [12, 15] },
      { exercise: "Trizeps Pushdown", targetSets: 3, repRange: [10, 12] },
      { exercise: "Overhead Trizeps Extensions", targetSets: 3, repRange: [10, 12] },
    ],
  },
  {
    name: "Pull",
    slots: [
      { exercise: "Klimmzüge", targetSets: 3, repRange: [6, 10] },
      { exercise: "Langhantelrudern", targetSets: 3, repRange: [8, 10] },
      { exercise: "Latzug", targetSets: 3, repRange: [10, 12] },
      { exercise: "Face Pulls", targetSets: 3, repRange: [15, 20] },
      { exercise: "Bizeps Curls Kurzhantel", targetSets: 3, repRange: [10, 12] },
      { exercise: "Hammer Curls", targetSets: 3, repRange: [10, 12] },
    ],
  },
  {
    name: "Legs",
    slots: [
      { exercise: "Kniebeugen", targetSets: 3, repRange: [6, 8] },
      { exercise: "Beinpresse", targetSets: 3, repRange: [10, 12] },
      { exercise: "Rumänisches Kreuzheben", targetSets: 3, repRange: [8, 10] },
      { exercise: "Beinbeuger", targetSets: 3, repRange: [10, 12] },
      { exercise: "Wadenheben", targetSets: 4, repRange: [12, 15] },
    ],
  },
]

function buildSeed(): { exercises: Exercise[]; plan: TrainingPlan; workouts: Workout[] } {
  const now = new Date()

  const exercises: Exercise[] = CATALOG.map((entry) =>
    ExerciseSchema.parse({
      id: crypto.randomUUID(),
      name: entry.name,
      type: entry.type,
      unit: entry.unit,
      createdAt: now,
    }),
  )
  const idByName = new Map(exercises.map((e) => [e.name, e.id]))

  const plan: TrainingPlan = TrainingPlanSchema.parse({
    id: crypto.randomUUID(),
    name: "Push / Pull / Legs",
    isActive: true,
    createdAt: now,
  })

  const workouts: Workout[] = WORKOUTS.map((w, wIndex) =>
    WorkoutSchema.parse({
      id: crypto.randomUUID(),
      planId: plan.id,
      name: w.name,
      order: wIndex,
      exercises: w.slots.map((slot, sIndex) => {
        const exerciseId = idByName.get(slot.exercise)
        if (!exerciseId) throw new Error(`Seed references unknown exercise: ${slot.exercise}`)
        return {
          id: crypto.randomUUID(),
          exerciseId,
          targetSets: slot.targetSets,
          repRange: slot.repRange,
          order: sIndex,
          alternativeIds: [],
        }
      }),
    }),
  )

  return { exercises, plan, workouts }
}

/**
 * Seeds the PPL template, but only when the database is empty. Returns true if a
 * seed was written, false if existing data was found and seeding was skipped.
 */
export async function seedIfEmpty(): Promise<boolean> {
  const isEmpty =
    (await db.exercises.count()) === 0 &&
    (await db.trainingPlans.count()) === 0 &&
    (await db.workouts.count()) === 0
  if (!isEmpty) return false

  const { exercises, plan, workouts } = buildSeed()
  await db.transaction("rw", db.exercises, db.trainingPlans, db.workouts, async () => {
    await db.exercises.bulkPut(exercises)
    await db.trainingPlans.put(plan)
    await db.workouts.bulkPut(workouts)
  })
  return true
}
