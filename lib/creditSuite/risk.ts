// Built by vsrupeshkumar
// The 5-dimension RWA RISK ENGINE — deterministic, auditable scoring of a live
// USDY/mETH position. Every dimension is 0-100 (higher = riskier) and computed
// in code from real inputs, so the score can be defended line-by-line (the same
// "signal-then-code" discipline as lib/agent/brain). The AI route adds a natural
// language commentary on top, but never changes the numbers.
//
// Composite (0-100) maps to an on-chain record (score 0-1000, band 1-5) via
// RWAkinsCompliance.recordRisk, so the risk assessment is verifiable on Mantle.

export interface RiskInputs {
  methPct: number // current mETH allocation, 0-100
  methValueUsd: number // notional of the mETH leg, USD
  volatility: number // annualized ETH vol, percent
  eth24hChange: number // percent
  usdyApy: number // percent
  methApy: number // percent
  ltvBps: number // current loan LTV in bps (0 if no loan)
}

export interface RiskDimension {
  key: string
  label: string
  score: number // 0-100, higher = riskier
  weight: number // 0-1
  note: string
}

export interface RiskReport {
  dimensions: RiskDimension[]
  composite: number // 0-100
  score1000: number // 0-1000 (on-chain scale)
  band: number // 1-5
  bandLabel: string
  headline: string
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n))
const r1 = (n: number) => Math.round(n * 10) / 10

const BANDS = ['', 'Low', 'Moderate', 'Elevated', 'High', 'Critical']
export function riskBandFromComposite(c: number): { band: number; label: string } {
  const band = c < 20 ? 1 : c < 40 ? 2 : c < 60 ? 3 : c < 80 ? 4 : 5
  return { band, label: BANDS[band] }
}

/** The deterministic 5-dimension engine. */
export function scoreRisk(i: RiskInputs): RiskReport {
  // 1. Concentration — exposure to the volatile leg vs the 70% on-chain cap.
  const concentration = clamp((i.methPct / 70) * 100)
  // 2. Market / volatility — realized vol, with a kicker for a sharp drawdown.
  const drawdownKick = i.eth24hChange < 0 ? Math.min(20, Math.abs(i.eth24hChange) * 2) : 0
  const market = clamp((i.volatility / 45) * 100 + drawdownKick)
  // 3. Liquidity — exit-slippage risk scales with the size of the mETH notional.
  const liquidity = clamp((i.methValueUsd / 40_000) * 100)
  // 4. Leverage — distance of the live LTV from the 83% liquidation line.
  const leverage = clamp((i.ltvBps / 8300) * 100)
  // 5. Yield sustainability — is the mETH leg compensating for its extra risk?
  //    Penalty grows when USDY out-yields mETH while you still hold the risk.
  const sustainability = clamp(40 + (i.usdyApy - i.methApy) * 9 + (i.volatility - 18) * 0.8)

  const dimensions: RiskDimension[] = [
    { key: 'concentration', label: 'Concentration', score: r1(concentration), weight: 0.28, note: `${r1(i.methPct)}% in mETH vs the 70% cap` },
    { key: 'market', label: 'Market / Volatility', score: r1(market), weight: 0.26, note: `ETH vol ${r1(i.volatility)}%, 24h ${i.eth24hChange >= 0 ? '+' : ''}${r1(i.eth24hChange)}%` },
    { key: 'liquidity', label: 'Liquidity', score: r1(liquidity), weight: 0.16, note: `$${Math.round(i.methValueUsd).toLocaleString()} mETH exit size` },
    { key: 'leverage', label: 'Leverage', score: r1(leverage), weight: 0.18, note: i.ltvBps > 0 ? `LTV ${r1(i.ltvBps / 100)}% vs 83% liq line` : 'no active loan' },
    { key: 'sustainability', label: 'Yield Sustainability', score: r1(sustainability), weight: 0.12, note: `mETH ${r1(i.methApy)}% vs USDY ${r1(i.usdyApy)}%` },
  ]

  const composite = clamp(dimensions.reduce((s, d) => s + d.score * d.weight, 0))
  const { band, label } = riskBandFromComposite(composite)
  const top = [...dimensions].sort((a, b) => b.score * b.weight - a.score * a.weight)[0]

  return {
    dimensions,
    composite: r1(composite),
    score1000: Math.round(composite * 10),
    band,
    bandLabel: label,
    headline: `${label} risk (${Math.round(composite)}/100) — ${top.label.toLowerCase()} is the dominant driver.`,
  }
}
