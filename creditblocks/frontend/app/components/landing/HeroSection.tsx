'use client';

import React, { useRef, useMemo } from 'react';
import Link from 'next/link';
import { LiquidButton } from './LiquidButton';
import { CreditCard3D } from './CreditCard3D';
import { WalletModal } from './WalletModal';
import { ArrowRight, Play } from 'lucide-react';

const URLS = {
  app: 'https://creditblock-rs-4qzb.vercel.app',
  demo: 'https://youtu.be/HKDrJyicVn0',
};

interface HeroWord {
  children: React.ReactNode;
}

const HeroWord: React.FC<HeroWord> = ({ children }) => {
  return (
    <span className="inline-block relative overflow-hidden">
      <span>{children}</span>
      <span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent bg-clip-text text-transparent animate-shimmer"
        style={{
          backgroundSize: '200% 100%',
          animation: 'shimmer 0.9s ease-in-out',
        }}
      >
        {children}
      </span>
    </span>
  );
};

export const HeroSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const [isWalletModalOpen, setIsWalletModalOpen] = React.useState(false);

  const headlineText = "Your Credit. On-Chain. Forever.";
  const headlineParts = useMemo(() => {
    return headlineText
      .split(".")
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, 3);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center pt-32 pb-20 px-4 overflow-hidden" ref={containerRef}>
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Blob 1 - Violet */}
        <div
          className="absolute w-[620px] h-[620px] -top-32 -right-40 rounded-full blur-[80px] filter animate-cb-blob-1 opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(245,197,24,0.55), transparent 65%)',
            mixBlendMode: 'screen',
          }}
        />

        {/* Blob 2 - Cyan */}
        <div
          className="absolute w-[520px] h-[520px] -bottom-40 -left-32 rounded-full blur-[80px] filter animate-cb-blob-2 opacity-50"
          style={{
            background: 'radial-gradient(circle, rgba(200,134,10,0.45), transparent 65%)',
            mixBlendMode: 'screen',
          }}
        />

        {/* Blob 3 - Amber */}
        <div
          className="absolute w-[420px] h-[420px] top-2/5 right-1/5 rounded-full blur-[80px] filter animate-cb-blob-3 opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(245,158,11,0.30), transparent 65%)',
            mixBlendMode: 'screen',
          }}
        />

        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(245,197,24,0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(245,197,24,0.08) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, #000 30%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, #000 30%, transparent 80%)',
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="container max-w-4xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 backdrop-blur-sm border border-[rgba(245,197,24,0.2)] bg-[rgba(245,197,24,0.06)] text-[10px] font-cb-mono uppercase tracking-[0.2em] text-[#F5C518] animate-fade-in">
          <span>✦</span>
          <span>Verified on QIE Mainnet</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-cb-display font-bold leading-tight mb-6 animate-fade-in"
            style={{ animationDelay: '100ms' }}
        >
          <div className="text-white"><HeroWord>Your</HeroWord> <HeroWord>Credit</HeroWord>.</div>
          <div className="gradient-text"><HeroWord>On-Chain</HeroWord>.</div>
          <div className="text-white"><HeroWord>Forever</HeroWord>.</div>
        </h1>

        {/* Subheadline */}
        <p
          className="text-base sm:text-lg md:text-xl text-[rgba(255,255,255,0.45)] max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-in"
          style={{ animationDelay: '200ms' }}
        >
          AI-powered soulbound NFT credit passports. One score.
          Every DeFi protocol on QIE.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row gap-3 justify-center mb-12 animate-fade-in"
          style={{ animationDelay: '300ms' }}
        >
          <LiquidButton
            onClick={() => setIsWalletModalOpen(true)}
            variant="primary"
            mouseContainer={containerRef}
          >
            Launch App <ArrowRight size={16} />
          </LiquidButton>
          <LiquidButton
            href={URLS.demo}
            external
            variant="ghost"
            mouseContainer={containerRef}
          >
            <Play size={16} /> Watch Demo
          </LiquidButton>
        </div>

        {/* 3D Credit Card */}
        <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
          <CreditCard3D />
        </div>
      </div>

      {/* Wallet Modal */}
      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />
    </section>
  );
};
