'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { HabitWithLogs } from '@/types/database.types';

interface DeleteHabitModalProps {
  isOpen: boolean;
  habit: HabitWithLogs | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export function DeleteHabitModal({
  isOpen,
  habit,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteHabitModalProps) {
  if (!isOpen || !habit) return null;

  const rawTitle = habit.title || 'Untitled Habit';
  const displayTitle = rawTitle.includes('|') ? rawTitle.split('|')[0].trim() : rawTitle;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md rounded-3xl bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/15 dark:border-[#fbf8f1]/15 shadow-2xl p-6 text-[#15130f] dark:text-[#fbf8f1] font-archivo overflow-hidden my-auto"
        >
          {/* Header Icon + Title */}
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/25">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-clash font-bold text-xl leading-tight">
                Delete Habit?
              </h3>
              <p className="text-xs text-[#15130f]/60 dark:text-[#fbf8f1]/60 mt-0.5">
                This action is permanent and cannot be undone.
              </p>
            </div>
          </div>

          {/* Habit Details Card */}
          <div className="p-3.5 rounded-2xl bg-[#15130f]/5 dark:bg-[#fbf8f1]/5 border border-[#15130f]/10 dark:border-[#fbf8f1]/10 mb-4 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#15130f] dark:text-[#fbf8f1]">
                {displayTitle}
              </span>
              {habit.currentStreak !== undefined && habit.currentStreak > 0 && (
                <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-[#ff5a1f]/15 text-[#ff5a1f]">
                  {habit.currentStreak}d streak
                </span>
              )}
            </div>
            <p className="text-[11.5px] text-[#15130f]/60 dark:text-[#fbf8f1]/60 leading-relaxed">
              All history, completion logs, and streak armor for this habit will be permanently deleted.
            </p>
          </div>

          {/* Routine Chaining Alert */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11.5px] text-amber-700 dark:text-amber-400 mb-5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              If other habits were chained after this one, they will safely convert into standalone habits without broken links.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-full text-xs font-semibold border border-[#15130f]/15 dark:border-[#fbf8f1]/15 text-[#15130f] dark:text-[#fbf8f1] hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/5 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 active:scale-98"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Habit</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

