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
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { HabitWithLogs } from '@/types/database.types';
import { Challenge } from '@/types/challenge.types';
import { calculateContinuousStreak } from '@/lib/analytics';
import { MOTIVATION_QUOTES } from '@/lib/quotes';
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
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const pct = Math.min(100, Math.max(10, data.completionRate ?? 95));

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
      : 'VERIFIED DISCIPLINE ARCHIVE';

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
                  {days.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 shadow-xs"
                        style={{ background: theme.accent }}
                      >
                        <div className="w-1 h-1 rounded-full bg-white shadow-xs" />
                      </div>
                      <span className="text-[7px] font-bold tracking-wider opacity-60">{d}</span>
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
            {days.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 shadow-xs"
                  style={{ background: theme.accent }}
                >
                  <div className="w-1 h-1 rounded-full bg-white shadow-xs" />
                </div>
                <span className="text-[7px] font-bold tracking-wider opacity-60">{d}</span>
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
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <div
              className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: theme.accent }}
            >
              <div className="w-1 h-1 rounded-full bg-white shadow-xs" />
            </div>
            <span className="text-[7px] font-bold tracking-wider opacity-60">{d}</span>
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
          <span className="text-[7px] opacity-70 truncate">Verified Consistency</span>
        </div>
      </div>

      {/* 5. Wisdom Quote Capsule OR Protocol Bar */}
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
          className="relative z-10 p-1.5 px-2 rounded-xl border flex items-center justify-between min-w-0 shrink-0"
          style={{
            background: theme.cardBg,
            borderColor: theme.cardBorder,
          }}
        >
          <div className="flex flex-col min-w-0">
            <span className="text-[7px] font-bold uppercase tracking-wider opacity-70">72H PROTOCOL</span>
            <span className="text-[8px] font-clash font-bold" style={{ color: theme.accent }}>LOCKED & VERIFIED</span>
          </div>
          <div className="px-1.5 py-0.5 rounded text-[7px] font-bold tracking-wider uppercase" style={{ background: theme.pillBg, color: theme.accent }}>
            TITAN
          </div>
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

  // Selected single habit
  const currentHabit = useMemo(() => {
    return habits.find((h) => h.id === selectedHabitId) || habits[0] || null;
  }, [habits, selectedHabitId]);

  // Habit specific streak
  const habitStreak = useMemo(() => {
    if (!currentHabit) return 0;
    return calculateContinuousStreak(currentHabit.logs || {});
  }, [currentHabit]);

  // Active quote
  const activeQuote = useMemo(() => {
    return MOTIVATION_QUOTES[selectedQuoteIndex % MOTIVATION_QUOTES.length] || MOTIVATION_QUOTES[0];
  }, [selectedQuoteIndex]);

  // Build card data based on active mode
  const cardData: FlexCardData = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    if (mode === 'today') {
      const roundedToday = Math.round(todayCompletionRate);
      return {
        title: 'Daily Execution Locked',
        subtitle: 'All daily disciplines conquered with zero hesitation.',
        metricValue: roundedToday,
        metricUnit: '% TODAY',
        metricLabel: 'Daily Execution Score',
        badgeText: 'DAILY DISCIPLINE MASTER',
        userName: displayName,
        habitTitle: `${habits.length} Habits Tracked`,
        bentoLabel: "TODAY'S TARGET",
        routineTag: 'Daily Execution',
        completionRate: roundedToday,
        quote: activeQuote.quote,
        quoteAuthor: activeQuote.author,
        dateStr: todayStr,
        showQuote,
        showUser,
      };
    }

    if (mode === 'challenge' && challenge) {
      return {
        title: challenge.title,
        subtitle: `${challenge.duration_days}-Day Sprint towards unbreakable momentum.`,
        metricValue: challenge.duration_days,
        metricUnit: 'DAY PROTOCOL',
        metricLabel: 'Discipline Sprint',
        badgeText: `${challenge.duration_days}-DAY HARD CHALLENGE`,
        userName: displayName,
        habitTitle: challenge.title,
        bentoLabel: 'ACTIVE SPRINT',
        routineTag: `${challenge.duration_days}-Day Protocol`,
        completionRate: 88,
        quote: activeQuote.quote,
        quoteAuthor: activeQuote.author,
        dateStr: todayStr,
        showQuote,
        showUser,
      };
    }

    if (mode === 'habit' && currentHabit) {
      let title = currentHabit.title;
      let subtitle = currentHabit.subtitle || 'Daily routine locked';
      if (title.includes(' | ')) {
        const parts = title.split(' | ');
        title = parts[0];
        subtitle = parts[1];
      }

      const streakVal = Math.max(1, habitStreak);
      return {
        title: title,
        subtitle: subtitle,
        metricValue: streakVal,
        metricUnit: streakVal === 1 ? 'DAY STREAK' : 'DAYS UNBROKEN',
        metricLabel: 'Continuous Discipline Streak',
        badgeText: streakVal >= 30 ? '30+ DAY IRON WILL' : 'HABIT MOMENTUM',
        userName: displayName,
        habitTitle: title,
        bentoLabel: 'HABIT SPOTLIGHT',
        routineTag: subtitle || 'Atomic Daily Habit',
        completionRate: Math.min(100, Math.max(85, Math.round(todayCompletionRate || 95))),
        quote: activeQuote.quote,
        quoteAuthor: activeQuote.author,
        dateStr: todayStr,
        showQuote,
        showUser,
      };
    }

    // Default: Overall Longest Streak
    const effectiveStreak = Math.max(1, longestStreak);
    return {
      title: 'Iron Consistency Streak',
      subtitle: 'Momentum compounds over time. Systems defeat motivation.',
      metricValue: effectiveStreak,
      metricUnit: effectiveStreak === 1 ? 'DAY STREAK' : 'DAYS UNBROKEN',
      metricLabel: 'Longest Continuous Streak',
      badgeText:
        effectiveStreak >= 30
          ? '30-DAY TITAN'
          : effectiveStreak >= 14
          ? '14-DAY FORTITUDE'
          : 'CONSISTENCY SPRINT',
      userName: displayName,
      habitTitle: currentHabit?.title?.split(' | ')[0] || 'Core Routine Stack',
      bentoLabel: 'STREAK DISCIPLINE',
      routineTag: 'Unbroken Momentum',
      completionRate: Math.min(100, Math.max(85, Math.round(todayCompletionRate || 94))),
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
    longestStreak,
    todayCompletionRate,
    habitStreak,
    displayName,
    activeQuote,
    showQuote,
    showUser,
    habits.length,
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/65 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative w-full max-w-5xl max-h-[94vh] rounded-[28px] sm:rounded-[32px] bg-[#fbf8f1] dark:bg-[#1c1a16] border border-[#15130f]/15 dark:border-[#fbf8f1]/15 shadow-2xl flex flex-col text-[#15130f] dark:text-[#fbf8f1] overflow-hidden"
          style={{ willChange: 'auto' }}
        >
          {/* Studio Header */}
          <div className="flex items-center justify-between px-4 sm:px-7 py-3.5 sm:py-4 border-b border-[#15130f]/10 dark:border-[#fbf8f1]/10 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-clash font-semibold text-lg sm:text-xl tracking-tight leading-none truncate">
                    Milestone Flex Cards
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#ff5a1f] text-white shrink-0">
                    Drop 2
                  </span>
                </div>
                <p className="text-[11.5px] sm:text-xs text-[#15130f]/50 dark:text-[#fbf8f1]/50 mt-0.5 truncate hidden sm:block">
                  Design bespoke, shareable graphics for Instagram Stories, X, and WhatsApp
                </p>
              </div>
            </div>

            {/* Mobile Tab Switcher (Customize vs Preview) */}
            <div className="flex items-center gap-2">
              <div className="flex lg:hidden items-center p-1 rounded-full bg-[#f2ecdf] dark:bg-[#11100d] border border-[#15130f]/10 dark:border-[#fbf8f1]/10 mr-1">
                <button
                  type="button"
                  onClick={() => setMobileTab('customize')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    mobileTab === 'customize'
                      ? 'bg-[#15130f] dark:bg-[#fbf8f1] text-[#fbf8f1] dark:text-[#15130f] shadow-xs'
                      : 'text-[#15130f]/60 dark:text-[#fbf8f1]/60'
                  }`}
                >
                  <Sliders className="w-3 h-3" />
                  <span>Customize</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileTab('preview')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
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
                onClick={onClose}
                aria-label="Close modal"
                className="p-1.5 rounded-full text-[#15130f]/40 hover:text-[#15130f] dark:text-[#fbf8f1]/40 dark:hover:text-[#fbf8f1] hover:bg-[#15130f]/5 dark:hover:bg-[#fbf8f1]/5 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Body: 2 Balanced Columns on Desktop, Switchable on Mobile */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7 items-start">
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
                  className={`relative flex items-center justify-center shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 shrink-0 ${
                    format === 'story'
                      ? 'h-[450px] sm:h-[475px] aspect-[9/16]'
                      : format === 'square'
                      ? 'h-[330px] sm:h-[355px] aspect-square'
                      : 'w-[320px] sm:w-[410px] aspect-[16/9]'
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
          <div className="px-4 sm:px-7 py-3 sm:py-3.5 border-t border-[#15130f]/10 dark:border-[#fbf8f1]/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#f2ecdf]/30 dark:bg-[#11100d]/30 shrink-0">
            <div className="flex items-center gap-2 text-xs text-[#15130f]/60 dark:text-[#fbf8f1]/60 self-start sm:self-auto">
              {isAnonymous ? (
                <>
                  <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Sign in required to export</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
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
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-[#ff5a1f]/15 hover:bg-[#ff5a1f]/25 text-[#ff5a1f] text-xs font-semibold transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Story</span>
                </button>
              )}

              {/* Download PNG */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={isExporting}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#ff5a1f] hover:bg-[#e04a12] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isAnonymous ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Download className="w-4 h-4" />
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
