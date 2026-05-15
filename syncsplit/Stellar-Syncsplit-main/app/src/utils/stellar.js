import { StrKey } from '@stellar/stellar-sdk';

// ─── Network Configuration ───────────────────────────────────────────────────
export const HORIZON_URL = import.meta.env.VITE_HORIZON_URL || 'https://horizon-testnet.stellar.org';
export const SOROBAN_RPC_URL = import.meta.env.VITE_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
export const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || '';
export const NETWORK_PASSPHRASE = import.meta.env.VITE_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';
export const STELLAR_EXPERT_URL = 'https://stellar.expert/explorer/testnet';

/**
 * Validate a Stellar public key (G... address)
 */
export function validateAddress(address) {
  if (!address || typeof address !== 'string') return false;
  return StrKey.isValidEd25519PublicKey(address);
}

/**
 * Truncate a Stellar address for display
 */
export function truncateAddress(address, startChars = 4, endChars = 4) {
  if (!address) return '';
  if (address.length <= startChars + endChars + 3) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format XLM amount for display
 */
export function formatXLM(amount) {
  if (amount === null || amount === undefined) return '0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0.00';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  }).format(num);
}

/**
 * Convert stroops (i128) to XLM string for display.
 * 1 XLM = 10,000,000 stroops
 */
export function stroopsToXlm(stroops) {
  if (!stroops && stroops !== 0) return '0.00';
  const num = typeof stroops === 'bigint' ? Number(stroops) : Number(stroops);
  return (num / 10_000_000).toFixed(7);
}

/**
 * Convert XLM string to stroops (i128) for contract.
 */
export function xlmToStroops(xlm) {
  const num = typeof xlm === 'string' ? parseFloat(xlm) : xlm;
  if (isNaN(num)) return 0n;
  return BigInt(Math.round(num * 10_000_000));
}

/**
 * Get the Stellar Expert transaction URL
 */
export function getTxExplorerUrl(txHash) {
  return `${STELLAR_EXPERT_URL}/tx/${txHash}`;
}

/**
 * Get the Stellar Expert account URL
 */
export function getAccountExplorerUrl(publicKey) {
  return `${STELLAR_EXPERT_URL}/account/${publicKey}`;
}

/**
 * Get the Stellar Expert contract URL
 */
export function getContractExplorerUrl(contractId) {
  return `${STELLAR_EXPERT_URL}/contract/${contractId}`;
}
