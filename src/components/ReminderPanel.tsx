import React, { useState } from 'react';
import { Bell, BellOff, Volume2, VolumeX, Moon, Clock, ShieldCheck, Play } from 'lucide-react';
import { UserSettings } from '../types';
import { ReminderService } from '../services/reminder';

interface ReminderPanelProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onTestReminder: () => void;
}

export const ReminderPanel: React.FC<ReminderPanelProps> = ({
  settings,
  onUpdateSettings,
  onTestReminder,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>(
    ReminderService.getPermissionStatus()
  );

  const handleRequestPermission = async () => {
    const res = await ReminderService.requestNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      onUpdateSettings({ notificationsEnabled: true });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-cyan-100 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Smart Reminders
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Configure periodic alerts & sleep protection
          </p>
        </div>
        <button
          onClick={onTestReminder}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-cyan-50 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-slate-700 transition"
          title="Trigger a test reminder sound & notification"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Test Now
        </button>
      </div>

      {permission !== 'granted' && (
        <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Notification Permission Required</span>
            To receive alerts even while studying or tabbed out, allow browser notifications.
            <button
              onClick={handleRequestPermission}
              className="mt-2 block px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-xs shadow-xs"
            >
              Enable Browser Notifications
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Toggle switch for notifications */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            {settings.notificationsEnabled ? (
              <Bell className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            ) : (
              <BellOff className="w-5 h-5 text-slate-400" />
            )}
            <div>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">
                Active Notifications
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Periodic reminder every {settings.intervalMinutes} mins
              </span>
            </div>
          </div>
          <button
            onClick={() => onUpdateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notificationsEnabled ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Interval Selector */}
        <div className="grid grid-cols-3 gap-2">
          {[30, 45, 60].map((mins) => (
            <button
              key={mins}
              onClick={() => onUpdateSettings({ intervalMinutes: mins })}
              className={`py-2 text-xs font-semibold rounded-xl border transition ${
                settings.intervalMinutes === mins
                  ? 'bg-cyan-500 text-white border-cyan-500 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Every {mins}m
            </button>
          ))}
        </div>

        {/* Sleep Protection Info */}
        <div className="p-3 rounded-2xl bg-cyan-50/50 dark:bg-slate-800/40 border border-cyan-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>
              Quiet hours: <strong>{settings.bedTime}</strong> to <strong>{settings.wakeTime}</strong>
            </span>
          </div>
          <Clock className="w-3.5 h-3.5 opacity-60" />
        </div>
      </div>
    </div>
  );
};
