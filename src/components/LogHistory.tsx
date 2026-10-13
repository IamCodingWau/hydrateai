import React, { useState } from 'react';
import { History, Trash2, Edit2, Check, X, Clock } from 'lucide-react';
import { WaterLog, Unit } from '../types';
import { formatWaterAmount, formatTime, fromMl, toMl } from '../utils/units';

interface LogHistoryProps {
  logs: WaterLog[];
  unit: Unit;
  onDelete: (id: string) => void;
  onEdit: (id: string, newAmount: number, note?: string) => void;
}

export const LogHistory: React.FC<LogHistoryProps> = ({ logs, unit, onDelete, onEdit }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(250);
  const [editNote, setEditNote] = useState<string>('');

  const handleStartEdit = (log: WaterLog) => {
    setEditingId(log.id);
    setEditValue(fromMl(log.amount, unit));
    setEditNote(log.note || '');
  };

  const handleSaveEdit = (id: string) => {
    if (editValue > 0) {
      onEdit(id, editValue, editNote);
    }
    setEditingId(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-cyan-100 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Today's Log History
          </h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-cyan-50 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 rounded-full">
          {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="py-8 text-center text-slate-600 dark:text-slate-400">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No drinks logged yet today. Take your first sip!</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {logs.map((log) => {
            const isEditing = editingId === log.id;

            return (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-cyan-200 transition-all"
              >
                {isEditing ? (
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <input
                      type="number"
                      step={unit === 'l' ? '0.05' : '10'}
                      value={editValue}
                      onChange={(e) => setEditValue(Number(e.target.value))}
                      className="w-24 px-2 py-1 text-sm bg-white dark:bg-slate-900 border border-cyan-300 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <input
                      type="text"
                      placeholder="Optional note"
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none"
                    />
                    <button
                      onClick={() => handleSaveEdit(log.id)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-lg"
                      title="Save"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                            +{formatWaterAmount(log.amount, unit)}
                          </span>
                          {log.note && (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-slate-700 text-cyan-700 dark:text-cyan-300">
                              {log.note}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-600 dark:text-slate-400">
                          {formatTime(log.timestamp)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(log)}
                        className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Edit entry"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(log.id)}
                        className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Delete entry (undo)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
