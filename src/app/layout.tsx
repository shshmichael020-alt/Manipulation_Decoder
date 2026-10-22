import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Manipulation Decoder — Cognitive Security Workstation",
  description:
    "Decode the message. Detect the manipulation. Defend yourself. Defensive cybersecurity tool identifying psychological manipulation, phishing vectors, suspicious URLs, email envelope forensics, and AI-writing markers.",
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
      <body className="bg-surface font-body-base text-body-base text-on-surface antialiased selection:bg-primary-container selection:text-on-primary min-h-screen cyber-grid-bg flex flex-col">
        {children}
      </body>
    </html>
  );
}
