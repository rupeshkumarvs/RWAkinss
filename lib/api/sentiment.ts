// Built by vsrupeshkumar
// Live crypto market sentiment — the Fear & Greed Index (0-100) from alternative.me.
// KEYLESS, free, no rate-limit risk. It gives the agent / risk council one more
// genuinely live market-regime signal to cite ("sentiment 74/Greed → trim mETH"),
// complementing the realized volatility we already compute. Additive and read-only;
// it does not change any existing decision path. Cached 30 min; degrades to
// live:false if the source is briefly unreachable.
const FNG_URL = 'https://api.alternative.me/fng/?limit=1'
const CACHE_TTL = 30 * 60_000 // 30 minutes

export interface MarketSentiment {
  /** Fear & Greed Index value, 0 (extreme fear) – 100 (extreme greed), or null. */
  value: number | null
  /** Human label, e.g. "Fear", "Neutral", "Greed". */
  classification: string | null
  /** Observation time (ms epoch) reported by the source. */
  asOf: number | null
  /** True when the source answered (not a reused/empty fallback). */
  live: boolean
}

let cache: { data: MarketSentiment; ts: number } | null = null

/** Fetch the live crypto Fear & Greed Index. */
export async function fetchMarketSentiment(): Promise<MarketSentiment> {
  if (cache && Date.now() - cache.ts < CACHE_TTL) return cache.data
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 5000)
    const res = await fetch(FNG_URL, { headers: { accept: 'application/json' }, signal: ctrl.signal }).finally(
      () => clearTimeout(t),
    )
    if (!res.ok) throw new Error(`fng ${res.status}`)
    const json = (await res.json()) as {
      data?: { value?: string; value_classification?: string; timestamp?: string }[]
    }
    const row = json.data?.[0]
    const value = row?.value != null ? Number(row.value) : NaN
    if (!row || !Number.isFinite(value)) throw new Error('no fng data')

    const data: MarketSentiment = {
      value,
      classification: row.value_classification ?? null,
      asOf: row.timestamp != null ? Number(row.timestamp) * 1000 : null,
      live: true,
    }
    cache = { data, ts: Date.now() }
    return data
  } catch {
    if (cache) return cache.data
    return { value: null, classification: null, asOf: null, live: false }
  }
}
