// Built by vsrupeshkumar
// POST /api/compliance/check { wallet, action, amountUsd, proposedMethPct, record }
// The AI COMPLIANCE GATE. Hard gates (KYC tier, jurisdiction screening, accredited
// threshold) are evaluated in CODE (lib/creditSuite/compliance) and can never be
// overridden by the model — exactly like the risk council's code-enforced veto. An
// LLM then judges mandate-fit and writes a plain-English rationale. When ?record is
// set and the agent key is configured, the decision is appended to the on-chain
// audit trail (RWAkinsCompliance.logDecision) and a Mantle tx hash is returned.
import { NextResponse } from 'next/server'
import type { Address } from 'viem'
import { readComplianceServer, serverLogDecision, canWriteCompliance } from '@/lib/rwa/serverSuite'
import { evaluateCompliance, type ComplianceAction } from '@/lib/creditSuite/compliance'
import { chatJson } from '@/lib/openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ACTIONS: ComplianceAction[] = ['deposit', 'rebalance', 'borrow', 'withdraw']

export async function POST(req: Request) {
  let body: { wallet?: string; action?: string; amountUsd?: number; proposedMethPct?: number; record?: boolean } = {}
  try { body = await req.json() } catch { /* empty body ok */ }
  const wallet = (body.wallet ?? '').trim()
  if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) return NextResponse.json({ error: 'INVALID_ADDRESS' }, { status: 400 })
  const user = wallet as Address
  const action: ComplianceAction = ACTIONS.includes(body.action as ComplianceAction) ? (body.action as ComplianceAction) : 'rebalance'

  const comp = await readComplianceServer(user).catch(() => ({ tier: 0, jurisdiction: '', mandate: '', decisionCount: 0, riskScore: 0, riskBand: 0 }))

  const verdict = evaluateCompliance({
    action,
    amountUsd: Number(body.amountUsd ?? 0),
    kycTier: comp.tier,
    jurisdiction: comp.jurisdiction,
    mandate: comp.mandate,
    proposedMethPct: typeof body.proposedMethPct === 'number' ? body.proposedMethPct : undefined,
  })

  // LLM mandate-fit rationale — advisory only; the hard-gate `allowed` is unchanged.
  const ai = await chatJson<{ rationale?: string }>({
    messages: [
      { role: 'system', content: 'You are a compliance officer for an on-chain RWA AI CFO. Given a proposed action, the user\'s on-chain mandate, KYC tier and jurisdiction, and the code-decided verdict, write ONE sentence (<180 chars) explaining whether the action respects the mandate and regulations. Respond ONLY as JSON {"rationale":string}.' },
      { role: 'user', content: JSON.stringify({ action, allowed: verdict.allowed, kycTier: comp.tier, jurisdiction: comp.jurisdiction, mandate: comp.mandate || '(none)', proposedMethPct: body.proposedMethPct ?? null }) },
    ],
    temperature: 0.2, maxTokens: 110, timeoutMs: 9000,
  }).catch(() => null)
  const rationale = ai?.rationale?.slice(0, 240) || (verdict.allowed ? 'Action clears all hard compliance gates.' : verdict.reasons[0] || 'Action blocked by a compliance gate.')

  let txHash: string | null = null
  let logged = false
  if (body.record && canWriteCompliance()) {
    txHash = await serverLogDecision(user, action.toUpperCase(), verdict.allowed, rationale).catch(() => null)
    logged = txHash != null
  }

  return NextResponse.json({
    ok: true,
    action,
    allowed: verdict.allowed,
    checks: verdict.checks,
    reasons: verdict.reasons,
    rationale,
    compliance: { tier: comp.tier, jurisdiction: comp.jurisdiction, mandate: comp.mandate },
    onChain: { canLog: canWriteCompliance(), logged, txHash },
  })
}
