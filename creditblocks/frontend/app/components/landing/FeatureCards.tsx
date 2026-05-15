'use client';

import React from 'react';
import { Cpu, Zap, Shield, Plug, Layers, Eye } from 'lucide-react';

const FEATURES = [
  {
    icon: Cpu,
    title: 'AI Credit Scoring',
    body: 'GPT-class analysis of transaction frequency, portfolio health, staking behaviour and on-chain signals – distilled into a 0–1000 score.',
  },
  {
    icon: Shield,
    title: 'Soulbound NFT',
    body: 'Non-transferable credit passport stored permanently on QIE. The score follows you, not your tokens.',
  },
  {
    icon: Zap,
    title: 'Q-Loan AI Chat',
    body: 'Negotiate loan terms in natural language. EIP-712 signatures settle the agreement on-chain – no forms, no friction.',
  },
  {
    icon: Plug,
    title: 'Universal Integration',
    body: 'Any DeFi protocol queries your score with a single contract call. One interface, the entire QIE ecosystem.',
    code: true,
  },
  {
    icon: Layers,
    title: 'NCRD Token Staking',
    body: 'Stake NCRD to boost your credit score. More commitment, better rates – verifiable on-chain, transparent by default.',
  },
  {
    icon: Eye,
    title: 'QIE Oracle Integration',
    body: 'Real-time price feeds and volatility data from 7 QIE oracles power continuous, dynamic risk assessment.',
  },
];

export const FeatureCards: React.FC = () => {
  return (
    <section id="features" className="py-20 md:py-32 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="section-eyebrow">
            The Protocol
          </div>
          <h2 className="section-title">
            Everything <span className="gold">DeFi Needed</span>
          </h2>
          <p className="section-subtitle mx-auto">
            A complete credit infrastructure for on-chain finance. Every primitive, audited and live.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl backdrop-blur-sm border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] transition-all duration-300 group flex flex-col"
              >
                {/* Icon */}
                <div className="feature-icon group-hover:translate-y-[-2px] group-hover:shadow-lg transition-all duration-300">
                  <Icon size={20} />
                </div>

                {/* Title */}
                <h3 className="card-title">
                  {feature.title}
                </h3>

                {/* Body */}
                <p className="card-body mb-auto">
                  {feature.body}
                </p>

                {/* Code Block for Feature 4 */}
                {feature.code && (
                  <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.1)]">
                    <div className="font-cb-mono text-xs text-[#F5C518] bg-[#000000] p-3 rounded-lg border border-[rgba(245,197,24,0.1)] overflow-x-auto">
                      <span>getScore</span>
                      <span>(borrower) → </span>
                      <span>ScoreView</span>
                      <span> &#123; score, riskBand &#125;</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
