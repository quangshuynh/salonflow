import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/shared/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_DESCRIPTION =
  "Salon management platform for salons, barber shops, spas, and beauty studios.";

export const metadata: Metadata = {
  title: {
    default: "SalonFlow — Salon management, one screen",
    template: "%s · SalonFlow",
  },
  description: APP_DESCRIPTION,
  applicationName: "SalonFlow",
  openGraph: {
    type: "website",
    siteName: "SalonFlow",
    title: "SalonFlow — Salon management, one screen",
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: "SalonFlow — Salon management, one screen",
    description: APP_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
