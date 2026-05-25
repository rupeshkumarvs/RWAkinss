// Built by vsrupeshkumar
// Shows during backend cold-start: "Service waking up (~30s)" with auto-retry
'use client'

import { useEffect, useState } from 'react'

interface Props {
  onRetry: () => void
  serviceName?: string
  /** seconds between auto-retries, default 18 */
  retryInterval?: number
}

export function ColdStartBanner({ onRetry, serviceName = 'Backend', retryInterval = 18 }: Props) {
  const [countdown, setCountdown] = useState(retryInterval)
  const [attempt, setAttempt] = useState(1)

  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          onRetry()
          setAttempt(a => a + 1)
          return retryInterval
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(tick)
  }, [onRetry, retryInterval])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 16px',
      background: 'rgba(234,179,8,0.08)',
      border: '1px solid rgba(234,179,8,0.25)',
      borderRadius: 10,
      fontSize: 12,
      color: 'rgba(255,255,255,0.75)',
      fontWeight: 500,
    }}>
      {/* Spinner */}
      <span style={{
        width: 14, height: 14, borderRadius: '50%',
        border: '2px solid rgba(234,179,8,0.25)',
        borderTopColor: '#EAB308',
        display: 'inline-block',
        animation: 'spin 0.9s linear infinite',
        flexShrink: 0,
      }} />
      <span>
        <span style={{ color: '#EAB308', fontWeight: 700 }}>{serviceName}</span>
        {' '}waking up (Render free tier, ~30s)
        {' · '}Auto-retry in <span style={{ color: '#EAB308', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{countdown}s</span>
        {attempt > 1 && <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>· attempt {attempt}</span>}
      </span>
      <button
        onClick={() => { onRetry(); setCountdown(retryInterval); setAttempt(a => a + 1) }}
        style={{
          marginLeft: 'auto', flexShrink: 0,
          background: 'rgba(234,179,8,0.15)',
          border: '1px solid rgba(234,179,8,0.35)',
          borderRadius: 6, padding: '4px 10px',
          fontSize: 11, fontWeight: 700, color: '#EAB308',
          cursor: 'pointer',
        }}
      >
        Retry now
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
