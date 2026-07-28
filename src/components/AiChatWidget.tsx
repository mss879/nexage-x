"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Headset, X, Send, Sparkles, RefreshCw, CheckCircle2, User } from "lucide-react";
import gsap from "gsap";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

function formatLinks(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) =>
    part.match(urlRegex) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#f5b93f] underline font-semibold hover:text-white transition-colors"
      >
        {part}
      </a>
    ) : (
      part
    )
  );
}

export default function AiChatWidget() {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your YARI Service Agent. How can I help you today with custom software engineering, ERP/CRM integration, or logistics solutions?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [leadSaved, setLeadSaved] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const pulseRingRef = useRef<HTMLDivElement>(null);
  const pulseRing2Ref = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Show floating widget only after scrolling past the Hero section
  useEffect(() => {
    const handleScroll = () => {
      const hero = document.getElementById("hero");
      const heroHeight = hero ? hero.offsetHeight : window.innerHeight * 0.7;
      setIsVisible(window.scrollY > heroHeight * 0.65);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Realistic 3D GSAP multi-ring animated pulsing & floating physics
  useEffect(() => {
    if (!buttonRef.current || !pulseRingRef.current) return;

    const floatAnim = gsap.to(buttonRef.current, {
      y: -5,
      scale: 1.04,
      duration: 2.0,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    const pulseAnim = gsap.to(pulseRingRef.current, {
      scale: 1.85,
      opacity: 0,
      duration: 2.2,
      repeat: -1,
      ease: "power2.out",
    });

    const pulseAnim2 = pulseRing2Ref.current
      ? gsap.to(pulseRing2Ref.current, {
          scale: 2.3,
          opacity: 0,
          duration: 2.2,
          delay: 0.7,
          repeat: -1,
          ease: "power2.out",
        })
      : null;

    return () => {
      floatAnim.kill();
      pulseAnim.kill();
      if (pulseAnim2) pulseAnim2.kill();
    };
  }, [isVisible]);

  // Auto scroll message list
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputValue).trim();
    if (!content || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setIsLoading(true);

    try {
      const payload = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch AI response");

      const reply: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.content || "Thank you. Let me know if you would like me to connect you with our team!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, reply]);

      if (content.includes("@") && !leadSaved) {
        setLeadSaved(true);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I ran into a connection issue. You can reach us directly at contact@yari.com or +971 50 863 2422.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content: "Chat reset! How can I assist you with your project today?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setLeadSaved(false);
  };

  return (
    <>
      {/* ── 1. Floating Launcher Button (3D Glass Orb + Pulsing Aura) ── */}
      <div
        className={`fixed bottom-6 right-6 z-[90] transition-all duration-500 transform ${
          isVisible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-8 pointer-events-none"
        }`}
      >
        {/* Animated GSAP Concentric Pulsing Wave Rings */}
        <div
          ref={pulseRingRef}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-[#df8326] to-[#ffaa44] opacity-75 pointer-events-none -z-10"
        />
        <div
          ref={pulseRing2Ref}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-[#df8326]/60 to-[#C57019]/40 opacity-50 pointer-events-none -z-10"
        />

        {/* 3D Volumetric Glass Sphere Launcher Button */}
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Service Agent AI Chat"
          className="relative group flex items-center justify-center h-16 w-16 rounded-full text-white shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-2px_6px_rgba(0,0,0,0.8),0_0_30px_rgba(223,131,38,0.4)] border border-white/30 backdrop-blur-2xl transition-all duration-300 cursor-pointer overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(239, 148, 55, 0.55) 0%, rgba(20, 20, 26, 0.95) 50%, rgba(197, 112, 25, 0.45) 100%)",
          }}
        >
          {/* Top Glass Specular Highlight */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none rounded-t-full" />

          {/* Glass Inner Rim Light */}
          <div className="absolute inset-[1px] rounded-full border border-white/20 pointer-events-none" />

          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close-icon"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="relative z-10"
              >
                <X className="h-7 w-7 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
              </motion.div>
            ) : (
              <motion.div
                key="agent-icon"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="relative z-10 flex items-center justify-center"
              >
                <Headset className="h-8 w-8 text-white drop-shadow-[0_2px_10px_rgba(223,131,38,0.9)]" />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#0a0a0e]" />
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hover Gloss Sweep */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
        </button>
      </div>

      {/* ── 2. Spacious 3D Glassmorphic Chat Window Modal (Bigger & Roomier) ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-4 sm:right-6 z-[100] w-[calc(100vw-32px)] sm:w-[420px] md:w-[440px] h-[480px] sm:h-[530px] max-h-[calc(100vh-120px)] flex flex-col rounded-3xl border border-white/20 bg-[#0c0c12]/95 backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden font-sans text-white"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/15 bg-[#14141e]/90 px-5 py-4">
              <div className="flex items-center gap-3.5">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#df8326] via-[#c57019] to-[#8f4b0b] text-white shadow-[0_4px_15px_rgba(197,112,25,0.5)] border border-white/30">
                  <Headset className="h-5.5 w-5.5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#0c0c12]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-syne text-base font-bold uppercase tracking-tight text-white">
                      Service Agent
                    </h3>
                    <span className="rounded-full bg-[#df8326]/20 border border-[#df8326]/40 px-2 py-0.5 font-mono text-[9.5px] font-semibold text-[#f5b93f] tracking-wider">
                      ONLINE
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-zinc-400 block mt-0.5">
                    Customer Support &amp; Technical Consulting
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleResetChat}
                  title="Reset conversation"
                  className="rounded-xl p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  className="rounded-xl p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Lead Status Notification */}
            {leadSaved && (
              <div className="flex items-center gap-2 border-b border-emerald-500/30 bg-emerald-500/15 px-5 py-2.5 text-xs font-mono text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Contact details received — synced to YARI CRM pipeline.</span>
              </div>
            )}

            {/* Message Thread (Expands to fill full vertical height) */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4 bg-[#0c0c12] text-sm">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="h-8 w-8 shrink-0 rounded-xl bg-[#df8326]/20 border border-[#df8326]/40 flex items-center justify-center text-[#df8326] mt-0.5 shadow-sm">
                      <Headset className="h-4 w-4 text-[#f5b93f]" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed shadow-md ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-[#df8326] to-[#C57019] text-white font-medium rounded-br-none border border-white/20 shadow-[0_4px_15px_rgba(197,112,25,0.3)]"
                        : "bg-[#181824] border border-white/15 text-zinc-100 rounded-bl-none shadow-[0_4px_15px_rgba(0,0,0,0.5)]"
                    }`}
                  >
                    <div>{formatLinks(msg.content)}</div>
                    <span
                      className={`block mt-1.5 font-mono text-[10px] ${
                        msg.role === "user" ? "text-white/80 text-right" : "text-zinc-400"
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {msg.role === "user" && (
                    <div className="h-8 w-8 shrink-0 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-zinc-300 mt-0.5">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex gap-3 justify-start items-center">
                  <div className="h-8 w-8 shrink-0 rounded-xl bg-[#df8326]/20 border border-[#df8326]/40 flex items-center justify-center text-[#df8326]">
                    <Sparkles className="h-4 w-4 text-[#f5b93f] animate-spin" />
                  </div>
                  <div className="bg-[#181824] border border-white/15 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#df8326] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-[#df8326] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-[#df8326] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form (Flush at Bottom with Clean Spacing) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="border-t border-white/15 bg-[#14141e] p-3.5 flex items-center gap-2.5"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about software, ERP/CRM, or logistics..."
                disabled={isLoading}
                className="flex-1 bg-[#1c1c28] border border-white/20 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-[#df8326] transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#df8326] to-[#C57019] text-white shadow-md border border-white/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
