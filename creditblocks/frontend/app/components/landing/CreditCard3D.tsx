'use client';

import React, { useRef } from 'react';
import { useScore } from '@/lib/score-context';
import { useWallet } from '@/contexts/WalletContext';
import { RISK_LABEL } from '@/lib/api-client';
import { truncateAddress } from '@/lib/constants';

export const CreditCard3D: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { score } = useScore();
  const { address } = useWallet();

  const displayScore = score ? score.score : 847;
  const displayAddr = address ? truncateAddress(address) : '0xAe6A…B502';
  const riskLabel = score ? RISK_LABEL[score.riskBand] : 'LOW RISK';
  const riskIcon = score
    ? (score.riskBand === 1 ? '✓' : score.riskBand === 2 ? '⚠' : '✕')
    : '✓';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xTilt = (mouseY - centerY) / centerY * -12;
    const yTilt = (mouseX - centerX) / centerX * 12;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${xTilt}deg) rotateY(${yTilt}deg)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    cardRef.current.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
  };

  return (
    <div
      className="mt-15 w-full max-w-sm mx-auto h-72 perspective animate-fade-in"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cardRef}
        className="w-full h-full rounded-3xl p-7 backdrop-blur-sm border border-[rgba(255,255,255,0.1)] shadow-2xl transition-transform duration-150 relative overflow-hidden"
        style={{
          background: 'radial-gradient(120% 80% at 20% 0%, rgba(245,197,24,0.35), transparent 60%), radial-gradient(120% 80% at 100% 100%, rgba(200,134,10,0.30), transparent 55%), linear-gradient(135deg, #10141F, #0A0E18)',
        }}
      >
        {/* Animated Border */}
        <div
          className="absolute inset-0 rounded-3xl opacity-60 pointer-events-none animate-cb-spin"
          style={{
            background: 'conic-gradient(from 0deg, rgba(245,197,24,0.8), rgba(200,134,10,0.8), rgba(245,197,24,0.0), rgba(245,197,24,0.8))',
            padding: '1px',
          }}
        />

        {/* Shine Effect */}
        <div className="absolute top-0 left-1/2 w-1/2 h-1/3 bg-gradient-to-b from-white via-white to-transparent opacity-0 blur-3xl animate-pulse" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-cb-mono text-xs uppercase tracking-widest text-[rgba(255,255,255,0.45)] mb-6">
                Credit Passport
              </div>
              <div className="text-7xl font-bold bg-gradient-to-b from-white to-[rgba(255,255,255,0.6)] bg-clip-text text-transparent leading-none">
                {displayScore}
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] font-cb-mono text-xs text-[rgba(255,255,255,0.65)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-lg animate-pulse" />
              QIE Mainnet • 1990
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="px-3 py-1.5 rounded-lg bg-[rgba(16,185,129,0.12)] border border-[rgba(16,185,129,0.3)] text-[#34D399] font-cb-mono text-xs font-medium uppercase tracking-wider">
              {riskIcon} {riskLabel}
            </div>
            <div className="font-cb-mono text-sm text-[rgba(255,255,255,0.45)]">
              {displayAddr}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
