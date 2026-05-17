'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSovereignOps } from '../../lib/sovereign-ops'
import { useEconomicOps } from '../../lib/economic-ops'
import { useGlobalMemory } from '../../lib/global-memory'
import { usePlatformState } from '../../lib/platform-engine'
import { useAutonomousOps } from '../../lib/autonomous-ops'
import ExecutiveWalkthrough from '../components/ExecutiveWalkthrough'
import CommandPalette from '../components/CommandPalette'

export default function ExecutivePage() {
  const { proposals, sovereigntyIndex, consensusStability, quorumIntegrity, threats, toggleThreat } = useSovereignOps()
  const { pools, incentives, treasuryEquilibriumIndex, coordinationEfficiency, treasuryPressureLevel, rebalanceIncentives } = useEconomicOps()
  const { snapshots, restoreSnapshot } = useGlobalMemory()
  const { activeScenario, currentMode } = usePlatformState()
  const { operationalRiskScore, infrastructureConfidenceScore, resilienceStatus } = useAutonomousOps()

  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null)

  function handleRestore(id: string) {
    restoreSnapshot(id)
    setSelectedSnapshotId(id)
    setTimeout(() => {
      setSelectedSnapshotId(null)
    }, 2000)
  }

  // Active policy queue count
  const activePolicyQueueCount = proposals.filter(p => p.status === 'voting').length
  const activeThreatsCount = threats.filter(t => t.compromiseSimulationActive).length

  return (
    <main className="dashboard-layout" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px' }}>
      
      {/* Header Panel */}
      <header style={{ width: '100%', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link className="gold-text" href="/dashboard" style={{ fontSize: 13, textDecoration: 'none' }}>◀ Dashboard</Link>
            <span style={{ color: '#666', fontSize: 12 }}>/</span>
            <span style={{ fontSize: 13, color: '#aaa' }}>Executive Command</span>
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>👑</span> Sovereign Executive Command
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={rebalanceIncentives}
            className="btn-gold"
            style={{ padding: '8px 16px', fontSize: 12 }}
          >
            ⚖️ Balance Incentives
          </button>
        </div>
      </header>

      {/* Main SLA Indicators Row */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
        
        <article className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sovereign Health</span>
            <strong style={{ display: 'block', fontSize: 28, fontWeight: 800, marginTop: 4, color: '#F5C518' }}>
              {sovereigntyIndex}%
            </strong>
          </div>
          <span style={{ fontSize: 9, color: '#888', marginTop: 10 }}>Uptime Autonomy Index</span>
        </article>

        <article className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sync Confidence</span>
            <strong style={{ display: 'block', fontSize: 28, fontWeight: 800, marginTop: 4, color: '#fff' }}>
              {consensusStability}%
            </strong>
          </div>
          <span style={{ fontSize: 9, color: '#888', marginTop: 10 }}>Consensus Heartbeat Sync</span>
        </article>

        <article className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Equilibrium Index</span>
            <strong style={{ display: 'block', fontSize: 28, fontWeight: 800, marginTop: 4, color: '#10B981' }}>
              {treasuryEquilibriumIndex}%
            </strong>
          </div>
          <span style={{ fontSize: 9, color: '#888', marginTop: 10 }}>Treasury Resource Pressure: <strong style={{ color: '#F5C518', textTransform: 'uppercase' }}>{treasuryPressureLevel}</strong></span>
        </article>

        <article className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Threat Level</span>
            <strong style={{ display: 'block', fontSize: 28, fontWeight: 800, marginTop: 4, color: activeThreatsCount > 0 ? '#EF4444' : '#10B981' }}>
              {activeThreatsCount > 0 ? 'ELEVATED' : 'SAFE'}
            </strong>
          </div>
          <span style={{ fontSize: 9, color: '#888', marginTop: 10 }}>{activeThreatsCount} Simulated Threat Vectors</span>
        </article>

      </section>

      {/* Main Executive Cockpit Layout */}
      <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20, marginBottom: 24 }}>
        
        {/* Left Side: Dynamic Rebalance & Validator Mesh Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Sovereign Coordination Map / Topology */}
          <article className="card" style={{ padding: 18 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>🌐 Sovereign Coordination Map & Topology</h3>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
              Dynamic trust score pathways visualizer mapping out active decentralized quorums.
            </p>

            <div style={{ height: 220, background: '#030303', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 8, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              
              <div style={{ display: 'flex', gap: 30, zIndex: 10 }}>
                {[
                  { name: 'US Node (EVM)', trust: sovereigntyIndex, delay: '12ms' },
                  { name: 'EU Relay (Solana)', trust: consensusStability, delay: '42ms' },
                  { name: 'APAC Node (Stellar)', trust: quorumIntegrity, delay: '88ms' }
                ].map((item) => (
                  <div key={item.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(245,197,24,0.02)', border: '1px solid rgba(245,197,24,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <strong style={{ fontSize: 12, color: '#F5C518' }}>{item.trust}%</strong>
                      <span style={{ position: 'absolute', inset: -2, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '50%', animation: 'spin 10s linear infinite' }} />
                    </div>
                    <span style={{ fontSize: 11, color: '#fff', fontWeight: 'bold' }}>{item.name}</span>
                    <span style={{ fontSize: 9, color: '#888' }}>Ping: {item.delay}</span>
                  </div>
                ))}
              </div>

              <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                <span>Active Scenario: {activeScenario}</span>
                <span>Active Mode: {currentMode}</span>
              </div>
            </div>
          </article>

          {/* Historical Snapshots Restoration Engine */}
          <article className="card" style={{ padding: 18 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>💾 Global Strategic Memory Archive</h3>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
              Compare historical infrastructure states and restore configurations statefully.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {snapshots.map((snap) => {
                const isRestoring = selectedSnapshotId === snap.id
                return (
                  <div 
                    key={snap.id}
                    style={{
                      padding: 12,
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.03)',
                      borderRadius: 6,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: 12, color: '#fff' }}>{snap.description}</strong>
                      <span style={{ display: 'block', fontSize: 9, color: '#888', marginTop: 2 }}>
                        Captured: {new Date(snap.timestamp).toLocaleString()} • Risk Index: {snap.riskScore}%
                      </span>
                    </div>

                    <button
                      onClick={() => handleRestore(snap.id)}
                      className="btn-gold"
                      style={{ padding: '4px 10px', fontSize: 11, height: 'auto' }}
                      disabled={isRestoring}
                    >
                      {isRestoring ? '⌛ Restoring...' : '🔄 Restore State'}
                    </button>
                  </div>
                )
              })}
            </div>
          </article>

        </div>

        {/* Right Side: Threat forecasting and Policy queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Advanced Threat Forecast Matrix */}
          <article className="card" style={{ padding: 18 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>🛡️ Advanced Threat Forecast Matrix</h3>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
              Simulate security breaches and forecast infrastructure defense confidence.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {threats.map((threat) => (
                <div 
                  key={threat.vector}
                  style={{
                    padding: 12,
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.03)',
                    borderRadius: 6
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <strong style={{ fontSize: 12, color: '#fff' }}>{threat.vector}</strong>
                    <button
                      onClick={() => toggleThreat(threat.vector)}
                      className="btn-outline"
                      style={{
                        padding: '3px 8px',
                        fontSize: 10,
                        height: 'auto',
                        borderColor: threat.compromiseSimulationActive ? '#EF4444' : 'rgba(255,255,255,0.1)',
                        color: threat.compromiseSimulationActive ? '#EF4444' : '#aaa'
                      }}
                    >
                      {threat.compromiseSimulationActive ? 'Stop Sim' : 'Trigger Sim'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#888', marginTop: 4 }}>
                    <span>Forecast Likelihood:</span>
                    <strong style={{ color: '#ccc' }}>{threat.likelihood}%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#888', marginTop: 4 }}>
                    <span>Severity Impact:</span>
                    <strong style={{ color: threat.severity === 'critical' ? '#EF4444' : '#F5C518', textTransform: 'uppercase' }}>{threat.severity}</strong>
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* Active Policy Queue */}
          <article className="card" style={{ padding: 18 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>⚙️ Active Policy Queue</h3>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
              Pending operational policies awaiting consensus validation.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: '#aaa' }}>Proposals in voting:</span>
                <strong style={{ color: '#fff' }}>{activePolicyQueueCount} active KIPs</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: '#aaa' }}>Consensus validation quorum:</span>
                <strong style={{ color: '#fff' }}>1,000,000 required</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#aaa' }}>Veto consensus threshold:</span>
                <strong style={{ color: '#fff' }}>20% block voting</strong>
              </div>
            </div>
          </article>

        </div>

      </section>

      <ExecutiveWalkthrough />
      <CommandPalette />
    </main>
  )
}
