import React from 'react';
import { Plus, Coffee, Wine, Sparkles } from 'lucide-react';
import { Unit } from '../types';
import { formatWaterAmount, toMl } from '../utils/units';

interface QuickAddProps {
  unit: Unit;
  onAdd: (amountMl: number, note?: string) => void;
}

export const QuickAdd: React.FC<QuickAddProps> = ({ unit, onAdd }) => {
  // Preset quick adds calibrated for the user's preferred unit
  const presets: { label: string; amount: number; icon: React.ReactNode; note: string }[] =
    unit === 'oz'
      ? [
          { label: '8 fl oz', amount: toMl(8, 'oz'), icon: <Coffee className="w-5 h-5" />, note: 'Small glass' },
          { label: '12 fl oz', amount: toMl(12, 'oz'), icon: <Sparkles className="w-5 h-5" />, note: 'Mug / Can' },
          { label: '16 fl oz', amount: toMl(16, 'oz'), icon: <Wine className="w-5 h-5" />, note: 'Regular bottle' },
          { label: '24 fl oz', amount: toMl(24, 'oz'), icon: <Plus className="w-5 h-5" />, note: 'Gym flask' },
        ]
      : unit === 'l'
      ? [
          { label: '0.25 L', amount: 250, icon: <Coffee className="w-5 h-5" />, note: 'Small glass' },
          { label: '0.33 L', amount: 330, icon: <Sparkles className="w-5 h-5" />, note: 'Standard cup' },
          { label: '0.50 L', amount: 500, icon: <Wine className="w-5 h-5" />, note: 'Bottle' },
          { label: '0.75 L', amount: 750, icon: <Plus className="w-5 h-5" />, note: 'Sports bottle' },
        ]
      : [
          { label: '200 ml', amount: 200, icon: <Coffee className="w-5 h-5" />, note: 'Small tea glass' },
          { label: '250 ml', amount: 250, icon: <Sparkles className="w-5 h-5" />, note: 'Water glass' },
          { label: '500 ml', amount: 500, icon: <Wine className="w-5 h-5" />, note: 'Standard bottle' },
          { label: '750 ml', amount: 750, icon: <Plus className="w-5 h-5" />, note: 'Workout shaker' },
        ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-cyan-100 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Quick Add
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Log common water volumes with a single click
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {presets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => onAdd(preset.amount, preset.note)}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-cyan-50/70 hover:bg-cyan-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-cyan-100 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-150 transform active:scale-95 text-slate-800 dark:text-slate-200 group"
          >
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform shadow-xs">
              {preset.icon}
            </div>
            <span className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-100">
              +{preset.label}
            </span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400">
              {preset.note}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
