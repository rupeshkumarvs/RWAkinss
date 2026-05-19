'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { loadWallet, persistWallet } from '@/lib/wallet-utils'

type PhantomProvider = { isPhantom?: boolean; connect: () => Promise<{ publicKey: { toString: () => string } }> }

const TEAL = '#00E5CC'
const BG = '#06060e'
const MONO = '"JetBrains Mono","Fira Code",monospace'

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI Payment Routing',
    desc: '7 specialized AI agents optimize every transaction for cost, speed, and privacy.',
    detail: 'Automatic multi-hop routing, slippage protection, 23% avg gas savings',
    color: '#A855F7',
    gradient: 'rgba(168,85,247,0.08)',
  },
  {
    icon: '💼',
    title: 'Treasury Management',
    desc: 'Real-time portfolio view across all blockchains and wallets.',
    detail: 'Asset allocation, yield tracking, risk analysis, predictive simulations',
    color: '#00E5CC',
    gradient: 'rgba(0,229,204,0.08)',
  },
  {
    icon: '🔄',
    title: 'Seamless Swaps',
    desc: 'Multi-chain DEX integration with intelligent route optimization.',
    detail: 'Raydium, Jupiter, Orca, Uniswap — instant price quotes',
    color: '#60A5FA',
    gradient: 'rgba(96,165,250,0.08)',
  },
  {
    icon: '⚡',
    title: 'Automated Payments',
    desc: 'Recurring payments, payroll, and scheduled transfers on autopilot.',
    detail: 'Daily/weekly/monthly schedules, batch payments, multi-recipient',
    color: '#22C55E',
    gradient: 'rgba(34,197,94,0.08)',
  },
]

const STATS = [
  { label: 'Treasury Managed', value: '$1.2M+' },
  { label: 'AI Agents Online', value: '7' },
  { label: 'Chains Supported', value: '8+' },
  { label: 'Gas Saved (Avg)', value: '23%' },
]

const SUPPORTED = [
  { name:'Solana',   symbol:'SOL',   color:'#A855F7' },
  { name:'Ethereum', symbol:'ETH',   color:'#60A5FA' },
  { name:'Arbitrum', symbol:'ARB',   color:'#06B6D4' },
  { name:'Polygon',  symbol:'MATIC', color:'#8B5CF6' },
  { name:'Base',     symbol:'BASE',  color:'#3B82F6' },
  { name:'Optimism', symbol:'OP',    color:'#EF4444' },
]

function short(addr: string) {
  return addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr
}

export default function TreasuryLanding() {
  const [wallet, setWallet] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const saved = loadWallet('solana')
    if (saved) setWallet(saved)
  }, [])

  /* particle canvas background */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    type Particle = { x: number; y: number; vx: number; vy: number; r: number; alpha: number }
    const particles: Particle[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
    }))

    let raf: number
    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,229,204,${p.alpha})`
        ctx.fill()
      })
      /* draw connections */
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dx = a.x - b.x, dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(0,229,204,${0.08 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  async function connectWallet() {
    try {
      const phantom = (window as any).solana as PhantomProvider | undefined
      if (phantom?.isPhantom) {
        const res = await phantom.connect()
        const addr = res.publicKey.toString()
        setWallet(addr)
        persistWallet('solana', addr)
        toast.success('Phantom connected')
        return
      }
      const metamask = (window as any).ethereum
      if (metamask) {
        const accounts: string[] = await metamask.request({ method: 'eth_requestAccounts' })
        if (accounts[0]) {
          setWallet(accounts[0])
          persistWallet('solana', accounts[0])
          toast.success('MetaMask connected')
          return
        }
      }
      toast.error('No wallet detected. Install Phantom or MetaMask.')
    } catch (e: any) {
      toast.error(e?.message || 'Wallet connection failed')
    }
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', color: '#fff', fontFamily: '"Inter",system-ui,sans-serif', position: 'relative', overflow: 'hidden' }}>

      {/* Animated particle canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />

      {/* Gradient blobs */}
      <div style={{ position: 'absolute', top: -200, left: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,229,204,0.05) 0%, transparent 70%)', pointerEvents:'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: 100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)', pointerEvents:'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Hero */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, border: '1px solid rgba(0,229,204,0.3)', background: 'rgba(0,229,204,0.06)', marginBottom: 28 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: TEAL, display: 'inline-block' }} />
              <span style={{ fontSize: 11, color: TEAL, fontFamily: MONO, letterSpacing: '0.08em' }}>7 AI AGENTS ONLINE · MULTI-CHAIN READY</span>
            </div>

            <h1 style={{ fontSize: 'clamp(32px,5vw,62px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.02em' }}>
              Run Your Organization's<br />
              <span style={{ background: `linear-gradient(135deg, ${TEAL}, #A855F7)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Finances Invisibly On-Chain
              </span>
            </h1>

            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7 }}>
              AI agents manage payments, optimize routing, and execute treasury operations autonomously.
              PalmFlow AI — the Autonomous Financial Operating System for DAOs and enterprises.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={connectWallet}
                style={{ padding: '14px 28px', borderRadius: 12, border: `1px solid ${TEAL}`, background: `linear-gradient(135deg, rgba(0,229,204,0.2), rgba(0,229,204,0.06))`, color: TEAL, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                🔌 {wallet ? short(wallet) : 'Connect Wallet'}
              </motion.button>
              <Link href="/treasury/dashboard">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ padding: '14px 28px', borderRadius: 12, border: '1px solid rgba(245,197,24,0.4)', background: 'rgba(245,197,24,0.06)', color: '#F5C518', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  📊 View Dashboard
                </motion.button>
              </Link>
              <Link href="/treasury/dashboard">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ padding: '14px 28px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  🎯 Try Demo
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 56, flexWrap: 'wrap' }}
          >
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: TEAL, fontFamily: MONO }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Feature Cards */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 60px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 * i + 0.4, duration: 0.5 }}
                style={{ background: f.gradient, border: `1px solid ${f.color}22`, borderRadius: 16, padding: '24px', cursor: 'default' }}
              >
                <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: f.color, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 10 }}>{f.desc}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{f.detail}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Supported Chains */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 60px' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Multi-Chain Support</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {SUPPORTED.map(c => (
              <div key={c.name} style={{ padding: '8px 18px', borderRadius: 20, border: `1px solid ${c.color}33`, background: `${c.color}0a`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, display: 'inline-block' }} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{c.name}</span>
                <span style={{ fontSize: 10, color: c.color, fontFamily: MONO }}>{c.symbol}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: TEAL, fontFamily: MONO, letterSpacing: '0.08em', marginBottom: 12 }}>GET STARTED</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>Ready to automate your treasury?</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 32 }}>
              Connect your wallet and let AI agents manage your finances autonomously.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { href:'/treasury/dashboard', label:'📊 Dashboard',  color: TEAL },
                { href:'/treasury/send',      label:'💸 Send',       color:'#22C55E' },
                { href:'/treasury/receive',   label:'📥 Receive',    color:'#60A5FA' },
                { href:'/treasury/swap',      label:'🔄 Swap',       color:'#A855F7' },
                { href:'/treasury/analytics', label:'📉 Analytics',  color:'#F59E0B' },
              ].map(a => (
                <Link key={a.href} href={a.href}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    style={{ padding: '10px 20px', borderRadius: 10, border: `1px solid ${a.color}44`, background: `${a.color}0f`, color: a.color, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    {a.label}
                  </motion.button>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Footer note */}
        <div style={{ textAlign: 'center', padding: '0 24px 40px', fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
          PalmFlow AI is a production-ready financial OS. Connect your wallet to start managing treasury operations.
          All operations are non-custodial — your keys, your funds.
        </div>
      </div>
    </div>
  )
}
