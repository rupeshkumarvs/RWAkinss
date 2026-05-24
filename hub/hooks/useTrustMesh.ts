// Built by vsrupeshkumar
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchAllJobAccounts,
  fetchSolanaSlot,
  type JobAccountResult,
  type OnChainJobAccount,
} from '@/lib/api/solana'

export type { JobAccountResult, OnChainJobAccount }

export type TrustMeshState = {
  jobs: JobAccountResult[]
  currentSlot: number
  loading: boolean
  error: string | null
  isLive: boolean
  refresh: () => Promise<void>
}

const INITIAL: Omit<TrustMeshState, 'refresh'> = {
  jobs: [],
  currentSlot: 0,
  loading: true,
  error: null,
  isLive: false,
}

export function useTrustMesh(): TrustMeshState {
  const [state, setState] = useState<Omit<TrustMeshState, 'refresh'>>(INITIAL)
  const activeRef = useRef(true)

  const load = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }))
    try {
      const [jobs, slot] = await Promise.all([fetchAllJobAccounts(), fetchSolanaSlot()])
      if (!activeRef.current) return
      const isLive = jobs.some(j => j.isLive)
      setState({ jobs, currentSlot: slot, loading: false, error: null, isLive })
    } catch (e) {
      if (!activeRef.current) return
      setState(prev => ({
        ...prev,
        loading: false,
        error: e instanceof Error ? e.message : 'Failed to reach Solana Devnet',
      }))
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

  return { ...state, refresh: load }
}
