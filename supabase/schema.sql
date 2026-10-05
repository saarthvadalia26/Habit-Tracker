-- ==============================================================================
-- Habit Tracker - Hardened Supabase SQL Schema (with Challenges Support)
-- ==============================================================================

-- 1. Create habits table with length and validation constraints
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL CONSTRAINT check_habit_title CHECK (char_length(trim(title)) > 0 AND char_length(title) <= 60),
    color_theme TEXT NOT NULL DEFAULT '#6366F1' CONSTRAINT check_color_theme CHECK (color_theme ~ '^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$'),
    target_type TEXT NOT NULL DEFAULT 'boolean' CONSTRAINT check_target_type CHECK (target_type IN ('boolean', 'numeric')),
    target_value NUMERIC(10,2) DEFAULT NULL CONSTRAINT check_target_value CHECK (target_value IS NULL OR target_value > 0),
    unit TEXT DEFAULT NULL CONSTRAINT check_unit CHECK (unit IS NULL OR char_length(unit) <= 20),
    step_increment NUMERIC(10,2) DEFAULT NULL CONSTRAINT check_step_increment CHECK (step_increment IS NULL OR step_increment > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create habit_logs table
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    current_value NUMERIC(10,2) DEFAULT NULL CONSTRAINT check_current_value CHECK (current_value IS NULL OR current_value >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Ensure only 1 log entry exists per habit per date
    CONSTRAINT unique_habit_date UNIQUE (habit_id, date)
);

-- 3. Create challenges table (for 75-Day, 90-Day, 30-Day, and custom challenges)
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL CONSTRAINT check_challenge_title CHECK (char_length(trim(title)) > 0 AND char_length(title) <= 100),
    duration_days INT NOT NULL CONSTRAINT check_duration CHECK (duration_days >= 7 AND duration_days <= 365),
    start_date DATE NOT NULL,
    habit_ids UUID[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active' CONSTRAINT check_challenge_status CHECK (status IN ('active', 'completed', 'abandoned')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Direct PostgREST callers can bypass the application, so database constraints
-- must enforce the same validation rules for existing installations as well.
ALTER TABLE public.habits DROP CONSTRAINT IF EXISTS check_color_theme;
ALTER TABLE public.habits
    ADD CONSTRAINT check_color_theme CHECK (color_theme ~ '^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$');

UPDATE public.challenges SET habit_ids = '{}' WHERE habit_ids IS NULL;
ALTER TABLE public.challenges ALTER COLUMN habit_ids SET DEFAULT '{}';
ALTER TABLE public.challenges ALTER COLUMN habit_ids SET NOT NULL;
ALTER TABLE public.challenges DROP CONSTRAINT IF EXISTS check_challenge_habit_ids_count;
ALTER TABLE public.challenges
    ADD CONSTRAINT check_challenge_habit_ids_count CHECK (cardinality(habit_ids) <= 50);

-- Drop 2: Target & Numeric Goals column migrations for existing instances
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS target_type TEXT NOT NULL DEFAULT 'boolean';
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS target_value NUMERIC(10,2) DEFAULT NULL;
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT NULL;
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS step_increment NUMERIC(10,2) DEFAULT NULL;
ALTER TABLE public.habit_logs ADD COLUMN IF NOT EXISTS current_value NUMERIC(10,2) DEFAULT NULL;

-- 4. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON public.habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON public.habit_logs(habit_id, date);
CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON public.challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON public.challenges(user_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_challenge_per_user
    ON public.challenges(user_id) WHERE status = 'active';

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for habits
DROP POLICY IF EXISTS "Users can view their own habits" ON public.habits;
CREATE POLICY "Users can view their own habits"
    ON public.habits
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own habits" ON public.habits;
CREATE POLICY "Users can create their own habits"
    ON public.habits
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own habits" ON public.habits;
CREATE POLICY "Users can update their own habits"
    ON public.habits
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own habits" ON public.habits;
CREATE POLICY "Users can delete their own habits"
    ON public.habits
    FOR DELETE
    USING (auth.uid() = user_id);

-- 7. RLS Policies for habit_logs (Enforces ownership via the parent habit)
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

-- 8. RLS Policies for challenges
DROP POLICY IF EXISTS "Users can view their own challenges" ON public.challenges;
CREATE POLICY "Users can view their own challenges"
    ON public.challenges
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own challenges" ON public.challenges;
CREATE POLICY "Users can create their own challenges"
    ON public.challenges
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own challenges" ON public.challenges;
CREATE POLICY "Users can update their own challenges"
    ON public.challenges
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own challenges" ON public.challenges;
CREATE POLICY "Users can delete their own challenges"
    ON public.challenges
    FOR DELETE
    USING (auth.uid() = user_id);

-- 9. Ensure challenge habit IDs can only refer to habits owned by the same user.
-- This protects direct PostgREST calls as well as Server Action requests.
CREATE OR REPLACE FUNCTION public.validate_challenge_habit_ids()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM unnest(NEW.habit_ids) AS selected_habit(id)
        WHERE NOT EXISTS (
            SELECT 1
            FROM public.habits AS habit
            WHERE habit.id = selected_habit.id
              AND habit.user_id = NEW.user_id
        )
    ) THEN
        RAISE EXCEPTION 'Challenge habits must belong to the challenge owner';
    END IF;

    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_challenge_habit_ids() FROM PUBLIC;

DROP TRIGGER IF EXISTS validate_challenge_habit_ids ON public.challenges;
CREATE TRIGGER validate_challenge_habit_ids
    BEFORE INSERT OR UPDATE OF habit_ids, user_id ON public.challenges
    FOR EACH ROW EXECUTE FUNCTION public.validate_challenge_habit_ids();

-- 10. Secure Account Deletion RPC Function
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

    -- Explicitly delete all user challenges
    DELETE FROM public.challenges WHERE user_id = current_user_id;

    -- Explicitly delete all user monthly notes (if table exists)
    BEGIN
        DELETE FROM public.monthly_notes WHERE user_id = current_user_id;
    EXCEPTION WHEN undefined_table THEN
        -- Ignore if table has not been created yet
    END;

    -- Delete auth identities and sessions to guarantee clean cascade
    DELETE FROM auth.identities WHERE user_id = current_user_id;
    DELETE FROM auth.sessions WHERE user_id = current_user_id;

    -- Permanently delete the user record from auth.users
    DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user_account() FROM public;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

-- 11. Hardened Role Permissions (Least Privilege)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC, anon;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.habits TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.habit_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.challenges TO authenticated;
GRANT ALL ON TABLE public.habits TO service_role;
GRANT ALL ON TABLE public.habit_logs TO service_role;
GRANT ALL ON TABLE public.challenges TO service_role;
-- Future public tables must be opted into client access explicitly. PostgreSQL
-- does not enable RLS on new tables automatically, so broad default grants can
-- expose data before a policy is written.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;

-- 12. Monthly Notes & Intentions Table (Cross-Device Cloud Sync)
CREATE TABLE IF NOT EXISTS public.monthly_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    month_key TEXT NOT NULL CONSTRAINT check_month_key CHECK (char_length(month_key) <= 20),
    content TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_month_note UNIQUE (user_id, month_key)
);

CREATE INDEX IF NOT EXISTS idx_monthly_notes_user_month ON public.monthly_notes(user_id, month_key);
ALTER TABLE public.monthly_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own monthly notes" ON public.monthly_notes;
CREATE POLICY "Users can view their own monthly notes"
    ON public.monthly_notes FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own monthly notes" ON public.monthly_notes;
CREATE POLICY "Users can insert their own monthly notes"
    ON public.monthly_notes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own monthly notes" ON public.monthly_notes;
CREATE POLICY "Users can update their own monthly notes"
    ON public.monthly_notes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own monthly notes" ON public.monthly_notes;
CREATE POLICY "Users can delete their own monthly notes"
    ON public.monthly_notes FOR DELETE USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.monthly_notes TO authenticated;
GRANT ALL ON TABLE public.monthly_notes TO service_role;

