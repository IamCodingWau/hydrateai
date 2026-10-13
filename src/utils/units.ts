import { Unit } from '../types';

export const ML_PER_OZ = 29.5735;

/**
 * Converts any unit to ml for standardized storage
 */
export function toMl(amount: number, unit: Unit): number {
  if (unit === 'l') return Math.round(amount * 1000);
  if (unit === 'oz') return Math.round(amount * ML_PER_OZ);
  return Math.round(amount);
}

/**
 * Converts internal ml to the user's preferred display unit
 */
export function fromMl(ml: number, targetUnit: Unit): number {
  if (targetUnit === 'l') return Number((ml / 1000).toFixed(2));
  if (targetUnit === 'oz') return Math.round(ml / ML_PER_OZ);
  return Math.round(ml);
}

/**
 * Formats amount with unit suffix
 */
export function formatWaterAmount(ml: number, unit: Unit): string {
  const displayVal = fromMl(ml, unit);
  if (unit === 'l') return `${displayVal} L`;
  if (unit === 'oz') return `${displayVal} fl oz`;
  return `${displayVal} ml`;
}

/**
 * Checks if current time is within user's configured wake/sleep window
 */
export function isWithinAwakeHours(wakeTime: string, bedTime: string, date = new Date()): boolean {
  const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);
  const [bedHour, bedMin] = bedTime.split(':').map(Number);
  
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const wakeTotal = wakeHour * 60 + wakeMin;
  const bedTotal = bedHour * 60 + bedMin;

  if (wakeTotal <= bedTotal) {
    // Normal day schedule e.g., 07:00 to 23:00
    return currentMinutes >= wakeTotal && currentMinutes < bedTotal;
  } else {
    // Crosses midnight schedule e.g., 20:00 to 04:00
    return currentMinutes >= wakeTotal || currentMinutes < bedTotal;
  }
}

/**
 * Formats timestamp to human readable 12/24 hour time
 */
export function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

/**
 * Formats date key YYYY-MM-DD
 */
export function getDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
