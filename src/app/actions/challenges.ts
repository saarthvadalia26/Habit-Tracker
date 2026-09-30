'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Challenge } from '@/types/challenge.types';

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
      return { data: null, error: error.message };
    }

    return { data: (data as unknown as Challenge) ?? null, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch active challenge';
    return { data: null, error: message };
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
    const cleanTitle = title.trim().slice(0, 100);
    if (!cleanTitle) {
      return { data: null, error: 'Challenge title cannot be empty.' };
    }

    const duration = Math.max(7, Math.min(365, Math.round(durationDays)));

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

    // Mark any existing active challenge as completed/superseded
    await supabase
      .from('challenges')
      .update({ status: 'completed' })
      .eq('user_id', user.id)
      .eq('status', 'active');

    // Insert new challenge
    const { data, error } = await supabase
      .from('challenges')
      .insert({
        user_id: user.id,
        title: cleanTitle,
        duration_days: duration,
        start_date: startDate,
        habit_ids: habitIds,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    revalidatePath('/');
    return { data: (data as unknown as Challenge), error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create challenge';
    return { data: null, error: message };
  }
}

/**
 * Concludes or finishes an active challenge
 */
export async function completeChallengeAction(
  challengeId: string
): Promise<ActionResponse<{ id: string }>> {
  try {
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
      return { data: null, error: error.message };
    }

    revalidatePath('/');
    return { data: { id: challengeId }, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to complete challenge';
    return { data: null, error: message };
  }
}

/**
 * Abandons or resets an active challenge
 */
export async function abandonChallengeAction(
  challengeId: string
): Promise<ActionResponse<{ id: string }>> {
  try {
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
      return { data: null, error: error.message };
    }

    revalidatePath('/');
    return { data: { id: challengeId }, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to reset challenge';
    return { data: null, error: message };
  }
}