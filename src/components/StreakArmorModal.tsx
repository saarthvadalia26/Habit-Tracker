'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Shield,
  Coffee,
  X,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Undo2,
  Clock,
  Zap,
  Flame,
  Info,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { HabitWithLogs } from '@/types/database.types';
import { CadenceConfig } from '@/types/cadence.types';
import {
  getCadenceLabel,
  isHabitRestDay,
  isHabitScheduledForDay,
  computeHabitShieldBank,
  calculateCadenceStreak,
  getActiveDaysCountInMonth,
} from '@/lib/cadenceUtils';
import { formatDateToISO } from '@/lib/dateUtils';

interface StreakArmorModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: HabitWithLogs[];
  isGuestMode?: boolean;
  onUpdateHabitCadence: (habitId: string, cadence: CadenceConfig) => void;
  onToggleStreakFreeze: (habitId: string, dateStr: string, isFrozen: boolean, reason?: string) => void;
  initialHabitId?: string;
  initialTab?: 'armor' | 'cadence';
  initialShowGuide?: boolean;
}

const PRESET_REASONS = [
  { label: 'Sick / Unwell', icon: '🤒' },
  { label: 'Travel / Delay', icon: '✈️' },
  { label: 'Emergency', icon: '🚨' },
  { label: 'Mental Reset', icon: '🧠' },
  { label: 'Planned Rest', icon: '💤' },
  { label: 'Work Crunch', icon: '💼' },
];

const WEEKDAY_ORDER = [
  { dayIndex: 1, label: 'Mon', full: 'Monday' },
  { dayIndex: 2, label: 'Tue', full: 'Tuesday' },
  { dayIndex: 3, label: 'Wed', full: 'Wednesday' },
  { dayIndex: 4, label: 'Thu', full: 'Thursday' },
  { dayIndex: 5, label: 'Fri', full: 'Friday' },
  { dayIndex: 6, label: 'Sat', full: 'Saturday' },
  { dayIndex: 0, label: 'Sun', full: 'Sunday' },
];

export function StreakArmorModal({
  isOpen,
  onClose,
  habits,
  isGuestMode = false,
  onUpdateHabitCadence,
  onToggleStreakFreeze,
  initialHabitId,
  initialTab = 'armor',
  initialShowGuide = false,
}: StreakArmorModalProps) {
  const [activeTab, setActiveTab] = useState<'armor' | 'cadence'>(initialTab);
  const [showGuide, setShowGuide] = useState(initialShowGuide);

  // Selected habit for configuration
  const [selectedHabitId, setSelectedHabitId] = useState<string>(() => {
    if (initialHabitId && habits.some((h) => h.id === initialHabitId)) {
      return initialHabitId;
    }
    return habits[0]?.id || '';
  });

  const selectedHabit = useMemo(
    () => habits.find((h) => h.id === selectedHabitId) || habits[0],
    [habits, selectedHabitId]
  );

  // Freeze deployment form state
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayStr = useMemo(() => formatDateToISO(today), [today]);

  const yesterdayStr = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return formatDateToISO(d);
  }, [today]);

  const [freezeDate, setFreezeDate] = useState<string>(yesterdayStr);
  const [freezeReason, setFreezeReason] = useState<string>('Sick / Unwell');
  const [customReason, setCustomReason] = useState<string>('');

  // Cadence editor local state
  const [cadenceType, setCadenceType] = useState<CadenceConfig['type']>(
    selectedHabit?.cadence?.type || 'everyday'
  );
  const [selectedDays, setSelectedDays] = useState<number[]>(
    selectedHabit?.cadence?.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]
  );

  // Sync editor state when selected habit changes
  const handleSelectHabit = (id: string) => {
    setSelectedHabitId(id);
    const target = habits.find((h) => h.id === id);
    if (target) {
      setCadenceType(target.cadence?.type || 'everyday');
      setSelectedDays(target.cadence?.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]);
    }
  };

  // Calculate accurate cadence streak for the selected habit
  const currentStreak = useMemo(() => {
    if (!selectedHabit) return 0;
    if (typeof selectedHabit.currentStreak === 'number' && selectedHabit.currentStreak > 0) {
      return selectedHabit.currentStreak;
    }
    return calculateCadenceStreak(
      selectedHabit.logs || {},
      selectedHabit.frozenLogs || {},
      selectedHabit.cadence
    ).currentStreak;
  }, [selectedHabit]);

  // Compute shields available across the selected habit
  const shieldStats = useMemo(() => {
    const frozenCount = selectedHabit?.frozenLogs
      ? Object.values(selectedHabit.frozenLogs).filter(Boolean).length
      : 0;
    return computeHabitShieldBank(currentStreak, frozenCount);
  }, [selectedHabit, currentStreak]);

  // All active frozen dates across habits or for the selected habit
  const activeFreezes = useMemo(() => {
    if (!selectedHabit?.frozenLogs) return [];
    return Object.entries(selectedHabit.frozenLogs)
      .filter(([, isFrozen]) => Boolean(isFrozen))
      .map(([date]) => ({
        date,
        habitTitle: selectedHabit.title,
        habitId: selectedHabit.id,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [selectedHabit]);

  // Handle Deploy Shield
  const handleDeployShield = () => {
    if (!selectedHabit) return;

    if (shieldStats.available <= 0) {
      toast.error('No Streak Shields available', {
        description: 'Earn more shields by building unbroken 7-day consistency streaks!',
      });
      return;
    }

    if (selectedHabit.frozenLogs?.[freezeDate]) {
      toast.info('Already protected', {
        description: `${selectedHabit.title} is already frozen on ${freezeDate}.`,
      });
      return;
    }

    const finalReason = customReason.trim() || freezeReason;
    onToggleStreakFreeze(selectedHabit.id, freezeDate, true, finalReason);

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#ff5a1f', '#38bdf8', '#f59e0b'],
    });

    toast.success('Streak Shield Deployed 🛡️', {
      description: `Protected ${selectedHabit.title} on ${freezeDate}. Your streak remains unbroken!`,
    });
  };

  // Handle Reclaim / Unfreeze
  const handleReclaimShield = (date: string) => {
    if (!selectedHabit) return;
    onToggleStreakFreeze(selectedHabit.id, date, false);
    toast.success('Shield Reclaimed', {
      description: `Removed freeze from ${date}. 1 shield returned to your vault.`,
    });
  };

  // Handle Cadence Preset Click
  const handleApplyPreset = (preset: 'everyday' | 'weekdays' | 'weekends' | 'mwf') => {
    if (preset === 'everyday') {
      setCadenceType('everyday');
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    } else if (preset === 'weekdays') {
      setCadenceType('weekdays');
      setSelectedDays([1, 2, 3, 4, 5]);
    } else if (preset === 'weekends') {
      setCadenceType('weekends');
      setSelectedDays([0, 6]);
    } else if (preset === 'mwf') {
      setCadenceType('custom');
      setSelectedDays([1, 3, 5]); // Mon, Wed, Fri
    }
  };

  // Toggle individual day in custom cadence
  const handleToggleDay = (dayIndex: number) => {
    setCadenceType('custom');
    setSelectedDays((prev) => {
      if (prev.includes(dayIndex)) {
        if (prev.length === 1) {
          toast.warning('At least 1 active day required');
          return prev;
        }
        return prev.filter((d) => d !== dayIndex);
      } else {
        return [...prev, dayIndex].sort((a, b) => a - b);
      }
    });
  };

  // Save Cadence Settings
  const handleSaveCadence = () => {
    if (!selectedHabit) return;

    const newCadence: CadenceConfig = {
      type: cadenceType,
      daysOfWeek: selectedDays,
      frequencyPerWeek: selectedDays.length,
    };

    onUpdateHabitCadence(selectedHabit.id, newCadence);

    toast.success('Cadence Updated ☕', {
      description: `Set "${selectedHabit.title}" to ${getCadenceLabel(newCadence)}. Rest days will never break your streak.`,
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="streak-armor-title"
        className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-black/60 backdrop-blur-md font-archivo"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl max-h-[94dvh] sm:max-h-[90vh] rounded-[22px] sm:rounded-[28px] bg-[#fbf8f1] dark:bg-[#181612] border border-[#15130f]/15 dark:border-[#fbf8f1]/15 shadow-2xl text-[#15130f] dark:text-[#fbf8f1] flex flex-col overflow-hidden my-auto"
        >
          {/* Header Banner */}
          <div className="relative p-4 sm:p-6 pb-3 sm:pb-4 border-b border-[#15130f]/10 dark:border-[#fbf8f1]/10 bg-linear-to-br from-amber-500/10 via-orange-500/5 to-transparent shrink-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] sm:text-[11px] font-bold tracking-wider uppercase bg-[#ff5a1f]/15 text-[#ff5a1f] border border-[#ff5a1f]/20 truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-[#ff5a1f] shrink-0" />
                Streak Armor & Cadence
              </span>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowGuide((prev) => !prev)}
                  className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border shrink-0 ${
                    showGuide
                      ? 'bg-[#ff5a1f] text-white border-[#ff5a1f] shadow-xs'
                      : 'bg-[#15130f]/5 dark:bg-[#fbf8f1]/8 text-[#15130f]/75 dark:text-[#fbf8f1]/75 border-[#15130f]/10 dark:border-[#fbf8f1]/10 hover:border-[#ff5a1f]/40 hover:text-[#ff5a1f]'
                  }`}
                  title="How Streak Armor & Rest Cadence works"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">How it works</span>
                  <span className="sm:hidden text-[10.5px]">Guide</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close Streak Armor modal"
                  className="p-1 sm:p-1.5 rounded-full text-[#15130f]/40 hover:text-[#15130f] dark:text-[#fbf8f1]/40 dark:hover:text-[#fbf8f1] hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/5 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <h3
              id="streak-armor-title"
              className="font-clash font-semibold text-xl sm:text-[28px] tracking-tight leading-tight text-[#15130f] dark:text-[#fbf8f1]"
            >
              Streak Armor & Cadence Studio
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-[#15130f]/65 dark:text-[#fbf8f1]/65 max-w-lg leading-relaxed hidden xs:block">
              Preserve your consistency with earned freeze shields, or configure guilt-free recovery days that maintain unbroken streaks without penalty.
            </p>

            {/* Habit Switcher Bar */}
            {habits.length > 0 && (
              <div className="mt-3 sm:mt-4 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[11px] sm:text-xs font-semibold text-[#15130f]/50 dark:text-[#fbf8f1]/50 uppercase tracking-wider shrink-0 mr-1">
                  Habit:
                </span>
                {habits.map((h) => {
                  const isSelected = h.id === selectedHabit?.id;
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => handleSelectHabit(h.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-[#15130f] text-[#fbf8f1] dark:bg-[#fbf8f1] dark:text-[#15130f] shadow-sm'
                          : 'bg-[#15130f]/5 dark:bg-[#fbf8f1]/5 text-[#15130f]/70 dark:text-[#fbf8f1]/70 hover:bg-[#15130f]/10 dark:hover:bg-[#fbf8f1]/10'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: h.color_theme || '#ff5a1f' }}
                      />
                      <span className="truncate max-w-[100px] sm:max-w-[120px]">{h.title}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Tab Navigation */}
            <div className="mt-3 sm:mt-4 flex items-center gap-1.5 sm:gap-2 border-b border-[#15130f]/10 dark:border-[#fbf8f1]/10 -mb-3 sm:-mb-4 pb-2 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('armor')}
                className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'armor'
                    ? 'bg-[#ff5a1f] text-white shadow-sm'
                    : 'text-[#15130f]/60 dark:text-[#fbf8f1]/60 hover:text-[#15130f] dark:hover:text-[#fbf8f1]'
                }`}
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span>Streak Armor</span>
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-bold shrink-0">
                  {shieldStats.available} 🛡️
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('cadence')}
                className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'cadence'
                    ? 'bg-[#ff5a1f] text-white shadow-sm'
                    : 'text-[#15130f]/60 dark:text-[#fbf8f1]/60 hover:text-[#15130f] dark:hover:text-[#fbf8f1]'
                }`}
              >
                <Coffee className="w-4 h-4 shrink-0" />
                <span>Rest Cadence</span>
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-5">
            {/* Collapsible How It Works Guide */}
            <AnimatePresence>
              {showGuide && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="rounded-2xl p-3.5 sm:p-5 bg-linear-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/25 space-y-3 text-xs max-h-[35vh] sm:max-h-none overflow-y-auto">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-amber-500" />
                        <h4 className="font-clash font-semibold text-sm text-[#15130f] dark:text-[#fbf8f1]">
                          How Streak Armor & Rest Cadence Works
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowGuide(false)}
                        className="text-[11px] font-semibold text-[#15130f]/50 dark:text-[#fbf8f1]/50 hover:text-[#ff5a1f] cursor-pointer"
                      >
                        Hide guide ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="p-3 rounded-xl bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/8 dark:border-[#fbf8f1]/8 space-y-1">
                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs">
                          <Shield className="w-3.5 h-3.5 fill-current" />
                          <span>1. Shield Bank</span>
                        </div>
                        <p className="text-[11px] text-[#15130f]/65 dark:text-[#fbf8f1]/65 leading-relaxed">
                          Start with 2 base shields. Earn <strong>+1 shield</strong> for every 7 days of continuous streak (up to 5 max capacity).
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/8 dark:border-[#fbf8f1]/8 space-y-1">
                        <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-bold text-xs">
                          <Flame className="w-3.5 h-3.5 text-[#ff5a1f]" />
                          <span>2. Streak Freeze</span>
                        </div>
                        <p className="text-[11px] text-[#15130f]/65 dark:text-[#fbf8f1]/65 leading-relaxed">
                          Sick, traveling, or resting? Freeze <strong>Today</strong> or <strong>Yesterday</strong> using 1 shield to protect your streak with 0 lost days.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/8 dark:border-[#fbf8f1]/8 space-y-1">
                        <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold text-xs">
                          <Coffee className="w-3.5 h-3.5 text-sky-500" />
                          <span>3. Rest Cadence</span>
                        </div>
                        <p className="text-[11px] text-[#15130f]/65 dark:text-[#fbf8f1]/65 leading-relaxed">
                          Tailor habits for real life (e.g. Weekdays, 3x/week). Off-days count as rest and preserve streaks with <strong>zero shields required</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TAB 1: STREAK ARMOR VAULT */}
            {activeTab === 'armor' && (
              <div className="space-y-5">
                {/* Shields Vault Summary Card */}
                <div className="rounded-2xl p-4 sm:p-5 bg-linear-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-clash font-semibold text-lg text-[#15130f] dark:text-[#fbf8f1] flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                        <span>Shield Bank: {selectedHabit?.title}</span>
                      </h4>
                    </div>
                    <p className="text-xs text-[#15130f]/65 dark:text-[#fbf8f1]/65 max-w-sm">
                      Base 2 shields + 1 earned for every 7 days of active unbroken streak (max 5).
                    </p>
                    <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                      Current streak: {currentStreak} days • {shieldStats.earned} of {shieldStats.maxCapacity} shields unlocked {shieldStats.earned < shieldStats.maxCapacity ? `(${7 - (currentStreak % 7)} days until next shield)` : '(Max shields reached)'}
                    </p>
                  </div>

                  {/* Visual Shields Row */}
                  <div className="flex items-center gap-2">
                    {Array.from({ length: shieldStats.maxCapacity }).map((_, i) => {
                      const isReady = i < shieldStats.available;
                      const isUsed = i >= shieldStats.available && i < shieldStats.earned;
                      return (
                        <div
                          key={i}
                          title={
                            isReady
                              ? `Shield ${i + 1}: Ready to protect`
                              : isUsed
                              ? `Shield ${i + 1}: Active on frozen date`
                              : `Shield ${i + 1}: Locked (Requires ${(i + 1 - 2) * 7}d streak - currently ${currentStreak}d)`
                          }
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            isReady
                              ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40 shadow-sm animate-pulse'
                              : isUsed
                              ? 'bg-[#15130f]/10 dark:bg-[#fbf8f1]/10 text-[#15130f]/40 dark:text-[#fbf8f1]/40 border border-[#15130f]/15'
                              : 'bg-transparent border border-dashed border-[#15130f]/15 dark:border-[#fbf8f1]/15 text-[#15130f]/20 dark:text-[#fbf8f1]/20'
                          }`}
                        >
                          <Shield className="w-5 h-5 fill-current" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Deploy Shield Section */}
                <div className="rounded-2xl p-4 sm:p-5 bg-[#15130f]/3 dark:bg-[#fbf8f1]/3 border border-[#15130f]/10 dark:border-[#fbf8f1]/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-sm text-[#15130f] dark:text-[#fbf8f1] flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#ff5a1f]" />
                      <span>Deploy Streak Shield</span>
                    </h5>
                    <span className="text-[11px] font-semibold text-[#15130f]/50 dark:text-[#fbf8f1]/50">
                      {shieldStats.available} available
                    </span>
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#15130f]/70 dark:text-[#fbf8f1]/70">
                      Target Date to Freeze:
                    </label>
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFreezeDate(yesterdayStr)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center truncate ${
                          freezeDate === yesterdayStr
                            ? 'bg-[#ff5a1f] text-white border-[#ff5a1f]'
                            : 'bg-[#15130f]/5 dark:bg-[#fbf8f1]/5 border-[#15130f]/10 text-[#15130f]/80 dark:text-[#fbf8f1]/80 hover:bg-[#15130f]/10'
                        }`}
                      >
                        Yesterday
                      </button>

                      <button
                        type="button"
                        onClick={() => setFreezeDate(todayStr)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center truncate ${
                          freezeDate === todayStr
                            ? 'bg-[#ff5a1f] text-white border-[#ff5a1f]'
                            : 'bg-[#15130f]/5 dark:bg-[#fbf8f1]/5 border-[#15130f]/10 text-[#15130f]/80 dark:text-[#fbf8f1]/80 hover:bg-[#15130f]/10'
                        }`}
                      >
                        Today
                      </button>

                      <input
                        type="date"
                        value={freezeDate}
                        onChange={(e) => setFreezeDate(e.target.value)}
                        className="col-span-2 sm:col-span-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#15130f]/5 dark:bg-[#fbf8f1]/5 border border-[#15130f]/15 dark:border-[#fbf8f1]/15 text-[#15130f] dark:text-[#fbf8f1] focus:outline-hidden focus:border-[#ff5a1f]"
                      />
                    </div>
                  </div>

                  {/* Reason Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#15130f]/70 dark:text-[#fbf8f1]/70">
                      Shield Reason:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_REASONS.map((r) => (
                        <button
                          key={r.label}
                          type="button"
                          onClick={() => {
                            setFreezeReason(r.label);
                            setCustomReason('');
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            freezeReason === r.label && !customReason
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40'
                              : 'bg-[#15130f]/5 dark:bg-[#fbf8f1]/5 border-[#15130f]/10 text-[#15130f]/70 dark:text-[#fbf8f1]/70 hover:bg-[#15130f]/10'
                          }`}
                        >
                          <span>{r.icon}</span>
                          <span>{r.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Deploy Action Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleDeployShield}
                      disabled={shieldStats.available <= 0}
                      className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                        shieldStats.available > 0
                          ? 'bg-[#ff5a1f] hover:bg-[#e04a12] text-white cursor-pointer active:scale-[0.99]'
                          : 'bg-[#15130f]/10 dark:bg-[#fbf8f1]/10 text-[#15130f]/30 dark:text-[#fbf8f1]/30 cursor-not-allowed'
                      }`}
                    >
                      <Shield className="w-4 h-4 fill-current shrink-0" />
                      <span className="truncate">
                        Deploy Shield for {selectedHabit?.title} ({freezeDate})
                      </span>
                    </button>
                  </div>
                </div>

                {/* Active Freezes List */}
                <div className="space-y-2">
                  <h5 className="font-semibold text-xs uppercase tracking-wider text-[#15130f]/50 dark:text-[#fbf8f1]/50">
                    Active Streak Freezes ({activeFreezes.length})
                  </h5>

                  {activeFreezes.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-[#15130f]/15 dark:border-[#fbf8f1]/15 text-center text-xs text-[#15130f]/50 dark:text-[#fbf8f1]/50">
                      No active freezes for {selectedHabit?.title}. Your streak shields are safely vaulted.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {activeFreezes.map((f) => (
                        <div
                          key={f.date}
                          className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                            <div>
                              <span className="font-semibold text-[#15130f] dark:text-[#fbf8f1]">
                                {f.date}
                              </span>
                              <span className="ml-2 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                                • Protected · 0 streak lost
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleReclaimShield(f.date)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#15130f]/10 dark:bg-[#fbf8f1]/10 hover:bg-[#15130f]/15 dark:hover:bg-[#fbf8f1]/15 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Undo2 className="w-3 h-3" />
                            <span>Reclaim Shield</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: REST CADENCE STUDIO */}
            {activeTab === 'cadence' && (
              <div className="space-y-5">
                {/* Cadence Info Card */}
                <div className="rounded-2xl p-4 sm:p-5 bg-linear-to-r from-sky-500/10 via-indigo-500/5 to-transparent border border-sky-500/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-sky-500" />
                    <h4 className="font-clash font-semibold text-lg text-[#15130f] dark:text-[#fbf8f1]">
                      Weekly Rest Cadence: {selectedHabit?.title}
                    </h4>
                  </div>
                  <p className="text-xs text-[#15130f]/65 dark:text-[#fbf8f1]/65 max-w-lg leading-relaxed">
                    Not every ritual belongs on a 7-day schedule. Set your training or recovery cadence (e.g. 3x/week gym schedule). Rest days automatically preserve your streak without penalty or guilt.
                  </p>
                </div>

                {/* Cadence Presets */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#15130f]/70 dark:text-[#fbf8f1]/70">
                    Schedule Presets:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('everyday')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        cadenceType === 'everyday'
                          ? 'bg-[#ff5a1f]/10 border-[#ff5a1f] text-[#ff5a1f]'
                          : 'bg-[#15130f]/5 dark:bg-[#fbf8f1]/5 border-[#15130f]/10 text-[#15130f]/70 dark:text-[#fbf8f1]/70 hover:bg-[#15130f]/10'
                      }`}
                    >
                      <span className="font-semibold text-xs block">Daily (7d)</span>
                      <span className="text-[11px] text-[#15130f]/50 dark:text-[#fbf8f1]/50 mt-0.5 block">
                        No rest days
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPreset('weekdays')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        cadenceType === 'weekdays'
                          ? 'bg-[#ff5a1f]/10 border-[#ff5a1f] text-[#ff5a1f]'
                          : 'bg-[#15130f]/5 dark:bg-[#fbf8f1]/5 border-[#15130f]/10 text-[#15130f]/70 dark:text-[#fbf8f1]/70 hover:bg-[#15130f]/10'
                      }`}
                    >
                      <span className="font-semibold text-xs block">Weekdays (5d)</span>
                      <span className="text-[11px] text-[#15130f]/50 dark:text-[#fbf8f1]/50 mt-0.5 block">
                        Sat & Sun rest
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPreset('mwf')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        cadenceType === 'custom' &&
                        selectedDays.length === 3 &&
                        [1, 3, 5].every((d) => selectedDays.includes(d))
                          ? 'bg-[#ff5a1f]/10 border-[#ff5a1f] text-[#ff5a1f]'
                          : 'bg-[#15130f]/5 dark:bg-[#fbf8f1]/5 border-[#15130f]/10 text-[#15130f]/70 dark:text-[#fbf8f1]/70 hover:bg-[#15130f]/10'
                      }`}
                    >
                      <span className="font-semibold text-xs block">3x / Week (MWF)</span>
                      <span className="text-[11px] text-[#15130f]/50 dark:text-[#fbf8f1]/50 mt-0.5 block">
                        Gym / High-grit
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPreset('weekends')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        cadenceType === 'weekends'
                          ? 'bg-[#ff5a1f]/10 border-[#ff5a1f] text-[#ff5a1f]'
                          : 'bg-[#15130f]/5 dark:bg-[#fbf8f1]/5 border-[#15130f]/10 text-[#15130f]/70 dark:text-[#fbf8f1]/70 hover:bg-[#15130f]/10'
                      }`}
                    >
                      <span className="font-semibold text-xs block">Weekends (2d)</span>
                      <span className="text-[11px] text-[#15130f]/50 dark:text-[#fbf8f1]/50 mt-0.5 block">
                        Sat & Sun only
                      </span>
                    </button>
                  </div>
                </div>

                {/* Day-of-Week Pills Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#15130f]/70 dark:text-[#fbf8f1]/70">
                    Active Days vs Rest Days (Tap to toggle):
                  </label>
                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {WEEKDAY_ORDER.map((item) => {
                      const isActive = selectedDays.includes(item.dayIndex);
                      return (
                        <button
                          key={item.dayIndex}
                          type="button"
                          onClick={() => handleToggleDay(item.dayIndex)}
                          className={`py-2 px-0.5 sm:p-3 rounded-xl sm:rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 sm:gap-1 min-w-0 ${
                            isActive
                              ? 'bg-[#ff5a1f] text-white border-[#ff5a1f] shadow-sm'
                              : 'bg-[#15130f]/5 dark:bg-[#fbf8f1]/5 border-dashed border-[#15130f]/20 dark:border-[#fbf8f1]/20 text-[#15130f]/50 dark:text-[#fbf8f1]/50 hover:bg-[#15130f]/10'
                          }`}
                        >
                          <span className="font-bold text-[11px] sm:text-sm">{item.label}</span>
                          <span className="text-[9px] sm:text-[10px] font-semibold opacity-90 truncate">
                            {isActive ? 'Active' : 'Rest'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Weekly Summary Strip */}
                <div className="rounded-2xl p-4 bg-[#15130f]/5 dark:bg-[#fbf8f1]/5 border border-[#15130f]/10 dark:border-[#fbf8f1]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {selectedDays.length} Active Days
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold">
                      <Coffee className="w-3.5 h-3.5" />
                      {7 - selectedDays.length} Rest Days
                    </span>
                  </div>

                  <span className="text-[#15130f]/60 dark:text-[#fbf8f1]/60 font-medium">
                    Monthly goal:{' '}
                    <strong className="text-[#15130f] dark:text-[#fbf8f1]">
                      {getActiveDaysCountInMonth(
                        today.getFullYear(),
                        today.getMonth(),
                        { type: cadenceType, daysOfWeek: selectedDays }
                      )}{' '}
                      checkmarks
                    </strong>{' '}
                    = 100% adherence
                  </span>
                </div>

                {/* Save Cadence Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveCadence}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-[#ff5a1f] hover:bg-[#e04a12] text-white flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.99]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Apply Cadence to {selectedHabit?.title}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
