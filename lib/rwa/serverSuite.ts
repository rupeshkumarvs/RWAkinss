// Built by vsrupeshkumar
// Server-side writer for the credit suite's PRIVILEGED actions — the ones that
// must be signed by the verifier / AI-engine key, never the user's wallet:
//
//   • serverAttestKYC   — the licensed verifier attests a user's KYC tier on-chain
//   • serverSetCredit   — the AI credit engine writes a computed score to the passport
//   • serverRecordRisk  — the agent anchors a computed risk score on-chain
//   • serverLogDecision — the agent appends a decision to the tamper-evident audit trail
//
// All four reuse the agent wallet from lib/rwa/serverVault (AGENT_PRIVATE_KEY =
// the deploy key, which the deploy script sets as attestor + agent + scorer). When
// the key or a contract address is absent every helper returns null instead of a
// fabricated tx hash, so callers degrade to a decision-only / simulated response —
// the same honesty discipline as the heartbeat.
import { formatEther, stringToHex, type Address, type Hex } from 'viem'
import { COMPLIANCE_ABI, CREDIT_PASSPORT_ABI, LENDING_ABI } from './abi'
import deployed from '@/lib/rwa-deployed.json'
import { getAgentWallet, publicClient } from './serverVault'

const isAddr = (v: unknown): v is Address => typeof v === 'string' && v.length === 42

export const COMPLIANCE = (deployed.compliance || '') as Address
export const CREDIT = (deployed.creditPassport || '') as Address
export const LENDING = (deployed.lending || '') as Address

export const isComplianceLive = isAddr(deployed.compliance)
export const isCreditLive = isAddr(deployed.creditPassport)
export const isLendingLive = isAddr(deployed.lending)

/** True once the suite is deployed AND the privileged signer key is configured. */
export function canWriteCompliance(): boolean {
  return isComplianceLive && getAgentWallet() !== null
}
export function canWriteCredit(): boolean {
  return isCreditLive && getAgentWallet() !== null
}

/** Verifier attests a user's KYC tier + jurisdiction. Returns tx hash or null. */
export async function serverAttestKYC(
  user: Address, tier: number, jurisdiction: string, expiresAt = 0,
): Promise<Hex | null> {
  const signer = getAgentWallet()
  if (!signer || !isComplianceLive) return null
  const hash = await signer.wallet.writeContract({
    address: COMPLIANCE, abi: COMPLIANCE_ABI, functionName: 'attestKYC',
    args: [user, tier, stringToHex(jurisdiction.slice(0, 31), { size: 32 }), BigInt(expiresAt)],
  })
  await publicClient.waitForTransactionReceipt({ hash })
  return hash
}

/** AI credit engine writes a computed score (300-900, band 1-5) to the passport. */
export async function serverSetCredit(user: Address, score: number, band: number): Promise<Hex | null> {
  const signer = getAgentWallet()
  if (!signer || !isCreditLive) return null
  const hash = await signer.wallet.writeContract({
    address: CREDIT, abi: CREDIT_PASSPORT_ABI, functionName: 'setScore', args: [user, score, band],
  })
  await publicClient.waitForTransactionReceipt({ hash })
  return hash
}

/** Agent anchors the latest composite risk score (0-1000, band 1-5) on-chain. */
export async function serverRecordRisk(user: Address, score: number, band: number): Promise<Hex | null> {
  const signer = getAgentWallet()
  if (!signer || !isComplianceLive) return null
  const hash = await signer.wallet.writeContract({
    address: COMPLIANCE, abi: COMPLIANCE_ABI, functionName: 'recordRisk', args: [user, score, band],
  })
  await publicClient.waitForTransactionReceipt({ hash })
  return hash
}

/** Agent appends a decision to the on-chain audit trail. Best-effort (returns null
 *  on any failure so it never blocks the user-facing response). */
export async function serverLogDecision(
  user: Address, kind: string, allowed: boolean, detail: string,
): Promise<Hex | null> {
  const signer = getAgentWallet()
  if (!signer || !isComplianceLive) return null
  try {
    const hash = await signer.wallet.writeContract({
      address: COMPLIANCE, abi: COMPLIANCE_ABI, functionName: 'logDecision',
      args: [user, stringToHex(kind.slice(0, 31), { size: 32 }), allowed, detail.slice(0, 200)],
    })
    await publicClient.waitForTransactionReceipt({ hash })
    return hash
  } catch {
    return null
  }
}

// ── Server reads (over the resilient public RPC) ─────────────────────────────
const toNum = (b: bigint) => Number(formatEther(b))

function bytes32ToStr(hex: string): string {
  const clean = (hex || '').replace(/^0x/, '')
  let out = ''
  for (let i = 0; i < clean.length; i += 2) {
    const code = parseInt(clean.slice(i, i + 2), 16)
    if (code) out += String.fromCharCode(code)
  }
  return out
}

export interface ServerCompliance {
  tier: number
  jurisdiction: string
  mandate: string
  decisionCount: number
  riskScore: number
  riskBand: number
}

export async function readComplianceServer(user: Address): Promise<ServerCompliance> {
  if (!isComplianceLive) return { tier: 0, jurisdiction: '', mandate: '', decisionCount: 0, riskScore: 0, riskBand: 0 }
  const [tier, mandate, count, attest, risk] = await Promise.all([
    publicClient.readContract({ address: COMPLIANCE, abi: COMPLIANCE_ABI, functionName: 'tierOf', args: [user] }) as Promise<number>,
    publicClient.readContract({ address: COMPLIANCE, abi: COMPLIANCE_ABI, functionName: 'mandateOf', args: [user] }) as Promise<string>,
    publicClient.readContract({ address: COMPLIANCE, abi: COMPLIANCE_ABI, functionName: 'decisionCount', args: [user] }) as Promise<bigint>,
    publicClient.readContract({ address: COMPLIANCE, abi: COMPLIANCE_ABI, functionName: 'attestationOf', args: [user] }) as Promise<readonly [number, string, bigint, bigint, boolean]>,
    publicClient.readContract({ address: COMPLIANCE, abi: COMPLIANCE_ABI, functionName: 'getRisk', args: [user] }) as Promise<readonly [number, number, bigint]>,
  ])
  return { tier: Number(tier), jurisdiction: bytes32ToStr(attest[1]), mandate, decisionCount: Number(count), riskScore: Number(risk[0]), riskBand: Number(risk[1]) }
}

export interface ServerCredit {
  exists: boolean
  score: number
  band: number
}

export async function readCreditServer(user: Address): Promise<ServerCredit> {
  if (!isCreditLive) return { exists: false, score: 0, band: 0 }
  const p = (await publicClient.readContract({
    address: CREDIT, abi: CREDIT_PASSPORT_ABI, functionName: 'getPassport', args: [user],
  })) as readonly [boolean, number, number, bigint, bigint]
  return { exists: p[0], score: Number(p[1]), band: Number(p[2]) }
}

export interface ServerLoan {
  active: boolean
  ltvBps: number
}

export async function readLoanServer(user: Address): Promise<ServerLoan> {
  if (!isLendingLive) return { active: false, ltvBps: 0 }
  const l = (await publicClient.readContract({
    address: LENDING, abi: LENDING_ABI, functionName: 'getLoan', args: [user],
  })) as readonly [boolean, Address, bigint, bigint, bigint, bigint, bigint]
  return { active: l[0], ltvBps: Number(l[6]) }
}

export { toNum }
