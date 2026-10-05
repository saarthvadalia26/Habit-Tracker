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
  isLeapYear,
  getDaysInYear,
} from '@/lib/heatmapUtils';

interface YearHeatmapMatrixProps {
  habits: HabitWithLogs[];
  initialYear?: number;
  selectedYear?: number;
  onYearChange?: (year: number) => void;
  isGuestMode?: boolean;
}

export function YearHeatmapMatrix({
  habits,
  initialYear = new Date().getFullYear(),
  selectedYear: controlledYear,
  onYearChange,
}: YearHeatmapMatrixProps) {
  const [internalYear, setInternalYear] = useState<number>(controlledYear ?? initialYear);
  const selectedYear = controlledYear ?? internalYear;

  const handleSelectYear = (yr: number) => {
    setInternalYear(yr);
    if (onYearChange) {
      onYearChange(yr);
    }
  };

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

  // Available selectable years (including leap years 2024 and 2028)
  const availableYears = [2024, 2025, 2026, 2027, 2028];

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
    if (day.isFuture) {
      if (clickedDay) setClickedDay(null);
      return;
    }

    const data = dayDataMap[day.dateString];
    if (!data) return;

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

  // Cell color helper based on intensity and habit selection (Framer Flame Palette)
  const getCellStyles = (day: HeatmapDay, data?: DayCompletionData) => {
    if (day.isFuture) {
      return 'bg-[#15130f]/4 dark:bg-[#fbf8f1]/4 border border-[#15130f]/6 dark:border-[#fbf8f1]/6 opacity-35 cursor-not-allowed';
    }

    if (!data || data.completedCount === 0) {
      return 'bg-[#15130f]/6 dark:bg-[#fbf8f1]/6 border border-[#15130f]/10 dark:border-[#fbf8f1]/10 hover:border-[#ff5a1f]/60';
    }

    // Single Habit Filtered
    if (activeHabit) {
      const isCompleted = data.habits[0]?.completed;
      if (isCompleted) {
        return 'text-white border border-[#ff5a1f] bg-[#ff5a1f] shadow-xs scale-[1.02]';
      }
      return 'bg-[#15130f]/6 dark:bg-[#fbf8f1]/6 border border-[#15130f]/10 dark:border-[#fbf8f1]/10';
    }

    // All Habits Mode - 4 Warm Flame Intensity Levels
    switch (data.intensityLevel) {
      case 4:
        return 'bg-[#ff5a1f] border border-[#ff5a1f] text-white shadow-[0_0_8px_rgba(255,90,31,0.45)]';
      case 3:
        return 'bg-[#ff5a1f]/75 border border-[#ff5a1f]/60';
      case 2:
        return 'bg-[#ff5a1f]/45 border border-[#ff5a1f]/35';
      case 1:
      default:
        return 'bg-[#ff5a1f]/20 border border-[#ff5a1f]/20';
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full space-y-4 select-none transition-all font-archivo"
    >
      {/* ========================================================================= */}
      {/* 1. TOP STAT CARDS (Warm Aesthetic) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Annual Consistency */}
        <div className="bg-[#fbf8f1] dark:bg-[#1c1a16] rounded-[22px] p-4 sm:p-5 border border-[#15130f]/10 dark:border-[#fbf8f1]/10 shadow-framer-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#15130f]/55 dark:text-[#fbf8f1]/55 font-archivo">
              Annual Adherence
            </span>
            <span className="w-7 h-7 rounded-full bg-[#ff5a1f]/10 text-[#ff5a1f] flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-[28px] font-clash font-semibold tracking-tight text-[#15130f] dark:text-[#fbf8f1]">
              {analytics.annualRate}%
            </span>
            <span className="text-xs text-[#15130f]/45 dark:text-[#fbf8f1]/45">
              of target
            </span>
          </div>
          <div className="mt-3 w-full bg-[#15130f]/8 dark:bg-[#fbf8f1]/8 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#ff5a1f] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, analytics.annualRate)}%` }}
            />
          </div>
        </div>

        {/* Card 2: Total Completions */}
        <div className="bg-[#fbf8f1] dark:bg-[#1c1a16] rounded-[22px] p-4 sm:p-5 border border-[#15130f]/10 dark:border-[#fbf8f1]/10 shadow-framer-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#15130f]/55 dark:text-[#fbf8f1]/55 font-archivo">
              Total Completions
            </span>
            <span className="w-7 h-7 rounded-full bg-[#15130f]/8 dark:bg-[#fbf8f1]/8 text-[#15130f] dark:text-[#fbf8f1] flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-[28px] font-clash font-semibold tracking-tight text-[#15130f] dark:text-[#fbf8f1]">
              {analytics.totalCompletions.toLocaleString()}
            </span>
            <span className="text-xs text-[#15130f]/45 dark:text-[#fbf8f1]/45">
              checkmarks
            </span>
          </div>
          <p className="mt-3 text-[11px] text-[#15130f]/55 dark:text-[#fbf8f1]/55 truncate">
            Across {habits.length} {habits.length === 1 ? 'habit' : 'habits'} in {selectedYear}
          </p>
        </div>

        {/* Card 3: Longest Yearly Streak */}
        <div className="bg-[#fbf8f1] dark:bg-[#1c1a16] rounded-[22px] p-4 sm:p-5 border border-[#15130f]/10 dark:border-[#fbf8f1]/10 shadow-framer-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#15130f]/55 dark:text-[#fbf8f1]/55 font-archivo">
              Longest Streak
            </span>
            <span className="w-7 h-7 rounded-full bg-[#ff5a1f]/10 text-[#ff5a1f] flex items-center justify-center">
              <Flame className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-[28px] font-clash font-semibold tracking-tight text-[#15130f] dark:text-[#fbf8f1]">
              {analytics.longestStreak}
            </span>
            <span className="text-xs text-[#15130f]/45 dark:text-[#fbf8f1]/45">
              {analytics.longestStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
          <p className="mt-3 text-[11px] text-[#15130f]/55 dark:text-[#fbf8f1]/55 truncate">
            Current unbroken streak: <strong className="text-[#ff5a1f] font-semibold">{analytics.currentStreak}d</strong>
          </p>
        </div>

        {/* Card 4: Perfect Days */}
        <div className="bg-[#fbf8f1] dark:bg-[#1c1a16] rounded-[22px] p-4 sm:p-5 border border-[#15130f]/10 dark:border-[#fbf8f1]/10 shadow-framer-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#15130f]/55 dark:text-[#fbf8f1]/55 font-archivo">
              Perfect Days
            </span>
            <span className="w-7 h-7 rounded-full bg-[#15130f]/8 dark:bg-[#fbf8f1]/8 text-[#15130f] dark:text-[#fbf8f1] flex items-center justify-center">
              <Award className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-[28px] font-clash font-semibold tracking-tight text-[#15130f] dark:text-[#fbf8f1]">
              {analytics.perfectDaysCount}
            </span>
            <span className="text-xs text-[#15130f]/45 dark:text-[#fbf8f1]/45">
              days
            </span>
          </div>
          <p className="mt-3 text-[11px] text-[#15130f]/55 dark:text-[#fbf8f1]/55 truncate">
            Best month: <strong className="text-[#ff5a1f] font-semibold">{analytics.bestMonthName} ({analytics.bestMonthRate}% avg)</strong>
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. HEATMAP MATRIX CONTAINER & TOOLBAR */}
      {/* ========================================================================= */}
      <div className="bg-[#fbf8f1] dark:bg-[#1c1a16] rounded-[26px] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 shadow-framer-card p-5 sm:p-6 transition-colors">
        {/* Controls Toolbar: Year Switcher + Habit Filter + Legend */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-5 border-b border-[#15130f]/10 dark:border-[#fbf8f1]/10">
          {/* Left: Year Switcher */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center bg-[#f2ecdf] dark:bg-[#11100d] p-1 rounded-full border border-[#15130f]/10 dark:border-[#fbf8f1]/10">
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => handleSelectYear(yr)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    selectedYear === yr
                      ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] shadow-sm'
                      : 'text-[#15130f]/70 dark:text-[#fbf8f1]/70 hover:text-[#ff5a1f] dark:hover:text-[#ff5a1f]'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>

            {isLeapYear(selectedYear) && (
              <span className="px-2.5 py-1 rounded-full text-[10.5px] font-semibold bg-[#ff5a1f]/10 text-[#ff5a1f] border border-[#ff5a1f]/25 tracking-tight flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a1f] animate-pulse" />
                366 Days · Leap Year
              </span>
            )}
          </div>

          {/* Right: Habit Filter Dropdown & Legend */}
          <div className="flex items-center gap-3.5 flex-wrap">
            {/* Habit Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#15130f]/40 dark:text-[#fbf8f1]/40" />
              <select
                aria-label="Filter heatmap by habit"
                value={selectedHabitId}
                onChange={(e) => setSelectedHabitId(e.target.value)}
                className="bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-[#15130f] dark:text-[#fbf8f1] text-xs font-semibold rounded-full px-3.5 py-1.5 outline-none cursor-pointer focus:border-[#ff5a1f] transition-colors"
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
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#15130f]/55 dark:text-[#fbf8f1]/55">
              <span>Less</span>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-[3px] bg-[#15130f]/6 dark:bg-[#fbf8f1]/6 border border-[#15130f]/10 dark:border-[#fbf8f1]/10" />
                <span className="w-2.5 h-2.5 rounded-[3px] bg-[#ff5a1f]/20 border border-[#ff5a1f]/20" />
                <span className="w-2.5 h-2.5 rounded-[3px] bg-[#ff5a1f]/45 border border-[#ff5a1f]/35" />
                <span className="w-2.5 h-2.5 rounded-[3px] bg-[#ff5a1f]/75 border border-[#ff5a1f]/60" />
                <span className="w-2.5 h-2.5 rounded-[3px] bg-[#ff5a1f] border border-[#ff5a1f]" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. THE 52-WEEK PANORAMIC GRID */}
        {/* ========================================================================= */}
        <div className="mt-5 overflow-x-auto pb-2">
          <div className="min-w-[820px] max-w-full">
            {/* Month Labels Row */}
            <div className="flex text-[11px] font-semibold text-[#15130f]/50 dark:text-[#fbf8f1]/50 mb-1.5 pl-8">
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
              <div className="flex flex-col gap-1 text-[9.5px] font-semibold text-[#15130f]/45 dark:text-[#fbf8f1]/45 pr-1 select-none">
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
                            className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[4px] opacity-0"
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
                          className={`relative w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[4px] transition-all duration-150 cursor-pointer ${cellStyles} ${
                            isClicked
                              ? 'ring-2 ring-[#ff5a1f] ring-offset-1 dark:ring-offset-[#1c1a16] z-20 scale-110 shadow-md'
                              : isHovered
                              ? 'ring-1.5 ring-[#15130f]/40 dark:ring-[#fbf8f1]/40 ring-offset-1 dark:ring-offset-[#1c1a16] z-10 scale-105'
                              : day.isToday
                              ? 'ring-2 ring-[#ff5a1f] ring-offset-1 dark:ring-offset-[#1c1a16] z-10'
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
        <div className="mt-4 pt-3.5 border-t border-[#15130f]/8 dark:border-[#fbf8f1]/8 flex flex-wrap items-center justify-between text-xs text-[#15130f]/60 dark:text-[#fbf8f1]/60">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#ff5a1f]" />
            <span>
              Click any square to inspect habits. Hover to preview date.
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#15130f]/45 dark:text-[#fbf8f1]/45">
            {analytics.daysPassedInYear} of {analytics.totalDaysInYear} days logged in {selectedYear}
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
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] shadow-xl text-xs font-semibold whitespace-nowrap border border-white/10 dark:border-black/10">
                <span>
                  {hoveredDay.day.date.toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                {hoveredDay.day.isToday && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#ff5a1f] text-white">
                    TODAY
                  </span>
                )}
                {hoveredDay.day.isFuture && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-white/20 dark:bg-black/20 text-[#fbf8f1]/70 dark:text-[#15130f]/70">
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
            <div className="bg-[#15130f] dark:bg-[#1c1a16] border border-[#fbf8f1]/15 dark:border-[#fbf8f1]/15 shadow-2xl rounded-[22px] p-4 text-[#fbf8f1]">
              {/* Popover Header */}
              <div className="flex items-center justify-between border-b border-[#fbf8f1]/10 pb-2.5 mb-2.5">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold font-clash tracking-tight text-[#fbf8f1] truncate">
                      {clickedDay.day.date.toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    {clickedDay.day.isToday && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#ff5a1f] text-white">
                        TODAY
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#fbf8f1]/60 mt-0.5">
                    {clickedDay.day.isFuture
                      ? 'Future date'
                      : `${clickedDay.data.completedCount} of ${clickedDay.data.totalHabits} completed (${Math.round(clickedDay.data.completionRate * 100)}%)`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setClickedDay(null)}
                  className="p-1 rounded-full text-[#fbf8f1]/50 hover:text-[#fbf8f1] hover:bg-[#fbf8f1]/10 transition-colors cursor-pointer shrink-0"
                  title="Close (Esc)"
                  aria-label="Close habits list"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Habit Completion Scrollable List */}
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {clickedDay.data.habits.length === 0 ? (
                  <p className="text-[11px] text-[#fbf8f1]/50 italic py-1">No habits recorded</p>
                ) : (
                  clickedDay.data.habits.map((habit) => (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between text-xs py-1.5 px-2 rounded-xl hover:bg-[#fbf8f1]/5 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: habit.color || '#ff5a1f' }}
                        />
                        <span
                          className={`truncate text-xs ${
                            habit.completed
                              ? 'text-[#fbf8f1] font-medium'
                              : 'text-[#fbf8f1]/40 line-through'
                          }`}
                        >
                          {habit.title}
                        </span>
                      </div>

                      {habit.completed ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#ff5a1f]/20 text-[#ff5a1f] text-[10px] font-bold flex items-center gap-1 shrink-0">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          Done
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#fbf8f1]/40 shrink-0">
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
