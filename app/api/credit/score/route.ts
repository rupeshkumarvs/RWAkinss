// Built by vsrupeshkumar
// POST /api/credit/score { wallet } — the on-chain AI CREDIT engine. It reads the
// wallet's REAL on-chain signals (vault value, allocation discipline, KYC tier,
// recorded agent-decision history, live loan health), computes a 300-900 score
// (lib/creditSuite/credit), and — when the scorer key is configured — WRITES it to
// the soulbound RWAkinsCreditPassport, returning the Mantle tx hash. The lending
// market then reads that score to set the borrower's LTV. No signer → it returns
// the computed score with txHash null (the page can still show the simulated card).
import { NextResponse } from 'next/server'
import type { Address } from 'viem'
import { formatEther } from 'viem'
import { readPortfolioServer, readMethPriceServer } from '@/lib/rwa/serverVault'
import { readComplianceServer, readLoanServer, serverSetCredit, serverLogDecision, canWriteCredit } from '@/lib/rwa/serverSuite'
import { scoreCredit } from '@/lib/creditSuite/credit'
import { chatJson } from '@/lib/openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const toNum = (b: bigint) => Number(formatEther(b))

export async function POST(req: Request) {
  let body: { wallet?: string } = {}
  try { body = await req.json() } catch { /* empty body ok */ }
  const wallet = (body.wallet ?? '').trim()
  if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) return NextResponse.json({ error: 'INVALID_ADDRESS' }, { status: 400 })
  const user = wallet as Address

  const [pos, methPrice, comp, loan] = await Promise.all([
    readPortfolioServer(user).catch(() => ({ usdyBal: BigInt(0), methBal: BigInt(0), usdyBps: BigInt(0), methBps: BigInt(0) })),
    readMethPriceServer().catch(() => 0),
    readComplianceServer(user).catch(() => ({ tier: 0, jurisdiction: '', mandate: '', decisionCount: 0, riskScore: 0, riskBand: 0 })),
    readLoanServer(user).catch(() => ({ active: false, ltvBps: 0 })),
  ])

  const amountUsd = toNum(pos.usdyBal) + toNum(pos.methBal) * (methPrice || 0)
  const report = scoreCredit({
    amountUsd,
    methPct: Number(pos.methBps) / 100,
    kycTier: comp.tier,
    decisionCount: comp.decisionCount,
    loanActive: loan.active,
    loanLtvBps: loan.ltvBps,
    liquidated: false,
  })

  // LLM explanation of the score in lender's terms; falls back to the top factor.
  const ai = await chatJson<{ summary?: string }>({
    messages: [
      { role: 'system', content: 'You are a credit analyst for an on-chain RWA lender. Given a credit score and its factors, write ONE sentence (<160 chars) explaining the score to the borrower in plain English, citing the biggest factor. Respond ONLY as JSON {"summary":string}.' },
      { role: 'user', content: JSON.stringify({ score: report.score, band: report.bandLabel, factors: report.factors.map((f) => ({ l: f.label, p: f.points })) }) },
    ],
    temperature: 0.3, maxTokens: 90, timeoutMs: 9000,
  }).catch(() => null)
  const summary = ai?.summary?.slice(0, 220) || `${report.bandLabel} credit (${report.score}) — driven by ${report.factors.slice().sort((a, b) => b.points - a.points)[0].label.toLowerCase()}.`

  let txHash: string | null = null
  let written = false
  if (canWriteCredit()) {
    txHash = await serverSetCredit(user, report.score, report.band).catch(() => null)
    if (txHash) {
      written = true
      await serverLogDecision(user, 'CREDIT', true, `Credit ${report.score} (${report.bandLabel})`).catch(() => null)
    }
  }

  return NextResponse.json({ ok: true, report, summary, onChain: { canWrite: canWriteCredit(), written, txHash } })
}
