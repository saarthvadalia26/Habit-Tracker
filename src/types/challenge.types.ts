export interface Challenge {
  id: string;
  user_id?: string;
  title: string;
  duration_days: number;
  start_date: string; // YYYY-MM-DD
  habit_ids: string[];
  status: 'active' | 'completed' | 'abandoned';
  created_at?: string;
}

export interface Milestone {
  id: string;
  label: string;
  threshold: number; // percentage (25, 50, 75, 100)
  icon: string;
  color: string;
  isUnlocked: boolean;
  unlockedAtDay?: number;
}

export interface ChallengeProgress {
  currentDay: number;
  totalDays: number;
  daysRemaining: number;
  percentElapsed: number;
  adherencePercentage: number;
  totalCompletedChecks: number;
  totalPossibleChecks: number;
  isFinished: boolean;
  milestones: Milestone[];
}

export interface ChallengePreset {
  id: string;
  title: string;
  durationDays: number;
  description: string;
  badge: string;
  accentColor: string;
}