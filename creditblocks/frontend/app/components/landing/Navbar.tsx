'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LiquidButton } from './LiquidButton';
import { ArrowRight } from 'lucide-react';
import { LINKS } from '@/lib/constants';
import { useWallet } from '@/contexts/WalletContext';
import { BackendStatus } from '@/components/BackendStatus';
import { WalletModal } from './WalletModal';

const NAV_LINKS = [
  { href: '#how', label: 'How It Works' },
  { href: '#features', label: 'Features' },
  { href: '#contracts', label: 'Contracts' },
  { href: '#ecosystem', label: 'Ecosystem' },
  { href: LINKS.apiDocs, label: 'Docs', external: true },
];

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { address, isConnecting, connect, disconnect } = useWallet();
  const router = useRouter();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  async function handleConnect() {
    await connect();
    router.push('/credit-dashboard');
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-5 py-4" ref={containerRef}>
      <nav
        className="flex items-center gap-7 px-4 py-2.5 rounded-full transition-all duration-300 backdrop-blur-xl"
        style={{
          background: scrolled ? 'rgba(8, 11, 20, 0.55)' : 'rgba(8, 11, 20, 0.25)',
          border: scrolled ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-base" style={{ fontFamily: 'Clash Display, sans-serif' }}>
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#C8860A] flex items-center justify-center text-xs text-black font-bold shadow-lg">
            CB
          </span>
          <span className="hidden sm:inline text-white">CreditBlocks</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 items-center">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[rgba(255,255,255,0.45)] hover:text-[#F5C518] transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm text-[rgba(255,255,255,0.45)] hover:text-[#F5C518] transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-[#F5C518] after:to-[#C8860A] after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </a>
            )
          )}
        </div>

        {/* Backend status (hidden on mobile) */}
        <div className="hidden lg:flex items-center mx-2">
          <BackendStatus />
        </div>

        {/* Wallet Connect / Address Display */}
        {address ? (
          <button
            onClick={() => router.push('/credit-dashboard')}
            title="Open Dashboard"
            className="flex items-center gap-2 px-3.5 py-2 rounded-full transition-all text-sm font-medium"
            style={{
              background: 'rgba(245,197,24,0.08)',
              border: '1px solid rgba(245,197,24,0.25)',
              color: '#F5C518',
              fontFamily: 'Fira Code, monospace',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#4ADE80',
                display: 'inline-block',
              }}
            />
            {address.slice(0, 6)}...{address.slice(-4)}
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="btn-gold text-sm"
            style={{ padding: '10px 20px' }}
          >
            {isConnecting ? (
              <>
                <span className="spinner-sm" />
                Connecting...
              </>
            ) : (
              <>Connect Wallet</>
            )}
          </button>
        )}

        {/* Launch App (always visible) */}
        <LiquidButton
          onClick={() => setIsWalletModalOpen(true)}
          variant="secondary"
          className="text-sm hidden sm:inline-flex"
        >
          Launch App <ArrowRight size={14} />
        </LiquidButton>
      </nav>

      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />
    </div>
  );
};
