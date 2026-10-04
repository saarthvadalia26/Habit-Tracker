'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, ArrowRight, X } from 'lucide-react';
import { V2_DROPS } from '@/config/releases';

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
  const spotlightDrop = V2_DROPS[0];

  // Calculate days remaining dynamically until Drop 1 (October 10, 2026)
  const daysRemaining = (() => {
    try {
      const target = new Date('2026-10-10T00:00:00');
      const now = new Date();
      const diffMs = target.getTime() - now.getTime();
      return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    } catch {
      return 6;
    }
  })();

  useEffect(() => {
    try {
      // If user already dismissed this release announcement, don't show it again
      const isDismissed = localStorage.getItem(STORAGE_DISMISS_KEY) === 'true';
      if (isDismissed) return;

      // Clean up any legacy or session-blocking keys
      localStorage.removeItem('ht_seen_v2_roadmap_v1');
      sessionStorage.removeItem('ht_show_v2_roadmap');
      sessionStorage.removeItem('ht_v2_roadmap_dismissed');

      // Non-intrusive 1.5s delay to let the user see their habits first without feeling ambushed
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);

      return () => clearTimeout(timer);
    } catch {
      // Safe fallback if storage is restricted
    }
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
          initial={{ opacity: 0, y: 35, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 25, scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          aria-label="Upcoming release update notification"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 max-w-sm sm:max-w-md w-[calc(100%-2rem)] select-none"
        >
          {/* Frosted Glass Card with Gradient Accent */}
          <div className="relative group overflow-hidden rounded-2xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-2xl dark:shadow-indigo-950/40 p-4 transition-all duration-200">
            {/* Ambient Background Glow */}
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-gradient-to-br from-indigo-500/15 via-cyan-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500 opacity-80" />

            {/* Top row: Status Tag, Countdown Pill, Close Button */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20">
                  <span className="relative flex items-center justify-center w-2 h-2 shrink-0">
                    <span className="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-75 pointer-events-none" />
                    <span className="relative block w-2 h-2 rounded-full bg-emerald-500" />
                  </span>
                  v2.0 Drop 1 · Oct 10
                </span>

                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">
                  <CalendarDays className="w-3 h-3 text-cyan-500" />
                  {daysRemaining > 0 ? `${daysRemaining} days left` : 'Releasing today!'}
                </span>
              </div>

              {/* Dismiss X button */}
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss announcement"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main content teaser */}
            <div className="mb-3.5 pr-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                <span>{spotlightDrop?.title || '365-Day Master Heatmap'}</span>
              </h4>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                {spotlightDrop?.tagline ||
                  'Panoramic 52-week visual matrix & annual streak tracking are arriving Oct 10.'}
              </p>
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={handleDismiss}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Maybe later
              </button>

              <button
                type="button"
                onClick={handleOpen}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Explore What&apos;s Coming</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
