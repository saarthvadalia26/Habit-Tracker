'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Habit, HabitLog, HabitWithLogs } from '@/types/database.types';

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
      return { data: null, error: habitsError.message };
    }

    if (!habits || habits.length === 0) {
      return { data: [], error: null };
    }

    // 2. Fetch logs for habits
    const habitIds = habits.map((h) => h.id);
    let logsQuery = supabase
      .from('habit_logs')
      .select('*')
      .in('habit_id', habitIds);

    if (startDate) {
      logsQuery = logsQuery.gte('date', startDate);
    }
    if (endDate) {
      logsQuery = logsQuery.lte('date', endDate);
    }

    const { data: logs, error: logsError } = await logsQuery;

    if (logsError) {
      return { data: null, error: logsError.message };
    }

    // 3. Group logs by habit_id -> Record<date, is_completed>
    const logsByHabit: Record<string, Record<string, boolean>> = {};
    habitIds.forEach((id) => {
      logsByHabit[id] = {};
    });

    (logs || []).forEach((log: HabitLog) => {
      if (logsByHabit[log.habit_id]) {
        logsByHabit[log.habit_id][log.date] = log.is_completed;
      }
    });

    // 4. Combine habits with logs
    const result: HabitWithLogs[] = habits.map((habit) => ({
      ...habit,
      logs: logsByHabit[habit.id] || {},
    }));

    return { data: result, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch habits';
    return { data: null, error: message };
  }
}

/**
 * Creates a new habit for the current user
 */
export async function createHabitAction(
  title: string,
  colorTheme: string = '#6366F1'
): Promise<ActionResponse<Habit>> {
  try {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return { data: null, error: 'Habit title cannot be empty.' };
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
        color_theme: colorTheme,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    revalidatePath('/');
    return { data, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create habit';
    return { data: null, error: message };
  }
}

/**
 * Toggles or updates the completion status of a habit on a specific date
 */
export async function toggleHabitLogAction(
  habitId: string,
  date: string,
  isCompleted: boolean
): Promise<ActionResponse<HabitLog>> {
  try {
    if (!habitId || !date) {
      return { data: null, error: 'Habit ID and date are required.' };
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
      return { data: null, error: error.message };
    }

    revalidatePath('/');
    return { data, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update habit log';
    return { data: null, error: message };
  }
}

/**
 * Deletes a habit and all associated logs (cascades automatically via FK)
 */
export async function deleteHabitAction(
  habitId: string
): Promise<ActionResponse<{ id: string }>> {
  try {
    if (!habitId) {
      return { data: null, error: 'Habit ID is required.' };
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
      return { data: null, error: error.message };
    }

    revalidatePath('/');
    return { data: { id: habitId }, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete habit';
    return { data: null, error: message };
  }
}
