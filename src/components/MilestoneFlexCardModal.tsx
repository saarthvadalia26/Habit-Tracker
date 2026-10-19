'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Share2,
  Download,
  Check,
  Flame,
  Trophy,
  Target,
  Smartphone,
  Square,
  LayoutTemplate,
  Quote,
  User,
  CheckCircle2,
  Loader2,
  Eye,
  Sliders,
  RefreshCw,
  ShieldCheck,
  Lock,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { HabitWithLogs } from '@/types/database.types';
import { Challenge } from '@/types/challenge.types';
import { calculateContinuousStreak } from '@/lib/analytics';
import { MOTIVATION_QUOTES } from '@/lib/quotes';
import { formatDateToISO } from '@/lib/dateUtils';
import { computeChallengeProgress } from '@/lib/challengeUtils';
import {
  FlexCardFormat,
  FlexCardTheme,
  FlexCardData,
  ThemeColors,
  FLEX_CARD_THEMES,
  FORMAT_DIMENSIONS,
  renderFlexCardToCanvas,
  downloadCanvasAsPng,
  shareCanvasImage,
} from '@/lib/cardExportUtils';

interface MilestoneFlexCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: HabitWithLogs[];
  challenge?: Challenge | null;
  userName?: string | null;
  userEmail?: string | null;
  isGuestMode?: boolean;
  onRequireAuth?: () => void;
  longestStreak?: number;
  todayCompletionRate?: number;
  initialHabitId?: string;
  initialMode?: 'streak' | 'today' | 'challenge' | 'habit';
  initialShowGuide?: boolean;
}

type CardMode = 'streak' | 'today' | 'challenge' | 'habit';

/**
 * Official Brand Logo Component ("H.")
 * Squircle badge rendering the brand's bold Grotesque H and signature accent dot.
 */
function BrandLogoIcon({ size = 18, theme }: { size?: number; theme: ThemeColors }) {
  const isIvory = theme.name === 'Warm Ivory';
  const chipBg = isIvory ? 'rgba(21, 19, 15, 0.08)' : 'rgba(255, 255, 255, 0.08)';

  return (
    <div
      className="rounded-[5.5px] flex items-center justify-center shrink-0 shadow-xs overflow-hidden"
      style={{
        width: size,
        height: size,
        background: chipBg,
        border: `1px solid ${theme.cardBorder}`,
      }}
    >
      <svg viewBox="0 0 512 512" className="w-[78%] h-[78%]">
        <path
          d="M 148 116 L 222 116 L 222 224 L 290 224 L 290 116 L 364 116 L 364 396 L 290 396 L 290 288 L 222 288 L 222 396 L 148 396 Z"
          fill={theme.primaryText}
        />
        <circle cx="410" cy="368" r="32" fill={theme.accent} />
      </svg>
    </div>
  );
}

/**
 * Razor-Sharp Vector DOM Preview Card Component
 * Eliminates all downsampling blur by rendering native CSS vectors & typography.
 */
function FlexCardVectorPreview({
  data,
  themeKey,
  format,
}: {
  data: FlexCardData;
  themeKey: FlexCardTheme;
  format: FlexCardFormat;
}) {
  const theme = FLEX_CARD_THEMES[themeKey] || FLEX_CARD_THEMES.obsidian;
  const fallbackDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((label) => ({
    label,
    completed: false,
    isFuture: false,
  }));
  const weeklyDots = data.weeklyDots && data.weeklyDots.length === 7 ? data.weeklyDots : fallbackDays;
  const pct = Math.min(100, Math.max(0, Math.round(data.completionRate ?? 0)));

  const dotGridBg =
    themeKey === 'ivory'
      ? 'radial-gradient(rgba(0,0,0,0.06) 1.2px, transparent 1.2px)'
      : 'radial-gradient(rgba(255,255,255,0.06) 1.2px, transparent 1.2px)';

  const dividerColor =
    themeKey === 'ivory'
      ? 'rgba(21, 19, 15, 0.12)'
      : 'rgba(255, 255, 255, 0.12)';

  const userFooterLabel =
    data.showUser !== false && data.userName && data.userName.trim()
      ? `DISCIPLINE BY ${data.userName.trim().toUpperCase()}`
      : (data.footerLabel || 'HABIT TRACKER ARCHIVE');

  if (format === 'landscape') {
    return (
      <div
        className="w-full h-full relative rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between overflow-hidden select-none"
        style={{
          background: `linear-gradient(135deg, ${theme.backgroundStart}, ${theme.backgroundEnd})`,
          border: `1.5px solid ${theme.cardBorder}`,
          color: theme.primaryText,
        }}
      >
        {/* Glow orbs & Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-80"
          style={{ backgroundImage: dotGridBg, backgroundSize: '16px 16px' }}
        />
        <div
          className="absolute -top-10 -left-10 w-44 h-44 rounded-full pointer-events-none blur-2xl opacity-60"
          style={{ background: theme.accentGlow }}
        />
        <div
          className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full pointer-events-none blur-2xl opacity-60"
          style={{ background: theme.accentGlow }}
        />

        {/* Top Header */}
        <div
          className="relative z-10 w-full flex items-center justify-between border-b pb-1.5 shrink-0"
          style={{ borderColor: dividerColor }}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <BrandLogoIcon size={18} theme={theme} />
            <span
              className="font-clash font-bold text-[10.5px] tracking-tight shrink-0"
              style={{ whiteSpace: 'nowrap' }}
            >
              HABIT TRACKER
            </span>
          </div>
          {data.dateStr && (
            <span
              className="text-[8.5px] font-bold uppercase tracking-wider opacity-60 shrink-0"
              style={{ whiteSpace: 'nowrap' }}
            >
              {data.dateStr}
            </span>
          )}
        </div>

        {/* 2-Column Middle Grid */}
        <div className="relative z-10 grid grid-cols-2 gap-3 my-auto py-1 items-center">
          {/* Left Col: Hero */}
          <div className="flex flex-col justify-center gap-0.5 min-w-0">
            <span
              className="self-start px-2 py-0.5 rounded-full text-[7.5px] font-bold tracking-wider uppercase border truncate max-w-full"
              style={{
                background: theme.pillBg,
                borderColor: theme.accent,
                color: theme.pillText,
                whiteSpace: 'nowrap',
              }}
            >
              {data.badgeText}
            </span>

            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-clash font-extrabold text-[34px] sm:text-[38px] leading-none tracking-tight">
                {data.metricValue}
              </span>
              {data.metricUnit && (
                <span
                  className="text-[9px] font-bold uppercase tracking-wider leading-none"
                  style={{ color: theme.accent, whiteSpace: 'nowrap' }}
                >
                  {data.metricUnit}
                </span>
              )}
            </div>

            <h4 className="font-clash font-bold text-[11.5px] leading-tight truncate">
              {data.title}
            </h4>
            <p
              className="text-[8.5px] leading-snug line-clamp-2"
              style={{ color: theme.secondaryText }}
            >
              {data.subtitle}
            </p>
          </div>

          {/* Right Col: Stats & Quote / Dots */}
          <div className="flex flex-col gap-1.5 min-w-0">
            {/* Routine & Adherence card */}
            <div
              className="p-1.5 rounded-xl border flex items-center justify-between gap-1.5"
              style={{
                background: theme.cardBg,
                borderColor: theme.cardBorder,
              }}
            >
              <div className="min-w-0 flex-1">
                <span className="text-[7px] font-semibold block uppercase tracking-wider opacity-60 leading-none">
                  TARGET ROUTINE
                </span>
                <span className="font-bold text-[10px] truncate block mt-0.5">
                  {data.habitTitle || 'Core Stack'}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[7px] font-semibold block uppercase tracking-wider opacity-60 leading-none">
                  ADHERENCE
                </span>
                <span className="font-clash font-extrabold text-[12px] block mt-0.5" style={{ color: theme.accent }}>
                  {pct}%
                </span>
                {data.adherenceLabel && (
                  <span className="text-[6.5px] block opacity-60 truncate">
                    {data.adherenceLabel}
                  </span>
                )}
              </div>
            </div>

            {/* Quote box OR Consistency Cadence */}
            {data.showQuote !== false ? (
              <div
                className="p-1.5 rounded-xl border flex flex-col justify-center min-w-0"
                style={{
                  background: theme.quoteBoxBg,
                  borderColor: theme.quoteBoxBorder,
                }}
              >
                <div className="flex gap-1 items-start min-w-0">
                  <span className="font-serif text-xs leading-none opacity-80 shrink-0" style={{ color: theme.accent }}>
                    “
                  </span>
                  <p className="text-[8px] italic font-serif leading-tight line-clamp-2">
                    {data.quote}
                  </p>
                </div>
                <span
                  className="text-[7.5px] font-semibold mt-0.5 self-end truncate max-w-full"
                  style={{ color: theme.accent }}
                >
                  — {data.quoteAuthor}
                </span>
              </div>
            ) : (
              <div
                className="p-1.5 rounded-xl border flex flex-col justify-center gap-0.5"
                style={{
                  background: theme.cardBg,
                  borderColor: theme.cardBorder,
                }}
              >
                <span className="text-[7px] font-bold uppercase tracking-wider opacity-60">
                  7-DAY CADENCE
                </span>
                <div className="flex items-center justify-between pt-0.5">
                  {weeklyDots.map((dot, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      {dot.completed ? (
                        <div
                          className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 shadow-xs"
                          style={{ background: theme.accent }}
                        >
                          <div className="w-1 h-1 rounded-full bg-white shadow-xs" />
                        </div>
                      ) : dot.isFuture ? (
                        <div className="w-3.5 h-3.5 rounded-full border border-dashed border-current opacity-25 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-current opacity-30 flex items-center justify-center shrink-0">
                          <div className="w-1 h-1 rounded-full bg-current opacity-30" />
                        </div>
                      )}
                      <span className="text-[7px] font-bold tracking-wider opacity-60">{dot.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="relative z-10 flex items-center justify-between text-[7.5px] font-semibold border-t pt-1 opacity-75 shrink-0"
          style={{ borderColor: dividerColor }}
        >
          <span className="truncate max-w-[65%]" style={{ whiteSpace: 'nowrap' }}>{userFooterLabel}</span>
          <span className="shrink-0 font-bold" style={{ whiteSpace: 'nowrap' }}>HABIT TRACKER</span>
        </div>
      </div>
    );
  }

  if (format === 'square') {
    return (
      <div
        className="w-full h-full relative rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between overflow-hidden select-none"
        style={{
          background: `linear-gradient(135deg, ${theme.backgroundStart}, ${theme.backgroundEnd})`,
          border: `1.5px solid ${theme.cardBorder}`,
          color: theme.primaryText,
        }}
      >
        {/* Glow orbs & Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-80"
          style={{ backgroundImage: dotGridBg, backgroundSize: '16px 16px' }}
        />
        <div
          className="absolute -top-12 -left-12 w-48 h-48 rounded-full pointer-events-none blur-2xl opacity-60"
          style={{ background: theme.accentGlow }}
        />
        <div
          className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full pointer-events-none blur-2xl opacity-60"
          style={{ background: theme.accentGlow }}
        />

        {/* Header */}
        <div
          className="relative z-10 w-full flex items-center justify-between border-b pb-1.5 shrink-0"
          style={{ borderColor: dividerColor }}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <BrandLogoIcon size={18} theme={theme} />
            <span
              className="font-clash font-bold text-[10.5px] tracking-tight shrink-0"
              style={{ whiteSpace: 'nowrap' }}
            >
              HABIT TRACKER
            </span>
          </div>
          {data.dateStr && (
            <span
              className="text-[8.5px] font-bold uppercase tracking-wider opacity-60 shrink-0"
              style={{ whiteSpace: 'nowrap' }}
            >
              {data.dateStr}
            </span>
          )}
        </div>

        {/* Milestone Badge & Hero Number */}
        <div className="relative z-10 flex flex-col gap-0.5 min-w-0">
          <span
            className="self-start px-2 py-0.5 rounded-full text-[7.5px] font-bold tracking-wider uppercase border truncate max-w-full"
            style={{
              background: theme.pillBg,
              borderColor: theme.accent,
              color: theme.pillText,
              whiteSpace: 'nowrap',
            }}
          >
            {data.badgeText}
          </span>

          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-clash font-extrabold text-[36px] sm:text-[40px] leading-none tracking-tight">
              {data.metricValue}
            </span>
            {data.metricUnit && (
              <span
                className="text-[10px] font-bold uppercase tracking-wider leading-none"
                style={{ color: theme.accent, whiteSpace: 'nowrap' }}
              >
                {data.metricUnit}
              </span>
            )}
          </div>

          <h4 className="font-clash font-bold text-[12px] leading-tight truncate">
            {data.title}
          </h4>
          <p
            className="text-[8.5px] leading-tight line-clamp-2"
            style={{ color: theme.secondaryText }}
          >
            {data.subtitle}
          </p>
        </div>

        {/* Bento Stats Row */}
        <div
          className="relative z-10 p-1.5 sm:p-2 rounded-xl border flex items-center justify-between gap-2 shrink-0"
          style={{
            background: theme.cardBg,
            borderColor: theme.cardBorder,
          }}
        >
          <div className="min-w-0 flex-1">
            <span className="text-[7px] font-semibold block uppercase tracking-wider opacity-60 leading-none">
              TARGET ROUTINE
            </span>
            <span className="font-bold text-[10.5px] truncate block mt-0.5">
              {data.habitTitle || 'Core Stack'}
            </span>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[7px] font-semibold block uppercase tracking-wider opacity-60 leading-none">
              ADHERENCE
            </span>
            <span className="font-clash font-extrabold text-[13px] block mt-0.5" style={{ color: theme.accent }}>
              {pct}%
            </span>
            {data.adherenceLabel && (
              <span className="text-[6.5px] block opacity-60 truncate">
                {data.adherenceLabel}
              </span>
            )}
          </div>
        </div>

        {/* Quote Capsule OR Consistency Row */}
        {data.showQuote !== false ? (
          <div
            className="relative z-10 p-1.5 sm:p-2 rounded-xl border flex flex-col justify-center min-w-0 shrink-0"
            style={{
              background: theme.quoteBoxBg,
              borderColor: theme.quoteBoxBorder,
            }}
          >
            <div className="flex gap-1 items-start min-w-0">
              <span className="font-serif text-sm leading-none opacity-80 shrink-0" style={{ color: theme.accent }}>
                “
              </span>
              <p className="text-[8.5px] italic font-serif leading-snug line-clamp-2">
                {data.quote}
              </p>
            </div>
            <span
              className="text-[7.5px] font-semibold mt-0.5 self-end truncate max-w-full"
              style={{ color: theme.accent }}
            >
              — {data.quoteAuthor}
            </span>
          </div>
        ) : (
          <div
            className="relative z-10 flex items-center justify-between py-1 border-y shrink-0"
            style={{ borderColor: dividerColor }}
          >
            {weeklyDots.map((dot, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                {dot.completed ? (
                  <div
                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 shadow-xs"
                    style={{ background: theme.accent }}
                  >
                    <div className="w-1 h-1 rounded-full bg-white shadow-xs" />
                  </div>
                ) : dot.isFuture ? (
                  <div className="w-3.5 h-3.5 rounded-full border border-dashed border-current opacity-25 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-current opacity-30 flex items-center justify-center shrink-0">
                    <div className="w-1 h-1 rounded-full bg-current opacity-30" />
                  </div>
                )}
                <span className="text-[7px] font-bold tracking-wider opacity-60">{dot.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div
          className="relative z-10 flex items-center justify-between text-[7.5px] font-semibold border-t pt-1 opacity-75 shrink-0"
          style={{ borderColor: dividerColor }}
        >
          <span className="truncate max-w-[65%]" style={{ whiteSpace: 'nowrap' }}>{userFooterLabel}</span>
          <span className="shrink-0 font-bold" style={{ whiteSpace: 'nowrap' }}>HABIT TRACKER</span>
        </div>
      </div>
    );
  }

  // DEFAULT: Story Layout (9:16)
  return (
    <div
      className="w-full h-full relative rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between overflow-hidden select-none"
      style={{
        background: `linear-gradient(145deg, ${theme.backgroundStart}, ${theme.backgroundEnd})`,
        border: `1.5px solid ${theme.cardBorder}`,
        color: theme.primaryText,
      }}
    >
      {/* Glow orbs & Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-80"
        style={{ backgroundImage: dotGridBg, backgroundSize: '16px 16px' }}
      />
      <div
        className="absolute -top-12 -left-12 w-48 h-48 rounded-full pointer-events-none blur-2xl opacity-60"
        style={{ background: theme.accentGlow }}
      />
      <div
        className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full pointer-events-none blur-2xl opacity-60"
        style={{ background: theme.accentGlow }}
      />

      {/* 1. Top Header */}
      <div
        className="relative z-10 w-full flex items-center justify-between border-b pb-1.5 shrink-0"
        style={{ borderColor: dividerColor }}
      >
        <div className="flex items-center gap-1.5 shrink-0">
          <BrandLogoIcon size={18} theme={theme} />
          <span
            className="font-clash font-bold text-[10.5px] tracking-tight shrink-0"
            style={{ whiteSpace: 'nowrap' }}
          >
            HABIT TRACKER
          </span>
        </div>
        {data.dateStr && (
          <span
            className="text-[8.5px] font-bold uppercase tracking-wider opacity-60 shrink-0"
            style={{ whiteSpace: 'nowrap' }}
          >
            {data.dateStr}
          </span>
        )}
      </div>

      {/* 2. Milestone Badge & Big Number */}
      <div className="relative z-10 flex flex-col gap-0.5 min-w-0">
        <span
          className="self-start px-2 py-0.5 rounded-full text-[7.5px] font-bold tracking-wider uppercase border truncate max-w-full"
          style={{
            background: theme.pillBg,
            borderColor: theme.accent,
            color: theme.pillText,
            whiteSpace: 'nowrap',
          }}
        >
          {data.badgeText}
        </span>

        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="font-clash font-extrabold text-[36px] leading-none tracking-tight">
            {data.metricValue}
          </span>
          {data.metricUnit && (
            <span
              className="text-[9.5px] font-black uppercase tracking-wider leading-none"
              style={{ color: theme.accent, whiteSpace: 'nowrap' }}
            >
              {data.metricUnit}
            </span>
          )}
        </div>

        <h3 className="font-clash font-bold text-[12px] leading-tight truncate">
          {data.title}
        </h3>
        <p
          className="text-[8.5px] leading-snug line-clamp-2"
          style={{ color: theme.secondaryText }}
        >
          {data.subtitle}
        </p>
      </div>

      {/* 3. Weekly Consistency Dots Row */}
      <div
        className="relative z-10 flex items-center justify-between py-1 border-y shrink-0"
        style={{ borderColor: dividerColor }}
      >
        {weeklyDots.map((dot, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            {dot.completed ? (
              <div
                className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 shadow-xs"
                style={{ background: theme.accent }}
              >
                <div className="w-1 h-1 rounded-full bg-white shadow-xs" />
              </div>
            ) : dot.isFuture ? (
              <div className="w-3.5 h-3.5 rounded-full border border-dashed border-current opacity-25 shrink-0" />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-current opacity-30 flex items-center justify-center shrink-0">
                <div className="w-1 h-1 rounded-full bg-current opacity-30" />
              </div>
            )}
            <span className="text-[7px] font-bold tracking-wider opacity-60">{dot.label}</span>
          </div>
        ))}
      </div>

      {/* 4. Dual Bento Cards */}
      <div className="relative z-10 grid grid-cols-2 gap-1.5 shrink-0">
        <div
          className="p-1.5 rounded-xl border flex flex-col justify-between min-w-0"
          style={{
            background: theme.cardBg,
            borderColor: theme.cardBorder,
          }}
        >
          <span className="text-[7px] font-bold uppercase tracking-wider opacity-60">
            {data.bentoLabel || 'TARGET ROUTINE'}
          </span>
          <span className="font-bold text-[10px] truncate my-0.5">
            {data.habitTitle || 'Core Stack'}
          </span>
          <span className="text-[7.5px] font-medium truncate" style={{ color: theme.accent }}>
            {data.routineTag || 'Daily Discipline'}
          </span>
        </div>

        <div
          className="p-1.5 rounded-xl border flex flex-col justify-between min-w-0"
          style={{
            background: theme.cardBg,
            borderColor: theme.cardBorder,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[7px] font-bold uppercase tracking-wider opacity-60">ADHERENCE</span>
            <span className="font-clash font-extrabold text-[12px] leading-none" style={{ color: theme.accent }}>
              {pct}%
            </span>
          </div>
          <div className="w-full h-1 rounded-full overflow-hidden my-0.5" style={{ background: theme.progressTrack }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: theme.accent }} />
          </div>
          <span className="text-[7px] opacity-70 truncate">{data.adherenceLabel || 'Monthly Log'}</span>
        </div>
      </div>

      {/* 5. Wisdom Quote Capsule OR Dynamic Habit Metrics */}
      {data.showQuote !== false ? (
        <div
          className="relative z-10 p-1.5 px-2 rounded-xl border flex flex-col justify-center min-w-0 shrink-0"
          style={{
            background: theme.quoteBoxBg,
            borderColor: theme.quoteBoxBorder,
          }}
        >
          <div className="flex gap-1 items-start min-w-0">
            <span className="font-serif text-xs leading-none opacity-80 shrink-0" style={{ color: theme.accent }}>
              “
            </span>
            <p className="text-[8px] italic font-serif leading-tight line-clamp-2">
              {data.quote}
            </p>
          </div>
          <span
            className="text-[7px] font-semibold mt-0.5 self-end truncate max-w-full"
            style={{ color: theme.accent }}
          >
            — {data.quoteAuthor}
          </span>
        </div>
      ) : (
        <div
          className="relative z-10 p-1.5 px-2 rounded-xl border grid grid-cols-3 gap-1 shrink-0"
          style={{
            background: theme.cardBg,
            borderColor: theme.cardBorder,
          }}
        >
          {(data.metricDetails || [
            { label: 'STREAK', value: `${data.metricValue}`, subtext: String(data.metricUnit || 'Days') },
            { label: 'ADHERENCE', value: `${pct}%`, subtext: data.adherenceLabel || 'Monthly' },
            { label: '7-DAY PACE', value: `${weeklyDots.filter((d) => d.completed).length}/7`, subtext: 'This Week' },
          ]).map((m, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-1 rounded-lg" style={{ background: theme.pillBg }}>
              <span className="text-[6px] font-bold uppercase tracking-wider opacity-60 leading-tight">
                {m.label}
              </span>
              <span className="font-clash font-extrabold text-[10.5px] leading-tight mt-0.5" style={{ color: theme.accent }}>
                {m.value}
              </span>
              <span className="text-[6px] opacity-70 leading-tight mt-0.5 truncate max-w-full">
                {m.subtext}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 6. Footer Signature */}
      <div
        className="relative z-10 flex items-center justify-between text-[7px] font-semibold border-t pt-1 opacity-80 shrink-0"
        style={{ borderColor: dividerColor }}
      >
        <div className="flex flex-col min-w-0 max-w-[65%]">
          <span className="font-bold truncate" style={{ whiteSpace: 'nowrap' }}>
            {userFooterLabel}
          </span>
        </div>
        <div className="text-right flex flex-col shrink-0">
          <span className="font-bold" style={{ whiteSpace: 'nowrap' }}>HABIT TRACKER</span>
        </div>
      </div>
    </div>
  );
}

export function MilestoneFlexCardModal({
  isOpen,
  onClose,
  habits,
  challenge,
  userName,
  userEmail,
  isGuestMode = false,
  onRequireAuth,
  longestStreak = 0,
  todayCompletionRate = 100,
  initialHabitId,
  initialMode = 'streak',
  initialShowGuide,
}: MilestoneFlexCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Studio configuration state
  const [mode, setMode] = useState<CardMode>(initialMode);
  const [format, setFormat] = useState<FlexCardFormat>('story');
  const [theme, setTheme] = useState<FlexCardTheme>('obsidian');
  const [selectedHabitId, setSelectedHabitId] = useState<string>(
    initialHabitId || habits[0]?.id || ''
  );
  const [showQuote, setShowQuote] = useState(true);
  const [showUser, setShowUser] = useState(true);
  const [selectedQuoteIndex, setSelectedQuoteIndex] = useState(0);

  // How it works guide toggle with first-visit memory
  const [showGuide, setShowGuide] = useState(() => {
    if (initialShowGuide !== undefined) return initialShowGuide;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ht_flex_card_guide_seen_v1') !== 'true';
    }
    return false;
  });

  const handleToggleGuide = (explicitState?: boolean) => {
    setShowGuide((prev) => {
      const next = typeof explicitState === 'boolean' ? explicitState : !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('ht_flex_card_guide_seen_v1', 'true');
      }
      return next;
    });
  };

  // Mobile responsive view toggle (Customize vs Preview)
  const [mobileTab, setMobileTab] = useState<'customize' | 'preview'>('customize');

  // Export action states
  const [isExporting, setIsExporting] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  // Sync initial habit if supplied
  useEffect(() => {
    if (initialHabitId) {
      setSelectedHabitId(initialHabitId);
      setMode('habit');
    } else if (initialMode) {
      setMode(initialMode);
    }
  }, [initialHabitId, initialMode]);

  // Detect native share capability
  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanNativeShare(true);
    }
  }, []);

  // Pick display name
  const displayName = useMemo(() => {
    if (userName && userName.trim()) return userName.trim();
    if (userEmail) return userEmail.split('@')[0];
    return null;
  }, [userName, userEmail]);

  // Habit that ACTUALLY achieved the top active streak
  const bestStreakHabit = useMemo(() => {
    if (habits.length === 0) return null;
    let top = habits[0];
    let max = -1;
    habits.forEach((h) => {
      const s = Math.max(calculateContinuousStreak(h.logs || {}), h.currentStreak || 0);
      if (s > max) {
        max = s;
        top = h;
      }
    });
    return { habit: top, streak: Math.max(0, max) };
  }, [habits]);

  // Overall routine unbroken streak (consecutive days with habits completed in daily routine)
  const overallRoutineStreak = useMemo(() => {
    if (habits.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = formatDateToISO(today);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDateToISO(yesterday);

    const anyDoneOnDate = (iso: string) => habits.some((h) => Boolean(h.logs?.[iso]));

    let streak = 0;
    let currentDate = new Date(today);

    // If any habit is logged today, streak starts from today
    if (anyDoneOnDate(todayStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (anyDoneOnDate(yesterdayStr)) {
      // If nothing logged today yet, allow streak to continue from yesterday
      currentDate = yesterday;
    } else {
      // Neither today nor yesterday had any activity
      return 0;
    }

    // Count backwards day by day as long as at least 1 habit was logged
    while (true) {
      const dateStr = formatDateToISO(currentDate);
      if (anyDoneOnDate(dateStr)) {
        if (currentDate.getTime() !== today.getTime()) {
          streak++;
        }
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [habits]);

  // Authentic Month-to-Date adherence stats across ALL habits in routine
  const overallMonthStats = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const currentDay = now.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = monthNames[month];

    if (habits.length === 0) {
      return { completedCount: 0, possibleCount: currentDay, rate: 0, monthName, currentDay };
    }

    let completedCount = 0;
    const possibleCount = habits.length * currentDay;

    habits.forEach((h) => {
      for (let d = 1; d <= currentDay; d++) {
        const mm = String(month + 1).padStart(2, '0');
        const dd = String(d).padStart(2, '0');
        const dateKey = `${year}-${mm}-${dd}`;
        if (h.logs?.[dateKey]) {
          completedCount++;
        }
      }
    });

    const rate = possibleCount > 0 ? Math.round((completedCount / possibleCount) * 100) : 0;
    return { completedCount, possibleCount, rate, monthName, currentDay };
  }, [habits]);

  // Selected single habit
  const currentHabit = useMemo(() => {
    return habits.find((h) => h.id === selectedHabitId) || habits[0] || null;
  }, [habits, selectedHabitId]);

  // Habit specific streak (real, unclamped)
  const habitStreak = useMemo(() => {
    if (!currentHabit) return 0;
    return calculateContinuousStreak(currentHabit.logs || {});
  }, [currentHabit]);

  // Calculate authentic Month-to-Date adherence stats for any habit
  const getHabitMonthStats = useCallback((h: HabitWithLogs | null) => {
    if (!h) return { completedCount: 0, currentDay: 1, rate: 0, monthName: 'This Month' };
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const currentDay = now.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = monthNames[month];

    let completedCount = 0;
    for (let d = 1; d <= currentDay; d++) {
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const dateKey = `${year}-${mm}-${dd}`;
      if (h.logs?.[dateKey]) {
        completedCount++;
      }
    }
    const rate = currentDay > 0 ? Math.round((completedCount / currentDay) * 100) : 0;
    return { completedCount, currentDay, rate, monthName };
  }, []);

  // Compute real Monday-through-Sunday completion dots for a target habit
  const getWeeklyDotsForHabit = useCallback((h: HabitWithLogs | null) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const currentDayIndex = now.getDay();
    const distToMonday = currentDayIndex === 0 ? -6 : 1 - currentDayIndex;

    const monday = new Date(now);
    monday.setDate(now.getDate() + distToMonday);

    const labels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const dots: { label: string; completed: boolean; isFuture: boolean }[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = formatDateToISO(d);
      const isFuture = d > now;
      const isDone = Boolean(h?.logs?.[iso]);

      dots.push({
        label: labels[i],
        completed: isDone,
        isFuture,
      });
    }
    return dots;
  }, []);

  // Compute real Monday-through-Sunday completion dots for all habits (Today mode)
  const getWeeklyDotsForToday = useCallback(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const currentDayIndex = now.getDay();
    const distToMonday = currentDayIndex === 0 ? -6 : 1 - currentDayIndex;

    const monday = new Date(now);
    monday.setDate(now.getDate() + distToMonday);

    const labels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const dots: { label: string; completed: boolean; isFuture: boolean }[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = formatDateToISO(d);
      const isFuture = d > now;
      const anyDone = habits.some((h) => Boolean(h.logs?.[iso]));

      dots.push({
        label: labels[i],
        completed: anyDone,
        isFuture,
      });
    }
    return dots;
  }, [habits]);

  // Compute real Monday-through-Sunday completion dots for challenge
  const getWeeklyDotsForChallenge = useCallback(() => {
    if (!challenge) return getWeeklyDotsForToday();
    const enrolledIds = challenge.habit_ids && challenge.habit_ids.length > 0 ? challenge.habit_ids : habits.map((h) => h.id);
    const enrolledHabits = habits.filter((h) => enrolledIds.includes(h.id));

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const currentDayIndex = now.getDay();
    const distToMonday = currentDayIndex === 0 ? -6 : 1 - currentDayIndex;

    const monday = new Date(now);
    monday.setDate(now.getDate() + distToMonday);

    const labels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const dots: { label: string; completed: boolean; isFuture: boolean }[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = formatDateToISO(d);
      const isFuture = d > now;
      const done = enrolledHabits.length > 0 && enrolledHabits.some((h) => Boolean(h.logs?.[iso]));

      dots.push({
        label: labels[i],
        completed: done,
        isFuture,
      });
    }
    return dots;
  }, [challenge, habits, getWeeklyDotsForToday]);

  // Compute real-time today execution metrics
  const todayStats = useMemo(() => {
    const now = new Date();
    const todayIso = formatDateToISO(now);
    const completedTodayCount = habits.filter((h) => Boolean(h.logs?.[todayIso])).length;
    const totalHabits = habits.length;
    const rate = totalHabits > 0 ? Math.round((completedTodayCount / totalHabits) * 100) : Math.round(todayCompletionRate || 0);
    return { completedTodayCount, totalHabits, rate };
  }, [habits, todayCompletionRate]);

  // Active quote
  const activeQuote = useMemo(() => {
    return MOTIVATION_QUOTES[selectedQuoteIndex % MOTIVATION_QUOTES.length] || MOTIVATION_QUOTES[0];
  }, [selectedQuoteIndex]);

  // Build card data based on active mode (100% Dynamic, ZERO Static Info)
  const cardData: FlexCardData = useMemo(() => {
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    if (mode === 'today') {
      const { completedTodayCount, totalHabits, rate: todayRate } = todayStats;
      const weeklyDots = getWeeklyDotsForToday();
      const weeklyDone = weeklyDots.filter((d) => d.completed).length;

      return {
        title: `${completedTodayCount} of ${totalHabits} Habits Completed`,
        subtitle:
          todayRate === 100
            ? `All ${totalHabits} daily habits accomplished today with 100% completion.`
            : `${totalHabits - completedTodayCount} habit${totalHabits - completedTodayCount === 1 ? '' : 's'} left to check in today • ${todayRate}% daily progress.`,
        metricValue: todayRate,
        metricUnit: '% TODAY',
        metricLabel: `${completedTodayCount}/${totalHabits} Completed Today`,
        badgeText: `TODAY'S SCORE • ${completedTodayCount}/${totalHabits} DONE`,
        userName: displayName,
        habitTitle: `${completedTodayCount} of ${totalHabits} Completed`,
        bentoLabel: "TODAY'S EXECUTION",
        routineTag: todayRate === 100 ? '100% Perfect Score' : `${todayRate}% Done Today`,
        completionRate: todayRate,
        adherenceLabel: `${completedTodayCount} of ${totalHabits} Habits Today`,
        footerLabel: displayName
          ? `DISCIPLINE BY ${displayName.toUpperCase()}`
          : `${totalHabits} HABITS LOGGED • ${todayStr.toUpperCase()}`,
        metricDetails: [
          { label: 'COMPLETED', value: `${completedTodayCount}/${totalHabits}`, subtext: `${todayRate}% of Routine` },
          { label: 'REMAINING', value: `${totalHabits - completedTodayCount}`, subtext: 'Habits Left' },
          { label: '7-DAY PACE', value: `${weeklyDone}/7D`, subtext: 'Daily Consistency' },
        ],
        weeklyDots,
        quote: activeQuote.quote,
        quoteAuthor: activeQuote.author,
        dateStr: todayStr,
        showQuote,
        showUser,
      };
    }

    if (mode === 'challenge' && challenge) {
      const challengeProg = computeChallengeProgress(challenge, habits);
      const weeklyDots = getWeeklyDotsForChallenge();

      return {
        title: challenge.title,
        subtitle: `Day ${challengeProg.currentDay} of ${challenge.duration_days} • ${challengeProg.daysRemaining} days remaining • ${challengeProg.totalCompletedChecks} of ${challengeProg.totalPossibleChecks} total checks (${challengeProg.adherencePercentage}%)`,
        metricValue: challengeProg.currentDay,
        metricUnit: `OF ${challenge.duration_days} DAYS`,
        metricLabel: `${challenge.duration_days}-Day Sprint`,
        badgeText: `${challenge.duration_days}-DAY SPRINT • DAY ${challengeProg.currentDay}`,
        userName: displayName,
        habitTitle: challenge.title,
        bentoLabel: 'ACTIVE CHALLENGE',
        routineTag: `Day ${challengeProg.currentDay} of ${challenge.duration_days} Sprint`,
        completionRate: challengeProg.adherencePercentage,
        adherenceLabel: `${challengeProg.totalCompletedChecks} of ${challengeProg.totalPossibleChecks} Checks Logged`,
        footerLabel: displayName
          ? `DISCIPLINE BY ${displayName.toUpperCase()}`
          : `${challenge.title.toUpperCase()} • DAY ${challengeProg.currentDay}/${challenge.duration_days}`,
        metricDetails: [
          { label: 'CURRENT DAY', value: `${challengeProg.currentDay}/${challenge.duration_days}`, subtext: `${challengeProg.daysRemaining}d Left` },
          { label: 'ADHERENCE', value: `${challengeProg.adherencePercentage}%`, subtext: 'Sprint Score' },
          { label: 'TOTAL LOGS', value: `${challengeProg.totalCompletedChecks}`, subtext: `of ${challengeProg.totalPossibleChecks} Checks` },
        ],
        weeklyDots,
        quote: activeQuote.quote,
        quoteAuthor: activeQuote.author,
        dateStr: todayStr,
        showQuote,
        showUser,
      };
    }

    if (mode === 'habit' && currentHabit) {
      let title = currentHabit.title;
      let subtitle = currentHabit.subtitle || '';
      if (title.includes(' | ')) {
        const parts = title.split(' | ');
        title = parts[0];
        subtitle = parts[1] || subtitle;
      }

      const streakVal = habitStreak;
      const stats = getHabitMonthStats(currentHabit);
      const weeklyDots = getWeeklyDotsForHabit(currentHabit);
      const weeklyDone = weeklyDots.filter((d) => d.completed).length;

      return {
        title: title,
        subtitle:
          subtitle ||
          (streakVal > 0
            ? `${streakVal}-day active continuous streak • ${stats.completedCount} of ${stats.currentDay} days logged in ${stats.monthName} (${stats.rate}%)`
            : `0-day active streak • ${stats.completedCount} of ${stats.currentDay} days logged in ${stats.monthName} (${stats.rate}%)`),
        metricValue: streakVal,
        metricUnit: streakVal === 1 ? 'DAY STREAK' : streakVal === 0 ? 'DAYS LOGGED (0)' : 'DAYS UNBROKEN',
        metricLabel: `${title} Streak`,
        badgeText: subtitle ? `${subtitle.toUpperCase()} • ${streakVal}D STREAK` : `HABIT • ${streakVal}D STREAK`,
        userName: displayName,
        habitTitle: title,
        bentoLabel: 'SELECTED ROUTINE',
        routineTag: currentHabit.targetTime ? `SCHEDULED • ${currentHabit.targetTime}` : (streakVal > 0 ? `${streakVal}d Active Streak` : 'Daily Ritual'),
        completionRate: stats.rate,
        adherenceLabel: `${stats.completedCount} of ${stats.currentDay} Days in ${stats.monthName}`,
        footerLabel: displayName
          ? `DISCIPLINE BY ${displayName.toUpperCase()}`
          : `${title.toUpperCase()} • ${streakVal}D STREAK`,
        metricDetails: [
          { label: 'ACTIVE STREAK', value: `${streakVal}D`, subtext: streakVal > 0 ? 'Continuous Run' : '0-Day Reset' },
          { label: 'MONTH LOGS', value: `${stats.completedCount}/${stats.currentDay}`, subtext: `${stats.rate}% in ${stats.monthName}` },
          { label: '7-DAY PACE', value: `${weeklyDone}/7D`, subtext: 'This Week' },
        ],
        weeklyDots,
        quote: activeQuote.quote,
        quoteAuthor: activeQuote.author,
        dateStr: todayStr,
        showQuote,
        showUser,
      };
    }

    // Default: Overall Routine Streak (Aggregate consistency across ALL habits)
    const effectiveStreak = Math.max(overallRoutineStreak, longestStreak || 0, bestStreakHabit?.streak || 0);
    const weeklyDots = getWeeklyDotsForToday();
    const weeklyDone = weeklyDots.filter((d) => d.completed).length;
    const totalHabitsCount = habits.length;
    const habitCountLabel = totalHabitsCount === 1 ? '1 Habit Tracked' : `${totalHabitsCount} Habits Tracked`;

    return {
      title: 'Overall Routine Streak',
      subtitle:
        effectiveStreak > 0
          ? `${effectiveStreak}-day unbroken consistency streak across your routine • ${overallMonthStats.completedCount} of ${overallMonthStats.possibleCount} total checks logged in ${overallMonthStats.monthName} (${overallMonthStats.rate}%)`
          : `0-day streak • Momentum rebuilding • ${overallMonthStats.completedCount} of ${overallMonthStats.possibleCount} total checks logged in ${overallMonthStats.monthName} (${overallMonthStats.rate}%)`,
      metricValue: effectiveStreak,
      metricUnit: effectiveStreak === 1 ? 'DAY STREAK' : effectiveStreak === 0 ? 'DAYS LOGGED (0)' : 'DAYS UNBROKEN',
      metricLabel: 'Overall Continuous Streak',
      badgeText: `OVERALL ROUTINE • ${effectiveStreak}D STREAK`,
      userName: displayName,
      habitTitle: `All ${totalHabitsCount} Tracked Habits`,
      bentoLabel: 'OVERALL ROUTINE',
      routineTag: effectiveStreak > 0 ? `${effectiveStreak}d Unbroken Run` : 'Daily Routine Stack',
      completionRate: overallMonthStats.rate,
      adherenceLabel: `${overallMonthStats.completedCount} of ${overallMonthStats.possibleCount} Logs in ${overallMonthStats.monthName}`,
      footerLabel: displayName
        ? `DISCIPLINE BY ${displayName.toUpperCase()}`
        : `ALL ${totalHabitsCount} HABITS • ${effectiveStreak}D STREAK`,
      metricDetails: [
        { label: 'OVERALL STREAK', value: `${effectiveStreak}D`, subtext: effectiveStreak > 0 ? 'Unbroken Run' : '0-Day Reset' },
        { label: 'TOTAL LOGS', value: `${overallMonthStats.completedCount}`, subtext: `in ${overallMonthStats.monthName} (${overallMonthStats.rate}%)` },
        { label: '7-DAY PACE', value: `${weeklyDone}/7D`, subtext: 'Daily Consistency' },
      ],
      weeklyDots,
      quote: activeQuote.quote,
      quoteAuthor: activeQuote.author,
      dateStr: todayStr,
      showQuote,
      showUser,
    };
  }, [
    mode,
    challenge,
    currentHabit,
    bestStreakHabit,
    longestStreak,
    overallRoutineStreak,
    overallMonthStats,
    todayStats,
    habitStreak,
    displayName,
    activeQuote,
    showQuote,
    showUser,
    habits,
    getHabitMonthStats,
    getWeeklyDotsForHabit,
    getWeeklyDotsForToday,
    getWeeklyDotsForChallenge,
  ]);

  // Offscreen canvas export renderer
  const ensureCanvasRendered = useCallback(() => {
    if (!canvasRef.current) return;
    renderFlexCardToCanvas(canvasRef.current, cardData, theme, format);
  }, [cardData, theme, format]);

  // Check if authenticated
  const isAnonymous = isGuestMode || !userEmail;

  // Handle Download Action
  const handleDownload = async () => {
    if (isAnonymous) {
      toast.info('Sign in required to download', {
        description: 'Please sign in or create an account to download your Milestone Flex Card in full 1080p.',
      });
      onRequireAuth?.();
      return;
    }
    if (!canvasRef.current) return;
    setIsExporting(true);
    try {
      ensureCanvasRendered();
      const filename = `habit-flex-${mode}-${format}.png`;
      await downloadCanvasAsPng(canvasRef.current, filename);
      toast.success('Flex Card downloaded in full 1080p!', {
        description: 'Saved high-resolution PNG to your device.',
      });
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      toast.error('Could not export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Native Share (Mobile / Instagram / WhatsApp)
  const handleNativeShare = async () => {
    if (isAnonymous) {
      toast.info('Sign in required to share', {
        description: 'Please sign in or create an account to share your Milestone Flex Card.',
      });
      onRequireAuth?.();
      return;
    }
    if (!canvasRef.current) return;
    setIsExporting(true);
    try {
      ensureCanvasRendered();
      const success = await shareCanvasImage(
        canvasRef.current,
        `${cardData.title} • Habit Tracker`,
        `Checked off my consistency milestone with Habit Tracker!`
      );
      if (success) {
        toast.success('Shared successfully!');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 },
        });
      }
    } catch {
      toast.error('Share action cancelled or unsupported.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/65 backdrop-blur-md overflow-y-auto font-archivo">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative w-full max-w-5xl max-h-[95dvh] sm:max-h-[94vh] rounded-[22px] sm:rounded-[32px] bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/15 dark:border-[#fbf8f1]/15 shadow-2xl flex flex-col text-[#15130f] dark:text-[#fbf8f1] overflow-hidden"
          style={{ willChange: 'auto' }}
        >
          {/* Studio Header */}
          <div className="flex items-center justify-between px-3 sm:px-7 py-2.5 sm:py-4 border-b border-[#15130f]/10 dark:border-[#fbf8f1]/10 shrink-0 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h3 className="font-clash font-semibold text-base sm:text-xl tracking-tight leading-none truncate">
                    Flex Cards
                  </h3>
                  <span className="hidden xs:inline-block px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-[#ff5a1f] text-white shrink-0">
                    Drop 2
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#15130f]/50 dark:text-[#fbf8f1]/50 mt-0.5 truncate hidden md:block">
                  Design bespoke, shareable graphics for Instagram Stories, X, and WhatsApp
                </p>
              </div>
            </div>

            {/* Actions & Mobile Tab Switcher */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Mobile Tab Switcher (Customize vs Preview) */}
              <div className="flex lg:hidden items-center p-0.5 sm:p-1 rounded-full bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10">
                <button
                  type="button"
                  onClick={() => setMobileTab('customize')}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[10.5px] sm:text-[11px] font-semibold transition-all cursor-pointer ${
                    mobileTab === 'customize'
                      ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] shadow-xs'
                      : 'text-[#15130f]/60 dark:text-[#fbf8f1]/60'
                  }`}
                >
                  <Sliders className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileTab('preview')}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[10.5px] sm:text-[11px] font-semibold transition-all cursor-pointer ${
                    mobileTab === 'preview'
                      ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] shadow-xs'
                      : 'text-[#15130f]/60 dark:text-[#fbf8f1]/60'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleToggleGuide()}
                className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border shrink-0 ${
                  showGuide
                    ? 'bg-[#ff5a1f] text-white border-[#ff5a1f] shadow-xs'
                    : 'bg-[#15130f]/5 dark:bg-[#fbf8f1]/8 text-[#15130f]/75 dark:text-[#fbf8f1]/75 border-[#15130f]/10 dark:border-[#fbf8f1]/10 hover:border-[#ff5a1f]/40 hover:text-[#ff5a1f]'
                }`}
                title="How Milestone Flex Cards work"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">How it works</span>
                <span className="sm:hidden text-[10.5px]">Guide</span>
              </button>

              <button
                onClick={onClose}
                aria-label="Close modal"
                className="p-1 sm:p-1.5 rounded-full text-[#15130f]/40 hover:text-[#15130f] dark:text-[#fbf8f1]/40 dark:hover:text-[#fbf8f1] hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/5 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Collapsible How It Works Guide Drawer */}
          <AnimatePresence>
            {showGuide && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.24, ease: 'easeInOut' }}
                className="overflow-hidden border-b border-[#15130f]/10 dark:border-[#fbf8f1]/10 bg-linear-to-r from-amber-500/10 via-orange-500/5 to-transparent shrink-0 max-h-[35vh] sm:max-h-none overflow-y-auto"
              >
                <div className="p-3.5 sm:p-5 px-3.5 sm:px-7 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-[#ff5a1f]" />
                      <h4 className="font-clash font-semibold text-sm sm:text-base text-[#15130f] dark:text-[#fbf8f1]">
                        How Milestone Flex Cards Work
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleGuide(false)}
                      className="text-[11px] font-semibold text-[#15130f]/50 dark:text-[#fbf8f1]/50 hover:text-[#ff5a1f] cursor-pointer"
                    >
                      Hide guide ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#fbf8f1]/90 dark:bg-[#15130f]/90 border border-[#15130f]/8 dark:border-[#fbf8f1]/8 space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs">
                        <Flame className="w-3.5 h-3.5 text-[#ff5a1f]" />
                        <span>1. Choose Milestone</span>
                      </div>
                      <p className="text-[11px] text-[#15130f]/65 dark:text-[#fbf8f1]/65 leading-relaxed">
                        Showcase your unbroken <strong>Routine Streak</strong>, <strong>Today&apos;s Score</strong>, <strong>30-Day Sprint</strong> challenge, or a standout <strong>Single Habit</strong>.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#fbf8f1]/90 dark:bg-[#15130f]/90 border border-[#15130f]/8 dark:border-[#fbf8f1]/8 space-y-1">
                      <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-bold text-xs">
                        <LayoutTemplate className="w-3.5 h-3.5 text-orange-500" />
                        <span>2. Aspect & Aesthetics</span>
                      </div>
                      <p className="text-[11px] text-[#15130f]/65 dark:text-[#fbf8f1]/65 leading-relaxed">
                        Format for <strong>Story (9:16)</strong>, <strong>Square (1:1)</strong>, or <strong>Landscape (16:9)</strong>. Pick between 5 luxury themes (Obsidian, Warm Ivory, Cyber Violet, Sunset Flame, Emerald).
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#fbf8f1]/90 dark:bg-[#15130f]/90 border border-[#15130f]/8 dark:border-[#fbf8f1]/8 space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                        <Share2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>3. 1-Tap Share & 4K PNG</span>
                      </div>
                      <p className="text-[11px] text-[#15130f]/65 dark:text-[#fbf8f1]/65 leading-relaxed">
                        Share directly to Instagram Stories or WhatsApp via native mobile share sheet, or download a crystal-clear high-res PNG for your records.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Body: 2 Balanced Columns on Desktop, Switchable on Mobile */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 items-start">
            {/* Left Controls Panel (6 Cols) */}
            <div
              className={`lg:col-span-6 flex flex-col gap-4 sm:gap-5 ${
                mobileTab === 'preview' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              {/* 1. Milestone Mode Picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                  Select Milestone Focus
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10">
                  <button
                    type="button"
                    onClick={() => setMode('streak')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      mode === 'streak'
                        ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] shadow-sm'
                        : 'text-[#15130f]/70 dark:text-[#fbf8f1]/70 hover:text-[#ff5a1f]'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-[#ff5a1f]" />
                    <span>Streak</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('today')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      mode === 'today'
                        ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] shadow-sm'
                        : 'text-[#15130f]/70 dark:text-[#fbf8f1]/70 hover:text-[#ff5a1f]'
                    }`}
                  >
                    <Target className="w-3.5 h-3.5 text-[#ff5a1f]" />
                    <span>Today 100%</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('challenge')}
                    disabled={!challenge}
                    title={!challenge ? 'No active challenge enrolled' : undefined}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      mode === 'challenge'
                        ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] shadow-sm'
                        : !challenge
                        ? 'opacity-40 cursor-not-allowed'
                        : 'text-[#15130f]/70 dark:text-[#fbf8f1]/70 hover:text-[#ff5a1f]'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5 text-[#ff5a1f]" />
                    <span>Challenge</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('habit')}
                    disabled={habits.length === 0}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      mode === 'habit'
                        ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] shadow-sm'
                        : habits.length === 0
                        ? 'opacity-40 cursor-not-allowed'
                        : 'text-[#15130f]/70 dark:text-[#fbf8f1]/70 hover:text-[#ff5a1f]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#ff5a1f]" />
                    <span>Single Habit</span>
                  </button>
                </div>
              </div>

              {/* Single Habit Dropdown if in 'habit' mode */}
              {mode === 'habit' && habits.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                    Choose Habit to Spotlight
                  </label>
                  <select
                    value={selectedHabitId}
                    onChange={(e) => setSelectedHabitId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#ff5a1f] transition-colors"
                  >
                    {habits.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 2. Format Selector (Story 9:16 vs Square 1:1 vs Post 16:9) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                  Export Canvas Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'story', label: '9:16 Story', icon: Smartphone, desc: 'Instagram / WhatsApp' },
                      { id: 'square', label: '1:1 Square', icon: Square, desc: 'Feed / Threads' },
                      { id: 'landscape', label: '16:9 Post', icon: LayoutTemplate, desc: 'X / LinkedIn' },
                    ] as const
                  ).map((fmt) => {
                    const isSel = format === fmt.id;
                    const IconComp = fmt.icon;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setFormat(fmt.id)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSel
                            ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] border-transparent shadow-sm'
                            : 'bg-[#f2ecdf]/50 dark:bg-[#11100d]/50 border-[#15130f]/10 dark:border-[#fbf8f1]/10 hover:border-[#ff5a1f]/40'
                        }`}
                      >
                        <IconComp className="w-4 h-4 mb-1" />
                        <span className="text-xs font-bold leading-tight">{fmt.label}</span>
                        <span className="text-[10px] opacity-65 leading-tight">{fmt.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Theme Preset Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                  Card Aesthetic Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(FLEX_CARD_THEMES) as FlexCardTheme[]).map((thmKey) => {
                    const t = FLEX_CARD_THEMES[thmKey];
                    const isSel = theme === thmKey;
                    return (
                      <button
                        key={thmKey}
                        type="button"
                        onClick={() => setTheme(thmKey)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSel
                            ? 'border-[#ff5a1f] ring-2 ring-[#ff5a1f]/30 bg-[#ff5a1f]/8'
                            : 'border-[#15130f]/10 dark:border-[#fbf8f1]/10 hover:border-[#ff5a1f]/30'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full shrink-0 border border-black/10 flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${t.backgroundStart}, ${t.accent})`,
                          }}
                        >
                          {isSel && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                        </span>
                        <span className="text-xs font-semibold truncate">{t.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Customization Toggles & Quotes */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f2ecdf]/40 dark:bg-[#11100d]/40 border border-[#15130f]/10 dark:border-[#fbf8f1]/10">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#ff5a1f]" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">Include User Signature</span>
                      {displayName ? (
                        <span className="text-[10px] text-[#15130f]/50 dark:text-[#fbf8f1]/50 truncate">
                          Signed as {displayName}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#15130f]/40 dark:text-[#fbf8f1]/40">
                          Anonymous archive mode
                        </span>
                      )}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={showUser && Boolean(displayName)}
                    disabled={!displayName}
                    onChange={(e) => setShowUser(e.target.checked)}
                    className="w-4 h-4 accent-[#ff5a1f] rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-[#f2ecdf]/40 dark:bg-[#11100d]/40 border border-[#15130f]/10 dark:border-[#fbf8f1]/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Quote className="w-3.5 h-3.5 text-[#ff5a1f]" />
                      <span className="text-xs font-semibold">Include Stoic Wisdom Quote</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedQuoteIndex((prev) => prev + 1)}
                        className="text-[11px] font-semibold text-[#ff5a1f] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Cycle</span>
                      </button>
                      <input
                        type="checkbox"
                        checked={showQuote}
                        onChange={(e) => setShowQuote(e.target.checked)}
                        className="w-4 h-4 accent-[#ff5a1f] rounded cursor-pointer"
                      />
                    </div>
                  </div>
                  {showQuote && (
                    <p className="text-[11px] text-[#15130f]/60 dark:text-[#fbf8f1]/60 italic truncate pl-5">
                      &quot;{activeQuote.quote}&quot; — {activeQuote.author}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: 100% Crisp Vector DOM Live Card Preview (6 Cols) */}
            <div
              className={`lg:col-span-6 flex flex-col items-center justify-center sticky top-0 self-center ${
                mobileTab === 'customize' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              <div className="w-full flex flex-col items-center justify-center py-1 sm:py-2 px-1">
                {/* Visual Vector Display Frame */}
                <div
                  className={`relative flex items-center justify-center shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 shrink-0 max-w-full ${
                    format === 'story'
                      ? 'h-[360px] xs:h-[400px] sm:h-[475px] max-h-[50vh] sm:max-h-none aspect-[9/16]'
                      : format === 'square'
                      ? 'w-[260px] xs:w-[290px] sm:w-[355px] max-h-[48vh] sm:max-h-none aspect-square'
                      : 'w-full max-w-[320px] sm:max-w-[420px] aspect-[16/9]'
                  }`}
                  style={{
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    transform: 'translateZ(0)',
                  }}
                >
                  <FlexCardVectorPreview
                    data={cardData}
                    themeKey={theme}
                    format={format}
                  />
                </div>

                {/* Off-screen canvas used exclusively for 1080p high-res export */}
                <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

                <div className="mt-3 flex items-center gap-2 text-[10.5px] font-semibold text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>
                    {FORMAT_DIMENSIONS[format].width} × {FORMAT_DIMENSIONS[format].height}px
                  </span>
                  <span>•</span>
                  <span>100% Vector Crisp Preview</span>
                </div>
              </div>
            </div>
          </div>

          {/* Studio Footer Action Bar */}
          <div className="px-3 sm:px-7 py-2.5 sm:py-3.5 border-t border-[#15130f]/10 dark:border-[#fbf8f1]/10 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 bg-[#f2ecdf]/30 dark:bg-[#11100d]/30 shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[#15130f]/60 dark:text-[#fbf8f1]/60 self-start sm:self-auto">
              {isAnonymous ? (
                <>
                  <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
                  <span>Sign in required to export</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                  <span>Full 1080p export ready</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto justify-end">
              {/* Native Share button (Mobile / Instagram) */}
              {canNativeShare && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  disabled={isExporting}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full bg-[#ff5a1f]/15 hover:bg-[#ff5a1f]/25 text-[#ff5a1f] text-xs font-semibold transition-all cursor-pointer truncate"
                >
                  <Share2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Share Story</span>
                </button>
              )}

              {/* Download PNG */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={isExporting}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#ff5a1f] hover:bg-[#e04a12] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50 truncate"
              >
                {isExporting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                ) : isAnonymous ? (
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <Download className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{isAnonymous ? 'Sign in to Download' : 'Download PNG'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
