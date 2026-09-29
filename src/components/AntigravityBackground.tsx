'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

export function AntigravityBackground() {
  const { isDark } = useTheme();

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden -z-10 transition-colors duration-500 ${
        isDark ? 'bg-[#090D16]' : 'bg-[#F8FAFC]'
      }`}
    >
      {/* Floating Ambient Orbs with soft radiant glow */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute top-[5%] left-[8%] w-96 h-96 rounded-full blur-3xl transition-colors duration-500 ${
          isDark
            ? 'bg-gradient-to-tr from-indigo-900/25 via-purple-900/20 to-transparent'
            : 'bg-gradient-to-tr from-indigo-200/35 via-purple-200/25 to-transparent'
        }`}
      />

      <motion.div
        animate={{
          y: [0, 35, 0],
          x: [0, -25, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className={`absolute top-[35%] right-[5%] w-[450px] h-[450px] rounded-full blur-3xl transition-colors duration-500 ${
          isDark
            ? 'bg-gradient-to-bl from-rose-950/20 via-pink-900/15 to-transparent'
            : 'bg-gradient-to-bl from-rose-200/30 via-pink-200/20 to-transparent'
        }`}
      />

      <motion.div
        animate={{
          y: [0, -40, 0],
          x: [0, -15, 0],
          scale: [1, 1.12, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4,
        }}
        className={`absolute bottom-[5%] left-[20%] w-[420px] h-[420px] rounded-full blur-3xl transition-colors duration-500 ${
          isDark
            ? 'bg-gradient-to-tr from-cyan-950/25 via-emerald-950/20 to-transparent'
            : 'bg-gradient-to-tr from-emerald-200/30 via-cyan-200/20 to-transparent'
        }`}
      />

      {/* Subtle micro-dot matrix pattern */}
      <div
        className={`absolute inset-0 [background-size:36px_36px] transition-opacity duration-500 ${
          isDark
            ? 'bg-[radial-gradient(#334155_1px,transparent_1px)] opacity-25'
            : 'bg-[radial-gradient(#94A3B8_1px,transparent_1px)] opacity-20'
        }`}
      />
    </div>
  );
}
