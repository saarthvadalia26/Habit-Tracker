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
  completionRate?: number;
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

export const FORMAT_DIMENSIONS: Record<
  FlexCardFormat,
  { width: number; height: number; aspectRatioLabel: string; name: string }
> = {
  story: { width: 1080, height: 1920, aspectRatioLabel: '9:16', name: 'Story (IG / WhatsApp)' },
  square: { width: 1080, height: 1080, aspectRatioLabel: '1:1', name: 'Square (Feed / Threads)' },
  landscape: { width: 1200, height: 675, aspectRatioLabel: '16:9', name: 'Post (X / Twitter)' },
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
 */
export function renderFlexCardToCanvas(
  canvas: HTMLCanvasElement,
  data: FlexCardData,
  themeKey: FlexCardTheme = 'obsidian',
  format: FlexCardFormat = 'story'
) {
  const { width, height } = FORMAT_DIMENSIONS[format];
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

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
  const glowRad1 = ctx.createRadialGradient(glow1X, glow1Y, 10, glow1X, glow1Y, width * 0.55);
  glowRad1.addColorStop(0, theme.accentGlow);
  glowRad1.addColorStop(1, 'transparent');
  ctx.fillStyle = glowRad1;
  ctx.fillRect(0, 0, width, height);

  const glow2X = format === 'landscape' ? width * 0.82 : width * 0.75;
  const glow2Y = format === 'landscape' ? height * 0.7 : height * 0.78;
  const glowRad2 = ctx.createRadialGradient(glow2X, glow2Y, 10, glow2X, glow2Y, width * 0.55);
  glowRad2.addColorStop(0, theme.accentGlow);
  glowRad2.addColorStop(1, 'transparent');
  ctx.fillStyle = glowRad2;
  ctx.fillRect(0, 0, width, height);

  // 3. Subtle Dot Matrix Texture
  ctx.fillStyle = themeKey === 'ivory' ? 'rgba(0,0,0,0.038)' : 'rgba(255,255,255,0.038)';
  const dotSpacing = format === 'landscape' ? 34 : 44;
  for (let x = 24; x < width; x += dotSpacing) {
    for (let y = 24; y < height; y += dotSpacing) {
      ctx.beginPath();
      ctx.arc(x, y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 4. Subtle Outer Precision Border
  const outerMargin = format === 'landscape' ? 32 : 52;
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1.5;
  roundRect(ctx, outerMargin, outerMargin, width - outerMargin * 2, height - outerMargin * 2, 36);
  ctx.stroke();

  // Route to format-specific layout renderers
  if (format === 'story') {
    renderStoryLayout(ctx, width, height, data, theme);
  } else if (format === 'square') {
    renderSquareLayout(ctx, width, height, data, theme);
  } else {
    renderLandscapeLayout(ctx, width, height, data, theme);
  }
}

/**
 * -------------------------------------------------------------
 * 1. STORY LAYOUT (9:16 - 1080 x 1920 px)
 * Balanced vertical flow that fills the canvas without empty voids
 * -------------------------------------------------------------
 */
function renderStoryLayout(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: FlexCardData,
  theme: ThemeColors
) {
  const padX = 100;
  const contentW = width - padX * 2;

  // 1. Header Bar
  const headerY = 140;
  renderHeaderBrand(ctx, padX, headerY, width, data.dateStr, theme);

  // 2. Milestone Pill Badge
  const badgeY = 250;
  renderBadgePill(ctx, padX, badgeY, data.badgeText, theme);

  // 3. Hero Big Number
  const heroY = 350;
  const valStr = String(data.metricValue);
  const numFontSize = 185;
  ctx.font = `800 ${numFontSize}px ${FONT_HEAD}`;
  ctx.fillStyle = theme.primaryText;
  ctx.textBaseline = 'top';
  ctx.fillText(valStr, padX, heroY);

  const numWidth = ctx.measureText(valStr).width;

  // Unit text beside number
  if (data.metricUnit) {
    const unitLines = wrapText(ctx, data.metricUnit.toUpperCase(), 380);
    ctx.font = `700 42px ${FONT_HEAD}`;
    ctx.fillStyle = theme.accent;
    let uY = heroY + 32;
    for (const uL of unitLines) {
      ctx.fillText(uL, padX + numWidth + 24, uY);
      uY += 46;
    }
  }

  // Title Label
  const labelY = heroY + numFontSize + 12;
  ctx.font = `700 42px ${FONT_HEAD}`;
  ctx.fillStyle = theme.primaryText;
  const titleLines = wrapText(ctx, data.title || 'Consistency Milestone', contentW);
  let curLabelY = labelY;
  for (const tL of titleLines.slice(0, 2)) {
    ctx.fillText(tL, padX, curLabelY);
    curLabelY += 50;
  }

  // Subtitle
  const subLines = wrapText(ctx, data.subtitle || data.metricLabel, contentW);
  ctx.font = `500 24px ${FONT_BODY}`;
  ctx.fillStyle = theme.secondaryText;
  let curSubY = curLabelY + 12;
  for (const sL of subLines.slice(0, 2)) {
    ctx.fillText(sL, padX, curSubY);
    curSubY += 34;
  }

  // 4. 7-Day Consistency Dot Matrix
  const dotsY = Math.max(730, curSubY + 36);
  renderWeeklyConsistencyDots(ctx, padX, dotsY, contentW, theme);

  // 5. Dual Bento Stats Grid
  const bentoY = dotsY + 120;
  const bentoW = (contentW - 28) / 2;
  const bentoH = 220;

  // Bento Box 1: Routine / Target
  ctx.fillStyle = theme.cardBg;
  roundRect(ctx, padX, bentoY, bentoW, bentoH, 26);
  ctx.fill();
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = `600 16px ${FONT_BODY}`;
  ctx.fillStyle = theme.secondaryText;
  ctx.fillText('TARGET ROUTINE', padX + 28, bentoY + 36);

  ctx.font = `700 28px ${FONT_HEAD}`;
  ctx.fillStyle = theme.primaryText;
  const habitStr = truncateText(ctx, data.habitTitle || 'Core Habit Stack', bentoW - 56);
  ctx.fillText(habitStr, padX + 28, bentoY + 84);

  // Routine badge chip inside bento 1
  ctx.fillStyle = theme.pillBg;
  roundRect(ctx, padX + 28, bentoY + 135, 180, 42, 14);
  ctx.fill();
  ctx.font = `700 15px ${FONT_BODY}`;
  ctx.fillStyle = theme.pillText;
  ctx.fillText('ATOMIC DAILY RITUAL', padX + 44, bentoY + 162);

  // Bento Box 2: Adherence Index
  const bento2X = padX + bentoW + 28;
  ctx.fillStyle = theme.cardBg;
  roundRect(ctx, bento2X, bentoY, bentoW, bentoH, 26);
  ctx.fill();
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = `600 16px ${FONT_BODY}`;
  ctx.fillStyle = theme.secondaryText;
  ctx.fillText('ADHERENCE INDEX', bento2X + 28, bentoY + 36);

  const pct = Math.min(100, Math.max(10, data.completionRate ?? 95));
  ctx.font = `800 48px ${FONT_HEAD}`;
  ctx.fillStyle = theme.accent;
  ctx.fillText(`${pct}%`, bento2X + 28, bentoY + 92);

  ctx.font = `500 16px ${FONT_BODY}`;
  ctx.fillStyle = theme.secondaryText;
  ctx.fillText('Verified Consistency', bento2X + 28, bentoY + 132);

  // Mini progress track in bento 2
  ctx.fillStyle = theme.progressTrack;
  roundRect(ctx, bento2X + 28, bentoY + 162, bentoW - 56, 12, 6);
  ctx.fill();
  ctx.fillStyle = theme.accent;
  roundRect(ctx, bento2X + 28, bentoY + 162, (bentoW - 56) * (pct / 100), 12, 6);
  ctx.fill();

  // 6. Wisdom Quote Capsule or Integrity Protocol Box
  const quoteY = bentoY + bentoH + 45;
  const quoteH = 340;

  if (data.showQuote !== false) {
    ctx.fillStyle = theme.quoteBoxBg;
    roundRect(ctx, padX, quoteY, contentW, quoteH, 28);
    ctx.fill();
    ctx.strokeStyle = theme.quoteBoxBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Large quotation icon mark
    ctx.font = `700 64px ${FONT_SERIF}`;
    ctx.fillStyle = theme.accent;
    ctx.fillText('“', padX + 36, quoteY + 32);

    const qText = data.quote || 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.';
    const qAuthor = data.quoteAuthor || 'Aristotle';

    ctx.font = `italic 500 29px ${FONT_SERIF}`;
    ctx.fillStyle = theme.primaryText;
    const qLines = wrapText(ctx, qText, contentW - 80);

    let qTextY = quoteY + 95;
    for (const line of qLines.slice(0, 3)) {
      ctx.fillText(line, padX + 40, qTextY);
      qTextY += 44;
    }

    ctx.font = `700 20px ${FONT_BODY}`;
    ctx.fillStyle = theme.accent;
    ctx.fillText(`— ${qAuthor}`, padX + 40, quoteY + quoteH - 40);
  } else {
    // Protocol Integrity Card (fills height with premium breakdown)
    ctx.fillStyle = theme.cardBg;
    roundRect(ctx, padX, quoteY, contentW, quoteH, 28);
    ctx.fill();
    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = `700 24px ${FONT_HEAD}`;
    ctx.fillStyle = theme.primaryText;
    ctx.fillText('DISCIPLINE & CONSISTENCY ARCHIVE', padX + 36, quoteY + 45);

    ctx.font = `500 18px ${FONT_BODY}`;
    ctx.fillStyle = theme.secondaryText;
    ctx.fillText('Continuous Habit Tracking • Zero Days Off Chain Verified', padX + 36, quoteY + 85);

    // 3 Metric Pills inside protocol card
    const col3W = (contentW - 72 - 32) / 3;
    const pY = quoteY + 130;
    const statsCols = [
      { label: 'EXECUTION CHAIN', val: 'LOCKED', sub: 'Active Streak' },
      { label: 'MOMENTUM', val: 'OPTIMAL', sub: 'Non-Negotiable' },
      { label: 'PROTOCOL', val: 'TITAN', sub: 'V2.0 Core' },
    ];

    statsCols.forEach((col, idx) => {
      const cX = padX + 36 + idx * (col3W + 16);
      ctx.fillStyle = theme.pillBg;
      roundRect(ctx, cX, pY, col3W, 110, 18);
      ctx.fill();

      ctx.font = `700 13px ${FONT_BODY}`;
      ctx.fillStyle = theme.secondaryText;
      ctx.fillText(col.label, cX + 16, pY + 28);

      ctx.font = `800 24px ${FONT_HEAD}`;
      ctx.fillStyle = theme.accent;
      ctx.fillText(col.val, cX + 16, pY + 62);

      ctx.font = `500 13px ${FONT_BODY}`;
      ctx.fillStyle = theme.secondaryText;
      ctx.fillText(col.sub, cX + 16, pY + 88);
    });

    ctx.font = `600 15px ${FONT_BODY}`;
    ctx.fillStyle = theme.accent;
    ctx.fillText('• VERIFIED AUTONOMOUS PROOF ENGINE', padX + 36, quoteY + quoteH - 35);
  }

  // 7. Divider Line
  ctx.strokeStyle = theme.name === 'Warm Ivory' ? 'rgba(21, 19, 15, 0.12)' : 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padX, height - 140);
  ctx.lineTo(width - padX, height - 140);
  ctx.stroke();

  // 8. Footer Signature
  const footerY = height - 95;
  renderFooterSignature(ctx, padX, footerY, width, data.userName, data.showUser, theme);
}

/**
 * -------------------------------------------------------------
 * 2. SQUARE LAYOUT (1:1 - 1080 x 1080 px)
 * High density, balanced layout that guarantees ZERO footer collisions
 * -------------------------------------------------------------
 */
function renderSquareLayout(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: FlexCardData,
  theme: ThemeColors
) {
  const padX = 85;
  const contentW = width - padX * 2;

  // Header Bar
  const headerY = 85;
  renderHeaderBrand(ctx, padX, headerY, width, data.dateStr, theme);

  // Milestone Pill Badge
  const badgeY = 175;
  renderBadgePill(ctx, padX, badgeY, data.badgeText, theme);

  // Hero Big Number & Unit
  const heroY = 255;
  const valStr = String(data.metricValue);
  const numFontSize = 135;
  ctx.font = `800 ${numFontSize}px ${FONT_HEAD}`;
  ctx.fillStyle = theme.primaryText;
  ctx.textBaseline = 'top';
  ctx.fillText(valStr, padX, heroY);

  const numWidth = ctx.measureText(valStr).width;

  if (data.metricUnit) {
    ctx.font = `700 36px ${FONT_HEAD}`;
    ctx.fillStyle = theme.accent;
    ctx.fillText(data.metricUnit.toUpperCase(), padX + numWidth + 20, heroY + 24);
  }

  // Title
  const labelY = heroY + numFontSize + 8;
  ctx.font = `700 34px ${FONT_HEAD}`;
  ctx.fillStyle = theme.primaryText;
  const titleStr = truncateText(ctx, data.title || 'Consistency Milestone', contentW);
  ctx.fillText(titleStr, padX, labelY);

  // Subtitle
  const subY = labelY + 42;
  ctx.font = `500 20px ${FONT_BODY}`;
  ctx.fillStyle = theme.secondaryText;
  const subStr = truncateText(ctx, data.subtitle || data.metricLabel, contentW);
  ctx.fillText(subStr, padX, subY);

  // Bento Stats Row
  const statsY = subY + 46;
  const statsH = 130;
  ctx.fillStyle = theme.cardBg;
  roundRect(ctx, padX, statsY, contentW, statsH, 22);
  ctx.fill();
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Inside Stats Row: Routine on Left, Adherence on Right
  ctx.font = `600 15px ${FONT_BODY}`;
  ctx.fillStyle = theme.secondaryText;
  ctx.fillText('TARGET ROUTINE', padX + 26, statsY + 36);

  ctx.font = `700 26px ${FONT_HEAD}`;
  ctx.fillStyle = theme.primaryText;
  const habitStr = truncateText(ctx, data.habitTitle || 'Core Daily Stack', contentW * 0.55);
  ctx.fillText(habitStr, padX + 26, statsY + 76);

  // Right Stat
  const rightX = padX + contentW - 26;
  ctx.textAlign = 'right';
  ctx.font = `600 15px ${FONT_BODY}`;
  ctx.fillStyle = theme.secondaryText;
  ctx.fillText('ADHERENCE', rightX, statsY + 36);

  const pct = Math.min(100, Math.max(10, data.completionRate ?? 95));
  ctx.font = `800 36px ${FONT_HEAD}`;
  ctx.fillStyle = theme.accent;
  ctx.fillText(`${pct}%`, rightX, statsY + 78);
  ctx.textAlign = 'left';

  // Wisdom Quote or Mini Capsule (Fits cleanly without collision)
  if (data.showQuote !== false) {
    const quoteY = statsY + statsH + 28;
    const quoteH = 160;

    ctx.fillStyle = theme.quoteBoxBg;
    roundRect(ctx, padX, quoteY, contentW, quoteH, 22);
    ctx.fill();
    ctx.strokeStyle = theme.quoteBoxBorder;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    const qText = data.quote || 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.';
    const qAuthor = data.quoteAuthor || 'Aristotle';

    ctx.font = `italic 500 22px ${FONT_SERIF}`;
    ctx.fillStyle = theme.primaryText;
    const qLines = wrapText(ctx, `“${qText}”`, contentW - 52);

    let qY = quoteY + 36;
    for (const qL of qLines.slice(0, 2)) {
      ctx.fillText(qL, padX + 26, qY);
      qY += 32;
    }

    ctx.font = `600 16px ${FONT_BODY}`;
    ctx.fillStyle = theme.accent;
    ctx.fillText(`— ${qAuthor}`, padX + 26, quoteY + quoteH - 26);
  } else {
    const dotsY = statsY + statsH + 40;
    renderWeeklyConsistencyDots(ctx, padX, dotsY, contentW, theme);
  }

  // Divider Line
  ctx.strokeStyle = theme.name === 'Warm Ivory' ? 'rgba(21, 19, 15, 0.12)' : 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padX, height - 90);
  ctx.lineTo(width - padX, height - 90);
  ctx.stroke();

  // Footer Signature
  const footerY = height - 60;
  renderFooterSignature(ctx, padX, footerY, width, data.userName, data.showUser, theme);
}

/**
 * -------------------------------------------------------------
 * 3. LANDSCAPE LAYOUT (16:9 - 1200 x 675 px)
 * Clean, modern 2-column bento architecture
 * -------------------------------------------------------------
 */
function renderLandscapeLayout(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: FlexCardData,
  theme: ThemeColors
) {
  const padX = 70;
  const colW = (width - padX * 2 - 40) / 2;

  // Header Bar across top
  const headerY = 65;
  renderHeaderBrand(ctx, padX, headerY, width, data.dateStr, theme);

  // Left Column: Milestone Badge & Hero Metric
  const leftX = padX;
  const leftY = 145;

  renderBadgePill(ctx, leftX, leftY, data.badgeText, theme);

  const heroY = leftY + 55;
  const valStr = String(data.metricValue);
  const numFontSize = 100;
  ctx.font = `800 ${numFontSize}px ${FONT_HEAD}`;
  ctx.fillStyle = theme.primaryText;
  ctx.textBaseline = 'top';
  ctx.fillText(valStr, leftX, heroY);

  const numWidth = ctx.measureText(valStr).width;

  if (data.metricUnit) {
    ctx.font = `700 28px ${FONT_HEAD}`;
    ctx.fillStyle = theme.accent;
    ctx.fillText(data.metricUnit.toUpperCase(), leftX + numWidth + 14, heroY + 18);
  }

  const labelY = heroY + numFontSize + 6;
  ctx.font = `700 26px ${FONT_HEAD}`;
  ctx.fillStyle = theme.primaryText;
  const titleStr = truncateText(ctx, data.title || 'Consistency Milestone', colW);
  ctx.fillText(titleStr, leftX, labelY);

  const subY = labelY + 34;
  ctx.font = `500 17px ${FONT_BODY}`;
  ctx.fillStyle = theme.secondaryText;
  const subStr = truncateText(ctx, data.subtitle || data.metricLabel, colW);
  ctx.fillText(subStr, leftX, subY);

  // Right Column: Stats Card + Wisdom Quote Bento
  const rightX = padX + colW + 40;
  const cardY = leftY;
  const cardH = 140;

  ctx.fillStyle = theme.cardBg;
  roundRect(ctx, rightX, cardY, colW, cardH, 20);
  ctx.fill();
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Inside Right Card
  ctx.font = `600 13px ${FONT_BODY}`;
  ctx.fillStyle = theme.secondaryText;
  ctx.fillText('TARGET ROUTINE', rightX + 22, cardY + 28);

  ctx.font = `700 22px ${FONT_HEAD}`;
  ctx.fillStyle = theme.primaryText;
  const habitStr = truncateText(ctx, data.habitTitle || 'Core Daily Stack', colW - 44);
  ctx.fillText(habitStr, rightX + 22, cardY + 60);

  const pct = Math.min(100, Math.max(10, data.completionRate ?? 95));
  ctx.font = `600 13px ${FONT_BODY}`;
  ctx.fillStyle = theme.secondaryText;
  ctx.fillText('ADHERENCE SCORE', rightX + 22, cardY + 95);

  ctx.font = `800 22px ${FONT_HEAD}`;
  ctx.fillStyle = theme.accent;
  ctx.fillText(`${pct}% Verified`, rightX + 160, cardY + 96);

  // Right Quote Box
  if (data.showQuote !== false) {
    const qBoxY = cardY + cardH + 18;
    const qBoxH = 145;

    ctx.fillStyle = theme.quoteBoxBg;
    roundRect(ctx, rightX, qBoxY, colW, qBoxH, 20);
    ctx.fill();
    ctx.strokeStyle = theme.quoteBoxBorder;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    const qText = data.quote || 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.';
    const qAuthor = data.quoteAuthor || 'Aristotle';

    ctx.font = `italic 500 17px ${FONT_SERIF}`;
    ctx.fillStyle = theme.primaryText;
    const qLines = wrapText(ctx, `“${qText}”`, colW - 40);

    let qY = qBoxY + 28;
    for (const qL of qLines.slice(0, 2)) {
      ctx.fillText(qL, rightX + 20, qY);
      qY += 26;
    }

    ctx.font = `600 14px ${FONT_BODY}`;
    ctx.fillStyle = theme.accent;
    ctx.fillText(`— ${qAuthor}`, rightX + 20, qBoxY + qBoxH - 20);
  } else {
    const dotsY = cardY + cardH + 25;
    renderWeeklyConsistencyDots(ctx, rightX, dotsY, colW, theme);
  }

  // Divider Line
  ctx.strokeStyle = theme.name === 'Warm Ivory' ? 'rgba(21, 19, 15, 0.12)' : 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padX, height - 65);
  ctx.lineTo(width - padX, height - 65);
  ctx.stroke();

  // Footer Signature across bottom
  const footerY = height - 42;
  renderFooterSignature(ctx, padX, footerY, width, data.userName, data.showUser, theme);
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
  theme: ThemeColors
) {
  // Official Brand Logo mark: "H."
  const chipSize = 42;
  const chipRadius = 12;

  // Squircle base
  ctx.fillStyle = theme.name === 'Warm Ivory' ? 'rgba(21, 19, 15, 0.08)' : 'rgba(255, 255, 255, 0.08)';
  roundRect(ctx, x, y, chipSize, chipSize, chipRadius);
  ctx.fill();
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Draw bold "H"
  ctx.font = `800 24px ${FONT_HEAD}`;
  ctx.fillStyle = theme.primaryText;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText('H', x + 9, y + chipSize / 2 + 1);

  // Draw signature accent period dot "."
  ctx.fillStyle = theme.accent;
  ctx.beginPath();
  ctx.arc(x + 31, y + chipSize / 2 + 8, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Brand Name text: HABIT TRACKER
  ctx.font = `700 26px ${FONT_HEAD}`;
  ctx.fillStyle = theme.primaryText;
  ctx.fillText('HABIT TRACKER', x + chipSize + 16, y + chipSize / 2);

  if (dateStr) {
    ctx.textAlign = 'right';
    ctx.font = `600 22px ${FONT_BODY}`;
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
  theme: ThemeColors
) {
  const badgeLabel = (text || 'MILESTONE UNLOCKED').toUpperCase();
  ctx.font = `700 22px ${FONT_HEAD}`;
  const badgeW = ctx.measureText(badgeLabel).width + 48;
  const badgeH = 48;

  ctx.fillStyle = theme.pillBg;
  roundRect(ctx, x, y, badgeW, badgeH, 24);
  ctx.fill();
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = theme.pillText;
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeLabel, x + 24, y + badgeH / 2);
}

function renderWeeklyConsistencyDots(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  theme: ThemeColors
) {
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const dotCount = 7;
  const colW = width / dotCount;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let i = 0; i < dotCount; i++) {
    const dotX = x + colW * i + colW / 2;

    // Glowing Dot / Check Circle
    ctx.fillStyle = theme.accent;
    ctx.beginPath();
    ctx.arc(dotX, y + 16, 20, 0, Math.PI * 2);
    ctx.fill();

    // Inner checkmark dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(dotX, y + 16, 7, 0, Math.PI * 2);
    ctx.fill();

    // Day Label
    ctx.font = `700 18px ${FONT_BODY}`;
    ctx.fillStyle = theme.secondaryText;
    ctx.fillText(days[i], dotX, y + 54);
  }

  ctx.textAlign = 'left';
}

function renderFooterSignature(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  canvasWidth: number,
  userName: string | null | undefined,
  showUser: boolean | undefined,
  theme: ThemeColors
) {
  const userLabel = (showUser !== false && userName && userName.trim())
    ? `DISCIPLINE BY ${userName.trim().toUpperCase()}`
    : 'VERIFIED DISCIPLINE ARCHIVE';

  ctx.textBaseline = 'top';
  ctx.font = `700 15px ${FONT_HEAD}`;
  ctx.fillStyle = theme.secondaryText;
  ctx.fillText(userLabel, x, y);

  ctx.textAlign = 'right';
  ctx.font = `700 14px ${FONT_HEAD}`;
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
