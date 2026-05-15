'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import WalletDashboard from '@/app/components/dashboard/WalletDashboard';

export default function CreditDashboardPage() {
  const { isConnected, isConnecting } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!isConnecting && !isConnected) {
      router.push('/');
    }
  }, [isConnected, isConnecting, router]);

  if (!isConnected) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#080808',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            fontFamily: 'Satoshi, sans-serif',
            color: 'rgba(255,255,255,0.3)',
            fontSize: 14,
          }}
        >
          Redirecting...
        </div>
      </div>
    );
  }

  return <WalletDashboard />;
}
