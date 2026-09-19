import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { checkRateLimit, clientIpFrom } from "@/lib/rate-limit";
import { hashChatToken, isChatToken, isUuid } from "@/lib/chat";

/**
 * Visitor-side polling for one conversation: restores the thread after a
 * reload and delivers replies from a YARI team member during a human takeover.
 *
 * The conversation id and secret token travel in headers, not the URL, so they
 * never end up in access logs, browser history or a Referer.
 */
export async function GET(req: Request) {
  const ip = clientIpFrom(req.headers);
  if (!checkRateLimit(`chat-poll:${ip}`, 90, 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const conversationId = req.headers.get("x-chat-conversation");
  const token = req.headers.get("x-chat-token");
  if (!isUuid(conversationId) || !isChatToken(token)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const db = createServiceClient();
  if (!db) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const { data: conversation } = await db
    .from("chat_conversations")
    .select("id, mode")
    .eq("id", conversationId)
    .eq("token_hash", hashChatToken(token))
    .maybeSingle();
  // Same answer for "no such conversation" and "wrong token"
  if (!conversation) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const after = Number(new URL(req.url).searchParams.get("after") ?? 0);
  const { data: messages } = await db
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", conversation.id)
    .gt("id", Number.isFinite(after) && after > 0 ? Math.floor(after) : 0)
    .order("id", { ascending: true })
    .limit(200);

  return NextResponse.json(
    { mode: conversation.mode, messages: messages ?? [] },
    { headers: { "Cache-Control": "no-store" } }
  );
}
