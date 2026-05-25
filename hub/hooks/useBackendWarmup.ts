// Built by vsrupeshkumar
// Silently pings all Render backends every 4 minutes to prevent cold-start
// delays during demos. Fire-and-forget — never throws, never blocks UI.
'use client'

import { useCallback, useEffect } from 'react'

const ENDPOINTS: Array<{ name: string; env: string }> = [
  { name: 'CreditBlock', env: 'NEXT_PUBLIC_CREDITBLOCK_URL' },
  { name: 'Palmflow',    env: 'NEXT_PUBLIC_PALMFLOW_URL'    },
  { name: 'Shadow',      env: 'NEXT_PUBLIC_SHADOW_URL'      },
  { name: 'SyncSplit',   env: 'NEXT_PUBLIC_SYNCSPLIT_URL'   },
  { name: 'TrustMesh',   env: 'NEXT_PUBLIC_TRUSTMESH_URL'   },
]

function getUrl(envKey: string): string | undefined {
  // Access via process.env at call time so Next.js inlines at build
  const map: Record<string, string | undefined> = {
    NEXT_PUBLIC_CREDITBLOCK_URL: process.env.NEXT_PUBLIC_CREDITBLOCK_URL,
    NEXT_PUBLIC_PALMFLOW_URL:    process.env.NEXT_PUBLIC_PALMFLOW_URL,
    NEXT_PUBLIC_SHADOW_URL:      process.env.NEXT_PUBLIC_SHADOW_URL,
    NEXT_PUBLIC_SYNCSPLIT_URL:   process.env.NEXT_PUBLIC_SYNCSPLIT_URL,
    NEXT_PUBLIC_TRUSTMESH_URL:   process.env.NEXT_PUBLIC_TRUSTMESH_URL,
  }
  return map[envKey]
}

async function pingBackend(url: string): Promise<void> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 12_000)
  try {
    await fetch(`${url}/health`, { signal: ctrl.signal })
  } catch {
    // silent — purpose is just to wake Render instances
  } finally {
    clearTimeout(t)
  }
}

export function useBackendWarmup(): void {
  const warmAll = useCallback(() => {
    for (const ep of ENDPOINTS) {
      const url = getUrl(ep.env)
      if (url) pingBackend(url)
    }
  }, [])

  useEffect(() => {
    // Warm immediately on mount
    warmAll()
    // Keep warm every 4 minutes (Render free tier sleeps after 15 min inactivity)
    const id = setInterval(warmAll, 4 * 60 * 1_000)
    return () => clearInterval(id)
  }, [warmAll])
}
