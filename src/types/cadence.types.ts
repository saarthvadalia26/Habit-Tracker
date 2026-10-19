export type CadenceType = 'everyday' | 'weekdays' | 'weekends' | 'custom' | 'frequency';

export interface CadenceConfig {
  type: CadenceType;
  /**
   * Days of week active: 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
   */
  daysOfWeek?: number[];
  /**
   * Target days per week (e.g. 3 for 3x/week)
   */
  frequencyPerWeek?: number;
}

export interface StreakFreezeRecord {
  id?: string;
  habitId: string;
  date: string; // ISO date 'YYYY-MM-DD'
  reason?: string;
  createdAt?: string;
}

export interface HabitShieldStats {
  available: number;
  maxCapacity: number;
  earned: number;
  used: number;
}

export interface CadenceStreakResult {
  currentStreak: number;
  restDaysProtected: number;
  shieldsUsed: number;
  isTodayRest: boolean;
  isTodayFrozen: boolean;
}
