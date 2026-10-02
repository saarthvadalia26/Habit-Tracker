'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cleanText, isValidEmail, isValidPassword } from '@/lib/validation';

interface CurrentUser {
  id: string;
  email: string | null;
  customName: string;
}

export async function getCurrentUserAction(): Promise<{ user: CurrentUser | null }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { user: null };
    }

    return {
      user: {
        id: user.id,
        email: user.email ?? null,
        customName: typeof user.user_metadata?.custom_name === 'string' ? user.user_metadata.custom_name : '',
      },
    };
  } catch {
    return { user: null };
  }
}

export async function signInAction(email: string, password: string) {
  try {
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!isValidEmail(cleanEmail) || !isValidPassword(password)) {
      return { error: 'Invalid email or password.' };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      // Do not expose provider details that could help account enumeration.
      return { error: 'Invalid email or password.' };
    }

    revalidatePath('/');
    return { data, error: null };
  } catch {
    return { error: 'Unable to sign in right now. Please try again.' };
  }
}

export async function signUpAction(email: string, password: string) {
  try {
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!isValidEmail(cleanEmail) || !isValidPassword(password)) {
      return { error: 'Use a valid email and a password between 6 and 128 characters.' };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          custom_name: '',
        },
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes('rate limit')) {
        return {
          error: 'Too many sign-up attempts. Please wait before trying again.',
        };
      }
      return { error: 'Unable to create an account. Check your details and try again.' };
    }

    revalidatePath('/');
    return { data, error: null };
  } catch {
    return { error: 'Unable to create an account right now. Please try again.' };
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
 * Returns safe, user-facing errors if the deletion procedure fails.
 */
export async function deleteAccountAction(confirmation: string) {
  try {
    if (confirmation !== 'DELETE') {
      return { success: false, error: 'Account deletion was not confirmed.' };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'You must be logged in to delete your account.' };
    }

    // Reset user metadata custom_name so recreating the account never inherits previous title
    try {
      await supabase.auth.updateUser({
        data: {
          custom_name: '',
        },
      });
    } catch {}

    // 1. Explicitly wipe all habits (cascades to habit_logs)
    const { error: habitsDeleteError } = await supabase
      .from('habits')
      .delete()
      .eq('user_id', user.id);

    if (habitsDeleteError) {
      return { success: false, error: 'Unable to remove account data. Please try again.' };
    }

    // 2. Call RPC to delete auth.users record
    const { error: rpcError } = await supabase.rpc('delete_user_account');

    if (rpcError) {
      return {
        success: false,
        error: 'Your account data was removed, but the account could not be closed. Please contact support.',
      };
    }

    // 3. Sign out user and clear session cookies
    await supabase.auth.signOut();
    revalidatePath('/');
    return { success: true, error: null };
  } catch {
    return { success: false, error: 'Failed to delete account. Please try again.' };
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

    if (typeof customName !== 'string') {
      return { success: false, error: 'Invalid tracker title.' };
    }

    // Empty titles are valid; control characters are never persisted.
    const clean = cleanText(customName, 18) ?? '';
    const { error } = await supabase.auth.updateUser({
      data: {
        custom_name: clean,
      },
    });

    if (error) {
      return { success: false, error: 'Failed to save title across devices.' };
    }

    revalidatePath('/');
    return { success: true, customName: clean, error: null };
  } catch {
    return { success: false, error: 'Failed to save title across devices.' };
  }
}
