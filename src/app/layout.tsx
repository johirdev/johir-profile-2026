import type { Metadata, Viewport } from "next";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider, { THEME_BOOTSTRAP_SCRIPT } from "./lib/themeStore";
import { sharedMetadata } from "@/lib/seo";

/**
 * Type scale — three faces, each with one job:
 *   Sora           headlines. Geometric, slightly technical, distinct at 48px+
 *   Inter          body and UI. The most legible sans at 13-16px
 *   JetBrains Mono metrics, percentages, stack names, code
 *
 * All three are variable fonts, self-hosted by next/font at build time —
 * no request ever reaches Google, and there is no layout shift.
 */
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = sharedMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f7fc" },
    { media: "(prefers-color-scheme: dark)", color: "#060d1a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        {/* Applies the stored theme before first paint. */}
        <script
          dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }}
        />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link rel="dns-prefetch" href="https://cdn.simpleicons.org" />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
