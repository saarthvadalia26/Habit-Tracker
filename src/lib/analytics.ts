import { HabitWithLogs } from '@/types/database.types';
import { MonthDay, WeekGroup } from '@/lib/monthUtils';

export interface DayMetric {
  dateString: string;
  dayNumber: number;
  completedCount: number;
  incompleteCount: number;
  percentage: number;
  isPerfect: boolean;
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
  dayMetrics: Record<string, DayMetric>;
  dayMetricsList: DayMetric[];
  habitMetrics: Record<string, HabitMetric>;
  weekMetrics: WeekMetric[];
  topHabits: HabitMetric[];
  perfectDaysCount: number;
}

export function computeMonthlyAnalytics(
  habits: HabitWithLogs[],
  days: MonthDay[],
  weeks: WeekGroup[]
): MonthlyAnalytics {
  const totalHabits = habits.length;
  const daysInMonth = days.length;
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

    if (isPerfect) {
      perfectDaysCount++;
    }

    totalCompletedAll += completedOnDay;

    const metric: DayMetric = {
      dateString: day.dateString,
      dayNumber: day.dayNumber,
      completedCount: completedOnDay,
      incompleteCount: incompleteOnDay,
      percentage,
      isPerfect,
    };

    dayMetrics[day.dateString] = metric;
    dayMetricsList.push(metric);
  });

  // 2. Habit Metrics & Streaks
  const habitMetrics: Record<string, HabitMetric> = {};
  const todayStr = new Date().toISOString().split('T')[0];

  habits.forEach((habit) => {
    let completedCount = 0;
    days.forEach((day) => {
      if (habit.logs[day.dateString]) {
        completedCount++;
      }
    });

    const percentage = daysInMonth > 0 ? Math.round((completedCount / daysInMonth) * 100) : 0;

    // Calculate streak backwards from today
    let streak = 0;
    const sortedDays = [...days].sort((a, b) => b.dayNumber - a.dayNumber);
    const todayIndex = sortedDays.findIndex((d) => d.dateString === todayStr);
    const startIndex = todayIndex >= 0 ? todayIndex : 0;

    for (let i = startIndex; i < sortedDays.length; i++) {
      const d = sortedDays[i];
      if (habit.logs[d.dateString]) {
        streak++;
      } else {
        // If today is incomplete, allow streak to continue if yesterday was complete
        if (i === startIndex && d.dateString === todayStr) {
          continue;
        }
        break;
      }
    }

    habitMetrics[habit.id] = {
      habitId: habit.id,
      title: habit.title,
      colorTheme: habit.color_theme,
      completedDays: completedCount,
      goal: daysInMonth,
      percentage,
      currentStreak: streak,
    };
  });

  // 3. Weekly Metrics
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

  // 5. Overall percentage
  const overallPercentage = totalPossible > 0 ? Math.round((totalCompletedAll / totalPossible) * 100) : 0;

  return {
    overallPercentage,
    totalCompleted: totalCompletedAll,
    totalPossible,
    dayMetrics,
    dayMetricsList,
    habitMetrics,
    weekMetrics,
    topHabits,
    perfectDaysCount,
  };
}
