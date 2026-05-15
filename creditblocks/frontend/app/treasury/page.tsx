'use client'
import { useState } from 'react'
import { useWallet } from '@/app/contexts/WalletContext'
import { notify }    from '@/lib/toast'

interface Agent {
  name: string
  role: string
  status: 'active' | 'idle'
  efficiency: number
  tasksCompleted: number
}

interface PayrollStream {
  recipient: string
  amountPerSecond: string
  totalStreamed: string
  status: 'streaming' | 'paused'
}

interface Policy {
  name: string
  description: string
  status: 'enforced' | 'pending_vote'
}

export default function TreasuryPage() {
  const { isConnected, connect } = useWallet()
  const [treasuryBalance] = useState('47,832.50')
  const [agents] = useState<Agent[]>([
    { name: 'PayMaster', role: 'Payroll Executor', status: 'active', efficiency: 99.2, tasksCompleted: 1247 },
    { name: 'GovernanceGhost', role: 'Policy Enforcer', status: 'active', efficiency: 98.7, tasksCompleted: 856 },
    { name: 'YieldHunter', role: 'Yield Optimizer', status: 'active', efficiency: 97.4, tasksCompleted: 634 },
    { name: 'Monitor', role: 'Treasury Monitor', status: 'idle', efficiency: 100, tasksCompleted: 89 },
    { name: 'Allocator', role: 'Fund Router', status: 'idle', efficiency: 96.1, tasksCompleted: 402 },
    { name: 'Auditor', role: 'Compliance', status: 'active', efficiency: 99.8, tasksCompleted: 2103 },
  ])
  const [streams] = useState<PayrollStream[]>([
    { recipient: 'alice.sol', amountPerSecond: '0.042 PUSD', totalStreamed: '1,847.20', status: 'streaming' },
    { recipient: 'bob.sol', amountPerSecond: '0.031 PUSD', totalStreamed: '1,426.80', status: 'streaming' },
    { recipient: 'carol.sol', amountPerSecond: '0.025 PUSD', totalStreamed: '934.10', status: 'paused' },
  ])
  const [policies] = useState<Policy[]>([
    { name: 'Max Single Transaction', description: 'Prevent tx > $50k', status: 'enforced' },
    { name: 'Daily Yield Harvest', description: 'Auto-harvest yields every 24h', status: 'enforced' },
    { name: 'Multi-Sig Threshold', description: '> $100k requires 3-of-5 sig', status: 'enforced' },
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: 'Treasury OS activated. 6 autonomous agents online. $47,832.50 under management. What would you like to do?' }
  ])

  async function handleChatSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!chatInput.trim()) return

    setChatMessages(m => [...m, { role: 'user', text: chatInput }])
    setChatInput('')
    setChatLoading(true)

    await new Promise(r => setTimeout(r, 1200))

    const responses = [
      'Confirmed. I\'ve routed $5000 to yield farming. Expected APY: 12.3% on Marinade.',
      'Payroll streams are flowing smoothly. Total per-second payout: 0.098 PUSD.',
      'Treasury health check: All 6 agents operational. Efficiency: 98.5%. Risk profile: Low.',
      'I\'ve queued a governance proposal to increase yield allocation to 40%. Voting begins in 2h.',
    ]

    setChatMessages(m => [...m, { role: 'ai', text: responses[Math.floor(Math.random() * responses.length)] }])
    setChatLoading(false)
  }

  const MODULE_HEADER = (
    <div style={{
      borderBottom: '1px solid rgba(16,185,129,0.15)',
      padding: '20px 32px',
      display: 'flex', alignItems: 'center', gap: 16,
      background: '#0A0A0A',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: 'rgba(16,185,129,0.1)',
        border: '1px solid rgba(16,185,129,0.2)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 18,
        color: '#10B981',
      }}>◇</div>
      <div>
        <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 18, fontWeight: 700, color: '#FFF' }}>
          PalmFlow AI
        </h2>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'Satoshi, sans-serif' }}>
          Autonomous Treasury Management · Solana Mainnet
        </p>
      </div>
      <div style={{ marginLeft: 'auto' }}>
        <span style={{
          padding: '4px 12px', borderRadius: 999,
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.2)',
          color: '#10B981', fontSize: 11, fontWeight: 700,
          fontFamily: 'Satoshi, sans-serif',
        }}>
          Solana
        </span>
      </div>
    </div>
  )

  if (!isConnected) return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      {MODULE_HEADER}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 130px)', gap: 20, padding: 24 }}>
        <div style={{ fontSize: 48 }}>◇</div>
        <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 28, fontWeight: 700, color: '#FFF', textAlign: 'center' }}>
          PalmFlow AI
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', textAlign: 'center', maxWidth: 420, fontFamily: 'Satoshi, sans-serif', lineHeight: 1.7 }}>
          Connect your wallet to deploy an autonomous treasury managed by 6 AI agents on Solana.
        </p>
        <button className="btn-gold" onClick={connect}>Connect Wallet</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      {MODULE_HEADER}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        {/* Balance card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 16,
          padding: 28,
          marginBottom: 28,
        }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Satoshi, sans-serif', marginBottom: 8 }}>
            Treasury Balance
          </p>
          <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 48, fontWeight: 700, color: '#10B981', marginBottom: 12 }}>
            ${treasuryBalance} PUSD
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'Satoshi, sans-serif' }}>
            Under autonomous AI management · Last updated: 2s ago
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>

          {/* Main content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Agents */}
            <div style={{ background: '#0C0C0C', border: '1px solid #1A1A1A', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 18, fontWeight: 700, color: '#FFF', marginBottom: 16 }}>
                AI Agents Status
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {agents.map(agent => (
                  <div key={agent.name} style={{
                    background: '#111',
                    border: `1px solid ${agent.status === 'active' ? 'rgba(16,185,129,0.15)' : '#1E1E1E'}`,
                    borderRadius: 12,
                    padding: 14,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: agent.status === 'active' ? '#10B981' : '#C0C0C0',
                      }} />
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#FFF', fontFamily: 'Satoshi, sans-serif' }}>
                        {agent.name}
                      </p>
                    </div>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Satoshi, sans-serif', marginBottom: 8 }}>
                      {agent.role}
                    </p>
                    <p style={{ fontSize: 11, color: '#F5C518', fontFamily: 'Fira Code, monospace' }}>
                      {agent.efficiency}% eff.
                    </p>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'Satoshi, sans-serif', marginTop: 4 }}>
                      {agent.tasksCompleted} tasks
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payroll Streams */}
            <div style={{ background: '#0C0C0C', border: '1px solid #1A1A1A', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 18, fontWeight: 700, color: '#FFF', marginBottom: 16 }}>
                Payroll Streams (Per-Second Settlement)
              </h3>
              {streams.map(stream => (
                <div key={stream.recipient} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid #111',
                }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#FFF', fontFamily: 'Satoshi, sans-serif' }}>
                      {stream.recipient}
                    </p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'Satoshi, sans-serif' }}>
                      Rate: {stream.amountPerSecond}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 12, color: '#F5C518', fontFamily: 'Fira Code, monospace', fontWeight: 700 }}>
                      {stream.totalStreamed}
                    </p>
                    <p style={{
                      fontSize: 10,
                      color: stream.status === 'streaming' ? '#10B981' : '#F5C518',
                      fontFamily: 'Satoshi, sans-serif',
                      fontWeight: 600,
                    }}>
                      {stream.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Policies */}
            <div style={{ background: '#0C0C0C', border: '1px solid #1A1A1A', borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 16, fontWeight: 700, color: '#FFF', marginBottom: 12 }}>
                Active Policies
              </h3>
              {policies.map(policy => (
                <div key={policy.name} style={{
                  marginBottom: 12,
                  padding: '10px',
                  background: '#111',
                  border: '1px solid rgba(16,185,129,0.15)',
                  borderRadius: 8,
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#10B981', fontFamily: 'Satoshi, sans-serif', marginBottom: 2 }}>
                    ✓ {policy.name}
                  </p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Satoshi, sans-serif' }}>
                    {policy.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Neural Core Chat */}
            <div style={{ background: '#0C0C0C', border: '1px solid rgba(16,185,129,0.12)', borderRadius: 16, padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Satoshi, sans-serif', marginBottom: 10 }}>
                Neural Core
              </p>
              <div style={{ flex: 1, overflowY: 'auto', marginBottom: 12, minHeight: 120 }}>
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <p style={{
                      fontSize: 11,
                      color: msg.role === 'ai' ? '#10B981' : '#F5C518',
                      fontFamily: 'Satoshi, sans-serif',
                      lineHeight: 1.5,
                    }}>
                      {msg.text}
                    </p>
                  </div>
                ))}
                {chatLoading && (
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'Satoshi, sans-serif' }}>
                    Thinking...
                  </p>
                )}
              </div>
              <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Command..."
                  disabled={chatLoading}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: 6,
                    background: '#111',
                    border: '1px solid #1E1E1E',
                    color: '#FFF',
                    fontSize: 11,
                    fontFamily: 'Satoshi, sans-serif',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.2)',
                    color: '#10B981',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'Satoshi, sans-serif',
                  }}
                >
                  →
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
