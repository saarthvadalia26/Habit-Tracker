import { HabitWithLogs, TimeOfDay, StackTriggerType, HabitStackConfig } from '@/types/database.types';

export interface DayflowMeta {
  id: TimeOfDay;
  label: string;
  shortLabel: string;
  icon: string;
  timeRange: string;
  color: string;
  accentBg: string;
  badgeBg: string;
  description: string;
}

export const DAYFLOW_META: Record<TimeOfDay, DayflowMeta> = {
  morning: {
    id: 'morning',
    label: 'Morning Anchor',
    shortLabel: 'Morning',
    icon: '🌅',
    timeRange: '4:00 AM – 11:59 AM',
    color: '#F59E0B',
    accentBg: 'bg-amber-500/10 dark:bg-amber-500/15',
    badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
    description: 'Prime your neurological focus and build compounding momentum before midday.',
  },
  afternoon: {
    id: 'afternoon',
    label: 'Afternoon Focus',
    shortLabel: 'Afternoon',
    icon: '☀️',
    timeRange: '12:00 PM – 4:59 PM',
    color: '#0EA5E9',
    accentBg: 'bg-sky-500/10 dark:bg-sky-500/15',
    badgeBg: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25',
    description: 'Deep work sprints, sustained physical movement, and high-cognitive output.',
  },
  evening: {
    id: 'evening',
    label: 'Evening Wind-Down',
    shortLabel: 'Evening',
    icon: '🌙',
    timeRange: '5:00 PM – 3:59 AM',
    color: '#6366F1',
    accentBg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    badgeBg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/25',
    description: 'Decompress from the day, reflect on wins, and restore your biological rhythm.',
  },
  anytime: {
    id: 'anytime',
    label: 'Anytime Flow',
    shortLabel: 'Anytime',
    icon: '🔄',
    timeRange: 'All Day',
    color: '#8B5CF6',
    accentBg: 'bg-purple-500/10 dark:bg-purple-500/15',
    badgeBg: 'bg-[#15130f]/6 dark:bg-[#fbf8f1]/10 text-[#15130f]/70 dark:text-[#fbf8f1]/70 border-[#15130f]/12 dark:border-[#fbf8f1]/15',
    description: 'Universal daily disciplines executed flexibly whenever opportunity strikes.',
  },
};

export const DAYFLOW_ORDER: TimeOfDay[] = ['morning', 'afternoon', 'evening', 'anytime'];

/**
 * Returns the current time of day bucket according to user's system clock
 */
export function getCurrentTimeOfDay(customHour?: number): TimeOfDay {
  const hour = customHour !== undefined ? customHour : new Date().getHours();
  if (hour >= 4 && hour < 12) {
    return 'morning';
  }
  if (hour >= 12 && hour < 17) {
    return 'afternoon';
  }
  return 'evening';
}

/**
 * Normalizes a habit's time of day with a safe fallback
 */
export function getHabitTimeOfDay(habit: HabitWithLogs): TimeOfDay {
  const tod = habit.time_of_day || habit.stack?.timeOfDay;
  if (tod === 'morning' || tod === 'afternoon' || tod === 'evening' || tod === 'anytime') {
    return tod;
  }
  return 'anytime';
}

/**
 * Formats a clean stacking trigger descriptor (e.g. "↳ After Morning Coffee" or "↳ After Meditation")
 */
export function getHabitStackTriggerText(
  habit: HabitWithLogs,
  allHabits: HabitWithLogs[] = []
): { hasTrigger: boolean; text: string; parentTitle?: string } {
  const triggerType = habit.stack_trigger_type || habit.stack?.triggerType || 'none';

  if (triggerType === 'custom') {
    const cue = (habit.stack_custom_cue || habit.stack?.customCue || '').trim();
    if (cue) {
      return {
        hasTrigger: true,
        text: `After ${cue}`,
      };
    }
  }

  if (triggerType === 'habit') {
    const parentId = habit.stack_parent_habit_id || habit.stack?.parentHabitId;
    if (parentId) {
      const parent = allHabits.find((h) => h.id === parentId);
      const parentTitle = parent?.title || habit.stack?.parentHabitTitle || 'Routine';
      return {
        hasTrigger: true,
        text: `After ${parentTitle}`,
        parentTitle,
      };
    }
  }

  return { hasTrigger: false, text: '' };
}

/**
 * Groups habits by Dayflow (morning, afternoon, evening, anytime)
 * and orders them with chained items attached directly under their parents.
 */
export function groupAndOrderHabitsByDayflow(
  habits: HabitWithLogs[]
): Record<TimeOfDay, HabitWithLogs[]> {
  const groups: Record<TimeOfDay, HabitWithLogs[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    anytime: [],
  };

  // 1. Bucket habits into their respective dayflows
  habits.forEach((habit) => {
    const tod = getHabitTimeOfDay(habit);
    groups[tod].push(habit);
  });

  // 2. Sort within each bucket: parents first by stack_order, followed by chained children
  (Object.keys(groups) as TimeOfDay[]).forEach((tod) => {
    const bucket = groups[tod];
    const topLevel: HabitWithLogs[] = [];
    const childrenByParentId: Record<string, HabitWithLogs[]> = {};

    bucket.forEach((h) => {
      const isChild =
        (h.stack_trigger_type === 'habit' || h.stack?.triggerType === 'habit') &&
        Boolean(h.stack_parent_habit_id || h.stack?.parentHabitId);

      const parentId = h.stack_parent_habit_id || h.stack?.parentHabitId;

      if (isChild && parentId && bucket.some((other) => other.id === parentId)) {
        if (!childrenByParentId[parentId]) {
          childrenByParentId[parentId] = [];
        }
        childrenByParentId[parentId].push(h);
      } else {
        topLevel.push(h);
      }
    });

    // Sort top-level habits by stack_order or creation
    topLevel.sort((a, b) => (a.stack_order ?? 0) - (b.stack_order ?? 0));

    // Flatten tree: insert children directly after their parent
    const ordered: HabitWithLogs[] = [];
    topLevel.forEach((parent) => {
      ordered.push(parent);
      const children = childrenByParentId[parent.id] || [];
      children.sort((a, b) => (a.stack_order ?? 0) - (b.stack_order ?? 0));
      ordered.push(...children);
    });

    // Append any orphaned children safely
    Object.keys(childrenByParentId).forEach((parentId) => {
      if (!topLevel.some((h) => h.id === parentId)) {
        ordered.push(...childrenByParentId[parentId]);
      }
    });

    groups[tod] = ordered;
  });

  return groups;
}

export interface DayflowAdherence {
  completed: number;
  total: number;
  percentage: number;
}

/**
 * Calculates completion metrics for each dayflow on a specific dateKey (YYYY-MM-DD)
 */
export function calculateDayflowAdherence(
  habits: HabitWithLogs[],
  dateKey: string
): Record<TimeOfDay, DayflowAdherence> {
  const stats: Record<TimeOfDay, DayflowAdherence> = {
    morning: { completed: 0, total: 0, percentage: 0 },
    afternoon: { completed: 0, total: 0, percentage: 0 },
    evening: { completed: 0, total: 0, percentage: 0 },
    anytime: { completed: 0, total: 0, percentage: 0 },
  };

  habits.forEach((habit) => {
    const tod = getHabitTimeOfDay(habit);
    stats[tod].total += 1;

    const isDone = Boolean(habit.logs?.[dateKey]);
    const isFrozen = Boolean(habit.frozenLogs?.[dateKey]);

    if (isDone || isFrozen) {
      stats[tod].completed += 1;
    }
  });

  (Object.keys(stats) as TimeOfDay[]).forEach((tod) => {
    const s = stats[tod];
    s.percentage = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
  });

  return stats;
}
