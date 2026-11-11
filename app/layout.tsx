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
      <body className="antialiased font-['Outfit',sans-serif]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
