// Built by vsrupeshkumar
// GET/POST /api/risk/score?wallet=0x..&record=1 — the 5-dimension AI RISK engine.
// Reads the wallet's LIVE on-chain position + live market, scores it across five
// auditable dimensions (lib/creditSuite/risk), adds a one-line LLM commentary, and
// — when ?record=1 and the agent key is configured — ANCHORS the composite score
// on-chain via RWAkinsCompliance.recordRisk, returning a real Mantle tx hash. It
// never fabricates a hash: with no signer it returns the score with txHash null.
import { NextResponse } from 'next/server'
import type { Address } from 'viem'
import { formatEther } from 'viem'
import { getMarketData } from '@/lib/marketData'
import { readPortfolioServer, readMethPriceServer } from '@/lib/rwa/serverVault'
import { readLoanServer, serverRecordRisk, serverLogDecision, canWriteCompliance } from '@/lib/rwa/serverSuite'
import { scoreRisk } from '@/lib/creditSuite/risk'
import { chatJson } from '@/lib/openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const toNum = (b: bigint) => Number(formatEther(b))
const isWallet = (w: string) => /^0x[a-fA-F0-9]{40}$/.test(w)

async function handle(wallet: string, record: boolean) {
  if (!isWallet(wallet)) return NextResponse.json({ error: 'INVALID_ADDRESS' }, { status: 400 })
  const user = wallet as Address

  const [pos, methPrice, market, loan] = await Promise.all([
    readPortfolioServer(user).catch(() => ({ usdyBal: BigInt(0), methBal: BigInt(0), usdyBps: BigInt(0), methBps: BigInt(0) })),
    readMethPriceServer().catch(() => 0),
    getMarketData(),
    readLoanServer(user).catch(() => ({ active: false, ltvBps: 0 })),
  ])

  const methTokens = toNum(pos.methBal)
  const methValueUsd = methTokens * (methPrice || market.ethPrice || 0)
  const report = scoreRisk({
    methPct: Number(pos.methBps) / 100,
    methValueUsd,
    volatility: market.volatility,
    eth24hChange: market.eth24hChange,
    usdyApy: market.usdyApy,
    methApy: market.methApy,
    ltvBps: loan.ltvBps,
  })

  // LLM commentary cites the live numbers; falls back to the deterministic headline.
  const ai = await chatJson<{ commentary?: string }>({
    messages: [
      { role: 'system', content: 'You are the risk officer of an AI CFO managing a USDY/mETH RWA portfolio on Mantle. Given a 5-dimension risk breakdown, write ONE sentence (<160 chars) of plain-English commentary citing the actual numbers and the single biggest driver. Respond ONLY as JSON {"commentary":string}.' },
      { role: 'user', content: JSON.stringify({ composite: report.composite, band: report.bandLabel, dimensions: report.dimensions.map((d) => ({ k: d.label, s: d.score })) }) },
    ],
    temperature: 0.3, maxTokens: 90, timeoutMs: 9000,
  }).catch(() => null)
  const commentary = ai?.commentary?.slice(0, 220) || report.headline

  // Optional: anchor the score on-chain (agent key). Best-effort, never fabricated.
  let txHash: string | null = null
  let recorded = false
  if (record && canWriteCompliance()) {
    txHash = await serverRecordRisk(user, report.score1000, report.band).catch(() => null)
    if (txHash) {
      recorded = true
      await serverLogDecision(user, 'RISK', true, `Risk ${report.bandLabel} ${report.composite}/100`).catch(() => null)
    }
  }

  return NextResponse.json({
    ok: true,
    report,
    commentary,
    market: { usdyApy: market.usdyApy, methApy: market.methApy, eth24hChange: market.eth24hChange, volatility: market.volatility, yieldsLive: market.yieldsLive, marketLive: market.marketLive },
    onChain: { canRecord: canWriteCompliance(), recorded, txHash },
  })
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  return handle(url.searchParams.get('wallet') ?? '', url.searchParams.get('record') === '1')
}

export async function POST(req: Request) {
  let body: { wallet?: string; record?: boolean } = {}
  try { body = await req.json() } catch { /* empty body ok */ }
  return handle((body.wallet ?? '').trim(), body.record === true)
}
