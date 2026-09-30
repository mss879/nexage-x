-- Migration: Team — people who can sign in to /admin, and their role
-- Date: 2026-09-30
--
-- Until now "who is an admin" lived in two places: the ADMIN_EMAILS env var
-- (checked by the app) and public.admin_emails (checked by Row Level Security).
-- Neither can be edited from the admin, so nobody could be added without a
-- deploy and a SQL statement.
--
-- This adds public.team_members — one row per Supabase login that may use the
-- admin — with a role:
--   super_admin  may add, deactivate and reset other people (Team page)
--   admin        everything else
--
-- public.admin_emails and public.is_admin() are left exactly as they are. A
-- trigger keeps admin_emails in step with team_members, so every existing RLS
-- policy keeps working and removing someone from the team removes their data
-- access in the same transaction.
--
-- Everyone already in admin_emails with a Supabase login becomes a super_admin.
--
-- Runs in one transaction and is safe to run more than once. If no super admin
-- could be set up, nothing is changed.
--
-- Break-glass: if you are ever locked out of /admin after running this, run
--     DROP FUNCTION public.current_admin();
-- in the SQL editor. The app then falls back to the ADMIN_EMAILS env var, as it
-- worked before this migration. Run this file again to switch back.

BEGIN;

-- 0. Depends on the admin allow-list from the security hardening migration
DO $$
BEGIN
    IF to_regprocedure('public.is_admin()') IS NULL OR to_regclass('public.admin_emails') IS NULL THEN
        RAISE EXCEPTION 'public.is_admin() / public.admin_emails are missing — run supabase/RUN_THIS_pending_setup.sql first, then run this file again.';
    END IF;
END
$$;

-- 1. Team members. The id IS the Supabase auth user id.
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),

    active BOOLEAN NOT NULL DEFAULT true,
    deactivated_at TIMESTAMPTZ,
    created_by UUID DEFAULT auth.uid()
);

ALTER TABLE public.team_members DROP CONSTRAINT IF EXISTS team_members_shape;
ALTER TABLE public.team_members
    ADD CONSTRAINT team_members_shape CHECK (
        email = lower(email)
        AND char_length(email) BETWEEN 5 AND 254
        AND char_length(full_name) BETWEEN 1 AND 80
        AND active = (deactivated_at IS NULL)
    );

CREATE UNIQUE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members (email);

-- 2. Bookkeeping + the rules nobody may break from the app.
--    auth.uid() is NULL in the SQL editor and for the service role, which may
--    do anything; a signed-in person may not change their own access or
--    anyone's email.
CREATE OR REPLACE FUNCTION public.team_members_touch()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.email := lower(NEW.email);

    IF TG_OP = 'UPDATE' THEN
        NEW.id := OLD.id;
        NEW.created_at := OLD.created_at;
        NEW.updated_at := timezone('utc'::text, now());

        IF auth.uid() IS NOT NULL THEN
            IF NEW.email <> OLD.email THEN
                RAISE EXCEPTION 'A team member''s email can''t be changed here.' USING ERRCODE = 'check_violation';
            END IF;
            IF OLD.id = auth.uid() AND (NEW.active <> OLD.active OR NEW.role <> OLD.role) THEN
                RAISE EXCEPTION 'You can''t deactivate your own account or change your own role.' USING ERRCODE = 'check_violation';
            END IF;
        END IF;
    END IF;

    NEW.deactivated_at := CASE
        WHEN NEW.active THEN NULL
        ELSE coalesce(NEW.deactivated_at, timezone('utc'::text, now()))
    END;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_team_members_touch ON public.team_members;
CREATE TRIGGER tr_team_members_touch
    BEFORE INSERT OR UPDATE ON public.team_members
    FOR EACH ROW EXECUTE FUNCTION public.team_members_touch();

-- 3. admin_emails follows team_members, in the same transaction — so RLS
--    access is granted and revoked together with team membership. There must
--    always be one active super admin left.
CREATE OR REPLACE FUNCTION public.team_members_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
        IF TG_OP = 'DELETE' OR NOT NEW.active OR NEW.email <> OLD.email THEN
            DELETE FROM public.admin_emails WHERE email = OLD.email;
        END IF;

        IF OLD.role = 'super_admin' AND OLD.active
           AND NOT EXISTS (SELECT 1 FROM public.team_members WHERE role = 'super_admin' AND active) THEN
            RAISE EXCEPTION 'At least one active super admin must remain.' USING ERRCODE = 'check_violation';
        END IF;
    END IF;

    IF TG_OP IN ('INSERT', 'UPDATE') AND NEW.active THEN
        INSERT INTO public.admin_emails (email) VALUES (NEW.email) ON CONFLICT (email) DO NOTHING;
    END IF;

    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS tr_team_members_sync ON public.team_members;
CREATE TRIGGER tr_team_members_sync
    AFTER INSERT OR UPDATE OR DELETE ON public.team_members
    FOR EACH ROW EXECUTE FUNCTION public.team_members_sync();

-- 4. Role helpers.
--    is_super_admin(): for the policies below and the Team page.
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.is_admin() AND EXISTS (
    SELECT 1
    FROM public.team_members
    WHERE id = (SELECT auth.uid()) AND active AND role = 'super_admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated, service_role;

--    current_admin(): what the app asks on every request — "may this login use
--    the admin, and as what?". No row = no access.
CREATE OR REPLACE FUNCTION public.current_admin()
RETURNS TABLE (id UUID, email TEXT, full_name TEXT, role TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT m.id, m.email, m.full_name, m.role
  FROM public.team_members m
  WHERE m.id = (SELECT auth.uid()) AND m.active AND public.is_admin();
$$;

REVOKE ALL ON FUNCTION public.current_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_admin() TO authenticated, service_role;

-- 5. Row Level Security: every admin can see the team (to assign work), only a
--    super admin can change it. There is deliberately no DELETE policy — people
--    are deactivated, so their name stays on the work they did.
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.team_members FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;

DROP POLICY IF EXISTS "Allow admin select team_members" ON public.team_members;
DROP POLICY IF EXISTS "Allow super admin insert team_members" ON public.team_members;
DROP POLICY IF EXISTS "Allow super admin update team_members" ON public.team_members;

CREATE POLICY "Allow admin select team_members" ON public.team_members
    FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Allow super admin insert team_members" ON public.team_members
    FOR INSERT TO authenticated
    WITH CHECK (public.is_super_admin());

CREATE POLICY "Allow super admin update team_members" ON public.team_members
    FOR UPDATE TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- 6. Seed: today's admins become super admins. Only while there is no super
--    admin at all, so running this again never promotes anyone.
INSERT INTO public.team_members (id, email, full_name, role)
SELECT
    u.id,
    lower(u.email),
    left(coalesce(nullif(btrim(u.raw_user_meta_data ->> 'full_name'), ''), initcap(split_part(u.email, '@', 1))), 80),
    'super_admin'
FROM auth.users u
JOIN public.admin_emails a ON a.email = lower(u.email)
WHERE NOT EXISTS (SELECT 1 FROM public.team_members WHERE role = 'super_admin')
ON CONFLICT (id) DO NOTHING;

--    Repair: every active member is on the allow-list (covers a re-run after
--    admin_emails was edited by hand).
INSERT INTO public.admin_emails (email)
SELECT email FROM public.team_members WHERE active
ON CONFLICT (email) DO NOTHING;

-- 7. No lockout: either someone can manage the team, or none of this is kept.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.team_members WHERE role = 'super_admin' AND active) THEN
        RAISE EXCEPTION 'No super admin could be set up: no Supabase login matches an email in public.admin_emails. Run supabase/RUN_THIS_pending_setup.sql first (check the ★ email). Nothing was changed.';
    END IF;
END
$$;

-- Tell the API about the new table and functions straight away
NOTIFY pgrst, 'reload schema';

COMMIT;
