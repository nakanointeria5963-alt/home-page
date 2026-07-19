import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "ROGUE PINK";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoData = await readFile(join(process.cwd(), "public/logo.jpg"), "base64");
  const logoSrc = `data:image/jpeg;base64,${logoData}`;

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
          background: "#0d0f16",
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,46,136,0.35), transparent 45%), radial-gradient(circle at 80% 70%, rgba(255,143,196,0.25), transparent 45%)",
        }}
      >
        <img
          src={logoSrc}
          alt=""
          width={220}
          height={220}
          style={{ borderRadius: 32 }}
        />
        <div
          style={{
            marginTop: 40,
            fontSize: 64,
            fontWeight: 900,
            letterSpacing: 4,
            color: "#f5f3f7",
          }}
        >
          ROGUE PINK
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 28,
            color: "#ff8fc4",
            letterSpacing: 2,
          }}
        >
          THANK YOU, AND BE THANKED.
        </div>
      </div>
    ),
    { ...size }
  );
}
