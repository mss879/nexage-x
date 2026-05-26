"use client";

import React, { useState } from "react";
import { Command, Mail, ArrowRight, Terminal, ArrowUp } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const footerLinks = [
    {
      title: "Navigation",
      links: [
        { label: "Home", href: "#hero" },
        { label: "Features", href: "#features" },
        { label: "Interactive Lab", href: "#lab" },
      ],
    },
    {
      title: "Ecosystem",
      links: [
        { label: "Developers", href: "#" },
        { label: "API Reference", href: "#" },
        { label: "GitHub Core", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "Security", href: "#" },
      ],
    },
  ];

  return (
    <footer className="relative bg-bg-surface border-t border-border-subtle mt-20">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-accent-primary to-transparent opacity-50" />
      <div className="absolute -top-[150px] left-1/2 -translate-x-1/2 w-[350px] h-[300px] bg-accent-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* Brand Info */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={scrollToTop}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-primary to-accent-secondary p-[1px] shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                <div className="w-full h-full rounded-xl bg-bg-surface flex items-center justify-center">
                  <Command className="w-5 h-5 text-neon-cyan" />
                </div>
              </div>
              <span className="text-lg font-bold tracking-wider font-sans">
                NEXAGE<span className="text-neon-cyan">X</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              Designing spatial responsive layouts and highly performant interfaces engineered for the next generation of web applications.
            </p>

            {/* Tech Status Tag */}
            <div className="flex items-center gap-2 text-xs font-mono text-neon-emerald mt-2">
              <span className="w-2 h-2 rounded-full bg-neon-emerald animate-ping" />
              <span>System Operational // v0.1.0-alpha</span>
            </div>
          </div>

          {/* Nav Columns */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-6">
            {footerLinks.map((column, idx) => (
              <div key={idx} className="flex flex-col gap-4">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 font-mono">
                  {column.title}
                </h4>
                <ul className="flex flex-col gap-2.5">
                  {column.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <a
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-white transition-colors duration-300 relative group py-0.5 inline-block"
                      >
                        {link.label}
                        <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-neon-cyan group-hover:w-full transition-all duration-300" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter Input */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 font-mono">
              Newsletter Node
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Receive encrypted developer notes & optimization logs.
            </p>
            <form onSubmit={handleSubscribe} className="relative mt-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@domain.com"
                className="w-full px-4 py-3 rounded-xl bg-bg-base border border-border-subtle text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300"
              />
              <button
                type="submit"
                disabled={subscribed}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                {subscribed ? (
                  <span className="text-xs font-mono">OK</span>
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-border-subtle my-12" />

        {/* Lower Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 text-xs text-gray-500 font-mono">
            <Terminal className="w-3.5 h-3.5" />
            <span>&copy; {new Date().getFullYear()} NEXAGE-X CORE. SECURED.</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {[
              {
                icon: (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                ),
                href: "#"
              },
              {
                icon: (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                ),
                href: "#"
              },
              {
                icon: (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                ),
                href: "#"
              },
            ].map((social, sIdx) => (
              <a
                key={sIdx}
                href={social.href}
                className="w-8 h-8 rounded-lg border border-border-subtle bg-bg-surface flex items-center justify-center text-gray-400 hover:text-neon-cyan hover:border-neon-cyan hover:shadow-[0_0_10px_rgba(34,211,238,0.2)] transition-all duration-300"
              >
                {social.icon}
              </a>
            ))}

            {/* Scroll to Top */}
            <button
              onClick={scrollToTop}
              className="w-8 h-8 rounded-lg border border-border-subtle bg-bg-surface flex items-center justify-center text-gray-400 hover:text-neon-purple hover:border-neon-purple hover:shadow-[0_0_10px_rgba(168,85,247,0.2)] transition-all duration-300 cursor-pointer ml-2"
              title="Scroll to Top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
