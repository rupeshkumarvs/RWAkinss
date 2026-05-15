'use client';

import React from 'react';
import { LiquidButton } from './LiquidButton';
import { WalletModal } from './WalletModal';
import { ArrowRight } from 'lucide-react';

const URLS = {
  app: 'https://creditblock-rs-4qzb.vercel.app',
};

export const FinalCTA: React.FC = () => {
  const [isWalletModalOpen, setIsWalletModalOpen] = React.useState(false);

  return (
    <section className="relative py-24 md:py-40 px-4 text-center overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div
          className="absolute w-96 h-96 -top-24 left-1/4 rounded-full blur-3xl opacity-30 animate-cb-blob-1"
          style={{
            background: 'radial-gradient(circle, rgba(245,197,24,0.4), transparent 70%)',
            mixBlendMode: 'screen',
          }}
        />
        <div
          className="absolute w-80 h-80 -bottom-20 right-1/4 rounded-full blur-3xl opacity-30 animate-cb-blob-2"
          style={{
            background: 'radial-gradient(circle, rgba(200,134,10,0.4), transparent 70%)',
            mixBlendMode: 'screen',
          }}
        />
      </div>

      <div className="container mx-auto max-w-3xl relative z-10">
        <h2 className="section-title">
          Ready to build <span className="gold">credit trust?</span>
        </h2>

        <p className="section-subtitle mx-auto mb-12">
          Connect your wallet. Get scored. Join the QIE DeFi ecosystem.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <LiquidButton
            onClick={() => setIsWalletModalOpen(true)}
            variant="primary"
          >
            Get My Credit Score <ArrowRight size={16} />
          </LiquidButton>
          <LiquidButton
            href="#contracts"
            variant="ghost"
          >
            View Smart Contracts
          </LiquidButton>
        </div>
      </div>

      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />
    </section>
  );
};
