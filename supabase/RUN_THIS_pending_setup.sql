-- ═══════════════════════════════════════════════════════════════════════════
--  YARI — run this ONE file in Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════
--  It applies, in the right order, everything your database is missing:
--    1. Security hardening (July)  — admin allow-list + is_admin()
--    2. Your admin email           — so YOU keep access after step 1
--    3. Site analytics             — analytics_events + report function
--    4. AI chat inbox              — chat_conversations + chat_messages
--
--  ▶ BEFORE YOU RUN: check the email on the line marked  ★  below. It must be
--    the exact email you log in to /admin with.
--
--  Safe by design: it all runs in one transaction. If anything fails — including
--  the email check — NOTHING is changed. It is also safe to run more than once.
--
--  (Generated from supabase/migrations/2026071112…, 2026091912…, 2026091913…)
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ───────────────────────────── 1 / 4  Security hardening ─────────────────────
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
ALTER TABLE public.inquiries DROP CONSTRAINT IF EXISTS inquiries_name_len;
ALTER TABLE public.inquiries
    ADD CONSTRAINT inquiries_name_len CHECK (char_length(name) BETWEEN 2 AND 100) NOT VALID;
ALTER TABLE public.inquiries DROP CONSTRAINT IF EXISTS inquiries_email_len;
ALTER TABLE public.inquiries
    ADD CONSTRAINT inquiries_email_len CHECK (char_length(email) <= 254) NOT VALID;
ALTER TABLE public.inquiries DROP CONSTRAINT IF EXISTS inquiries_company_len;
ALTER TABLE public.inquiries
    ADD CONSTRAINT inquiries_company_len CHECK (company IS NULL OR char_length(company) <= 100) NOT VALID;
ALTER TABLE public.inquiries DROP CONSTRAINT IF EXISTS inquiries_budget_len;
ALTER TABLE public.inquiries
    ADD CONSTRAINT inquiries_budget_len CHECK (budget IS NULL OR char_length(budget) <= 50) NOT VALID;
ALTER TABLE public.inquiries DROP CONSTRAINT IF EXISTS inquiries_message_len;
ALTER TABLE public.inquiries
    ADD CONSTRAINT inquiries_message_len CHECK (message IS NULL OR char_length(message) <= 2000) NOT VALID;
ALTER TABLE public.inquiries DROP CONSTRAINT IF EXISTS inquiries_interests_bounds;
ALTER TABLE public.inquiries
    ADD CONSTRAINT inquiries_interests_bounds CHECK (
        coalesce(array_length(interests, 1), 0) <= 12
        AND char_length(array_to_string(interests, ',')) <= 500
    ) NOT VALID;

-- ───────────────────────────── 2 / 4  Your admin email ───────────────────────
DO $$
DECLARE
    v_admin_email CONSTANT TEXT := lower('admin@yariagency.com');   -- ★ your /admin login email
BEGIN
    -- Refuse to continue if that isn't a real login: from here on only emails in
    -- admin_emails can see admin data, so a typo would lock you out.
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = v_admin_email) THEN
        RAISE EXCEPTION 'No Supabase login exists for "%". Fix the email on the ★ line (Authentication → Users shows the right one) and run again. Nothing was changed.', v_admin_email;
    END IF;

    INSERT INTO public.admin_emails (email) VALUES (v_admin_email) ON CONFLICT (email) DO NOTHING;
END;
$$;

-- ───────────────────────────── 3 / 4  Site analytics ─────────────────────────
-- Migration: First-party, cookieless site analytics
-- Date: 2026-09-19
--
-- One append-only events table fed by /api/track, plus a single admin-only
-- report function that returns every aggregate the dashboard needs. No IPs,
-- cookies or user agents are stored: visitors are counted with a hash that is
-- salted per day, so it cannot be linked across days or back to a person.

-- 1. Events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    -- pageview: a page was viewed · event: a tracked interaction · vital: a Core Web Vitals sample
    kind TEXT NOT NULL CHECK (kind IN ('pageview', 'event', 'vital')),
    -- event name (contact_submit, phone_click, …) or vital name (LCP, CLS, INP); null for pageviews
    name TEXT,
    path TEXT NOT NULL,
    referrer_host TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    country TEXT,
    device TEXT CHECK (device IS NULL OR device IN ('desktop', 'mobile', 'tablet')),
    browser TEXT,
    os TEXT,
    -- SHA-256(daily salt + ip + user agent), hex. Rotates every day.
    visitor_hash TEXT NOT NULL,
    -- vital value (ms, or unitless for CLS); optional numeric payload for events
    value NUMERIC,
    meta JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 2. Bound every field at the DB layer — the insert policy is public
ALTER TABLE public.analytics_events DROP CONSTRAINT IF EXISTS analytics_events_sizes;
ALTER TABLE public.analytics_events
    ADD CONSTRAINT analytics_events_sizes CHECK (
        char_length(path) BETWEEN 1 AND 300
        AND (name IS NULL OR char_length(name) BETWEEN 1 AND 60)
        AND (referrer_host IS NULL OR char_length(referrer_host) <= 120)
        AND (utm_source IS NULL OR char_length(utm_source) <= 80)
        AND (utm_medium IS NULL OR char_length(utm_medium) <= 80)
        AND (utm_campaign IS NULL OR char_length(utm_campaign) <= 120)
        AND (country IS NULL OR char_length(country) = 2)
        AND (browser IS NULL OR char_length(browser) <= 30)
        AND (os IS NULL OR char_length(os) <= 30)
        AND char_length(visitor_hash) = 64
        AND pg_column_size(meta) <= 1024
        AND (kind = 'pageview') = (name IS NULL)
    ) NOT VALID;

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at
    ON public.analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_kind_created_at
    ON public.analytics_events (kind, created_at DESC);

-- 3. Row Level Security: anyone may append, only admins may read or delete
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "Allow admin select analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "Allow admin delete analytics" ON public.analytics_events;

CREATE POLICY "Allow public insert analytics" ON public.analytics_events
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow admin select analytics" ON public.analytics_events
    FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Allow admin delete analytics" ON public.analytics_events
    FOR DELETE TO authenticated
    USING (public.is_admin());

-- 4. Report: every dashboard aggregate for [p_from, p_to) in one round trip.
--    Days are bucketed in Dubai time. SECURITY DEFINER + explicit is_admin()
--    gate, so it never returns data to a non-admin caller.
CREATE OR REPLACE FUNCTION public.analytics_report(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_tz CONSTANT TEXT := 'Asia/Dubai';
    v_prev_from TIMESTAMPTZ := p_from - (p_to - p_from);
    v_conversions CONSTANT TEXT[] := ARRAY['contact_submit', 'newsletter_subscribe', 'chat_lead', 'phone_click', 'email_click'];
    v_result JSONB;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
    END IF;

    IF p_to <= p_from OR p_to - p_from > INTERVAL '400 days' THEN
        RAISE EXCEPTION 'invalid range';
    END IF;

    WITH ev AS (
        SELECT e.*, (e.created_at AT TIME ZONE v_tz)::date AS day
        FROM public.analytics_events e
        WHERE e.created_at >= p_from AND e.created_at < p_to
    ),
    prev AS (
        SELECT e.*
        FROM public.analytics_events e
        WHERE e.created_at >= v_prev_from AND e.created_at < p_from
    ),
    -- one row per visit (the visitor hash already rotates daily)
    visits AS (
        SELECT visitor_hash, day, count(*) AS views
        FROM ev WHERE kind = 'pageview'
        GROUP BY visitor_hash, day
    ),
    -- where each visit came from = the source on its first pageview
    visit_source AS (
        SELECT DISTINCT ON (visitor_hash, day)
            visitor_hash, day,
            COALESCE(NULLIF(utm_source, ''), NULLIF(referrer_host, ''), 'Direct') AS source
        FROM ev WHERE kind = 'pageview'
        ORDER BY visitor_hash, day, created_at
    ),
    days AS (
        SELECT d::date AS day
        FROM generate_series(
            (p_from AT TIME ZONE v_tz)::date,
            ((p_to - INTERVAL '1 second') AT TIME ZONE v_tz)::date,
            INTERVAL '1 day'
        ) d
    )
    SELECT jsonb_build_object(
        'totals', jsonb_build_object(
            'visitors', (SELECT count(*) FROM visits),
            'pageviews', (SELECT count(*) FROM ev WHERE kind = 'pageview'),
            'conversions', (SELECT count(*) FROM ev WHERE kind = 'event' AND name = ANY (v_conversions)),
            'bounces', (SELECT count(*) FROM visits WHERE views = 1)
        ),
        'previous', jsonb_build_object(
            'visitors', (SELECT count(DISTINCT (visitor_hash, (created_at AT TIME ZONE v_tz)::date)) FROM prev WHERE kind = 'pageview'),
            'pageviews', (SELECT count(*) FROM prev WHERE kind = 'pageview'),
            'conversions', (SELECT count(*) FROM prev WHERE kind = 'event' AND name = ANY (v_conversions))
        ),
        'daily', (
            SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'day', d.day,
                'visitors', (SELECT count(*) FROM visits v WHERE v.day = d.day),
                'pageviews', (SELECT COALESCE(sum(v.views), 0) FROM visits v WHERE v.day = d.day)
            ) ORDER BY d.day), '[]'::jsonb)
            FROM days d
        ),
        'pages', (
            SELECT COALESCE(jsonb_agg(t ORDER BY t.pageviews DESC), '[]'::jsonb) FROM (
                SELECT path, count(*) AS pageviews, count(DISTINCT (visitor_hash, day)) AS visitors
                FROM ev WHERE kind = 'pageview'
                GROUP BY path ORDER BY count(*) DESC LIMIT 10
            ) t
        ),
        'sources', (
            SELECT COALESCE(jsonb_agg(t ORDER BY t.visitors DESC), '[]'::jsonb) FROM (
                SELECT source AS label, count(*) AS visitors
                FROM visit_source GROUP BY source ORDER BY count(*) DESC LIMIT 10
            ) t
        ),
        'campaigns', (
            SELECT COALESCE(jsonb_agg(t ORDER BY t.visitors DESC), '[]'::jsonb) FROM (
                SELECT utm_campaign AS label, count(DISTINCT (visitor_hash, day)) AS visitors
                FROM ev WHERE kind = 'pageview' AND NULLIF(utm_campaign, '') IS NOT NULL
                GROUP BY utm_campaign ORDER BY 2 DESC LIMIT 10
            ) t
        ),
        'countries', (
            SELECT COALESCE(jsonb_agg(t ORDER BY t.visitors DESC), '[]'::jsonb) FROM (
                SELECT COALESCE(country, '??') AS label, count(DISTINCT (visitor_hash, day)) AS visitors
                FROM ev WHERE kind = 'pageview'
                GROUP BY COALESCE(country, '??') ORDER BY 2 DESC LIMIT 10
            ) t
        ),
        'devices', (
            SELECT COALESCE(jsonb_agg(t ORDER BY t.visitors DESC), '[]'::jsonb) FROM (
                SELECT COALESCE(device, 'desktop') AS label, count(DISTINCT (visitor_hash, day)) AS visitors
                FROM ev WHERE kind = 'pageview'
                GROUP BY COALESCE(device, 'desktop') ORDER BY 2 DESC
            ) t
        ),
        'browsers', (
            SELECT COALESCE(jsonb_agg(t ORDER BY t.visitors DESC), '[]'::jsonb) FROM (
                SELECT COALESCE(browser, 'Other') AS label, count(DISTINCT (visitor_hash, day)) AS visitors
                FROM ev WHERE kind = 'pageview'
                GROUP BY COALESCE(browser, 'Other') ORDER BY 2 DESC LIMIT 6
            ) t
        ),
        'events', (
            SELECT COALESCE(jsonb_agg(t ORDER BY t.count DESC), '[]'::jsonb) FROM (
                SELECT name AS label, count(*) AS count, (name = ANY (v_conversions)) AS conversion
                FROM ev WHERE kind = 'event'
                GROUP BY name ORDER BY count(*) DESC
            ) t
        ),
        'vitals', (
            SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) FROM (
                SELECT name AS label,
                       percentile_cont(0.75) WITHIN GROUP (ORDER BY value) AS p75,
                       count(*) AS samples
                FROM ev WHERE kind = 'vital' AND value IS NOT NULL
                GROUP BY name
            ) t
        )
    ) INTO v_result;

    RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.analytics_report(TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.analytics_report(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

-- 5. Security fix carried along: the newsletter table's read/update/delete
--    policies only checked "is logged in". Bring them in line with inquiries
--    and leads so only allow-listed admins can touch the subscriber list.
DROP POLICY IF EXISTS "Allow admin select subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow admin update subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow admin delete subscribers" ON public.newsletter_subscribers;

CREATE POLICY "Allow admin select subscribers" ON public.newsletter_subscribers
    FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Allow admin update subscribers" ON public.newsletter_subscribers
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin delete subscribers" ON public.newsletter_subscribers
    FOR DELETE TO authenticated
    USING (public.is_admin());

-- ───────────────────────────── 4 / 4  AI chat inbox ──────────────────────────
-- Migration: AI chat inbox — persisted conversations + human takeover
-- Date: 2026-09-19
--
-- Every website chat is stored as a conversation with its messages. Visitors
-- never touch these tables directly: the site's server (service role) reads
-- and writes on their behalf after checking the visitor's secret token.
-- Admins read everything and can take a conversation over from the AI.

-- 1. Conversations
CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    -- SHA-256 of the secret token held in the visitor's browser. Proves a
    -- request belongs to this conversation; the token itself is never stored.
    token_hash TEXT NOT NULL CHECK (char_length(token_hash) = 64),
    -- ai: the assistant answers · human: the assistant is off, an admin answers
    mode TEXT NOT NULL DEFAULT 'ai' CHECK (mode IN ('ai', 'human')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    -- set when the visitor asks to talk to a person
    needs_human BOOLEAN NOT NULL DEFAULT false,
    needs_human_at TIMESTAMPTZ,
    visitor_name TEXT CHECK (visitor_name IS NULL OR char_length(visitor_name) <= 100),
    visitor_email TEXT CHECK (visitor_email IS NULL OR char_length(visitor_email) <= 254),
    started_path TEXT CHECK (started_path IS NULL OR char_length(started_path) <= 300),
    country TEXT CHECK (country IS NULL OR char_length(country) = 2),
    device TEXT CHECK (device IS NULL OR device IN ('desktop', 'mobile', 'tablet')),
    -- maintained by the trigger below
    message_count INTEGER NOT NULL DEFAULT 0,
    last_message_at TIMESTAMPTZ,
    last_message_role TEXT,
    last_message_preview TEXT,
    -- when an admin last opened the thread (drives the unread marker)
    admin_last_read_at TIMESTAMPTZ
);

-- 2. Messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    -- user: the visitor · assistant: the AI · admin: a YARI team member
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'admin')),
    content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 4000)
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation
    ON public.chat_messages (conversation_id, id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_message
    ON public.chat_conversations (last_message_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_needs_human
    ON public.chat_conversations (needs_human) WHERE needs_human;

-- 3. Keep each conversation's summary in step with its messages
CREATE OR REPLACE FUNCTION public.chat_touch_conversation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.chat_conversations
    SET message_count = message_count + 1,
        last_message_at = NEW.created_at,
        last_message_role = NEW.role,
        last_message_preview = left(NEW.content, 140),
        updated_at = NEW.created_at,
        -- a new visitor message re-opens a closed conversation
        status = CASE WHEN NEW.role = 'user' THEN 'open' ELSE status END
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_chat_messages_touch ON public.chat_messages;
CREATE TRIGGER tr_chat_messages_touch
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW EXECUTE FUNCTION public.chat_touch_conversation();

-- 4. Row Level Security: admins only. There are deliberately NO public
--    policies — anonymous visitors cannot read, list or write chats with the
--    public API key. The website server uses the service role, which bypasses RLS.
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin select chat conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Allow admin update chat conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Allow admin delete chat conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Allow admin select chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow admin insert chat messages" ON public.chat_messages;

CREATE POLICY "Allow admin select chat conversations" ON public.chat_conversations
    FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Allow admin update chat conversations" ON public.chat_conversations
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin delete chat conversations" ON public.chat_conversations
    FOR DELETE TO authenticated
    USING (public.is_admin());

CREATE POLICY "Allow admin select chat messages" ON public.chat_messages
    FOR SELECT TO authenticated
    USING (public.is_admin());

-- an admin can only ever post as a team member, never as the visitor or the AI
CREATE POLICY "Allow admin insert chat messages" ON public.chat_messages
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin() AND role = 'admin');

COMMIT;

-- Done. You should see "Success. No rows returned".
-- Check who has admin access any time with:   SELECT * FROM public.admin_emails;
