# Data Model

## Overview

Five Dexie (IndexedDB) object stores. Two principles drive the whole design:

1. **Plan-as-template vs. self-contained logs.** A plan defines *structure* (which
   exercises, target sets, rep range). A logged session captures *reality* (date, the
   actual weight of each set). A session is **self-contained**: it never depends on the
   plan still existing in its original form. Editing or deleting a plan never alters past
   logs. The plan is only a convenience that makes logging fast.

2. **The exercise catalog is the hub.** Exercises are canonical records. Both plan slots
   and logged sets reference an exercise by `id`. This gives stable identity for charting
   and makes exercise swaps behave correctly (a logged set points at the catalog exercise,
   not at the mutable plan slot).

Stores: `trainingPlans`, `workouts`, `exercises`, `sessions`, `measurements`.

**Owned children are embedded, not separate stores.** A workout embeds its exercise slots;
a session embeds its sets. They have no lifecycle outside their parent and are always
loaded with it, so embedding is correct for a document store like IndexedDB.

## Schemas (`src/data/schema.ts`)

Zod is the single source of truth: it provides runtime validation and the inferred
TypeScript types (`z.infer`), so types and validation never drift.

```typescript
import { z } from 'zod';

// --- Enums ---
export const ExerciseType = z.enum(['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight']);
export const WeightUnit = z.enum(['kg', 'lb']);
export const MeasurementType = z.enum(['bodyweight', 'biceps', 'chest', 'waist']);
export const MeasurementUnit = z.enum(['kg', 'cm']);
export const MeasurementSource = z.enum(['manual', 'yazio']);

export type ExerciseType = z.infer<typeof ExerciseType>;
export type MeasurementType = z.infer<typeof MeasurementType>;
export type MeasurementSource = z.infer<typeof MeasurementSource>;

// --- Catalog exercise (the hub both plan and logs point at) ---
export const ExerciseSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  type: ExerciseType,
  unit: WeightUnit,
  createdAt: z.coerce.date(),
});
export type Exercise = z.infer<typeof ExerciseSchema>;

// --- A slot inside a workout (embedded) ---
export const WorkoutExerciseSchema = z.object({
  id: z.uuid(),
  exerciseId: z.uuid(),
  targetSets: z.number().int().positive(),
  repRange: z.tuple([z.number().int().positive(), z.number().int().positive()]).optional(), // display only
  order: z.number().int().nonnegative(),
  alternativeIds: z.array(z.uuid()).default([]),
});
export type WorkoutExercise = z.infer<typeof WorkoutExerciseSchema>;

// --- Workout (belongs to a plan, embeds its slots) ---
export const WorkoutSchema = z.object({
  id: z.uuid(),
  planId: z.uuid(),
  name: z.string().min(1),
  order: z.number().int().nonnegative(),
  exercises: z.array(WorkoutExerciseSchema).default([]),
});
export type Workout = z.infer<typeof WorkoutSchema>;

// --- Training plan ---
export const TrainingPlanSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
});
export type TrainingPlan = z.infer<typeof TrainingPlanSchema>;

// --- A logged set (embedded in a session) ---
export const LoggedSetSchema = z.object({
  id: z.uuid(),
  exerciseId: z.uuid(),            // points at the CATALOG exercise — survives plan edits
  setNumber: z.number().int().positive(),
  weight: z.number().nonnegative(),
  variation: z.string().optional(), // free-text, display only
});
export type LoggedSet = z.infer<typeof LoggedSetSchema>;

// --- A logged session (embeds its sets; self-contained) ---
export const WorkoutSessionSchema = z.object({
  id: z.uuid(),
  workoutId: z.uuid(),             // soft link: drives placeholders + rotation only
  date: z.coerce.date(),
  note: z.string().optional(),
  sets: z.array(LoggedSetSchema).default([]),
});
export type WorkoutSession = z.infer<typeof WorkoutSessionSchema>;

// --- Measurement: bodyweight + circumferences in one shape ---
export const MeasurementSchema = z.object({
  id: z.uuid(),
  type: MeasurementType,
  value: z.number().positive(),
  unit: MeasurementUnit,
  measuredAt: z.coerce.date(),
  source: MeasurementSource.default('manual'), // future-proofs the Yazio dedup
});
export type Measurement = z.infer<typeof MeasurementSchema>;
```

Notes:
- `z.uuid()` (Zod 4 top-level) validates RFC 9562/4122 UUIDs. `crypto.randomUUID()`
  produces compliant v4 UUIDs, so generated IDs pass.
- `z.coerce.date()` accepts a `Date` (runtime) or an ISO string (from an imported backup)
  and yields a `Date`, so export/import round-trips with no manual rehydration.
- Reps are intentionally not stored (user trains to a fixed rep target; see charts.md).
  Adding an optional `reps` field later is one line.

## Stores (`src/data/db.ts`)

```typescript
import Dexie, { type EntityTable } from 'dexie';
import type { TrainingPlan, Workout, Exercise, WorkoutSession, Measurement } from './schema';

const db = new Dexie('GymTracker') as Dexie & {
  trainingPlans: EntityTable<TrainingPlan, 'id'>;
  workouts: EntityTable<Workout, 'id'>;
  exercises: EntityTable<Exercise, 'id'>;
  sessions: EntityTable<WorkoutSession, 'id'>;
  measurements: EntityTable<Measurement, 'id'>;
};

db.version(1).stores({
  trainingPlans: 'id',
  workouts: 'id, planId, [planId+order]',
  exercises: 'id, name, type',
  sessions: 'id, date, [workoutId+date]',
  measurements: 'id, [type+measuredAt]',
});

export { db };
```

The schema string declares only the primary key and the indexes queried by — Dexie stores
the whole object regardless, so embedded `exercises[]` and `sets[]` are persisted without
being listed. Indexes map to real queries:
- `[planId+order]` — a plan's workouts, pre-sorted.
- `[workoutId+date]` — the most recent session of a workout (placeholders + rotation).
- `[type+measuredAt]` — one measurement type as an ordered time series.

**`isActive` is deliberately not indexed.** Booleans are not valid IndexedDB keys (only
number, string, Date, and arrays of those). With a handful of plans, filter `isActive` in
memory.

## Repositories (`src/data/repositories/`)

The data seam. Nothing outside `src/data/` imports Dexie. Interfaces give a testable
boundary (mock a repository without a real DB).

```typescript
// repositories/types.ts
import type { WorkoutSession, Measurement, MeasurementType } from '../schema';

export interface ExerciseDataPoint {
  date: Date; weight: number; setNumber: number; sessionId: string;
}

export interface SessionRepository {
  getByDate(date: Date): Promise<WorkoutSession[]>;
  getRecent(limit: number): Promise<WorkoutSession[]>;
  getLastForWorkout(workoutId: string): Promise<WorkoutSession | undefined>;
  getExerciseHistory(exerciseId: string): Promise<ExerciseDataPoint[]>;
  save(session: WorkoutSession): Promise<void>;
}

export interface MeasurementRepository {
  getByType(type: MeasurementType): Promise<Measurement[]>;
  getLatest(type: MeasurementType): Promise<Measurement | undefined>;
  add(input: Omit<Measurement, 'id'>): Promise<Measurement>;
}

// ExerciseRepository, PlanRepository, WorkoutRepository follow the same shape.
```

Representative implementation (the two non-obvious techniques: compound-index lookup and
in-memory flatten for charts):

```typescript
// repositories/dexie/sessionRepository.ts
import Dexie from 'dexie';
import { startOfDay, endOfDay } from 'date-fns';
import { db } from '../../db';
import { WorkoutSessionSchema } from '../../schema';
import type { SessionRepository, ExerciseDataPoint } from '../types';

export const sessionRepository: SessionRepository = {
  getByDate: (date) =>
    db.sessions.where('date').between(startOfDay(date), endOfDay(date), true, true).toArray(),

  getRecent: (limit) =>
    db.sessions.orderBy('date').reverse().limit(limit).toArray(),

  getLastForWorkout: (workoutId) =>
    db.sessions.where('[workoutId+date]')
      .between([workoutId, Dexie.minKey], [workoutId, Dexie.maxKey]).last(),

  async getExerciseHistory(exerciseId) {
    // Sets are embedded; at a few hundred sessions, load + flatten in memory.
    const sessions = await db.sessions.orderBy('date').toArray();
    return sessions.flatMap((s) =>
      s.sets.filter((set) => set.exerciseId === exerciseId).map((set): ExerciseDataPoint => ({
        date: s.date, weight: set.weight, setNumber: set.setNumber, sessionId: s.id,
      })),
    );
  },

  async save(session) {
    await db.sessions.put(WorkoutSessionSchema.parse(session)); // validate on write
  },
};
```

Reactivity: feature hooks wrap a repository call in `useLiveQuery`, which observes the
Dexie queries that run inside the method. So the UI auto-updates when data changes while
never seeing Dexie directly.

```typescript
// features/analysis/hooks/useExerciseHistory.ts
import { useLiveQuery } from 'dexie-react-hooks';
import { sessionRepository } from '../../../data/repositories/dexie/sessionRepository';

export const useExerciseHistory = (exerciseId: string) =>
  useLiveQuery(() => sessionRepository.getExerciseHistory(exerciseId), [exerciseId]);
```

## Principles

- **UUIDs, not auto-increment.** Client-generated before persistence (so the in-memory
  object graph has final IDs immediately), and globally unique so export/import and
  cross-references never collide or need remapping.
- **Validate on write and import only.** Reads from our own DB are trusted (perf).
- **Aggregation is presentation logic.** Repos return raw-ish data (e.g. per-set points);
  chart-level aggregation (top set, indexing) lives in the analysis feature.

## Seed (`src/data/seed.ts`)

Runs only when the DB is empty. Seeds the current Push/Pull/Legs plan, its workouts, and
their exercises with fresh UUIDs — **structure only, no sessions or measurements**. This
is the first-run experience (open the app, plan is ready) and a reasonable template for
anyone who clones the repo. A plan contains no personal performance data, so it is safe in
a public repo.

## Phase 2 additions (do not build yet)

- A **nutrition/intake entity** for Yazio calories (calories are not a `Measurement`).
- The `source` field is already on `Measurement` so manual vs. Yazio bodyweight can be
  deduped without a later migration.
