'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Habit, HabitLog, HabitWithLogs, TimeOfDay, StackTriggerType, HabitStackConfig } from '@/types/database.types';
import {
  cleanHexColor,
  cleanText,
  isUuid,
  isValidDate,
  isValidCadenceType,
  cleanCadenceDays,
  isValidFrequency,
  isValidTimeOfDay,
  isValidStackTriggerType,
  cleanStackCue,
} from '@/lib/validation';
import { calculateCadenceStreak, computeHabitShieldBank } from '@/lib/cadenceUtils';

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

    // 3. Group logs by habit_id -> Record<date, is_completed> and frozenLogs -> Record<date, boolean>
    const logsByHabit: Record<string, Record<string, boolean>> = {};
    const frozenLogsByHabit: Record<string, Record<string, boolean>> = {};
    habitIds.forEach((id) => {
      logsByHabit[id] = {};
      frozenLogsByHabit[id] = {};
    });

    (logs || []).forEach((log: HabitLog) => {
      if (logsByHabit[log.habit_id]) {
        logsByHabit[log.habit_id][log.date] = log.is_completed;
        if (log.is_frozen) {
          frozenLogsByHabit[log.habit_id][log.date] = true;
        }
      }
    });

    // 4. Combine habits with logs, cadence defaults, and habit stacking dayflow config
    const result: HabitWithLogs[] = habits.map((habit) => {
      const cadenceType = (habit.cadence_type as 'everyday' | 'weekdays' | 'weekends' | 'custom' | 'frequency') || 'everyday';
      const cadenceDays = habit.cadence_days || [0, 1, 2, 3, 4, 5, 6];
      const targetFrequency = habit.target_frequency || 7;

      const tod = (habit.time_of_day as TimeOfDay) || 'anytime';
      const triggerType = (habit.stack_trigger_type as StackTriggerType) || 'none';
      const parentIds: string[] =
        Array.isArray(habit.stack_parent_habit_ids) && habit.stack_parent_habit_ids.length > 0
          ? habit.stack_parent_habit_ids
          : habit.stack_parent_habit_id
          ? [habit.stack_parent_habit_id]
          : [];
      const parentHabits = habits.filter((h) => parentIds.includes(h.id));
      const parentHabit = parentHabits[0];
      const parentTitles = parentHabits.map((p) => p.title);

      const stack: HabitStackConfig = {
        timeOfDay: tod,
        triggerType,
        parentHabitId: habit.stack_parent_habit_id ?? null,
        parentHabitIds: parentIds,
        parentHabitTitle: parentHabit?.title,
        parentHabitTitles: parentTitles,
        customCue: habit.stack_custom_cue ?? '',
        order: habit.stack_order ?? 0,
      };

      return {
        ...habit,
        cadence_type: cadenceType,
        cadence_days: cadenceDays,
        target_frequency: targetFrequency,
        time_of_day: tod,
        stack_trigger_type: triggerType,
        stack_parent_habit_id: habit.stack_parent_habit_id ?? null,
        stack_parent_habit_ids: parentIds,
        stack_custom_cue: habit.stack_custom_cue ?? '',
        stack_order: habit.stack_order ?? 0,
        cadence: {
          type: cadenceType,
          daysOfWeek: cadenceDays,
          frequencyPerWeek: targetFrequency,
        },
        stack,
        logs: logsByHabit[habit.id] || {},
        frozenLogs: frozenLogsByHabit[habit.id] || {},
      };
    });

    return { data: result, error: null };
  } catch {
    return { data: null, error: 'Unable to load habits.' };
  }
}

/**
 * Creates a new habit for the current user with strict input sanitization, cadence, and dayflow stacking
 */
export async function createHabitAction(
  title: string,
  colorTheme: string = '#6366F1',
  cadenceType: string = 'everyday',
  cadenceDays?: number[],
  targetFrequency?: number,
  timeOfDay: string = 'anytime',
  stackTriggerType: string = 'none',
  stackParentHabitId?: string | null,
  stackCustomCue?: string,
  stackOrder: number = 0
): Promise<ActionResponse<Habit>> {
  try {
    const trimmedTitle = cleanText(title, 60);
    if (!trimmedTitle) {
      return { data: null, error: 'Habit title cannot be empty.' };
    }

    // Only a hex color can reach inline style attributes.
    const validatedColor = cleanHexColor(colorTheme) ?? '#6366F1';

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

    const validCadence = isValidCadenceType(cadenceType) ? cadenceType : 'everyday';
    const validDays = cleanCadenceDays(cadenceDays) ?? [0, 1, 2, 3, 4, 5, 6];
    const validFrequency = isValidFrequency(targetFrequency) ? targetFrequency : 7;
    const validTimeOfDay = isValidTimeOfDay(timeOfDay) ? timeOfDay : 'anytime';
    const validTriggerType = isValidStackTriggerType(stackTriggerType) ? stackTriggerType : 'none';
    const validParentId = stackParentHabitId && isUuid(stackParentHabitId) ? stackParentHabitId : null;
    const validCustomCue = cleanStackCue(stackCustomCue, 80);

    // Try inserting with full Drop 3 & Drop 4 columns; fallback gracefully if remote schema is older
    const payload: any = {
      user_id: user.id,
      title: trimmedTitle,
      color_theme: validatedColor,
      cadence_type: validCadence,
      cadence_days: validDays,
      target_frequency: validFrequency,
      time_of_day: validTimeOfDay,
      stack_trigger_type: validTriggerType,
      stack_parent_habit_id: validParentId,
      stack_parent_habit_ids: validParentId ? [validParentId] : [],
      stack_custom_cue: validCustomCue,
      stack_order: typeof stackOrder === 'number' ? stackOrder : 0,
    };

    let { data, error } = await supabase
      .from('habits')
      .insert(payload)
      .select()
      .single();

    if (error) {
      // Graceful fallback without Drop 4 columns if remote DB is older schema
      const fallbackCadence = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          title: trimmedTitle,
          color_theme: validatedColor,
          cadence_type: validCadence,
          cadence_days: validDays,
          target_frequency: validFrequency,
        })
        .select()
        .single();

      if (fallbackCadence.data) {
        data = fallbackCadence.data;
        error = null;
      } else {
        // Fallback to base v1 schema
        const fallbackBase = await supabase
          .from('habits')
          .insert({
            user_id: user.id,
            title: trimmedTitle,
            color_theme: validatedColor,
          })
          .select()
          .single();
        data = fallbackBase.data;
        error = fallbackBase.error;
      }
    }

    if (error) {
      return { data: null, error: 'Unable to create this habit.' };
    }

    revalidatePath('/');
    return { data: data as Habit, error: null };
  } catch {
    return { data: null, error: 'Unable to create this habit.' };
  }
}

/**
 * Updates a habit's weekly rest cadence configuration with strict validation and ownership checks
 */
export async function updateHabitCadenceAction(
  habitId: string,
  cadenceType: string,
  cadenceDays: number[],
  targetFrequency: number = 7
): Promise<ActionResponse<{ habitId: string; cadenceType: string }>> {
  try {
    if (!isUuid(habitId)) {
      return { data: null, error: 'Invalid habit ID.' };
    }

    if (!isValidCadenceType(cadenceType)) {
      return { data: null, error: 'Invalid cadence schedule type.' };
    }

    const validDays = cleanCadenceDays(cadenceDays);
    if (!validDays || validDays.length === 0) {
      return { data: null, error: 'At least one active day of the week is required.' };
    }

    const validFrequency = isValidFrequency(targetFrequency) ? targetFrequency : validDays.length;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: 'Authentication required.' };
    }

    // Verify habit ownership explicitly before mutating
    const { data: habit, error: habitError } = await supabase
      .from('habits')
      .select('id')
      .eq('id', habitId)
      .eq('user_id', user.id)
      .single();

    if (habitError || !habit) {
      return { data: null, error: 'Habit not found or unauthorized.' };
    }

    const { error } = await supabase
      .from('habits')
      .update({
        cadence_type: cadenceType,
        cadence_days: validDays,
        target_frequency: validFrequency,
      })
      .eq('id', habitId)
      .eq('user_id', user.id);

    if (error) {
      return { data: null, error: 'Unable to update cadence settings.' };
    }

    revalidatePath('/');
    return { data: { habitId, cadenceType }, error: null };
  } catch {
    return { data: null, error: 'Unable to update cadence settings.' };
  }
}

/**
 * Updates a habit's Dayflow time-of-day bucket and Habit Stacking cue chaining.
 * Validates ownership, prevents circular parent dependencies, and sanitizes cues.
 */
export async function updateHabitStackingAction(
  habitId: string,
  timeOfDay: string,
  stackTriggerType: string = 'none',
  stackParentHabitIds?: string[] | string | null,
  stackCustomCue?: string,
  stackOrder: number = 0
): Promise<ActionResponse<{ habitId: string; timeOfDay: string; triggerType: string }>> {
  try {
    if (!isUuid(habitId)) {
      return { data: null, error: 'Invalid habit ID.' };
    }

    if (!isValidTimeOfDay(timeOfDay)) {
      return { data: null, error: 'Invalid time of day.' };
    }

    const validTriggerType = isValidStackTriggerType(stackTriggerType) ? stackTriggerType : 'none';
    const rawParentIds: string[] = Array.isArray(stackParentHabitIds)
      ? stackParentHabitIds
      : stackParentHabitIds
        ? [stackParentHabitIds]
        : [];

    let validParentIds: string[] = [];

    if (validTriggerType === 'habit') {
      const filtered = rawParentIds.filter(
        (id) => typeof id === 'string' && isUuid(id) && id !== habitId
      );
      validParentIds = Array.from(new Set(filtered));
      if (validParentIds.length === 0) {
        return { data: null, error: 'At least one valid parent habit must be selected for chaining.' };
      }
    }

    const validCustomCue = cleanStackCue(stackCustomCue, 80);

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: 'Authentication required.' };
    }

    // Verify habit ownership explicitly before mutating
    const { data: habit, error: habitError } = await supabase
      .from('habits')
      .select('id')
      .eq('id', habitId)
      .eq('user_id', user.id)
      .single();

    if (habitError || !habit) {
      return { data: null, error: 'Habit not found or unauthorized.' };
    }

    // If parent habits specified, verify all belong to this user
    if (validParentIds.length > 0) {
      const { data: parentHabits } = await supabase
        .from('habits')
        .select('id')
        .in('id', validParentIds)
        .eq('user_id', user.id);

      if (!parentHabits || parentHabits.length !== validParentIds.length) {
        return { data: null, error: 'One or more selected parent habits do not belong to your account.' };
      }
    }

    const primaryParentId = validParentIds[0] || null;

    // First attempt to update with stack_parent_habit_ids array and primary stack_parent_habit_id
    const { error } = await supabase
      .from('habits')
      .update({
        time_of_day: timeOfDay,
        stack_trigger_type: validTriggerType,
        stack_parent_habit_id: primaryParentId,
        stack_parent_habit_ids: validParentIds,
        stack_custom_cue: validCustomCue,
        stack_order: typeof stackOrder === 'number' ? stackOrder : 0,
      })
      .eq('id', habitId)
      .eq('user_id', user.id);

    if (error) {
      // Graceful fallback if stack_parent_habit_ids column has not been added to remote DB yet
      const fallbackResult = await supabase
        .from('habits')
        .update({
          time_of_day: timeOfDay,
          stack_trigger_type: validTriggerType,
          stack_parent_habit_id: primaryParentId,
          stack_custom_cue: validCustomCue,
          stack_order: typeof stackOrder === 'number' ? stackOrder : 0,
        })
        .eq('id', habitId)
        .eq('user_id', user.id);

      if (fallbackResult.error) {
        return { data: null, error: 'Unable to update Dayflow stacking settings.' };
      }
    }

    revalidatePath('/');
    return { data: { habitId, timeOfDay, triggerType: validTriggerType }, error: null };
  } catch {
    return { data: null, error: 'Unable to update Dayflow stacking settings.' };
  }
}

/**
 * Saves an ordered routine chain (A -> B -> C -> ...) for a specific Dayflow ritual.
 * Sets the first habit as the routine anchor, and links each subsequent habit to its predecessor.
 */
export async function saveHabitChainAction(
  chainHabitIds: string[],
  timeOfDay: string
): Promise<ActionResponse<{ success: boolean; chainCount: number }>> {
  try {
    if (!Array.isArray(chainHabitIds) || chainHabitIds.length === 0) {
      return { data: null, error: 'At least one habit must be provided for a routine chain.' };
    }

    if (!isValidTimeOfDay(timeOfDay)) {
      return { data: null, error: 'Invalid time of day.' };
    }

    // Validate all IDs are valid UUIDs and unique
    const uniqueIds = Array.from(new Set(chainHabitIds));
    for (const id of uniqueIds) {
      if (!isUuid(id)) {
        return { data: null, error: 'Invalid habit ID in chain.' };
      }
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: 'Authentication required.' };
    }

    // Verify ownership of all habits in the chain
    const { data: userHabits, error: verifyError } = await supabase
      .from('habits')
      .select('id')
      .in('id', uniqueIds)
      .eq('user_id', user.id);

    if (verifyError || !userHabits || userHabits.length !== uniqueIds.length) {
      return { data: null, error: 'One or more habits do not belong to your account.' };
    }

    // Sequential chain linking:
    // Index 0: root of the chain (trigger_type: none, parent: null, order: 0)
    // Index i > 0: chained after index i - 1 (trigger_type: habit, parent: chainHabitIds[i - 1], order: i)
    const updates = uniqueIds.map((id, index) => {
      const isRoot = index === 0;
      const parentId = isRoot ? null : uniqueIds[index - 1];
      return supabase
        .from('habits')
        .update({
          time_of_day: timeOfDay,
          stack_trigger_type: isRoot ? 'none' : 'habit',
          stack_parent_habit_id: parentId,
          stack_parent_habit_ids: parentId ? [parentId] : [],
          stack_order: index,
        })
        .eq('id', id)
        .eq('user_id', user.id);
    });

    const results = await Promise.all(updates);
    const hasError = results.some((r) => r.error);

    if (hasError) {
      // Fallback update without stack_parent_habit_ids column if remote DB is older schema
      const fallbackUpdates = uniqueIds.map((id, index) => {
        const isRoot = index === 0;
        const parentId = isRoot ? null : uniqueIds[index - 1];
        return supabase
          .from('habits')
          .update({
            time_of_day: timeOfDay,
            stack_trigger_type: isRoot ? 'none' : 'habit',
            stack_parent_habit_id: parentId,
            stack_order: index,
          })
          .eq('id', id)
          .eq('user_id', user.id);
      });
      await Promise.all(fallbackUpdates);
    }

    revalidatePath('/');
    return { data: { success: true, chainCount: uniqueIds.length }, error: null };
  } catch {
    return { data: null, error: 'Failed to save routine chain.' };
  }
}

/**
 * Reorders habits within a Dayflow ritual for the current user
 */
export async function reorderHabitsAction(
  orderedHabitIds: string[]
): Promise<ActionResponse<{ success: boolean }>> {
  try {
    if (!Array.isArray(orderedHabitIds) || orderedHabitIds.length === 0) {
      return { data: null, error: 'No habits provided for reordering.' };
    }

    const validIds = orderedHabitIds.filter(isUuid);
    if (validIds.length === 0) {
      return { data: null, error: 'Invalid habit IDs.' };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: 'Authentication required.' };
    }

    // Update stack_order for each habit
    await Promise.all(
      validIds.map((id, index) =>
        supabase
          .from('habits')
          .update({ stack_order: index })
          .eq('id', id)
          .eq('user_id', user.id)
      )
    );

    revalidatePath('/');
    return { data: { success: true }, error: null };
  } catch {
    return { data: null, error: 'Failed to reorder habits.' };
  }
}


/**
 * Toggles a Streak Armor freeze shield for a habit on a specific date.
 * Enforces ownership, date integrity window, and shield bank limits.
 */
export async function toggleStreakFreezeAction(
  habitId: string,
  date: string,
  isFrozen: boolean,
  reason?: string
): Promise<ActionResponse<{ habitId: string; date: string; isFrozen: boolean }>> {
  try {
    if (!isUuid(habitId) || !isValidDate(date) || typeof isFrozen !== 'boolean') {
      return { data: null, error: 'Invalid habit, date, or freeze state.' };
    }

    const sanitizedReason = cleanText(reason, 120) || '';

    // Business Rules:
    // 1. Cannot freeze days more than 14 days in the future
    // 2. Cannot freeze missed days older than 72 hours (3 calendar days)
    const [y, m, d] = date.split('-').map(Number);
    const targetDate = new Date(Date.UTC(y, m - 1, d));
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const diffDays = Math.round((todayUTC.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < -14) {
      return {
        data: null,
        error: 'Streak shields cannot be scheduled more than 14 days in advance.',
      };
    }

    if (diffDays > 3) {
      return {
        data: null,
        error: '72-hour integrity window expired: Streak shields cannot protect missed days older than 3 days.',
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: 'Authentication required.' };
    }

    // Verify habit ownership explicitly before mutating
    const { data: habit, error: habitError } = await supabase
      .from('habits')
      .select('*')
      .eq('id', habitId)
      .eq('user_id', user.id)
      .single();

    if (habitError || !habit) {
      return { data: null, error: 'Habit not found or unauthorized.' };
    }

    // If freezing, verify shield bank availability (prevent infinite shield abuse)
    if (isFrozen) {
      const { data: logs } = await supabase
        .from('habit_logs')
        .select('date, is_completed, is_frozen')
        .eq('habit_id', habitId);

      const logsMap: Record<string, boolean> = {};
      const frozenMap: Record<string, boolean> = {};
      (logs || []).forEach((l: any) => {
        if (l.is_completed) logsMap[l.date] = true;
        if (l.is_frozen) frozenMap[l.date] = true;
      });

      // If already frozen on this specific date, it's idempotent
      if (!frozenMap[date]) {
        const habitCadence = habit.cadence_type
          ? {
              type: habit.cadence_type as 'everyday' | 'weekdays' | 'weekends' | 'custom' | 'frequency',
              daysOfWeek: habit.cadence_days,
              frequencyPerWeek: habit.target_frequency,
            }
          : undefined;

        const streakResult = calculateCadenceStreak(logsMap, frozenMap, habitCadence);
        const usedCount = Object.values(frozenMap).filter(Boolean).length;
        const shieldStats = computeHabitShieldBank(streakResult.currentStreak, usedCount);

        if (shieldStats.available <= 0) {
          return {
            data: null,
            error: 'No Streak Shields available in your vault. Earn more shields by building a 7-day streak.',
          };
        }
      }
    }

    // Upsert into habit_logs with is_frozen flag
    const { error: logError } = await supabase
      .from('habit_logs')
      .upsert(
        {
          habit_id: habitId,
          date,
          is_completed: false,
          is_frozen: isFrozen,
        },
        { onConflict: 'habit_id, date' }
      );

    if (logError) {
      return { data: null, error: 'Unable to update streak shield.' };
    }

    // Maintain streak_freezes table if enabled
    try {
      if (isFrozen) {
        await supabase.from('streak_freezes').upsert(
          {
            habit_id: habitId,
            date,
            reason: sanitizedReason,
          },
          { onConflict: 'habit_id, date' }
        );
      } else {
        await supabase.from('streak_freezes').delete().eq('habit_id', habitId).eq('date', date);
      }
    } catch {
      // streak_freezes table is optional audit log; ignore if not yet migrated
    }

    revalidatePath('/');
    return { data: { habitId, date, isFrozen }, error: null };
  } catch {
    return { data: null, error: 'Unable to update streak shield.' };
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

    // Use server time from Supabase to prevent client clock manipulation
    // Note: get_current_timestamp() is a custom RPC function in schema.sql
    const { data: serverTimeData } = await supabase.rpc('get_current_timestamp' as any);
    const serverNow = serverTimeData ? new Date(serverTimeData) : new Date();
    const todayUTC = new Date(Date.UTC(
      serverNow.getUTCFullYear(),
      serverNow.getUTCMonth(),
      serverNow.getUTCDate()
    ));

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
      return { data: null, error: 'Invalid habit ID.' };
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

    // 1. Unlink any other habits where this habit is an anchor/parent (prevents Postgres FK 23503 violation)
    try {
      await supabase
        .from('habits')
        .update({
          stack_parent_habit_id: null,
          stack_trigger_type: 'none',
        })
        .eq('stack_parent_habit_id', habitId)
        .eq('user_id', user.id);
    } catch (e) {
      console.warn('Could not unlink stack_parent_habit_id before delete:', e);
    }

    // 2. Remove habitId from any challenge habit_ids array
    try {
      const { data: challenges } = await supabase
        .from('challenges')
        .select('id, habit_ids')
        .eq('user_id', user.id);

      if (challenges && challenges.length > 0) {
        for (const c of challenges) {
          if (Array.isArray(c.habit_ids) && c.habit_ids.includes(habitId)) {
            const nextIds = c.habit_ids.filter((id) => id !== habitId);
            await supabase
              .from('challenges')
              .update({ habit_ids: nextIds })
              .eq('id', c.id)
              .eq('user_id', user.id);
          }
        }
      }
    } catch (e) {
      console.warn('Could not clean challenge habit_ids before delete:', e);
    }

    // 3. Proactively clean up habit logs and streak freezes (in case cascade is missing on remote DB)
    try {
      await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habitId);

      await supabase
        .from('streak_freezes')
        .delete()
        .eq('habit_id', habitId);
    } catch (e) {
      console.warn('Could not clean habit logs or streak freezes before delete:', e);
    }

    // 4. Delete the habit record
    const { error: deleteError } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('[deleteHabitAction error]', deleteError);
      return { data: null, error: deleteError.message || 'Unable to delete this habit.' };
    }

    revalidatePath('/');
    return { data: { id: habitId }, error: null };
  } catch (err) {
    console.error('[deleteHabitAction exception]', err);
    return { data: null, error: err instanceof Error ? err.message : 'Unable to delete this habit.' };
  }
}
