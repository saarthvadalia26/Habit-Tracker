'use client';

import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { HabitWithLogs } from '@/types/database.types';
import { DayInfo } from '@/lib/dateUtils';
import { GridCell } from '@/components/GridCell';
import { getColorThemeByHex } from '@/lib/constants';
import { useState } from 'react';

import { toast } from 'sonner';

interface HabitRowProps {
  habit: HabitWithLogs;
  days: DayInfo[];
  onToggleCell: (habitId: string, date: string) => void;
  onDeleteHabit: (habitId: string) => void;
}

export function HabitRow({
  habit,
  days,
  onToggleCell,
  onDeleteHabit,
}: HabitRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const theme = getColorThemeByHex(habit.color_theme);

  // Calculate local completion count in the 7-day window
  const completedInWindow = days.filter((d) => habit.logs[d.dateString]).length;

  const handleDelete = () => {
    toast.error(`Delete "${habit.title}"?`, {
      description: 'All logs and tracking data for this habit will be removed.',
      action: {
        label: 'Delete',
        onClick: () => {
          setIsDeleting(true);
          onDeleteHabit(habit.id);
          toast.success(`"${habit.title}" removed`);
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -15 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
      whileHover={{ y: -2 }}
      className="group relative bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-100/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      {/* Left side: Habit info */}
      <div className="flex items-center justify-between md:justify-start gap-3.5 min-w-[220px] max-w-sm">
        <div className="flex items-center gap-3">
          {/* Color theme indicator badge */}
          <div
            style={{
              backgroundColor: theme.hex,
              boxShadow: `0 4px 12px ${theme.shadowColor}`,
            }}
            className="w-3.5 h-3.5 rounded-full shrink-0 animate-pulse"
          />

          <div>
            <h4 className="text-base font-semibold text-slate-800 tracking-tight group-hover:text-slate-900 transition-colors">
              {habit.title}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-400 font-medium">
                {completedInWindow} of {days.length} this week
              </span>
            </div>
          </div>
        </div>

        {/* Delete button */}
        <motion.button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className="opacity-40 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition-all duration-200"
          aria-label={`Delete ${habit.title}`}
          title="Delete habit"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Right side: 7-day Interactive Grid Cells */}
      <div className="flex items-center justify-between md:justify-end gap-1.5 sm:gap-2 overflow-x-auto py-1">
        {days.map((day) => {
          const isCompleted = Boolean(habit.logs[day.dateString]);
          return (
            <GridCell
              key={`${habit.id}-${day.dateString}`}
              habitId={habit.id}
              date={day.dateString}
              isCompleted={isCompleted}
              colorTheme={habit.color_theme}
              isToday={day.isToday}
              onToggle={onToggleCell}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
