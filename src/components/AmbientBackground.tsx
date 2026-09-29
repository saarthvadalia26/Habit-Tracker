'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

export function AmbientBackground() {
  const { isDark } = useTheme();

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden -z-10 transition-colors duration-300 ease-out ${
        isDark ? 'bg-[#090D16]' : 'bg-[#F8FAFC]'
      }`}
    >
      {/* Dark Ambient Layer - Opacity crossfade avoids heavy CPU gradient repainting */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-400 ease-out ${
          isDark ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <motion.div
          animate={{
            y: [0, -25, 0],
            x: [0, 15, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-[5%] left-[8%] w-96 h-96 rounded-full blur-3xl bg-gradient-to-tr from-indigo-900/30 via-purple-900/20 to-transparent will-change-transform"
        />

        <motion.div
          animate={{
            y: [0, 25, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          className="absolute top-[35%] right-[5%] w-[420px] h-[420px] rounded-full blur-3xl bg-gradient-to-bl from-rose-950/25 via-pink-900/15 to-transparent will-change-transform"
        />

        <motion.div
          animate={{
            y: [0, -30, 0],
            x: [0, -12, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 4,
          }}
          className="absolute bottom-[5%] left-[20%] w-[400px] h-[400px] rounded-full blur-3xl bg-gradient-to-tr from-cyan-950/30 via-emerald-950/20 to-transparent will-change-transform"
        />
      </div>

      {/* Light Ambient Layer */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-400 ease-out ${
          !isDark ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <motion.div
          animate={{
            y: [0, -25, 0],
            x: [0, 15, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-[5%] left-[8%] w-96 h-96 rounded-full blur-3xl bg-gradient-to-tr from-indigo-200/40 via-purple-200/25 to-transparent will-change-transform"
        />

        <motion.div
          animate={{
            y: [0, 25, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          className="absolute top-[35%] right-[5%] w-[420px] h-[420px] rounded-full blur-3xl bg-gradient-to-bl from-rose-200/35 via-pink-200/25 to-transparent will-change-transform"
        />

        <motion.div
          animate={{
            y: [0, -30, 0],
            x: [0, -12, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 4,
          }}
          className="absolute bottom-[5%] left-[20%] w-[400px] h-[400px] rounded-full blur-3xl bg-gradient-to-tr from-emerald-200/35 via-cyan-200/25 to-transparent will-change-transform"
        />
      </div>

      {/* Subtle micro-dot matrix pattern */}
      <div
        className={`absolute inset-0 [background-size:36px_36px] transition-opacity duration-300 ${
          isDark
            ? 'bg-[radial-gradient(#334155_1px,transparent_1px)] opacity-25'
            : 'bg-[radial-gradient(#94A3B8_1px,transparent_1px)] opacity-20'
        }`}
      />
    </div>
  );
}
