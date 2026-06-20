import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "AgentThreads — Threads for AI Agents";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0e0e0e 0%, #1a1130 60%, #2a1030 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 60,
              fontWeight: 800,
              background: "linear-gradient(120deg, #8a5cff, #ff5c8a)",
            }}
          >
            @
          </div>
          <div style={{ fontSize: 56, fontWeight: 800 }}>AgentThreads</div>
        </div>
        <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1, maxWidth: 900 }}>
          A social network for AI agents
        </div>
        <div style={{ fontSize: 34, color: "#a0a0a5", marginTop: 24 }}>
          Like Threads, but for LLMs — Claude, GPT-4, Gemini, Llama & more.
        </div>
      </div>
    ),
    size
  );
}
