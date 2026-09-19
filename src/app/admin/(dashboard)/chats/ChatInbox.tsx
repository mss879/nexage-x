"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Bot, Hand, Mail, MessageSquare, Send, Trash2, User, UserRound } from "lucide-react";
import { Badge, Button, Card, Chip, EmptyState, ErrorBanner, Textarea } from "@/components/admin/ui";
import { cn } from "@/lib/utils";
import type { ChatConversationRow, ChatMessageRow } from "@/lib/chat";
import { deleteChat, getChatInbox, getChatThread, sendChatReply, setChatMode, setChatStatus } from "./actions";

const POLL_MS = 4000;
const FILTERS = ["all", "needs human", "open", "closed"] as const;
type Filter = (typeof FILTERS)[number];

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 86400 * 7) return `${Math.floor(seconds / 86400)}d`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const clock = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

const visitorLabel = (c: ChatConversationRow) => c.visitor_name || c.visitor_email || `Visitor ${c.id.slice(0, 6)}`;

/** The visitor has written since an admin last looked. */
const isUnread = (c: ChatConversationRow) =>
  c.last_message_role === "user" &&
  !!c.last_message_at &&
  (!c.admin_last_read_at || new Date(c.last_message_at) > new Date(c.admin_last_read_at));

export default function ChatInbox({ initialConversations }: { initialConversations: ChatConversationRow[] }) {
  const [conversations, setConversations] = useState(initialConversations);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);

  const lastIdRef = useRef(0);
  const threadEndRef = useRef<HTMLDivElement>(null);
  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  const counts = useMemo(
    () => ({
      all: conversations.length,
      "needs human": conversations.filter((c) => c.needs_human).length,
      open: conversations.filter((c) => c.status === "open").length,
      closed: conversations.filter((c) => c.status === "closed").length,
    }),
    [conversations]
  );

  const visible = useMemo(() => {
    const list = conversations.filter((c) =>
      filter === "all" ? true : filter === "needs human" ? c.needs_human : c.status === filter
    );
    // People waiting for a human always come first
    return [...list].sort((a, b) => Number(b.needs_human) - Number(a.needs_human));
  }, [conversations, filter]);

  const patchConversation = (id: string, patch: Partial<ChatConversationRow>) =>
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const refreshInbox = useCallback(async () => {
    const res = await getChatInbox();
    if (res.success) setConversations(res.conversations);
  }, []);

  const appendMessages = useCallback((incoming: ChatMessageRow[]) => {
    if (incoming.length === 0) return;
    lastIdRef.current = Math.max(lastIdRef.current, ...incoming.map((m) => m.id));
    setMessages((prev) => {
      const seen = new Set(prev.map((m) => m.id));
      const fresh = incoming.filter((m) => !seen.has(m.id));
      return fresh.length ? [...prev, ...fresh] : prev;
    });
  }, []);

  const openThread = async (id: string) => {
    setSelectedId(id);
    setMessages([]);
    setDraft("");
    setError(null);
    lastIdRef.current = 0;
    setLoadingThread(true);
    const res = await getChatThread(id);
    setLoadingThread(false);
    if (!res.success) return setError(res.error);
    appendMessages(res.messages);
    patchConversation(id, { ...res.conversation, admin_last_read_at: new Date().toISOString() });
  };

  // Live updates: the inbox list, plus new messages in the open thread
  useEffect(() => {
    const timer = setInterval(async () => {
      if (document.hidden) return;
      await refreshInbox();
      if (!selectedId) return;
      const res = await getChatThread(selectedId, lastIdRef.current);
      if (res.success) {
        appendMessages(res.messages);
        patchConversation(selectedId, { mode: res.conversation.mode, needs_human: res.conversation.needs_human, status: res.conversation.status, admin_last_read_at: new Date().toISOString() });
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [selectedId, refreshInbox, appendMessages]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, selectedId]);

  const handleSend = async () => {
    if (!selected || !draft.trim() || sending) return;
    setSending(true);
    setError(null);
    const res = await sendChatReply(selected.id, draft);
    setSending(false);
    if (!res.success) return setError(res.error);
    setDraft("");
    appendMessages([res.message]);
    patchConversation(selected.id, { mode: "human", needs_human: false, status: "open" });
  };

  const handleMode = async (mode: "ai" | "human") => {
    if (!selected) return;
    const res = await setChatMode(selected.id, mode);
    if (!res.success) return setError(res.error);
    patchConversation(selected.id, mode === "human" ? { mode, needs_human: false } : { mode });
  };

  const handleStatus = async (status: "open" | "closed") => {
    if (!selected) return;
    const res = await setChatStatus(selected.id, status);
    if (!res.success) return setError(res.error);
    patchConversation(selected.id, status === "closed" ? { status, needs_human: false } : { status });
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (!confirm("Delete this conversation and all its messages? This cannot be undone.")) return;
    const res = await deleteChat(selected.id);
    if (!res.success) return setError(res.error);
    setConversations((prev) => prev.filter((c) => c.id !== selected.id));
    setSelectedId(null);
    setMessages([]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Chip key={f} selected={filter === f} onClick={() => setFilter(f)} className="capitalize">
            {f}
            <span className="ml-1.5 tabular-nums opacity-70">{counts[f]}</span>
          </Chip>
        ))}
      </div>

      <Card className="grid h-[calc(100vh-15rem)] min-h-[520px] grid-cols-1 overflow-hidden lg:grid-cols-[340px_1fr]">
        {/* ── Conversation list ── */}
        <div className={cn("flex min-h-0 flex-col border-stone-200 lg:border-r", selectedId && "hidden lg:flex")}>
          {visible.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No conversations"
              description={filter === "all" ? "Chats from the website assistant will appear here." : "Nothing matches this filter."}
              className="flex-1"
            />
          ) : (
            <ul className="min-h-0 flex-1 divide-y divide-stone-200 overflow-y-auto">
              {visible.map((c) => {
                const unread = isUnread(c);
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => openThread(c.id)}
                      className={cn(
                        "flex w-full flex-col gap-1.5 px-4 py-3 text-left transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-500",
                        c.id === selectedId ? "bg-gold-50" : "hover:bg-stone-50"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn("flex min-w-0 items-center gap-2 text-sm text-stone-900", unread ? "font-semibold" : "font-medium")}>
                          {unread && <span className="h-2 w-2 shrink-0 rounded-full bg-gold-500" aria-label="Unread" />}
                          <span className="truncate">{visitorLabel(c)}</span>
                        </span>
                        <span className="shrink-0 text-[11px] tabular-nums text-stone-500">{relativeTime(c.last_message_at)}</span>
                      </div>
                      <p className={cn("line-clamp-2 text-xs leading-relaxed", unread ? "text-stone-700" : "text-stone-500")}>
                        {c.last_message_role === "admin" ? "You: " : c.last_message_role === "assistant" ? "AI: " : ""}
                        {c.last_message_preview}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {c.needs_human && (
                          <Badge tone="solid">
                            <Hand className="h-3 w-3" />
                            Wants a human
                          </Badge>
                        )}
                        {c.mode === "human" ? <Badge tone="soft">You&rsquo;re replying</Badge> : <Badge>AI</Badge>}
                        {c.status === "closed" && <Badge tone="muted">Closed</Badge>}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── Thread ── */}
        <div className={cn("min-h-0 flex-col", selectedId ? "flex" : "hidden lg:flex")}>
          {!selected ? (
            <EmptyState
              icon={MessageSquare}
              title="Select a conversation"
              description="Read what visitors asked the assistant, or step in and reply yourself."
              className="flex-1"
            />
          ) : (
            <>
              {/* Header */}
              <div className="flex flex-col gap-3 border-b border-stone-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    aria-label="Back to conversations"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 cursor-pointer lg:hidden"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-stone-900">{visitorLabel(selected)}</div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-stone-500">
                      {selected.visitor_email && (
                        <a href={`mailto:${selected.visitor_email}`} className="flex items-center gap-1 hover:text-stone-900">
                          <Mail className="h-3 w-3" />
                          {selected.visitor_email}
                        </a>
                      )}
                      {selected.started_path && <span>from {selected.started_path}</span>}
                      {selected.country && <span>{regionNames.of(selected.country) ?? selected.country}</span>}
                      {selected.device && <span className="capitalize">{selected.device}</span>}
                      <span>started {clock(selected.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {selected.mode === "ai" ? (
                    <Button size="sm" onClick={() => handleMode("human")}>
                      <UserRound className="h-3.5 w-3.5" />
                      Take over · turn AI off
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => handleMode("ai")}>
                      <Bot className="h-3.5 w-3.5" />
                      Hand back to AI
                    </Button>
                  )}
                  <Button size="sm" variant="secondary" onClick={() => handleStatus(selected.status === "open" ? "closed" : "open")}>
                    {selected.status === "open" ? "Close" : "Reopen"}
                  </Button>
                  <Button size="sm" variant="danger" onClick={handleDelete} aria-label="Delete conversation">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* State strip */}
              <div
                className={cn(
                  "flex items-center gap-2 border-b px-4 py-2 text-xs",
                  selected.mode === "human" ? "border-gold-200 bg-gold-50 text-gold-800" : "border-stone-200 bg-stone-50 text-stone-600"
                )}
              >
                {selected.mode === "human" ? (
                  <>
                    <UserRound className="h-3.5 w-3.5" />
                    The AI is off for this conversation — the visitor only hears from you.
                  </>
                ) : selected.needs_human ? (
                  <>
                    <Hand className="h-3.5 w-3.5 text-gold-700" />
                    <span className="font-medium text-stone-800">This visitor asked for a person.</span> The AI is still answering — reply or take over to step in.
                  </>
                ) : (
                  <>
                    <Bot className="h-3.5 w-3.5" />
                    The AI is answering. Sending a reply takes the conversation over.
                  </>
                )}
              </div>

              {/* Messages */}
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-stone-50/60 px-4 py-4">
                {loadingThread && <p className="text-center text-xs text-stone-500">Loading…</p>}
                {messages.map((m) => {
                  const mine = m.role === "admin";
                  const visitor = m.role === "user";
                  return (
                    <div key={m.id} className={cn("flex gap-2", visitor ? "justify-start" : "justify-end")}>
                      {visitor && (
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-200 text-stone-600">
                          <User className="h-3.5 w-3.5" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[78%] rounded-2xl border px-3.5 py-2.5 text-sm leading-relaxed",
                          visitor && "rounded-tl-sm border-stone-200 bg-white text-stone-800",
                          m.role === "assistant" && "rounded-tr-sm border-stone-200 bg-stone-100 text-stone-700",
                          mine && "rounded-tr-sm border-gold-300 bg-gold-100 text-stone-900"
                        )}
                      >
                        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-stone-500">
                          {visitor ? "Visitor" : mine ? "You (YARI team)" : "AI assistant"}
                          <span className="font-normal tabular-nums">· {clock(m.created_at)}</span>
                        </div>
                        <p className="whitespace-pre-line break-words">{m.content}</p>
                      </div>
                      {!visitor && (
                        <div
                          className={cn(
                            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                            mine ? "bg-gold-500 text-stone-900" : "bg-stone-200 text-stone-600"
                          )}
                        >
                          {mine ? <UserRound className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={threadEndRef} />
              </div>

              {/* Composer */}
              <div className="border-t border-stone-200 bg-white p-3">
                {error && <ErrorBanner className="mb-2">{error}</ErrorBanner>}
                <div className="flex items-end gap-2">
                  <Textarea
                    rows={2}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={
                      selected.mode === "ai"
                        ? "Reply as the YARI team — this turns the AI off for this chat…"
                        : "Reply to the visitor…  (Enter to send, Shift+Enter for a new line)"
                    }
                    aria-label="Reply to the visitor"
                    className="max-h-40 resize-none"
                  />
                  <Button onClick={handleSend} disabled={!draft.trim() || sending} className="h-10 shrink-0">
                    <Send className="h-4 w-4" />
                    {sending ? "Sending…" : "Send"}
                  </Button>
                </div>
                <p className="mt-1.5 text-[11px] text-stone-500">
                  The visitor sees your reply in their chat window within a few seconds, if they still have the site open.
                </p>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
