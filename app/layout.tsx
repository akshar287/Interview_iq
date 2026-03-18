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
  icons: {
    icon: "/careerly-icon.png",
    shortcut: "/careerly-icon.png",
    apple: "/careerly-icon.png",
  },
};

import GlobalBackButton from "@/components/GlobalBackButton";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${monaSans.className} antialiased pattern`}>
        {children}
        <GlobalBackButton />
        <Toaster />
      </body>
    </html>
  );
}
