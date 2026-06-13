// Built by vsrupeshkumar
// SCREEN — AI LENDING. Borrow USDY against USDY/mETH collateral, where the AI
// negotiates the APR and the borrower's SOULBOUND CREDIT PASSPORT sets the LTV,
// and the on-chain KYC gate must pass first. Terms: /api/lend/terms; execution:
// RWAkinsLending.openLoan / repay via lib/rwa/creditSuite. This closes the loop:
// deposit/earn → reputation → credit.
'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Coins, Sparkles, Loader2, ExternalLink, ShieldAlert, ArrowRight, RefreshCw, HandCoins } from 'lucide-react'
import type { Address } from 'viem'
import { SuiteShell, suiteCard, TEAL_C, PURPLE_C } from '@/components/creditSuite/SuiteShell'
import {
  isLendingDeployed, readLendingMarket, readLoan, readCompliance, SUITE, explorerTx, fmt,
  openLoan, repayLoan, type LoanState, type LendingMarket,
} from '@/lib/rwa/creditSuite'
import { readWalletBalances, readMethPrice } from '@/lib/rwa/vaultClient'

interface Terms {
  creditScore: number
  hasPassport: boolean
  collateralValueUsd: number
  terms: { aprBps: number; aprPct: number; maxLtvBps: number; maxLtvPct: number; suggestedBorrowUsd: number }
  risk: { composite: number; band: string }
  note: string
}

export default function LendPage() {
  return (
    <SuiteShell
      eyebrow="AI Lending"
      title="Borrow against your RWAs — credit-priced, KYC-gated"
      subtitle="Post USDY or mETH as collateral and the AI negotiates your rate, while your soulbound credit passport sets how much you can borrow. KYC is enforced on-chain before any loan opens."
      live={isLendingDeployed}
    >
      {(address) => <LendBody address={address} />}
    </SuiteShell>
  )
}

function LendBody({ address }: { address: Address }) {
  const [market, setMarket] = useState<LendingMarket>({ liquidity: 0, maxLtvBps: 0 })
  const [loan, setLoan] = useState<LoanState | null>(null)
  const [verified, setVerified] = useState(false)
  const [balances, setBalances] = useState({ usdy: 0, meth: 0 })
  const [methPrice, setMethPrice] = useState(0)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const [m, l, c] = await Promise.all([
        readLendingMarket(address).catch(() => ({ liquidity: 0, maxLtvBps: 0 })),
        readLoan(address).catch(() => null),
        readCompliance(address).catch(() => null),
      ])
      setMarket(m); setLoan(l); setVerified(!!c?.verified)
      try {
        const [b, p] = await Promise.all([readWalletBalances(address), readMethPrice()])
        setBalances({ usdy: Number(b.usdy) / 1e18, meth: Number(b.meth) / 1e18 }); setMethPrice(p)
      } catch { /* preview */ }
    } finally { setLoading(false) }
  }, [address])
  useEffect(() => { refresh() }, [refresh])

  if (loading) return <Loading label="Reading the lending market…" />

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Market stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        <Stat label="USDY liquidity" value={`$${fmt(market.liquidity, 0)}`} color={TEAL_C} />
        <Stat label="Your max LTV" value={`${(market.maxLtvBps / 100).toFixed(0)}%`} color={PURPLE_C} />
        <Stat label="KYC status" value={verified ? 'Verified' : 'Required'} color={verified ? TEAL_C : '#fbbf24'} />
      </div>

      {!verified && (
        <div style={{ ...suiteCard, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.25)' }}>
          <ShieldAlert size={20} color="#fbbf24" />
          <span style={{ fontSize: 14, color: 'var(--rwa-text)', flex: 1 }}>Borrowing requires on-chain KYC. The contract will reject an unverified wallet.</span>
          <Link href="/compliance" style={{ ...ghostBtn, textDecoration: 'none', color: '#fbbf24' }}>Get verified <ArrowRight size={14} /></Link>
        </div>
      )}

      {loan?.active
        ? <ActiveLoan loan={loan} address={address} onChange={refresh} />
        : <BorrowForm address={address} market={market} balances={balances} methPrice={methPrice} verified={verified} onChange={refresh} />}
    </div>
  )
}

function BorrowForm({ address, market, balances, methPrice, verified, onChange }: {
  address: Address; market: LendingMarket; balances: { usdy: number; meth: number }; methPrice: number; verified: boolean; onChange: () => Promise<void>
}) {
  const [asset, setAsset] = useState<'usdy' | 'meth'>('usdy')
  const [collateral, setCollateral] = useState('1000')
  const [borrow, setBorrow] = useState('')
  const [terms, setTerms] = useState<Terms | null>(null)
  const [quoting, setQuoting] = useState(false)
  const [step, setStep] = useState<'idle' | 'approving' | 'borrowing'>('idle')

  const collateralValueUsd = asset === 'usdy' ? Number(collateral) || 0 : (Number(collateral) || 0) * methPrice

  const quote = useCallback(async () => {
    setQuoting(true)
    try {
      const res = await fetch('/api/lend/terms', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: address, collateralAsset: asset, collateralAmount: Number(collateral) || 0 }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'failed')
      setTerms(j)
      setBorrow(Math.floor(j.terms.suggestedBorrowUsd).toString())
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Quote failed')
    } finally { setQuoting(false) }
  }, [address, asset, collateral])

  const submit = useCallback(async () => {
    if (!terms) return
    if (!verified) { toast.error('KYC verification required — visit Compliance'); return }
    try {
      await openLoan(address, asset === 'usdy' ? SUITE.usdy : SUITE.meth, collateral, borrow, terms.terms.aprBps, (s) => setStep(s))
      toast.success(`Borrowed ${fmt(Number(borrow), 0)} USDY`)
      setStep('idle'); setTerms(null); await onChange()
    } catch (e) {
      setStep('idle')
      toast.error(e instanceof Error ? e.message.slice(0, 120) : 'Borrow failed')
    }
  }, [address, asset, collateral, borrow, terms, verified, onChange])

  const bal = asset === 'usdy' ? balances.usdy : balances.meth

  return (
    <div style={suiteCard}>
      <h3 style={cardTitle}><HandCoins size={16} color={TEAL_C} /> Open a loan</h3>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 14 }}>
        <label style={field}><span style={fieldLabel}>Collateral asset</span>
          <select value={asset} onChange={(e) => { setAsset(e.target.value as 'usdy' | 'meth'); setTerms(null) }} style={input}>
            <option value="usdy">USDY</option>
            <option value="meth">mETH</option>
          </select>
        </label>
        <label style={field}><span style={fieldLabel}>Collateral amount {bal > 0 && <span style={{ color: 'var(--rwa-text-muted)' }}>· bal {fmt(bal, 2)}</span>}</span>
          <input value={collateral} onChange={(e) => { setCollateral(e.target.value.replace(/[^0-9.]/g, '')); setTerms(null) }} style={input} />
        </label>
      </div>
      <div style={{ fontSize: 12, color: 'var(--rwa-text-muted)', marginTop: 8 }}>Collateral value ≈ ${fmt(collateralValueUsd, 0)}</div>

      <button onClick={quote} disabled={quoting || !(Number(collateral) > 0)} style={{ ...btn(PURPLE_C), marginTop: 14 }}>
        {quoting ? <Loader2 size={16} className="kbx-spin" /> : <Sparkles size={16} />}
        {quoting ? 'Negotiating…' : 'Get AI loan terms'}
      </button>

      {terms && (
        <div style={{ marginTop: 16, padding: 16, borderRadius: 14, background: 'rgba(47,107,84,0.05)', border: '1px solid rgba(47,107,84,0.22)' }}>
          <p style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--rwa-text-muted)', margin: '0 0 14px', lineHeight: 1.5 }}>
            <Sparkles size={15} color={TEAL_C} style={{ flexShrink: 0, marginTop: 1 }} /><span>{terms.note}</span>
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10, marginBottom: 14 }}>
            <MiniStat label="APR" value={`${terms.terms.aprPct.toFixed(1)}%`} />
            <MiniStat label="Max LTV" value={`${terms.terms.maxLtvPct.toFixed(0)}%`} />
            <MiniStat label="Credit" value={terms.creditScore ? String(terms.creditScore) : '—'} />
            <MiniStat label="Risk" value={`${terms.risk.composite}`} />
          </div>
          <label style={{ ...field, width: '100%' }}><span style={fieldLabel}>Borrow (USDY) · max ${fmt(terms.terms.suggestedBorrowUsd, 0)}</span>
            <input value={borrow} onChange={(e) => setBorrow(e.target.value.replace(/[^0-9.]/g, ''))} style={input} />
          </label>
          {!terms.hasPassport && (
            <div style={{ fontSize: 12, color: '#fbbf24', marginTop: 8 }}>
              No credit passport yet → 30% floor LTV. <Link href="/credit" style={{ color: TEAL_C }}>Build your score</Link> to unlock more.
            </div>
          )}
          <button onClick={submit} disabled={step !== 'idle' || !(Number(borrow) > 0)} style={{ ...btn(TEAL_C), marginTop: 14, width: '100%', justifyContent: 'center' }}>
            {step !== 'idle' ? <Loader2 size={16} className="kbx-spin" /> : <Coins size={16} />}
            {step === 'approving' ? 'Approving collateral…' : step === 'borrowing' ? 'Opening loan…' : `Borrow ${borrow || 0} USDY`}
          </button>
        </div>
      )}
      <style>{`.kbx-spin{animation:spinSlow 1s linear infinite}`}</style>
    </div>
  )
}

function ActiveLoan({ loan, address, onChange }: { loan: LoanState; address: Address; onChange: () => Promise<void> }) {
  const [step, setStep] = useState<'idle' | 'approving' | 'repaying'>('idle')
  const ltvPct = loan.ltvBps / 100
  const health = Math.min(100, (loan.ltvBps / 8300) * 100)
  const healthColor = health < 50 ? TEAL_C : health < 80 ? '#fbbf24' : '#f87171'

  const repay = useCallback(async () => {
    try {
      await repayLoan(address, loan.debt, (s) => setStep(s))
      toast.success('Loan repaid — collateral released')
      setStep('idle'); await onChange()
    } catch (e) {
      setStep('idle'); toast.error(e instanceof Error ? e.message.slice(0, 120) : 'Repay failed')
    }
  }, [address, loan.debt, onChange])

  return (
    <div style={suiteCard}>
      <h3 style={cardTitle}><Coins size={16} color={TEAL_C} /> Active loan</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, margin: '14px 0' }}>
        <MiniStat label="Debt (USDY)" value={fmt(loan.debt, 2)} />
        <MiniStat label="Principal" value={fmt(loan.principal, 2)} />
        <MiniStat label="APR" value={`${(loan.aprBps / 100).toFixed(1)}%`} />
        <MiniStat label="Collateral" value={fmt(loan.collateralTokens, 2)} />
      </div>
      <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
        <span style={{ color: 'var(--rwa-text-muted)' }}>Loan health · LTV {ltvPct.toFixed(0)}%</span>
        <span style={{ color: healthColor, fontWeight: 700 }}>{health < 50 ? 'Healthy' : health < 80 ? 'Watch' : 'At risk'}</span>
      </div>
      <div style={{ height: 10, borderRadius: 999, background: 'var(--rwa-surface)', overflow: 'hidden' }}>
        <div style={{ width: `${health}%`, height: '100%', borderRadius: 999, background: healthColor, transition: 'width 0.5s' }} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--rwa-text-muted)', marginTop: 4 }}>Liquidation at 83% LTV</div>
      <button onClick={repay} disabled={step !== 'idle'} style={{ ...btn(TEAL_C), marginTop: 16 }}>
        {step !== 'idle' ? <Loader2 size={16} className="kbx-spin" /> : <RefreshCw size={16} />}
        {step === 'approving' ? 'Approving USDY…' : step === 'repaying' ? 'Repaying…' : `Repay ${fmt(loan.debt, 2)} USDY`}
      </button>
      <style>{`.kbx-spin{animation:spinSlow 1s linear infinite}`}</style>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ ...suiteCard, padding: 16 }}>
      <div style={{ fontSize: 12, color: 'var(--rwa-text-muted)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
    </div>
  )
}
function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--rwa-text-muted)', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{value}</div>
    </div>
  )
}
function Loading({ label }: { label: string }) {
  return (
    <div style={{ ...suiteCard, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', padding: 48 }}>
      <Loader2 size={20} className="kbx-spin" /> <span style={{ color: 'var(--rwa-text-muted)' }}>{label}</span>
      <style>{`.kbx-spin{animation:spinSlow 1s linear infinite}`}</style>
    </div>
  )
}

const cardTitle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, margin: '0 0 4px' }
const field: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6, flex: '1 1 140px' }
const fieldLabel: React.CSSProperties = { fontSize: 12, color: 'var(--rwa-text-muted)', fontWeight: 600 }
const input: React.CSSProperties = {
  padding: '10px 12px', borderRadius: 10, fontSize: 14, color: 'var(--rwa-text)',
  background: 'var(--rwa-surface)', border: '1px solid var(--rwa-border)', outline: 'none',
}
const btn = (color: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 18px', borderRadius: 12,
  border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#080808', background: color,
})
const ghostBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 10,
  cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--rwa-text)',
  background: 'var(--rwa-surface)', border: '1px solid var(--rwa-border)',
}
