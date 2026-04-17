import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "【科技守護．智慧安居】長照人員科技輔具教育訓練 — 報名",
  description: "長照 3.0 智慧科技輔具新制 — 專業培訓報名",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
