'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Sun,
  Sunrise,
  Moon,
  Clock,
  ArrowRight,
  Link2,
  Check,
  X,
  Info,
  ChevronRight,
  RotateCcw,
  HelpCircle,
} from 'lucide-react';
import { HabitWithLogs, TimeOfDay, StackTriggerType } from '@/types/database.types';
import {
  DAYFLOW_META,
  DAYFLOW_ORDER,
  getHabitTimeOfDay,
  getHabitStackTriggerText,
} from '@/lib/dayflowUtils';
import { toast } from 'sonner';

interface HabitStackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: HabitWithLogs[];
  isGuestMode: boolean;
  initialHabitId?: string;
  initialShowGuide?: boolean;
  onUpdateHabitStack: (
    habitId: string,
    timeOfDay: TimeOfDay,
    triggerType: StackTriggerType,
    parentHabitId?: string | null,
    customCue?: string
  ) => Promise<boolean>;
}

export function HabitStackingModal({
  isOpen,
  onClose,
  habits,
  isGuestMode,
  initialHabitId,
  initialShowGuide,
  onUpdateHabitStack,
}: HabitStackingModalProps) {
  const [selectedHabitId, setSelectedHabitId] = useState<string>(
    initialHabitId || habits[0]?.id || ''
  );

  const selectedHabit = habits.find((h) => h.id === selectedHabitId) || habits[0];

  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('anytime');
  const [triggerType, setTriggerType] = useState<StackTriggerType>('none');
  const [parentHabitId, setParentHabitId] = useState<string>('');
  const [customCue, setCustomCue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [showFormulaGuide, setShowFormulaGuide] = useState(false);

  // How it works guide toggle with first-visit memory
  const [showGuide, setShowGuide] = useState(() => {
    if (initialShowGuide !== undefined) return initialShowGuide;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ht_dayflow_guide_seen_v1') !== 'true';
    }
    return false;
  });

  useEffect(() => {
    if (initialShowGuide) {
      setShowGuide(true);
    }
  }, [initialShowGuide]);

  const handleToggleGuide = (explicitState?: boolean) => {
    setShowGuide((prev) => {
      const next = typeof explicitState === 'boolean' ? explicitState : !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('ht_dayflow_guide_seen_v1', 'true');
      }
      return next;
    });
  };

  // Sync internal state when selected habit changes or modal opens
  useEffect(() => {
    if (selectedHabit) {
      setTimeOfDay(getHabitTimeOfDay(selectedHabit));
      setTriggerType(selectedHabit.stack_trigger_type || selectedHabit.stack?.triggerType || 'none');
      setParentHabitId(
        selectedHabit.stack_parent_habit_id || selectedHabit.stack?.parentHabitId || ''
      );
      setCustomCue(
        (selectedHabit.stack_custom_cue || selectedHabit.stack?.customCue || '').trim()
      );
    }
  }, [selectedHabit, isOpen]);

  if (!isOpen) return null;

  // Available candidate habits for chaining (cannot chain to self)
  const candidateParents = habits.filter((h) => h.id !== selectedHabit?.id);

  const parentHabit = candidateParents.find((h) => h.id === parentHabitId);

  const handleSave = async () => {
    if (!selectedHabit) return;

    if (isGuestMode) {
      toast.info('Sign in required', {
        description: 'Please sign in or create an account to save Dayflow routines.',
      });
      return;
    }

    if (triggerType === 'habit' && !parentHabitId) {
      toast.error('Select an anchor habit to chain this routine to.');
      return;
    }

    if (triggerType === 'custom' && !customCue.trim()) {
      toast.error('Enter a custom trigger cue (e.g. "Making morning coffee").');
      return;
    }

    setIsSaving(true);
    try {
      const ok = await onUpdateHabitStack(
        selectedHabit.id,
        timeOfDay,
        triggerType,
        triggerType === 'habit' ? parentHabitId : null,
        triggerType === 'custom' ? customCue.trim() : ''
      );

      if (ok) {
        toast.success('Dayflow stack updated!', {
          description: `${selectedHabit.title} updated in your ${DAYFLOW_META[timeOfDay].shortLabel} ritual.`,
        });
        onClose();
      }
    } catch {
      toast.error('Failed to update habit stack');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[540px] rounded-[28px] bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/15 dark:border-[#fbf8f1]/15 p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-[#15130f] dark:text-[#fbf8f1] max-h-[min(92vh,740px)] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-1 border-b border-[#15130f]/8 dark:border-[#fbf8f1]/8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Layers className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-clash font-semibold text-lg sm:text-xl tracking-tight leading-tight">
                  Habit Stacking & Dayflows
                </h3>
                <p className="text-[11px] text-[#15130f]/55 dark:text-[#fbf8f1]/55">
                  Drop 4 • Group atomic habits into compounding daily rituals
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleToggleGuide()}
                className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border shrink-0 ${
                  showGuide
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-[#15130f]/5 dark:bg-[#fbf8f1]/8 text-[#15130f]/75 dark:text-[#fbf8f1]/75 border-[#15130f]/10 dark:border-[#fbf8f1]/10 hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
                title="How Habit Stacking & Dayflows works"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">How it works</span>
                <span className="sm:hidden text-[10.5px]">Guide</span>
              </button>

              <button
                onClick={onClose}
                aria-label="Close Habit Stacking modal"
                className="p-1.5 rounded-full text-[#15130f]/40 hover:text-[#15130f] dark:text-[#fbf8f1]/40 dark:hover:text-[#fbf8f1] hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Collapsible How It Works Guide Drawer */}
          <AnimatePresence>
            {showGuide && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="rounded-2xl p-3.5 sm:p-4.5 bg-linear-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/25 space-y-3 text-xs max-h-[38vh] sm:max-h-none overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-indigo-500" />
                      <h4 className="font-clash font-semibold text-sm text-[#15130f] dark:text-[#fbf8f1]">
                        How Habit Stacking & Dayflows Work
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleGuide(false)}
                      className="text-[11px] font-semibold text-[#15130f]/50 dark:text-[#fbf8f1]/50 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      Hide guide ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Card 1 */}
                    <div className="p-3 rounded-xl bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/8 dark:border-[#fbf8f1]/8 space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs">
                        <Sunrise className="w-3.5 h-3.5 text-amber-500" />
                        <span>1. Dayflow Rituals</span>
                      </div>
                      <p className="text-[11px] text-[#15130f]/65 dark:text-[#fbf8f1]/65 leading-relaxed">
                        Group daily habits into <strong>Morning</strong> (4–12), <strong>Afternoon</strong> (12–17), <strong>Evening</strong> (17–4), or <strong>Anytime</strong>. Your dashboard gently spotlights your current ritual in real time.
                      </p>
                    </div>

                    {/* Card 2 */}
                    <div className="p-3 rounded-xl bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/8 dark:border-[#fbf8f1]/8 space-y-1">
                      <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                        <Link2 className="w-3.5 h-3.5 text-indigo-500" />
                        <span>2. Atomic Stacking</span>
                      </div>
                      <p className="text-[11px] text-[#15130f]/65 dark:text-[#fbf8f1]/65 leading-relaxed">
                        Based on James Clear’s formula: <em>&ldquo;After [Current Habit / Life Event], I will [New Habit]&rdquo;</em>. Anchor new disciplines to existing cues so they execute without mental friction.
                      </p>
                    </div>

                    {/* Card 3 */}
                    <div className="p-3 rounded-xl bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/8 dark:border-[#fbf8f1]/8 space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                        <Layers className="w-3.5 h-3.5 text-emerald-500" />
                        <span>3. Automatic Chaining</span>
                      </div>
                      <p className="text-[11px] text-[#15130f]/65 dark:text-[#fbf8f1]/65 leading-relaxed">
                        Chained habits seamlessly nest under their parent anchor with connecting cues (<code>↳ After...</code>) and track live completion percentages for each dayflow block.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Habit Selector Pill Bar */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60">
              Configure Habit
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
              {habits.map((h) => {
                const isSelected = h.id === selectedHabit?.id;
                const tod = getHabitTimeOfDay(h);
                const meta = DAYFLOW_META[tod];
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setSelectedHabitId(h.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] shadow-sm'
                        : 'bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-[#15130f]/70 dark:text-[#fbf8f1]/70 hover:border-[#ff5a1f]/40'
                    }`}
                  >
                    <span>{meta.icon}</span>
                    <span className="truncate max-w-[120px]">{h.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1. Time of Day Ritual Selector */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                1. Assign to Dayflow Ritual
              </label>
              <span className="text-[10px] text-[#15130f]/50 dark:text-[#fbf8f1]/50 font-medium">
                {DAYFLOW_META[timeOfDay].timeRange}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DAYFLOW_ORDER.map((tod) => {
                const meta = DAYFLOW_META[tod];
                const isSelected = timeOfDay === tod;
                return (
                  <button
                    key={tod}
                    type="button"
                    onClick={() => setTimeOfDay(tod)}
                    className={`flex flex-col items-start p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#ff5a1f] bg-[#ff5a1f]/8 dark:bg-[#ff5a1f]/12 shadow-xs'
                        : 'border-[#15130f]/10 dark:border-[#fbf8f1]/10 bg-[#f2ecdf]/60 dark:bg-[#11100d]/60 hover:border-[#15130f]/25 dark:hover:border-[#fbf8f1]/25'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-base">{meta.icon}</span>
                      {isSelected && (
                        <div className="w-3.5 h-3.5 rounded-full bg-[#ff5a1f] text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-bold leading-tight text-[#15130f] dark:text-[#fbf8f1]">
                      {meta.shortLabel}
                    </span>
                    <span className="text-[9.5px] text-[#15130f]/50 dark:text-[#fbf8f1]/50 mt-0.5 leading-tight truncate w-full">
                      {meta.timeRange}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Habit Stacking Formula (Atomic Habits Trigger Chaining) */}
          <div className="flex flex-col gap-2 pt-1 border-t border-[#15130f]/8 dark:border-[#fbf8f1]/8">
            <div className="flex items-center justify-between">
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-[#ff5a1f]" />
                <span>2. Habit Stacking Cue (Optional)</span>
              </label>

              <button
                type="button"
                onClick={() => setShowFormulaGuide(!showFormulaGuide)}
                className="text-[10.5px] text-[#ff5a1f] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Info className="w-3 h-3" />
                <span>{showFormulaGuide ? 'Hide formula' : 'The Formula'}</span>
              </button>
            </div>

            {/* Atomic Habits Cue Formula Explainer */}
            <AnimatePresence>
              {showFormulaGuide && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl p-3 bg-amber-500/10 border border-amber-500/20 text-xs text-[#15130f]/80 dark:text-[#fbf8f1]/80 overflow-hidden"
                >
                  <p className="font-semibold text-amber-600 dark:text-amber-400 mb-1">
                    James Clear’s Habit Stacking Formula:
                  </p>
                  <p className="italic text-[11.5px] text-[#15130f]/70 dark:text-[#fbf8f1]/70">
                    “After <strong>[CURRENT HABIT / LIFE EVENT]</strong>, I will <strong>[NEW HABIT]</strong>.”
                  </p>
                  <p className="text-[10.5px] text-[#15130f]/60 dark:text-[#fbf8f1]/60 mt-1">
                    Instead of pairing a habit with a vague time, anchor it to an established neurological trigger so it executes automatically.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Trigger Type Selection */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'none', label: 'No Trigger', sub: 'Standalone' },
                { id: 'habit', label: 'After Habit', sub: 'Chain routine' },
                { id: 'custom', label: 'Custom Cue', sub: 'Life event' },
              ].map((item) => {
                const isSelected = triggerType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTriggerType(item.id as StackTriggerType)}
                    className={`px-2.5 py-2 rounded-xl text-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#ff5a1f] bg-[#ff5a1f]/10 text-[#ff5a1f] font-bold shadow-xs'
                        : 'border-[#15130f]/10 dark:border-[#fbf8f1]/10 bg-[#f2ecdf]/50 dark:bg-[#11100d]/50 text-[#15130f]/70 dark:text-[#fbf8f1]/70 hover:border-[#15130f]/25'
                    }`}
                  >
                    <p className="text-xs font-semibold">{item.label}</p>
                    <p className="text-[9.5px] opacity-60 leading-tight">{item.sub}</p>
                  </button>
                );
              })}
            </div>

            {/* Sub-config: Chain to an existing habit */}
            {triggerType === 'habit' && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-1.5 mt-1"
              >
                <label className="text-[10.5px] font-semibold text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                  Select Anchor Habit:
                </label>
                {candidateParents.length === 0 ? (
                  <p className="text-xs text-[#15130f]/50 dark:text-[#fbf8f1]/50 italic p-2 bg-[#f2ecdf] dark:bg-[#11100d] rounded-xl">
                    Create at least two habits to chain them together.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto p-0.5 scrollbar-thin">
                    {candidateParents.map((parent) => {
                      const isSelected = parent.id === parentHabitId;
                      return (
                        <button
                          key={parent.id}
                          type="button"
                          onClick={() => setParentHabitId(parent.id)}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#ff5a1f] bg-[#ff5a1f]/10 text-[#ff5a1f] font-bold'
                              : 'border-[#15130f]/10 dark:border-[#fbf8f1]/10 bg-[#f2ecdf]/60 dark:bg-[#11100d]/60 hover:border-[#ff5a1f]/40'
                          }`}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: parent.color_theme || '#ff5a1f' }}
                          />
                          <span className="truncate">{parent.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Sub-config: Custom lifestyle cue */}
            {triggerType === 'custom' && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-1.5 mt-1"
              >
                <label className="text-[10.5px] font-semibold text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                  Custom Trigger Event:
                </label>
                <input
                  type="text"
                  maxLength={80}
                  placeholder="e.g. Pouring morning espresso, Stepping out of bed"
                  value={customCue}
                  onChange={(e) => setCustomCue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/12 dark:border-[#fbf8f1]/12 text-xs font-medium focus:outline-none focus:border-[#ff5a1f] transition-colors"
                />
              </motion.div>
            )}
          </div>

          {/* Live Stack Preview */}
          <div className="p-3 rounded-2xl bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/8 dark:border-[#fbf8f1]/8 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg shrink-0">{DAYFLOW_META[timeOfDay].icon}</span>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#15130f]/50 dark:text-[#fbf8f1]/50">
                  {DAYFLOW_META[timeOfDay].label}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#15130f] dark:text-[#fbf8f1] truncate">
                  {triggerType === 'habit' && parentHabit ? (
                    <>
                      <span className="text-[#15130f]/60 dark:text-[#fbf8f1]/60 truncate">
                        After {parentHabit.title}
                      </span>
                      <ArrowRight className="w-3 h-3 text-[#ff5a1f] shrink-0" />
                    </>
                  ) : triggerType === 'custom' && customCue.trim() ? (
                    <>
                      <span className="text-[#15130f]/60 dark:text-[#fbf8f1]/60 truncate">
                        After {customCue.trim()}
                      </span>
                      <ArrowRight className="w-3 h-3 text-[#ff5a1f] shrink-0" />
                    </>
                  ) : null}
                  <span className="text-[#ff5a1f] font-bold truncate">{selectedHabit?.title}</span>
                </div>
              </div>
            </div>

            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${DAYFLOW_META[timeOfDay].badgeBg}`}>
              {DAYFLOW_META[timeOfDay].shortLabel}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#15130f]/8 dark:border-[#fbf8f1]/8">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-full text-xs font-semibold border border-[#15130f]/15 dark:border-[#fbf8f1]/15 hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-full bg-[#ff5a1f] hover:bg-[#e04a12] text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Apply Routine'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
