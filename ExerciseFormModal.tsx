import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Modal, Button, Input, Select, Textarea } from '@/components/ui/Primitives';
import { Exercise, ExerciseCategory, MuscleGroup } from '@/types';

const MUSCLE_GROUPS: MuscleGroup[] = [
  'Brust',
  'Rücken',
  'Beine',
  'Schultern',
  'Bizeps',
  'Trizeps',
  'Bauch',
  'Ganzkörper',
  'Sonstiges',
];

const CATEGORIES: ExerciseCategory[] = [
  'Verbundübung',
  'Isolationsübung',
  'Körpergewicht',
  'Cardio',
  'Mobilität',
];

export default function ExerciseFormModal({
  open,
  onClose,
  editingExercise,
}: {
  open: boolean;
  onClose: () => void;
  editingExercise?: Exercise | null;
}) {
  const addExercise = useAppStore((s) => s.addExercise);
  const updateExercise = useAppStore((s) => s.updateExercise);

  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('Brust');
  const [category, setCategory] = useState<ExerciseCategory>('Verbundübung');
  const [equipment, setEquipment] = useState('');
  const [description, setDescription] = useState('');
  const [executionNotes, setExecutionNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editingExercise) {
      setName(editingExercise.name);
      setMuscleGroup(editingExercise.muscleGroup);
      setCategory(editingExercise.category);
      setEquipment(editingExercise.equipment);
      setDescription(editingExercise.description ?? '');
      setExecutionNotes(editingExercise.executionNotes ?? '');
    } else {
      setName('');
      setMuscleGroup('Brust');
      setCategory('Verbundübung');
      setEquipment('');
      setDescription('');
      setExecutionNotes('');
    }
  }, [open, editingExercise]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      muscleGroup,
      category,
      equipment: equipment.trim(),
      description: description.trim() || undefined,
      executionNotes: executionNotes.trim() || undefined,
    };
    if (editingExercise) {
      updateExercise(editingExercise.id, payload);
    } else {
      addExercise(payload);
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={editingExercise ? 'Übung bearbeiten' : 'Neue Übung'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="z.B. Bankdrücken" />
        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Muskelgruppe" value={muscleGroup} onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup)}>
            {MUSCLE_GROUPS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
          <Select label="Kategorie" value={category} onChange={(e) => setCategory(e.target.value as ExerciseCategory)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <Input label="Equipment" value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder="z.B. Langhantel, Kurzhanteln, Maschine" />
        <Textarea label="Beschreibung (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Textarea label="Hinweise zur Ausführung (optional)" value={executionNotes} onChange={(e) => setExecutionNotes(e.target.value)} />
        <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            {editingExercise ? 'Änderungen speichern' : 'Übung speichern'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
