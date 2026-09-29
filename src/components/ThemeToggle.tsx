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
    // Avoid hydration layout shift
    return (
      <div className="w-[62px] h-[32px] rounded-full border-[2.5px] border-slate-700 bg-slate-900/60 p-[3px] opacity-60" />
    );
  }

  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      onClick={toggleTheme}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className={`relative w-[62px] h-[32px] rounded-full border-[2.5px] p-[2px] flex items-center cursor-pointer transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
        isDark
          ? 'bg-slate-950 border-slate-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]'
          : 'bg-white border-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]'
      }`}
    >
      {/* Gliding animated circular thumb matching user's reference pill switch */}
      <motion.div
        animate={{
          x: isDark ? 29 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 28,
        }}
        className={`w-[22px] h-[22px] rounded-full flex items-center justify-center transition-colors duration-300 shadow-md ${
          isDark
            ? 'bg-white text-slate-950 shadow-[0_0_12px_rgba(255,255,255,0.4)]'
            : 'bg-slate-900 text-amber-300 shadow-[0_2px_6px_rgba(0,0,0,0.3)]'
        }`}
      >
        <motion.div
          key={isDark ? 'dark-icon' : 'light-icon'}
          initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <Moon className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
          ) : (
            <Sun className="w-3.5 h-3.5 fill-amber-300 text-amber-300 stroke-[2.5]" />
          )}
        </motion.div>
      </motion.div>
    </motion.button>
  );
}
