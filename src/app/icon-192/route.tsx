import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#14120f",
          color: "#d9a94a",
          fontFamily: "Georgia, serif",
          fontSize: 128,
          fontWeight: 700,
        }}
      >
        z
      </div>
    ),
    { width: 192, height: 192 }
  );
}
