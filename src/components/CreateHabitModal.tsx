'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Pipette, Palette } from 'lucide-react';
import { COLOR_THEMES, ColorTheme, getColorThemeByHex } from '@/lib/constants';

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (
    title: string,
    colorTheme: string,
    targetType?: 'boolean' | 'numeric',
    targetValue?: number | null,
    unit?: string | null,
    stepIncrement?: number | null
  ) => Promise<void>;
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

const UNIT_PRESETS = [
  { label: 'ml (Water)', unit: 'ml', defaultTarget: 2500, defaultStep: 250 },
  { label: 'pages (Reading)', unit: 'pages', defaultTarget: 20, defaultStep: 5 },
  { label: 'mins (Focus)', unit: 'mins', defaultTarget: 45, defaultStep: 15 },
  { label: 'steps (Walking)', unit: 'steps', defaultTarget: 10000, defaultStep: 1000 },
  { label: 'reps (Workout)', unit: 'reps', defaultTarget: 50, defaultStep: 10 },
  { label: 'km (Distance)', unit: 'km', defaultTarget: 5, defaultStep: 1 },
];

export function CreateHabitModal({
  isOpen,
  onClose,
  onCreate,
}: CreateHabitModalProps) {
  const [title, setTitle] = useState('');
  const [targetType, setTargetType] = useState<'boolean' | 'numeric'>('boolean');
  const [targetValue, setTargetValue] = useState('2500');
  const [unit, setUnit] = useState('ml');
  const [stepIncrement, setStepIncrement] = useState('250');
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

  const handleSelectPreset = (preset: typeof UNIT_PRESETS[0]) => {
    setUnit(preset.unit);
    setTargetValue(String(preset.defaultTarget));
    setStepIncrement(String(preset.defaultStep));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Please provide a habit title.');
      return;
    }

    let parsedTargetValue: number | null = null;
    let parsedStepIncrement: number | null = null;
    let parsedUnit: string | null = null;

    if (targetType === 'numeric') {
      const numTarget = parseFloat(targetValue);
      if (isNaN(numTarget) || numTarget <= 0) {
        setError('Please enter a valid numeric target greater than zero.');
        return;
      }
      parsedTargetValue = numTarget;
      parsedUnit = unit.trim() || 'units';

      const numStep = parseFloat(stepIncrement);
      if (!isNaN(numStep) && numStep > 0) {
        parsedStepIncrement = numStep;
      } else {
        parsedStepIncrement = Math.max(1, Math.round(numTarget / 10));
      }
    }

    try {
      setIsSubmitting(true);
      await onCreate(
        trimmedTitle,
        selectedTheme.hex,
        targetType,
        parsedTargetValue,
        parsedUnit,
        parsedStepIncrement
      );
      setTitle('');
      setTargetType('boolean');
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
            className="relative w-full max-w-[420px] bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/15 dark:border-[#fbf8f1]/15 backdrop-blur-2xl max-h-[88vh] overflow-y-auto rounded-[28px] p-5 sm:p-6 shadow-2xl z-10 text-[#15130f] smooth-scroll dark:text-[#fbf8f1] font-archivo transition-colors"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#15130f]/10 dark:border-[#fbf8f1]/10">
              <div className="flex items-center gap-2.5">
                <div
                  style={{ backgroundColor: `${selectedTheme.hex}20`, color: selectedTheme.hex }}
                  className="p-2.5 rounded-2xl flex items-center justify-center transition-colors duration-300 border border-[#15130f]/10 dark:border-[#fbf8f1]/10"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#15130f] dark:text-[#fbf8f1] tracking-tight font-clash">
                    Add New Habit
                  </h3>
                  <p className="text-xs text-[#15130f]/60 dark:text-[#fbf8f1]/60 font-medium">
                    Set a clear daily routine to maintain consistency
                  </p>
                </div>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 text-[#15130f]/40 hover:text-[#15130f] dark:text-[#fbf8f1]/40 dark:hover:text-[#fbf8f1] rounded-full hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/5 transition-colors cursor-pointer"
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
                  className="block text-[11px] font-semibold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60 mb-2 font-archivo"
                >
                  Habit Title
                </label>
                <input
                  id="habit-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Read 20 pages, Drink water, Meditate..."
                  autoFocus
                  maxLength={60}
                  className="w-full px-4 py-3.5 bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 rounded-2xl text-[#15130f] dark:text-[#fbf8f1] placeholder-[#15130f]/40 dark:placeholder-[#fbf8f1]/40 font-medium focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/50 focus:border-[#ff5a1f] transition-all text-sm"
                />
              </div>

              {/* Goal Type Switcher: Drop 2 Quantitative Goals */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60 mb-2 font-archivo">
                  Tracking Goal Type
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10">
                  <button
                    type="button"
                    onClick={() => setTargetType('boolean')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      targetType === 'boolean'
                        ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] shadow-sm'
                        : 'text-[#15130f]/60 dark:text-[#fbf8f1]/60 hover:text-[#ff5a1f]'
                    }`}
                  >
                    <span>Checkmark (Yes/No)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetType('numeric')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      targetType === 'numeric'
                        ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] shadow-sm'
                        : 'text-[#15130f]/60 dark:text-[#fbf8f1]/60 hover:text-[#ff5a1f]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a1f]" />
                    <span>Numeric Target (Drop 2)</span>
                  </button>
                </div>
              </div>

              {/* Numeric Goal Configuration Fields */}
              {targetType === 'numeric' && (
                <div className="p-3.5 rounded-2xl bg-[#f2ecdf]/80 dark:bg-[#11100d]/80 border border-[#ff5a1f]/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff5a1f]">
                      Quantitative Target
                    </span>
                    <span className="text-[10px] text-[#15130f]/50 dark:text-[#fbf8f1]/50">
                      In-cell steppers & progress rings
                    </span>
                  </div>

                  {/* Preset Chips */}
                  <div>
                    <span className="block text-[10px] font-semibold text-[#15130f]/50 dark:text-[#fbf8f1]/50 mb-1.5">
                      Popular Presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {UNIT_PRESETS.map((preset) => (
                        <button
                          key={preset.unit}
                          type="button"
                          onClick={() => handleSelectPreset(preset)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                            unit === preset.unit
                              ? 'bg-[#ff5a1f] text-white border-[#ff5a1f] shadow-xs'
                              : 'bg-white dark:bg-[#1c1a16] border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-[#15130f]/70 dark:text-[#fbf8f1]/70 hover:border-[#ff5a1f]/40'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Inputs: Target & Unit & Step */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-[#15130f]/60 dark:text-[#fbf8f1]/60 mb-1">
                        Daily Target
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={targetValue}
                        onChange={(e) => setTargetValue(e.target.value)}
                        placeholder="2500"
                        className="w-full px-3 py-2 bg-white dark:bg-[#1c1a16] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 rounded-xl text-xs font-bold text-[#15130f] dark:text-[#fbf8f1] focus:outline-none focus:ring-1 focus:ring-[#ff5a1f]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#15130f]/60 dark:text-[#fbf8f1]/60 mb-1">
                        Metric Unit
                      </label>
                      <input
                        type="text"
                        maxLength={15}
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        placeholder="ml, pages..."
                        className="w-full px-3 py-2 bg-white dark:bg-[#1c1a16] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 rounded-xl text-xs font-bold text-[#15130f] dark:text-[#fbf8f1] focus:outline-none focus:ring-1 focus:ring-[#ff5a1f]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#15130f]/60 dark:text-[#fbf8f1]/60 mb-1">
                        Step (+/-)
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={stepIncrement}
                        onChange={(e) => setStepIncrement(e.target.value)}
                        placeholder="250"
                        className="w-full px-3 py-2 bg-white dark:bg-[#1c1a16] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 rounded-xl text-xs font-bold text-[#15130f] dark:text-[#fbf8f1] focus:outline-none focus:ring-1 focus:ring-[#ff5a1f]"
                      />
                    </div>
                  </div>
                </div>
              )}

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