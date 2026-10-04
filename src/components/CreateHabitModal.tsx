'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Pipette, Palette } from 'lucide-react';
import { COLOR_THEMES, ColorTheme, getColorThemeByHex } from '@/lib/constants';

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, colorTheme: string) => Promise<void>;
}

function isLightHex(hexColor: string): boolean {
  if (!hexColor) return false;
  let hex = hexColor.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  const r = parseInt(hex.slice(0, 2), 16) || 0;
  const g = parseInt(hex.slice(2, 4), 16) || 0;
  const b = parseInt(hex.slice(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 155;
}

function getContrastTextColor(hexColor: string): '#0F172A' | '#FFFFFF' {
  return isLightHex(hexColor) ? '#0F172A' : '#FFFFFF';
}

const QUICK_COLORS = [
  '#EC4899', // Neon Pink
  '#F43F5E', // Rose
  '#FF6B00', // Sunset Orange
  '#EAB308', // Gold
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
];

export function CreateHabitModal({
  isOpen,
  onClose,
  onCreate,
}: CreateHabitModalProps) {
  const [title, setTitle] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme>(COLOR_THEMES[0]);
  const [isCustom, setIsCustom] = useState(false);
  const [customHex, setCustomHex] = useState('#EC4899');
  const [hexInputText, setHexInputText] = useState('EC4899');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSubmitLight = isLightHex(selectedTheme.hex);
  const submitTextColor = getContrastTextColor(selectedTheme.hex);
  const isCustomLight = isLightHex(customHex);

  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleCustomHexChange = (hex: string) => {
    let cleaned = hex.trim();
    if (!cleaned.startsWith('#')) cleaned = '#' + cleaned;
    setCustomHex(cleaned);
    setHexInputText(cleaned.replace('#', '').toUpperCase());
    setIsCustom(true);
    setSelectedTheme(getColorThemeByHex(cleaned));
  };

  const handleHexInputType = (val: string) => {
    const stripped = val.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
    setHexInputText(stripped.toUpperCase());
    if (stripped.length === 6 || stripped.length === 3) {
      const fullHex = '#' + stripped;
      setCustomHex(fullHex);
      setIsCustom(true);
      setSelectedTheme(getColorThemeByHex(fullHex));
    }
  };

  const handleOpenEyeDropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        // @ts-expect-error EyeDropper is experimental browser API
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          handleCustomHexChange(result.sRGBHex);
        }
      } catch {
        // User cancelled eyedropper
      }
    } else {
      colorInputRef.current?.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Please provide a habit title.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onCreate(trimmedTitle, selectedTheme.hex);
      setTitle('');
      setSelectedTheme(COLOR_THEMES[0]);
      setIsCustom(false);
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
            className="relative w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 text-slate-900 smooth-scroll dark:text-slate-100 transition-colors"
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
                  <Plus className="w-5 h-5 stroke-[2.5]" />
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
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                    Color Aesthetic
                  </label>
                  <p className="text-xs text-slate-500 font-medium font-mono">
                    Selected:{' '}
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">
                      {isCustom ? `Custom (${selectedTheme.hex.toUpperCase()})` : selectedTheme.name}
                    </span>
                  </p>
                </div>

                {/* Swatches: 7 Presets + 1 Custom Palette Swatch */}
                <div className="grid grid-cols-8 gap-2 sm:gap-2.5">
                  {COLOR_THEMES.map((theme) => {
                    const isSelected = !isCustom && selectedTheme.hex.toLowerCase() === theme.hex.toLowerCase();
                    return (
                      <motion.button
                        key={theme.id}
                        type="button"
                        onClick={() => {
                          setIsCustom(false);
                          setSelectedTheme(theme);
                          setCustomHex(theme.hex);
                          setHexInputText(theme.hex.replace('#', '').toUpperCase());
                        }}
                        whileHover={{ y: -3, scale: 1.12 }}
                        whileTap={{ scale: 0.92 }}
                        style={{
                          backgroundColor: theme.hex,
                          boxShadow: isSelected
                            ? `0 0 16px ${theme.hex}`
                            : 'none',
                        }}
                        className={`h-8 sm:h-10 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'ring-3 ring-offset-2 ring-offset-slate-900 ring-white scale-105 shadow-md'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        title={theme.name}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="active-theme-check"
                            className={"w-2.5 h-2.5 rounded-full shadow-sm " + (isLightHex(theme.hex) ? "bg-slate-900" : "bg-white")}
                          />
                        )}
                      </motion.button>
                    );
                  })}

                  {/* 8th Swatch: Custom Palette Trigger */}
                  <motion.button
                    type="button"
                    onClick={() => {
                      setIsCustom(true);
                      setSelectedTheme(getColorThemeByHex(customHex));
                    }}
                    whileHover={{ y: -3, scale: 1.12 }}
                    whileTap={{ scale: 0.92 }}
                    style={{
                      backgroundColor: isCustom ? customHex : 'transparent',
                      boxShadow: isCustom ? `0 0 16px ${customHex}` : 'none',
                    }}
                    className={`relative h-8 sm:h-10 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center cursor-pointer overflow-hidden ${
                      isCustom
                        ? ('ring-3 ring-offset-2 ring-offset-slate-900 scale-105 shadow-md ' + (isCustomLight ? 'ring-slate-400 border border-slate-300 dark:border-slate-600' : 'ring-white'))
                        : 'border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-gradient-to-tr from-pink-500/15 via-indigo-500/15 to-cyan-500/15'
                    }`}
                    title="Custom Color"
                  >
                    {isCustom ? (
                      <motion.div
                        layoutId="active-theme-check"
                        className={"w-2.5 h-2.5 rounded-full shadow-sm " + (isCustomLight ? "bg-slate-900" : "bg-white")}
                      />
                    ) : (
                      <Palette className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    )}
                  </motion.button>
                </div>

                {/* Custom Color Input Controls */}
                <div className="mt-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 space-y-2.5 transition-all">
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      {/* Native Color Picker swatch button */}
                      <div className="relative shrink-0">
                        <input
                          ref={colorInputRef}
                          type="color"
                          value={customHex}
                          onChange={(e) => handleCustomHexChange(e.target.value)}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                          aria-label="Pick custom color"
                        />
                        <div
                          style={{
                            backgroundColor: customHex,
                            boxShadow: `0 0 12px ${customHex}70`,
                          }}
                          className={"w-8 h-8 rounded-xl border flex items-center justify-center cursor-pointer transition-transform hover:scale-105 " + (isCustomLight ? "border-slate-300 text-slate-900" : "border-white/30 text-white")}
                          title="Open color wheel"
                        >
                          <Palette className="w-3.5 h-3.5 drop-shadow pointer-events-none" style={{ color: isCustomLight ? "#0F172A" : "#FFFFFF" }} />
                        </div>
                      </div>

                      {/* Hex input */}
                      <div className="relative flex items-center">
                        <span className="absolute left-2.5 text-xs font-mono font-bold text-slate-400">#</span>
                        <input
                          type="text"
                          value={hexInputText}
                          onChange={(e) => handleHexInputType(e.target.value)}
                          placeholder="EC4899"
                          maxLength={6}
                          className="w-24 pl-6 pr-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl font-mono text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                      </div>

                      {/* Eyedropper button */}
                      <button
                        type="button"
                        onClick={handleOpenEyeDropper}
                        className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Pick color from screen"
                      >
                        <Pipette className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick Color Palette Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                      {QUICK_COLORS.map((qc) => (
                        <button
                          key={qc}
                          type="button"
                          onClick={() => handleCustomHexChange(qc)}
                          style={{ backgroundColor: qc }}
                          className={`w-4 h-4 rounded-full transition-transform hover:scale-125 cursor-pointer shrink-0 ${
                            customHex.toLowerCase() === qc.toLowerCase() && isCustom
                              ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900 scale-110 shadow-sm'
                              : 'opacity-70 hover:opacity-100'
                          }`}
                          title={`Pick ${qc}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
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
                  className={"px-6 py-2.5 text-sm font-bold rounded-2xl flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer " + (isSubmitLight ? "border border-slate-300 dark:border-slate-500 shadow-md" : "")}
                >
                  <Plus className="w-4 h-4 stroke-[3]" style={{ color: submitTextColor }} />
                  <span style={{ color: submitTextColor }}>{isSubmitting ? 'Creating...' : 'Create Habit'}</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}