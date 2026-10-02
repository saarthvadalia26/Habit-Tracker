'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Challenge } from '@/types/challenge.types';
import { cleanText, cleanUuidList, isUuid, isValidDate } from '@/lib/validation';

export interface ActionResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Fetches the user's currently active challenge (if any)
 */
export async function getActiveChallengeAction(): Promise<ActionResponse<Challenge | null>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: null }; // Unauthenticated users use client local storage
    }

    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return { data: null, error: 'Unable to load the active challenge.' };
    }

    return { data: (data as unknown as Challenge) ?? null, error: null };
  } catch {
    return { data: null, error: 'Unable to load the active challenge.' };
  }
}

/**
 * Creates and activates a new challenge (75-Day, 90-Day, or Custom)
 */
export async function createChallengeAction(
  title: string,
  durationDays: number,
  startDate: string,
  habitIds: string[] = []
): Promise<ActionResponse<Challenge>> {
  try {
    const cleanTitle = cleanText(title, 100);
    if (!cleanTitle) {
      return { data: null, error: 'Challenge title cannot be empty.' };
    }

    if (!Number.isInteger(durationDays) || durationDays < 7 || durationDays > 365 || !isValidDate(startDate)) {
      return { data: null, error: 'Invalid challenge details.' };
    }
    const validHabitIds = cleanUuidList(habitIds);
    if (!validHabitIds) {
      return { data: null, error: 'Invalid challenge habits.' };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        data: null,
        error: 'Authentication required. Please sign in to save your challenge to the cloud.',
      };
    }

    if (validHabitIds.length > 0) {
      const { data: ownedHabits, error: ownedHabitsError } = await supabase
        .from('habits')
        .select('id')
        .eq('user_id', user.id)
        .in('id', validHabitIds);

      if (ownedHabitsError || !ownedHabits || ownedHabits.length !== validHabitIds.length) {
        return { data: null, error: 'A selected habit is unavailable.' };
      }
    }

    // Fast UX check. The partial unique index in schema.sql is the final,
    // race-safe enforcement for direct and concurrent database writes.
    const { data: existingActive, error: existingActiveError } = await supabase
      .from('challenges')
      .select('id, title')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1);

    if (existingActiveError) {
      return { data: null, error: 'Unable to create a challenge right now.' };
    }

    if (existingActive && existingActive.length > 0) {
      return {
        data: null,
        error: `An active challenge ("${existingActive[0].title}") is already in progress. Complete or abandon it before starting a new challenge.`,
      };
    }

    // Insert new challenge
    const { data, error } = await supabase
      .from('challenges')
      .insert({
        user_id: user.id,
        title: cleanTitle,
        duration_days: durationDays,
        start_date: startDate,
        habit_ids: validHabitIds,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: 'Unable to create this challenge.' };
    }

    revalidatePath('/');
    return { data: (data as unknown as Challenge), error: null };
  } catch {
    return { data: null, error: 'Unable to create this challenge.' };
  }
}

/**
 * Concludes or finishes an active challenge
 */
export async function completeChallengeAction(
  challengeId: string
): Promise<ActionResponse<{ id: string }>> {
  try {
    if (!isUuid(challengeId)) {
      return { data: null, error: 'Invalid challenge.' };
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
      .from('challenges')
      .update({ status: 'completed' })
      .eq('id', challengeId)
      .eq('user_id', user.id);

    if (error) {
      return { data: null, error: 'Unable to complete this challenge.' };
    }

    revalidatePath('/');
    return { data: { id: challengeId }, error: null };
  } catch {
    return { data: null, error: 'Unable to complete this challenge.' };
  }
}

/**
 * Abandons or resets an active challenge
 */
export async function abandonChallengeAction(
  challengeId: string
): Promise<ActionResponse<{ id: string }>> {
  try {
    if (!isUuid(challengeId)) {
      return { data: null, error: 'Invalid challenge.' };
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
      .from('challenges')
      .update({ status: 'abandoned' })
      .eq('id', challengeId)
      .eq('user_id', user.id);

    if (error) {
      return { data: null, error: 'Unable to reset this challenge.' };
    }

    revalidatePath('/');
    return { data: { id: challengeId }, error: null };
  } catch {
    return { data: null, error: 'Unable to reset this challenge.' };
  }
}
