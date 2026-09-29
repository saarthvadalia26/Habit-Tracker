'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Plus } from 'lucide-react';
import { COLOR_THEMES, ColorTheme } from '@/lib/constants';

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, colorTheme: string) => Promise<void>;
}

export function CreateHabitModal({
  isOpen,
  onClose,
  onCreate,
}: CreateHabitModalProps) {
  const [title, setTitle] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme>(COLOR_THEMES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a habit title.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onCreate(title.trim(), selectedTheme.hex);
      setTitle('');
      setSelectedTheme(COLOR_THEMES[0]);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create habit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{
              type: 'spring',
              stiffness: 450,
              damping: 28,
            }}
            className="relative w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden text-slate-900 dark:text-slate-100 transition-colors"
          >
            {/* Top decorative gradient glow */}
            <div
              style={{
                background: `radial-gradient(circle at top, ${selectedTheme.hex}40, transparent 70%)`,
              }}
              className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-48 pointer-events-none blur-2xl"
            />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div
                  style={{ backgroundColor: `${selectedTheme.hex}25`, color: selectedTheme.hex }}
                  className="p-2.5 rounded-2xl flex items-center justify-center transition-colors duration-300 border border-slate-200 dark:border-slate-700/50"
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">
                    Add New Habit
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Set a clear daily routine to maintain consistency
                  </p>
                </div>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {error && (
                <div className="p-3 text-sm text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 rounded-xl">
                  {error}
                </div>
              )}

              {/* Title input */}
              <div>
                <label
                  htmlFor="habit-title"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 font-mono"
                >
                  Habit Title
                </label>
                <input
                  id="habit-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Read 20 pages, Morning Run, Meditate..."
                  autoFocus
                  maxLength={60}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                />
              </div>

              {/* Color Theme Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 font-mono">
                  Color Aesthetic
                </label>
                <div className="grid grid-cols-7 gap-2.5">
                  {COLOR_THEMES.map((theme) => {
                    const isSelected = selectedTheme.hex === theme.hex;
                    return (
                      <motion.button
                        key={theme.id}
                        type="button"
                        onClick={() => setSelectedTheme(theme)}
                        whileHover={{ y: -4, scale: 1.15 }}
                        whileTap={{ scale: 0.92 }}
                        style={{
                          backgroundColor: theme.hex,
                          boxShadow: isSelected
                            ? `0 0 16px ${theme.hex}`
                            : 'none',
                        }}
                        className={`w-10 h-10 rounded-2xl transition-all flex items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'ring-4 ring-offset-2 ring-offset-slate-900 ring-white scale-105'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        title={theme.name}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="active-theme-check"
                            className="w-2.5 h-2.5 bg-white rounded-full shadow-sm"
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-slate-500 font-medium text-right font-mono">
                  Selected: <span className="text-slate-800 dark:text-slate-200 font-semibold">{selectedTheme.name}</span>
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    backgroundColor: selectedTheme.hex,
                    boxShadow: `0 0 20px ${selectedTheme.hex}70`,
                  }}
                  className="px-6 py-2.5 text-sm font-semibold text-white rounded-2xl flex items-center gap-2 disabled:opacity-50 transition-shadow cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{isSubmitting ? 'Creating...' : 'Create Habit'}</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
