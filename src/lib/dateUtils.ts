/**
 * Utility functions for date calculations in the Habit Tracker
 */

export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateString(): string {
  return formatDateToISO(new Date());
}

export interface DayInfo {
  dateString: string; // YYYY-MM-DD
  dayName: string;   // Mon, Tue, etc.
  dayNumber: number; // 1-31
  isToday: boolean;
  dateObj: Date;
}

/**
 * Returns the last N days ending on today (e.g. 7 days for the 7-day grid view)
 */
export function getLastNDays(numDays: number = 7): DayInfo[] {
  const days: DayInfo[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const dateString = formatDateToISO(d);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = d.getDate();
    const isToday = i === 0;

    days.push({
      dateString,
      dayName,
      dayNumber,
      isToday,
      dateObj: d,
    });
  }

  return days;
}

/**
 * Parses YYYY-MM-DD into a localized Date object
 */
export function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Determines whether a given year is a leap year (366 days)
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Returns total days in a given year (366 for leap years, 365 otherwise)
 */
export function getDaysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}
