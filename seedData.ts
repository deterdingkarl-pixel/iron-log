import { v4 as uuid } from 'uuid';
import { AppData, Exercise, Workout, WorkoutPlan } from '@/types';

const now = new Date().toISOString();

function ex(
  name: string,
  muscleGroup: Exercise['muscleGroup'],
  category: Exercise['category'],
  equipment: string,
  description: string,
  executionNotes: string
): Exercise {
  return {
    id: uuid(),
    name,
    muscleGroup,
    category,
    equipment,
    description,
    executionNotes,
    isCustom: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildSeedExercises(): Exercise[] {
  return [
    ex(
      'Bankdrücken',
      'Brust',
      'Verbundübung',
      'Langhantel',
      'Grundübung für die Brustmuskulatur, Schultern und Trizeps.',
      'Schulterblätter zusammenziehen, Griffbreite schulterbreit bis leicht darüber, Stange kontrolliert zur unteren Brust führen.'
    ),
    ex(
      'Kniebeuge',
      'Beine',
      'Verbundübung',
      'Langhantel',
      'Zentrale Übung für Quadrizeps, Gesäß und Rumpf.',
      'Knie in Zehenrichtung, Rücken neutral, mindestens bis Oberschenkel parallel zum Boden.'
    ),
    ex(
      'Kreuzheben',
      'Rücken',
      'Verbundübung',
      'Langhantel',
      'Ganzkörperübung mit Fokus auf hintere Kette.',
      'Stange nah am Körper führen, Rücken gerade halten, aus der Hüfte kommen.'
    ),
    ex(
      'Klimmzüge',
      'Rücken',
      'Körpergewicht',
      'Klimmzugstange',
      'Übung für Latissimus und Bizeps mit dem eigenen Körpergewicht.',
      'Kontrolliert bis zum Kinn über der Stange ziehen, Schultern aktiv nach unten ziehen.'
    ),
    ex(
      'Rudern vorgebeugt',
      'Rücken',
      'Verbundübung',
      'Langhantel',
      'Rückenbreite und -dicke aufbauen.',
      'Oberkörper ca. 45° geneigt, Stange Richtung Bauchnabel ziehen, Rumpf stabil halten.'
    ),
    ex(
      'Schulterdrücken',
      'Schultern',
      'Verbundübung',
      'Langhantel',
      'Übung für die vordere und seitliche Schulter.',
      'Rumpf anspannen, Hantel senkrecht über den Schultern nach oben drücken.'
    ),
    ex(
      'Bizepscurls',
      'Bizeps',
      'Isolationsübung',
      'Kurzhanteln',
      'Isolationsübung für den Bizeps.',
      'Ellbogen am Körper fixiert, keine Schwungbewegung, oben kurz zusammendrücken.'
    ),
    ex(
      'Beinpresse',
      'Beine',
      'Verbundübung',
      'Maschine',
      'Maschinenübung für Quadrizeps und Gesäß, gelenkschonende Alternative zur Kniebeuge.',
      'Füße schulterbreit, Knie nicht komplett durchstrecken, kontrollierte Bewegung.'
    ),
  ];
}

export function buildSeedPlans(exercises: Exercise[]): WorkoutPlan[] {
  const byName = (name: string) => exercises.find((e) => e.name === name)!.id;

  const makePlan = (
    name: string,
    type: string,
    items: { name: string; sets: number; reps: number; weight?: number }[],
    favorite: boolean
  ): WorkoutPlan => ({
    id: uuid(),
    name,
    type,
    isFavorite: favorite,
    createdAt: now,
    updatedAt: now,
    exercises: items.map((it, idx) => ({
      id: uuid(),
      exerciseId: byName(it.name),
      order: idx,
      targetSets: it.sets,
      targetReps: it.reps,
      targetWeight: it.weight,
    })),
  });

  return [
    makePlan(
      'Push Day',
      'Push',
      [
        { name: 'Bankdrücken', sets: 4, reps: 8, weight: 70 },
        { name: 'Schulterdrücken', sets: 3, reps: 10, weight: 40 },
        { name: 'Bizepscurls', sets: 3, reps: 12, weight: 14 },
      ],
      true
    ),
    makePlan(
      'Pull Day',
      'Pull',
      [
        { name: 'Kreuzheben', sets: 3, reps: 5, weight: 100 },
        { name: 'Klimmzüge', sets: 4, reps: 8 },
        { name: 'Rudern vorgebeugt', sets: 3, reps: 10, weight: 50 },
      ],
      true
    ),
    makePlan(
      'Beine',
      'Beine',
      [
        { name: 'Kniebeuge', sets: 4, reps: 6, weight: 90 },
        { name: 'Beinpresse', sets: 3, reps: 12, weight: 140 },
      ],
      false
    ),
    makePlan(
      'Ganzkörper',
      'Ganzkörper',
      [
        { name: 'Kniebeuge', sets: 3, reps: 8, weight: 80 },
        { name: 'Bankdrücken', sets: 3, reps: 8, weight: 65 },
        { name: 'Rudern vorgebeugt', sets: 3, reps: 10, weight: 45 },
      ],
      false
    ),
  ];
}

/** Erzeugt ein Datum als YYYY-MM-DD, `daysAgo` Tage vor heute. */
function dateDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export function buildSeedWorkouts(exercises: Exercise[], plans: WorkoutPlan[]): Workout[] {
  const byName = (name: string) => exercises.find((e) => e.name === name)!.id;
  const planByType = (type: string) => plans.find((p) => p.type === type)!.id;

  const makeWorkout = (
    daysAgo: number,
    planType: string | undefined,
    workoutType: string,
    duration: number,
    items: { name: string; sets: { weight: number; reps: number; rpe?: number }[] }[]
  ): Workout => ({
    id: uuid(),
    date: dateDaysAgo(daysAgo),
    planId: planType ? planByType(planType) : undefined,
    workoutType,
    durationMinutes: duration,
    exercises: items.map((it, idx) => ({
      id: uuid(),
      exerciseId: byName(it.name),
      order: idx,
      sets: it.sets.map((s) => ({ id: uuid(), ...s })),
    })),
    createdAt: now,
    updatedAt: now,
  });

  return [
    makeWorkout(13, 'Push', 'Push', 58, [
      {
        name: 'Bankdrücken',
        sets: [
          { weight: 65, reps: 8, rpe: 7 },
          { weight: 70, reps: 7, rpe: 8 },
          { weight: 70, reps: 6, rpe: 8 },
          { weight: 67.5, reps: 8, rpe: 7 },
        ],
      },
      {
        name: 'Schulterdrücken',
        sets: [
          { weight: 37.5, reps: 10 },
          { weight: 37.5, reps: 9 },
          { weight: 35, reps: 10 },
        ],
      },
    ]),
    makeWorkout(11, 'Pull', 'Pull', 52, [
      {
        name: 'Kreuzheben',
        sets: [
          { weight: 95, reps: 5, rpe: 8 },
          { weight: 100, reps: 5, rpe: 8 },
          { weight: 100, reps: 4, rpe: 9 },
        ],
      },
      {
        name: 'Klimmzüge',
        sets: [
          { weight: 0, reps: 9 },
          { weight: 0, reps: 8 },
          { weight: 0, reps: 7 },
        ],
      },
    ]),
    makeWorkout(9, 'Beine', 'Beine', 60, [
      {
        name: 'Kniebeuge',
        sets: [
          { weight: 85, reps: 6, rpe: 7 },
          { weight: 90, reps: 6, rpe: 8 },
          { weight: 90, reps: 5, rpe: 8 },
          { weight: 87.5, reps: 6, rpe: 7 },
        ],
      },
      {
        name: 'Beinpresse',
        sets: [
          { weight: 140, reps: 12 },
          { weight: 145, reps: 11 },
          { weight: 145, reps: 10 },
        ],
      },
    ]),
    makeWorkout(6, 'Push', 'Push', 55, [
      {
        name: 'Bankdrücken',
        sets: [
          { weight: 70, reps: 8, rpe: 8 },
          { weight: 72.5, reps: 6, rpe: 8 },
          { weight: 70, reps: 7, rpe: 8 },
        ],
      },
      {
        name: 'Bizepscurls',
        sets: [
          { weight: 14, reps: 12 },
          { weight: 14, reps: 11 },
          { weight: 12, reps: 12 },
        ],
      },
    ]),
    makeWorkout(4, 'Pull', 'Pull', 50, [
      {
        name: 'Rudern vorgebeugt',
        sets: [
          { weight: 50, reps: 10 },
          { weight: 52.5, reps: 9 },
          { weight: 52.5, reps: 8 },
        ],
      },
      {
        name: 'Klimmzüge',
        sets: [
          { weight: 0, reps: 10 },
          { weight: 0, reps: 9 },
          { weight: 0, reps: 8 },
        ],
      },
    ]),
    makeWorkout(2, 'Beine', 'Beine', 62, [
      {
        name: 'Kniebeuge',
        sets: [
          { weight: 90, reps: 6, rpe: 8 },
          { weight: 92.5, reps: 5, rpe: 8 },
          { weight: 92.5, reps: 5, rpe: 9 },
          { weight: 90, reps: 6, rpe: 8 },
        ],
      },
    ]),
    makeWorkout(0, 'Push', 'Push', 5, [
      {
        name: 'Bankdrücken',
        sets: [{ weight: 72.5, reps: 8, rpe: 8 }],
      },
    ]),
  ];
}

export function buildSeedData(): AppData {
  const exercises = buildSeedExercises();
  const plans = buildSeedPlans(exercises);
  const workouts = buildSeedWorkouts(exercises, plans);
  return {
    version: 1,
    exercises,
    plans,
    workouts,
    bodyMetrics: [],
    settings: { weightUnit: 'kg', theme: 'dark' },
  };
}
