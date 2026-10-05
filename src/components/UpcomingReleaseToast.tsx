'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, ArrowRight, X, Flame } from 'lucide-react';
import { V2_DROPS, isDrop1Unlocked, getDrop1DaysRemaining } from '@/config/releases';

interface UpcomingReleaseToastProps {
  onOpenRoadmap: () => void;
  suppressed?: boolean;
}

const STORAGE_DISMISS_KEY = 'ht_v2_release_toast_dismissed_drop1';

export function UpcomingReleaseToast({
  onOpenRoadmap,
  suppressed = false,
}: UpcomingReleaseToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const spotlightDrop = V2_DROPS[0];
  const daysRemaining = getDrop1DaysRemaining();

  useEffect(() => {
    setIsUnlocked(isDrop1Unlocked());
  }, []);

  useEffect(() => {
    try {
      const isDismissed = localStorage.getItem(STORAGE_DISMISS_KEY) === 'true';
      if (isDismissed) return;

      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);

      return () => clearTimeout(timer);
    } catch {}
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(STORAGE_DISMISS_KEY, 'true');
    } catch {}
  };

  const handleOpen = () => {
    handleDismiss();
    onOpenRoadmap();
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
          aria-label="Upcoming release update notification"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 max-w-xs sm:max-w-sm w-[calc(100%-2rem)] select-none font-archivo"
        >
          {/* Framer Ivory Toast Card */}
          <div className="relative overflow-hidden rounded-[24px] bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/15 dark:border-[#fbf8f1]/15 shadow-2xl p-4 transition-all text-[#15130f] dark:text-[#fbf8f1]">
            {/* Top row */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold tracking-wider uppercase bg-[#ff5a1f]/10 text-[#ff5a1f]">
                  <span className="relative flex items-center justify-center w-2 h-2 shrink-0">
                    <span className="animate-ping absolute inset-0 rounded-full bg-[#ff5a1f] opacity-75" />
                    <span className="relative block w-2 h-2 rounded-full bg-[#ff5a1f]" />
                  </span>
                  v2.0 Drop 1 · Oct 10
                </span>

                <span className="text-[11px] font-semibold text-[#15130f]/50 dark:text-[#fbf8f1]/50 bg-[#f2ecdf] dark:bg-[#11100d] px-2 py-0.5 rounded-md">
                  {daysRemaining > 0 ? `${daysRemaining} days left` : 'Releasing now!'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss announcement"
                className="p-1 rounded-full text-[#15130f]/40 hover:text-[#15130f] dark:text-[#fbf8f1]/40 dark:hover:text-[#fbf8f1] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title & Tagline */}
            <div className="mb-3">
              <h4 className="font-clash font-semibold text-base tracking-tight text-[#15130f] dark:text-[#fbf8f1] flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#ff5a1f] shrink-0" />
                <span>{spotlightDrop?.title || 'Annual Master Heatmap'}</span>
              </h4>
              <p className="mt-1 text-xs text-[#15130f]/65 dark:text-[#fbf8f1]/65 leading-relaxed">
                {spotlightDrop?.tagline ||
                  'Panoramic 52-week annual heatmap & consistency tracking are arriving Oct 10.'}
              </p>
            </div>

            {/* Action Row */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#15130f]/10 dark:border-[#fbf8f1]/10">
              <button
                type="button"
                onClick={handleDismiss}
                className="text-xs font-semibold text-[#15130f]/50 dark:text-[#fbf8f1]/50 hover:text-[#15130f] dark:hover:text-[#fbf8f1] px-2 py-1 transition-colors cursor-pointer"
              >
                Maybe later
              </button>

              <button
                type="button"
                onClick={handleOpen}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-[#ff5a1f] hover:bg-[#e04a12] shadow-sm transition-all cursor-pointer"
              >
                <span>View 6 Drops</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
