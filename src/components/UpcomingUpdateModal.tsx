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
  Clock,
  ArrowRight,
  Heart,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  V2_DROPS,
  V2_RELEASE_INFO,
  type V2Drop,
  isDrop1Unlocked,
  getDrop1DaysRemaining,
} from '@/config/releases';

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
  const [isUnlocked, setIsUnlocked] = useState(false);
  const daysRemaining = getDrop1DaysRemaining();

  useEffect(() => {
    setIsUnlocked(isDrop1Unlocked());
  }, []);

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

  // Load user hype reactions
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ht_v2_hyped_features');
      if (saved) {
        setHypedFeatures(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const handleToggleHype = (featureId: string) => {
    setHypedFeatures((prev) => {
      const updated = { ...prev, [featureId]: !prev[featureId] };
      try {
        localStorage.setItem('ht_v2_hyped_features', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleConfirm = () => {
    try {
      localStorage.setItem('ht_v2_release_toast_dismissed_drop1', 'true');
      sessionStorage.removeItem('ht_show_v2_roadmap');
      sessionStorage.removeItem('ht_v2_roadmap_dismissed');
      localStorage.removeItem('ht_seen_v2_roadmap_v1');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#ff5a1f', '#fbf8f1', '#15130f'],
      });
    } catch {}

    onClose();
  };

  const spotlightDrop = V2_DROPS[0];
  const futureDrops = V2_DROPS.slice(1);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-roadmap-title"
        className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/45 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 14 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-w-xl max-h-[88vh] flex flex-col bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/12 dark:border-[#fbf8f1]/12 rounded-[28px] shadow-2xl overflow-hidden z-10 my-auto text-[#15130f] dark:text-[#fbf8f1] font-archivo"
        >
          {/* Header */}
          <div className="relative p-6 pb-4 border-b border-[#15130f]/10 dark:border-[#fbf8f1]/10">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff5a1f]/10 text-[#ff5a1f] text-[11px] font-semibold tracking-wide">
                <span className="relative flex items-center justify-center w-2 h-2 shrink-0">
                  <span className="animate-ping absolute inset-0 rounded-full bg-[#ff5a1f] opacity-75" />
                  <span className="relative block w-2 h-2 rounded-full bg-[#ff5a1f]" />
                </span>
                <span>v2.0 ROADMAP • 6 UPCOMING DROPS</span>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-[#15130f]/40 hover:text-[#15130f] dark:text-[#fbf8f1]/40 dark:hover:text-[#fbf8f1] hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3">
              <h3 id="modal-roadmap-title" className="font-clash font-semibold text-2xl sm:text-3xl tracking-tight">
                The v2.0 Evolution Cycle
              </h3>
              <p className="text-xs sm:text-sm text-[#15130f]/60 dark:text-[#fbf8f1]/60 mt-1">
                6 weekly staged drops designed to systematically refine your discipline.
              </p>
            </div>

            {/* Sub-Tabs Switcher */}
            <div className="flex items-center gap-2 mt-4 p-1 rounded-full bg-[#f2ecdf] dark:bg-[#11100d] w-fit">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] shadow-sm'
                    : 'text-[#15130f]/70 dark:text-[#fbf8f1]/70 hover:text-[#ff5a1f] dark:hover:text-[#ff5a1f]'
                }`}
              >
                All 6 Drops
              </button>
              <button
                onClick={() => setActiveTab('spotlight')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'spotlight'
                    ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] shadow-sm'
                    : 'text-[#15130f]/70 dark:text-[#fbf8f1]/70 hover:text-[#ff5a1f] dark:hover:text-[#ff5a1f]'
                }`}
              >
                Spotlight: Drop 1
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {/* SPOTLIGHT CARD: DROP 1 */}
            <div className="rounded-[20px] bg-[#15130f] text-[#fbf8f1] p-5 sm:p-6 shadow-md border border-[#15130f]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#ff5a1f] text-white text-[10px] font-bold tracking-wider uppercase">
                  DROP 1 • OCT 10, 2026
                </span>
                <div className="flex items-center gap-1.5 text-xs text-[#ff5a1f] font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Unlocked!'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 mt-3">
                <div className="w-10 h-10 rounded-xl bg-[#fbf8f1]/10 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-5 h-5 text-[#ff5a1f]" />
                </div>
                <div>
                  <h4 className="font-clash font-semibold text-xl text-[#fbf8f1]">
                    {spotlightDrop.title}
                  </h4>
                  <p className="text-xs text-[#fbf8f1]/70 mt-1 leading-relaxed">
                    {spotlightDrop.tagline}
                  </p>
                </div>
              </div>

              {/* Highlights */}
              <ul className="mt-4 space-y-1.5 border-t border-[#fbf8f1]/10 pt-3 text-xs text-[#fbf8f1]/80">
                {spotlightDrop.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#ff5a1f] shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

              {/* Hype Reaction */}
              <div className="mt-4 pt-3 border-t border-[#fbf8f1]/10 flex items-center justify-between">
                <button
                  onClick={() => handleToggleHype(spotlightDrop.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    hypedFeatures[spotlightDrop.id]
                      ? 'bg-[#ff5a1f] text-white'
                      : 'bg-[#fbf8f1]/10 text-[#fbf8f1] hover:bg-[#fbf8f1]/20'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>{hypedFeatures[spotlightDrop.id] ? 'Hyped! 🔥' : 'I want this'}</span>
                </button>
              </div>
            </div>

            {/* REMAINING 5 DROPS (If 'all' tab selected) */}
            {activeTab === 'all' && (
              <div className="space-y-3">
                <h4 className="font-clash font-semibold text-sm tracking-wider uppercase text-[#15130f]/60 dark:text-[#fbf8f1]/60 pt-2">
                  Subsequent Evolution Drops
                </h4>

                {futureDrops.map((drop) => {
                  const Icon = DROP_ICONS[drop.id] || Target;
                  const isHyped = Boolean(hypedFeatures[drop.id]);

                  return (
                    <div
                      key={drop.id}
                      className="rounded-[18px] bg-[#f2ecdf]/60 dark:bg-[#11100d]/60 border border-[#15130f]/10 dark:border-[#fbf8f1]/10 p-4 sm:p-5 flex flex-col gap-2.5 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff5a1f]">
                          DROP {drop.dropNumber} • {drop.targetDate}
                        </span>
                        <button
                          onClick={() => handleToggleHype(drop.id)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                            isHyped
                              ? 'bg-[#ff5a1f] text-white'
                              : 'bg-[#15130f]/5 dark:bg-[#fbf8f1]/5 text-[#15130f]/60 dark:text-[#fbf8f1]/60 hover:text-[#ff5a1f]'
                          }`}
                        >
                          <Flame className="w-3 h-3" />
                          <span>{isHyped ? 'Hyped' : 'Hype'}</span>
                        </button>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#15130f]/5 dark:bg-[#fbf8f1]/5 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-[#ff5a1f]" />
                        </div>
                        <div>
                          <h5 className="font-clash font-semibold text-base text-[#15130f] dark:text-[#fbf8f1]">
                            {drop.title}
                          </h5>
                          <p className="text-xs text-[#15130f]/65 dark:text-[#fbf8f1]/65 mt-0.5">
                            {drop.tagline}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-[#15130f]/10 dark:border-[#fbf8f1]/10 flex items-center justify-between bg-[#fbf8f1] dark:bg-[#1c1a16]">
            <p className="text-xs text-[#15130f]/50 dark:text-[#fbf8f1]/50 hidden sm:block">
              Continuous incremental discipline engineering.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#ff5a1f] hover:bg-[#e04a12] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Explore Habit Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
