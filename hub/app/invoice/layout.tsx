'use client';

import { useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { wagmiConfig } from '@/lib/invoice/wagmiConfig';
import InvoiceEcosystemWrapper from '@/components/invoice/EcosystemWrapper';
import '@rainbow-me/rainbowkit/styles.css';

export default function InvoiceLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { retry: 2, staleTime: 10_000 } },
  }));

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#C8FF00',
            accentColorForeground: '#000000',
            borderRadius: 'large',
            fontStack: 'system',
          })}
        >
          {/* Slim 52px icon sidebar + right slide panel — overlays only */}
          <InvoiceEcosystemWrapper />
          {/* Main invoice content — full width with left padding for sidebar */}
          <div style={{ paddingLeft: 52 }}>
            {children}
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
