/**
 * Renders one or more JSON-LD structured-data objects into the DOM.
 *
 * Server-safe (no "use client"). Pass a single schema object or an array;
 * each is emitted as its own <script type="application/ld+json">.
 */
import React from "react";

type Schema = Record<string, unknown>;

export default function JsonLd({ data }: { data: Schema | Schema[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Structured data is trusted, build-time content — safe to inline.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
