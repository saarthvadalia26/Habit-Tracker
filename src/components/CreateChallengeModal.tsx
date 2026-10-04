'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Check, Flame, SlidersHorizontal, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';
import { CHALLENGE_PRESETS } from '@/lib/challengeUtils';
import { HabitWithLogs } from '@/types/database.types';
import { formatDateToISO } from '@/lib/dateUtils';

interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: HabitWithLogs[];
  onCreate: (title: string, durationDays: number, startDate: string, habitIds: string[]) => Promise<void>;
  activeChallengeTitle?: string | null;
}

export function CreateChallengeModal({
  isOpen,
  onClose,
  habits,
  onCreate,
  activeChallengeTitle,
}: CreateChallengeModalProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('75-hard');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customDays, setCustomDays] = useState<number>(60);
  const [startDate, setStartDate] = useState<string>(() => formatDateToISO(new Date()));
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>(() => habits.map((h) => h.id));
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isCustom = selectedPresetId === 'custom';
  const activePreset = CHALLENGE_PRESETS.find((p) => p.id === selectedPresetId);

  const durationDays = isCustom
    ? Math.max(7, Math.min(365, customDays || 30))
    : activePreset?.durationDays || 75;

  const challengeTitle = isCustom
    ? customTitle.trim() || 'Custom Challenge'
    : activePreset?.title || '75-Day Discipline';

  const toggleHabit = (id: string) => {
    setSelectedHabitIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllHabits = () => {
    if (selectedHabitIds.length === habits.length) {
      setSelectedHabitIds([]);
    } else {
      setSelectedHabitIds(habits.map((h) => h.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onCreate(challengeTitle, durationDays, startDate, selectedHabitIds);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
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
            onClick={!isSubmitting ? onClose : undefined}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="challenge-modal-title"
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', duration: 0.45, bounce: 0.2 }}
            className="relative w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-10 text-slate-900 dark:text-slate-100 transition-colors flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shadow-xs">
                  <Trophy className="w-5 h-5 stroke-[2.25]" />
                </div>
                <div>
                  <h3
                    id="challenge-modal-title"
                    className="text-lg font-black tracking-tight font-mono text-slate-900 dark:text-white"
                  >
                    Start a New Challenge
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Commit to unbroken consistency with fixed-term milestones
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 overscroll-contain smooth-scroll">
                {/* Active Challenge Alert Banner */}
                {activeChallengeTitle && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-2.5 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-bold uppercase tracking-wider font-mono">
                        Active Challenge In Progress
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/90">
                        You are currently committed to <span className="font-bold underline">{activeChallengeTitle}</span>. A user cannot create a new challenge while one is active. Complete or abandon your active challenge before starting a new one.
                      </p>
                    </div>
                  </div>
                )}

                {/* Preset Selector */}
                <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono mb-2">
                  Choose Challenge Structure
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
                  {CHALLENGE_PRESETS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedPresetId(preset.id)}
                        className={`text-left p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30 shadow-md'
                            : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="text-[10px] font-black font-mono px-2 py-0.5 rounded-full uppercase"
                            style={{
                              backgroundColor: `${preset.accentColor}20`,
                              color: preset.accentColor,
                            }}
                          >
                            {preset.badge}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 font-sans">
                          {preset.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {preset.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Option Toggle */}
                <div className="mt-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedPresetId('custom')}
                    className={`w-full text-left p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isCustom
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30'
                        : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-purple-500" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Custom Challenge (Set Your Own Duration)
                      </span>
                    </div>
                    {isCustom ? (
                      <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Custom Input Fields (if custom selected) */}
              {isCustom && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/40"
                >
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono mb-1">
                      Challenge Name
                    </label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="e.g. 100 Days of Code"
                      maxLength={50}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 font-mono mb-1">
                      Duration (Days)
                    </label>
                    <input
                      type="number"
                      min={7}
                      max={365}
                      value={customDays}
                      onChange={(e) => setCustomDays(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold"
                    />
                  </div>
                </motion.div>
              )}

              {/* Start Date */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono mb-1">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Habit Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                    Habits Included in Challenge ({selectedHabitIds.length}/{habits.length})
                  </label>
                  <button
                    type="button"
                    onClick={selectAllHabits}
                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-mono"
                  >
                    {selectedHabitIds.length === habits.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                {habits.length === 0 ? (
                  <div className="py-3 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 text-center text-xs text-slate-400">
                    No habits created yet. Add habits to track them in this challenge.
                  </div>
                ) : (
                  <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                    {habits.map((habit) => {
                      const isIncluded = selectedHabitIds.includes(habit.id);
                      return (
                        <button
                          key={habit.id}
                          type="button"
                          onClick={() => toggleHabit(habit.id)}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer text-xs ${
                            isIncluded
                              ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-xs'
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: habit.color_theme }}
                            />
                            <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                              {habit.title}
                            </span>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                              isIncluded
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {isIncluded && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              </div>

              {/* Pinned Submit Footer */}
              <div className="flex items-center justify-end gap-2.5 p-3.5 sm:px-5 sm:py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/70 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || Boolean(activeChallengeTitle)}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                  <Flame className="w-4 h-4" />
                  <span>
                    {activeChallengeTitle
                      ? 'Active Challenge in Progress'
                      : isSubmitting
                      ? 'Starting...'
                      : `Launch ${durationDays}-Day Challenge`}
                  </span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}