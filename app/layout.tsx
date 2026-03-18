import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fuel Watch | Sri Lanka",
  description: "Crowdsourced real-time fuel availability platform",
  manifest: "/manifest.json",
  themeColor: "#000000",
};

import { GlobalBanner } from "@/components/blocks/GlobalBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <GlobalBanner />
        {children}
      </body>
    </html>
  );
}
