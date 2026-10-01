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
  Pencil,
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
import { updateCustomNameAction } from '@/app/actions/auth';
import { ChallengeBanner } from '@/components/ChallengeBanner';
import { CreateChallengeModal } from '@/components/CreateChallengeModal';
import { Challenge } from '@/types/challenge.types';
import {
  createChallengeAction,
  completeChallengeAction,
  abandonChallengeAction,
} from '@/app/actions/challenges';

interface SmartTrackerDashboardProps {
  initialHabits: HabitWithLogs[];
  isGuestMode?: boolean;
  userEmail?: string | null;
  initialCustomName?: string;
  initialChallenge?: Challenge | null;
}

export function SmartTrackerDashboard({
  initialHabits,
  isGuestMode = false,
  userEmail,
  initialCustomName = '',
  initialChallenge = null,
}: SmartTrackerDashboardProps) {
  const { isDark } = useTheme();
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // 0-11
  const [habits, setHabits] = useState<HabitWithLogs[]>(initialHabits);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(initialChallenge ?? null);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState<boolean>(false);

  // Sync or restore challenge (with guest localStorage fallback)
  useEffect(() => {
    if (initialChallenge) {
      setChallenge(initialChallenge);
    } else {
      try {
        const key = userEmail ? `habit_challenge_${userEmail}` : 'habit_challenge_guest';
        const saved = localStorage.getItem(key);
        if (saved) {
          setChallenge(JSON.parse(saved));
        }
      } catch {}
    }
  }, [initialChallenge, userEmail]);

  const handleCreateChallenge = async (
    title: string,
    durationDays: number,
    startDate: string,
    habitIds: string[]
  ) => {
    if (isGuestMode) {
      const guestChallenge: Challenge = {
        id: `guest-challenge-${Date.now()}`,
        title,
        duration_days: durationDays,
        start_date: startDate,
        habit_ids: habitIds,
        status: 'active',
      };
      setChallenge(guestChallenge);
      localStorage.setItem('habit_challenge_guest', JSON.stringify(guestChallenge));
      toast.success(`Launched ${durationDays}-Day Challenge!`, { description: `Goal: ${title}. Stay unbroken!`, });
      return;
    }

    try {
      const res = await createChallengeAction(title, durationDays, startDate, habitIds);
      if (res.error) {
        toast.error('Failed to create challenge', { description: res.error });
      } else if (res.data) {
        setChallenge(res.data);
        if (userEmail) {
          localStorage.setItem(`habit_challenge_${userEmail}`, JSON.stringify(res.data));
        }
        toast.success(`Launched ${durationDays}-Day Challenge!`, { description: `Goal: ${title} (${durationDays} days). Stay unbroken!`, });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to launch challenge');
    }
  };

  const handleCompleteChallenge = async (challengeId: string) => {
    setChallenge(null);
    const key = userEmail ? `habit_challenge_${userEmail}` : 'habit_challenge_guest';
    localStorage.removeItem(key);

    if (!isGuestMode) {
      try {
        await completeChallengeAction(challengeId);
      } catch {}
    }
  };

  const handleAbandonChallenge = async (challengeId: string) => {
    setChallenge(null);
    const key = userEmail ? `habit_challenge_${userEmail}` : 'habit_challenge_guest';
    localStorage.removeItem(key);

    if (!isGuestMode) {
      try {
        await abandonChallengeAction(challengeId);
      } catch {}
    }
  };
  const [, startTransition] = useTransition();

  const [customName, setCustomName] = useState<string>(() => initialCustomName || '');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>('');
  const [shakingCellKey, setShakingCellKey] = useState<string | null>(null);

  useEffect(() => {
    // If guest mode or unauthenticated visitor
    if (isGuestMode || !userEmail) {
      setCustomName('');
      localStorage.removeItem('habit_tracker_custom_name');
      return;
    }

    // Priority 1: Supabase account metadata (cloud source of truth across all devices)
    if (initialCustomName && initialCustomName.trim() !== '') {
      setCustomName(initialCustomName);
      localStorage.setItem(`habit_tracker_custom_name_${userEmail}`, initialCustomName);
      localStorage.removeItem('habit_tracker_custom_name');
      return;
    }

    // Priority 2: Account-scoped local storage for THIS specific email
    const userScopedKey = `habit_tracker_custom_name_${userEmail}`;
    const saved = localStorage.getItem(userScopedKey);
    if (saved && saved.trim() !== '') {
      setCustomName(saved);
      return;
    }

    // Priority 3: Fresh account default extracted from user email (e.g. Alex for alex@gmail.com)
    const extracted = userEmail.split('@')[0].replace(/[0-9_.-]/g, '');
    if (extracted && extracted.length >= 2) {
      const capitalized = extracted.charAt(0).toUpperCase() + extracted.slice(1).toLowerCase();
      setCustomName(capitalized);
    } else {
      setCustomName('');
    }

    // Purge any stale un-scoped legacy key
    localStorage.removeItem('habit_tracker_custom_name');
  }, [initialCustomName, userEmail, isGuestMode]);

  const formattedName = useMemo(() => {
    const trimmed = customName.trim();
    if (!trimmed || trimmed.toUpperCase() === 'HABIT') {
      return 'HABIT';
    }
    const upper = trimmed.toUpperCase();
    if (upper.endsWith("'S") || upper.endsWith('’S')) {
      return upper;
    }
    if (upper.endsWith('S')) {
      return `${upper}'`;
    }
    return `${upper}'S`;
  }, [customName]);

  // Smooth, non-intrusive authentication notification prompt
  const handleRequireAuth = (actionDescription: string) => {
    toast.info('Sign in required', {
      description: `Please sign in or create an account to ${actionDescription}.`,
      duration: 6500,
      action: {
        label: 'Sign In',
        onClick: () => setIsAuthModalOpen(true),
      },
    });
  };

  const handleTitleClick = () => {
    if (isGuestMode) {
      handleRequireAuth('personalize your habit tracker title');
      return;
    }
    setTempName(customName);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (isGuestMode) {
      setIsEditingName(false);
      handleRequireAuth('personalize your habit tracker title');
      return;
    }
    const clean = tempName.trim().slice(0, 18);
    setCustomName(clean);
    if (userEmail) {
      if (clean) {
        localStorage.setItem(`habit_tracker_custom_name_${userEmail}`, clean);
      } else {
        localStorage.removeItem(`habit_tracker_custom_name_${userEmail}`);
      }
    }
    localStorage.removeItem('habit_tracker_custom_name');
    setIsEditingName(false);

    if (clean) {
      toast.success(`Personalized as "${clean}'s Tracker"!`, {
        description: 'Syncing title across all your devices...',
      });
    } else {
      toast.info('Reset to default Habit Tracker');
    }

    // Persist across devices in Supabase Auth user metadata
    try {
      const res = await updateCustomNameAction(clean);
      if (res?.error) {
        toast.error('Failed to sync across devices', { description: res.error });
      }
    } catch {
      // Local state and localStorage already updated
    }
  };

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
  const handleToggleCell = async (habitId: string, date: string, day?: MonthDay) => {
    // Unauthenticated visitors cannot modify or tick boxes
    if (isGuestMode) {
      handleRequireAuth('track daily progress and build streaks');
      return;
    }

    const cellKey = `${habitId}-${date}`;
    const targetDay = day || days.find((d) => d.dateString === date);

    // Calculate difference from today as defensive fallback
    const [y, m, d] = date.split('-').map(Number);
    const targetDate = new Date(y, m - 1, d);
    targetDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.round((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
    const isUpcoming = targetDay ? targetDay.isUpcoming : diffDays < 0;
    const isExpired = targetDay ? targetDay.isExpired : diffDays > 3;

    // Rule 1: Cannot tick upcoming/future days
    if (isUpcoming) {
      setShakingCellKey(cellKey);
      setTimeout(() => setShakingCellKey((prev) => (prev === cellKey ? null : prev)), 400);
      toast.warning('Future Date Locked', {
        description: `Day ${targetDay?.dayNumber ?? d} hasn't arrived yet! You cannot tick off habits in advance.`,
      });
      return;
    }

    // Rule 2: Cannot edit box after 72 hours (3 days)
    if (isExpired) {
      setShakingCellKey(cellKey);
      setTimeout(() => setShakingCellKey((prev) => (prev === cellKey ? null : prev)), 400);
      toast.error('72-Hour Edit Window Expired', {
        description: `Day ${targetDay?.dayNumber ?? d} is older than 72 hours (3 days). Past records are permanently locked to preserve habit consistency.`,
      });
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
      handleRequireAuth('create new habits');
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
      handleRequireAuth('delete habits');
      return;
    }

    toast.error(`Remove "${title}"?`, {
      description: 'This will delete the habit and its records across all months.',
      duration: 10000,
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
      handleRequireAuth('reset monthly completion checkmarks');
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
      {/* Challenge Hero / Motivational Banner */}
      <ChallengeBanner
        challenge={challenge}
        habits={habits}
        onOpenCreateModal={() => setIsChallengeModalOpen(true)}
        onCompleteChallenge={handleCompleteChallenge}
        onAbandonChallenge={handleAbandonChallenge}
      />
      {/* ========================================================================= */}
      {/* 1. TOP SECTION (Habit Tracker Title / Month Picker / Wave Chart / Donut) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3.5 sm:gap-4">
        {/* Top-Left: Brand & Date Controls */}
        <div className="md:col-span-1 lg:col-span-3 bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-xl dark:shadow-2xl flex flex-col justify-between transition-colors">
          <div>
            {/* Personalized Name & Title Banner */}
            <div className="relative border border-slate-200 dark:border-slate-700/80 rounded-2xl p-2 sm:p-2.5 text-center bg-slate-50/90 dark:bg-slate-950/70 mb-4 shadow-xs dark:shadow-inner transition-all group/banner hover:border-indigo-400 dark:hover:border-indigo-500/60">
              {isEditingName ? (
                <div className="flex items-center justify-center gap-1.5 py-0.5">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') setIsEditingName(false);
                    }}
                    placeholder="Enter your name (e.g. Saarth)..."
                    maxLength={18}
                    autoFocus
                    className="w-full text-center bg-transparent border-b-2 border-rose-500 font-mono text-base sm:text-lg font-black uppercase text-slate-900 dark:text-white outline-none focus:ring-0 px-1 py-0.5"
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer shrink-0 shadow-xs"
                    title="Save name"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer shrink-0"
                    title="Cancel"
                  >
                    <CloseIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleTitleClick}
                  className="w-full flex flex-col items-center justify-center cursor-pointer outline-none group/title py-0.5"
                  title={isGuestMode ? "Sign in to personalize title" : "Click to enter your name"}
                >
                  <div className="flex items-center justify-center gap-1.5 w-full">
                    <h2 className="text-base sm:text-lg md:text-xl font-black tracking-tight text-slate-900 dark:text-white font-mono truncate">
                      {isGuestMode ? 'HABIT' : formattedName}{' '}
                      <span className="text-rose-500 dark:text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]">
                        TRACKER
                      </span>
                    </h2>
                    {isGuestMode ? (
                      <Lock className="w-3 h-3 text-slate-400 opacity-60 group-hover/title:opacity-100 group-hover/title:text-indigo-400 transition-colors shrink-0" />
                    ) : (
                      <Pencil className="w-3.5 h-3.5 text-slate-400 group-hover/title:text-rose-500 transition-colors shrink-0" />
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 opacity-60 group-hover/title:opacity-100 transition-opacity">
                    {isGuestMode ? "Sign in to customize title" : "Click to personalize title"}
                  </span>
                </button>
              )}
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
        <div className="md:col-span-2 lg:col-span-6 bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-xl dark:shadow-2xl flex flex-col justify-between transition-colors">
          <DailyProgressWaveChart dayMetrics={analytics.dayMetricsList} color="#FB7185" />
        </div>

        {/* Top-Right: Overall Monthly Progress Gauge */}
        <div className="md:col-span-1 lg:col-span-3 bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-xl dark:shadow-2xl flex items-center justify-around transition-colors">
          <CircularGauge
            percentage={analytics.overallPercentage}
            size={105}
            containerClassName="w-[85px] h-[85px] sm:w-[105px] sm:h-[105px]"
            valueClassName="text-lg sm:text-2xl font-black"
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
            <div className="mt-2 flex flex-col items-end gap-1">
              <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 px-1.5 py-0.5 rounded-md">
                Today: {analytics.todayCompleted}/{analytics.todayTotal} ({analytics.todayPercentage}%)
              </span>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 justify-end">
                <Sparkles className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                <span>{analytics.perfectDaysCount} Perfect Days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THE MAIN SMART HABIT MATRIX (Week 1 to 5 Color Grouped Grid) */}
      {/* ========================================================================= */}
      <div className="bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-xl dark:shadow-2xl overflow-hidden transition-colors">
        {/* Table Action Bar */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-2.5 transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
              {MONTH_NAMES[selectedMonth]} {selectedYear} Consistency Matrix
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 rounded-full shadow-xs">
              {habits.length} Habits
            </span>
            <span className="hidden sm:inline-flex px-2.5 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 rounded-full shadow-xs items-center gap-1 font-mono" title="Habits can be logged for today and up to 72 hours (3 days) ago. Future dates cannot be checked in advance.">
              <Lock className="w-2.5 h-2.5 text-indigo-500" />
              <span>72h Edit Window</span>
            </span>
            {isGuestMode && (
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 rounded-full shadow-xs flex items-center gap-1 font-mono">
                <Lock className="w-2.5 h-2.5" />
                <span>View-Only Preview</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsChallengeModalOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-500/25 cursor-pointer transition-all"
              title="Start or manage 75 Hard, 90-Day Monk Mode, or Custom Challenge"
            >
              <Trophy className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{challenge ? 'Active Challenge' : 'Challenges'}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (isGuestMode) {
                  handleRequireAuth('create and track new habits');
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
        </div>

        {/* Scrollable Spreadsheet Table */}
        <div className="overflow-x-auto w-full smooth-scroll overscroll-x-contain">
          <table className="w-full border-collapse text-left min-w-[920px]">
            {/* Header: Weeks Top Row */}
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
                {/* Habit title column */}
                <th
                  rowSpan={2}
                  className="sticky left-0 z-30 p-2 sm:p-2.5 px-2.5 sm:px-3 bg-purple-100/95 dark:bg-purple-950/95 backdrop-blur-md text-purple-900 dark:text-purple-200 border-r border-slate-200 dark:border-slate-800 w-[185px] min-w-[185px] max-w-[185px] sm:w-[220px] sm:min-w-[220px] sm:max-w-[220px] align-bottom transition-colors shadow-[3px_0_8px_-2px_rgba(0,0,0,0.08)] dark:shadow-[3px_0_8px_-2px_rgba(0,0,0,0.4)]"
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
                          : day.isUpcoming
                          ? 'bg-slate-50/30 dark:bg-slate-950/30 text-slate-400/60 dark:text-slate-600'
                          : day.isExpired
                          ? 'bg-slate-50/60 dark:bg-slate-950/50 text-slate-500/80 dark:text-slate-500'
                          : 'bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                      } transition-colors`}
                      style={{ width: '28px', minWidth: '28px' }}
                      title={
                        day.isToday
                          ? 'Today (Editable)'
                          : day.isUpcoming
                          ? 'Upcoming Day (Locked until date arrives)'
                          : day.isExpired
                          ? 'Locked (72h edit window expired)'
                          : 'Within 72h window (Editable)'
                      }
                    >
                      <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                        {day.dayOfWeekInitial}
                      </div>
                      <div
                        className={`text-xs font-black mt-0.5 ${
                          day.isToday
                            ? 'text-indigo-600 dark:text-indigo-400 font-black'
                            : day.isUpcoming
                            ? 'text-slate-400 dark:text-slate-600 font-normal'
                            : day.isExpired
                            ? 'text-slate-500 dark:text-slate-400 font-normal'
                            : 'text-slate-800 dark:text-slate-200 font-black'
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
                            handleRequireAuth('create your first habit');
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
                    <td className="sticky left-0 z-20 p-2 sm:p-2.5 px-2.5 sm:px-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md group-hover:bg-slate-50/95 dark:group-hover:bg-slate-800/95 border-r border-slate-200 dark:border-slate-800 font-medium text-slate-800 dark:text-slate-200 w-[185px] min-w-[185px] max-w-[185px] sm:w-[220px] sm:min-w-[220px] sm:max-w-[220px] shadow-[3px_0_8px_-2px_rgba(0,0,0,0.08)] dark:shadow-[3px_0_8px_-2px_rgba(0,0,0,0.4)] transition-colors">
                      <div className="flex items-center justify-between gap-1.5 w-full">
                        {/* Habit Title & Color Indicator (min-w-0 flex-1 ensures proper flex shrinkage and text truncation) */}
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 overflow-hidden">
                          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 font-semibold w-3.5 sm:w-4 shrink-0">
                            {habitIndex + 1}.
                          </span>
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm border border-black/15 dark:border-white/25"
                            style={{
                              backgroundColor: habit.color_theme,
                              boxShadow: `0 0 8px ${habit.color_theme}60`,
                            }}
                          />
                          <span
                            className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors"
                            title={habit.title}
                          >
                            {habit.title}
                          </span>
                        </div>

                        {/* Delete Habit Button - Permanently visible, high-contrast touch badge across all screens */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isGuestMode) {
                              handleRequireAuth('delete habits');
                            } else {
                              handleDeleteHabit(habit.id, habit.title);
                            }
                          }}
                          className="flex items-center justify-center p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 text-rose-600 dark:text-rose-400 border border-rose-500/20 dark:border-rose-400/25 shrink-0 ml-1.5 transition-all cursor-pointer shadow-xs active:scale-90"
                          title={isGuestMode ? "Sign in to delete habit" : `Delete ${habit.title}`}
                          aria-label={`Delete habit ${habit.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2.25]" />
                        </button>
                      </div>
                    </td>

                    {/* Day Cells (1 to 31) */}
                    {days.map((day) => {
                      const isCompleted = Boolean(habit.logs[day.dateString]);
                      const week = weeks[day.weekIndex] || weeks[0];
                      const cellKey = `${habit.id}-${day.dateString}`;
                      const isShaking = shakingCellKey === cellKey;
                      const isLocked = Boolean(day.isUpcoming || day.isExpired);

                      return (
                        <td
                          key={day.dateString}
                          className={`p-0 text-center border-r border-slate-200/80 dark:border-slate-800/60 ${
                            day.isToday ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleCell(habit.id, day.dateString, day)}
                            className={`w-full h-8 sm:h-8.5 flex items-center justify-center outline-none group/cell touch-manipulation transition-transform duration-100 ${
                              isLocked
                                ? 'cursor-not-allowed'
                                : 'cursor-pointer active:scale-80'
                            }`}
                            title={
                              isGuestMode
                                ? `Sign in to check off ${habit.title}`
                                : day.isUpcoming
                                ? `Day ${day.dayNumber} (${day.dayOfWeekName}) - Future date (Locked)`
                                : day.isExpired
                                ? `Day ${day.dayNumber} (${day.dayOfWeekName}) - ${isCompleted ? 'Completed (Locked after 72h)' : 'Expired (>72h locked)'}`
                                : `${habit.title} on Day ${day.dayNumber} (${day.dayOfWeekName})`
                            }
                          >
                            <motion.div
                              whileHover={isLocked ? {} : { scale: 1.15 }}
                              whileTap={isLocked ? {} : { scale: 0.85 }}
                              animate={
                                isShaking
                                  ? { x: [-4, 4, -3, 3, -1, 1, 0] }
                                  : { x: 0 }
                              }
                              transition={{ duration: 0.35 }}
                              style={{
                                borderColor: isCompleted
                                  ? week.color.accent
                                  : day.isUpcoming
                                  ? (isDark ? '#1e293b' : '#e2e8f0')
                                  : day.isExpired
                                  ? (isDark ? '#334155' : '#cbd5e1')
                                  : isDark
                                  ? '#334155'
                                  : '#CBD5E1',
                                backgroundColor: isCompleted
                                  ? week.color.accent
                                  : 'transparent',
                                boxShadow: isCompleted ? `0 0 10px ${week.color.accent}70` : 'none',
                              }}
                              className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all duration-150 ${
                                isCompleted
                                  ? `text-white ${day.isExpired ? 'opacity-85' : ''}`
                                  : day.isUpcoming
                                  ? 'opacity-30 dark:opacity-20 border-dashed'
                                  : day.isExpired
                                  ? 'opacity-35 dark:opacity-25'
                                  : 'hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                              }`}
                            >
                              {isCompleted ? (
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
                              ) : day.isExpired ? (
                                <span className="w-1.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-600 block" />
                              ) : null}
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

            {/* 5 Circular Gauges (Week 1 to 5) with Mobile-Optimized Breathing Room */}
            <div className="grid grid-cols-5 gap-1.5 xs:gap-2 sm:gap-3 py-3 sm:py-4">
              {weeks.map((week, idx) => {
                const metric = analytics.weekMetrics[idx] || {
                  percentage: 0,
                  completed: 0,
                  possible: 0,
                };
                return (
                  <div
                    key={week.weekNumber}
                    className="flex flex-col items-center justify-center py-2.5 px-1 xs:px-1.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50/90 dark:bg-slate-950/70 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-inner transition-all hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    <CircularGauge
                      percentage={metric.percentage}
                      size={60}
                      strokeWidth={5.5}
                      color={week.color.accent}
                      bgColor={isDark ? '#1E293B' : '#E2E8F0'}
                      showTickMarks={false}
                      containerClassName="w-[42px] h-[42px] xs:w-[46px] xs:h-[46px] sm:w-[58px] sm:h-[58px]"
                      valueClassName="text-[10px] xs:text-[11px] sm:text-xs font-black"
                    />
                    <span className="mt-1.5 sm:mt-2 text-[9px] xs:text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 font-mono text-center">
                      WEEK {week.weekNumber}
                    </span>
                    <span className="text-[10px] xs:text-[11px] sm:text-xs font-mono text-slate-600 dark:text-slate-300 font-bold mt-0.5 text-center">
                      {metric.completed}/{metric.possible}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Day Breakdown Rows (Completed & Incomplete counts per day) */}
            <div className="overflow-x-auto mt-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-center border-collapse text-xs sm:text-[13px] font-mono">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/90 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                    <th className="sticky left-0 z-20 p-2 sm:p-2.5 px-3 text-left font-sans font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-200 min-w-[135px] bg-slate-50 dark:bg-slate-950 backdrop-blur-md shadow-[3px_0_6px_-2px_rgba(0,0,0,0.06)] dark:shadow-[3px_0_6px_-2px_rgba(0,0,0,0.4)]">
                      Daily Breakdown
                    </th>
                    {days.map((d) => (
                      <th
                        key={d.dateString}
                        className={`p-1.5 sm:p-2 px-1 min-w-[28px] text-xs sm:text-[13px] font-bold ${
                          d.isToday
                            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {d.dayNumber}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {/* Completed row */}
                  <tr>
                    <td className="sticky left-0 z-20 p-2 sm:p-2.5 px-3 text-left font-sans font-bold text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50/95 dark:bg-emerald-950/90 backdrop-blur-md shadow-[3px_0_6px_-2px_rgba(0,0,0,0.06)] dark:shadow-[3px_0_6px_-2px_rgba(0,0,0,0.4)]">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.75] text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Completed</span>
                      </div>
                    </td>
                    {days.map((d) => {
                      const count = analytics.dayMetrics[d.dateString]?.completedCount || 0;
                      return (
                        <td
                          key={d.dateString}
                          className="p-1.5 sm:p-2 text-xs sm:text-[13px] text-emerald-700 dark:text-emerald-300 font-extrabold bg-emerald-50/40 dark:bg-emerald-950/15"
                        >
                          {count}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Incomplete row */}
                  <tr>
                    <td className="sticky left-0 z-20 p-2 sm:p-2.5 px-3 text-left font-sans font-bold text-xs sm:text-sm text-rose-700 dark:text-rose-400 bg-rose-50/95 dark:bg-rose-950/90 backdrop-blur-md shadow-[3px_0_6px_-2px_rgba(0,0,0,0.06)] dark:shadow-[3px_0_6px_-2px_rgba(0,0,0,0.4)]">
                      <div className="flex items-center gap-1.5">
                        <CloseIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.75] text-rose-600 dark:text-rose-400 shrink-0" />
                        <span>Incomplete</span>
                      </div>
                    </td>
                    {days.map((d) => {
                      const count = analytics.dayMetrics[d.dateString]?.incompleteCount || 0;
                      return (
                        <td
                          key={d.dateString}
                          className="p-1.5 sm:p-2 text-xs sm:text-[13px] text-slate-700 dark:text-slate-200 font-bold bg-rose-50/30 dark:bg-rose-950/15"
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
            userEmail={userEmail}
            readOnly={isGuestMode}
            onRequireAuth={() => handleRequireAuth('save monthly reflections and notes')}
          />
        </div>
      </div>

      {/* Habit Creation Modal */}
      <CreateHabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateHabit}
      />

      {/* Challenge Creation Modal */}
      <CreateChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        habits={habits}
        onCreate={handleCreateChallenge}
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
