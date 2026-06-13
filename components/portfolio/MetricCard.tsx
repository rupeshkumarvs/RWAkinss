// Built by vsrupeshkumar
'use client'

import type { ReactNode } from 'react'

export type Accent = 'teal' | 'purple' | 'neutral' | 'green'

const ACCENTS: Record<Accent, { text: string; glow: string; border: string }> = {
  teal: { text: '#2f6b54', glow: 'rgba(47,107,84,0.14)', border: 'rgba(47,107,84,0.25)' },
  purple: { text: '#3f9a73', glow: 'rgba(63,154,115,0.14)', border: 'rgba(63,154,115,0.25)' },
  green: { text: '#34d399', glow: 'rgba(52,211,153,0.14)', border: 'rgba(52,211,153,0.25)' },
  neutral: { text: 'var(--rwa-text)', glow: 'rgba(125,125,140,0.06)', border: 'var(--rwa-border)' },
}

interface Props {
  label: string
  value: ReactNode
  sub?: ReactNode
  accent?: Accent
  icon?: ReactNode
  loading?: boolean
}

/** Reusable metric tile: small label + large number, color-coded by asset. */
export function MetricCard({ label, value, sub, accent = 'neutral', icon, loading }: Props) {
  const a = ACCENTS[accent]
  return (
    <div
      style={{
        position: 'relative',
        padding: 20,
        borderRadius: 16,
        background: `linear-gradient(180deg, ${a.glow}, var(--rwa-surface))`,
        border: `1px solid ${a.border}`,
        minHeight: 116,
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', color: 'var(--rwa-text-muted)' }}>
          {label}
        </span>
        {icon && <span style={{ color: a.text, opacity: 0.85 }}>{icon}</span>}
      </div>
      {loading ? (
        <div style={{ height: 30, width: '60%', borderRadius: 6, background: 'var(--rwa-border)' }} className="animate-pulse" />
      ) : (
        <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1, color: a.text, fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </div>
      )}
      {sub && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--rwa-text-faint)' }}>{sub}</div>}
    </div>
  )
}

export default MetricCard
