// Built by vsrupeshkumar
// The AI LENDING-TERMS ENGINE. Given a borrower's credit score, the live max LTV
// their passport unlocks, the collateral they're posting, and the current risk
// picture, it negotiates a fair, bounded set of loan terms: APR, max LTV, and a
// safe suggested borrow. The contract independently re-checks KYC + LTV on-chain,
// so this engine proposes — it can never override the hard safety rails.

export interface TermsInputs {
  creditScore: number // 300-900 (0 = no passport)
  maxLtvBps: number // unlocked by the passport, read from the lending contract
  collateralValueUsd: number // USDY value of the posted collateral
  riskComposite: number // 0-100 from the risk engine
}

export interface LoanTerms {
  aprBps: number // bounded to [300, 3000]
  maxLtvBps: number
  suggestedBorrowUsd: number
  rationale: string
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
const APR_FLOOR = 300 // 3%
const APR_CEIL = 3000 // 30% (mirrors RWAkinsLending.MAX_APR_BPS)

/** Mirror of RWAkinsLending.maxLtvBps — the LTV a credit score unlocks. Used to
 *  show the unlocked LTV before the lending contract is deployed (and as a check). */
export function maxLtvBpsFromScore(score: number): number {
  if (score === 0) return 3000
  if (score < 580) return 4000
  if (score < 670) return 5000
  if (score < 740) return 6000
  if (score < 800) return 7000
  return 8000
}

/** Deterministic terms: credit lowers APR, risk raises it; borrow is LTV-capped. */
export function negotiateTerms(i: TermsInputs): LoanTerms {
  // Credit-priced base APR: a 900 score → ~6%, a 300 score → ~24%, 0 → ~18%.
  const scoreForPricing = i.creditScore > 0 ? i.creditScore : 500
  const creditApr = 1800 - (scoreForPricing - 500) * 3
  // Risk premium: up to +5% for a maxed-out risk composite.
  const riskPremium = i.riskComposite * 5
  const aprBps = Math.round(clamp(creditApr + riskPremium, APR_FLOOR, APR_CEIL))

  // Suggested borrow sits at 90% of the unlocked LTV for a safety buffer.
  const suggestedBorrowUsd = (i.collateralValueUsd * i.maxLtvBps * 0.9) / 10_000

  const rationale =
    `${(i.maxLtvBps / 100).toFixed(0)}% LTV unlocked by a ${i.creditScore || '—'} credit score; ` +
    `${(aprBps / 100).toFixed(1)}% APR priced off credit and a ${Math.round(i.riskComposite)}/100 risk read.`

  return { aprBps, maxLtvBps: i.maxLtvBps, suggestedBorrowUsd: Math.max(0, suggestedBorrowUsd), rationale }
}
