import { CadenceConfig, CadenceStreakResult, HabitShieldStats } from '@/types/cadence.types';
import { formatDateToISO } from '@/lib/dateUtils';

export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const DAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

/**
 * Checks whether a habit is scheduled for execution on a specific date based on its cadence.
 */
export function isHabitScheduledForDay(
  cadence: CadenceConfig | undefined,
  date: Date | string
): boolean {
  if (!cadence || cadence.type === 'everyday') {
    return true;
  }

  const dateObj = typeof date === 'string' ? new Date(`${date}T00:00:00`) : date;
  const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

  switch (cadence.type) {
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6;
    case 'custom':
      return Array.isArray(cadence.daysOfWeek) && cadence.daysOfWeek.includes(dayOfWeek);
    case 'frequency':
      if (Array.isArray(cadence.daysOfWeek) && cadence.daysOfWeek.length > 0) {
        return cadence.daysOfWeek.includes(dayOfWeek);
      }
      return true;
    default:
      return true;
  }
}

/**
 * Checks whether a specific date is a scheduled recovery / rest day for a habit.
 */
export function isHabitRestDay(
  cadence: CadenceConfig | undefined,
  date: Date | string
): boolean {
  return !isHabitScheduledForDay(cadence, date);
}

/**
 * Returns a concise, beautiful label for a cadence configuration.
 */
export function getCadenceLabel(cadence?: CadenceConfig): string {
  if (!cadence || cadence.type === 'everyday') {
    return 'Daily (7d)';
  }

  if (cadence.type === 'weekdays') {
    return 'Weekdays (Mon-Fri)';
  }

  if (cadence.type === 'weekends') {
    return 'Weekends (Sat-Sun)';
  }

  if (cadence.type === 'frequency' && cadence.frequencyPerWeek) {
    return `${cadence.frequencyPerWeek}x / week`;
  }

  if (cadence.type === 'custom' && Array.isArray(cadence.daysOfWeek) && cadence.daysOfWeek.length > 0) {
    if (cadence.daysOfWeek.length === 7) return 'Daily (7d)';
    if (
      cadence.daysOfWeek.length === 5 &&
      [1, 2, 3, 4, 5].every((d) => cadence.daysOfWeek?.includes(d))
    ) {
      return 'Weekdays (5d)';
    }
    if (
      cadence.daysOfWeek.length === 3 &&
      [1, 3, 5].every((d) => cadence.daysOfWeek?.includes(d))
    ) {
      return 'MWF (3x/wk)';
    }
    return `${cadence.daysOfWeek.length} days/wk`;
  }

  return 'Custom';
}

/**
 * Calculates continuous streak backwards taking into account:
 * 1. Completed checkmarks (logs[date] === true)
 * 2. Protected days frozen with Streak Armor (frozenLogs[date] === true)
 * 3. Guilt-free scheduled rest days (isHabitRestDay(cadence, date))
 */
export function calculateCadenceStreak(
  logs: Record<string, boolean> = {},
  frozenLogs: Record<string, boolean> = {},
  cadence?: CadenceConfig
): CadenceStreakResult {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDateToISO(today);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateToISO(yesterday);

  const isTodayDone = Boolean(logs[todayStr]);
  const isTodayFrozen = Boolean(frozenLogs[todayStr]);
  const isTodayRest = isHabitRestDay(cadence, today);

  let streak = 0;
  let restDaysProtected = 0;
  let shieldsUsed = 0;

  let currentDate = new Date(today);

  // Today handling:
  if (isTodayDone) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  } else if (isTodayFrozen) {
    streak++;
    shieldsUsed++;
    currentDate.setDate(currentDate.getDate() - 1);
  } else if (isTodayRest) {
    // If today is a rest day, habit is NOT required today!
    // Streak can continue from yesterday if yesterday was satisfied or was also rest.
    restDaysProtected++;
    currentDate = yesterday;
  } else {
    // Today is an active scheduled day but not completed yet.
    // Allow streak to continue from yesterday if yesterday was satisfied.
    currentDate = yesterday;
  }

  // Traverse backward day by day across history
  // Max lookback of 730 days (2 years)
  for (let step = 0; step < 730; step++) {
    const dateStr = formatDateToISO(currentDate);
    const done = Boolean(logs[dateStr]);
    const frozen = Boolean(frozenLogs[dateStr]);
    const rest = isHabitRestDay(cadence, currentDate);

    if (done) {
      if (currentDate.getTime() !== today.getTime()) {
        streak++;
      }
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (frozen) {
      if (currentDate.getTime() !== today.getTime()) {
        streak++;
        shieldsUsed++;
      }
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (rest) {
      // Scheduled rest day does NOT break the streak!
      restDaysProtected++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Missed active day without freeze shield -> streak broken!
      break;
    }
  }

  return {
    currentStreak: streak,
    restDaysProtected,
    shieldsUsed,
    isTodayRest,
    isTodayFrozen,
  };
}

/**
 * Computes the Streak Armor shield bank for a habit or user:
 * - Base capacity: 2 emergency shields.
 * - Streak reward: +1 shield earned per 7 days of unbroken streak.
 * - Maximum capacity: 5 shields.
 */
export function computeHabitShieldBank(
  currentStreak: number = 0,
  usedCount: number = 0
): HabitShieldStats {
  const baseShields = 2;
  const milestoneBonus = Math.floor(Math.max(0, currentStreak) / 7);
  const maxCapacity = 5;
  const earned = Math.min(maxCapacity, baseShields + milestoneBonus);
  const available = Math.max(0, earned - usedCount);

  return {
    available,
    maxCapacity,
    earned,
    used: usedCount,
  };
}

/**
 * Counts total active scheduled days in a given month according to the cadence.
 */
export function getActiveDaysCountInMonth(
  year: number,
  month: number,
  cadence?: CadenceConfig
): number {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  if (!cadence || cadence.type === 'everyday') {
    return daysInMonth;
  }

  let count = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    if (isHabitScheduledForDay(cadence, d)) {
      count++;
    }
  }
  return count;
}
