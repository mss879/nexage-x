/** Shared types + helpers for the website AI chat and the admin chat inbox. */
import { createHash, randomBytes } from "node:crypto";

export type ChatRole = "user" | "assistant" | "admin";
export type ChatMode = "ai" | "human";

export interface ChatMessageRow {
  id: number;
  conversation_id: string;
  created_at: string;
  role: ChatRole;
  content: string;
}

export interface ChatConversationRow {
  id: string;
  created_at: string;
  updated_at: string;
  mode: ChatMode;
  status: "open" | "closed";
  needs_human: boolean;
  needs_human_at: string | null;
  visitor_name: string | null;
  visitor_email: string | null;
  started_path: string | null;
  country: string | null;
  device: "desktop" | "mobile" | "tablet" | null;
  message_count: number;
  last_message_at: string | null;
  last_message_role: ChatRole | null;
  last_message_preview: string | null;
  admin_last_read_at: string | null;
}

/** Columns safe to send to the admin UI — everything except token_hash. */
export const CONVERSATION_COLUMNS =
  "id, created_at, updated_at, mode, status, needs_human, needs_human_at, visitor_name, visitor_email, started_path, country, device, message_count, last_message_at, last_message_role, last_message_preview, admin_last_read_at";

export const MAX_MESSAGE_CHARS = 2000;

export const newChatToken = () => randomBytes(32).toString("hex");
export const hashChatToken = (token: string) => createHash("sha256").update(token).digest("hex");

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value: unknown): value is string => typeof value === "string" && UUID.test(value);
export const isChatToken = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{64}$/.test(value);

/**
 * Does this message ask for a person? Deliberately specific — "human" alone in
 * "human resources software" must not trigger a handoff.
 */
const HUMAN_REQUEST =
  /\b(?:(?:talk|speak|chat|connect|put)(?:\s+me)?(?:\s+through)?\s+(?:to|with)\s+(?:a\s+|an\s+|the\s+|your\s+)?(?:real\s+|live\s+|actual\s+)?(?:human|person|someone|somebody|agent|representative|rep|advisor|team|staff|manager|sales)|(?:real|live|actual)\s+(?:human|person|agent)|human\s+(?:agent|support|help|please)|customer\s+service|call\s+me|(?:need|want)\s+(?:a\s+)?human|not\s+(?:a\s+)?(?:bot|robot|ai)|are\s+you\s+(?:a\s+)?(?:bot|robot|human|real))\b/i;

export const wantsHuman = (message: string) => HUMAN_REQUEST.test(message);

const EMAIL = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+/;
export const findEmail = (text: string) => text.match(EMAIL)?.[0]?.toLowerCase() ?? null;

export function findName(text: string): string | null {
  const match = text.match(/(?:my name is|i am|i'm|this is)\s+([A-Za-z][A-Za-z' -]{1,40}?)(?=[.,!?\n]|\s+(?:and|from|at|with)\b|$)/i);
  return match ? match[1].trim().slice(0, 100) : null;
}

export function deviceFromUserAgent(ua: string): "desktop" | "mobile" | "tablet" {
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android|windows phone/i.test(ua)) return "mobile";
  return "desktop";
}
