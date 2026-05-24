// Built by vsrupeshkumar
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchStellarAccountStats, type StellarStats } from '@/lib/api/stellar'

const PUBLIC_KEY = process.env.NEXT_PUBLIC_STELLAR_PUBLIC_KEY || ''

const FALLBACK: StellarStats = {
  balance: '0',
  totalTransactions: 0,
  recentPayments: [],
  isLive: false,
}

export function useStellar() {
  const [stats, setStats] = useState<StellarStats>(FALLBACK)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const activeRef = useRef(true)

  const load = useCallback(async () => {
    if (!PUBLIC_KEY) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const s = await fetchStellarAccountStats(PUBLIC_KEY)
      if (!activeRef.current) return
      setStats(s)
      setError(null)
    } catch (e) {
      if (!activeRef.current) return
      setError(e instanceof Error ? e.message : 'Failed to load Stellar data')
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    activeRef.current = true
    load()
    const interval = setInterval(load, 30_000)
    return () => {
      activeRef.current = false
      clearInterval(interval)
    }
  }, [load])

  return { stats, loading, error, isLive: stats.isLive, refresh: load }
}
