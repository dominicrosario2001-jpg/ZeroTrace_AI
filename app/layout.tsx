import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LocalAI — Private File Processor",
  description: "Process files locally. Zero uploads. Full privacy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ink-900 text-ghost-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
