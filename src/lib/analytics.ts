import { HabitWithLogs } from '@/types/database.types';
import { MonthDay, WeekGroup } from '@/lib/monthUtils';
import { formatDateToISO } from '@/lib/dateUtils';

export interface DayMetric {
  dateString: string;
  dayNumber: number;
  completedCount: number;
  incompleteCount: number;
  percentage: number;
  isPerfect: boolean;
  isUpcoming: boolean;
}

export interface HabitMetric {
  habitId: string;
  title: string;
  colorTheme: string;
  completedDays: number;
  goal: number;
  percentage: number;
  currentStreak: number;
}

export interface WeekMetric {
  weekNumber: number;
  completed: number;
  possible: number;
  percentage: number;
}

export interface MonthlyAnalytics {
  overallPercentage: number;
  totalCompleted: number;
  totalPossible: number;
  todayCompleted: number;
  todayTotal: number;
  todayPercentage: number;
  dayMetrics: Record<string, DayMetric>;
  dayMetricsList: DayMetric[];
  habitMetrics: Record<string, HabitMetric>;
  weekMetrics: WeekMetric[];
  topHabits: HabitMetric[];
  perfectDaysCount: number;
}

/**
 * Calculates continuous streak backwards starting from today across month/year boundaries
 */
export function calculateContinuousStreak(logs: Record<string, boolean>): number {
  if (!logs || Object.keys(logs).length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayStr = formatDateToISO(today);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateToISO(yesterday);

  let streak = 0;
  let currentDate = new Date(today);

  // If today is completed, streak starts from today
  if (logs[todayStr]) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  } else if (logs[yesterdayStr]) {
    // If today is not completed yet, allow streak to continue from yesterday
    currentDate = yesterday;
  } else {
    // Neither today nor yesterday completed: active streak is broken
    return 0;
  }

  // Count backwards day by day as long as habit log is true
  while (true) {
    const dateStr = formatDateToISO(currentDate);
    if (logs[dateStr]) {
      // If we didn't count yesterday already in the first step
      if (currentDate.getTime() !== today.getTime()) {
        streak++;
      }
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function computeMonthlyAnalytics(
  habits: HabitWithLogs[],
  days: MonthDay[],
  weeks: WeekGroup[]
): MonthlyAnalytics {
  const totalHabits = habits.length;
  const daysInMonth = days.length;

  // True total possible checkmarks for the entire month (e.g. 7 habits × 31 days = 217)
  const totalPossible = totalHabits * daysInMonth;

  // 1. Day Metrics
  const dayMetrics: Record<string, DayMetric> = {};
  const dayMetricsList: DayMetric[] = [];
  let totalCompletedAll = 0;
  let perfectDaysCount = 0;

  days.forEach((day) => {
    let completedOnDay = 0;
    habits.forEach((habit) => {
      if (habit.logs[day.dateString]) {
        completedOnDay++;
      }
    });

    const incompleteOnDay = Math.max(0, totalHabits - completedOnDay);
    const percentage = totalHabits > 0 ? Math.round((completedOnDay / totalHabits) * 100) : 0;
    const isPerfect = totalHabits > 0 && completedOnDay === totalHabits;

    if (isPerfect && !day.isUpcoming) {
      perfectDaysCount++;
    }

    // Accumulate total completed checkmarks in this month
    totalCompletedAll += completedOnDay;

    const metric: DayMetric = {
      dateString: day.dateString,
      dayNumber: day.dayNumber,
      completedCount: completedOnDay,
      incompleteCount: incompleteOnDay,
      percentage,
      isPerfect,
      isUpcoming: day.isUpcoming,
    };

    dayMetrics[day.dateString] = metric;
    dayMetricsList.push(metric);
  });

  // Today specific metrics (e.g. 3 of 7 habits completed today = 43%)
  const todayDay = days.find((d) => d.isToday);
  const todayCompleted = todayDay ? dayMetrics[todayDay.dateString]?.completedCount || 0 : 0;
  const todayTotal = totalHabits;
  const todayPercentage = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  // 2. Habit Metrics & Continuous Streaks
  const habitMetrics: Record<string, HabitMetric> = {};

  habits.forEach((habit) => {
    let completedCountInMonth = 0;
    days.forEach((day) => {
      if (habit.logs[day.dateString]) {
        completedCountInMonth++;
      }
    });

    // The monthly goal for a habit is the total days in that month (e.g. 31 days)
    const goal = daysInMonth;
    const percentage = goal > 0 ? Math.round((completedCountInMonth / goal) * 100) : 0;

    // Continuous streak across all dates in habit.logs (preserves cross-month streaks)
    const currentStreak = calculateContinuousStreak(habit.logs);

    habitMetrics[habit.id] = {
      habitId: habit.id,
      title: habit.title,
      colorTheme: habit.color_theme,
      completedDays: completedCountInMonth,
      goal,
      percentage,
      currentStreak,
    };
  });

  // 3. Weekly Metrics (Each week measured by its actual days in that week: totalHabits * week.days.length)
  const weekMetrics: WeekMetric[] = weeks.map((week) => {
    let weekCompleted = 0;
    const weekPossible = totalHabits * week.days.length;

    week.days.forEach((day) => {
      habits.forEach((habit) => {
        if (habit.logs[day.dateString]) {
          weekCompleted++;
        }
      });
    });

    const percentage = weekPossible > 0 ? Math.round((weekCompleted / weekPossible) * 100) : 0;

    return {
      weekNumber: week.weekNumber,
      completed: weekCompleted,
      possible: weekPossible,
      percentage,
    };
  });

  // 4. Top Habits Leaderboard (Top 7)
  const topHabits = Object.values(habitMetrics)
    .sort((a, b) => b.completedDays - a.completedDays)
    .slice(0, 7);

  // 5. True Overall Monthly Percentage: total completed checkmarks in month / (totalHabits * daysInMonth)
  const overallPercentage = totalPossible > 0 ? Math.round((totalCompletedAll / totalPossible) * 100) : 0;

  return {
    overallPercentage,
    totalCompleted: totalCompletedAll,
    totalPossible,
    todayCompleted,
    todayTotal,
    todayPercentage,
    dayMetrics,
    dayMetricsList,
    habitMetrics,
    weekMetrics,
    topHabits,
    perfectDaysCount,
  };
}