'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { VacationPeriod } from '@/types/cadence.types';
import { cleanText, isUuid, isValidDate } from '@/lib/validation';
import { ActionResponse } from './habits';

/**
 * Fetches all vacations for the authenticated user
 */
export async function getVacationsAction(): Promise<ActionResponse<VacationPeriod[]>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('vacations')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false });

    if (error) {
      // Table may not exist yet in legacy environments, return empty gracefully
      return { data: [], error: null };
    }

    const formatted: VacationPeriod[] = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      startDate: row.start_date,
      endDate: row.end_date,
      habitIds: row.habit_ids || [],
      createdAt: row.created_at,
    }));

    return { data: formatted, error: null };
  } catch {
    return { data: [], error: null };
  }
}

/**
 * Creates a new vacation period
 */
export async function createVacationAction(
  title: string,
  startDate: string,
  endDate: string,
  habitIds: string[] = []
): Promise<ActionResponse<VacationPeriod>> {
  try {
    const cleanedTitle = cleanText(title, 100);
    if (!cleanedTitle) {
      return { data: null, error: 'Vacation title cannot be empty.' };
    }

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return { data: null, error: 'Invalid vacation date format (expected YYYY-MM-DD).' };
    }

    if (endDate < startDate) {
      return { data: null, error: 'End date must be on or after start date.' };
    }

    const validHabitIds = (habitIds || []).filter((id) => isUuid(id));

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: 'Authentication required to schedule vacation.' };
    }

    const { data, error } = await supabase
      .from('vacations')
      .insert({
        user_id: user.id,
        title: cleanedTitle,
        start_date: startDate,
        end_date: endDate,
        habit_ids: validHabitIds,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: 'Unable to save vacation. Please try again.' };
    }

    revalidatePath('/');

    return {
      data: {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        startDate: data.start_date,
        endDate: data.end_date,
        habitIds: data.habit_ids || [],
        createdAt: data.created_at,
      },
      error: null,
    };
  } catch {
    return { data: null, error: 'An unexpected error occurred while creating vacation.' };
  }
}

/**
 * Updates an existing vacation period
 */
export async function updateVacationAction(
  id: string,
  title: string,
  startDate: string,
  endDate: string,
  habitIds: string[] = []
): Promise<ActionResponse<VacationPeriod>> {
  try {
    if (!isUuid(id)) {
      return { data: null, error: 'Invalid vacation identifier.' };
    }

    const cleanedTitle = cleanText(title, 100);
    if (!cleanedTitle) {
      return { data: null, error: 'Vacation title cannot be empty.' };
    }

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return { data: null, error: 'Invalid vacation date format.' };
    }

    if (endDate < startDate) {
      return { data: null, error: 'End date must be on or after start date.' };
    }

    const validHabitIds = (habitIds || []).filter((id) => isUuid(id));

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: 'Authentication required.' };
    }

    const { data, error } = await supabase
      .from('vacations')
      .update({
        title: cleanedTitle,
        start_date: startDate,
        end_date: endDate,
        habit_ids: validHabitIds,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return { data: null, error: 'Unable to update vacation.' };
    }

    revalidatePath('/');

    return {
      data: {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        startDate: data.start_date,
        endDate: data.end_date,
        habitIds: data.habit_ids || [],
        createdAt: data.created_at,
      },
      error: null,
    };
  } catch {
    return { data: null, error: 'Failed to update vacation.' };
  }
}

/**
 * Deletes a vacation period
 */
export async function deleteVacationAction(id: string): Promise<ActionResponse<boolean>> {
  try {
    if (!isUuid(id)) {
      return { data: null, error: 'Invalid vacation identifier.' };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: 'Authentication required.' };
    }

    const { error } = await supabase
      .from('vacations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return { data: false, error: 'Unable to remove vacation.' };
    }

    revalidatePath('/');
    return { data: true, error: null };
  } catch {
    return { data: false, error: 'Failed to remove vacation.' };
  }
}
