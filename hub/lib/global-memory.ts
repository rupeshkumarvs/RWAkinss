'use client'

import { useState, useEffect } from 'react'
import { getPlatformState, updatePlatformState, SimulationScenario } from './platform-engine'
import { getAutonomousOpsState } from './autonomous-ops'
import { toast } from './toast'
import { recordOSEvent } from './cross-tool-intelligence'

export interface MemorySnapshot {
  id: string
  timestamp: string
  scenario: SimulationScenario
  riskScore: number
  latency: number
  anomalyCount: number
  description: string
  decisionLineage: string[]
}

export interface GlobalMemoryState {
  snapshots: MemorySnapshot[]
  archivedRecommendationsCount: number
}

const DEFAULT_SNAPSHOTS: MemorySnapshot[] = [
  {
    id: 'snap-001',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    scenario: 'none',
    riskScore: 4,
    latency: 45,
    anomalyCount: 0,
    description: 'Optimal state baseline captured prior to stress test injections.',
    decisionLineage: ['Initial server boots finalized successfully', 'Decentralized trust matrices registered', 'Telemetry buffers initialized nominal']
  },
  {
    id: 'snap-002',
    timestamp: new Date(Date.now() - 60000 * 45).toISOString(),
    scenario: 'degraded_rpc',
    riskScore: 35,
    latency: 950,
    anomalyCount: 6,
    description: 'Simulated EVM regional failure cascade. Fallback memory caches deployed.',
    decisionLineage: [
      'RPC response exceeded standard 900ms threshold bounds.',
      'SLA monitoring flagged operational latency regressions.',
      'Cache fallback gateways assumed transaction routing priorities.'
    ]
  }
]

let memoryState: GlobalMemoryState = {
  snapshots: [...DEFAULT_SNAPSHOTS],
  archivedRecommendationsCount: 3
}

const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach(l => l())
  if (typeof window !== 'undefined') {
    localStorage.setItem('kubryx_global_memory', JSON.stringify(memoryState))
    window.dispatchEvent(new Event('kubryx_global_memory_update'))
  }
}

// Hydrate safely
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('kubryx_global_memory')
    if (saved) {
      memoryState = JSON.parse(saved)
    }
  } catch {
    // ignore
  }
}

export function getGlobalMemoryState(): GlobalMemoryState {
  return memoryState
}

export function createMemorySnapshot(description: string) {
  const plat = getPlatformState()
  const ops = getAutonomousOpsState()
  
  const newSnapshot: MemorySnapshot = {
    id: `snap-${Date.now()}`,
    timestamp: new Date().toISOString(),
    scenario: plat.activeScenario,
    riskScore: ops.operationalRiskScore,
    latency: plat.analytics.averageLatency,
    anomalyCount: ops.liveAnomalyDensity,
    description: description || 'User-initiated infrastructure snapshot',
    decisionLineage: [
      `System operating mode: ${plat.currentMode}`,
      `Risk gauge measured at ${ops.operationalRiskScore}%`,
      `Active digital twin simulation profile: ${plat.activeScenario}`,
      `Resilience pathway state: ${ops.resilienceStatus}`
    ]
  }

  const updated = [newSnapshot, ...memoryState.snapshots]
  
  memoryState = {
    ...memoryState,
    snapshots: updated
  }

  notifyListeners()
  recordOSEvent('Operational Memory', `Archived system operational snapshot: "${description || 'Infrastructure Baseline'}"`, 'All networks')
  toast.success('System snapshot archived successfully')
}

export function restoreMemorySnapshot(id: string) {
  const matched = memoryState.snapshots.find(s => s.id === id)
  if (!matched) return

  // Restore scenario
  updatePlatformState(() => ({
    activeScenario: matched.scenario
  }))

  recordOSEvent('Operational Memory', `Restored system parameters to historic state from snapshot ${id}`, 'Global')
  toast.success(`Restored state: ${matched.description}`)
}

export function purgeOperationalMemory() {
  memoryState = {
    snapshots: [...DEFAULT_SNAPSHOTS],
    archivedRecommendationsCount: 0
  }
  notifyListeners()
  toast.success('Historical snapshot memory purged')
}

export function useGlobalMemory() {
  const [state, setState] = useState<GlobalMemoryState>({ ...memoryState })

  useEffect(() => {
    const handler = () => setState({ ...memoryState })
    listeners.add(handler)

    if (typeof window !== 'undefined') {
      window.addEventListener('kubryx_global_memory_update', handler)
    }

    return () => {
      listeners.delete(handler)
      if (typeof window !== 'undefined') {
        window.removeEventListener('kubryx_global_memory_update', handler)
      }
    }
  }, [])

  return {
    ...state,
    createSnapshot: createMemorySnapshot,
    restoreSnapshot: restoreMemorySnapshot,
    purgeMemory: purgeOperationalMemory
  }
}
