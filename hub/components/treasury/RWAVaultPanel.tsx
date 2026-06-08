// Built by vsrupeshkumar
// The hero of the AI x RWA track: a live KubryxRWAVault panel on Mantle Sepolia.
// Real on-chain reads → AI (Groq) proposes an allocation → real on-chain rebalance().
'use client'

import { useCallback, useEffect, useState } from 'react'
import { formatEther, type Address } from 'viem'
import { useWallet } from '@/context/WalletContext'
import {
  RWA, isVaultDeployed, MAX_RISK_BPS, MANTLE_SEPOLIA_CHAIN_ID,
  readPortfolio, readYields, readWalletBalances, faucetMint,
  approveAndDeposit, executeRebalance, switchToMantleSepolia,
  explorerTx, explorerAddr, type Portfolio,
} from '@/lib/rwa/vaultClient'

const GREEN = '#10b981'
const BLUE = '#3B82F6'
const AMBER = '#f59e0b'
const MONO = '"Fira Code","JetBrains Mono",monospace'

interface AiRec { usdyBps: number; methBps: number; rationale: string; clamped: boolean }

const pct = (bps: number | bigint) => `${(Number(bps) / 100).toFixed(0)}%`
const tok = (v: bigint) => Number(formatEther(v)).toLocaleString('en-US', { maximumFractionDigits: 2 })

export default function RWAVaultPanel() {
  const { evm, connectEVM } = useWallet()
  const account = evm.address as Address | null
  const onMantle = evm.chainId === MANTLE_SEPOLIA_CHAIN_ID
  const live = isVaultDeployed && evm.isConnected && onMantle && !!account

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [yields, setYields] = useState<{ usdyApyBps: number; methApyBps: number }>({ usdyApyBps: 480, methApyBps: 360 })
  const [wallet, setWallet] = useState<{ usdy: bigint; meth: bigint } | null>(null)
  const [loading, setLoading] = useState(false)

  const [depositAmt, setDepositAmt] = useState('100')
  const [depositAsset, setDepositAsset] = useState<'usdy' | 'meth'>('usdy')
  const [busy, setBusy] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [txError, setTxError] = useState<string | null>(null)

  const [aiRec, setAiRec] = useState<AiRec | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [manualMeth, setManualMeth] = useState(40) // percent, 0–70

  const refresh = useCallback(async () => {
    if (!live || !account) return
    setLoading(true)
    try {
      const [p, y, w] = await Promise.all([readPortfolio(account), readYields(), readWalletBalances(account)])
      setPortfolio(p); setYields(y); setWallet(w)
      if (Number(p.methBps) > 0) setManualMeth(Math.min(70, Number(p.methBps) / 100))
    } catch {
      /* leave demo data */
    } finally {
      setLoading(false)
    }
  }, [live, account])

  useEffect(() => { refresh() }, [refresh])

  // Display values: real when live, else an illustrative demo position.
  const usdyBal = portfolio?.usdyBal ?? BigInt(6000) * (BigInt(10) ** BigInt(18))
  const methBal = portfolio?.methBal ?? BigInt(4000) * (BigInt(10) ** BigInt(18))
  const usdyBps = portfolio ? Number(portfolio.usdyBps || BigInt(6000)) : 6000
  const methBps = portfolio ? Number(portfolio.methBps || BigInt(4000)) : 4000
  const usdyApy = (yields.usdyApyBps / 100).toFixed(2)
  const methApy = (yields.methApyBps / 100).toFixed(2)

  async function withTx(label: string, fn: () => Promise<`0x${string}`>) {
    setBusy(label); setTxError(null); setTxHash(null)
    try {
      const hash = await fn()
      setTxHash(hash)
      await refresh()
    } catch (e) {
      const msg = (e as { shortMessage?: string; message?: string })?.shortMessage
        ?? (e as { message?: string })?.message ?? 'Transaction failed'
      setTxError(msg.slice(0, 160))
    } finally {
      setBusy(null)
    }
  }

  async function askAI() {
    setAiLoading(true); setAiError(null); setAiRec(null)
    try {
      const res = await fetch('/api/treasury/rebalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usdyBalance: Number(formatEther(usdyBal)),
          methBalance: Number(formatEther(methBal)),
          usdyApy: Number(usdyApy),
          methApy: Number(methApy),
          currentUsdyBps: usdyBps,
          currentMethBps: methBps,
        }),
      })
      if (!res.ok) {
        setAiError(res.status === 503 ? 'AI is not configured — use the manual sliders below.' : 'AI unavailable — use the manual sliders below.')
        return
      }
      const data = (await res.json()) as AiRec
      setAiRec(data)
      setManualMeth(Math.min(70, data.methBps / 100))
    } catch {
      setAiError('AI request failed — use the manual sliders below.')
    } finally {
      setAiLoading(false)
    }
  }

  const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, ...style }}>{children}</div>
  )

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '24px 20px 80px', color: '#fff' }}>
      {/* Header + live badge */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
          AI RWA Treasury Vault
        </h1>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: MONO,
          padding: '5px 11px', borderRadius: 99,
          background: live ? `${GREEN}1a` : `${AMBER}1a`,
          border: `1px solid ${live ? GREEN : AMBER}40`, color: live ? GREEN : AMBER,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: live ? GREEN : AMBER }} />
          {live ? 'Live · Mantle Sepolia' : isVaultDeployed ? (evm.isConnected ? 'Switch to Mantle Sepolia' : 'Demo · connect wallet for live vault') : 'Demo · vault not deployed yet'}
        </span>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.6, maxWidth: 620, marginTop: 0 }}>
        The AI proposes an allocation between <b style={{ color: GREEN }}>USDY</b> (stable yield) and{' '}
        <b style={{ color: BLUE }}>mETH</b> (staking yield). The <b>smart contract enforces the risk cap on-chain</b> —
        mETH can never exceed {MAX_RISK_BPS / 100}% no matter what the AI says.
      </p>

      {/* Contract links */}
      {isVaultDeployed ? (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 12, fontFamily: MONO, marginBottom: 18 }}>
          <a href={explorerAddr(RWA.vault)} target="_blank" rel="noreferrer" style={{ color: BLUE }}>Vault ↗ {RWA.vault.slice(0, 8)}…</a>
          <a href={explorerAddr(RWA.usdy)} target="_blank" rel="noreferrer" style={{ color: GREEN }}>kUSDY ↗</a>
          <a href={explorerAddr(RWA.meth)} target="_blank" rel="noreferrer" style={{ color: BLUE }}>kMETH ↗</a>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: AMBER, fontFamily: MONO, marginBottom: 18 }}>
          Run <code>npx hardhat run contracts/scripts/deploy-rwa.ts --network mantleSepolia</code> to go live.
        </div>
      )}

      {/* Connect / switch prompts */}
      {!evm.isConnected && (
        <button onClick={connectEVM} style={btn(BLUE)}>🦊 Connect Wallet</button>
      )}
      {evm.isConnected && isVaultDeployed && !onMantle && (
        <button onClick={() => switchToMantleSepolia().catch(() => {})} style={btn(AMBER)}>⛓ Switch to Mantle Sepolia</button>
      )}

      {/* Portfolio + yields */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, margin: '18px 0' }}>
        <Card>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Position {loading && '· …'}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
            <span style={{ color: GREEN }}>● USDY</span><span style={{ fontFamily: MONO }}>{tok(usdyBal)} <span style={{ color: 'rgba(255,255,255,0.4)' }}>({usdyApy}%)</span></span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ color: BLUE }}>● mETH</span><span style={{ fontFamily: MONO }}>{tok(methBal)} <span style={{ color: 'rgba(255,255,255,0.4)' }}>({methApy}%)</span></span>
          </div>
          {/* Allocation bar */}
          <div style={{ display: 'flex', height: 10, borderRadius: 99, overflow: 'hidden', marginTop: 14, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ width: `${usdyBps / 100}%`, background: GREEN }} />
            <div style={{ width: `${methBps / 100}%`, background: BLUE }} />
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 6, fontFamily: MONO }}>
            Target allocation: {pct(usdyBps)} USDY / {pct(methBps)} mETH
          </div>
        </Card>

        {/* Deposit */}
        <Card>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Deposit</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {(['usdy', 'meth'] as const).map(a => (
              <button key={a} onClick={() => setDepositAsset(a)} style={{
                flex: 1, padding: '8px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: depositAsset === a ? (a === 'usdy' ? `${GREEN}22` : `${BLUE}22`) : 'transparent',
                border: `1px solid ${depositAsset === a ? (a === 'usdy' ? GREEN : BLUE) : 'rgba(255,255,255,0.12)'}`,
                color: '#fff',
              }}>{a === 'usdy' ? 'kUSDY' : 'kMETH'}</button>
            ))}
          </div>
          <input value={depositAmt} onChange={e => setDepositAmt(e.target.value.replace(/[^0-9.]/g, ''))}
            inputMode="decimal" style={{ width: '100%', marginTop: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontFamily: MONO }} />
          {live && wallet && (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6, fontFamily: MONO }}>
              Wallet: {tok(depositAsset === 'usdy' ? wallet.usdy : wallet.meth)} {depositAsset === 'usdy' ? 'kUSDY' : 'kMETH'}
              {' · '}
              <button onClick={() => account && withTx('faucet', () => faucetMint(account, depositAsset === 'usdy' ? RWA.usdy : RWA.meth, '1000'))}
                disabled={!!busy} style={{ background: 'none', border: 'none', color: BLUE, cursor: 'pointer', padding: 0, fontFamily: MONO }}>
                + faucet 1000
              </button>
            </div>
          )}
          <button
            disabled={!live || !!busy || !depositAmt || Number(depositAmt) <= 0}
            onClick={() => account && withTx('deposit', () => approveAndDeposit(account, depositAsset === 'usdy' ? RWA.usdy : RWA.meth, depositAmt))}
            style={{ ...btn(GREEN), marginTop: 12, opacity: (!live || busy) ? 0.5 : 1 }}>
            {busy === 'deposit' ? 'Approving + depositing…' : busy === 'faucet' ? 'Minting…' : 'Approve & Deposit'}
          </button>
        </Card>
      </div>

      {/* AI rebalance loop */}
      <Card style={{ borderColor: `${BLUE}44` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>🤖 AI Rebalance</div>
          <button onClick={askAI} disabled={aiLoading} style={btn(BLUE, true)}>
            {aiLoading ? 'Thinking…' : 'Ask AI for an allocation'}
          </button>
        </div>

        {aiError && <div style={{ marginTop: 10, fontSize: 13, color: AMBER }}>{aiError}</div>}

        {aiRec && (
          <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: `${BLUE}12`, border: `1px solid ${BLUE}33` }}>
            <div style={{ fontFamily: MONO, fontSize: 14 }}>
              → Target: <b style={{ color: GREEN }}>{pct(aiRec.usdyBps)} USDY</b> / <b style={{ color: BLUE }}>{pct(aiRec.methBps)} mETH</b>
              {aiRec.clamped && <span style={{ color: AMBER, fontSize: 11 }}> · clamped to risk cap</span>}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 6, lineHeight: 1.5 }}>{aiRec.rationale}</div>
            <button
              disabled={!live || !!busy}
              onClick={() => account && withTx('rebalance', () => executeRebalance(account, aiRec.usdyBps, aiRec.methBps))}
              style={{ ...btn(GREEN), marginTop: 12, opacity: (!live || busy) ? 0.5 : 1 }}>
              {busy === 'rebalance' ? 'Rebalancing on-chain…' : '⚡ Execute Rebalance on Mantle'}
            </button>
          </div>
        )}

        {/* Manual fallback — always available */}
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Or set it manually (mETH capped at {MAX_RISK_BPS / 100}% by the contract):</div>
          <input type="range" min={0} max={70} value={manualMeth} onChange={e => setManualMeth(Number(e.target.value))} style={{ width: '100%', accentColor: BLUE }} />
          <div style={{ fontFamily: MONO, fontSize: 13, marginTop: 4 }}>
            <span style={{ color: GREEN }}>{100 - manualMeth}% USDY</span> / <span style={{ color: BLUE }}>{manualMeth}% mETH</span>
          </div>
          <button
            disabled={!live || !!busy}
            onClick={() => account && withTx('rebalance', () => executeRebalance(account, (100 - manualMeth) * 100, manualMeth * 100))}
            style={{ ...btn(BLUE), marginTop: 10, opacity: (!live || busy) ? 0.5 : 1 }}>
            {busy === 'rebalance' ? 'Rebalancing…' : 'Execute Manual Rebalance'}
          </button>
        </div>
      </Card>

      {/* Tx feedback */}
      {txHash && (
        <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: `${GREEN}12`, border: `1px solid ${GREEN}33`, fontSize: 13 }}>
          ✓ Confirmed on Mantle Sepolia ·{' '}
          <a href={explorerTx(txHash)} target="_blank" rel="noreferrer" style={{ color: GREEN, fontFamily: MONO }}>{txHash.slice(0, 14)}… ↗</a>
        </div>
      )}
      {txError && (
        <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: '#ef444412', border: '1px solid #ef444433', fontSize: 13, color: '#fca5a5' }}>
          ✗ {txError}
        </div>
      )}

      <div style={{ textAlign: 'center', padding: '28px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
        Built by vsrupeshkumar · KubryxRWAVault on Mantle Sepolia (chain 5003)
      </div>
    </div>
  )
}

function btn(color: string, small = false): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: small ? 'auto' : '100%',
    padding: small ? '8px 16px' : '12px 18px',
    borderRadius: 12, border: 'none', cursor: 'pointer',
    background: color, color: '#fff', fontWeight: 700, fontSize: 14,
  }
}
