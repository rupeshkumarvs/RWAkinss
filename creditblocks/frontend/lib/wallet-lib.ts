// Core wallet connection and signing logic (used by WalletContext)
import { ACTIVE_CHAIN } from './constants'

declare global {
  interface Window {
    ethereum?: any
  }
}

export function isMetaMaskAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
}

export async function connectWallet(): Promise<string> {
  if (!isMetaMaskAvailable()) {
    throw new Error('MetaMask not found. Please install MetaMask or QIE Wallet.')
  }

  const accounts: string[] = await window.ethereum.request({
    method: 'eth_requestAccounts',
  })

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts returned. User may have rejected the request.')
  }

  await ensureCorrectNetwork()
  return accounts[0]
}

export async function getConnectedAccount(): Promise<string | null> {
  if (!isMetaMaskAvailable()) return null

  const accounts: string[] = await window.ethereum.request({
    method: 'eth_accounts',
  })

  return accounts?.[0] ?? null
}

export async function ensureCorrectNetwork(): Promise<void> {
  const chainIdHex: string = await window.ethereum.request({
    method: 'eth_chainId',
  })

  const currentChainId = parseInt(chainIdHex, 16)
  if (currentChainId === ACTIVE_CHAIN.chainId) return

  // Try switching to QIE network
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ACTIVE_CHAIN.chainIdHex }],
    })
  } catch (switchError: any) {
    // Chain not added yet — add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: ACTIVE_CHAIN.chainIdHex,
            chainName: ACTIVE_CHAIN.name,
            rpcUrls: [ACTIVE_CHAIN.rpcUrl],
            nativeCurrency: ACTIVE_CHAIN.nativeCurrency,
            blockExplorerUrls: [ACTIVE_CHAIN.explorerUrl],
          },
        ],
      })
    } else {
      throw switchError
    }
  }
}

export async function signMessage(message: string): Promise<string> {
  const account = await getConnectedAccount()
  if (!account) throw new Error('No wallet connected')

  return window.ethereum.request({
    method: 'personal_sign',
    params: [message, account],
  })
}

export async function signTypedData(typedData: object): Promise<string> {
  const account = await getConnectedAccount()
  if (!account) throw new Error('No wallet connected')

  return window.ethereum.request({
    method: 'eth_signTypedData_v4',
    params: [account, JSON.stringify(typedData)],
  })
}

export function onAccountsChanged(callback: (accounts: string[]) => void) {
  if (!isMetaMaskAvailable()) return
  window.ethereum.on('accountsChanged', callback)
}

export function onChainChanged(callback: (chainId: string) => void) {
  if (!isMetaMaskAvailable()) return
  window.ethereum.on('chainChanged', callback)
}

export function removeWalletListeners() {
  if (!isMetaMaskAvailable()) return
  window.ethereum.removeAllListeners('accountsChanged')
  window.ethereum.removeAllListeners('chainChanged')
}
