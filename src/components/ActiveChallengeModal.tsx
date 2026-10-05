'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  X,
  Flame,
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

  if (!challenge || !progress || !isOpen) {
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden bg-black/45 backdrop-blur-sm">
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="active-challenge-modal-title"
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', duration: 0.45, bounce: 0.2 }}
          className="relative w-full max-w-[480px] max-h-[86vh] bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/15 dark:border-[#fbf8f1]/15 rounded-[28px] shadow-2xl z-10 text-[#15130f] dark:text-[#fbf8f1] font-archivo flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#15130f]/10 dark:border-[#fbf8f1]/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ff5a1f]/15 text-[#ff5a1f] flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ff5a1f]/15 text-[#ff5a1f]">
                    {progress.isUpcoming ? 'Upcoming' : 'Active Challenge'}
                  </span>
                  <span className="text-xs text-[#15130f]/50 dark:text-[#fbf8f1]/50 font-semibold">
                    {progress.isUpcoming
                      ? `Starts in ${progress.daysUntilStart}d`
                      : `Day ${progress.currentDay} of ${progress.totalDays}`}
                  </span>
                </div>
                <h3 id="active-challenge-modal-title" className="font-clash font-semibold text-lg sm:text-xl tracking-tight mt-0.5">
                  {challenge.title}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#15130f]/40 hover:text-[#15130f] dark:text-[#fbf8f1]/40 dark:hover:text-[#fbf8f1] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-5 overflow-y-auto space-y-4">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-3.5 rounded-2xl bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10">
                <div className="flex items-center gap-1.5 text-[#15130f]/50 dark:text-[#fbf8f1]/50 text-[11px] font-semibold uppercase">
                  <Clock className="w-3.5 h-3.5 text-[#ff5a1f]" />
                  <span>Time</span>
                </div>
                <div className="mt-1 font-clash font-semibold text-xl text-[#15130f] dark:text-[#fbf8f1]">
                  {progress.isUpcoming ? '0%' : `${progress.percentElapsed}%`}
                </div>
                <div className="text-[11px] text-[#15130f]/60 dark:text-[#fbf8f1]/60 mt-0.5">
                  {progress.isUpcoming ? `Starts ${progress.formattedStartDate}` : `${progress.daysRemaining} days left`}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10">
                <div className="flex items-center gap-1.5 text-[#15130f]/50 dark:text-[#fbf8f1]/50 text-[11px] font-semibold uppercase">
                  <Target className="w-3.5 h-3.5 text-[#ff5a1f]" />
                  <span>Adherence</span>
                </div>
                <div className="mt-1 font-clash font-semibold text-xl text-[#15130f] dark:text-[#fbf8f1]">
                  {progress.adherencePercentage}%
                </div>
                <div className="text-[11px] text-[#15130f]/60 dark:text-[#fbf8f1]/60 mt-0.5">
                  {progress.totalCompletedChecks}/{progress.totalPossibleChecks} checks
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10">
                <div className="flex items-center gap-1.5 text-[#15130f]/50 dark:text-[#fbf8f1]/50 text-[11px] font-semibold uppercase">
                  <Calendar className="w-3.5 h-3.5 text-[#ff5a1f]" />
                  <span>Today</span>
                </div>
                <div className="mt-1 font-clash font-semibold text-xl text-[#15130f] dark:text-[#fbf8f1]">
                  {todayCompletedCount}/{enrolledHabits.length}
                </div>
                <div className="text-[11px] text-[#15130f]/60 dark:text-[#fbf8f1]/60 mt-0.5">
                  {todayCompletedCount === enrolledHabits.length && enrolledHabits.length > 0
                    ? 'All completed! 🔥'
                    : `${enrolledHabits.length - todayCompletedCount} remaining`}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="p-4 rounded-2xl bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-[#15130f] dark:text-[#fbf8f1]">
                  <Flame className="w-3.5 h-3.5 text-[#ff5a1f]" />
                  <span>Sprint Trajectory</span>
                </span>
                <span className="text-[#ff5a1f]">
                  Day {progress.currentDay} / {progress.totalDays}
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#15130f]/10 dark:bg-[#fbf8f1]/10 rounded-full overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(4, progress.percentElapsed)}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full bg-[#ff5a1f] rounded-full"
                />
              </div>
            </div>

            {/* Enrolled Habits */}
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60 mb-2">
                Committed Habits ({enrolledHabits.length})
              </h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {enrolledHabits.map((h) => {
                  const isDoneToday = Boolean(h.logs[todayStr]);
                  return (
                    <div
                      key={h.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-xs"
                    >
                      <span className="font-medium truncate">{h.title}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${isDoneToday ? 'bg-[#ff5a1f] text-white' : 'text-[#15130f]/50 dark:text-[#fbf8f1]/50'}`}>
                        {isDoneToday ? 'Done Today' : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#15130f]/10 dark:border-[#fbf8f1]/10 bg-[#fbf8f1] dark:bg-[#1c1a16]">
            {showAbandonConfirm ? (
              <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Reset and end this challenge?</span>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAbandonConfirm(false)}
                    className="px-3.5 py-1.5 rounded-full border border-[#15130f]/15 dark:border-[#fbf8f1]/15 text-xs font-semibold hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAbandon}
                    disabled={isAbandoning}
                    className="px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isAbandoning ? 'Resetting...' : 'Yes, Reset Challenge'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <button
                  type="button"
                  onClick={() => setShowAbandonConfirm(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-all cursor-pointer hover:scale-102 active:scale-98 shadow-2xs"
                  title="Reset or abandon this challenge"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset challenge</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-full border border-[#15130f]/15 dark:border-[#fbf8f1]/15 text-xs font-semibold hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/5 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  {progress.percentElapsed >= 100 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleFinish}
                      disabled={isFinishing}
                      className="px-5 py-2 rounded-full bg-[#ff5a1f] text-white text-xs font-semibold shadow-sm cursor-pointer"
                    >
                      {isFinishing ? 'Completing...' : 'Celebrate Victory! 🏆'}
                    </motion.button>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
