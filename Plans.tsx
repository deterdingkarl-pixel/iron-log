import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, Button, Badge, EmptyState } from '@/components/ui/Primitives';
import PlanFormModal from '@/components/PlanFormModal';
import { WorkoutPlan } from '@/types';
import { Plus, Pencil, Copy, Trash2, Star } from 'lucide-react';

export default function Plans() {
  const plans = useAppStore((s) => s.plans);
  const exercises = useAppStore((s) => s.exercises);
  const duplicatePlan = useAppStore((s) => s.duplicatePlan);
  const deletePlan = useAppStore((s) => s.deletePlan);
  const togglePlanFavorite = useAppStore((s) => s.togglePlanFavorite);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WorkoutPlan | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const sorted = [...plans].sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite));

  function exerciseName(id: string) {
    return exercises.find((e) => e.id === id)?.name ?? 'Unbekannt';
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Trainingspläne</h1>
          <p className="text-sm text-ink-muted mt-1">Vorlagen für deine Trainingseinheiten.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus size={18} /> Neuer Plan
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="Noch keine Trainingspläne"
          description="Lege einen Plan an, um deine Übungen, Sätze und Zielwerte als Vorlage zu speichern."
          action={
            <Button onClick={() => setModalOpen(true)}>
              <Plus size={18} /> Plan erstellen
            </Button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {sorted.map((plan) => (
            <Card key={plan.id} className="p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-ink">{plan.name}</h3>
                    <Badge tone="accent">{plan.type}</Badge>
                  </div>
                  <p className="text-xs text-ink-muted mt-1">{plan.exercises.length} Übungen</p>
                </div>
                <button
                  onClick={() => togglePlanFavorite(plan.id)}
                  aria-label={plan.isFavorite ? 'Favorit entfernen' : 'Als Favorit markieren'}
                  className={`p-1.5 rounded-md hover:bg-surface-overlay ${plan.isFavorite ? 'text-accent' : 'text-ink-faint'}`}
                >
                  <Star size={18} fill={plan.isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>

              <ul className="flex flex-col gap-1 text-sm">
                {plan.exercises
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((pe) => (
                    <li key={pe.id} className="flex justify-between text-ink-muted">
                      <span className="text-ink">{exerciseName(pe.exerciseId)}</span>
                      <span className="tabular-nums">
                        {pe.targetSets} × {pe.targetReps}
                        {pe.targetWeight ? ` @ ${pe.targetWeight}` : ''}
                      </span>
                    </li>
                  ))}
              </ul>

              <div className="flex gap-2 pt-2 border-t border-surface-border">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditing(plan);
                    setModalOpen(true);
                  }}
                >
                  <Pencil size={14} /> Bearbeiten
                </Button>
                <Button size="sm" variant="secondary" onClick={() => duplicatePlan(plan.id)}>
                  <Copy size={14} /> Duplizieren
                </Button>
                {confirmDeleteId === plan.id ? (
                  <Button size="sm" variant="danger" onClick={() => deletePlan(plan.id)}>
                    Sicher?
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(plan.id)}>
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <PlanFormModal open={modalOpen} onClose={() => setModalOpen(false)} editingPlan={editing} />
    </div>
  );
}
