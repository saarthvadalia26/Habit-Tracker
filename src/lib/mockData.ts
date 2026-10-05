import { HabitWithLogs } from '@/types/database.types';
import { formatDateToISO } from '@/lib/dateUtils';

export function getSampleHabits(): HabitWithLogs[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDateToISO(today);

  const habitsTemplate = [
    {
      id: 'habit-framer-1',
      title: 'Morning run',
      subtitle: '5 km · 7:00 AM',
      icon: 'footprints',
      color: '#ff5a1f',
      streak: 12,
      doneToday: true,
      targetTime: '07:00 AM',
    },
    {
      id: 'habit-framer-2',
      title: 'Drink water',
      subtitle: '8 glasses · all day',
      icon: 'droplets',
      color: '#ff5a1f',
      streak: 21,
      doneToday: true,
      targetTime: 'All day',
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
    },
    {
      id: 'habit-framer-4',
      title: 'Meditate',
      subtitle: '10 min · before bed',
      icon: 'brain',
      color: '#ff5a1f',
      streak: 4,
      doneToday: false,
      targetTime: '10:30 PM',
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
    },
  ];

  return habitsTemplate.map((item, index) => {
    const logs: Record<string, boolean> = {};

    // 1. Seed historical logs for past 365 days
    for (let d = 1; d <= 365; d++) {
      const pastDate = new Date(today);
      pastDate.setDate(pastDate.getDate() - d);
      const pastDateStr = formatDateToISO(pastDate);

      if (d <= item.streak) {
        // Must be complete to maintain the exact streak
        logs[pastDateStr] = true;
      } else {
        // High completion rate (~86%) before streak
        const seed = (index * 41 + d * 17) % 100;
        logs[pastDateStr] = seed < 86;
      }
    }

    // 2. Set today's log
    logs[todayStr] = item.doneToday;

    return {
      id: item.id,
      user_id: 'local-user',
      title: item.title,
      subtitle: item.subtitle,
      icon: item.icon,
      color_theme: item.color,
      targetTime: item.targetTime,
      created_at: new Date(Date.now() - 365 * 86400000).toISOString(),
      logs,
      currentStreak: item.streak,
    };
  });
}
