import React, { ReactNode } from 'react';
import { Card } from '@/components/ui/Primitives';

export default function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-muted">{label}</span>
        {icon && <span className="text-accent">{icon}</span>}
      </div>
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
      {sub && <span className="text-xs text-ink-faint">{sub}</span>}
    </Card>
  );
}
