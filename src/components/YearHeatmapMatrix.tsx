'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  CheckCircle2,
  TrendingUp,
  Award,
  Filter,
  Info,
  Check,
  X as CloseIcon,
} from 'lucide-react';
import { HabitWithLogs } from '@/types/database.types';
import {
  generateYearMatrix,
  computeHeatmapData,
  DayCompletionData,
  HeatmapDay,
} from '@/lib/heatmapUtils';

interface YearHeatmapMatrixProps {
  habits: HabitWithLogs[];
  initialYear?: number;
  isGuestMode?: boolean;
}

export function YearHeatmapMatrix({
  habits,
  initialYear = new Date().getFullYear(),
}: YearHeatmapMatrixProps) {
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [selectedHabitId, setSelectedHabitId] = useState<'all' | string>('all');
  const [hoveredDay, setHoveredDay] = useState<{
    day: HeatmapDay;
    coords: { x: number; y: number; openBelow: boolean };
  } | null>(null);

  const [clickedDay, setClickedDay] = useState<{
    day: HeatmapDay;
    data: DayCompletionData;
    coords: { x: number; y: number; openBelow: boolean };
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popovers on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (clickedDay) setClickedDay(null);
        if (hoveredDay) setHoveredDay(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clickedDay, hoveredDay]);

  // Click-outside listener to dismiss the clicked habits popover
  useEffect(() => {
    if (!clickedDay) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        !target.closest('[data-heatmap-cell]')
      ) {
        setClickedDay(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [clickedDay]);

  // Available selectable years (previous, current, next)
  const availableYears = [2025, 2026, 2027];

  // 1. Generate 52-53 week grid structure for selected year
  const matrix = useMemo(() => {
    return generateYearMatrix(selectedYear);
  }, [selectedYear]);

  // 2. Compute metrics and completion levels
  const { dayDataMap, analytics } = useMemo(() => {
    return computeHeatmapData(selectedYear, matrix.days, habits, selectedHabitId);
  }, [selectedYear, matrix.days, habits, selectedHabitId]);

  // Selected habit info (if filtered)
  const activeHabit = useMemo(() => {
    if (selectedHabitId === 'all') return null;
    return habits.find((h) => h.id === selectedHabitId) || null;
  }, [selectedHabitId, habits]);

  // Group days into columns by weekIndex (0 to totalWeeks - 1)
  const columns = useMemo(() => {
    const cols: (HeatmapDay | null)[][] = Array.from(
      { length: matrix.totalWeeks },
      () => Array(7).fill(null)
    );

    matrix.days.forEach((day) => {
      if (cols[day.weekIndex]) {
        cols[day.weekIndex][day.dayOfWeek] = day;
      }
    });

    return cols;
  }, [matrix]);

  // Coordinate calculation for lightweight hover date tooltip
  const calculateHoverCoords = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect() || {
      left: 0,
      top: 0,
      width: 800,
    };

    const relX = rect.left - containerRect.left + rect.width / 2;
    const relY = rect.top - containerRect.top;
    const containerWidth = containerRect.width || 800;
    const clampedX = Math.max(75, Math.min(containerWidth - 75, relX));
    const openBelow = relY < 40;

    return { x: clampedX, y: relY, openBelow };
  };

  // Coordinate calculation for clicked habits list popover
  const calculateClickCoords = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect() || {
      left: 0,
      top: 0,
      width: 800,
    };

    const relX = rect.left - containerRect.left + rect.width / 2;
    const relY = rect.top - containerRect.top;
    const containerWidth = containerRect.width || 800;
    const clampedX = Math.max(145, Math.min(containerWidth - 145, relX));
    const openBelow = relY < 230;

    return { x: clampedX, y: relY, openBelow };
  };

  // Hovering on a square: ONLY show the date
  const handleCellMouseEnter = (
    e: React.MouseEvent<HTMLButtonElement>,
    day: HeatmapDay
  ) => {
    const coords = calculateHoverCoords(e.currentTarget);
    setHoveredDay({ day, coords });
  };

  const handleCellMouseLeave = () => {
    setHoveredDay(null);
  };

  // Clicking on a square: Show the full habits checklist (past/today only)
  const handleCellClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    day: HeatmapDay
  ) => {
    // Future dates cannot be inspected or opened for habit lists
    if (day.isFuture) {
      if (clickedDay) setClickedDay(null);
      return;
    }

    const data = dayDataMap[day.dateString];
    if (!data) return;

    // Toggle close if clicking the already open day
    if (clickedDay?.day.dateString === day.dateString) {
      setClickedDay(null);
      return;
    }

    const coords = calculateClickCoords(e.currentTarget);
    setClickedDay({
      day,
      data,
      coords,
    });
  };

  // Cell color helper based on intensity and habit selection
  const getCellStyles = (day: HeatmapDay, data?: DayCompletionData) => {
    if (day.isFuture) {
      return 'bg-slate-100/60 dark:bg-slate-800/30 border border-slate-200/40 dark:border-slate-800/40 opacity-40 cursor-default';
    }

    if (!data || data.completedCount === 0) {
      return 'bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 hover:border-slate-400 dark:hover:border-slate-500';
    }

    // Single Habit Filtered
    if (activeHabit) {
      const isCompleted = data.habits[0]?.completed;
      if (isCompleted) {
        return 'text-white border border-white/20 shadow-xs scale-[1.02]';
      }
      return 'bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60';
    }

    // All Habits Mode - 4 Intensity Levels
    switch (data.intensityLevel) {
      case 4:
        return 'bg-cyan-400 dark:bg-cyan-500 border border-cyan-300 dark:border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.45)]';
      case 3:
        return 'bg-indigo-500 dark:bg-indigo-500 border border-indigo-400 dark:border-indigo-400';
      case 2:
        return 'bg-indigo-400 dark:bg-indigo-700 border border-indigo-400/80 dark:border-indigo-600';
      case 1:
      default:
        return 'bg-indigo-200 dark:bg-indigo-950/80 border border-indigo-300 dark:border-indigo-800';
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full space-y-4 select-none transition-all"
    >
      {/* ========================================================================= */}
      {/* 1. TOP STAT CARDS (Annual Highlights & Consistency) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Annual Consistency */}
        <div className="bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800/90 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">
              Annual Adherence
            </span>
            <span className="p-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/50">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
              {analytics.annualRate}%
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              of target
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, analytics.annualRate)}%` }}
            />
          </div>
        </div>

        {/* Card 2: Total Completions */}
        <div className="bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800/90 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">
              Total Completions
            </span>
            <span className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
              {analytics.totalCompletions.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              checkmarks
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Across {habits.length} {habits.length === 1 ? 'habit' : 'habits'} in {selectedYear}
          </p>
        </div>

        {/* Card 3: Longest Yearly Streak */}
        <div className="bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800/90 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">
              Longest Streak
            </span>
            <span className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
              <Flame className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
              {analytics.longestStreak}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {analytics.longestStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Current unbroken streak: <strong className="text-amber-500 font-mono">{analytics.currentStreak}d</strong>
          </p>
        </div>

        {/* Card 4: Perfect Days */}
        <div className="bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800/90 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">
              Perfect Days
            </span>
            <span className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
              <Award className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
              {analytics.perfectDaysCount}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {analytics.perfectDaysCount === 1 ? 'day (all habits done)' : 'days (all habits done)'}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Best month: <strong className="text-emerald-500 font-mono">{analytics.bestMonthName} ({analytics.bestMonthRate}% avg)</strong>
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. HEATMAP MATRIX CONTAINER & TOOLBAR */}
      {/* ========================================================================= */}
      <div className="bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-xl dark:shadow-2xl overflow-hidden p-4 sm:p-6 transition-colors">
        {/* Controls Toolbar: Year Switcher + Habit Filter + Legend */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-5 border-b border-slate-200 dark:border-slate-800">
          {/* Left: Year Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedYear(yr)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedYear === yr
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              · 52-Week Overview
            </span>
          </div>

          {/* Right: Habit Filter Dropdown & Legend */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Habit Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                aria-label="Filter heatmap by habit"
                value={selectedHabitId}
                onChange={(e) => setSelectedHabitId(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-1.5 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="all">All Habits (Combined Overview)</option>
                {habits.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Matrix Legend */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span>Less</span>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
                {activeHabit ? (
                  <span
                    className="w-2.5 h-2.5 rounded-xs border border-white/20"
                    style={{ backgroundColor: activeHabit.color_theme }}
                  />
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-xs bg-indigo-200 dark:bg-indigo-950 border border-indigo-300 dark:border-indigo-800" />
                    <span className="w-2.5 h-2.5 rounded-xs bg-indigo-400 dark:bg-indigo-700 border border-indigo-500" />
                    <span className="w-2.5 h-2.5 rounded-xs bg-indigo-600 dark:bg-indigo-500 border border-indigo-400" />
                    <span className="w-2.5 h-2.5 rounded-xs bg-cyan-400 dark:bg-cyan-500 border border-cyan-300" />
                  </>
                )}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. THE 52-WEEK PANORAMIC GRID */}
        {/* ========================================================================= */}
        <div className="mt-5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          <div className="min-w-[820px] max-w-full">
            {/* Month Labels Row */}
            <div className="flex text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500 mb-1 pl-8">
              {matrix.monthHeaders.map((m, idx) => (
                <div
                  key={m.monthIndex}
                  style={{
                    marginLeft: idx === 0 ? 0 : undefined,
                    flex: idx === matrix.monthHeaders.length - 1 ? 1 : undefined,
                    width:
                      idx < matrix.monthHeaders.length - 1
                        ? `${(matrix.monthHeaders[idx + 1].weekIndex - m.weekIndex) * 15}px`
                        : undefined,
                  }}
                  className="truncate"
                >
                  {m.shortName}
                </div>
              ))}
            </div>

            {/* Grid Body: Day of Week labels + Week Columns */}
            <div className="flex gap-1.5 items-start">
              {/* Day Labels (Mon, Wed, Fri) */}
              <div className="flex flex-col gap-1 text-[9px] font-mono text-slate-400 dark:text-slate-500 pr-1 select-none">
                <span className="h-3 sm:h-3.5 leading-none flex items-center">Mon</span>
                <span className="h-3 sm:h-3.5 leading-none flex items-center opacity-0">Tue</span>
                <span className="h-3 sm:h-3.5 leading-none flex items-center">Wed</span>
                <span className="h-3 sm:h-3.5 leading-none flex items-center opacity-0">Thu</span>
                <span className="h-3 sm:h-3.5 leading-none flex items-center">Fri</span>
                <span className="h-3 sm:h-3.5 leading-none flex items-center opacity-0">Sat</span>
                <span className="h-3 sm:h-3.5 leading-none flex items-center">Sun</span>
              </div>

              {/* Columns of 7 Days */}
              <div className="flex gap-1 flex-1">
                {columns.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-1">
                    {week.map((day, dayIdx) => {
                      if (!day) {
                        return (
                          <div
                            key={`empty-${weekIdx}-${dayIdx}`}
                            className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[3px] opacity-0"
                          />
                        );
                      }

                      const data = dayDataMap[day.dateString];
                      const cellStyles = getCellStyles(day, data);
                      const isSingleCompleted =
                        activeHabit && data?.habits[0]?.completed;

                      const isClicked =
                        clickedDay?.day.dateString === day.dateString;
                      const isHovered =
                        hoveredDay?.day.dateString === day.dateString;

                      return (
                        <button
                          key={day.dateString}
                          type="button"
                          data-heatmap-cell="true"
                          onMouseEnter={(e) => handleCellMouseEnter(e, day)}
                          onMouseLeave={handleCellMouseLeave}
                          onClick={(e) => handleCellClick(e, day)}
                          style={
                            isSingleCompleted
                              ? {
                                  backgroundColor: activeHabit.color_theme,
                                  boxShadow: `0 0 8px ${activeHabit.color_theme}66`,
                                }
                              : undefined
                          }
                          aria-disabled={day.isFuture}
                          aria-label={`${day.dateString}: ${day.isFuture ? 'Future date' : `${data?.completedCount ?? 0} habits completed`}`}
                          className={`relative w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[3px] transition-all duration-150 ${
                            day.isFuture ? 'cursor-default' : 'cursor-pointer'
                          } ${cellStyles} ${
                            isClicked
                              ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 ring-offset-1 dark:ring-offset-slate-900 z-20 scale-110 shadow-md'
                              : isHovered
                              ? 'ring-1.5 ring-slate-400 dark:ring-slate-300 ring-offset-1 dark:ring-offset-slate-900 z-10 scale-105'
                              : day.isToday
                              ? 'ring-2 ring-cyan-400 dark:ring-cyan-300 ring-offset-1 dark:ring-offset-slate-900 z-10'
                              : ''
                          }`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer info note */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-500" />
            <span>
              Click any square to view habits list. Hover to preview date.
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            {analytics.daysPassedInYear} of {analytics.totalDaysInYear} days logged
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. HOVER TOOLTIP: ONLY SHOWS DATE */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {hoveredDay &&
          (!clickedDay || clickedDay.day.dateString !== hoveredDay.day.dateString) && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.94,
                y: hoveredDay.coords.openBelow ? -4 : 4,
              }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.1 }}
              style={{
                left: `${hoveredDay.coords.x}px`,
                top: hoveredDay.coords.openBelow
                  ? `${hoveredDay.coords.y + 20}px`
                  : `${hoveredDay.coords.y - 6}px`,
                transform: hoveredDay.coords.openBelow
                  ? 'translate(-50%, 0%)'
                  : 'translate(-50%, -100%)',
              }}
              className="absolute z-40 pointer-events-none"
            >
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-700/80 shadow-xl text-[11px] font-mono font-medium text-slate-100 whitespace-nowrap">
                <span>
                  {hoveredDay.day.date.toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                {hoveredDay.day.isToday && (
                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-cyan-500/25 text-cyan-300 border border-cyan-500/35">
                    TODAY
                  </span>
                )}
                {hoveredDay.day.isFuture && (
                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700/80">
                    FUTURE
                  </span>
                )}
              </div>
            </motion.div>
          )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 5. CLICK POPOVER: HABITS LIST */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {clickedDay && (
          <motion.div
            ref={popoverRef}
            initial={{
              opacity: 0,
              scale: 0.94,
              y: clickedDay.coords.openBelow ? -8 : 8,
            }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: 0.94,
              y: clickedDay.coords.openBelow ? -8 : 8,
            }}
            transition={{ duration: 0.14 }}
            style={{
              left: `${clickedDay.coords.x}px`,
              top: clickedDay.coords.openBelow
                ? `${clickedDay.coords.y + 22}px`
                : `${clickedDay.coords.y - 10}px`,
              transform: clickedDay.coords.openBelow
                ? 'translate(-50%, 0%)'
                : 'translate(-50%, -100%)',
            }}
            className="absolute z-50 pointer-events-auto w-72 max-w-[92vw]"
          >
            <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl rounded-2xl p-3.5 text-slate-100">
              {/* Popover Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white font-mono truncate">
                      {clickedDay.day.date.toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    {clickedDay.day.isToday && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        TODAY
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {clickedDay.day.isFuture
                      ? 'Future date'
                      : `${clickedDay.data.completedCount} of ${clickedDay.data.totalHabits} completed (${Math.round(clickedDay.data.completionRate * 100)}%)`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setClickedDay(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  title="Close (Esc)"
                  aria-label="Close habits list"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Habit Completion Scrollable List */}
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                {clickedDay.data.habits.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic py-1">No habits recorded</p>
                ) : (
                  clickedDay.data.habits.map((habit) => (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: habit.color }}
                        />
                        <span
                          className={`truncate text-xs ${
                            habit.completed
                              ? 'text-slate-100 font-semibold'
                              : 'text-slate-500 line-through'
                          }`}
                        >
                          {habit.title}
                        </span>
                      </div>

                      {habit.completed ? (
                        <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1 shrink-0">
                          <Check className="w-3 h-3 text-emerald-400 stroke-[2.5]" />
                          Done
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                          Missed
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
