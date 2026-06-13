// Built by vsrupeshkumar
// SCREEN — AUDIT TRAIL. The tamper-evident, on-chain record of every agent
// decision and risk score for the connected wallet, read straight from
// RWAkinsCompliance events (lib/rwa/creditSuite.readAuditTrail). The monotonic
// per-user sequence makes any gap or reordering detectable — this is the
// "radical transparency / on-chain benchmarking" the hackathon is built around.
'use client'

import { useCallback, useEffect, useState } from 'react'
import { ScrollText, CheckCircle2, XCircle, Gauge, ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import type { Address } from 'viem'
import { SuiteShell, suiteCard, TEAL_C, PURPLE_C } from '@/components/creditSuite/SuiteShell'
import { isComplianceDeployed, readAuditTrail, explorerTx, type AuditEntry } from '@/lib/rwa/creditSuite'

export default function AuditTrailPage() {
  return (
    <SuiteShell
      eyebrow="Audit Trail"
      title="Every agent decision, permanently on-chain"
      subtitle="A tamper-evident log of each compliance decision and risk score the AI CFO recorded for your wallet — sequenced so any gap is detectable, and each entry linked to its Mantle transaction."
      live={isComplianceDeployed}
    >
      {(address) => <AuditBody address={address} />}
    </SuiteShell>
  )
}

function AuditBody({ address }: { address: Address }) {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try { setEntries(await readAuditTrail(address)) } catch { setEntries([]) } finally { setLoading(false) }
  }, [address])
  useEffect(() => { load() }, [load])

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--rwa-text-muted)' }}>{entries.length} on-chain record{entries.length === 1 ? '' : 's'}</span>
        <button onClick={load} disabled={loading} style={ghostBtn}><RefreshCw size={15} /> Refresh</button>
      </div>

      {loading ? (
        <div style={{ ...suiteCard, display: 'flex', justifyContent: 'center', gap: 12, padding: 48 }}>
          <Loader2 size={20} className="kbx-spin" /> <span style={{ color: 'var(--rwa-text-muted)' }}>Reading on-chain events…</span>
        </div>
      ) : entries.length === 0 ? (
        <div style={{ ...suiteCard, textAlign: 'center', padding: 40 }}>
          <ScrollText size={28} color="rgba(255,255,255,0.3)" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 14, color: 'var(--rwa-text-muted)', margin: 0, lineHeight: 1.6 }}>
            {isComplianceDeployed
              ? 'No decisions recorded yet. Run a compliance check or anchor a risk score, and it will appear here with its Mantle tx.'
              : 'The compliance contract is not deployed yet — once it is, every agent decision and risk score lands here, verifiable on-chain.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {entries.map((e, i) => (
            <div key={`${e.txHash}-${i}`} style={{ ...suiteCard, padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: e.type === 'risk' ? 'rgba(63,154,115,0.12)' : e.allowed ? 'rgba(47,107,84,0.12)' : 'rgba(248,113,113,0.12)' }}>
                {e.type === 'risk' ? <Gauge size={18} color={PURPLE_C} /> : e.allowed ? <CheckCircle2 size={18} color={TEAL_C} /> : <XCircle size={18} color="#f87171" />}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{e.kind || 'DECISION'}</span>
                  {e.type === 'decision' && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 999, color: e.allowed ? TEAL_C : '#f87171', background: e.allowed ? 'rgba(47,107,84,0.12)' : 'rgba(248,113,113,0.12)' }}>
                      {e.allowed ? 'ALLOWED' : 'BLOCKED'}
                    </span>
                  )}
                  {e.seq > 0 && <span style={{ fontSize: 11, color: 'var(--rwa-text-muted)', fontFamily: 'var(--font-mono)' }}>#{e.seq}</span>}
                </div>
                <p style={{ fontSize: 13, color: 'var(--rwa-text-muted)', margin: '4px 0 0', lineHeight: 1.5 }}>{e.detail || '—'}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--rwa-text-muted)' }}>{e.timestamp ? new Date(e.timestamp * 1000).toLocaleString() : '—'}</span>
                  {e.txHash && (
                    <a href={explorerTx(e.txHash)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: TEAL_C, textDecoration: 'none' }}>
                      <ExternalLink size={12} /> {e.txHash.slice(0, 8)}…
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`.kbx-spin{animation:spinSlow 1s linear infinite}`}</style>
    </div>
  )
}

const ghostBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 10,
  cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff',
  background: 'var(--rwa-surface)', border: '1px solid rgba(255,255,255,0.12)',
}
