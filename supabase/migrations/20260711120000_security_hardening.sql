-- Migration: Security hardening — admin allowlist for RLS + inquiry abuse limits
-- Date: 2026-07-11
--
-- Fixes two issues found in a security audit:
--   1. Old policies granted full CRM access to ANY authenticated Supabase user
--      (anyone who could sign up with the public anon key). Policies now
--      require membership in an admin allowlist.
--   2. The inquiries table accepted unbounded anonymous inserts. Column
--      length limits are now enforced at the database layer so direct
--      REST/PostgREST calls cannot bypass the app's validation.
--
-- ⚠️ ACTION REQUIRED after applying this migration (SQL editor):
--   INSERT INTO public.admin_emails (email) VALUES ('your-admin@yourdomain.com');
-- Until at least one admin email is registered, /admin data access is locked.
-- Also disable public signups: Dashboard → Authentication → Sign In / Up →
-- turn OFF "Allow new users to sign up" (this site has no end-user accounts).

-- 1. Admin allowlist table. RLS is enabled with NO policies and API roles are
--    revoked, so it is only manageable via the service role / SQL editor.
CREATE TABLE IF NOT EXISTS public.admin_emails (
    email TEXT PRIMARY KEY CHECK (email = lower(email))
);

ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_emails FROM anon, authenticated;

-- 2. is_admin(): true when the caller's JWT email is on the allowlist.
--    SECURITY DEFINER so it can read admin_emails despite the revokes above.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_emails
    WHERE email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- 3. Replace "any authenticated user" policies with admin-only policies.
DROP POLICY IF EXISTS "Allow admin select inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Allow admin update inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Allow admin delete inquiries" ON public.inquiries;

CREATE POLICY "Allow admin select inquiries" ON public.inquiries
    FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Allow admin update inquiries" ON public.inquiries
    FOR UPDATE TO authenticated
    USING (public.is_admin());

CREATE POLICY "Allow admin delete inquiries" ON public.inquiries
    FOR DELETE TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Allow admin select leads" ON public.leads;
DROP POLICY IF EXISTS "Allow admin insert leads" ON public.leads;
DROP POLICY IF EXISTS "Allow admin update leads" ON public.leads;
DROP POLICY IF EXISTS "Allow admin delete leads" ON public.leads;

CREATE POLICY "Allow admin select leads" ON public.leads
    FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Allow admin insert leads" ON public.leads
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin update leads" ON public.leads
    FOR UPDATE TO authenticated
    USING (public.is_admin());

CREATE POLICY "Allow admin delete leads" ON public.leads
    FOR DELETE TO authenticated
    USING (public.is_admin());

-- 4. Tighten the public insert policy: submitters may only create fresh
--    inquiries, never pre-set a converted/archived status.
DROP POLICY IF EXISTS "Allow public inserts" ON public.inquiries;
CREATE POLICY "Allow public inserts" ON public.inquiries
    FOR INSERT
    WITH CHECK (status = 'new');

-- 5. Size limits enforced at the database layer (NOT VALID so any existing
--    oversized rows don't block the migration; new rows are checked).
ALTER TABLE public.inquiries
    ADD CONSTRAINT inquiries_name_len CHECK (char_length(name) BETWEEN 2 AND 100) NOT VALID;
ALTER TABLE public.inquiries
    ADD CONSTRAINT inquiries_email_len CHECK (char_length(email) <= 254) NOT VALID;
ALTER TABLE public.inquiries
    ADD CONSTRAINT inquiries_company_len CHECK (company IS NULL OR char_length(company) <= 100) NOT VALID;
ALTER TABLE public.inquiries
    ADD CONSTRAINT inquiries_budget_len CHECK (budget IS NULL OR char_length(budget) <= 50) NOT VALID;
ALTER TABLE public.inquiries
    ADD CONSTRAINT inquiries_message_len CHECK (message IS NULL OR char_length(message) <= 2000) NOT VALID;
ALTER TABLE public.inquiries
    ADD CONSTRAINT inquiries_interests_bounds CHECK (
        coalesce(array_length(interests, 1), 0) <= 12
        AND char_length(array_to_string(interests, ',')) <= 500
    ) NOT VALID;
