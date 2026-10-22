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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface font-body-base text-body-base text-on-surface antialiased selection:bg-primary-container selection:text-on-primary min-h-screen cyber-grid-bg flex flex-col">
        {children}
      </body>
    </html>
  );
}
