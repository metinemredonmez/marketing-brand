import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const SITE = "MarkaRadar";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title =
    (searchParams.get("title") ?? "").slice(0, 180) ||
    "Türkiye'nin AI-native pazarlama medyası";
  const eyebrow =
    (searchParams.get("eyebrow") ?? "").slice(0, 40) || "MarkaRadar";
  const category = (searchParams.get("category") ?? "").slice(0, 30);
  const tone = (searchParams.get("tone") ?? "dark") === "light" ? "light" : "dark";

  const isDark = tone === "dark";
  const bg = isDark ? "#0a0e1a" : "#ffffff";
  const fg = isDark ? "#ffffff" : "#0a0e1a";
  const muted = isDark ? "rgba(255,255,255,0.65)" : "rgba(10,14,26,0.65)";
  const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(10,14,26,0.10)";
  const accent = "#f97316";
  const fontSize = title.length > 60 ? 64 : 80;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: bg,
          color: fg,
          padding: "80px",
          fontFamily: "Inter, system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Accent halo */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "600px",
            height: "600px",
            borderRadius: "9999px",
            background: accent,
            opacity: 0.2,
            filter: "blur(120px)",
            display: "flex",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "9999px",
              background: accent,
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: "28px",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            {SITE}
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, display: "flex" }} />

        {/* Eyebrow row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "8px 20px",
              borderRadius: "9999px",
              border: `1px solid ${border}`,
              fontSize: "20px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: accent,
            }}
          >
            {eyebrow}
          </div>
          {category ? (
            <div
              style={{
                display: "flex",
                padding: "8px 20px",
                borderRadius: "9999px",
                background: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.05)",
                fontSize: "20px",
                fontWeight: 600,
                color: muted,
              }}
            >
              {category}
            </div>
          ) : null}
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            marginTop: "28px",
            fontSize: `${fontSize}px`,
            lineHeight: 1.05,
            fontWeight: 800,
            letterSpacing: "-0.035em",
            color: fg,
            position: "relative",
          }}
        >
          {title}
        </div>

        {/* Footer URL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginTop: "36px",
            fontSize: "20px",
            color: muted,
            position: "relative",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "9999px",
              background: muted,
              display: "flex",
            }}
          />
          markaradar.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
