/**
 * Canvas Rendering and Social Share Engine for Milestone Flex Cards (Drop 2)
 * High-performance, high-DPI canvas graphics with responsive format-adaptive layouts.
 */

export type FlexCardFormat = 'story' | 'square' | 'landscape';

export interface FlexCardData {
  title: string;
  subtitle: string;
  metricValue: string | number;
  metricUnit?: string;
  metricLabel: string;
  badgeText: string;
  userName?: string | null;
  habitTitle?: string;
  bentoLabel?: string;
  routineTag?: string;
  completionRate?: number;
  adherenceLabel?: string;
  footerLabel?: string;
  metricDetails?: { label: string; value: string; subtext: string }[];
  weeklyDots?: { label: string; completed: boolean; isFuture?: boolean }[];
  quote?: string;
  quoteAuthor?: string;
  dateStr?: string;
  showQuote?: boolean;
  showUser?: boolean;
  showBranding?: boolean;
}

export type FlexCardCategoryTab = 'featured' | 'styles' | 'moods' | 'lighting' | 'colours';

export type FlexCardStyle =
  | '3d'
  | 'collage'
  | 'anime'
  | 'paper'
  | 'illustrated'
  | 'lowpoly'
  | 'cartoon'
  | 'goth'
  | 'artdeco'
  | 'cinema'
  | 'watercolor'
  // Backward compatibility aliases
  | 'sphere'
  | 'pixel'
  | 'nebula'
  | 'aurora'
  | 'cyber'
  | 'topo'
  | 'prism'
  | 'orbit'
  | 'liquid'
  | 'hex'
  | 'minimal';

export type FlexCardMood =
  | 'glowy'
  | 'sweets'
  | 'dreamy'
  // Backward compatibility aliases
  | 'clean'
  | 'grain'
  | 'scanlines'
  | 'mist'
  | 'vignette';

export type FlexCardLighting =
  | 'dark'
  | 'sunset'
  | 'bright'
  | 'ethereal'
  // Backward compatibility aliases
  | 'rim'
  | 'spotlight'
  | 'eclipse'
  | 'sunburst'
  | 'diffuse'
  | 'stealth';

export type FlexCardColour =
  | 'ember'
  | 'cyber'
  | 'ivory'
  | 'violet'
  | 'cobalt'
  | 'gold'
  | 'rose'
  | 'mono';

// Backward compatibility alias
export type FlexCardTheme = FlexCardColour | 'obsidian';

export interface FlexCardCustomization {
  style: FlexCardStyle;
  mood: FlexCardMood;
  lighting: FlexCardLighting;
  colour: FlexCardColour;
}

export const DEFAULT_CUSTOMIZATION: FlexCardCustomization = {
  style: 'paper',
  mood: 'glowy',
  lighting: 'sunset',
  colour: 'ember',
};

export interface CustomizationOptionItem {
  id: string;
  name: string;
  subtitle?: string;
  badge?: string;
}

export interface FeaturedPresetItem extends CustomizationOptionItem {
  id: string;
  name: string;
  customization: FlexCardCustomization;
}

export const CATEGORY_TABS: { id: FlexCardCategoryTab; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'styles', label: 'Styles' },
  { id: 'moods', label: 'Moods' },
  { id: 'lighting', label: 'Lighting' },
  { id: 'colours', label: 'Colours' },
];

export const FEATURED_PRESETS: FeaturedPresetItem[] = [
  {
    id: 'paper',
    name: 'Paper',
    customization: { style: 'paper', mood: 'glowy', lighting: 'sunset', colour: 'ember' },
  },
  {
    id: 'lowpoly',
    name: 'Low-poly',
    customization: { style: 'lowpoly', mood: 'glowy', lighting: 'dark', colour: 'violet' },
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    customization: { style: 'watercolor', mood: 'dreamy', lighting: 'bright', colour: 'cobalt' },
  },
  {
    id: '3d',
    name: '3D',
    customization: { style: '3d', mood: 'dreamy', lighting: 'dark', colour: 'ivory' },
  },
  {
    id: 'illustrated',
    name: 'Illustrated',
    customization: { style: 'illustrated', mood: 'glowy', lighting: 'sunset', colour: 'ember' },
  },
  {
    id: 'anime',
    name: 'Anime',
    customization: { style: 'anime', mood: 'sweets', lighting: 'bright', colour: 'rose' },
  },
];

export const STYLE_OPTIONS: { id: FlexCardStyle; name: string }[] = [
  { id: '3d', name: '3D' },
  { id: 'collage', name: 'Collage' },
  { id: 'anime', name: 'Anime' },
  { id: 'paper', name: 'Paper' },
  { id: 'illustrated', name: 'Illustrated' },
  { id: 'lowpoly', name: 'Low-poly' },
  { id: 'cartoon', name: 'Cartoon' },
  { id: 'goth', name: 'Goth' },
  { id: 'artdeco', name: 'Art deco' },
  { id: 'cinema', name: 'Cinema' },
  { id: 'watercolor', name: 'Watercolor' },
];

export const MOOD_OPTIONS: { id: FlexCardMood; name: string }[] = [
  { id: 'glowy', name: 'Glowy' },
  { id: 'sweets', name: 'Sweets' },
  { id: 'dreamy', name: 'Dreamy' },
];

export const LIGHTING_OPTIONS: { id: FlexCardLighting; name: string }[] = [
  { id: 'dark', name: 'Dark' },
  { id: 'sunset', name: 'Sunset' },
  { id: 'bright', name: 'Bright' },
  { id: 'ethereal', name: 'Ethereal' },
];

export const COLOUR_OPTIONS: { id: FlexCardColour; name: string; hex: string }[] = [
  { id: 'ember', name: 'Obsidian', hex: '#ff5a1f' },
  { id: 'cyber', name: 'Cyber Mint', hex: '#10b981' },
  { id: 'ivory', name: 'Warm Ivory', hex: '#ff5a1f' },
  { id: 'violet', name: 'Astral Violet', hex: '#a855f7' },
  { id: 'cobalt', name: 'Deep Cobalt', hex: '#06b6d4' },
  { id: 'gold', name: 'Royal Gold', hex: '#eab308' },
  { id: 'rose', name: 'Neon Rose', hex: '#f43f5e' },
  { id: 'mono', name: 'Monolith', hex: '#ffffff' },
];

export interface ThemeColors {
  name: string;
  backgroundStart: string;
  backgroundEnd: string;
  accent: string;
  accentGlow: string;
  primaryText: string;
  secondaryText: string;
  cardBg: string;
  cardBorder: string;
  pillBg: string;
  pillText: string;
  progressTrack: string;
  quoteBoxBg: string;
  quoteBoxBorder: string;
  colour?: FlexCardColour;
}

export const COLOUR_PALETTES: Record<FlexCardColour, ThemeColors> = {
  ember: {
    name: 'Obsidian Ember',
    backgroundStart: '#11100d',
    backgroundEnd: '#1a1814',
    accent: '#ff5a1f',
    accentGlow: 'rgba(255, 90, 31, 0.35)',
    primaryText: '#fbf8f1',
    secondaryText: 'rgba(251, 248, 241, 0.65)',
    cardBg: 'rgba(28, 26, 22, 0.88)',
    cardBorder: 'rgba(255, 90, 31, 0.3)',
    pillBg: 'rgba(255, 90, 31, 0.16)',
    pillText: '#ff5a1f',
    progressTrack: 'rgba(251, 248, 241, 0.1)',
    quoteBoxBg: 'rgba(21, 19, 15, 0.75)',
    quoteBoxBorder: 'rgba(251, 248, 241, 0.12)',
    colour: 'ember',
  },
  cyber: {
    name: 'Cyber Mint',
    backgroundStart: '#041510',
    backgroundEnd: '#09251d',
    accent: '#10b981',
    accentGlow: 'rgba(16, 185, 129, 0.38)',
    primaryText: '#f0fdf4',
    secondaryText: 'rgba(240, 253, 244, 0.65)',
    cardBg: 'rgba(10, 38, 30, 0.88)',
    cardBorder: 'rgba(16, 185, 129, 0.32)',
    pillBg: 'rgba(16, 185, 129, 0.18)',
    pillText: '#34d399',
    progressTrack: 'rgba(240, 253, 244, 0.1)',
    quoteBoxBg: 'rgba(6, 26, 21, 0.75)',
    quoteBoxBorder: 'rgba(16, 185, 129, 0.2)',
    colour: 'cyber',
  },
  ivory: {
    name: 'Warm Ivory',
    backgroundStart: '#eee8da',
    backgroundEnd: '#fbf8f1',
    accent: '#ff5a1f',
    accentGlow: 'rgba(255, 90, 31, 0.2)',
    primaryText: '#15130f',
    secondaryText: 'rgba(21, 19, 15, 0.65)',
    cardBg: 'rgba(255, 255, 255, 0.92)',
    cardBorder: 'rgba(21, 19, 15, 0.14)',
    pillBg: 'rgba(255, 90, 31, 0.12)',
    pillText: '#ff5a1f',
    progressTrack: 'rgba(21, 19, 15, 0.08)',
    quoteBoxBg: 'rgba(255, 255, 255, 0.8)',
    quoteBoxBorder: 'rgba(21, 19, 15, 0.1)',
    colour: 'ivory',
  },
  violet: {
    name: 'Astral Violet',
    backgroundStart: '#0e091b',
    backgroundEnd: '#1a1033',
    accent: '#a855f7',
    accentGlow: 'rgba(168, 85, 247, 0.4)',
    primaryText: '#faf5ff',
    secondaryText: 'rgba(250, 245, 255, 0.68)',
    cardBg: 'rgba(29, 19, 56, 0.88)',
    cardBorder: 'rgba(168, 85, 247, 0.32)',
    pillBg: 'rgba(168, 85, 247, 0.18)',
    pillText: '#c084fc',
    progressTrack: 'rgba(250, 245, 255, 0.1)',
    quoteBoxBg: 'rgba(20, 13, 40, 0.75)',
    quoteBoxBorder: 'rgba(168, 85, 247, 0.22)',
    colour: 'violet',
  },
  cobalt: {
    name: 'Deep Cobalt',
    backgroundStart: '#061325',
    backgroundEnd: '#0a213e',
    accent: '#06b6d4',
    accentGlow: 'rgba(6, 182, 212, 0.38)',
    primaryText: '#f0fdfa',
    secondaryText: 'rgba(240, 253, 250, 0.65)',
    cardBg: 'rgba(12, 37, 68, 0.88)',
    cardBorder: 'rgba(6, 182, 212, 0.3)',
    pillBg: 'rgba(6, 182, 212, 0.18)',
    pillText: '#22d3ee',
    progressTrack: 'rgba(240, 253, 250, 0.1)',
    quoteBoxBg: 'rgba(8, 25, 48, 0.75)',
    quoteBoxBorder: 'rgba(6, 182, 212, 0.2)',
    colour: 'cobalt',
  },
  gold: {
    name: 'Royal Gold',
    backgroundStart: '#14120a',
    backgroundEnd: '#231e0f',
    accent: '#eab308',
    accentGlow: 'rgba(234, 179, 8, 0.38)',
    primaryText: '#fefce8',
    secondaryText: 'rgba(254, 252, 232, 0.68)',
    cardBg: 'rgba(38, 33, 17, 0.88)',
    cardBorder: 'rgba(234, 179, 8, 0.3)',
    pillBg: 'rgba(234, 179, 8, 0.18)',
    pillText: '#facc15',
    progressTrack: 'rgba(254, 252, 232, 0.1)',
    quoteBoxBg: 'rgba(28, 24, 12, 0.75)',
    quoteBoxBorder: 'rgba(234, 179, 8, 0.22)',
    colour: 'gold',
  },
  rose: {
    name: 'Neon Rose',
    backgroundStart: '#18070d',
    backgroundEnd: '#2d0f1b',
    accent: '#f43f5e',
    accentGlow: 'rgba(244, 63, 94, 0.38)',
    primaryText: '#fff1f2',
    secondaryText: 'rgba(255, 241, 242, 0.68)',
    cardBg: 'rgba(49, 16, 29, 0.88)',
    cardBorder: 'rgba(244, 63, 94, 0.32)',
    pillBg: 'rgba(244, 63, 94, 0.18)',
    pillText: '#fb7185',
    progressTrack: 'rgba(255, 241, 242, 0.1)',
    quoteBoxBg: 'rgba(36, 12, 21, 0.75)',
    quoteBoxBorder: 'rgba(244, 63, 94, 0.22)',
    colour: 'rose',
  },
  mono: {
    name: 'Monolith B&W',
    backgroundStart: '#09090b',
    backgroundEnd: '#18181b',
    accent: '#ffffff',
    accentGlow: 'rgba(255, 255, 255, 0.22)',
    primaryText: '#fafafa',
    secondaryText: 'rgba(250, 250, 250, 0.6)',
    cardBg: 'rgba(24, 24, 27, 0.88)',
    cardBorder: 'rgba(255, 255, 255, 0.2)',
    pillBg: 'rgba(255, 255, 255, 0.12)',
    pillText: '#ffffff',
    progressTrack: 'rgba(255, 255, 255, 0.1)',
    quoteBoxBg: 'rgba(18, 18, 20, 0.75)',
    quoteBoxBorder: 'rgba(255, 255, 255, 0.14)',
    colour: 'mono',
  },
};

// Backward-compatibility record: supports old theme keys and all new colors
export const FLEX_CARD_THEMES: Record<string, ThemeColors> = {
  ...COLOUR_PALETTES,
  obsidian: COLOUR_PALETTES.ember,
};

export const BASE_DIMENSIONS: Record<
  FlexCardFormat,
  { width: number; height: number }
> = {
  story: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
  landscape: { width: 1200, height: 675 },
};

export const FORMAT_DIMENSIONS: Record<
  FlexCardFormat,
  { width: number; height: number; aspectRatioLabel: string; name: string }
> = {
  story: { width: 2160, height: 3840, aspectRatioLabel: '9:16', name: 'Story 4K (IG / WhatsApp)' },
  square: { width: 2160, height: 2160, aspectRatioLabel: '1:1', name: 'Square 4K (Feed / Threads)' },
  landscape: { width: 3840, height: 2160, aspectRatioLabel: '16:9', name: 'Post 4K (X / Twitter)' },
};

export interface CardStyleTheme {
  id: FlexCardStyle;
  // Card Container Styles
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  cardRadius: string;
  isPaperStyle?: boolean;
  isCartoonStyle?: boolean;
  isArtDecoStyle?: boolean;
  isAnimeStyle?: boolean;
  isLowpolyStyle?: boolean;
  is3dStyle?: boolean;
  isWatercolorStyle?: boolean;
  isCollageStyle?: boolean;
  isGothStyle?: boolean;
  isCinemaStyle?: boolean;

  // Typography
  primaryText: string;
  secondaryText: string;
  accent: string;
  metricColor: string;
  metricShadow?: string;

  // Header & Divider
  headerDivider: string;
  headerBrandColor: string;
  dateColor: string;

  // Milestone Pill Badge
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  badgeShadow?: string;

  // Bento Boxes
  bentoBg: string;
  bentoBorder: string;
  bentoShadow: string;
  bentoRadius: string;
  bentoTitleColor: string;
  bentoSubColor: string;
  bentoAccentColor: string;
  progressTrack: string;
  progressFill: string;

  // Quote Box
  quoteBg: string;
  quoteBorder: string;
  quoteShadow: string;
  quoteRadius: string;
  quoteTextColor: string;
  quoteAuthorColor: string;
  quoteMarkColor: string;

  // 7-day Cadence Dots
  dotActiveBg: string;
  dotInactiveBorder: string;
  dotTextColor: string;

  // Footer
  footerColor: string;
  footerDivider: string;
}

/**
 * Returns complete holistic card styling tokens based on the chosen artistic style
 * so that selecting a style transforms the ENTIRE flex card (background, containers,
 * typography, shadows, bento boxes, badges, and quote box) rather than just an isolated circle.
 */
export function getEffectiveCardStyling(
  customization: FlexCardCustomization,
  theme: ThemeColors
): CardStyleTheme {
  const isLightPalette = theme.colour === 'ivory';
  const accent = theme.accent;

  // Determine contrast text color against accent background
  const getAccentText = (hex: string) => {
    const clean = hex.replace('#', '');
    if (clean.length === 6) {
      const r = parseInt(clean.substring(0, 2), 16);
      const g = parseInt(clean.substring(2, 4), 16);
      const b = parseInt(clean.substring(4, 6), 16);
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      return yiq >= 160 ? '#09090b' : '#ffffff';
    }
    return '#ffffff';
  };

  const badgeTextColor = getAccentText(accent);

  switch (customization.style) {
    case 'paper': {
      // Authentic torn craft paper collage aesthetic (matching reference design)
      // Light background: strictly dark charcoal text for 100% legibility
      return {
        id: 'paper',
        cardBg: '#f4ece1',
        cardBorder: '1.5px solid #d8cbba',
        cardShadow: '0 12px 36px rgba(44, 38, 30, 0.22)',
        cardRadius: '18px',
        isPaperStyle: true,
        primaryText: '#18181b',
        secondaryText: '#57534e',
        accent: accent,
        metricColor: accent === '#ffffff' ? '#18181b' : accent,
        metricShadow: '0 4px 12px rgba(44, 38, 30, 0.35)',
        headerDivider: 'rgba(43, 37, 32, 0.16)',
        headerBrandColor: '#18181b',
        dateColor: '#57534e',
        badgeBg: accent,
        badgeBorder: 'none',
        badgeText: badgeTextColor,
        badgeShadow: '0 2px 6px rgba(44, 38, 30, 0.25)',
        bentoBg: 'rgba(50, 48, 44, 0.92)',
        bentoBorder: '1px solid rgba(255, 255, 255, 0.14)',
        bentoShadow: '0 6px 14px rgba(44, 38, 30, 0.25)',
        bentoRadius: '14px',
        bentoTitleColor: '#ffffff',
        bentoSubColor: '#e4e4e7',
        bentoAccentColor: accent,
        progressTrack: 'rgba(255, 255, 255, 0.22)',
        progressFill: accent,
        quoteBg: '#ede4d4',
        quoteBorder: '1px solid #d4c5af',
        quoteShadow: '0 6px 16px rgba(44, 38, 30, 0.18)',
        quoteRadius: '12px',
        quoteTextColor: '#18181b',
        quoteAuthorColor: accent,
        quoteMarkColor: accent,
        dotActiveBg: accent,
        dotInactiveBorder: '#b8aba0',
        dotTextColor: '#57534e',
        footerColor: '#57534e',
        footerDivider: 'rgba(43, 37, 32, 0.16)',
      };
    }

    case 'cartoon': {
      // Pop-art comic book aesthetic: bold ink lines, hard offset shadows
      // All text is crisp solid black or black-outlined so it is NEVER washed out
      return {
        id: 'cartoon',
        cardBg: '#fffbeb',
        cardBorder: '3px solid #000000',
        cardShadow: '6px 6px 0px #000000',
        cardRadius: '16px',
        isCartoonStyle: true,
        primaryText: '#000000',
        secondaryText: '#3f3f46',
        accent: accent,
        metricColor: accent === '#ffffff' ? '#000000' : accent,
        metricShadow: '2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000',
        headerDivider: '2px solid #000000',
        headerBrandColor: '#000000',
        dateColor: '#000000',
        badgeBg: accent,
        badgeBorder: '2px solid #000000',
        badgeText: badgeTextColor,
        badgeShadow: '3px 3px 0px #000000',
        bentoBg: '#ffffff',
        bentoBorder: '2.5px solid #000000',
        bentoShadow: '4px 4px 0px #000000',
        bentoRadius: '12px',
        bentoTitleColor: '#000000',
        bentoSubColor: '#52525b',
        bentoAccentColor: accent,
        progressTrack: '#e4e4e7',
        progressFill: accent,
        quoteBg: '#ffffff',
        quoteBorder: '2.5px solid #000000',
        quoteShadow: '4px 4px 0px #000000',
        quoteRadius: '12px',
        quoteTextColor: '#000000',
        quoteAuthorColor: accent,
        quoteMarkColor: accent,
        dotActiveBg: accent,
        dotInactiveBorder: '#000000',
        dotTextColor: '#000000',
        footerColor: '#000000',
        footerDivider: '2px solid #000000',
      };
    }

    case 'illustrated': {
      // 70s psychedelic retro topographical wavy contour aesthetic
      // Solid dark glass bento/quote boxes guarantee text is NEVER obscured by waves
      return {
        id: 'illustrated',
        cardBg: '#1a1528',
        cardBorder: `1.5px solid ${accent}`,
        cardShadow: '0 12px 36px rgba(0, 0, 0, 0.65)',
        cardRadius: '20px',
        primaryText: '#ffffff',
        secondaryText: 'rgba(255, 255, 255, 0.75)',
        accent: accent,
        metricColor: '#ffffff',
        metricShadow: `0 4px 16px rgba(0, 0, 0, 0.9), 0 0 12px ${theme.accentGlow}`,
        headerDivider: 'rgba(255, 255, 255, 0.2)',
        headerBrandColor: '#ffffff',
        dateColor: 'rgba(255, 255, 255, 0.75)',
        badgeBg: accent,
        badgeBorder: 'none',
        badgeText: badgeTextColor,
        badgeShadow: `0 2px 8px ${theme.accentGlow}`,
        bentoBg: 'rgba(18, 14, 32, 0.94)',
        bentoBorder: '1.5px solid rgba(255, 255, 255, 0.18)',
        bentoShadow: '0 6px 18px rgba(0, 0, 0, 0.55)',
        bentoRadius: '16px',
        bentoTitleColor: '#ffffff',
        bentoSubColor: 'rgba(255, 255, 255, 0.75)',
        bentoAccentColor: accent,
        progressTrack: 'rgba(255, 255, 255, 0.15)',
        progressFill: accent,
        quoteBg: 'rgba(18, 14, 32, 0.94)',
        quoteBorder: '1.5px solid rgba(255, 255, 255, 0.18)',
        quoteShadow: '0 6px 18px rgba(0, 0, 0, 0.55)',
        quoteRadius: '16px',
        quoteTextColor: '#ffffff',
        quoteAuthorColor: accent,
        quoteMarkColor: accent,
        dotActiveBg: accent,
        dotInactiveBorder: 'rgba(255, 255, 255, 0.35)',
        dotTextColor: 'rgba(255, 255, 255, 0.75)',
        footerColor: 'rgba(255, 255, 255, 0.75)',
        footerDivider: 'rgba(255, 255, 255, 0.2)',
      };
    }

    case 'lowpoly': {
      // 3D faceted crystalline geometric polygon mesh aesthetic
      return {
        id: 'lowpoly',
        cardBg: '#130822',
        cardBorder: `1.5px solid ${accent}`,
        cardShadow: `0 12px 36px ${theme.accentGlow}`,
        cardRadius: '14px',
        isLowpolyStyle: true,
        primaryText: '#ffffff',
        secondaryText: 'rgba(255, 255, 255, 0.75)',
        accent: accent,
        metricColor: '#ffffff',
        metricShadow: `0 0 18px ${accent}`,
        headerDivider: 'rgba(255, 255, 255, 0.18)',
        headerBrandColor: '#ffffff',
        dateColor: 'rgba(255, 255, 255, 0.75)',
        badgeBg: accent,
        badgeBorder: 'none',
        badgeText: badgeTextColor,
        badgeShadow: `0 0 10px ${theme.accentGlow}`,
        bentoBg: 'rgba(24, 12, 44, 0.92)',
        bentoBorder: `1.5px solid ${accent}`,
        bentoShadow: '0 6px 18px rgba(0, 0, 0, 0.5)',
        bentoRadius: '12px',
        bentoTitleColor: '#ffffff',
        bentoSubColor: 'rgba(255, 255, 255, 0.75)',
        bentoAccentColor: accent,
        progressTrack: 'rgba(255, 255, 255, 0.15)',
        progressFill: accent,
        quoteBg: 'rgba(24, 12, 44, 0.92)',
        quoteBorder: '1.5px solid rgba(255, 255, 255, 0.18)',
        quoteShadow: '0 6px 18px rgba(0, 0, 0, 0.5)',
        quoteRadius: '12px',
        quoteTextColor: '#ffffff',
        quoteAuthorColor: accent,
        quoteMarkColor: accent,
        dotActiveBg: accent,
        dotInactiveBorder: 'rgba(255, 255, 255, 0.3)',
        dotTextColor: 'rgba(255, 255, 255, 0.75)',
        footerColor: 'rgba(255, 255, 255, 0.75)',
        footerDivider: 'rgba(255, 255, 255, 0.18)',
      };
    }

    case 'anime': {
      // Dreamy pastel sky aesthetic with fluffy clouds (zero sparkles)
      // Light pastel backdrop: strictly deep navy text for 100% legibility
      return {
        id: 'anime',
        cardBg: '#fdf2f8',
        cardBorder: `1.5px solid ${accent}`,
        cardShadow: '0 12px 32px rgba(244, 114, 182, 0.25)',
        cardRadius: '24px',
        isAnimeStyle: true,
        primaryText: '#0f172a',
        secondaryText: '#475569',
        accent: accent,
        metricColor: accent === '#ffffff' ? '#0f172a' : accent,
        metricShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        headerDivider: 'rgba(15, 23, 42, 0.12)',
        headerBrandColor: '#0f172a',
        dateColor: '#475569',
        badgeBg: accent === '#ffffff' ? '#0f172a' : accent,
        badgeBorder: 'none',
        badgeText: accent === '#ffffff' ? '#ffffff' : badgeTextColor,
        badgeShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        bentoBg: 'rgba(255, 255, 255, 0.94)',
        bentoBorder: '1.5px solid rgba(15, 23, 42, 0.08)',
        bentoShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
        bentoRadius: '20px',
        bentoTitleColor: '#0f172a',
        bentoSubColor: '#475569',
        bentoAccentColor: accent === '#ffffff' ? '#0f172a' : accent,
        progressTrack: 'rgba(15, 23, 42, 0.08)',
        progressFill: accent === '#ffffff' ? '#0f172a' : accent,
        quoteBg: 'rgba(255, 255, 255, 0.94)',
        quoteBorder: '1.5px solid rgba(15, 23, 42, 0.08)',
        quoteShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
        quoteRadius: '20px',
        quoteTextColor: '#0f172a',
        quoteAuthorColor: accent === '#ffffff' ? '#0f172a' : accent,
        quoteMarkColor: accent === '#ffffff' ? '#0f172a' : accent,
        dotActiveBg: accent === '#ffffff' ? '#0f172a' : accent,
        dotInactiveBorder: 'rgba(15, 23, 42, 0.25)',
        dotTextColor: '#475569',
        footerColor: '#475569',
        footerDivider: 'rgba(15, 23, 42, 0.12)',
      };
    }

    case 'artdeco': {
      // 1920s Gatsby opulent black lacquer and polished gold filigree aesthetic
      return {
        id: 'artdeco',
        cardBg: '#09090b',
        cardBorder: `2px solid ${accent}`,
        cardShadow: `0 12px 36px ${theme.accentGlow}`,
        cardRadius: '12px',
        isArtDecoStyle: true,
        primaryText: '#ffffff',
        secondaryText: 'rgba(255, 255, 255, 0.75)',
        accent: accent,
        metricColor: accent,
        metricShadow: `0 0 16px ${theme.accentGlow}`,
        headerDivider: 'rgba(255, 255, 255, 0.2)',
        headerBrandColor: '#ffffff',
        dateColor: 'rgba(255, 255, 255, 0.75)',
        badgeBg: accent,
        badgeBorder: 'none',
        badgeText: badgeTextColor,
        badgeShadow: `0 0 10px ${theme.accentGlow}`,
        bentoBg: 'rgba(18, 18, 22, 0.94)',
        bentoBorder: `1.5px solid ${accent}`,
        bentoShadow: '0 0 15px rgba(0, 0, 0, 0.6)',
        bentoRadius: '10px',
        bentoTitleColor: '#ffffff',
        bentoSubColor: 'rgba(255, 255, 255, 0.75)',
        bentoAccentColor: accent,
        progressTrack: 'rgba(255, 255, 255, 0.15)',
        progressFill: accent,
        quoteBg: 'rgba(18, 18, 22, 0.94)',
        quoteBorder: `1.5px solid ${accent}`,
        quoteShadow: '0 0 15px rgba(0, 0, 0, 0.6)',
        quoteRadius: '10px',
        quoteTextColor: '#ffffff',
        quoteAuthorColor: accent,
        quoteMarkColor: accent,
        dotActiveBg: accent,
        dotInactiveBorder: 'rgba(255, 255, 255, 0.3)',
        dotTextColor: 'rgba(255, 255, 255, 0.75)',
        footerColor: 'rgba(255, 255, 255, 0.75)',
        footerDivider: 'rgba(255, 255, 255, 0.2)',
      };
    }

    case '3d':
    case 'sphere': {
      // Tactical spatial claymorphism with deep directional shadows
      return {
        id: '3d',
        cardBg: theme.backgroundStart,
        cardBorder: `1.5px solid ${theme.cardBorder}`,
        cardShadow: '12px 16px 40px rgba(0, 0, 0, 0.55), inset 1px 1px 2px rgba(255, 255, 255, 0.15)',
        cardRadius: '22px',
        is3dStyle: true,
        primaryText: theme.primaryText,
        secondaryText: theme.secondaryText,
        accent: accent,
        metricColor: isLightPalette ? theme.primaryText : '#ffffff',
        metricShadow: '0 6px 16px rgba(0, 0, 0, 0.4)',
        headerDivider: isLightPalette ? 'rgba(21, 19, 15, 0.12)' : 'rgba(255, 255, 255, 0.14)',
        headerBrandColor: theme.primaryText,
        dateColor: theme.secondaryText,
        badgeBg: accent,
        badgeBorder: 'none',
        badgeText: badgeTextColor,
        badgeShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
        bentoBg: isLightPalette ? 'rgba(255, 255, 255, 0.92)' : 'rgba(26, 26, 32, 0.92)',
        bentoBorder: `1.5px solid ${theme.cardBorder}`,
        bentoShadow: '6px 8px 20px rgba(0, 0, 0, 0.35)',
        bentoRadius: '18px',
        bentoTitleColor: theme.primaryText,
        bentoSubColor: theme.secondaryText,
        bentoAccentColor: accent,
        progressTrack: theme.progressTrack,
        progressFill: accent,
        quoteBg: isLightPalette ? 'rgba(255, 255, 255, 0.92)' : 'rgba(26, 26, 32, 0.92)',
        quoteBorder: `1.5px solid ${theme.cardBorder}`,
        quoteShadow: '6px 8px 20px rgba(0, 0, 0, 0.35)',
        quoteRadius: '18px',
        quoteTextColor: theme.primaryText,
        quoteAuthorColor: accent,
        quoteMarkColor: accent,
        dotActiveBg: accent,
        dotInactiveBorder: isLightPalette ? 'rgba(21, 19, 15, 0.25)' : 'rgba(255, 255, 255, 0.3)',
        dotTextColor: theme.secondaryText,
        footerColor: theme.secondaryText,
        footerDivider: isLightPalette ? 'rgba(21, 19, 15, 0.12)' : 'rgba(255, 255, 255, 0.14)',
      };
    }

    case 'watercolor': {
      // Fluid wet-on-wet cold-press paper aesthetic
      // Light cold-press backdrop: strictly deep navy/slate text
      return {
        id: 'watercolor',
        cardBg: '#f8fafc',
        cardBorder: `1.5px solid ${accent}`,
        cardShadow: '0 12px 32px rgba(147, 197, 253, 0.3)',
        cardRadius: '18px',
        isWatercolorStyle: true,
        primaryText: '#0f172a',
        secondaryText: '#475569',
        accent: accent,
        metricColor: accent === '#ffffff' ? '#0f172a' : accent,
        metricShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
        headerDivider: 'rgba(15, 23, 42, 0.12)',
        headerBrandColor: '#0f172a',
        dateColor: '#475569',
        badgeBg: accent === '#ffffff' ? '#0f172a' : accent,
        badgeBorder: 'none',
        badgeText: accent === '#ffffff' ? '#ffffff' : badgeTextColor,
        badgeShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        bentoBg: 'rgba(255, 255, 255, 0.94)',
        bentoBorder: '1.5px solid rgba(15, 23, 42, 0.08)',
        bentoShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
        bentoRadius: '16px',
        bentoTitleColor: '#0f172a',
        bentoSubColor: '#475569',
        bentoAccentColor: accent === '#ffffff' ? '#0f172a' : accent,
        progressTrack: 'rgba(15, 23, 42, 0.08)',
        progressFill: accent === '#ffffff' ? '#0f172a' : accent,
        quoteBg: 'rgba(255, 255, 255, 0.94)',
        quoteBorder: '1.5px solid rgba(15, 23, 42, 0.08)',
        quoteShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
        quoteRadius: '16px',
        quoteTextColor: '#0f172a',
        quoteAuthorColor: accent === '#ffffff' ? '#0f172a' : accent,
        quoteMarkColor: accent === '#ffffff' ? '#0f172a' : accent,
        dotActiveBg: accent === '#ffffff' ? '#0f172a' : accent,
        dotInactiveBorder: 'rgba(15, 23, 42, 0.25)',
        dotTextColor: '#475569',
        footerColor: '#475569',
        footerDivider: 'rgba(15, 23, 42, 0.12)',
      };
    }

    case 'collage': {
      // Mixed media zine scrapbook aesthetic
      return {
        id: 'collage',
        cardBg: '#f5efe6',
        cardBorder: '1.5px solid #a8a29e',
        cardShadow: '0 12px 32px rgba(44, 38, 30, 0.25)',
        cardRadius: '14px',
        isCollageStyle: true,
        primaryText: '#18181b',
        secondaryText: '#52525b',
        accent: accent,
        metricColor: '#18181b',
        metricShadow: '0 2px 6px rgba(0, 0, 0, 0.18)',
        headerDivider: 'rgba(120, 113, 108, 0.25)',
        headerBrandColor: '#18181b',
        dateColor: '#52525b',
        badgeBg: accent,
        badgeBorder: 'none',
        badgeText: badgeTextColor,
        badgeShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
        bentoBg: '#ffffff',
        bentoBorder: '1.5px solid #a8a29e',
        bentoShadow: '0 4px 12px rgba(44, 38, 30, 0.18)',
        bentoRadius: '10px',
        bentoTitleColor: '#18181b',
        bentoSubColor: '#52525b',
        bentoAccentColor: accent,
        progressTrack: '#e7e5e4',
        progressFill: accent,
        quoteBg: '#ffffff',
        quoteBorder: '1.5px solid #a8a29e',
        quoteShadow: '0 4px 12px rgba(44, 38, 30, 0.18)',
        quoteRadius: '10px',
        quoteTextColor: '#18181b',
        quoteAuthorColor: accent,
        quoteMarkColor: accent,
        dotActiveBg: accent,
        dotInactiveBorder: '#a8a29e',
        dotTextColor: '#52525b',
        footerColor: '#52525b',
        footerDivider: 'rgba(120, 113, 108, 0.25)',
      };
    }

    case 'goth': {
      // Dark academia manga noir cross-hatched aesthetic
      return {
        id: 'goth',
        cardBg: '#09090b',
        cardBorder: `1.5px solid ${accent}`,
        cardShadow: '0 12px 36px rgba(0, 0, 0, 0.75)',
        cardRadius: '12px',
        isGothStyle: true,
        primaryText: '#fafafa',
        secondaryText: '#a1a1aa',
        accent: accent,
        metricColor: '#ffffff',
        metricShadow: `0 0 16px ${accent}`,
        headerDivider: 'rgba(255, 255, 255, 0.15)',
        headerBrandColor: '#fafafa',
        dateColor: '#a1a1aa',
        badgeBg: accent,
        badgeBorder: 'none',
        badgeText: badgeTextColor,
        badgeShadow: `0 0 10px ${theme.accentGlow}`,
        bentoBg: 'rgba(18, 18, 22, 0.94)',
        bentoBorder: '1px solid rgba(255, 255, 255, 0.15)',
        bentoShadow: '0 6px 18px rgba(0, 0, 0, 0.65)',
        bentoRadius: '10px',
        bentoTitleColor: '#fafafa',
        bentoSubColor: '#a1a1aa',
        bentoAccentColor: accent,
        progressTrack: 'rgba(255, 255, 255, 0.1)',
        progressFill: accent,
        quoteBg: 'rgba(18, 18, 22, 0.94)',
        quoteBorder: '1px solid rgba(255, 255, 255, 0.15)',
        quoteShadow: '0 6px 18px rgba(0, 0, 0, 0.65)',
        quoteRadius: '10px',
        quoteTextColor: '#fafafa',
        quoteAuthorColor: accent,
        quoteMarkColor: accent,
        dotActiveBg: accent,
        dotInactiveBorder: 'rgba(255, 255, 255, 0.25)',
        dotTextColor: '#a1a1aa',
        footerColor: '#a1a1aa',
        footerDivider: 'rgba(255, 255, 255, 0.15)',
      };
    }

    case 'cinema': {
      // 35mm widescreen cinematic letterbox and anamorphic flare aesthetic
      return {
        id: 'cinema',
        cardBg: '#080a0f',
        cardBorder: `1.5px solid ${accent}`,
        cardShadow: '0 12px 36px rgba(0, 0, 0, 0.7)',
        cardRadius: '14px',
        isCinemaStyle: true,
        primaryText: '#f8fafc',
        secondaryText: '#94a3b8',
        accent: accent,
        metricColor: '#f8fafc',
        metricShadow: `0 4px 14px ${theme.accentGlow}`,
        headerDivider: 'rgba(255, 255, 255, 0.15)',
        headerBrandColor: '#f8fafc',
        dateColor: '#94a3b8',
        badgeBg: accent,
        badgeBorder: 'none',
        badgeText: badgeTextColor,
        badgeShadow: `0 0 10px ${theme.accentGlow}`,
        bentoBg: 'rgba(15, 23, 42, 0.92)',
        bentoBorder: '1.5px solid rgba(255, 255, 255, 0.15)',
        bentoShadow: '0 6px 18px rgba(0, 0, 0, 0.6)',
        bentoRadius: '12px',
        bentoTitleColor: '#f8fafc',
        bentoSubColor: '#94a3b8',
        bentoAccentColor: accent,
        progressTrack: 'rgba(255, 255, 255, 0.1)',
        progressFill: accent,
        quoteBg: 'rgba(15, 23, 42, 0.92)',
        quoteBorder: '1.5px solid rgba(255, 255, 255, 0.15)',
        quoteShadow: '0 6px 18px rgba(0, 0, 0, 0.6)',
        quoteRadius: '12px',
        quoteTextColor: '#f8fafc',
        quoteAuthorColor: accent,
        quoteMarkColor: accent,
        dotActiveBg: accent,
        dotInactiveBorder: 'rgba(255, 255, 255, 0.25)',
        dotTextColor: '#94a3b8',
        footerColor: '#94a3b8',
        footerDivider: 'rgba(255, 255, 255, 0.15)',
      };
    }

    default: {
      // Clean luxury fallback matching current palette tokens
      const isIvory = theme.colour === 'ivory';
      return {
        id: customization.style,
        cardBg: `linear-gradient(145deg, ${theme.backgroundStart}, ${theme.backgroundEnd})`,
        cardBorder: `1.5px solid ${theme.cardBorder}`,
        cardShadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
        cardRadius: '18px',
        primaryText: theme.primaryText,
        secondaryText: theme.secondaryText,
        accent: accent,
        metricColor: isIvory ? theme.primaryText : '#ffffff',
        metricShadow: undefined,
        headerDivider: isIvory ? 'rgba(21, 19, 15, 0.12)' : 'rgba(255, 255, 255, 0.12)',
        headerBrandColor: theme.primaryText,
        dateColor: theme.secondaryText,
        badgeBg: accent,
        badgeBorder: `1px solid ${accent}`,
        badgeText: badgeTextColor,
        badgeShadow: undefined,
        bentoBg: theme.cardBg,
        bentoBorder: `1.5px solid ${theme.cardBorder}`,
        bentoShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
        bentoRadius: '14px',
        bentoTitleColor: theme.primaryText,
        bentoSubColor: theme.secondaryText,
        bentoAccentColor: accent,
        progressTrack: theme.progressTrack,
        progressFill: accent,
        quoteBg: theme.quoteBoxBg,
        quoteBorder: `1.5px solid ${theme.quoteBoxBorder}`,
        quoteShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
        quoteRadius: '14px',
        quoteTextColor: theme.primaryText,
        quoteAuthorColor: accent,
        quoteMarkColor: accent,
        dotActiveBg: accent,
        dotInactiveBorder: isIvory ? 'rgba(21, 19, 15, 0.2)' : 'rgba(255, 255, 255, 0.2)',
        dotTextColor: theme.secondaryText,
        footerColor: theme.secondaryText,
        footerDivider: isIvory ? 'rgba(21, 19, 15, 0.12)' : 'rgba(255, 255, 255, 0.12)',
      };
    }
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

/**
 * Wraps text into multiple lines, respecting maxWidth
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  if (!text) return [];
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const testLine = `${currentLine} ${word}`;
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Truncates text with ellipsis if exceeding maxWidth
 */
function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(`${truncated}…`).width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}…`;
}

const FONT_HEAD = "'Clash Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const FONT_BODY = "'Archivo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const FONT_SERIF = "Georgia, Cambria, 'Times New Roman', serif";

/**
 * Renders the full procedural custom background onto the 4K canvas:
 * 1. Base gradient
 * 2. Dynamic Lighting profile (rim, spotlight, eclipse, sunburst, diffuse, stealth)
 * 3. Procedural Style artwork (11 unique styles: sphere, pixel, nebula, aurora, cyber, topo, prism, orbit, liquid, hex, minimal)
 * 4. Atmospheric Mood overlay (clean, grain, scanlines, starlight, mist, vignette)
 * 5. High-precision outer border
 */
export function renderCustomizationBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  customization: FlexCardCustomization,
  theme: ThemeColors,
  scale: number,
  format: FlexCardFormat
) {
  const s = (n: number) => Math.round(n * scale);
  const styleTheme = getEffectiveCardStyling(customization, theme);

  // 1. Base Canvas Background Fill
  if (styleTheme.cardBg.startsWith('#') || styleTheme.cardBg.startsWith('rgb')) {
    ctx.fillStyle = styleTheme.cardBg;
    ctx.fillRect(0, 0, width, height);
  } else {
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, theme.backgroundStart);
    bgGradient.addColorStop(1, theme.backgroundEnd);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.save();

  // 2. Procedural Style Vector Graphics Artwork (Full Canvas Bleed)
  switch (customization.style) {
    case 'paper': {
      // Base craft paper cream
      ctx.fillStyle = '#f4ece1';
      ctx.fillRect(0, 0, width, height);

      // Layer 1: Dynamic Accent Undulating Paper Wave across top and right
      ctx.save();
      ctx.shadowColor = 'rgba(44, 38, 30, 0.28)';
      ctx.shadowBlur = s(24);
      ctx.shadowOffsetY = s(12);
      ctx.fillStyle = theme.accent;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width, height * 0.52);
      ctx.bezierCurveTo(width * 0.85, height * 0.58, width * 0.65, height * 0.44, width * 0.45, height * 0.5);
      ctx.bezierCurveTo(width * 0.25, height * 0.56, width * 0.1, height * 0.42, 0, height * 0.48);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Layer 2: Warm Mustard Ochre Torn Paper Wave across right & middle
      ctx.save();
      ctx.shadowColor = 'rgba(44, 38, 30, 0.22)';
      ctx.shadowBlur = s(20);
      ctx.shadowOffsetY = s(10);
      ctx.fillStyle = '#e9c46a';
      ctx.beginPath();
      ctx.moveTo(width, height * 0.25);
      ctx.lineTo(width, height * 0.7);
      ctx.bezierCurveTo(width * 0.8, height * 0.62, width * 0.55, height * 0.72, width * 0.3, height * 0.65);
      ctx.lineTo(0, height * 0.68);
      ctx.lineTo(0, height * 0.45);
      ctx.bezierCurveTo(width * 0.2, height * 0.38, width * 0.5, height * 0.52, width * 0.8, height * 0.32);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Layer 3: Sage Green Organic Paper Layer across lower-middle
      ctx.save();
      ctx.shadowColor = 'rgba(44, 38, 30, 0.2)';
      ctx.shadowBlur = s(18);
      ctx.shadowOffsetY = s(8);
      ctx.fillStyle = '#9da78c';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.58);
      ctx.bezierCurveTo(width * 0.25, height * 0.52, width * 0.55, height * 0.64, width * 0.8, height * 0.55);
      ctx.lineTo(width, height * 0.62);
      ctx.lineTo(width, height * 0.86);
      ctx.bezierCurveTo(width * 0.7, height * 0.92, width * 0.4, height * 0.82, 0, height * 0.88);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Layer 4: Upper-Middle Arched Horizon Paper Cutout (Frames weekly cadence / stats)
      const archX = width * 0.5;
      const archY = format === 'landscape' ? height * 0.48 : height * 0.38;
      const archR = format === 'landscape' ? width * 0.22 : width * 0.38;
      ctx.save();
      ctx.shadowColor = 'rgba(44, 38, 30, 0.25)';
      ctx.shadowBlur = s(16);
      ctx.shadowOffsetY = s(8);
      ctx.fillStyle = '#e5d5be';
      ctx.beginPath();
      ctx.arc(archX, archY, archR, Math.PI, 0, false);
      ctx.lineTo(archX + archR, archY + s(50));
      ctx.lineTo(archX - archR, archY + s(50));
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Mountain ridge paper cutout inside the arch
      ctx.save();
      ctx.beginPath();
      ctx.arc(archX, archY, archR, Math.PI, 0, false);
      ctx.clip();
      ctx.fillStyle = '#d5c4aa';
      ctx.beginPath();
      ctx.moveTo(archX - archR, archY + s(50));
      ctx.lineTo(archX - archR * 0.6, archY - archR * 0.4);
      ctx.lineTo(archX - archR * 0.2, archY - archR * 0.15);
      ctx.lineTo(archX + archR * 0.15, archY - archR * 0.55);
      ctx.lineTo(archX + archR * 0.5, archY - archR * 0.25);
      ctx.lineTo(archX + archR, archY - archR * 0.45);
      ctx.lineTo(archX + archR, archY + s(50));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
    }

    case 'cartoon': {
      // Full-bleed pop-art radiating sunburst rays & halftone dots
      ctx.fillStyle = '#fffbeb';
      ctx.fillRect(0, 0, width, height);

      const burstX = width * 0.5;
      const burstY = format === 'landscape' ? height * 0.5 : height * 0.42;
      const burstR = Math.max(width, height) * 1.2;
      const numRays = 36;
      const angleStep = (Math.PI * 2) / numRays;

      for (let i = 0; i < numRays; i++) {
        if (i % 2 === 0) {
          ctx.fillStyle = theme.accent;
          ctx.globalAlpha = 0.35;
          ctx.beginPath();
          ctx.moveTo(burstX, burstY);
          ctx.arc(burstX, burstY, burstR, i * angleStep, (i + 1) * angleStep);
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 1.0;
        } else {
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.moveTo(burstX, burstY);
          ctx.arc(burstX, burstY, burstR, i * angleStep, (i + 1) * angleStep);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Halftone dot overlay
      ctx.fillStyle = theme.accent;
      ctx.globalAlpha = 0.14;
      const hStep = s(28);
      const hDotR = 2.4 * scale;
      for (let x = s(14); x < width; x += hStep) {
        for (let y = s(14); y < height; y += hStep) {
          ctx.beginPath();
          ctx.arc(x, y, hDotR, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0;
      break;
    }

    case 'illustrated': {
      // Full-bleed 70s psychedelic retro topographical wavy contour bands
      ctx.fillStyle = '#1a1528';
      ctx.fillRect(0, 0, width, height);

      const illColors = [theme.accent, '#f43f5e', '#fb923c', '#facc15', '#22d3ee', '#a855f7', '#ec4899'];
      const numBands = 10;
      const bandH = height / (numBands - 1);

      for (let i = 0; i < numBands; i++) {
        const yBase = i * bandH;
        ctx.fillStyle = illColors[i % illColors.length];
        ctx.beginPath();
        ctx.moveTo(0, yBase);
        ctx.bezierCurveTo(width * 0.3, yBase - s(70), width * 0.6, yBase + s(70), width, yBase - s(20));
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    case 'lowpoly': {
      // Full-bleed 3D geometric faceted polygon crystal mesh
      ctx.fillStyle = '#130822';
      ctx.fillRect(0, 0, width, height);

      const lpColors = [
        '#2e1065', '#3b0764', '#581c87', '#6b21a8', '#7e22ce',
        theme.accent, '#a855f7', '#c084fc', '#d8b4fe', '#4c1d95',
      ];
      const rows = 8;
      const cols = 6;
      const cellW = width / cols;
      const cellH = height / rows;

      const verts: { x: number; y: number }[][] = [];
      for (let r = 0; r <= rows; r++) {
        verts[r] = [];
        for (let c = 0; c <= cols; c++) {
          const jX = (c === 0 || c === cols) ? 0 : (((r * 31 + c * 47) % 30) - 15) * scale;
          const jY = (r === 0 || r === rows) ? 0 : (((r * 53 + c * 29) % 30) - 15) * scale;
          verts[r][c] = { x: c * cellW + jX, y: r * cellH + jY };
        }
      }

      let triIdx = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const v00 = verts[r][c];
          const v10 = verts[r][c + 1];
          const v01 = verts[r + 1][c];
          const v11 = verts[r + 1][c + 1];

          // Triangle 1
          ctx.fillStyle = lpColors[(triIdx * 7) % lpColors.length];
          ctx.beginPath();
          ctx.moveTo(v00.x, v00.y);
          ctx.lineTo(v10.x, v10.y);
          ctx.lineTo(v01.x, v01.y);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1 * scale;
          ctx.stroke();

          // Triangle 2
          ctx.fillStyle = lpColors[(triIdx * 7 + 3) % lpColors.length];
          ctx.beginPath();
          ctx.moveTo(v10.x, v10.y);
          ctx.lineTo(v11.x, v11.y);
          ctx.lineTo(v01.x, v01.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          triIdx++;
        }
      }
      break;
    }

    case 'anime': {
      // Full-bleed dreamy sky gradient with cumulus clouds & cherry blossoms (zero sparkles)
      const aSky = ctx.createLinearGradient(0, 0, 0, height);
      aSky.addColorStop(0, '#fce7f3');
      aSky.addColorStop(0.35, '#fed7aa');
      aSky.addColorStop(0.7, '#bae6fd');
      aSky.addColorStop(1, '#ddd6fe');
      ctx.fillStyle = aSky;
      ctx.fillRect(0, 0, width, height);

      // Fluffy anime cumulus clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      const cloudClusters = [
        { cx: width * 0.2, cy: height * 0.2, r: s(90) },
        { cx: width * 0.75, cy: height * 0.35, r: s(120) },
        { cx: width * 0.35, cy: height * 0.65, r: s(110) },
        { cx: width * 0.85, cy: height * 0.8, r: s(95) },
      ];
      for (const cl of cloudClusters) {
        ctx.beginPath();
        ctx.arc(cl.cx, cl.cy, cl.r, 0, Math.PI * 2);
        ctx.arc(cl.cx + cl.r * 0.6, cl.cy + cl.r * 0.1, cl.r * 0.75, 0, Math.PI * 2);
        ctx.arc(cl.cx - cl.r * 0.6, cl.cy + cl.r * 0.1, cl.r * 0.75, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cherry blossom petal silhouettes gently drifting
      ctx.fillStyle = theme.accent;
      ctx.globalAlpha = 0.55;
      for (let i = 0; i < 24; i++) {
        const px = ((i * 197) % width);
        const py = ((i * 311) % height);
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate((i * 0.4) - 0.8);
        ctx.beginPath();
        ctx.ellipse(0, 0, s(14), s(6), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1.0;
      break;
    }

    case 'artdeco': {
      // Full-bleed deep obsidian black lacquer with gold filigree fan corner ornaments & chevrons
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // Concentric gold/accent rectangular border frames
      const margin1 = s(55);
      const margin2 = s(75);
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 2 * scale;
      roundRect(ctx, margin1, margin1, width - margin1 * 2, height - margin1 * 2, s(20));
      ctx.stroke();

      ctx.strokeStyle = theme.accentGlow;
      ctx.lineWidth = 1 * scale;
      roundRect(ctx, margin2, margin2, width - margin2 * 2, height - margin2 * 2, s(14));
      ctx.stroke();
      break;
    }

    case '3d':
    case 'sphere': {
      // Deep claymorphic studio ambient blur orbs
      const clayGrad = ctx.createRadialGradient(width * 0.35, height * 0.35, s(40), width * 0.5, height * 0.5, width * 0.8);
      clayGrad.addColorStop(0, theme.accentGlow);
      clayGrad.addColorStop(0.5, theme.backgroundStart);
      clayGrad.addColorStop(1, '#050507');
      ctx.fillStyle = clayGrad;
      ctx.fillRect(0, 0, width, height);
      break;
    }

    case 'watercolor': {
      // Cold-press paper with multi-hued bleeding wet-on-wet watercolor washes
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      const washes = [
        { x: width * 0.25, y: height * 0.2, r: width * 0.45, color: theme.accent, alpha: 0.35 },
        { x: width * 0.75, y: height * 0.35, r: width * 0.5, color: '#38bdf8', alpha: 0.35 },
        { x: width * 0.4, y: height * 0.65, r: width * 0.55, color: '#818cf8', alpha: 0.3 },
        { x: width * 0.8, y: height * 0.85, r: width * 0.45, color: '#fb7185', alpha: 0.25 },
      ];

      for (const w of washes) {
        const rad = ctx.createRadialGradient(w.x, w.y, s(10), w.x, w.y, w.r);
        rad.addColorStop(0, w.color);
        rad.addColorStop(1, 'transparent');
        ctx.save();
        ctx.globalAlpha = w.alpha;
        ctx.fillStyle = rad;
        ctx.beginPath();
        ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      break;
    }

    case 'collage': {
      // Mixed-media zine scrapbook with newspaper print columns and washi tape tabs
      ctx.fillStyle = '#f5efe6';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      const colW = (width - s(120)) / 4;
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(s(60) + i * (colW + s(15)), s(60), colW, height - s(120));
      }

      // Washi tape tabs in theme.accent
      const tapes = [
        { x: s(80), y: s(60), rot: -0.25, color: theme.accent },
        { x: width - s(120), y: s(70), rot: 0.35, color: '#38bdf8' },
        { x: s(90), y: height - s(80), rot: 0.2, color: '#4ade80' },
        { x: width - s(110), y: height - s(70), rot: -0.3, color: '#f472b6' },
      ];
      for (const tp of tapes) {
        ctx.save();
        ctx.translate(tp.x, tp.y);
        ctx.rotate(tp.rot);
        ctx.fillStyle = tp.color;
        ctx.globalAlpha = 0.6;
        ctx.fillRect(-s(50), -s(14), s(100), s(28));
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1 * scale;
        ctx.strokeRect(-s(50), -s(14), s(100), s(28));
        ctx.restore();
      }
      break;
    }

    case 'goth': {
      // Midnight slate noir with manga cross-hatching
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1 * scale;
      const chStep = s(16);
      for (let x = -height; x < width + height; x += chStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + height, height);
        ctx.stroke();
      }
      break;
    }

    case 'cinema': {
      // 35mm widescreen cinematic letterbox bars with anamorphic flare beam
      ctx.fillStyle = '#080a0f';
      ctx.fillRect(0, 0, width, height);

      const barH = format === 'story' ? s(140) : s(90);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, barH);
      ctx.fillRect(0, height - barH, width, barH);

      const beamGrad = ctx.createLinearGradient(0, height * 0.2, width, height * 0.8);
      beamGrad.addColorStop(0, theme.accent);
      beamGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.22)');
      beamGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = beamGrad;
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.15);
      ctx.lineTo(width, height * 0.65);
      ctx.lineTo(width, height * 0.85);
      ctx.lineTo(0, height * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1.0;
      break;
    }

    case 'pixel': {
      const cols = 12;
      const rows = 18;
      const pW = width / cols;
      const pH = height / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const isAccent = (r * 7 + c * 11) % 9 === 0;
          const isGlow = (r * 5 + c * 3) % 4 === 0;
          ctx.fillStyle = isAccent ? theme.accent : isGlow ? theme.accentGlow : 'rgba(255,255,255,0.025)';
          ctx.fillRect(c * pW + s(4), r * pH + s(4), pW - s(8), pH - s(8));
        }
      }
      break;
    }

    case 'cyber': {
      const horizonY = height * 0.45;
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 1.2 * scale;
      const numLines = 14;
      for (let i = 0; i <= numLines; i++) {
        const bx = (width / numLines) * i;
        ctx.beginPath();
        ctx.moveTo(width * 0.5, horizonY);
        ctx.lineTo(bx, height);
        ctx.stroke();
      }
      for (let y = horizonY + s(20); y < height; y += s(40)) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      break;
    }

    case 'topo': {
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 1.5 * scale;
      for (let i = 1; i <= 6; i++) {
        const yBase = (height / 7) * i;
        ctx.beginPath();
        ctx.moveTo(0, yBase);
        ctx.bezierCurveTo(width * 0.3, yBase - s(60), width * 0.7, yBase + s(60), width, yBase);
        ctx.stroke();
      }
      break;
    }

    default:
      break;
  }

  // 3. Lighting Profile Overlay (RENDERED DIRECTLY ON TOP OF ARTWORK)
  switch (customization.lighting) {
    case 'dark':
    case 'rim': {
      // Dark cinematic vignette
      const darkGrad = ctx.createRadialGradient(width * 0.5, height * 0.5, s(80), width * 0.5, height * 0.5, width * 0.85);
      darkGrad.addColorStop(0, 'transparent');
      darkGrad.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
      ctx.fillStyle = darkGrad;
      ctx.fillRect(0, 0, width, height);

      // Cyan rim light in corner
      const rX1 = format === 'landscape' ? width * 0.15 : width * 0.2;
      const rY1 = format === 'landscape' ? height * 0.25 : height * 0.15;
      const rad1 = ctx.createRadialGradient(rX1, rY1, s(10), rX1, rY1, width * 0.55);
      rad1.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
      rad1.addColorStop(1, 'transparent');
      ctx.fillStyle = rad1;
      ctx.fillRect(0, 0, width, height);
      break;
    }

    case 'sunset':
    case 'sunburst': {
      // Radiant warm sunset ray from top-right
      const sunX = width * 0.88;
      const sunY = height * 0.12;
      const sunRad = ctx.createRadialGradient(sunX, sunY, s(20), sunX, sunY, width * 0.95);
      sunRad.addColorStop(0, 'rgba(251, 146, 60, 0.5)');
      sunRad.addColorStop(0.35, 'rgba(244, 63, 94, 0.3)');
      sunRad.addColorStop(1, 'transparent');
      ctx.fillStyle = sunRad;
      ctx.fillRect(0, 0, width, height);
      break;
    }

    case 'bright':
    case 'spotlight': {
      // Overhead luminous spotlight
      const spotX = width * 0.5;
      const spotY = 0;
      const spotRad = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, height * 0.75);
      spotRad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      spotRad.addColorStop(0.4, 'rgba(255, 255, 255, 0.12)');
      spotRad.addColorStop(1, 'transparent');
      ctx.fillStyle = spotRad;
      ctx.fillRect(0, 0, width, height);
      break;
    }

    case 'ethereal':
    case 'diffuse':
    default: {
      // Golden atmospheric radiance
      const eX = width * 0.5;
      const eY = format === 'landscape' ? height * 0.5 : height * 0.4;
      const eRad = ctx.createRadialGradient(eX, eY, s(20), eX, eY, width * 0.65);
      eRad.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
      eRad.addColorStop(0.4, 'rgba(245, 158, 11, 0.18)');
      eRad.addColorStop(1, 'transparent');
      ctx.fillStyle = eRad;
      ctx.fillRect(0, 0, width, height);
      break;
    }
  }

  // 4. Mood Texture Overlay (RENDERED ON TOP OF LIGHTING, strictly zero sparkles)
  switch (customization.mood) {
    case 'glowy': {
      // Electric bioluminescent aura centered on card
      const glowX = width * 0.5;
      const glowY = format === 'landscape' ? height * 0.5 : height * 0.42;
      const glowGrad = ctx.createRadialGradient(glowX, glowY, s(40), glowX, glowY, width * 0.65);
      glowGrad.addColorStop(0, 'rgba(16, 185, 129, 0.42)');
      glowGrad.addColorStop(0.45, 'rgba(6, 182, 212, 0.28)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(glowX, glowY, width * 0.65, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'sweets': {
      // Soft candy pink tint & 40 colorful sprinkles
      ctx.fillStyle = 'rgba(244, 114, 182, 0.12)';
      ctx.fillRect(0, 0, width, height);

      const sColors = ['#f472b6', '#38bdf8', '#facc15', '#4ade80', '#ffffff'];
      for (let i = 0; i < 40; i++) {
        const sx = ((i * 179) % (width - s(80))) + s(40);
        const sy = ((i * 283) % (height - s(80))) + s(40);
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate((i * 0.5) - 1);
        ctx.fillStyle = sColors[i % sColors.length];
        ctx.fillRect(-s(14), -s(4), s(28), s(8));
        ctx.restore();
      }
      break;
    }

    case 'dreamy': {
      // 18 warm golden luminous bokeh discs
      for (let i = 0; i < 18; i++) {
        const bx = ((i * 211) % (width - s(120))) + s(60);
        const by = ((i * 337) % (height - s(120))) + s(60);
        const br = s(20) + (i % 4) * s(12);
        const bGrad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        bGrad.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
        bGrad.addColorStop(0.7, 'rgba(245, 158, 11, 0.2)');
        bGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'clean':
    default: {
      ctx.fillStyle = theme.colour === 'ivory' ? 'rgba(0,0,0,0.038)' : 'rgba(255,255,255,0.038)';
      const dotSpacing = format === 'landscape' ? s(34) : s(44);
      const dotRadius = 1.4 * scale;
      for (let x = s(24); x < width; x += dotSpacing) {
        for (let y = s(24); y < height; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
  }

  // 5. Outer Precision Border
  const outerMargin = format === 'landscape' ? s(32) : s(52);
  const borderHex = styleTheme.cardBorder.match(/#[a-fA-F0-9]{3,8}/)?.[0] || theme.cardBorder;
  ctx.strokeStyle = borderHex;
  ctx.lineWidth = styleTheme.isCartoonStyle ? 4 * scale : 1.5 * scale;
  roundRect(ctx, outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2, s(36));
  ctx.stroke();

  ctx.restore();
}

export async function renderFlexCardToCanvas(
  canvas: HTMLCanvasElement,
  data: FlexCardData,
  customizationOrTheme: FlexCardCustomization | FlexCardTheme = DEFAULT_CUSTOMIZATION,
  format: FlexCardFormat = 'story'
) {
  // 1. Ensure all luxury web typography is fully resolved before rasterization
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Font load fallback
    }
  }

  const { width, height } = FORMAT_DIMENSIONS[format];
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Maximum subpixel antialiasing and rasterization clarity
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const base = BASE_DIMENSIONS[format];
  const scale = width / base.width;

  // Resolve customization and theme palette
  const customization: FlexCardCustomization =
    typeof customizationOrTheme === 'string'
      ? {
          ...DEFAULT_CUSTOMIZATION,
          colour: (customizationOrTheme === 'obsidian' ? 'ember' : customizationOrTheme) as FlexCardColour,
        }
      : customizationOrTheme;

  const theme: ThemeColors =
    COLOUR_PALETTES[customization.colour] ||
    FLEX_CARD_THEMES[customization.colour] ||
    COLOUR_PALETTES.ember;

  // Render authentic procedural 4K background (lighting, style artwork, mood texture, border)
  renderCustomizationBackground(ctx, width, height, customization, theme, scale, format);

  // Route to format-specific layout renderers with true native 4K scaling
  if (format === 'story') {
    const styleTheme = getEffectiveCardStyling(customization, theme);

    renderStoryLayout(ctx, width, height, data, theme, scale, styleTheme);
  } else if (format === 'square') {
    const styleTheme = getEffectiveCardStyling(customization, theme);

    renderSquareLayout(ctx, width, height, data, theme, scale, styleTheme);
  } else {
    const styleTheme = getEffectiveCardStyling(customization, theme);

    renderLandscapeLayout(ctx, width, height, data, theme, scale, styleTheme);
  }
}

/**
 * -------------------------------------------------------------
 * 1. STORY LAYOUT (9:16 - 2160 x 3840 px 4K Ultra HD)
 * Balanced vertical flow that fills the canvas without empty voids
 * -------------------------------------------------------------
 */
function renderStoryLayout(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: FlexCardData,
  theme: ThemeColors,
  scale: number,
  styleTheme: CardStyleTheme = getEffectiveCardStyling(DEFAULT_CUSTOMIZATION, theme)
) {
  const s = (n: number) => Math.round(n * scale);
  const padX = s(100);
  const contentW = width - padX * 2;

  // 1. Header Bar
  const headerY = s(140);
  renderHeaderBrand(ctx, padX, headerY, width, data.dateStr, theme, scale, styleTheme);

  // 2. Milestone Pill Badge
  const badgeY = s(250);
  renderBadgePill(ctx, padX, badgeY, data.badgeText, theme, scale, styleTheme);

  // 3. Hero Big Number
  const heroY = s(350);
  const valStr = String(data.metricValue);
  const numFontSize = s(185);
  ctx.font = `700 ${numFontSize}px ${FONT_HEAD}`;
  if (styleTheme.metricShadow) {
    ctx.save();
    ctx.shadowColor = 'rgba(44, 38, 30, 0.35)';
    ctx.shadowBlur = s(18);
    ctx.shadowOffsetY = s(8);
  }
  ctx.fillStyle = styleTheme.metricColor;
  ctx.textBaseline = 'top';
  ctx.fillText(valStr, padX, heroY);
  if (styleTheme.metricShadow) {
    ctx.restore();
  }

  const numWidth = ctx.measureText(valStr).width;

  // Unit text beside number
  if (data.metricUnit) {
    const unitLines = wrapText(ctx, data.metricUnit.toUpperCase(), s(380));
    ctx.font = `700 ${s(42)}px ${FONT_HEAD}`;
    ctx.fillStyle = styleTheme.accent;
    let uY = heroY + s(32);
    for (const uL of unitLines) {
      ctx.fillText(uL, padX + numWidth + s(24), uY);
      uY += s(46);
    }
  }

  // Title Label
  const labelY = heroY + numFontSize + s(12);
  ctx.font = `700 ${s(42)}px ${FONT_HEAD}`;
  ctx.fillStyle = styleTheme.primaryText;
  const titleLines = wrapText(ctx, data.title || 'Consistency Milestone', contentW);
  let curLabelY = labelY;
  for (const tL of titleLines.slice(0, 2)) {
    ctx.fillText(tL, padX, curLabelY);
    curLabelY += s(50);
  }

  // Subtitle
  const subLines = wrapText(ctx, data.subtitle || data.metricLabel, contentW);
  ctx.font = `500 ${s(24)}px ${FONT_BODY}`;
  ctx.fillStyle = styleTheme.secondaryText;
  let curSubY = curLabelY + s(12);
  for (const sL of subLines.slice(0, 2)) {
    ctx.fillText(sL, padX, curSubY);
    curSubY += s(34);
  }

  // 4. 7-Day Consistency Dot Matrix
  const dotsY = Math.max(s(730), curSubY + s(36));
  renderWeeklyConsistencyDots(ctx, padX, dotsY, contentW, theme, scale, data.weeklyDots, styleTheme);

  // 5. Dual Bento Stats Grid
  const bentoY = dotsY + s(120);
  const bentoW = (contentW - s(28)) / 2;
  const bentoH = s(220);

  // Bento Box 1: Routine / Target
  ctx.fillStyle = styleTheme.bentoBg;
  roundRect(ctx, padX, bentoY, bentoW, bentoH, s(26));
  ctx.fill();
  ctx.strokeStyle = styleTheme.bentoBorder.match(/#[a-fA-F0-9]{3,8}/)?.[0] || theme.cardBorder;
  ctx.lineWidth = (styleTheme.isCartoonStyle ? 3 : 1.5) * scale;
  ctx.stroke();

  ctx.font = `600 ${s(16)}px ${FONT_BODY}`;
  ctx.fillStyle = styleTheme.bentoSubColor;
  ctx.fillText(data.bentoLabel || 'TARGET ROUTINE', padX + s(28), bentoY + s(36));

  ctx.font = `700 ${s(28)}px ${FONT_HEAD}`;
  ctx.fillStyle = styleTheme.bentoTitleColor;
  const habitStr = truncateText(ctx, data.habitTitle || 'Core Habit Stack', bentoW - s(56));
  ctx.fillText(habitStr, padX + s(28), bentoY + s(84));

  // Routine badge chip inside bento 1
  const tagText = (data.routineTag || 'Daily Discipline').toUpperCase();
  ctx.font = `700 ${s(15)}px ${FONT_BODY}`;
  const measuredTagW = ctx.measureText(tagText).width + s(36);
  const chipW = Math.min(bentoW - s(56), Math.max(s(140), measuredTagW));
  ctx.fillStyle = styleTheme.badgeBg;
  roundRect(ctx, padX + s(28), bentoY + s(135), chipW, s(42), s(14));
  ctx.fill();
  ctx.fillStyle = styleTheme.badgeText;
  ctx.fillText(truncateText(ctx, tagText, chipW - s(24)), padX + s(44), bentoY + s(162));

  // Bento Box 2: Adherence Index
  const bento2X = padX + bentoW + s(28);
  ctx.fillStyle = styleTheme.bentoBg;
  roundRect(ctx, bento2X, bentoY, bentoW, bentoH, s(26));
  ctx.fill();
  ctx.strokeStyle = styleTheme.bentoBorder.match(/#[a-fA-F0-9]{3,8}/)?.[0] || theme.cardBorder;
  ctx.lineWidth = (styleTheme.isCartoonStyle ? 3 : 1.5) * scale;
  ctx.stroke();

  ctx.font = `600 ${s(16)}px ${FONT_BODY}`;
  ctx.fillStyle = styleTheme.bentoSubColor;
  ctx.fillText('ADHERENCE INDEX', bento2X + s(28), bentoY + s(36));

  const pct = Math.min(100, Math.max(0, Math.round(data.completionRate ?? 0)));
  ctx.font = `700 ${s(48)}px ${FONT_HEAD}`;
  ctx.fillStyle = styleTheme.bentoAccentColor;
  ctx.fillText(`${pct}%`, bento2X + s(28), bentoY + s(92));

  ctx.font = `500 ${s(16)}px ${FONT_BODY}`;
  ctx.fillStyle = styleTheme.bentoSubColor;
  ctx.fillText(data.adherenceLabel || 'Monthly Logged', bento2X + s(28), bentoY + s(132));

  // Mini progress track in bento 2
  ctx.fillStyle = styleTheme.progressTrack;
  roundRect(ctx, bento2X + s(28), bentoY + s(162), bentoW - s(56), s(12), s(6));
  ctx.fill();
  ctx.fillStyle = styleTheme.progressFill;
  roundRect(ctx, bento2X + s(28), bentoY + s(162), (bentoW - s(56)) * (pct / 100), s(12), s(6));
  ctx.fill();

  // 6. Wisdom Quote Capsule or Dynamic Performance Breakdown Box
  const quoteY = bentoY + bentoH + s(45);
  const quoteH = s(340);

  if (data.showQuote !== false) {
    ctx.fillStyle = styleTheme.quoteBg;
    roundRect(ctx, padX, quoteY, contentW, quoteH, s(28));
    ctx.fill();
    ctx.strokeStyle = styleTheme.quoteBorder.match(/#[a-fA-F0-9]{3,8}/)?.[0] || theme.quoteBoxBorder;
    ctx.lineWidth = (styleTheme.isCartoonStyle ? 3 : 1.5) * scale;
    ctx.stroke();

    // Large quotation icon mark
    ctx.font = `700 ${s(64)}px ${FONT_SERIF}`;
    ctx.fillStyle = styleTheme.quoteMarkColor;
    ctx.fillText('“', padX + s(36), quoteY + s(32));

    const qText = data.quote || 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.';
    const qAuthor = data.quoteAuthor || 'Aristotle';

    ctx.font = `italic 500 ${s(29)}px ${FONT_SERIF}`;
    ctx.fillStyle = styleTheme.quoteTextColor;
    const qLines = wrapText(ctx, qText, contentW - s(80));

    let qTextY = quoteY + s(95);
    for (const line of qLines.slice(0, 3)) {
      ctx.fillText(line, padX + s(40), qTextY);
      qTextY += s(44);
    }

    ctx.font = `700 ${s(20)}px ${FONT_BODY}`;
    ctx.fillStyle = styleTheme.quoteAuthorColor;
    ctx.fillText(`— ${qAuthor}`, padX + s(40), quoteY + quoteH - s(40));
  } else {
    // Dynamic Performance Metrics Card (100% data-driven, zero static filler)
    ctx.fillStyle = theme.cardBg;
    roundRect(ctx, padX, quoteY, contentW, quoteH, s(28));
    ctx.fill();
    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();

    ctx.font = `700 ${s(24)}px ${FONT_HEAD}`;
    ctx.fillStyle = theme.primaryText;
    ctx.fillText('HABIT PERFORMANCE METRICS', padX + s(36), quoteY + s(45));

    ctx.font = `500 ${s(18)}px ${FONT_BODY}`;
    ctx.fillStyle = theme.secondaryText;
    const subHeader = `${data.habitTitle || 'Habit Stack'} • Authenticated tracker activity`;
    ctx.fillText(truncateText(ctx, subHeader, contentW - s(72)), padX + s(36), quoteY + s(85));

    // 3 Dynamic Metric Pills
    const col3W = (contentW - s(72) - s(32)) / 3;
    const pY = quoteY + s(130);
    const weeklyCount = data.weeklyDots?.filter((d: { completed: boolean }) => d.completed).length || 0;
    const statsCols = data.metricDetails && data.metricDetails.length === 3
      ? data.metricDetails
      : [
          { label: 'STREAK', value: `${data.metricValue}`, subtext: String(data.metricUnit || 'Days Unbroken') },
          { label: 'ADHERENCE', value: `${pct}%`, subtext: data.adherenceLabel || 'Monthly Log' },
          { label: '7-DAY PACE', value: `${weeklyCount}/7`, subtext: 'Days Completed' },
        ];

    statsCols.forEach((col: { label: string; value: string; subtext: string }, idx: number) => {
      const cX = padX + s(36) + idx * (col3W + s(16));
      ctx.fillStyle = theme.pillBg;
      roundRect(ctx, cX, pY, col3W, s(110), s(18));
      ctx.fill();

      ctx.font = `700 ${s(13)}px ${FONT_BODY}`;
      ctx.fillStyle = theme.secondaryText;
      ctx.fillText(col.label, cX + s(16), pY + s(28));

      ctx.font = `700 ${s(24)}px ${FONT_HEAD}`;
      ctx.fillStyle = theme.accent;
      ctx.fillText(col.value, cX + s(16), pY + s(62));

      ctx.font = `500 ${s(13)}px ${FONT_BODY}`;
      ctx.fillStyle = theme.secondaryText;
      ctx.fillText(truncateText(ctx, col.subtext, col3W - s(32)), cX + s(16), pY + s(88));
    });

    ctx.font = `600 ${s(15)}px ${FONT_BODY}`;
    ctx.fillStyle = theme.accent;
    ctx.fillText(`• ${data.adherenceLabel || 'VERIFIED TRACKER LOGS'}`, padX + s(36), quoteY + quoteH - s(35));
  }

  // 7. Divider Line
  ctx.strokeStyle = styleTheme.headerDivider;
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.moveTo(padX, height - s(140));
  ctx.lineTo(width - padX, height - s(140));
  ctx.stroke();

  // 8. Footer Signature
  const footerY = height - s(95);
  renderFooterSignature(ctx, padX, footerY, width, data, theme, scale, styleTheme);
}

/**
 * -------------------------------------------------------------
 * 2. SQUARE LAYOUT (1:1 - 2160 x 2160 px 4K Ultra HD)
 * High density, balanced layout that guarantees ZERO footer collisions
 * -------------------------------------------------------------
 */
function renderSquareLayout(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: FlexCardData,
  theme: ThemeColors,
  scale: number,
  styleTheme: CardStyleTheme = getEffectiveCardStyling(DEFAULT_CUSTOMIZATION, theme)
) {
  const s = (n: number) => Math.round(n * scale);
  const padX = s(85);
  const contentW = width - padX * 2;

  // Header Bar
  const headerY = s(85);
  renderHeaderBrand(ctx, padX, headerY, width, data.dateStr, theme, scale, styleTheme);

  // Milestone Pill Badge
  const badgeY = s(175);
  renderBadgePill(ctx, padX, badgeY, data.badgeText, theme, scale, styleTheme);

  // Hero Big Number & Unit
  const heroY = s(255);
  const valStr = String(data.metricValue);
  const numFontSize = s(135);
  ctx.font = `700 ${numFontSize}px ${FONT_HEAD}`;
  if (styleTheme.metricShadow) {
    ctx.save();
    ctx.shadowColor = 'rgba(44, 38, 30, 0.35)';
    ctx.shadowBlur = s(16);
    ctx.shadowOffsetY = s(8);
  }
  ctx.fillStyle = styleTheme.metricColor;
  ctx.textBaseline = 'top';
  ctx.fillText(valStr, padX, heroY);
  if (styleTheme.metricShadow) {
    ctx.restore();
  }

  const numWidth = ctx.measureText(valStr).width;

  if (data.metricUnit) {
    ctx.font = `700 ${s(36)}px ${FONT_HEAD}`;
    ctx.fillStyle = styleTheme.accent;
    ctx.fillText(data.metricUnit.toUpperCase(), padX + numWidth + s(20), heroY + s(24));
  }

  // Title
  const labelY = heroY + numFontSize + s(8);
  ctx.font = `700 ${s(34)}px ${FONT_HEAD}`;
  ctx.fillStyle = styleTheme.primaryText;
  const titleStr = truncateText(ctx, data.title || 'Consistency Milestone', contentW);
  ctx.fillText(titleStr, padX, labelY);

  // Subtitle
  const subY = labelY + s(42);
  ctx.font = `500 ${s(20)}px ${FONT_BODY}`;
  ctx.fillStyle = styleTheme.secondaryText;
  const subStr = truncateText(ctx, data.subtitle || data.metricLabel, contentW);
  ctx.fillText(subStr, padX, subY);

  // Bento Stats Row
  const statsY = subY + s(46);
  const statsH = s(130);
  ctx.fillStyle = styleTheme.bentoBg;
  roundRect(ctx, padX, statsY, contentW, statsH, s(22));
  ctx.fill();
  ctx.strokeStyle = styleTheme.bentoBorder.match(/#[a-fA-F0-9]{3,8}/)?.[0] || theme.cardBorder;
  ctx.lineWidth = (styleTheme.isCartoonStyle ? 3 : 1.5) * scale;
  ctx.stroke();

  // Inside Stats Row: Routine on Left, Adherence on Right
  ctx.font = `600 ${s(15)}px ${FONT_BODY}`;
  ctx.fillStyle = styleTheme.bentoSubColor;
  ctx.fillText(data.bentoLabel || 'TARGET ROUTINE', padX + s(26), statsY + s(36));

  ctx.font = `700 ${s(26)}px ${FONT_HEAD}`;
  ctx.fillStyle = styleTheme.bentoTitleColor;
  const habitStr = truncateText(ctx, data.habitTitle || 'Core Daily Stack', contentW * 0.55);
  ctx.fillText(habitStr, padX + s(26), statsY + s(76));

  // Right Stat
  const rightX = padX + contentW - s(26);
  ctx.textAlign = 'right';
  ctx.font = `600 ${s(15)}px ${FONT_BODY}`;
  ctx.fillStyle = styleTheme.bentoSubColor;
  ctx.fillText('ADHERENCE', rightX, statsY + s(36));

  const pct = Math.min(100, Math.max(0, Math.round(data.completionRate ?? 0)));
  ctx.font = `700 ${s(36)}px ${FONT_HEAD}`;
  ctx.fillStyle = styleTheme.bentoAccentColor;
  ctx.fillText(`${pct}%`, rightX, statsY + s(74));

  if (data.adherenceLabel) {
    ctx.font = `500 ${s(13)}px ${FONT_BODY}`;
    ctx.fillStyle = styleTheme.bentoSubColor;
    ctx.fillText(truncateText(ctx, data.adherenceLabel, contentW * 0.45), rightX, statsY + s(98));
  }
  ctx.textAlign = 'left';

  // Wisdom Quote or Mini Capsule (Fits cleanly without collision)
  if (data.showQuote !== false) {
    const quoteY = statsY + statsH + s(28);
    const quoteH = s(160);

    ctx.fillStyle = styleTheme.quoteBg;
    roundRect(ctx, padX, quoteY, contentW, quoteH, s(22));
    ctx.fill();
    ctx.strokeStyle = styleTheme.quoteBorder.match(/#[a-fA-F0-9]{3,8}/)?.[0] || theme.quoteBoxBorder;
    ctx.lineWidth = (styleTheme.isCartoonStyle ? 3 : 1.2) * scale;
    ctx.stroke();

    const qText = data.quote || 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.';
    const qAuthor = data.quoteAuthor || 'Aristotle';

    ctx.font = `italic 500 ${s(22)}px ${FONT_SERIF}`;
    ctx.fillStyle = styleTheme.quoteTextColor;
    const qLines = wrapText(ctx, `“${qText}”`, contentW - s(52));

    let qY = quoteY + s(36);
    for (const qL of qLines.slice(0, 2)) {
      ctx.fillText(qL, padX + s(26), qY);
      qY += s(32);
    }

    ctx.font = `600 ${s(16)}px ${FONT_BODY}`;
    ctx.fillStyle = styleTheme.quoteAuthorColor;
    ctx.fillText(`— ${qAuthor}`, padX + s(26), quoteY + quoteH - s(26));
  } else {
    const dotsY = statsY + statsH + s(40);
    renderWeeklyConsistencyDots(ctx, padX, dotsY, contentW, theme, scale, data.weeklyDots, styleTheme);
  }

  // Divider Line
  ctx.strokeStyle = styleTheme.headerDivider;
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.moveTo(padX, height - s(90));
  ctx.lineTo(width - padX, height - s(90));
  ctx.stroke();

  // Footer Signature
  const footerY = height - s(60);
  renderFooterSignature(ctx, padX, footerY, width, data, theme, scale, styleTheme);
}

/**
 * -------------------------------------------------------------
 * 3. LANDSCAPE LAYOUT (16:9 - 3840 x 2160 px 4K Ultra HD)
 * Clean, modern 2-column bento architecture
 * -------------------------------------------------------------
 */
function renderLandscapeLayout(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: FlexCardData,
  theme: ThemeColors,
  scale: number,
  styleTheme: CardStyleTheme = getEffectiveCardStyling(DEFAULT_CUSTOMIZATION, theme)
) {
  const s = (n: number) => Math.round(n * scale);
  const padX = s(70);
  const colW = (width - padX * 2 - s(40)) / 2;

  // Header Bar across top
  const headerY = s(65);
  renderHeaderBrand(ctx, padX, headerY, width, data.dateStr, theme, scale, styleTheme);

  // Left Column: Milestone Badge & Hero Metric
  const leftX = padX;
  const leftY = s(145);

  renderBadgePill(ctx, leftX, leftY, data.badgeText, theme, scale, styleTheme);

  const heroY = leftY + s(55);
  const valStr = String(data.metricValue);
  const numFontSize = s(100);
  ctx.font = `700 ${numFontSize}px ${FONT_HEAD}`;
  if (styleTheme.metricShadow) {
    ctx.save();
    ctx.shadowColor = 'rgba(44, 38, 30, 0.35)';
    ctx.shadowBlur = s(16);
    ctx.shadowOffsetY = s(8);
  }
  ctx.fillStyle = styleTheme.metricColor;
  ctx.textBaseline = 'top';
  ctx.fillText(valStr, leftX, heroY);
  if (styleTheme.metricShadow) {
    ctx.restore();
  }

  const numWidth = ctx.measureText(valStr).width;

  if (data.metricUnit) {
    ctx.font = `700 ${s(28)}px ${FONT_HEAD}`;
    ctx.fillStyle = styleTheme.accent;
    ctx.fillText(data.metricUnit.toUpperCase(), leftX + numWidth + s(14), heroY + s(18));
  }

  const labelY = heroY + numFontSize + s(6);
  ctx.font = `700 ${s(26)}px ${FONT_HEAD}`;
  ctx.fillStyle = styleTheme.primaryText;
  const titleStr = truncateText(ctx, data.title || 'Consistency Milestone', colW);
  ctx.fillText(titleStr, leftX, labelY);

  const subY = labelY + s(34);
  ctx.font = `500 ${s(17)}px ${FONT_BODY}`;
  ctx.fillStyle = styleTheme.secondaryText;
  const subStr = truncateText(ctx, data.subtitle || data.metricLabel, colW);
  ctx.fillText(subStr, leftX, subY);

  // Right Column: Stats Card + Wisdom Quote Bento
  const rightX = padX + colW + s(40);
  const cardY = leftY;
  const cardH = s(140);

  ctx.fillStyle = styleTheme.bentoBg;
  roundRect(ctx, rightX, cardY, colW, cardH, s(20));
  ctx.fill();
  ctx.strokeStyle = styleTheme.bentoBorder.match(/#[a-fA-F0-9]{3,8}/)?.[0] || theme.cardBorder;
  ctx.lineWidth = (styleTheme.isCartoonStyle ? 3 : 1.5) * scale;
  ctx.stroke();

  // Inside Right Card
  ctx.font = `600 ${s(13)}px ${FONT_BODY}`;
  ctx.fillStyle = styleTheme.bentoSubColor;
  ctx.fillText(data.bentoLabel || 'TARGET ROUTINE', rightX + s(22), cardY + s(28));

  ctx.font = `700 ${s(22)}px ${FONT_HEAD}`;
  ctx.fillStyle = styleTheme.bentoTitleColor;
  const habitStr = truncateText(ctx, data.habitTitle || 'Core Daily Stack', colW - s(44));
  ctx.fillText(habitStr, rightX + s(22), cardY + s(60));

  const pct = Math.min(100, Math.max(0, Math.round(data.completionRate ?? 0)));
  ctx.font = `600 ${s(13)}px ${FONT_BODY}`;
  ctx.fillStyle = styleTheme.bentoSubColor;
  ctx.fillText('ADHERENCE SCORE', rightX + s(22), cardY + s(95));

  ctx.font = `700 ${s(20)}px ${FONT_HEAD}`;
  ctx.fillStyle = styleTheme.bentoAccentColor;
  const adhText = data.adherenceLabel ? `${pct}% (${data.adherenceLabel})` : `${pct}% Logged`;
  ctx.fillText(truncateText(ctx, adhText, colW - s(160)), rightX + s(150), cardY + s(96));

  // Right Quote Box
  if (data.showQuote !== false) {
    const qBoxY = cardY + cardH + s(18);
    const qBoxH = s(145);

    ctx.fillStyle = styleTheme.quoteBg;
    roundRect(ctx, rightX, qBoxY, colW, qBoxH, s(20));
    ctx.fill();
    ctx.strokeStyle = styleTheme.quoteBorder.match(/#[a-fA-F0-9]{3,8}/)?.[0] || theme.quoteBoxBorder;
    ctx.lineWidth = (styleTheme.isCartoonStyle ? 3 : 1.2) * scale;
    ctx.stroke();

    const qText = data.quote || 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.';
    const qAuthor = data.quoteAuthor || 'Aristotle';

    ctx.font = `italic 500 ${s(17)}px ${FONT_SERIF}`;
    ctx.fillStyle = styleTheme.quoteTextColor;
    const qLines = wrapText(ctx, `“${qText}”`, colW - s(40));

    let qY = qBoxY + s(28);
    for (const qL of qLines.slice(0, 2)) {
      ctx.fillText(qL, rightX + s(20), qY);
      qY += s(26);
    }

    ctx.font = `600 ${s(14)}px ${FONT_BODY}`;
    ctx.fillStyle = styleTheme.quoteAuthorColor;
    ctx.fillText(`— ${qAuthor}`, rightX + s(20), qBoxY + qBoxH - s(20));
  } else {
    const dotsY = cardY + cardH + s(25);
    renderWeeklyConsistencyDots(ctx, rightX, dotsY, colW, theme, scale, data.weeklyDots, styleTheme);
  }

  // Divider Line
  ctx.strokeStyle = styleTheme.headerDivider;
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.moveTo(padX, height - s(65));
  ctx.lineTo(width - padX, height - s(65));
  ctx.stroke();

  // Footer Signature across bottom
  const footerY = height - s(42);
  renderFooterSignature(ctx, padX, footerY, width, data, theme, scale, styleTheme);
}

/**
 * -------------------------------------------------------------
 * REUSABLE CANVAS ATOMIC COMPONENTS
 * -------------------------------------------------------------
 */

function renderHeaderBrand(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  canvasWidth: number,
  dateStr: string | undefined,
  theme: ThemeColors,
  scale: number,
  styleTheme?: CardStyleTheme
) {
  const s = (n: number) => Math.round(n * scale);
  const chipSize = s(42);
  const chipRadius = s(12);

  // Squircle base
  ctx.fillStyle = theme.name === 'Warm Ivory' ? 'rgba(21, 19, 15, 0.08)' : 'rgba(255, 255, 255, 0.08)';
  roundRect(ctx, x, y, chipSize, chipSize, chipRadius);
  ctx.fill();
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1.2 * scale;
  ctx.stroke();

  // Draw bold "H"
  ctx.font = `700 ${s(24)}px ${FONT_HEAD}`;
  ctx.fillStyle = theme.primaryText;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText('H', x + s(9), y + chipSize / 2 + s(1));

  // Draw signature accent period dot "."
  ctx.fillStyle = theme.accent;
  ctx.beginPath();
  ctx.arc(x + s(31), y + chipSize / 2 + s(8), 3.5 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Brand Name text: HABIT TRACKER
  ctx.font = `700 ${s(26)}px ${FONT_HEAD}`;
  ctx.fillStyle = styleTheme ? styleTheme.headerBrandColor : theme.primaryText;
  ctx.fillText('HABIT TRACKER', x + chipSize + s(16), y + chipSize / 2);

  if (dateStr) {
    ctx.textAlign = 'right';
    ctx.font = `600 ${s(22)}px ${FONT_BODY}`;
    ctx.fillStyle = styleTheme ? styleTheme.dateColor : theme.secondaryText;
    ctx.fillText(dateStr.toUpperCase(), canvasWidth - x, y + chipSize / 2);
    ctx.textAlign = 'left';
  }
}

function renderBadgePill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  theme: ThemeColors,
  scale: number,
  styleTheme?: CardStyleTheme
) {
  const s = (n: number) => Math.round(n * scale);
  const badgeLabel = (text || 'MILESTONE UNLOCKED').toUpperCase();
  ctx.font = `700 ${s(22)}px ${FONT_HEAD}`;
  const badgeW = ctx.measureText(badgeLabel).width + s(48);
  const badgeH = s(48);

  ctx.fillStyle = styleTheme ? styleTheme.badgeBg : theme.pillBg;
  roundRect(ctx, x, y, badgeW, badgeH, s(24));
  ctx.fill();
  if (!styleTheme || styleTheme.badgeBorder !== "none") {
    ctx.strokeStyle = styleTheme ? styleTheme.accent : theme.accent;
    ctx.lineWidth = (styleTheme && styleTheme.isCartoonStyle ? 3 : 2) * scale;
    ctx.stroke();
  }

  ctx.fillStyle = styleTheme ? styleTheme.badgeText : theme.pillText;
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeLabel, x + s(24), y + badgeH / 2);
}

function renderWeeklyConsistencyDots(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  theme: ThemeColors,
  scale: number,
  weeklyDots?: { label: string; completed: boolean; isFuture?: boolean }[],
  styleTheme?: CardStyleTheme
) {
  const s = (n: number) => Math.round(n * scale);
  const defaultLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const dotCount = 7;
  const colW = width / dotCount;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let i = 0; i < dotCount; i++) {
    const dot = weeklyDots?.[i] || { label: defaultLabels[i], completed: false, isFuture: false };
    const dotX = x + colW * i + colW / 2;

    if (dot.completed) {
      // Glowing Completed Dot
      ctx.fillStyle = styleTheme ? styleTheme.dotActiveBg : theme.accent;
      ctx.beginPath();
      ctx.arc(dotX, y + s(16), 20 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Inner checkmark dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(dotX, y + s(16), 7 * scale, 0, Math.PI * 2);
      ctx.fill();
    } else if (dot.isFuture) {
      // Future day: Faint outline
      ctx.strokeStyle = theme.name === 'Warm Ivory' ? 'rgba(21, 19, 15, 0.15)' : 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.arc(dotX, y + s(16), 17 * scale, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Missed / Uncompleted Day: Dim hollow circle
      ctx.strokeStyle = theme.name === 'Warm Ivory' ? 'rgba(21, 19, 15, 0.28)' : 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(dotX, y + s(16), 17 * scale, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = theme.name === 'Warm Ivory' ? 'rgba(21, 19, 15, 0.25)' : 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(dotX, y + s(16), 4 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Day Label
    ctx.font = `700 ${s(18)}px ${FONT_BODY}`;
    ctx.fillStyle = styleTheme ? styleTheme.dotTextColor : theme.secondaryText;
    ctx.fillText(dot.label, dotX, y + s(54));
  }

  ctx.textAlign = 'left';
}

function renderFooterSignature(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  canvasWidth: number,
  data: FlexCardData,
  theme: ThemeColors,
  scale: number,
  styleTheme?: CardStyleTheme
) {
  const s = (n: number) => Math.round(n * scale);
  const userLabel =
    data.showUser !== false && data.userName && data.userName.trim()
      ? `DISCIPLINE BY ${data.userName.trim().toUpperCase()}`
      : (data.footerLabel || 'HABIT TRACKER ARCHIVE');

  ctx.textBaseline = 'top';
  ctx.font = `700 ${s(15)}px ${FONT_HEAD}`;
  ctx.fillStyle = styleTheme ? styleTheme.footerColor : theme.secondaryText;
  ctx.fillText(userLabel, x, y);

  ctx.textAlign = 'right';
  ctx.font = `700 ${s(14)}px ${FONT_HEAD}`;
  ctx.fillStyle = styleTheme ? styleTheme.footerColor : theme.secondaryText;
  ctx.fillText('HABIT TRACKER', canvasWidth - x, y);
  ctx.textAlign = 'left';
}

/**
 * Exports canvas to Blob
 */
export async function exportCanvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Font loading fallback
    }
  }
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas export failed'));
      },
      'image/png',
      1.0
    );
  });
}

/**
 * Triggers browser file download of the canvas
 */
export async function downloadCanvasAsPng(
  canvas: HTMLCanvasElement,
  filename = 'habit-streak-milestone.png'
) {
  const blob = await exportCanvasToBlob(canvas);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Shares canvas image using native Web Share API on supported devices
 */
export async function shareCanvasImage(
  canvas: HTMLCanvasElement,
  title = 'Milestone Flex Card',
  text = 'Consistency creates momentum. Check out my discipline streak on Habit Tracker!'
): Promise<boolean> {
  try {
    const blob = await exportCanvasToBlob(canvas);
    const file = new File([blob], 'habit-streak-milestone.png', { type: 'image/png' });

    if (
      typeof navigator !== 'undefined' &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({
        title,
        text,
        files: [file],
      });
      return true;
    }
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      console.warn('Native share failed or dismissed:', err);
    }
  }
  return false;
}

/**
 * Copies the canvas image directly to clipboard
 */
export async function copyCanvasImageToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    const blob = await exportCanvasToBlob(canvas);
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.ClipboardItem) {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard image copy failed:', err);
  }
  return false;
}
