'use client';

import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { CONTRACT_LIST, ACTIVE_CHAIN, truncateAddress, explorerAddress } from '@/lib/constants';

interface ContractRowProps {
  contract: (typeof CONTRACT_LIST)[number];
}

const ContractRow: React.FC<ContractRowProps> = ({ contract }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(contract.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center p-5 rounded-2xl backdrop-blur-sm border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] transition-all duration-300">
      {/* Name */}
      <div className="font-semibold text-sm md:text-base flex items-center gap-2 text-white">
        <span className="w-2 h-2 rounded-full bg-[#4ADE80] shadow-lg" />
        {contract.name}
      </div>

      {/* Type */}
      <div className="font-cb-mono text-[10px] font-bold uppercase tracking-[0.08em] px-[10px] py-[3px] rounded-full bg-[rgba(245,197,24,0.07)] text-[#F5C518] border border-[rgba(245,197,24,0.15)] w-fit">
        {contract.type}
      </div>

      {/* Address */}
      <div className="font-mono text-xs md:text-sm text-[rgba(255,255,255,0.3)]">
        {truncateAddress(contract.address)}
      </div>

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-3 py-2 rounded-lg font-cb-mono text-xs font-medium text-[rgba(255,255,255,0.65)] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.08)] transition-all duration-200 w-fit"
      >
        {copied ? (
          <>
            <Check size={14} /> Copied
          </>
        ) : (
          <>
            <Copy size={14} /> Copy
          </>
        )}
      </button>

      {/* Explorer Link */}
      <a
        href={explorerAddress(contract.address)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 rounded-lg font-cb-mono text-xs font-medium text-white bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.08)] transition-all duration-200 w-fit"
      >
        Explorer <ExternalLink size={14} />
      </a>
    </div>
  );
};

export const ContractAddresses: React.FC = () => {
  return (
    <section id="contracts" className="py-20 md:py-32 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="section-eyebrow">
            On-Chain
          </div>
          <h2 className="section-title">
            Live on QIE <span style={{ color: '#F5C518' }}>Mainnet</span>
          </h2>
          <p className="section-subtitle mx-auto">
            All four contracts verified, deployed, and operational. Chain ID 1990. Zero mock data.
          </p>
        </div>

        {/* Contracts List */}
        <div className="space-y-3">
          {CONTRACT_LIST.map((contract) => (
            <ContractRow key={contract.address} contract={contract} />
          ))}
        </div>
      </div>
    </section>
  );
};
