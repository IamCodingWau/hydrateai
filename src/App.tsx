import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Droplets,
  Settings,
  Sun,
  Moon,
  PlusCircle,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { UserSettings, WaterLog, AIInsightResponse } from './types';
import { StorageService } from './services/storage';
import { ReminderService } from './services/reminder';
import { HydrationRing } from './components/HydrationRing';
import { QuickAdd } from './components/QuickAdd';
import { LogHistory } from './components/LogHistory';
import { ReminderPanel } from './components/ReminderPanel';
import { AIAssistantCard } from './components/AIAssistantCard';
import { AnalyticsChart } from './components/AnalyticsChart';
import { SettingsModal } from './components/SettingsModal';
import { toMl, fromMl, formatWaterAmount } from './utils/units';

export function App() {
  const [settings, setSettings] = useState<UserSettings>(StorageService.getSettings());
  const [logs, setLogs] = useState<WaterLog[]>(StorageService.getLogs());
  const [insight, setInsight] = useState<AIInsightResponse | null>(null);
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [customAddOpen, setCustomAddOpen] = useState<boolean>(false);
  const [customAmount, setCustomAmount] = useState<number>(300);
  const [customNote, setCustomNote] = useState<string>('');
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Calculate today's metrics
  const todayLogs = StorageService.getTodayLogs();
  const currentIntakeMl = StorageService.getTodayTotalMl();
  const dailyGoalMl = toMl(settings.dailyGoal, settings.unit);

  // Apply theme class
  useEffect(() => {
    if (activeTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [activeTheme]);

  // Setup reminder timer based on user interval & schedule
  useEffect(() => {
    const cancelReminder = ReminderService.scheduleNextReminder(settings, () => {
      fetchAIReminder();
    });
    return () => cancelReminder();
  }, [settings]);

  // Initial fetch of AI summary / insight
  useEffect(() => {
    fetchAIDailySummary();
  }, []);

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#0284c7', '#06b6d4', '#10b981'],
    });
  };

  const handleAddWater = (amountMl: number, note?: string) => {
    const prevIntake = currentIntakeMl;
    StorageService.addLog(amountMl, 'ml', 'quick_add', note);
    const updatedLogs = StorageService.getLogs();
    setLogs(updatedLogs);

    // If goal was just crossed, trigger celebration
    if (prevIntake < dailyGoalMl && prevIntake + amountMl >= dailyGoalMl) {
      triggerCelebration();
    }
  };

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAmount > 0) {
      handleAddWater(toMl(customAmount, settings.unit), customNote || 'Custom intake');
      setCustomAmount(300);
      setCustomNote('');
      setCustomAddOpen(false);
    }
  };

  const handleDeleteLog = (id: string) => {
    const updated = StorageService.deleteLog(id);
    setLogs([...updated]);
  };

  const handleEditLog = (id: string, newAmount: number, note?: string) => {
    const updated = StorageService.updateLog(id, newAmount, settings.unit, note);
    setLogs([...updated]);
  };

  const handleUpdateSettings = (partial: Partial<UserSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    StorageService.saveSettings(updated);
  };

  const handleDataReset = () => {
    StorageService.clearAllData();
    setSettings(StorageService.getSettings());
    setLogs([]);
  };

  // AI Inference requests
  const fetchAIReminder = async () => {
    setLoadingAI(true);
    try {
      const hours = new Date().getHours();
      const timeOfDay = hours < 12 ? 'morning' : hours < 17 ? 'afternoon' : 'evening';
      const res = await fetch('/api/ai/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: settings.userName,
          current_intake_ml: currentIntakeMl,
          daily_goal_ml: dailyGoalMl,
          time_of_day: timeOfDay,
          personality: settings.aiPersonality,
          model: settings.aiModel,
        }),
      });
      if (res.ok) {
        const data: AIInsightResponse = await res.json();
        setInsight(data);
        ReminderService.triggerReminder(data.message, (amt) => handleAddWater(amt, 'Reminder Quick Drink'));
      }
    } catch {
      // Local fallback
      ReminderService.triggerReminder('💧 Time for a water break! Keep hydrated.', (amt) =>
        handleAddWater(amt, 'Reminder Quick Drink')
      );
    } finally {
      setLoadingAI(false);
    }
  };

  const fetchAIDailySummary = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: settings.userName,
          total_intake_ml: currentIntakeMl,
          daily_goal_ml: dailyGoalMl,
          logs_count: todayLogs.length,
          streak_days: 1,
          model: settings.aiModel,
        }),
      });
      if (res.ok) {
        const data: AIInsightResponse = await res.json();
        setInsight(data);
      }
    } catch (e) {
      console.warn('AI summary fetch failed, using offline fallback', e);
      setInsight({
        message: 'Staying consistent with hydration supports mental focus, physical recovery, and steady energy throughout your day.',
        insightType: 'daily_summary',
        modelUsed: 'Local Fallback',
        source: 'smart_fallback',
        generatedAt: new Date().toISOString(),
      });
    } finally {
      setLoadingAI(false);
    }
  };

  const currentDateFormatted = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50/50 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-cyan-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center text-white shadow-sm shadow-cyan-500/20">
              <Droplets className="w-5 h-5 fill-white/80" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-1.5">
                HydrateAI
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
                  v1.0
                </span>
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 block -mt-0.5">
                Smart Open-Weight Hydration Companion
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setActiveTheme(activeTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle theme"
            >
              {activeTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Custom Amount Button */}
            <button
              onClick={() => setCustomAddOpen(!customAddOpen)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-200 dark:border-slate-700 hover:border-cyan-400 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition shadow-xs"
            >
              <PlusCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              Custom Amount
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Settings & Privacy"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Welcome Greeting & Date Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Hello, {settings.userName} 👋
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Today is {currentDateFormatted}. Let's stay energized and hydrated.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-cyan-50 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-2xl border border-cyan-100 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Local AI Ready: <strong>{settings.aiModel}</strong></span>
          </div>
        </div>

        {/* Custom Water Input Drawer if open */}
        {customAddOpen && (
          <form
            onSubmit={handleCustomAdd}
            className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-cyan-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3 animate-fadeIn"
          >
            <div className="flex-1 w-full flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                Log Custom:
              </span>
              <input
                type="number"
                step={settings.unit === 'l' ? '0.05' : '10'}
                value={customAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value))}
                placeholder={`Amount in ${settings.unit}`}
                className="w-32 px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                {settings.unit}
              </span>
              <input
                type="text"
                placeholder="Optional tag (e.g. Herbal tea, Post-workout)"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="submit"
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                Log Drink
              </button>
              <button
                type="button"
                onClick={() => setCustomAddOpen(false)}
                className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Top Grid: Progress Ring & Quick Add & Reminders */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Progress Ring Card */}
          <div className="md:col-span-4 h-full">
            <HydrationRing
              currentMl={currentIntakeMl}
              goalMl={dailyGoalMl}
              unit={settings.unit}
            />
          </div>

          {/* Quick Add & Reminders Column */}
          <div className="md:col-span-8 space-y-6">
            <QuickAdd
              unit={settings.unit}
              onAdd={(amt, note) => handleAddWater(amt, note)}
            />
            <ReminderPanel
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onTestReminder={fetchAIReminder}
            />
          </div>
        </div>

        {/* AI Companion Intelligence Card */}
        <AIAssistantCard
          settings={settings}
          insight={insight}
          isLoading={loadingAI}
          onRefreshInsight={fetchAIDailySummary}
          onSelectModel={(model) => handleUpdateSettings({ aiModel: model })}
        />

        {/* Weekly Trends & Log History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <AnalyticsChart
              logs={logs}
              dailyGoalMl={dailyGoalMl}
              unit={settings.unit}
            />
          </div>
          <div className="lg:col-span-5">
            <LogHistory
              logs={todayLogs}
              unit={settings.unit}
              onDelete={handleDeleteLog}
              onEdit={handleEditLog}
            />
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={handleUpdateSettings}
        onDataReset={handleDataReset}
      />
    </div>
  );
}

export default App;
