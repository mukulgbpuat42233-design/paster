import React from 'react';
import { Building2, Clock, CalendarRange, Columns3 } from 'lucide-react';

export const OverviewStrip: React.FC = () => {
  const metrics = [
    {
      icon: Building2,
      label: 'Designated Stations',
      value: '3 Power Plants',
      sub: 'Tehri HEP, Koteshwar, Tehri PSP',
      accent: 'text-sky-600',
      bg: 'bg-sky-50',
    },
    {
      icon: Clock,
      label: 'Settlement Interval',
      value: '96 Time Blocks',
      sub: '15-min deviation intervals (D1–D96)',
      accent: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      icon: CalendarRange,
      label: 'Accounting Window',
      value: '7 Days / Week',
      sub: 'Auto-detected ISO Week numbering',
      accent: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: Columns3,
      label: 'Output Structure',
      value: '98 Columns',
      sub: 'Uniform Project, Date & 96 values',
      accent: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {metrics.map((m, i) => {
        const Icon = m.icon;
        return (
          <div
            key={i}
            className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-[0_2px_10px_-2px_rgba(20,50,80,0.05)] hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {m.label}
              </span>
              <div className={`w-7 h-7 rounded-lg ${m.bg} ${m.accent} flex items-center justify-center shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                {m.value}
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5" title={m.sub}>
                {m.sub}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
