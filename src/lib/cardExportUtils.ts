/**
 * Canvas Rendering and Social Share Engine for Milestone Flex Cards (Drop 2)
 * High-performance, high-DPI canvas graphics with responsive format-adaptive layouts.
 */

export type FlexCardFormat = 'story' | 'square' | 'landscape';
export type FlexCardTheme = 'obsidian' | 'ivory' | 'ember' | 'cyber' | 'mono';

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
}

export const FLEX_CARD_THEMES: Record<FlexCardTheme, ThemeColors> = {
  obsidian: {
    name: 'Obsidian Midnight',
    backgroundStart: '#11100d',
    backgroundEnd: '#1a1814',
    accent: '#ff5a1f',
    accentGlow: 'rgba(255, 90, 31, 0.32)',
    primaryText: '#fbf8f1',
    secondaryText: 'rgba(251, 248, 241, 0.62)',
    cardBg: 'rgba(28, 26, 22, 0.88)',
    cardBorder: 'rgba(255, 90, 31, 0.28)',
    pillBg: 'rgba(255, 90, 31, 0.16)',
    pillText: '#ff5a1f',
    progressTrack: 'rgba(251, 248, 241, 0.1)',
    quoteBoxBg: 'rgba(21, 19, 15, 0.75)',
    quoteBoxBorder: 'rgba(251, 248, 241, 0.12)',
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
  },
  ember: {
    name: 'Ember Radiant',
    backgroundStart: '#1b0903',
    backgroundEnd: '#341206',
    accent: '#ff5a1f',
    accentGlow: 'rgba(255, 90, 31, 0.48)',
    primaryText: '#fff7f2',
    secondaryText: 'rgba(255, 225, 210, 0.75)',
    cardBg: 'rgba(52, 18, 6, 0.85)',
    cardBorder: 'rgba(255, 90, 31, 0.38)',
    pillBg: 'rgba(255, 90, 31, 0.26)',
    pillText: '#ff7e47',
    progressTrack: 'rgba(255, 255, 255, 0.12)',
    quoteBoxBg: 'rgba(40, 14, 5, 0.75)',
    quoteBoxBorder: 'rgba(255, 90, 31, 0.25)',
  },
  cyber: {
    name: 'Cyber Mint',
    backgroundStart: '#051612',
    backgroundEnd: '#09251e',
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
  },
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
 * Main Canvas Render Function
 * Renders authentic, native 4K Ultra HD graphics directly into the canvas pixel buffer
 * with zero font atlas downsampling and maximum vector clarity.
 */
export async function renderFlexCardToCanvas(
  canvas: HTMLCanvasElement,
  data: FlexCardData,
  themeKey: FlexCardTheme = 'obsidian',
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
  const s = (n: number) => Math.round(n * scale);

  const theme = FLEX_CARD_THEMES[themeKey] || FLEX_CARD_THEMES.obsidian;

  // 1. Background Gradient
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, theme.backgroundStart);
  bgGradient.addColorStop(1, theme.backgroundEnd);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // 2. Ambient Radial Glow Orbs
  const glow1X = format === 'landscape' ? width * 0.2 : width * 0.3;
  const glow1Y = format === 'landscape' ? height * 0.35 : height * 0.22;
  const glowRad1 = ctx.createRadialGradient(glow1X, glow1Y, s(10), glow1X, glow1Y, width * 0.55);
  glowRad1.addColorStop(0, theme.accentGlow);
  glowRad1.addColorStop(1, 'transparent');
  ctx.fillStyle = glowRad1;
  ctx.fillRect(0, 0, width, height);

  const glow2X = format === 'landscape' ? width * 0.82 : width * 0.75;
  const glow2Y = format === 'landscape' ? height * 0.7 : height * 0.78;
  const glowRad2 = ctx.createRadialGradient(glow2X, glow2Y, s(10), glow2X, glow2Y, width * 0.55);
  glowRad2.addColorStop(0, theme.accentGlow);
  glowRad2.addColorStop(1, 'transparent');
  ctx.fillStyle = glowRad2;
  ctx.fillRect(0, 0, width, height);

  // 3. Subtle Dot Matrix Texture
  ctx.fillStyle = themeKey === 'ivory' ? 'rgba(0,0,0,0.038)' : 'rgba(255,255,255,0.038)';
  const dotSpacing = format === 'landscape' ? s(34) : s(44);
  const dotRadius = 1.4 * scale;
  for (let x = s(24); x < width; x += dotSpacing) {
    for (let y = s(24); y < height; y += dotSpacing) {
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 4. Subtle Outer Precision Border
  const outerMargin = format === 'landscape' ? s(32) : s(52);
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1.5 * scale;
  roundRect(ctx, outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2, s(36));
  ctx.stroke();

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
    const weeklyCount = data.weeklyDots?.filter((d) => d.completed).length || 0;
    const statsCols = data.metricDetails && data.metricDetails.length === 3
      ? data.metricDetails
      : [
          { label: 'STREAK', value: `${data.metricValue}`, subtext: String(data.metricUnit || 'Days Unbroken') },
          { label: 'ADHERENCE', value: `${pct}%`, subtext: data.adherenceLabel || 'Monthly Log' },
          { label: '7-DAY PACE', value: `${weeklyCount}/7`, subtext: 'Days Completed' },
        ];

    statsCols.forEach((col, idx) => {
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
