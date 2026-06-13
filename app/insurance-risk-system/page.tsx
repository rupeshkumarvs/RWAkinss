// Built by vsrupeshkumar
// SCREEN — AI RISK SYSTEM. Scores the wallet's live USDY/mETH position across five
// auditable dimensions (concentration, market/vol, liquidity, leverage, yield
// sustainability), shows an LLM commentary, and lets the user ANCHOR the composite
// score on-chain via RWAkinsCompliance.recordRisk. Logic: lib/creditSuite/risk +
// /api/risk/score.
'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Gauge, Sparkles, Anchor, ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import type { Address } from 'viem'
import { SuiteShell, suiteCard, TEAL_C } from '@/components/creditSuite/SuiteShell'
import { isComplianceDeployed, explorerTx } from '@/lib/rwa/creditSuite'
import type { RiskReport } from '@/lib/creditSuite/risk'

interface RiskData {
  report: RiskReport
  commentary: string
  market: { usdyApy: number; methApy: number; eth24hChange: number; volatility: number }
  onChain: { canRecord: boolean; recorded: boolean; txHash: string | null }
}

const BAND_COLOR = ['#9ca3af', '#2f6b54', '#fbbf24', '#fb923c', '#f87171', '#ef4444']
const bandColor = (b: number) => BAND_COLOR[b] ?? '#9ca3af'

export default function RiskSystemPage() {
  return (
    <SuiteShell
      eyebrow="AI Risk System"
      title="5-dimension portfolio risk, scored & anchored on-chain"
      subtitle="Your AI CFO grades the live USDY/mETH position across five auditable dimensions, then records the composite score on Mantle so the assessment is verifiable — not a black box."
      live={isComplianceDeployed}
    >
      {(address) => <RiskBody address={address} />}
    </SuiteShell>
  )
}

function RiskBody({ address }: { address: Address }) {
  const [data, setData] = useState<RiskData | null>(null)
  const [loading, setLoading] = useState(true)
  const [anchoring, setAnchoring] = useState(false)

  const load = useCallback(async (record = false) => {
    record ? setAnchoring(true) : setLoading(true)
    try {
      const res = await fetch('/api/risk/score', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: address, record }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'failed')
      setData(j)
      if (record && j.onChain?.txHash) toast.success('Risk score anchored on-chain')
      else if (record) toast.message('Score computed — anchoring needs the agent key configured')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Risk read failed')
    } finally {
      setLoading(false)
      setAnchoring(false)
    }
  }, [address])

  useEffect(() => { load(false) }, [load])

  if (loading && !data) return <Loading label="Scoring your live position…" />
  if (!data) return <div style={suiteCard}>No risk data.</div>

  const r = data.report
  const color = bandColor(r.band)

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Composite */}
      <div style={{ ...suiteCard, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <Dial value={r.composite} color={color} />
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>
            <Gauge size={14} style={{ verticalAlign: -2, marginRight: 6 }} />{r.bandLabel} risk
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>{r.composite}<span style={{ fontSize: 16, color: 'var(--rwa-text-muted)' }}>/100</span></div>
          <p style={{ display: 'flex', gap: 8, fontSize: 14, color: 'var(--rwa-text-muted)', lineHeight: 1.55, margin: 0 }}>
            <Sparkles size={15} color={TEAL_C} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{data.commentary}</span>
          </p>
        </div>
      </div>

      {/* Dimensions */}
      <div style={suiteCard}>
        <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px', color: 'var(--rwa-text)' }}>Risk dimensions</h3>
        <div style={{ display: 'grid', gap: 14 }}>
          {r.dimensions.map((d) => (
            <div key={d.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{d.label}</span>
                <span style={{ fontSize: 13, color: bandColor(d.score < 20 ? 1 : d.score < 40 ? 2 : d.score < 60 ? 3 : d.score < 80 ? 4 : 5), fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{d.score}</span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: 'var(--rwa-surface)', overflow: 'hidden' }}>
                <div style={{ width: `${d.score}%`, height: '100%', borderRadius: 999, background: bandColor(d.score < 20 ? 1 : d.score < 40 ? 2 : d.score < 60 ? 3 : d.score < 80 ? 4 : 5), transition: 'width 0.5s' }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--rwa-text-muted)', marginTop: 4 }}>{d.note} · weight {Math.round(d.weight * 100)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ ...suiteCard, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => load(true)} disabled={anchoring} style={btn(color)}>
          {anchoring ? <Loader2 size={16} className="kbx-spin" /> : <Anchor size={16} />}
          {anchoring ? 'Anchoring…' : 'Anchor risk score on-chain'}
        </button>
        <button onClick={() => load(false)} disabled={loading} style={ghostBtn}>
          <RefreshCw size={15} /> Re-score
        </button>
        {data.onChain.txHash && (
          <a href={explorerTx(data.onChain.txHash)} target="_blank" rel="noopener noreferrer" style={{ ...ghostBtn, color: TEAL_C, textDecoration: 'none' }}>
            <ExternalLink size={15} /> View tx
          </a>
        )}
        {!data.onChain.canRecord && (
          <span style={{ fontSize: 12, color: 'var(--rwa-text-muted)' }}>On-chain anchoring activates once the suite is deployed + the agent key is set.</span>
        )}
      </div>
      <style>{`.kbx-spin{animation:spinSlow 1s linear infinite}`}</style>
    </div>
  )
}

function Dial({ value, color }: { value: number; color: string }) {
  const r = 52, c = 2 * Math.PI * r, off = c * (1 - value / 100)
  return (
    <svg width={140} height={140} viewBox="0 0 140 140">
      <circle cx={70} cy={70} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={12} />
      <circle cx={70} cy={70} r={r} fill="none" stroke={color} strokeWidth={12} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 70 70)" style={{ transition: 'stroke-dashoffset 0.6s' }} />
      <text x={70} y={66} textAnchor="middle" fontSize={28} fontWeight={800} fill="#fff">{Math.round(value)}</text>
      <text x={70} y={88} textAnchor="middle" fontSize={11} fill="rgba(255,255,255,0.5)">/ 100</text>
    </svg>
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
