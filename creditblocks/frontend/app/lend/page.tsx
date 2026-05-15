'use client'
import { useState } from 'react'
import { useWallet } from '@/app/contexts/WalletContext'
import { notify }    from '@/lib/toast'

interface ChatMessage {
  role: 'user' | 'ai'
  content: string
  timestamp: number
}

interface LoanTerms {
  amount: string
  rate: string
  duration: string
  collateral: string
  status: 'proposed' | 'accepted' | 'rejected'
}

export default function LendPage() {
  const { isConnected, connect } = useWallet()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      content: 'Welcome to Lendora AI. I\'m your DeFi lending negotiator powered by zero-knowledge proofs. What loan terms are you looking for?',
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loanTerms, setLoanTerms] = useState<LoanTerms>({
    amount: '5000',
    rate: '8.5',
    duration: '90 days',
    collateral: '1.5 ETH',
    status: 'proposed',
  })

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    }

    setMessages(m => [...m, userMessage])
    setInput('')
    setLoading(true)

    // Simulate AI response
    await new Promise(r => setTimeout(r, 1500))
    
    const responses = [
      'I\'ve optimized your loan terms for the lowest APR. Your ZK credit score of 847 qualifies you for a 7.2% rate on $5000 for 90 days with 1.2 ETH collateral.',
      'Your crypto portfolio shows strong collateralization. I recommend increasing your loan amount to $7500 to achieve better capital efficiency.',
      'Settlement will happen on Ethereum L2 with finality in ~30 seconds. Do you want to proceed with these terms?',
      'Perfect! I\'ve proposed these terms on-chain. Lender acceptance is typically instant.',
    ]

    const aiResponse: ChatMessage = {
      role: 'ai',
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: Date.now(),
    }

    setMessages(m => [...m, aiResponse])
    setLoading(false)
  }

  async function handleAcceptTerms() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    setLoanTerms(t => ({ ...t, status: 'accepted' }))
    setLoading(false)
    notify.success('Loan terms accepted! Settlement on Ethereum L2 in progress...')
  }

  const MODULE_HEADER = (
    <div style={{
      borderBottom: '1px solid rgba(99,102,241,0.15)',
      padding: '20px 32px',
      display: 'flex', alignItems: 'center', gap: 16,
      background: '#0A0A0A',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: 'rgba(99,102,241,0.1)',
        border: '1px solid rgba(99,102,241,0.2)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 18,
        color: '#6366F1',
      }}>◎</div>
      <div>
        <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 18, fontWeight: 700, color: '#FFF' }}>
          Lendora AI
        </h2>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'Satoshi, sans-serif' }}>
          ZK-Powered DeFi Lending · Ethereum L2 Settlement
        </p>
      </div>
      <div style={{ marginLeft: 'auto' }}>
        <span style={{
          padding: '4px 12px', borderRadius: 999,
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.2)',
          color: '#6366F1', fontSize: 11, fontWeight: 700,
          fontFamily: 'Satoshi, sans-serif',
        }}>
          ETH L2
        </span>
      </div>
    </div>
  )

  if (!isConnected) return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      {MODULE_HEADER}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 130px)', gap: 20, padding: 24 }}>
        <div style={{ fontSize: 48 }}>◎</div>
        <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 28, fontWeight: 700, color: '#FFF', textAlign: 'center' }}>
          Lendora AI
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', textAlign: 'center', maxWidth: 420, fontFamily: 'Satoshi, sans-serif', lineHeight: 1.7 }}>
          Connect your wallet to access AI-powered DeFi lending with zero-knowledge credit scoring.
        </p>
        <button className="btn-gold" onClick={connect}>Connect Wallet</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', flexDirection: 'column' }}>
      {MODULE_HEADER}

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 360px', gap: 0, maxWidth: 1200, width: '100%', margin: '0 auto' }}>

        {/* Chat */}
        <div style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            marginBottom: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: msg.role === 'user'
                      ? 'rgba(245,197,24,0.12)'
                      : '#0C0C0C',
                    border: msg.role === 'user'
                      ? '1px solid rgba(245,197,24,0.25)'
                      : '1px solid rgba(99,102,241,0.15)',
                    color: '#FFF',
                    fontSize: 13,
                    fontFamily: 'Satoshi, sans-serif',
                    lineHeight: 1.6,
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: '#0C0C0C',
                  border: '1px solid rgba(99,102,241,0.15)',
                  color: 'rgba(255,255,255,0.5)',
                }}>
                  AI is thinking...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about loan terms, rates, collateral..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 10,
                background: '#0C0C0C',
                border: '1px solid #1E1E1E',
                color: '#FFF',
                fontFamily: 'Satoshi, sans-serif',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-gold"
              style={{ padding: '10px 20px' }}
            >
              Send
            </button>
          </form>
        </div>

        {/* Terms sidebar */}
        <div style={{
          background: '#0A0A0A',
          borderLeft: '1px solid rgba(99,102,241,0.15)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          <div>
            <p style={{
              fontSize: 11, color: 'rgba(255,255,255,0.3)',
              fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontFamily: 'Satoshi, sans-serif', marginBottom: 10,
            }}>
              Proposed Terms
            </p>
          </div>

          {[
            { label: 'Loan Amount', value: `$${loanTerms.amount}`, icon: '$' },
            { label: 'Interest Rate', value: `${loanTerms.rate}% APR`, icon: '%' },
            { label: 'Duration', value: loanTerms.duration, icon: '⏱' },
            { label: 'Collateral', value: loanTerms.collateral, icon: '🔒' },
          ].map(item => (
            <div key={item.label} style={{
              background: '#111',
              border: '1px solid #1E1E1E',
              borderRadius: 10,
              padding: '12px',
            }}>
              <p style={{
                fontSize: 10, color: 'rgba(255,255,255,0.2)',
                fontWeight: 700, textTransform: 'uppercase',
                fontFamily: 'Satoshi, sans-serif', marginBottom: 4,
              }}>
                {item.label}
              </p>
              <p style={{
                fontSize: 14, fontWeight: 700, color: '#F5C518',
                fontFamily: 'Fira Code, monospace',
              }}>
                {item.value}
              </p>
            </div>
          ))}

          <div style={{
            padding: '12px',
            background: 'rgba(99,102,241,0.05)',
            border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: 10,
          }}>
            <p style={{
              fontSize: 11, color: 'rgba(99,102,241,0.8)',
              fontFamily: 'Satoshi, sans-serif',
              lineHeight: 1.6,
            }}>
              ✓ ZK Credit Score: <strong>847/1000</strong>
            </p>
            <p style={{
              fontSize: 11, color: 'rgba(99,102,241,0.7)',
              fontFamily: 'Satoshi, sans-serif',
              marginTop: 4,
            }}>
              Settlement: Ethereum L2 ~30s
            </p>
          </div>

          {loanTerms.status === 'proposed' && (
            <button
              className="btn-gold"
              onClick={handleAcceptTerms}
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? <>Accepting...</> : 'Accept Terms'}
            </button>
          )}

          {loanTerms.status === 'accepted' && (
            <div style={{
              padding: '12px',
              background: 'rgba(74,222,128,0.1)',
              border: '1px solid rgba(74,222,128,0.2)',
              borderRadius: 10,
              textAlign: 'center',
            }}>
              <p style={{
                fontSize: 12, fontWeight: 700, color: '#4ADE80',
                fontFamily: 'Satoshi, sans-serif',
              }}>
                ✓ Loan Active
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
