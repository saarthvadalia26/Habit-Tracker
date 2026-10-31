/**
 * Drop 5: Unit templates and presets for numeric goals
 */

export type GoalType = 'binary' | 'numeric' | 'duration';

export interface UnitTemplate {
  id: string;
  category: string;
  icon: string;
  label: string;
  unit: string;
  defaultTarget: number;
  quickPresets: number[];
  step: number;
  color: string;
}

export const UNIT_TEMPLATES: UnitTemplate[] = [
  // Hydration
  {
    id: 'water-ml',
    category: 'Hydration',
    icon: '💧',
    label: 'Water Intake',
    unit: 'ml',
    defaultTarget: 3000,
    quickPresets: [250, 500, 1000, 2000, 3000],
    step: 250,
    color: '#3B82F6', // blue
  },
  {
    id: 'water-oz',
    category: 'Hydration',
    icon: '💧',
    label: 'Water Intake',
    unit: 'oz',
    defaultTarget: 100,
    quickPresets: [8, 16, 32, 64, 100],
    step: 8,
    color: '#3B82F6',
  },

  // Reading
  {
    id: 'reading-pages',
    category: 'Reading',
    icon: '📖',
    label: 'Reading',
    unit: 'pages',
    defaultTarget: 25,
    quickPresets: [10, 25, 50, 100, 200],
    step: 5,
    color: '#8B5CF6', // purple
  },
  {
    id: 'reading-chapters',
    category: 'Reading',
    icon: '📚',
    label: 'Reading',
    unit: 'chapters',
    defaultTarget: 1,
    quickPresets: [1, 2, 3, 5, 10],
    step: 1,
    color: '#8B5CF6',
  },
  {
    id: 'reading-minutes',
    category: 'Reading',
    icon: '⏱️',
    label: 'Reading',
    unit: 'mins',
    defaultTarget: 30,
    quickPresets: [15, 30, 45, 60, 90],
    step: 5,
    color: '#8B5CF6',
  },

  // Exercise
  {
    id: 'exercise-reps',
    category: 'Exercise',
    icon: '🏋️',
    label: 'Reps',
    unit: 'reps',
    defaultTarget: 50,
    quickPresets: [10, 25, 50, 100, 200],
    step: 5,
    color: '#EF4444', // red
  },
  {
    id: 'exercise-sets',
    category: 'Exercise',
    icon: '💪',
    label: 'Sets',
    unit: 'sets',
    defaultTarget: 3,
    quickPresets: [1, 3, 5, 10, 15],
    step: 1,
    color: '#EF4444',
  },
  {
    id: 'exercise-minutes',
    category: 'Exercise',
    icon: '🏃',
    label: 'Workout Duration',
    unit: 'mins',
    defaultTarget: 45,
    quickPresets: [15, 30, 45, 60, 90],
    step: 5,
    color: '#EF4444',
  },
  {
    id: 'exercise-distance-km',
    category: 'Exercise',
    icon: '🏃',
    label: 'Distance',
    unit: 'km',
    defaultTarget: 5,
    quickPresets: [1, 3, 5, 10, 20],
    step: 1,
    color: '#EF4444',
  },
  {
    id: 'steps',
    category: 'Exercise',
    icon: '👟',
    label: 'Steps',
    unit: 'steps',
    defaultTarget: 10000,
    quickPresets: [5000, 10000, 15000, 20000, 25000],
    step: 1000,
    color: '#EF4444',
  },

  // Meditation & Mindfulness
  {
    id: 'meditation-minutes',
    category: 'Mindfulness',
    icon: '🧘',
    label: 'Meditation',
    unit: 'mins',
    defaultTarget: 20,
    quickPresets: [5, 10, 20, 30, 60],
    step: 5,
    color: '#10B981', // green
  },
  {
    id: 'meditation-sessions',
    category: 'Mindfulness',
    icon: '🧘',
    label: 'Meditation Sessions',
    unit: 'sessions',
    defaultTarget: 1,
    quickPresets: [1, 2, 3, 5, 10],
    step: 1,
    color: '#10B981',
  },

  // Sleep
  {
    id: 'sleep-hours',
    category: 'Sleep',
    icon: '😴',
    label: 'Sleep Duration',
    unit: 'hours',
    defaultTarget: 8,
    quickPresets: [6, 7, 8, 9, 10],
    step: 1,
    color: '#6366F1', // indigo
  },

  // Work & Productivity
  {
    id: 'deep-work-minutes',
    category: 'Productivity',
    icon: '⏱️',
    label: 'Deep Work',
    unit: 'mins',
    defaultTarget: 120,
    quickPresets: [25, 50, 90, 120, 180],
    step: 5,
    color: '#F59E0B', // amber
  },
  {
    id: 'deep-work-pomodoros',
    category: 'Productivity',
    icon: '🍅',
    label: 'Pomodoros',
    unit: 'pomodoros',
    defaultTarget: 8,
    quickPresets: [4, 6, 8, 10, 12],
    step: 1,
    color: '#F59E0B',
  },

  // Nutrition
  {
    id: 'calories',
    category: 'Nutrition',
    icon: '🍎',
    label: 'Calories',
    unit: 'kcal',
    defaultTarget: 2000,
    quickPresets: [500, 1000, 1500, 2000, 2500],
    step: 50,
    color: '#EC4899', // pink
  },
  {
    id: 'protein',
    category: 'Nutrition',
    icon: '🥩',
    label: 'Protein',
    unit: 'g',
    defaultTarget: 150,
    quickPresets: [50, 100, 150, 200, 250],
    step: 10,
    color: '#EC4899',
  },
  {
    id: 'vegetables-servings',
    category: 'Nutrition',
    icon: '🥗',
    label: 'Vegetable Servings',
    unit: 'servings',
    defaultTarget: 5,
    quickPresets: [3, 5, 7, 10, 15],
    step: 1,
    color: '#10B981',
  },

  // Learning
  {
    id: 'study-minutes',
    category: 'Learning',
    icon: '📝',
    label: 'Study Time',
    unit: 'mins',
    defaultTarget: 60,
    quickPresets: [15, 30, 60, 90, 120],
    step: 5,
    color: '#3B82F6',
  },
  {
    id: 'flashcards',
    category: 'Learning',
    icon: '🃏',
    label: 'Flashcards Reviewed',
    unit: 'cards',
    defaultTarget: 50,
    quickPresets: [20, 50, 100, 200, 500],
    step: 10,
    color: '#3B82F6',
  },

  // Custom
  {
    id: 'custom-count',
    category: 'Custom',
    icon: '🎯',
    label: 'Custom Count',
    unit: 'units',
    defaultTarget: 10,
    quickPresets: [1, 5, 10, 25, 50],
    step: 1,
    color: '#6B7280', // gray
  },
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): UnitTemplate | undefined {
  return UNIT_TEMPLATES.find(t => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): UnitTemplate[] {
  return UNIT_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get all categories
 */
export function getAllCategories(): string[] {
  return Array.from(new Set(UNIT_TEMPLATES.map(t => t.category)));
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
}

/**
 * Get color for progress percentage
 */
export function getProgressColor(percentage: number): string {
  if (percentage >= 100) return '#10B981'; // green
  if (percentage >= 75) return '#22C55E'; // light green
  if (percentage >= 50) return '#F59E0B'; // amber
  if (percentage >= 25) return '#F97316'; // orange
  return '#EF4444'; // red
}

/**
 * Format numeric value with unit
 */
export function formatValue(value: number, unit: string): string {
  return `${value.toLocaleString()} ${unit}`;
}
