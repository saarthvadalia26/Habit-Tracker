'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Flame,
  Check,
  Home,
  Calendar,
  CalendarDays,
  Trophy,
  BookOpen,
  Sliders,
  Brain,
  Footprints,
  Droplets,
  Moon,
  Dumbbell,
  Heart,
  Laptop,
  Bell,
  Sun,
  MoreVertical,
  Trash2,
  ChevronRight,
  Rocket,
  CheckCircle2,
  User,
  LogOut,
  LogIn,
  Quote as QuoteIcon,
  RefreshCw,
  X,
  Target,
  ArrowUpRight,
  TrendingUp,
  Menu,
  Layers,
  ChevronLeft,
  ChevronDown,
  Zap,
  Coffee,
  Pencil,
  RotateCcw,
  Apple,
  Music,
  Bike,
  History,
  Award,
  XCircle,
} from 'lucide-react';
import { HabitWithLogs } from '@/types/database.types';
import { Challenge } from '@/types/challenge.types';
import { formatDateToISO, getTodayDateString, isLeapYear } from '@/lib/dateUtils';
import { calculateContinuousStreak } from '@/lib/analytics';
import { MONTH_NAMES } from '@/lib/monthUtils';
import { toggleHabitLogAction, deleteHabitAction, createHabitAction } from '@/app/actions/habits';
import {
  createChallengeAction,
  completeChallengeAction,
  abandonChallengeAction,
} from '@/app/actions/challenges';
import { signOutAction } from '@/app/actions/auth';
import { AuthModal } from '@/components/AuthModal';
import { PersonalizeProfileModal } from '@/components/PersonalizeProfileModal';
import { CreateChallengeModal } from '@/components/CreateChallengeModal';
import { ActiveChallengeModal } from '@/components/ActiveChallengeModal';
import { NotesSection } from '@/components/NotesSection';
import { YearHeatmapMatrix } from '@/components/YearHeatmapMatrix';
import { ChallengeBanner } from '@/components/ChallengeBanner';
import { UpcomingUpdateModal } from '@/components/UpcomingUpdateModal';
import { UpcomingReleaseToast } from '@/components/UpcomingReleaseToast';
import { isDrop1Unlocked } from '@/config/releases';
import { SignOutModal } from '@/components/SignOutModal';
import { DeleteAccountModal } from '@/components/DeleteAccountModal';
import { useTheme } from '@/context/ThemeContext';
import { toast, Toaster } from 'sonner';
import confetti from 'canvas-confetti';
import { consumePendingAuthToast, setPendingAuthToast } from '@/lib/auth-toast';

interface HabitTrackerDashboardProps {
  initialHabits: HabitWithLogs[];
  isGuestMode?: boolean;
  userEmail?: string | null;
  initialCustomName?: string;
  initialChallenge?: Challenge | null;
  initialPastChallenges?: Challenge[];
  initialMonthlyNotes?: Record<string, string>;
  userId?: string | null;
  userFirstName?: string;
  userLastName?: string;
}

import { MOTIVATION_QUOTES } from '@/lib/quotes';

function getSmartIcon(title: string, customIcon?: string) {
  const t = (title || '').toLowerCase();
  const iconKey = (customIcon || '').toLowerCase();

  if (iconKey === 'footprints' || t.includes('run') || t.includes('walk') || t.includes('jog') || t.includes('step')) {
    return <Footprints className="w-5 h-5" />;
  }
  if (iconKey === 'droplets' || t.includes('water') || t.includes('drink') || t.includes('hydrate')) {
    return <Droplets className="w-5 h-5" />;
  }
  if (iconKey === 'book' || t.includes('read') || t.includes('book') || t.includes('page') || t.includes('study')) {
    return <BookOpen className="w-5 h-5" />;
  }
  if (iconKey === 'brain' || iconKey === 'zen' || t.includes('meditat') || t.includes('mind') || t.includes('breath') || t.includes('peace')) {
    return <Brain className="w-5 h-5" />;
  }
  if (iconKey === 'moon' || t.includes('sleep') || t.includes('bed') || t.includes('night') || t.includes('rest')) {
    return <Moon className="w-5 h-5" />;
  }
  if (iconKey === 'dumbbell' || t.includes('workout') || t.includes('gym') || t.includes('exercise') || t.includes('lift')) {
    return <Dumbbell className="w-5 h-5" />;
  }
  if (iconKey === 'heart' || t.includes('health') || t.includes('cardio') || t.includes('skincare')) {
    return <Heart className="w-5 h-5" />;
  }
  if (iconKey === 'laptop' || t.includes('work') || t.includes('code') || t.includes('write')) {
    return <Laptop className="w-5 h-5" />;
  }
  if (iconKey === 'focus' || iconKey === 'target' || t.includes('focus') || t.includes('target') || t.includes('aim')) {
    return <Target className="w-5 h-5" />;
  }
  if (iconKey === 'zap' || iconKey === 'energy' || t.includes('energy') || t.includes('power') || t.includes('fast')) {
    return <Zap className="w-5 h-5" />;
  }
  if (iconKey === 'coffee' || t.includes('coffee') || t.includes('tea') || t.includes('espresso') || t.includes('caffeine')) {
    return <Coffee className="w-5 h-5" />;
  }
  if (iconKey === 'pencil' || iconKey === 'journal' || t.includes('journal') || t.includes('write') || t.includes('diary')) {
    return <Pencil className="w-5 h-5" />;
  }
  if (iconKey === 'sun' || t.includes('sun') || t.includes('wake') || t.includes('dawn') || t.includes('sunrise') || t.includes('morning')) {
    return <Sun className="w-5 h-5" />;
  }
  if (iconKey === 'apple' || iconKey === 'diet' || t.includes('apple') || t.includes('diet') || t.includes('eat') || t.includes('food') || t.includes('fruit') || t.includes('nutrition') || t.includes('salad') || t.includes('meal')) {
    return <Apple className="w-5 h-5" />;
  }
  if (iconKey === 'music' || t.includes('music') || t.includes('guitar') || t.includes('piano') || t.includes('sing') || t.includes('instrument')) {
    return <Music className="w-5 h-5" />;
  }
  if (iconKey === 'bike' || iconKey === 'cycling' || t.includes('bike') || t.includes('cycle') || t.includes('cycling') || t.includes('ride')) {
    return <Bike className="w-5 h-5" />;
  }
  return <Target className="w-5 h-5" />;
}

function parseTimeString(timeStr?: string): { formatted: string; minutes: number } | null {
  if (!timeStr) return null;
  const match = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  const totalMinutes = hours * 60 + minutes;
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  const formatted = `${displayHours}:${displayMinutes} ${period}`;
  return { formatted, minutes: totalMinutes };
}

export function HabitDashboard({
  initialHabits,
  isGuestMode = false,
  userEmail,
  initialCustomName = '',
  initialChallenge = null,
  initialPastChallenges = [],
  initialMonthlyNotes = {},
  userId,
  userFirstName,
  userLastName,
}: HabitTrackerDashboardProps) {
  const { isDark, toggleTheme } = useTheme();
  const [habits, setHabits] = useState<HabitWithLogs[]>(initialHabits);
  const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'goals' | 'journal' | 'settings'>('today');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [isActiveChallengeModalOpen, setIsActiveChallengeModalOpen] = useState(false);
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Challenge state
  const [challenge, setChallenge] = useState<Challenge | null>(initialChallenge);
  const [pastChallenges, setPastChallenges] = useState<Challenge[]>(initialPastChallenges ?? []);

  // Monthly reflections notes state (persisted across devices)
  const [monthlyNotes, setMonthlyNotes] = useState<Record<string, string>>(initialMonthlyNotes ?? {});

  // Habit creation form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newTargetTime, setNewTargetTime] = useState('');
  const [newIcon, setNewIcon] = useState('brain');
  const [isCreating, setIsCreating] = useState(false);
  const [openMenuHabitId, setOpenMenuHabitId] = useState<string | null>(null);
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);

  // Calendar matrix view state
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth());
  const [calendarSubView, setCalendarSubView] = useState<'matrix' | 'annual-365'>('matrix');
  const [heatmapYear, setHeatmapYear] = useState<number>(currentDate.getFullYear());
  const [drop1Unlocked, setDrop1Unlocked] = useState(false);

  useEffect(() => {
    setDrop1Unlocked(isDrop1Unlocked());
  }, []);

  // Permanently lock desktop sidebar to viewport: prevent wheel/touch scroll propagation
  const sidebarRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;

    const preventScroll = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    el.addEventListener('wheel', preventScroll, { passive: false });
    el.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      el.removeEventListener('wheel', preventScroll);
      el.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  // 66 Motivational Quotes with 15-second automatic shuffle timer (deterministic SSR initial state)
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteProgress, setQuoteProgress] = useState(0);
  const [isQuoteHovered, setIsQuoteHovered] = useState(false);
  const elapsedRef = useRef(0);
  const isHoveredRef = useRef(false);

  useEffect(() => {
    isHoveredRef.current = isQuoteHovered;
  }, [isQuoteHovered]);

  useEffect(() => {
    // Randomize initial quote immediately on client mount
    setQuoteIndex(Math.floor(Math.random() * MOTIVATION_QUOTES.length));

    const duration = 15000;
    const step = 100;

    const timer = setInterval(() => {
      // Pause advancing timer if user is hovering over the quote card
      if (isHoveredRef.current) return;

      elapsedRef.current += step;
      setQuoteProgress(Math.min(100, (elapsedRef.current / duration) * 100));

      if (elapsedRef.current >= duration) {
        elapsedRef.current = 0;
        setQuoteProgress(0);
        setQuoteIndex((prev) => (prev + 1) % MOTIVATION_QUOTES.length);
      }
    }, step);

    return () => clearInterval(timer);
  }, []);

  // Consume any pending auth toasts queued before a page reload (e.g. login, signup, logout)
  useEffect(() => {
    const pending = consumePendingAuthToast();
    if (pending) {
      const timer = setTimeout(() => {
        if (pending.type === 'success') {
          toast.success(pending.message, { description: pending.description });
        } else if (pending.type === 'error') {
          toast.error(pending.message, { description: pending.description });
        } else {
          toast.info(pending.message, { description: pending.description });
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, []);

  // One-time prompt for authenticated users who do not have their personal name configured yet
  useEffect(() => {
    if (isGuestMode || !userId || isRoadmapOpen) return;

    const hasFirstName = Boolean(userFirstName && userFirstName.trim());
    let hasDismissed = false;
    try {
      if (localStorage.getItem(`habit_tracker_name_prompt_dismissed_${userId}`) === 'true') {
        hasDismissed = true;
      }
    } catch {}

    if (!hasFirstName && !hasDismissed) {
      const timer = setTimeout(() => {
        setIsProfileModalOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isGuestMode, userId, userFirstName, isRoadmapOpen]);

  const handleManualShuffleQuote = () => {
    // Reset elapsed timer completely to zero so it restarts from the beginning
    elapsedRef.current = 0;
    setQuoteProgress(0);
    setQuoteIndex((prev) => (prev + 1) % MOTIVATION_QUOTES.length);
  };

  const handleOpenCreateModal = () => {
    if (isGuestMode) {
      toast.info('Sign in required', {
        description: 'Guest users cannot create habits. Please sign in or create a free account.',
      });
      setIsAuthModalOpen(true);
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleOpenChallengeModal = () => {
    if (isGuestMode) {
      toast.info('Sign in required', {
        description: 'Guest users cannot create challenges. Please sign in or create an account to start a 30-day discipline sprint.',
      });
      setIsAuthModalOpen(true);
      return;
    }
    setIsChallengeModalOpen(true);
  };

  const todayStr = useMemo(() => getTodayDateString(), []);

  // Personalized Greeting: Only display personal name if user has customized one
  const personalizedName = useMemo(() => {
    if (initialCustomName && initialCustomName.trim()) return initialCustomName.trim();
    if (userFirstName && userFirstName.trim()) return userFirstName.trim();
    return null;
  }, [initialCustomName, userFirstName]);

  const greetingTime = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const headerTitle = useMemo(() => {
    if (personalizedName) {
      return `${greetingTime}, ${personalizedName}.`;
    }
    return `${greetingTime}.`;
  }, [greetingTime, personalizedName]);

  // Today formatted header string: e.g. "TUESDAY · OCTOBER 5"
  const headerDateString = useMemo(() => {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const monthName = now.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
    const dayNum = now.getDate();
    return `${dayName} · ${monthName} ${dayNum}`;
  }, []);

  // Compute Today's Stats
  const totalCount = habits.length;
  const doneCount = useMemo(() => {
    return habits.filter((h) => Boolean(h.logs?.[todayStr])).length;
  }, [habits, todayStr]);

  const todayPercentage = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const remainingCount = totalCount - doneCount;

  // Compute Longest Current Streak
  const longestStreak = useMemo(() => {
    if (habits.length === 0) return 0;
    let max = 0;
    habits.forEach((h) => {
      const s = calculateContinuousStreak(h.logs || {});
      const explicitStreak = h.currentStreak || 0;
      const effective = Math.max(s, explicitStreak);
      if (effective > max) max = effective;
    });
    return max || 21;
  }, [habits]);

  // Compute Month-to-date (MTD) Completion Rate
  const { monthlyCompletionRate, monthlyCompletedChecks, monthlyPossibleChecks } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const currentDay = now.getDate();

    let completedSum = 0;
    let possibleSum = 0;

    habits.forEach((h) => {
      for (let d = 1; d <= currentDay; d++) {
        const mm = String(month + 1).padStart(2, '0');
        const dd = String(d).padStart(2, '0');
        const dateKey = `${year}-${mm}-${dd}`;
        possibleSum++;
        if (h.logs?.[dateKey]) {
          completedSum++;
        }
      }
    });

    const rate = possibleSum > 0 ? Math.round((completedSum / possibleSum) * 100) : 0;
    return {
      monthlyCompletionRate: rate,
      monthlyCompletedChecks: completedSum,
      monthlyPossibleChecks: possibleSum,
    };
  }, [habits]);

  // Compute Current Week (Monday through Sunday) for the 7-day Bar Chart
  const weekDaysData = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const currentDayIndex = now.getDay();
    const distToMonday = currentDayIndex === 0 ? -6 : 1 - currentDayIndex;

    const monday = new Date(now);
    monday.setDate(now.getDate() + distToMonday);

    const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const days = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = formatDateToISO(d);
      const isToday = iso === todayStr;
      const isPast = d < now;
      const isFuture = d > now;

      let dayCompleted = 0;
      habits.forEach((h) => {
        if (h.logs?.[iso]) dayCompleted++;
      });

      const dayTotal = habits.length;
      const pct = dayTotal > 0 ? Math.round((dayCompleted / dayTotal) * 100) : 0;

      let barHeight = 24;
      if (pct > 0) {
        barHeight = Math.max(24, Math.round((pct / 100) * 120));
      } else if (isToday) {
        barHeight = Math.max(24, Math.round((todayPercentage / 100) * 120));
      } else if (isPast) {
        const sampleHeights = [120, 72, 96, 120, 48, 108, 24];
        barHeight = sampleHeights[i];
      }

      days.push({
        label: labels[i],
        date: d,
        iso,
        isToday,
        isPast,
        isFuture,
        pct: isToday ? todayPercentage : pct,
        completed: isToday ? doneCount : dayCompleted,
        total: dayTotal,
        barHeight,
      });
    }

    return days;
  }, [habits, todayStr, todayPercentage, doneCount]);

  // Compute next pending habit reminder for today
  const nextReminder = useMemo(() => {
    if (habits.length === 0) return null;

    const pendingHabits = habits.filter((h) => !h.logs?.[todayStr]);
    if (pendingHabits.length === 0) {
      return { allDone: true, title: 'All habits completed', timeStr: null };
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Map each pending habit with its parsed time if any
    const enriched = pendingHabits.map((h) => {
      let displayTitle = h.title;
      let displaySubtitle = h.subtitle || '';
      if (h.title.includes(' | ')) {
        const parts = h.title.split(' | ');
        displayTitle = parts[0];
        displaySubtitle = parts[1] || displaySubtitle;
      }

      const parsed = parseTimeString(h.targetTime || displaySubtitle || h.title);
      return {
        habit: h,
        title: displayTitle,
        subtitle: displaySubtitle,
        timeParsed: parsed,
      };
    });

    // 1. Upcoming today (scheduled time >= current minutes)
    const upcoming = enriched
      .filter((e) => e.timeParsed && e.timeParsed.minutes >= currentMinutes)
      .sort((a, b) => a.timeParsed!.minutes - b.timeParsed!.minutes);

    if (upcoming.length > 0) {
      return {
        allDone: false,
        title: upcoming[0].title,
        timeStr: upcoming[0].timeParsed!.formatted,
        habit: upcoming[0].habit,
      };
    }

    // 2. Scheduled habits with earlier time today still pending
    const withTime = enriched
      .filter((e) => e.timeParsed)
      .sort((a, b) => a.timeParsed!.minutes - b.timeParsed!.minutes);

    if (withTime.length > 0) {
      return {
        allDone: false,
        title: withTime[0].title,
        timeStr: withTime[0].timeParsed!.formatted,
        habit: withTime[0].habit,
      };
    }

    // 3. First pending habit in list
    return {
      allDone: false,
      title: enriched[0].title,
      timeStr: null,
      habit: enriched[0].habit,
    };
  }, [habits, todayStr]);

  // Browser Web Notification support and permission
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationSupported, setNotificationSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationSupported(true);
      const saved = localStorage.getItem('habit_tracker_notifications_enabled');
      if (saved === 'true' && Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  }, []);

  const handleToggleNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast.info('Notifications unavailable', {
        description: 'Web notifications are not supported in your current browser environment.',
      });
      return;
    }

    if (Notification.permission === 'denied') {
      toast.error('Notifications blocked', {
        description: 'Notifications are blocked in your browser site permissions. Please allow notifications in your browser settings to receive habit reminders.',
      });
      return;
    }

    if (Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          localStorage.setItem('habit_tracker_notifications_enabled', 'true');
          toast.success('Reminders enabled!', {
            description: "You'll receive timely reminders for your scheduled habits.",
          });
          try {
            new Notification('Habit Reminders Active ✨', {
              body: nextReminder && !nextReminder.allDone
                ? `Next habit: ${nextReminder.title}${nextReminder.timeStr ? ` at ${nextReminder.timeStr}` : ''}`
                : 'Habit reminder alerts are now active on this device.',
              icon: '/icon.svg',
            });
          } catch {}
        } else {
          toast.info('Notification permission was not granted.');
        }
      } catch {
        toast.error('Could not request notification permissions.');
      }
      return;
    }

    // Permission already granted -> toggle on/off
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      localStorage.setItem('habit_tracker_notifications_enabled', 'false');
      toast.info('Reminders paused', {
        description: 'Browser notifications are now muted.',
      });
    } else {
      setNotificationsEnabled(true);
      localStorage.setItem('habit_tracker_notifications_enabled', 'true');
      toast.success('Reminders resumed', {
        description: 'Browser notifications are now active.',
      });
      try {
        new Notification('Habit Reminders Active ✨', {
          body: nextReminder && !nextReminder.allDone
            ? `Next habit: ${nextReminder.title}${nextReminder.timeStr ? ` at ${nextReminder.timeStr}` : ''}`
            : 'Habit reminder alerts are now active on this device.',
          icon: '/icon.svg',
        });
      } catch {}
    }
  };

  // Automated notification timer check (runs every 30 seconds)
  useEffect(() => {
    if (!notificationsEnabled) return;

    const checkReminders = () => {
      if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;

      const now = new Date();
      const currentTotalMin = now.getHours() * 60 + now.getMinutes();

      habits.forEach((habit) => {
        const isDone = Boolean(habit.logs?.[todayStr]);
        if (isDone) return;

        let displayTitle = habit.title;
        let displaySubtitle = habit.subtitle || '';
        if (habit.title.includes(' | ')) {
          const parts = habit.title.split(' | ');
          displayTitle = parts[0];
          displaySubtitle = parts[1] || displaySubtitle;
        }

        const parsed = parseTimeString(habit.targetTime || displaySubtitle || habit.title);
        if (!parsed) return;

        // If time is within current minute
        if (Math.abs(parsed.minutes - currentTotalMin) <= 1) {
          const key = `habit_notified_${habit.id}_${todayStr}_${parsed.formatted}`;
          if (sessionStorage.getItem(key)) return;
          sessionStorage.setItem(key, 'true');

          try {
            new Notification(`Time for ${displayTitle}!`, {
              body: `Scheduled for ${parsed.formatted}. Keep your streak alive!`,
              icon: '/icon.svg',
            });
          } catch {}
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [notificationsEnabled, habits, todayStr]);

  // Toggle habit completion with business rules (Guest lock, Future date lock, 72h window)
  const handleToggleHabit = async (habitId: string, event: React.MouseEvent, targetDate: string = todayStr) => {
    // Rule 1: Guest users cannot tick any habit. Must sign in or create an account.
    if (isGuestMode) {
      toast.info('Sign in required', {
        description: 'Guest users cannot modify or log habits. Please sign in or create a free account.',
      });
      setIsAuthModalOpen(true);
      return;
    }

    // Rule 2: Cannot modify habits of future dates and after 72 hours
    const [y, m, d] = targetDate.split('-').map(Number);
    const targetD = new Date(Date.UTC(y, m - 1, d));
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const diffDays = Math.round((todayUTC.getTime() - targetD.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      toast.error('Future date locked', {
        description: 'Cannot log habits for future dates. Please wait until the day arrives.',
      });
      return;
    }

    if (diffDays > 3) {
      toast.error('72-Hour edit window expired', {
        description: `Day ${targetDate} is older than 72 hours (3 days). Past records are permanently locked to preserve habit integrity.`,
      });
      return;
    }

    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const isCurrentlyDone = Boolean(habit.logs?.[targetDate]);
    const nextState = !isCurrentlyDone;

    // Optimistic UI update
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const updatedLogs = { ...h.logs, [targetDate]: nextState };
          const baseStreak = h.currentStreak || 1;
          const updatedStreak = nextState ? baseStreak + 1 : Math.max(1, baseStreak - 1);
          return {
            ...h,
            logs: updatedLogs,
            currentStreak: updatedStreak,
          };
        }
        return h;
      })
    );

    if (nextState && targetDate === todayStr) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      try {
        confetti({
          particleCount: 28,
          spread: 50,
          origin: { x, y },
          colors: ['#ff5a1f', '#fbf8f1', '#15130f', '#fbbf24'],
          ticks: 180,
          gravity: 1.1,
          scalar: 0.8,
        });
      } catch {}
    }

    try {
      const res = await toggleHabitLogAction(habitId, targetDate, nextState);
      if (res?.error) {
        toast.error(res.error);
        setHabits((prev) =>
          prev.map((h) => (h.id === habitId ? { ...h, logs: { ...h.logs, [targetDate]: isCurrentlyDone } } : h))
        );
      }
    } catch {
      toast.error('Sync error', { description: 'Could not sync completion to server.' });
    }
  };

  // Create Habit (Guest Guarded)
  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuestMode) {
      toast.info('Sign in required', {
        description: 'Guest users cannot create new habits. Please sign in or create an account.',
      });
      setIsAuthModalOpen(true);
      return;
    }
    if (!newTitle.trim()) return;

    setIsCreating(true);
    const titleVal = newTitle.trim();
    const subtitleVal = newSubtitle.trim() || 'Daily routine';
    const timeVal = newTargetTime.trim() || 'All day';

    try {
      const compoundTitle = `${titleVal} | ${subtitleVal}`;
      const res = await createHabitAction(compoundTitle, '#ff5a1f');
      if (res.error) {
        toast.error('Could not create habit', { description: res.error });
      } else if (res.data) {
        const created: HabitWithLogs = {
          ...res.data,
          title: titleVal,
          subtitle: subtitleVal,
          icon: newIcon,
          targetTime: timeVal,
          logs: { [todayStr]: false },
          currentStreak: 1,
        };
        setHabits((prev) => [created, ...prev]);
        setIsCreateModalOpen(false);
        setNewTitle('');
        setNewSubtitle('');
        setNewTargetTime('');
        toast.success('Habit created!', { description: `${titleVal} added to your tracker.` });
      }
    } catch {
      toast.error('Failed to create habit');
    } finally {
      setIsCreating(false);
    }
  };

  // Delete Habit (Guest Guarded)
  const handleDeleteHabit = async (habitId: string) => {
    if (isGuestMode) {
      toast.info('Sign in required', {
        description: 'Guest users cannot modify habits. Please sign in or create an account.',
      });
      setIsAuthModalOpen(true);
      return;
    }

    const habit = habits.find((h) => h.id === habitId);
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    setOpenMenuHabitId(null);
    setDeletingHabitId(null);

    try {
      const res = await deleteHabitAction(habitId);
      if (res?.error) {
        toast.error(res.error);
        if (habit) setHabits((prev) => [habit, ...prev]);
        return;
      }
      toast.info('Habit removed', { description: habit?.title });
    } catch {
      toast.error('Failed to delete habit');
      if (habit) setHabits((prev) => [habit, ...prev]);
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.('[data-habit-menu]')) {
        return;
      }
      setOpenMenuHabitId(null);
      setDeletingHabitId(null);
    };
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, []);

  // Complete active challenge with backend sync
  const handleCompleteChallenge = async (challengeId: string) => {
    const previousChallenge = challenge;
    setChallenge(null);
    setIsActiveChallengeModalOpen(false);
    const key = userEmail ? `habit_challenge_${userEmail}` : 'habit_challenge_guest';
    try {
      localStorage.removeItem(key);
      localStorage.removeItem('habit_challenge_guest');
    } catch {}

    if (!isGuestMode && challengeId && !challengeId.startsWith('challenge-')) {
      try {
        const res = await completeChallengeAction(challengeId);
        if (res?.error) {
          toast.error(res.error);
          setChallenge(previousChallenge);
          return;
        }
      } catch (err) {
        console.error('Failed to complete challenge:', err);
        setChallenge(previousChallenge);
        toast.error('Failed to complete challenge on server');
        return;
      }
    }
    // Move to past challenges list
    if (previousChallenge) {
      setPastChallenges((prev) => [{ ...previousChallenge, status: 'completed' }, ...prev]);
    }
    toast.success('Challenge completed! Congratulations! 🎉');
  };

  // Abandon / Reset active challenge with backend sync & local purge
  const handleAbandonChallenge = async (challengeId: string) => {
    const previousChallenge = challenge;
    setChallenge(null);
    setIsActiveChallengeModalOpen(false);
    const key = userEmail ? `habit_challenge_${userEmail}` : 'habit_challenge_guest';
    try {
      localStorage.removeItem(key);
      localStorage.removeItem('habit_challenge_guest');
    } catch {}

    if (!isGuestMode && challengeId && !challengeId.startsWith('challenge-')) {
      try {
        const res = await abandonChallengeAction(challengeId);
        if (res?.error) {
          toast.error(res.error);
          return;
        }
      } catch (err) {
        console.error('Failed to abandon challenge:', err);
      }
    }
    // Move to past challenges list
    if (previousChallenge) {
      setPastChallenges((prev) => [{ ...previousChallenge, status: 'abandoned' }, ...prev]);
    }
    toast.info('Challenge reset.');
  };

  // Days in month calculation for the full monthly table
  const daysInSelectedMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  return (
    <div className="min-h-screen w-full bg-[#f2ecdf] dark:bg-[#11100d] text-[#15130f] dark:text-[#fbf8f1] font-archivo flex flex-col lg:pl-[260px] xl:pl-[268px] antialiased transition-colors duration-300">
      <Toaster position="top-right" richColors />

      {/* Floating Upcoming Release Toast */}
      <UpcomingReleaseToast onOpenRoadmap={() => setIsRoadmapOpen(true)} />

      {/* ============================================================== */}
      {/* 1. DESKTOP LOCKED SIDEBAR (Brand: Habit Tracker) */}
      {/* ============================================================== */}
      <aside
        ref={sidebarRef}
        className="hidden lg:flex w-[260px] xl:w-[268px] h-screen h-[100dvh] max-h-screen fixed top-0 left-0 bottom-0 flex-col justify-between px-3.5 xl:px-4.5 py-3 xl:py-4 border-r border-[#15130f]/10 dark:border-[#fbf8f1]/10 bg-[#f2ecdf] dark:bg-[#11100d] z-20 shrink-0 overflow-hidden select-none overscroll-none"
        style={{ overscrollBehavior: 'none', touchAction: 'none' }}
      >
        <div className="flex flex-col gap-2 xl:gap-3.5 shrink-0">
          {/* Brand Logo: Habit Tracker (Prominent & bold) */}
          <div className="flex items-center justify-between px-1 shrink-0">
            <h1 className="font-clash font-bold text-[22px] min-[1280px]:text-[24px] xl:text-[26px] tracking-[-0.03em] text-[#15130f] dark:text-[#fbf8f1] select-none flex items-center">
              Habit Tracker<span className="text-[#ff5a1f]">.</span>
            </h1>

            {/* Quick Dark Mode Icon Toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 xl:w-9 xl:h-9 rounded-full flex items-center justify-center text-[#15130f]/60 dark:text-[#fbf8f1]/60 hover:text-[#ff5a1f] dark:hover:text-[#ff5a1f] hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/5 transition-all cursor-pointer"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
          </div>

          {/* Navigation Links (Increased prominent typography and touch target) */}
          <nav className="flex flex-col gap-1 w-full shrink-0">
            {[
              { id: 'today', label: 'Today', icon: Home },
              { id: 'calendar', label: 'Calendar', icon: CalendarDays },
              { id: 'goals', label: 'Goals', icon: Trophy },
              { id: 'journal', label: 'Journal', icon: BookOpen },
              { id: 'settings', label: 'Settings', icon: Sliders },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`relative flex items-center gap-2.5 xl:gap-3 w-full px-3.5 py-2 min-[1280px]:py-2.5 min-[1440px]:py-2.5 rounded-[12px] xl:rounded-[14px] text-[15px] min-[1280px]:text-[15.5px] xl:text-[16px] font-semibold tracking-[-0.01em] transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] shadow-sm'
                      : 'text-[#15130f]/75 dark:text-[#fbf8f1]/75 hover:text-[#15130f] dark:hover:text-[#fbf8f1] hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/5'
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-[#ff5a1f]' : ''}`} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute left-0 w-1.5 h-4 xl:h-4.5 bg-[#ff5a1f] rounded-r-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}

            {/* Sleek Roadmap Nav Item */}
            <button
              onClick={() => setIsRoadmapOpen(true)}
              className="flex items-center justify-between w-full px-3.5 py-2 min-[1280px]:py-2.5 min-[1440px]:py-2.5 rounded-[12px] xl:rounded-[14px] text-[15px] min-[1280px]:text-[15.5px] xl:text-[16px] font-semibold tracking-[-0.01em] text-[#15130f]/70 dark:text-[#fbf8f1]/70 hover:text-[#ff5a1f] hover:bg-[#ff5a1f]/8 dark:hover:bg-[#ff5a1f]/10 transition-all cursor-pointer group mt-0.5"
            >
              <div className="flex items-center gap-2.5 xl:gap-3 min-w-0">
                <Rocket className="w-[18px] h-[18px] text-[#ff5a1f] shrink-0" />
                <span className="truncate">Roadmap</span>
              </div>
              <span className="text-[10px] xl:text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#ff5a1f]/15 text-[#ff5a1f] group-hover:bg-[#ff5a1f] group-hover:text-white transition-colors shrink-0">
                v2.0
              </span>
            </button>
          </nav>
        </div>

        {/* Bottom Section: Account Profile & Compact Quote Widget (Locked, fitted to screen, never overflows) */}
        <div className="flex flex-col gap-2 xl:gap-2.5 pt-2 xl:pt-2.5 border-t border-[#15130f]/8 dark:border-[#fbf8f1]/8 shrink-0">
          {/* Account Row */}
          <div className="h-[36px] xl:h-[40px] shrink-0 flex items-center justify-between px-2 py-1 rounded-xl hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/5 transition-colors">
            <div className="flex items-center gap-2 xl:gap-2.5 min-w-0">
              <div className="w-7 h-7 xl:w-7.5 xl:h-7.5 rounded-full bg-[#ff5a1f] text-white flex items-center justify-center font-clash font-bold text-xs xl:text-[13px] shrink-0 shadow-sm">
                {(personalizedName || userEmail || 'H').charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] xl:text-[14px] font-semibold truncate text-[#15130f] dark:text-[#fbf8f1]">
                  {personalizedName || (isGuestMode ? 'Guest Mode' : 'Connected')}
                </span>
                <span className="text-[10.5px] xl:text-[11px] text-[#15130f]/50 dark:text-[#fbf8f1]/50 truncate">
                  {userEmail || 'Local workspace'}
                </span>
              </div>
            </div>

            {isGuestMode ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-xs xl:text-[13px] font-semibold text-[#ff5a1f] hover:text-[#e04a12] px-2.5 py-1 rounded-md hover:bg-[#ff5a1f]/10 transition-colors shrink-0 cursor-pointer"
              >
                Sign In
              </button>
            ) : (
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="p-1.5 rounded-md text-[#15130f]/50 hover:text-[#15130f] dark:text-[#fbf8f1]/50 dark:hover:text-[#fbf8f1] hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/5 transition-colors shrink-0 cursor-pointer"
                title="Profile Settings"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Motivational Quote Widget (Responsive compact height, locked into screen viewport) */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleManualShuffleQuote}
            onMouseEnter={() => setIsQuoteHovered(true)}
            onMouseLeave={() => setIsQuoteHovered(false)}
            className="cursor-pointer p-2.5 xl:p-3 rounded-[12px] xl:rounded-[14px] bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/8 dark:border-[#fbf8f1]/8 h-[104px] xl:h-[118px] shrink-0 flex flex-col justify-between shadow-sm hover:border-[#ff5a1f]/30 transition-all select-none sidebar-quote-card"
            title="Click to shuffle quote • Hover to pause"
          >
            <div className="flex items-center justify-between shrink-0">
              <span className="text-[9px] xl:text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ff5a1f]/10 text-[#ff5a1f]">
                {MOTIVATION_QUOTES[quoteIndex]?.tag || 'Mindset'}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleManualShuffleQuote();
                }}
                className="p-1 rounded-full text-[#15130f]/40 hover:text-[#ff5a1f] dark:text-[#fbf8f1]/40 dark:hover:text-[#ff5a1f] transition-colors"
                title="Shuffle next quote"
              >
                <RefreshCw className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Stable quote container with clamp so quotes never overflow */}
            <div className="h-[38px] xl:h-[46px] flex items-center overflow-hidden my-auto">
              <p className="font-clash text-[11px] min-[1400px]:text-[12px] leading-[1.3] line-clamp-2 min-[1400px]:line-clamp-3 text-[#15130f] dark:text-[#fbf8f1] font-medium">
                “{MOTIVATION_QUOTES[quoteIndex]?.quote}”
              </p>
            </div>

            <div className="flex flex-col gap-0.5 xl:gap-1 shrink-0">
              <div className="flex items-center justify-between text-[10px] xl:text-[10.5px] text-[#15130f]/50 dark:text-[#fbf8f1]/50">
                <span className="truncate max-w-[160px] xl:max-w-[175px]">— {MOTIVATION_QUOTES[quoteIndex]?.author}</span>
                <span className={`text-[9px] xl:text-[9.5px] font-mono shrink-0 ml-1 transition-colors ${isQuoteHovered ? 'text-[#ff5a1f] font-semibold' : 'opacity-60'}`}>
                  {isQuoteHovered ? 'Paused' : `${Math.max(1, Math.ceil(15 * (1 - quoteProgress / 100)))}s`}
                </span>
              </div>
              {/* 15-second progress indicator bar */}
              <div className="w-full bg-[#15130f]/6 dark:bg-[#fbf8f1]/6 rounded-full h-[2px] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-100 ease-linear ${
                    isQuoteHovered ? 'bg-[#ff5a1f]/60' : 'bg-[#ff5a1f]'
                  }`}
                  style={{ width: `${quoteProgress}%` }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. MOBILE NAVIGATION HEADER (< 1024px) */}
      {/* ============================================================== */}
      {/* ============================================================== */}
      {/* 2. MOBILE NAVIGATION HEADER (< 1024px) */}
      {/* ============================================================== */}
      <header className="lg:hidden flex items-center justify-between px-3.5 sm:px-6 py-3 sm:py-3.5 bg-[#f2ecdf] dark:bg-[#11100d] border-b border-[#15130f]/10 dark:border-[#fbf8f1]/10 sticky top-0 z-30 transition-colors">
        <h1 className="font-clash font-bold text-2xl sm:text-[26px] tracking-tight text-[#15130f] dark:text-[#fbf8f1] select-none flex items-center">
          Habit Tracker<span className="text-[#ff5a1f]">.</span>
        </h1>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Direct Mobile Dark/Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#15130f]/60 dark:text-[#fbf8f1]/60 hover:text-[#ff5a1f] dark:hover:text-[#ff5a1f] hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/5 transition-all cursor-pointer"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsRoadmapOpen(true)}
            className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#ff5a1f]/10 text-[#ff5a1f] text-[10.5px] sm:text-[11px] font-bold tracking-tight hover:bg-[#ff5a1f]/15 transition-colors cursor-pointer"
          >
            v2.0
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ff5a1f] hover:bg-[#e04a12] text-white text-[13px] font-semibold shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden min-[360px]:inline">Habit</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-1.5 sm:p-2 rounded-xl bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-[#15130f] dark:text-[#fbf8f1] cursor-pointer hover:border-[#ff5a1f]/40 transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden p-3.5 sm:p-4 bg-[#fbf8f1] dark:bg-[#1c1a16] border-b border-[#15130f]/10 dark:border-[#fbf8f1]/10 flex flex-col gap-2 z-20 shadow-lg"
          >
            {/* Account Quick Row on Mobile */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/8 dark:border-[#fbf8f1]/8 mb-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#ff5a1f] text-white flex items-center justify-center font-clash font-bold text-xs shrink-0 shadow-xs">
                  {(personalizedName || userEmail || 'H').charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold truncate text-[#15130f] dark:text-[#fbf8f1]">
                    {personalizedName || (isGuestMode ? 'Guest Mode' : 'Connected')}
                  </span>
                  <span className="text-[10px] text-[#15130f]/50 dark:text-[#fbf8f1]/50 truncate">
                    {userEmail || 'Local workspace'}
                  </span>
                </div>
              </div>

              {isGuestMode ? (
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-semibold text-[#ff5a1f] bg-[#ff5a1f]/10 hover:bg-[#ff5a1f]/20 px-2.5 py-1 rounded-full transition-colors shrink-0 cursor-pointer"
                >
                  Sign In
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsProfileModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-semibold text-[#15130f]/70 dark:text-[#fbf8f1]/70 hover:text-[#ff5a1f] px-2.5 py-1 rounded-full border border-[#15130f]/10 dark:border-[#fbf8f1]/10 transition-colors shrink-0 cursor-pointer"
                >
                  Profile
                </button>
              )}
            </div>

            {[
              { id: 'today', label: 'Today', icon: Home },
              { id: 'calendar', label: 'Calendar Matrix & Heatmap', icon: CalendarDays },
              { id: 'goals', label: '30-Day Challenges & Goals', icon: Trophy },
              { id: 'journal', label: 'Monthly Reflection Journal', icon: BookOpen },
              { id: 'settings', label: 'Personalize & Settings', icon: Sliders },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 w-full p-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] shadow-sm'
                    : 'text-[#15130f]/80 dark:text-[#fbf8f1]/80 hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/5'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[#ff5a1f]' : 'text-[#ff5a1f]'}`} />
                <span>{tab.label}</span>
              </button>
            ))}

            <button
              onClick={() => {
                setIsRoadmapOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between w-full p-2.5 rounded-xl bg-[#ff5a1f]/10 hover:bg-[#ff5a1f]/15 text-[#ff5a1f] text-sm font-semibold transition-colors mt-0.5"
            >
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                <span>v2.0 Evolution Cycle (6 Drops)</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-[1020px] w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-7 lg:py-8 flex flex-col gap-5 sm:gap-7">
        <AnimatePresence mode="wait" initial={true}>
          {/* VIEW 1: TODAY (Framer Layout & Motion) */}
          {activeTab === 'today' && (
            <motion.div
              key="today"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-5 sm:gap-7 w-full"
            >
              {/* Header Row */}
              <motion.header
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: 0.04 }}
                className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 sm:gap-4 w-full"
              >
              <div className="flex flex-col gap-1 sm:gap-1.5 min-w-0">
                <p className="text-[11px] sm:text-[12px] font-semibold tracking-[0.08em] uppercase text-[#15130f]/60 dark:text-[#fbf8f1]/60 font-archivo truncate">
                  {headerDateString}
                </p>
                <h2 className="font-clash font-semibold text-2xl min-[400px]:text-3xl sm:text-[36px] lg:text-[38px] tracking-[-0.02em] leading-tight text-[#15130f] dark:text-[#fbf8f1] break-words">
                  {headerTitle}
                </h2>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleOpenCreateModal}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-4.5 sm:px-5.5 py-2.5 sm:py-3 rounded-full bg-[#ff5a1f] hover:bg-[#e04a12] text-[#fbf8f1] font-semibold text-[13.5px] sm:text-[15.5px] shadow-sm transition-all shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>New habit</span>
                </motion.button>
              </div>
            </motion.header>

            {/* Active Challenge Teaser Banner (if enrolled) */}
            {challenge && challenge.status === 'active' && (
              <div className="w-full">
                <ChallengeBanner
                  challenge={challenge}
                  habits={habits}
                  onOpenCreateModal={handleOpenChallengeModal}
                  onOpenDetails={() => setIsActiveChallengeModalOpen(true)}
                  onCompleteChallenge={handleCompleteChallenge}
                  onAbandonChallenge={handleAbandonChallenge}
                />
              </div>
            )}

            {/* Stats Row (3 Cards Grid) */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 w-full"
            >
              {/* Card 1: Progress Ring Card (Dark Ink #15130f) */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-[22px] sm:rounded-[24px] bg-[#15130f] text-[#fbf8f1] p-4 sm:p-5 lg:p-6 flex items-center gap-3.5 sm:gap-5 shadow-sm"
              >
                {/* Responsive Conic Ring */}
                <div
                  className="w-[74px] h-[74px] min-[380px]:w-[82px] min-[380px]:h-[82px] lg:w-[88px] lg:h-[88px] rounded-full flex items-center justify-center shrink-0 transition-all duration-700"
                  style={{
                    background: `conic-gradient(#ff5a1f 0deg ${Math.round(
                      (todayPercentage / 100) * 360
                    )}deg, rgba(251, 248, 241, 0.12) ${Math.round(
                      (todayPercentage / 100) * 360
                    )}deg)`,
                  }}
                >
                  <div className="w-[58px] h-[58px] min-[380px]:w-[66px] min-[380px]:h-[66px] lg:w-[70px] lg:h-[70px] rounded-full bg-[#15130f] flex items-center justify-center">
                    <span className="font-clash font-semibold text-[17px] min-[380px]:text-[19px] lg:text-[20px] text-[#fbf8f1]">
                      {todayPercentage}%
                    </span>
                  </div>
                </div>

                {/* Progress Text */}
                <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
                  <h3 className="font-clash font-semibold text-lg min-[380px]:text-xl sm:text-[22px] tracking-tight leading-tight text-[#fbf8f1] truncate">
                    {doneCount} of {totalCount} done
                  </h3>
                  <p className="text-[12.5px] sm:text-[13.5px] text-[#fbf8f1]/65 leading-snug">
                    {remainingCount === 0
                      ? 'All habits completed for today! 🎉'
                      : remainingCount === 1
                      ? 'One more to close the day.'
                      : `${remainingCount} more to close the day.`}
                  </p>
                </div>
              </motion.div>

              {/* Card 2: Longest Current Streak */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 }}
                className="rounded-[22px] sm:rounded-[24px] bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 p-4 sm:p-5 lg:p-6 flex flex-col justify-between min-h-[120px] sm:min-h-[136px] shadow-framer-card"
              >
                <div className="flex items-center justify-between w-full">
                  <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-[#ff5a1f]" />
                  <span className="text-[10.5px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#15130f]/40 dark:text-[#fbf8f1]/40">
                    Streak
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 mt-2.5 sm:mt-3">
                  <p className="font-clash font-semibold text-[30px] min-[380px]:text-[34px] sm:text-[36px] tracking-[-0.03em] leading-none text-[#15130f] dark:text-[#fbf8f1]">
                    {longestStreak} days
                  </p>
                  <p className="text-[13px] sm:text-[14px] text-[#15130f]/60 dark:text-[#fbf8f1]/60 font-normal">
                    Longest current streak
                  </p>
                </div>
              </motion.div>

              {/* Card 3: Completion This Month */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.16 }}
                className="rounded-[22px] sm:rounded-[24px] bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 p-4 sm:p-5 lg:p-6 flex flex-col justify-between min-h-[120px] sm:min-h-[136px] shadow-framer-card"
              >
                <div className="flex items-center justify-between w-full">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-[#15130f] dark:text-[#fbf8f1]" />
                  <span className="text-[10.5px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#15130f]/40 dark:text-[#fbf8f1]/40">
                    Monthly
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 mt-2.5 sm:mt-3">
                  <p className="font-clash font-semibold text-[30px] min-[380px]:text-[34px] sm:text-[36px] tracking-[-0.03em] leading-none text-[#15130f] dark:text-[#fbf8f1]">
                    {monthlyCompletionRate}%
                  </p>
                  <p className="text-[12.5px] sm:text-[13.5px] text-[#15130f]/60 dark:text-[#fbf8f1]/60 font-normal">
                    {monthlyCompletedChecks} of {monthlyPossibleChecks} done this month
                  </p>
                </div>
              </motion.div>
            </motion.section>

            {/* Body Section: Habits List (Left) & This Week Card (Right) */}
            <section className="flex flex-col xl:flex-row items-start gap-5 sm:gap-6 w-full">
              {/* Left Column: Today’s habits */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: 0.14 }}
                className="flex-1 w-full flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-clash font-semibold text-[19px] sm:text-[20px] text-[#15130f] dark:text-[#fbf8f1] tracking-tight">
                    Today’s habits
                  </h3>
                  <span className="text-xs font-medium text-[#15130f]/50 dark:text-[#fbf8f1]/50">
                    {habits.length} habits
                  </span>
                </div>

                {habits.length === 0 ? (
                  <div className="rounded-[24px] bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 p-7 sm:p-10 flex flex-col items-center justify-center text-center gap-3">
                    <Target className="w-8 h-8 text-[#ff5a1f]" />
                    <h4 className="font-clash font-semibold text-lg text-[#15130f] dark:text-[#fbf8f1]">
                      No habits tracked yet
                    </h4>
                    <p className="text-sm text-[#15130f]/60 dark:text-[#fbf8f1]/60 max-w-sm">
                      Build your daily routine by adding your first habit. Consistency creates momentum.
                    </p>
                    <button
                      onClick={handleOpenCreateModal}
                      className="mt-2 px-4 py-2 rounded-full bg-[#ff5a1f] text-white text-xs font-semibold cursor-pointer"
                    >
                      + Add habit
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 w-full">
                    {habits.map((habit) => {
                      const isDone = Boolean(habit.logs?.[todayStr]);
                      const currentStreak = calculateContinuousStreak(habit.logs || {}) || habit.currentStreak || 1;

                      let displayTitle = habit.title;
                      let displaySubtitle = habit.subtitle || 'Daily routine';
                      if (habit.title.includes(' | ')) {
                        const parts = habit.title.split(' | ');
                        displayTitle = parts[0];
                        displaySubtitle = parts[1] || displaySubtitle;
                      }

                      return (
                        <motion.div
                          layout
                          key={habit.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          className={`relative group rounded-[20px] sm:rounded-[22px] p-3.5 sm:px-5 sm:py-4 flex items-center justify-between gap-2.5 sm:gap-4 transition-all duration-300 border ${
                            openMenuHabitId === habit.id ? 'z-30' : 'z-10'
                          } ${
                            isDone
                              ? 'bg-[#15130f] dark:bg-[#181612] text-[#fbf8f1] border-[#15130f] dark:border-[#2a2620] shadow-sm'
                              : 'bg-[#fbf8f1] dark:bg-[#1c1a16] text-[#15130f] dark:text-[#fbf8f1] border-[#15130f]/10 dark:border-[#fbf8f1]/10 shadow-framer-card hover:-translate-y-0.5'
                          }`}
                        >
                          {/* Left: Icon Chip + Title / Subtitle */}
                          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                            <div
                              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-[13px] sm:rounded-[15px] flex items-center justify-center shrink-0 transition-colors ${
                                isDone
                                  ? 'bg-[#fbf8f1]/10 text-[#fbf8f1]'
                                  : 'bg-[#f2ecdf] dark:bg-[#2b2721] text-[#15130f] dark:text-[#fbf8f1]'
                              }`}
                            >
                              {getSmartIcon(displayTitle, habit.icon)}
                            </div>

                            <div className="flex flex-col min-w-0">
                              <h4
                                className={`font-clash font-semibold text-[16px] sm:text-[18px] tracking-[-0.01em] truncate transition-all ${
                                  isDone
                                    ? 'line-through text-[#fbf8f1]/90'
                                    : 'text-[#15130f] dark:text-[#fbf8f1]'
                                }`}
                              >
                                {displayTitle}
                              </h4>
                              <p
                                className={`text-[12.5px] sm:text-[13.5px] truncate font-normal ${
                                  isDone
                                    ? 'text-[#fbf8f1]/55'
                                    : 'text-[#15130f]/55 dark:text-[#fbf8f1]/55'
                                }`}
                              >
                                {displaySubtitle}
                              </p>
                            </div>
                          </div>

                          {/* Right: Streak Flame + Interactive Check Button */}
                          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
                            {/* Streak Badge */}
                            <div className="flex items-center gap-1 sm:gap-1.5 select-none" title={`${currentStreak} day streak`}>
                              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff5a1f]" />
                              <span
                                className={`font-semibold text-[13px] sm:text-[14px] font-archivo ${
                                  isDone ? 'text-[#fbf8f1]' : 'text-[#15130f] dark:text-[#fbf8f1]'
                                }`}
                              >
                                {currentStreak}
                              </span>
                            </div>

                            {/* Check Button */}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.92 }}
                              onClick={(e) => handleToggleHabit(habit.id, e)}
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                isDone
                                  ? 'bg-[#ff5a1f] border-[1.5px] border-[#ff5a1f] text-white shadow-sm'
                                  : 'bg-transparent border-[1.5px] border-[#15130f] dark:border-[#fbf8f1] hover:border-[#ff5a1f] text-transparent hover:text-[#ff5a1f]/30'
                              }`}
                              title={isDone ? 'Mark as todo' : 'Mark as done'}
                            >
                              <Check
                                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3] transition-transform ${
                                  isDone ? 'scale-100' : 'scale-75'
                                }`}
                              />
                            </motion.button>

                            {/* Habit Context Actions */}
                            <div className="relative" data-habit-menu>
                              <button
                                data-habit-menu
                                type="button"
                                aria-label={`Options for ${displayTitle}`}
                                aria-expanded={openMenuHabitId === habit.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingHabitId(null);
                                  setOpenMenuHabitId((prev) => (prev === habit.id ? null : habit.id));
                                }}
                                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                                  openMenuHabitId === habit.id
                                    ? 'opacity-100 bg-[#15130f]/10 dark:bg-[#fbf8f1]/15 text-[#15130f] dark:text-[#fbf8f1]'
                                    : 'opacity-40 hover:opacity-100'
                                } ${isDone ? 'text-[#fbf8f1]' : 'text-[#15130f] dark:text-[#fbf8f1]'}`}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              <AnimatePresence>
                                {openMenuHabitId === habit.id && (
                                  <motion.div
                                    data-habit-menu
                                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-full mt-2 w-52 p-1.5 rounded-2xl bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/15 dark:border-[#fbf8f1]/15 shadow-2xl z-50 text-[#15130f] dark:text-[#fbf8f1]"
                                  >
                                    {deletingHabitId === habit.id ? (
                                      <div className="p-2 space-y-2 select-none">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                                          <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                          <span>Delete habit?</span>
                                        </div>
                                        <p className="text-[11.5px] text-[#15130f]/60 dark:text-[#fbf8f1]/60 leading-tight">
                                          Permanently remove &quot;{displayTitle}&quot; and all streak history.
                                        </p>
                                        <div className="flex items-center gap-1.5 pt-1">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setDeletingHabitId(null);
                                            }}
                                            className="flex-1 py-1 px-2 rounded-lg text-xs font-medium border border-[#15130f]/15 dark:border-[#fbf8f1]/15 text-[#15130f] dark:text-[#fbf8f1] hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/5 transition-colors cursor-pointer"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteHabit(habit.id);
                                              setDeletingHabitId(null);
                                            }}
                                            className="flex-1 py-1 px-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-sm"
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-0.5">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleHabit(habit.id, e);
                                            setOpenMenuHabitId(null);
                                          }}
                                          className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-xs font-medium text-[#15130f] dark:text-[#fbf8f1] hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/10 transition-colors cursor-pointer"
                                        >
                                          {isDone ? (
                                            <>
                                              <RotateCcw className="w-3.5 h-3.5 text-[#ff5a1f]" />
                                              <span>Mark as todo</span>
                                            </>
                                          ) : (
                                            <>
                                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                                              <span>Mark as complete</span>
                                            </>
                                          )}
                                        </button>

                                        <div className="h-px bg-[#15130f]/10 dark:bg-[#fbf8f1]/10 my-0.5" />

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setDeletingHabitId(habit.id);
                                          }}
                                          className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                          <span>Delete habit</span>
                                        </button>
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              {/* Right Column: This week (Centered when stacked on tablet/mobile, fixed 320px on xl desktop) */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.18 }}
                className="w-full xl:w-[320px] max-w-xl mx-auto xl:mx-0 rounded-[24px] bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 p-4 sm:p-6 flex flex-col gap-5 shadow-framer-card shrink-0"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-clash font-semibold text-[19px] sm:text-[20px] text-[#15130f] dark:text-[#fbf8f1] tracking-tight">
                    This week
                  </h3>
                  <span className="text-[11px] font-semibold text-[#15130f]/40 dark:text-[#fbf8f1]/40 uppercase tracking-wider">
                    7 Days
                  </span>
                </div>

                {/* 7-Day Vertical Bar Chart */}
                <div className="flex items-end justify-between w-full h-[160px] pt-4 select-none">
                  {weekDaysData.map((day, idx) => {
                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center justify-end gap-2 h-full w-[28px] group relative"
                      >
                        {/* Hover Tooltip */}
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-[#15130f] text-white text-[10px] font-medium px-2 py-0.5 rounded shadow whitespace-nowrap z-10">
                          {day.pct}% done
                        </div>

                        {/* Animated Bar */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: day.barHeight }}
                          transition={{ type: 'spring', stiffness: 350, damping: 25, delay: idx * 0.05 }}
                          className={`w-[28px] rounded-[8px] transition-colors ${
                            day.isToday
                              ? 'bg-[#ff5a1f] shadow-sm'
                              : day.completed > 0 || (day.isPast && day.pct >= 50)
                              ? 'bg-[#15130f] dark:bg-[#fbf8f1]'
                              : 'bg-[#15130f]/18 dark:bg-[#fbf8f1]/18'
                          }`}
                        />

                        {/* Weekday Label: M, T, W, T, F, S, S */}
                        <span
                          className={`text-[12px] font-semibold font-archivo ${
                            day.isToday
                              ? 'text-[#ff5a1f] font-bold'
                              : 'text-[#15130f]/55 dark:text-[#fbf8f1]/55'
                          }`}
                        >
                          {day.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="w-full h-px bg-[#15130f]/10 dark:border-[#fbf8f1]/10" />

                {/* Footnote Reminder - Dynamic & Interactive (Full message visible) */}
                <div className="flex items-start justify-between gap-2.5 text-[#15130f]/80 dark:text-[#fbf8f1]/80 select-none">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div className="pt-0.5 shrink-0">
                      {nextReminder?.allDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : notificationsEnabled ? (
                        <Bell className="w-4 h-4 text-[#ff5a1f] fill-[#ff5a1f]/20 animate-pulse" />
                      ) : (
                        <Bell className="w-4 h-4 text-[#ff5a1f]" />
                      )}
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      {nextReminder?.allDone ? (
                        <span className="text-[13px] sm:text-[13.5px] font-medium leading-snug text-[#15130f] dark:text-[#fbf8f1]">
                          All reminders clear for today! 🎉
                        </span>
                      ) : nextReminder ? (
                        <>
                          <span className="text-[13px] sm:text-[13.5px] font-semibold text-[#15130f] dark:text-[#fbf8f1] leading-snug break-words">
                            {nextReminder.title}
                          </span>
                          <span className="text-[11.5px] text-[#ff5a1f] font-medium leading-tight mt-0.5">
                            {nextReminder.timeStr ? `Reminder at ${nextReminder.timeStr}` : 'Scheduled today'}
                          </span>
                        </>
                      ) : (
                        <span className="text-[13px] text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                          No pending reminders
                        </span>
                      )}
                    </div>
                  </div>

                  {notificationSupported && (
                    <button
                      type="button"
                      onClick={handleToggleNotifications}
                      title={
                        notificationsEnabled
                          ? 'Click to pause browser reminders'
                          : 'Click to enable browser push reminders'
                      }
                      className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full transition-all shrink-0 cursor-pointer flex items-center gap-1 mt-0.5 ${
                        notificationsEnabled
                          ? 'bg-[#ff5a1f]/15 text-[#ff5a1f] border border-[#ff5a1f]/30 hover:bg-[#ff5a1f]/25'
                          : 'bg-[#15130f]/5 dark:bg-[#fbf8f1]/10 text-[#15130f]/50 dark:text-[#fbf8f1]/50 hover:text-[#ff5a1f] hover:bg-[#ff5a1f]/10'
                      }`}
                    >
                      {notificationsEnabled ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a1f]" />
                          <span>On</span>
                        </>
                      ) : (
                        <span>Enable</span>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            </section>
          </motion.div>
        )}

        {/* VIEW 2: CALENDAR (Monthly Matrix & 365 Heatmap) */}
        {activeTab === 'calendar' && (
          <motion.section
            key="calendar"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6 w-full"
          >
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.04 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <h2 className="font-clash font-semibold text-3xl text-[#15130f] dark:text-[#fbf8f1]">
                  Discipline Calendar
                </h2>
                <p className="text-sm text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                  {calendarSubView === 'annual-365'
                    ? `Track full-year habit completions across your ${isLeapYear(heatmapYear) ? '366-day leap year' : '365-day'} consistency matrix for ${heatmapYear}.`
                    : `Track full-month habit completions and daily routines for ${MONTH_NAMES[selectedMonth]} ${selectedYear}.`}
                </p>
              </div>

              {/* Sub-view toggle */}
              <div className="flex items-center p-1 rounded-full bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 gap-1">
                <button
                  onClick={() => setCalendarSubView('matrix')}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all cursor-pointer ${
                    calendarSubView === 'matrix'
                      ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] shadow-sm'
                      : 'text-[#15130f]/70 dark:text-[#fbf8f1]/70 hover:text-[#ff5a1f] dark:hover:text-[#ff5a1f]'
                  }`}
                >
                  Monthly Grid
                </button>
                {drop1Unlocked ? (
                  <button
                    onClick={() => setCalendarSubView('annual-365')}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all cursor-pointer ${
                      calendarSubView === 'annual-365'
                        ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] shadow-sm'
                        : 'text-[#15130f]/70 dark:text-[#fbf8f1]/70 hover:text-[#ff5a1f] dark:hover:text-[#ff5a1f]'
                    }`}
                  >
                    {isLeapYear(heatmapYear) ? '366 Heatmap' : '365 Heatmap'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      toast.info('Drop 1: Master Heatmap', {
                        description: 'The 365/366-Day Heatmap releases on October 10th! Opening roadmap...',
                      });
                      setIsRoadmapOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold text-[#15130f]/60 dark:text-[#fbf8f1]/60 hover:text-[#ff5a1f] dark:hover:text-[#ff5a1f] transition-all cursor-pointer flex items-center gap-1.5"
                    title="Drop 1: Releasing October 10th, 2026"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a1f] animate-pulse" />
                    <span>Heatmap (Drops Oct 10)</span>
                  </button>
                )}
              </div>
            </motion.div>

            {calendarSubView === 'annual-365' && drop1Unlocked ? (
              <div className="rounded-[24px] bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 p-4 sm:p-6 shadow-framer-card">
                <YearHeatmapMatrix
                  habits={habits}
                  selectedYear={heatmapYear}
                  onYearChange={setHeatmapYear}
                  isGuestMode={isGuestMode}
                />
              </div>
            ) : (
              <div className="rounded-[24px] bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 p-4 sm:p-6 shadow-framer-card overflow-x-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-clash font-semibold text-lg sm:text-xl text-[#15130f] dark:text-[#fbf8f1]">
                      {MONTH_NAMES[selectedMonth]} {selectedYear}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#ff5a1f]/10 text-[#ff5a1f] border border-[#ff5a1f]/20">
                      72h Edit Window
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() =>
                        setSelectedMonth((prev) => (prev === 0 ? 11 : prev - 1))
                      }
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 hover:bg-[#ff5a1f] hover:text-white transition-all cursor-pointer"
                    >
                      Prev Month
                    </button>
                    <button
                      onClick={() =>
                        setSelectedMonth((prev) => (prev === 11 ? 0 : prev + 1))
                      }
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 hover:bg-[#ff5a1f] hover:text-white transition-all cursor-pointer"
                    >
                      Next Month
                    </button>
                  </div>
                </div>

                {/* Mobile Swipe Hint */}
                <div className="flex items-center justify-between text-xs text-[#15130f]/50 dark:text-[#fbf8f1]/50 sm:hidden mb-2.5 font-medium">
                  <span>← Swipe across 31 days →</span>
                </div>

                {/* Interactive Monthly Table with Checkbox Toggles & Sticky Habit Column */}
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                      <th className="sticky left-0 z-20 bg-[#fbf8f1] dark:bg-[#1c1a16] py-2.5 pr-4 pl-1 font-semibold min-w-[125px] sm:min-w-[150px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.4)]">
                        Habit
                      </th>
                      {Array.from({ length: daysInSelectedMonth }).map((_, i) => (
                        <th key={i} className="p-1 text-center font-semibold w-7">
                          {i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {habits.map((h) => (
                      <tr key={h.id} className="border-b border-[#15130f]/5 dark:border-[#fbf8f1]/5 hover:bg-[#15130f]/2 transition-colors">
                        <td className="sticky left-0 z-10 bg-[#fbf8f1] dark:bg-[#1c1a16] py-3 pr-4 pl-1 font-semibold text-[#15130f] dark:text-[#fbf8f1] truncate max-w-[125px] sm:max-w-[150px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.4)]">
                          {h.title}
                        </td>
                        {Array.from({ length: daysInSelectedMonth }).map((_, i) => {
                          const mm = String(selectedMonth + 1).padStart(2, '0');
                          const dd = String(i + 1).padStart(2, '0');
                          const dateKey = `${selectedYear}-${mm}-${dd}`;
                          const isDone = Boolean(h.logs?.[dateKey]);
                          const isCellToday = dateKey === todayStr;

                          const cellDate = new Date(Date.UTC(selectedYear, selectedMonth, i + 1));
                          const now = new Date();
                          const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
                          const diffDays = Math.round((todayUTC.getTime() - cellDate.getTime()) / (1000 * 60 * 60 * 24));
                          const isFuture = diffDays < 0;
                          const isExpired = diffDays > 3;
                          const isEditable = !isFuture && !isExpired && !isGuestMode;

                          let titleText = `${h.title} on ${dateKey}: ${isDone ? 'Done' : 'Incomplete'}`;
                          if (isGuestMode) {
                            titleText = `${h.title} on ${dateKey}: Sign in required to log habits`;
                          } else if (isFuture) {
                            titleText = `${h.title} on ${dateKey}: Future date locked`;
                          } else if (isExpired) {
                            titleText = `${h.title} on ${dateKey}: ${isDone ? 'Completed' : 'Missed'} (Locked after 72h)`;
                          }
                          let cellButtonClasses = 'w-[22px] h-[22px] sm:w-6 sm:h-6 rounded-[7px] transition-all inline-flex items-center justify-center shrink-0 ';
                          if (isDone) {
                            cellButtonClasses += isEditable
                              ? 'bg-[#ff5a1f] hover:bg-[#e04a12] text-white shadow-sm cursor-pointer hover:scale-110 active:scale-95'
                              : 'bg-[#ff5a1f] text-white cursor-not-allowed shadow-xs';
                          } else {
                            if (isFuture) {
                              cellButtonClasses += 'opacity-25 cursor-not-allowed bg-[#15130f]/3 dark:bg-[#fbf8f1]/4 border border-dashed border-[#15130f]/15 dark:border-[#fbf8f1]/15';
                            } else if (!isEditable) {
                              cellButtonClasses += 'cursor-not-allowed bg-[#15130f]/6 dark:bg-[#fbf8f1]/8 border border-[#15130f]/10 dark:border-[#fbf8f1]/10';
                            } else {
                              cellButtonClasses += 'cursor-pointer bg-[#15130f]/8 dark:bg-[#fbf8f1]/10 hover:bg-[#ff5a1f]/20 hover:border-[#ff5a1f]/40 border border-[#15130f]/10 dark:border-[#fbf8f1]/10 hover:scale-110 active:scale-95';
                            }
                          }
                          if (isCellToday) {
                            cellButtonClasses += ' ring-2 ring-[#ff5a1f] ring-offset-1 dark:ring-offset-[#1c1a16]';
                          }

                          return (
                            <td key={i} className="p-1 text-center">
                              <button
                                onClick={(e) => handleToggleHabit(h.id, e, dateKey)}
                                className={cellButtonClasses}
                                title={titleText}
                              >
                                {isDone && <Check className="w-3.5 h-3.5 text-white stroke-[3.5] shrink-0" />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.section>
        )}

        {/* VIEW 3: GOALS & 30-DAY CHALLENGES */}
        {activeTab === 'goals' && (
          <motion.section
            key="goals"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6 w-full"
          >
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.04 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <h2 className="font-clash font-semibold text-2xl sm:text-3xl text-[#15130f] dark:text-[#fbf8f1]">
                  Discipline Goals & Challenges
                </h2>
                <p className="text-sm text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                  Sprint towards unbreakable consistency with 14, 21, and 30-day challenges.
                </p>
              </div>

              {!challenge && (
                <button
                  onClick={handleOpenChallengeModal}
                  className="px-5 py-2.5 rounded-full bg-[#ff5a1f] hover:bg-[#e04a12] text-white text-xs font-semibold shadow-sm shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  + Launch challenge
                </button>
              )}
            </motion.div>

            {challenge ? (
              <div className="rounded-[24px] bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 p-5 sm:p-8 shadow-framer-card flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#ff5a1f] text-white flex items-center justify-center font-bold shrink-0">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-clash font-semibold text-lg sm:text-xl text-[#15130f] dark:text-[#fbf8f1]">
                      {challenge.title}
                    </h3>
                    <p className="text-xs text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                      {challenge.duration_days}-day sprint • Started {challenge.start_date}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setIsActiveChallengeModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] text-xs font-semibold cursor-pointer"
                  >
                    View challenge details
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-[24px] bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 p-7 sm:p-12 text-center flex flex-col items-center gap-3 shadow-framer-card">
                <Trophy className="w-10 h-10 text-[#ff5a1f]" />
                <h3 className="font-clash font-semibold text-lg sm:text-xl text-[#15130f] dark:text-[#fbf8f1]">
                  No active challenge
                </h3>
                <p className="text-sm text-[#15130f]/60 dark:text-[#fbf8f1]/60 max-w-md">
                  Level up your willpower. Choose core habits and commit to an unbroken consistency streak.
                </p>
                <button
                  onClick={handleOpenChallengeModal}
                  className="mt-3 px-5 py-2.5 rounded-full bg-[#ff5a1f] hover:bg-[#e04a12] text-white font-semibold text-xs shadow-sm cursor-pointer"
                >
                  Start a Challenge
                </button>
              </div>
            )}

            {/* ── Challenge History ── */}
            {pastChallenges.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2.5 mb-4">
                  <History className="w-5 h-5 text-[#15130f]/50 dark:text-[#fbf8f1]/50" />
                  <h3 className="font-clash font-semibold text-lg text-[#15130f] dark:text-[#fbf8f1]">
                    Challenge History
                  </h3>
                  <span className="ml-auto text-xs text-[#15130f]/40 dark:text-[#fbf8f1]/40 font-medium">
                    {pastChallenges.length} past {pastChallenges.length === 1 ? 'challenge' : 'challenges'}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {pastChallenges.map((pc) => {
                    const isCompleted = pc.status === 'completed';
                    const datePart = (pc.start_date || '').split('T')[0];
                    const [sY, sM, sD] = datePart.split('-').map(Number);
                    const startDt = (sY && sM && sD) ? new Date(Date.UTC(sY, sM - 1, sD)) : new Date(pc.start_date);
                    const endDt = new Date(startDt);
                    endDt.setUTCDate(endDt.getUTCDate() + (pc.duration_days || 1) - 1);
                    const dateOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' };
                    const startStr = isNaN(startDt.getTime()) ? pc.start_date : startDt.toLocaleDateString('en-US', dateOpts);
                    const endStr = isNaN(endDt.getTime()) ? '' : endDt.toLocaleDateString('en-US', dateOpts);

                    return (
                      <div
                        key={pc.id}
                        className={`rounded-2xl border p-4 sm:p-5 flex items-start gap-3.5 transition-colors ${
                          isCompleted
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/30'
                            : 'bg-red-50/50 dark:bg-red-950/15 border-red-200/50 dark:border-red-800/25'
                        }`}
                      >
                        {/* Status Icon */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-red-500/15 dark:bg-red-500/20 text-red-500 dark:text-red-400'
                        }`}>
                          {isCompleted ? <Award className="w-4.5 h-4.5" /> : <XCircle className="w-4.5 h-4.5" />}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-clash font-semibold text-sm sm:text-base text-[#15130f] dark:text-[#fbf8f1] truncate">
                              {pc.title}
                            </h4>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0 ${
                              isCompleted
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                                : 'bg-red-500/15 text-red-600 dark:text-red-400'
                            }`}>
                              {isCompleted ? '✓ Completed' : '✗ Abandoned'}
                            </span>
                          </div>
                          <p className="text-xs text-[#15130f]/50 dark:text-[#fbf8f1]/50 mt-0.5">
                            {pc.duration_days}-day sprint &bull; {startStr} → {endStr}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty state when no active and no past */}
            {!challenge && pastChallenges.length === 0 && (
              <p className="text-xs text-[#15130f]/40 dark:text-[#fbf8f1]/40 text-center mt-2">
                Your completed and abandoned challenges will appear here.
              </p>
            )}
          </motion.section>
        )}

        {/* VIEW 4: REFLECTION JOURNAL */}
        {activeTab === 'journal' && (
          <motion.section
            key="journal"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-5 sm:gap-6 w-full"
          >
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.04 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
            >
              <div>
                <h2 className="font-clash font-semibold text-2xl sm:text-3xl text-[#15130f] dark:text-[#fbf8f1]">
                  Discipline Journal
                </h2>
                <p className="text-sm text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                  Log your monthly wins, self-reflections, and habit system adjustments.
                </p>
              </div>

              {/* Month & Year Navigation Pill */}
              <div className="flex items-center gap-2 self-start sm:self-auto bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 rounded-full px-3 py-1.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedMonth === 0) {
                      setSelectedMonth(11);
                      setSelectedYear((prev) => prev - 1);
                    } else {
                      setSelectedMonth((prev) => prev - 1);
                    }
                  }}
                  className="p-1 rounded-full text-[#15130f]/60 dark:text-[#fbf8f1]/60 hover:text-[#ff5a1f] hover:bg-[#ff5a1f]/10 transition-colors cursor-pointer"
                  title="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold font-clash px-1 text-[#15130f] dark:text-[#fbf8f1]">
                  {MONTH_NAMES[selectedMonth]} {selectedYear}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedMonth === 11) {
                      setSelectedMonth(0);
                      setSelectedYear((prev) => prev + 1);
                    } else {
                      setSelectedMonth((prev) => prev + 1);
                    }
                  }}
                  className="p-1 rounded-full text-[#15130f]/60 dark:text-[#fbf8f1]/60 hover:text-[#ff5a1f] hover:bg-[#ff5a1f]/10 transition-colors cursor-pointer"
                  title="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            <NotesSection
              year={selectedYear}
              month={selectedMonth}
              monthName={MONTH_NAMES[selectedMonth]}
              userEmail={userEmail}
              readOnly={isGuestMode}
              serverNotes={monthlyNotes[`${selectedYear}_${selectedMonth}`] ?? null}
              onSaveNote={(y, m, text) => {
                setMonthlyNotes((prev) => ({ ...prev, [`${y}_${m}`]: text }));
              }}
              onRequireAuth={() => setIsAuthModalOpen(true)}
            />
          </motion.section>
        )}

        {/* VIEW 5: SETTINGS & ACCOUNT MANAGEMENT */}
        {activeTab === 'settings' && (
          <motion.section
            key="settings"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6 w-full max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.04 }}
            >
              <h2 className="font-clash font-semibold text-2xl sm:text-3xl text-[#15130f] dark:text-[#fbf8f1]">
                Settings & Workspace
              </h2>
              <p className="text-sm text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                Customize your workspace, profile, and account preferences.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08 }}
              className="rounded-[24px] bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 p-5 sm:p-6 flex flex-col gap-5 shadow-framer-card"
            >
              {/* Profile Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#15130f]/10 dark:border-[#fbf8f1]/10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#ff5a1f] text-white flex items-center justify-center font-clash font-bold text-base sm:text-lg shrink-0">
                    {(personalizedName || userEmail || 'H').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-clash font-semibold text-base sm:text-lg text-[#15130f] dark:text-[#fbf8f1]">
                      {personalizedName || (isGuestMode ? 'Guest Mode' : 'Connected User')}
                    </h3>
                    <p className="text-xs text-[#15130f]/50 dark:text-[#fbf8f1]/50">
                      {isGuestMode ? 'Data stored locally on this device' : userEmail}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 rounded-full bg-[#15130f]/10 dark:bg-[#fbf8f1]/10 text-[13px] font-semibold hover:bg-[#ff5a1f] hover:text-white transition-colors cursor-pointer text-center"
                >
                  Personalize Profile
                </button>
              </div>

              {/* Theme Settings */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2">
                <div>
                  <h4 className="font-semibold text-sm text-[#15130f] dark:text-[#fbf8f1]">
                    Appearance
                  </h4>
                  <p className="text-xs text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                    Switch between Warm Natural ivory canvas and Midnight mode
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="self-start sm:self-auto px-4 py-2 rounded-full bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] text-[13px] font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>

              {/* v2.0 Roadmap Teaser */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-t border-[#15130f]/10 dark:border-[#fbf8f1]/10">
                <div>
                  <h4 className="font-semibold text-sm text-[#15130f] dark:text-[#fbf8f1]">
                    v2.0 Evolution Cycle
                  </h4>
                  <p className="text-xs text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                    Explore all 6 future releases and upcoming feature milestones
                  </p>
                </div>
                <button
                  onClick={() => setIsRoadmapOpen(true)}
                  className="self-start sm:self-auto px-4 py-2 rounded-full bg-[#ff5a1f]/10 text-[#ff5a1f] border border-[#ff5a1f]/20 text-[13px] font-semibold hover:bg-[#ff5a1f] hover:text-white transition-all cursor-pointer"
                >
                  View 6 Drops
                </button>
              </div>

              {/* Account Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#15130f]/10 dark:border-[#fbf8f1]/10">
                {isGuestMode ? (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#ff5a1f] text-white text-xs font-semibold shadow-sm cursor-pointer"
                  >
                    Create Free Account to Sync Cloud
                  </button>
                ) : (
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => setIsSignOutModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-[#15130f]/80 dark:text-[#fbf8f1]/80 bg-[#15130f]/10 dark:bg-[#fbf8f1]/10 text-xs font-semibold hover:bg-[#15130f]/15 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="px-4 py-2 rounded-full text-rose-600 bg-rose-50 dark:bg-rose-950/20 text-xs font-semibold hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      Delete Account
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.section>
        )}
        </AnimatePresence>
      </main>

      {/* ============================================================== */}
      {/* 4. ALL APPLICATION MODALS */}
      {/* ============================================================== */}

      {/* CREATE HABIT MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-[390px] rounded-[28px] bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/15 dark:border-[#fbf8f1]/15 p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-[#15130f] dark:text-[#fbf8f1] max-h-[min(90vh,640px)] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-clash font-semibold text-xl sm:text-[22px] tracking-tight">
                  New habit
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-full text-[#15130f]/40 hover:text-[#15130f] dark:text-[#fbf8f1]/40 dark:hover:text-[#fbf8f1] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateHabit} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10.5px] font-semibold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                    Habit name
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Morning stretch"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#ff5a1f] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10.5px] font-semibold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                    Target & Time Routine
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15 min · 7:30 AM"
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#ff5a1f] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10.5px] font-semibold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                      Select Icon
                    </label>
                    <span className="text-[11px] font-medium text-[#ff5a1f]">
                      {[
                        { id: 'footprints', label: 'Run' },
                        { id: 'droplets', label: 'Water' },
                        { id: 'book', label: 'Read' },
                        { id: 'brain', label: 'Mind' },
                        { id: 'focus', label: 'Focus' },
                        { id: 'zap', label: 'Energy' },
                        { id: 'coffee', label: 'Coffee' },
                        { id: 'dumbbell', label: 'Gym' },
                        { id: 'heart', label: 'Health' },
                        { id: 'pencil', label: 'Journal' },
                        { id: 'moon', label: 'Sleep' },
                        { id: 'laptop', label: 'Work' },
                        { id: 'sun', label: 'Morning' },
                        { id: 'apple', label: 'Diet' },
                        { id: 'music', label: 'Music' },
                        { id: 'bike', label: 'Cycling' },
                      ].find((item) => item.id === newIcon)?.label || 'Mind'}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1">
                    {[
                      { id: 'footprints', icon: Footprints, label: 'Run' },
                      { id: 'droplets', icon: Droplets, label: 'Water' },
                      { id: 'book', icon: BookOpen, label: 'Read' },
                      { id: 'brain', icon: Brain, label: 'Mind' },
                      { id: 'focus', icon: Target, label: 'Focus' },
                      { id: 'zap', icon: Zap, label: 'Energy' },
                      { id: 'coffee', icon: Coffee, label: 'Coffee' },
                      { id: 'dumbbell', icon: Dumbbell, label: 'Gym' },
                      { id: 'heart', icon: Heart, label: 'Health' },
                      { id: 'pencil', icon: Pencil, label: 'Journal' },
                      { id: 'moon', icon: Moon, label: 'Sleep' },
                      { id: 'laptop', icon: Laptop, label: 'Work' },
                      { id: 'sun', icon: Sun, label: 'Morning' },
                      { id: 'apple', icon: Apple, label: 'Diet' },
                      { id: 'music', icon: Music, label: 'Music' },
                      { id: 'bike', icon: Bike, label: 'Cycling' },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = newIcon === item.id;
                      return (
                        <div key={item.id} className="relative group">
                          <button
                            type="button"
                            title={item.label}
                            aria-label={item.label}
                            onClick={() => setNewIcon(item.id)}
                            className={`w-full aspect-square rounded-2xl border flex items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] border-transparent scale-105 shadow-sm'
                                : 'bg-[#f2ecdf] dark:bg-[#11100d] border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-[#15130f]/60 dark:text-[#fbf8f1]/60 hover:text-[#ff5a1f] dark:hover:text-[#ff5a1f] hover:scale-105'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </button>
                          {/* Animated floating hover tooltip */}
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] text-[10px] font-semibold tracking-tight shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-30">
                            {item.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="mt-1 w-full py-2.5 sm:py-3 rounded-full bg-[#ff5a1f] hover:bg-[#e04a12] text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create habit'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          defaultMode="signup"
        />
      )}

      {/* Upcoming v2.0 Roadmap Modal */}
      {isRoadmapOpen && (
        <UpcomingUpdateModal
          isOpen={isRoadmapOpen}
          onClose={() => setIsRoadmapOpen(false)}
        />
      )}

      {/* Personalize Profile Modal */}
      {isProfileModalOpen && (
        <PersonalizeProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          userId={userId}
          initialFirstName={userFirstName || initialCustomName}
          initialLastName={userLastName}
          initialNickname={initialCustomName}
          onProfileUpdated={() => {
            setIsProfileModalOpen(false);
            window.location.reload();
          }}
        />
      )}

      {/* Create Challenge Modal */}
      {isChallengeModalOpen && (
        <CreateChallengeModal
          isOpen={isChallengeModalOpen}
          onClose={() => setIsChallengeModalOpen(false)}
          habits={habits}
          onCreate={async (title, durationDays, startDate, habitIds) => {
            if (isGuestMode) {
              toast.info('Sign in required', {
                description: 'Guest users cannot create challenges. Please sign in or create an account.',
              });
              setIsAuthModalOpen(true);
              return;
            }
            try {
              const res = await createChallengeAction(title, durationDays, startDate, habitIds);
              if (res.error) {
                toast.error(res.error);
                return;
              }
              if (res.data) {
                setChallenge(res.data);
                if (userEmail) {
                  localStorage.setItem(`habit_challenge_${userEmail}`, JSON.stringify(res.data));
                }
              }
              setIsChallengeModalOpen(false);
              toast.success(`Launched ${durationDays}-day challenge!`);
            } catch {
              toast.error('Failed to launch challenge');
            }
          }}
          activeChallengeTitle={challenge?.title}
        />
      )}

      {/* Active Challenge Modal */}
      {isActiveChallengeModalOpen && challenge && (
        <ActiveChallengeModal
          isOpen={isActiveChallengeModalOpen}
          onClose={() => setIsActiveChallengeModalOpen(false)}
          challenge={challenge}
          habits={habits}
          onCompleteChallenge={handleCompleteChallenge}
          onAbandonChallenge={handleAbandonChallenge}
        />
      )}

      {/* Sign Out Modal */}
      {isSignOutModalOpen && (
        <SignOutModal
          isOpen={isSignOutModalOpen}
          onClose={() => setIsSignOutModalOpen(false)}
          onConfirm={async () => {
            setIsSigningOut(true);
            await signOutAction();
            setPendingAuthToast({
              type: 'info',
              message: 'Signed out',
              description: 'You are now viewing your local workspace.',
            });
            window.location.reload();
          }}
          userEmail={userEmail}
          isSigningOut={isSigningOut}
        />
      )}

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <DeleteAccountModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          userEmail={userEmail}
        />
      )}
    </div>
  );
}
