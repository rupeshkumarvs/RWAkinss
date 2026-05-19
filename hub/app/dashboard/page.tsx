'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const GOLD = '#F5C518'
const BG = '#080808'
const CARD = 'rgba(255,255,255,0.03)'
const BORDER = 'rgba(255,255,255,0.07)'
const MONO = '"Fira Code","JetBrains Mono",monospace'

/* ── Tool definitions ─────────────────────────────────── */
const TOOLS = [
  {
    icon: '◈', name: 'NeuroCredit', tagline: 'AI Credit Scoring',
    href: '/credit', color: '#06b6d4',
    chain: 'QIE', chainColor: '#F5A623',
    desc: 'Generate your on-chain credit score as a soulbound NFT. DeFi protocols read it with a single contract call.',
    stat: '742', statLabel: 'Avg Score', badge: 'Identity',
  },
  {
    icon: '⬟', name: 'EternaVault', tagline: 'Encrypted Inheritance',
    href: '/legacy', color: '#f43f5e',
    chain: 'QIE', chainColor: '#F5A623',
    desc: 'Store critical files with AES-GCM encryption. Heirs unlock access on-chain after validator attestation.',
    stat: '256-bit', statLabel: 'Encryption', badge: 'Security',
  },
  {
    icon: '⬡', name: 'TrustMesh', tagline: 'AI Agent Coordination',
    href: '/agents', color: '#6366f1',
    chain: 'Solana', chainColor: '#9945FF',
    desc: 'Deploy AI agents with verified on-chain identities. Every delegation is Ed25519 signed and logged.',
    stat: '7', statLabel: 'Active Agents', badge: 'AI',
  },
  {
    icon: '🔐', name: 'CipherVault', tagline: 'Cross-Chain Privacy',
    href: '/vault', color: '#14b8a6',
    chain: 'Multi', chainColor: '#06B6D4',
    desc: 'Trade assets across chains with complete privacy. Zero transaction metadata exposed to observers.',
    stat: '94%', statLabel: 'Privacy Score', badge: 'Privacy',
  },
  {
    icon: '◆', name: 'SyncSplit', tagline: 'On-Chain Bill Splitting',
    href: '/split', color: '#3b82f6',
    chain: 'Stellar', chainColor: '#3B82F6',
    desc: 'Split bills via Soroban smart contracts. Multi-wallet support with automatic settlement on full payment.',
    stat: 'Soroban', statLabel: 'Protocol', badge: 'Payments',
  },
  {
    icon: '◎', name: 'Lendora', tagline: 'DeFi Loan Negotiation',
    href: '/lend', color: '#f59e0b',
    chain: 'ETH L2', chainColor: '#6366F1',
    desc: 'AI agents negotiate loan terms in natural language. Zero-knowledge credit verification, L2 settlement.',
    stat: '4.2%', statLabel: 'Avg APR', badge: 'DeFi',
  },
  {
    icon: '◇', name: 'PalmFlow AI', tagline: 'Autonomous Treasury',
    href: '/treasury', color: '#10b981',
    chain: 'Solana', chainColor: '#9945FF',
    desc: 'AI agents manage your treasury, stream payroll per-second, enforce governance and optimize yield.',
    stat: '$1.2M+', statLabel: 'Managed', badge: 'Treasury',
  },
  {
    icon: '▲', name: 'ShadowLedger', tagline: 'Invisible Operations',
    href: '/shadow', color: '#8b5cf6',
    chain: 'Solana', chainColor: '#9945FF',
    desc: 'Run your entire financial org invisibly on-chain. Seven specialized AI agents, fully autonomous.',
    stat: '7', statLabel: 'AI Agents', badge: 'Enterprise',
  },
]

/* ── Network stats ────────────────────────────────────── */
const NET_STATS = [
  { label: 'Tools', value: 8, suffix: '', color: GOLD },
  { label: 'Chains', value: 4, suffix: '', color: '#06b6d4' },
  { label: 'Agents Active', value: 14, suffix: '', color: '#6366f1' },
  { label: 'Uptime', value: 99.9, suffix: '%', color: '#10b981' },
]

/* ── Activity pool ────────────────────────────────────── */
const ACTIVITY_POOL = [
  { tool: 'PalmFlow AI', icon: '◇', color: '#10b981', action: 'Treasury rebalanced', detail: '+$12,400 yield captured', time: 'just now' },
  { tool: 'TrustMesh', icon: '⬡', color: '#6366f1', action: 'Agent "Sentinel" deployed', detail: 'Ed25519 identity registered on-chain', time: '1m ago' },
  { tool: 'NeuroCredit', icon: '◈', color: '#06b6d4', action: 'Score minted as NFT', detail: 'Score: 742 → soulbound on QIE', time: '2m ago' },
  { tool: 'SyncSplit', icon: '◆', color: '#3b82f6', action: 'Bill settled', detail: '3 participants · 100 XLM', time: '4m ago' },
  { tool: 'Lendora', icon: '◎', color: '#f59e0b', action: 'Loan negotiated', detail: '$5,000 · 4.2% APR · 90 days', time: '6m ago' },
  { tool: 'CipherVault', icon: '🔐', color: '#14b8a6', action: 'Private swap executed', detail: 'wBTC → USDC · privacy score 94', time: '8m ago' },
  { tool: 'EternaVault', icon: '⬟', color: '#f43f5e', action: 'Vault encrypted', detail: 'AES-GCM · 4 heirs configured', time: '11m ago' },
  { tool: 'ShadowLedger', icon: '▲', color: '#8b5cf6', action: 'CFO agent acted', detail: 'Risk: no anomalies detected', time: '13m ago' },
  { tool: 'PalmFlow AI', icon: '◇', color: '#10b981', action: 'Payroll streamed', detail: '0.42 SOL/sec to 3 recipients', time: '15m ago' },
  { tool: 'NeuroCredit', icon: '◈', color: '#06b6d4', action: 'Credit check passed', detail: 'Protocol Lendora approved 850', time: '18m ago' },
]

/* ── Feature highlights ────────────────────────────────── */
const HIGHLIGHTS = [
  { icon: '🤖', title: 'AI-Powered Everything', desc: 'From credit scoring to treasury management — AI runs every tool automatically.' },
  { icon: '🔗', title: 'Four Chains, One Dashboard', desc: 'QIE · Solana · Stellar · ETH L2 accessible from a single unified interface.' },
  { icon: '🔒', title: 'Zero-Knowledge Privacy', desc: 'Complete financial privacy without sacrificing auditability or compliance.' },
  { icon: '⚡', title: 'Real-Time Settlement', desc: 'Payments stream per-second, swaps settle instantly, agents act autonomously.' },
]

/* ── Animated counter ─────────────────────────────────── */
function useCountUp(target: number, active: boolean) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!active) return
    let raf: number
    const t0 = performance.now()
    const dur = 1200
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setV(+(eased * target).toFixed(1))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, target])
  return v
}

function StatCard({ stat }: { stat: typeof NET_STATS[0] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const val = useCountUp(stat.value, active)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(true) }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} style={{
      background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '20px 24px',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: MONO }}>
        {stat.label}
      </div>
      <div style={{ fontSize: 36, fontWeight: 900, color: stat.color, fontFamily: MONO, lineHeight: 1 }}>
        {val}{stat.suffix}
      </div>
    </div>
  )
}

/* ── Tool card ────────────────────────────────────────── */
function ToolCard({ tool }: { tool: typeof TOOLS[0] }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.18 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={tool.href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        <div style={{
          background: CARD,
          border: `1px solid ${hovered ? tool.color + '50' : BORDER}`,
          borderRadius: 16,
          padding: 20,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          cursor: 'pointer',
          transition: 'border-color 0.2s',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Glow on hover */}
          {hovered && (
            <div style={{
              position: 'absolute', top: -40, right: -40,
              width: 120, height: 120, borderRadius: '50%',
              background: `radial-gradient(circle, ${tool.color}20, transparent 70%)`,
              pointerEvents: 'none',
            }} />
          )}

          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `${tool.color}20`,
              display: 'grid', placeItems: 'center',
              fontSize: 20, color: tool.color,
            }}>{tool.icon}</div>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', padding: '3px 8px',
              borderRadius: 999, background: `${tool.color}20`, color: tool.color,
            }}>{tool.badge}</span>
          </div>

          {/* Name + tagline */}
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{tool.name}</div>
            <div style={{ fontSize: 11, color: tool.color, marginTop: 2, fontWeight: 600 }}>{tool.tagline}</div>
          </div>

          {/* Desc */}
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.55, margin: 0, flex: 1 }}>
            {tool.desc}
          </p>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: tool.color, fontFamily: MONO, lineHeight: 1 }}>{tool.stat}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 1, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{tool.statLabel}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                padding: '3px 9px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                background: `${tool.chainColor}20`, color: tool.chainColor,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: tool.chainColor }} />
                {tool.chain}
              </span>
              <span style={{ fontSize: 16, color: hovered ? tool.color : 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }}>→</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/* ── Activity feed ────────────────────────────────────── */
function ActivityFeed({ items }: { items: typeof ACTIVITY_POOL }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Live Activity</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 10, color: '#86EFAC', fontFamily: MONO }}>real-time</span>
        </div>
      </div>
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '12px 20px',
            borderBottom: i < items.length - 1 ? `1px solid rgba(255,255,255,0.03)` : 'none',
          }}>
            <span style={{
              width: 32, height: 32, borderRadius: 8,
              background: `${item.color}20`, display: 'grid',
              placeItems: 'center', fontSize: 14, color: item.color, flexShrink: 0,
            }}>{item.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: item.color }}>{item.tool}</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: MONO }}>{item.time}</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{item.action}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{item.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Main page ────────────────────────────────────────── */
export default function DashboardPage() {
  const [activity, setActivity] = useState(ACTIVITY_POOL.slice(0, 6))
  const [ticker, setTicker] = useState(847_234)
  const poolIdx = useRef(6)

  /* Live ticker */
  useEffect(() => {
    const id = setInterval(() => setTicker(v => v + Math.floor(Math.random() * 3)), 2800)
    return () => clearInterval(id)
  }, [])

  /* Auto-append activity */
  useEffect(() => {
    const id = setInterval(() => {
      const next = ACTIVITY_POOL[poolIdx.current % ACTIVITY_POOL.length]
      const fresh = { ...next, time: 'just now' }
      setActivity(prev => [fresh, ...prev.slice(0, 9)])
      poolIdx.current++
    }, 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ background: BG, minHeight: '100vh', padding: '24px', color: '#fff', fontFamily: '"Inter",system-ui,sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, color: GOLD, fontFamily: MONO, letterSpacing: '0.12em', marginBottom: 6 }}>
          KUBRYX / DASHBOARD
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em' }}>
              Financial OS
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              Eight tools · Four chains · One platform
            </p>
          </div>
          {/* Live transaction counter */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 16px', borderRadius: 12,
            background: `${GOLD}12`, border: `1px solid ${GOLD}30`,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: GOLD }} />
            <div>
              <div style={{ fontSize: 9, color: GOLD, fontFamily: MONO, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Platform Txns</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', fontFamily: MONO, lineHeight: 1 }}>
                {ticker.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Network stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {NET_STATS.map(s => <StatCard key={s.label} stat={s} />)}
      </div>

      {/* Tool cards grid */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14, fontFamily: MONO }}>
          All Tools
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {TOOLS.map(tool => <ToolCard key={tool.href} tool={tool} />)}
        </div>
      </div>

      {/* Activity + Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16, alignItems: 'start' }}>

        {/* Activity feed */}
        <ActivityFeed items={activity} />

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Chain status */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Chain Status</div>
            {[
              { name: 'QIE Mainnet', id: '1990', color: '#F5A623', tools: 'NeuroCredit · EternaVault' },
              { name: 'Solana', id: 'Mainnet', color: '#9945FF', tools: 'TrustMesh · PalmFlow · Shadow' },
              { name: 'Stellar', id: 'Soroban', color: '#3B82F6', tools: 'SyncSplit' },
              { name: 'ETH L2', id: 'Arbitrum', color: '#6366F1', tools: 'CipherVault · Lendora' },
            ].map(c => (
              <div key={c.name} style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
                padding: '10px 12px', borderRadius: 10,
                background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.04)`,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{c.tools}</div>
                </div>
                <span style={{ fontSize: 9, fontFamily: MONO, color: c.color, background: `${c.color}15`, padding: '2px 7px', borderRadius: 6 }}>{c.id}</span>
              </div>
            ))}
          </div>

          {/* Feature highlights */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Platform Highlights</div>
            {HIGHLIGHTS.map(h => (
              <div key={h.title} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <span style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: `${GOLD}18`, display: 'grid', placeItems: 'center',
                  fontSize: 16,
                }}>{h.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{h.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.45 }}>{h.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick launch */}
          <div style={{ background: `${GOLD}10`, border: `1px solid ${GOLD}25`, borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 14 }}>Quick Launch</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Split a bill', href: '/split', icon: '◆', color: '#3b82f6' },
                { label: 'Check credit score', href: '/credit', icon: '◈', color: '#06b6d4' },
                { label: 'View treasury', href: '/treasury/dashboard', icon: '◇', color: '#10b981' },
                { label: 'Deploy AI agent', href: '/agents', icon: '⬡', color: '#6366f1' },
              ].map(q => (
                <Link key={q.href} href={q.href} style={{
                  textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`,
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = q.color + '50'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = BORDER}
                >
                  <span style={{ fontSize: 14, color: q.color }}>{q.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', flex: 1 }}>{q.label}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
