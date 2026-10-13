import React from 'react';
import { Droplet } from 'lucide-react';
import { formatWaterAmount } from '../utils/units';
import { Unit } from '../types';

interface HydrationRingProps {
  currentMl: number;
  goalMl: number;
  unit: Unit;
}

export const HydrationRing: React.FC<HydrationRingProps> = ({ currentMl, goalMl, unit }) => {
  const percentage = Math.min(100, Math.round((currentMl / Math.max(1, goalMl)) * 100));
  const rawPercentage = Math.round((currentMl / Math.max(1, goalMl)) * 100);

  // SVG ring parameters
  const radius = 110;
  const stroke = 16;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-cyan-100 dark:border-slate-800 transition-all hover:shadow-md">
      <div className="relative flex items-center justify-center">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90 transition-all duration-700 ease-out"
        >
          {/* Background circle track */}
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="text-slate-100 dark:text-slate-800"
          />
          {/* Foreground progress circle */}
          <circle
            stroke="url(#waterGradient)"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <div className="p-3 bg-cyan-50 dark:bg-cyan-950/60 rounded-full mb-1 animate-pulse">
            <Droplet className="w-8 h-8 text-cyan-500 fill-cyan-400" />
          </div>
          <span className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            {rawPercentage}%
          </span>
          <span className="text-xs uppercase font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
            of daily goal
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
          {formatWaterAmount(currentMl, unit)}
        </span>
        <span className="text-sm text-slate-600 dark:text-slate-400">
          / {formatWaterAmount(goalMl, unit)}
        </span>
      </div>

      {rawPercentage >= 100 && (
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          ✨ Daily Goal Achieved!
        </div>
      )}
    </div>
  );
};
