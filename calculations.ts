import { Workout, WorkoutSet } from '@/types';
import { parseISO, differenceInCalendarDays, isSameWeek, isSameMonth } from 'date-fns';

/** Geschätztes 1-Wiederholungs-Maximum nach der Epley-Formel. */
export function estimateOneRepMax(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export function setVolume(set: WorkoutSet): number {
  return set.weight * set.reps;
}

export function workoutVolume(workout: Workout): number {
  return workout.exercises.reduce(
    (sum, ex) => sum + ex.sets.reduce((s, set) => s + setVolume(set), 0),
    0
  );
}

export function workoutTopSet(workout: Workout): number {
  let best = 0;
  for (const ex of workout.exercises) {
    for (const set of ex.sets) {
      best = Math.max(best, estimateOneRepMax(set.weight, set.reps));
    }
  }
  return best;
}

/** Eindeutige Trainingstage (YYYY-MM-DD) aus einer Liste von Workouts, sortiert absteigend. */
export function trainingDays(workouts: Workout[]): string[] {
  const days = Array.from(new Set(workouts.map((w) => w.date)));
  return days.sort((a, b) => (a < b ? 1 : -1));
}

/** Aktuelle Trainingsserie in aufeinanderfolgenden Kalendertagen, ausgehend von heute/gestern. */
export function currentStreak(workouts: Workout[], today = new Date()): number {
  const days = new Set(workouts.map((w) => w.date));
  let streak = 0;
  let cursor = today;
  // Erlaubt, dass "heute" noch nicht trainiert wurde, ohne die Serie zu heute-inklusive zu brechen.
  const todayStr = cursor.toISOString().slice(0, 10);
  if (!days.has(todayStr)) {
    cursor = new Date(cursor.getTime() - 86400000);
  }
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak += 1;
      cursor = new Date(cursor.getTime() - 86400000);
    } else {
      break;
    }
  }
  return streak;
}

/** Längste jemals erreichte Trainingsserie in aufeinanderfolgenden Kalendertagen. */
export function longestStreak(workouts: Workout[]): number {
  const days = trainingDays(workouts)
    .map((d) => parseISO(d))
    .sort((a, b) => a.getTime() - b.getTime());
  if (days.length === 0) return 0;
  let longest = 1;
  let current = 1;
  for (let i = 1; i < days.length; i++) {
    const gap = differenceInCalendarDays(days[i], days[i - 1]);
    if (gap === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else if (gap > 1) {
      current = 1;
    }
  }
  return longest;
}

export function workoutsThisWeek(workouts: Workout[], reference = new Date()): number {
  return trainingDays(workouts).filter((d) =>
    isSameWeek(parseISO(d), reference, { weekStartsOn: 1 })
  ).length;
}

export function workoutsThisMonth(workouts: Workout[], reference = new Date()): number {
  return trainingDays(workouts).filter((d) => isSameMonth(parseISO(d), reference)).length;
}

export function weekdayFrequency(workouts: Workout[]): { day: string; count: number }[] {
  const labels = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const counts = new Array(7).fill(0);
  for (const d of trainingDays(workouts)) {
    const idx = parseISO(d).getDay();
    counts[idx] += 1;
  }
  // Woche beginnt Montag für die Anzeige
  const order = [1, 2, 3, 4, 5, 6, 0];
  return order.map((i) => ({ day: labels[i], count: counts[i] }));
}
