'use client';

import React, { useState } from 'react';
import { Github, Play, ArrowRight } from 'lucide-react';
import { LiquidButton } from './LiquidButton';

const URLS = {
  github: 'https://github.com/leobergjackson/creditblock.rs',
  demo: 'https://youtu.be/HKDrJyicVn0',
  app: 'https://creditblock-rs-4qzb.vercel.app',
};

export const OwnerCard: React.FC = () => {
  const [hovered, setHovered] = useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  return (
    <section className="py-20 md:py-32 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="section-eyebrow">
            The Builder
          </div>
          <h2 className="section-title">
            Built by <span className="gold">Kubryx</span>
          </h2>
          <p className="section-subtitle mx-auto">
            Open source. Community-owned. Forever on QIE.
          </p>
        </div>

        {/* Card */}
        <div className="flex justify-center">
          <div
            ref={cardRef}
            className="relative max-w-md w-full p-12 rounded-3xl backdrop-blur-sm border border-[rgba(255,255,255,0.1)] transition-all duration-300 overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.10), rgba(245,197,24,0.06) 50%, rgba(200,134,10,0.06))',
              backdropFilter: 'blur(20px)',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {/* Animated Background */}
            <div
              className="absolute inset-0 opacity-50 animate-cb-spin"
              style={{
                background:
                  'conic-gradient(from 0deg, rgba(245,197,24,0.25), rgba(200,134,10,0.25), rgba(245,158,11,0.18), rgba(245,197,24,0.25))',
                borderRadius: 'inherit',
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative w-36 h-36 mb-8">
                {/* Glow */}
                <div
                  className="absolute inset-0 -inset-8 rounded-full blur-2xl animate-cb-glow-pulse"
                  style={{
                    background: 'radial-gradient(circle, rgba(245,197,24,0.45), transparent 70%)',
                  }}
                />

                {/* Orbital Ring */}
                <div
                  className="absolute inset-0 animate-cb-spin"
                  style={{
                    animationDuration: hovered ? '2.5s' : '8s',
                  }}
                >
                  <svg
                    viewBox="0 0 140 140"
                    className="w-full h-full"
                    style={{
                      filter: 'drop-shadow(0 0 6px rgba(245,197,24,0.8))',
                    }}
                  >
                    <defs>
                      <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#F5C518" />
                        <stop offset="50%" stopColor="#C8860A" />
                        <stop offset="100%" stopColor="rgba(245,197,24,0)" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="70"
                      cy="70"
                      r="62"
                      fill="none"
                      stroke="url(#ringGradient)"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                    <circle cx="70" cy="8" r="3" fill="#fff" />
                  </svg>
                </div>

                {/* Avatar Circle */}
                <div
                  className="absolute inset-0 rounded-full p-1 animate-cb-spin"
                  style={{
                    background:
                      'conic-gradient(from 0deg, #F5C518, #C8860A, #F59E0B, #F5C518)',
                    animationDuration: '3s',
                  }}
                >
                  <div className="w-full h-full rounded-full bg-[#080808] flex items-center justify-center">
                    <span
                      className="text-4xl font-bold"
                      style={{
                        fontFamily: 'Clash Display, sans-serif',
                        color: '#F5C518'
                      }}
                    >
                      KB
                    </span>
                  </div>
                </div>
              </div>

              {/* Name */}
              <h3 className="text-2xl font-cb-display font-bold mb-1 text-white">
                Kubryx
              </h3>

              {/* Handle */}
              <p className="text-xs text-[rgba(255,255,255,0.3)] mb-4" style={{ fontFamily: 'Fira Code, monospace' }}>
                @kubryx
              </p>

              {/* Role */}
              <div className="inline-block px-3 py-1 rounded-full bg-[rgba(245,197,24,0.07)] border border-[rgba(245,197,24,0.15)] text-[#F5C518] font-cb-mono text-xs font-medium uppercase tracking-wider mb-6">
                Organization
              </div>

              {/* Description */}
              <p className="text-sm text-[rgba(255,255,255,0.45)] leading-relaxed mb-8">
                CreditBlocks is open source and built for the QIE ecosystem. The smart contracts are verified, the backend is live, and the demo is running.
              </p>

              {/* Links */}
              <div className="flex flex-wrap gap-2 justify-center">
                <LiquidButton
                  href={URLS.github}
                  external
                  variant="secondary"
                  className="text-xs"
                >
                  <Github size={14} /> GitHub
                </LiquidButton>
                <LiquidButton
                  href={URLS.demo}
                  external
                  variant="secondary"
                  className="text-xs"
                >
                  <Play size={14} /> Demo
                </LiquidButton>
                <LiquidButton
                  href={URLS.app}
                  external
                  variant="secondary"
                  className="text-xs"
                >
                  <ArrowRight size={14} /> Try App
                </LiquidButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
