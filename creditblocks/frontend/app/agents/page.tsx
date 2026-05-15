'use client'
import { useState } from 'react'
import { useWallet } from '@/app/contexts/WalletContext'
import { notify }    from '@/lib/toast'

const DEMO_AGENTS = [
  {
    id: 'agent_001',
    name: 'planner.alice.sol',
    role: 'Planner',
    status: 'active',
    delegatedTo: ['executor.alice.sol', 'monitor.alice.sol'],
    signingKey: '7xKm...9pQr',
    actions: 247,
    created: Date.now() - 86400000 * 5,
  },
  {
    id: 'agent_002',
    name: 'executor.alice.sol',
    role: 'Executor',
    status: 'active',
    delegatedTo: [],
    signingKey: '3bNw...2mKs',
    actions: 89,
    created: Date.now() - 86400000 * 4,
  },
  {
    id: 'agent_003',
    name: 'monitor.alice.sol',
    role: 'Monitor',
    status: 'idle',
    delegatedTo: [],
    signingKey: '9pLx...7vQm',
    actions: 34,
    created: Date.now() - 86400000 * 3,
  },
]

const AUDIT_LOG = [
  {
    from: 'planner.alice.sol',
    to: 'executor.alice.sol',
    action: 'DELEGATE: execute_trade',
    signature: 'Ed25519:7xKm...9pQr',
    time: Date.now() - 3600000 * 2,
    status: 'verified',
  },
  {
    from: 'executor.alice.sol',
    to: null,
    action: 'EXECUTE: swap_tokens',
    signature: 'Ed25519:3bNw...2mKs',
    time: Date.now() - 3600000 * 1,
    status: 'verified',
  },
  {
    from: 'monitor.alice.sol',
    to: null,
    action: 'MONITOR: check_balance',
    signature: 'Ed25519:9pLx...7vQm',
    time: Date.now() - 1800000,
    status: 'verified',
  },
]

export default function AgentsPage() {
  const { isConnected, connect } = useWallet()
  const [agents, setAgents]     = useState(DEMO_AGENTS)
  const [tab, setTab]           = useState<'registry'|'audit'|'deploy'>('registry')
  const [deploying, setDeploying] = useState(false)
  const [newAgent, setNewAgent] = useState({ name: '', role: '' })
  const [revoking, setRevoking] = useState<string|null>(null)

  async function handleDeploy() {
    if (!newAgent.name || !newAgent.role) {
      notify.error('Enter agent name and role')
      return
    }
    setDeploying(true)
    await new Promise(r => setTimeout(r, 2000))
    const agent = {
      id: `agent_${Date.now()}`,
      name: `${newAgent.name.toLowerCase()}.alice.sol`,
      role: newAgent.role,
      status: 'active' as const,
      delegatedTo: [],
      signingKey: `${Math.random().toString(36).slice(2,6)}...${Math.random().toString(36).slice(2,6)}`,
      actions: 0,
      created: Date.now(),
    }
    setAgents(a => [...a, agent])
    setNewAgent({ name: '', role: '' })
    setDeploying(false)
    notify.success(`Agent ${agent.name} deployed on Solana!`)
    setTab('registry')
  }

  async function handleRevoke(agentId: string, agentName: string) {
    setRevoking(agentId)
    await new Promise(r => setTimeout(r, 1500))
    setAgents(a => a.map(ag =>
      ag.id === agentId
        ? { ...ag, status: 'revoked' as any }
        : ag
    ))
    setRevoking(null)
    notify.success(`${agentName} revoked. Cascade halt applied to all child agents.`)
  }

  const MODULE_HEADER = (
    <div style={{
      borderBottom: '1px solid rgba(153,69,255,0.15)',
      padding: '20px 32px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      background: '#0A0A0A',
    }}>
      <div style={{
        width: 36, height: 36,
        borderRadius: 10,
        background: 'rgba(153,69,255,0.1)',
        border: '1px solid rgba(153,69,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
      }}>
        ⬡
      </div>
      <div>
        <h2 style={{
          fontFamily: 'Clash Display, sans-serif',
          fontSize: 18, fontWeight: 700, color: '#FFF',
        }}>
          TrustMesh
        </h2>
        <p style={{
          fontSize: 12, color: 'rgba(255,255,255,0.3)',
          fontFamily: 'Satoshi, sans-serif',
        }}>
          Multi-Agent AI Coordination · Solana Devnet
        </p>
      </div>
      <div style={{ marginLeft: 'auto' }}>
        <span style={{
          padding: '4px 12px',
          borderRadius: 999,
          background: 'rgba(153,69,255,0.1)',
          border: '1px solid rgba(153,69,255,0.2)',
          color: '#9945FF',
          fontSize: 11, fontWeight: 700,
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
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100vh - 130px)', gap: 20, padding: 24,
      }}>
        <div style={{ fontSize: 48 }}>⬡</div>
        <h2 style={{
          fontFamily: 'Clash Display, sans-serif',
          fontSize: 28, fontWeight: 700, color: '#FFF',
          textAlign: 'center',
        }}>
          TrustMesh Dashboard
        </h2>
        <p style={{
          fontSize: 15, color: 'rgba(255,255,255,0.4)',
          textAlign: 'center', maxWidth: 420,
          fontFamily: 'Satoshi, sans-serif', lineHeight: 1.7,
        }}>
          Connect your Solana wallet to deploy AI agents,
          view the delegation graph, and audit all on-chain actions.
        </p>
        <button className="btn-gold" onClick={connect}>
          Connect Wallet
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      {MODULE_HEADER}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Stats row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12, marginBottom: 28,
        }}>
          {[
            { label: 'Active Agents', value: agents.filter(a => a.status === 'active').length },
            { label: 'Total Actions', value: agents.reduce((s,a) => s + a.actions, 0) },
            { label: 'Audit Logs',    value: AUDIT_LOG.length },
            { label: 'Verified Sigs', value: AUDIT_LOG.filter(l => l.status === 'verified').length },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#0C0C0C',
              border: '1px solid #1A1A1A',
              borderRadius: 12, padding: '18px 20px',
            }}>
              <p style={{
                fontSize: 11, color: 'rgba(255,255,255,0.3)',
                fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: 'Satoshi, sans-serif', marginBottom: 6,
              }}>
                {stat.label}
              </p>
              <p style={{
                fontFamily: 'Clash Display, sans-serif',
                fontSize: 32, fontWeight: 700, color: '#F5C518',
              }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 4,
          background: '#0C0C0C',
          border: '1px solid #1A1A1A',
          borderRadius: 12, padding: 4,
          marginBottom: 20, width: 'fit-content',
        }}>
          {(['registry','audit','deploy'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '9px 20px', borderRadius: 9, border: 'none',
              background: tab === t ? 'rgba(245,197,24,0.1)' : 'transparent',
              color: tab === t ? '#F5C518' : 'rgba(255,255,255,0.35)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Satoshi, sans-serif',
              textTransform: 'capitalize', transition: 'all 0.2s',
            }}>
              {t === 'registry' ? 'Agent Registry'
               : t === 'audit'   ? 'Audit Log'
               : 'Deploy Agent'}
            </button>
          ))}
        </div>

        {/* REGISTRY TAB */}
        {tab === 'registry' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {agents.map(agent => (
              <div key={agent.id} style={{
                background: '#0C0C0C',
                border: `1px solid ${
                  agent.status === 'active'   ? 'rgba(74,222,128,0.15)'
                  : agent.status === 'idle'   ? 'rgba(245,197,24,0.1)'
                  : 'rgba(248,113,113,0.15)'
                }`,
                borderRadius: 14,
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: agent.status === 'active' ? '#4ADE80'
                        : agent.status === 'idle' ? '#F5C518'
                        : '#F87171',
                    }} />
                    <span style={{
                      fontFamily: 'Fira Code, monospace',
                      fontSize: 14, fontWeight: 600, color: '#FFF',
                    }}>
                      {agent.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'Satoshi, sans-serif' }}>
                    <span>Role: {agent.role}</span>
                    <span>Actions: {agent.actions}</span>
                    <span>Key: {agent.signingKey}</span>
                  </div>
                </div>

                {agent.delegatedTo.length > 0 && (
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'Satoshi, sans-serif' }}>
                    Delegates to:{' '}
                    {agent.delegatedTo.map(d => (
                      <span key={d} style={{
                        marginLeft: 4, padding: '2px 8px',
                        background: 'rgba(153,69,255,0.1)',
                        border: '1px solid rgba(153,69,255,0.2)',
                        borderRadius: 6, color: '#9945FF',
                        fontFamily: 'Fira Code, monospace',
                      }}>
                        {d}
                      </span>
                    ))}
                  </div>
                )}

                {agent.status !== 'revoked' as any && (
                  <button
                    onClick={() => handleRevoke(agent.id, agent.name)}
                    disabled={revoking === agent.id}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 8,
                      background: 'rgba(248,113,113,0.08)',
                      border: '1px solid rgba(248,113,113,0.2)',
                      color: '#F87171',
                      fontSize: 13, fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'Satoshi, sans-serif',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {revoking === agent.id
                      ? <>Revoking...</>
                      : '✕ Revoke'}
                  </button>
                )}

                {(agent.status as any) === 'revoked' && (
                  <span style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    background: 'rgba(248,113,113,0.08)',
                    border: '1px solid rgba(248,113,113,0.2)',
                    color: '#F87171',
                    fontSize: 12, fontWeight: 700,
                    fontFamily: 'Satoshi, sans-serif',
                  }}>
                    REVOKED
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* AUDIT LOG TAB */}
        {tab === 'audit' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {AUDIT_LOG.map((log, i) => (
              <div key={i} style={{
                background: '#0C0C0C',
                border: '1px solid rgba(74,222,128,0.1)',
                borderRadius: 12,
                padding: '16px 20px',
                display: 'flex',
                gap: 20,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#4ADE80', flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 13, color: '#F5C518', marginBottom: 4,
                  }}>
                    {log.action}
                  </p>
                  <p style={{
                    fontSize: 12, color: 'rgba(255,255,255,0.3)',
                    fontFamily: 'Satoshi, sans-serif',
                  }}>
                    {log.from}
                    {log.to ? ` → ${log.to}` : ''}
                  </p>
                </div>
                <div style={{
                  fontFamily: 'Fira Code, monospace',
                  fontSize: 11, color: 'rgba(255,255,255,0.2)',
                }}>
                  {log.signature}
                </div>
                <span style={{
                  padding: '3px 10px', borderRadius: 6,
                  background: 'rgba(74,222,128,0.08)',
                  border: '1px solid rgba(74,222,128,0.2)',
                  color: '#4ADE80',
                  fontSize: 11, fontWeight: 700,
                  fontFamily: 'Satoshi, sans-serif',
                }}>
                  ✓ Verified
                </span>
              </div>
            ))}
          </div>
        )}

        {/* DEPLOY TAB */}
        {tab === 'deploy' && (
          <div style={{
            background: '#0C0C0C',
            border: '1px solid rgba(245,197,24,0.12)',
            borderRadius: 16, padding: 32, maxWidth: 500,
          }}>
            <h3 style={{
              fontFamily: 'Clash Display, sans-serif',
              fontSize: 22, fontWeight: 700, color: '#FFF',
              marginBottom: 8,
            }}>
              Deploy New Agent
            </h3>
            <p style={{
              fontSize: 14, color: 'rgba(255,255,255,0.4)',
              fontFamily: 'Satoshi, sans-serif', marginBottom: 24,
            }}>
              Agent gets a verified .sol identity on Solana.
              All actions are Ed25519 signed and logged on-chain.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block', fontSize: 11,
                color: 'rgba(255,255,255,0.3)',
                fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: 'Satoshi, sans-serif', marginBottom: 6,
              }}>
                Agent Name
              </label>
              <input
                type="text"
                value={newAgent.name}
                onChange={e => setNewAgent(a => ({ ...a, name: e.target.value }))}
                placeholder="e.g. planner"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: '#111',
                  border: '1px solid #1E1E1E',
                  color: '#FFF',
                  fontFamily: 'Satoshi, sans-serif',
                  outline: 'none',
                }}
              />
              <p style={{
                fontSize: 11, color: 'rgba(255,255,255,0.2)',
                fontFamily: 'Fira Code, monospace', marginTop: 4,
              }}>
                Will be deployed as: {newAgent.name || 'name'}.alice.sol
              </p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block', fontSize: 11,
                color: 'rgba(255,255,255,0.3)',
                fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: 'Satoshi, sans-serif', marginBottom: 6,
              }}>
                Agent Role
              </label>
              <input
                type="text"
                value={newAgent.role}
                onChange={e => setNewAgent(a => ({ ...a, role: e.target.value }))}
                placeholder="e.g. Planner, Executor, Monitor"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: '#111',
                  border: '1px solid #1E1E1E',
                  color: '#FFF',
                  fontFamily: 'Satoshi, sans-serif',
                  outline: 'none',
                }}
              />
            </div>

            <button
              className="btn-gold"
              onClick={handleDeploy}
              disabled={deploying}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {deploying
                ? <>Deploying on Solana...</>
                : '⬡ Deploy Agent'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
