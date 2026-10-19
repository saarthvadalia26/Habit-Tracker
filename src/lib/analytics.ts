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

import {
  calculateCadenceStreak,
  getActiveDaysCountInMonth,
  isHabitScheduledForDay,
} from '@/lib/cadenceUtils';
import { CadenceConfig } from '@/types/cadence.types';

/**
 * Calculates continuous streak backwards starting from today across month/year boundaries,
 * taking into account Streak Armor freezes and scheduled Rest Cadence days.
 */
export function calculateContinuousStreak(
  logs: Record<string, boolean>,
  frozenLogs: Record<string, boolean> = {},
  cadence?: CadenceConfig
): number {
  if ((!logs || Object.keys(logs).length === 0) && (!frozenLogs || Object.keys(frozenLogs).length === 0)) {
    return 0;
  }
  return calculateCadenceStreak(logs, frozenLogs, cadence).currentStreak;
}

export function computeMonthlyAnalytics(
  habits: HabitWithLogs[],
  days: MonthDay[],
  weeks: WeekGroup[]
): MonthlyAnalytics {
  const totalHabits = habits.length;
  const daysInMonth = days.length;

  // Determine year and month from days array
  const sampleDate = days[0]?.dateString ? new Date(`${days[0].dateString}T00:00:00`) : new Date();
  const year = sampleDate.getFullYear();
  const month = sampleDate.getMonth();

  // 1. Habit Metrics & Cadence-Aware Goals
  const habitMetrics: Record<string, HabitMetric> = {};
  let totalPossible = 0;

  habits.forEach((habit) => {
    let completedCountInMonth = 0;
    days.forEach((day) => {
      if (habit.logs[day.dateString] || habit.frozenLogs?.[day.dateString]) {
        completedCountInMonth++;
      }
    });

    // The monthly goal respects the habit's active cadence days
    const habitGoal = getActiveDaysCountInMonth(year, month, habit.cadence as CadenceConfig | undefined);
    totalPossible += habitGoal;

    const percentage = habitGoal > 0 ? Math.round((completedCountInMonth / habitGoal) * 100) : 0;

    // Continuous streak with Streak Armor & Rest Cadence
    const currentStreak = calculateContinuousStreak(
      habit.logs,
      habit.frozenLogs,
      habit.cadence as CadenceConfig | undefined
    );

    habitMetrics[habit.id] = {
      habitId: habit.id,
      title: habit.title,
      colorTheme: habit.color_theme,
      completedDays: completedCountInMonth,
      goal: habitGoal,
      percentage,
      currentStreak,
    };
  });

  // Fallback to totalHabits * daysInMonth if totalPossible is 0 but habits exist
  if (totalPossible === 0 && totalHabits > 0) {
    totalPossible = totalHabits * daysInMonth;
  }

  // 2. Day Metrics
  const dayMetrics: Record<string, DayMetric> = {};
  const dayMetricsList: DayMetric[] = [];
  let totalCompletedAll = 0;
  let perfectDaysCount = 0;

  days.forEach((day) => {
    let completedOnDay = 0;
    let scheduledOnDay = 0;

    habits.forEach((habit) => {
      const isScheduled = isHabitScheduledForDay(
        habit.cadence as CadenceConfig | undefined,
        day.dateString
      );
      if (isScheduled) {
        scheduledOnDay++;
      }

      if (habit.logs[day.dateString] || habit.frozenLogs?.[day.dateString]) {
        completedOnDay++;
      }
    });

    const targetDenominator = scheduledOnDay > 0 ? scheduledOnDay : totalHabits;
    const incompleteOnDay = Math.max(0, targetDenominator - completedOnDay);
    const percentage = targetDenominator > 0 ? Math.round((completedOnDay / targetDenominator) * 100) : 0;
    const isPerfect = targetDenominator > 0 && completedOnDay >= targetDenominator;

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

  // Today specific metrics (accounting for scheduled active habits today)
  const todayDay = days.find((d) => d.isToday);
  const todayCompleted = todayDay ? dayMetrics[todayDay.dateString]?.completedCount || 0 : 0;
  
  let todayScheduledCount = 0;
  if (todayDay) {
    habits.forEach((h) => {
      if (isHabitScheduledForDay(h.cadence as CadenceConfig | undefined, todayDay.dateString)) {
        todayScheduledCount++;
      }
    });
  }
  const todayTotal = todayScheduledCount > 0 ? todayScheduledCount : totalHabits;
  const todayPercentage = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;


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