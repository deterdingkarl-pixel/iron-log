import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import {
  AppData,
  AppSettings,
  BodyMetricEntry,
  Exercise,
  Workout,
  WorkoutPlan,
} from '@/types';
import { loadFromStorage, saveToStorage, clearStorage } from '@/lib/storage';
import { buildSeedData } from '@/data/seedData';

interface AppState extends AppData {
  // Übungen
  addExercise: (e: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt' | 'isCustom'>) => void;
  updateExercise: (id: string, patch: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;

  // Pläne
  addPlan: (p: Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updatePlan: (id: string, patch: Partial<WorkoutPlan>) => void;
  duplicatePlan: (id: string) => void;
  deletePlan: (id: string) => void;
  togglePlanFavorite: (id: string) => void;

  // Trainings
  addWorkout: (w: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateWorkout: (id: string, patch: Partial<Workout>) => void;
  duplicateWorkout: (id: string) => void;
  deleteWorkout: (id: string) => void;

  // Körpermaße
  addBodyMetric: (m: Omit<BodyMetricEntry, 'id'>) => void;
  deleteBodyMetric: (id: string) => void;

  // Einstellungen
  updateSettings: (patch: Partial<AppSettings>) => void;

  // Daten-Verwaltung
  replaceAllData: (data: AppData) => void;
  resetToSeed: () => void;
  resetToEmpty: () => void;
}

function persist(state: AppData) {
  saveToStorage(state);
}

const initial: AppData = loadFromStorage() ?? buildSeedData();
if (!loadFromStorage()) {
  saveToStorage(initial);
}

export const useAppStore = create<AppState>((set, get) => ({
  ...initial,

  addExercise: (e) =>
    set((state) => {
      const now = new Date().toISOString();
      const exercise: Exercise = { ...e, id: uuid(), isCustom: true, createdAt: now, updatedAt: now };
      const next = { ...state, exercises: [...state.exercises, exercise] };
      persist(next);
      return next;
    }),

  updateExercise: (id, patch) =>
    set((state) => {
      const next = {
        ...state,
        exercises: state.exercises.map((ex) =>
          ex.id === id ? { ...ex, ...patch, updatedAt: new Date().toISOString() } : ex
        ),
      };
      persist(next);
      return next;
    }),

  deleteExercise: (id) =>
    set((state) => {
      const next = { ...state, exercises: state.exercises.filter((ex) => ex.id !== id) };
      persist(next);
      return next;
    }),

  addPlan: (p) => {
    const id = uuid();
    set((state) => {
      const now = new Date().toISOString();
      const plan: WorkoutPlan = { ...p, id, createdAt: now, updatedAt: now };
      const next = { ...state, plans: [...state.plans, plan] };
      persist(next);
      return next;
    });
    return id;
  },

  updatePlan: (id, patch) =>
    set((state) => {
      const next = {
        ...state,
        plans: state.plans.map((p) =>
          p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p
        ),
      };
      persist(next);
      return next;
    }),

  duplicatePlan: (id) =>
    set((state) => {
      const source = state.plans.find((p) => p.id === id);
      if (!source) return state;
      const now = new Date().toISOString();
      const copy: WorkoutPlan = {
        ...source,
        id: uuid(),
        name: `${source.name} (Kopie)`,
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
        exercises: source.exercises.map((pe) => ({ ...pe, id: uuid() })),
      };
      const next = { ...state, plans: [...state.plans, copy] };
      persist(next);
      return next;
    }),

  deletePlan: (id) =>
    set((state) => {
      const next = { ...state, plans: state.plans.filter((p) => p.id !== id) };
      persist(next);
      return next;
    }),

  togglePlanFavorite: (id) =>
    set((state) => {
      const next = {
        ...state,
        plans: state.plans.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)),
      };
      persist(next);
      return next;
    }),

  addWorkout: (w) => {
    const id = uuid();
    set((state) => {
      const now = new Date().toISOString();
      const workout: Workout = { ...w, id, createdAt: now, updatedAt: now };
      const next = { ...state, workouts: [...state.workouts, workout] };
      persist(next);
      return next;
    });
    return id;
  },

  updateWorkout: (id, patch) =>
    set((state) => {
      const next = {
        ...state,
        workouts: state.workouts.map((w) =>
          w.id === id ? { ...w, ...patch, updatedAt: new Date().toISOString() } : w
        ),
      };
      persist(next);
      return next;
    }),

  duplicateWorkout: (id) =>
    set((state) => {
      const source = state.workouts.find((w) => w.id === id);
      if (!source) return state;
      const now = new Date().toISOString();
      const copy: Workout = {
        ...source,
        id: uuid(),
        date: new Date().toISOString().slice(0, 10),
        createdAt: now,
        updatedAt: now,
        exercises: source.exercises.map((ex) => ({
          ...ex,
          id: uuid(),
          sets: ex.sets.map((s) => ({ ...s, id: uuid() })),
        })),
      };
      const next = { ...state, workouts: [...state.workouts, copy] };
      persist(next);
      return next;
    }),

  deleteWorkout: (id) =>
    set((state) => {
      const next = { ...state, workouts: state.workouts.filter((w) => w.id !== id) };
      persist(next);
      return next;
    }),

  addBodyMetric: (m) =>
    set((state) => {
      const entry: BodyMetricEntry = { ...m, id: uuid() };
      const next = { ...state, bodyMetrics: [...state.bodyMetrics, entry] };
      persist(next);
      return next;
    }),

  deleteBodyMetric: (id) =>
    set((state) => {
      const next = { ...state, bodyMetrics: state.bodyMetrics.filter((m) => m.id !== id) };
      persist(next);
      return next;
    }),

  updateSettings: (patch) =>
    set((state) => {
      const next = { ...state, settings: { ...state.settings, ...patch } };
      persist(next);
      return next;
    }),

  replaceAllData: (data) =>
    set(() => {
      persist(data);
      return { ...data };
    }),

  resetToSeed: () =>
    set(() => {
      const seed = buildSeedData();
      persist(seed);
      return { ...seed };
    }),

  resetToEmpty: () =>
    set(() => {
      const empty: AppData = {
        version: 1,
        exercises: [],
        plans: [],
        workouts: [],
        bodyMetrics: [],
        settings: get().settings,
      };
      persist(empty);
      return { ...empty };
    }),
}));

export function hardResetStorage() {
  clearStorage();
  window.location.reload();
}
