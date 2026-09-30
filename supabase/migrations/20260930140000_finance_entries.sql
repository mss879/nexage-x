-- Migration: Finance — expenses, other income and liquidity
-- Date: 2026-09-30
--
-- public.finance_entries is the company's cash book for everything that is NOT
-- an invoice payment:
--   expense  project costs, software, salaries, anything a director or a member
--            of staff paid for
--   income   money that came in without an invoice (capital, an opening
--            balance, a cash job)
--
-- Invoice payments are NOT copied here — they already live in
-- public.invoice_payments and count as income automatically, so nothing is
-- typed twice or counted twice.
--
-- public.finance_liquidity() adds it all up per currency:
--     balance = other income + invoice payments − expenses
-- Currencies are never converted or added together.
--
-- Admin-only. Runs in one transaction and is safe to run more than once.

BEGIN;

-- 0. Depends on the team, clients/projects and invoice payments migrations
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
    IF to_regclass('public.invoice_payments') IS NULL THEN
        RAISE EXCEPTION 'public.invoice_payments is missing — run supabase/migrations/20260930130000_invoice_payments.sql first, then run this file again.';
    END IF;
END
$$;

-- 1. Entries
CREATE TABLE IF NOT EXISTS public.finance_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'AED' CHECK (currency ~ '^[A-Z]{3}$'),
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category TEXT NOT NULL DEFAULT 'Other',
    description TEXT NOT NULL,

    client_id UUID REFERENCES public.clients (id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects (id) ON DELETE SET NULL,

    -- Who paid (expenses): a team member, or a name typed in for anyone else
    paid_by_id UUID REFERENCES public.team_members (id) ON DELETE SET NULL,
    paid_by_name TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_by UUID DEFAULT auth.uid()
);

ALTER TABLE public.finance_entries DROP CONSTRAINT IF EXISTS finance_entries_shape;
ALTER TABLE public.finance_entries
    ADD CONSTRAINT finance_entries_shape CHECK (
        char_length(category) BETWEEN 1 AND 60
        AND char_length(description) BETWEEN 1 AND 300
        AND char_length(paid_by_name) <= 80
        AND char_length(notes) <= 2000
    );

CREATE INDEX IF NOT EXISTS idx_finance_entries_date ON public.finance_entries (entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_finance_entries_type ON public.finance_entries (type, currency);
CREATE INDEX IF NOT EXISTS idx_finance_entries_client ON public.finance_entries (client_id);
CREATE INDEX IF NOT EXISTS idx_finance_entries_project ON public.finance_entries (project_id);

-- 2. Bookkeeping: updated_at, and an entry on a project belongs to that
--    project's client.
CREATE OR REPLACE FUNCTION public.finance_entries_touch()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        NEW.updated_at := timezone('utc'::text, now());
    END IF;
    IF NEW.project_id IS NOT NULL THEN
        SELECT p.client_id INTO NEW.client_id FROM public.projects p WHERE p.id = NEW.project_id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_finance_entries_touch ON public.finance_entries;
CREATE TRIGGER tr_finance_entries_touch
    BEFORE INSERT OR UPDATE ON public.finance_entries
    FOR EACH ROW EXECUTE FUNCTION public.finance_entries_touch();

-- 3. Row Level Security: allow-listed admins only
ALTER TABLE public.finance_entries ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.finance_entries FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.finance_entries TO authenticated;
GRANT ALL ON public.finance_entries TO service_role;

DROP POLICY IF EXISTS "Allow admin select finance_entries" ON public.finance_entries;
DROP POLICY IF EXISTS "Allow admin insert finance_entries" ON public.finance_entries;
DROP POLICY IF EXISTS "Allow admin update finance_entries" ON public.finance_entries;
DROP POLICY IF EXISTS "Allow admin delete finance_entries" ON public.finance_entries;

CREATE POLICY "Allow admin select finance_entries" ON public.finance_entries
    FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Allow admin insert finance_entries" ON public.finance_entries
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin update finance_entries" ON public.finance_entries
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin delete finance_entries" ON public.finance_entries
    FOR DELETE TO authenticated
    USING (public.is_admin());

-- 4. Liquidity per currency, over ALL rows (the API caps a plain select at
--    1,000 rows, so the sums are done here). Runs as the caller: Row Level
--    Security applies, so a non-admin simply gets nothing back.
--    p_since (optional) also returns money in / out from that date on — used
--    for "this month".
CREATE OR REPLACE FUNCTION public.finance_liquidity(p_since DATE DEFAULT NULL)
RETURNS TABLE (
    currency TEXT,
    manual_income NUMERIC,
    invoice_income NUMERIC,
    expenses NUMERIC,
    balance NUMERIC,
    income_since NUMERIC,
    expenses_since NUMERIC
)
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  WITH flows AS (
    SELECT
        e.currency AS code,
        CASE WHEN e.type = 'income' THEN e.amount ELSE 0 END AS manual_in,
        0::numeric AS invoice_in,
        CASE WHEN e.type = 'expense' THEN e.amount ELSE 0 END AS money_out,
        e.entry_date AS on_date
    FROM public.finance_entries e
    UNION ALL
    SELECT i.currency, 0, p.amount, 0, p.paid_on
    FROM public.invoice_payments p
    JOIN public.invoices i ON i.id = p.invoice_id
  )
  SELECT
      f.code,
      sum(f.manual_in),
      sum(f.invoice_in),
      sum(f.money_out),
      sum(f.manual_in + f.invoice_in - f.money_out),
      coalesce(sum(f.manual_in + f.invoice_in) FILTER (WHERE p_since IS NOT NULL AND f.on_date >= p_since), 0),
      coalesce(sum(f.money_out) FILTER (WHERE p_since IS NOT NULL AND f.on_date >= p_since), 0)
  FROM flows f
  GROUP BY f.code
  ORDER BY f.code;
$$;

REVOKE ALL ON FUNCTION public.finance_liquidity(DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.finance_liquidity(DATE) TO authenticated, service_role;

NOTIFY pgrst, 'reload schema';

COMMIT;
