'use client'
import { useState } from 'react'
import { useWallet } from '@/app/contexts/WalletContext'
import { notify }    from '@/lib/toast'

const ASSETS = [
  { symbol: 'BTC',  chain: 'Bitcoin',   balance: '0.4821',  usd: '$31,240',  change: '+2.4%', up: true },
  { symbol: 'ETH',  chain: 'Ethereum',  balance: '12.340',  usd: '$38,107',  change: '+1.8%', up: true },
  { symbol: 'SOL',  chain: 'Solana',    balance: '240.00',  usd: '$22,320',  change: '-0.6%', up: false },
  { symbol: 'USDC', chain: 'Multi',     balance: '15,420',  usd: '$15,420',  change: '0.0%',  up: true },
]

const TRADES = [
  { from: 'ETH', to: 'BTC', amount: '2.0 ETH', received: '0.0847 BTC', status: 'completed', time: '2h ago' },
  { from: 'SOL', to: 'USDC', amount: '50 SOL', received: '4,650 USDC', status: 'completed', time: '5h ago' },
  { from: 'BTC', to: 'ETH', amount: '0.1 BTC', received: '3.12 ETH',  status: 'pending',   time: '8h ago' },
]

export default function VaultPage() {
  const { isConnected, connect } = useWallet()
  const [fromAsset, setFromAsset] = useState('ETH')
  const [toAsset, setToAsset]     = useState('BTC')
  const [amount, setAmount]       = useState('')
  const [trading, setTrading]     = useState(false)
  const [privacy, setPrivacy]     = useState(true)

  async function handleTrade() {
    if (!amount) { notify.error('Enter amount'); return }
    setTrading(true)
    await new Promise(r => setTimeout(r, 2500))
    notify.success(`Private trade executed: ${amount} ${fromAsset} → ${toAsset}`)
    setAmount('')
    setTrading(false)
  }

  const MODULE_HEADER = (
    <div style={{
      borderBottom: '1px solid rgba(6,182,212,0.15)',
      padding: '20px 32px',
      display: 'flex', alignItems: 'center', gap: 16,
      background: '#0A0A0A',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: 'rgba(6,182,212,0.1)',
        border: '1px solid rgba(6,182,212,0.2)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 18,
      }}>🔐</div>
      <div>
        <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 18, fontWeight: 700, color: '#FFF' }}>
          CipherVault
        </h2>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'Satoshi, sans-serif' }}>
          Private Cross-Chain Trading · Zero Data Exposure
        </p>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={() => setPrivacy(p => !p)}
          style={{
            padding: '5px 14px', borderRadius: 999,
            background: privacy ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${privacy ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.1)'}`,
            color: privacy ? '#06B6D4' : 'rgba(255,255,255,0.4)',
            fontSize: 11, fontWeight: 700,
            fontFamily: 'Satoshi, sans-serif', cursor: 'pointer',
          }}
        >
          {privacy ? '🔒 Privacy ON' : '🔓 Privacy OFF'}
        </button>
        <span style={{
          padding: '4px 12px', borderRadius: 999,
          background: 'rgba(6,182,212,0.1)',
          border: '1px solid rgba(6,182,212,0.2)',
          color: '#06B6D4', fontSize: 11, fontWeight: 700,
          fontFamily: 'Satoshi, sans-serif',
        }}>
          Multi-Chain
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
        <div style={{ fontSize: 48 }}>🔐</div>
        <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 28, fontWeight: 700, color: '#FFF', textAlign: 'center' }}>
          CipherVault
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', textAlign: 'center', maxWidth: 420, fontFamily: 'Satoshi, sans-serif', lineHeight: 1.7 }}>
          Connect your wallet to access private cross-chain trading.
          Zero bytes sent to cloud. Complete privacy guaranteed.
        </p>
        <button className="btn-gold" onClick={connect}>Connect Wallet</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      {MODULE_HEADER}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Privacy shield banner */}
        {privacy && (
          <div style={{
            padding: '12px 20px',
            background: 'rgba(6,182,212,0.05)',
            border: '1px solid rgba(6,182,212,0.15)',
            borderRadius: 10, marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 16 }}>🔒</span>
            <span style={{ fontSize: 13, color: 'rgba(6,182,212,0.8)', fontFamily: 'Satoshi, sans-serif' }}>
              Privacy Shield Active — All trades are routed through zero-knowledge proofs.
              Zero transaction metadata exposed.
            </span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Portfolio */}
          <div>
            <div style={{ background: '#0C0C0C', border: '1px solid #1A1A1A', borderRadius: 16, padding: 24, marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 18, fontWeight: 700, color: '#FFF', marginBottom: 20 }}>
                Portfolio
              </h3>
              {ASSETS.map(asset => (
                <div key={asset.symbol} style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid #111',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'rgba(245,197,24,0.1)',
                      border: '1px solid rgba(245,197,24,0.15)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 12,
                      fontWeight: 700, color: '#F5C518',
                      fontFamily: 'Fira Code, monospace',
                    }}>
                      {asset.symbol.slice(0,2)}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#FFF', fontFamily: 'Satoshi, sans-serif' }}>
                        {asset.symbol}
                      </p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'Satoshi, sans-serif' }}>
                        {asset.chain}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#FFF', fontFamily: 'Fira Code, monospace' }}>
                      {privacy ? '****' : asset.balance}
                    </p>
                    <p style={{ fontSize: 12, color: asset.up ? '#4ADE80' : '#F87171', fontFamily: 'Satoshi, sans-serif' }}>
                      {asset.change}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trade panel */}
          <div>
            <div style={{ background: '#0C0C0C', border: '1px solid rgba(6,182,212,0.12)', borderRadius: 16, padding: 24, marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 18, fontWeight: 700, color: '#FFF', marginBottom: 20 }}>
                Private Trade
              </h3>

              {[
                { label: 'From', value: fromAsset, setter: setFromAsset },
                { label: 'To',   value: toAsset,   setter: setToAsset   },
              ].map(row => (
                <div key={row.label} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Satoshi, sans-serif', marginBottom: 6 }}>
                    {row.label}
                  </label>
                  <select
                    value={row.value}
                    onChange={e => row.setter(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 14px',
                      background: '#111', border: '1px solid #1E1E1E',
                      borderRadius: 10, color: '#FFF',
                      fontSize: 14, fontFamily: 'Satoshi, sans-serif',
                      outline: 'none', cursor: 'pointer',
                    }}
                  >
                    {ASSETS.map(a => (
                      <option key={a.symbol} value={a.symbol}>{a.symbol} — {a.chain}</option>
                    ))}
                  </select>
                </div>
              ))}

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Satoshi, sans-serif', marginBottom: 6 }}>
                  Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder={`Amount in ${fromAsset}`}
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
                onClick={handleTrade}
                disabled={trading}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {trading
                  ? <>Executing Private Trade...</>
                  : `🔒 Swap ${fromAsset} → ${toAsset}`}
              </button>
            </div>

            {/* Trade history */}
            <div style={{ background: '#0C0C0C', border: '1px solid #1A1A1A', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 16, fontWeight: 700, color: '#FFF', marginBottom: 16 }}>
                Trade History
              </h3>
              {TRADES.map((trade, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #111' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#FFF', fontFamily: 'Satoshi, sans-serif' }}>
                      {privacy ? '****' : trade.amount} → {privacy ? '****' : trade.received}
                    </p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'Satoshi, sans-serif' }}>
                      {trade.from} → {trade.to} · {trade.time}
                    </p>
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: 6,
                    background: trade.status === 'completed' ? 'rgba(74,222,128,0.08)' : 'rgba(245,197,24,0.08)',
                    border: `1px solid ${trade.status === 'completed' ? 'rgba(74,222,128,0.2)' : 'rgba(245,197,24,0.2)'}`,
                    color: trade.status === 'completed' ? '#4ADE80' : '#F5C518',
                    fontSize: 11, fontWeight: 700,
                    fontFamily: 'Satoshi, sans-serif',
                  }}>
                    {trade.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
