import { HabitWithLogs } from '@/types/database.types';

export function getSampleHabits(): HabitWithLogs[] {
  const habitsTemplate = [
    { title: 'Wake up early', color: '#6366F1', prob: 0.68 },
    { title: 'Make bed', color: '#38BDF8', prob: 0.74 },
    { title: 'Meditation', color: '#34D399', prob: 0.87 },
    { title: 'Morning Skincare', color: '#FB7185', prob: 0.61 },
    { title: 'Take vitamins', color: '#FBBF24', prob: 0.77 },
    { title: 'Daily Walk', color: '#A855F7', prob: 0.81 },
    { title: 'Drink 2-3L Water', color: '#06B6D4', prob: 0.90 },
    { title: 'Exercise / Workout', color: '#F43F5E', prob: 0.68 },
    { title: 'Read 10 Pages', color: '#3B82F6', prob: 0.55 },
    { title: 'Journal / Plan Tomorrow', color: '#A3E635', prob: 0.61 },
  ];

  // Pre-seed full data across 2025, 2026, and 2027 so previous months always have data
  const years = [2025, 2026, 2027];

  return habitsTemplate.map((item, index) => {
    const logs: Record<string, boolean> = {};

    years.forEach((year) => {
      for (let month = 0; month < 12; month++) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          const mm = String(month + 1).padStart(2, '0');
          const dd = String(day).padStart(2, '0');
          const dateString = `${year}-${mm}-${dd}`;

          // Deterministic seed for realistic historical trends
          const seed = (index * 37 + day * 13 + month * 19 + year * 7) % 100;
          logs[dateString] = seed < item.prob * 100;
        }
      }
    });

    return {
      id: `smart-habit-${index + 1}`,
      user_id: 'local-user',
      title: item.title,
      color_theme: item.color,
      created_at: '2025-01-01T00:00:00Z',
      logs,
    };
  });
}
