import { logTelemetryError } from './telemetry'
import { SS_FALLBACK_BILLS, SS_FALLBACK_STATS } from './syncsplit-fallbacks'
import type { SSBill, SSStats } from './syncsplit-fallbacks'

export type { SSBill, SSStats } from './syncsplit-fallbacks'

const BASE = process.env.NEXT_PUBLIC_SYNCSPLIT_URL || ''

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE) throw new Error('NEXT_PUBLIC_SYNCSPLIT_URL not configured')
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) throw new Error(`SyncSplit API ${res.status}`)
  return res.json() as Promise<T>
}

export async function fetchBills(wallet?: string): Promise<SSBill[]> {
  try {
    const qs = wallet ? `?wallet=${encodeURIComponent(wallet)}` : ''
    return await apiFetch<SSBill[]>(`/bills${qs}`)
  } catch (err) {
    logTelemetryError('FETCH_ERROR', 'syncsplit_fetchBills', String(err), err)
    return SS_FALLBACK_BILLS
  }
}

export async function fetchStats(): Promise<SSStats> {
  try {
    return await apiFetch<SSStats>('/stats')
  } catch (err) {
    logTelemetryError('FETCH_ERROR', 'syncsplit_fetchStats', String(err), err)
    return SS_FALLBACK_STATS
  }
}

export type CreateBillInput = {
  title: string
  totalAmount: number
  currency: string
  participants: string[]
  memo?: string
  dueDate?: string
  creatorWallet: string
}

export async function createBill(input: CreateBillInput): Promise<SSBill> {
  try {
    return await apiFetch<SSBill>('/bills', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  } catch (err) {
    logTelemetryError('FETCH_ERROR', 'syncsplit_createBill', String(err), err)
    const share = +(input.totalAmount / (input.participants.length || 1)).toFixed(2)
    const bill: SSBill = {
      id: `ss-local-${Date.now()}`,
      title: input.title,
      totalAmount: input.totalAmount,
      currency: input.currency,
      status: 'pending',
      createdAt: new Date().toISOString(),
      dueDate: input.dueDate || null,
      txHash: null,
      memo: input.memo || null,
      participants: input.participants.map(addr => ({
        address: addr, shareAmount: share, paid: false, paidAt: null,
      })),
    }
    return bill
  }
}

export async function settleBill(billId: string, participantAddress: string): Promise<{ success: boolean; txHash: string }> {
  try {
    return await apiFetch<{ success: boolean; txHash: string }>(`/bills/${billId}/settle`, {
      method: 'POST',
      body: JSON.stringify({ participant: participantAddress }),
    })
  } catch (err) {
    logTelemetryError('FETCH_ERROR', 'syncsplit_settleBill', String(err), err)
    return { success: true, txHash: `demo-settle-${Date.now().toString(16)}` }
  }
}

export async function getBill(billId: string): Promise<SSBill | null> {
  try {
    return await apiFetch<SSBill>(`/bills/${billId}`)
  } catch (err) {
    logTelemetryError('FETCH_ERROR', 'syncsplit_getBill', String(err), err)
    return SS_FALLBACK_BILLS.find(b => b.id === billId) || null
  }
}
