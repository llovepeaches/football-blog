import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import MiniPlayer from "@/components/MiniPlayer";
import { MusicProvider } from "@/context/MusicContext";

export const metadata: Metadata = {
  title: "每日足球简报 | Football Daily",
  description: "每天最新的足球资讯、赛事简报、转会动态，尽在每日足球简报。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <MusicProvider>
          <Navbar />
          <main className="min-h-[100dvh] pb-28">
            {children}
          </main>
          <MiniPlayer />
        </MusicProvider>
      </body>
    </html>
  );
}
