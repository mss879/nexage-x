"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { OPEN_CHAT_EVENT } from "@/components/ui/OpenChatButton";

const AiChatWidget = dynamic(() => import("@/components/AiChatWidget"), { ssr: false });

/**
 * Mounts the AI chat widget once the browser is idle. The widget only appears
 * after the visitor scrolls past the hero, so loading + hydrating it up front
 * just competes with the preloader animation for the main thread.
 * A "Live chat" click (OPEN_CHAT_EVENT) mounts it immediately, already open.
 */
export default function LazyChatWidget() {
  const [mounted, setMounted] = useState(false);
  const [openOnMount, setOpenOnMount] = useState(false);

  useEffect(() => {
    if (mounted) return;

    const mountOpen = () => {
      setOpenOnMount(true);
      setMounted(true);
    };
    window.addEventListener(OPEN_CHAT_EVENT, mountOpen);

    const mount = () => setMounted(true);
    let cancel: () => void;
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(mount, { timeout: 6000 });
      cancel = () => window.cancelIdleCallback(id);
    } else {
      const id = setTimeout(mount, 4000);
      cancel = () => clearTimeout(id);
    }

    return () => {
      window.removeEventListener(OPEN_CHAT_EVENT, mountOpen);
      cancel();
    };
  }, [mounted]);

  return mounted ? <AiChatWidget defaultOpen={openOnMount} /> : null;
}
