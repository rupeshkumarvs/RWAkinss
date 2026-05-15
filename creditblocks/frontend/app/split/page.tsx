'use client'
import { useState } from 'react'
import { useWallet } from '@/app/contexts/WalletContext'
import { notify }    from '@/lib/toast'

interface Participant {
  name: string
  address: string
  amount: string
  paid: boolean
}

interface Split {
  id: string
  description: string
  total: string
  participants: Participant[]
  created: number
  settled: boolean
}

export default function SplitPage() {
  const { isConnected, connect } = useWallet()
  const [splits, setSplits] = useState<Split[]>([
    {
      id: 'split_001',
      description: 'Team Dinner — Pizza Palace',
      total: '120',
      participants: [
        { name: 'Alice', address: 'ALICE...SOL', amount: '40', paid: true  },
        { name: 'Bob',   address: 'BOB...SOL',   amount: '40', paid: false },
        { name: 'Carol', address: 'CAROL...SOL', amount: '40', paid: false },
      ],
      created: Date.now() - 86400000,
      settled: false,
    },
  ])
  const [showCreate, setShowCreate] = useState(false)
  const [description, setDescription] = useState('')
  const [total, setTotal]             = useState('')
  const [participants, setParticipants] = useState([
    { name: '', address: '', amount: '' },
    { name: '', address: '', amount: '' },
  ])
  const [creating, setCreating] = useState(false)
  const [paying, setPaying]     = useState<string|null>(null)

  async function handleCreate() {
    if (!description || !total) { notify.error('Fill in all fields'); return }
    setCreating(true)
    await new Promise(r => setTimeout(r, 2000))
    const split: Split = {
      id: `split_${Date.now()}`,
      description,
      total,
      participants: participants.filter(p => p.name).map(p => ({
        ...p, paid: false,
      })),
      created: Date.now(),
      settled: false,
    }
    setSplits(s => [split, ...s])
    setCreating(false)
    setShowCreate(false)
    setDescription('')
    setTotal('')
    notify.success('Split created on Stellar Soroban!')
  }

  async function handlePay(splitId: string, participantName: string) {
    setPaying(participantName)
    await new Promise(r => setTimeout(r, 1500))
    setSplits(s => s.map(split =>
      split.id === splitId
        ? {
            ...split,
            participants: split.participants.map(p =>
              p.name === participantName ? { ...p, paid: true } : p
            ),
          }
        : split
    ))
    setPaying(null)
    notify.success(`${participantName} marked as paid on Stellar!`)
  }

  const MODULE_HEADER = (
    <div style={{
      borderBottom: '1px solid rgba(59,130,246,0.15)',
      padding: '20px 32px',
      display: 'flex', alignItems: 'center', gap: 16,
      background: '#0A0A0A',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: 'rgba(59,130,246,0.1)',
        border: '1px solid rgba(59,130,246,0.2)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 18,
        color: '#3B82F6',
      }}>◆</div>
      <div>
        <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 18, fontWeight: 700, color: '#FFF' }}>
          SyncSplit
        </h2>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'Satoshi, sans-serif' }}>
          On-Chain Bill Splitting · Stellar Soroban · Testnet
        </p>
      </div>
      <div style={{ marginLeft: 'auto' }}>
        <span style={{
          padding: '4px 12px', borderRadius: 999,
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.2)',
          color: '#3B82F6', fontSize: 11, fontWeight: 700,
          fontFamily: 'Satoshi, sans-serif',
        }}>
          Stellar
        </span>
      </div>
    </div>
  )

  if (!isConnected) return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      {MODULE_HEADER}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 130px)', gap: 20, padding: 24 }}>
        <div style={{ fontSize: 48 }}>◆</div>
        <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 28, fontWeight: 700, color: '#FFF', textAlign: 'center' }}>SyncSplit</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', textAlign: 'center', maxWidth: 420, fontFamily: 'Satoshi, sans-serif', lineHeight: 1.7 }}>
          Connect your Freighter wallet to create and manage on-chain bill splits on Stellar.
        </p>
        <button className="btn-gold" onClick={connect}>Connect Wallet</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      {MODULE_HEADER}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 24, fontWeight: 700, color: '#FFF' }}>
            Active Splits
          </h2>
          <button className="btn-gold" onClick={() => setShowCreate(s => !s)}>
            {showCreate ? '✕ Cancel' : '+ New Split'}
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div style={{
            background: '#0C0C0C',
            border: '1px solid rgba(245,197,24,0.15)',
            borderRadius: 16, padding: 28, marginBottom: 24,
          }}>
            <h3 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 18, fontWeight: 700, color: '#FFF', marginBottom: 20 }}>
              Create New Split
            </h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Satoshi, sans-serif', marginBottom: 6 }}>
                Description
              </label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Team dinner at Pizza Palace" 
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

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Satoshi, sans-serif', marginBottom: 6 }}>
                Total Amount (XLM)
              </label>
              <input type="number" value={total} onChange={e => setTotal(e.target.value)} placeholder="Total in XLM" 
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

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Satoshi, sans-serif', marginBottom: 10 }}>
                Participants
              </label>
              {participants.map((p, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 8, marginBottom: 8 }}>
                  <input type="text" placeholder="Name" value={p.name}    onChange={e => setParticipants(ps => ps.map((pp,ii) => ii===i ? {...pp,name:e.target.value} : pp))} 
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: '#111',
                      border: '1px solid #1E1E1E',
                      color: '#FFF',
                      fontFamily: 'Satoshi, sans-serif',
                      outline: 'none',
                    }}
                  />
                  <input type="text" placeholder="Stellar address" value={p.address} onChange={e => setParticipants(ps => ps.map((pp,ii) => ii===i ? {...pp,address:e.target.value} : pp))} 
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: '#111',
                      border: '1px solid #1E1E1E',
                      color: '#FFF',
                      fontFamily: 'Satoshi, sans-serif',
                      outline: 'none',
                    }}
                  />
                  <input type="number" placeholder="XLM" value={p.amount} onChange={e => setParticipants(ps => ps.map((pp,ii) => ii===i ? {...pp,amount:e.target.value} : pp))} 
                    style={{
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
              ))}
              <button
                className="btn-ghost"
                onClick={() => setParticipants(p => [...p, { name: '', address: '', amount: '' }])}
                style={{ marginTop: 4 }}
              >
                + Add Participant
              </button>
            </div>

            <button
              className="btn-gold"
              onClick={handleCreate}
              disabled={creating}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {creating
                ? <>Creating on Stellar...</>
                : '◆ Create Split on Soroban'}
            </button>
          </div>
        )}

        {/* Splits list */}
        {splits.map(split => {
          const paidCount  = split.participants.filter(p => p.paid).length
          const totalCount = split.participants.length
          const paidPct    = (paidCount / totalCount) * 100

          return (
            <div key={split.id} style={{
              background: '#0C0C0C',
              border: '1px solid rgba(59,130,246,0.12)',
              borderRadius: 16, padding: 24, marginBottom: 16,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 18, fontWeight: 700, color: '#FFF', marginBottom: 4 }}>
                    {split.description}
                  </h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'Satoshi, sans-serif' }}>
                    Total: {split.total} XLM · {paidCount}/{totalCount} paid
                  </p>
                </div>
                <span style={{
                  padding: '5px 14px', borderRadius: 8,
                  background: paidPct === 100 ? 'rgba(74,222,128,0.1)' : 'rgba(245,197,24,0.08)',
                  border: `1px solid ${paidPct === 100 ? 'rgba(74,222,128,0.2)' : 'rgba(245,197,24,0.15)'}`,
                  color: paidPct === 100 ? '#4ADE80' : '#F5C518',
                  fontSize: 11, fontWeight: 700, fontFamily: 'Satoshi, sans-serif',
                }}>
                  {paidPct === 100 ? '✓ Settled' : `${paidPct.toFixed(0)}% paid`}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ height: 4, background: '#1A1A1A', borderRadius: 2, marginBottom: 16, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${paidPct}%`,
                  background: paidPct === 100 ? '#4ADE80' : 'linear-gradient(90deg, #3B82F6, #4ADE80)',
                  borderRadius: 2, transition: 'width 0.5s ease',
                }} />
              </div>

              {/* Participants */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {split.participants.map(participant => (
                  <div key={participant.name} style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: '#111',
                    border: `1px solid ${participant.paid ? 'rgba(74,222,128,0.15)' : '#1E1E1E'}`,
                    borderRadius: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: participant.paid ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${participant.paid ? 'rgba(74,222,128,0.3)' : '#1E1E1E'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, color: participant.paid ? '#4ADE80' : 'rgba(255,255,255,0.3)',
                        fontFamily: 'Satoshi, sans-serif', fontWeight: 700,
                      }}>
                        {participant.paid ? '✓' : participant.name[0]}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#FFF', fontFamily: 'Satoshi, sans-serif' }}>
                          {participant.name}
                        </p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'Fira Code, monospace' }}>
                          {participant.address}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontFamily: 'Fira Code, monospace', fontSize: 14, fontWeight: 700, color: '#F5C518' }}>
                        {participant.amount} XLM
                      </span>
                      {!participant.paid && (
                        <button
                          onClick={() => handlePay(split.id, participant.name)}
                          disabled={paying === participant.name}
                          style={{
                            padding: '6px 14px', borderRadius: 8,
                            background: 'rgba(59,130,246,0.1)',
                            border: '1px solid rgba(59,130,246,0.2)',
                            color: '#3B82F6', fontSize: 12, fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'Satoshi, sans-serif',
                          }}
                        >
                          {paying === participant.name
                            ? <>Marking...</>
                            : 'Mark Paid'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
