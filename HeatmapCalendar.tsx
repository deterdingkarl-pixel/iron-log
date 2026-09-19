import React, { useMemo, useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeatmapCalendar({
  trainingDaySet,
  volumeByDay,
}: {
  /** Set von Datumsstrings YYYY-MM-DD, an denen trainiert wurde. */
  trainingDaySet: Set<string>;
  /** Optional: Volumen pro Tag für eine abgestufte Intensitätsfarbe. */
  volumeByDay?: Record<string, number>;
}) {
  const [cursor, setCursor] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const maxVolume = useMemo(() => {
    if (!volumeByDay) return 0;
    return Math.max(1, ...Object.values(volumeByDay));
  }, [volumeByDay]);

  function intensity(key: string) {
    if (!trainingDaySet.has(key)) return 'bg-surface-overlay';
    if (!volumeByDay) return 'bg-accent/70';
    const v = volumeByDay[key] ?? 0;
    const ratio = v / maxVolume;
    if (ratio > 0.66) return 'bg-accent';
    if (ratio > 0.33) return 'bg-accent/60';
    return 'bg-accent/30';
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCursor((c) => subMonths(c, 1))}
          aria-label="Vorheriger Monat"
          className="p-1.5 rounded-md hover:bg-surface-overlay text-ink-muted"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-medium capitalize">
          {format(cursor, 'MMMM yyyy', { locale: de })}
        </span>
        <button
          onClick={() => setCursor((c) => addMonths(c, 1))}
          aria-label="Nächster Monat"
          className="p-1.5 rounded-md hover:bg-surface-overlay text-ink-muted"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d) => (
          <span key={d} className="text-[11px] text-ink-faint pb-1">
            {d}
          </span>
        ))}
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const inMonth = isSameMonth(day, cursor);
          return (
            <div
              key={key}
              title={key}
              className={`aspect-square rounded-sm flex items-center justify-center text-[11px] ${intensity(
                key
              )} ${inMonth ? 'text-ink' : 'text-ink-faint/40'} ${
                isToday(day) ? 'ring-1 ring-accent' : ''
              }`}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>
    </div>
  );
}
