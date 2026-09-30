import { Challenge, ChallengePreset, ChallengeProgress, Milestone } from '@/types/challenge.types';
import { HabitWithLogs } from '@/types/database.types';
import { formatDateToISO } from '@/lib/dateUtils';

export const CHALLENGE_PRESETS: ChallengePreset[] = [
  {
    id: '75-hard',
    title: '75-Day Discipline',
    durationDays: 75,
    description: 'Transform your physical fitness, focus, and grit over 75 unbroken days.',
    badge: '75 HARD',
    accentColor: '#F43F5E',
  },
  {
    id: '90-day-monk',
    title: '90-Day Monk Mode',
    durationDays: 90,
    description: 'Eliminate distractions, build deep work routines, and achieve mastery.',
    badge: '90 MONK',
    accentColor: '#6366F1',
  },
  {
    id: '30-day-sprint',
    title: '30-Day Consistency Sprint',
    durationDays: 30,
    description: 'A focused 1-month sprint to lock in crucial daily habits with momentum.',
    badge: '30 SPRINT',
    accentColor: '#10B981',
  },
  {
    id: '21-day-foundation',
    title: '21-Day Habit Builder',
    durationDays: 21,
    description: 'Neuroscience-backed threshold to rewire pathways and cement new rituals.',
    badge: '21 DAYS',
    accentColor: '#F59E0B',
  },
];

export function computeChallengeProgress(
  challenge: Challenge,
  habits: HabitWithLogs[]
): ChallengeProgress {
  const [startY, startM, startD] = challenge.start_date.split('-').map(Number);
  const startDate = new Date(Date.UTC(startY, startM - 1, startD));

  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const isUpcoming = diffDays < 0;
  const daysUntilStart = isUpcoming ? Math.abs(diffDays) : 0;

  const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' };
  const formattedStartDate = startDate.toLocaleDateString('en-US', dateOptions);

  if (isUpcoming) {
    const milestones: Milestone[] = [
      { id: 'bronze', label: 'Bronze Milestone', threshold: 25, icon: '🥉', color: '#CD7F32', isUnlocked: false, unlockedAtDay: Math.ceil(challenge.duration_days * 0.25) },
      { id: 'silver', label: 'Silver Milestone', threshold: 50, icon: '🥈', color: '#C0C0C0', isUnlocked: false, unlockedAtDay: Math.ceil(challenge.duration_days * 0.5) },
      { id: 'gold', label: 'Gold Milestone', threshold: 75, icon: '🥇', color: '#FFD700', isUnlocked: false, unlockedAtDay: Math.ceil(challenge.duration_days * 0.75) },
      { id: 'champion', label: 'Finisher Champion', threshold: 100, icon: '👑', color: '#818CF8', isUnlocked: false, unlockedAtDay: challenge.duration_days },
    ];

    return {
      currentDay: 0,
      totalDays: challenge.duration_days,
      daysRemaining: challenge.duration_days,
      percentElapsed: 0,
      adherencePercentage: 0,
      totalCompletedChecks: 0,
      totalPossibleChecks: 0,
      isFinished: false,
      isUpcoming: true,
      daysUntilStart,
      formattedStartDate,
      milestones,
    };
  }

  const currentDay = Math.min(challenge.duration_days, diffDays + 1);
  const daysRemaining = Math.max(0, challenge.duration_days - currentDay);
  const percentElapsed = Math.min(100, Math.max(0, Math.round((currentDay / challenge.duration_days) * 100)));

  const activeHabits = challenge.habit_ids.length > 0
    ? habits.filter((h) => challenge.habit_ids.includes(h.id))
    : habits;

  let completedChecks = 0;
  let possibleChecks = 0;

  const checkDate = new Date(startDate);
  for (let i = 0; i < currentDay; i++) {
    const dateStr = formatDateToISO(new Date(checkDate.getUTCFullYear(), checkDate.getUTCMonth(), checkDate.getUTCDate()));
    activeHabits.forEach((habit) => {
      possibleChecks++;
      if (habit.logs[dateStr]) {
        completedChecks++;
      }
    });
    checkDate.setUTCDate(checkDate.getUTCDate() + 1);
  }

  const adherencePercentage = possibleChecks > 0 ? Math.round((completedChecks / possibleChecks) * 100) : 0;
  const isFinished = currentDay >= challenge.duration_days;

  const milestones: Milestone[] = [
    { id: 'bronze', label: 'Bronze Milestone', threshold: 25, icon: '🥉', color: '#CD7F32', isUnlocked: percentElapsed >= 25, unlockedAtDay: Math.ceil(challenge.duration_days * 0.25) },
    { id: 'silver', label: 'Silver Milestone', threshold: 50, icon: '🥈', color: '#C0C0C0', isUnlocked: percentElapsed >= 50, unlockedAtDay: Math.ceil(challenge.duration_days * 0.5) },
    { id: 'gold', label: 'Gold Milestone', threshold: 75, icon: '🥇', color: '#FFD700', isUnlocked: percentElapsed >= 75, unlockedAtDay: Math.ceil(challenge.duration_days * 0.75) },
    { id: 'champion', label: 'Finisher Champion', threshold: 100, icon: '👑', color: '#818CF8', isUnlocked: isFinished, unlockedAtDay: challenge.duration_days },
  ];

  return {
    currentDay,
    totalDays: challenge.duration_days,
    daysRemaining,
    percentElapsed,
    adherencePercentage,
    totalCompletedChecks: completedChecks,
    totalPossibleChecks: possibleChecks,
    isFinished,
    isUpcoming: false,
    daysUntilStart: 0,
    formattedStartDate,
    milestones,
  };
}
