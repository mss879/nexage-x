import { NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { buildSystemPrompt } from "@/lib/ai-context";
import { createServiceClient } from "@/lib/supabase/admin";
import { checkRateLimit, clientIpFrom } from "@/lib/rate-limit";
import { SITE } from "@/lib/site";
import {
  MAX_MESSAGE_CHARS,
  deviceFromUserAgent,
  findEmail,
  findName,
  hashChatToken,
  isChatToken,
  isUuid,
  newChatToken,
  wantsHuman,
  type ChatMode,
  type ChatRole,
} from "@/lib/chat";

export const maxDuration = 30;

/**
 * Website AI chat.
 *
 * Every conversation is persisted (chat_conversations / chat_messages) so the
 * team can read it in /admin/chats and take it over. A visitor proves they own
 * a conversation with a secret token kept in their browser; only its hash is
 * stored. When an admin has switched a conversation to "human" mode the AI
 * stays silent and the visitor's widget picks up the admin's replies by
 * polling /api/chat/messages.
 *
 * Without SUPABASE_SERVICE_ROLE_KEY the chat still answers, it just isn't
 * stored (the widget then sends its own history each turn).
 */

const HISTORY_LIMIT = 24;

type ModelMessage = { role: "user" | "assistant"; content: string };

const HANDOFF_NOTE =
  "\n\nSYSTEM NOTE: the visitor has just asked for a person. The conversation is now flagged for the YARI team, who can join this chat. Say so plainly, and ask for an email or phone number in case nobody is online right now.";

function fallbackReply(message: string): string {
  const text = message.toLowerCase();
  if (/contact|email|quote|project|price|cost/.test(text)) {
    return `Thanks for your interest in working with YARI! You can reach the team at ${SITE.email} or ${SITE.phones[0].number}. Share your project scope, timeline and email address and we'll get back to you with a proposal.`;
  }
  return "Hello! I'm the YARI assistant. I can help with our e-commerce, software, Odoo & Zoho integration and logistics services. What are you working on?";
}

export async function POST(req: Request) {
  try {
    const ip = clientIpFrom(req.headers);
    if (!checkRateLimit(`chat:${ip}`, 20, 60 * 1000)) {
      return NextResponse.json({ error: "You're sending messages very quickly — please wait a moment." }, { status: 429 });
    }

    const body = await req.json();
    const message = typeof body.message === "string" ? body.message.trim().slice(0, MAX_MESSAGE_CHARS) : "";
    if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });

    const db = createServiceClient();
    let conversationId: string | null = null;
    let token: string | null = null;
    let mode: ChatMode = "ai";
    let alreadyFlagged = false;
    let knownEmail: string | null = null;
    let history: ModelMessage[] = [];

    /* ── 1. Find or create the conversation, store the visitor's message ── */
    if (db) {
      if (isUuid(body.conversationId) && isChatToken(body.token)) {
        const { data } = await db
          .from("chat_conversations")
          .select("id, mode, needs_human, visitor_email")
          .eq("id", body.conversationId)
          .eq("token_hash", hashChatToken(body.token))
          .maybeSingle();
        if (data) {
          conversationId = data.id;
          token = body.token;
          mode = data.mode;
          alreadyFlagged = data.needs_human;
          knownEmail = data.visitor_email;
        }
      }

      if (!conversationId) {
        token = newChatToken();
        const country = (req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry") ?? "").toUpperCase();
        const path = typeof body.path === "string" && body.path.startsWith("/") ? body.path.slice(0, 300) : null;
        const { data, error } = await db
          .from("chat_conversations")
          .insert({
            token_hash: hashChatToken(token),
            started_path: path,
            country: /^[A-Z]{2}$/.test(country) && country !== "XX" ? country : null,
            device: deviceFromUserAgent(req.headers.get("user-agent") ?? ""),
          })
          .select("id")
          .single();
        if (error) console.error("chat: could not create conversation:", error.message);
        conversationId = data?.id ?? null;
        if (!conversationId) token = null;
      }
    }

    let userMessageId: number | null = null;
    if (db && conversationId) {
      const { data } = await db
        .from("chat_messages")
        .insert({ conversation_id: conversationId, role: "user" satisfies ChatRole, content: message })
        .select("id")
        .single();
      userMessageId = data?.id ?? null;

      // Conversation-level facts learned from this message
      const updates: Record<string, unknown> = {};
      const askedForHuman = wantsHuman(message);
      if (askedForHuman && !alreadyFlagged) {
        updates.needs_human = true;
        updates.needs_human_at = new Date().toISOString();
      }
      const email = findEmail(message);
      if (email && !knownEmail) updates.visitor_email = email.slice(0, 254);
      const name = findName(message);
      if (name) updates.visitor_name = name;
      if (Object.keys(updates).length > 0) {
        await db.from("chat_conversations").update(updates).eq("id", conversationId);
      }

      // First time we see an email → one inquiry, so it shows up in the CRM flow
      if (email && !knownEmail) {
        const { data: recent } = await db
          .from("chat_messages")
          .select("content")
          .eq("conversation_id", conversationId)
          .eq("role", "user")
          .order("id", { ascending: false })
          .limit(6);
        const transcript = (recent ?? []).map((m) => m.content).reverse().join("\n").slice(-1500);
        const { error } = await db.from("inquiries").insert({
          name: name ?? "AI chat visitor",
          email,
          message: `[AI chat] ${transcript}`.slice(0, 2000),
          interests: ["AI Chatbot Qualification"],
          status: "new",
        });
        if (error) console.error("chat: could not create inquiry:", error.message);
      }
    }

    const base = { conversationId, token, userMessageId };

    /* ── 2. A human has taken over → the AI stays quiet ── */
    if (mode === "human") {
      return NextResponse.json({ ...base, mode, content: null, messageId: null });
    }

    /* ── 3. Build the model input ── */
    if (db && conversationId) {
      const { data } = await db
        .from("chat_messages")
        .select("role, content")
        .eq("conversation_id", conversationId)
        .order("id", { ascending: false })
        .limit(HISTORY_LIMIT);
      history = (data ?? []).reverse().map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        // The model should know which earlier replies came from a person
        content: m.role === "admin" ? `[YARI team member] ${m.content}` : m.content,
      }));
    } else if (Array.isArray(body.history)) {
      // No persistence configured — trust the widget's own (bounded) history
      history = (body.history as unknown[])
        .slice(-HISTORY_LIMIT)
        .flatMap((m): ModelMessage[] => {
          const item = m as { role?: unknown; content?: unknown };
          return typeof item.content === "string" && item.content.trim()
            ? [{ role: item.role === "assistant" ? "assistant" : "user", content: item.content.slice(0, MAX_MESSAGE_CHARS) }]
            : [];
        });
      history.push({ role: "user", content: message });
    } else {
      history = [{ role: "user", content: message }];
    }

    /* ── 4. Generate + store the reply ── */
    let content: string;
    if (!process.env.OPENAI_API_KEY) {
      content = fallbackReply(message);
    } else {
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        system: buildSystemPrompt(message) + (wantsHuman(message) ? HANDOFF_NOTE : ""),
        messages: history,
      });
      content = result.text.trim() || "Sorry — I didn't catch that. Could you rephrase?";
    }

    let messageId: number | null = null;
    if (db && conversationId) {
      // An admin may have taken over while the model was thinking — if so, drop
      // the AI's reply rather than talking over them.
      const { data: current } = await db.from("chat_conversations").select("mode").eq("id", conversationId).single();
      if (current?.mode === "human") {
        return NextResponse.json({ ...base, mode: "human", content: null, messageId: null });
      }

      const { data } = await db
        .from("chat_messages")
        .insert({ conversation_id: conversationId, role: "assistant" satisfies ChatRole, content: content.slice(0, 4000) })
        .select("id")
        .single();
      messageId = data?.id ?? null;
    }

    return NextResponse.json({ ...base, mode, content, messageId, leadCaptured: Boolean(findEmail(message)) });
  } catch (error) {
    console.error("AI Chat API Error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
