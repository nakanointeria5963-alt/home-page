import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import MotionProvider from "@/components/MotionProvider";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

// 共有したときに出る画像やリンクの読み込み元。必ずこのドメインにする。
// Vercel が自動でつける住所(VERCEL_URL)は公開するたびに変わるので、
// それを使うと、前に人へ送ったリンクの画像があとから出なくなる。
// ここは本番のドメインを直接書く。開発中もこの住所が使われるが、それでいい。
const SITE_URL = "https://www.roguepink.com";

const TITLE = "ROGUE PINK";
const DESCRIPTION =
  "ありがとうと言ってもらいたい。そして、ありがとうと言いたい。ROGUE PINKは、ひとりから始まる、なんでもありのブランドです。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: TITLE,
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0f16",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full`}>
      <body className="min-h-full bg-background text-foreground antialiased">
        <MotionProvider>{children}</MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
