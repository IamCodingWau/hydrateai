export type Unit = 'ml' | 'l' | 'oz';

export interface UserSettings {
  userName: string;
  wakeTime: string;      // "07:00"
  bedTime: string;       // "23:00"
  dailyGoal: number;     // in selected unit
  unit: Unit;
  intervalMinutes: number; // e.g. 60
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  aiModel: string;       // e.g. "qwen2.5:3b", "mistral:7b", etc.
  ollamaEndpoint: string; // "http://localhost:11434"
  aiPersonality: 'encouraging' | 'calm' | 'humorous' | 'straightforward';
  isPremiumPreviewActive?: boolean;
}

export interface WaterLog {
  id: string;
  timestamp: number;     // Date.now()
  amount: number;        // always stored in ml internally for consistency
  unitWhenLogged: Unit;
  note?: string;
  source: 'quick_add' | 'custom' | 'reminder_action';
}

export interface DailySummary {
  date: string;          // YYYY-MM-DD
  totalMl: number;
  goalMl: number;
  metGoal: boolean;
  logsCount: number;
}

export interface AIInsightResponse {
  message: string;
  insightType: 'reminder' | 'daily_summary' | 'habit_coaching';
  modelUsed: string;
  source: 'local_ai' | 'smart_fallback';
  generatedAt: string;
}
