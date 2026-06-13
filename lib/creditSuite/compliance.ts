// Built by vsrupeshkumar
// The COMPLIANCE EVALUATION ENGINE. Like the risk-council veto, the HARD gates
// live in code and can never be talked around by the model: a regulated RWA
// action requires the right KYC tier and a non-sanctioned jurisdiction. The AI
// route adds a mandate-fit judgement on top (does this move respect the policy
// the user committed to on-chain?), but a failed hard gate is always a block.

export type ComplianceAction = 'deposit' | 'rebalance' | 'borrow' | 'withdraw'

export interface ComplianceInputs {
  action: ComplianceAction
  amountUsd: number
  kycTier: number // 0 none · 1 retail · 2 accredited · 3 institutional
  jurisdiction: string // ISO alpha-3, e.g. "USA"
  mandate: string // the user's on-chain investment mandate (plain English)
  proposedMethPct?: number // for rebalances
}

export interface ComplianceCheck {
  label: string
  pass: boolean
  detail: string
  hard: boolean // a hard gate (code-enforced) vs a soft/advisory signal
}

export interface ComplianceVerdict {
  allowed: boolean
  checks: ComplianceCheck[]
  reasons: string[]
}

// OFAC-style sanctioned jurisdictions — a regulated RWA flow must screen these.
const SANCTIONED = new Set(['PRK', 'IRN', 'SYR', 'CUB', 'RUS'])
// Actions that require accredited (tier ≥ 2) status above a size threshold.
const ACCREDITED_THRESHOLD_USD = 10_000

/** Deterministic hard-gate evaluation. The AI route may append mandate-fit notes. */
export function evaluateCompliance(i: ComplianceInputs): ComplianceVerdict {
  const checks: ComplianceCheck[] = []
  const reasons: string[] = []

  // Hard gate 1 — KYC presence.
  const kycOk = i.kycTier >= 1
  checks.push({ label: 'KYC verification', pass: kycOk, hard: true, detail: kycOk ? `Tier ${i.kycTier} verified` : 'No KYC attestation on-chain' })
  if (!kycOk) reasons.push('Wallet is not KYC-verified — required for any regulated RWA action.')

  // Hard gate 2 — jurisdiction screening.
  const juris = (i.jurisdiction || '').toUpperCase()
  const jurisOk = juris.length > 0 && !SANCTIONED.has(juris)
  checks.push({ label: 'Jurisdiction screening', pass: jurisOk, hard: true, detail: juris ? (jurisOk ? `${juris} permitted` : `${juris} is sanctioned`) : 'No jurisdiction on file' })
  if (!jurisOk) reasons.push(juris ? `Jurisdiction ${juris} is sanctioned.` : 'No jurisdiction recorded on the KYC attestation.')

  // Hard gate 3 — accreditation for size-sensitive actions.
  const needsAccredited = (i.action === 'borrow' || i.action === 'deposit') && i.amountUsd >= ACCREDITED_THRESHOLD_USD
  const accreditedOk = !needsAccredited || i.kycTier >= 2
  checks.push({
    label: 'Accreditation threshold',
    pass: accreditedOk,
    hard: true,
    detail: needsAccredited ? (accreditedOk ? 'Accredited tier satisfied' : `Tier ≥ 2 required above $${ACCREDITED_THRESHOLD_USD.toLocaleString()}`) : 'Below accreditation threshold',
  })
  if (!accreditedOk) reasons.push(`Action over $${ACCREDITED_THRESHOLD_USD.toLocaleString()} needs accredited (tier ≥ 2) status.`)

  // Soft signal — mandate fit (deterministic keyword pass; AI refines in the route).
  const m = (i.mandate || '').toLowerCase()
  let mandateOk = true
  let mandateDetail = i.mandate ? 'Within stated mandate' : 'No mandate recorded (advisory)'
  if (m) {
    if (i.action === 'borrow' && /(no leverage|no borrow|unleveraged|debt-free)/.test(m)) {
      mandateOk = false
      mandateDetail = 'Mandate prohibits leverage/borrowing'
    } else if (i.action === 'rebalance' && i.proposedMethPct != null && i.proposedMethPct > 50 && /(preserve capital|capital preservation|conservative|low risk|safety)/.test(m)) {
      mandateOk = false
      mandateDetail = `Mandate favors preservation; ${Math.round(i.proposedMethPct)}% mETH is aggressive`
    }
  }
  checks.push({ label: 'Investment mandate fit', pass: mandateOk, hard: false, detail: mandateDetail })
  if (!mandateOk) reasons.push(mandateDetail + '.')

  // Allowed only when every HARD gate passes (soft signals are advisory).
  const allowed = checks.filter((c) => c.hard).every((c) => c.pass)
  return { allowed, checks, reasons }
}
