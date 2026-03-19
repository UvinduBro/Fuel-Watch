import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Fuel Watch | Sri Lanka - Real-time Fuel Availability",
    template: "%s | Fuel Watch Sri Lanka"
  },
  description: "Crowdsourced real-time fuel availability platform for Sri Lanka. Find petrol and diesel at nearby stations with live community updates.",
  keywords: ["fuel watch", "sri lanka", "fuel availability", "petrol", "diesel", "fuel pass", "qr code", "ceypetco", "lioc", "fuel sheds", "real-time fuel status"],
  authors: [{ name: "Fuel Watch Community" }],
  creator: "Fuel Watch",
  publisher: "Fuel Watch",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://fuelwatch.lk"), // Placeholder, adjust if needed
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Fuel Watch | Sri Lanka",
    description: "Real-time crowdsourced fuel availability across Sri Lanka.",
    url: "https://fuelwatch.lk",
    siteName: "Fuel Watch Sri Lanka",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fuel Watch Sri Lanka - Real-time Fuel Availability",
      },
    ],
    locale: "en_LK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fuel Watch | Sri Lanka",
    description: "Real-time crowdsourced fuel availability across Sri Lanka.",
    images: ["/og-image.png"],
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
};

import { GlobalBanner } from "@/components/blocks/GlobalBanner";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <Providers>
          <GoogleAnalytics />
          <GlobalBanner />
          {children}
        </Providers>
      </body>
    </html>
  );
}
