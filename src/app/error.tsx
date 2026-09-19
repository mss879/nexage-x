"use client"; // Error boundaries must be Client Components

import React, { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main-content" className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#050508] px-6 text-center text-white">
      <div className="absolute inset-0 cyber-grid opacity-[0.03] pointer-events-none" />
      <div className="relative z-10 flex max-w-xl flex-col items-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#df8326]">Something went wrong</span>
        <h1 className="mt-5 font-michroma text-[1.6rem] font-normal uppercase leading-[1.15] tracking-tight sm:text-[2.4rem]">
          We hit an unexpected error
        </h1>
        <p className="mt-5 font-sans text-base leading-relaxed text-zinc-400">
          Try again — if it keeps happening, head back to the homepage and let us know.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="rounded-full bg-gradient-to-b from-[#df8326] to-[#C57019] px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white shadow-[0_10px_30px_rgba(197,112,25,0.35)] transition-all duration-300 hover:scale-[1.03] active:scale-95"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-white/15 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-zinc-200 transition-all duration-300 hover:border-[#df8326] hover:text-white"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
