// Built by vsrupeshkumar
// GET /api/compliance/sanctions?address=0x... — live OFAC-SDN screening via the
// Chainalysis on-chain Sanctions Oracle (keyless, the same screen real
// institutions use). Additive and read-only: it reports a verdict for display
// alongside the compliance suite and does NOT gate or alter any existing flow.
import { NextResponse } from 'next/server'
import { screenAddress } from '@/lib/api/sanctions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const address = new URL(req.url).searchParams.get('address')?.trim() ?? ''
  if (!address) {
    return NextResponse.json({ ok: false, error: 'missing ?address' }, { status: 400 })
  }
  try {
    const r = await screenAddress(address)
    return NextResponse.json({
      ok: true,
      address: r.address,
      sanctioned: r.sanctioned,
      source: r.source,
      oracle: r.oracle,
      live: r.live,
      checkedAt: r.checkedAt,
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'failed' }, { status: 500 })
  }
}
