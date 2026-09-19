"use server";

import { requireAdmin } from "@/lib/admin-auth";
import {
  CONVERSATION_COLUMNS,
  MAX_MESSAGE_CHARS,
  isUuid,
  type ChatConversationRow,
  type ChatMessageRow,
  type ChatMode,
} from "@/lib/chat";

type Result<T> = ({ success: true } & T) | { success: false; error: string; missingTables?: boolean };

const fail = (error: unknown): { success: false; error: string; missingTables?: boolean } => {
  const e = error as { message?: string; code?: string };
  // 42P01 / PGRST205 → the chat inbox migration hasn't been applied yet
  const missingTables = e?.code === "42P01" || e?.code === "PGRST205";
  return { success: false, error: e?.message ?? "Something went wrong.", missingTables };
};

/** Conversations for the inbox list, most recent first. */
export async function getChatInbox(): Promise<Result<{ conversations: ChatConversationRow[] }>> {
  try {
    const supabase = await requireAdmin();
    const { data, error } = await supabase
      .from("chat_conversations")
      .select(CONVERSATION_COLUMNS)
      .gt("message_count", 0)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .limit(150);
    if (error) return fail(error);
    return { success: true, conversations: (data ?? []) as unknown as ChatConversationRow[] };
  } catch (error) {
    return fail(error);
  }
}

/** One conversation's messages (optionally only those after `afterId`). Opening a thread marks it read. */
export async function getChatThread(
  conversationId: string,
  afterId = 0
): Promise<Result<{ conversation: ChatConversationRow; messages: ChatMessageRow[] }>> {
  try {
    if (!isUuid(conversationId)) return { success: false, error: "Invalid conversation." };
    const supabase = await requireAdmin();

    const [conversationRes, messagesRes] = await Promise.all([
      supabase.from("chat_conversations").select(CONVERSATION_COLUMNS).eq("id", conversationId).single(),
      supabase
        .from("chat_messages")
        .select("id, conversation_id, created_at, role, content")
        .eq("conversation_id", conversationId)
        .gt("id", Math.max(0, Math.floor(afterId)))
        .order("id", { ascending: true })
        .limit(500),
    ]);
    if (conversationRes.error) return fail(conversationRes.error);
    if (messagesRes.error) return fail(messagesRes.error);

    await supabase
      .from("chat_conversations")
      .update({ admin_last_read_at: new Date().toISOString() })
      .eq("id", conversationId);

    return {
      success: true,
      conversation: conversationRes.data as unknown as ChatConversationRow,
      messages: (messagesRes.data ?? []) as ChatMessageRow[],
    };
  } catch (error) {
    return fail(error);
  }
}

/**
 * Reply as a YARI team member. Replying takes the conversation over: the AI is
 * switched off for it until an admin hands it back.
 */
export async function sendChatReply(conversationId: string, content: string): Promise<Result<{ message: ChatMessageRow }>> {
  try {
    if (!isUuid(conversationId)) return { success: false, error: "Invalid conversation." };
    const text = typeof content === "string" ? content.trim().slice(0, MAX_MESSAGE_CHARS) : "";
    if (!text) return { success: false, error: "Write a message first." };

    const supabase = await requireAdmin();

    // Switch the AI off BEFORE posting, so it can't answer the visitor's next message in between
    const { error: modeError } = await supabase
      .from("chat_conversations")
      .update({ mode: "human" satisfies ChatMode, needs_human: false, status: "open" })
      .eq("id", conversationId);
    if (modeError) return fail(modeError);

    const { data, error } = await supabase
      .from("chat_messages")
      .insert({ conversation_id: conversationId, role: "admin", content: text })
      .select("id, conversation_id, created_at, role, content")
      .single();
    if (error) return fail(error);

    return { success: true, message: data as ChatMessageRow };
  } catch (error) {
    return fail(error);
  }
}

/** Turn the AI off ("human") or hand the conversation back to it ("ai"). */
export async function setChatMode(conversationId: string, mode: ChatMode): Promise<Result<object>> {
  try {
    if (!isUuid(conversationId) || (mode !== "ai" && mode !== "human")) {
      return { success: false, error: "Invalid request." };
    }
    const supabase = await requireAdmin();
    const { error } = await supabase
      .from("chat_conversations")
      .update(mode === "human" ? { mode, needs_human: false } : { mode })
      .eq("id", conversationId);
    return error ? fail(error) : { success: true };
  } catch (error) {
    return fail(error);
  }
}

export async function setChatStatus(conversationId: string, status: "open" | "closed"): Promise<Result<object>> {
  try {
    if (!isUuid(conversationId) || (status !== "open" && status !== "closed")) {
      return { success: false, error: "Invalid request." };
    }
    const supabase = await requireAdmin();
    const { error } = await supabase
      .from("chat_conversations")
      .update(status === "closed" ? { status, needs_human: false } : { status })
      .eq("id", conversationId);
    return error ? fail(error) : { success: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteChat(conversationId: string): Promise<Result<object>> {
  try {
    if (!isUuid(conversationId)) return { success: false, error: "Invalid conversation." };
    const supabase = await requireAdmin();
    const { error } = await supabase.from("chat_conversations").delete().eq("id", conversationId);
    return error ? fail(error) : { success: true };
  } catch (error) {
    return fail(error);
  }
}
