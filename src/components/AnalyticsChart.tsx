import React from 'react';
import { BarChart3, TrendingUp, Calendar, Award } from 'lucide-react';
import { WaterLog, Unit } from '../types';
import { formatWaterAmount, fromMl } from '../utils/units';

interface AnalyticsChartProps {
  logs: WaterLog[];
  dailyGoalMl: number;
  unit: Unit;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ logs, dailyGoalMl, unit }) => {
  // Aggregate water consumption over the past 7 days
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = days[d.getDay()];

    const totalForDay = logs
      .filter((l) => new Date(l.timestamp).toISOString().split('T')[0] === dateStr)
      .reduce((sum, l) => sum + l.amount, 0);

    return {
      dateStr,
      dayName,
      totalMl: totalForDay,
      percentage: Math.min(100, Math.round((totalForDay / Math.max(1, dailyGoalMl)) * 100)),
      isToday: i === 6,
    };
  });

  // Calculate current streak
  let currentStreak = 0;
  for (let i = last7Days.length - 1; i >= 0; i--) {
    if (last7Days[i].totalMl >= dailyGoalMl * 0.8) {
      currentStreak++;
    } else if (i === last7Days.length - 1) {
      // If today is not yet met, don't break streak if yesterday was met
      continue;
    } else {
      break;
    }
  }

  const maxValMl = Math.max(dailyGoalMl * 1.2, ...last7Days.map((d) => d.totalMl));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-cyan-100 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Weekly Hydration Trend
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Last 7 days compared against your target ({formatWaterAmount(dailyGoalMl, unit)})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 text-xs font-semibold">
            <Award className="w-3.5 h-3.5 text-cyan-500" />
            <span>Streak: {currentStreak} days</span>
          </div>
        </div>
      </div>

      {/* Bar graph visualizer */}
      <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-1 border-b border-slate-100 dark:border-slate-800">
        {last7Days.map((d, idx) => {
          const heightPercent = maxValMl > 0 ? Math.min(100, Math.round((d.totalMl / maxValMl) * 100)) : 0;
          const met = d.totalMl >= dailyGoalMl;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
              {/* Tooltip value */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-1 px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-white font-medium whitespace-nowrap shadow-xs">
                {formatWaterAmount(d.totalMl, unit)}
              </div>

              {/* Bar column */}
              <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800/80 rounded-t-xl h-full flex items-end overflow-hidden p-1">
                <div
                  style={{ height: `${Math.max(6, heightPercent)}%` }}
                  className={`w-full rounded-t-lg transition-all duration-700 ${
                    met
                      ? 'bg-gradient-to-t from-emerald-500 to-teal-400'
                      : d.isToday
                      ? 'bg-gradient-to-t from-cyan-500 to-sky-400'
                      : 'bg-gradient-to-t from-cyan-400/70 to-sky-300/60'
                  }`}
                />
              </div>

              {/* Day label */}
              <span
                className={`mt-2 text-xs font-semibold ${
                  d.isToday
                    ? 'text-cyan-600 dark:text-cyan-400'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {d.dayName}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Goal Reached</span>
          <div className="w-3 h-3 rounded-full bg-cyan-500 ml-2" />
          <span>Progressing</span>
        </div>
        <div className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Consistency builds wellness</span>
        </div>
      </div>
    </div>
  );
};
