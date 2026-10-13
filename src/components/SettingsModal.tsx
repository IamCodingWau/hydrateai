import React from 'react';
import { Download, FileSpreadsheet, FileJson, Trash2, Shield, Info, Sparkles, CheckCircle2 } from 'lucide-react';
import { UserSettings } from '../types';
import { StorageService } from '../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (newSettings: UserSettings) => void;
  onDataReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  onDataReset,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = React.useState<UserSettings>(settings);
  const [activeTab, setActiveTab] = React.useState<'preferences' | 'data' | 'premium'>('preferences');
  const [resetConfirmOpen, setResetConfirmOpen] = React.useState(false);

  const handleExportJSON = () => {
    const jsonStr = StorageService.exportAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hydrateai_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csvStr = StorageService.exportAsCSV();
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hydrateai_logs_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-cyan-100 dark:border-slate-800 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Settings & Data Control
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        {/* Navigation tabs */}
        <div className="flex gap-2 my-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition ${
              activeTab === 'preferences'
                ? 'bg-white dark:bg-slate-700 text-cyan-700 dark:text-cyan-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Preferences
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition ${
              activeTab === 'data'
                ? 'bg-white dark:bg-slate-700 text-cyan-700 dark:text-cyan-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Privacy & Data
          </button>
          <button
            onClick={() => setActiveTab('premium')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1 ${
              activeTab === 'premium'
                ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-xs'
                : 'text-cyan-700 dark:text-cyan-300'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Premium Preview
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'preferences' && (
            <form id="settings-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Name / Nickname
                </label>
                <input
                  type="text"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Daily Water Target
                  </label>
                  <input
                    type="number"
                    step={formData.unit === 'l' ? '0.1' : '50'}
                    value={formData.dailyGoal}
                    onChange={(e) => setFormData({ ...formData, dailyGoal: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Measurement Unit
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
                  >
                    <option value="ml">Millilitres (ml)</option>
                    <option value="l">Litres (L)</option>
                    <option value="oz">Fluid Ounces (fl oz)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Wake-up Time
                  </label>
                  <input
                    type="time"
                    value={formData.wakeTime}
                    onChange={(e) => setFormData({ ...formData, wakeTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bedtime
                  </label>
                  <input
                    type="time"
                    value={formData.bedTime}
                    onChange={(e) => setFormData({ ...formData, bedTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  AI Companion Personality
                </label>
                <select
                  value={formData.aiPersonality}
                  onChange={(e) => setFormData({ ...formData, aiPersonality: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
                >
                  <option value="encouraging">Encouraging & Warm</option>
                  <option value="calm">Calm & Mindful</option>
                  <option value="humorous">Humorous & Witty</option>
                  <option value="straightforward">Straightforward & Minimalist</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ollama Base Endpoint
                </label>
                <input
                  type="text"
                  value={formData.ollamaEndpoint}
                  onChange={(e) => setFormData({ ...formData, ollamaEndpoint: e.target.value })}
                  placeholder="http://localhost:11434"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-xs outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
                />
              </div>
            </form>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-900 text-xs text-cyan-900 dark:text-cyan-200 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Strict Local-First Privacy</span>
                  Your hydration logs and daily schedules never touch any cloud database. All calculations happen inside your browser and local Python server.
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Export Data Records
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Export CSV
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="flex items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
                  >
                    <FileJson className="w-4 h-4 text-amber-600" />
                    Export JSON
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-2">
                  Danger Zone
                </span>
                {resetConfirmOpen ? (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl space-y-2">
                    <p className="text-xs text-rose-700 dark:text-rose-300">
                      Are you sure? This deletes all your logged drink history and resets your settings locally.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onDataReset();
                          setResetConfirmOpen(false);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition"
                      >
                        Yes, Erase All
                      </button>
                      <button
                        onClick={() => setResetConfirmOpen(false)}
                        className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setResetConfirmOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl text-xs font-semibold transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Reset & Clear All Local Data
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'premium' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-600/10 to-sky-600/10 border border-cyan-200 dark:border-cyan-800 text-slate-800 dark:text-slate-200">
                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-sm mb-1">
                  <Sparkles className="w-4 h-4" />
                  HydrateAI Pro (Future Commercial Model)
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Designed as an affordable wellness tool for remote teams, students, and freelancers with no recurring cloud AI charges.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  { name: 'Multi-Schedule Modes', desc: 'Separate schedules for workdays, gym sessions, and weekends' },
                  { name: 'AI Habit Synthesis', desc: 'Weekly deep-dive analysis into dehydration correlation with sleep' },
                  { name: 'Custom Liquid Themes', desc: 'Tea, electrolyte, and sparkling water progress visuals' },
                  { name: 'Team / Office Guilds', desc: 'Privacy-preserving team water challenges for remote offices' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.name}</div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Honesty Notice: Free tier is 100% fully featured & self-hostable. No payment gateway is attached in this open-source build.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Close
          </button>
          {activeTab === 'preferences' && (
            <button
              type="submit"
              form="settings-form"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs transition"
            >
              Save Preferences
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
