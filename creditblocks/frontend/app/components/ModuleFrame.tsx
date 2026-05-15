'use client';

import Link from 'next/link';

interface Props {
  title: string;
  src: string;
  chain: string;
  chainColor: string;
}

export default function ModuleFrame({ title, src, chain, chainColor }: Props) {
  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#080808' }}>
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
              transition: 'all 0.2s',
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

      <iframe
        src={src}
        title={title}
        style={{
          width: '100%',
          height: 'calc(100vh - 56px)',
          border: 'none',
          background: '#080808',
          display: 'block',
        }}
      />
    </div>
  );
}
