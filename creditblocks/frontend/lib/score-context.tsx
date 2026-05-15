'use client'
import { createContext, useContext, useState, type ReactNode } from 'react'
import type { ScoreResponse } from './api-client'

interface ScoreContextType {
  score: ScoreResponse | null
  setScore: (s: ScoreResponse | null) => void
}

const ScoreContext = createContext<ScoreContextType | undefined>(undefined)

export function ScoreProvider({ children }: { children: ReactNode }) {
  const [score, setScore] = useState<ScoreResponse | null>(null)

  return (
    <ScoreContext.Provider value={{ score, setScore }}>
      {children}
    </ScoreContext.Provider>
  )
}

export function useScore() {
  const context = useContext(ScoreContext)
  if (!context) {
    throw new Error('useScore must be used within a ScoreProvider')
  }
  return context
}
