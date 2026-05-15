'use client';

import React from 'react';
import { Wallet, Brain, Gem } from 'lucide-react';

const STEPS = [
  {
    n: '01',
    icon: Wallet,
    title: 'Connect Wallet',
    body: 'Connect MetaMask or QIE Wallet. No KYC. No personal data ever leaves the chain.',
  },
  {
    n: '02',
    icon: Brain,
    title: 'Generate Score',
    body: 'Our AI analyzes your on-chain history, portfolio health, and behavioral signals.',
  },
  {
    n: '03',
    icon: Gem,
    title: 'Mint Passport',
    body: 'Your credit score is minted as a soulbound NFT on QIE. Permanent. Portable.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how" className="py-20 md:py-32 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="section-eyebrow">
            The Flow
          </div>
          <h2 className="section-title">
            Three Steps to <span className="gold">DeFi Trust</span>
          </h2>
          <p className="section-subtitle mx-auto">
            From wallet to credit passport in under 30 seconds. No paperwork. No middlemen.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
          {/* Animated Connector Line */}
          <svg
            className="absolute -top-8 left-0 right-0 w-full h-4 hidden md:block pointer-events-none"
            viewBox="0 0 100 2"
            preserveAspectRatio="none"
            style={{ height: '2px' }}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="howg" x1="0" x2="1">
                <stop offset="0%" stopColor="#F5C518" stopOpacity="0.0" />
                <stop offset="50%" stopColor="#C8860A" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#F5C518" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <line
              x1="14"
              y1="1"
              x2="86"
              y2="1"
              stroke="rgba(245,197,24,0.3)"
              strokeWidth="2"
              strokeDasharray="2 3"
            />
          </svg>

          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.n}
                className="relative pt-8 md:pt-0 p-8 md:p-6 rounded-3xl backdrop-blur-sm border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.16)] transition-all duration-300 group"
              >
                {/* Step Number */}
                <div className="step-number">
                  {step.n}
                </div>
                
                {/* Icon Container */}
                <div className="feature-icon group-hover:scale-110 group-hover:-rotate-4 transition-transform duration-300">
                  <Icon size={24} />
                </div>

                {/* Title */}
                <h3 className="card-title">
                  {step.title}
                </h3>

                {/* Body */}
                <p className="card-body">
                  {step.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
