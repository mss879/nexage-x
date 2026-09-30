-- Migration: Invoice payments — part payments, balance due, and the link to a client
-- Date: 2026-09-30
--
-- Until now an invoice was either "paid" or not. This records every payment
-- against it (amount, date, method), so an invoice can be part-paid and the
-- balance is always known.
--
--   invoices.amount_paid  = the sum of its payments, kept by the database
--   invoices.client_id    = the saved client it belongs to (Clients 360)
--   invoices.project_id   = optionally, the project it bills
--
-- One rule decides an invoice's status, in one place (the trigger below):
--   * payments cover the total            → paid, paid on the last payment's date
--   * payments no longer cover the total  → back to sent (a payment was removed,
--                                           or the total went up)
--   * someone marks it paid by hand       → the unpaid balance is recorded as a
--                                           payment, so "paid" always adds up
--   * draft (with no payments) and void are left alone; a void invoice can't
--     hold payments, and the currency can't change once there are payments
--
-- "Part paid" is not a status — it is simply sent with 0 < amount_paid < total.
--
-- Invoices already marked paid get one payment for their full total, dated the
-- day they were paid, so nothing changes for them.
--
-- Admin-only. Runs in one transaction and is safe to run more than once.

BEGIN;

-- 0. Depends on invoices and the clients/projects migration
DO $$
BEGIN
    IF to_regprocedure('public.is_admin()') IS NULL THEN
        RAISE EXCEPTION 'public.is_admin() is missing — run supabase/RUN_THIS_pending_setup.sql first, then run this file again.';
    END IF;
    IF to_regclass('public.invoices') IS NULL THEN
        RAISE EXCEPTION 'public.invoices is missing — run supabase/migrations/20260919140000_invoices.sql first, then run this file again.';
    END IF;
    IF to_regclass('public.clients') IS NULL OR to_regclass('public.projects') IS NULL THEN
        RAISE EXCEPTION 'public.clients / public.projects are missing — run supabase/migrations/20260930110000_clients_projects.sql first, then run this file again.';
    END IF;
END
$$;

-- 1. New invoice columns
ALTER TABLE public.invoices
    ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(14, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients (id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects (id) ON DELETE SET NULL;

ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_amount_paid;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_amount_paid CHECK (amount_paid >= 0);

CREATE INDEX IF NOT EXISTS idx_invoices_client ON public.invoices (client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project ON public.invoices (project_id);

-- 2. Payments
CREATE TABLE IF NOT EXISTS public.invoice_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    invoice_id UUID NOT NULL REFERENCES public.invoices (id) ON DELETE CASCADE,
    -- In the invoice's currency
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    paid_on DATE NOT NULL DEFAULT CURRENT_DATE,
    method TEXT NOT NULL DEFAULT 'bank_transfer'
        CHECK (method IN ('bank_transfer', 'cash', 'card', 'cheque', 'online', 'other')),
    reference TEXT NOT NULL DEFAULT '',
    note TEXT NOT NULL DEFAULT '',
    created_by UUID DEFAULT auth.uid()
);

ALTER TABLE public.invoice_payments DROP CONSTRAINT IF EXISTS invoice_payments_shape;
ALTER TABLE public.invoice_payments
    ADD CONSTRAINT invoice_payments_shape CHECK (
        char_length(reference) <= 80
        AND char_length(note) <= 500
    );

CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice ON public.invoice_payments (invoice_id, paid_on);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_paid_on ON public.invoice_payments (paid_on DESC);

-- 3. The single place an invoice's amount_paid, status and paid_at are decided.
--    Runs before every insert/update of an invoice, so the existing
--    (status = 'paid') = (paid_at IS NOT NULL) check always holds.
CREATE OR REPLACE FUNCTION public.invoices_payment_state()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    v_paid NUMERIC(14, 2);
    v_last DATE;
    v_marked_paid BOOLEAN;
BEGIN
    SELECT coalesce(sum(p.amount), 0), max(p.paid_on)
    INTO v_paid, v_last
    FROM public.invoice_payments p
    WHERE p.invoice_id = NEW.id;

    -- Never taken from the caller
    NEW.amount_paid := v_paid;

    IF v_paid > 0 THEN
        IF TG_OP = 'UPDATE' AND NEW.currency <> OLD.currency THEN
            RAISE EXCEPTION 'This invoice already has payments in % — remove them before changing the currency.', OLD.currency
                USING ERRCODE = 'check_violation';
        END IF;
        IF NEW.status = 'void' THEN
            RAISE EXCEPTION 'This invoice has payments recorded — remove them before voiding it.'
                USING ERRCODE = 'check_violation';
        END IF;
    END IF;

    -- "Paid" chosen by hand just now (not merely still paid from before)
    v_marked_paid := NEW.status = 'paid' AND (TG_OP = 'INSERT' OR OLD.status <> 'paid');

    IF NEW.status = 'void' OR (NEW.status = 'draft' AND v_paid = 0) THEN
        NEW.paid_at := NULL;
    ELSIF v_marked_paid OR (NEW.status = 'paid' AND NEW.total = 0) THEN
        -- tr_invoices_settle (below) records whatever is still owed as a payment
        NEW.status := 'paid';
        NEW.paid_at := coalesce(NEW.paid_at, v_last, CURRENT_DATE);
    ELSIF NEW.total > 0 AND v_paid >= NEW.total THEN
        NEW.status := 'paid';
        NEW.paid_at := v_last;
    ELSE
        -- Sent, part-paid, or no longer fully covered
        NEW.status := 'sent';
        NEW.paid_at := NULL;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_invoices_payment_state ON public.invoices;
CREATE TRIGGER tr_invoices_payment_state
    BEFORE INSERT OR UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.invoices_payment_state();

-- 4. Marked paid with a balance still owed → record that balance as a payment.
CREATE OR REPLACE FUNCTION public.invoices_settle()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF NEW.status = 'paid' AND NEW.total > NEW.amount_paid THEN
        INSERT INTO public.invoice_payments (invoice_id, amount, paid_on, method, note)
        VALUES (NEW.id, NEW.total - NEW.amount_paid, NEW.paid_at, 'other', 'Marked as paid');
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS tr_invoices_settle ON public.invoices;
CREATE TRIGGER tr_invoices_settle
    AFTER INSERT OR UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.invoices_settle();

-- 5. Any change to a payment re-derives its invoice (a no-op update is enough:
--    the trigger in step 3 does the work).
CREATE OR REPLACE FUNCTION public.invoice_payments_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
        UPDATE public.invoices SET amount_paid = amount_paid WHERE id = OLD.invoice_id;
    END IF;
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.invoice_id <> OLD.invoice_id) THEN
        UPDATE public.invoices SET amount_paid = amount_paid WHERE id = NEW.invoice_id;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS tr_invoice_payments_sync ON public.invoice_payments;
CREATE TRIGGER tr_invoice_payments_sync
    AFTER INSERT OR UPDATE OR DELETE ON public.invoice_payments
    FOR EACH ROW EXECUTE FUNCTION public.invoice_payments_sync();

-- 6. Row Level Security: allow-listed admins only
ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.invoice_payments FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_payments TO authenticated;
GRANT ALL ON public.invoice_payments TO service_role;

DROP POLICY IF EXISTS "Allow admin select invoice_payments" ON public.invoice_payments;
DROP POLICY IF EXISTS "Allow admin insert invoice_payments" ON public.invoice_payments;
DROP POLICY IF EXISTS "Allow admin update invoice_payments" ON public.invoice_payments;
DROP POLICY IF EXISTS "Allow admin delete invoice_payments" ON public.invoice_payments;

CREATE POLICY "Allow admin select invoice_payments" ON public.invoice_payments
    FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Allow admin insert invoice_payments" ON public.invoice_payments
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin update invoice_payments" ON public.invoice_payments
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin delete invoice_payments" ON public.invoice_payments
    FOR DELETE TO authenticated
    USING (public.is_admin());

-- 7. Invoices already marked paid: one payment for the full total, on the day
--    they were paid. Skips any invoice that already has payments, so this is
--    safe to run again.
INSERT INTO public.invoice_payments (invoice_id, amount, paid_on, method, note)
SELECT i.id, i.total, i.paid_at, 'other', 'Recorded before payment tracking'
FROM public.invoices i
WHERE i.status = 'paid'
  AND i.total > 0
  AND i.paid_at IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.invoice_payments p WHERE p.invoice_id = i.id);

--    Repair: amount_paid matches the payments for every invoice.
UPDATE public.invoices i
SET amount_paid = amount_paid
WHERE i.amount_paid IS DISTINCT FROM (
    SELECT coalesce(sum(p.amount), 0) FROM public.invoice_payments p WHERE p.invoice_id = i.id
);

NOTIFY pgrst, 'reload schema';

COMMIT;
