"use client";

import React from "react";

/** Window event the AI chat widget listens for to open itself. */
export const OPEN_CHAT_EVENT = "yari:open-chat";

/** Any element that should open the AI chat widget (e.g. a "Live chat" card). */
export default function OpenChatButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CHAT_EVENT))}
      className={className}
    >
      {children}
    </button>
  );
}
