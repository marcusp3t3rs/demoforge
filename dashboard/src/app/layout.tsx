import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "../components/layout/sidebar";
import { Header } from "../components/layout/header";
import { AuthProvider } from "../lib/auth";
import { NextAuthProvider } from "../components/auth/NextAuthProvider";
import ErrorBoundary from "../components/error-boundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DemoForge Dashboard",
  description: "Modular AI Demo Environment Framework for Microsoft Tenants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <NextAuthProvider>
            <AuthProvider>
              <div className="min-h-screen bg-gray-50">
              <Sidebar />
              <div className="md:pl-64">
                <Header />
                <main className="py-8">
                  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {children}
                  </div>
                </main>
              </div>
              </div>
            </AuthProvider>
          </NextAuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
