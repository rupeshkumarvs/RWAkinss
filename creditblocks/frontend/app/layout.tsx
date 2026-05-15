import type { Metadata } from "next";
import "./globals.css";
import "./upgrade.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster as LuxuryToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Providers } from "./providers";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Note: Google Fonts imports removed due to build environment network constraints
// Fonts are loaded via @import in globals.css as fallback

export const metadata: Metadata = {
  title: "CreditBlocks - AI Credit Passport on QIE",
  description: "AI-powered on-chain credit scoring for the QIE blockchain ecosystem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ fontFamily: 'Outfit, Satoshi, ui-sans-serif, sans-serif' }}>
        <ErrorBoundary>
          <Providers>
            {children}
          </Providers>
          <Toaster />
          <Sonner />
          <LuxuryToaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#111111',
                border: '1px solid rgba(245,197,24,0.2)',
                color: '#FFFFFF',
                fontFamily: 'Satoshi, sans-serif',
                fontSize: '14px',
              },
            }}
          />
        </ErrorBoundary>
      </body>
    </html>
  );
}
