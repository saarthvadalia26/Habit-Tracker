'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { getColorThemeByHex } from '@/lib/constants';

interface GridCellProps {
  habitId: string;
  date: string;
  isCompleted: boolean;
  colorTheme: string;
  isToday: boolean;
  onToggle: (habitId: string, date: string) => void;
}

export function GridCell({
  habitId,
  date,
  isCompleted,
  colorTheme,
  isToday,
  onToggle,
}: GridCellProps) {
  const [justToggled, setJustToggled] = useState(false);
  const theme = getColorThemeByHex(colorTheme);

  const handleClick = () => {
    setJustToggled(true);
    onToggle(habitId, date);
    setTimeout(() => setJustToggled(false), 800);
  };

  return (
    <div className="relative flex items-center justify-center p-1">
      <motion.button
        type="button"
        onClick={handleClick}
        whileHover={{
          y: -4,
          scale: 1.1,
          boxShadow: isCompleted
            ? `0 14px 28px -4px ${theme.shadowColor}, 0 6px 12px -2px ${theme.shadowColor}`
            : '0 10px 20px -3px rgba(15, 23, 42, 0.1)',
        }}
        whileTap={{
          scale: 0.88,
          y: 1,
        }}
        animate={
          justToggled && isCompleted
            ? {
                y: [0, -14, 0],
                scale: [0.9, 1.22, 1],
              }
            : {
                y: 0,
                scale: 1,
              }
        }
        transition={
          justToggled && isCompleted
            ? {
                duration: 0.5,
                ease: [0.175, 0.885, 0.32, 1.275],
              }
            : {
                type: 'spring',
                stiffness: 400,
                damping: 20,
              }
        }
        style={{
          backgroundColor: isCompleted ? theme.hex : 'transparent',
          borderColor: isCompleted ? theme.hex : isToday ? '#CBD5E1' : '#E2E8F0',
          boxShadow: isCompleted
            ? `0 10px 20px -3px ${theme.shadowColor}`
            : '0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        }}
        className={`group relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 ${
          !isCompleted
            ? 'bg-white/80 hover:bg-slate-50/90 hover:border-slate-300'
            : 'text-white'
        } ${isToday && !isCompleted ? 'ring-2 ring-indigo-200 ring-offset-1' : ''}`}
        aria-label={`Toggle habit for ${date}`}
      >
        {isCompleted ? (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 600,
              damping: 24,
            }}
          >
            <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.75] drop-shadow-sm" />
          </motion.div>
        ) : (
          <div
            style={{ backgroundColor: theme.hex }}
            className="w-2 h-2 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-200"
          />
        )}

        {/* Antigravity floating aura on completion */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0.8, scale: 0.9 }}
            animate={{ opacity: 0, scale: 1.6 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ backgroundColor: theme.hex }}
            className="absolute inset-0 rounded-2xl -z-10 pointer-events-none"
          />
        )}
      </motion.button>
    </div>
  );
}
