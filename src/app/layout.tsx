import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Manipulation Decoder — Cybersecurity & AI Message Analyzer",
  description:
    "Decode the message. Detect the manipulation. Defend yourself. Defensive cybersecurity tool identifying psychological manipulation, phishing vectors, suspicious URLs, and AI-writing markers.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-background text-slate-100 min-h-screen cyber-grid-bg flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
