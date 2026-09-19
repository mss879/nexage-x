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
