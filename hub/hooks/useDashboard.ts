// Built by vsrupeshkumar
'use client'

import { useEffect, useState } from 'react'
import { fetchDashboardStats, type DashboardStats } from '@/lib/api/dashboard'

const REFRESH_INTERVAL = 60_000

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await fetchDashboardStats()
        if (!cancelled) {
          setStats(data)
          setError(null)
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message ?? 'Failed to load dashboard stats')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, REFRESH_INTERVAL)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return { stats, loading, error }
}
