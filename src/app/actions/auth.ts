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

/**
 * Permanently deletes the user account, habits, and all database records.
 * Accurately surfaces errors if the deletion procedure fails.
 */
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
      return { success: false, error: `Failed to remove user habits: ${habitsDeleteError.message}` };
    }

    // 2. Call RPC to delete auth.users record
    const { error: rpcError } = await supabase.rpc('delete_user_account');

    if (rpcError) {
      // If RPC is missing or fails, report accurately
      console.error('RPC delete_user_account error:', rpcError.message);
      return {
        success: false,
        error: `Database wiped, but auth account deletion failed: ${rpcError.message}. Please ensure delete_user_account RPC is installed in Supabase.`,
      };
    }

    // 3. Sign out user and clear session cookies
    await supabase.auth.signOut();
    revalidatePath('/');
    return { success: true, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete account.';
    return { success: false, error: message };
  }
}

/**
 * Updates the user's custom tracker title in Supabase Auth user metadata
 * so that it persists across all devices (phone, laptop, desktop, etc.)
 */
export async function updateCustomNameAction(customName: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Authentication required to save title.' };
    }

    // Sanitize: max 18 chars, strip control characters
    const clean = customName.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim().slice(0, 18);
    const { error } = await supabase.auth.updateUser({
      data: {
        custom_name: clean,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/');
    return { success: true, customName: clean, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save title across devices.';
    return { success: false, error: message };
  }
}