'use client';

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
      <div className="w-[62px] h-[34px] rounded-full border-2 border-slate-700 bg-slate-950 p-[3px] opacity-60" />
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
      className={`relative w-[62px] h-[34px] [view-transition-name:theme-toggle] rounded-full border-2 p-[3px] flex items-center cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 transition-all duration-300 ease-out ${
        isDark
          ? 'bg-slate-950 border-indigo-400/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_0_12px_rgba(99,102,241,0.3)] ring-1 ring-indigo-400/30'
          : 'bg-slate-100 border-slate-300 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1),0_0_10px_rgba(0,0,0,0.05)]'
      }`}
    >
      {/* 100% GPU Compositor-accelerated sliding thumb: zero main-thread lag, fluid 60-120fps motion */}
      <div
        style={{
          transform: isDark ? 'translate3d(28px, 0, 0)' : 'translate3d(0px, 0, 0)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={`relative w-[24px] h-[24px] rounded-full flex items-center justify-center will-change-transform shadow-md transition-colors duration-300 ${
          isDark
            ? 'bg-white text-slate-950 shadow-[0_2px_6px_rgba(0,0,0,0.5),0_0_8px_rgba(255,255,255,0.4)]'
            : 'bg-slate-900 text-amber-300 shadow-[0_2px_6px_rgba(0,0,0,0.3)]'
        }`}
      >
        {/* Dark Mode: Moon Icon */}
        <div
          style={{
            opacity: isDark ? 1 : 0,
            transform: isDark ? 'scale(1) rotate(0deg)' : 'scale(0.3) rotate(70deg)',
            transition: 'opacity 0.28s ease, transform 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <Moon className="w-3.5 h-3.5 fill-slate-950 text-slate-950 stroke-[1.5]" />
        </div>

        {/* Light Mode: Sun Icon */}
        <div
          style={{
            opacity: isDark ? 0 : 1,
            transform: !isDark ? 'scale(1) rotate(0deg)' : 'scale(0.3) rotate(-70deg)',
            transition: 'opacity 0.28s ease, transform 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <Sun className="w-3.5 h-3.5 fill-amber-300 text-amber-300 stroke-[2.5]" />
        </div>
      </div>
    </button>
  );
}
