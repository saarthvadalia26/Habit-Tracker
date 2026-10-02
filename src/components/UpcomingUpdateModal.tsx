'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  ShieldCheck,
  Share2,
  Layers,
  WifiOff,
  CalendarDays,
  Target,
  Flame,
  Quote,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface UpcomingUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeatureDrop {
  id: string;
  icon: typeof ShieldCheck;
  badge: string;
  badgeClass: string;
  title: string;
  description: string;
}

const UPCOMING_DROPS: FeatureDrop[] = [
  {
    id: 'streak-armor',
    icon: ShieldCheck,
    badge: '⚡ IN THE LAB',
    badgeClass:
      'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    title: 'Streak Armor & Rest Cadence',
    description:
      'Never lose a 60-day flame to an emergency again. Automatic streak shields, recovery days, and flexible 3x/week gym schedules with zero guilt.',
  },
  {
    id: 'flex-cards',
    icon: Share2,
    badge: '🎨 TESTING',
    badgeClass:
      'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
    title: 'Aesthetic Milestone Flex Cards',
    description:
      'Turn your 75-Hard milestones and 100-day streaks into bespoke 9:16 Instagram Story & X graphics with 1 tap. Let your proof speak for itself.',
  },
  {
    id: 'habit-stacking',
    icon: Layers,
    badge: '🔬 ARCHITECTURE',
    badgeClass:
      'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    title: 'Habit Stacking & Dayflows',
    description:
      'Categorize habits into Morning Anchors, Afternoon Focus Sprints, and Evening Wind-Downs to eliminate choice fatigue.',
  },
  {
    id: 'offline-sync',
    icon: WifiOff,
    badge: '📡 ENGINE',
    badgeClass:
      'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    title: 'Offline-First Engine & Cloud Sync',
    description:
      'Track habits on airplanes, remote trails, or spotty networks. 100% offline habit logging that automatically syncs to your account when reconnected.',
  },
  {
    id: 'heatmap-365',
    icon: CalendarDays,
    badge: '📊 VISUALS',
    badgeClass:
      'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    title: '365-Day Master Heatmap',
    description:
      'A bird\'s-eye GitHub-style contribution matrix visualizing your entire year of consistency, momentum streaks, and annual adherence.',
  },
  {
    id: 'numeric-goals',
    icon: Target,
    badge: '🎯 METRICS',
    badgeClass:
      'text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20',
    title: 'Target & Numeric Goals',
    description:
      'Track quantitative milestones beyond binary checkmarks—log 3,000ml of water, 25 pages read, or 45-minute workouts with in-cell steppers.',
  },
];

export function UpcomingUpdateModal({ isOpen, onClose }: UpcomingUpdateModalProps) {
  const [hypedFeatures, setHypedFeatures] = useState<Record<string, boolean>>({});

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Load existing user reactions from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ht_v2_hyped_features');
      if (saved) {
        setHypedFeatures(JSON.parse(saved));
      }
    } catch {
      // Safe fallback
    }
  }, []);

  const handleToggleHype = (featureId: string) => {
    setHypedFeatures((prev) => {
      const updated = { ...prev, [featureId]: !prev[featureId] };
      try {
        localStorage.setItem('ht_v2_hyped_features', JSON.stringify(updated));
      } catch {
        // Safe fallback
      }
      return updated;
    });
  };

  const handleLockIn = () => {
    try {
      localStorage.setItem('ht_seen_v2_roadmap_v1', 'true');
    } catch {
      // Safe fallback
    }

    try {
      confetti({
        particleCount: 60,
        spread: 65,
        origin: { y: 0.65 },
        colors: ['#F59E0B', '#6366F1', '#EC4899', '#10B981'],
      });
    } catch {
      // Safe fallback
    }

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-roadmap-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden z-10 my-auto"
          >
            {/* Soft Centered Ambient Radial Glow (blur-3xl eliminates harsh cutoffs) */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 sm:w-96 h-48 bg-indigo-500/10 dark:bg-indigo-600/15 pointer-events-none blur-3xl rounded-full" />

            {/* Header */}
            <div className="relative p-5 sm:p-6 pb-4 border-b border-slate-200/90 dark:border-slate-800/90">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>SNEAK PEEK • WHAT&apos;S NEXT</span>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h2
                id="modal-roadmap-title"
                className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-3 font-mono"
              >
                Engineered for Daily Mastery.
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-sans">
                A preview of the next major release designed to refine your focus and elevate your daily tracking.
              </p>
            </div>

            {/* Scrollable Content */}
            <div className="relative p-4 sm:p-6 space-y-3.5 overflow-y-auto max-h-[50vh] sm:max-h-[54vh] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              {UPCOMING_DROPS.map((drop) => {
                const Icon = drop.icon;
                const isHyped = !!hypedFeatures[drop.id];

                return (
                  <motion.div
                    key={drop.id}
                    whileHover={{ y: -1 }}
                    className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/70 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0 shadow-xs">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                          {drop.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${drop.badgeClass}`}
                        >
                          {drop.badge}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleHype(drop.id)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                            isHyped
                              ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold shadow-xs'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                          title="Vote if you want this feature first"
                        >
                          <Flame
                            className={`w-3 h-3 ${
                              isHyped
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-slate-400'
                            }`}
                          />
                          <span>{isHyped ? 'Hyped!' : 'Want this'}</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans pl-10">
                      {drop.description}
                    </p>
                  </motion.div>
                );
              })}

              {/* Discipline Quote Footer Card */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-amber-500/10 border border-indigo-500/20 dark:border-indigo-500/30 flex items-start gap-3">
                <Quote className="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm italic font-medium text-slate-800 dark:text-slate-200 leading-snug">
                    &ldquo;You do not rise to the level of your goals. You fall to the level of your systems.&rdquo;
                  </p>
                  <p className="text-[11px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                    &mdash; James Clear, Atomic Habits
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 sm:p-5 pt-3 border-t border-slate-200/90 dark:border-slate-800/90 bg-slate-50/80 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
                Updates will roll out automatically with zero downtime.
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLockIn}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-mono font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Lock In &amp; Crush Today</span>
                <span className="text-amber-300">⚡</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
