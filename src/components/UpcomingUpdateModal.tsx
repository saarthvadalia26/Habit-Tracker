'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  Target,
  ShieldCheck,
  Layers,
  Share2,
  WifiOff,
  Flame,
  CheckCircle2,
  X,
  Sparkles,
  Clock,
  Layers3,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { V2_DROPS, V2_RELEASE_INFO, type V2Drop } from '@/config/releases';

interface UpcomingUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DROP_ICONS: Record<string, React.ElementType> = {
  'heatmap-365': CalendarDays,
  'numeric-goals': Target,
  'streak-armor': ShieldCheck,
  'habit-stacking': Layers,
  'flex-cards': Share2,
  'offline-sync': WifiOff,
};

export function UpcomingUpdateModal({ isOpen, onClose }: UpcomingUpdateModalProps) {
  const [hypedFeatures, setHypedFeatures] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'all' | 'spotlight'>('all');

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

  const handleConfirm = () => {
    try {
      localStorage.setItem('ht_seen_v2_roadmap_v1', 'true');
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#06B6D4', '#6366F1', '#EC4899', '#F59E0B'],
      });
    } catch {
      // Safe fallback
    }

    onClose();
  };

  const spotlightDrop = V2_DROPS[0]; // Drop 1: 365 Heatmap
  const futureDrops = V2_DROPS.slice(1);

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
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden z-10 my-auto"
          >
            {/* Ambient Cyan/Indigo Radial Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-r from-cyan-500/15 via-indigo-500/15 to-purple-500/10 pointer-events-none blur-3xl rounded-full" />

            {/* Header */}
            <div className="relative p-5 sm:p-6 pb-4 border-b border-slate-200/90 dark:border-slate-800/90">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-[11px] font-mono font-semibold text-slate-800 dark:text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                  <span className="w-2 h-2 -ml-3 rounded-full bg-cyan-500" />
                  <span className="tracking-wide">v2.0 ROADMAP • 6 STAGED DROPS</span>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2
                    id="modal-roadmap-title"
                    className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white font-mono flex items-center gap-2"
                  >
                    <span>The v2.0 Release Radar</span>
                    <Sparkles className="w-4 h-4 text-cyan-500 hidden sm:inline" />
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 font-sans">
                    Rolling out 6 dedicated updates one by one. Here is what is arriving next.
                  </p>
                </div>

                {/* Quick Segment Filter */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 self-start sm:self-auto border border-slate-200/60 dark:border-slate-700/60">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg transition-all ${
                      activeTab === 'all'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    All 6 Drops
                  </button>
                  <button
                    onClick={() => setActiveTab('spotlight')}
                    className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg transition-all ${
                      activeTab === 'spotlight'
                        ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Next Drop Only
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="relative p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[52vh] sm:max-h-[56vh] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              {/* SPOTLIGHT HERO CARD: DROP 1 OF 6 */}
              <div className="relative rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-purple-500/10 border-2 border-cyan-500/40 dark:border-cyan-500/50 shadow-md">
                {/* Header ribbon */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                      {spotlightDrop.versionBadge}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                      {spotlightDrop.category}
                    </span>
                  </div>

                  {/* Target Date Pill */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-600 text-white shadow-xs font-mono font-bold text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
                    <span>Launching 10th October 2026</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 dark:bg-cyan-500/30 border border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-300 shrink-0 shadow-xs">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono tracking-tight">
                      {spotlightDrop.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-sans leading-relaxed">
                      {spotlightDrop.description}
                    </p>
                  </div>
                </div>

                {/* Features Checklist */}
                <div className="mt-4 pt-3.5 border-t border-cyan-500/20 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {spotlightDrop.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300 font-sans leading-snug">
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Hype Vote button for Drop 1 */}
                <div className="mt-4 pt-3 border-t border-cyan-500/20 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-cyan-800 dark:text-cyan-300 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    Drop 1 of 6 • Currently in final testing
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleHype(spotlightDrop.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      hypedFeatures[spotlightDrop.id]
                        ? 'bg-cyan-500 text-white border-cyan-600 shadow-xs'
                        : 'bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-cyan-400'
                    }`}
                  >
                    <Flame
                      className={`w-3.5 h-3.5 ${
                        hypedFeatures[spotlightDrop.id]
                          ? 'text-white fill-white'
                          : 'text-amber-500'
                      }`}
                    />
                    <span>{hypedFeatures[spotlightDrop.id] ? 'Hyped for Oct 10!' : 'I want this!'}</span>
                  </button>
                </div>
              </div>

              {/* UPCOMING PIPELINE: DROPS 2 THROUGH 6 */}
              {activeTab === 'all' && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Layers3 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Remaining v2.0 Drops in Queue</span>
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                      Drops 2 &ndash; 6
                    </span>
                  </div>

                  {futureDrops.map((drop: V2Drop) => {
                    const Icon = DROP_ICONS[drop.id] || Sparkles;
                    const isHyped = !!hypedFeatures[drop.id];

                    return (
                      <motion.div
                        key={drop.id}
                        whileHover={{ y: -1 }}
                        className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/70 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0 shadow-xs">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                  {drop.versionBadge}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  &bull; {drop.targetDate}
                                </span>
                              </div>
                              <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white font-mono truncate">
                                {drop.title}
                              </h5>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleHype(drop.id)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all cursor-pointer border shrink-0 ${
                                isHyped
                                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold shadow-xs'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                              }`}
                              title="Vote if you want this prioritized"
                            >
                              <Flame
                                className={`w-3 h-3 ${
                                  isHyped
                                    ? 'text-amber-500 fill-amber-500'
                                    : 'text-slate-400'
                                }`}
                              />
                              <span>{isHyped ? 'Hyped!' : 'Vote'}</span>
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans pl-10">
                          {drop.tagline}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 sm:p-5 pt-3 border-t border-slate-200/90 dark:border-slate-800/90 bg-slate-50/80 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left font-sans">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {V2_RELEASE_INFO.title}:
                </span>{' '}
                Zero-downtime, non-breaking rollout.
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Ready for Drop 1 (Oct 10)</span>
                <span className="text-cyan-200">🚀</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
