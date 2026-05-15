// Demo mode — realistic mock data for all features

export const DEMO_ADDRESS = '0xDemo1234567890abcdef1234567890abcdef1234'

export const DEMO_SCORE = {
  address: DEMO_ADDRESS,
  score: 742,
  riskBand: 1 as const,
  explanation:
    'Strong on-chain history with consistent DeFi interactions. High transaction frequency and diverse protocol usage indicate a reliable borrower. No defaults detected across 847 transactions.',
  transactionHash: '0xdemo_tx_hash_742_creditblocks_mainnet',
}

export const DEMO_SCORE_FACTORS = [
  { label: 'Transaction History', weight: 30, score: 85, contribution: 255 },
  { label: 'DeFi Protocol Interactions', weight: 25, score: 78, contribution: 195 },
  { label: 'Repayment Track Record', weight: 20, score: 90, contribution: 180 },
  { label: 'Asset Diversity', weight: 15, score: 72, contribution: 108 },
  { label: 'Wallet Age', weight: 10, score: 100, contribution: 100 },
]

export const DEMO_SCORE_HISTORY = [
  { date: Date.now() - 86400000 * 30, score: 680 },
  { date: Date.now() - 86400000 * 24, score: 695 },
  { date: Date.now() - 86400000 * 18, score: 710 },
  { date: Date.now() - 86400000 * 12, score: 725 },
  { date: Date.now() - 86400000 * 6, score: 738 },
  { date: Date.now(), score: 742 },
]

export const DEMO_STAKING = {
  stakedAmount: 2500,
  tier: 'Silver',
  boost: 10,
  apy: 12,
  lockPeriod: 90,
  startDate: Date.now() - 86400000 * 14,
  unlockDate: Date.now() + 86400000 * 76,
  earnedRewards: 43.5,
}

export const DEMO_NCRD_BALANCE = '5000'
export const DEMO_QIE_BALANCE = '1247.83'

export const DEMO_LOANS = [
  {
    id: 'demo_loan_1',
    amount: '5000',
    collateral: '1500',
    apr: '12',
    term: 30,
    status: 'active' as const,
    startDate: Date.now() - 86400000 * 5,
    txHash: '0xdemo_loan_tx_hash',
  },
]

export async function simulateTx(label: string, delayMs = 2000): Promise<string> {
  await new Promise((r) => setTimeout(r, delayMs))
  const hash = `0xdemo_${label}_${Date.now().toString(16)}`
  return hash
}
