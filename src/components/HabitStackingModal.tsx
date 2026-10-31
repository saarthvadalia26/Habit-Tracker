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
  Plus,
  ChevronRight,
  RotateCcw,
  HelpCircle,
  Unlink2,
} from 'lucide-react';
import { HabitWithLogs, TimeOfDay, StackTriggerType } from '@/types/database.types';
import {
  DAYFLOW_META,
  DAYFLOW_ORDER,
  getHabitTimeOfDay,
  getHabitStackTriggerText,
  formatParentHabitTitles,
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
    parentHabitIds?: string[] | string | null,
    customCue?: string
  ) => Promise<boolean>;
  onSaveHabitChain?: (
    chainHabitIds: string[],
    timeOfDay: TimeOfDay
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
  onSaveHabitChain,
}: HabitStackingModalProps) {
  const [selectedHabitId, setSelectedHabitId] = useState<string>(
    initialHabitId || habits[0]?.id || ''
  );

  const selectedHabit = habits.find((h) => h.id === selectedHabitId) || habits[0];

  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('anytime');
  const [triggerType, setTriggerType] = useState<StackTriggerType>('none');
  const [chainHabitIds, setChainHabitIds] = useState<string[]>([]);
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
      const trig = selectedHabit.stack_trigger_type || selectedHabit.stack?.triggerType || 'none';
      setTriggerType(trig);

      // Build initial chain sequence for selected habit
      const parentId =
        (selectedHabit.stack_parent_habit_ids && selectedHabit.stack_parent_habit_ids[0]) ||
        selectedHabit.stack_parent_habit_id ||
        selectedHabit.stack?.parentHabitId;

      if (parentId) {
        const initialChain: string[] = [selectedHabit.id];
        let curr: string | null = parentId;
        const seen = new Set<string>([selectedHabit.id]);
        while (curr && !seen.has(curr)) {
          seen.add(curr);
          initialChain.unshift(curr);
          const p = habits.find((h) => h.id === curr);
          curr =
            (p?.stack_parent_habit_ids && p.stack_parent_habit_ids[0]) ||
            p?.stack_parent_habit_id ||
            p?.stack?.parentHabitId ||
            null;
        }
        setChainHabitIds(initialChain);
      } else {
        setChainHabitIds([selectedHabit.id]);
      }

      setCustomCue(
        (selectedHabit.stack_custom_cue || selectedHabit.stack?.customCue || '').trim()
      );
    }
  }, [selectedHabit, isOpen, habits]);

  const hasExistingTrigger =
    Boolean(selectedHabit?.stack_parent_habit_id) ||
    Boolean(selectedHabit?.stack_parent_habit_ids && selectedHabit.stack_parent_habit_ids.length > 0) ||
    Boolean(selectedHabit?.stack_custom_cue && selectedHabit.stack_custom_cue.trim()) ||
    (Boolean(selectedHabit?.stack_trigger_type) && selectedHabit?.stack_trigger_type !== 'none');

  const handleUnlink = async () => {
    if (!selectedHabit) return;
    setIsSaving(true);
    try {
      setTriggerType('none');
      setChainHabitIds([selectedHabit.id]);
      setCustomCue('');
      const ok = await onUpdateHabitStack(
        selectedHabit.id,
        timeOfDay,
        'none',
        null,
        ''
      );
      if (ok) {
        toast.success('Routine unlinked! Habit is now standalone.', {
          description: `${selectedHabit.title} will execute independently.`,
        });
        onClose();
      }
    } catch {
      toast.error('Failed to unlink habit routine');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const handleToggleChainHabit = (id: string) => {
    setChainHabitIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  const handleRemoveFromChain = (id: string) => {
    setChainHabitIds((prev) => prev.filter((item) => item !== id));
  };

  const handleSave = async () => {
    if (isGuestMode) {
      toast.info('Sign in required', {
        description: 'Please sign in or create an account to save Dayflow routines.',
      });
      return;
    }

    if (triggerType === 'habit') {
      if (chainHabitIds.length < 2) {
        toast.error('Select at least two habits to build an A → B → C routine chain.');
        return;
      }

      setIsSaving(true);
      try {
        let ok = false;
        if (onSaveHabitChain) {
          ok = await onSaveHabitChain(chainHabitIds, timeOfDay);
        } else {
          ok = await onUpdateHabitStack(
            chainHabitIds[1],
            timeOfDay,
            'habit',
            chainHabitIds[0],
            ''
          );
        }

        if (ok) {
          const chainTitles = chainHabitIds
            .map((id) => habits.find((h) => h.id === id)?.title)
            .filter(Boolean);
          toast.success('Dayflow routine chain saved!', {
            description: chainTitles.join(' → '),
          });
          onClose();
        }
      } catch {
        toast.error('Failed to save routine chain');
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (triggerType === 'custom' && !customCue.trim()) {
      toast.error('Enter a custom trigger cue (e.g. "Making morning coffee").');
      return;
    }

    if (!selectedHabit) return;

    setIsSaving(true);
    try {
      const ok = await onUpdateHabitStack(
        selectedHabit.id,
        timeOfDay,
        triggerType,
        null,
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
          className="relative w-full max-w-[540px] rounded-[28px] bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/15 dark:border-[#fbf8f1]/15 shadow-2xl text-[#15130f] dark:text-[#fbf8f1] max-h-[min(92vh,740px)] flex flex-col overflow-hidden my-auto font-archivo"
        >
          {/* Header (Pinned) */}
          <div className="p-5 sm:p-6 pb-3.5 border-b border-[#15130f]/8 dark:border-[#fbf8f1]/8 shrink-0 flex items-center justify-between bg-[#fbf8f1] dark:bg-[#1c1a16]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#ff5a1f]/10 dark:bg-[#ff5a1f]/20 text-[#ff5a1f] flex items-center justify-center shrink-0">
                <Layers className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-clash font-semibold text-lg sm:text-xl tracking-tight leading-tight">
                Habit Stacking & Dayflows
              </h3>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleToggleGuide()}
                className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border shrink-0 ${
                  showGuide
                    ? 'bg-[#ff5a1f] text-white border-[#ff5a1f] shadow-xs'
                    : 'bg-[#15130f]/5 dark:bg-[#fbf8f1]/8 text-[#15130f]/75 dark:text-[#fbf8f1]/75 border-[#15130f]/10 dark:border-[#fbf8f1]/10 hover:border-[#ff5a1f]/40 hover:text-[#ff5a1f]'
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

          {/* Scrollable Content Body */}
          <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 pt-3 space-y-4">

          {/* Collapsible How It Works Guide Drawer */}
          <AnimatePresence>
            {showGuide && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="w-full shrink-0"
              >
                <div className="rounded-2xl p-4 bg-linear-to-br from-[#ff5a1f]/10 via-amber-500/5 to-transparent border border-[#ff5a1f]/25 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-[#ff5a1f] shrink-0" />
                      <h4 className="font-clash font-semibold text-sm text-[#15130f] dark:text-[#fbf8f1]">
                        How Habit Stacking & Dayflows Work
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleGuide(false)}
                      className="text-[11px] font-semibold text-[#15130f]/60 dark:text-[#fbf8f1]/60 hover:text-[#ff5a1f] cursor-pointer"
                    >
                      Hide guide ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Card 1 */}
                    <div className="p-3 rounded-xl bg-[#fbf8f1] dark:bg-[#201d18] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 space-y-1.5 shadow-xs">
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs">
                        <Sunrise className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>1. Dayflow Rituals</span>
                      </div>
                      <p className="text-[11px] text-[#15130f]/70 dark:text-[#fbf8f1]/70 leading-relaxed">
                        Group daily habits into <strong>Morning</strong> (4–12), <strong>Afternoon</strong> (12–17), <strong>Evening</strong> (17–4), or <strong>Anytime</strong>. Your dashboard gently spotlights your current ritual in real time.
                      </p>
                    </div>

                    {/* Card 2 */}
                    <div className="p-3 rounded-xl bg-[#fbf8f1] dark:bg-[#201d18] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 space-y-1.5 shadow-xs">
                      <div className="flex items-center gap-1.5 text-[#ff5a1f] font-bold text-xs">
                        <Link2 className="w-3.5 h-3.5 text-[#ff5a1f] shrink-0" />
                        <span>2. Atomic Stacking</span>
                      </div>
                      <p className="text-[11px] text-[#15130f]/70 dark:text-[#fbf8f1]/70 leading-relaxed">
                        Based on James Clear’s formula: <em>&ldquo;After [Current Habit / Life Event], I will [New Habit]&rdquo;</em>. Anchor new disciplines to existing cues so they execute without mental friction.
                      </p>
                    </div>

                    {/* Card 3 */}
                    <div className="p-3 rounded-xl bg-[#fbf8f1] dark:bg-[#201d18] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 space-y-1.5 shadow-xs">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                        <Layers className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>3. Automatic Chaining</span>
                      </div>
                      <p className="text-[11px] text-[#15130f]/70 dark:text-[#fbf8f1]/70 leading-relaxed">
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
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar">
              {habits.map((h) => {
                const isSelected = h.id === selectedHabit?.id;
                const tod = getHabitTimeOfDay(h);
                const meta = DAYFLOW_META[tod];
                const hasAssignedRitual = tod !== 'anytime';
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
                    {hasAssignedRitual && <span className="text-xs">{meta.icon}</span>}
                    <span className="truncate max-w-[130px]">{h.title}</span>
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
                { id: 'habit', label: 'Chain Routine', sub: 'A → B → C' },
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

            {/* Sub-config: Routine Sequence Chain (A → B → C) */}
            {triggerType === 'habit' && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2 mt-1"
              >
                <div className="flex items-center justify-between">
                  <label className="text-[10.5px] font-semibold text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                    Routine Sequence (A → B → C):
                  </label>
                  {chainHabitIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setChainHabitIds([])}
                      className="text-[10.5px] text-[#ff5a1f] hover:underline font-semibold cursor-pointer"
                    >
                      Clear chain
                    </button>
                  )}
                </div>

                {/* Interactive Visual Chain Pipeline */}
                <div className="flex items-center gap-1.5 flex-wrap p-2.5 rounded-xl bg-[#f2ecdf]/80 dark:bg-[#11100d]/80 border border-[#15130f]/10 dark:border-[#fbf8f1]/10 min-h-[46px]">
                  {chainHabitIds.length === 0 ? (
                    <p className="text-[11px] text-[#15130f]/50 dark:text-[#fbf8f1]/50 italic">
                      Click habits below in sequence to form your A → B → C routine.
                    </p>
                  ) : (
                    chainHabitIds.map((id, index) => {
                      const h = habits.find((item) => item.id === id);
                      if (!h) return null;
                      return (
                        <React.Fragment key={id}>
                          {index > 0 && (
                            <ArrowRight className="w-3.5 h-3.5 text-[#ff5a1f] shrink-0" />
                          )}
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#ff5a1f]/30 text-xs font-semibold text-[#15130f] dark:text-[#fbf8f1] shadow-xs">
                            <span className="w-4 h-4 rounded-full bg-[#ff5a1f] text-white flex items-center justify-center text-[10px] font-bold">
                              {index + 1}
                            </span>
                            <span className="truncate max-w-[120px]">{h.title}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFromChain(id)}
                              className="text-[#15130f]/40 hover:text-red-500 cursor-pointer ml-0.5"
                              title="Remove from sequence"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </React.Fragment>
                      );
                    })
                  )}
                </div>

                {/* Habit Grid with numbered sequence badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto p-0.5 scrollbar-thin">
                  {habits.map((habit) => {
                    const chainIndex = chainHabitIds.indexOf(habit.id);
                    const isInChain = chainIndex !== -1;
                    return (
                      <button
                        key={habit.id}
                        type="button"
                        onClick={() => handleToggleChainHabit(habit.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          isInChain
                            ? 'border-[#ff5a1f] bg-[#ff5a1f]/10 text-[#ff5a1f] font-bold shadow-xs'
                            : 'border-[#15130f]/10 dark:border-[#fbf8f1]/10 bg-[#f2ecdf]/60 dark:bg-[#11100d]/60 hover:border-[#ff5a1f]/40 text-[#15130f] dark:text-[#fbf8f1]'
                        }`}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: habit.color_theme || '#ff5a1f' }}
                        />
                        <span className="truncate flex-1">{habit.title}</span>
                        {isInChain ? (
                          <span className="w-4 h-4 rounded-full bg-[#ff5a1f] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                            {chainIndex + 1}
                          </span>
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-[#15130f]/30 dark:text-[#fbf8f1]/30 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
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
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#15130f]/50 dark:text-[#fbf8f1]/50">
                  {DAYFLOW_META[timeOfDay].label}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#15130f] dark:text-[#fbf8f1] overflow-x-auto scrollbar-none py-0.5">
                  {triggerType === 'habit' && chainHabitIds.length > 0 ? (
                    chainHabitIds.map((id, idx) => {
                      const h = habits.find((item) => item.id === id);
                      if (!h) return null;
                      return (
                        <React.Fragment key={id}>
                          {idx > 0 && <ArrowRight className="w-3 h-3 text-[#ff5a1f] shrink-0" />}
                          <span
                            className={`whitespace-nowrap ${
                              idx === chainHabitIds.length - 1
                                ? 'text-[#ff5a1f] font-bold'
                                : 'text-[#15130f]/75 dark:text-[#fbf8f1]/75'
                            }`}
                          >
                            {h.title}
                          </span>
                        </React.Fragment>
                      );
                    })
                  ) : triggerType === 'custom' && customCue.trim() ? (
                    <>
                      <span className="text-[#15130f]/60 dark:text-[#fbf8f1]/60 truncate">
                        After {customCue.trim()}
                      </span>
                      <ArrowRight className="w-3 h-3 text-[#ff5a1f] shrink-0" />
                      <span className="text-[#ff5a1f] font-bold truncate">{selectedHabit?.title}</span>
                    </>
                  ) : (
                    <span className="text-[#ff5a1f] font-bold truncate">{selectedHabit?.title}</span>
                  )}
                </div>
              </div>
            </div>

            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${DAYFLOW_META[timeOfDay].badgeBg}`}>
              {DAYFLOW_META[timeOfDay].shortLabel}
            </span>
          </div>

          </div>

          {/* Action buttons (Pinned Footer) */}
          <div className="p-4 sm:p-5 pt-3 border-t border-[#15130f]/8 dark:border-[#fbf8f1]/8 shrink-0 flex items-center justify-between gap-2 bg-[#fbf8f1] dark:bg-[#1c1a16]">
            {hasExistingTrigger ? (
              <button
                type="button"
                onClick={handleUnlink}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/25 transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
                title="Remove anchor and make this habit standalone"
              >
                <Unlink2 className="w-3.5 h-3.5" />
                <span>Unlink Routine</span>
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
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
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
