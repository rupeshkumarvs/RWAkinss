// Global Zustand store for all app state
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ScoreResponse } from './api-client'

export interface StakingPosition {
  amount: string
  lockPeriod: number
  startDate: number
  unlockDate: number
  apy: number
  boost: number
}

export interface LoanRecord {
  id: string
  amount: string
  collateral: string
  apr: string
  term: number
  status: 'active' | 'repaid' | 'defaulted'
  startDate: number
  txHash?: string
}

export interface StakingTier {
  name: string
  minNcrd: number
  maxNcrd: number
  boost: number
  apy: number
  color: string
}

export const STAKING_TIERS: StakingTier[] = [
  { name: 'None', minNcrd: 0, maxNcrd: 99, boost: 0, apy: 0, color: '#666' },
  { name: 'Bronze', minNcrd: 100, maxNcrd: 999, boost: 5, apy: 8, color: '#CD7F32' },
  { name: 'Silver', minNcrd: 1000, maxNcrd: 4999, boost: 10, apy: 12, color: '#C0C0C0' },
  { name: 'Gold', minNcrd: 5000, maxNcrd: 9999, boost: 15, apy: 18, color: '#FFD700' },
  { name: 'Platinum', minNcrd: 10000, maxNcrd: Infinity, boost: 25, apy: 25, color: '#E5E4E2' },
]

export function getStakingTier(ncrdStaked: number): StakingTier {
  return STAKING_TIERS.find((t) => ncrdStaked >= t.minNcrd && ncrdStaked <= t.maxNcrd) ?? STAKING_TIERS[0]
}

export function getLoanTerms(score: number) {
  if (score < 300) return null
  if (score < 500) return { apr: 25, collateralRatio: 50, maxLoan: 1000, tier: 'Fair' }
  if (score < 700) return { apr: 18, collateralRatio: 40, maxLoan: 5000, tier: 'Good' }
  if (score < 850) return { apr: 12, collateralRatio: 30, maxLoan: 15000, tier: 'Very Good' }
  return { apr: 6, collateralRatio: 20, maxLoan: 50000, tier: 'Excellent' }
}

export function getScoreTier(score: number): { label: string; color: string } {
  if (score < 300) return { label: 'Poor', color: '#EF4444' }
  if (score < 500) return { label: 'Fair', color: '#F97316' }
  if (score < 700) return { label: 'Good', color: '#EAB308' }
  if (score < 850) return { label: 'Very Good', color: '#3B82F6' }
  return { label: 'Excellent', color: '#4ADE80' }
}

interface AppStore {
  score: ScoreResponse | null
  setScore: (s: ScoreResponse | null) => void

  stakedNcrd: number
  setStakedNcrd: (n: number) => void
  stakingPositions: StakingPosition[]
  addStakingPosition: (p: StakingPosition) => void

  loans: LoanRecord[]
  addLoan: (l: LoanRecord) => void

  qieUsdPrice: number
  setQieUsdPrice: (p: number) => void
  lastPriceUpdate: number
  setLastPriceUpdate: (t: number) => void

  ncrdBalance: string
  setNcrdBalance: (b: string) => void

  qieBalance: string
  setQieBalance: (b: string) => void

  scoreHistory: { date: number; score: number }[]
  addScoreHistory: (s: number) => void

  isDemoMode: boolean
  setDemoMode: (b: boolean) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      score: null,
      setScore: (s) => {
        set({ score: s })
        if (s) get().addScoreHistory(s.score)
      },

      stakedNcrd: 0,
      setStakedNcrd: (n) => set({ stakedNcrd: n }),
      stakingPositions: [],
      addStakingPosition: (p) => set((s) => ({ stakingPositions: [...s.stakingPositions, p] })),

      loans: [],
      addLoan: (l) => set((s) => ({ loans: [...s.loans, l] })),

      qieUsdPrice: 0.0847,
      setQieUsdPrice: (p) => set({ qieUsdPrice: p }),
      lastPriceUpdate: 0,
      setLastPriceUpdate: (t) => set({ lastPriceUpdate: t }),

      ncrdBalance: '0',
      setNcrdBalance: (b) => set({ ncrdBalance: b }),

      qieBalance: '0',
      setQieBalance: (b) => set({ qieBalance: b }),

      scoreHistory: [],
      addScoreHistory: (s) =>
        set((st) => ({
          scoreHistory: [...st.scoreHistory, { date: Date.now(), score: s }].slice(-20),
        })),

      isDemoMode: false,
      setDemoMode: (b) => set({ isDemoMode: b }),
    }),
    {
      name: 'creditblocks-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        score: s.score,
        stakedNcrd: s.stakedNcrd,
        stakingPositions: s.stakingPositions,
        loans: s.loans,
        scoreHistory: s.scoreHistory,
        isDemoMode: s.isDemoMode,
      }) as any,
    }
  )
)
