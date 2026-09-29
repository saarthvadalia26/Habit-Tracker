'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, CalendarDays, AlertCircle } from 'lucide-react';
import { HabitWithLogs } from '@/types/database.types';
import { DayInfo, getLastNDays } from '@/lib/dateUtils';
import { HabitRow } from '@/components/HabitRow';
import { CreateHabitModal } from '@/components/CreateHabitModal';
import {
  createHabitAction,
  deleteHabitAction,
  toggleHabitLogAction,
} from '@/app/actions/habits';

interface HabitGridProps {
  initialHabits: HabitWithLogs[];
  isGuestMode?: boolean;
}

export function HabitGrid({
  initialHabits,
  isGuestMode = false,
}: HabitGridProps) {
  const [habits, setHabits] = useState<HabitWithLogs[]>(initialHabits);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Get the last 7 days window (X-axis)
  const days: DayInfo[] = getLastNDays(7);

  // Optimistic Toggle Handler
  const handleToggleCell = async (habitId: string, date: string) => {
    // 1. Find previous status
    const targetHabit = habits.find((h) => h.id === habitId);
    if (!targetHabit) return;

    const previousStatus = Boolean(targetHabit.logs[date]);
    const nextStatus = !previousStatus;

    // 2. Apply optimistic update immediately
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          return {
            ...h,
            logs: {
              ...h.logs,
              [date]: nextStatus,
            },
          };
        }
        return h;
      })
    );

    // 3. Dispatch to Server Action if authenticated
    if (isGuestMode) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await toggleHabitLogAction(habitId, date, nextStatus);
        if (response.error) {
          // Revert optimistic update on failure
          setHabits((prev) =>
            prev.map((h) => {
              if (h.id === habitId) {
                return {
                  ...h,
                  logs: {
                    ...h.logs,
                    [date]: previousStatus,
                  },
                };
              }
              return h;
            })
          );
          setErrorMessage(response.error);
        }
      } catch (err: unknown) {
        // Revert optimistic update
        setHabits((prev) =>
          prev.map((h) => {
            if (h.id === habitId) {
              return {
                ...h,
                logs: {
                  ...h.logs,
                  [date]: previousStatus,
                },
              };
            }
            return h;
          })
        );
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to update habit'
        );
      }
    });
  };

  // Create Habit Handler
  const handleCreateHabit = async (title: string, colorTheme: string) => {
    const res = await createHabitAction(title, colorTheme);
    if (res.error) {
      throw new Error(res.error);
    }
    if (res.data) {
      const newHabitWithLogs: HabitWithLogs = {
        ...res.data,
        logs: {},
      };
      setHabits((prev) => [...prev, newHabitWithLogs]);
    }
  };

  // Delete Habit Handler
  const handleDeleteHabit = async (habitId: string) => {
    // Optimistic removal
    const previousHabits = [...habits];
    setHabits((prev) => prev.filter((h) => h.id !== habitId));

    startTransition(async () => {
      const res = await deleteHabitAction(habitId);
      if (res.error) {
        // Rollback on error
        setHabits(previousHabits);
        setErrorMessage(res.error);
      }
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Alert toast for errors */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-rose-50/90 backdrop-blur-md border border-rose-200 text-rose-700 rounded-2xl flex items-center justify-between text-sm shadow-sm"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-800 font-semibold px-2 py-1"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid Card */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-antigravity border border-slate-100 relative">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                7-Day Activity Matrix
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                {habits.length} {habits.length === 1 ? 'Habit' : 'Habits'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Track and record your daily execution across the past 7 days.
            </p>
          </div>

          <motion.button
            type="button"
            onClick={() => setIsModalOpen(true)}
            whileHover={{ y: -3, scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-900/15 hover:bg-slate-800 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Habit</span>
          </motion.button>
        </div>

        {/* Date Headers (X-Axis) */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[220px]">
            <CalendarDays className="w-4 h-4" />
            <span>Habit Routine</span>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-1.5 sm:gap-2 overflow-x-auto py-1">
            {days.map((day) => (
              <div
                key={day.dateString}
                className={`w-11 sm:w-12 text-center flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all ${
                  day.isToday
                    ? 'bg-indigo-50/80 text-indigo-700 shadow-sm border border-indigo-100/80'
                    : 'text-slate-500'
                }`}
              >
                <span className="text-[11px] font-semibold tracking-wide uppercase">
                  {day.dayName}
                </span>
                <span className="text-sm font-bold mt-0.5">
                  {day.dayNumber}
                </span>
                {day.isToday && (
                  <span className="mt-1 text-[9px] font-extrabold uppercase tracking-tighter px-1.5 py-0.2 bg-indigo-600 text-white rounded-full">
                    Today
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Habits List (Y-Axis) */}
        <div className="mt-2 space-y-3">
          <AnimatePresence mode="popLayout">
            {habits.length > 0 ? (
              habits.map((habit) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  days={days}
                  onToggleCell={handleToggleCell}
                  onDeleteHabit={handleDeleteHabit}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="py-16 px-4 text-center rounded-3xl border-2 border-dashed border-slate-200/80 bg-white/40 flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-sm animate-float-slow">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  No habits configured yet
                </h3>
                <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
                  Create your first habit to begin building and tracking your daily consistency.
                </p>
                <motion.button
                  type="button"
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Create Habit</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal */}
      <CreateHabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateHabit}
      />
    </div>
  );
}
