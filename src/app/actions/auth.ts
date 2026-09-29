'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getCurrentUserAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { user: null };
    }

    return { user };
  } catch {
    return { user: null };
  }
}

export async function signInAction(email: string, password: string) {
  try {
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      return { error: 'Email and password are required.' };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/');
    return { data, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to sign in.';
    return { error: message };
  }
}

export async function signUpAction(email: string, password: string) {
  try {
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      return { error: 'Email and password are required.' };
    }
    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters long.' };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes('rate limit')) {
        return {
          error:
            "Email rate limit exceeded. Supabase free projects limit email sending to 3/hour. Turn OFF 'Confirm email' in your Supabase Dashboard to allow instant signups without limits.",
        };
      }
      return { error: error.message };
    }

    // New user starts with an empty tracker with no pre-seeded habits

    revalidatePath('/');
    return { data, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to sign up.';
    return { error: message };
  }
}

export async function signOutAction() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/');
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function deleteAccountAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'You must be logged in to delete your account.' };
    }

    // 1. Explicitly wipe all habits (cascades to habit_logs)
    const { error: habitsDeleteError } = await supabase
      .from('habits')
      .delete()
      .eq('user_id', user.id);

    if (habitsDeleteError) {
      console.warn('Could not delete habits directly:', habitsDeleteError.message);
    }

    // 2. Call RPC to delete auth.users record if configured
    try {
      await supabase.rpc('delete_user_account');
    } catch (rpcErr) {
      console.warn('RPC delete_user_account failed, proceeding with sign out:', rpcErr);
    }

    // 3. Sign out user and clear all cookies
    await supabase.auth.signOut();
    revalidatePath('/');
    return { success: true, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete account.';
    return { success: false, error: message };
  }
}
