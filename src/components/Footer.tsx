"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { SocialIconsRow } from "@/components/ui/SocialIcons";
import { subscribeNewsletter } from "@/app/actions/newsletter";

export function SlidingLink({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-5 border-b border-r border-white/[0.08] even:border-r-0 hover:bg-white/[0.02] transition-colors duration-300 group overflow-hidden"
    >
      <div className="relative h-8 overflow-hidden flex flex-col">
        {/* Original text - slides up on hover */}
        <span className="font-mohave font-semibold text-2xl tracking-tighter uppercase text-[#eeeeee] transition-transform duration-500 ease-out group-hover:-translate-y-full">
          {label}
        </span>
        {/* Copy text - slides up from below on hover */}
        <span className="absolute left-0 top-full font-mohave font-semibold text-2xl tracking-tighter uppercase text-[#df8326] transition-transform duration-500 ease-out group-hover:-translate-y-full">
          {label}
        </span>
      </div>
      <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-[#df8326] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
    </Link>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    setFeedbackMsg("");

    const res = await subscribeNewsletter(email);
    setLoading(false);

    if (res.success) {
      setSubscribed(true);
      setFeedbackMsg(res.message || "Subscribed!");
      setEmail("");
      setTimeout(() => {
        setSubscribed(false);
        setFeedbackMsg("");
      }, 4000);
    } else {
      setFeedbackMsg(res.error || "Subscription failed.");
    }
  };

  const footerLinks = [
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Software", href: "/services/software" },
    { label: "Logistics", href: "/services/logistics" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <footer className="relative bg-[#050508] text-[#eeeeee] w-full pt-16 pb-0 box-border overflow-hidden">
      {/* Thin top divider glow line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#df8326]/30 to-transparent" />

      <div className="w-full relative z-10 flex flex-col">
        
        {/* 1. START A PROJECT - Large Full Width Row */}
        <a 
          href="mailto:contact@yari.com" 
          className="w-full flex items-center justify-between px-6 md:px-10 py-10 md:py-16 border-b border-white/[0.08] hover:bg-white/[0.02] transition-all duration-300 group select-none"
        >
          <h2 className="font-michroma font-normal uppercase tracking-tight text-[5.6vw] md:text-[4.6vw] leading-none text-[#eeeeee] group-hover:text-[#df8326] transition-colors duration-300">
            START A PROJECT
          </h2>
          <div className="flex items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded-full border border-white/[0.08] group-hover:border-[#df8326] group-hover:bg-[#df8326] transition-all duration-500">
            <ArrowUpRight className="w-6 h-6 md:w-10 md:h-10 text-white group-hover:text-black transition-colors duration-500" />
          </div>
        </a>

        {/* 2. Main Bottom Layout Grid (Orange Box left, Columns + Contact right) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 border-b border-white/[0.08]">
          
          {/* Column 1: Coppery Orange Solid Box (Stretches full height on desktop) —
              logo + tagline are one lockup centred in the free space, copyright is a strip on the bottom edge */}
          <div className="bg-[#df8326] text-black px-4 sm:px-6 flex flex-col items-center text-center min-h-0 lg:min-h-full border-b lg:border-b-0 border-white/[0.08] lg:border-r">
            <div className="flex flex-1 flex-col items-center justify-center gap-3 sm:gap-4 py-6 sm:py-8 lg:py-10 w-full">
              {/* Tightly cropped logo sized by the panel width, so it never spills past the orange panel */}
              <Image
                src="/yari-logo-black.png"
                alt="YARI"
                width={1600}
                height={512}
                sizes="(min-width: 1024px) 290px, 270px"
                className="w-full h-auto max-w-[170px] sm:max-w-[230px] md:max-w-[270px] lg:max-w-[290px] brightness-0 select-none"
                draggable={false}
              />
              <div className="h-px w-12 bg-black/25" />
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] font-mono">
                Global Logistics & Operations Node
              </p>
            </div>

            <div className="self-stretch -mx-4 sm:-mx-6 px-4 sm:px-6 border-t border-black/15 py-3.5 sm:py-4">
              <p className="text-[10px] opacity-75 font-mono">
                &copy; {new Date().getFullYear()} YARI. All Rights Reserved<a href="https://www.arcai.agency" target="_blank" rel="noopener" className="opacity-40 hover:opacity-100 transition-opacity font-bold" title="ARC AI Web Development & AI Automation Agency"><span style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }}>ARC AI Web Development &amp; AI Automation Agency</span>.</a>
              </p>
            </div>
          </div>

          {/* Right Area (Spans 3 columns on desktop) */}
          <div className="lg:col-span-3 flex flex-col">
            
            {/* Top Row: Links Stack, Follow Us, Newsletter */}
            <div className="grid grid-cols-1 md:grid-cols-3">
              
              {/* Column 2: Navigation Links — 2 per row */}
              <div className="grid grid-cols-2 border-b md:border-b-0 border-white/[0.08] md:border-r">
                {footerLinks.map((link, idx) => (
                  <SlidingLink key={idx} label={link.label} href={link.href} />
                ))}
              </div>

              {/* Column 3: Follow Us */}
              <div className="p-5 sm:p-6 md:p-8 flex flex-col gap-4 md:gap-6 border-b md:border-b-0 border-white/[0.08] md:border-r">
                <h4 
                  className="font-rock-salt text-base sm:text-lg text-[#df8326] select-none"
                  style={{ filter: "url(#wobbly-follow-us)" }}
                >
                  Follow Us
                </h4>
                <SocialIconsRow className="flex flex-wrap items-center gap-2.5 sm:gap-3" />
              </div>

              {/* Column 4: Newsletter Node with floating envelope & marquee & rotated video */}
              <div className="p-5 sm:p-6 md:p-8 flex flex-col justify-between min-h-[260px] md:min-h-[350px] relative group/news border-b md:border-b-0 border-white/[0.08]">
                
                {/* Clipped background elements container */}
                <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
                  {/* Background Marquee / Scrolling Ticker "Stay Ahead" */}
                  <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none select-none z-10">
                    <div className="flex gap-4 whitespace-nowrap animate-marquee text-[11vw] font-mohave font-bold uppercase text-white/[0.08]">
                      <span>Stay Ahead &nbsp;</span>
                      <span>Stay Ahead &nbsp;</span>
                      <span>Stay Ahead &nbsp;</span>
                    </div>
                  </div>

                  {/* Rotated background video card */}
                  <div 
                    className="absolute left-[-15px] top-[80px] w-[180px] h-[100px] rounded-lg overflow-hidden border border-white/5 z-0 pointer-events-none select-none opacity-30 group-hover/news:opacity-50 group-hover/news:scale-105 transition-all duration-700" 
                    style={{ transform: "rotate(-16deg)" }}
                  >
                    <video 
                      src="https://framerusercontent.com/assets/gtE8eL5FaBaxgb4xEEslwTr2K1o.mp4" 
                      loop 
                      autoPlay 
                      muted 
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* 3D Envelope rendering - outside overflow wrapper to allow border overlapping */}
                <div className="absolute right-[-45px] bottom-[-25px] w-[210px] h-[210px] pointer-events-none opacity-95 group-hover/news:opacity-100 group-hover/news:scale-105 group-hover/news:-rotate-12 transition-transform duration-700 select-none z-30 animate-float-medium">
                  <Image
                    src="/footer-envelope.png"
                    alt="Newsletter Envelope Decorative"
                    width={420}
                    height={420}
                    sizes="210px"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="relative z-20 flex flex-col gap-2">
                  <h4 
                    className="font-rock-salt text-lg text-[#df8326] select-none"
                    style={{ filter: "url(#wobbly-newsletter)" }}
                  >
                    Newsletter
                  </h4>
                  <p className="text-sm text-gray-400 font-sans leading-relaxed">
                    Subscribe to our newsletter for more insights.
                  </p>
                </div>

                <form onSubmit={handleSubscribe} className="relative z-20 flex flex-col gap-3 mt-6">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading || subscribed}
                    placeholder="Email address"
                    className="w-full px-4 py-3 rounded-none bg-zinc-900/40 border border-white/[0.08] text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#df8326] focus:ring-1 focus:ring-[#df8326] transition-all duration-300 disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={loading || subscribed}
                    className="w-full py-3 bg-zinc-800 text-white font-mono text-xs uppercase tracking-wider hover:bg-[#df8326] hover:text-black active:scale-[0.98] transition-all duration-300 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Subscribing...
                      </>
                    ) : subscribed ? (
                      "Subscribed!"
                    ) : (
                      "Subscribe"
                    )}
                  </button>
                  {feedbackMsg && (
                    <p className={`text-xs font-mono mt-1 ${subscribed ? "text-[#34d399]" : "text-amber-400"}`}>
                      {feedbackMsg}
                    </p>
                  )}
                </form>
              </div>

            </div>

            {/* Bottom Row: Reach Out & Legal Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 border-t border-white/[0.08]">
              {/* Reach Out */}
              <div className="p-5 sm:p-6 md:p-8 flex flex-col gap-1.5 border-b md:border-b-0 md:border-r border-white/[0.08] md:col-span-2">
                <h5 
                  className="font-rock-salt text-xs text-[#df8326] select-none"
                  style={{ filter: "url(#wobbly-reach-out)" }}
                >
                  Reach Out
                </h5>
                <a
                  href="mailto:contact@yari.com"
                  className="font-mohave font-semibold text-2xl sm:text-3xl md:text-4xl tracking-tighter uppercase text-[#eeeeee] hover:text-[#df8326] transition-colors duration-300"
                >
                  contact@yari.com
                </a>
              </div>

              {/* Legal links */}
              <nav aria-label="Legal" className="p-5 sm:p-6 md:p-8 flex flex-col justify-center items-start md:items-end gap-2.5 md:col-span-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest select-none">
                  Legal
                </span>
                {[
                  { label: "Privacy Policy", href: "/privacy-policy" },
                  { label: "Terms & Conditions", href: "/terms-and-conditions" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em] text-zinc-300 hover:text-[#df8326] transition-colors duration-300"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#df8326] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                  </Link>
                ))}
              </nav>
            </div>

          </div>

        </div>

      </div>

      {/* Wobbly SVG Filters for marker font text distortion */}
      <svg style={{ width: 0, height: 0, position: "absolute" }} aria-hidden="true" focusable="false">
        <defs>
          <filter id="wobbly-follow-us" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.01331" numOctaves="4" seed="639" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="wobbly-newsletter" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.01331" numOctaves="4" seed="240" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.35" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="wobbly-reach-out" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.01331" numOctaves="4" seed="552" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.24" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
    </footer>
  );
}
