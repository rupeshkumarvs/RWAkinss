// Built by vsrupeshkumar
// GET /api/benchmark/treasury — the live REAL-WORLD risk-free rate (U.S. Treasury)
// that USDY tokenizes. Lets the app prove its on-chain treasury leg against the
// genuine off-chain instrument. Keyless by default (U.S. Treasury FiscalData);
// uses Federal Reserve FRED automatically if FRED_API_KEY is set.
import { NextResponse } from 'next/server'
import { fetchTreasuryBenchmark } from '@/lib/api/treasury'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const b = await fetchTreasuryBenchmark()
    return NextResponse.json({
      ok: true,
      tBillRate: b.tBillRate,
      tNoteRate: b.tNoteRate,
      asOf: b.asOf,
      source: b.source,
      live: b.live,
      fetchedAt: Date.now(),
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'failed' }, { status: 500 })
  }
}
