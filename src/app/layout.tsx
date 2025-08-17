import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import SessionProvider from "@/providers/SessionProvider";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Starbyte",
    template: "%s | Starbyte",
  },

  description:
    "Starbyte is a social challenge platform where Stars create and complete meaningful physical and digital challenges. Prove real-world actions with photos to earn Stardust, unlock digital challenges, share progress, and build better habits together.",
  keywords: [
    "social challenges",
    "habit tracking",
    "self improvement",
    "gamification",
    "accountability",
    "Starbyte",
    "Stars",
    "Stardust",
    "photo proof",
    "physical challenges",
    "digital challenges",
    "wellness",
    "fitness",
    "productivity",
    "progress sharing",
    "community challenges",
    "goal tracking",
  ],
  icons: [
    { rel: "icon", url: "/icons/icon-16x16.png", sizes: "16x16" },
    { rel: "icon", url: "/icons/icon-32x32.png", sizes: "32x32" },
    { rel: "icon", url: "/icons/icon-48x48.png", sizes: "48x48" },
    { rel: "icon", url: "/icons/icon-57x57.png", sizes: "57x57" },
    { rel: "icon", url: "/icons/icon-60x60.png", sizes: "60x60" },
    { rel: "icon", url: "/icons/icon-72x72.png", sizes: "72x72" },
    { rel: "icon", url: "/icons/icon-76x76.png", sizes: "76x76" },
    { rel: "icon", url: "/icons/icon-96x96.png", sizes: "96x96" },
    { rel: "icon", url: "/icons/icon-120x120.png", sizes: "120x120" },
    { rel: "icon", url: "/icons/icon-128x128.png", sizes: "128x128" },
    { rel: "icon", url: "/icons/icon-144x144.png", sizes: "144x144" },
    { rel: "icon", url: "/icons/icon-152x152.png", sizes: "152x152" },
    { rel: "icon", url: "/icons/icon-167x167.png", sizes: "167x167" },
    { rel: "icon", url: "/icons/icon-180x180.png", sizes: "180x180" },
    { rel: "icon", url: "/icons/icon-192x192.png", sizes: "192x192" },
    { rel: "icon", url: "/icons/icon-256x256.png", sizes: "256x256" },
    { rel: "icon", url: "/icons/icon-384x384.png", sizes: "384x384" },
    { rel: "icon", url: "/icons/icon-512x512.png", sizes: "512x512" },
    { rel: "icon", url: "/icons/icon512_maskable.png", sizes: "512x512" },
    { rel: "icon", url: "/icons/icon512_rounded.png", sizes: "512x512" },
  ],
  authors: [{ name: "Enfiniq", url: "https://github.com/Enfiniq" }],
  creator: "Enfiniq",
  publisher: "Starbyte",
  applicationName: "Starbyte",
  category: "Lifestyle",
  classification: "Social Challenge & Habit Platform",
  openGraph: {
    type: "website",
    siteName: "Starbyte",
    title: "Starbyte: Make life a challenge",
    description:
      "Create and complete meaningful challenges, physical and digital. Prove with photos, earn Stardust, unlock more, and share your progress with the community.",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://starbyte.neploom.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Starbyte: Social challenges with photo proof and Stardust",
        type: "image/png",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@starbyte",
    creator: "@enfiniq",
    title: "Starbyte: Make life a challenge",
    description:
      "Create and complete challenges. Prove with photos, earn Stardust, unlock digital challenges, and share your progress.",
    images: ["/twitter-card.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  verification: {
    // google: "your-google-site-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-site-verification-code",
  },
  alternates: {
    canonical:
      process.env.NEXT_PUBLIC_BASE_URL || "https://starbyte.neploom.com",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://starbyte.neploom.com"
  ),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#4f7cff" />
        <meta
          name="description"
          content="Starbyte is a social challenge platform where Stars create and complete meaningful physical and digital challenges. Prove real-world actions with photos to earn Stardust, unlock digital challenges, share progress, and build better habits together."
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="StarByte" />
        <meta name="application-name" content="StarByte" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#4f7cff" />
        <meta
          name="msapplication-TileImage"
          content="/icons/icon512_rounded.png"
        />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${inter.variable} antialiased max-w-screen overflow-x-hidden`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SessionProvider>{children}</SessionProvider>
          <Toaster richColors></Toaster>
        </ThemeProvider>
      </body>
    </html>
  );
}
