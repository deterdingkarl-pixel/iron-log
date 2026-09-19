import React, { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { useAppStore } from '@/store/useAppStore';
import { Modal, Button, Input, Select, Textarea } from '@/components/ui/Primitives';
import { ExerciseLog, Workout, WorkoutSet } from '@/types';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface DraftExercise {
  key: string;
  exerciseId: string;
  sets: WorkoutSet[];
  note?: string;
}

function emptySet(): WorkoutSet {
  return { id: uuid(), weight: 0, reps: 0 };
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function WorkoutFormModal({
  open,
  onClose,
  editingWorkout,
}: {
  open: boolean;
  onClose: () => void;
  editingWorkout?: Workout | null;
}) {
  const exercises = useAppStore((s) => s.exercises);
  const plans = useAppStore((s) => s.plans);
  const addWorkout = useAppStore((s) => s.addWorkout);
  const updateWorkout = useAppStore((s) => s.updateWorkout);
  const unit = useAppStore((s) => s.settings.weightUnit);

  const [date, setDate] = useState(todayStr());
  const [planId, setPlanId] = useState<string>('');
  const [workoutType, setWorkoutType] = useState('');
  const [duration, setDuration] = useState<string>('');
  const [note, setNote] = useState('');
  const [draftExercises, setDraftExercises] = useState<DraftExercise[]>([]);

  useEffect(() => {
    if (!open) return;
    if (editingWorkout) {
      setDate(editingWorkout.date);
      setPlanId(editingWorkout.planId ?? '');
      setWorkoutType(editingWorkout.workoutType ?? '');
      setDuration(editingWorkout.durationMinutes ? String(editingWorkout.durationMinutes) : '');
      setNote(editingWorkout.note ?? '');
      setDraftExercises(
        editingWorkout.exercises.map((ex) => ({
          key: ex.id,
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          note: ex.note,
        }))
      );
    } else {
      setDate(todayStr());
      setPlanId('');
      setWorkoutType('');
      setDuration('');
      setNote('');
      setDraftExercises([]);
    }
  }, [open, editingWorkout]);

  function applyPlan(id: string) {
    setPlanId(id);
    const plan = plans.find((p) => p.id === id);
    if (!plan) return;
    setWorkoutType(plan.type);
    setDraftExercises(
      plan.exercises
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((pe) => ({
          key: uuid(),
          exerciseId: pe.exerciseId,
          sets: Array.from({ length: pe.targetSets }, () => ({
            id: uuid(),
            weight: pe.targetWeight ?? 0,
            reps: pe.targetReps,
          })),
        }))
    );
  }

  function addExerciseRow() {
    if (exercises.length === 0) return;
    setDraftExercises((prev) => [
      ...prev,
      { key: uuid(), exerciseId: exercises[0].id, sets: [emptySet()] },
    ]);
  }

  function removeExerciseRow(key: string) {
    setDraftExercises((prev) => prev.filter((e) => e.key !== key));
  }

  function updateExerciseRow(key: string, patch: Partial<DraftExercise>) {
    setDraftExercises((prev) => prev.map((e) => (e.key === key ? { ...e, ...patch } : e)));
  }

  function addSet(key: string) {
    setDraftExercises((prev) =>
      prev.map((e) => (e.key === key ? { ...e, sets: [...e.sets, emptySet()] } : e))
    );
  }

  function updateSet(key: string, setId: string, patch: Partial<WorkoutSet>) {
    setDraftExercises((prev) =>
      prev.map((e) =>
        e.key === key
          ? { ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) }
          : e
      )
    );
  }

  function removeSet(key: string, setId: string) {
    setDraftExercises((prev) =>
      prev.map((e) => (e.key === key ? { ...e, sets: e.sets.filter((s) => s.id !== setId) } : e))
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (draftExercises.length === 0) return;

    const exerciseLogs: ExerciseLog[] = draftExercises.map((de, idx) => ({
      id: uuid(),
      exerciseId: de.exerciseId,
      order: idx,
      sets: de.sets.filter((s) => s.reps > 0 || s.weight > 0),
      note: de.note,
    }));

    const payload = {
      date,
      planId: planId || undefined,
      workoutType: workoutType || undefined,
      durationMinutes: duration ? Number(duration) : undefined,
      note: note || undefined,
      exercises: exerciseLogs,
    };

    if (editingWorkout) {
      updateWorkout(editingWorkout.id, payload);
    } else {
      addWorkout(payload);
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingWorkout ? 'Training bearbeiten' : 'Training eintragen'}
      width="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Datum"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            max={todayStr()}
          />
          <Select label="Trainingsplan (optional)" value={planId} onChange={(e) => applyPlan(e.target.value)}>
            <option value="">Kein Plan / freies Training</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <Input
            label="Trainingsart (optional)"
            placeholder="z.B. Push, Pull, Beine"
            value={workoutType}
            onChange={(e) => setWorkoutType(e.target.value)}
          />
          <Input
            label="Dauer in Minuten (optional)"
            type="number"
            min={0}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
        <Textarea
          label="Notiz (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Wie hat sich das Training angefühlt?"
        />

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Übungen</h3>
            <Button type="button" size="sm" variant="secondary" onClick={addExerciseRow}>
              <Plus size={16} /> Übung hinzufügen
            </Button>
          </div>

          {draftExercises.length === 0 && (
            <p className="text-sm text-ink-muted">
              Noch keine Übungen hinzugefügt. Wähle oben einen Plan oder füge Übungen manuell hinzu.
            </p>
          )}

          {draftExercises.map((de) => (
            <div key={de.key} className="border border-surface-border rounded-md p-3 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <GripVertical size={16} className="text-ink-faint shrink-0" />
                <select
                  value={de.exerciseId}
                  onChange={(e) => updateExerciseRow(de.key, { exerciseId: e.target.value })}
                  className="flex-1 bg-surface-overlay border border-surface-border rounded-md px-3 py-2 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                  aria-label="Übung auswählen"
                >
                  {exercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeExerciseRow(de.key)}
                  aria-label="Übung entfernen"
                  className="p-2 text-ink-faint hover:text-warn rounded-md hover:bg-surface-overlay"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-[2rem_1fr_1fr_1fr_2.5rem] gap-2 text-[11px] text-ink-faint px-1">
                  <span>Satz</span>
                  <span>Gewicht ({unit})</span>
                  <span>Wdh.</span>
                  <span>RPE</span>
                  <span />
                </div>
                {de.sets.map((set, si) => (
                  <div key={set.id} className="grid grid-cols-[2rem_1fr_1fr_1fr_2.5rem] gap-2 items-center">
                    <span className="text-sm text-ink-muted text-center">{si + 1}</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      min={0}
                      value={set.weight || ''}
                      onChange={(e) => updateSet(de.key, set.id, { weight: Number(e.target.value) })}
                      className="bg-surface-overlay border border-surface-border rounded-md px-2.5 py-2 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                      aria-label={`Gewicht Satz ${si + 1}`}
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={set.reps || ''}
                      onChange={(e) => updateSet(de.key, set.id, { reps: Number(e.target.value) })}
                      className="bg-surface-overlay border border-surface-border rounded-md px-2.5 py-2 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                      aria-label={`Wiederholungen Satz ${si + 1}`}
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={10}
                      value={set.rpe ?? ''}
                      onChange={(e) =>
                        updateSet(de.key, set.id, {
                          rpe: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="–"
                      className="bg-surface-overlay border border-surface-border rounded-md px-2.5 py-2 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                      aria-label={`RPE Satz ${si + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeSet(de.key, set.id)}
                      aria-label={`Satz ${si + 1} entfernen`}
                      className="p-2 text-ink-faint hover:text-warn rounded-md hover:bg-surface-overlay justify-self-center"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <Button type="button" size="sm" variant="ghost" onClick={() => addSet(de.key)} className="self-start">
                  <Plus size={14} /> Satz hinzufügen
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={draftExercises.length === 0}>
            {editingWorkout ? 'Änderungen speichern' : 'Training speichern'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
