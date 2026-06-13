// Built by vsrupeshkumar
// SCREEN — COMPLIANCE. The on-chain KYC gate + investment mandate + AI compliance
// check. A verifier attests the wallet's KYC tier (RWAkinsCompliance.attestKYC via
// /api/compliance/attest); the user records the mandate their AI CFO must respect
// (setMandate); and the AI gate evaluates a proposed action against hard regulatory
// gates (code-enforced) + mandate fit (/api/compliance/check). Audit trail lives at
// /compliance/audit-trail.
'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { ShieldCheck, ScrollText, Loader2, CheckCircle2, XCircle, Sparkles, FileSignature, BadgeCheck, ArrowRight } from 'lucide-react'
import type { Address } from 'viem'
import { SuiteShell, suiteCard, TEAL_C, PURPLE_C } from '@/components/creditSuite/SuiteShell'
import { isComplianceDeployed, readCompliance, setMandate, tierLabel, explorerTx, type ComplianceState } from '@/lib/rwa/creditSuite'

type ComplianceAction = 'deposit' | 'rebalance' | 'borrow' | 'withdraw'

interface CheckResult {
  allowed: boolean
  checks: { label: string; pass: boolean; detail: string; hard: boolean }[]
  rationale: string
  onChain: { canLog: boolean; logged: boolean; txHash: string | null }
}

export default function CompliancePage() {
  return (
    <SuiteShell
      eyebrow="Compliance"
      title="KYC gate, on-chain mandate & an AI compliance officer"
      subtitle="Regulated RWAs are KYC-gated — so RWAkins enforces it on-chain. Get verified, record the mandate your AI CFO must stay within, and let the compliance gate vet every action against hard regulatory rules + your policy."
      live={isComplianceDeployed}
    >
      {(address) => <ComplianceBody address={address} />}
    </SuiteShell>
  )
}

function ComplianceBody({ address }: { address: Address }) {
  const [state, setState] = useState<ComplianceState | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try { setState(await readCompliance(address)) } catch { /* preview */ }
  }, [address])
  useEffect(() => { (async () => { await refresh(); setLoading(false) })() }, [refresh])

  if (loading) return <Loading label="Reading compliance status…" />

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <StatusCard state={state} />
      <KycCard address={address} state={state} onChange={refresh} />
      <MandateCard address={address} state={state} onChange={refresh} />
      <CheckCard address={address} state={state} />
      <Link href="/compliance/audit-trail" style={{ ...ghostBtn, textDecoration: 'none', justifyContent: 'center' }}>
        <ScrollText size={16} /> View the on-chain audit trail ({state?.decisionCount ?? 0} decisions) <ArrowRight size={15} />
      </Link>
    </div>
  )
}

function StatusCard({ state }: { state: ComplianceState | null }) {
  const verified = state?.verified
  const color = verified ? TEAL_C : '#fbbf24'
  return (
    <div style={{ ...suiteCard, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <span style={{ width: 52, height: 52, borderRadius: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: `${color}1a`, border: `1px solid ${color}40` }}>
        <ShieldCheck size={24} color={color} />
      </span>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color }}>{verified ? `${tierLabel(state!.tier)} verified` : 'Not verified'}</div>
        <div style={{ fontSize: 13, color: 'var(--rwa-text-muted)', marginTop: 2 }}>
          {verified ? `Jurisdiction ${state!.jurisdiction || '—'} · KYC tier ${state!.tier}` : 'Get verified below to unlock regulated RWA actions and borrowing.'}
        </div>
      </div>
      {state && state.risk.score > 0 && (
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--rwa-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>On-chain risk</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: PURPLE_C, fontFamily: 'var(--font-mono)' }}>{state.risk.score}/1000</div>
        </div>
      )}
    </div>
  )
}

function KycCard({ address, state, onChange }: { address: Address; state: ComplianceState | null; onChange: () => Promise<void> }) {
  const [jurisdiction, setJurisdiction] = useState('USA')
  const [level, setLevel] = useState<'retail' | 'accredited' | 'institutional'>('accredited')
  const [busy, setBusy] = useState(false)

  const verify = useCallback(async () => {
    setBusy(true)
    try {
      const res = await fetch('/api/compliance/attest', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: address, jurisdiction, accredited: level !== 'retail', institutional: level === 'institutional' }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'failed')
      if (!j.approved) { toast.error(j.reason || 'Screening declined'); return }
      if (j.onChain?.txHash) toast.success(`Verified on-chain — ${j.tierLabel}`)
      else toast.message(`Screening passed (${j.tierLabel}) — on-chain attestation needs the verifier key`)
      await onChange()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Verification failed')
    } finally { setBusy(false) }
  }, [address, jurisdiction, level, onChange])

  return (
    <div style={suiteCard}>
      <h3 style={cardTitle}><BadgeCheck size={16} color={TEAL_C} /> KYC verification</h3>
      <p style={cardSub}>A verifier screens your jurisdiction (sanctioned regions are blocked in code) and attests your tier on-chain.</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 14 }}>
        <label style={field}>
          <span style={fieldLabel}>Jurisdiction (ISO-3)</span>
          <input value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value.toUpperCase().slice(0, 3))} placeholder="USA" style={input} />
        </label>
        <label style={field}>
          <span style={fieldLabel}>Status</span>
          <select value={level} onChange={(e) => setLevel(e.target.value as typeof level)} style={input}>
            <option value="retail">Retail (tier 1)</option>
            <option value="accredited">Accredited (tier 2)</option>
            <option value="institutional">Institutional (tier 3)</option>
          </select>
        </label>
      </div>
      <button onClick={verify} disabled={busy} style={{ ...btn(TEAL_C), marginTop: 14 }}>
        {busy ? <Loader2 size={16} className="kbx-spin" /> : <ShieldCheck size={16} />}
        {busy ? 'Verifying…' : state?.verified ? 'Re-verify' : 'Get verified on-chain'}
      </button>
      <style>{`.kbx-spin{animation:spinSlow 1s linear infinite}`}</style>
    </div>
  )
}

function MandateCard({ address, state, onChange }: { address: Address; state: ComplianceState | null; onChange: () => Promise<void> }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (state?.mandate) setText(state.mandate) }, [state?.mandate])

  const save = useCallback(async () => {
    if (!text.trim()) { toast.error('Enter a mandate'); return }
    setBusy(true)
    try {
      const hash = await setMandate(address, text.trim().slice(0, 400))
      toast.success('Mandate recorded on-chain')
      void hash
      await onChange()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to set mandate')
    } finally { setBusy(false) }
  }, [address, text, onChange])

  return (
    <div style={suiteCard}>
      <h3 style={cardTitle}><FileSignature size={16} color={PURPLE_C} /> Investment mandate</h3>
      <p style={cardSub}>Record the policy your AI CFO must stay within. The compliance gate checks every action against it.</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder='e.g. "Preserve capital, no leverage, keep mETH below 50%."'
        style={{ ...input, width: '100%', marginTop: 14, resize: 'vertical', fontFamily: 'inherit' }} />
      <button onClick={save} disabled={busy} style={{ ...btn(PURPLE_C), marginTop: 12 }}>
        {busy ? <Loader2 size={16} className="kbx-spin" /> : <FileSignature size={16} />}
        {busy ? 'Saving…' : 'Save mandate on-chain'}
      </button>
    </div>
  )
}

function CheckCard({ address, state }: { address: Address; state: ComplianceState | null }) {
  const [action, setAction] = useState<ComplianceAction>('borrow')
  const [amount, setAmount] = useState('25000')
  const [methPct, setMethPct] = useState('55')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<CheckResult | null>(null)

  const run = useCallback(async () => {
    setBusy(true)
    try {
      const res = await fetch('/api/compliance/check', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: address, action, amountUsd: Number(amount) || 0, proposedMethPct: Number(methPct) || 0, record: true }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'failed')
      setResult(j)
      if (j.onChain?.logged) toast.success('Decision written to the on-chain audit trail')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Check failed')
    } finally { setBusy(false) }
  }, [address, action, amount, methPct])

  return (
    <div style={suiteCard}>
      <h3 style={cardTitle}><Sparkles size={16} color={TEAL_C} /> AI compliance check</h3>
      <p style={cardSub}>Vet a proposed action against hard regulatory gates (code-enforced) and your mandate. The verdict is appended to the audit trail.</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 14 }}>
        <label style={field}><span style={fieldLabel}>Action</span>
          <select value={action} onChange={(e) => setAction(e.target.value as ComplianceAction)} style={input}>
            <option value="deposit">Deposit</option>
            <option value="rebalance">Rebalance</option>
            <option value="borrow">Borrow</option>
            <option value="withdraw">Withdraw</option>
          </select>
        </label>
        <label style={field}><span style={fieldLabel}>Amount (USD)</span>
          <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} style={input} />
        </label>
        {action === 'rebalance' && (
          <label style={field}><span style={fieldLabel}>Proposed mETH %</span>
            <input value={methPct} onChange={(e) => setMethPct(e.target.value.replace(/[^0-9]/g, ''))} style={input} />
          </label>
        )}
      </div>
      <button onClick={run} disabled={busy} style={{ ...btn(TEAL_C), marginTop: 14 }}>
        {busy ? <Loader2 size={16} className="kbx-spin" /> : <ShieldCheck size={16} />}
        {busy ? 'Checking…' : 'Run compliance check'}
      </button>

      {result && (
        <div style={{ marginTop: 16, padding: 16, borderRadius: 14, background: result.allowed ? 'rgba(47,107,84,0.06)' : 'rgba(248,113,113,0.06)', border: `1px solid ${result.allowed ? 'rgba(47,107,84,0.25)' : 'rgba(248,113,113,0.25)'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 16, color: result.allowed ? TEAL_C : '#f87171', marginBottom: 10 }}>
            {result.allowed ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            {result.allowed ? 'ALLOWED' : 'BLOCKED'}
          </div>
          <p style={{ fontSize: 13, color: 'var(--rwa-text-muted)', margin: '0 0 12px', lineHeight: 1.5 }}>{result.rationale}</p>
          <div style={{ display: 'grid', gap: 8 }}>
            {result.checks.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                {c.pass ? <CheckCircle2 size={15} color={TEAL_C} /> : <XCircle size={15} color="#f87171" />}
                <span style={{ fontWeight: 600 }}>{c.label}</span>
                <span style={{ color: 'var(--rwa-text-muted)' }}>· {c.detail}</span>
                {c.hard && <span style={{ fontSize: 10, color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 999, padding: '1px 6px' }}>HARD GATE</span>}
              </div>
            ))}
          </div>
          {result.onChain.txHash && (
            <a href={explorerTx(result.onChain.txHash)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 13, color: TEAL_C, textDecoration: 'none' }}>
              <ScrollText size={14} /> Logged on-chain — view tx
            </a>
          )}
        </div>
      )}
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

const cardTitle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, margin: '0 0 4px' }
const cardSub: React.CSSProperties = { fontSize: 13, color: 'var(--rwa-text-muted)', margin: 0, lineHeight: 1.5 }
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
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 16px', borderRadius: 12,
  cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--rwa-text)',
  background: 'var(--rwa-surface)', border: '1px solid var(--rwa-border)',
}
