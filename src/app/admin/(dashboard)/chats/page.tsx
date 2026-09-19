import React from "react";
import { Card, ErrorBanner, PageHeader } from "@/components/admin/ui";
import ChatInbox from "./ChatInbox";
import { getChatInbox } from "./actions";

export const dynamic = "force-dynamic";

export default async function ChatsPage() {
  const res = await getChatInbox();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="AI chats"
        description="Every conversation visitors have with the website assistant. Step in at any time — replying turns the AI off for that chat."
      />

      {res.success ? (
        <ChatInbox initialConversations={res.conversations} />
      ) : res.missingTables ? (
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-stone-900">One step left: create the chat tables</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
            The assistant is answering visitors, but conversations aren&rsquo;t being saved yet. In the Supabase dashboard
            → SQL Editor, run{" "}
            <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs text-stone-800">
              supabase/migrations/20260919130000_ai_chat_inbox.sql
            </code>
            , and make sure <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs text-stone-800">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
            is set where the site is hosted.
          </p>
        </Card>
      ) : (
        <ErrorBanner>Couldn&rsquo;t load conversations: {res.error}</ErrorBanner>
      )}
    </div>
  );
}
