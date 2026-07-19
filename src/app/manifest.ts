import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ROGUE PINK",
    short_name: "ROGUE PINK",
    description:
      "ありがとうと言ってもらいたい。そして、ありがとうと言いたい。ROGUE PINKは、ひとりから始まる、なんでもありのブランドです。",
    start_url: "/",
    display: "standalone",
    background_color: "#0d0f16",
    theme_color: "#0d0f16",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
