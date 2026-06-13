// Built by vsrupeshkumar
// Browser-side client for the RWAkins AI × RWA credit suite — the three contracts
// that extend the vault into a full on-chain credit economy:
//
//   • RWAkinsCompliance     — KYC gate + investment mandate + audit trail + risk
//   • RWAkinsCreditPassport — soulbound (non-transferable) credit-score NFT
//   • RWAkinsLending        — borrow USDY against USDY/mETH, credit-gated LTV
//
// Reads go over the resilient multi-endpoint RPC (lib/rwa/rpc); user writes
// (setMandate, mint passport, openLoan/repay) sign through the injected wallet,
// exactly like lib/rwa/vaultClient. Attestation + scoring + risk-anchoring are
// privileged writes done server-side (lib/rwa/serverSuite) by the verifier/agent
// key, so they're not here.
'use client'

import { createPublicClient, createWalletClient, custom, parseAbiItem, parseEther, formatEther, type Address } from 'viem'
import { getEvmProvider } from '@/lib/wallet-providers'
import { COMPLIANCE_ABI, CREDIT_PASSPORT_ABI, LENDING_ABI, RWA_TOKEN_ABI } from './abi'
import deployed from '@/lib/rwa-deployed.json'
import { mantleSepolia, mantleTransport } from './rpc'

const isAddr = (v: unknown): v is Address => typeof v === 'string' && v.length === 42

export const SUITE = {
  usdy: (deployed.usdy || '') as Address,
  meth: (deployed.meth || '') as Address,
  compliance: (deployed.compliance || '') as Address,
  credit: (deployed.creditPassport || '') as Address,
  lending: (deployed.lending || '') as Address,
}

export const isComplianceDeployed = isAddr(deployed.compliance)
export const isCreditDeployed = isAddr(deployed.creditPassport)
export const isLendingDeployed = isAddr(deployed.lending)

export const explorerTx = (hash: string) => `https://sepolia.mantlescan.xyz/tx/${hash}`
export const explorerAddr = (addr: string) => `https://sepolia.mantlescan.xyz/address/${addr}`

const publicClient = createPublicClient({ chain: mantleSepolia, transport: mantleTransport() })

function getWalletClient() {
  const eth = getEvmProvider('MetaMask')
  if (!eth) throw new Error('No EVM wallet detected. Install MetaMask and reload.')
  return createWalletClient({ chain: mantleSepolia, transport: custom(eth as never) })
}

const toNum = (b: bigint) => Number(formatEther(b))

// ── Compliance ───────────────────────────────────────────────────────────────
export interface ComplianceState {
  verified: boolean
  tier: number // 0 none · 1 retail · 2 accredited · 3 institutional
  jurisdiction: string
  mandate: string
  decisionCount: number
  risk: { score: number; band: number; updatedAt: number }
}

const TIER_LABEL = ['Unverified', 'Retail KYC', 'Accredited', 'Institutional']
export const tierLabel = (t: number) => TIER_LABEL[t] ?? 'Unverified'

function bytes32ToStr(hex: string): string {
  try {
    const clean = hex.replace(/^0x/, '')
    let out = ''
    for (let i = 0; i < clean.length; i += 2) {
      const code = parseInt(clean.slice(i, i + 2), 16)
      if (code) out += String.fromCharCode(code)
    }
    return out
  } catch {
    return ''
  }
}

export async function readCompliance(user: Address): Promise<ComplianceState> {
  if (!isComplianceDeployed) {
    return { verified: false, tier: 0, jurisdiction: '', mandate: '', decisionCount: 0, risk: { score: 0, band: 0, updatedAt: 0 } }
  }
  const [tier, mandate, count, attest, risk] = await Promise.all([
    publicClient.readContract({ address: SUITE.compliance, abi: COMPLIANCE_ABI, functionName: 'tierOf', args: [user] }) as Promise<number>,
    publicClient.readContract({ address: SUITE.compliance, abi: COMPLIANCE_ABI, functionName: 'mandateOf', args: [user] }) as Promise<string>,
    publicClient.readContract({ address: SUITE.compliance, abi: COMPLIANCE_ABI, functionName: 'decisionCount', args: [user] }) as Promise<bigint>,
    publicClient.readContract({ address: SUITE.compliance, abi: COMPLIANCE_ABI, functionName: 'attestationOf', args: [user] }) as Promise<readonly [number, string, bigint, bigint, boolean]>,
    publicClient.readContract({ address: SUITE.compliance, abi: COMPLIANCE_ABI, functionName: 'getRisk', args: [user] }) as Promise<readonly [number, number, bigint]>,
  ])
  return {
    verified: Number(tier) > 0,
    tier: Number(tier),
    jurisdiction: bytes32ToStr(attest[1]),
    mandate,
    decisionCount: Number(count),
    risk: { score: Number(risk[0]), band: Number(risk[1]), updatedAt: Number(risk[2]) },
  }
}

/** User records the investment mandate their AI CFO must stay within. */
export async function setMandate(account: Address, mandate: string): Promise<`0x${string}`> {
  const wc = getWalletClient()
  const hash = await wc.writeContract({
    account, chain: mantleSepolia, address: SUITE.compliance,
    abi: COMPLIANCE_ABI, functionName: 'setMandate', args: [mandate],
  })
  await publicClient.waitForTransactionReceipt({ hash })
  return hash
}

// ── Credit Passport ──────────────────────────────────────────────────────────
export interface PassportState {
  exists: boolean
  score: number
  band: number
  updatedAt: number
  tokenId: number
}

const BAND_LABEL = ['—', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
export const bandLabel = (b: number) => BAND_LABEL[b] ?? '—'

export async function readPassport(user: Address): Promise<PassportState> {
  if (!isCreditDeployed) return { exists: false, score: 0, band: 0, updatedAt: 0, tokenId: 0 }
  const p = (await publicClient.readContract({
    address: SUITE.credit, abi: CREDIT_PASSPORT_ABI, functionName: 'getPassport', args: [user],
  })) as readonly [boolean, number, number, bigint, bigint]
  return { exists: p[0], score: Number(p[1]), band: Number(p[2]), updatedAt: Number(p[3]), tokenId: Number(p[4]) }
}

/** User self-mints their soulbound passport (idempotent on-chain). */
export async function mintPassport(account: Address): Promise<`0x${string}`> {
  const wc = getWalletClient()
  const hash = await wc.writeContract({
    account, chain: mantleSepolia, address: SUITE.credit, abi: CREDIT_PASSPORT_ABI, functionName: 'mint', args: [],
  })
  await publicClient.waitForTransactionReceipt({ hash })
  return hash
}

// ── Lending ──────────────────────────────────────────────────────────────────
export interface LoanState {
  active: boolean
  collateralAsset: Address
  collateralTokens: number
  principal: number
  aprBps: number
  debt: number
  ltvBps: number
}

export interface LendingMarket {
  liquidity: number
  maxLtvBps: number
}

export async function readLendingMarket(user: Address): Promise<LendingMarket> {
  if (!isLendingDeployed) return { liquidity: 0, maxLtvBps: 0 }
  const [liq, ltv] = await Promise.all([
    publicClient.readContract({ address: SUITE.lending, abi: LENDING_ABI, functionName: 'availableLiquidity' }) as Promise<bigint>,
    publicClient.readContract({ address: SUITE.lending, abi: LENDING_ABI, functionName: 'maxLtvBps', args: [user] }) as Promise<bigint>,
  ])
  return { liquidity: toNum(liq), maxLtvBps: Number(ltv) }
}

export async function readLoan(user: Address): Promise<LoanState> {
  if (!isLendingDeployed) return { active: false, collateralAsset: SUITE.usdy, collateralTokens: 0, principal: 0, aprBps: 0, debt: 0, ltvBps: 0 }
  const l = (await publicClient.readContract({
    address: SUITE.lending, abi: LENDING_ABI, functionName: 'getLoan', args: [user],
  })) as readonly [boolean, Address, bigint, bigint, bigint, bigint, bigint]
  return {
    active: l[0], collateralAsset: l[1], collateralTokens: toNum(l[2]),
    principal: toNum(l[3]), aprBps: Number(l[4]), debt: toNum(l[5]), ltvBps: Number(l[6]),
  }
}

/** Approve collateral, then open the AI-negotiated loan (two transactions). */
export async function openLoan(
  account: Address, collateralAsset: Address, collateralAmount: string, borrowAmount: string, aprBps: number,
  onStep?: (step: 'approving' | 'borrowing', hash?: `0x${string}`) => void,
): Promise<`0x${string}`> {
  const wc = getWalletClient()
  const collateral = parseEther(collateralAmount)

  onStep?.('approving')
  const approveHash = await wc.writeContract({
    account, chain: mantleSepolia, address: collateralAsset,
    abi: RWA_TOKEN_ABI, functionName: 'approve', args: [SUITE.lending, collateral],
  })
  await publicClient.waitForTransactionReceipt({ hash: approveHash })

  onStep?.('borrowing')
  const hash = await wc.writeContract({
    account, chain: mantleSepolia, address: SUITE.lending, abi: LENDING_ABI,
    functionName: 'openLoan', args: [collateralAsset, collateral, parseEther(borrowAmount), BigInt(aprBps)],
  })
  await publicClient.waitForTransactionReceipt({ hash })
  return hash
}

/** Approve the live debt in USDY, then repay (releases collateral). */
export async function repayLoan(
  account: Address, debtTokens: number,
  onStep?: (step: 'approving' | 'repaying', hash?: `0x${string}`) => void,
): Promise<`0x${string}`> {
  const wc = getWalletClient()
  // Approve a small buffer over the read debt to cover interest accrued between
  // the read and the repay tx.
  const value = parseEther((debtTokens * 1.001 + 0.01).toFixed(18))

  onStep?.('approving')
  const approveHash = await wc.writeContract({
    account, chain: mantleSepolia, address: SUITE.usdy,
    abi: RWA_TOKEN_ABI, functionName: 'approve', args: [SUITE.lending, value],
  })
  await publicClient.waitForTransactionReceipt({ hash: approveHash })

  onStep?.('repaying')
  const hash = await wc.writeContract({
    account, chain: mantleSepolia, address: SUITE.lending, abi: LENDING_ABI, functionName: 'repay', args: [],
  })
  await publicClient.waitForTransactionReceipt({ hash })
  return hash
}

// ── Audit trail (on-chain event log) ─────────────────────────────────────────
export interface AuditEntry {
  type: 'decision' | 'risk'
  seq: number
  kind: string
  allowed?: boolean
  detail: string
  timestamp: number
  txHash: string
  blockNumber: number
}

const DECISION_EVT = parseAbiItem(
  'event DecisionLogged(address indexed user, uint256 indexed seq, bytes32 kind, bool allowed, string detail, uint64 timestamp)',
)
const RISK_EVT = parseAbiItem('event RiskRecorded(address indexed user, uint16 score, uint8 band, uint64 timestamp)')

/** Read the wallet's tamper-evident audit trail straight from the contract events.
 *  Bounded block range + try/catch so a range-limited public RPC never throws. */
export async function readAuditTrail(user: Address): Promise<AuditEntry[]> {
  if (!isComplianceDeployed) return []
  try {
    const latest = await publicClient.getBlockNumber()
    const WINDOW = BigInt(90_000)
    const fromBlock = latest > WINDOW ? latest - WINDOW : BigInt(0)
    const [decisions, risks] = await Promise.all([
      publicClient.getLogs({ address: SUITE.compliance, event: DECISION_EVT, args: { user }, fromBlock, toBlock: 'latest' }),
      publicClient.getLogs({ address: SUITE.compliance, event: RISK_EVT, args: { user }, fromBlock, toBlock: 'latest' }),
    ])
    const entries: AuditEntry[] = []
    const Z = BigInt(0)
    for (const l of decisions) {
      entries.push({
        type: 'decision',
        seq: Number(l.args.seq ?? Z),
        kind: bytes32ToStr(String(l.args.kind ?? '')),
        allowed: Boolean(l.args.allowed),
        detail: String(l.args.detail ?? ''),
        timestamp: Number(l.args.timestamp ?? Z),
        txHash: l.transactionHash ?? '',
        blockNumber: Number(l.blockNumber ?? Z),
      })
    }
    for (const l of risks) {
      entries.push({
        type: 'risk',
        seq: 0,
        kind: 'RISK',
        detail: `Risk score ${Number(l.args.score ?? Z)}/1000 · band ${Number(l.args.band ?? Z)}`,
        timestamp: Number(l.args.timestamp ?? Z),
        txHash: l.transactionHash ?? '',
        blockNumber: Number(l.blockNumber ?? Z),
      })
    }
    return entries.sort((a, b) => b.blockNumber - a.blockNumber || b.seq - a.seq)
  } catch {
    return []
  }
}

export const fmt = (n: number, dp = 2) => n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })
