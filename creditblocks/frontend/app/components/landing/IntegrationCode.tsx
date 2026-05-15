'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const CODE_LINES = [
  { type: 'kw', text: 'import' },
  { type: 'str', text: ' "' },
  { type: 'str', text: './ICreditBlocksScore.sol' },
  { type: 'str', text: '"' },
  { type: 'base', text: ';' },
];

const CODE_BODY = `contract MyLendingProtocol {
    ICreditBlocksScore creditBlocks =
        ICreditBlocksScore(0xAe6A9CaF…B502);

    function getLTV(address borrower) external view returns (uint256) {
        ICreditBlocksScore.ScoreView memory score = creditBlocks.getScore(borrower);
        if (score.riskBand == 1) return 80;   // Low risk: 80% LTV
        if (score.riskBand == 2) return 60;   // Medium risk: 60% LTV
        return 40;                          // High risk: 40% LTV
    }
}`;

export const IntegrationCode: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(CODE_BODY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = CODE_BODY.split('\n');
  const lineNumbers = Array.from({ length: lines.length }, (_, i) => i + 1);

  return (
    <section className="py-20 md:py-32 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="section-eyebrow">
            Developer
          </div>
          <h2 className="section-title">
            Integrate in <span style={{ color: '#F5C518' }}>3 Lines</span>
          </h2>
          <p className="section-subtitle mx-auto">
            Add credit-gated lending to your protocol today. One import, one address, infinite trust.
          </p>
        </div>

        {/* Terminal */}
        <div className="rounded-3xl overflow-hidden border border-[rgba(245,197,24,0.1)] bg-[#000000] shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-[#0D111B] border-b border-[rgba(255,255,255,0.1)]">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-[rgba(255,255,255,0.15)]" />
              <span className="w-3 h-3 rounded-full bg-[rgba(245,197,24,0.4)]" />
              <span className="w-3 h-3 rounded-full bg-[rgba(245,197,24,0.7)]" />
            </div>
            <div className="font-cb-mono text-xs text-[rgba(255,255,255,0.45)]">
              ~/contracts/MyLendingProtocol.sol
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-1 rounded-lg font-cb-mono text-xs text-[rgba(255,255,255,0.65)] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] transition-all"
            >
              {copied ? <span className="flex items-center gap-1"><Check size={12} /> Copied</span> : <span className="flex items-center gap-1"><Copy size={12} /> Copy</span>}
            </button>
          </div>

          {/* Code */}
          <div className="flex overflow-x-auto font-cb-mono text-xs md:text-sm leading-relaxed">
            {/* Gutter */}
            <div className="px-5 py-6 text-[rgba(255,255,255,0.2)] text-right select-none border-r border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.3)]">
              {lineNumbers.map((num) => (
                <div key={num}>{num}</div>
              ))}
            </div>

            {/* Content */}
            <div className="px-5 py-6 whitespace-pre font-mono">
              <span className="token-keyword">contract</span> <span className="token-type">MyLendingProtocol</span> &#123;{'\n'}
              {'    '}<span className="token-type">ICreditBlocksScore</span> <span className="token-function">creditBlocks</span> = {'\n'}
              {'        '}<span className="token-type">ICreditBlocksScore</span>(<span className="token-address">0xAe6A9CaF…B502</span>);{'\n'}
              {'\n'}
              {'    '}<span className="token-keyword">function</span> <span className="token-function">getLTV</span>(<span className="token-type">address</span> <span className="token-function">borrower</span>) <span className="token-keyword">external</span> <span className="token-keyword">view</span> <span className="token-keyword">returns</span> (<span className="token-type">uint256</span>) &#123;{'\n'}
              {'        '}<span className="token-type">ICreditBlocksScore.ScoreView</span> <span className="token-keyword">memory</span> <span className="token-function">score</span> = <span className="token-function">creditBlocks.getScore</span>(<span className="token-function">borrower</span>);{'\n'}
              {'        '}<span className="token-keyword">if</span> (<span className="token-function">score.riskBand</span> == <span className="token-number">1</span>) <span className="token-keyword">return</span> <span className="token-number">80</span>;   <span className="token-comment">// Low risk: 80% LTV</span>{'\n'}
              {'        '}<span className="token-keyword">if</span> (<span className="token-function">score.riskBand</span> == <span className="token-number">2</span>) <span className="token-keyword">return</span> <span className="token-number">60</span>;   <span className="token-comment">// Medium risk: 60% LTV</span>{'\n'}
              {'        '}<span className="token-keyword">return</span> <span className="token-number">40</span>;                          <span className="token-comment">// High risk: 40% LTV</span>{'\n'}
              {'    '}&#125;{'\n'}
              &#125;
            </div>
          </div>
        </div>

        {/* API Example */}
        <div className="mt-8 px-5 py-4 rounded-2xl font-mono text-sm bg-[#0A0A0A] border border-[rgba(245,197,24,0.1)] overflow-x-auto">
          <span className="token-keyword">POST</span>
          <span className="token-type"> /api/score </span>
          <span className="token-number">{"{ \"address\": \"0x…\" }"}</span>
          <span className="token-function"> → </span>
          <span className="token-number">{"{ score: 847, riskBand: 1 }"}</span>
        </div>
      </div>
    </section>
  );
};
