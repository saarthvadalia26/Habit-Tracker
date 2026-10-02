'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  X,
  Flame,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Calendar,
  Clock,
  Target,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Challenge } from '@/types/challenge.types';
import { HabitWithLogs } from '@/types/database.types';
import { computeChallengeProgress } from '@/lib/challengeUtils';
import { formatDateToISO } from '@/lib/dateUtils';
import { toast } from 'sonner';

interface ActiveChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge | null;
  habits: HabitWithLogs[];
  onCompleteChallenge: (challengeId: string) => Promise<void>;
  onAbandonChallenge: (challengeId: string) => Promise<void>;
  onCelebrate?: () => void;
}

export function ActiveChallengeModal({
  isOpen,
  onClose,
  challenge,
  habits,
  onCompleteChallenge,
  onAbandonChallenge,
  onCelebrate,
}: ActiveChallengeModalProps) {
  const [isFinishing, setIsFinishing] = useState(false);
  const [isAbandoning, setIsAbandoning] = useState(false);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);

  const progress = useMemo(() => {
    if (!challenge) return null;
    return computeChallengeProgress(challenge, habits);
  }, [challenge, habits]);

  const enrolledHabits = useMemo(() => {
    if (!challenge) return [];
    if (!challenge.habit_ids || challenge.habit_ids.length === 0) return habits;
    return habits.filter((h) => challenge.habit_ids.includes(h.id));
  }, [challenge, habits]);

  const todayStr = useMemo(() => formatDateToISO(new Date()), []);

  const todayCompletedCount = useMemo(() => {
    return enrolledHabits.filter((h) => Boolean(h.logs[todayStr])).length;
  }, [enrolledHabits, todayStr]);

  if (!challenge || !progress) {
    return null;
  }

  const handleFinish = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    try {
      if (onCelebrate) onCelebrate();
      await onCompleteChallenge(challenge.id);
      toast.success('Challenge completed!', {
        description: `Incredible work conquering ${challenge.title}! 🎉`,
      });
      onClose();
    } catch {
      toast.error('Failed to complete challenge');
    } finally {
      setIsFinishing(false);
    }
  };

  const handleAbandon = async () => {
    if (isAbandoning) return;
    setIsAbandoning(true);
    try {
      await onAbandonChallenge(challenge.id);
      toast.info('Challenge reset', {
        description: 'You can now start a fresh challenge whenever you are ready.',
      });
      setShowAbandonConfirm(false);
      onClose();
    } catch {
      toast.error('Failed to reset challenge');
    } finally {
      setIsAbandoning(false);
    }
  };

  const handleScrollToBanner = () => {
    onClose();
    setTimeout(() => {
      const banner = document.getElementById('active-challenge-banner');
      if (banner) {
        banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="active-challenge-modal-title"
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', duration: 0.45, bounce: 0.2 }}
            className="relative w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-10 text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-500 flex items-center justify-center shadow-xs">
                  <Trophy className="w-5 h-5 stroke-[2.25]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center gap-1">
                      {progress.isUpcoming ? (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>Upcoming</span>
                        </>
                      ) : (
                        <>
                          <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>Active Challenge</span>
                        </>
                      )}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {progress.isUpcoming
                        ? `Starts in ${progress.daysUntilStart}d`
                        : `Day ${progress.currentDay} of ${progress.totalDays}`}
                    </span>
                  </div>
                  <h3
                    id="active-challenge-modal-title"
                    className="text-base sm:text-lg font-black tracking-tight mt-0.5"
                  >
                    {challenge.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close active challenge window"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {/* Challenge Status Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Time Progress</span>
                  </div>
                  <div className="mt-1 font-mono font-black text-slate-900 dark:text-white text-base">
                    {progress.isUpcoming ? '0%' : `${progress.percentElapsed}%`}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {progress.isUpcoming
                      ? `Starts ${progress.formattedStartDate}`
                      : `${progress.daysRemaining} days remaining`}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                    <Target className="w-3.5 h-3.5 text-rose-500" />
                    <span>Adherence</span>
                  </div>
                  <div className="mt-1 font-mono font-black text-slate-900 dark:text-white text-base">
                    {progress.adherencePercentage}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {progress.totalCompletedChecks}/{progress.totalPossibleChecks} checkmarks
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>Today&apos;s Rituals</span>
                  </div>
                  <div className="mt-1 font-mono font-black text-slate-900 dark:text-white text-base">
                    {todayCompletedCount}/{enrolledHabits.length}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {todayCompletedCount === enrolledHabits.length && enrolledHabits.length > 0
                      ? 'All done today! 🔥'
                      : `${enrolledHabits.length - todayCompletedCount} remaining today`}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>Sprint Trajectory</span>
                  </span>
                  <span className="text-amber-700 dark:text-amber-400">
                    Day {progress.currentDay} / {progress.totalDays}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(4, progress.percentElapsed)}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 rounded-full shadow-xs"
                  />
                </div>
              </div>

              {/* Milestones List */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Milestone Badges
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {progress.milestones.map((m) => (
                    <div
                      key={m.id}
                      className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                        m.isUnlocked
                          ? 'bg-amber-50/80 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 shadow-xs'
                          : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <span className="text-2xl">{m.icon}</span>
                      <span className="text-[11px] font-bold mt-1 text-slate-900 dark:text-slate-100">
                        {m.threshold}%
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {m.isUnlocked ? 'Unlocked' : `Day ${m.unlockedAtDay}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enrolled Habits */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  <span>Enrolled Habits ({enrolledHabits.length})</span>
                  <span>Today&apos;s Status</span>
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {enrolledHabits.map((habit) => {
                    const isDoneToday = Boolean(habit.logs[todayStr]);
                    return (
                      <div
                        key={habit.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: habit.color_theme || '#6366F1' }}
                          />
                          <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {habit.title}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 ${
                            isDoneToday
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {isDoneToday ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              <span>Done</span>
                            </>
                          ) : (
                            <span>Pending</span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Single Challenge Active Rule Notification */}
              <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-2.5 text-xs text-indigo-900 dark:text-indigo-200">
                <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-[11px] uppercase tracking-wider font-mono">
                    Single Active Challenge Rule
                  </div>
                  <p className="text-[11px] leading-relaxed text-indigo-800/80 dark:text-indigo-300/80">
                    A user cannot create a new challenge while one is active. To start a different challenge, please finish or abandon your current challenge below.
                  </p>
                </div>
              </div>

              {/* Abandon Confirmation Section if toggled */}
              {showAbandonConfirm && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 space-y-2"
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>Reset / Abandon this challenge?</span>
                  </div>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300 leading-relaxed">
                    This will close your active challenge and free your slot so you can start a new challenge. Your habit history in the matrix will not be deleted.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isAbandoning}
                      onClick={handleAbandon}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isAbandoning ? 'Resetting...' : 'Yes, Reset Challenge'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAbandonConfirm(false)}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleScrollToBanner}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>View on Dashboard</span>
                </button>
                {onCelebrate && (
                  <button
                    type="button"
                    onClick={onCelebrate}
                    className="p-2 rounded-xl text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 hover:scale-105 transition-transform cursor-pointer"
                    title="Celebrate with confetti"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!showAbandonConfirm && (
                  <button
                    type="button"
                    onClick={() => setShowAbandonConfirm(true)}
                    className="px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    title="Reset or abandon this challenge to start a new one"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Challenge</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={isFinishing}
                  onClick={handleFinish}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isFinishing ? 'Finishing...' : 'Finish Challenge'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
