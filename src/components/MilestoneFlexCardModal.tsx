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
  FlexCardCategoryTab,
  FlexCardStyle,
  FlexCardMood,
  FlexCardLighting,
  FlexCardColour,
  FlexCardCustomization,
  CustomizationOptionItem,
  FeaturedPresetItem,
  DEFAULT_CUSTOMIZATION,
  CATEGORY_TABS,
  FEATURED_PRESETS,
  STYLE_OPTIONS,
  MOOD_OPTIONS,
  LIGHTING_OPTIONS,
  COLOUR_OPTIONS,
  COLOUR_PALETTES,
  FLEX_CARD_THEMES,
  FORMAT_DIMENSIONS,
  renderFlexCardToCanvas,
  downloadCanvasAsPng,
  shareCanvasImage,
  CardStyleTheme,
  getEffectiveCardStyling,
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
 * Procedural Vector Art Layer for live DOM card preview
 * Mirrors the exact procedural lighting, 11 vector art styles, and mood textures.
 */
function CardVectorArtLayer({
  customization,
  theme,
  format,
  styleTheme,
}: {
  customization: FlexCardCustomization;
  theme: ThemeColors;
  format: FlexCardFormat;
  styleTheme?: CardStyleTheme;
}) {
  const effectiveStyle = styleTheme || getEffectiveCardStyling(customization, theme);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* 1. Base Gradient / Card Background */}
      <div
        className="absolute inset-0"
        style={{
          background: effectiveStyle.cardBg.startsWith('#') || effectiveStyle.cardBg.startsWith('rgb')
            ? effectiveStyle.cardBg
            : `linear-gradient(145deg, ${theme.backgroundStart}, ${theme.backgroundEnd})`,
        }}
      />

      {/* 2. Holistic Procedural Style Vector Graphics Artwork (Full-Bleed Across Card) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {customization.style === 'paper' && (
          <svg className="w-full h-full" viewBox="0 0 400 700" preserveAspectRatio="none">
            <defs>
              <filter id="domPaperShadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#2c261e" floodOpacity="0.22" />
              </filter>
            </defs>
            <rect width="100%" height="100%" fill="#f4ece1" />
            {/* Layer 1: Dynamic Accent Undulating Wave across top and right */}
            <path
              d="M 0,0 L 400,0 L 400,360 Q 320,400 240,320 Q 160,260 80,340 Q 30,380 0,330 Z"
              fill={theme.accent}
              filter="url(#domPaperShadow)"
            />
            {/* Layer 2: Warm Mustard Ochre Wave across middle right */}
            <path
              d="M 400,180 L 400,480 Q 310,430 220,480 Q 120,530 40,460 L 0,470 L 0,310 Q 90,290 190,330 Q 290,370 400,180 Z"
              fill="#e9c46a"
              filter="url(#domPaperShadow)"
            />
            {/* Layer 3: Sage Green Organic Paper Layer across lower section */}
            <path
              d="M 0,400 Q 120,430 220,370 Q 300,310 400,350 L 400,560 Q 280,600 150,530 Q 60,480 0,550 Z"
              fill="#9da78c"
              filter="url(#domPaperShadow)"
            />
            {/* Layer 4: Upper-Middle Arched Horizon Paper Cutout (Frames weekly cadence / stats) */}
            <path
              d="M 70,260 Q 200,160 330,260 L 330,300 L 70,300 Z"
              fill="#e5d5be"
              filter="url(#domPaperShadow)"
            />
            {/* Mountain ridge paper cutout inside the arch */}
            <path
              d="M 70,300 L 120,245 L 160,270 L 220,210 L 270,250 L 330,225 L 330,300 Z"
              fill="#d5c4aa"
            />
          </svg>
        )}

        {customization.style === 'cartoon' && (
          <svg className="w-full h-full" viewBox="0 0 400 700" preserveAspectRatio="none">
            <defs>
              <pattern id="domHalftoneDots" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="8" cy="8" r="2.2" fill={theme.accent} opacity="0.16" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="#fffbeb" />
            <g>
              {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map((deg, idx) => {
                const rad = (deg * Math.PI) / 180;
                const nextRad = ((deg + 7.5) * Math.PI) / 180;
                return (
                  <path
                    key={deg}
                    d={`M 200,310 L ${200 + Math.cos(rad) * 600},${310 + Math.sin(rad) * 600} L ${200 + Math.cos(nextRad) * 600},${310 + Math.sin(nextRad) * 600} Z`}
                    fill={idx % 2 === 0 ? theme.accent : '#fef08a'}
                    opacity={idx % 2 === 0 ? 0.35 : 0.8}
                  />
                );
              })}
            </g>
            <rect width="100%" height="100%" fill="url(#domHalftoneDots)" />
          </svg>
        )}

        {customization.style === 'illustrated' && (
          <svg className="w-full h-full" viewBox="0 0 400 700" preserveAspectRatio="none">
            <rect width="100%" height="100%" fill="#1a1528" />
            <path d="M 0,0 L 400,0 L 400,120 Q 280,70 180,120 T 0,100 Z" fill={theme.accent} />
            <path d="M 0,90 Q 120,50 220,110 T 400,80 L 400,200 Q 280,150 180,210 T 0,180 Z" fill="#a855f7" />
            <path d="M 0,170 Q 120,130 220,190 T 400,160 L 400,280 Q 280,230 180,290 T 0,260 Z" fill="#22d3ee" />
            <path d="M 0,250 Q 120,210 220,270 T 400,240 L 400,360 Q 280,310 180,370 T 0,340 Z" fill="#facc15" />
            <path d="M 0,330 Q 120,290 220,350 T 400,320 L 400,450 Q 280,400 180,460 T 0,430 Z" fill={theme.accent} opacity="0.8" />
            <path d="M 0,420 Q 120,380 220,440 T 400,410 L 400,540 Q 280,490 180,550 T 0,520 Z" fill="#f43f5e" />
            <path d="M 0,510 Q 120,470 220,530 T 400,500 L 400,700 L 0,700 Z" fill="#ec4899" />
          </svg>
        )}

        {customization.style === 'lowpoly' && (
          <svg className="w-full h-full" viewBox="0 0 400 700" preserveAspectRatio="none">
            <rect width="100%" height="100%" fill="#130822" />
            {[
              { p: "0,0 80,0 0,90", c: "#2e1065" }, { p: "80,0 160,0 80,95", c: "#3b0764" },
              { p: "160,0 240,0 170,85", c: "#581c87" }, { p: "240,0 320,0 250,95", c: "#6b21a8" },
              { p: "320,0 400,0 330,85", c: "#7e22ce" }, { p: "400,0 400,100 330,85", c: theme.accent },
              { p: "0,90 80,0 80,95", c: "#4c1d95" }, { p: "80,95 160,0 170,85", c: "#6b21a8" },
              { p: "170,85 240,0 250,95", c: "#7e22ce" }, { p: "250,95 320,0 330,85", c: theme.accent },
              { p: "0,90 80,95 0,190", c: "#581c87" }, { p: "80,95 170,85 90,195", c: "#7e22ce" },
              { p: "170,85 250,95 180,185", c: theme.accent }, { p: "250,95 330,85 260,195", c: "#a855f7" },
              { p: "330,85 400,100 400,200", c: "#c084fc" }, { p: "330,85 260,195 400,200", c: theme.accent },
              { p: "0,190 80,95 90,195", c: "#6b21a8" }, { p: "90,195 170,85 180,185", c: "#8b5cf6" },
              { p: "180,185 250,95 260,195", c: "#a855f7" },
              { p: "0,190 90,195 0,300", c: "#3b0764" }, { p: "90,195 180,185 85,290", c: "#6b21a8" },
              { p: "180,185 260,195 175,295", c: "#7e22ce" }, { p: "260,195 400,200 270,300", c: theme.accent },
              { p: "270,300 400,200 400,310", c: "#a855f7" }, { p: "0,300 90,195 85,290", c: "#581c87" },
              { p: "85,290 180,185 175,295", c: "#7e22ce" }, { p: "175,295 260,195 270,300", c: "#8b5cf6" },
              { p: "0,300 85,290 0,420", c: "#2e1065" }, { p: "85,290 175,295 90,410", c: "#581c87" },
              { p: "175,295 270,300 185,415", c: "#6b21a8" }, { p: "270,300 400,310 280,410", c: "#7e22ce" },
              { p: "280,410 400,310 400,420", c: theme.accent }, { p: "0,420 85,290 90,410", c: "#4c1d95" },
              { p: "90,410 175,295 185,415", c: "#6b21a8" }, { p: "185,415 270,300 280,410", c: "#7e22ce" },
              { p: "0,420 90,410 0,560", c: "#1e1b4b" }, { p: "90,410 185,415 80,550", c: "#3b0764" },
              { p: "185,415 280,410 175,560", c: "#581c87" }, { p: "280,410 400,420 270,555", c: "#6b21a8" },
              { p: "270,555 400,420 400,560", c: "#7e22ce" }, { p: "0,560 90,410 80,550", c: "#312e81" },
              { p: "80,550 185,415 175,560", c: "#4c1d95" }, { p: "175,560 280,410 270,555", c: "#581c87" },
              { p: "0,560 80,550 0,700", c: "#0f172a" }, { p: "80,550 175,560 90,700", c: "#1e1b4b" },
              { p: "175,560 270,555 190,700", c: "#2e1065" }, { p: "270,555 400,560 290,700", c: "#3b0764" },
              { p: "290,700 400,560 400,700", c: "#4c1d95" }, { p: "0,700 80,550 90,700", c: "#1e1b4b" },
              { p: "90,700 175,560 190,700", c: "#2e1065" }, { p: "190,700 270,555 290,700", c: "#3b0764" },
            ].map((t, idx) => (
              <polygon key={idx} points={t.p} fill={t.c} stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
            ))}
          </svg>
        )}

        {customization.style === 'anime' && (
          <svg className="w-full h-full" viewBox="0 0 400 700" preserveAspectRatio="none">
            <defs>
              <linearGradient id="domAnimeSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fce7f3" />
                <stop offset="35%" stopColor="#fed7aa" />
                <stop offset="70%" stopColor="#bae6fd" />
                <stop offset="100%" stopColor="#ddd6fe" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#domAnimeSky)" />
            {/* Soft Puffy Clouds */}
            <g fill="rgba(255, 255, 255, 0.72)">
              <circle cx="80" cy="140" r="50" />
              <circle cx="120" cy="145" r="40" />
              <circle cx="50" cy="145" r="35" />
              <circle cx="310" cy="240" r="65" />
              <circle cx="355" cy="245" r="48" />
              <circle cx="265" cy="245" r="42" />
              <circle cx="140" cy="460" r="58" />
              <circle cx="185" cy="465" r="44" />
              <circle cx="95" cy="465" r="38" />
              <circle cx="330" cy="560" r="52" />
              <circle cx="365" cy="565" r="38" />
            </g>
            {/* Drifting Sakura Petals in Theme Accent (Strictly Zero Sparkles) */}
            <g fill={theme.accent} opacity="0.65">
              <ellipse cx="60" cy="80" rx="9" ry="4" transform="rotate(25 60 80)" />
              <ellipse cx="180" cy="190" rx="8" ry="3.5" transform="rotate(-30 180 190)" />
              <ellipse cx="290" cy="110" rx="10" ry="4.5" transform="rotate(45 290 110)" />
              <ellipse cx="70" cy="330" rx="8" ry="3.5" transform="rotate(15 70 330)" />
              <ellipse cx="240" cy="380" rx="9" ry="4" transform="rotate(-40 240 380)" />
              <ellipse cx="340" cy="440" rx="8" ry="3.5" transform="rotate(35 340 440)" />
              <ellipse cx="110" cy="610" rx="9" ry="4" transform="rotate(-20 110 610)" />
              <ellipse cx="270" cy="640" rx="8" ry="3.5" transform="rotate(50 270 640)" />
            </g>
          </svg>
        )}

        {customization.style === 'artdeco' && (
          <svg className="w-full h-full" viewBox="0 0 400 700" preserveAspectRatio="none">
            <rect width="100%" height="100%" fill="#09090b" />
            <rect x="25" y="25" width="350" height="650" fill="none" stroke={theme.accent} strokeWidth="1.8" rx="8" />
            <rect x="35" y="35" width="330" height="630" fill="none" stroke={theme.accentGlow} strokeWidth="1" rx="6" />
            {[[25, 25, 0], [375, 25, 90], [375, 675, 180], [25, 675, -90]].map(([fx, fy, fa], i) => (
              <g key={i} transform={`translate(${fx}, ${fy}) rotate(${fa})`} stroke={theme.accent} strokeWidth="1">
                {[0, 15, 30, 45, 60, 75, 90].map((deg) => (
                  <line key={deg} x1="0" y1="0" x2={Math.cos((deg * Math.PI) / 180) * 36} y2={Math.sin((deg * Math.PI) / 180) * 36} />
                ))}
                <path d="M 0,22 A 22,22 0 0,0 22,0" fill="none" />
                <path d="M 0,34 A 34,34 0 0,0 34,0" fill="none" />
              </g>
            ))}
          </svg>
        )}

        {(customization.style === '3d' || customization.style === 'sphere') && (
          <div className="w-full h-full relative overflow-hidden">
            <div
              className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-45"
              style={{ background: theme.accent }}
            />
            <div
              className="absolute top-1/3 -right-12 w-56 h-56 rounded-full blur-3xl opacity-35"
              style={{ background: theme.accentGlow }}
            />
            <div
              className="absolute -bottom-12 left-1/4 w-52 h-52 rounded-full blur-3xl opacity-40"
              style={{ background: theme.accent }}
            />
          </div>
        )}

        {customization.style === 'watercolor' && (
          <svg className="w-full h-full" viewBox="0 0 400 700" preserveAspectRatio="none">
            <rect width="100%" height="100%" fill="#f8fafc" />
            <circle cx="100" cy="140" r="160" fill={theme.accent} opacity="0.3" filter="blur(20px)" />
            <circle cx="300" cy="245" r="180" fill="#38bdf8" opacity="0.3" filter="blur(24px)" />
            <circle cx="160" cy="455" r="200" fill="#818cf8" opacity="0.25" filter="blur(25px)" />
            <circle cx="320" cy="595" r="160" fill="#fb7185" opacity="0.25" filter="blur(22px)" />
          </svg>
        )}

        {customization.style === 'collage' && (
          <svg className="w-full h-full" viewBox="0 0 400 700" preserveAspectRatio="none">
            <rect width="100%" height="100%" fill="#f5efe6" />
            <g fill="rgba(0, 0, 0, 0.04)">
              <rect x="25" y="40" width="75" height="620" />
              <rect x="115" y="40" width="75" height="620" />
              <rect x="205" y="40" width="75" height="620" />
              <rect x="295" y="40" width="75" height="620" />
            </g>
            <rect x="20" y="25" width="60" height="20" fill={theme.accent} opacity="0.6" transform="rotate(-15 50 35)" stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" />
            <rect x="320" y="25" width="60" height="20" fill="#38bdf8" opacity="0.6" transform="rotate(20 350 35)" stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" />
            <rect x="20" y="650" width="60" height="20" fill="#4ade80" opacity="0.6" transform="rotate(15 50 660)" stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" />
            <rect x="320" y="650" width="60" height="20" fill="#f472b6" opacity="0.6" transform="rotate(-20 350 660)" stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" />
          </svg>
        )}

        {customization.style === 'goth' && (
          <svg className="w-full h-full" viewBox="0 0 400 700" preserveAspectRatio="none">
            <rect width="100%" height="100%" fill="#09090b" />
            <g stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1">
              {Array.from({ length: 45 }).map((_, i) => (
                <line key={i} x1={-300 + i * 24} y1="0" x2={i * 24} y2="700" />
              ))}
            </g>
          </svg>
        )}

        {customization.style === 'cinema' && (
          <svg className="w-full h-full" viewBox="0 0 400 700" preserveAspectRatio="none">
            <rect width="100%" height="100%" fill="#080a0f" />
            <rect x="0" y="0" width="400" height="45" fill="#000000" />
            <rect x="0" y="655" width="400" height="45" fill="#000000" />
            <defs>
              <linearGradient id="domCinemaBeam" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={theme.accent} stopOpacity="0.45" />
                <stop offset="50%" stopColor="rgba(245, 158, 11, 0.22)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <polygon points="0,120 400,480 400,600 0,240" fill="url(#domCinemaBeam)" />
          </svg>
        )}

        {customization.style === 'pixel' && (
          <svg className="w-full h-full opacity-80" viewBox="0 0 400 400" preserveAspectRatio="none">
            {Array.from({ length: 48 }).map((_, i) => {
              const x = (i % 8) * 50 + 6;
              const y = Math.floor(i / 8) * 66 + 6;
              const isAccent = (i * 7 + 3) % 9 === 0;
              const isGlow = (i * 5 + 2) % 4 === 0;
              return (
                <rect
                  key={i}
                  x={x}
                  y={y}
                  width="38"
                  height="54"
                  rx="4"
                  fill={isAccent ? theme.accent : isGlow ? theme.accentGlow : 'rgba(255,255,255,0.025)'}
                  opacity={isAccent ? 0.9 : isGlow ? 0.35 : 0.2}
                />
              );
            })}
          </svg>
        )}

        {customization.style === 'cyber' && (
          <svg className="w-full h-full opacity-70" viewBox="0 0 400 400" preserveAspectRatio="none">
            {[20, 60, 100, 140, 180, 220, 260, 300, 340, 380].map((bx, idx) => (
              <line key={idx} x1="200" y1="170" x2={bx} y2="400" stroke={theme.accent} strokeWidth="1.2" />
            ))}
            {[180, 195, 215, 240, 275, 320, 375].map((y, idx) => (
              <line key={idx} x1="0" y1={y} x2="400" y2={y} stroke={theme.accent} strokeWidth="1.2" opacity="0.6" />
            ))}
          </svg>
        )}

        {customization.style === 'topo' && (
          <svg className="w-full h-full opacity-60" viewBox="0 0 400 400" fill="none" stroke={theme.accent} strokeWidth="1.4">
            <path d="M-20,70 Q90,30 200,90 T420,50" opacity="0.3" />
            <path d="M-20,120 Q120,60 220,140 T420,100" opacity="0.4" />
            <path d="M-20,170 Q70,220 190,160 T420,170" opacity="0.5" />
            <path d="M-20,220 Q140,160 260,240 T420,210" opacity="0.6" />
          </svg>
        )}

        {customization.style === 'minimal' && <div className="w-full h-full" />}
      </div>

      {/* 3. Lighting Profile Overlay (RENDERED DIRECTLY ON TOP OF ARTWORK) */}
      {customization.lighting === 'dark' && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(0, 0, 0, 0.72) 90%)',
            }}
          />
          <div
            className="absolute -top-10 -left-10 w-48 h-48 rounded-full blur-2xl opacity-60"
            style={{ background: '#38bdf8' }}
          />
        </div>
      )}
      {customization.lighting === 'sunset' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 85% 15%, rgba(251, 146, 60, 0.5) 0%, rgba(244, 63, 94, 0.3) 40%, transparent 75%)',
          }}
        />
      )}
      {customization.lighting === 'bright' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.12) 45%, transparent 75%)',
          }}
        />
      )}
      {customization.lighting === 'ethereal' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 45%, rgba(251, 191, 36, 0.35) 0%, rgba(245, 158, 11, 0.18) 50%, transparent 80%)',
          }}
        />
      )}
      {customization.lighting === 'spotlight' && (
        <div
          className="absolute inset-x-0 top-0 h-4/5 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${theme.accentGlow} 0%, rgba(255, 255, 255, 0.2) 20%, transparent 72%)`,
          }}
        />
      )}
      {customization.lighting === 'eclipse' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-48 sm:w-56 h-48 sm:h-56 rounded-full blur-xl"
            style={{
              background: `radial-gradient(circle, ${theme.accent} 25%, ${theme.accentGlow} 65%, transparent 80%)`,
            }}
          />
        </div>
      )}
      {customization.lighting === 'sunburst' && (
        <div
          className="absolute -top-12 -right-12 w-72 sm:w-80 h-72 sm:h-80 rounded-full blur-2xl pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${theme.accent} 0%, ${theme.accentGlow} 45%, transparent 75%)`,
            opacity: 0.85,
          }}
        />
      )}
      {customization.lighting === 'diffuse' && (
        <>
          <div
            className="absolute top-1/4 -left-12 w-56 sm:w-64 h-56 sm:h-64 rounded-full blur-3xl opacity-70 pointer-events-none"
            style={{ background: theme.accentGlow }}
          />
          <div
            className="absolute bottom-1/4 -right-12 w-56 sm:w-64 h-56 sm:h-64 rounded-full blur-3xl opacity-70 pointer-events-none"
            style={{ background: theme.accentGlow }}
          />
        </>
      )}
      {customization.lighting === 'stealth' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, transparent 20%, rgba(0,0,0,0.75) 85%)',
          }}
        />
      )}
      {customization.lighting === 'rim' && (
        <>
          <div
            className="absolute -top-10 -left-10 w-44 h-44 rounded-full blur-2xl opacity-60 pointer-events-none"
            style={{ background: theme.accentGlow }}
          />
          <div
            className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full blur-2xl opacity-60 pointer-events-none"
            style={{ background: theme.accentGlow }}
          />
        </>
      )}

      {/* 4. Mood Texture Overlay (RENDERED ON TOP OF LIGHTING, strictly zero sparkles) */}
      {customization.mood === 'glowy' && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 45%, rgba(16, 185, 129, 0.42) 0%, rgba(6, 182, 212, 0.28) 45%, transparent 75%)',
            }}
          />
          <div className="absolute inset-0 shadow-[inset_0_0_35px_rgba(16,185,129,0.35)]" />
        </div>
      )}
      {customization.mood === 'sweets' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-pink-500/12" />
          <svg className="w-full h-full" viewBox="0 0 400 700">
            {[
              [60, 90, '#f472b6', 25], [140, 60, '#38bdf8', -15], [230, 80, '#facc15', 40],
              [320, 110, '#4ade80', -30], [80, 200, '#ffffff', 15], [300, 230, '#f472b6', -45],
              [50, 360, '#38bdf8', 35], [340, 340, '#facc15', 20], [180, 430, '#4ade80', -20],
              [70, 520, '#ffffff', -10], [310, 500, '#f472b6', 30], [150, 620, '#38bdf8', 45],
              [270, 640, '#facc15', -25], [360, 610, '#4ade80', 10], [40, 660, '#f472b6', -35],
            ].map(([x, y, col, rot], idx) => (
              <rect
                key={idx}
                x={(x as number) - 8}
                y={(y as number) - 2.5}
                width="16"
                height="5"
                rx="2.5"
                fill={col as string}
                opacity="0.85"
                transform={`rotate(${rot} ${x} ${y})`}
              />
            ))}
          </svg>
        </div>
      )}
      {customization.mood === 'dreamy' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 400 700">
            {[
              [80, 120, 28, 0.4], [310, 160, 38, 0.35], [200, 250, 22, 0.45],
              [70, 370, 34, 0.3], [330, 420, 42, 0.4], [160, 510, 30, 0.35],
              [90, 620, 26, 0.4], [290, 630, 36, 0.35],
            ].map(([cx, cy, r, op], idx) => (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r={r}
                fill="#fbbf24"
                opacity={op}
                filter="blur(6px)"
              />
            ))}
          </svg>
        </div>
      )}
      {customization.mood === 'grain' && (
        <div
          className="absolute inset-0 opacity-45 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(${theme.colour === 'ivory' ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.18)'} 1px, transparent 1px)`,
            backgroundSize: '4px 4px',
          }}
        />
      )}
      {customization.mood === 'scanlines' && (
        <div
          className="absolute inset-0 pointer-events-none opacity-45"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 1.5px, transparent 1.5px, transparent 4px)',
          }}
        />
      )}
      {customization.mood === 'mist' && (
        <div
          className="absolute inset-x-0 bottom-0 h-3/5 pointer-events-none opacity-50"
          style={{
            background: `linear-gradient(to top, ${theme.accentGlow} 0%, transparent 100%)`,
          }}
        />
      )}
      {customization.mood === 'vignette' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.7) 100%)',
          }}
        />
      )}
    </div>
  );
}

function RenderStylePreviewSphere({ styleId, theme }: { styleId: string; theme: ThemeColors }) {
  if (styleId === '3d' || styleId === 'sphere') {
    return (
      <svg viewBox="0 0 80 80" className="w-full h-full">
        <rect width="80" height="80" fill="#eae2d6" />
        <ellipse cx="40" cy="65" rx="22" ry="5.5" fill="rgba(80,70,60,0.22)" />
        <defs>
          <radialGradient id="thumb3dGrad" cx="35%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#ded7cc" />
            <stop offset="100%" stopColor="#8d8476" />
          </radialGradient>
        </defs>
        <circle cx="40" cy="38" r="24" fill="url(#thumb3dGrad)" />
        <ellipse cx="32" cy="30" rx="6" ry="4" fill="#ffffff" opacity="0.65" transform="rotate(-30 32 30)" />
      </svg>
    );
  }

  if (styleId === 'collage') {
    return (
      <svg viewBox="0 0 80 80" className="w-full h-full">
        <rect width="80" height="80" fill="#f6ece5" />
        <circle cx="40" cy="40" r="23" fill="#f8fafc" />
        <g transform="translate(40,40)">
          {[0, 24, 48, 72, 96, 120, 144, 168, 192, 216, 240, 264, 288, 312, 336].map((deg, i) => {
            const colors = ['#fbcfe8', '#fed7aa', '#fef08a', '#bbf7d0', '#bae6fd', '#ddd6fe'];
            return (
              <rect
                key={deg}
                x="12"
                y="-4"
                width="15"
                height="8"
                fill={colors[i % colors.length]}
                stroke="#00000015"
                strokeWidth="0.5"
                transform={`rotate(${deg})`}
              />
            );
          })}
        </g>
        <defs>
          <radialGradient id="collageCenterGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#d1d5db" />
          </radialGradient>
        </defs>
        <circle cx="40" cy="40" r="16" fill="url(#collageCenterGrad)" />
      </svg>
    );
  }

  if (styleId === 'anime') {
    return (
      <svg viewBox="0 0 80 80" className="w-full h-full">
        <defs>
          <linearGradient id="animeBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fce7f3" />
            <stop offset="100%" stopColor="#fdf2f8" />
          </linearGradient>
          <linearGradient id="animeOrb" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbcfe8" />
            <stop offset="50%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#a7f3d0" />
          </linearGradient>
        </defs>
        <rect width="80" height="80" fill="url(#animeBg)" />
        <circle cx="40" cy="42" r="24" fill="url(#animeOrb)" />
        <circle cx="33" cy="42" r="2.6" fill="#1e1b4b" />
        <circle cx="47" cy="42" r="2.6" fill="#1e1b4b" />
        <circle cx="34" cy="41" r="0.9" fill="#ffffff" />
        <circle cx="48" cy="41" r="0.9" fill="#ffffff" />
        <ellipse cx="28" cy="47" rx="3.5" ry="2" fill="#f43f5e" opacity="0.55" />
        <ellipse cx="52" cy="47" rx="3.5" ry="2" fill="#f43f5e" opacity="0.55" />
        <path d="M 38 45 Q 40 48 42 45" stroke="#1e1b4b" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  if (styleId === 'paper') {
    return (
      <svg viewBox="0 0 80 80" className="w-full h-full">
        <rect width="80" height="80" fill="#d9c3ad" />
        <ellipse cx="40" cy="65" rx="20" ry="5" fill="rgba(60,40,20,0.2)" />
        <defs>
          <radialGradient id="paperShade" cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#faf5ee" />
            <stop offset="60%" stopColor="#e5d5be" />
            <stop offset="100%" stopColor="#8c775d" />
          </radialGradient>
          <clipPath id="paperClip">
            <circle cx="40" cy="38" r="24" />
          </clipPath>
        </defs>
        <circle cx="40" cy="38" r="24" fill="url(#paperShade)" />
        <g clipPath="url(#paperClip)">
          <polygon points="20,28 36,22 45,32 30,38" fill="#e2c8a0" opacity="0.7" />
          <polygon points="34,22 55,20 58,35 44,32" fill="#f7f1e5" opacity="0.8" />
          <polygon points="44,32 58,35 52,50 38,44" fill="#a38c6d" opacity="0.6" />
          <polygon points="26,38 38,44 32,56 18,48" fill="#c4ad8d" opacity="0.75" />
          <polygon points="38,44 52,50 44,62 32,56" fill="#8c7352" opacity="0.7" />
          <line x1="22" y1="29" x2="45" y2="33" stroke="#8c7352" strokeWidth="0.8" opacity="0.6" />
          <line x1="33" y1="21" x2="52" y2="49" stroke="#8c7352" strokeWidth="0.8" opacity="0.6" />
        </g>
      </svg>
    );
  }

  if (styleId === 'illustrated') {
    return (
      <svg viewBox="0 0 80 80" className="w-full h-full">
        <defs>
          <linearGradient id="illBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>
          <clipPath id="illClip">
            <circle cx="40" cy="40" r="24" />
          </clipPath>
        </defs>
        <rect width="80" height="80" fill="url(#illBg)" />
        <circle cx="40" cy="40" r="24" fill="#fb923c" />
        <g clipPath="url(#illClip)">
          <path d="M 10 22 Q 25 16 40 22 T 70 20 L 70 30 Q 55 24 40 30 T 10 28 Z" fill="#f43f5e" />
          <path d="M 10 30 Q 25 24 40 30 T 70 28 L 70 38 Q 55 32 40 38 T 10 36 Z" fill="#fb923c" />
          <path d="M 10 38 Q 25 32 40 38 T 70 36 L 70 46 Q 55 40 40 46 T 10 44 Z" fill="#facc15" />
          <path d="M 10 46 Q 25 40 40 46 T 70 44 L 70 54 Q 55 48 40 54 T 10 52 Z" fill="#22d3ee" />
          <path d="M 10 54 Q 25 48 40 54 T 70 52 L 70 64 Q 55 58 40 64 T 10 62 Z" fill="#818cf8" />
          <path d="M 10 64 Q 25 58 40 64 T 70 62 L 70 75 L 10 75 Z" fill="#c084fc" />
        </g>
        <circle cx="40" cy="40" r="24" fill="none" stroke="#00000020" strokeWidth="1" />
      </svg>
    );
  }

  if (styleId === 'lowpoly') {
    return (
      <svg viewBox="0 0 80 80" className="w-full h-full">
        <rect width="80" height="80" fill="#581c87" />
        <defs>
          <clipPath id="lowpolyClip">
            <circle cx="40" cy="40" r="24" />
          </clipPath>
        </defs>
        <g clipPath="url(#lowpolyClip)">
          <polygon points="40,16 30,26 40,28" fill="#e9d5ff" />
          <polygon points="40,16 40,28 50,26" fill="#d8b4fe" />
          <polygon points="30,26 18,34 30,38" fill="#c084fc" />
          <polygon points="30,26 40,28 30,38" fill="#d8b4fe" />
          <polygon points="40,28 50,26 50,38" fill="#a855f7" />
          <polygon points="50,26 62,34 50,38" fill="#9333ea" />
          <polygon points="18,34 16,46 28,48" fill="#9333ea" />
          <polygon points="18,34 30,38 28,48" fill="#a855f7" />
          <polygon points="30,38 40,28 40,46" fill="#c084fc" />
          <polygon points="40,28 50,38 40,46" fill="#9333ea" />
          <polygon points="50,38 62,34 64,46" fill="#7e22ce" />
          <polygon points="50,38 52,48 64,46" fill="#6b21a8" />
          <polygon points="40,46 50,38 52,48" fill="#7e22ce" />
          <polygon points="28,48 40,46 40,56" fill="#7e22ce" />
          <polygon points="40,46 52,48 40,56" fill="#6b21a8" />
          <polygon points="28,48 16,46 26,58" fill="#6b21a8" />
          <polygon points="28,48 40,56 26,58" fill="#581c87" />
          <polygon points="52,48 64,46 54,58" fill="#581c87" />
          <polygon points="52,48 40,56 54,58" fill="#3b0764" />
          <polygon points="26,58 40,56 40,64" fill="#3b0764" />
          <polygon points="40,56 54,58 40,64" fill="#2e1065" />
        </g>
      </svg>
    );
  }

  if (styleId === 'cartoon') {
    return (
      <svg viewBox="0 0 80 80" className="w-full h-full">
        <rect width="80" height="80" fill="#fed7aa" />
        <g stroke="#f97316" strokeWidth="1.2" opacity="0.6">
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <line
              key={deg}
              x1="40"
              y1="40"
              x2={40 + Math.cos((deg * Math.PI) / 180) * 38}
              y2={40 + Math.sin((deg * Math.PI) / 180) * 38}
            />
          ))}
        </g>
        <ellipse cx="40" cy="65" rx="20" ry="5" fill="rgba(0,0,0,0.3)" />
        <defs>
          <clipPath id="cartoonClip">
            <circle cx="40" cy="38" r="23" />
          </clipPath>
        </defs>
        <g clipPath="url(#cartoonClip)">
          <rect x="17" y="15" width="12" height="46" fill="#ef4444" />
          <rect x="29" y="15" width="11" height="46" fill="#06b6d4" />
          <rect x="40" y="15" width="11" height="46" fill="#facc15" />
          <rect x="51" y="15" width="12" height="46" fill="#ffffff" />
        </g>
        <circle cx="40" cy="38" r="23" fill="none" stroke="#18181b" strokeWidth="2.5" />
      </svg>
    );
  }

  if (styleId === 'goth') {
    return (
      <svg viewBox="0 0 80 80" className="w-full h-full">
        <rect width="80" height="80" fill="#3f3f46" />
        <ellipse cx="40" cy="65" rx="22" ry="5.5" fill="#18181b" opacity="0.75" />
        <defs>
          <clipPath id="gothClip">
            <circle cx="40" cy="38" r="23" />
          </clipPath>
        </defs>
        <circle cx="40" cy="38" r="23" fill="#ffffff" />
        <g clipPath="url(#gothClip)">
          <path d="M 22 28 Q 44 26 58 48 A 23 23 0 0 1 17 38 Q 18 32 22 28 Z" fill="#18181b" transform="rotate(20 40 38)" />
        </g>
        <circle cx="40" cy="38" r="23" fill="none" stroke="#18181b" strokeWidth="2.5" />
      </svg>
    );
  }

  if (styleId === 'artdeco') {
    return (
      <svg viewBox="0 0 80 80" className="w-full h-full">
        <rect width="80" height="80" fill="#fce7f3" />
        <defs>
          <radialGradient id="adCenter" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="60%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
        </defs>
        <circle cx="40" cy="40" r="24" fill="url(#adCenter)" />
        <circle cx="40" cy="40" r="20" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
        <circle cx="40" cy="40" r="14" fill="none" stroke="#f59e0b" strokeWidth="1" />
        <circle cx="40" cy="40" r="9" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
        <circle cx="40" cy="40" r="6" fill="#10b981" stroke="#fbbf24" strokeWidth="1.2" />
        <circle cx="38" cy="38" r="1.5" fill="#a7f3d0" />
      </svg>
    );
  }

  if (styleId === 'cinema') {
    return (
      <svg viewBox="0 0 80 80" className="w-full h-full">
        <rect width="80" height="80" fill="#292524" />
        <defs>
          <radialGradient id="cinemaSphere" cx="32%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#d6c7b2" />
            <stop offset="35%" stopColor="#786855" />
            <stop offset="75%" stopColor="#362d24" />
            <stop offset="100%" stopColor="#15120e" />
          </radialGradient>
        </defs>
        <circle cx="40" cy="40" r="24" fill="url(#cinemaSphere)" />
      </svg>
    );
  }

  if (styleId === 'watercolor') {
    return (
      <svg viewBox="0 0 80 80" className="w-full h-full">
        <rect width="80" height="80" fill="#fef9f3" />
        <defs>
          <radialGradient id="wcSphere" cx="40%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#67e8f9" />
            <stop offset="75%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#6366f1" />
          </radialGradient>
        </defs>
        <circle cx="40" cy="40" r="24" fill="url(#wcSphere)" opacity="0.9" />
        <circle cx="40" cy="40" r="22" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      </svg>
    );
  }

  // Fallback generic 3D sphere
  return (
    <div
      className="w-full h-full relative overflow-hidden flex items-center justify-center rounded-lg"
      style={{
        background: `linear-gradient(135deg, ${theme.backgroundStart}, ${theme.backgroundEnd})`,
      }}
    >
      <div
        className="w-6 h-6 rounded-full shadow-md"
        style={{
          background: `radial-gradient(circle at 35% 35%, ${theme.accent}, #000)`,
          boxShadow: `0 0 8px ${theme.accentGlow}`,
        }}
      />
    </div>
  );
}

/**
 * Miniature preview tile for category option cards (Zero sparkles)
 */
function ThumbnailPreviewTile({
  category,
  item,
  activeCustomization,
}: {
  category: FlexCardCategoryTab;
  item: CustomizationOptionItem | FeaturedPresetItem;
  activeCustomization: FlexCardCustomization;
}) {
  const currentTheme = COLOUR_PALETTES[activeCustomization.colour] || COLOUR_PALETTES.ember;

  if (category === 'featured') {
    const preset = item as FeaturedPresetItem;
    const pTheme = COLOUR_PALETTES[preset.customization.colour] || COLOUR_PALETTES.ember;
    return <RenderStylePreviewSphere styleId={preset.id} theme={pTheme} />;
  }

  if (category === 'styles') {
    return <RenderStylePreviewSphere styleId={item.id} theme={currentTheme} />;
  }

  if (category === 'moods') {
    if (item.id === 'glowy') {
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <rect width="80" height="80" fill="#021c22" />
          <circle cx="40" cy="40" r="24" fill="#042f2e" />
          <path d="M 28 48 Q 34 38 40 40 T 52 32" stroke="#22d3ee" strokeWidth="1.5" fill="none" />
          <path d="M 40 40 Q 42 26 36 20" stroke="#34d399" strokeWidth="1.2" fill="none" />
          <path d="M 40 40 Q 48 42 46 56" stroke="#f43f5e" strokeWidth="1.2" fill="none" />
          <circle cx="40" cy="40" r="2" fill="#67e8f9" />
          <circle cx="36" cy="20" r="1.5" fill="#a7f3d0" />
          <circle cx="52" cy="32" r="1.5" fill="#67e8f9" />
          <circle cx="28" cy="48" r="1.5" fill="#67e8f9" />
        </svg>
      );
    }
    if (item.id === 'sweets') {
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <rect width="80" height="80" fill="#fce7f3" />
          <defs>
            <radialGradient id="sweetsSphere" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="60%" stopColor="#c7d2fe" />
              <stop offset="100%" stopColor="#f472b6" />
            </radialGradient>
          </defs>
          <circle cx="40" cy="42" r="24" fill="url(#sweetsSphere)" />
          {[
            [28, 32, '#f43f5e', 20], [42, 26, '#facc15', -15], [52, 34, '#38bdf8', 35],
            [34, 46, '#4ade80', -30], [48, 48, '#ffffff', 40], [38, 36, '#fb923c', 10]
          ].map(([x, y, col, rot], idx) => (
            <rect
              key={idx}
              x={(x as number) - 3}
              y={(y as number) - 1.2}
              width="6"
              height="2.4"
              rx="1.2"
              fill={col as string}
              transform={`rotate(${rot} ${x} ${y})`}
            />
          ))}
        </svg>
      );
    }
    if (item.id === 'dreamy') {
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <rect width="80" height="80" fill="#2d2012" />
          <defs>
            <radialGradient id="dreamySphere" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#f59e0b" />
              <stop offset="85%" stopColor="#92400e" />
              <stop offset="100%" stopColor="#451a03" />
            </radialGradient>
          </defs>
          <circle cx="22" cy="24" r="6" fill="#facc15" opacity="0.35" />
          <circle cx="62" cy="30" r="8" fill="#f59e0b" opacity="0.3" />
          <circle cx="26" cy="58" r="5" fill="#fde047" opacity="0.25" />
          <circle cx="58" cy="60" r="7" fill="#f59e0b" opacity="0.3" />
          <circle cx="40" cy="40" r="24" fill="url(#dreamySphere)" />
          <circle cx="34" cy="32" r="5" fill="#ffffff" opacity="0.5" />
        </svg>
      );
    }
    // Fallback mood
    return (
      <div
        className="w-full h-full relative overflow-hidden flex items-center justify-center rounded-lg"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.backgroundStart}, ${currentTheme.backgroundEnd})`,
        }}
      >
        <div className="w-5 h-5 rounded-full" style={{ background: currentTheme.accent }} />
      </div>
    );
  }

  if (category === 'lighting') {
    if (item.id === 'dark') {
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <rect width="80" height="80" fill="#091428" />
          <defs>
            <radialGradient id="darkSphere" cx="35%" cy="25%" r="75%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="35%" stopColor="#0284c7" />
              <stop offset="75%" stopColor="#082f49" />
              <stop offset="100%" stopColor="#020b14" />
            </radialGradient>
          </defs>
          <circle cx="40" cy="40" r="24" fill="url(#darkSphere)" />
          <ellipse cx="36" cy="28" rx="8" ry="4" fill="#e0f2fe" opacity="0.75" />
        </svg>
      );
    }
    if (item.id === 'sunset') {
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <rect width="80" height="80" fill="#2d161a" />
          <defs>
            <radialGradient id="sunsetSphere" cx="45%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="45%" stopColor="#fb7185" />
              <stop offset="85%" stopColor="#be123c" />
              <stop offset="100%" stopColor="#4c0519" />
            </radialGradient>
          </defs>
          <polygon points="50,0 75,0 45,80 20,80" fill="#fb923c" opacity="0.25" />
          <circle cx="40" cy="40" r="24" fill="url(#sunsetSphere)" />
          <ellipse cx="38" cy="32" rx="7" ry="4" fill="#ffffff" opacity="0.7" transform="rotate(-20 38 32)" />
        </svg>
      );
    }
    if (item.id === 'bright') {
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <rect width="80" height="80" fill="#edf2f7" />
          <defs>
            <radialGradient id="brightSphere" cx="38%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#e2e8f0" />
              <stop offset="90%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </radialGradient>
          </defs>
          <circle cx="40" cy="40" r="24" fill="url(#brightSphere)" />
          <circle cx="35" cy="32" r="8" fill="#ffffff" opacity="0.9" />
        </svg>
      );
    }
    if (item.id === 'ethereal') {
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <rect width="80" height="80" fill="#2a1b0a" />
          <defs>
            <radialGradient id="etherealSphere" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="90%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#451a03" />
            </radialGradient>
          </defs>
          <circle cx="40" cy="40" r="28" fill="#f59e0b" opacity="0.3" />
          <circle cx="40" cy="40" r="24" fill="url(#etherealSphere)" />
          <circle cx="35" cy="32" r="6" fill="#ffffff" opacity="0.6" />
          <circle cx="58" cy="32" r="4" fill="#fbbf24" opacity="0.35" />
          <circle cx="22" cy="50" r="3" fill="#fde047" opacity="0.3" />
        </svg>
      );
    }
    // Fallback lighting
    return (
      <div
        className="w-full h-full relative overflow-hidden flex items-center justify-center rounded-lg"
        style={{ background: currentTheme.backgroundStart }}
      >
        <div className="w-5 h-5 rounded-full" style={{ background: currentTheme.accent }} />
      </div>
    );
  }

  if (category === 'colours') {
    const cItem = item as CustomizationOptionItem & { hex: string };
    const pCol = COLOUR_PALETTES[cItem.id as FlexCardColour] || COLOUR_PALETTES.ember;
    return (
      <svg viewBox="0 0 80 80" className="w-full h-full">
        <rect width="80" height="80" fill={pCol.backgroundStart} />
        <defs>
          <radialGradient id={`pCol_${cItem.id}`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor={pCol.accent} />
            <stop offset="70%" stopColor={pCol.cardBorder} />
            <stop offset="100%" stopColor={pCol.backgroundEnd} />
          </radialGradient>
        </defs>
        <circle cx="40" cy="40" r="24" fill={`url(#pCol_${cItem.id})`} />
        <ellipse cx="34" cy="32" rx="7" ry="4" fill="#ffffff" opacity="0.5" transform="rotate(-25 34 32)" />
      </svg>
    );
  }

  return null;
}

/**
 * Razor-Sharp Vector DOM Preview Card Component
 * Eliminates all downsampling blur by rendering native CSS vectors & typography.
 */


function FlexCardVectorPreview({
  data,
  themeKey,
  customization,
  format,
}: {
  data: FlexCardData;
  themeKey?: FlexCardTheme;
  customization?: FlexCardCustomization;
  format: FlexCardFormat;
}) {
  const activeCustomization: FlexCardCustomization = customization || (
    themeKey ? { ...DEFAULT_CUSTOMIZATION, colour: (themeKey === 'obsidian' ? 'ember' : themeKey) as FlexCardColour } : DEFAULT_CUSTOMIZATION
  );
  const theme = COLOUR_PALETTES[activeCustomization.colour] || COLOUR_PALETTES.ember;
  const styleTheme = getEffectiveCardStyling(activeCustomization, theme);

  const fallbackDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((label) => ({
    label,
    completed: false,
    isFuture: false,
  }));
  const weeklyDots = data.weeklyDots && data.weeklyDots.length === 7 ? data.weeklyDots : fallbackDays;
  const pct = Math.min(100, Math.max(0, Math.round(data.completionRate ?? 0)));

  const userFooterLabel =
    data.showUser !== false && data.userName && data.userName.trim()
      ? `DISCIPLINE BY ${data.userName.trim().toUpperCase()}`
      : (data.footerLabel || 'HABIT TRACKER ARCHIVE');

  // ================= LANDSCAPE (16:9) =================
  if (format === 'landscape') {
    return (
      <div
        className="w-full h-full relative p-3 sm:p-3.5 flex flex-col justify-between overflow-hidden select-none"
        style={{
          background: styleTheme.cardBg,
          border: styleTheme.cardBorder,
          boxShadow: styleTheme.cardShadow,
          borderRadius: styleTheme.cardRadius,
          color: styleTheme.primaryText,
        }}
      >
        {/* Procedural Vector Art Background Layer */}
        <CardVectorArtLayer
          customization={activeCustomization}
          theme={theme}
          format={format}
          styleTheme={styleTheme}
        />

        {/* Top Header */}
        <div
          className="relative z-10 w-full flex items-center justify-between border-b pb-1.5 shrink-0"
          style={{ borderColor: styleTheme.headerDivider }}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <BrandLogoIcon size={18} theme={theme} />
            <span
              className="font-clash font-bold text-[10.5px] tracking-tight shrink-0"
              style={{ color: styleTheme.headerBrandColor, whiteSpace: 'nowrap' }}
            >
              HABIT TRACKER
            </span>
          </div>
          {data.dateStr && (
            <span
              className="text-[8.5px] font-bold uppercase tracking-wider shrink-0"
              style={{ color: styleTheme.dateColor, opacity: 0.75, whiteSpace: 'nowrap' }}
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
              className="self-start px-2 py-0.5 text-[7.5px] font-bold tracking-wider uppercase border truncate max-w-full"
              style={{
                background: styleTheme.badgeBg,
                border: styleTheme.badgeBorder,
                color: styleTheme.badgeText,
                boxShadow: styleTheme.badgeShadow,
                borderRadius: '9999px',
                whiteSpace: 'nowrap',
              }}
            >
              {data.badgeText}
            </span>

            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span
                className="font-clash font-extrabold text-[34px] sm:text-[38px] leading-none tracking-tight"
                style={{
                  color: styleTheme.metricColor,
                  textShadow: styleTheme.metricShadow,
                }}
              >
                {data.metricValue}
              </span>
              {data.metricUnit && (
                <span
                  className="text-[9px] font-bold uppercase tracking-wider leading-none"
                  style={{ color: styleTheme.accent, whiteSpace: 'nowrap' }}
                >
                  {data.metricUnit}
                </span>
              )}
            </div>

            <h4
              className="font-clash font-bold text-[11.5px] leading-tight truncate"
              style={{ color: styleTheme.primaryText }}
            >
              {data.title}
            </h4>
            <p
              className="text-[8.5px] leading-snug line-clamp-2"
              style={{ color: styleTheme.secondaryText }}
            >
              {data.subtitle}
            </p>
          </div>

          {/* Right Col: Stats & Quote / Dots */}
          <div className="flex flex-col gap-1.5 min-w-0">
            {/* Bento Target Routine & Adherence card */}
            <div
              className="p-1.5 border flex items-center justify-between gap-1.5"
              style={{
                background: styleTheme.bentoBg,
                border: styleTheme.bentoBorder,
                boxShadow: styleTheme.bentoShadow,
                borderRadius: styleTheme.bentoRadius,
              }}
            >
              <div className="min-w-0 flex-1">
                <span
                  className="text-[7px] font-semibold block uppercase tracking-wider leading-none"
                  style={{ color: styleTheme.bentoSubColor, opacity: 0.75 }}
                >
                  {data.bentoLabel || 'TARGET ROUTINE'}
                </span>
                <span
                  className="font-bold text-[10px] truncate block mt-0.5"
                  style={{ color: styleTheme.bentoTitleColor }}
                >
                  {data.habitTitle || 'Core Stack'}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span
                  className="text-[7px] font-semibold block uppercase tracking-wider leading-none"
                  style={{ color: styleTheme.bentoSubColor, opacity: 0.75 }}
                >
                  ADHERENCE
                </span>
                <span
                  className="font-clash font-extrabold text-[12px] block mt-0.5"
                  style={{ color: styleTheme.bentoAccentColor }}
                >
                  {pct}%
                </span>
                {data.adherenceLabel && (
                  <span
                    className="text-[6.5px] block truncate"
                    style={{ color: styleTheme.bentoSubColor, opacity: 0.7 }}
                  >
                    {data.adherenceLabel}
                  </span>
                )}
              </div>
            </div>

            {/* Quote box OR Consistency Cadence */}
            {data.showQuote !== false ? (
              <div
                className="p-1.5 border flex flex-col justify-center min-w-0"
                style={{
                  background: styleTheme.quoteBg,
                  border: styleTheme.quoteBorder,
                  boxShadow: styleTheme.quoteShadow,
                  borderRadius: styleTheme.quoteRadius,
                }}
              >
                <div className="flex gap-1 items-start min-w-0">
                  <span
                    className="font-serif text-xs leading-none shrink-0"
                    style={{ color: styleTheme.quoteMarkColor, opacity: 0.9 }}
                  >
                    “
                  </span>
                  <p
                    className="text-[8px] italic font-serif leading-tight line-clamp-2"
                    style={{ color: styleTheme.quoteTextColor }}
                  >
                    {data.quote}
                  </p>
                </div>
                <span
                  className="text-[7.5px] font-semibold mt-0.5 self-end truncate max-w-full"
                  style={{ color: styleTheme.quoteAuthorColor }}
                >
                  — {data.quoteAuthor}
                </span>
              </div>
            ) : (
              <div
                className="p-1.5 border flex flex-col justify-center gap-0.5"
                style={{
                  background: styleTheme.bentoBg,
                  border: styleTheme.bentoBorder,
                  boxShadow: styleTheme.bentoShadow,
                  borderRadius: styleTheme.bentoRadius,
                }}
              >
                <span
                  className="text-[7px] font-bold uppercase tracking-wider"
                  style={{ color: styleTheme.bentoSubColor, opacity: 0.75 }}
                >
                  7-DAY CADENCE
                </span>
                <div className="flex items-center justify-between pt-0.5">
                  {weeklyDots.map((dot, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      {dot.completed ? (
                        <div
                          className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 shadow-xs"
                          style={{ background: styleTheme.dotActiveBg }}
                        >
                          <div className="w-1 h-1 rounded-full bg-white shadow-xs" />
                        </div>
                      ) : dot.isFuture ? (
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-dashed shrink-0"
                          style={{ borderColor: styleTheme.dotInactiveBorder, opacity: 0.4 }}
                        />
                      ) : (
                        <div
                          className="w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0"
                          style={{ borderColor: styleTheme.dotInactiveBorder, opacity: 0.5 }}
                        >
                          <div
                            className="w-1 h-1 rounded-full"
                            style={{ background: styleTheme.dotInactiveBorder, opacity: 0.4 }}
                          />
                        </div>
                      )}
                      <span
                        className="text-[7px] font-bold tracking-wider"
                        style={{ color: styleTheme.dotTextColor, opacity: 0.8 }}
                      >
                        {dot.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="relative z-10 flex items-center justify-between text-[7.5px] font-semibold border-t pt-1 shrink-0"
          style={{
            borderColor: styleTheme.footerDivider,
            color: styleTheme.footerColor,
          }}
        >
          <span className="truncate max-w-[65%]" style={{ whiteSpace: 'nowrap' }}>{userFooterLabel}</span>
          <span className="shrink-0 font-bold" style={{ whiteSpace: 'nowrap' }}>HABIT TRACKER</span>
        </div>
      </div>
    );
  }

  // ================= SQUARE (1:1) =================
  if (format === 'square') {
    return (
      <div
        className="w-full h-full relative p-3 sm:p-3.5 flex flex-col justify-between overflow-hidden select-none"
        style={{
          background: styleTheme.cardBg,
          border: styleTheme.cardBorder,
          boxShadow: styleTheme.cardShadow,
          borderRadius: styleTheme.cardRadius,
          color: styleTheme.primaryText,
        }}
      >
        {/* Procedural Vector Art Background Layer */}
        <CardVectorArtLayer
          customization={activeCustomization}
          theme={theme}
          format={format}
          styleTheme={styleTheme}
        />

        {/* Header */}
        <div
          className="relative z-10 w-full flex items-center justify-between border-b pb-1.5 shrink-0"
          style={{ borderColor: styleTheme.headerDivider }}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <BrandLogoIcon size={18} theme={theme} />
            <span
              className="font-clash font-bold text-[10.5px] tracking-tight shrink-0"
              style={{ color: styleTheme.headerBrandColor, whiteSpace: 'nowrap' }}
            >
              HABIT TRACKER
            </span>
          </div>
          {data.dateStr && (
            <span
              className="text-[8.5px] font-bold uppercase tracking-wider shrink-0"
              style={{ color: styleTheme.dateColor, opacity: 0.75, whiteSpace: 'nowrap' }}
            >
              {data.dateStr}
            </span>
          )}
        </div>

        {/* Milestone Badge & Hero Number */}
        <div className="relative z-10 flex flex-col gap-0.5 min-w-0">
          <span
            className="self-start px-2 py-0.5 text-[7.5px] font-bold tracking-wider uppercase border truncate max-w-full"
            style={{
              background: styleTheme.badgeBg,
              border: styleTheme.badgeBorder,
              color: styleTheme.badgeText,
              boxShadow: styleTheme.badgeShadow,
              borderRadius: '9999px',
              whiteSpace: 'nowrap',
            }}
          >
            {data.badgeText}
          </span>

          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span
              className="font-clash font-extrabold text-[36px] sm:text-[40px] leading-none tracking-tight"
              style={{
                color: styleTheme.metricColor,
                textShadow: styleTheme.metricShadow,
              }}
            >
              {data.metricValue}
            </span>
            {data.metricUnit && (
              <span
                className="text-[10px] font-bold uppercase tracking-wider leading-none"
                style={{ color: styleTheme.accent, whiteSpace: 'nowrap' }}
              >
                {data.metricUnit}
              </span>
            )}
          </div>

          <h4
            className="font-clash font-bold text-[12px] leading-tight truncate"
            style={{ color: styleTheme.primaryText }}
          >
            {data.title}
          </h4>
          <p
            className="text-[8.5px] leading-tight line-clamp-2"
            style={{ color: styleTheme.secondaryText }}
          >
            {data.subtitle}
          </p>
        </div>

        {/* Bento Stats Row */}
        <div
          className="relative z-10 p-1.5 sm:p-2 border flex items-center justify-between gap-2 shrink-0"
          style={{
            background: styleTheme.bentoBg,
            border: styleTheme.bentoBorder,
            boxShadow: styleTheme.bentoShadow,
            borderRadius: styleTheme.bentoRadius,
          }}
        >
          <div className="min-w-0 flex-1">
            <span
              className="text-[7px] font-semibold block uppercase tracking-wider leading-none"
              style={{ color: styleTheme.bentoSubColor, opacity: 0.75 }}
            >
              {data.bentoLabel || 'TARGET ROUTINE'}
            </span>
            <span
              className="font-bold text-[10.5px] truncate block mt-0.5"
              style={{ color: styleTheme.bentoTitleColor }}
            >
              {data.habitTitle || 'Core Stack'}
            </span>
          </div>
          <div className="text-right shrink-0">
            <span
              className="text-[7px] font-semibold block uppercase tracking-wider leading-none"
              style={{ color: styleTheme.bentoSubColor, opacity: 0.75 }}
            >
              ADHERENCE
            </span>
            <span
              className="font-clash font-extrabold text-[13px] block mt-0.5"
              style={{ color: styleTheme.bentoAccentColor }}
            >
              {pct}%
            </span>
            {data.adherenceLabel && (
              <span
                className="text-[6.5px] block truncate"
                style={{ color: styleTheme.bentoSubColor, opacity: 0.7 }}
              >
                {data.adherenceLabel}
              </span>
            )}
          </div>
        </div>

        {/* Quote Capsule OR Consistency Row */}
        {data.showQuote !== false ? (
          <div
            className="relative z-10 p-1.5 sm:p-2 border flex flex-col justify-center min-w-0 shrink-0"
            style={{
              background: styleTheme.quoteBg,
              border: styleTheme.quoteBorder,
              boxShadow: styleTheme.quoteShadow,
              borderRadius: styleTheme.quoteRadius,
            }}
          >
            <div className="flex gap-1 items-start min-w-0">
              <span
                className="font-serif text-sm leading-none shrink-0"
                style={{ color: styleTheme.quoteMarkColor, opacity: 0.9 }}
              >
                “
              </span>
              <p
                className="text-[8.5px] italic font-serif leading-snug line-clamp-2"
                style={{ color: styleTheme.quoteTextColor }}
              >
                {data.quote}
              </p>
            </div>
            <span
              className="text-[7.5px] font-semibold mt-0.5 self-end truncate max-w-full"
              style={{ color: styleTheme.quoteAuthorColor }}
            >
              — {data.quoteAuthor}
            </span>
          </div>
        ) : (
          <div
            className="relative z-10 flex items-center justify-between py-1 border-y shrink-0"
            style={{ borderColor: styleTheme.headerDivider }}
          >
            {weeklyDots.map((dot, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                {dot.completed ? (
                  <div
                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 shadow-xs"
                    style={{ background: styleTheme.dotActiveBg }}
                  >
                    <div className="w-1 h-1 rounded-full bg-white shadow-xs" />
                  </div>
                ) : dot.isFuture ? (
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-dashed shrink-0"
                    style={{ borderColor: styleTheme.dotInactiveBorder, opacity: 0.4 }}
                  />
                ) : (
                  <div
                    className="w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0"
                    style={{ borderColor: styleTheme.dotInactiveBorder, opacity: 0.5 }}
                  >
                    <div
                      className="w-1 h-1 rounded-full"
                      style={{ background: styleTheme.dotInactiveBorder, opacity: 0.4 }}
                    />
                  </div>
                )}
                <span
                  className="text-[7px] font-bold tracking-wider"
                  style={{ color: styleTheme.dotTextColor, opacity: 0.8 }}
                >
                  {dot.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div
          className="relative z-10 flex items-center justify-between text-[7.5px] font-semibold border-t pt-1 shrink-0"
          style={{
            borderColor: styleTheme.footerDivider,
            color: styleTheme.footerColor,
          }}
        >
          <span className="truncate max-w-[65%]" style={{ whiteSpace: 'nowrap' }}>{userFooterLabel}</span>
          <span className="shrink-0 font-bold" style={{ whiteSpace: 'nowrap' }}>HABIT TRACKER</span>
        </div>
      </div>
    );
  }

  // ================= STORY (9:16) =================
  return (
    <div
      className="w-full h-full relative p-3 sm:p-3.5 flex flex-col justify-between overflow-hidden select-none"
      style={{
        background: styleTheme.cardBg,
        border: styleTheme.cardBorder,
        boxShadow: styleTheme.cardShadow,
        borderRadius: styleTheme.cardRadius,
        color: styleTheme.primaryText,
      }}
    >
      {/* Procedural Vector Art Background Layer */}
      <CardVectorArtLayer
        customization={activeCustomization}
        theme={theme}
        format={format}
        styleTheme={styleTheme}
      />

      {/* 1. Top Header */}
      <div
        className="relative z-10 w-full flex items-center justify-between border-b pb-1.5 shrink-0"
        style={{ borderColor: styleTheme.headerDivider }}
      >
        <div className="flex items-center gap-1.5 shrink-0">
          <BrandLogoIcon size={18} theme={theme} />
          <span
            className="font-clash font-bold text-[10.5px] tracking-tight shrink-0"
            style={{ color: styleTheme.headerBrandColor, whiteSpace: 'nowrap' }}
          >
            HABIT TRACKER
          </span>
        </div>
        {data.dateStr && (
          <span
            className="text-[8.5px] font-bold uppercase tracking-wider shrink-0"
            style={{ color: styleTheme.dateColor, opacity: 0.75, whiteSpace: 'nowrap' }}
          >
            {data.dateStr}
          </span>
        )}
      </div>

      {/* 2. Milestone Badge & Big Number */}
      <div className="relative z-10 flex flex-col gap-0.5 min-w-0">
        <span
          className="self-start px-2 py-0.5 text-[7.5px] font-bold tracking-wider uppercase border truncate max-w-full"
          style={{
            background: styleTheme.badgeBg,
            border: styleTheme.badgeBorder,
            color: styleTheme.badgeText,
            boxShadow: styleTheme.badgeShadow,
            borderRadius: '9999px',
            whiteSpace: 'nowrap',
          }}
        >
          {data.badgeText}
        </span>

        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span
            className="font-clash font-extrabold text-[36px] leading-none tracking-tight"
            style={{
              color: styleTheme.metricColor,
              textShadow: styleTheme.metricShadow,
            }}
          >
            {data.metricValue}
          </span>
          {data.metricUnit && (
            <span
              className="text-[9.5px] font-black uppercase tracking-wider leading-none"
              style={{ color: styleTheme.accent, whiteSpace: 'nowrap' }}
            >
              {data.metricUnit}
            </span>
          )}
        </div>

        <h3
          className="font-clash font-bold text-[12px] leading-tight truncate"
          style={{ color: styleTheme.primaryText }}
        >
          {data.title}
        </h3>
        <p
          className="text-[8.5px] leading-snug line-clamp-2"
          style={{ color: styleTheme.secondaryText }}
        >
          {data.subtitle}
        </p>
      </div>

      {/* 3. Weekly Consistency Dots Row */}
      <div
        className="relative z-10 flex items-center justify-between py-1 border-y shrink-0"
        style={{ borderColor: styleTheme.headerDivider }}
      >
        {weeklyDots.map((dot, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            {dot.completed ? (
              <div
                className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 shadow-xs"
                style={{ background: styleTheme.dotActiveBg }}
              >
                <div className="w-1 h-1 rounded-full bg-white shadow-xs" />
              </div>
            ) : dot.isFuture ? (
              <div
                className="w-3.5 h-3.5 rounded-full border border-dashed shrink-0"
                style={{ borderColor: styleTheme.dotInactiveBorder, opacity: 0.4 }}
              />
            ) : (
              <div
                className="w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0"
                style={{ borderColor: styleTheme.dotInactiveBorder, opacity: 0.5 }}
              >
                <div
                  className="w-1 h-1 rounded-full"
                  style={{ background: styleTheme.dotInactiveBorder, opacity: 0.4 }}
                />
              </div>
            )}
            <span
              className="text-[7px] font-bold tracking-wider"
              style={{ color: styleTheme.dotTextColor, opacity: 0.8 }}
            >
              {dot.label}
            </span>
          </div>
        ))}
      </div>

      {/* 4. Dual Bento Cards */}
      <div className="relative z-10 grid grid-cols-2 gap-1.5 shrink-0">
        <div
          className="p-1.5 border flex flex-col justify-between min-w-0"
          style={{
            background: styleTheme.bentoBg,
            border: styleTheme.bentoBorder,
            boxShadow: styleTheme.bentoShadow,
            borderRadius: styleTheme.bentoRadius,
          }}
        >
          <span
            className="text-[7px] font-bold uppercase tracking-wider"
            style={{ color: styleTheme.bentoSubColor, opacity: 0.75 }}
          >
            {data.bentoLabel || 'TARGET ROUTINE'}
          </span>
          <span
            className="font-bold text-[10px] truncate my-0.5"
            style={{ color: styleTheme.bentoTitleColor }}
          >
            {data.habitTitle || 'Core Stack'}
          </span>
          <span
            className="text-[7.5px] font-medium truncate"
            style={{ color: styleTheme.bentoAccentColor }}
          >
            {data.routineTag || 'Daily Discipline'}
          </span>
        </div>

        <div
          className="p-1.5 border flex flex-col justify-between min-w-0"
          style={{
            background: styleTheme.bentoBg,
            border: styleTheme.bentoBorder,
            boxShadow: styleTheme.bentoShadow,
            borderRadius: styleTheme.bentoRadius,
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-[7px] font-bold uppercase tracking-wider"
              style={{ color: styleTheme.bentoSubColor, opacity: 0.75 }}
            >
              ADHERENCE
            </span>
            <span
              className="font-clash font-extrabold text-[12px] leading-none"
              style={{ color: styleTheme.bentoAccentColor }}
            >
              {pct}%
            </span>
          </div>
          <div
            className="w-full h-1 rounded-full overflow-hidden my-0.5"
            style={{ background: styleTheme.progressTrack }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: styleTheme.progressFill }}
            />
          </div>
          <span
            className="text-[7px] truncate"
            style={{ color: styleTheme.bentoSubColor, opacity: 0.75 }}
          >
            {data.adherenceLabel || 'Monthly Log'}
          </span>
        </div>
      </div>

      {/* 5. Wisdom Quote Capsule OR Dynamic Habit Metrics */}
      {data.showQuote !== false ? (
        <div
          className="relative z-10 p-1.5 px-2 border flex flex-col justify-center min-w-0 shrink-0"
          style={{
            background: styleTheme.quoteBg,
            border: styleTheme.quoteBorder,
            boxShadow: styleTheme.quoteShadow,
            borderRadius: styleTheme.quoteRadius,
          }}
        >
          <div className="flex gap-1 items-start min-w-0">
            <span
              className="font-serif text-xs leading-none shrink-0"
              style={{ color: styleTheme.quoteMarkColor, opacity: 0.9 }}
            >
              “
            </span>
            <p
              className="text-[8px] italic font-serif leading-tight line-clamp-2"
              style={{ color: styleTheme.quoteTextColor }}
            >
              {data.quote}
            </p>
          </div>
          <span
            className="text-[7px] font-semibold mt-0.5 self-end truncate max-w-full"
            style={{ color: styleTheme.quoteAuthorColor }}
          >
            — {data.quoteAuthor}
          </span>
        </div>
      ) : (
        <div
          className="relative z-10 p-1.5 px-2 border grid grid-cols-3 gap-1 shrink-0"
          style={{
            background: styleTheme.bentoBg,
            border: styleTheme.bentoBorder,
            boxShadow: styleTheme.bentoShadow,
            borderRadius: styleTheme.bentoRadius,
          }}
        >
          {(data.metricDetails || [
            { label: 'STREAK', value: `${data.metricValue}`, subtext: String(data.metricUnit || 'Days') },
            { label: 'ADHERENCE', value: `${pct}%`, subtext: data.adherenceLabel || 'Monthly' },
            { label: '7-DAY PACE', value: `${weeklyDots.filter((d) => d.completed).length}/7`, subtext: 'This Week' },
          ]).map((m, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center p-1 rounded-lg"
              style={{ background: styleTheme.badgeBg, color: styleTheme.badgeText }}
            >
              <span className="text-[6px] font-bold uppercase tracking-wider leading-tight opacity-75">
                {m.label}
              </span>
              <span
                className="font-clash font-extrabold text-[10.5px] leading-tight mt-0.5"
                style={{ color: styleTheme.bentoAccentColor }}
              >
                {m.value}
              </span>
              <span className="text-[6px] opacity-75 leading-tight mt-0.5 truncate max-w-full">
                {m.subtext}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 6. Footer Signature */}
      <div
        className="relative z-10 flex items-center justify-between text-[7px] font-semibold border-t pt-1 shrink-0"
        style={{
          borderColor: styleTheme.footerDivider,
          color: styleTheme.footerColor,
        }}
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
  const [activeCategoryTab, setActiveCategoryTab] = useState<FlexCardCategoryTab>('featured');
  const [customization, setCustomization] = useState<FlexCardCustomization>(DEFAULT_CUSTOMIZATION);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('paper');
  const theme = customization.colour;
  const setTheme = (newCol: FlexCardColour) => {
    setCustomization((prev) => ({ ...prev, colour: newCol }));
    setSelectedPresetId('');
  };
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

  // Offscreen canvas export renderer with asynchronous font hydration
  const ensureCanvasRendered = useCallback(async () => {
    if (!canvasRef.current) return;
    await renderFlexCardToCanvas(canvasRef.current, cardData, customization, format);
  }, [cardData, customization, format]);

  // Pre-render the 4K canvas in background so it's primed instantly for download
  useEffect(() => {
    if (isOpen) {
      ensureCanvasRendered();
    }
  }, [isOpen, ensureCanvasRendered]);

  // Check if authenticated
  const isAnonymous = isGuestMode || !userEmail;

  // Handle Download Action
  const handleDownload = async () => {
    if (isAnonymous) {
      toast.info('Sign in required to download', {
        description: 'Please sign in or create an account to download your Milestone Flex Card in real 4K Ultra HD.',
      });
      onRequireAuth?.();
      return;
    }
    if (!canvasRef.current) return;
    setIsExporting(true);
    try {
      await ensureCanvasRendered();
      const filename = `habit-flex-${mode}-${format}-4k.png`;
      await downloadCanvasAsPng(canvasRef.current, filename);
      toast.success('Flex Card downloaded in real 4K Ultra HD!', {
        description: `Saved ${FORMAT_DIMENSIONS[format].width} × ${FORMAT_DIMENSIONS[format].height}px PNG to your device.`,
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
      await ensureCanvasRendered();
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
                        <span>3. 1-Tap Share & Real 4K PNG</span>
                      </div>
                      <p className="text-[11px] text-[#15130f]/65 dark:text-[#fbf8f1]/65 leading-relaxed">
                        Share directly to Instagram Stories or WhatsApp via native mobile share sheet, or download a crystal-clear real 4K Ultra HD PNG ({FORMAT_DIMENSIONS[format].width} × {FORMAT_DIMENSIONS[format].height}px) for your records.
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

              {/* 3. Aesthetic Customization Studio */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                    Visual Aesthetics & Artwork
                  </label>
                  <span className="text-[10px] font-bold text-[#22c55e] px-2 py-0.5 rounded-full bg-[#22c55e]/10">
                    {CATEGORY_TABS.find((t) => t.id === activeCategoryTab)?.label}
                  </span>
                </div>

                {/* Category Pill Bar: Exact match to reference screenshot ([Featured] [Styles] [Moods] [Lighting] [Colours]) */}
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 -mx-0.5 px-0.5">
                  {CATEGORY_TABS.map((tab) => {
                    const isTabActive = activeCategoryTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveCategoryTab(tab.id)}
                        className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                          isTabActive
                            ? 'bg-[#16382b] text-[#86efac] border border-[#22c55e]/30 shadow-xs'
                            : 'border border-[#15130f]/15 dark:border-white/10 text-[#15130f]/70 dark:text-white/60 hover:text-[#15130f] dark:hover:text-white hover:border-[#15130f]/30 dark:hover:border-white/20 bg-[#f2ecdf]/30 dark:bg-[#181a1d]/60'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Horizontal Scrollable Thumbnail Row: Pure tiles + label underneath, matching screenshots */}
                <div className="flex items-start gap-3 sm:gap-3.5 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 touch-pan-x justify-start sm:justify-center">
                  {activeCategoryTab === 'featured' &&
                    FEATURED_PRESETS.map((preset) => {
                      const isSel = selectedPresetId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setCustomization(preset.customization);
                            setSelectedPresetId(preset.id);
                          }}
                          className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group focus:outline-hidden"
                        >
                          <div
                            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-200 ${
                              isSel
                                ? 'ring-2 ring-white ring-offset-2 ring-offset-[#11100d] shadow-lg scale-[1.02]'
                                : 'opacity-85 hover:opacity-100 hover:scale-[1.02]'
                            }`}
                          >
                            <ThumbnailPreviewTile
                              category="featured"
                              item={preset}
                              activeCustomization={customization}
                            />
                          </div>
                          <span
                            className={`text-xs text-center truncate max-w-[64px] sm:max-w-[72px] transition-colors leading-tight ${
                              isSel
                                ? 'text-[#15130f] dark:text-white font-bold'
                                : 'text-[#15130f]/50 dark:text-white/50 group-hover:text-[#15130f]/80 dark:group-hover:text-white/80 font-medium'
                            }`}
                          >
                            {preset.name}
                          </span>
                        </button>
                      );
                    })}

                  {activeCategoryTab === 'styles' &&
                    STYLE_OPTIONS.map((styleOpt) => {
                      const isSel = customization.style === styleOpt.id;
                      return (
                        <button
                          key={styleOpt.id}
                          type="button"
                          onClick={() => {
                            setCustomization((prev) => ({ ...prev, style: styleOpt.id as FlexCardStyle }));
                            setSelectedPresetId('');
                          }}
                          className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group focus:outline-hidden"
                        >
                          <div
                            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-200 ${
                              isSel
                                ? 'ring-2 ring-white ring-offset-2 ring-offset-[#11100d] shadow-lg scale-[1.02]'
                                : 'opacity-85 hover:opacity-100 hover:scale-[1.02]'
                            }`}
                          >
                            <ThumbnailPreviewTile
                              category="styles"
                              item={styleOpt}
                              activeCustomization={customization}
                            />
                          </div>
                          <span
                            className={`text-xs text-center truncate max-w-[64px] sm:max-w-[72px] transition-colors leading-tight ${
                              isSel
                                ? 'text-[#15130f] dark:text-white font-bold'
                                : 'text-[#15130f]/50 dark:text-white/50 group-hover:text-[#15130f]/80 dark:group-hover:text-white/80 font-medium'
                            }`}
                          >
                            {styleOpt.name}
                          </span>
                        </button>
                      );
                    })}

                  {activeCategoryTab === 'moods' &&
                    MOOD_OPTIONS.map((moodOpt) => {
                      const isSel = customization.mood === moodOpt.id;
                      return (
                        <button
                          key={moodOpt.id}
                          type="button"
                          onClick={() => {
                            setCustomization((prev) => ({ ...prev, mood: moodOpt.id as FlexCardMood }));
                            setSelectedPresetId('');
                          }}
                          className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group focus:outline-hidden"
                        >
                          <div
                            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-200 ${
                              isSel
                                ? 'ring-2 ring-white ring-offset-2 ring-offset-[#11100d] shadow-lg scale-[1.02]'
                                : 'opacity-85 hover:opacity-100 hover:scale-[1.02]'
                            }`}
                          >
                            <ThumbnailPreviewTile
                              category="moods"
                              item={moodOpt}
                              activeCustomization={customization}
                            />
                          </div>
                          <span
                            className={`text-xs text-center truncate max-w-[64px] sm:max-w-[72px] transition-colors leading-tight ${
                              isSel
                                ? 'text-[#15130f] dark:text-white font-bold'
                                : 'text-[#15130f]/50 dark:text-white/50 group-hover:text-[#15130f]/80 dark:group-hover:text-white/80 font-medium'
                            }`}
                          >
                            {moodOpt.name}
                          </span>
                        </button>
                      );
                    })}

                  {activeCategoryTab === 'lighting' &&
                    LIGHTING_OPTIONS.map((lightOpt) => {
                      const isSel = customization.lighting === lightOpt.id;
                      return (
                        <button
                          key={lightOpt.id}
                          type="button"
                          onClick={() => {
                            setCustomization((prev) => ({ ...prev, lighting: lightOpt.id as FlexCardLighting }));
                            setSelectedPresetId('');
                          }}
                          className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group focus:outline-hidden"
                        >
                          <div
                            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-200 ${
                              isSel
                                ? 'ring-2 ring-white ring-offset-2 ring-offset-[#11100d] shadow-lg scale-[1.02]'
                                : 'opacity-85 hover:opacity-100 hover:scale-[1.02]'
                            }`}
                          >
                            <ThumbnailPreviewTile
                              category="lighting"
                              item={lightOpt}
                              activeCustomization={customization}
                            />
                          </div>
                          <span
                            className={`text-xs text-center truncate max-w-[64px] sm:max-w-[72px] transition-colors leading-tight ${
                              isSel
                                ? 'text-[#15130f] dark:text-white font-bold'
                                : 'text-[#15130f]/50 dark:text-white/50 group-hover:text-[#15130f]/80 dark:group-hover:text-white/80 font-medium'
                            }`}
                          >
                            {lightOpt.name}
                          </span>
                        </button>
                      );
                    })}

                  {activeCategoryTab === 'colours' &&
                    COLOUR_OPTIONS.map((colOpt) => {
                      const isSel = customization.colour === colOpt.id;
                      return (
                        <button
                          key={colOpt.id}
                          type="button"
                          onClick={() => {
                            setCustomization((prev) => ({ ...prev, colour: colOpt.id as FlexCardColour }));
                            setSelectedPresetId('');
                          }}
                          className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group focus:outline-hidden"
                        >
                          <div
                            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-200 ${
                              isSel
                                ? 'ring-2 ring-white ring-offset-2 ring-offset-[#11100d] shadow-lg scale-[1.02]'
                                : 'opacity-85 hover:opacity-100 hover:scale-[1.02]'
                            }`}
                          >
                            <ThumbnailPreviewTile
                              category="colours"
                              item={colOpt}
                              activeCustomization={customization}
                            />
                          </div>
                          <span
                            className={`text-xs text-center truncate max-w-[64px] sm:max-w-[72px] transition-colors leading-tight ${
                              isSel
                                ? 'text-[#15130f] dark:text-white font-bold'
                                : 'text-[#15130f]/50 dark:text-white/50 group-hover:text-[#15130f]/80 dark:group-hover:text-white/80 font-medium'
                            }`}
                          >
                            {colOpt.name}
                          </span>
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
                    customization={customization}
                    format={format}
                  />
                </div>

                {/* Off-screen canvas used exclusively for real 4K Ultra HD export */}
                <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

                <div className="mt-3 flex items-center gap-2 text-[10.5px] font-semibold text-[#15130f]/60 dark:text-[#fbf8f1]/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>
                    {FORMAT_DIMENSIONS[format].width} × {FORMAT_DIMENSIONS[format].height}px
                  </span>
                  <span>•</span>
                  <span>Real 4K Ultra HD Export</span>
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
                  <span>Real 4K Ultra HD export ready</span>
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
                <span>{isAnonymous ? 'Sign in to Download' : 'Download 4K PNG'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
