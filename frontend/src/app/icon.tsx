import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fbf6ee",
          borderRadius: "50%",
        }}
      >
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="13" stroke="#d8c7ab" strokeWidth="1.5" strokeDasharray="2 4" />
          <circle cx="16" cy="4" r="4.5" fill="#c2410c" />
          <circle cx="28" cy="16" r="3" fill="#b45309" opacity="0.35" />
          <circle cx="16" cy="28" r="3" fill="#b45309" opacity="0.35" />
          <circle cx="4" cy="16" r="3" fill="#b45309" opacity="0.35" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
