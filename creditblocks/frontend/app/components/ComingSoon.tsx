'use client';

import Link from 'next/link';

interface Props {
  title: string;
  tagline: string;
  description: string;
  chain: string;
  chainColor: string;
  icon: string;
}

export default function ComingSoon({ title, tagline, description, chain, chainColor, icon }: Props) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#080808',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          height: 56,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(8,8,8,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(245,197,24,0.12)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 12,
              fontFamily: 'Satoshi, sans-serif',
              textDecoration: 'none',
            }}
          >
            ← Hub
          </Link>
          <span
            style={{
              fontFamily: 'Clash Display, sans-serif',
              fontSize: 14,
              fontWeight: 600,
              color: '#FFFFFF',
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </span>
        </div>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 999,
            background: `${chainColor}15`,
            border: `1px solid ${chainColor}30`,
            fontSize: 10,
            color: chainColor,
            fontFamily: 'Satoshi, sans-serif',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          {chain}
        </span>
      </header>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            height: 600,
            background: `radial-gradient(circle, ${chainColor}10 0%, transparent 60%)`,
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 560, textAlign: 'center', position: 'relative' }}>
          <div
            style={{
              width: 84,
              height: 84,
              margin: '0 auto 28px',
              borderRadius: 20,
              background: `${chainColor}15`,
              border: `1px solid ${chainColor}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              color: chainColor,
            }}
          >
            {icon}
          </div>

          <h1
            style={{
              fontFamily: 'Clash Display, sans-serif',
              fontSize: 'clamp(36px, 5vw, 52px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
              marginBottom: 12,
              lineHeight: 1.05,
            }}
          >
            {title}
          </h1>

          <p
            style={{
              fontSize: 13,
              color: chainColor,
              fontFamily: 'Satoshi, sans-serif',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            {tagline}
          </p>

          <p
            style={{
              fontSize: 16,
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.75,
              fontFamily: 'Satoshi, sans-serif',
              marginBottom: 32,
            }}
          >
            {description}
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 22px',
              borderRadius: 999,
              background: 'rgba(245,197,24,0.06)',
              border: '1px solid rgba(245,197,24,0.2)',
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#F5C518',
                animation: 'gold-pulse 2s infinite',
              }}
            />
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#F5C518',
                fontFamily: 'Satoshi, sans-serif',
              }}
            >
              Deploying Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
