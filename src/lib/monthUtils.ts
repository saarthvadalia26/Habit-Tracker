/**
 * Month and calendar date utilities for the Smart Habit Tracker (Dark Mode Optimized)
 */

export interface MonthDay {
  dayNumber: number;        // 1 - 31
  dateString: string;       // YYYY-MM-DD
  dayOfWeekInitial: string; // M, T, W, T, F, S, S
  dayOfWeekName: string;    // Mon, Tue, etc.
  weekIndex: number;        // 0-4 (Week 1 to Week 5)
  isToday: boolean;
}

export interface WeekGroup {
  weekNumber: number;       // 1 - 5
  days: MonthDay[];
  color: {
    name: string;
    bg: string;
    headerBg: string;
    text: string;
    border: string;
    accent: string;
    ring: string;
  };
}

export const WEEK_COLORS = [
  {
    name: 'Cyan',
    headerBg: 'bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800/70',
    bg: 'bg-sky-50/60 dark:bg-sky-950/20',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-800/50',
    accent: '#38BDF8',
    ring: '#0284C7',
  },
  {
    name: 'Pink',
    headerBg: 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800/70',
    bg: 'bg-rose-50/60 dark:bg-rose-950/20',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800/50',
    accent: '#FB7185',
    ring: '#E11D48',
  },
  {
    name: 'Green',
    headerBg: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/70',
    bg: 'bg-emerald-50/60 dark:bg-emerald-950/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    accent: '#34D399',
    ring: '#059669',
  },
  {
    name: 'Orange',
    headerBg: 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/70',
    bg: 'bg-amber-50/60 dark:bg-amber-950/20',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/50',
    accent: '#FBBF24',
    ring: '#D97706',
  },
  {
    name: 'Lime',
    headerBg: 'bg-lime-100 dark:bg-lime-950/70 text-lime-800 dark:text-lime-300 border-lime-300 dark:border-lime-800/70',
    bg: 'bg-lime-50/60 dark:bg-lime-950/20',
    text: 'text-lime-700 dark:text-lime-300',
    border: 'border-lime-200 dark:border-lime-800/50',
    accent: '#A3E635',
    ring: '#65A30D',
  },
];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Returns all days for a specific year and month (0-indexed month: 0 = Jan, 8 = Sept)
 */
export function getDaysForMonth(year: number, month: number): MonthDay[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentYearMonth = today.getFullYear() === year && today.getMonth() === month;
  const currentDay = today.getDate();

  const days: MonthDay[] = [];
  const weekdayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // Sunday = 0
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const dayOfWeek = d.getDay();
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateString = `${year}-${mm}-${dd}`;

    // Group into 7-day chunks (Week 1 = days 1-7, Week 2 = 8-14, etc.)
    const weekIndex = Math.min(4, Math.floor((day - 1) / 7));

    days.push({
      dayNumber: day,
      dateString,
      dayOfWeekInitial: weekdayLetters[dayOfWeek],
      dayOfWeekName: weekdayNames[dayOfWeek],
      weekIndex,
      isToday: isCurrentYearMonth && day === currentDay,
    });
  }

  return days;
}

/**
 * Groups month days into weeks (1 to 5)
 */
export function groupDaysIntoWeeks(days: MonthDay[]): WeekGroup[] {
  const weeks: WeekGroup[] = [];
  const maxWeekIndex = Math.max(...days.map((d) => d.weekIndex), 4);

  for (let w = 0; w <= maxWeekIndex; w++) {
    const weekDays = days.filter((d) => d.weekIndex === w);
    if (weekDays.length > 0) {
      weeks.push({
        weekNumber: w + 1,
        days: weekDays,
        color: WEEK_COLORS[w % WEEK_COLORS.length],
      });
    }
  }

  return weeks;
}
