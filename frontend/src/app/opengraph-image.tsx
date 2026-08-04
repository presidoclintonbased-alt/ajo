import { ImageResponse } from "next/og";

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
          alignItems: "center",
          justifyContent: "center",
          background: "#fbf6ee",
          fontFamily: "sans-serif",
        }}
      >
        <svg width="96" height="96" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="13" stroke="#d8c7ab" strokeWidth="1.2" strokeDasharray="1.6 3.2" />
          <circle cx="16" cy="4" r="4.5" fill="#c2410c" />
          <circle cx="28" cy="16" r="3" fill="#b45309" opacity="0.35" />
          <circle cx="16" cy="28" r="3" fill="#b45309" opacity="0.35" />
          <circle cx="4" cy="16" r="3" fill="#b45309" opacity="0.35" />
        </svg>
        <div style={{ marginTop: 32, fontSize: 72, fontStyle: "italic", color: "#241c15" }}>Ajo</div>
        <div style={{ marginTop: 16, fontSize: 30, color: "#8a7a68", display: "flex" }}>
          Rotating savings circles, held by a contract — not a person
        </div>
      </div>
    ),
    { ...size },
  );
}
