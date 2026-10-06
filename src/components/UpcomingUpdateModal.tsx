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
  LayoutGrid,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  V2_DROPS,
  V2_RELEASE_INFO,
  getActiveUpcomingDrop,
  getDropDaysRemaining,
  isDropReleased,
  formatDropShortDate,
} from '@/config/releases';

interface UpcomingUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DROP_ICONS: Record<string, React.ElementType> = {
  'heatmap-365': CalendarDays,
  'flex-cards': Share2,
  'streak-armor': ShieldCheck,
  'habit-stacking': Layers,
  'numeric-goals': Target,
  'offline-sync': WifiOff,
};

export function UpcomingUpdateModal({ isOpen, onClose }: UpcomingUpdateModalProps) {
  const [hypedFeatures, setHypedFeatures] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'spotlight' | 'overview'>('spotlight');
  const [selectedDropId, setSelectedDropId] = useState<string>(() => getActiveUpcomingDrop().id);

  // Sync selected drop to the currently active upcoming drop when opening
  useEffect(() => {
    if (isOpen) {
      const active = getActiveUpcomingDrop();
      setSelectedDropId(active.id);
      setViewMode('spotlight');
    }
  }, [isOpen]);

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

  const activeUpcomingDrop = getActiveUpcomingDrop();
  const spotlightDrop = V2_DROPS.find((d) => d.id === selectedDropId) || activeUpcomingDrop;
  const isSpotlightReleased = isDropReleased(spotlightDrop);
  const spotlightDaysRemaining = getDropDaysRemaining(spotlightDrop);
  const SpotlightIcon = DROP_ICONS[spotlightDrop.id] || Target;

  const handleConfirm = () => {
    try {
      localStorage.setItem(`ht_v2_release_toast_dismissed_${activeUpcomingDrop.id}`, 'true');
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-roadmap-title"
        className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-w-2xl sm:max-w-3xl flex flex-col bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/15 dark:border-[#fbf8f1]/15 rounded-[26px] shadow-2xl overflow-hidden z-10 my-auto text-[#15130f] dark:text-[#fbf8f1] font-archivo max-h-[92vh]"
        >
          {/* Header Bar - Compact single row */}
          <div className="relative px-4 sm:px-6 py-3.5 border-b border-[#15130f]/10 dark:border-[#fbf8f1]/10 flex items-center justify-between gap-3 bg-[#fbf8f1] dark:bg-[#1c1a16]">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ff5a1f]/10 text-[#ff5a1f] text-[10.5px] font-bold tracking-wider uppercase shrink-0">
                <span className="relative flex items-center justify-center w-2 h-2 shrink-0">
                  <span className="animate-ping absolute inset-0 rounded-full bg-[#ff5a1f] opacity-75" />
                  <span className="relative block w-2 h-2 rounded-full bg-[#ff5a1f]" />
                </span>
                Roadmap
              </span>

              <h3 id="modal-roadmap-title" className="font-clash font-semibold text-lg sm:text-xl text-[#15130f] dark:text-[#fbf8f1] tracking-tight truncate">
                {V2_RELEASE_INFO.title}
              </h3>

              <span className="hidden md:inline text-xs text-[#15130f]/50 dark:text-[#fbf8f1]/50 truncate">
                • 6 Weekly Drops
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'spotlight' ? 'overview' : 'spotlight')}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#15130f]/5 dark:bg-[#fbf8f1]/5 hover:bg-[#15130f]/10 dark:hover:bg-[#fbf8f1]/10 text-[#15130f]/70 dark:text-[#fbf8f1]/70 transition-colors cursor-pointer"
                title="Toggle between focused drop view and all drops overview"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#ff5a1f]" />
                <span>{viewMode === 'spotlight' ? 'Compare All' : 'Focus Drop'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close roadmap dialog"
                className="p-1 rounded-full text-[#15130f]/40 hover:text-[#15130f] dark:text-[#fbf8f1]/40 dark:hover:text-[#fbf8f1] hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Drop Navigation Tabs - 6 drops in 1 row */}
          <div className="px-3 sm:px-6 py-2 bg-[#f2ecdf]/60 dark:bg-[#11100d]/60 border-b border-[#15130f]/8 dark:border-[#fbf8f1]/8 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
              {V2_DROPS.map((drop) => {
                const isReleased = isDropReleased(drop);
                const isNext = drop.dropNumber === activeUpcomingDrop.dropNumber && !isReleased;
                const isSelected = drop.id === spotlightDrop.id && viewMode === 'spotlight';
                const DropIcon = DROP_ICONS[drop.id] || Target;

                return (
                  <button
                    key={drop.id}
                    type="button"
                    onClick={() => {
                      setSelectedDropId(drop.id);
                      setViewMode('spotlight');
                    }}
                    className={`group px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#15130f] text-[#fbf8f1] dark:bg-[#fbf8f1] dark:text-[#15130f] shadow-sm'
                        : 'bg-[#15130f]/5 dark:bg-[#fbf8f1]/5 text-[#15130f]/70 dark:text-[#fbf8f1]/70 hover:bg-[#ff5a1f]/10 hover:text-[#ff5a1f]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {isReleased ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Released & Live" />
                      ) : isNext ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a1f] animate-pulse shrink-0" title="Next upcoming drop" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#15130f]/30 dark:bg-[#fbf8f1]/30 shrink-0" />
                      )}
                      <DropIcon className="w-3 h-3 text-[#ff5a1f] shrink-0" />
                      <span>Drop {drop.dropNumber}</span>
                    </div>

                    <span
                      className={`text-[10px] font-mono transition-opacity ${
                        isSelected
                          ? 'opacity-80'
                          : 'opacity-50 group-hover:opacity-80'
                      }`}
                    >
                      {formatDropShortDate(drop.releaseDate).split(',')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {viewMode === 'spotlight' ? (
              /* THE REDESIGNED DROP BOX - Compact, 2-column highlights, 100% visible without scroll */
              <div className="rounded-[22px] bg-[#15130f] text-[#fbf8f1] p-4 sm:p-5 shadow-lg border border-[#15130f]">
                {/* Header row: Badge + Countdown */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#ff5a1f] text-white text-[10.5px] font-bold tracking-wider uppercase">
                      DROP {spotlightDrop.dropNumber} • {formatDropShortDate(spotlightDrop.releaseDate)}
                    </span>
                    <span className="text-[11px] font-medium text-[#fbf8f1]/60 uppercase tracking-wider hidden sm:inline">
                      {spotlightDrop.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold shrink-0">
                    {isSpotlightReleased ? (
                      <span className="text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Live & Unlocked</span>
                      </span>
                    ) : spotlightDaysRemaining === 0 ? (
                      <span className="text-[#ff5a1f] flex items-center gap-1.5 bg-[#ff5a1f]/10 px-2.5 py-0.5 rounded-full">
                        <Flame className="w-3.5 h-3.5" />
                        <span>Releasing Today!</span>
                      </span>
                    ) : (
                      <span className="text-[#ff5a1f] flex items-center gap-1.5 bg-[#ff5a1f]/10 px-2.5 py-0.5 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{spotlightDaysRemaining} {spotlightDaysRemaining === 1 ? 'day' : 'days'} remaining</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Drop Title & Tagline */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#fbf8f1]/10 flex items-center justify-center shrink-0">
                    <SpotlightIcon className="w-5 h-5 text-[#ff5a1f]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-clash font-semibold text-lg sm:text-xl text-[#fbf8f1] tracking-tight">
                      {spotlightDrop.title}
                    </h4>
                    <p className="text-xs sm:text-[13px] text-[#fbf8f1]/70 mt-0.5 leading-snug">
                      {spotlightDrop.tagline}
                    </p>
                  </div>
                </div>

                {/* Highlights: 2-Column Responsive Grid so EVERYTHING fits without scrolling */}
                <div className="mt-3.5 pt-3 border-t border-[#fbf8f1]/10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#fbf8f1]/50 block mb-2">
                    Key Features in This Drop:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {spotlightDrop.highlights.map((h, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs text-[#fbf8f1]/85 leading-snug"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#ff5a1f] shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div className="mt-3.5 pt-3 border-t border-[#fbf8f1]/10 flex items-center justify-between gap-2 flex-wrap text-xs">
                  <button
                    type="button"
                    onClick={() => handleToggleHype(spotlightDrop.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      hypedFeatures[spotlightDrop.id]
                        ? 'bg-[#ff5a1f] text-white shadow-xs'
                        : 'bg-[#fbf8f1]/10 text-[#fbf8f1] hover:bg-[#fbf8f1]/20'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>{hypedFeatures[spotlightDrop.id] ? 'Hyped! 🔥' : 'I want this'}</span>
                  </button>

                  <div className="flex items-center gap-3 text-[11px] text-[#fbf8f1]/60">
                    <span>
                      {spotlightDrop.dropNumber === 1
                        ? 'Opens the 2026 cycle'
                        : `Releases 1 week after Drop ${spotlightDrop.dropNumber - 1}`}
                    </span>
                    {spotlightDrop.dropNumber !== activeUpcomingDrop.dropNumber && (
                      <button
                        type="button"
                        onClick={() => setSelectedDropId(activeUpcomingDrop.id)}
                        className="text-[#ff5a1f] hover:underline font-semibold cursor-pointer"
                      >
                        Return to Drop {activeUpcomingDrop.dropNumber}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* OVERVIEW GRID VIEW (If 'Compare All' clicked) */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-clash font-semibold text-sm tracking-wider uppercase text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                    All 6 Evolution Drops (1 Week Intervals)
                  </h4>
                  <button
                    type="button"
                    onClick={() => setViewMode('spotlight')}
                    className="text-xs font-semibold text-[#ff5a1f] hover:underline cursor-pointer"
                  >
                    Back to Focus View
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {V2_DROPS.map((drop) => {
                    const Icon = DROP_ICONS[drop.id] || Target;
                    const isReleased = isDropReleased(drop);
                    const isNext = drop.dropNumber === activeUpcomingDrop.dropNumber && !isReleased;
                    const isSelected = drop.id === spotlightDrop.id;

                    return (
                      <div
                        key={drop.id}
                        onClick={() => {
                          setSelectedDropId(drop.id);
                          setViewMode('spotlight');
                        }}
                        className={`rounded-[18px] bg-[#f2ecdf]/60 dark:bg-[#11100d]/60 border p-3.5 transition-all cursor-pointer hover:border-[#ff5a1f]/40 ${
                          isSelected
                            ? 'border-[#ff5a1f]/60 ring-1 ring-[#ff5a1f]/30'
                            : 'border-[#15130f]/10 dark:border-[#fbf8f1]/10'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff5a1f]">
                            DROP {drop.dropNumber} • {formatDropShortDate(drop.releaseDate)}
                          </span>
                          {isReleased ? (
                            <span className="px-2 py-0.2 rounded-full text-[9.5px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                              LIVE
                            </span>
                          ) : isNext ? (
                            <span className="px-2 py-0.2 rounded-full text-[9.5px] font-bold bg-[#ff5a1f]/15 text-[#ff5a1f]">
                              UP NEXT
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#15130f]/5 dark:bg-[#fbf8f1]/5 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-[#ff5a1f]" />
                          </div>
                          <div>
                            <h5 className="font-clash font-semibold text-sm text-[#15130f] dark:text-[#fbf8f1]">
                              {drop.title}
                            </h5>
                            <p className="text-[11px] text-[#15130f]/65 dark:text-[#fbf8f1]/65 line-clamp-2 mt-0.5">
                              {drop.tagline}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-4 sm:px-6 py-3 border-t border-[#15130f]/10 dark:border-[#fbf8f1]/10 flex items-center justify-between bg-[#fbf8f1] dark:bg-[#1c1a16]">
            <p className="text-xs text-[#15130f]/50 dark:text-[#fbf8f1]/50 hidden sm:block">
              Continuous weekly discipline engineering.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              className="w-full sm:w-auto px-5 py-2 rounded-full bg-[#ff5a1f] hover:bg-[#e04a12] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
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
