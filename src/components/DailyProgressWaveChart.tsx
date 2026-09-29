'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { DayMetric } from '@/lib/analytics';
import { useTheme } from '@/context/ThemeContext';

interface DailyProgressWaveChartProps {
  dayMetrics: DayMetric[];
  color?: string;
}

export function DailyProgressWaveChart({
  dayMetrics,
  color = '#FB7185', // Neon Pink/Rose
}: DailyProgressWaveChartProps) {
  const { isDark } = useTheme();
  const [hoveredDay, setHoveredDay] = useState<DayMetric | null>(null);

  const { pathData, areaData, points } = useMemo(() => {
    if (dayMetrics.length === 0) return { pathData: '', areaData: '', points: [] };

    const width = 600;
    const height = 90;
    const paddingX = 12;
    const paddingY = 12;

    const availableWidth = width - paddingX * 2;
    const availableHeight = height - paddingY * 2;

    const maxPercentage = Math.max(...dayMetrics.map((d) => d.percentage), 100);

    const calculatedPoints = dayMetrics.map((day, idx) => {
      const x = paddingX + (idx / Math.max(1, dayMetrics.length - 1)) * availableWidth;
      const normalizedY = day.percentage / maxPercentage;
      const y = height - paddingY - normalizedY * availableHeight;
      return { x, y, day };
    });

    if (calculatedPoints.length === 1) {
      const p = calculatedPoints[0];
      return {
        pathData: `M ${p.x} ${p.y}`,
        areaData: '',
        points: calculatedPoints,
      };
    }

    // Build smooth cubic Bezier spline
    let path = `M ${calculatedPoints[0].x} ${calculatedPoints[0].y}`;

    for (let i = 0; i < calculatedPoints.length - 1; i++) {
      const current = calculatedPoints[i];
      const next = calculatedPoints[i + 1];
      const midX = (current.x + next.x) / 2;
      path += ` C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
    }

    const firstX = calculatedPoints[0].x;
    const lastX = calculatedPoints[calculatedPoints.length - 1].x;
    const area = `${path} L ${lastX} ${height} L ${firstX} ${height} Z`;

    return { pathData: path, areaData: area, points: calculatedPoints };
  }, [dayMetrics]);

  return (
    <div className="relative w-full h-full flex flex-col justify-between">
      <div className="flex items-center justify-between px-2 pt-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest text-slate-600 dark:text-slate-400 uppercase font-mono">
            DAILY PROGRESS
          </span>
        </div>
        {hoveredDay ? (
          <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800/60 px-2.5 py-0.5 rounded-full shadow-xs">
            Day {hoveredDay.dayNumber}: {hoveredDay.completedCount} done ({hoveredDay.percentage}%)
          </span>
        ) : (
          <span className="text-[10px] font-mono text-slate-500">
            Monthly Completion Wave
          </span>
        )}
      </div>

      <div className="relative w-full h-16 sm:h-20 overflow-hidden">
        <svg
          viewBox="0 0 600 90"
          className="w-full h-full preserve-3d"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveDarkGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={isDark ? 0.4 : 0.25} />
              <stop offset="70%" stopColor={color} stopOpacity={isDark ? 0.08 : 0.04} />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={color} floodOpacity={isDark ? 0.4 : 0.2} />
            </filter>
          </defs>

          {/* Area fill */}
          {areaData && (
            <motion.path
              d={areaData}
              fill="url(#waveDarkGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            />
          )}

          {/* Curve stroke */}
          {pathData && (
            <motion.path
              d={pathData}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="url(#neonGlow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />
          )}

          {/* Interactive touch/hover points */}
          {points.map((pt) => (
            <circle
              key={pt.day.dateString}
              cx={pt.x}
              cy={pt.y}
              r={hoveredDay?.dateString === pt.day.dateString ? '4.5' : '2'}
              fill={hoveredDay?.dateString === pt.day.dateString ? color : isDark ? '#0F172A' : '#FFFFFF'}
              stroke={color}
              strokeWidth="1.5"
              className="cursor-pointer transition-all duration-150 hover:r-4"
              onMouseEnter={() => setHoveredDay(pt.day)}
              onMouseLeave={() => setHoveredDay(null)}
              onTouchStart={() => setHoveredDay(pt.day)}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
