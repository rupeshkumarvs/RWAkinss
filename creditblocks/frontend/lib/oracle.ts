// QIE/USD price oracle with realistic fluctuation
import { API_BASE } from './constants'

let currentPrice = 0.0847

export async function fetchQiePrice(): Promise<number> {
  const change = (Math.random() - 0.5) * 0.002
  currentPrice = Math.max(0.001, currentPrice + change)

  try {
    const res = await fetch(`${API_BASE}/api/oracle-price`, {
      signal: AbortSignal.timeout(3000),
    })
    if (res.ok) {
      const data = await res.json()
      if (data.price) return data.price
    }
  } catch {}

  return Number(currentPrice.toFixed(6))
}

export function formatUsd(amount: number, price: number): string {
  return `$${(amount * price).toFixed(2)}`
}

export function formatQie(amount: string | number): string {
  const n = Number(amount)
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`
  return n.toFixed(4)
}
