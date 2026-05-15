'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useScore } from '@/lib/score-context';
import {
  generateScore,
  lookupScore,
  chat as sendChat,
  RISK_LABEL,
  RISK_COLOR,
} from '@/lib/api-client';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

export default function WalletDashboard() {
  const { address, isConnected, disconnect } = useWallet();
  const { score, setScore } = useScore();

  const [tab, setTab] = useState<'overview' | 'score' | 'chat' | 'staking'>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    {
      role: 'assistant',
      content:
        'Hi! I am Q-Loan AI. I can help you negotiate loan terms based on your credit score. What would you like to borrow?',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [loanTerms, setLoanTerms] = useState<any>(null);
  const [signing, setSigning] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isConnected || !address || score) return;
    (async () => {
      setLoading(true);
      try {
        const data = await lookupScore(address);
        setScore(data);
      } catch {
        // No score yet — that is fine
      } finally {
        setLoading(false);
      }
    })();
  }, [isConnected, address, score, setScore]);

  async function handleGenerate() {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateScore(address);
      setScore(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleChatSend() {
    if (!chatInput.trim() || !address) return;
    const text = chatInput.trim();
    setChatInput('');
    setMsgs((p) => [...p, { role: 'user', content: text }]);
    setTyping(true);
    try {
      const data = await sendChat(text, address);
      setMsgs((p) => [...p, { role: 'assistant', content: data.reply ?? data.response ?? '' }]);
      if (data.loanTerms) setLoanTerms(data.loanTerms);
    } catch (e: any) {
      setMsgs((p) => [...p, { role: 'assistant', content: `Error: ${e.message}` }]);
    } finally {
      setTyping(false);
    }
  }

  async function handleSignLoan() {
    if (!loanTerms || !address) return;
    setSigning(true);
    try {
      const typedData = {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          LoanAgreement: [
            { name: 'borrower', type: 'address' },
            { name: 'amount', type: 'string' },
            { name: 'rate', type: 'string' },
            { name: 'duration', type: 'string' },
            { name: 'timestamp', type: 'uint256' },
          ],
        },
        primaryType: 'LoanAgreement',
        domain: {
          name: 'CreditBlocks',
          version: '1',
          chainId: 1990,
          verifyingContract: '0x36Fda9F9F17ea5c07C0CDE540B220fC0697bBcE3',
        },
        message: {
          borrower: address,
          amount: loanTerms.amount ?? '0',
          rate: loanTerms.rate ?? '0',
          duration: loanTerms.duration ?? '0',
          timestamp: Math.floor(Date.now() / 1000),
        },
      };
      const sig = await (window as any).ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [address, JSON.stringify(typedData)],
      });
      setMsgs((p) => [
        ...p,
        {
          role: 'assistant',
          content: `✅ Loan signed! Signature: ${sig.slice(0, 20)}... Your loan is being processed on QIE Mainnet.`,
        },
      ]);
      setLoanTerms(null);
    } catch (e: any) {
      setMsgs((p) => [...p, { role: 'assistant', content: `Signing failed: ${e.message}` }]);
    } finally {
      setSigning(false);
    }
  }

  async function handleCopy() {
    if (!address) return;
    await navigator.clipboard.writeText(address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const riskColor = score ? RISK_COLOR[score.riskBand] : '#666';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '◈' },
    { id: 'score', label: 'Score', icon: '◎' },
    { id: 'chat', label: 'Q-Loan AI', icon: '⚡' },
    { id: 'staking', label: 'Staking', icon: '◆' },
  ] as const;

  return (
    <div style={{ minHeight: '100vh', background: '#080808', padding: '80px 24px 40px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* TOP BAR */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 32,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: 'Clash Display, sans-serif',
                fontSize: 28,
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                marginBottom: 4,
              }}
            >
              Credit Dashboard
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontFamily: 'Satoshi, sans-serif' }}>
              QIE Mainnet · Chain ID 1990
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                padding: '10px 18px',
                background: 'rgba(245,197,24,0.06)',
                border: '1px solid rgba(245,197,24,0.2)',
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80' }} />
              <span style={{ fontFamily: 'Fira Code, monospace', fontSize: 13, color: '#F5C518' }}>
                {address?.slice(0, 8)}...{address?.slice(-6)}
              </span>
              <button
                onClick={handleCopy}
                style={{
                  background: 'none',
                  border: 'none',
                  color: copied ? '#4ADE80' : 'rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  fontSize: 12,
                  padding: 0,
                  fontFamily: 'Satoshi, sans-serif',
                }}
              >
                {copied ? '✓' : '⎘'}
              </button>
            </div>

            <button
              onClick={disconnect}
              style={{
                padding: '10px 18px',
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: 999,
                color: '#F87171',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'Satoshi, sans-serif',
              }}
            >
              Disconnect
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
            marginBottom: 28,
          }}
        >
          {[
            {
              label: 'Credit Score',
              value: score?.score ?? '—',
              color: score ? '#F5C518' : 'rgba(255,255,255,0.15)',
              sub: score ? RISK_LABEL[score.riskBand] : null,
              subColor: riskColor,
              border: 'rgba(245,197,24,0.15)',
              fontSize: 40,
            },
            {
              label: 'Risk Band',
              value: score ? (score.riskBand === 1 ? 'Low' : score.riskBand === 2 ? 'Medium' : 'High') : '—',
              color: riskColor,
              sub: score ? `Band ${score.riskBand} of 3` : 'No score yet',
              subColor: 'rgba(255,255,255,0.25)',
              border: '#1A1A1A',
              fontSize: 28,
            },
            {
              label: 'Network',
              value: 'QIE Mainnet',
              color: '#FFFFFF',
              sub: 'Chain ID: 1990',
              subColor: 'rgba(255,255,255,0.25)',
              subMono: true,
              border: '#1A1A1A',
              fontSize: 22,
            },
            {
              label: 'Passport NFT',
              value: score ? 'Minted ✓' : 'Not Minted',
              color: score ? '#4ADE80' : 'rgba(255,255,255,0.2)',
              sub: 'Soulbound · Non-transferable',
              subColor: 'rgba(255,255,255,0.25)',
              border: '#1A1A1A',
              fontSize: 22,
            },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                background: '#0C0C0C',
                border: `1px solid ${card.border}`,
                borderRadius: 14,
                padding: '20px 24px',
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.3)',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontFamily: 'Satoshi, sans-serif',
                  marginBottom: 8,
                }}
              >
                {card.label}
              </p>
              <p
                style={{
                  fontFamily: 'Clash Display, sans-serif',
                  fontSize: card.fontSize,
                  fontWeight: 700,
                  color: card.color,
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  marginBottom: card.sub ? 8 : 0,
                }}
              >
                {card.value}
              </p>
              {card.sub && (
                <p
                  style={{
                    fontSize: 12,
                    color: card.subColor,
                    fontFamily: card.subMono ? 'Fira Code, monospace' : 'Satoshi, sans-serif',
                  }}
                >
                  {card.sub}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* TABS */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            marginBottom: 20,
            background: '#0C0C0C',
            border: '1px solid #1A1A1A',
            borderRadius: 12,
            padding: 4,
            width: 'fit-content',
            flexWrap: 'wrap',
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '9px 20px',
                borderRadius: 9,
                border: 'none',
                background: tab === t.id ? 'rgba(245,197,24,0.1)' : 'transparent',
                color: tab === t.id ? '#F5C518' : 'rgba(255,255,255,0.35)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Satoshi, sans-serif',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div
              style={{
                background: '#0C0C0C',
                border: '1px solid rgba(245,197,24,0.12)',
                borderRadius: 16,
                padding: 28,
              }}
            >
              <h3
                style={{
                  fontFamily: 'Clash Display, sans-serif',
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#FFF',
                  marginBottom: 20,
                  letterSpacing: '-0.01em',
                }}
              >
                Credit Passport
              </h3>

              {score ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
                    <span
                      style={{
                        fontFamily: 'Clash Display, sans-serif',
                        fontSize: 64,
                        fontWeight: 700,
                        color: '#F5C518',
                        letterSpacing: '-0.04em',
                        lineHeight: 1,
                      }}
                    >
                      {score.score}
                    </span>
                    <span
                      style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', fontFamily: 'Satoshi, sans-serif' }}
                    >
                      / 1000
                    </span>
                  </div>

                  <div
                    style={{
                      height: 6,
                      background: '#1A1A1A',
                      borderRadius: 3,
                      marginBottom: 16,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${score.score / 10}%`,
                        background: riskColor,
                        borderRadius: 3,
                        transition: 'width 1s ease',
                      }}
                    />
                  </div>

                  <p
                    style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.45)',
                      lineHeight: 1.75,
                      fontFamily: 'Satoshi, sans-serif',
                      marginBottom: 16,
                    }}
                  >
                    {score.explanation}
                  </p>

                  {score.transactionHash && (
                    <a
                      href={`https://mainnet.qie.digital/tx/${score.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 14px',
                        borderRadius: 999,
                        background: 'rgba(245,197,24,0.06)',
                        border: '1px solid rgba(245,197,24,0.15)',
                        color: '#F5C518',
                        fontSize: 11,
                        fontFamily: 'Fira Code, monospace',
                        textDecoration: 'none',
                      }}
                    >
                      ↗ View on Explorer
                    </a>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.3)',
                      fontSize: 14,
                      fontFamily: 'Satoshi, sans-serif',
                      marginBottom: 20,
                    }}
                  >
                    No credit passport found for this wallet. Generate your score to mint one on QIE.
                  </p>
                  <button
                    className="btn-gold"
                    onClick={handleGenerate}
                    disabled={loading}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-sm" />
                        Generating...
                      </>
                    ) : (
                      '⚡ Generate Credit Score'
                    )}
                  </button>
                  {loading && (
                    <p
                      style={{
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.2)',
                        marginTop: 8,
                        fontFamily: 'Satoshi, sans-serif',
                      }}
                    >
                      AI analyzing on-chain history... may take 30–60s
                    </p>
                  )}
                </div>
              )}

              {error && (
                <p style={{ marginTop: 12, fontSize: 12, color: '#F87171', fontFamily: 'Satoshi, sans-serif' }}>
                  {error}
                </p>
              )}
            </div>

            <div
              style={{
                background: '#0C0C0C',
                border: '1px solid #1A1A1A',
                borderRadius: 16,
                padding: 28,
              }}
            >
              <h3
                style={{
                  fontFamily: 'Clash Display, sans-serif',
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#FFF',
                  marginBottom: 20,
                  letterSpacing: '-0.01em',
                }}
              >
                Wallet Details
              </h3>

              {[
                { label: 'Address', value: address ?? '—', mono: true, truncate: true },
                { label: 'Network', value: 'QIE Mainnet', mono: false },
                { label: 'Chain ID', value: '1990', mono: true },
                { label: 'NFT Contract', value: '0xAe6A...B502', mono: true },
                {
                  label: 'Status',
                  value: score ? '✓ Passport Minted' : '○ No Passport',
                  mono: false,
                  color: score ? '#4ADE80' : 'rgba(255,255,255,0.3)',
                },
              ].map((row: any) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid #111',
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.3)',
                      fontFamily: 'Satoshi, sans-serif',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {row.label}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: row.color ?? '#FFF',
                      fontFamily: row.mono ? 'Fira Code, monospace' : 'Satoshi, sans-serif',
                      fontWeight: 500,
                    }}
                  >
                    {row.truncate && row.value.length > 20
                      ? `${row.value.slice(0, 10)}...${row.value.slice(-6)}`
                      : row.value}
                  </span>
                </div>
              ))}

              <div style={{ marginTop: 20 }}>
                <a
                  href={`https://mainnet.qie.digital/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  View on QIE Explorer ↗
                </a>
              </div>
            </div>
          </div>
        )}

        {/* SCORE TAB */}
        {tab === 'score' && (
          <div
            style={{
              background: '#0C0C0C',
              border: '1px solid rgba(245,197,24,0.12)',
              borderRadius: 16,
              padding: 32,
            }}
          >
            <h3
              style={{
                fontFamily: 'Clash Display, sans-serif',
                fontSize: 20,
                fontWeight: 600,
                color: '#FFF',
                marginBottom: 8,
              }}
            >
              Credit Score
            </h3>
            <p
              style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.35)',
                fontFamily: 'Satoshi, sans-serif',
                marginBottom: 28,
              }}
            >
              AI-powered analysis of your on-chain history. Minted as a soulbound NFT on QIE.
            </p>

            {score ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div
                  style={{
                    fontFamily: 'Clash Display, sans-serif',
                    fontSize: 112,
                    fontWeight: 700,
                    color: '#F5C518',
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                    marginBottom: 16,
                  }}
                >
                  {score.score}
                </div>

                <div style={{ marginBottom: 24 }}>
                  <span
                    className={
                      score.riskBand === 1 ? 'risk-low' : score.riskBand === 2 ? 'risk-medium' : 'risk-high'
                    }
                  >
                    {score.riskBand === 1
                      ? '✓ LOW RISK'
                      : score.riskBand === 2
                        ? '⚠ MEDIUM RISK'
                        : '✕ HIGH RISK'}
                  </span>
                </div>

                <div
                  style={{
                    maxWidth: 520,
                    margin: '0 auto 24px',
                    padding: '20px 24px',
                    background: '#111',
                    border: '1px solid #1A1A1A',
                    borderRadius: 12,
                    textAlign: 'left',
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.3)',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      fontFamily: 'Satoshi, sans-serif',
                      marginBottom: 8,
                    }}
                  >
                    AI Explanation
                  </p>
                  <p
                    style={{
                      fontSize: 14,
                      color: 'rgba(255,255,255,0.6)',
                      lineHeight: 1.75,
                      fontFamily: 'Satoshi, sans-serif',
                    }}
                  >
                    {score.explanation}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button className="btn-gold" onClick={handleGenerate} disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-sm" />
                        Updating...
                      </>
                    ) : (
                      '↺ Refresh Score'
                    )}
                  </button>

                  {score.transactionHash && (
                    <a
                      href={`https://mainnet.qie.digital/tx/${score.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-silver"
                    >
                      ↗ View Transaction
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div
                  style={{
                    fontFamily: 'Clash Display, sans-serif',
                    fontSize: 80,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.06)',
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                    marginBottom: 20,
                  }}
                >
                  - - -
                </div>
                <p
                  style={{
                    fontSize: 15,
                    color: 'rgba(255,255,255,0.3)',
                    fontFamily: 'Satoshi, sans-serif',
                    marginBottom: 24,
                  }}
                >
                  No credit passport found for this wallet.
                </p>
                <button className="btn-gold" onClick={handleGenerate} disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-sm" />
                      AI Analyzing...
                    </>
                  ) : (
                    '⚡ Generate My Credit Score'
                  )}
                </button>
                {loading && (
                  <p
                    style={{
                      marginTop: 10,
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.2)',
                      fontFamily: 'Satoshi, sans-serif',
                    }}
                  >
                    This may take 30–60 seconds on first load
                  </p>
                )}
                {error && (
                  <p style={{ marginTop: 12, color: '#F87171', fontSize: 13, fontFamily: 'Satoshi, sans-serif' }}>
                    {error}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* CHAT TAB */}
        {tab === 'chat' && (
          <div
            style={{
              background: '#0A0A0A',
              border: '1px solid #1A1A1A',
              borderRadius: 16,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              height: 560,
            }}
          >
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #141414',
                background: '#0C0C0C',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(245,197,24,0.08)',
                  border: '1px solid rgba(245,197,24,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                }}
              >
                ⚡
              </div>
              <div>
                <div
                  style={{
                    fontFamily: 'Clash Display, sans-serif',
                    fontWeight: 600,
                    fontSize: 15,
                    color: '#FFF',
                  }}
                >
                  Q-Loan AI
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'Satoshi, sans-serif' }}>
                  {score
                    ? `Score: ${score.score} · ${RISK_LABEL[score.riskBand]}`
                    : 'Generate score first for personalized terms'}
                </div>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {msgs.map((m, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    background: m.role === 'user' ? '#1A1A1A' : '#111',
                    border: m.role === 'user' ? '1px solid rgba(245,197,24,0.15)' : '1px solid #1E1E1E',
                    color: m.role === 'user' ? '#F8F8F8' : 'rgba(255,255,255,0.7)',
                    padding: '11px 16px',
                    borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    maxWidth: '75%',
                    fontSize: 14,
                    lineHeight: 1.6,
                    fontFamily: 'Satoshi, sans-serif',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {m.content}
                </div>
              ))}

              {typing && (
                <div
                  style={{
                    alignSelf: 'flex-start',
                    display: 'flex',
                    gap: 4,
                    padding: '12px 16px',
                    background: '#111',
                    border: '1px solid #1E1E1E',
                    borderRadius: '14px 14px 14px 4px',
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#F5C518',
                        opacity: 0.4,
                        animation: `fade-in 0.5s ease ${i * 0.15}s infinite alternate`,
                      }}
                    />
                  ))}
                </div>
              )}

              {loanTerms && (
                <div
                  style={{
                    alignSelf: 'flex-start',
                    background: 'rgba(245,197,24,0.04)',
                    border: '1px solid rgba(245,197,24,0.2)',
                    borderRadius: 12,
                    padding: '16px 20px',
                    maxWidth: '80%',
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      color: '#F5C518',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: 10,
                      fontFamily: 'Satoshi, sans-serif',
                    }}
                  >
                    Proposed Loan Terms
                  </p>
                  {Object.entries(loanTerms).map(([k, v]) => (
                    <p
                      key={k}
                      style={{
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.6)',
                        fontFamily: 'Satoshi, sans-serif',
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ color: 'rgba(255,255,255,0.35)' }}>{k}: </span>
                      {String(v)}
                    </p>
                  ))}
                  <button
                    className="btn-gold"
                    onClick={handleSignLoan}
                    disabled={signing}
                    style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}
                  >
                    {signing ? (
                      <>
                        <span className="spinner-sm" />
                        Signing...
                      </>
                    ) : (
                      '✍ Sign Loan Agreement'
                    )}
                  </button>
                </div>
              )}
            </div>

            <div
              style={{
                padding: '12px 16px',
                borderTop: '1px solid #141414',
                background: '#0C0C0C',
                display: 'flex',
                gap: 10,
              }}
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleChatSend();
                  }
                }}
                placeholder="Ask about loan terms, rates, amounts..."
                disabled={typing}
                style={{
                  flex: 1,
                  background: '#111',
                  border: '1px solid #1E1E1E',
                  borderRadius: 10,
                  padding: '11px 14px',
                  color: '#FFF',
                  fontSize: 14,
                  fontFamily: 'Satoshi, sans-serif',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleChatSend}
                disabled={typing || !chatInput.trim()}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #FFD700, #C8860A)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: typing || !chatInput.trim() ? 0.3 : 1,
                  transition: 'opacity 0.2s',
                  flexShrink: 0,
                }}
              >
                ↑
              </button>
            </div>
          </div>
        )}

        {/* STAKING TAB */}
        {tab === 'staking' && (
          <div
            style={{
              background: '#0C0C0C',
              border: '1px solid #1A1A1A',
              borderRadius: 16,
              padding: 32,
            }}
          >
            <h3
              style={{
                fontFamily: 'Clash Display, sans-serif',
                fontSize: 20,
                fontWeight: 600,
                color: '#FFF',
                marginBottom: 8,
              }}
            >
              NCRD Token Staking
            </h3>
            <p
              style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.35)',
                fontFamily: 'Satoshi, sans-serif',
                marginBottom: 28,
              }}
            >
              Stake NCRD tokens to boost your credit score. More commitment = better rates across all DeFi protocols.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                marginBottom: 24,
              }}
            >
              {[
                { label: 'Staking Contract', value: '0x08DA...Fb51' },
                { label: 'NCRD Token', value: '0x7427...be11' },
                { label: 'Score Boost', value: 'Up to +200 pts' },
                { label: 'Min Duration', value: '7 days' },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: '16px 20px',
                    background: '#111',
                    border: '1px solid #1A1A1A',
                    borderRadius: 10,
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.25)',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      fontFamily: 'Satoshi, sans-serif',
                      marginBottom: 6,
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontSize: 14,
                      color: '#F5C518',
                      fontFamily: 'Fira Code, monospace',
                      fontWeight: 500,
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div
              style={{
                padding: '20px 24px',
                background: 'rgba(245,197,24,0.04)',
                border: '1px solid rgba(245,197,24,0.15)',
                borderRadius: 12,
                marginBottom: 20,
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.5)',
                  fontFamily: 'Satoshi, sans-serif',
                  lineHeight: 1.7,
                }}
              >
                ℹ Staking requires NCRD tokens. Get NCRD via QIEDex, then approve and stake to boost your credit
                score. Higher stake amount and longer duration = higher score boost.
              </p>
            </div>

            <a
              href="https://mainnet.qie.digital/address/0x08DA91C81cebD27d181cA732615379f185FbFb51"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-silver"
            >
              View Staking Contract ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
