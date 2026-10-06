'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cleanText, isValidEmail, isValidPassword } from '@/lib/validation';

interface CurrentUser {
  id: string;
  email: string | null;
  customName: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  profilePromptDismissed?: boolean;
  monthlyNotes?: Record<string, string>;
}

export interface SignUpProfile {
  firstName?: string;
  lastName?: string;
  nickname?: string;
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

    const customName = typeof user.user_metadata?.custom_name === 'string' ? user.user_metadata.custom_name : '';
    const firstName = typeof user.user_metadata?.first_name === 'string' ? user.user_metadata.first_name : '';
    const lastName = typeof user.user_metadata?.last_name === 'string' ? user.user_metadata.last_name : '';
    const fullName = typeof user.user_metadata?.full_name === 'string' 
      ? user.user_metadata.full_name 
      : [firstName, lastName].filter(Boolean).join(' ');
    const profilePromptDismissed = Boolean(user.user_metadata?.profile_prompt_dismissed);

    // Load monthly notes for cross-device cloud sync
    let monthlyNotes: Record<string, string> = {};

    // 1. Try public.monthly_notes table first (authoritative Postgres database)
    try {
      const { data: dbNotes } = await supabase
        .from('monthly_notes')
        .select('month_key, content')
        .eq('user_id', user.id);

      if (dbNotes && Array.isArray(dbNotes)) {
        for (const row of dbNotes) {
          if (row.month_key && typeof row.content === 'string') {
            monthlyNotes[row.month_key] = row.content;
          }
        }
      }
    } catch {}

    // 2. Merge user_metadata fallback for any notes not yet in the table
    if (user.user_metadata?.monthly_notes && typeof user.user_metadata.monthly_notes === 'object') {
      const metaNotes = user.user_metadata.monthly_notes as Record<string, string>;
      monthlyNotes = {
        ...metaNotes,
        ...monthlyNotes, // database table values take precedence
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email ?? null,
        customName,
        firstName,
        lastName,
        fullName,
        profilePromptDismissed,
        monthlyNotes,
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

export async function signUpAction(
  email: string,
  password: string,
  profile?: SignUpProfile
) {
  try {
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!isValidEmail(cleanEmail) || !isValidPassword(password)) {
      return { error: 'Use a valid email and a password between 6 and 128 characters.' };
    }

    const cleanFirst = cleanText(profile?.firstName, 15) ?? '';
    const cleanLast = cleanText(profile?.lastName, 20) ?? '';
    const cleanNick = cleanText(profile?.nickname, 15) ?? '';

    // Prefer nickname if given; otherwise fall back to first name
    const trackerName = cleanNick || cleanFirst;
    const fullName = [cleanFirst, cleanLast].filter(Boolean).join(' ');

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          custom_name: trackerName,
          first_name: cleanFirst,
          last_name: cleanLast,
          full_name: fullName,
          profile_prompt_dismissed: true,
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

/**
 * Updates full user profile details (First Name, Last Name, Tracker Title/Nickname)
 * and marks the profile prompt as completed.
 */
export async function updateProfileAction(profile: {
  firstName?: string;
  lastName?: string;
  nickname?: string;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Authentication required to update profile.' };
    }

    const cleanFirst = cleanText(profile.firstName, 15) ?? '';
    const cleanLast = cleanText(profile.lastName, 20) ?? '';
    const cleanNick = cleanText(profile.nickname, 15) ?? '';

    // Prefer nickname if given; otherwise fall back to first name
    const trackerName = cleanNick || cleanFirst;
    const fullName = [cleanFirst, cleanLast].filter(Boolean).join(' ');

    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: cleanFirst,
        last_name: cleanLast,
        custom_name: trackerName,
        full_name: fullName,
        profile_prompt_dismissed: true,
      },
    });

    if (error) {
      return { success: false, error: 'Failed to update profile. Please try again.' };
    }

    revalidatePath('/');
    return {
      success: true,
      firstName: cleanFirst,
      lastName: cleanLast,
      customName: trackerName,
      fullName,
      error: null,
    };
  } catch {
    return { success: false, error: 'Failed to update profile. Please try again.' };
  }
}

/**
 * Records that the user clicked 'Maybe later' so the prompt is never shown again.
 */
export async function dismissProfilePromptAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false };
    }

    await supabase.auth.updateUser({
      data: {
        profile_prompt_dismissed: true,
      },
    });

    return { success: true };
  } catch {
    return { success: false };
  }
}

/**
 * Persists user's monthly notes & intentions to Supabase user metadata
 * and/or dedicated table, guaranteeing cross-device cloud sync.
 */
export async function saveMonthlyNoteAction(
  year: number,
  month: number,
  content: string
): Promise<{ success: boolean; error?: string | null }> {
  try {
    if (typeof year !== 'number' || typeof month !== 'number' || typeof content !== 'string') {
      return { success: false, error: 'Invalid note parameters.' };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Authentication required to sync notes.' };
    }

    const cleanContent = content.slice(0, 8000);
    const noteKey = `${year}_${month}`;

    let savedToTable = false;

    // 1. Primary: Save to PostgreSQL monthly_notes table (authoritative, ultra-fast ~30ms, no Auth rate limits)
    try {
      const { error: dbError } = await supabase.from('monthly_notes').upsert(
        {
          user_id: user.id,
          month_key: noteKey,
          content: cleanContent,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,month_key' }
      );
      if (!dbError) {
        savedToTable = true;
      }
    } catch {}

    // Secondary metadata sync helper for backward compatibility
    const syncMetadata = async () => {
      try {
        const currentNotes = (user.user_metadata?.monthly_notes && typeof user.user_metadata.monthly_notes === 'object')
          ? (user.user_metadata.monthly_notes as Record<string, string>)
          : {};

        const updatedNotes = {
          ...currentNotes,
          [noteKey]: cleanContent,
        };

        await supabase.auth.updateUser({
          data: {
            monthly_notes: updatedNotes,
          },
        });
      } catch {}
    };

    if (savedToTable) {
      // Run secondary Auth metadata sync concurrently without blocking client response
      syncMetadata();
      return { success: true, error: null };
    }

    // 2. Secondary fallback: If table upsert failed (e.g. migration pending), await metadata update
    try {
      const currentNotes = (user.user_metadata?.monthly_notes && typeof user.user_metadata.monthly_notes === 'object')
        ? (user.user_metadata.monthly_notes as Record<string, string>)
        : {};

      const updatedNotes = {
        ...currentNotes,
        [noteKey]: cleanContent,
      };

      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          monthly_notes: updatedNotes,
        },
      });
      if (!metaError) {
        return { success: true, error: null };
      }
    } catch {}

    return { success: false, error: 'Failed to sync note across devices.' };
  } catch {
    return { success: false, error: 'Failed to sync note across devices.' };
  }
}

/**
 * Retrieves a specific month's note from database table or metadata.
 */
export async function getMonthlyNoteAction(
  year: number,
  month: number
): Promise<{ note: string | null; error?: string | null }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { note: null, error: 'Not authenticated' };
    }

    const noteKey = `${year}_${month}`;

    // Try table first
    try {
      const { data, error } = await supabase
        .from('monthly_notes')
        .select('content')
        .eq('user_id', user.id)
        .eq('month_key', noteKey)
        .maybeSingle();

      if (!error && data && data.content !== undefined) {
        return { note: data.content, error: null };
      }
    } catch {}

    // Fall back to user_metadata
    const metaNotes = user.user_metadata?.monthly_notes as Record<string, string> | undefined;
    if (metaNotes && metaNotes[noteKey] !== undefined) {
      return { note: metaNotes[noteKey], error: null };
    }

    return { note: null, error: null };
  } catch {
    return { note: null, error: 'Failed to fetch note' };
  }
}


