import { UserSettings, WaterLog } from '../types';
import { toMl, getDateKey } from '../utils/units';

const SETTINGS_KEY = 'hydrateai_settings_v1';
const LOGS_KEY = 'hydrateai_logs_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  userName: 'Hydrator',
  wakeTime: '07:30',
  bedTime: '23:00',
  dailyGoal: 2500, // 2500 ml (~84 oz)
  unit: 'ml',
  intervalMinutes: 60,
  notificationsEnabled: false,
  soundEnabled: true,
  theme: 'system',
  aiModel: 'qwen2.5:3b',
  ollamaEndpoint: 'http://localhost:11434',
  aiPersonality: 'encouraging',
  isPremiumPreviewActive: false,
};

export class StorageService {
  static getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  static getLogs(): WaterLog[] {
    try {
      const data = localStorage.getItem(LOGS_KEY);
      if (!data) return this.generateInitialDemoLogs();
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveLogs(logs: WaterLog[]): void {
    try {
      localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save logs:', e);
    }
  }

  static addLog(amount: number, unit: UserSettings['unit'], source: WaterLog['source'] = 'quick_add', note?: string): WaterLog {
    const logs = this.getLogs();
    const newLog: WaterLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: Date.now(),
      amount: toMl(amount, unit),
      unitWhenLogged: unit,
      note,
      source,
    };
    logs.unshift(newLog);
    this.saveLogs(logs);
    return newLog;
  }

  static deleteLog(id: string): WaterLog[] {
    const logs = this.getLogs().filter((l) => l.id !== id);
    this.saveLogs(logs);
    return logs;
  }

  static updateLog(id: string, newAmount: number, unit: UserSettings['unit'], note?: string): WaterLog[] {
    const logs = this.getLogs().map((l) => {
      if (l.id === id) {
        return {
          ...l,
          amount: toMl(newAmount, unit),
          note,
        };
      }
      return l;
    });
    this.saveLogs(logs);
    return logs;
  }

  static getTodayLogs(): WaterLog[] {
    const today = getDateKey();
    return this.getLogs().filter((log) => getDateKey(new Date(log.timestamp)) === today);
  }

  static getTodayTotalMl(): number {
    return this.getTodayLogs().reduce((sum, log) => sum + log.amount, 0);
  }

  static clearAllData(): void {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(LOGS_KEY);
  }

  static exportAsJSON(): string {
    const payload = {
      app: 'HydrateAI',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      logs: this.getLogs(),
    };
    return JSON.stringify(payload, null, 2);
  }

  static exportAsCSV(): string {
    const logs = this.getLogs();
    const headers = ['ID', 'Date', 'Time', 'Amount (ml)', 'Original Unit', 'Source', 'Note'];
    const rows = logs.map((log) => {
      const d = new Date(log.timestamp);
      return [
        log.id,
        d.toISOString().split('T')[0],
        d.toTimeString().split(' ')[0],
        log.amount,
        log.unitWhenLogged,
        log.source,
        `"${(log.note || '').replace(/"/g, '""')}"`,
      ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  }

  // Pre-populates a gentle history for immediate visual richness on first visit
  private static generateInitialDemoLogs(): WaterLog[] {
    const now = Date.now();
    const oneDay = 86400000;
    const demo: WaterLog[] = [
      { id: 'init-1', timestamp: now - 3600000 * 2.5, amount: 350, unitWhenLogged: 'ml', source: 'quick_add' },
      { id: 'init-2', timestamp: now - 3600000 * 5, amount: 500, unitWhenLogged: 'ml', source: 'quick_add' },
      { id: 'init-3', timestamp: now - oneDay - 3600000 * 2, amount: 600, unitWhenLogged: 'ml', source: 'quick_add' },
      { id: 'init-4', timestamp: now - oneDay - 3600000 * 6, amount: 500, unitWhenLogged: 'ml', source: 'quick_add' },
      { id: 'init-5', timestamp: now - oneDay - 3600000 * 9, amount: 750, unitWhenLogged: 'ml', source: 'quick_add' },
      { id: 'init-6', timestamp: now - (oneDay * 2) - 3600000 * 3, amount: 500, unitWhenLogged: 'ml', source: 'quick_add' },
      { id: 'init-7', timestamp: now - (oneDay * 2) - 3600000 * 7, amount: 1000, unitWhenLogged: 'ml', source: 'quick_add' },
      { id: 'init-8', timestamp: now - (oneDay * 3) - 3600000 * 4, amount: 750, unitWhenLogged: 'ml', source: 'quick_add' },
      { id: 'init-9', timestamp: now - (oneDay * 3) - 3600000 * 8, amount: 500, unitWhenLogged: 'ml', source: 'quick_add' },
    ];
    this.saveLogs(demo);
    return demo;
  }
}
