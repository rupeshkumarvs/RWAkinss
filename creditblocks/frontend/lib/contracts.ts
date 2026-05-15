// Contract instances and ABIs for on-chain interaction
import { ethers } from 'ethers'
import { ACTIVE_CHAIN } from './constants'

// Minimal ABIs — only the functions we actually call
const CREDIT_PASSPORT_ABI = [
  'function mintOrUpdate(address user, uint256 score, uint8 riskBand) external',
  'function getScore(address user) external view returns (tuple(uint256 score, uint8 riskBand, uint256 timestamp, bool exists))',
  'function balanceOf(address owner) external view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
]

const LENDING_VAULT_ABI = [
  'function createLoan(address borrower, uint256 amount, uint256 rate, uint256 duration, bytes calldata signature) external',
  'function getLoan(uint256 loanId) external view returns (tuple(address borrower, uint256 amount, uint256 rate, uint256 duration, bool active))',
  'function getLoanCount() external view returns (uint256)',
]

const STAKING_ABI = [
  'function stake(uint256 amount, uint256 duration) external',
  'function unstake(uint256 stakeId) external',
  'function getStake(address user) external view returns (tuple(uint256 amount, uint256 duration, uint256 startTime, bool active))',
  'function getStakeBoost(address user) external view returns (uint256)',
]

const ERC20_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
  'function name() external view returns (string)',
]

function getProvider() {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum)
  }

  // Read-only fallback
  return new ethers.JsonRpcProvider(ACTIVE_CHAIN.rpcUrl)
}

async function getSigner() {
  const provider = getProvider()
  if (provider instanceof ethers.BrowserProvider) {
    return provider.getSigner()
  }
  throw new Error('No wallet connected')
}

export async function getCreditPassportContract(write = false) {
  const runner = write ? await getSigner() : getProvider()
  return new ethers.Contract(
    ACTIVE_CHAIN.contracts.creditPassportNFT,
    CREDIT_PASSPORT_ABI,
    runner
  )
}

export async function getLendingVaultContract(write = false) {
  const runner = write ? await getSigner() : getProvider()
  return new ethers.Contract(
    ACTIVE_CHAIN.contracts.lendingVault,
    LENDING_VAULT_ABI,
    runner
  )
}

export async function getStakingContract(write = false) {
  const runner = write ? await getSigner() : getProvider()
  return new ethers.Contract(
    ACTIVE_CHAIN.contracts.creditblocksStaking,
    STAKING_ABI,
    runner
  )
}

export async function getNCRDTokenContract(write = false) {
  const runner = write ? await getSigner() : getProvider()
  return new ethers.Contract(
    ACTIVE_CHAIN.contracts.ncrdToken,
    ERC20_ABI,
    runner
  )
}

// Read score directly from chain
export async function readScoreFromChain(address: string) {
  const contract = await getCreditPassportContract(false)
  const result = await contract.getScore(address)

  return {
    score: Number(result.score),
    riskBand: Number(result.riskBand) as 1 | 2 | 3,
    timestamp: Number(result.timestamp),
    exists: result.exists as boolean,
  }
}

// Check if user has a passport NFT
export async function hasPassport(address: string): Promise<boolean> {
  const contract = await getCreditPassportContract(false)
  const balance = await contract.balanceOf(address)
  return balance > 0n
}

// Read NCRD token balance
export async function getNCRDBalance(address: string): Promise<string> {
  const contract = await getNCRDTokenContract(false)
  const balance = await contract.balanceOf(address)
  const decimals = await contract.decimals()
  return ethers.formatUnits(balance, decimals)
}

// Approve token spending
export async function approveTokenSpending(
  tokenAddress: string,
  spenderAddress: string,
  amount: string
): Promise<string> {
  const contract = await getNCRDTokenContract(true)
  const amountWei = ethers.parseEther(amount)
  const tx = await contract.approve(spenderAddress, amountWei)
  const receipt = await tx.wait()
  return receipt.hash
}

// Stake NCRD tokens
export async function stakeTokens(amount: string, durationDays: number): Promise<string> {
  const token = await getNCRDTokenContract(true)
  const staking = await getStakingContract(true)
  const amountWei = ethers.parseEther(amount)
  const durationSecs = durationDays * 86400

  // Step 1: Approve token spending
  const allowance = await token.allowance(
    (await getSigner()).getAddress(),
    ACTIVE_CHAIN.contracts.creditblocksStaking
  )

  if (allowance < amountWei) {
    const approveTx = await token.approve(
      ACTIVE_CHAIN.contracts.creditblocksStaking,
      amountWei
    )
    await approveTx.wait()
  }

  // Step 2: Stake
  const stakeTx = await staking.stake(amountWei, durationSecs)
  const receipt = await stakeTx.wait()
  return receipt.hash as string
}

// Get user's staking info
export async function getStakingInfo(address: string) {
  const contract = await getStakingContract(false)
  try {
    const stake = await contract.getStake(address)
    const boost = await contract.getStakeBoost(address)

    return {
      amount: ethers.formatEther(stake.amount),
      duration: Number(stake.duration),
      startTime: Number(stake.startTime),
      active: stake.active,
      boost: Number(boost),
    }
  } catch (error) {
    // User may not have staked
    return null
  }
}
