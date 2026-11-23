'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plane,
  Calendar,
  CheckCircle2,
  Trash2,
  Shield,
  Clock,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { HabitWithLogs } from '@/types/database.types';
import { VacationPeriod } from '@/types/cadence.types';
import { formatDateToISO } from '@/lib/dateUtils';
import { toast } from 'sonner';

interface VacationModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: HabitWithLogs[];
  vacations: VacationPeriod[];
  onCreateVacation: (title: string, startDate: string, endDate: string, habitIds?: string[]) => Promise<void>;
  onDeleteVacation: (vacationId: string) => Promise<void>;
  isGuestMode?: boolean;
}

export function VacationModal({
  isOpen,
  onClose,
  habits,
  vacations,
  onCreateVacation,
  onDeleteVacation,
  isGuestMode = false,
}: VacationModalProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayStr = useMemo(() => formatDateToISO(today), [today]);

  const defaultEndStr = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 7);
    return formatDateToISO(d);
  }, [today]);

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultEndStr);
  const [scope, setScope] = useState<'all' | 'custom'>('all');
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Active vacation currently running today
  const activeVacation = useMemo(() => {
    return vacations.find((v) => todayStr >= v.startDate && todayStr <= v.endDate);
  }, [vacations, todayStr]);

  // Upcoming vacations starting after today
  const upcomingVacations = useMemo(() => {
    return vacations.filter((v) => v.startDate > todayStr);
  }, [vacations, todayStr]);

  // Past vacations ended before today
  const pastVacations = useMemo(() => {
    return vacations.filter((v) => v.endDate < todayStr);
  }, [vacations, todayStr]);

  // Duration in days
  const durationDays = useMemo(() => {
    try {
      const s = new Date(`${startDate}T00:00:00`).getTime();
      const e = new Date(`${endDate}T00:00:00`).getTime();
      const diff = Math.round((e - s) / 86400000) + 1;
      return diff > 0 ? diff : 0;
    } catch {
      return 0;
    }
  }, [startDate, endDate]);

  const handleApplyPreset = (days: number) => {
    const s = new Date(`${startDate}T00:00:00`);
    if (isNaN(s.getTime())) return;
    const e = new Date(s);
    e.setDate(e.getDate() + (days - 1));
    setEndDate(formatDateToISO(e));
  };

  const handleToggleHabitSelection = (habitId: string) => {
    setSelectedHabitIds((prev) =>
      prev.includes(habitId) ? prev.filter((id) => id !== habitId) : [...prev, habitId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      toast.error('Please enter a vacation title');
      return;
    }

    if (endDate < startDate) {
      toast.error('End date must be on or after start date');
      return;
    }

    setIsSubmitting(true);
    try {
      const targetHabitIds = scope === 'custom' ? selectedHabitIds : [];
      await onCreateVacation(cleanTitle, startDate, endDate, targetHabitIds);
      toast.success('Vacation Mode Scheduled ✈️', {
        description: `${cleanTitle} (${startDate} → ${endDate}) active. Streaks will stay preserved!`,
      });
      setTitle('');
      setStartDate(todayStr);
      setEndDate(defaultEndStr);
      setScope('all');
      setSelectedHabitIds([]);
    } catch {
      toast.error('Could not save vacation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, vacTitle: string) => {
    setDeletingId(id);
    try {
      await onDeleteVacation(id);
      toast.success('Vacation removed', {
        description: `${vacTitle} has been removed.`,
      });
    } catch {
      toast.error('Failed to remove vacation');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEndEarly = async (vacation: VacationPeriod) => {
    // If vacation started before today, update its end date to yesterday
    // If it started today, simply delete it
    if (vacation.startDate >= todayStr) {
      await handleDelete(vacation.id, vacation.title);
    } else {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDateToISO(yesterday);
      setDeletingId(vacation.id);
      try {
        await onDeleteVacation(vacation.id);
        await onCreateVacation(vacation.title, vacation.startDate, yesterdayStr, vacation.habitIds);
        toast.success('Vacation Ended Early', {
          description: 'Your habits and streaks have resumed for today!',
        });
      } catch {
        toast.error('Could not update vacation');
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vacation-modal-title"
        className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md overflow-y-auto font-archivo"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg rounded-[24px] sm:rounded-[28px] bg-[#fbf8f1] dark:bg-[#181612] border border-[#15130f]/15 dark:border-[#fbf8f1]/15 shadow-2xl text-[#15130f] dark:text-[#fbf8f1] max-h-[92vh] flex flex-col overflow-hidden my-auto"
        >
          {/* Header Banner */}
          <div className="relative p-4 sm:p-6 pb-3 sm:pb-4 border-b border-[#15130f]/10 dark:border-[#fbf8f1]/10 bg-linear-to-br from-amber-500/10 via-[#ff5a1f]/5 to-transparent shrink-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] sm:text-[11px] font-bold tracking-wider uppercase bg-[#ff5a1f]/15 text-[#ff5a1f] border border-[#ff5a1f]/20">
                <Plane className="w-3.5 h-3.5 text-[#ff5a1f] shrink-0" />
                Streak Pause & Recovery
              </span>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-[#15130f]/40 hover:text-[#15130f] dark:text-[#fbf8f1]/40 dark:hover:text-[#fbf8f1] hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3
              id="vacation-modal-title"
              className="font-clash font-semibold text-xl sm:text-[24px] tracking-tight leading-tight text-[#15130f] dark:text-[#fbf8f1]"
            >
              Vacation Mode & Streak Pause
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-[#15130f]/65 dark:text-[#fbf8f1]/65 leading-relaxed">
              Preserve your consistency while traveling or resting. Streaks remain frozen in place with 0 shields consumed.
            </p>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Active Vacation Banner (if currently on vacation) */}
            {activeVacation && (
              <div className="rounded-2xl p-4 bg-linear-to-r from-amber-500/15 via-[#ff5a1f]/10 to-transparent border border-[#ff5a1f]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ff5a1f]/15 text-[#ff5a1f] border border-[#ff5a1f]/25 flex items-center justify-center shrink-0">
                    <Plane className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-clash font-bold text-sm sm:text-base text-[#15130f] dark:text-[#fbf8f1]">
                        {activeVacation.title}
                      </span>
                      <span className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ff5a1f] text-white shadow-xs">
                        Active Now
                      </span>
                    </div>
                    <p className="text-xs text-[#15130f]/70 dark:text-[#fbf8f1]/70 mt-0.5">
                      {activeVacation.startDate} → {activeVacation.endDate} • 0 shields consumed
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleEndEarly(activeVacation)}
                  disabled={deletingId === activeVacation.id}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] hover:bg-[#ff5a1f] hover:text-white dark:hover:bg-[#ff5a1f] dark:hover:text-white transition-colors cursor-pointer shrink-0 disabled:opacity-50 shadow-xs"
                >
                  {deletingId === activeVacation.id ? 'Resuming...' : 'End Vacation Early'}
                </button>
              </div>
            )}

            {/* Reassurance Info Pill */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-[#15130f]/3 dark:bg-[#fbf8f1]/3 border border-[#15130f]/8 dark:border-[#fbf8f1]/8 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#ff5a1f]/15 text-[#ff5a1f] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-[#15130f] dark:text-[#fbf8f1]">Streaks Frozen</p>
                  <p className="text-[10px] text-[#15130f]/50 dark:text-[#fbf8f1]/50 truncate">0 reset penalties</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#15130f]/3 dark:bg-[#fbf8f1]/3 border border-[#15130f]/8 dark:border-[#fbf8f1]/8 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 fill-amber-500/20" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-[#15130f] dark:text-[#fbf8f1]">Shields Untouched</p>
                  <p className="text-[10px] text-[#15130f]/50 dark:text-[#fbf8f1]/50 truncate">Preserves your 5 bank</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#15130f]/3 dark:bg-[#fbf8f1]/3 border border-[#15130f]/8 dark:border-[#fbf8f1]/8 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#ff5a1f]/15 text-[#ff5a1f] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-[#15130f] dark:text-[#fbf8f1]">Auto-Resume</p>
                  <p className="text-[10px] text-[#15130f]/50 dark:text-[#fbf8f1]/50 truncate">Picks up seamlessly</p>
                </div>
              </div>
            </div>

            {/* Schedule Vacation Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-5 rounded-2xl bg-[#15130f]/3 dark:bg-[#fbf8f1]/3 border border-[#15130f]/10 dark:border-[#fbf8f1]/10 space-y-3.5">
              <h4 className="font-clash font-semibold text-sm flex items-center justify-between">
                <span className="text-[#15130f] dark:text-[#fbf8f1]">Schedule a Vacation</span>
                {durationDays > 0 && (
                  <span className="text-[11px] font-medium text-[#ff5a1f]">
                    {durationDays} {durationDays === 1 ? 'day' : 'days'} duration
                  </span>
                )}
              </h4>

              {/* Vacation Title */}
              <div className="flex flex-col gap-1">
                <label className="text-[10.5px] font-semibold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                  Trip / Vacation Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Beach Holiday, Japan Trip, Sabbatical"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  className="w-full px-3 py-2 rounded-xl bg-[#15130f]/5 dark:bg-[#fbf8f1]/5 border border-[#15130f]/15 dark:border-[#fbf8f1]/15 text-xs font-medium focus:outline-hidden focus:border-[#ff5a1f] transition-colors"
                />
              </div>

              {/* Date Pickers */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#15130f]/5 dark:bg-[#fbf8f1]/5 border border-[#15130f]/15 dark:border-[#fbf8f1]/15 text-xs font-medium focus:outline-hidden focus:border-[#ff5a1f]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                    Return Date
                  </label>
                  <input
                    type="date"
                    required
                    min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#15130f]/5 dark:bg-[#fbf8f1]/5 border border-[#15130f]/15 dark:border-[#fbf8f1]/15 text-xs font-medium focus:outline-hidden focus:border-[#ff5a1f]"
                  />
                </div>
              </div>

              {/* Quick Duration Presets */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] font-semibold text-[#15130f]/50 dark:text-[#fbf8f1]/50 mr-1">
                  Presets:
                </span>
                {[
                  { label: 'Weekend (3d)', days: 3 },
                  { label: '1 Week (7d)', days: 7 },
                  { label: '2 Weeks (14d)', days: 14 },
                  { label: '1 Month (30d)', days: 30 },
                ].map((p) => (
                  <button
                    key={p.days}
                    type="button"
                    onClick={() => handleApplyPreset(p.days)}
                    className="px-2.5 py-1 rounded-lg text-[10.5px] font-semibold bg-[#15130f]/5 dark:bg-[#fbf8f1]/5 border border-[#15130f]/10 dark:border-[#fbf8f1]/10 hover:border-[#ff5a1f]/50 hover:bg-[#ff5a1f]/10 hover:text-[#ff5a1f] transition-all cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Habit Scope Selector */}
              <div className="flex flex-col gap-1.5 pt-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                  Applies To
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setScope('all')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      scope === 'all'
                        ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] border-transparent shadow-xs'
                        : 'bg-[#15130f]/5 dark:bg-[#fbf8f1]/5 border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-[#15130f]/70 dark:text-[#fbf8f1]/70 hover:bg-[#15130f]/10'
                    }`}
                  >
                    All Habits ({habits.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setScope('custom')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      scope === 'custom'
                        ? 'bg-[#ff5a1f] text-white border-transparent shadow-xs'
                        : 'bg-[#15130f]/5 dark:bg-[#fbf8f1]/5 border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-[#15130f]/70 dark:text-[#fbf8f1]/70 hover:bg-[#15130f]/10'
                    }`}
                  >
                    Specific Habits only
                  </button>
                </div>

                {scope === 'custom' && (
                  <div className="mt-1.5 max-h-36 overflow-y-auto space-y-1 p-2 rounded-xl bg-[#15130f]/5 dark:bg-[#fbf8f1]/5 border border-[#15130f]/10 dark:border-[#fbf8f1]/10">
                    {habits.map((h) => {
                      const isSelected = selectedHabitIds.includes(h.id);
                      return (
                        <label
                          key={h.id}
                          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/5 cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleHabitSelection(h.id)}
                            className="rounded border-[#15130f]/30 text-[#ff5a1f] focus:ring-[#ff5a1f]"
                          />
                          <span className="truncate">{h.title}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 sm:py-3 rounded-full bg-[#ff5a1f] hover:bg-[#e04a12] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plane className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving Vacation...' : 'Activate Vacation Mode'}</span>
              </button>
            </form>

            {/* List of Scheduled / Past Vacations */}
            {vacations.length > 0 && (
              <div className="space-y-2 pt-1">
                <h4 className="font-clash font-semibold text-xs uppercase tracking-wider text-[#15130f]/50 dark:text-[#fbf8f1]/50 px-1">
                  Scheduled & Past Vacations ({vacations.length})
                </h4>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                  {vacations.map((v) => {
                    const isActive = todayStr >= v.startDate && todayStr <= v.endDate;
                    const isPast = todayStr > v.endDate;
                    return (
                      <div
                        key={v.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                          isActive
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : isPast
                            ? 'bg-[#15130f]/2 dark:bg-[#fbf8f1]/2 border-[#15130f]/5 dark:border-[#fbf8f1]/5 opacity-60'
                            : 'bg-[#15130f]/3 dark:bg-[#fbf8f1]/3 border-[#15130f]/10 dark:border-[#fbf8f1]/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isActive
                              ? 'bg-[#ff5a1f]/15 text-[#ff5a1f]'
                              : 'bg-[#15130f]/5 dark:bg-[#fbf8f1]/5 text-[#15130f]/60 dark:text-[#fbf8f1]/60'
                          }`}>
                            <Plane className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate text-[#15130f] dark:text-[#fbf8f1]">
                              {v.title}
                            </p>
                            <p className="text-[10.5px] text-[#15130f]/60 dark:text-[#fbf8f1]/60 truncate">
                              {v.startDate} → {v.endDate}
                              {v.habitIds && v.habitIds.length > 0
                                ? ` • ${v.habitIds.length} habits`
                                : ' • All habits'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isActive && (
                            <span className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                              Active
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(v.id, v.title)}
                            disabled={deletingId === v.id}
                            title="Remove vacation"
                            className="p-1.5 rounded-lg text-rose-500/70 hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
