// Built by vsrupeshkumar
'use client'

import { useKubrykPlatform } from '@/context/KubrykPlatformContext'

const MONO = '"Fira Code","JetBrains Mono",monospace'

export function PlatformModeBadge() {
  const { isDemoMode } = useKubrykPlatform()
  return (
    <span style={{
      fontSize: 10,
      padding: '3px 10px',
      borderRadius: 999,
      background: isDemoMode ? 'rgba(107,114,128,0.12)' : 'rgba(16,185,129,0.12)',
      border: `1px solid ${isDemoMode ? 'rgba(107,114,128,0.3)' : 'rgba(16,185,129,0.3)'}`,
      color: isDemoMode ? '#9CA3AF' : '#10b981',
      fontWeight: 600,
      fontFamily: MONO,
      display: 'inline-block',
      whiteSpace: 'nowrap',
    }}>
      {isDemoMode ? '◎ Demo · Connect wallet for live data' : '⬤ Live · Wallet Connected'}
    </span>
  )
}
