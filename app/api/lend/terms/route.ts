// Built by vsrupeshkumar
// POST /api/lend/terms { wallet, collateralAsset, collateralAmount } — the AI loan
// TERMS engine. It reads the borrower's on-chain credit score + live position +
// market, prices a fair APR and the LTV their passport unlocks (lib/creditSuite/
// lend), and returns a safe suggested borrow. The RWAkinsLending contract re-checks
// KYC + LTV on-chain when the user opens the loan, so this only ever proposes — the
// hard rails are enforced in the contract. Returns the aprBps the page passes to
// openLoan(); no on-chain write happens here.
import { NextResponse } from 'next/server'
import type { Address } from 'viem'
import { formatEther } from 'viem'
import { getMarketData } from '@/lib/marketData'
import { readPortfolioServer, readMethPriceServer } from '@/lib/rwa/serverVault'
import { readCreditServer, readLoanServer } from '@/lib/rwa/serverSuite'
import { scoreRisk } from '@/lib/creditSuite/risk'
import { negotiateTerms, maxLtvBpsFromScore } from '@/lib/creditSuite/lend'
import { chatJson } from '@/lib/openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const toNum = (b: bigint) => Number(formatEther(b))

export async function POST(req: Request) {
  let body: { wallet?: string; collateralAsset?: 'usdy' | 'meth'; collateralAmount?: number } = {}
  try { body = await req.json() } catch { /* empty body ok */ }
  const wallet = (body.wallet ?? '').trim()
  if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) return NextResponse.json({ error: 'INVALID_ADDRESS' }, { status: 400 })
  const user = wallet as Address
  const collateralAsset = body.collateralAsset === 'meth' ? 'meth' : 'usdy'
  const collateralAmount = Math.max(0, Number(body.collateralAmount ?? 0))

  const [credit, pos, methPrice, market, loan] = await Promise.all([
    readCreditServer(user).catch(() => ({ exists: false, score: 0, band: 0 })),
    readPortfolioServer(user).catch(() => ({ usdyBal: BigInt(0), methBal: BigInt(0), usdyBps: BigInt(0), methBps: BigInt(0) })),
    readMethPriceServer().catch(() => 0),
    getMarketData(),
    readLoanServer(user).catch(() => ({ active: false, ltvBps: 0 })),
  ])

  const collateralValueUsd = collateralAsset === 'usdy' ? collateralAmount : collateralAmount * (methPrice || 0)
  const risk = scoreRisk({
    methPct: Number(pos.methBps) / 100,
    methValueUsd: toNum(pos.methBal) * (methPrice || 0),
    volatility: market.volatility,
    eth24hChange: market.eth24hChange,
    usdyApy: market.usdyApy,
    methApy: market.methApy,
    ltvBps: loan.ltvBps,
  })

  const maxLtvBps = maxLtvBpsFromScore(credit.score)
  const terms = negotiateTerms({ creditScore: credit.score, maxLtvBps, collateralValueUsd, riskComposite: risk.composite })

  // LLM negotiation note in the borrower's language; falls back to the rationale.
  const ai = await chatJson<{ note?: string }>({
    messages: [
      { role: 'system', content: 'You are an AI loan officer for an on-chain RWA lender on Mantle. Given the proposed terms, write ONE friendly sentence (<160 chars) explaining the APR and LTV to the borrower, citing their credit score. Respond ONLY as JSON {"note":string}.' },
      { role: 'user', content: JSON.stringify({ creditScore: credit.score, aprPct: terms.aprBps / 100, maxLtvPct: maxLtvBps / 100, suggestedBorrow: Math.round(terms.suggestedBorrowUsd) }) },
    ],
    temperature: 0.3, maxTokens: 90, timeoutMs: 9000,
  }).catch(() => null)
  const note = ai?.note?.slice(0, 220) || terms.rationale

  return NextResponse.json({
    ok: true,
    creditScore: credit.score,
    hasPassport: credit.exists,
    collateralAsset,
    collateralValueUsd,
    terms: { aprBps: terms.aprBps, aprPct: terms.aprBps / 100, maxLtvBps, maxLtvPct: maxLtvBps / 100, suggestedBorrowUsd: terms.suggestedBorrowUsd },
    risk: { composite: risk.composite, band: risk.bandLabel },
    note,
  })
}
