'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

interface CircularGaugeProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  label?: string;
  sublabel?: string;
  showTickMarks?: boolean;
  containerClassName?: string;
  valueClassName?: string;
  labelClassName?: string;
}

export function CircularGauge({
  percentage,
  size = 110,
  strokeWidth = 9,
  color = '#FB7185', // Neon Rose default
  bgColor,
  label,
  sublabel,
  showTickMarks = true,
  containerClassName,
  valueClassName,
  labelClassName,
}: CircularGaugeProps) {
  const { isDark } = useTheme();
  const trackColor = bgColor ?? (isDark ? '#1E293B' : '#E2E8F0');
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  // Adaptive font size if valueClassName is not explicitly provided
  const defaultTextClass =
    valueClassName ??
    (size <= 60
      ? 'text-[11px] font-black'
      : size <= 85
      ? 'text-sm sm:text-base font-black'
      : 'text-xl sm:text-2xl font-black');

  // Subtle glow blur proportional to circle size
  const glowBlur = Math.max(2, Math.min(6, Math.round(size * 0.05)));

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div
        className={`relative flex items-center justify-center ${containerClassName || ''}`}
        style={containerClassName ? undefined : { width: size, height: size }}
      >
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full transform -rotate-90 origin-center"
        >
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />

          {/* Animated active progress arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 ${glowBlur}px ${color}70)`,
            }}
          />
        </svg>

        {/* Center Percentage Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-1">
          <span
            className={`${defaultTextClass} text-slate-900 dark:text-slate-100 tracking-tight font-mono transition-colors text-center leading-none`}
          >
            {clampedPercentage}%
          </span>
          {sublabel && (
            <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider mt-0.5 text-center leading-none">
              {sublabel}
            </span>
          )}
        </div>

        {/* Outer subtle percentage indicator if enabled */}
        {showTickMarks && (
          <div className="absolute -top-1 -left-1 text-[9px] text-slate-400 dark:text-slate-500 font-mono">
            {clampedPercentage}%
          </div>
        )}
      </div>

      {label && (
        <span
          className={
            labelClassName ??
            'mt-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 tracking-tight text-center'
          }
        >
          {label}
        </span>
      )}
    </div>
  );
}