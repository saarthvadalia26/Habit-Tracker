'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, PartyPopper, ChevronRight, RotateCcw, CheckCircle2, Clock, Quote, Shuffle } from 'lucide-react';
import { getDailyQuote, getRandomQuote, MotivationQuote } from '@/lib/quotes';
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

/**
 * Hybrid Motivational Quote Strip:
 * - Slow auto-shuffle cadence (18s) with a soothing fade transition
 * - Graceful pause on hover/touch so reading is never interrupted
 * - Compact, sleek icon button for on-demand inspiration
 */
function MotivationalQuoteStrip() {
  const [quote, setQuote] = useState<MotivationQuote>(getDailyQuote);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleNextQuote = useCallback(() => {
    setIsSpinning(true);
    setQuote((prev) => getRandomQuote(prev.quote));
    setTimeout(() => setIsSpinning(false), 500);
  }, []);

  // Slow calm auto-shuffle every 18 seconds, pauses on hover or touch
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      handleNextQuote();
    }, 18000);
    return () => clearInterval(interval);
  }, [isPaused, handleNextQuote, quote.quote]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => {
        setTimeout(() => setIsPaused(false), 6000);
      }}
      className="mt-3.5 pt-3 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between gap-3 group/quote"
    >
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <span className="p-1 rounded-lg bg-amber-500/10 text-amber-500 shrink-0 mt-0.5">
          <Quote className="w-3.5 h-3.5" />
        </span>
        <div className="min-w-0 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={quote.quote}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              <p className="text-xs sm:text-[13px] font-medium italic text-slate-700 dark:text-slate-300 leading-snug">
                &ldquo;{quote.quote}&rdquo;
              </p>
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>— {quote.author}</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                  #{quote.tag}
                </span>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Compact Icon Button */}
      <button
        type="button"
        onClick={handleNextQuote}
        className="p-1.5 sm:p-2 rounded-xl bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 border border-slate-200/60 dark:border-slate-700/60 transition-all cursor-pointer shrink-0 self-center hover:scale-105 active:scale-95 shadow-2xs"
        title="Shuffle quote (Auto-cycles every 18s • Hover to pause)"
        aria-label="Shuffle quote for fresh inspiration"
      >
        <Shuffle className={'w-3.5 h-3.5 text-indigo-500 transition-transform duration-500 ' + (isSpinning ? 'rotate-180' : '')} />
      </button>
    </div>
  );
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
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight font-sans">
                Ready for a 75-Day or 90-Day Challenge?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block mt-0.5">
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

        {/* Motivational / Discipline Quote Strip */}
        <MotivationalQuoteStrip />
      </div>
    );
  }

  // Active Challenge Hero Card
  return (
    <div
      id="active-challenge-banner"
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-300/60 dark:border-amber-500/30 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl p-4 sm:p-5 shadow-xl transition-all"
    >
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
              {progress.isUpcoming ? (
                <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700/80 flex items-center gap-1 animate-pulse">
                  <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>Starts in {progress.daysUntilStart} {progress.daysUntilStart === 1 ? 'day' : 'days'}</span>
                </span>
              ) : (
                <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                  ACTIVE CHALLENGE
                </span>
              )}
              <span className="text-xs font-mono font-bold text-slate-500">
                {progress.isUpcoming
                  ? 'Starts ' + progress.formattedStartDate + ' • Day 0 of ' + progress.totalDays
                  : 'Day ' + progress.currentDay + ' of ' + progress.totalDays}
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
            <PartyPopper className="w-3.5 h-3.5" />
          </button>

          <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-mono font-bold text-[11px] flex items-center gap-1">
            {progress.isUpcoming ? (
              <>
                <Clock className="w-3 h-3 text-amber-500" />
                <span>Starts {progress.formattedStartDate}</span>
              </>
            ) : (
              <span>{progress.daysRemaining} days left</span>
            )}
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
            {progress.isUpcoming
              ? '0% Elapsed (Starts in ' + progress.daysUntilStart + (progress.daysUntilStart === 1 ? ' day)' : ' days)')
              : progress.percentElapsed + '% Elapsed'}
          </span>
          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-amber-500" />
            {progress.isUpcoming
              ? 'Awaiting Start Date'
              : `${progress.adherencePercentage}% Habit Adherence (${progress.totalCompletedChecks}/${progress.totalPossibleChecks})`}
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

        {/* Motivational / Discipline Quote Strip */}
        <MotivationalQuoteStrip />
    </div>
  );
}