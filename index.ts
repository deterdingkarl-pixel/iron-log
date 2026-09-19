/**
 * Zentrales Datenmodell der App.
 *
 * Entwurfsprinzip für spätere Cloud-Synchronisierung:
 * - Jede Entität hat eine stabile `id` (UUID) statt einer fortlaufenden Nummer,
 *   damit IDs clientseitig ohne Server-Roundtrip erzeugt werden können.
 * - `updatedAt` / `createdAt` (ISO-Strings) erlauben später einen
 *   Last-Write-Wins- oder Merge-Abgleich mit einem Server.
 * - Es gibt bewusst keine Fremdschlüssel-Constraints auf DB-Ebene (localStorage
 *   kennt keine), Referenzen laufen über IDs (z.B. `exerciseId`).
 * - Alles ist reines JSON – ideal für Export/Import und einen künftigen
 *   REST/Realtime-Sync-Layer.
 */

export type WeightUnit = 'kg' | 'lb';

export type MuscleGroup =
  | 'Brust'
  | 'Rücken'
  | 'Beine'
  | 'Schultern'
  | 'Bizeps'
  | 'Trizeps'
  | 'Bauch'
  | 'Ganzkörper'
  | 'Sonstiges';

export type ExerciseCategory =
  | 'Verbundübung'
  | 'Isolationsübung'
  | 'Körpergewicht'
  | 'Cardio'
  | 'Mobilität';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  category: ExerciseCategory;
  equipment: string;
  description?: string;
  executionNotes?: string;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Eine geplante Übung innerhalb eines Trainingsplans (Vorlage, keine echten Sätze). */
export interface PlanExercise {
  id: string;
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: number;
  targetWeight?: number;
  note?: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  type: string; // z.B. Push, Pull, Beine, Ganzkörper – frei wählbar
  exercises: PlanExercise[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Ein einzelner protokollierter Satz. */
export interface WorkoutSet {
  id: string;
  weight: number;
  reps: number;
  rpe?: number;
  note?: string;
}

/** Eine Übung innerhalb eines protokollierten Trainings, inkl. aller Sätze. */
export interface ExerciseLog {
  id: string;
  exerciseId: string;
  order: number;
  sets: WorkoutSet[];
  note?: string;
}

export interface Workout {
  id: string;
  date: string; // YYYY-MM-DD, damit Tagesvergleiche ohne Zeitzonen-Ärger funktionieren
  planId?: string;
  workoutType?: string;
  durationMinutes?: number;
  note?: string;
  exercises: ExerciseLog[];
  createdAt: string;
  updatedAt: string;
}

export interface BodyMetricEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight?: number;
  bodyFatPercent?: number;
  measurements?: Record<string, number>; // z.B. { Taille: 82, Brust: 102 }
}

export interface AppSettings {
  weightUnit: WeightUnit;
  theme: 'dark' | 'light';
}

export interface PersonalRecord {
  exerciseId: string;
  maxWeight: { value: number; workoutId: string; date: string };
  estOneRepMax: { value: number; workoutId: string; date: string };
  maxVolumeSession: { value: number; workoutId: string; date: string };
}

/** Der komplette persistierte App-Zustand – ein Objekt, ein localStorage-Key. */
export interface AppData {
  version: 1;
  exercises: Exercise[];
  plans: WorkoutPlan[];
  workouts: Workout[];
  bodyMetrics: BodyMetricEntry[];
  settings: AppSettings;
}
