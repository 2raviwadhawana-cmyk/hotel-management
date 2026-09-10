import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { PWARegister } from "@/components/PWARegister";

export const metadata: Metadata = {
  title: "Grand Horizon Hotel | Reservations & Management",
  description: "Book your stay at Grand Horizon Hotel. Modern hotel management and online reservation system.",
  manifest: "/manifest.json",
  applicationName: "Grand Horizon Hotel",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Horizon Hotel",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0284c7",
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
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-screen bg-slate-50 antialiased">
        <PWARegister />
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-8 mt-16">
          <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} Grand Horizon Hotel Management System.
            Built for modern hotels.
          </div>
        </footer>
      </body>
    </html>
  );
}
