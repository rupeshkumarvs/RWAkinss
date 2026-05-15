'use client'
import { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { useScore } from '@/lib/score-context'
import { generateScore, RISK_LABEL, RISK_COLOR } from '@/lib/api-client'
import { explorerTx, truncateAddress } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/GlassCard'
import { ArrowRight } from 'lucide-react'

export function ScoreGenerator() {
  const { address, isConnected, connect } = useWallet()
  const { score, setScore } = useScore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    if (!isConnected || !address) {
      await connect()
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await generateScore(address)
      setScore(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate score'
      setError(message)
      console.error('Score generation error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <GlassCard className="text-center p-8">
        <p className="text-muted-foreground mb-6">Connect your wallet to generate your credit score</p>
        <Button onClick={connect} variant="glow" size="lg">
          Connect Wallet
        </Button>
      </GlassCard>
    )
  }

  if (score) {
    return (
      <GlassCard className="p-8">
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-gradient mb-2">{score.score}</div>
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: RISK_COLOR[score.riskBand] + '20',
                color: RISK_COLOR[score.riskBand],
                border: `1px solid ${RISK_COLOR[score.riskBand]}40`
              }}
            >
              {RISK_LABEL[score.riskBand]}
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">AI Analysis</h3>
            <p className="text-sm">{score.explanation}</p>
          </div>

          {score.transactionHash && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">On-Chain Transaction</p>
              <a
                href={explorerTx(score.transactionHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {score.transactionHash.slice(0, 20)}...
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Regenerating...' : 'Regenerate Score'}
          </Button>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="text-center p-8">
      <div className="mb-6">
        <div className="text-5xl mb-4">📊</div>
        <h3 className="text-lg font-semibold mb-2">Your Credit Score</h3>
        <p className="text-sm text-muted-foreground">
          Wallet: {address ? truncateAddress(address) : 'Connected'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button
        onClick={handleGenerate}
        disabled={loading}
        variant="glow"
        size="lg"
        className="w-full"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating on QIE...
          </span>
        ) : (
          'Generate My Score'
        )}
      </Button>
    </GlassCard>
  )
}
