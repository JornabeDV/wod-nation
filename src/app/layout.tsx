import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WODNation — El Futuro de las Competiciones de Fitness",
  description:
    "Crea eventos, cobra inscripciones, registra scores y muestra leaderboards en vivo para competiciones de CrossFit y fitness funcional.",
  keywords: [
    "CrossFit",
    "competición",
    "leaderboard",
    "WOD",
    "eventos de fitness",
    "fitness funcional",
  ],
  authors: [{ name: "WODNation" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WODNation",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="min-h-screen bg-background text-text">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
