'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Sparkles, ChevronRight, RotateCcw, CheckCircle2 } from 'lucide-react';
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
}

export function ChallengeBanner({
  challenge,
  habits,
  onOpenCreateModal,
  onCompleteChallenge,
  onAbandonChallenge,
}: ChallengeBannerProps) {
  const [showOptions, setShowOptions] = useState(false);

  const progress: ChallengeProgress | null = useMemo(() => {
    if (!challenge) return null;
    return computeChallengeProgress(challenge, habits);
  }, [challenge, habits]);

  const handleCelebrate = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#F43F5E', '#818CF8', '#10B981'],
    });
  };

  // If no active challenge is in progress, render the motivational prompt banner
  if (!challenge || !progress) {
    return (
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl p-4 sm:p-5 shadow-xl transition-all group hover:border-indigo-400 dark:hover:border-indigo-500/50">
        <div className="absolute top-0 right-0 w-64 h-32 bg-gradient-to-bl from-amber-500/10 via-rose-500/5 to-transparent pointer-events-none rounded-tr-3xl" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0 shadow-xs">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.25]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                  Fixed-Term Milestone
                </span>
                <span className="text-[10px] font-bold text-slate-400 hidden xs:inline">
                  • 75 Hard, 90 Monk, 30 Sprint
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight font-sans mt-0.5">
                Ready for a 75-Day or 90-Day Challenge?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Lock in unbroken habits with milestone badges (Bronze, Silver, Gold, Champion).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="self-start sm:self-auto px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white rounded-xl sm:rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/20 cursor-pointer transition-all hover:scale-102"
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
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-300/60 dark:border-amber-500/30 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl p-4 sm:p-5 shadow-xl transition-all">
      {/* Decorative top accent glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500" />
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/25 to-rose-500/25 border border-amber-500/40 flex items-center justify-center text-amber-500 shrink-0 shadow-xs">
            <Trophy className="w-5 h-5 stroke-[2.25]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                ACTIVE CHALLENGE
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                Day {progress.currentDay} of {progress.totalDays}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight font-mono mt-0.5">
              {challenge.title}
            </h3>
          </div>
        </div>

        {/* Right side status & controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
          <button
            type="button"
            onClick={handleCelebrate}
            className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 hover:scale-110 transition-transform cursor-pointer"
            title="Celebrate progress"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-mono font-bold text-[11px]">
            {progress.daysRemaining} days left
          </span>

          {/* More options (End / Reset) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Challenge options"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {showOptions && (
              <div className="absolute right-0 top-8 z-30 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-xl text-xs space-y-1">
                <button
                  type="button"
                  onClick={async () => {
                    setShowOptions(false);
                    await onCompleteChallenge(challenge.id);
                    toast.success('Challenge marked as completed! Congratulations! 🎉');
                    handleCelebrate();
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 flex items-center gap-2 font-medium cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Finish Challenge</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setShowOptions(false);
                    await onAbandonChallenge(challenge.id);
                    toast.info('Challenge reset.');
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2 font-medium cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset / Abandon</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar & Milestones Track */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono font-bold">
          <span className="text-slate-600 dark:text-slate-300">
            {progress.percentElapsed}% Elapsed
          </span>
          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-amber-500" />
            {progress.adherencePercentage}% Habit Adherence
          </span>
        </div>

        {/* The Track with Milestones */}
        <div className="relative w-full h-3 sm:h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentElapsed}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 shadow-sm"
          />
        </div>

        {/* Milestone Badges Strip */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-3 pt-2">
          {progress.milestones.map((m) => (
            <div
              key={m.id}
              className={`p-2 rounded-xl sm:rounded-2xl border text-center transition-all ${
                m.isUnlocked
                  ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/80 shadow-xs'
                  : 'bg-slate-50/50 dark:bg-slate-950/30 border-slate-200/70 dark:border-slate-800/50 opacity-50'
              }`}
            >
              <div className="text-base sm:text-lg mb-0.5">{m.icon}</div>
              <div className="text-[10px] sm:text-[11px] font-black font-mono text-slate-800 dark:text-slate-200">
                {m.threshold}%
              </div>
              <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate">
                Day {m.unlockedAtDay}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}