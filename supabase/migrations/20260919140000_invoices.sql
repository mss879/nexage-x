-- Migration: Finance — invoices
-- Date: 2026-09-19
--
-- One table for the invoices created in /admin/finance/invoices. Each invoice
-- keeps its own snapshot of the seller details, the client and the line items,
-- so editing your business details later never rewrites an invoice you already
-- sent. Totals are stored (the server recomputes them on every save) so the
-- finance analytics page can add them up without unpacking the line items.
--
-- Admin-only: there are NO public policies. Safe to run more than once.

-- 0. Depends on the admin allow-list from the security hardening migration
DO $$
BEGIN
    IF to_regprocedure('public.is_admin()') IS NULL THEN
        RAISE EXCEPTION 'public.is_admin() is missing — run supabase/RUN_THIS_pending_setup.sql first, then run this file again.';
    END IF;
END
$$;

-- 1. Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    number TEXT NOT NULL,
    -- draft: not sent yet · sent: waiting for payment · paid · void: cancelled, ignored by the reports
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'void')),
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    paid_at DATE,
    currency TEXT NOT NULL DEFAULT 'AED' CHECK (currency ~ '^[A-Z]{3}$'),
    -- company (or person) name, copied out of `client` for lists and reports
    client_name TEXT NOT NULL DEFAULT '',
    client JSONB NOT NULL DEFAULT '{}'::jsonb,
    seller JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- [{ "description": text, "quantity": number, "unitPrice": number }, …]
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    discount_type TEXT NOT NULL DEFAULT 'percent' CHECK (discount_type IN ('percent', 'amount')),
    discount_value NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (discount_value >= 0),
    tax_label TEXT NOT NULL DEFAULT 'VAT',
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (tax_rate BETWEEN 0 AND 100),
    subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0,
    discount_total NUMERIC(14, 2) NOT NULL DEFAULT 0,
    tax_total NUMERIC(14, 2) NOT NULL DEFAULT 0,
    total NUMERIC(14, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    terms TEXT
);

-- 2. Bounds and consistency
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_shape;
ALTER TABLE public.invoices
    ADD CONSTRAINT invoices_shape CHECK (
        char_length(number) BETWEEN 1 AND 40
        AND char_length(client_name) <= 120
        AND char_length(tax_label) BETWEEN 1 AND 20
        AND (notes IS NULL OR char_length(notes) <= 2000)
        AND (terms IS NULL OR char_length(terms) <= 2000)
        AND jsonb_typeof(client) = 'object' AND pg_column_size(client) <= 4096
        AND jsonb_typeof(seller) = 'object' AND pg_column_size(seller) <= 4096
        AND jsonb_typeof(items) = 'array' AND pg_column_size(items) <= 65536
        AND (due_date IS NULL OR due_date >= issue_date)
        AND subtotal >= 0 AND discount_total >= 0 AND tax_total >= 0 AND total >= 0
        -- a paid invoice always has a payment date, and only a paid one does
        AND (status = 'paid') = (paid_at IS NOT NULL)
    );

-- invoice numbers are unique, ignoring case ("inv-001" = "INV-001")
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices (lower(number));
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON public.invoices (issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices (status);

-- 3. Keep updated_at current
CREATE OR REPLACE FUNCTION public.invoices_touch()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_invoices_touch ON public.invoices;
CREATE TRIGGER tr_invoices_touch
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.invoices_touch();

-- 4. Row Level Security: allow-listed admins only
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.invoices FROM anon;

DROP POLICY IF EXISTS "Allow admin select invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow admin insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow admin update invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow admin delete invoices" ON public.invoices;

CREATE POLICY "Allow admin select invoices" ON public.invoices
    FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Allow admin insert invoices" ON public.invoices
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin update invoices" ON public.invoices
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin delete invoices" ON public.invoices
    FOR DELETE TO authenticated
    USING (public.is_admin());
