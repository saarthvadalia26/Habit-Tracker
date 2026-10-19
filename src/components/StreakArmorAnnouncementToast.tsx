'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, ShieldCheck, Shield } from 'lucide-react';
import { isDrop3Unlocked } from '@/config/releases';

interface StreakArmorAnnouncementToastProps {
  onOpenGuide: () => void;
  suppressed?: boolean;
}

export function StreakArmorAnnouncementToast({
  onOpenGuide,
  suppressed = false,
}: StreakArmorAnnouncementToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      if (!isDrop3Unlocked()) return;

      const dismissKey = 'ht_v2_streak_armor_announced_v1';
      const isDismissed = localStorage.getItem(dismissKey) === 'true';
      if (isDismissed) return;

      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1600);

      return () => clearTimeout(timer);
    } catch {}
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem('ht_v2_streak_armor_announced_v1', 'true');
    } catch {}
  };

  const handleOpen = () => {
    handleDismiss();
    onOpenGuide();
  };

  if (suppressed || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          aria-label="New feature announcement: Streak Armor & Rest Cadence"
          className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 max-w-xs sm:max-w-sm w-[calc(100%-2rem)] select-none font-archivo"
        >
          <div className="relative overflow-hidden rounded-[24px] bg-[#fbf8f1] dark:bg-[#1c1a16] border border-amber-500/25 dark:border-amber-500/30 shadow-2xl p-4 transition-all text-[#15130f] dark:text-[#fbf8f1]">
            {/* Top row */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>New Feature • Drop 3</span>
              </span>

              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss announcement"
                className="p-1 rounded-full text-[#15130f]/40 hover:text-[#15130f] dark:text-[#fbf8f1]/40 dark:hover:text-[#fbf8f1] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title & Description */}
            <div className="mb-3">
              <h4 className="font-clash font-semibold text-base tracking-tight text-[#15130f] dark:text-[#fbf8f1] flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Streak Armor & Rest Cadence</span>
              </h4>
              <p className="mt-1 text-xs text-[#15130f]/65 dark:text-[#fbf8f1]/65 leading-relaxed">
                Sick or traveling? Freeze yesterday or today with earned shields, or configure guilt-free rest days.
              </p>
            </div>

            {/* Action Row */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#15130f]/10 dark:border-[#fbf8f1]/10">
              <button
                type="button"
                onClick={handleDismiss}
                className="text-xs font-semibold text-[#15130f]/50 dark:text-[#fbf8f1]/50 hover:text-[#15130f] dark:hover:text-[#fbf8f1] px-2 py-1 transition-colors cursor-pointer"
              >
                Got it
              </button>

              <button
                type="button"
                onClick={handleOpen}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-[#ff5a1f] hover:bg-[#e04a12] shadow-sm transition-all cursor-pointer"
              >
                <span>How it works</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
