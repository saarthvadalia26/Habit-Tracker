export interface V2Drop {
  id: string;
  dropNumber: number;
  totalDrops: number;
  title: string;
  versionBadge: string;
  targetDate: string;
  status: 'up_next' | 'in_development' | 'planned';
  statusBadge: string;
  category: string;
  tagline: string;
  description: string;
  highlights: string[];
  accentGradient: string;
  borderAccent: string;
}

export const V2_RELEASE_INFO = {
  version: 'v2.0',
  title: 'The v2.0 Evolution Cycle',
  subtitle: '6 dedicated staged drops designed to systematically refine your discipline.',
  currentDrop: 1,
  totalDrops: 6,
  nextDropDate: '10th October 2026',
};

export const DROP_1_RELEASE_DATE = '2026-10-10T00:00:00';

/**
 * Checks whether Drop 1 (365-Day Heatmap) is unlocked.
 * - Always unlocked on localhost (NODE_ENV === 'development')
 * - Unlocked if ?preview=true or ?beta=true query param is present
 * - Automatically unlocks on production when reaching Oct 10, 2026 00:00
 */
export function isDrop1Unlocked(): boolean {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  if (typeof window !== 'undefined') {
    try {
      const search = window.location.search;
      if (search.includes('preview=true') || search.includes('drop1=true') || search.includes('beta=true')) {
        return true;
      }
    } catch {}
  }

  try {
    const launchTimestamp = new Date(DROP_1_RELEASE_DATE).getTime();
    return Date.now() >= launchTimestamp;
  } catch {
    return false;
  }
}

/**
 * Returns days remaining until Drop 1 launch
 */
export function getDrop1DaysRemaining(): number {
  try {
    const target = new Date(DROP_1_RELEASE_DATE).getTime();
    const diffMs = target - Date.now();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  } catch {
    return 6;
  }
}

export const V2_DROPS: V2Drop[] = [
  {
    id: 'heatmap-365',
    dropNumber: 1,
    totalDrops: 6,
    title: '365/366-Day Master Heatmap',
    versionBadge: 'v2.0 • DROP 1',
    targetDate: '10th October 2026',
    status: 'up_next',
    statusBadge: 'SPOTLIGHT • RELEASING OCT 10',
    category: '📊 VISUALS & ANALYTICS',
    tagline: 'A panoramic 52-week annual heatmap visualizing every single day of consistency.',
    description:
      'Gain a high-altitude perspective on your discipline. Track your entire year with a responsive contribution grid, zoom in on specific habits, and celebrate your annual adherence rate.',
    highlights: [
      '52-week panoramic contribution grid mapping all 365 or 366 days (with full leap year support)',
      'Per-habit isolation with theme-colored intensity levels',
      'Annual consistency index, total completions & longest yearly streak',
      'Interactive date inspector tooltips with exact completion details',
    ],
    accentGradient: 'from-cyan-500/20 via-indigo-500/10 to-transparent',
    borderAccent: 'border-cyan-500/30 dark:border-cyan-500/40',
  },
  {
    id: 'numeric-goals',
    dropNumber: 2,
    totalDrops: 6,
    title: 'Target & Numeric Goals',
    versionBadge: 'v2.0 • DROP 2',
    targetDate: 'Late October 2026',
    status: 'in_development',
    statusBadge: 'DROP 2 • NOW AVAILABLE',
    category: '🎯 QUANTITATIVE METRICS',
    tagline: 'Track measurable milestones beyond binary checkmarks.',
    description:
      'Log 3,000ml of water, 25 pages of reading, or 45 minutes of deep focus with precision steppers and unit counters right inside each cell.',
    highlights: [
      'Quick in-cell +/- steppers and custom metric units (ml, pages, mins, reps)',
      'Partial progress rings showing daily percentage toward quota',
      'Cumulative volume analytics over weeks and months',
    ],
    accentGradient: 'from-violet-500/20 via-indigo-500/10 to-transparent',
    borderAccent: 'border-violet-500/30 dark:border-violet-500/40',
  },
  {
    id: 'streak-armor',
    dropNumber: 3,
    totalDrops: 6,
    title: 'Streak Armor & Rest Cadence',
    versionBadge: 'v2.0 • DROP 3',
    targetDate: 'November 2026',
    status: 'planned',
    statusBadge: 'PLANNED',
    category: '🛡️ RESILIENCE',
    tagline: 'Streak shields & guilt-free recovery days.',
    description:
      'Never let an unavoidable emergency or travel delay reset your 60-day momentum. Automatic streak freezes and custom 3x/week schedules keep you focused without burnout.',
    highlights: [
      'Earned streak freeze shields for emergency protection',
      'Flexible weekly cadences (e.g. 3x/week gym schedule without penalty)',
      'Guilt-free planned rest days that maintain active streaks',
    ],
    accentGradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    borderAccent: 'border-amber-500/30 dark:border-amber-500/40',
  },
  {
    id: 'habit-stacking',
    dropNumber: 4,
    totalDrops: 6,
    title: 'Habit Stacking & Dayflows',
    versionBadge: 'v2.0 • DROP 4',
    targetDate: 'November 2026',
    status: 'planned',
    statusBadge: 'PLANNED',
    category: '⚡ ROUTINES',
    tagline: 'Group atomic habits into seamless morning, afternoon, and evening rituals.',
    description:
      'Stack your habits into logical daily timeblocks to eliminate decision fatigue and build momentum through compounding triggers.',
    highlights: [
      'Morning Anchor, Afternoon Focus, and Evening Wind-Down groupings',
      'Filter table views by active time of day',
      'Cue-to-action chaining reminders',
    ],
    accentGradient: 'from-indigo-500/20 via-purple-500/10 to-transparent',
    borderAccent: 'border-indigo-500/30 dark:border-indigo-500/40',
  },
  {
    id: 'flex-cards',
    dropNumber: 5,
    totalDrops: 6,
    title: 'Milestone Flex Cards',
    versionBadge: 'v2.0 • DROP 5',
    targetDate: 'December 2026',
    status: 'planned',
    statusBadge: 'PLANNED',
    category: '🎨 CELEBRATION',
    tagline: 'Turn 30, 60, and 100-day streaks into bespoke shareable graphics.',
    description:
      'Export high-resolution 9:16 Instagram Story and X cards celebrating milestone achievements with custom card themes and real stats.',
    highlights: [
      '1-tap 9:16 canvas exporter for social stories',
      'Dark obsidian and cyber-minimalist themes',
      'Automatic stats breakdown & streak milestones',
    ],
    accentGradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
    borderAccent: 'border-rose-500/30 dark:border-rose-500/40',
  },
  {
    id: 'offline-sync',
    dropNumber: 6,
    totalDrops: 6,
    title: 'Offline-First Engine & Cloud Sync',
    versionBadge: 'v2.0 • DROP 6',
    targetDate: 'December 2026',
    status: 'planned',
    statusBadge: 'PLANNED',
    category: '📡 INFRASTRUCTURE',
    tagline: 'Log habits anywhere, anytime—even with zero internet connectivity.',
    description:
      'Airplane-ready offline tracking powered by local storage queues that auto-synchronize to Supabase the moment you reconnect.',
    highlights: [
      'Instantaneous zero-latency local logging',
      'Offline queue with background synchronization',
      'Automatic conflict resolution with cloud database',
    ],
    accentGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    borderAccent: 'border-emerald-500/30 dark:border-emerald-500/40',
  },
];
