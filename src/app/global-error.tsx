"use client"; // Error boundaries must be Client Components

import React from "react";

// Replaces the root layout when it throws, so it must render its own <html>/<body>
// and can't rely on globals.css or the font variables — styles are inline.
export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          padding: 24,
          textAlign: "center",
          background: "#050508",
          color: "#f3f4f6",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <title>Something went wrong | YARI</title>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ margin: 0, maxWidth: 420, color: "#a1a1aa", lineHeight: 1.6 }}>
          An unexpected error stopped the page from loading. Please try again.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          style={{
            border: 0,
            borderRadius: 9999,
            padding: "14px 32px",
            background: "linear-gradient(180deg,#df8326 0%,#C57019 100%)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
