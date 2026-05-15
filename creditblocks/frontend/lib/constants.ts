// Single source of truth for all infrastructure URLs, addresses, and chain configs
// NO component ever hardcodes these values — always import from here

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://creditblock-rs-backend.onrender.com'

const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'https://creditblock-rs-4qzb.vercel.app'

export const LINKS = {
  frontend: FRONTEND_URL,
  demo: 'https://youtu.be/HKDrJyicVn0',
  github: 'https://github.com/leobergjackson/creditblock.rs',
  apiDocs: `${API_BASE}/docs`,
  apiHealth: `${API_BASE}/health`,
} as const

export const MAINNET = {
  chainId: 1990,
  chainIdHex: '0x7C6',
  name: 'QIE Mainnet',
  rpcUrl: 'https://rpc.qie.digital',
  explorerUrl: 'https://mainnet.qie.digital',
  contracts: {
    creditPassportNFT: '0xAe6A9CaF9739C661e593979386580d3d14abB502',
    lendingVault: '0x36Fda9F9F17ea5c07C0CDE540B220fC0697bBcE3',
    creditblocksStaking: '0x08DA91C81cebD27d181cA732615379f185FbFb51',
    ncrdToken: '0x7427734468598674645Aa71Ef651218A9Db2be11',
  },
  nativeCurrency: { name: 'QIE', symbol: 'QIE', decimals: 18 },
} as const

export const TESTNET = {
  chainId: 80002, // PolygonAmoy or your testnet - update if different
  chainIdHex: '0x13882',
  name: 'QIE Testnet',
  rpcUrl: 'https://testnet.qie.digital',
  explorerUrl: 'https://testnet.qie.digital',
  contracts: {
    creditPassportNFT: '0x34904952E5269290B783071f1eBba51c22ef6219',
    lendingVault: '0xd840f7E97Eb96d4901666f665A443Ea376e5BA32',
    creditblocksStaking: '0x3E9943694a37d26987C1af36DE169e631b30F153',
    ncrdToken: '0x7427734468598674645Aa71Ef651218A9Db2be11', // Same as mainnet for now
  },
  nativeCurrency: { name: 'QIE', symbol: 'QIE', decimals: 18 },
} as const

// Use mainnet by default. Switch to TESTNET for development if needed.
export const ACTIVE_CHAIN = MAINNET

export const CONTRACT_LIST = [
  { name: 'CreditPassportNFT', type: 'NFT', address: MAINNET.contracts.creditPassportNFT },
  { name: 'LendingVault', type: 'VAULT', address: MAINNET.contracts.lendingVault },
  { name: 'CreditBlocksStaking', type: 'STAKING', address: MAINNET.contracts.creditblocksStaking },
  { name: 'NCRD Token', type: 'TOKEN', address: MAINNET.contracts.ncrdToken },
] as const

export function explorerAddress(address: string) {
  return `${ACTIVE_CHAIN.explorerUrl}/address/${address}`
}

export function explorerTx(hash: string) {
  return `${ACTIVE_CHAIN.explorerUrl}/tx/${hash}`
}

export function truncateAddress(address: string) {
  return `${address.slice(0, 10)}...${address.slice(-6)}`
}
