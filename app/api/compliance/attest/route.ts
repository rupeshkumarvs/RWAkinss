// Built by vsrupeshkumar
// POST /api/compliance/attest { wallet, jurisdiction, accredited, institutional }
// The on-chain KYC GATE writer. This models a licensed verifier: it screens the
// declared jurisdiction (sanctioned → denied in CODE), assigns a KYC tier, and —
// when the verifier/attestor key is configured — issues the attestation on-chain
// via RWAkinsCompliance.attestKYC, returning a Mantle tx hash. The deposit and
// lending flows read isVerified() before allowing a regulated RWA action, so this
// is the gate that actually unlocks the protocol. No signer → simulated:true.
import { NextResponse } from 'next/server'
import type { Address } from 'viem'
import { serverAttestKYC, serverLogDecision, canWriteCompliance } from '@/lib/rwa/serverSuite'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// OFAC-style sanctioned jurisdictions — screened before any attestation is issued.
const SANCTIONED = new Set(['PRK', 'IRN', 'SYR', 'CUB', 'RUS'])

export async function POST(req: Request) {
  let body: { wallet?: string; jurisdiction?: string; accredited?: boolean; institutional?: boolean } = {}
  try { body = await req.json() } catch { /* empty body ok */ }
  const wallet = (body.wallet ?? '').trim()
  if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) return NextResponse.json({ error: 'INVALID_ADDRESS' }, { status: 400 })
  const user = wallet as Address
  const jurisdiction = (body.jurisdiction || '').toUpperCase().slice(0, 3)

  // Hard gate — jurisdiction screening (code-enforced).
  if (!jurisdiction || jurisdiction.length < 2) {
    return NextResponse.json({ ok: true, approved: false, reason: 'A valid ISO jurisdiction (e.g. USA, SGP) is required.' })
  }
  if (SANCTIONED.has(jurisdiction)) {
    return NextResponse.json({ ok: true, approved: false, reason: `Jurisdiction ${jurisdiction} is sanctioned — cannot be verified.` })
  }

  // Tier assignment from declared status.
  const tier = body.institutional ? 3 : body.accredited ? 2 : 1
  const tierLabel = ['', 'Retail KYC', 'Accredited', 'Institutional'][tier]

  let txHash: string | null = null
  if (canWriteCompliance()) {
    txHash = await serverAttestKYC(user, tier, jurisdiction, 0).catch(() => null)
    if (txHash) await serverLogDecision(user, 'KYC', true, `${tierLabel} verified · ${jurisdiction}`).catch(() => null)
  }

  return NextResponse.json({
    ok: true,
    approved: true,
    tier,
    tierLabel,
    jurisdiction,
    onChain: { canAttest: canWriteCompliance(), attested: txHash != null, txHash },
    simulated: txHash == null,
  })
}
