import { HabitWithLogs } from '@/types/database.types';

export interface HeatmapDay {
  dateString: string;
  date: Date;
  month: number; // 0 - 11
  dayOfMonth: number; // 1 - 31
  dayOfWeek: number; // 0 (Mon) to 6 (Sun)
  weekIndex: number; // 0 - 52
  isFuture: boolean;
  isToday: boolean;
}

export interface DayCompletionData {
  dateString: string;
  completedCount: number;
  totalHabits: number;
  completionRate: number; // 0.0 to 1.0
  intensityLevel: 0 | 1 | 2 | 3 | 4;
  habits: {
    id: string;
    title: string;
    color: string;
    completed: boolean;
    isNumeric?: boolean;
    currentValue?: number;
    targetValue?: number;
    unit?: string;
  }[];
}

export interface MonthColumnHeader {
  monthIndex: number;
  name: string;
  shortName: string;
  weekIndex: number;
}

export interface YearHeatmapAnalytics {
  year: number;
  totalCompletions: number;
  totalPossible: number;
  annualRate: number; // 0 - 100
  longestStreak: number;
  currentStreak: number;
  perfectDaysCount: number;
  activeDaysCount: number; // days with at least 1 habit completed
  totalDaysInYear: number;
  daysPassedInYear: number;
  bestMonthName: string;
  bestMonthRate: number;
}

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const DAY_NAMES_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

/**
 * Returns ISO day of week: 0 = Monday, 6 = Sunday
 */
export function getIsoDayOfWeek(date: Date): number {
  const day = date.getDay(); // 0 is Sun, 1 is Mon...
  return (day + 6) % 7;
}

/**
 * Builds the 52-53 week grid structure for a given year
 */
export function generateYearMatrix(year: number) {
  const days: HeatmapDay[] = [];
  const monthHeaders: MonthColumnHeader[] = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  let currentWeek = 0;
  let lastMonth = -1;

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const curDate = new Date(d);
    curDate.setHours(0, 0, 0, 0);

    const isoDay = getIsoDayOfWeek(curDate);
    const month = curDate.getMonth();
    const dayOfMonth = curDate.getDate();

    // Advance week index on Mondays, except for the very first day if it's Monday
    if (days.length > 0 && isoDay === 0) {
      currentWeek++;
    }

    // Capture first occurrence of month for column headers
    if (month !== lastMonth) {
      monthHeaders.push({
        monthIndex: month,
        name: MONTH_NAMES_SHORT[month],
        shortName: MONTH_NAMES_SHORT[month],
        weekIndex: currentWeek,
      });
      lastMonth = month;
    }

    const mm = String(month + 1).padStart(2, '0');
    const dd = String(dayOfMonth).padStart(2, '0');
    const dateString = `${year}-${mm}-${dd}`;

    const isToday = curDate.getTime() === today.getTime();
    const isFuture = curDate.getTime() > today.getTime();

    days.push({
      dateString,
      date: curDate,
      month,
      dayOfMonth,
      dayOfWeek: isoDay,
      weekIndex: currentWeek,
      isFuture,
      isToday,
    });
  }

  const totalWeeks = currentWeek + 1;

  return {
    year,
    days,
    monthHeaders,
    totalWeeks,
  };
}

/**
 * Computes completion metrics for each day and overall year stats
 */
export function computeHeatmapData(
  year: number,
  days: HeatmapDay[],
  habits: HabitWithLogs[],
  selectedHabitId: 'all' | string
): {
  dayDataMap: Record<string, DayCompletionData>;
  analytics: YearHeatmapAnalytics;
} {
  const activeHabits =
    selectedHabitId === 'all'
      ? habits
      : habits.filter((h) => h.id === selectedHabitId);

  const totalHabitsCount = activeHabits.length;
  const dayDataMap: Record<string, DayCompletionData> = {};

  let totalCompletions = 0;
  let totalPossible = 0;
  let perfectDaysCount = 0;
  let activeDaysCount = 0;
  let daysPassed = 0;

  // Streak tracking
  let currentStreakCounter = 0;
  let longestStreak = 0;
  let currentStreak = 0;

  const monthCompleted: number[] = new Array(12).fill(0);
  const monthPossible: number[] = new Array(12).fill(0);

  days.forEach((day) => {
    const { dateString, isFuture, month } = day;

    const habitStatuses = activeHabits.map((habit) => {
      const isNum = habit.target_type === 'numeric';
      const targetVal = habit.target_value ?? 1;
      const currentVal = habit.numericLogs?.[dateString] ?? (habit.logs?.[dateString] ? targetVal : 0);
      return {
        id: habit.id,
        title: habit.title,
        color: habit.color_theme,
        completed: Boolean(habit.logs?.[dateString]),
        isNumeric: isNum,
        currentValue: isNum ? currentVal : undefined,
        targetValue: isNum ? targetVal : undefined,
        unit: habit.unit ?? undefined,
      };
    });

    const completedCount = habitStatuses.filter((h) => h.completed).length;
    const rate = totalHabitsCount > 0 ? completedCount / totalHabitsCount : 0;

    let intensityLevel: 0 | 1 | 2 | 3 | 4 = 0;
    const singleHabit = activeHabits.length === 1 ? activeHabits[0] : null;

    if (singleHabit && singleHabit.target_type === 'numeric' && singleHabit.target_value) {
      const currentVal = singleHabit.numericLogs?.[dateString] ?? (singleHabit.logs?.[dateString] ? singleHabit.target_value : 0);
      const ratio = currentVal / singleHabit.target_value;
      if (ratio >= 1.0) intensityLevel = 4;
      else if (ratio >= 0.66) intensityLevel = 3;
      else if (ratio >= 0.33) intensityLevel = 2;
      else if (ratio > 0) intensityLevel = 1;
      else intensityLevel = 0;
    } else {
      if (completedCount > 0) {
        if (rate >= 0.85) intensityLevel = 4;
        else if (rate >= 0.6) intensityLevel = 3;
        else if (rate >= 0.35) intensityLevel = 2;
        else intensityLevel = 1;
      }
    }

    dayDataMap[dateString] = {
      dateString,
      completedCount,
      totalHabits: totalHabitsCount,
      completionRate: rate,
      intensityLevel,
      habits: habitStatuses,
    };

    if (!isFuture) {
      daysPassed++;
      totalCompletions += completedCount;
      totalPossible += totalHabitsCount;

      monthCompleted[month] += completedCount;
      monthPossible[month] += totalHabitsCount;

      if (completedCount > 0) {
        activeDaysCount++;
        currentStreakCounter++;
        if (currentStreakCounter > longestStreak) {
          longestStreak = currentStreakCounter;
        }
      } else {
        currentStreakCounter = 0;
      }

      if (totalHabitsCount > 0 && completedCount === totalHabitsCount) {
        perfectDaysCount++;
      }
    }
  });

  // Current streak (working backward from today or latest past day)
  let backStreak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    const day = days[i];
    if (day.isFuture) continue;
    const data = dayDataMap[day.dateString];
    if (data && data.completedCount > 0) {
      backStreak++;
    } else {
      break;
    }
  }
  currentStreak = backStreak;

  // Best month calculation
  let bestMonthIndex = 0;
  let bestMonthRate = 0;
  for (let m = 0; m < 12; m++) {
    if (monthPossible[m] > 0) {
      const mRate = (monthCompleted[m] / monthPossible[m]) * 100;
      if (mRate > bestMonthRate) {
        bestMonthRate = mRate;
        bestMonthIndex = m;
      }
    }
  }

  const annualRate = totalPossible > 0 ? (totalCompletions / totalPossible) * 100 : 0;

  return {
    dayDataMap,
    analytics: {
      year,
      totalCompletions,
      totalPossible,
      annualRate: Math.round(annualRate * 10) / 10,
      longestStreak,
      currentStreak,
      perfectDaysCount,
      activeDaysCount,
      totalDaysInYear: days.length,
      daysPassedInYear: daysPassed,
      bestMonthName: MONTH_NAMES_SHORT[bestMonthIndex],
      bestMonthRate: Math.round(bestMonthRate),
    },
  };
}
