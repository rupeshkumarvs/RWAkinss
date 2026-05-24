// Built by vsrupeshkumar
'use client'

import { useEffect, useRef, useState } from 'react'
import { FALLBACK_ACTIVITY_FEED, type FeedItem } from '@/lib/dashboard-fallbacks'
import type { DashboardStats } from '@/lib/api/dashboard'

const STAMPS = ['just now', '4s ago', '12s ago', '24s ago', '38s ago', '1m ago', '2m ago', '3m ago', '4m ago', '5m ago']

function buildLiveFeed(stats: DashboardStats): FeedItem[] {
  const items: FeedItem[] = []

  // One event per backend health result
  for (const backend of stats.backends) {
    items.push({
      id: `backend-${backend.name}`,
      protocol: backend.name,
      protocolColor: backend.isLive ? '#10b981' : '#ef4444',
      action: backend.isLive ? 'Health check passed' : 'Backend offline',
      detail: backend.isLive ? 'Responding normally' : 'Connection failed',
      address: backend.url.replace('https://', '').replace('/health', ''),
      timestamp: 'just now',
      type: 'deploy',
    })
  }

  // Solana slot event
  if (stats.solanaSlot > 0) {
    items.push({
      id: 'solana-slot',
      protocol: 'Solana Devnet',
      protocolColor: '#9945ff',
      action: 'Slot confirmed',
      detail: `Slot #${stats.solanaSlot.toLocaleString()}`,
      address: 'api.devnet.solana.com',
      timestamp: 'just now',
      type: 'swap',
    })
  }

  // Stellar balance event
  if (stats.stellarIsLive) {
    items.push({
      id: 'stellar-balance',
      protocol: 'Stellar Testnet',
      protocolColor: '#06b6d4',
      action: 'Account balance fetched',
      detail: `${parseFloat(stats.stellarBalance).toFixed(2)} XLM`,
      address: 'horizon-testnet.stellar.org',
      timestamp: 'just now',
      type: 'deposit',
    })
  }

  // Price events
  if (stats.prices.eth > 0) {
    items.push({
      id: 'price-eth',
      protocol: 'CoinGecko',
      protocolColor: '#6366f1',
      action: 'ETH price updated',
      detail: `$${stats.prices.eth.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      address: 'api.coingecko.com',
      timestamp: 'just now',
      type: 'swap',
    })
  }

  if (stats.prices.sol > 0) {
    items.push({
      id: 'price-sol',
      protocol: 'CoinGecko',
      protocolColor: '#6366f1',
      action: 'SOL price updated',
      detail: `$${stats.prices.sol.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      address: 'api.coingecko.com',
      timestamp: 'just now',
      type: 'swap',
    })
  }

  if (stats.prices.arb > 0) {
    items.push({
      id: 'price-arb',
      protocol: 'CoinGecko',
      protocolColor: '#6366f1',
      action: 'ARB price updated',
      detail: `$${stats.prices.arb.toLocaleString(undefined, { maximumFractionDigits: 4 })}`,
      address: 'api.coingecko.com',
      timestamp: 'just now',
      type: 'swap',
    })
  }

  return items.slice(0, 10)
}

export function useDashboardActivity(stats?: DashboardStats | null) {
  const initialFeed = stats ? buildLiveFeed(stats) : FALLBACK_ACTIVITY_FEED
  const [feed, setFeed] = useState<FeedItem[]>(initialFeed)
  const counter = useRef(0)

  // Rebuild feed when fresh stats arrive
  useEffect(() => {
    if (!stats) return
    setFeed(buildLiveFeed(stats).map((item, i) => ({
      ...item,
      timestamp: i === 0 ? 'just now' : STAMPS[Math.min(i, STAMPS.length - 1)],
    })))
  }, [stats])

  // Rotate the feed every 5 seconds to keep it feeling live
  useEffect(() => {
    const interval = setInterval(() => {
      setFeed(prev => {
        const last = prev[prev.length - 1]
        const rest = prev.slice(0, -1)
        counter.current += 1
        const fresh: FeedItem = { ...last, id: `${last.id}-${counter.current}`, timestamp: 'just now' }
        return [fresh, ...rest].map((item, i) => ({
          ...item,
          timestamp: i === 0 ? 'just now' : STAMPS[Math.min(i, STAMPS.length - 1)],
        }))
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return { feed }
}
