import React, { useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, Button, Badge, EmptyState } from '@/components/ui/Primitives';
import WorkoutFormModal from '@/components/WorkoutFormModal';
import { Workout } from '@/types';
import { workoutVolume } from '@/lib/calculations';
import { format, parseISO } from 'date-fns';
import { PlusCircle, Pencil, Copy, Trash2, ChevronDown } from 'lucide-react';

export default function LogWorkout() {
  const workouts = useAppStore((s) => s.workouts);
  const exercises = useAppStore((s) => s.exercises);
  const unit = useAppStore((s) => s.settings.weightUnit);
  const duplicateWorkout = useAppStore((s) => s.duplicateWorkout);
  const deleteWorkout = useAppStore((s) => s.deleteWorkout);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Workout | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...workouts].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [workouts]
  );

  function exerciseName(id: string) {
    return exercises.find((e) => e.id === id)?.name ?? 'Unbekannte Übung';
  }

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(w: Workout) {
    setEditing(w);
    setModalOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Training eintragen</h1>
          <p className="text-sm text-ink-muted mt-1">
            Erfasse vergangene Trainingseinheiten nachträglich – kein Live-Modus, kein Timer.
          </p>
        </div>
        <Button onClick={openNew}>
          <PlusCircle size={18} /> Neues Training
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="Noch keine Trainings erfasst"
          description="Trage dein erstes Training ein: Datum wählen, Übungen und Sätze hinzufügen."
          action={
            <Button onClick={openNew}>
              <PlusCircle size={18} /> Training eintragen
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((w) => {
            const isOpen = expanded === w.id;
            return (
              <Card key={w.id} className="overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : w.id)}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-surface-overlay shrink-0">
                      <span className="text-xs text-ink-faint uppercase">
                        {format(parseISO(w.date), 'MMM')}
                      </span>
                      <span className="text-base font-semibold leading-none">
                        {format(parseISO(w.date), 'd')}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-ink">
                          {w.workoutType || 'Freies Training'}
                        </span>
                        {w.durationMinutes && <Badge>{w.durationMinutes} Min.</Badge>}
                      </div>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {w.exercises.length} Übungen · {Math.round(workoutVolume(w))} {unit} Volumen
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-ink-faint shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 flex flex-col gap-3 border-t border-surface-border pt-3">
                    {w.note && <p className="text-sm text-ink-muted italic">„{w.note}“</p>}
                    <div className="flex flex-col gap-2">
                      {w.exercises.map((ex) => (
                        <div key={ex.id} className="text-sm">
                          <span className="font-medium text-ink">{exerciseName(ex.exerciseId)}</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {ex.sets.map((s, i) => (
                              <span
                                key={s.id}
                                className="px-2 py-1 rounded-sm bg-surface-overlay text-ink-muted text-xs tabular-nums"
                              >
                                {i + 1}: {s.weight}
                                {unit} × {s.reps}
                                {s.rpe ? ` @${s.rpe}` : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(w)}>
                        <Pencil size={14} /> Bearbeiten
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => duplicateWorkout(w.id)}>
                        <Copy size={14} /> Kopieren
                      </Button>
                      {confirmDeleteId === w.id ? (
                        <Button size="sm" variant="danger" onClick={() => deleteWorkout(w.id)}>
                          Wirklich löschen?
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(w.id)}>
                          <Trash2 size={14} /> Löschen
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <WorkoutFormModal open={modalOpen} onClose={() => setModalOpen(false)} editingWorkout={editing} />
    </div>
  );
}
