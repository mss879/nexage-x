-- Migration: Clients 360 — clients and their projects
-- Date: 2026-09-30
--
-- One row per client (company and/or a contact person) and the projects done
-- for them. Invoices, to-dos and income/expense entries link to these rows in
-- the later migrations, which is what makes the client page a full picture.
--
-- A client with projects can't be deleted (archive it instead); deleting a
-- client only unlinks its invoices, to-dos and ledger entries.
--
-- Admin-only. Runs in one transaction and is safe to run more than once.

BEGIN;

-- 0. Depends on the admin allow-list from the security hardening migration
DO $$
BEGIN
    IF to_regprocedure('public.is_admin()') IS NULL THEN
        RAISE EXCEPTION 'public.is_admin() is missing — run supabase/RUN_THIS_pending_setup.sql first, then run this file again.';
    END IF;
END
$$;

-- 1. Clients
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    company TEXT NOT NULL DEFAULT '',
    contact_name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    country TEXT NOT NULL DEFAULT '',
    website TEXT NOT NULL DEFAULT '',
    tax_id TEXT NOT NULL DEFAULT '',

    -- The currency this client is normally billed in — preselected on a new invoice
    default_currency TEXT NOT NULL DEFAULT 'AED' CHECK (default_currency ~ '^[A-Z]{3}$'),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    notes TEXT NOT NULL DEFAULT '',
    created_by UUID DEFAULT auth.uid()
);

ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_shape;
ALTER TABLE public.clients
    ADD CONSTRAINT clients_shape CHECK (
        (company <> '' OR contact_name <> '')
        AND char_length(company) <= 120
        AND char_length(contact_name) <= 120
        AND char_length(email) <= 254
        AND char_length(phone) <= 40
        AND char_length(address) <= 400
        AND char_length(country) <= 60
        AND char_length(website) <= 200
        AND char_length(tax_id) <= 40
        AND char_length(notes) <= 4000
    );

CREATE INDEX IF NOT EXISTS idx_clients_company ON public.clients (lower(company));
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients (status);

-- 2. Projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    client_id UUID NOT NULL REFERENCES public.clients (id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('planned', 'active', 'on_hold', 'completed', 'cancelled')),
    start_date DATE,
    due_date DATE,

    -- What the project is worth to the company, in one currency
    value NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (value >= 0),
    currency TEXT NOT NULL DEFAULT 'AED' CHECK (currency ~ '^[A-Z]{3}$'),
    created_by UUID DEFAULT auth.uid()
);

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_shape;
ALTER TABLE public.projects
    ADD CONSTRAINT projects_shape CHECK (
        char_length(name) BETWEEN 1 AND 160
        AND char_length(description) <= 4000
        AND (start_date IS NULL OR due_date IS NULL OR due_date >= start_date)
    );

CREATE INDEX IF NOT EXISTS idx_projects_client ON public.projects (client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_due_date ON public.projects (due_date) WHERE due_date IS NOT NULL;

-- 3. Keep updated_at current
CREATE OR REPLACE FUNCTION public.clients_touch()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_clients_touch ON public.clients;
CREATE TRIGGER tr_clients_touch
    BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION public.clients_touch();

CREATE OR REPLACE FUNCTION public.projects_touch()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_projects_touch ON public.projects;
CREATE TRIGGER tr_projects_touch
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.projects_touch();

-- 4. Row Level Security: allow-listed admins only
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.clients, public.projects FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients, public.projects TO authenticated;
GRANT ALL ON public.clients, public.projects TO service_role;

DROP POLICY IF EXISTS "Allow admin select clients" ON public.clients;
DROP POLICY IF EXISTS "Allow admin insert clients" ON public.clients;
DROP POLICY IF EXISTS "Allow admin update clients" ON public.clients;
DROP POLICY IF EXISTS "Allow admin delete clients" ON public.clients;

CREATE POLICY "Allow admin select clients" ON public.clients
    FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Allow admin insert clients" ON public.clients
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin update clients" ON public.clients
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin delete clients" ON public.clients
    FOR DELETE TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Allow admin select projects" ON public.projects;
DROP POLICY IF EXISTS "Allow admin insert projects" ON public.projects;
DROP POLICY IF EXISTS "Allow admin update projects" ON public.projects;
DROP POLICY IF EXISTS "Allow admin delete projects" ON public.projects;

CREATE POLICY "Allow admin select projects" ON public.projects
    FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Allow admin insert projects" ON public.projects
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin update projects" ON public.projects
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin delete projects" ON public.projects
    FOR DELETE TO authenticated
    USING (public.is_admin());

NOTIFY pgrst, 'reload schema';

COMMIT;
