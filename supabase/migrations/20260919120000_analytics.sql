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
