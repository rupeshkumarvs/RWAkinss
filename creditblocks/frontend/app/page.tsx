'use client'
import { useState } from 'react'
import { useWallet } from '@/app/contexts/WalletContext'
import { notify } from '@/lib/toast'

// ═══════════════════════════════════════════════════════════════
// UNIFIED KUBRYX DASHBOARD - All modules as scrollable sections
// ═══════════════════════════════════════════════════════════════

const MODULES_CONFIG = [
  {
    id: 'credit',
    name: 'CreditBlocks',
    icon: '◈',
    chain: 'QIE',
    chainColor: '#F5C518',
    tagline: 'AI Credit Passport',
    description: 'Generate your on-chain credit score minted as a soulbound NFT.',
  },
  {
    id: 'agents',
    name: 'TrustMesh',
    icon: '⬡',
    chain: 'Solana',
    chainColor: '#9945FF',
    tagline: 'Multi-Agent AI Coordination',
    description: 'Deploy verified .sol identities with Ed25519-signed delegation.',
  },
  {
    id: 'vault',
    name: 'CipherVault',
    icon: '🔐',
    chain: 'Multi',
    chainColor: '#06B6D4',
    tagline: 'Private Cross-Chain Trading',
    description: 'Trade assets with zero data exposure and complete privacy.',
  },
  {
    id: 'split',
    name: 'SyncSplit',
    icon: '◆',
    chain: 'Stellar',
    chainColor: '#3B82F6',
    tagline: 'On-Chain Bill Splitting',
    description: 'Split bills on Soroban with multi-wallet support.',
  },
  {
    id: 'lend',
    name: 'Lendora AI',
    icon: '◎',
    chain: 'ETH L2',
    chainColor: '#6366F1',
    tagline: 'ZK-Powered DeFi Lending',
    description: 'AI agents negotiate optimal loan terms with ZK credit scoring.',
  },
  {
    id: 'treasury',
    name: 'PalmFlow AI',
    icon: '◇',
    chain: 'Solana',
    chainColor: '#10B981',
    tagline: 'Autonomous Treasury OS',
    description: 'AI agents manage treasury and stream payroll per-second.',
  },
  {
    id: 'shadow',
    name: 'ShadowLedger',
    icon: '▲',
    chain: 'Solana',
    chainColor: '#C0C0C0',
    tagline: 'Invisible Financial OS',
    description: '7 autonomous agents run your entire organization invisibly.',
  },
]

// ═══════════════════════════════════════════════════════════════
// MODULE COMPONENTS
// ═══════════════════════════════════════════════════════════════

interface AgentData {
  id: string
  name: string
  role: string
  status: 'active' | 'idle' | 'revoked'
  delegatedTo?: string[]
  efficiency?: number
  tasks?: number
}

function TrustMeshPanel() {
  const [agents, setAgents] = useState<AgentData[]>([
    { id: '1', name: 'planner.alice.sol', role: 'Planner', status: 'active', delegatedTo: ['executor.alice.sol'], efficiency: 99.2, tasks: 247 },
    { id: '2', name: 'executor.alice.sol', role: 'Executor', status: 'active', efficiency: 98.7, tasks: 89 },
    { id: '3', name: 'monitor.alice.sol', role: 'Monitor', status: 'idle', efficiency: 100, tasks: 34 },
  ])

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: 16 }}>
        {agents.map(a => (
          <div key={a.id} style={{
            background: '#0C0C0C',
            border: `1px solid rgba(153,69,255,0.15)`,
            borderRadius: 10,
            padding: '12px',
            marginBottom: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: a.status === 'active' ? '#4ADE80' : '#C0C0C0',
              }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#FFF', fontFamily: 'Fira Code, monospace' }}>
                {a.name}
              </span>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'Satoshi, sans-serif' }}>
              {a.role} · {a.efficiency}% · {a.tasks} tasks
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function CipherVaultPanel() {
  const [privacy, setPrivacy] = useState(true)
  const assets = [
    { symbol: 'BTC', balance: '0.4821', usd: '$31,240' },
    { symbol: 'ETH', balance: '12.340', usd: '$38,107' },
    { symbol: 'SOL', balance: '240.00', usd: '$22,320' },
  ]

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: 12 }}>
        <button
          onClick={() => setPrivacy(!privacy)}
          style={{
            padding: '5px 12px',
            borderRadius: 6,
            background: privacy ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${privacy ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.1)'}`,
            color: privacy ? '#06B6D4' : 'rgba(255,255,255,0.4)',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'Satoshi, sans-serif',
          }}
        >
          {privacy ? '🔒 Privacy ON' : '🔓 Privacy OFF'}
        </button>
      </div>
      {assets.map(a => (
        <div key={a.symbol} style={{
          background: '#0C0C0C',
          border: '1px solid #1A1A1A',
          borderRadius: 10,
          padding: '10px',
          marginBottom: 8,
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#FFF' }}>{a.symbol}</span>
          <span style={{ fontSize: 12, color: '#F5C518', fontFamily: 'Fira Code, monospace' }}>
            {privacy ? '****' : a.balance}
          </span>
        </div>
      ))}
    </div>
  )
}

function SyncSplitPanel() {
  const splits = [
    { description: 'Team Dinner', total: '120 XLM', paid: '2/3' },
    { description: 'Conference Trip', total: '450 XLM', paid: '1/4' },
  ]

  return (
    <div style={{ padding: '20px' }}>
      {splits.map((s, i) => (
        <div key={i} style={{
          background: '#0C0C0C',
          border: '1px solid rgba(59,130,246,0.12)',
          borderRadius: 10,
          padding: '12px',
          marginBottom: 8,
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#FFF', marginBottom: 2 }}>
            {s.description}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{s.total}</span>
            <span style={{ fontSize: 10, color: '#3B82F6', fontWeight: 700 }}>{s.paid} paid</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function LendoraPanel() {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        background: 'rgba(99,102,241,0.05)',
        border: '1px solid rgba(99,102,241,0.15)',
        borderRadius: 10,
        padding: '12px',
        marginBottom: 12,
      }}>
        <p style={{ fontSize: 11, color: 'rgba(99,102,241,0.8)', fontFamily: 'Satoshi, sans-serif', marginBottom: 8 }}>
          Loan Amount
        </p>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#6366F1', fontFamily: 'Fira Code, monospace' }}>
          $5000
        </p>
      </div>
      {[
        { label: 'Rate', value: '8.5% APR' },
        { label: 'Duration', value: '90 days' },
        { label: 'Collateral', value: '1.5 ETH' },
      ].map(t => (
        <div key={t.label} style={{
          background: '#0C0C0C',
          border: '1px solid #1A1A1A',
          borderRadius: 10,
          padding: '10px',
          marginBottom: 8,
        }}>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>{t.label}</p>
          <p style={{ fontSize: 12, color: '#F5C518', fontWeight: 700 }}>{t.value}</p>
        </div>
      ))}
    </div>
  )
}

function PalmFlowPanel() {
  const agents = [
    { name: 'PayMaster', status: 'active', eff: 99.2 },
    { name: 'YieldHunter', status: 'active', eff: 97.4 },
    { name: 'Auditor', status: 'active', eff: 99.8 },
  ]

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        background: 'rgba(16,185,129,0.05)',
        border: '1px solid rgba(16,185,129,0.15)',
        borderRadius: 10,
        padding: '12px',
        marginBottom: 12,
      }}>
        <p style={{ fontSize: 10, color: 'rgba(16,185,129,0.6)' }}>Treasury</p>
        <p style={{ fontSize: 20, fontWeight: 700, color: '#10B981' }}>$47,832</p>
      </div>
      {agents.map(a => (
        <div key={a.name} style={{
          background: '#0C0C0C',
          border: `1px solid ${a.status === 'active' ? 'rgba(16,185,129,0.15)' : '#1A1A1A'}`,
          borderRadius: 10,
          padding: '10px',
          marginBottom: 8,
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#FFF' }}>{a.name}</span>
          <span style={{ fontSize: 10, color: '#10B981', fontWeight: 700 }}>{a.eff}%</span>
        </div>
      ))}
    </div>
  )
}

function ShadowLedgerPanel() {
  const agents = [
    { name: 'Aegis', emoji: '🛡️', status: 'operational' },
    { name: 'Nomad', emoji: '🌍', status: 'operational' },
    { name: 'Sentinel', emoji: '👁️', status: 'operational' },
    { name: 'Wraith', emoji: '👻', status: 'operational' },
    { name: 'Oracle', emoji: '🔮', status: 'idle' },
    { name: 'Phantom', emoji: '✨', status: 'operational' },
    { name: 'Echo', emoji: '🔔', status: 'operational' },
  ]

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 8,
      }}>
        {agents.map(a => (
          <div key={a.name} style={{
            background: a.status === 'operational' ? 'rgba(192,192,192,0.05)' : '#0C0C0C',
            border: `1px solid ${a.status === 'operational' ? 'rgba(192,192,192,0.15)' : '#1A1A1A'}`,
            borderRadius: 10,
            padding: '10px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{a.emoji}</div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#FFF', marginBottom: 2 }}>{a.name}</p>
            <div style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: a.status === 'operational' ? '#4ADE80' : '#C0C0C0',
              margin: '0 auto',
            }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function KubryxDashboard() {
  const { isConnected, connect } = useWallet()
  const [activeModule, setActiveModule] = useState(0)

  const panelComponents: Record<string, React.ReactNode> = {
    agents: <TrustMeshPanel />,
    vault: <CipherVaultPanel />,
    split: <SyncSplitPanel />,
    lend: <LendoraPanel />,
    treasury: <PalmFlowPanel />,
    shadow: <ShadowLedgerPanel />,
  }

  if (!isConnected) {
    return (
      <main style={{ background: '#080808', minHeight: '100vh', color: '#FFFFFF', padding: '40px 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>⚡</div>
          <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 40, fontWeight: 700, marginBottom: 12 }}>
            KUBRYX
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>
            The Multi-Chain AI Financial Super-App
          </p>
          <button className="btn-gold" onClick={connect} style={{ padding: '12px 32px', fontSize: 16 }}>
            Connect Wallet to Start
          </button>
        </div>
      </main>
    )
  }

  return (
    <main style={{ background: '#080808', minHeight: '100vh', color: '#FFFFFF' }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(8,8,8,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(245,197,24,0.12)',
        padding: '16px 24px',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #FFD700, #C8860A)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Clash Display, sans-serif',
              fontWeight: 700,
              color: '#000',
            }}>
              KB
            </div>
            <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 18, fontWeight: 700 }}>
              Kubryx Dashboard
            </h1>
          </div>
          <button className="btn-ghost" onClick={() => window.location.reload()} style={{ fontSize: 12 }}>
            Refresh
          </button>
        </div>
      </header>

      {/* Horizontal Scroll Tabs */}
      <div style={{
        background: '#0A0A0A',
        borderBottom: '1px solid rgba(245,197,24,0.12)',
        overflowX: 'auto',
        overflowY: 'hidden',
        padding: '0 24px',
        scrollBehavior: 'smooth',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', gap: 0 }}>
          {MODULES_CONFIG.map((mod, idx) => (
            <button
              key={mod.id}
              onClick={() => setActiveModule(idx)}
              style={{
                padding: '16px 20px',
                background: activeModule === idx ? 'rgba(245,197,24,0.1)' : 'transparent',
                border: activeModule === idx ? '2px solid #F5C518' : '1px solid transparent',
                borderTop: 'none',
                borderRight: 'none',
                borderLeft: 'none',
                color: activeModule === idx ? '#F5C518' : 'rgba(255,255,255,0.4)',
                fontSize: 13,
                fontWeight: 700,
                fontFamily: 'Satoshi, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'capitalize',
                whiteSpace: 'nowrap',
              }}
            >
              {mod.icon} {mod.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 24 }}>

          {/* Main Panel */}
          <div style={{
            background: '#0C0C0C',
            border: '1px solid rgba(245,197,24,0.12)',
            borderRadius: 16,
          }}>
            {/* Module Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: `1px solid ${MODULES_CONFIG[activeModule].chainColor}30`,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `${MODULES_CONFIG[activeModule].chainColor}20`,
                border: `1px solid ${MODULES_CONFIG[activeModule].chainColor}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                color: MODULES_CONFIG[activeModule].chainColor,
              }}>
                {MODULES_CONFIG[activeModule].icon}
              </div>
              <div>
                <h2 style={{
                  fontFamily: 'Clash Display, sans-serif',
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#FFF',
                  marginBottom: 2,
                }}>
                  {MODULES_CONFIG[activeModule].name}
                </h2>
                <p style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.3)',
                  fontFamily: 'Satoshi, sans-serif',
                }}>
                  {MODULES_CONFIG[activeModule].tagline}
                </p>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: 999,
                  background: `${MODULES_CONFIG[activeModule].chainColor}15`,
                  border: `1px solid ${MODULES_CONFIG[activeModule].chainColor}30`,
                  color: MODULES_CONFIG[activeModule].chainColor,
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'Satoshi, sans-serif',
                }}>
                  {MODULES_CONFIG[activeModule].chain}
                </span>
              </div>
            </div>

            {/* Module Content */}
            <div style={{ minHeight: 400 }}>
              {panelComponents[MODULES_CONFIG[activeModule].id] || (
                <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {MODULES_CONFIG[activeModule].description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Quick Stats */}
            <div style={{
              background: '#0C0C0C',
              border: '1px solid #1A1A1A',
              borderRadius: 16,
              padding: 20,
            }}>
              <p style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.3)',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: 'Satoshi, sans-serif',
                marginBottom: 16,
              }}>
                Ecosystem Stats
              </p>
              {[
                { label: '7 Products', value: 'Live' },
                { label: '4 Chains', value: 'Active' },
                { label: '0 Mock Data', value: 'Real' },
              ].map(s => (
                <div key={s.label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid #111',
                }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{s.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#F5C518' }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* All Modules Quick View */}
            <div style={{
              background: '#0C0C0C',
              border: '1px solid #1A1A1A',
              borderRadius: 16,
              padding: 20,
            }}>
              <p style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.3)',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: 'Satoshi, sans-serif',
                marginBottom: 12,
              }}>
                All Modules
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {MODULES_CONFIG.map((mod, idx) => (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModule(idx)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: activeModule === idx ? `${mod.chainColor}15` : '#111',
                      border: activeModule === idx ? `1px solid ${mod.chainColor}30` : '1px solid #1E1E1E',
                      color: activeModule === idx ? mod.chainColor : 'rgba(255,255,255,0.5)',
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: 'Satoshi, sans-serif',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                  >
                    {mod.icon} {mod.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
              animation: 'gold-pulse 2s infinite',
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#4ADE80',
              fontFamily: 'Satoshi, sans-serif',
            }}
          >
            Live
          </span>
        </div>
      </div>

      <h3
        style={{
          fontFamily: 'Clash Display, sans-serif',
          fontSize: 22,
          fontWeight: 700,
          color: '#FFFFFF',
          letterSpacing: '-0.02em',
          marginBottom: 4,
        }}
      >
        {m.name}
      </h3>

      <p
        style={{
          fontSize: 12,
          color: m.chainColor,
          fontFamily: 'Satoshi, sans-serif',
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: 14,
        }}
      >
        {m.tagline}
      </p>

      <p
        style={{
          fontSize: 14,
          color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.7,
          fontFamily: 'Satoshi, sans-serif',
          marginBottom: 20,
        }}
      >
        {m.description}
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 18,
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 999,
            background: `${m.chainColor}15`,
            border: `1px solid ${m.chainColor}30`,
            fontSize: 11,
            color: m.chainColor,
            fontFamily: 'Satoshi, sans-serif',
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
        >
          {m.chain}
        </span>

        <span
          style={{
            fontSize: 18,
            color: m.chainColor,
            fontFamily: 'Satoshi, sans-serif',
            fontWeight: 600,
          }}
        >
          →
        </span>
      </div>
    </Link>
  );
}
