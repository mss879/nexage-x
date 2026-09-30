-- Migration: To-dos — tasks assigned to team members
-- Date: 2026-09-30
--
-- A to-do has a title, an optional due date, a priority and one assignee from
-- the team. It can point at a client and/or a project so it shows up on that
-- client's page. Due dates feed the calendar on the admin dashboard.
--
-- Admin-only. Runs in one transaction and is safe to run more than once.

BEGIN;

-- 0. Depends on the team and the clients/projects migrations
DO $$
BEGIN
    IF to_regprocedure('public.is_admin()') IS NULL THEN
        RAISE EXCEPTION 'public.is_admin() is missing — run supabase/RUN_THIS_pending_setup.sql first, then run this file again.';
    END IF;
    IF to_regclass('public.team_members') IS NULL THEN
        RAISE EXCEPTION 'public.team_members is missing — run supabase/migrations/20260930100000_team_members.sql first, then run this file again.';
    END IF;
    IF to_regclass('public.clients') IS NULL OR to_regclass('public.projects') IS NULL THEN
        RAISE EXCEPTION 'public.clients / public.projects are missing — run supabase/migrations/20260930110000_clients_projects.sql first, then run this file again.';
    END IF;
END
$$;

-- 1. To-dos
CREATE TABLE IF NOT EXISTS public.todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    due_date DATE,
    completed_at TIMESTAMPTZ,

    -- A deactivated member keeps their to-dos; only deleting the login unassigns them
    assignee_id UUID REFERENCES public.team_members (id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.clients (id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects (id) ON DELETE SET NULL,
    created_by UUID DEFAULT auth.uid()
);

ALTER TABLE public.todos DROP CONSTRAINT IF EXISTS todos_shape;
ALTER TABLE public.todos
    ADD CONSTRAINT todos_shape CHECK (
        char_length(title) BETWEEN 1 AND 200
        AND char_length(description) <= 4000
        AND (status = 'done') = (completed_at IS NOT NULL)
    );

CREATE INDEX IF NOT EXISTS idx_todos_assignee ON public.todos (assignee_id, status);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON public.todos (due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_todos_client ON public.todos (client_id);
CREATE INDEX IF NOT EXISTS idx_todos_project ON public.todos (project_id);

-- 2. Bookkeeping: updated_at, when it was finished, and a to-do on a project
--    always belongs to that project's client.
CREATE OR REPLACE FUNCTION public.todos_touch()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        NEW.updated_at := timezone('utc'::text, now());
    END IF;

    IF NEW.status = 'done' THEN
        IF TG_OP = 'INSERT' OR OLD.status <> 'done' OR NEW.completed_at IS NULL THEN
            NEW.completed_at := timezone('utc'::text, now());
        END IF;
    ELSE
        NEW.completed_at := NULL;
    END IF;

    IF NEW.project_id IS NOT NULL THEN
        SELECT p.client_id INTO NEW.client_id FROM public.projects p WHERE p.id = NEW.project_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_todos_touch ON public.todos;
CREATE TRIGGER tr_todos_touch
    BEFORE INSERT OR UPDATE ON public.todos
    FOR EACH ROW EXECUTE FUNCTION public.todos_touch();

-- 3. Row Level Security: allow-listed admins only
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.todos FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.todos TO authenticated;
GRANT ALL ON public.todos TO service_role;

DROP POLICY IF EXISTS "Allow admin select todos" ON public.todos;
DROP POLICY IF EXISTS "Allow admin insert todos" ON public.todos;
DROP POLICY IF EXISTS "Allow admin update todos" ON public.todos;
DROP POLICY IF EXISTS "Allow admin delete todos" ON public.todos;

CREATE POLICY "Allow admin select todos" ON public.todos
    FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Allow admin insert todos" ON public.todos
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin update todos" ON public.todos
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin delete todos" ON public.todos
    FOR DELETE TO authenticated
    USING (public.is_admin());

NOTIFY pgrst, 'reload schema';

COMMIT;
