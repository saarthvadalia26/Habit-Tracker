'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Flame,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Clock,
  Award,
  ShieldCheck,
  Crown,
  ArrowUpRight,
  AlertTriangle,
} from 'lucide-react';
import { Challenge, ChallengeProgress } from '@/types/challenge.types';
import { HabitWithLogs } from '@/types/database.types';
import { computeChallengeProgress } from '@/lib/challengeUtils';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

interface ChallengeBannerProps {
  challenge: Challenge | null;
  habits: HabitWithLogs[];
  onOpenCreateModal: () => void;
  onCompleteChallenge: (id: string) => Promise<void>;
  onAbandonChallenge: (id: string) => Promise<void>;
  onOpenDetails?: () => void;
}

export function ChallengeBanner({
  challenge,
  habits,
  onOpenCreateModal,
  onCompleteChallenge,
  onAbandonChallenge,
  onOpenDetails,
}: ChallengeBannerProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const progress: ChallengeProgress | null = useMemo(() => {
    if (!challenge) return null;
    return computeChallengeProgress(challenge, habits);
  }, [challenge, habits]);

  const handleCelebrate = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff5a1f', '#e04a12', '#fbf8f1', '#15130f'],
    });
  };

  // If no active challenge is in progress, render the prompt banner
  if (!challenge || !progress) {
    return (
      <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 bg-[#fbf8f1] dark:bg-[#1c1a16] shadow-framer-card p-5 sm:p-6 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#ff5a1f]/10 text-[#ff5a1f] border border-[#ff5a1f]/20 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.25]" />
            </div>
            <div>
              <h3 className="font-clash font-semibold text-base sm:text-lg text-[#15130f] dark:text-[#fbf8f1] tracking-tight">
                Ready for a 75-Day or 90-Day Challenge?
              </h3>
              <p className="text-xs sm:text-[13px] text-[#15130f]/60 dark:text-[#fbf8f1]/60 hidden sm:block mt-0.5 font-archivo">
                Lock in unbroken habits with milestone badges (Bronze, Silver, Gold, Champion).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="self-start sm:self-auto px-5 py-2.5 bg-[#ff5a1f] hover:bg-[#e04a12] text-white rounded-full font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:scale-102 active:scale-98"
          >
            <Flame className="w-4 h-4 fill-white" />
            <span>Start Challenge</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Active Challenge Hero Card
  return (
    <div
      id="active-challenge-banner"
      className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 bg-[#fbf8f1] dark:bg-[#1c1a16] shadow-framer-card p-5 sm:p-6 transition-all"
    >
      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#15130f]/8 dark:border-[#fbf8f1]/8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#ff5a1f]/10 text-[#ff5a1f] border border-[#ff5a1f]/20 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 stroke-[2.25]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              {progress.isUpcoming ? (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#ff5a1f]/10 text-[#ff5a1f] border border-[#ff5a1f]/20 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#ff5a1f]" />
                  <span>Starts in {progress.daysUntilStart} {progress.daysUntilStart === 1 ? 'day' : 'days'}</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#ff5a1f]/10 text-[#ff5a1f] border border-[#ff5a1f]/20">
                  ACTIVE CHALLENGE
                </span>
              )}
              <span className="text-xs font-archivo font-medium text-[#15130f]/50 dark:text-[#fbf8f1]/50">
                {progress.isUpcoming
                  ? 'Starts ' + progress.formattedStartDate + ' • Day 0 of ' + progress.totalDays
                  : 'Day ' + progress.currentDay + ' of ' + progress.totalDays}
              </span>
            </div>
            <h3 className="font-clash font-semibold text-lg sm:text-[22px] tracking-tight text-[#15130f] dark:text-[#fbf8f1] mt-0.5 leading-snug">
              {challenge.title}
            </h3>
          </div>
        </div>

        {/* Right side status & controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="px-3 py-1.5 rounded-full bg-[#15130f]/5 dark:bg-[#fbf8f1]/8 text-[#15130f]/75 dark:text-[#fbf8f1]/75 font-archivo font-semibold text-[12px] flex items-center gap-1.5">
            {progress.isUpcoming ? (
              <>
                <Clock className="w-3 h-3 text-[#ff5a1f]" />
                <span>Starts {progress.formattedStartDate}</span>
              </>
            ) : (
              <span>
                {progress.daysRemaining} {progress.daysRemaining === 1 ? 'day' : 'days'} left
              </span>
            )}
          </span>

          {onOpenDetails && (
            <button
              type="button"
              onClick={onOpenDetails}
              className="px-3 py-1.5 rounded-full bg-[#15130f]/5 dark:bg-[#fbf8f1]/8 hover:bg-[#ff5a1f]/10 hover:text-[#ff5a1f] text-[#15130f]/70 dark:text-[#fbf8f1]/70 font-archivo font-semibold text-[12px] transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Details</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}

          {/* More options (End / Reset) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowOptions(!showOptions);
                setShowConfirmReset(false);
              }}
              className="p-1.5 sm:p-2 rounded-full text-[#15130f]/40 hover:text-[#15130f] dark:text-[#fbf8f1]/40 dark:hover:text-[#fbf8f1] hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/8 transition-colors cursor-pointer"
              title="Challenge options"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {showOptions && (
              <div className="absolute right-0 top-9 z-30 w-56 bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/15 dark:border-[#fbf8f1]/15 rounded-2xl p-2 shadow-xl text-xs space-y-1">
                {showConfirmReset ? (
                  <div className="p-2 space-y-2 text-left">
                    <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold text-xs">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Reset this challenge?</span>
                    </div>
                    <p className="text-[11px] text-[#15130f]/60 dark:text-[#fbf8f1]/60 leading-tight">
                      Your historical habit logs remain intact, but active sprint tracking will end.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowConfirmReset(false)}
                        className="px-2.5 py-1 rounded-full border border-[#15130f]/15 dark:border-[#fbf8f1]/15 text-[11px] font-semibold hover:bg-[#15130f]/5 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setShowConfirmReset(false);
                          setShowOptions(false);
                          await onAbandonChallenge(challenge.id);
                        }}
                        className="px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Yes, Reset
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={async () => {
                        setShowOptions(false);
                        await onCompleteChallenge(challenge.id);
                        toast.success('Challenge marked as completed! Congratulations! 🎉');
                        handleCelebrate();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Finish Challenge</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirmReset(true)}
                      className="w-full text-left px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Challenge</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar & Milestones Track */}
      <div className="mt-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-archivo">
          <span className="font-medium text-[#15130f]/60 dark:text-[#fbf8f1]/60">
            {progress.isUpcoming
              ? '0% Elapsed (Starts in ' + progress.daysUntilStart + (progress.daysUntilStart === 1 ? ' day)' : ' days)')
              : progress.percentElapsed + '% Elapsed'}
          </span>
          <span className="font-semibold text-[#ff5a1f] flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 fill-[#ff5a1f]" />
            {progress.isUpcoming
              ? 'Awaiting Start Date'
              : `${progress.adherencePercentage}% Habit Adherence (${progress.totalCompletedChecks}/${progress.totalPossibleChecks})`}
          </span>
        </div>

        {/* The Track with Framer Orange Fill */}
        <div className="relative w-full h-2.5 sm:h-3 rounded-full bg-[#15130f]/6 dark:bg-[#fbf8f1]/8 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentElapsed}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-[#ff5a1f] to-[#ff7a3d] shadow-xs"
          />
        </div>

        {/* Milestone Badges Strip */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 pt-2">
          {progress.milestones.map((m) => {
            const icon =
              m.threshold <= 25 ? (
                <Award className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : m.threshold <= 50 ? (
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : m.threshold <= 75 ? (
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
              );

            return (
              <div
                key={m.id}
                className={`p-2.5 sm:p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  m.isUnlocked
                    ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] border-transparent shadow-sm'
                    : 'bg-[#15130f]/2 dark:bg-[#fbf8f1]/3 border-[#15130f]/8 dark:border-[#fbf8f1]/8 text-[#15130f]/40 dark:text-[#fbf8f1]/40'
                }`}
              >
                <div className={m.isUnlocked ? 'text-[#ff5a1f]' : 'text-inherit opacity-70'}>
                  {icon}
                </div>
                <div className="font-clash font-semibold text-xs sm:text-[14px] tracking-tight">
                  {m.threshold}%
                </div>
                <div
                  className={`text-[10px] sm:text-[11px] font-archivo font-medium ${
                    m.isUnlocked ? 'opacity-70' : 'opacity-60'
                  }`}
                >
                  Day {m.unlockedAtDay}
                </div>
                {m.isUnlocked && (
                  <span className="mt-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#ff5a1f] text-white">
                    Unlocked
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}