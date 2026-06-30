-- Migration: Create CRM Inquiries and Leads Tables with RLS Policies
-- Date: 2026-07-01

-- 1. Create Inquiries Table
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    budget TEXT,
    message TEXT,
    interests TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'converted', 'archived'))
);

-- 2. Create Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    name TEXT NOT NULL,
    email TEXT,
    company TEXT,
    budget TEXT,
    message TEXT,
    interests TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    stage TEXT NOT NULL DEFAULT 'Lead' CHECK (stage IN ('Lead', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost')),
    value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    source_inquiry_id UUID REFERENCES public.inquiries(id) ON DELETE SET NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for Inquiries Table
-- Allow public anonymous users to insert contact form submissions (Spam/Secured)
CREATE POLICY "Allow public inserts" ON public.inquiries
    FOR INSERT 
    WITH CHECK (true);

-- Allow authenticated admin users full access to select/update/delete inquiries
CREATE POLICY "Allow admin select inquiries" ON public.inquiries
    FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin update inquiries" ON public.inquiries
    FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin delete inquiries" ON public.inquiries
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- 5. Create Policies for Leads Table
-- Restrict all operations on leads to authenticated admin users only
CREATE POLICY "Allow admin select leads" ON public.leads
    FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin insert leads" ON public.leads
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admin update leads" ON public.leads
    FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin delete leads" ON public.leads
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- 6. Create Indexes for Performance Optimization
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_updated_at ON public.leads(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_source_inquiry ON public.leads(source_inquiry_id);

-- 7. Add automated updated_at trigger for Leads table
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tr_leads_set_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
