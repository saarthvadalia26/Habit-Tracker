'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Habit, HabitLog, HabitWithLogs } from '@/types/database.types';
import { cleanHexColor, cleanText, isUuid, isValidDate } from '@/lib/validation';

export interface ActionResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Fetches all habits for the logged-in user, along with their logs in a given date range
 */
export async function getHabitsWithLogsAction(
  startDate?: string,
  endDate?: string
): Promise<ActionResponse<HabitWithLogs[]>> {
  try {
    if ((startDate !== undefined && !isValidDate(startDate)) || (endDate !== undefined && !isValidDate(endDate))) {
      return { data: null, error: 'Invalid date range.' };
    }
    if (startDate && endDate) {
      const rangeDays = (Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / 86_400_000;
      if (rangeDays < 0 || rangeDays > 366) {
        return { data: null, error: 'Date range must be within one year.' };
      }
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        data: null,
        error: 'Authentication required. Please log in to view habits.',
      };
    }

    // 1. Fetch habits belonging to user
    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (habitsError) {
      return { data: null, error: 'Unable to load habits.' };
    }

    if (!habits || habits.length === 0) {
      return { data: [], error: null };
    }

    // 2. Fetch logs for habits (allow up to 5,000 rows to avoid PostgREST default 1,000 truncation)
    const habitIds = habits.map((h) => h.id);
    let logsQuery = supabase
      .from('habit_logs')
      .select('*')
      .in('habit_id', habitIds)
      .limit(5000);

    if (startDate) {
      logsQuery = logsQuery.gte('date', startDate);
    }
    if (endDate) {
      logsQuery = logsQuery.lte('date', endDate);
    }

    const { data: logs, error: logsError } = await logsQuery;

    if (logsError) {
      return { data: null, error: 'Unable to load habit history.' };
    }

    // 3. Group logs by habit_id -> Record<date, is_completed> and Record<date, current_value>
    const logsByHabit: Record<string, Record<string, boolean>> = {};
    const numericLogsByHabit: Record<string, Record<string, number>> = {};
    habitIds.forEach((id) => {
      logsByHabit[id] = {};
      numericLogsByHabit[id] = {};
    });

    (logs || []).forEach((log: HabitLog) => {
      if (logsByHabit[log.habit_id]) {
        logsByHabit[log.habit_id][log.date] = log.is_completed;
        if (log.current_value !== null && log.current_value !== undefined) {
          numericLogsByHabit[log.habit_id][log.date] = Number(log.current_value);
        }
      }
    });

    // 4. Combine habits with logs
    const result: HabitWithLogs[] = habits.map((habit) => ({
      ...habit,
      logs: logsByHabit[habit.id] || {},
      numericLogs: numericLogsByHabit[habit.id] || {},
    }));

    return { data: result, error: null };
  } catch {
    return { data: null, error: 'Unable to load habits.' };
  }
}

/**
 * Creates a new habit for the current user with strict input sanitization
 */
export async function createHabitAction(
  title: string,
  colorTheme: string = '#6366F1',
  targetType: 'boolean' | 'numeric' = 'boolean',
  targetValue?: number | null,
  unit?: string | null,
  stepIncrement?: number | null
): Promise<ActionResponse<Habit>> {
  try {
    const trimmedTitle = cleanText(title, 60);
    if (!trimmedTitle) {
      return { data: null, error: 'Habit title cannot be empty.' };
    }

    // Only a hex color can reach inline style attributes.
    const validatedColor = cleanHexColor(colorTheme) ?? '#6366F1';
    const validatedType = targetType === 'numeric' ? 'numeric' : 'boolean';
    let validatedTargetValue: number | null = null;
    let validatedUnit: string | null = null;
    let validatedStepIncrement: number | null = null;

    if (validatedType === 'numeric') {
      if (!targetValue || isNaN(targetValue) || targetValue <= 0) {
        return { data: null, error: 'Target value must be greater than zero.' };
      }
      validatedTargetValue = Number(targetValue);
      validatedUnit = unit ? cleanText(unit, 20) : null;
      validatedStepIncrement = stepIncrement && stepIncrement > 0 ? Number(stepIncrement) : null;
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        data: null,
        error: 'Authentication required. Please log in to create habits.',
      };
    }

    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: user.id,
        title: trimmedTitle,
        color_theme: validatedColor,
        target_type: validatedType,
        target_value: validatedTargetValue,
        unit: validatedUnit,
        step_increment: validatedStepIncrement,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: 'Unable to create this habit.' };
    }

    revalidatePath('/');
    return { data, error: null };
  } catch {
    return { data: null, error: 'Unable to create this habit.' };
  }
}

/**
 * Toggles or updates the completion status of a habit on a specific date.
 * Enforces business rules with timezone-aware tolerance.
 */
export async function toggleHabitLogAction(
  habitId: string,
  date: string,
  isCompleted: boolean
): Promise<ActionResponse<HabitLog>> {
  try {
    if (!isUuid(habitId) || !isValidDate(date) || typeof isCompleted !== 'boolean') {
      return { data: null, error: 'Invalid habit update.' };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        data: null,
        error: 'Authentication required. Please log in to toggle habits.',
      };
    }

    // Business Rules:
    // 1. Cannot tick future dates (> 1 day tolerance to account for global client timezones ahead of UTC)
    // 2. Cannot edit past records older than 72 hours (3 calendar days + timezone tolerance)
    const [y, m, d] = date.split('-').map(Number);
    const targetDate = new Date(Date.UTC(y, m - 1, d));

    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const diffDays = Math.round((todayUTC.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

    // diffDays < -1 means the target date is strictly in the future even considering timezone offsets up to UTC+14
    if (diffDays < -1) {
      return {
        data: null,
        error: 'Cannot log habits for future dates. Please wait until the day arrives.',
      };
    }

    // diffDays > 3 allows today, yesterday, 2 days ago, and 3 days ago (72h edit window)
    if (diffDays > 3) {
      return {
        data: null,
        error: '72-hour edit window expired: Habit logs older than 3 days cannot be modified.',
      };
    }

    // Upsert into habit_logs using unique constraint (habit_id, date)
    const { data, error } = await supabase
      .from('habit_logs')
      .upsert(
        {
          habit_id: habitId,
          date,
          is_completed: isCompleted,
        },
        { onConflict: 'habit_id, date' }
      )
      .select()
      .single();

    if (error) {
      return { data: null, error: 'Unable to update this habit.' };
    }

    revalidatePath('/');
    return { data, error: null };
  } catch {
    return { data: null, error: 'Unable to update this habit.' };
  }
}

/**
 * Deletes a habit and all associated logs (cascades automatically via FK)
 */
export async function deleteHabitAction(
  habitId: string
): Promise<ActionResponse<{ id: string }>> {
  try {
    if (!isUuid(habitId)) {
      return { data: null, error: 'Invalid habit.' };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        data: null,
        error: 'Authentication required. Please log in to delete habits.',
      };
    }

    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId)
      .eq('user_id', user.id);

    if (error) {
      return { data: null, error: 'Unable to delete this habit.' };
    }

    revalidatePath('/');
    return { data: { id: habitId }, error: null };
  } catch {
    return { data: null, error: 'Unable to delete this habit.' };
  }
}

/**
 * Updates or logs numeric progress for a quantitative habit.
 * Automatically marks completion when current_value >= target_value.
 */
export async function updateHabitNumericLogAction(
  habitId: string,
  date: string,
  currentValue: number,
  targetValue: number
): Promise<ActionResponse<HabitLog>> {
  try {
    if (!isUuid(habitId) || !isValidDate(date) || typeof currentValue !== 'number' || isNaN(currentValue)) {
      return { data: null, error: 'Invalid numeric habit update.' };
    }

    const safeValue = Math.max(0, currentValue);
    const isCompleted = safeValue >= targetValue && targetValue > 0;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        data: null,
        error: 'Authentication required. Please log in to update habits.',
      };
    }

    const [y, m, d] = date.split('-').map(Number);
    const targetDate = new Date(Date.UTC(y, m - 1, d));
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const diffDays = Math.round((todayUTC.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < -1) {
      return {
        data: null,
        error: 'Cannot log habits for future dates. Please wait until the day arrives.',
      };
    }

    if (diffDays > 3) {
      return {
        data: null,
        error: '72-hour edit window expired: Habit logs older than 3 days cannot be modified.',
      };
    }

    const { data, error } = await supabase
      .from('habit_logs')
      .upsert(
        {
          habit_id: habitId,
          date,
          current_value: safeValue,
          is_completed: isCompleted,
        },
        { onConflict: 'habit_id, date' }
      )
      .select()
      .single();

    if (error) {
      return { data: null, error: 'Unable to update numeric habit log.' };
    }

    revalidatePath('/');
    return { data, error: null };
  } catch {
    return { data: null, error: 'Unable to update numeric habit log.' };
  }
}

