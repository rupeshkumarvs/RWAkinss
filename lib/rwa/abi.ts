// Built by vsrupeshkumar
// ABIs for the RWAkins AI x RWA stack on Mantle Sepolia.

export const RWA_TOKEN_ABI = [
  { type: 'function', name: 'approve', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'allowance', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'currentYield', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
  { type: 'function', name: 'symbol', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'mint', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [] },
  // Owner-only: the agent syncs the live reference APY on-chain (lib/rwa/oracleSync).
  { type: 'function', name: 'setYield', stateMutability: 'nonpayable', inputs: [{ name: 'yieldBps', type: 'uint256' }], outputs: [] },
] as const

export const VAULT_ABI = [
  { type: 'function', name: 'deposit', stateMutability: 'nonpayable', inputs: [{ name: 'asset', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'withdraw', stateMutability: 'nonpayable', inputs: [{ name: 'asset', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'rebalance', stateMutability: 'nonpayable', inputs: [{ name: 'usdyBps', type: 'uint256' }, { name: 'methBps', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'rebalanceFor', stateMutability: 'nonpayable', inputs: [{ name: 'user', type: 'address' }, { name: 'usdyBps', type: 'uint256' }, { name: 'methBps', type: 'uint256' }], outputs: [] },
  {
    type: 'function', name: 'getPortfolio', stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: 'usdyBal', type: 'uint256' }, { name: 'methBal', type: 'uint256' }, { name: 'usdyBps', type: 'uint256' }, { name: 'methBps', type: 'uint256' }],
  },
  { type: 'function', name: 'getTotalValue', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'usdy', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'meth', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'MAX_RISK_BPS', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  // Live mETH price (USDY units, 1e18) — read straight from the AMM pool reserves.
  { type: 'function', name: 'methPriceE18', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'owner', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { type: 'event', name: 'Deposited', inputs: [{ name: 'user', type: 'address', indexed: true }, { name: 'asset', type: 'address', indexed: false }, { name: 'amount', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'Withdrawn', inputs: [{ name: 'user', type: 'address', indexed: true }, { name: 'asset', type: 'address', indexed: false }, { name: 'amount', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'Rebalanced', inputs: [{ name: 'user', type: 'address', indexed: true }, { name: 'usdyBps', type: 'uint256', indexed: false }, { name: 'methBps', type: 'uint256', indexed: false }, { name: 'timestamp', type: 'uint256', indexed: false }] },
] as const

// ── AI × RWA credit suite ──────────────────────────────────────────────────
// Compliance: on-chain KYC gate + investment mandate + tamper-evident audit trail
// + latest risk score (RWAkinsCompliance.sol).
export const COMPLIANCE_ABI = [
  { type: 'function', name: 'isVerified', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'tierOf', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'uint8' }] },
  { type: 'function', name: 'mandateOf', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'decisionCount', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'uint256' }] },
  {
    type: 'function', name: 'attestationOf', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: 'tier', type: 'uint8' }, { name: 'jurisdiction', type: 'bytes32' }, { name: 'issuedAt', type: 'uint64' }, { name: 'expiresAt', type: 'uint64' }, { name: 'revoked', type: 'bool' }],
  },
  {
    type: 'function', name: 'getRisk', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: 'score', type: 'uint16' }, { name: 'band', type: 'uint8' }, { name: 'updatedAt', type: 'uint64' }],
  },
  // Self-sovereign: the user records the mandate their AI CFO must stay within.
  { type: 'function', name: 'setMandate', stateMutability: 'nonpayable', inputs: [{ name: 'mandate', type: 'string' }], outputs: [] },
  // Attestor-only: issue a KYC attestation (tier 1-3, jurisdiction, optional expiry).
  { type: 'function', name: 'attestKYC', stateMutability: 'nonpayable', inputs: [{ name: 'user', type: 'address' }, { name: 'tier', type: 'uint8' }, { name: 'jurisdiction', type: 'bytes32' }, { name: 'expiresAt', type: 'uint64' }], outputs: [] },
  // Agent-only: append a decision to the audit trail / record the latest risk score.
  { type: 'function', name: 'logDecision', stateMutability: 'nonpayable', inputs: [{ name: 'user', type: 'address' }, { name: 'kind', type: 'bytes32' }, { name: 'allowed', type: 'bool' }, { name: 'detail', type: 'string' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'recordRisk', stateMutability: 'nonpayable', inputs: [{ name: 'user', type: 'address' }, { name: 'score', type: 'uint16' }, { name: 'band', type: 'uint8' }], outputs: [] },
  { type: 'event', name: 'KYCAttested', inputs: [{ name: 'user', type: 'address', indexed: true }, { name: 'tier', type: 'uint8', indexed: false }, { name: 'jurisdiction', type: 'bytes32', indexed: false }, { name: 'expiresAt', type: 'uint64', indexed: false }] },
  { type: 'event', name: 'MandateSet', inputs: [{ name: 'user', type: 'address', indexed: true }, { name: 'mandate', type: 'string', indexed: false }] },
  { type: 'event', name: 'DecisionLogged', inputs: [{ name: 'user', type: 'address', indexed: true }, { name: 'seq', type: 'uint256', indexed: true }, { name: 'kind', type: 'bytes32', indexed: false }, { name: 'allowed', type: 'bool', indexed: false }, { name: 'detail', type: 'string', indexed: false }, { name: 'timestamp', type: 'uint64', indexed: false }] },
  { type: 'event', name: 'RiskRecorded', inputs: [{ name: 'user', type: 'address', indexed: true }, { name: 'score', type: 'uint16', indexed: false }, { name: 'band', type: 'uint8', indexed: false }, { name: 'timestamp', type: 'uint64', indexed: false }] },
] as const

// Credit Passport: soulbound (non-transferable) ERC-721 carrying a wallet's
// on-chain credit score (RWAkinsCreditPassport.sol).
export const CREDIT_PASSPORT_ABI = [
  { type: 'function', name: 'name', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'symbol', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'totalSupply', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'scoreOf', stateMutability: 'view', inputs: [{ name: 'holder', type: 'address' }], outputs: [{ type: 'uint16' }] },
  {
    type: 'function', name: 'getPassport', stateMutability: 'view', inputs: [{ name: 'holder', type: 'address' }],
    outputs: [{ name: 'exists', type: 'bool' }, { name: 'score', type: 'uint16' }, { name: 'band', type: 'uint8' }, { name: 'updatedAt', type: 'uint64' }, { name: 'tokenId', type: 'uint256' }],
  },
  // User self-mints their soulbound passport (idempotent).
  { type: 'function', name: 'mint', stateMutability: 'nonpayable', inputs: [], outputs: [{ type: 'uint256' }] },
  // Scorer-only: write the AI-computed score (mints first if needed).
  { type: 'function', name: 'setScore', stateMutability: 'nonpayable', inputs: [{ name: 'holder', type: 'address' }, { name: 'score', type: 'uint16' }, { name: 'band', type: 'uint8' }], outputs: [] },
  { type: 'event', name: 'PassportMinted', inputs: [{ name: 'holder', type: 'address', indexed: true }, { name: 'tokenId', type: 'uint256', indexed: true }] },
  { type: 'event', name: 'ScoreUpdated', inputs: [{ name: 'holder', type: 'address', indexed: true }, { name: 'score', type: 'uint16', indexed: false }, { name: 'band', type: 'uint8', indexed: false }, { name: 'timestamp', type: 'uint64', indexed: false }] },
] as const

// Lending: borrow USDY against USDY/mETH, credit-gated LTV, KYC-gated open
// (RWAkinsLending.sol).
export const LENDING_ABI = [
  { type: 'function', name: 'availableLiquidity', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'maxLtvBps', stateMutability: 'view', inputs: [{ name: 'borrower', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'valueInUsdy', stateMutability: 'view', inputs: [{ name: 'asset', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'debtOf', stateMutability: 'view', inputs: [{ name: 'borrower', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'currentLtvBps', stateMutability: 'view', inputs: [{ name: 'borrower', type: 'address' }], outputs: [{ type: 'uint256' }] },
  {
    type: 'function', name: 'getLoan', stateMutability: 'view', inputs: [{ name: 'borrower', type: 'address' }],
    outputs: [{ name: 'active', type: 'bool' }, { name: 'collateralAsset', type: 'address' }, { name: 'collateralAmount', type: 'uint256' }, { name: 'principal', type: 'uint256' }, { name: 'aprBps', type: 'uint256' }, { name: 'debt', type: 'uint256' }, { name: 'ltvBps', type: 'uint256' }],
  },
  { type: 'function', name: 'openLoan', stateMutability: 'nonpayable', inputs: [{ name: 'collateralAsset', type: 'address' }, { name: 'collateralAmount', type: 'uint256' }, { name: 'borrowAmount', type: 'uint256' }, { name: 'aprBps', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'repay', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { type: 'event', name: 'LoanOpened', inputs: [{ name: 'borrower', type: 'address', indexed: true }, { name: 'collateralAsset', type: 'address', indexed: false }, { name: 'collateralAmount', type: 'uint256', indexed: false }, { name: 'principal', type: 'uint256', indexed: false }, { name: 'aprBps', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'LoanRepaid', inputs: [{ name: 'borrower', type: 'address', indexed: true }, { name: 'principal', type: 'uint256', indexed: false }, { name: 'interest', type: 'uint256', indexed: false }] },
] as const

// The constant-product AMM the vault swaps through during a rebalance. The agent
// owner key keeps its spot price anchored to the live market via syncToPrice.
export const AMM_ABI = [
  { type: 'function', name: 'spotPriceE18', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'getReserves', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }, { type: 'uint256' }] },
  { type: 'function', name: 'getAmountOut', stateMutability: 'view', inputs: [{ name: 'tokenIn', type: 'address' }, { name: 'amountIn', type: 'uint256' }], outputs: [{ type: 'uint256' }] },
  // Owner-only: anchor the pool spot price to the live market (arbitrage stand-in).
  { type: 'function', name: 'syncToPrice', stateMutability: 'nonpayable', inputs: [{ name: 'targetPriceE18', type: 'uint256' }], outputs: [] },
] as const
