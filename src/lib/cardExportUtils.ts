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
  | 'clean'
  | 'grain'
  | 'scanlines'
  | 'starlight'
  | 'mist'
  | 'vignette';

export type FlexCardLighting =
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
  style: 'sphere',
  mood: 'clean',
  lighting: 'rim',
  colour: 'ember',
};

export interface CustomizationOptionItem {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
}

export interface FeaturedPresetItem extends CustomizationOptionItem {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  customization: FlexCardCustomization;
}

export const CATEGORY_TABS: { id: FlexCardCategoryTab; label: string; countLabel: string }[] = [
  { id: 'featured', label: 'Featured', countLabel: '8 Presets' },
  { id: 'styles', label: 'Styles', countLabel: '11 Looks' },
  { id: 'moods', label: 'Moods', countLabel: '6 Textures' },
  { id: 'lighting', label: 'Lighting', countLabel: '6 Setups' },
  { id: 'colours', label: 'Colours', countLabel: '8 Palettes' },
];

export const FEATURED_PRESETS: FeaturedPresetItem[] = [
  {
    id: 'titanium',
    name: 'Titanium Ember',
    subtitle: 'Minimal 3D Orb in volcanic dark',
    badge: 'Popular',
    customization: { style: 'sphere', mood: 'clean', lighting: 'rim', colour: 'ember' },
  },
  {
    id: 'cyberpunk',
    name: 'Cyber Horizon',
    subtitle: 'Retro perspective grid & nodes',
    badge: 'Neon',
    customization: { style: 'cyber', mood: 'scanlines', lighting: 'spotlight', colour: 'cyber' },
  },
  {
    id: 'ivory_luxury',
    name: 'Warm Ceramic',
    subtitle: 'Topographic contour elevation',
    badge: 'Editorial',
    customization: { style: 'topo', mood: 'grain', lighting: 'diffuse', colour: 'ivory' },
  },
  {
    id: 'deep_nebula',
    name: 'Cosmic Astral',
    subtitle: 'Deep star dust clouds & clusters',
    badge: 'Sci-Fi',
    customization: { style: 'nebula', mood: 'starlight', lighting: 'eclipse', colour: 'violet' },
  },
  {
    id: 'solar_eclipse',
    name: 'Solar Corona',
    subtitle: 'Kepler orbital rings & flare',
    badge: 'Dramatic',
    customization: { style: 'orbit', mood: 'vignette', lighting: 'sunburst', colour: 'gold' },
  },
  {
    id: 'boreal',
    name: 'Northern Aurora',
    subtitle: 'Harmonic flowing wave ribbons',
    badge: 'Ambient',
    customization: { style: 'aurora', mood: 'mist', lighting: 'diffuse', colour: 'cobalt' },
  },
  {
    id: 'hologram',
    name: 'Prism Nova',
    subtitle: 'Glass refraction & stardust',
    badge: 'Glass',
    customization: { style: 'prism', mood: 'starlight', lighting: 'rim', colour: 'rose' },
  },
  {
    id: 'monolith',
    name: 'Carbon Stealth',
    subtitle: 'Hexagonal honeycomb lattice',
    badge: 'Minimal',
    customization: { style: 'hex', mood: 'grain', lighting: 'stealth', colour: 'mono' },
  },
];

export const STYLE_OPTIONS: CustomizationOptionItem[] = [
  { id: 'sphere', name: '3D Orb', subtitle: 'Smooth celestial vector sphere', badge: 'Vector 3D' },
  { id: 'pixel', name: '8-Bit Retro', subtitle: 'Arcade pixel gaming matrix', badge: 'Retro' },
  { id: 'nebula', name: 'Deep Nebula', subtitle: 'Cosmic star clusters & dust', badge: 'Cosmic' },
  { id: 'aurora', name: 'Boreal Waves', subtitle: 'Flowing harmonic light ribbons', badge: 'Harmonic' },
  { id: 'cyber', name: 'Cyber Matrix', subtitle: 'Perspective vanishing grid', badge: 'Sci-Fi' },
  { id: 'topo', name: 'Topographic', subtitle: 'Elevation terrain contours', badge: 'Editorial' },
  { id: 'prism', name: 'Prism Glass', subtitle: 'Geometric refraction beams', badge: 'Refraction' },
  { id: 'orbit', name: 'Kepler Orbit', subtitle: 'Nested planetary trajectories', badge: 'Astronomy' },
  { id: 'liquid', name: 'Liquid Mercury', subtitle: 'Organic fluid metallic blobs', badge: 'Fluid' },
  { id: 'hex', name: 'Hex Lattice', subtitle: 'Isometric honeycomb mesh', badge: 'Tech' },
  { id: 'minimal', name: 'Pure Studio', subtitle: 'Clean architectural gradient', badge: 'Clean' },
];

export const MOOD_OPTIONS: CustomizationOptionItem[] = [
  { id: 'clean', name: 'Crystal Clear', subtitle: 'Ultra-crisp 4K vector dots', badge: 'Default' },
  { id: 'grain', name: '35mm Film Grain', subtitle: 'Analogue photographic texture', badge: 'Texture' },
  { id: 'scanlines', name: 'CRT Scanlines', subtitle: 'Phosphor cathode terminal', badge: 'Retro' },
  { id: 'starlight', name: 'Stardust Spark', subtitle: 'Glittering cosmic micro-specks', badge: 'Glimmer' },
  { id: 'mist', name: 'Vapor Mist', subtitle: 'Atmospheric depth glow', badge: 'Soft' },
  { id: 'vignette', name: 'Dark Vignette', subtitle: 'Cinematic perimeter shadow', badge: 'Cinema' },
];

export const LIGHTING_OPTIONS: CustomizationOptionItem[] = [
  { id: 'rim', name: 'Rim Backlight', subtitle: 'Illuminated border glow', badge: 'Studio' },
  { id: 'spotlight', name: 'Key Spotlight', subtitle: 'Focused top-down cone', badge: 'Stage' },
  { id: 'eclipse', name: 'Corona Flare', subtitle: 'Deep central dark disc', badge: 'Dramatic' },
  { id: 'sunburst', name: 'Sunburst Angle', subtitle: 'Radiant corner flare', badge: 'Warm' },
  { id: 'diffuse', name: 'Soft Diffusion', subtitle: 'Uniform balanced softbox', badge: 'Balanced' },
  { id: 'stealth', name: 'Stealth Shadow', subtitle: 'Low-key brooding dark', badge: 'Dark' },
];

export const COLOUR_OPTIONS: (CustomizationOptionItem & { hex: string })[] = [
  { id: 'ember', name: 'Obsidian Ember', subtitle: 'Volcanic orange & carbon black', badge: 'Brand', hex: '#ff5a1f' },
  { id: 'cyber', name: 'Cyber Mint', subtitle: 'Vibrant emerald on dark teal', badge: 'Neon', hex: '#10b981' },
  { id: 'ivory', name: 'Warm Ivory', subtitle: 'Ceramic eggshell & obsidian', badge: 'Light', hex: '#ff5a1f' },
  { id: 'violet', name: 'Astral Violet', subtitle: 'Electric purple on midnight', badge: 'Deep', hex: '#a855f7' },
  { id: 'cobalt', name: 'Deep Cobalt', subtitle: 'Ocean cyan on navy abyssal', badge: 'Vibrant', hex: '#06b6d4' },
  { id: 'gold', name: 'Royal Gold', subtitle: 'Gilded yellow on onyx gold', badge: 'Luxury', hex: '#eab308' },
  { id: 'rose', name: 'Neon Rose', subtitle: 'Vivid magenta on plum noir', badge: 'Vivid', hex: '#f43f5e' },
  { id: 'mono', name: 'Monolith B&W', subtitle: 'Pure monochrome contrast', badge: 'Minimal', hex: '#ffffff' },
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

/**
 * Draws rounded rectangle path on canvas
 */
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

  // 1. Base Gradient
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, theme.backgroundStart);
  bgGradient.addColorStop(1, theme.backgroundEnd);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  ctx.save();

  // 2. Lighting Profile
  switch (customization.lighting) {
    case 'spotlight': {
      const spotX = width * 0.5;
      const spotY = 0;
      const spotRad = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, height * 0.85);
      spotRad.addColorStop(0, theme.accentGlow);
      spotRad.addColorStop(0.45, theme.accentGlow.replace(/[\d.]+\)$/, '0.12)'));
      spotRad.addColorStop(1, 'transparent');
      ctx.fillStyle = spotRad;
      ctx.fillRect(0, 0, width, height);
      break;
    }
    case 'eclipse': {
      const ecX = width * 0.5;
      const ecY = format === 'landscape' ? height * 0.45 : height * 0.38;
      const ecR = Math.min(width, height) * 0.28;
      const flare = ctx.createRadialGradient(ecX, ecY, ecR * 0.85, ecX, ecY, ecR * 1.8);
      flare.addColorStop(0, theme.accent);
      flare.addColorStop(0.35, theme.accentGlow);
      flare.addColorStop(1, 'transparent');
      ctx.fillStyle = flare;
      ctx.fillRect(0, 0, width, height);
      // Dark central occlusion disk
      ctx.fillStyle = theme.backgroundStart;
      ctx.beginPath();
      ctx.arc(ecX, ecY, ecR * 0.9, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'sunburst': {
      const sunX = width * 0.92;
      const sunY = height * 0.08;
      const sunRad = ctx.createRadialGradient(sunX, sunY, s(20), sunX, sunY, width * 0.9);
      sunRad.addColorStop(0, theme.accent);
      sunRad.addColorStop(0.28, theme.accentGlow);
      sunRad.addColorStop(1, 'transparent');
      ctx.fillStyle = sunRad;
      ctx.fillRect(0, 0, width, height);
      break;
    }
    case 'diffuse': {
      const d1X = width * 0.25;
      const d1Y = height * 0.3;
      const g1 = ctx.createRadialGradient(d1X, d1Y, 0, d1X, d1Y, width * 0.65);
      g1.addColorStop(0, theme.accentGlow);
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, width, height);

      const d2X = width * 0.75;
      const d2Y = height * 0.72;
      const g2 = ctx.createRadialGradient(d2X, d2Y, 0, d2X, d2Y, width * 0.65);
      g2.addColorStop(0, theme.accentGlow);
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, width, height);
      break;
    }
    case 'stealth': {
      const stX = width * 0.5;
      const stY = height * 0.5;
      const stRad = ctx.createRadialGradient(stX, stY, s(20), stX, stY, width * 0.5);
      stRad.addColorStop(0, theme.accentGlow.replace(/[\d.]+\)$/, '0.15)'));
      stRad.addColorStop(1, 'transparent');
      ctx.fillStyle = stRad;
      ctx.fillRect(0, 0, width, height);
      break;
    }
    case 'rim':
    default: {
      const rX1 = format === 'landscape' ? width * 0.2 : width * 0.3;
      const rY1 = format === 'landscape' ? height * 0.35 : height * 0.22;
      const rad1 = ctx.createRadialGradient(rX1, rY1, s(10), rX1, rY1, width * 0.55);
      rad1.addColorStop(0, theme.accentGlow);
      rad1.addColorStop(1, 'transparent');
      ctx.fillStyle = rad1;
      ctx.fillRect(0, 0, width, height);

      const rX2 = format === 'landscape' ? width * 0.82 : width * 0.75;
      const rY2 = format === 'landscape' ? height * 0.7 : height * 0.78;
      const rad2 = ctx.createRadialGradient(rX2, rY2, s(10), rX2, rY2, width * 0.55);
      rad2.addColorStop(0, theme.accentGlow);
      rad2.addColorStop(1, 'transparent');
      ctx.fillStyle = rad2;
      ctx.fillRect(0, 0, width, height);
      break;
    }
  }

  // 3. Procedural Style Vector Graphics
  ctx.save();
  switch (customization.style) {
    case 'sphere': {
      const orbX = width * 0.5;
      const orbY = format === 'landscape' ? height * 0.5 : height * 0.38;
      const orbR = Math.min(width, height) * (format === 'landscape' ? 0.32 : 0.28);

      const sphereGrad = ctx.createRadialGradient(
        orbX - orbR * 0.35,
        orbY - orbR * 0.35,
        orbR * 0.05,
        orbX,
        orbY,
        orbR
      );
      sphereGrad.addColorStop(0, theme.accent);
      sphereGrad.addColorStop(0.45, theme.accentGlow);
      sphereGrad.addColorStop(0.85, theme.backgroundStart);
      sphereGrad.addColorStop(1, 'rgba(0,0,0,0.85)');

      ctx.beginPath();
      ctx.arc(orbX, orbY, orbR, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.fill();

      // Specular Highlight Crescent
      ctx.beginPath();
      ctx.arc(orbX - orbR * 0.32, orbY - orbR * 0.32, orbR * 0.22, 0, Math.PI * 2);
      const specGrad = ctx.createRadialGradient(
        orbX - orbR * 0.32,
        orbY - orbR * 0.32,
        0,
        orbX - orbR * 0.32,
        orbY - orbR * 0.32,
        orbR * 0.22
      );
      specGrad.addColorStop(0, 'rgba(255,255,255,0.7)');
      specGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = specGrad;
      ctx.fill();

      // Ambient outer halo
      ctx.strokeStyle = theme.accentGlow;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(orbX, orbY, orbR + s(14), 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'pixel': {
      const pxSize = s(36);
      const startX = s(24);
      const startY = s(24);
      for (let x = startX; x < width - s(24); x += pxSize) {
        for (let y = startY; y < height - s(24); y += pxSize) {
          const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
          const val = hash - Math.floor(hash);
          if (val > 0.82) {
            ctx.fillStyle = val > 0.94 ? theme.accent : theme.accentGlow;
            ctx.fillRect(x + s(2), y + s(2), pxSize - s(4), pxSize - s(4));
          } else if (val > 0.65) {
            ctx.fillStyle = 'rgba(255,255,255,0.025)';
            ctx.fillRect(x + s(2), y + s(2), pxSize - s(4), pxSize - s(4));
          }
        }
      }
      break;
    }

    case 'nebula': {
      const puffs = [
        { x: width * 0.3, y: height * 0.25, r: width * 0.45, alpha: 0.35 },
        { x: width * 0.7, y: height * 0.5, r: width * 0.5, alpha: 0.3 },
        { x: width * 0.4, y: height * 0.75, r: width * 0.4, alpha: 0.25 },
      ];
      for (const puff of puffs) {
        const pGrad = ctx.createRadialGradient(puff.x, puff.y, s(20), puff.x, puff.y, puff.r);
        pGrad.addColorStop(0, theme.accentGlow);
        pGrad.addColorStop(0.5, theme.accentGlow.replace(/[\d.]+\)$/, `${puff.alpha * 0.4})`));
        pGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(puff.x, puff.y, puff.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = theme.primaryText;
      for (let i = 0; i < 90; i++) {
        const sx = (i * 137.5) % width;
        const sy = (i * 243.7) % height;
        const sr = (i % 3 === 0 ? 2 : 1) * scale;
        ctx.globalAlpha = 0.2 + (i % 5) * 0.15;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;
    }

    case 'aurora': {
      const waveCount = 5;
      for (let w = 0; w < waveCount; w++) {
        const baseY = height * (0.2 + w * 0.14);
        ctx.beginPath();
        ctx.moveTo(0, baseY);
        for (let x = 0; x <= width; x += s(30)) {
          const angle = (x / width) * Math.PI * 2.5 + w * 1.2;
          const yOffset = Math.sin(angle) * s(110) + Math.cos(angle * 1.5) * s(40);
          ctx.lineTo(x, baseY + yOffset);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const aGrad = ctx.createLinearGradient(0, baseY - s(120), 0, baseY + s(300));
        aGrad.addColorStop(0, 'transparent');
        aGrad.addColorStop(0.3, theme.accentGlow);
        aGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = aGrad;
        ctx.globalAlpha = 0.45;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;
    }

    case 'cyber': {
      const horizonY = height * 0.45;
      const vanishX = width * 0.5;
      ctx.strokeStyle = theme.cardBorder;
      ctx.lineWidth = 1.2 * scale;
      const rayCount = 14;
      for (let i = 0; i <= rayCount; i++) {
        const bottomX = (width / rayCount) * i;
        ctx.beginPath();
        ctx.moveTo(vanishX, horizonY);
        ctx.lineTo(bottomX, height);
        ctx.stroke();
      }
      for (let step = 0; step < 10; step++) {
        const ratio = Math.pow(step / 10, 2);
        const y = horizonY + (height - horizonY) * ratio;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      for (let i = 0; i < 16; i++) {
        const nx = (i * 179) % width;
        const ny = (i * 83) % horizonY;
        ctx.fillStyle = theme.accent;
        ctx.beginPath();
        ctx.arc(nx, ny, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'topo': {
      ctx.strokeStyle = theme.accentGlow;
      ctx.lineWidth = 1.6 * scale;
      const numLines = 14;
      for (let i = 0; i < numLines; i++) {
        const yCenter = height * (0.1 + (i / numLines) * 0.85);
        ctx.beginPath();
        ctx.moveTo(0, yCenter);
        for (let x = 0; x <= width; x += s(40)) {
          const cy = yCenter + Math.sin((x / width) * 5 + i * 0.6) * s(45) + Math.cos((x / width) * 2.8 + i) * s(25);
          ctx.lineTo(x, cy);
        }
        ctx.globalAlpha = 0.35 + (i % 3) * 0.15;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      break;
    }

    case 'prism': {
      const bands = 5;
      ctx.save();
      ctx.rotate(-0.25);
      for (let b = 0; b < bands; b++) {
        const bx = -width * 0.2 + (width * 1.4 / bands) * b;
        const bGrad = ctx.createLinearGradient(bx, 0, bx + s(140), 0);
        bGrad.addColorStop(0, 'transparent');
        bGrad.addColorStop(0.5, b % 2 === 0 ? theme.accentGlow : 'rgba(255,255,255,0.08)');
        bGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = bGrad;
        ctx.fillRect(bx, -height * 0.5, s(160), height * 2);
      }
      ctx.restore();
      break;
    }

    case 'orbit': {
      const cx = width * 0.5;
      const cy = format === 'landscape' ? height * 0.5 : height * 0.42;
      const rings = [s(140), s(240), s(360), s(520)];
      ctx.strokeStyle = theme.cardBorder;
      ctx.lineWidth = 1.4 * scale;

      rings.forEach((r, idx) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 0.55, -0.3, 0, Math.PI * 2);
        ctx.stroke();

        const angle = idx * 1.6 + 0.8;
        const satX = cx + Math.cos(angle) * r;
        const satY = cy + Math.sin(angle) * (r * 0.55);
        ctx.fillStyle = theme.accent;
        ctx.beginPath();
        ctx.arc(satX, satY, (idx === 1 ? 5 : 3.5) * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      const starGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, s(50));
      starGrad.addColorStop(0, theme.accent);
      starGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = starGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, s(50), 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'liquid': {
      const blobs = [
        { x: width * 0.25, y: height * 0.32, r: s(180) },
        { x: width * 0.72, y: height * 0.38, r: s(220) },
        { x: width * 0.5, y: height * 0.7, r: s(240) },
      ];
      blobs.forEach((b) => {
        const lGrad = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, s(10), b.x, b.y, b.r);
        lGrad.addColorStop(0, theme.accentGlow);
        lGrad.addColorStop(0.7, theme.accentGlow.replace(/[\d.]+\)$/, '0.08)'));
        lGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = lGrad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = theme.cardBorder;
        ctx.lineWidth = 1.5 * scale;
        ctx.stroke();
      });
      break;
    }

    case 'hex': {
      const hexR = s(38);
      const hexW = hexR * Math.sqrt(3);
      const hexH = hexR * 1.5;
      ctx.strokeStyle = theme.cardBorder;
      ctx.lineWidth = 1 * scale;
      for (let y = s(20); y < height; y += hexH) {
        const row = Math.floor(y / hexH);
        const offsetX = (row % 2) * (hexW / 2);
        for (let x = -hexW; x < width + hexW; x += hexW) {
          const hx = x + offsetX;
          const hy = y;
          ctx.beginPath();
          for (let a = 0; a < 6; a++) {
            const rad = (Math.PI / 3) * a + Math.PI / 6;
            const px = hx + hexR * Math.cos(rad);
            const py = hy + hexR * Math.sin(rad);
            if (a === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      break;
    }

    case 'minimal':
    default: {
      break;
    }
  }
  ctx.restore();

  // 4. Mood Texture Overlay
  switch (customization.mood) {
    case 'grain': {
      ctx.fillStyle = theme.colour === 'ivory' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
      const grainStep = s(16);
      for (let x = 0; x < width; x += grainStep) {
        for (let y = 0; y < height; y += grainStep) {
          const hash = Math.sin(x * 19.123 + y * 97.456) * 43758.5453;
          if (hash - Math.floor(hash) > 0.55) {
            ctx.fillRect(x, y, 1.8 * scale, 1.8 * scale);
          }
        }
      }
      break;
    }
    case 'scanlines': {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      const lineH = Math.max(1, Math.round(2 * scale));
      const lineGap = Math.max(2, Math.round(5 * scale));
      for (let y = 0; y < height; y += lineH + lineGap) {
        ctx.fillRect(0, y, width, lineH);
      }
      break;
    }
    case 'starlight': {
      const starCount = 36;
      for (let i = 0; i < starCount; i++) {
        const sx = ((i * 193.3) % (width - s(120))) + s(60);
        const sy = ((i * 311.7) % (height - s(120))) + s(60);
        const slen = i % 2 === 0 ? s(12) : s(8);
        ctx.strokeStyle = theme.accent;
        ctx.lineWidth = 1.2 * scale;
        ctx.globalAlpha = 0.45 + (i % 4) * 0.15;
        ctx.beginPath();
        ctx.moveTo(sx - slen, sy);
        ctx.lineTo(sx + slen, sy);
        ctx.moveTo(sx, sy - slen);
        ctx.lineTo(sx, sy + slen);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      break;
    }
    case 'mist': {
      const mGrad = ctx.createLinearGradient(0, height * 0.4, 0, height);
      mGrad.addColorStop(0, 'transparent');
      mGrad.addColorStop(0.5, theme.accentGlow.replace(/[\d.]+\)$/, '0.12)'));
      mGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = mGrad;
      ctx.fillRect(0, 0, width, height);
      break;
    }
    case 'vignette': {
      const vGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        Math.min(width, height) * 0.4,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.75
      );
      vGrad.addColorStop(0, 'transparent');
      vGrad.addColorStop(1, 'rgba(0,0,0,0.72)');
      ctx.fillStyle = vGrad;
      ctx.fillRect(0, 0, width, height);
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
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1.5 * scale;
  roundRect(ctx, outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2, s(36));
  ctx.stroke();

  ctx.restore();
}

/**
 * Main Canvas Render Function
 * Renders authentic, native 4K Ultra HD graphics directly into the canvas pixel buffer
 * with zero font atlas downsampling and maximum vector clarity.
 */
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
    renderStoryLayout(ctx, width, height, data, theme, scale);
  } else if (format === 'square') {
    renderSquareLayout(ctx, width, height, data, theme, scale);
  } else {
    renderLandscapeLayout(ctx, width, height, data, theme, scale);
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
  scale: number
) {
  const s = (n: number) => Math.round(n * scale);
  const padX = s(100);
  const contentW = width - padX * 2;

  // 1. Header Bar
  const headerY = s(140);
  renderHeaderBrand(ctx, padX, headerY, width, data.dateStr, theme, scale);

  // 2. Milestone Pill Badge
  const badgeY = s(250);
  renderBadgePill(ctx, padX, badgeY, data.badgeText, theme, scale);

  // 3. Hero Big Number
  const heroY = s(350);
  const valStr = String(data.metricValue);
  const numFontSize = s(185);
  ctx.font = `700 ${numFontSize}px ${FONT_HEAD}`;
  ctx.fillStyle = theme.primaryText;
  ctx.textBaseline = 'top';
  ctx.fillText(valStr, padX, heroY);

  const numWidth = ctx.measureText(valStr).width;

  // Unit text beside number
  if (data.metricUnit) {
    const unitLines = wrapText(ctx, data.metricUnit.toUpperCase(), s(380));
    ctx.font = `700 ${s(42)}px ${FONT_HEAD}`;
    ctx.fillStyle = theme.accent;
    let uY = heroY + s(32);
    for (const uL of unitLines) {
      ctx.fillText(uL, padX + numWidth + s(24), uY);
      uY += s(46);
    }
  }

  // Title Label
  const labelY = heroY + numFontSize + s(12);
  ctx.font = `700 ${s(42)}px ${FONT_HEAD}`;
  ctx.fillStyle = theme.primaryText;
  const titleLines = wrapText(ctx, data.title || 'Consistency Milestone', contentW);
  let curLabelY = labelY;
  for (const tL of titleLines.slice(0, 2)) {
    ctx.fillText(tL, padX, curLabelY);
    curLabelY += s(50);
  }

  // Subtitle
  const subLines = wrapText(ctx, data.subtitle || data.metricLabel, contentW);
  ctx.font = `500 ${s(24)}px ${FONT_BODY}`;
  ctx.fillStyle = theme.secondaryText;
  let curSubY = curLabelY + s(12);
  for (const sL of subLines.slice(0, 2)) {
    ctx.fillText(sL, padX, curSubY);
    curSubY += s(34);
  }

  // 4. 7-Day Consistency Dot Matrix
  const dotsY = Math.max(s(730), curSubY + s(36));
  renderWeeklyConsistencyDots(ctx, padX, dotsY, contentW, theme, scale, data.weeklyDots);

  // 5. Dual Bento Stats Grid
  const bentoY = dotsY + s(120);
  const bentoW = (contentW - s(28)) / 2;
  const bentoH = s(220);

  // Bento Box 1: Routine / Target
  ctx.fillStyle = theme.cardBg;
  roundRect(ctx, padX, bentoY, bentoW, bentoH, s(26));
  ctx.fill();
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1.5 * scale;
  ctx.stroke();

  ctx.font = `600 ${s(16)}px ${FONT_BODY}`;
  ctx.fillStyle = theme.secondaryText;
  ctx.fillText(data.bentoLabel || 'TARGET ROUTINE', padX + s(28), bentoY + s(36));

  ctx.font = `700 ${s(28)}px ${FONT_HEAD}`;
  ctx.fillStyle = theme.primaryText;
  const habitStr = truncateText(ctx, data.habitTitle || 'Core Habit Stack', bentoW - s(56));
  ctx.fillText(habitStr, padX + s(28), bentoY + s(84));

  // Routine badge chip inside bento 1
  const tagText = (data.routineTag || 'Daily Discipline').toUpperCase();
  ctx.font = `700 ${s(15)}px ${FONT_BODY}`;
  const measuredTagW = ctx.measureText(tagText).width + s(36);
  const chipW = Math.min(bentoW - s(56), Math.max(s(140), measuredTagW));
  ctx.fillStyle = theme.pillBg;
  roundRect(ctx, padX + s(28), bentoY + s(135), chipW, s(42), s(14));
  ctx.fill();
  ctx.fillStyle = theme.pillText;
  ctx.fillText(truncateText(ctx, tagText, chipW - s(24)), padX + s(44), bentoY + s(162));

  // Bento Box 2: Adherence Index
  const bento2X = padX + bentoW + s(28);
  ctx.fillStyle = theme.cardBg;
  roundRect(ctx, bento2X, bentoY, bentoW, bentoH, s(26));
  ctx.fill();
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1.5 * scale;
  ctx.stroke();

  ctx.font = `600 ${s(16)}px ${FONT_BODY}`;
  ctx.fillStyle = theme.secondaryText;
  ctx.fillText('ADHERENCE INDEX', bento2X + s(28), bentoY + s(36));

  const pct = Math.min(100, Math.max(0, Math.round(data.completionRate ?? 0)));
  ctx.font = `700 ${s(48)}px ${FONT_HEAD}`;
  ctx.fillStyle = theme.accent;
  ctx.fillText(`${pct}%`, bento2X + s(28), bentoY + s(92));

  ctx.font = `500 ${s(16)}px ${FONT_BODY}`;
  ctx.fillStyle = theme.secondaryText;
  ctx.fillText(data.adherenceLabel || 'Monthly Logged', bento2X + s(28), bentoY + s(132));

  // Mini progress track in bento 2
  ctx.fillStyle = theme.progressTrack;
  roundRect(ctx, bento2X + s(28), bentoY + s(162), bentoW - s(56), s(12), s(6));
  ctx.fill();
  ctx.fillStyle = theme.accent;
  roundRect(ctx, bento2X + s(28), bentoY + s(162), (bentoW - s(56)) * (pct / 100), s(12), s(6));
  ctx.fill();

  // 6. Wisdom Quote Capsule or Dynamic Performance Breakdown Box
  const quoteY = bentoY + bentoH + s(45);
  const quoteH = s(340);

  if (data.showQuote !== false) {
    ctx.fillStyle = theme.quoteBoxBg;
    roundRect(ctx, padX, quoteY, contentW, quoteH, s(28));
    ctx.fill();
    ctx.strokeStyle = theme.quoteBoxBorder;
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();

    // Large quotation icon mark
    ctx.font = `700 ${s(64)}px ${FONT_SERIF}`;
    ctx.fillStyle = theme.accent;
    ctx.fillText('“', padX + s(36), quoteY + s(32));

    const qText = data.quote || 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.';
    const qAuthor = data.quoteAuthor || 'Aristotle';

    ctx.font = `italic 500 ${s(29)}px ${FONT_SERIF}`;
    ctx.fillStyle = theme.primaryText;
    const qLines = wrapText(ctx, qText, contentW - s(80));

    let qTextY = quoteY + s(95);
    for (const line of qLines.slice(0, 3)) {
      ctx.fillText(line, padX + s(40), qTextY);
      qTextY += s(44);
    }

    ctx.font = `700 ${s(20)}px ${FONT_BODY}`;
    ctx.fillStyle = theme.accent;
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
  ctx.strokeStyle = theme.name === 'Warm Ivory' ? 'rgba(21, 19, 15, 0.12)' : 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.moveTo(padX, height - s(140));
  ctx.lineTo(width - padX, height - s(140));
  ctx.stroke();

  // 8. Footer Signature
  const footerY = height - s(95);
  renderFooterSignature(ctx, padX, footerY, width, data, theme, scale);
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
  scale: number
) {
  const s = (n: number) => Math.round(n * scale);
  const padX = s(85);
  const contentW = width - padX * 2;

  // Header Bar
  const headerY = s(85);
  renderHeaderBrand(ctx, padX, headerY, width, data.dateStr, theme, scale);

  // Milestone Pill Badge
  const badgeY = s(175);
  renderBadgePill(ctx, padX, badgeY, data.badgeText, theme, scale);

  // Hero Big Number & Unit
  const heroY = s(255);
  const valStr = String(data.metricValue);
  const numFontSize = s(135);
  ctx.font = `700 ${numFontSize}px ${FONT_HEAD}`;
  ctx.fillStyle = theme.primaryText;
  ctx.textBaseline = 'top';
  ctx.fillText(valStr, padX, heroY);

  const numWidth = ctx.measureText(valStr).width;

  if (data.metricUnit) {
    ctx.font = `700 ${s(36)}px ${FONT_HEAD}`;
    ctx.fillStyle = theme.accent;
    ctx.fillText(data.metricUnit.toUpperCase(), padX + numWidth + s(20), heroY + s(24));
  }

  // Title
  const labelY = heroY + numFontSize + s(8);
  ctx.font = `700 ${s(34)}px ${FONT_HEAD}`;
  ctx.fillStyle = theme.primaryText;
  const titleStr = truncateText(ctx, data.title || 'Consistency Milestone', contentW);
  ctx.fillText(titleStr, padX, labelY);

  // Subtitle
  const subY = labelY + s(42);
  ctx.font = `500 ${s(20)}px ${FONT_BODY}`;
  ctx.fillStyle = theme.secondaryText;
  const subStr = truncateText(ctx, data.subtitle || data.metricLabel, contentW);
  ctx.fillText(subStr, padX, subY);

  // Bento Stats Row
  const statsY = subY + s(46);
  const statsH = s(130);
  ctx.fillStyle = theme.cardBg;
  roundRect(ctx, padX, statsY, contentW, statsH, s(22));
  ctx.fill();
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1.5 * scale;
  ctx.stroke();

  // Inside Stats Row: Routine on Left, Adherence on Right
  ctx.font = `600 ${s(15)}px ${FONT_BODY}`;
  ctx.fillStyle = theme.secondaryText;
  ctx.fillText(data.bentoLabel || 'TARGET ROUTINE', padX + s(26), statsY + s(36));

  ctx.font = `700 ${s(26)}px ${FONT_HEAD}`;
  ctx.fillStyle = theme.primaryText;
  const habitStr = truncateText(ctx, data.habitTitle || 'Core Daily Stack', contentW * 0.55);
  ctx.fillText(habitStr, padX + s(26), statsY + s(76));

  // Right Stat
  const rightX = padX + contentW - s(26);
  ctx.textAlign = 'right';
  ctx.font = `600 ${s(15)}px ${FONT_BODY}`;
  ctx.fillStyle = theme.secondaryText;
  ctx.fillText('ADHERENCE', rightX, statsY + s(36));

  const pct = Math.min(100, Math.max(0, Math.round(data.completionRate ?? 0)));
  ctx.font = `700 ${s(36)}px ${FONT_HEAD}`;
  ctx.fillStyle = theme.accent;
  ctx.fillText(`${pct}%`, rightX, statsY + s(74));

  if (data.adherenceLabel) {
    ctx.font = `500 ${s(13)}px ${FONT_BODY}`;
    ctx.fillStyle = theme.secondaryText;
    ctx.fillText(truncateText(ctx, data.adherenceLabel, contentW * 0.45), rightX, statsY + s(98));
  }
  ctx.textAlign = 'left';

  // Wisdom Quote or Mini Capsule (Fits cleanly without collision)
  if (data.showQuote !== false) {
    const quoteY = statsY + statsH + s(28);
    const quoteH = s(160);

    ctx.fillStyle = theme.quoteBoxBg;
    roundRect(ctx, padX, quoteY, contentW, quoteH, s(22));
    ctx.fill();
    ctx.strokeStyle = theme.quoteBoxBorder;
    ctx.lineWidth = 1.2 * scale;
    ctx.stroke();

    const qText = data.quote || 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.';
    const qAuthor = data.quoteAuthor || 'Aristotle';

    ctx.font = `italic 500 ${s(22)}px ${FONT_SERIF}`;
    ctx.fillStyle = theme.primaryText;
    const qLines = wrapText(ctx, `“${qText}”`, contentW - s(52));

    let qY = quoteY + s(36);
    for (const qL of qLines.slice(0, 2)) {
      ctx.fillText(qL, padX + s(26), qY);
      qY += s(32);
    }

    ctx.font = `600 ${s(16)}px ${FONT_BODY}`;
    ctx.fillStyle = theme.accent;
    ctx.fillText(`— ${qAuthor}`, padX + s(26), quoteY + quoteH - s(26));
  } else {
    const dotsY = statsY + statsH + s(40);
    renderWeeklyConsistencyDots(ctx, padX, dotsY, contentW, theme, scale, data.weeklyDots);
  }

  // Divider Line
  ctx.strokeStyle = theme.name === 'Warm Ivory' ? 'rgba(21, 19, 15, 0.12)' : 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.moveTo(padX, height - s(90));
  ctx.lineTo(width - padX, height - s(90));
  ctx.stroke();

  // Footer Signature
  const footerY = height - s(60);
  renderFooterSignature(ctx, padX, footerY, width, data, theme, scale);
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
  scale: number
) {
  const s = (n: number) => Math.round(n * scale);
  const padX = s(70);
  const colW = (width - padX * 2 - s(40)) / 2;

  // Header Bar across top
  const headerY = s(65);
  renderHeaderBrand(ctx, padX, headerY, width, data.dateStr, theme, scale);

  // Left Column: Milestone Badge & Hero Metric
  const leftX = padX;
  const leftY = s(145);

  renderBadgePill(ctx, leftX, leftY, data.badgeText, theme, scale);

  const heroY = leftY + s(55);
  const valStr = String(data.metricValue);
  const numFontSize = s(100);
  ctx.font = `700 ${numFontSize}px ${FONT_HEAD}`;
  ctx.fillStyle = theme.primaryText;
  ctx.textBaseline = 'top';
  ctx.fillText(valStr, leftX, heroY);

  const numWidth = ctx.measureText(valStr).width;

  if (data.metricUnit) {
    ctx.font = `700 ${s(28)}px ${FONT_HEAD}`;
    ctx.fillStyle = theme.accent;
    ctx.fillText(data.metricUnit.toUpperCase(), leftX + numWidth + s(14), heroY + s(18));
  }

  const labelY = heroY + numFontSize + s(6);
  ctx.font = `700 ${s(26)}px ${FONT_HEAD}`;
  ctx.fillStyle = theme.primaryText;
  const titleStr = truncateText(ctx, data.title || 'Consistency Milestone', colW);
  ctx.fillText(titleStr, leftX, labelY);

  const subY = labelY + s(34);
  ctx.font = `500 ${s(17)}px ${FONT_BODY}`;
  ctx.fillStyle = theme.secondaryText;
  const subStr = truncateText(ctx, data.subtitle || data.metricLabel, colW);
  ctx.fillText(subStr, leftX, subY);

  // Right Column: Stats Card + Wisdom Quote Bento
  const rightX = padX + colW + s(40);
  const cardY = leftY;
  const cardH = s(140);

  ctx.fillStyle = theme.cardBg;
  roundRect(ctx, rightX, cardY, colW, cardH, s(20));
  ctx.fill();
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1.5 * scale;
  ctx.stroke();

  // Inside Right Card
  ctx.font = `600 ${s(13)}px ${FONT_BODY}`;
  ctx.fillStyle = theme.secondaryText;
  ctx.fillText(data.bentoLabel || 'TARGET ROUTINE', rightX + s(22), cardY + s(28));

  ctx.font = `700 ${s(22)}px ${FONT_HEAD}`;
  ctx.fillStyle = theme.primaryText;
  const habitStr = truncateText(ctx, data.habitTitle || 'Core Daily Stack', colW - s(44));
  ctx.fillText(habitStr, rightX + s(22), cardY + s(60));

  const pct = Math.min(100, Math.max(0, Math.round(data.completionRate ?? 0)));
  ctx.font = `600 ${s(13)}px ${FONT_BODY}`;
  ctx.fillStyle = theme.secondaryText;
  ctx.fillText('ADHERENCE SCORE', rightX + s(22), cardY + s(95));

  ctx.font = `700 ${s(20)}px ${FONT_HEAD}`;
  ctx.fillStyle = theme.accent;
  const adhText = data.adherenceLabel ? `${pct}% (${data.adherenceLabel})` : `${pct}% Logged`;
  ctx.fillText(truncateText(ctx, adhText, colW - s(160)), rightX + s(150), cardY + s(96));

  // Right Quote Box
  if (data.showQuote !== false) {
    const qBoxY = cardY + cardH + s(18);
    const qBoxH = s(145);

    ctx.fillStyle = theme.quoteBoxBg;
    roundRect(ctx, rightX, qBoxY, colW, qBoxH, s(20));
    ctx.fill();
    ctx.strokeStyle = theme.quoteBoxBorder;
    ctx.lineWidth = 1.2 * scale;
    ctx.stroke();

    const qText = data.quote || 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.';
    const qAuthor = data.quoteAuthor || 'Aristotle';

    ctx.font = `italic 500 ${s(17)}px ${FONT_SERIF}`;
    ctx.fillStyle = theme.primaryText;
    const qLines = wrapText(ctx, `“${qText}”`, colW - s(40));

    let qY = qBoxY + s(28);
    for (const qL of qLines.slice(0, 2)) {
      ctx.fillText(qL, rightX + s(20), qY);
      qY += s(26);
    }

    ctx.font = `600 ${s(14)}px ${FONT_BODY}`;
    ctx.fillStyle = theme.accent;
    ctx.fillText(`— ${qAuthor}`, rightX + s(20), qBoxY + qBoxH - s(20));
  } else {
    const dotsY = cardY + cardH + s(25);
    renderWeeklyConsistencyDots(ctx, rightX, dotsY, colW, theme, scale, data.weeklyDots);
  }

  // Divider Line
  ctx.strokeStyle = theme.name === 'Warm Ivory' ? 'rgba(21, 19, 15, 0.12)' : 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.moveTo(padX, height - s(65));
  ctx.lineTo(width - padX, height - s(65));
  ctx.stroke();

  // Footer Signature across bottom
  const footerY = height - s(42);
  renderFooterSignature(ctx, padX, footerY, width, data, theme, scale);
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
  scale: number
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
  ctx.fillStyle = theme.primaryText;
  ctx.fillText('HABIT TRACKER', x + chipSize + s(16), y + chipSize / 2);

  if (dateStr) {
    ctx.textAlign = 'right';
    ctx.font = `600 ${s(22)}px ${FONT_BODY}`;
    ctx.fillStyle = theme.secondaryText;
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
  scale: number
) {
  const s = (n: number) => Math.round(n * scale);
  const badgeLabel = (text || 'MILESTONE UNLOCKED').toUpperCase();
  ctx.font = `700 ${s(22)}px ${FONT_HEAD}`;
  const badgeW = ctx.measureText(badgeLabel).width + s(48);
  const badgeH = s(48);

  ctx.fillStyle = theme.pillBg;
  roundRect(ctx, x, y, badgeW, badgeH, s(24));
  ctx.fill();
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 2 * scale;
  ctx.stroke();

  ctx.fillStyle = theme.pillText;
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
  weeklyDots?: { label: string; completed: boolean; isFuture?: boolean }[]
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
      ctx.fillStyle = theme.accent;
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
    ctx.fillStyle = theme.secondaryText;
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
  scale: number
) {
  const s = (n: number) => Math.round(n * scale);
  const userLabel =
    data.showUser !== false && data.userName && data.userName.trim()
      ? `DISCIPLINE BY ${data.userName.trim().toUpperCase()}`
      : (data.footerLabel || 'HABIT TRACKER ARCHIVE');

  ctx.textBaseline = 'top';
  ctx.font = `700 ${s(15)}px ${FONT_HEAD}`;
  ctx.fillStyle = theme.secondaryText;
  ctx.fillText(userLabel, x, y);

  ctx.textAlign = 'right';
  ctx.font = `700 ${s(14)}px ${FONT_HEAD}`;
  ctx.fillStyle = theme.secondaryText;
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
