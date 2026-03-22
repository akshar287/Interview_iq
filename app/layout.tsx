import { Toaster } from "sonner";
import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";

import "./globals.css";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Careerly",
  description: "AI-powered placement preparation suite — Aptitude, Technical & AI Mock Interviews",
  manifest: "/manifest.json",
  themeColor: "#2dd4bf",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Careerly",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/careerly-icon.png",
    shortcut: "/careerly-icon.png",
    apple: "/careerly-icon.png",
  },
};

export const viewport = {
  themeColor: "#2dd4bf",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import GlobalBackButton from "@/components/GlobalBackButton";
import PWARegistration from "@/components/PWARegistration";
import GlobalBannerFetcher from "@/components/GlobalBannerFetcher";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${monaSans.className} antialiased pattern`}>
        <Suspense fallback={null}>
          <GlobalBannerFetcher />
        </Suspense>
        <PWARegistration />
        {children}
        <GlobalBackButton />
        <Toaster />
      </body>
    </html>
  );
}
