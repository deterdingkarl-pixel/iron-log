import React, { useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, Button, Badge, Input, Select, EmptyState } from '@/components/ui/Primitives';
import ExerciseFormModal from '@/components/ExerciseFormModal';
import { Exercise } from '@/types';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

export default function Exercises() {
  const exercises = useAppStore((s) => s.exercises);
  const workouts = useAppStore((s) => s.workouts);
  const deleteExercise = useAppStore((s) => s.deleteExercise);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [query, setQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const muscleGroups = useMemo(() => Array.from(new Set(exercises.map((e) => e.muscleGroup))).sort(), [exercises]);
  const categories = useMemo(() => Array.from(new Set(exercises.map((e) => e.category))).sort(), [exercises]);
  const equipmentList = useMemo(() => Array.from(new Set(exercises.map((e) => e.equipment).filter(Boolean))).sort(), [exercises]);

  const usedExerciseIds = useMemo(() => {
    const set = new Set<string>();
    workouts.forEach((w) => w.exercises.forEach((ex) => set.add(ex.exerciseId)));
    return set;
  }, [workouts]);

  const filtered = exercises.filter((e) => {
    if (query && !e.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (muscleFilter && e.muscleGroup !== muscleFilter) return false;
    if (categoryFilter && e.category !== categoryFilter) return false;
    if (equipmentFilter && e.equipment !== equipmentFilter) return false;
    return true;
  });

  function handleDelete(id: string) {
    deleteExercise(id);
    setConfirmDeleteId(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Übungsbibliothek</h1>
          <p className="text-sm text-ink-muted mt-1">Verwalte deine Übungen mit Details zur Ausführung.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus size={18} /> Übung hinzufügen
        </Button>
      </div>

      <Card className="p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Übung suchen…"
            aria-label="Übung suchen"
            className="w-full bg-surface-overlay border border-surface-border rounded-md pl-9 pr-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:ring-1 focus:ring-accent outline-none"
          />
        </div>
        <Select value={muscleFilter} onChange={(e) => setMuscleFilter(e.target.value)} className="md:w-44">
          <option value="">Alle Muskelgruppen</option>
          {muscleGroups.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="md:w-44">
          <option value="">Alle Kategorien</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select value={equipmentFilter} onChange={(e) => setEquipmentFilter(e.target.value)} className="md:w-44">
          <option value="">Alles Equipment</option>
          {equipmentList.map((eq) => (
            <option key={eq} value={eq}>
              {eq}
            </option>
          ))}
        </Select>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState title="Keine Übungen gefunden" description="Passe deine Suche oder Filter an, oder lege eine neue Übung an." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ex) => (
            <Card key={ex.id} className="p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-ink">{ex.name}</h3>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditing(ex);
                      setModalOpen(true);
                    }}
                    aria-label={`${ex.name} bearbeiten`}
                    className="p-1.5 text-ink-faint hover:text-ink rounded-md hover:bg-surface-overlay"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(ex.id)}
                    aria-label={`${ex.name} löschen`}
                    className="p-1.5 text-ink-faint hover:text-warn rounded-md hover:bg-surface-overlay"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge tone="accent">{ex.muscleGroup}</Badge>
                <Badge>{ex.category}</Badge>
                {ex.equipment && <Badge>{ex.equipment}</Badge>}
              </div>
              {ex.description && <p className="text-sm text-ink-muted">{ex.description}</p>}
              {ex.executionNotes && (
                <p className="text-xs text-ink-faint border-t border-surface-border pt-2 mt-1">{ex.executionNotes}</p>
              )}
              {confirmDeleteId === ex.id && (
                <div className="flex items-center gap-2 pt-2 border-t border-surface-border">
                  <span className="text-xs text-ink-muted">
                    {usedExerciseIds.has(ex.id)
                      ? 'Wird in Trainings/Plänen verwendet. Wirklich löschen?'
                      : 'Wirklich löschen?'}
                  </span>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(ex.id)}>
                    Löschen
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(null)}>
                    Abbrechen
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <ExerciseFormModal open={modalOpen} onClose={() => setModalOpen(false)} editingExercise={editing} />
    </div>
  );
}
