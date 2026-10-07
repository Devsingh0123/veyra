import React from 'react';
import { Card } from '@/components/ui/card';

export default function StatCard({
  title,
  value,
  change,
  changeType = 'positive',
  subtitle,
  icon: Icon,
  accentColor = 'indigo',
}) {
  const colorMap = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  const badgeColor =
    changeType === 'positive'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : changeType === 'negative'
      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      : 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <Card className="relative overflow-hidden border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-slate-700/80 hover:bg-slate-900/90">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        {Icon && (
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
              colorMap[accentColor] || colorMap.indigo
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
        {change && (
          <span
            className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${badgeColor}`}
          >
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-[11px] text-slate-500">{subtitle}</p>
      )}
    </Card>
  );
}
