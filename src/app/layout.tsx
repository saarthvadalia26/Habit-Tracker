import type { Metadata, Viewport } from "next";
import "./globals.css";
import "sonner/dist/styles.css";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "Habit Tracker | Daily Discipline & Consistency",
  description: "Build unstoppable momentum with daily habit rituals, continuous streaks, and consistency tracking.",
  manifest: "/manifest.json?v=4",
  icons: {
    icon: [
      { url: "/favicon.svg?v=4", type: "image/svg+xml" },
      { url: "/favicon-32x32.png?v=4", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png?v=4", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=4",
    apple: [
      { url: "/apple-touch-icon.png?v=4", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon-167x167.png?v=4", sizes: "167x167", type: "image/png" },
      { url: "/apple-touch-icon-152x152.png?v=4", sizes: "152x152", type: "image/png" },
    ],
    other: [
      { rel: "apple-touch-icon-precomposed", url: "/apple-touch-icon-precomposed.png?v=4" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2ecdf" },
    { media: "(prefers-color-scheme: dark)", color: "#11100d" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.svg?v=4" type="image/svg+xml" />
        <link rel="icon" href="/favicon-32x32.png?v=4" sizes="32x32" type="image/png" />
        <link rel="icon" href="/favicon-16x16.png?v=4" sizes="16x16" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=4" sizes="180x180" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-167x167.png?v=4" sizes="167x167" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-152x152.png?v=4" sizes="152x152" />
        <link rel="shortcut icon" href="/favicon.ico?v=4" />
      </head>
      <body className="min-h-full flex flex-col font-archivo selection:bg-[#ff5a1f] selection:text-white transition-colors duration-300">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}