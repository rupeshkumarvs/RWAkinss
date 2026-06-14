// Built by vsrupeshkumar
// GET /api/market/sentiment — live crypto Fear & Greed Index (0-100), keyless.
// An extra live market-regime signal for the agent / risk council. Read-only and
// additive; does not change any existing decision path.
import { NextResponse } from 'next/server'
import { fetchMarketSentiment } from '@/lib/api/sentiment'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const s = await fetchMarketSentiment()
    return NextResponse.json({
      ok: true,
      value: s.value,
      classification: s.classification,
      asOf: s.asOf,
      live: s.live,
      fetchedAt: Date.now(),
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'failed' }, { status: 500 })
  }
}
