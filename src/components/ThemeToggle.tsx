'use client';

import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-[60px] h-[32px] rounded-full border-2 border-slate-700 bg-slate-900/60 p-[3px] opacity-60" />
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      onClick={toggleTheme}
      className={`relative w-[60px] h-[32px] rounded-full border-2 p-[3px] flex items-center cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 transition-colors duration-500 ease-out ${
        isDark
          ? 'bg-slate-950 border-slate-600/90 shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),0_0_12px_rgba(99,102,241,0.2)]'
          : 'bg-slate-100 border-slate-300 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]'
      }`}
    >
      {/* Silky smooth gliding thumb with fluid, weighted spring physics (never snappy or jarring) */}
      <motion.div
        animate={{
          x: isDark ? 28 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 190,
          damping: 19,
          mass: 0.8,
        }}
        className={`relative w-[22px] h-[22px] rounded-full flex items-center justify-center will-change-transform transform-gpu shadow-md transition-colors duration-400 ${
          isDark
            ? 'bg-white text-slate-950 shadow-[0_2px_8px_rgba(0,0,0,0.4),0_0_10px_rgba(255,255,255,0.3)]'
            : 'bg-slate-900 text-amber-300 shadow-[0_2px_6px_rgba(0,0,0,0.3)]'
        }`}
      >
        {/* Dark Mode: Moon Icon with smooth rotation & crossfade */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={false}
          animate={{
            opacity: isDark ? 1 : 0,
            rotate: isDark ? 0 : 70,
            scale: isDark ? 1 : 0.4,
          }}
          transition={{
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <Moon className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
        </motion.div>

        {/* Light Mode: Sun Icon with smooth rotation & crossfade */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={false}
          animate={{
            opacity: isDark ? 0 : 1,
            rotate: isDark ? -70 : 0,
            scale: isDark ? 0.4 : 1,
          }}
          transition={{
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <Sun className="w-3.5 h-3.5 fill-amber-300 text-amber-300 stroke-[2.5]" />
        </motion.div>
      </motion.div>
    </button>
  );
}
