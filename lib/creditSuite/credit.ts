// Built by vsrupeshkumar
// The on-chain CREDIT-SCORING ENGINE — deterministic, FICO-like (300-900) scoring
// from REAL on-chain signals. The result is written to the soulbound
// RWAkinsCreditPassport, where the lending market reads it to set a borrower's LTV.
// Every point of the score is attributable to a factor below, so it is auditable
// rather than a black box.

export interface CreditInputs {
  amountUsd: number // total vault value under management (USD)
  methPct: number // current mETH allocation, 0-100
  kycTier: number // 0 none · 1 retail · 2 accredited · 3 institutional
  decisionCount: number // agent decisions logged on-chain (track record depth)
  loanActive: boolean
  loanLtvBps: number // current LTV if a loan is active
  liquidated: boolean // ever liquidated
}

export interface CreditFactor {
  label: string
  points: number // signed contribution
  detail: string
}

export interface CreditReport {
  score: number // 300-900
  band: number // 1-5
  bandLabel: string
  factors: CreditFactor[]
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
const BANDS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

export function creditBandFromScore(s: number): { band: number; label: string } {
  const band = s < 580 ? 1 : s < 670 ? 2 : s < 740 ? 3 : s < 800 ? 4 : 5
  return { band, label: BANDS[band] }
}

/** Deterministic credit score from on-chain behaviour. */
export function scoreCredit(i: CreditInputs): CreditReport {
  const factors: CreditFactor[] = []
  let score = 500 // neutral base
  factors.push({ label: 'Base score', points: 0, detail: 'Everyone starts at 500' })

  // Assets under management — log-scaled so it rewards real capital without runaway.
  const aum = i.amountUsd > 0 ? clamp(Math.round(Math.log10(i.amountUsd + 1) * 38), 0, 150) : 0
  score += aum
  factors.push({ label: 'Assets under management', points: aum, detail: `$${Math.round(i.amountUsd).toLocaleString()} in the vault` })

  // KYC tier — verified identity is a strong creditworthiness signal.
  const kyc = [0, 20, 50, 80][i.kycTier] ?? 0
  score += kyc
  factors.push({ label: 'KYC verification', points: kyc, detail: ['Unverified', 'Retail KYC', 'Accredited', 'Institutional'][i.kycTier] ?? 'Unverified' })

  // Allocation discipline — staying well within the risk cap is prudent.
  const discipline = i.methPct <= 50 ? 40 : i.methPct <= 70 ? 20 : -20
  score += discipline
  factors.push({ label: 'Allocation discipline', points: discipline, detail: `${Math.round(i.methPct)}% mETH exposure` })

  // Track record — depth of verifiable on-chain agent history.
  const track = clamp(i.decisionCount * 8, 0, 90)
  score += track
  factors.push({ label: 'On-chain track record', points: track, detail: `${i.decisionCount} recorded agent decisions` })

  // Loan health — a healthy live loan helps; being liquidated hurts badly.
  if (i.liquidated) {
    score -= 120
    factors.push({ label: 'Liquidation history', points: -120, detail: 'A past liquidation event' })
  } else if (i.loanActive) {
    const healthy = i.loanLtvBps < 6000
    const pts = healthy ? 30 : -40
    score += pts
    factors.push({ label: 'Active loan health', points: pts, detail: `LTV ${Math.round(i.loanLtvBps / 100)}%` })
  }

  score = clamp(Math.round(score), 300, 900)
  const { band, label } = creditBandFromScore(score)
  return { score, band, bandLabel: label, factors }
}
