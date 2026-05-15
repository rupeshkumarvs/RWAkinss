'use client';

import React from 'react';

const NODES = [
  { id: 'qie', label: 'QIE Network', angle: 270, color: '#F5C518' },
  { id: 'ai', label: 'AI Scoring Engine', angle: 330, color: '#FFD700' },
  { id: 'oracle', label: 'QIE Oracles × 7', angle: 30, color: '#E8A800' },
  { id: 'defi', label: 'DeFi Protocols', angle: 90, color: '#C0C0C0' },
  { id: 'wallet', label: 'Wallets', angle: 150, color: '#FFFFFF' },
  { id: 'stake', label: 'NCRD Staking', angle: 210, color: '#F5C518' },
];

function calculatePosition(angle: number, radius: number = 160) {
  const rad = (angle * Math.PI) / 180;
  return {
    x: 340 + Math.cos(rad) * radius,
    y: 270 + Math.sin(rad) * radius,
  };
}

export const EcosystemDiagram: React.FC = () => {
  return (
    <section id="ecosystem" className="py-20 md:py-32 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="section-eyebrow">
            Architecture
          </div>
          <h2 className="section-title">
            A <span className="gold">Universal</span> Credit Layer
          </h2>
          <p className="section-subtitle mx-auto">
            CreditBlocks sits at the centre of the QIE ecosystem – every protocol, every wallet, one trust primitive.
          </p>
        </div>

        {/* Diagram */}
        <div className="relative mx-auto" style={{ width: '100%', maxWidth: '920px', height: '540px' }}>
          {/* SVG Connections */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 680 540"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="ecoGradient" x1="0" x2="1">
                <stop offset="0%" stopColor="rgba(245,197,24,0.2)" />
                <stop offset="100%" stopColor="rgba(245,197,24,0.2)" />
              </linearGradient>
              <radialGradient id="ecoGlow">
                <stop offset="0%" stopColor="#F5C518" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#F5C518" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Glow Circle */}
            <circle cx="340" cy="270" r="180" fill="url(#ecoGlow)" />

            {/* Connection Lines */}
            {NODES.map((node, idx) => {
              const pos = calculatePosition(node.angle);
              return (
                <line
                  key={`line-${idx}`}
                  x1="340"
                  y1="270"
                  x2={pos.x}
                  y2={pos.y}
                  stroke="url(#ecoGradient)"
                  strokeWidth="1"
                  strokeDasharray="3 5"
                  opacity="0.55"
                  style={{
                    animation: `dashFlow 3s linear infinite ${idx * 0.4}s`,
                  }}
                />
              );
            })}
          </svg>

          {/* Center Node */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            style={{
              width: '140px',
              height: '140px',
            }}
          >
            <div
              className="w-full h-full rounded-full flex items-center justify-center backdrop-blur-sm border border-[rgba(245,197,24,0.3)] shadow-2xl text-center relative bg-[rgba(245,197,24,0.1)]"
              style={{
                fontFamily: 'Clash Display, sans-serif',
              }}
            >
              <div
                className="text-[#F5C518] font-bold text-sm leading-tight"
                style={{ textAlign: 'center', lineHeight: '1.1' }}
              >
                Credit
                <br />
                Blocks
              </div>
            </div>

            {/* Outer rings */}
            <div
              className="absolute inset-0 rounded-full border border-[rgba(245,197,24,0.3)] animate-cb-spin"
              style={{
                width: '164px',
                height: '164px',
                margin: 'auto',
              }}
            />
            <div
              className="absolute inset-0 rounded-full border border-dashed border-[rgba(200,134,10,0.2)]"
              style={{
                width: '188px',
                height: '188px',
                margin: 'auto',
                animation: 'spin 22s linear infinite reverse',
              }}
            />
          </div>

          {/* Nodes */}
          {NODES.map((node) => {
            const pos = calculatePosition(node.angle);
            return (
              <div
                key={node.id}
                className="absolute flex items-center gap-2.5 px-4 py-3 rounded-2xl backdrop-blur-sm border border-[#1E1E1E] bg-[#111111] text-sm font-medium text-[rgba(255,255,255,0.7)] hover:bg-[#111111] hover:border-[rgba(245,197,24,0.25)] transition-all duration-300 cursor-pointer"
                style={{
                  left: `${(pos.x / 680) * 100}%`,
                  top: `${(pos.y / 540) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  animation: 'fadeSlideIn 0.6s ease forwards',
                  animationDelay: `${NODES.indexOf(node) * 0.1}s`,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0 shadow-lg"
                  style={{
                    background: node.color,
                    boxShadow: `0 0 8px ${node.color}`,
                  }}
                />
                <span className="font-cb-body text-xs whitespace-nowrap" style={{ fontFamily: 'Satoshi, sans-serif' }}>{node.label}</span>
              </div>
            );
          })}
        </div>

        <style>{`
          @keyframes dashFlow {
            to {
              stroke-dashoffset: -20;
            }
          }
          @keyframes fadeSlideIn {
            from {
              opacity: 0;
              transform: translate(-50%, -50%) translateY(10px);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%) translateY(0);
            }
          }
        `}</style>
      </div>
    </section>
  );
};
