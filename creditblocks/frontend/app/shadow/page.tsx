'use client'
import { useState } from 'react'
import { useWallet } from '@/app/contexts/WalletContext'
import { notify }    from '@/lib/toast'

interface Agent {
  name: string
  emoji: string
  status: 'operational' | 'idle'
  efficiency: number
  tasksCompleted: number
}

interface Operation {
  id: string
  action: string
  timestamp: number
  encrypted: boolean
}

export default function ShadowPage() {
  const { isConnected, connect } = useWallet()
  const [agents] = useState<Agent[]>([
    { name: 'Aegis', emoji: '🛡️', status: 'operational', efficiency: 99.7, tasksCompleted: 4847 },
    { name: 'Nomad', emoji: '🌍', status: 'operational', efficiency: 98.9, tasksCompleted: 3621 },
    { name: 'Sentinel', emoji: '👁️', status: 'operational', efficiency: 99.4, tasksCompleted: 5203 },
    { name: 'Wraith', emoji: '👻', status: 'operational', efficiency: 97.8, tasksCompleted: 2945 },
    { name: 'Oracle', emoji: '🔮', status: 'idle', efficiency: 100, tasksCompleted: 1089 },
    { name: 'Phantom', emoji: '✨', status: 'operational', efficiency: 99.1, tasksCompleted: 3764 },
    { name: 'Echo', emoji: '🔔', status: 'operational', efficiency: 98.3, tasksCompleted: 2156 },
  ])
  const [operations] = useState<Operation[]>([
    { id: '1', action: 'Cross-chain swap executed', timestamp: Date.now() - 120000, encrypted: true },
    { id: '2', action: 'Treasury rebalance initiated', timestamp: Date.now() - 240000, encrypted: true },
    { id: '3', action: 'Governance proposal queued', timestamp: Date.now() - 360000, encrypted: true },
    { id: '4', action: 'Yield farming optimized', timestamp: Date.now() - 480000, encrypted: true },
    { id: '5', action: 'Risk assessment completed', timestamp: Date.now() - 600000, encrypted: true },
  ])
  const [commandInput, setCommandInput] = useState('')
  const [commandLoading, setCommandLoading] = useState(false)
  const [commandLog, setCommandLog] = useState([
    'ShadowLedger initialized. 7 agents activated.',
    'Stealth routing enabled. All operations encrypted.',
    'Ready for commands...',
  ])
  const [privacyMode, setPrivacyMode] = useState(true)

  async function handleCommand(e: React.FormEvent) {
    e.preventDefault()
    if (!commandInput.trim()) return

    setCommandLog(l => [...l, `> ${commandInput}`])
    setCommandInput('')
    setCommandLoading(true)

    await new Promise(r => setTimeout(r, 1200))

    const responses = [
      'Command executed. 3 agents coordinated on parallel tasks.',
      'Operation routed through 7 mixers. Zero data exposure.',
      'All signatures verified. Transactions finalized on Solana.',
      'Payload encrypted with 256-bit keys. Routing complete.',
    ]

    setCommandLog(l => [...l, responses[Math.floor(Math.random() * responses.length)]])
    setCommandLoading(false)
  }

  const MODULE_HEADER = (
    <div style={{
      borderBottom: '1px solid rgba(192,192,192,0.15)',
      padding: '20px 32px',
      display: 'flex', alignItems: 'center', gap: 16,
      background: '#0A0A0A',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: 'rgba(192,192,192,0.1)',
        border: '1px solid rgba(192,192,192,0.2)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 18,
        color: '#C0C0C0',
      }}>▲</div>
      <div>
        <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 18, fontWeight: 700, color: '#FFF' }}>
          ShadowLedger
        </h2>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'Satoshi, sans-serif' }}>
          Invisible Financial OS · 7 Autonomous Agents · Solana Mainnet
        </p>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={() => setPrivacyMode(p => !p)}
          style={{
            padding: '5px 14px', borderRadius: 999,
            background: privacyMode ? 'rgba(192,192,192,0.1)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${privacyMode ? 'rgba(192,192,192,0.3)' : 'rgba(255,255,255,0.1)'}`,
            color: privacyMode ? '#C0C0C0' : 'rgba(255,255,255,0.4)',
            fontSize: 11, fontWeight: 700,
            fontFamily: 'Satoshi, sans-serif', cursor: 'pointer',
          }}
        >
          {privacyMode ? '🔒 Encrypted' : '🔓 Revealed'}
        </button>
        <span style={{
          padding: '4px 12px', borderRadius: 999,
          background: 'rgba(192,192,192,0.1)',
          border: '1px solid rgba(192,192,192,0.2)',
          color: '#C0C0C0', fontSize: 11, fontWeight: 700,
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
        <div style={{ fontSize: 48 }}>▲</div>
        <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 28, fontWeight: 700, color: '#FFF', textAlign: 'center' }}>
          ShadowLedger
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', textAlign: 'center', maxWidth: 420, fontFamily: 'Satoshi, sans-serif', lineHeight: 1.7 }}>
          Connect your wallet to deploy 7 invisible AI agents that run your entire organization on-chain.
        </p>
        <button className="btn-gold" onClick={connect}>Connect Wallet</button>
      </div>
    </div>
  )

  function formatTime(ts: number) {
    const secsAgo = Math.floor((Date.now() - ts) / 1000)
    if (secsAgo < 60) return `${secsAgo}s ago`
    if (secsAgo < 3600) return `${Math.floor(secsAgo / 60)}m ago`
    return `${Math.floor(secsAgo / 3600)}h ago`
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      {MODULE_HEADER}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        {/* Agent Grid */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 20, fontWeight: 700, color: '#FFF', marginBottom: 16 }}>
            Operational Network
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 12,
          }}>
            {agents.map(agent => (
              <div key={agent.name} style={{
                background: agent.status === 'operational'
                  ? 'rgba(192,192,192,0.05)'
                  : '#0C0C0C',
                border: `1px solid ${
                  agent.status === 'operational'
                    ? 'rgba(192,192,192,0.15)'
                    : '#1E1E1E'
                }`,
                borderRadius: 12,
                padding: 16,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>
                  {agent.emoji}
                </div>
                <p style={{
                  fontFamily: 'Clash Display, sans-serif',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#FFF',
                  marginBottom: 6,
                }}>
                  {agent.name}
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  marginBottom: 8,
                }}>
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: agent.status === 'operational' ? '#4ADE80' : '#C0C0C0',
                  }} />
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: agent.status === 'operational' ? '#4ADE80' : '#C0C0C0',
                    fontFamily: 'Satoshi, sans-serif',
                    textTransform: 'uppercase',
                  }}>
                    {agent.status}
                  </span>
                </div>
                <p style={{
                  fontSize: 11,
                  color: '#F5C518',
                  fontFamily: 'Fira Code, monospace',
                  marginBottom: 4,
                }}>
                  {agent.efficiency}% eff
                </p>
                <p style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.25)',
                  fontFamily: 'Satoshi, sans-serif',
                }}>
                  {agent.tasksCompleted} tasks
                </p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Operations Feed */}
          <div style={{
            background: '#0C0C0C',
            border: '1px solid rgba(192,192,192,0.12)',
            borderRadius: 16,
            padding: 24,
          }}>
            <h3 style={{
              fontFamily: 'Clash Display, sans-serif',
              fontSize: 18,
              fontWeight: 700,
              color: '#FFF',
              marginBottom: 16,
            }}>
              Intelligence Feed
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {operations.map(op => (
                <div key={op.id} style={{
                  background: '#111',
                  border: '1px solid rgba(192,192,192,0.1)',
                  borderRadius: 10,
                  padding: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <p style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#FFF',
                      fontFamily: 'Satoshi, sans-serif',
                      marginBottom: 2,
                    }}>
                      {privacyMode ? '🔒 ENCRYPTED' : op.action}
                    </p>
                    <p style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.25)',
                      fontFamily: 'Satoshi, sans-serif',
                    }}>
                      {formatTime(op.timestamp)}
                    </p>
                  </div>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: 6,
                    background: 'rgba(192,192,192,0.1)',
                    border: '1px solid rgba(192,192,192,0.2)',
                    color: '#C0C0C0',
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: 'Satoshi, sans-serif',
                  }}>
                    ✓ Signed
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Command Interface */}
          <div style={{
            background: '#0C0C0C',
            border: '1px solid rgba(192,192,192,0.12)',
            borderRadius: 16,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h3 style={{
              fontFamily: 'Clash Display, sans-serif',
              fontSize: 18,
              fontWeight: 700,
              color: '#FFF',
              marginBottom: 16,
            }}>
              Command Interface
            </h3>

            <div style={{
              flex: 1,
              background: '#080808',
              border: '1px solid #1E1E1E',
              borderRadius: 10,
              padding: 12,
              marginBottom: 12,
              fontFamily: 'Fira Code, monospace',
              fontSize: 11,
              color: '#C0C0C0',
              overflowY: 'auto',
              maxHeight: 200,
              lineHeight: 1.6,
            }}>
              {commandLog.map((line, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  {line}
                </div>
              ))}
              {commandLoading && (
                <div style={{ color: 'rgba(192,192,192,0.5)' }}>
                  Processing...
                </div>
              )}
            </div>

            <form onSubmit={handleCommand} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={commandInput}
                onChange={e => setCommandInput(e.target.value)}
                placeholder="Enter command..."
                disabled={commandLoading}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: '#111',
                  border: '1px solid #1E1E1E',
                  color: '#C0C0C0',
                  fontFamily: 'Fira Code, monospace',
                  fontSize: 11,
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={commandLoading || !commandInput.trim()}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  background: 'rgba(192,192,192,0.1)',
                  border: '1px solid rgba(192,192,192,0.2)',
                  color: '#C0C0C0',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Satoshi, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Execute
              </button>
            </form>
          </div>
        </div>

        {/* Security Audit */}
        <div style={{
          marginTop: 20,
          background: 'rgba(192,192,192,0.05)',
          border: '1px solid rgba(192,192,192,0.15)',
          borderRadius: 16,
          padding: 20,
        }}>
          <p style={{
            fontSize: 12,
            color: '#C0C0C0',
            fontFamily: 'Satoshi, sans-serif',
            lineHeight: 1.7,
          }}>
            ✓ <strong>Security Status:</strong> All 7 agents operational · Zero compromise detected · Last audit: 2m ago
            · Encryption: AES-256 · Network: Private · Consensus: 100% verified
          </p>
        </div>
      </div>
    </div>
  )
}
