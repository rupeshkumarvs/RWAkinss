// Built by vsrupeshkumar
// SCREEN — CREDIT PASSPORT. A SOULBOUND (non-transferable) NFT carrying the
// wallet's on-chain credit score (300-900), computed by the AI engine from real
// on-chain behaviour and written to RWAkinsCreditPassport. The lending market
// reads this score to set the borrower's LTV. Logic: lib/creditSuite/credit +
// /api/credit/score, on-chain reads via lib/rwa/creditSuite.
'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Sparkles, ShieldCheck, ExternalLink, Loader2, RefreshCw, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { Address } from 'viem'
import { SuiteShell, suiteCard, TEAL_C, PURPLE_C } from '@/components/creditSuite/SuiteShell'
import { isCreditDeployed, readPassport, explorerTx, explorerAddr, SUITE, type PassportState } from '@/lib/rwa/creditSuite'
import type { CreditReport } from '@/lib/creditSuite/credit'

interface ScoreResult {
  report: CreditReport
  summary: string
  onChain: { canWrite: boolean; written: boolean; txHash: string | null }
}

const BAND_COLOR = ['#9ca3af', '#f87171', '#fbbf24', '#2f6b54', '#34d399', '#3f9a73']
const bandColor = (b: number) => BAND_COLOR[b] ?? '#9ca3af'

export default function CreditPage() {
  return (
    <SuiteShell
      eyebrow="Credit Passport"
      title="A soulbound credit score, earned on-chain"
      subtitle="The AI credit engine reads your real on-chain behaviour — capital, allocation discipline, KYC tier, agent track record — into a 300-900 score, minted as a non-transferable passport that unlocks better borrowing terms."
      live={isCreditDeployed}
    >
      {(address) => <CreditBody address={address} />}
    </SuiteShell>
  )
}

function CreditBody({ address }: { address: Address }) {
  const [passport, setPassport] = useState<PassportState | null>(null)
  const [result, setResult] = useState<ScoreResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [scoring, setScoring] = useState(false)

  const refresh = useCallback(async () => {
    try { setPassport(await readPassport(address)) } catch { /* preview mode */ }
  }, [address])

  useEffect(() => { (async () => { await refresh(); setLoading(false) })() }, [refresh])

  const score = useCallback(async () => {
    setScoring(true)
    try {
      const res = await fetch('/api/credit/score', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: address }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'failed')
      setResult(j)
      await refresh()
      if (j.onChain?.txHash) toast.success(`Credit passport updated — score ${j.report.score}`)
      else toast.message(`Score computed (${j.report.score}) — writing on-chain needs the scorer key`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Scoring failed')
    } finally {
      setScoring(false)
    }
  }, [address, refresh])

  if (loading) return <Loading label="Reading your passport…" />

  // Prefer the live freshly-scored report; otherwise reflect the on-chain passport.
  const score900 = result?.report.score ?? passport?.score ?? 0
  const band = result?.report.band ?? passport?.band ?? 0
  const hasScore = score900 > 0
  const color = bandColor(band)
  const bandLabel = ['—', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][band] ?? '—'

  return (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1fr)', alignItems: 'start' }}>
      {/* Passport card */}
      <div style={{ ...suiteCard, background: `linear-gradient(135deg, ${color}14, rgba(63,154,115,0.06))`, border: `1px solid ${color}33` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--rwa-text-muted)', textTransform: 'uppercase' }}>RWAkins Credit Passport</div>
            <div style={{ fontSize: 13, color: 'var(--rwa-text-muted)', marginTop: 2 }}>Soulbound · RCRD{passport?.tokenId ? ` #${passport.tokenId}` : ''}</div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: PURPLE_C, padding: '4px 10px', borderRadius: 999, background: 'rgba(63,154,115,0.12)', border: '1px solid rgba(63,154,115,0.3)' }}>
            <Lock size={12} /> Non-transferable
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1, color, fontFamily: 'var(--font-mono)' }}>{hasScore ? score900 : '—'}</div>
            <div style={{ fontSize: 13, color: 'var(--rwa-text-muted)', marginTop: 4 }}>range 300–900</div>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color, marginBottom: 8 }}>{hasScore ? bandLabel : 'Not yet scored'}</div>
            <div style={{ height: 10, borderRadius: 999, background: 'var(--rwa-border)', overflow: 'hidden' }}>
              <div style={{ width: `${hasScore ? ((score900 - 300) / 600) * 100 : 0}%`, height: '100%', borderRadius: 999, background: color, transition: 'width 0.6s' }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--rwa-text-muted)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>{address.slice(0, 6)}…{address.slice(-4)}</div>
          </div>
        </div>

        {result?.summary && (
          <p style={{ display: 'flex', gap: 8, fontSize: 14, color: 'var(--rwa-text-muted)', lineHeight: 1.55, margin: '18px 0 0' }}>
            <Sparkles size={15} color={TEAL_C} style={{ flexShrink: 0, marginTop: 2 }} /><span>{result.summary}</span>
          </p>
        )}
      </div>

      {/* Factor breakdown */}
      {result?.report && (
        <div style={suiteCard}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px', color: 'var(--rwa-text)' }}>How your score is built</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {result.report.factors.map((f, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingBottom: 10, borderBottom: i < result.report.factors.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{f.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--rwa-text-muted)' }}>{f.detail}</div>
                </div>
                <span style={{ fontSize: 15, fontWeight: 800, fontFamily: 'var(--font-mono)', color: f.points > 0 ? TEAL_C : f.points < 0 ? '#f87171' : 'var(--rwa-text-muted)' }}>
                  {f.points > 0 ? '+' : ''}{f.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ ...suiteCard, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={score} disabled={scoring} style={btn(TEAL_C)}>
          {scoring ? <Loader2 size={16} className="kbx-spin" /> : <Sparkles size={16} />}
          {scoring ? 'Scoring…' : hasScore ? 'Refresh credit score' : 'Generate my credit passport'}
        </button>
        {passport?.exists && (
          <a href={explorerAddr(SUITE.credit)} target="_blank" rel="noopener noreferrer" style={{ ...ghostBtn, color: PURPLE_C, textDecoration: 'none' }}>
            <ShieldCheck size={15} /> View contract
          </a>
        )}
        {result?.onChain.txHash && (
          <a href={explorerTx(result.onChain.txHash)} target="_blank" rel="noopener noreferrer" style={{ ...ghostBtn, color: TEAL_C, textDecoration: 'none' }}>
            <ExternalLink size={15} /> View tx
          </a>
        )}
        <Link href="/lend" style={{ ...ghostBtn, textDecoration: 'none' }}>
          Use it to borrow <ArrowRight size={15} />
        </Link>
      </div>
      <style>{`.kbx-spin{animation:spinSlow 1s linear infinite}`}</style>
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

const btn = (color: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 18px', borderRadius: 12,
  border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#080808', background: color,
})
const ghostBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 16px', borderRadius: 12,
  cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#fff',
  background: 'var(--rwa-surface)', border: '1px solid rgba(255,255,255,0.12)',
}
