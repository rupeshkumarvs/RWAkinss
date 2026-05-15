'use client';

import React from 'react';
import { LINKS, CONTRACT_LIST, ACTIVE_CHAIN, truncateAddress, explorerAddress } from '@/lib/constants';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.1)] pt-20 pb-8 px-4 bg-[#06090F]">
      <div className="container mx-auto max-w-6xl">
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2.5 font-bold text-base mb-4" style={{ fontFamily: 'Clash Display, sans-serif' }}>
              <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#C8860A] flex items-center justify-center text-xs text-black font-bold">
                CB
              </span>
              <span className="text-white">CreditBlocks</span>
            </div>
            <p className="text-sm text-[rgba(255,255,255,0.3)] leading-relaxed mb-4">
              Built for QIE Hackathon 2025. AI-powered soulbound credit passports for the QIE DeFi ecosystem.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] text-[#34D399] font-cb-mono text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              QIE Mainnet • Chain ID 1990
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.2)] font-bold mb-4">
              Product
            </h4>
            <ul className="space-y-2">
              <li><a href="#how" className="text-sm text-[rgba(255,255,255,0.35)] hover:text-[#F5C518] transition-colors">How It Works</a></li>
              <li><a href="#features" className="text-sm text-[rgba(255,255,255,0.35)] hover:text-[#F5C518] transition-colors">Features</a></li>
              <li><a href="#contracts" className="text-sm text-[rgba(255,255,255,0.35)] hover:text-[#F5C518] transition-colors">Contracts</a></li>
              <li><a href="#ecosystem" className="text-sm text-[rgba(255,255,255,0.35)] hover:text-[#F5C518] transition-colors">Ecosystem</a></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.2)] font-bold mb-4">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href={LINKS.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[rgba(255,255,255,0.35)] hover:text-[#F5C518] transition-colors"
                >
                  GitHub →
                </a>
              </li>
              <li>
                <a
                  href={LINKS.apiDocs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[rgba(255,255,255,0.35)] hover:text-[#F5C518] transition-colors"
                >
                  API Docs →
                </a>
              </li>
              <li>
                <a
                  href={LINKS.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[rgba(255,255,255,0.35)] hover:text-[#F5C518] transition-colors"
                >
                  Demo Video →
                </a>
              </li>
              <li>
                <a
                  href={ACTIVE_CHAIN.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[rgba(255,255,255,0.35)] hover:text-[#F5C518] transition-colors"
                >
                  QIE Explorer →
                </a>
              </li>
            </ul>
          </div>

          {/* Contracts Column */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.2)] font-bold mb-4">
              Contracts
            </h4>
            <ul className="space-y-2">
              {CONTRACT_LIST.map((contract) => (
                <li key={contract.address}>
                  <a
                    href={explorerAddress(contract.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                  className="text-xs text-[rgba(255,255,255,0.35)] hover:text-[#F5C518] transition-colors"
                  >
                    <div className="font-medium">{contract.name}</div>
                    <div className="text-[rgba(255,255,255,0.2)] text-[11px]" style={{ fontFamily: 'Fira Code, monospace' }}>{truncateAddress(contract.address)}</div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[rgba(255,255,255,0.1)] my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-[rgba(255,255,255,0.15)] font-mono">
          <div>MIT License • CreditBlocks • 2025</div>
          <div>{ACTIVE_CHAIN.contracts.creditPassportNFT}</div>
        </div>
      </div>
    </footer>
  );
};
