import React, { useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, Select, Input, Button, EmptyState } from '@/components/ui/Primitives';
import StatCard from '@/components/StatCard';
import HeatmapCalendar from '@/components/HeatmapCalendar';
import {
  estimateOneRepMax,
  trainingDays,
  workoutVolume,
  weekdayFrequency,
  longestStreak,
  workoutsThisWeek,
  workoutsThisMonth,
} from '@/lib/calculations';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { format, parseISO, subMonths, subWeeks, subYears, isAfter } from 'date-fns';
import { Plus } from 'lucide-react';

type RangeKey = 'week' | 'month' | '3months' | 'year' | 'all';

const RANGE_LABELS: Record<RangeKey, string> = {
  week: 'Woche',
  month: 'Monat',
  '3months': '3 Monate',
  year: 'Jahr',
  all: 'Gesamt',
};

function rangeStart(range: RangeKey): Date | null {
  const now = new Date();
  switch (range) {
    case 'week':
      return subWeeks(now, 1);
    case 'month':
      return subMonths(now, 1);
    case '3months':
      return subMonths(now, 3);
    case 'year':
      return subYears(now, 1);
    default:
      return null;
  }
}

export default function Progress() {
  const workouts = useAppStore((s) => s.workouts);
  const exercises = useAppStore((s) => s.exercises);
  const unit = useAppStore((s) => s.settings.weightUnit);
  const bodyMetrics = useAppStore((s) => s.bodyMetrics);
  const addBodyMetric = useAppStore((s) => s.addBodyMetric);

  const [selectedExerciseId, setSelectedExerciseId] = useState(exercises[0]?.id ?? '');
  const [range, setRange] = useState<RangeKey>('3months');
  const [bwDate, setBwDate] = useState(new Date().toISOString().slice(0, 10));
  const [bwWeight, setBwWeight] = useState('');

  const start = rangeStart(range);
  const filteredWorkouts = useMemo(
    () => (start ? workouts.filter((w) => isAfter(parseISO(w.date), start)) : workouts),
    [workouts, start]
  );

  const exerciseSeries = useMemo(() => {
    if (!selectedExerciseId) return [];
    const points: { date: string; weight: number; reps: number; est1rm: number; volume: number }[] = [];
    for (const w of filteredWorkouts) {
      const log = w.exercises.find((ex) => ex.exerciseId === selectedExerciseId);
      if (!log || log.sets.length === 0) continue;
      const topSet = log.sets.reduce((best, s) =>
        estimateOneRepMax(s.weight, s.reps) > estimateOneRepMax(best.weight, best.reps) ? s : best
      );
      points.push({
        date: format(parseISO(w.date), 'dd.MM'),
        weight: topSet.weight,
        reps: topSet.reps,
        est1rm: estimateOneRepMax(topSet.weight, topSet.reps),
        volume: Math.round(log.sets.reduce((s, set) => s + set.weight * set.reps, 0)),
      });
    }
    return points.sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [filteredWorkouts, selectedExerciseId]);

  const personalRecord = useMemo(() => {
    if (!selectedExerciseId) return null;
    let best = { weight: 0, reps: 0, est1rm: 0, date: '' };
    for (const w of workouts) {
      const log = w.exercises.find((ex) => ex.exerciseId === selectedExerciseId);
      if (!log) continue;
      for (const s of log.sets) {
        const est = estimateOneRepMax(s.weight, s.reps);
        if (est > best.est1rm) {
          best = { weight: s.weight, reps: s.reps, est1rm: est, date: w.date };
        }
      }
    }
    return best.est1rm > 0 ? best : null;
  }, [workouts, selectedExerciseId]);

  const days = useMemo(() => trainingDays(filteredWorkouts), [filteredWorkouts]);
  const daySet = useMemo(() => new Set(days), [days]);
  const weekdayData = useMemo(() => weekdayFrequency(filteredWorkouts), [filteredWorkouts]);
  const lastTrainingDay = useMemo(() => trainingDays(workouts)[0], [workouts]);

  function submitBodyWeight(e: React.FormEvent) {
    e.preventDefault();
    if (!bwWeight) return;
    addBodyMetric({ date: bwDate, weight: Number(bwWeight) });
    setBwWeight('');
  }

  const bodyWeightSeries = useMemo(
    () =>
      bodyMetrics
        .filter((m) => m.weight)
        .sort((a, b) => (a.date < b.date ? -1 : 1))
        .map((m) => ({ date: format(parseISO(m.date), 'dd.MM'), weight: m.weight })),
    [bodyMetrics]
  );

  if (exercises.length === 0) {
    return (
      <EmptyState
        title="Noch keine Übungen vorhanden"
        description="Lege zuerst Übungen in der Übungsbibliothek an, um deinen Fortschritt auszuwerten."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Fortschritt & Statistik</h1>
          <p className="text-sm text-ink-muted mt-1">Entwicklung deiner Kraft und Trainingshäufigkeit.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(RANGE_LABELS) as RangeKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setRange(key)}
              className={`px-3 py-1.5 rounded-md text-sm border ${
                range === key
                  ? 'bg-accent-soft text-accent border-accent/30'
                  : 'bg-surface-overlay text-ink-muted border-surface-border hover:text-ink'
              }`}
            >
              {RANGE_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Trainingstage im Zeitraum" value={days.length} />
        <StatCard label="Diese Woche" value={workoutsThisWeek(workouts)} />
        <StatCard label="Dieser Monat" value={workoutsThisMonth(workouts)} />
        <StatCard
          label="Längste Serie"
          value={`${longestStreak(workouts)} Tage`}
          sub={lastTrainingDay ? `Zuletzt: ${format(parseISO(lastTrainingDay), 'dd.MM.yyyy')}` : undefined}
        />
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h2 className="text-sm font-semibold text-ink">Übungsfortschritt</h2>
          <Select value={selectedExerciseId} onChange={(e) => setSelectedExerciseId(e.target.value)} className="w-56">
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </Select>
        </div>

        {personalRecord && (
          <p className="text-sm text-ink-muted mb-3">
            Persönlicher Rekord:{' '}
            <span className="text-accent font-medium">
              {personalRecord.weight} {unit} × {personalRecord.reps} (geschätztes 1RM: {personalRecord.est1rm} {unit})
            </span>{' '}
            am {format(parseISO(personalRecord.date), 'dd.MM.yyyy')}
          </p>
        )}

        {exerciseSeries.length === 0 ? (
          <p className="text-sm text-ink-muted py-8 text-center">
            Keine Daten für diese Übung im gewählten Zeitraum.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-ink-faint mb-2">Geschätztes 1RM &amp; Gewicht ({unit})</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={exerciseSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#26332C" vertical={false} />
                  <XAxis dataKey="date" stroke="#5E7267" fontSize={11} />
                  <YAxis stroke="#5E7267" fontSize={11} width={36} />
                  <Tooltip contentStyle={{ background: '#1D2721', border: '1px solid #26332C', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="est1rm" stroke="#5EEAD4" strokeWidth={2} dot={false} name="Geschätztes 1RM" />
                  <Line type="monotone" dataKey="weight" stroke="#F5A97F" strokeWidth={2} dot={false} name="Top-Satz Gewicht" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-xs text-ink-faint mb-2">Volumen pro Einheit ({unit})</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={exerciseSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#26332C" vertical={false} />
                  <XAxis dataKey="date" stroke="#5E7267" fontSize={11} />
                  <YAxis stroke="#5E7267" fontSize={11} width={36} />
                  <Tooltip contentStyle={{ background: '#1D2721', border: '1px solid #26332C', borderRadius: 8 }} />
                  <Bar dataKey="volume" fill="#2DD4BF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-ink mb-3">Trainingskalender</h2>
          <HeatmapCalendar trainingDaySet={daySet} />
        </Card>
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-ink mb-3">Trainingstage nach Wochentag</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekdayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#26332C" vertical={false} />
              <XAxis dataKey="day" stroke="#5E7267" fontSize={12} />
              <YAxis stroke="#5E7267" fontSize={12} width={30} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#1D2721', border: '1px solid #26332C', borderRadius: 8 }} />
              <Bar dataKey="count" fill="#5EEAD4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-4">
        <h2 className="text-sm font-semibold text-ink mb-1">Körpergewicht (optional)</h2>
        <p className="text-xs text-ink-muted mb-4">Erfasse regelmäßig dein Körpergewicht, um den Verlauf zu sehen.</p>
        <form onSubmit={submitBodyWeight} className="flex flex-wrap items-end gap-3 mb-4">
          <Input label="Datum" type="date" value={bwDate} onChange={(e) => setBwDate(e.target.value)} className="w-40" />
          <Input
            label={`Gewicht (${unit})`}
            type="number"
            step="0.1"
            min={0}
            value={bwWeight}
            onChange={(e) => setBwWeight(e.target.value)}
            className="w-32"
          />
          <Button type="submit" size="sm" disabled={!bwWeight}>
            <Plus size={16} /> Eintragen
          </Button>
        </form>
        {bodyWeightSeries.length === 0 ? (
          <p className="text-sm text-ink-muted">Noch keine Einträge vorhanden.</p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={bodyWeightSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#26332C" vertical={false} />
              <XAxis dataKey="date" stroke="#5E7267" fontSize={11} />
              <YAxis stroke="#5E7267" fontSize={11} width={36} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ background: '#1D2721', border: '1px solid #26332C', borderRadius: 8 }} />
              <Line type="monotone" dataKey="weight" stroke="#86EFAC" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
