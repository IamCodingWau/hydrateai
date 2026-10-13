import { describe, it, expect } from 'vitest';
import { toMl, fromMl, isWithinAwakeHours } from '../utils/units';

describe('Unit Conversion Utilities', () => {
  it('converts litres to millilitres correctly', () => {
    expect(toMl(1.5, 'l')).toBe(1500);
    expect(toMl(0.25, 'l')).toBe(250);
  });

  it('converts fluid ounces to millilitres correctly', () => {
    expect(toMl(8, 'oz')).toBe(237); // 8 * 29.5735 rounded
  });

  it('converts millilitres to target units properly', () => {
    expect(fromMl(1500, 'l')).toBe(1.5);
    expect(fromMl(500, 'ml')).toBe(500);
    expect(fromMl(237, 'oz')).toBe(8);
  });
});

describe('Awake Hours Detection', () => {
  it('identifies daytime awake period correctly', () => {
    const testDate = new Date();
    testDate.setHours(10, 30, 0, 0); // 10:30 AM
    expect(isWithinAwakeHours('07:00', '23:00', testDate)).toBe(true);
  });

  it('detects nighttime sleep period and guards against reminders', () => {
    const testDate = new Date();
    testDate.setHours(2, 30, 0, 0); // 2:30 AM
    expect(isWithinAwakeHours('07:00', '23:00', testDate)).toBe(false);
  });
});
