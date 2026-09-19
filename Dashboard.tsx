import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import StatCard from '@/components/StatCard';
import HeatmapCalendar from '@/components/HeatmapCalendar';
import { Card, Button, EmptyState } from '@/components/ui/Primitives';
import {
  currentStreak,
  longestStreak,
  trainingDays,
  workoutVolume,
  workoutsThisMonth,
  workoutsThisWeek,
  estimateOneRepMax,
} from '@/lib/calculations';
import { Flame, PlusCircle, Dumbbell, TrendingUp, Calendar } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { format, parseISO, subWeeks, isAfter } from 'date-fns';

export default function Dashboard() {
  const workouts = useAppStore((s) => s.workouts);
  const exercises = useAppStore((s) => s.exercises);
  const unit = useAppStore((s) => s.settings.weightUnit);

  const days = useMemo(() => trainingDays(workouts), [workouts]);
  const daySet = useMemo(() => new Set(days), [days]);
  const volumeByDay = useMemo(() => {
    const map: Record<string, number> = {};
    for (const w of workouts) {
      map[w.date] = (map[w.date] ?? 0) + workoutVolume(w);
    }
    return map;
  }, [workouts]);

  const totalVolume = useMemo(
    () => workouts.reduce((sum, w) => sum + workoutVolume(w), 0),
    [workouts]
  );

  const personalRecords = useMemo(() => {
    const best: Record<string, { est1rm: number; exerciseName: string }> = {};
    for (const w of workouts) {
      for (const ex of w.exercises) {
        const exercise = exercises.find((e) => e.id === ex.exerciseId);
        if (!exercise) continue;
        for (const set of ex.sets) {
          const est = estimateOneRepMax(set.weight, set.reps);
          if (!best[ex.exerciseId] || est > best[ex.exerciseId].est1rm) {
            best[ex.exerciseId] = { est1rm: est, exerciseName: exercise.name };
          }
        }
      }
    }
    return Object.values(best)
      .sort((a, b) => b.est1rm - a.est1rm)
      .slice(0, 4);
  }, [workouts, exercises]);

  const latestWorkout = useMemo(
    () => [...workouts].sort((a, b) => (a.date < b.date ? 1 : -1))[0],
    [workouts]
  );

  const weeklyChartData = useMemo(() => {
    const weeks: { label: string; volume: number; days: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = subWeeks(new Date(), i);
      const label = format(weekStart, 'dd.MM');
      const cutoffStart = subWeeks(new Date(), i + 1);
      const inWeek = workouts.filter(
        (w) => isAfter(parseISO(w.date), cutoffStart) && !isAfter(parseISO(w.date), weekStart)
      );
      weeks.push({
        label,
        volume: Math.round(inWeek.reduce((s, w) => s + workoutVolume(w), 0)),
        days: new Set(inWeek.map((w) => w.date)).size,
      });
    }
    return weeks;
  }, [workouts]);

  if (workouts.length === 0) {
    return (
      <EmptyState
        title="Noch keine Trainings erfasst"
        description="Trage dein erstes Training nachträglich ein, um dein Dashboard mit Daten zu füllen."
        action={
          <Link to="/training-eintragen">
            <Button>
              <PlusCircle size={18} /> Training eintragen
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-ink-muted mt-1">Dein Trainingsüberblick auf einen Blick.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/training-eintragen">
            <Button size="sm">
              <PlusCircle size={16} /> Training eintragen
            </Button>
          </Link>
          <Link to="/uebungen">
            <Button size="sm" variant="secondary">
              <Dumbbell size={16} /> Übung hinzufügen
            </Button>
          </Link>
          <Link to="/fortschritt">
            <Button size="sm" variant="secondary">
              <TrendingUp size={16} /> Fortschritt
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Diese Woche" value={workoutsThisWeek(workouts)} sub="Trainingstage" icon={<Calendar size={16} />} />
        <StatCard label="Dieser Monat" value={workoutsThisMonth(workouts)} sub="Trainingstage" icon={<Calendar size={16} />} />
        <StatCard label="Insgesamt" value={days.length} sub={`${workouts.length} Einheiten`} icon={<Dumbbell size={16} />} />
        <StatCard
          label="Aktuelle Serie"
          value={`${currentStreak(workouts)} Tage`}
          sub={`Längste: ${longestStreak(workouts)} Tage`}
          icon={<Flame size={16} />}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4 md:col-span-2">
          <h2 className="text-sm font-semibold text-ink mb-3">Trainingsvolumen pro Woche</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#26332C" vertical={false} />
              <XAxis dataKey="label" stroke="#5E7267" fontSize={12} />
              <YAxis stroke="#5E7267" fontSize={12} width={40} />
              <Tooltip
                contentStyle={{ background: '#1D2721', border: '1px solid #26332C', borderRadius: 8 }}
                labelStyle={{ color: '#EAF0EC' }}
                formatter={(value: number) => [`${value} ${unit}`, 'Volumen']}
              />
              <Bar dataKey="volume" fill="#5EEAD4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold text-ink mb-3">Trainingskalender</h2>
          <HeatmapCalendar trainingDaySet={daySet} volumeByDay={volumeByDay} />
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-ink mb-3">Persönliche Rekorde (geschätztes 1RM)</h2>
          {personalRecords.length === 0 ? (
            <p className="text-sm text-ink-muted">Noch keine Rekorde vorhanden.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {personalRecords.map((pr) => (
                <li key={pr.exerciseName} className="flex items-center justify-between text-sm">
                  <span className="text-ink">{pr.exerciseName}</span>
                  <span className="text-accent font-medium tabular-nums">
                    {pr.est1rm} {unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold text-ink mb-3">Letzte Trainingseinheit</h2>
          {latestWorkout ? (
            <div className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Datum</span>
                <span className="text-ink">{format(parseISO(latestWorkout.date), 'dd.MM.yyyy')}</span>
              </div>
              {latestWorkout.workoutType && (
                <div className="flex justify-between">
                  <span className="text-ink-muted">Typ</span>
                  <span className="text-ink">{latestWorkout.workoutType}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-ink-muted">Übungen</span>
                <span className="text-ink">{latestWorkout.exercises.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Volumen</span>
                <span className="text-ink">
                  {Math.round(workoutVolume(latestWorkout))} {unit}
                </span>
              </div>
              <Link to="/training-eintragen" className="mt-2">
                <Button size="sm" variant="secondary" className="w-full">
                  Alle Trainings ansehen
                </Button>
              </Link>
            </div>
          ) : (
            <p className="text-sm text-ink-muted">Keine Daten vorhanden.</p>
          )}
          <p className="text-xs text-ink-faint mt-3">
            Gesamttrainingsvolumen bisher: {Math.round(totalVolume)} {unit}
          </p>
        </Card>
      </div>
    </div>
  );
}
