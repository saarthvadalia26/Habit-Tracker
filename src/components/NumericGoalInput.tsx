'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Target, TrendingUp } from 'lucide-react';
import { calculateProgress, getProgressColor, formatValue } from '@/lib/goalTemplates';

interface NumericGoalInputProps {
  habitId: string;
  habitTitle: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  quickPresets: number[];
  step: number;
  color?: string;
  onUpdate: (habitId: string, newValue: number) => Promise<void>;
  isDisabled?: boolean;
}

export function NumericGoalInput({
  habitId,
  habitTitle,
  currentValue: initialValue,
  targetValue,
  unit,
  quickPresets,
  step,
  color = '#ff5a1f',
  onUpdate,
  isDisabled = false,
}: NumericGoalInputProps) {
  const [value, setValue] = useState(initialValue);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const progress = calculateProgress(value, targetValue);
  const progressColor = getProgressColor(progress);
  const isComplete = progress >= 100;

  const handleIncrement = async () => {
    if (isDisabled || isUpdating) return;
    const newValue = value + step;
    setValue(newValue);
    await updateValue(newValue);
  };

  const handleDecrement = async () => {
    if (isDisabled || isUpdating) return;
    const newValue = Math.max(0, value - step);
    setValue(newValue);
    await updateValue(newValue);
  };

  const handlePresetClick = async (presetValue: number) => {
    if (isDisabled || isUpdating) return;
    setValue(presetValue);
    await updateValue(presetValue);
    setShowPresets(false);
  };

  const handleDirectInput = (inputValue: string) => {
    const numValue = parseInt(inputValue) || 0;
    setValue(Math.max(0, numValue));
  };

  const handleBlur = async () => {
    if (value !== initialValue) {
      await updateValue(value);
    }
  };

  const updateValue = async (newValue: number) => {
    setIsUpdating(true);
    try {
      await onUpdate(habitId, newValue);
    } catch (error) {
      console.error('Failed to update numeric goal:', error);
      setValue(initialValue); // Revert on error
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      {/* Progress Ring Background */}
      <div className="relative inline-flex items-center justify-center">
        {/* SVG Progress Ring */}
        <svg className="absolute" width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-[#15130f]/10 dark:text-[#fbf8f1]/10"
          />
          {/* Progress circle */}
          <motion.circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke={progressColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 34}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - progress / 100) }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>

        {/* Inner Content */}
        <div className="relative flex flex-col items-center justify-center w-20 h-20">
          {/* Value Display */}
          <div className="text-center">
            <div
              className="text-lg font-bold tracking-tight"
              style={{ color: progressColor }}
            >
              {value}
            </div>
            <div className="text-[9px] text-[#15130f]/50 dark:text-[#fbf8f1]/50 font-medium">
              / {targetValue}
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-2 mt-2">
        {/* Decrement Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleDecrement}
          disabled={isDisabled || isUpdating || value === 0}
          className="w-7 h-7 rounded-full bg-[#15130f]/10 dark:bg-[#fbf8f1]/10 hover:bg-[#15130f]/15 dark:hover:bg-[#fbf8f1]/15 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
          title={`Decrease by ${step}`}
        >
          <Minus className="w-3.5 h-3.5 text-[#15130f] dark:text-[#fbf8f1]" />
        </motion.button>

        {/* Direct Input */}
        <input
          type="number"
          value={value}
          onChange={(e) => handleDirectInput(e.target.value)}
          onBlur={handleBlur}
          disabled={isDisabled || isUpdating}
          className="w-16 h-7 text-center text-xs font-semibold bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 rounded-lg focus:outline-none focus:border-[#ff5a1f] disabled:opacity-40"
          min="0"
        />

        {/* Increment Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleIncrement}
          disabled={isDisabled || isUpdating}
          className="w-7 h-7 rounded-full bg-[#15130f]/10 dark:bg-[#fbf8f1]/10 hover:bg-[#15130f]/15 dark:hover:bg-[#fbf8f1]/15 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
          title={`Increase by ${step}`}
        >
          <Plus className="w-3.5 h-3.5 text-[#15130f] dark:text-[#fbf8f1]" />
        </motion.button>
      </div>

      {/* Unit Label */}
      <div className="text-[10px] text-center text-[#15130f]/60 dark:text-[#fbf8f1]/60 font-medium mt-1">
        {unit}
      </div>

      {/* Progress Percentage Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -top-1 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
        style={{ backgroundColor: `${progressColor}20`, color: progressColor }}
      >
        {progress}%
      </motion.div>

      {/* Completion Badge */}
      {isComplete && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="absolute -bottom-1 left-1/2 -translate-x-1/2"
        >
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
            <Target className="w-3 h-3 text-white" />
          </div>
        </motion.div>
      )}

      {/* Quick Presets Dropdown */}
      {quickPresets.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setShowPresets(!showPresets)}
            disabled={isDisabled || isUpdating}
            className="w-full text-[10px] font-semibold text-[#ff5a1f] hover:text-[#e04a12] disabled:opacity-40 transition-colors cursor-pointer"
          >
            Quick Add
          </button>

          <AnimatePresence>
            {showPresets && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-1 p-2 bg-white dark:bg-[#1c1a16] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 rounded-xl shadow-lg z-10"
              >
                <div className="flex gap-1.5">
                  {quickPresets.slice(0, 5).map((preset) => (
                    <motion.button
                      key={preset}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePresetClick(preset)}
                      className="px-2 py-1 text-xs font-semibold bg-[#f2ecdf] dark:bg-[#11100d] hover:bg-[#ff5a1f]/10 rounded-lg transition-colors cursor-pointer"
                    >
                      {preset}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/**
 * Compact horizontal variant for table cells
 */
export function NumericGoalInputCompact({
  habitId,
  habitTitle,
  currentValue: initialValue,
  targetValue,
  unit,
  quickPresets,
  step,
  color = '#ff5a1f',
  onUpdate,
  isDisabled = false,
}: NumericGoalInputProps) {
  const [value, setValue] = useState(initialValue);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const progress = calculateProgress(value, targetValue);
  const progressColor = getProgressColor(progress);

  const handleIncrement = async () => {
    if (isDisabled || isUpdating) return;
    const newValue = value + step;
    setValue(newValue);
    await updateValue(newValue);
  };

  const handleDecrement = async () => {
    if (isDisabled || isUpdating) return;
    const newValue = Math.max(0, value - step);
    setValue(newValue);
    await updateValue(newValue);
  };

  const updateValue = async (newValue: number) => {
    setIsUpdating(true);
    try {
      await onUpdate(habitId, newValue);
    } catch (error) {
      console.error('Failed to update numeric goal:', error);
      setValue(initialValue);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[#f2ecdf] dark:bg-[#11100d] rounded-lg border border-[#15130f]/10 dark:border-[#fbf8f1]/10">
      {/* Decrement */}
      <button
        onClick={handleDecrement}
        disabled={isDisabled || isUpdating || value === 0}
        className="w-6 h-6 rounded-md bg-[#15130f]/10 dark:bg-[#fbf8f1]/10 hover:bg-[#15130f]/15 dark:hover:bg-[#fbf8f1]/15 disabled:opacity-40 flex items-center justify-center transition-colors cursor-pointer"
        title={`-${step}`}
      >
        <Minus className="w-3 h-3" />
      </button>

      {/* Value Display */}
      <div className="flex items-center gap-1 min-w-[60px] justify-center">
        <span className="text-sm font-bold" style={{ color: progressColor }}>
          {value}
        </span>
        <span className="text-[10px] text-[#15130f]/40 dark:text-[#fbf8f1]/40">
          / {targetValue}
        </span>
      </div>

      {/* Increment */}
      <button
        onClick={handleIncrement}
        disabled={isDisabled || isUpdating}
        className="w-6 h-6 rounded-md bg-[#15130f]/10 dark:bg-[#fbf8f1]/10 hover:bg-[#15130f]/15 dark:hover:bg-[#fbf8f1]/15 disabled:opacity-40 flex items-center justify-center transition-colors cursor-pointer"
        title={`+${step}`}
      >
        <Plus className="w-3 h-3" />
      </button>

      {/* Progress Bar */}
      <div className="flex-1 h-1.5 bg-[#15130f]/10 dark:bg-[#fbf8f1]/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: progressColor }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Unit */}
      <span className="text-[9px] text-[#15130f]/50 dark:text-[#fbf8f1]/50 font-medium min-w-[32px]">
        {unit}
      </span>
    </div>
  );
}
