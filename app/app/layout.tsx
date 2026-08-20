import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Fonts are provided via CSS variables (--font-sans / --font-display / --font-mono)
// defined in globals.css using system-font stacks. This avoids next/font/google,
// which performs a blocking network fetch to fonts.googleapis.com / fonts.gstatic.com
// at build time and hangs the dev server / build when those hosts are unreachable.

export const metadata: Metadata = {
  title: "FalconOps — AI Growth Intelligence Pipeline",
  description: "Discover local businesses, audit website performance, rank prospects, build custom websites, and launch cold outreach.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans" suppressHydrationWarning>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
