// All backend API calls. No component calls fetch() directly.
import { API_BASE } from './constants'

export interface ScoreResponse {
  address: string
  score: number
  riskBand: 1 | 2 | 3
  explanation: string
  transactionHash: string
}

export interface ChatResponse {
  reply: string
  response?: string // Some responses use this field instead
  loanTerms?: {
    amount?: string
    rate?: string
    duration?: string
    collateral?: string
  }
  transactionHash?: string
}

export interface HealthResponse {
  status: string
}

export const RISK_LABEL: Record<number, string> = {
  1: 'LOW RISK',
  2: 'MEDIUM RISK',
  3: 'HIGH RISK',
}

export const RISK_COLOR: Record<number, string> = {
  1: '#10B981',
  2: '#F59E0B',
  3: '#EF4444',
}

async function post<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`${path} failed (${res.status}): ${errorText}`)
  }

  return res.json()
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`${path} failed (${res.status}): ${errorText}`)
  }

  return res.json()
}

// Generate a new credit score (calls backend which submits mintOrUpdate to chain)
export const generateScore = (address: string): Promise<ScoreResponse> =>
  post<ScoreResponse>('/api/score', { address })

// Look up existing score from chain
export const lookupScore = (address: string): Promise<ScoreResponse> =>
  get<ScoreResponse>(`/api/score/${address}`)

// Chat with Q-Loan AI
export const chat = (message: string, address: string): Promise<ChatResponse> =>
  post<ChatResponse>('/api/chat', { message, address })

// Health check for backend
export const healthCheck = (): Promise<HealthResponse> =>
  get<HealthResponse>('/health')
