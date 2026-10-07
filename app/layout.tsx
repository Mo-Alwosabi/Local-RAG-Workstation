import type { Metadata } from "next";
import { Cairo, Geist, Geist_Mono } from "next/font/google";
import { AppProvider } from "@/lib/context/app-context";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Local RAG Workstation | Production RAG Agent",
  description: "Enterprise-Grade Retrieval-Augmented Generation (RAG) Platform & Workstation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <body
        className={`${cairo.variable} ${geistSans.variable} ${geistMono.variable} font-sans antialiased selection:bg-primary/20 selection:text-primary`}
      >
        <AppProvider>
          {children}
          <Toaster richColors closeButton position="top-center" />
        </AppProvider>
      </body>
    </html>
  );
}
