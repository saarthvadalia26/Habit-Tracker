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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden bg-black/45 backdrop-blur-sm">
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="challenge-modal-title"
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
                <h3 id="challenge-modal-title" className="font-clash font-semibold text-xl tracking-tight">
                  Launch a Challenge
                </h3>
                <p className="text-xs text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                  Commit to unbroken consistency with fixed-term milestones
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="p-1.5 rounded-full text-[#15130f]/40 hover:text-[#15130f] dark:text-[#fbf8f1]/40 dark:hover:text-[#fbf8f1] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {activeChallengeTitle && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-2.5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase tracking-wider">Active Challenge in Progress</span>
                    <p className="text-[11px] mt-0.5 text-amber-800/90 dark:text-amber-300/90">
                      You are committed to <span className="underline font-semibold">{activeChallengeTitle}</span>. Complete or abandon it before launching a new sprint.
                    </p>
                  </div>
                </div>
              )}

              {/* Preset Selector */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60 mb-2">
                  Choose Challenge Structure
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {CHALLENGE_PRESETS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedPresetId(preset.id)}
                        className={`text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] border-transparent shadow-sm'
                            : 'bg-[#f2ecdf] dark:bg-[#11100d] border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-[#15130f] dark:text-[#fbf8f1]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${isSelected ? 'bg-[#ff5a1f] text-white' : 'bg-[#15130f]/10 dark:bg-[#fbf8f1]/10'}`}>
                            {preset.badge}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#ff5a1f]" />}
                        </div>
                        <h4 className="text-xs font-semibold font-clash mt-1">{preset.title}</h4>
                        <p className={`text-[10px] mt-0.5 line-clamp-2 ${isSelected ? 'text-[#fbf8f1]/70 dark:text-[#15130f]/70' : 'text-[#15130f]/60 dark:text-[#fbf8f1]/60'}`}>
                          {preset.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedPresetId('custom')}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isCustom
                        ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] border-transparent shadow-sm'
                        : 'bg-[#f2ecdf] dark:bg-[#11100d] border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-[#15130f] dark:text-[#fbf8f1]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-[#ff5a1f]" />
                      <span className="text-xs font-semibold">Custom Challenge (Set Your Own Duration)</span>
                    </div>
                    {isCustom && <CheckCircle2 className="w-4 h-4 text-[#ff5a1f]" />}
                  </button>
                </div>
              </div>

              {/* Custom Settings */}
              {isCustom && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                      Challenge Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 60-Day Sprint"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-2xl bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-xs font-medium focus:outline-none focus:border-[#ff5a1f]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                      Duration (Days: 7–365)
                    </label>
                    <input
                      type="number"
                      min={7}
                      max={365}
                      value={customDays}
                      onChange={(e) => setCustomDays(parseInt(e.target.value) || 30)}
                      className="w-full px-3 py-2 rounded-2xl bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-xs font-medium focus:outline-none focus:border-[#ff5a1f]"
                    />
                  </div>
                </div>
              )}

              {/* Included Habits */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                    Include in Challenge ({selectedHabitIds.length} of {habits.length})
                  </label>
                  <button
                    type="button"
                    onClick={selectAllHabits}
                    className="text-[11px] font-semibold text-[#ff5a1f] hover:underline cursor-pointer"
                  >
                    {selectedHabitIds.length === habits.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {habits.map((h) => {
                    const isChecked = selectedHabitIds.includes(h.id);
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => toggleHabit(h.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] border-transparent'
                            : 'bg-[#f2ecdf] dark:bg-[#11100d] border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-[#15130f]/70 dark:text-[#fbf8f1]/70'
                        }`}
                      >
                        <span className="text-xs font-medium truncate pr-2">{h.title}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-[#ff5a1f] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#15130f]/10 dark:border-[#fbf8f1]/10 flex items-center justify-end gap-3 bg-[#fbf8f1] dark:bg-[#1c1a16]">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-full border border-[#15130f]/15 dark:border-[#fbf8f1]/15 text-xs font-semibold hover:bg-[#15130f]/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || selectedHabitIds.length === 0}
                className="px-6 py-2 rounded-full bg-[#ff5a1f] hover:bg-[#e04a12] disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                {isSubmitting ? 'Launching...' : `Launch ${durationDays}-Day Challenge`}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}