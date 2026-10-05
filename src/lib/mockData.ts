import { HabitWithLogs } from '@/types/database.types';
import { formatDateToISO } from '@/lib/dateUtils';

interface SampleHabitTemplate {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  streak: number;
  doneToday: boolean;
  targetTime: string;
  targetType: 'boolean' | 'numeric';
  targetValue: number | null;
  unit: string | null;
  stepIncrement: number | null;
  todayValue: number | null;
}

export function getSampleHabits(): HabitWithLogs[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDateToISO(today);

  const habitsTemplate: SampleHabitTemplate[] = [
    {
      id: 'habit-framer-1',
      title: 'Morning run',
      subtitle: '5 km · 7:00 AM',
      icon: 'footprints',
      color: '#ff5a1f',
      streak: 12,
      doneToday: true,
      targetTime: '07:00 AM',
      targetType: 'boolean' as const,
      targetValue: null,
      unit: null,
      stepIncrement: null,
      todayValue: null,
    },
    {
      id: 'habit-framer-2',
      title: 'Drink water',
      subtitle: '2,500 ml · hydration',
      icon: 'droplets',
      color: '#06b6d4',
      streak: 21,
      doneToday: true,
      targetTime: 'All day',
      targetType: 'numeric' as const,
      targetValue: 2500,
      unit: 'ml',
      stepIncrement: 250,
      todayValue: 2500,
    },
    {
      id: 'habit-framer-3',
      title: 'Read 20 pages',
      subtitle: 'Atomic Habits · evening',
      icon: 'book',
      color: '#ff5a1f',
      streak: 9,
      doneToday: true,
      targetTime: '08:00 PM',
      targetType: 'numeric' as const,
      targetValue: 20,
      unit: 'pages',
      stepIncrement: 5,
      todayValue: 20,
    },
    {
      id: 'habit-framer-4',
      title: 'Deep focus meditation',
      subtitle: '15 mins · mindfulness',
      icon: 'brain',
      color: '#8b5cf6',
      streak: 4,
      doneToday: false,
      targetTime: '10:30 PM',
      targetType: 'numeric' as const,
      targetValue: 15,
      unit: 'mins',
      stepIncrement: 5,
      todayValue: 10, // Partial: 10 / 15 mins (67%)
    },
    {
      id: 'habit-framer-5',
      title: 'Sleep by 11',
      subtitle: 'Lights out · 11:00 PM',
      icon: 'moon',
      color: '#ff5a1f',
      streak: 2,
      doneToday: false,
      targetTime: '11:00 PM',
      targetType: 'boolean' as const,
      targetValue: null,
      unit: null,
      stepIncrement: null,
      todayValue: null,
    },
  ];

  return habitsTemplate.map((item, index) => {
    const logs: Record<string, boolean> = {};
    const numericLogs: Record<string, number> = {};

    // 1. Seed historical logs for past 365 days
    for (let d = 1; d <= 365; d++) {
      const pastDate = new Date(today);
      pastDate.setDate(pastDate.getDate() - d);
      const pastDateStr = formatDateToISO(pastDate);

      if (d <= item.streak) {
        // Must be complete to maintain the exact streak
        logs[pastDateStr] = true;
        if (item.targetType === 'numeric' && item.targetValue) {
          numericLogs[pastDateStr] = item.targetValue;
        }
      } else {
        // High completion rate (~86%) before streak
        const seed = (index * 41 + d * 17) % 100;
        const isDone = seed < 86;
        logs[pastDateStr] = isDone;
        if (item.targetType === 'numeric' && item.targetValue) {
          numericLogs[pastDateStr] = isDone
            ? item.targetValue
            : Math.round((seed / 100) * item.targetValue);
        }
      }
    }

    // 2. Set today's log
    logs[todayStr] = item.doneToday;
    if (item.targetType === 'numeric' && item.targetValue) {
      numericLogs[todayStr] = item.todayValue ?? (item.doneToday ? item.targetValue : 0);
      if ((numericLogs[todayStr] ?? 0) >= item.targetValue) {
        logs[todayStr] = true;
      }
    }

    return {
      id: item.id,
      user_id: 'local-user',
      title: item.title,
      subtitle: item.subtitle,
      icon: item.icon,
      color_theme: item.color,
      target_type: item.targetType,
      target_value: item.targetValue,
      unit: item.unit,
      step_increment: item.stepIncrement,
      targetTime: item.targetTime,
      created_at: new Date(Date.now() - 365 * 86400000).toISOString(),
      logs,
      numericLogs,
      currentStreak: item.streak,
    };
  });
}
