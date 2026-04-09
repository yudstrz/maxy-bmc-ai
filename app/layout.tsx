import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAXY BMC AI - Smart Business Model Canvas Simulator",
  description: "AI-powered Business Model Canvas simulator to help you build, analyze, and pitch your startup ideas with ease.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased font-['Outfit',sans-serif]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
