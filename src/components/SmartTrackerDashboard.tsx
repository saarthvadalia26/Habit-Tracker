'use client';

import { useState, useTransition, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  Check,
  X as CloseIcon,
  Trophy,
  Flame,
  CheckCircle2,
  XCircle,
  Lock,
} from 'lucide-react';
import { HabitWithLogs } from '@/types/database.types';
import {
  getDaysForMonth,
  groupDaysIntoWeeks,
  MONTH_NAMES,
  MonthDay,
} from '@/lib/monthUtils';
import { computeMonthlyAnalytics } from '@/lib/analytics';
import { DailyProgressWaveChart } from '@/components/DailyProgressWaveChart';
import { CircularGauge } from '@/components/CircularGauge';
import { NotesSection } from '@/components/NotesSection';
import { CreateHabitModal } from '@/components/CreateHabitModal';
import { AuthModal } from '@/components/AuthModal';
import {
  createHabitAction,
  deleteHabitAction,
  toggleHabitLogAction,
} from '@/app/actions/habits';
import { toast } from 'sonner';
import { useTheme } from '@/context/ThemeContext';

interface SmartTrackerDashboardProps {
  initialHabits: HabitWithLogs[];
  isGuestMode?: boolean;
}

export function SmartTrackerDashboard({
  initialHabits,
  isGuestMode = false,
}: SmartTrackerDashboardProps) {
  const { isDark } = useTheme();
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // 0-11
  const [habits, setHabits] = useState<HabitWithLogs[]>(initialHabits);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [, startTransition] = useTransition();

  // Keep habits synchronized with initialHabits
  useEffect(() => {
    setHabits(initialHabits);
  }, [initialHabits]);

  // Compute Days & Weeks for the active month
  const days: MonthDay[] = useMemo(
    () => getDaysForMonth(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  );

  const weeks = useMemo(() => groupDaysIntoWeeks(days), [days]);

  // Compute complete analytics
  const analytics = useMemo(
    () => computeMonthlyAnalytics(habits, days, weeks),
    [habits, days, weeks]
  );

  // Optimistic Toggle Handler across any month (past, present, future)
  const handleToggleCell = async (habitId: string, date: string) => {
    // Unauthenticated visitors cannot modify or tick boxes
    if (isGuestMode) {
      toast.info('Sign in required to track habits', {
        description: 'Create an account or sign in to track your personal rituals and streaks.',
        action: {
          label: 'Sign In',
          onClick: () => setIsAuthModalOpen(true),
        },
      });
      setIsAuthModalOpen(true);
      return;
    }

    const targetHabit = habits.find((h) => h.id === habitId);
    if (!targetHabit) return;

    const previousStatus = Boolean(targetHabit.logs[date]);
    const nextStatus = !previousStatus;

    // 1. Update React state immediately
    const nextHabits = habits.map((h) => {
      if (h.id === habitId) {
        return {
          ...h,
          logs: {
            ...h.logs,
            [date]: nextStatus,
          },
        };
      }
      return h;
    });
    setHabits(nextHabits);

    // 2. Sync to Supabase backend in the background
    startTransition(async () => {
      try {
        const response = await toggleHabitLogAction(habitId, date, nextStatus);
        if (response.error) {
          setHabits(habits);
          toast.error(response.error);
        }
      } catch (err: unknown) {
        setHabits(habits);
        toast.error(
          err instanceof Error ? err.message : 'Failed to update habit'
        );
      }
    });
  };

  // Create Habit
  const handleCreateHabit = async (title: string, colorTheme: string) => {
    if (isGuestMode) {
      setIsAuthModalOpen(true);
      return;
    }

    const res = await createHabitAction(title, colorTheme);
    if (res.error) {
      toast.error(res.error);
      return;
    }

    if (res.data) {
      setHabits((prev) => [
        ...prev,
        {
          ...res.data!,
          logs: {},
        },
      ]);
      toast.success(`Habit "${title}" created!`);
    }
  };

  // Delete Habit with Sonner Confirmation Toast
  const handleDeleteHabit = (habitId: string, title: string) => {
    if (isGuestMode) {
      toast.info('Sign in required to modify habits', {
        action: {
          label: 'Sign In',
          onClick: () => setIsAuthModalOpen(true),
        },
      });
      setIsAuthModalOpen(true);
      return;
    }

    toast.error(`Remove "${title}"?`, {
      description: 'This will delete the habit and its records across all months.',
      action: {
        label: 'Delete',
        onClick: () => {
          const updated = habits.filter((h) => h.id !== habitId);
          setHabits(updated);

          startTransition(async () => {
            const res = await deleteHabitAction(habitId);
            if (res.error) {
              setHabits(habits);
              toast.error(res.error);
            } else {
              toast.success(`"${title}" deleted`);
            }
          });
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    });
  };

  // Reset / Clear active month logs with Sonner Confirmation Toast
  const handleResetMonth = () => {
    if (isGuestMode) {
      toast.info('Sign in required to modify habits', {
        description: 'Sign in to customize and track your personal habit matrix.',
        action: {
          label: 'Sign In',
          onClick: () => setIsAuthModalOpen(true),
        },
      });
      setIsAuthModalOpen(true);
      return;
    }

    toast.warning(`Clear logs for ${MONTH_NAMES[selectedMonth]} ${selectedYear}?`, {
      description: 'This will reset all completion checkmarks for this specific month without affecting other months.',
      action: {
        label: 'Clear All',
        onClick: () => {
          const monthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
          const updated = habits.map((h) => {
            const updatedLogs = { ...h.logs };
            Object.keys(updatedLogs).forEach((dateKey) => {
              if (dateKey.startsWith(monthPrefix)) {
                delete updatedLogs[dateKey];
              }
            });
            return { ...h, logs: updatedLogs };
          });
          setHabits(updated);
          toast.success(`Cleared logs for ${MONTH_NAMES[selectedMonth]} ${selectedYear}`);
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    });
  };

  return (
    <div className="w-full space-y-5">
      {/* ========================================================================= */}
      {/* 1. TOP SECTION (Habit Tracker Title / Month Picker / Wave Chart / Donut) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Top-Left: Brand & Date Controls */}
        <div className="lg:col-span-3 bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-xl dark:shadow-2xl flex flex-col justify-between transition-colors">
          <div>
            <div className="border border-slate-200 dark:border-slate-700/80 rounded-2xl p-2.5 text-center bg-slate-50/90 dark:bg-slate-950/70 mb-4 shadow-xs dark:shadow-inner">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
                HABIT <span className="text-rose-500 dark:text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]">TRACKER</span>
              </h2>
            </div>

            {/* Month & Year Selectors */}
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-2 transition-colors">
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full bg-transparent font-bold text-slate-900 dark:text-slate-100 outline-none cursor-pointer focus:text-indigo-600 dark:focus:text-indigo-400 transition-colors"
                >
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={m} value={idx} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-2 transition-colors">
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full bg-transparent font-bold text-slate-900 dark:text-slate-100 outline-none cursor-pointer focus:text-indigo-600 dark:focus:text-indigo-400 transition-colors"
                >
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <option key={y} value={y} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <button
              onClick={handleResetMonth}
              className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 transition-colors uppercase tracking-wider cursor-pointer"
              title="Reset current month checkmarks"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Month</span>
            </button>

            <span className="text-[11px] font-bold text-slate-500 font-mono">
              {days.length} Days
            </span>
          </div>
        </div>

        {/* Top-Center: Daily Progress Wave Chart */}
        <div className="lg:col-span-6 bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-xl dark:shadow-2xl flex flex-col justify-between transition-colors">
          <DailyProgressWaveChart dayMetrics={analytics.dayMetricsList} color="#FB7185" />
        </div>

        {/* Top-Right: Overall Monthly Progress Gauge */}
        <div className="lg:col-span-3 bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-xl dark:shadow-2xl flex items-center justify-around transition-colors">
          <CircularGauge
            percentage={analytics.overallPercentage}
            size={105}
            strokeWidth={10}
            color="#FB7185"
            bgColor={isDark ? '#1E293B' : '#E2E8F0'}
            sublabel="Monthly"
            label="Overall Progress"
          />
          <div className="text-right flex flex-col justify-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">
              Monthly Total
            </span>
            <div className="flex items-baseline justify-end gap-1 mt-0.5">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono transition-colors">
                {analytics.totalCompleted}
              </span>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 font-mono">
                / {analytics.totalPossible}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5">
              Checkmarks ({habits.length} habits × {days.length}d)
            </span>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 justify-end">
              <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{analytics.perfectDaysCount} Perfect Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THE MAIN SMART HABIT MATRIX (Week 1 to 5 Color Grouped Grid) */}
      {/* ========================================================================= */}
      <div className="bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-xl dark:shadow-2xl overflow-hidden transition-colors">
        {/* Table Action Bar */}
        <div className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/60 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
              {MONTH_NAMES[selectedMonth]} {selectedYear} Consistency Matrix
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 rounded-full shadow-xs">
              {habits.length} Habits
            </span>
            {isGuestMode && (
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 rounded-full shadow-xs flex items-center gap-1 font-mono">
                <Lock className="w-2.5 h-2.5" />
                <span>View-Only Preview</span>
              </span>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (isGuestMode) {
                setIsAuthModalOpen(true);
              } else {
                setIsModalOpen(true);
              }
            }}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Habit</span>
          </motion.button>
        </div>

        {/* Scrollable Spreadsheet Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left min-w-[920px]">
            {/* Header: Weeks Top Row */}
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
                {/* Habit title column */}
                <th
                  rowSpan={2}
                  className="p-3 bg-purple-100/70 dark:bg-purple-950/50 text-purple-900 dark:text-purple-200 border-r border-slate-200 dark:border-slate-800 min-w-[210px] align-bottom transition-colors"
                >
                  <div className="text-[11px] uppercase tracking-wider font-extrabold text-purple-800 dark:text-purple-300 font-mono">
                    DAILY HABIT
                  </div>
                  <div className="text-[10px] font-semibold text-purple-600/80 dark:text-purple-400/80 font-mono">
                    DAYS {days.length} / {days.length}
                  </div>
                </th>

                {/* Week Columns */}
                {weeks.map((week) => (
                  <th
                    key={week.weekNumber}
                    colSpan={week.days.length}
                    className={`p-2 text-center border-r border-slate-200 dark:border-slate-800 ${week.color.headerBg} text-[11px] font-black uppercase tracking-wider font-mono transition-colors`}
                  >
                    WEEK {week.weekNumber}
                  </th>
                ))}

                {/* Right Progress Summary Header */}
                <th
                  colSpan={4}
                  className="p-2 text-center bg-rose-100/70 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 border-l border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider font-mono transition-colors"
                >
                  PROGRESS • COMPLETED ({analytics.totalCompleted} / {analytics.totalPossible})
                </th>
              </tr>

              {/* Subheader: Day initials (W T F S S M T) & Day Numbers */}
              <tr className="border-b border-slate-200 dark:border-slate-800 text-center text-[10px] font-bold">
                {days.map((day) => {
                  return (
                    <th
                      key={day.dateString}
                      className={`p-1 border-r border-slate-200/80 dark:border-slate-800/80 ${
                        day.isToday
                          ? 'bg-indigo-100 dark:bg-indigo-950/90 text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-500/50'
                          : 'bg-slate-50/80 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400'
                      } transition-colors`}
                      style={{ width: '28px', minWidth: '28px' }}
                    >
                      <div className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-500">
                        {day.dayOfWeekInitial}
                      </div>
                      <div
                        className={`text-[10px] font-extrabold mt-0.5 ${
                          day.isToday ? 'text-indigo-600 dark:text-indigo-400 font-black' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {day.dayNumber}
                      </div>
                    </th>
                  );
                })}

                {/* Goal, %, Progress Bar, Ratio headers */}
                <th className="p-1 px-2 bg-slate-50/90 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 text-[9px] uppercase font-bold font-mono">
                  Goal
                </th>
                <th className="p-1 px-2 bg-slate-50/90 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 text-[9px] uppercase font-bold font-mono">
                  %
                </th>
                <th className="p-1 px-3 bg-slate-50/90 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 min-w-[120px] text-[9px] uppercase font-bold text-left font-mono">
                  Progress Bar
                </th>
                <th className="p-1 px-2 bg-slate-50/90 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 text-[9px] uppercase font-bold text-right font-mono">
                  Ratio
                </th>
              </tr>
            </thead>

            {/* Habit Rows */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {habits.length === 0 ? (
                <tr>
                  <td
                    colSpan={days.length + 5}
                    className="py-14 px-4 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                        <Plus className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          Your habit tracker is empty
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Add your daily routines to start tracking consistency across this month.
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => {
                          if (isGuestMode) {
                            setIsAuthModalOpen(true);
                          } else {
                            setIsModalOpen(true);
                          }
                        }}
                        className="mt-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Add Your First Habit</span>
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ) : (
                habits.map((habit, habitIndex) => {
                  const metric = analytics.habitMetrics[habit.id] || {
                    completedDays: 0,
                    goal: days.length,
                    percentage: 0,
                    currentStreak: 0,
                  };

                  return (
                    <tr
                      key={habit.id}
                      className="hover:bg-slate-50/90 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                    {/* Habit Index & Name */}
                    <td className="p-2.5 px-3 border-r border-slate-200 dark:border-slate-800 font-medium text-slate-800 dark:text-slate-200">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 font-semibold w-4 shrink-0">
                            {habitIndex + 1}.
                          </span>
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                            style={{
                              backgroundColor: habit.color_theme,
                              boxShadow: `0 0 8px ${habit.color_theme}60`,
                            }}
                          />
                          <span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">
                            {habit.title}
                          </span>
                        </div>

                        {!isGuestMode && (
                          <button
                            type="button"
                            onClick={() => handleDeleteHabit(habit.id, habit.title)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-opacity p-1 cursor-pointer"
                            title="Delete habit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Day Cells (1 to 31) */}
                    {days.map((day) => {
                      const isCompleted = Boolean(habit.logs[day.dateString]);
                      const week = weeks[day.weekIndex] || weeks[0];

                      return (
                        <td
                          key={day.dateString}
                          className={`p-0 text-center border-r border-slate-200/80 dark:border-slate-800/60 ${
                            day.isToday ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleCell(habit.id, day.dateString)}
                            className="w-full h-8 flex items-center justify-center cursor-pointer transition-transform outline-none group/cell"
                            title={
                              isGuestMode
                                ? `Sign in to check off ${habit.title}`
                                : `${habit.title} on Day ${day.dayNumber} (${day.dayOfWeekName})`
                            }
                          >
                            <motion.div
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.85 }}
                              style={{
                                borderColor: isCompleted ? week.color.accent : isDark ? '#334155' : '#CBD5E1',
                                backgroundColor: isCompleted ? week.color.accent : 'transparent',
                                boxShadow: isCompleted ? `0 0 10px ${week.color.accent}70` : 'none',
                              }}
                              className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors duration-150 ${
                                isCompleted
                                  ? 'text-white'
                                  : 'hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                              }`}
                            >
                              {isCompleted && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{
                                    type: 'spring',
                                    stiffness: 600,
                                    damping: 25,
                                  }}
                                >
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </motion.div>
                              )}
                            </motion.div>
                          </button>
                        </td>
                      );
                    })}

                    {/* Right-Side Metrics */}
                    <td className="p-2 px-2 text-center font-mono text-[11px] text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800">
                      {metric.goal}
                    </td>

                    <td className="p-2 px-2 text-center font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      {metric.percentage}%
                    </td>

                    {/* Horizontal Progress Bar */}
                    <td className="p-2 px-3">
                      <div className="w-full bg-slate-200 dark:bg-slate-800/80 rounded-full h-2.5 overflow-hidden flex border border-slate-300/60 dark:border-slate-700/50">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.percentage}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{
                            backgroundColor:
                              metric.percentage >= 80
                                ? '#34D399'
                                : metric.percentage >= 60
                                ? '#FB7185'
                                : '#FBBF24',
                            boxShadow: `0 0 8px ${
                              metric.percentage >= 80
                                ? 'rgba(52,211,153,0.5)'
                                : metric.percentage >= 60
                                ? 'rgba(251,113,133,0.5)'
                                : 'rgba(251,191,36,0.5)'
                            }`,
                          }}
                        />
                      </div>
                    </td>

                    {/* Ratio (e.g. 21 / 31) */}
                    <td className="p-2 px-2 text-right font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {metric.completedDays}/{metric.goal}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM SECTION: WEEKLY PROGRESS GAUGES, TOP 7 & NOTES */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left & Center: Weekly Progress Dashboard (5 Gauges + Day breakdown) */}
        <div className="lg:col-span-8 bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-xl dark:shadow-2xl flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
                  WEEKLY PROGRESS
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                </span>
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                  <XCircle className="w-3.5 h-3.5" /> Incomplete
                </span>
              </div>
            </div>

            {/* 5 Circular Gauges (Week 1 to 5) */}
            <div className="grid grid-cols-5 gap-2 py-4">
              {weeks.map((week, idx) => {
                const metric = analytics.weekMetrics[idx] || {
                  percentage: 0,
                  completed: 0,
                  possible: 0,
                };
                return (
                  <div
                    key={week.weekNumber}
                    className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50/90 dark:bg-slate-950/70 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-inner transition-colors"
                  >
                    <CircularGauge
                      percentage={metric.percentage}
                      size={72}
                      strokeWidth={7}
                      color={week.color.accent}
                      bgColor={isDark ? '#1E293B' : '#E2E8F0'}
                      label={`WEEK ${week.weekNumber}`}
                      showTickMarks={false}
                    />
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                      {metric.completed}/{metric.possible}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Day Breakdown Rows (Completed & Incomplete counts per day) */}
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-center border-collapse text-[10px] font-mono">
                <thead>
                  <tr className="bg-slate-50/90 dark:bg-slate-950/80 text-slate-500 border-y border-slate-200 dark:border-slate-800">
                    <th className="p-1.5 px-2 text-left font-sans font-bold text-slate-600 dark:text-slate-400 min-w-[120px]">
                      Daily Breakdown
                    </th>
                    {days.map((d) => (
                      <th key={d.dateString} className="p-1 px-0.5 w-6 text-slate-600 dark:text-slate-400">
                        {d.dayNumber}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {/* Completed row */}
                  <tr>
                    <td className="p-1.5 px-2 text-left font-sans font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/20 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Completed
                    </td>
                    {days.map((d) => {
                      const count = analytics.dayMetrics[d.dateString]?.completedCount || 0;
                      return (
                        <td
                          key={d.dateString}
                          className="p-1 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50/40 dark:bg-emerald-950/10"
                        >
                          {count}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Incomplete row */}
                  <tr>
                    <td className="p-1.5 px-2 text-left font-sans font-semibold text-rose-700 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/20 flex items-center gap-1">
                      <CloseIcon className="w-3 h-3 text-rose-600 dark:text-rose-400" /> Incomplete
                    </td>
                    {days.map((d) => {
                      const count = analytics.dayMetrics[d.dateString]?.incompleteCount || 0;
                      return (
                        <td
                          key={d.dateString}
                          className="p-1 text-slate-500 font-semibold bg-rose-50/40 dark:bg-rose-950/10"
                        >
                          {count}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: TOP 7 DAILY HABITS Leaderboard & Notes */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Top 7 Leaderboard */}
          <div className="bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-xl dark:shadow-2xl transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
                  TOP 7 DAILY HABITS
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                {analytics.overallPercentage}% Avg
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {analytics.topHabits.length === 0 ? (
                <div className="py-6 px-4 text-center rounded-xl bg-slate-50/60 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800/70 text-xs text-slate-400 dark:text-slate-500 font-medium">
                  No habits added yet.
                </div>
              ) : (
                analytics.topHabits.map((habit, idx) => (
                <div
                  key={habit.habitId}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50/90 hover:bg-slate-100/90 dark:bg-slate-950/60 dark:hover:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800/50 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-4 text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">
                      {idx + 1}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                      style={{
                        backgroundColor: habit.colorTheme,
                        boxShadow: `0 0 6px ${habit.colorTheme}70`,
                      }}
                    />
                    <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                      {habit.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {habit.currentStreak > 0 && (
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/60 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5 fill-amber-500 dark:fill-amber-400" />
                        {habit.currentStreak}d
                      </span>
                    )}
                    <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      {habit.completedDays}/{habit.goal}
                    </span>
                  </div>
                </div>
              )))}
            </div>
          </div>

          {/* Notes & Intentions Pad with Per-Month Key */}
          <NotesSection
            storageKey={`habit_notes_${selectedYear}_${selectedMonth}`}
            readOnly={isGuestMode}
            onRequireAuth={() => setIsAuthModalOpen(true)}
          />
        </div>
      </div>

      {/* Habit Creation Modal */}
      <CreateHabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateHabit}
      />

      {/* Auth Modal for Guests */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode="signin"
      />
    </div>
  );
}
