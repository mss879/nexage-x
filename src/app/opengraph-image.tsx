import { ImageResponse } from "next/og";

// Branded 1200×630 social share card, generated at build time.
export const alt = "YARI — E-commerce, Software & Logistics Studio in Dubai";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(120% 120% at 80% 0%, rgba(223,131,38,0.28) 0%, transparent 55%), #050508",
          padding: "72px",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              background: "#df8326",
              borderRadius: "6px",
              transform: "skewX(-12deg)",
            }}
          />
          <span
            style={{
              fontSize: "30px",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
            }}
          >
            YARI
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: "82px",
              fontWeight: 800,
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
            }}
          >
            E-commerce, Software
          </span>
          <span
            style={{
              fontSize: "82px",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            &amp; Logistics — <span style={{ color: "#df8326" }}>in Dubai</span>
          </span>
          <span
            style={{
              marginTop: "28px",
              fontSize: "30px",
              color: "#a1a1aa",
              maxWidth: "900px",
            }}
          >
            We design, build and ship the whole stack for ambitious brands
            across the UAE and GCC.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: "14px",
            fontSize: "22px",
            color: "#df8326",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
          }}
        >
          <span>Web</span>
          <span style={{ color: "#3f3f46" }}>·</span>
          <span>E-commerce</span>
          <span style={{ color: "#3f3f46" }}>·</span>
          <span>Odoo / Zoho</span>
          <span style={{ color: "#3f3f46" }}>·</span>
          <span>Fulfilment</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
