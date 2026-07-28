-- Migration: Create Newsletter Subscribers Table with RLS Policies
-- Date: 2026-07-28

-- 1. Create Subscribers Table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    email TEXT NOT NULL UNIQUE CHECK (email = lower(email)),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    source TEXT NOT NULL DEFAULT 'footer'
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- 3. Size and format constraints at DB layer
ALTER TABLE public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_email_len CHECK (char_length(email) BETWEEN 5 AND 254) NOT VALID;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Allow public insert subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow admin select subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow admin update subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow admin delete subscribers" ON public.newsletter_subscribers;

-- Allow public anonymous users to subscribe to newsletter
CREATE POLICY "Allow public insert subscribers" ON public.newsletter_subscribers
    FOR INSERT
    WITH CHECK (status = 'active');

-- Allow authenticated admin users full access to select/update/delete subscribers
CREATE POLICY "Allow admin select subscribers" ON public.newsletter_subscribers
    FOR SELECT TO authenticated
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin update subscribers" ON public.newsletter_subscribers
    FOR UPDATE TO authenticated
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin delete subscribers" ON public.newsletter_subscribers
    FOR DELETE TO authenticated
    USING (auth.role() = 'authenticated');

-- 5. Create Index
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_created_at 
    ON public.newsletter_subscribers(created_at DESC);
