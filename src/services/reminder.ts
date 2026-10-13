import { UserSettings } from '../types';
import { isWithinAwakeHours } from '../utils/units';

export class ReminderService {
  private static timerId: number | null = null;
  private static audioContext: AudioContext | null = null;

  static async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications are not supported in this browser.');
      return 'denied';
    }
    return await Notification.requestPermission();
  }

  static getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
  }

  static playChime(): void {
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      const ctx = this.audioContext;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Water droplet chime (frequency sweep)
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {
      console.warn('Audio playback not allowed or failed:', e);
    }
  }

  static triggerReminder(message: string, onQuickAdd?: (amountMl: number) => void): void {
    // 1. Play soft water chime
    this.playChime();

    // 2. Browser native notification if granted
    if ('Notification' in window && Notification.permission === 'granted') {
      const notif = new Notification('💧 HydrateAI - Time to drink water!', {
        body: message,
        icon: '/favicon.ico',
        tag: 'hydrate-reminder',
      });

      notif.onclick = () => {
        window.focus();
        if (onQuickAdd) onQuickAdd(250);
        notif.close();
      };
    }
  }

  static scheduleNextReminder(
    settings: UserSettings,
    onReminderFired: () => void
  ): () => void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    if (!settings.notificationsEnabled) {
      return () => {};
    }

    const intervalMs = Math.max(1, settings.intervalMinutes) * 60 * 1000;

    const intervalHandle = window.setInterval(() => {
      const inAwake = isWithinAwakeHours(settings.wakeTime, settings.bedTime);
      if (inAwake) {
        onReminderFired();
      } else {
        console.log('HydrateAI: Skipping reminder during configured sleep hours.');
      }
    }, intervalMs);

    this.timerId = intervalHandle;

    return () => {
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
    };
  }
}
