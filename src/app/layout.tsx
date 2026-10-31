import type { Metadata, Viewport } from "next";
import "./globals.css";
import "sonner/dist/styles.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Habit Tracker | Daily Discipline & Consistency",
  description: "Build unstoppable momentum with daily habit rituals, continuous streaks, and consistency tracking.",
  manifest: "/manifest.json?v=5",
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('habit_tracker_theme');
                  var theme = saved || 'dark';
                  var hex = theme === 'dark' ? '#11100d' : '#f2ecdf';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                    document.documentElement.style.colorScheme = 'light';
                  }
                  var metas = document.querySelectorAll('meta[name="theme-color"]');
                  for (var i = 0; i < metas.length; i++) {
                    metas[i].setAttribute('content', hex);
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <link rel="icon" href="/favicon.svg?v=4" type="image/svg+xml" />
        <link rel="icon" href="/favicon-32x32.png?v=4" sizes="32x32" type="image/png" />
        <link rel="icon" href="/favicon-16x16.png?v=4" sizes="16x16" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=4" sizes="180x180" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-167x167.png?v=4" sizes="167x167" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-152x152.png?v=4" sizes="152x152" />
        <link rel="shortcut icon" href="/favicon.ico?v=4" />
      </head>
      <body className="min-h-full flex flex-col font-archivo selection:bg-[#ff5a1f] selection:text-white transition-colors duration-300">
        <ErrorBoundary>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}