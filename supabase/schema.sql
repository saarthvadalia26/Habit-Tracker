-- ==============================================================================
-- Habit Tracker - Hardened Supabase SQL Schema
-- ==============================================================================

-- 1. Create habits table with length and validation constraints
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL CONSTRAINT check_habit_title CHECK (char_length(trim(title)) > 0 AND char_length(title) <= 60),
    color_theme TEXT NOT NULL DEFAULT '#6366F1' CONSTRAINT check_color_theme CHECK (char_length(color_theme) <= 25),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create habit_logs table
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Ensure only 1 log entry exists per habit per date
    CONSTRAINT unique_habit_date UNIQUE (habit_id, date)
);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON public.habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON public.habit_logs(habit_id, date);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for habits
-- Users can only read their own habits
DROP POLICY IF EXISTS "Users can view their own habits" ON public.habits;
CREATE POLICY "Users can view their own habits"
    ON public.habits
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own habits
DROP POLICY IF EXISTS "Users can create their own habits" ON public.habits;
CREATE POLICY "Users can create their own habits"
    ON public.habits
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own habits
DROP POLICY IF EXISTS "Users can update their own habits" ON public.habits;
CREATE POLICY "Users can update their own habits"
    ON public.habits
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own habits
DROP POLICY IF EXISTS "Users can delete their own habits" ON public.habits;
CREATE POLICY "Users can delete their own habits"
    ON public.habits
    FOR DELETE
    USING (auth.uid() = user_id);

-- 6. RLS Policies for habit_logs (Enforces ownership via the parent habit)
DROP POLICY IF EXISTS "Users can view logs for their own habits" ON public.habit_logs;
CREATE POLICY "Users can view logs for their own habits"
    ON public.habit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.habits
            WHERE public.habits.id = public.habit_logs.habit_id
            AND public.habits.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert logs for their own habits" ON public.habit_logs;
CREATE POLICY "Users can insert logs for their own habits"
    ON public.habit_logs
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.habits
            WHERE public.habits.id = public.habit_logs.habit_id
            AND public.habits.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update logs for their own habits" ON public.habit_logs;
CREATE POLICY "Users can update logs for their own habits"
    ON public.habit_logs
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.habits
            WHERE public.habits.id = public.habit_logs.habit_id
            AND public.habits.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.habits
            WHERE public.habits.id = public.habit_logs.habit_id
            AND public.habits.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete logs for their own habits" ON public.habit_logs;
CREATE POLICY "Users can delete logs for their own habits"
    ON public.habit_logs
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.habits
            WHERE public.habits.id = public.habit_logs.habit_id
            AND public.habits.user_id = auth.uid()
        )
    );

-- 7. Secure Account Deletion RPC Function
-- Enables authenticated users to completely wipe their account and all data
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated: cannot delete unauthenticated account';
    END IF;

    -- Explicitly delete all habits (cascades to habit_logs)
    DELETE FROM public.habits WHERE user_id = current_user_id;

    -- Delete auth identities and sessions to guarantee clean cascade
    DELETE FROM auth.identities WHERE user_id = current_user_id;
    DELETE FROM auth.sessions WHERE user_id = current_user_id;

    -- Permanently delete the user record from auth.users
    DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user_account() FROM public;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

-- 8. Hardened Role Permissions (Principle of Least Privilege: NO GRANT ALL for authenticated users)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.habits TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.habit_logs TO authenticated;
GRANT ALL ON TABLE public.habits TO service_role;
GRANT ALL ON TABLE public.habit_logs TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- Ensure future tables grant least privilege automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated, service_role;