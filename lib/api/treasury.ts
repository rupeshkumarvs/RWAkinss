// Built by vsrupeshkumar
// Live REAL-WORLD risk-free benchmark — the actual U.S. Treasury rate that USDY
// (Ondo's tokenized US T-bills) tracks. This is the strongest possible RWA anchor:
// it lets the app compare its on-chain USDY leg against the genuine off-chain
// instrument it represents, sourced from official government data.
//
// Two sources, both pure-positive:
//   • Default (KEYLESS): U.S. Treasury FiscalData API — official .gov, no key, no
//     cost, no rate-limit risk in a demo. Monthly "Average Interest Rates".
//   • Optional (FRED_API_KEY): Federal Reserve FRED — daily constant-maturity
//     yields (DGS3MO / DGS2), fresher and higher-resolution if a key is present.
//
// Nothing is hardcoded; if both sources are briefly unreachable the last good
// value is reused, else `live:false` is returned so the caller can degrade.
const FISCALDATA_BASE =
  'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates'
const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations'
const CACHE_TTL = 60 * 60_000 // 60 minutes — Treasury rates move slowly

export interface TreasuryBenchmark {
  /** Short-end risk-free rate in percent — the USDY proxy (3-month bill). */
  tBillRate: number | null
  /** A longer-tenor point (2-year note) in percent, for a 2-point curve. */
  tNoteRate: number | null
  /** Effective date of the underlying observation (ISO date string). */
  asOf: string | null
  /** Which upstream answered: 'fred' (daily, keyed) or 'fiscaldata' (monthly, keyless). */
  source: 'fred' | 'fiscaldata' | null
  /** True when at least one rate came back live (not a reused/empty fallback). */
  live: boolean
}

let cache: { data: TreasuryBenchmark; ts: number } | null = null

async function getJson(url: string, timeoutMs: number): Promise<unknown> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  const res = await fetch(url, { headers: { accept: 'application/json' }, signal: ctrl.signal }).finally(() =>
    clearTimeout(t),
  )
  if (!res.ok) throw new Error(`${new URL(url).host} ${res.status}`)
  return res.json()
}

/** FRED: latest valid (non-".") observation for a constant-maturity series. */
async function fredLatest(seriesId: string, key: string): Promise<{ value: number; date: string } | null> {
  const url =
    `${FRED_BASE}?series_id=${seriesId}&api_key=${key}&file_type=json` +
    `&sort_order=desc&limit=8`
  const json = (await getJson(url, 6000)) as { observations?: { date: string; value: string }[] }
  for (const o of json.observations ?? []) {
    const v = Number(o.value)
    if (Number.isFinite(v) && o.value !== '.') return { value: v, date: o.date }
  }
  return null
}

/** FiscalData: most recent monthly average interest rate for a security_desc. */
async function fiscalLatest(securityDesc: string): Promise<{ value: number; date: string } | null> {
  const url =
    `${FISCALDATA_BASE}?filter=security_desc:eq:${encodeURIComponent(securityDesc)}` +
    `&sort=-record_date&page[size]=1&fields=record_date,avg_interest_rate_amt`
  const json = (await getJson(url, 6000)) as {
    data?: { record_date: string; avg_interest_rate_amt: string }[]
  }
  const row = json.data?.[0]
  if (!row) return null
  const v = Number(row.avg_interest_rate_amt)
  return Number.isFinite(v) ? { value: v, date: row.record_date } : null
}

/**
 * Fetch the live real-world risk-free benchmark. Prefers FRED when FRED_API_KEY
 * is set (daily resolution); otherwise uses the keyless Treasury FiscalData API.
 */
export async function fetchTreasuryBenchmark(): Promise<TreasuryBenchmark> {
  if (cache && Date.now() - cache.ts < CACHE_TTL) return cache.data

  const fredKey = process.env.FRED_API_KEY
  try {
    if (fredKey) {
      const [bill, note] = await Promise.all([
        fredLatest('DGS3MO', fredKey).catch(() => null),
        fredLatest('DGS2', fredKey).catch(() => null),
      ])
      if (bill || note) {
        const data: TreasuryBenchmark = {
          tBillRate: bill?.value ?? null,
          tNoteRate: note?.value ?? null,
          asOf: bill?.date ?? note?.date ?? null,
          source: 'fred',
          live: true,
        }
        cache = { data, ts: Date.now() }
        return data
      }
    }

    // Keyless default — official U.S. Treasury data.
    const [bill, note] = await Promise.all([
      fiscalLatest('Treasury Bills').catch(() => null),
      fiscalLatest('Treasury Notes').catch(() => null),
    ])
    if (bill || note) {
      const data: TreasuryBenchmark = {
        tBillRate: bill?.value ?? null,
        tNoteRate: note?.value ?? null,
        asOf: bill?.date ?? note?.date ?? null,
        source: 'fiscaldata',
        live: true,
      }
      cache = { data, ts: Date.now() }
      return data
    }
    throw new Error('no treasury data')
  } catch {
    if (cache) return cache.data
    return { tBillRate: null, tNoteRate: null, asOf: null, source: null, live: false }
  }
}
