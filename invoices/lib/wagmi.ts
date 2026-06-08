import { http } from 'wagmi';
import { defineChain } from 'viem';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// Mantle Sepolia testnet (chain 5003). Gas token is MNT (not ETH).
export const mantleSepolia = defineChain({
  id: 5003,
  name: 'Mantle Sepolia',
  nativeCurrency: { name: 'Mantle', symbol: 'MNT', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.sepolia.mantle.xyz'] } },
  blockExplorers: { default: { name: 'Mantlescan', url: 'https://sepolia.mantlescan.xyz' } },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'Recibo',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'kubryx-recibo',
  chains: [mantleSepolia],
  transports: {
    [mantleSepolia.id]: http(
      process.env.NEXT_PUBLIC_MANTLE_SEPOLIA_RPC_URL ?? 'https://rpc.sepolia.mantle.xyz'
    ),
  },
  ssr: true,
});

export const MANTLE_SEPOLIA_CHAIN_ID = 5003;
/** @deprecated Renamed during the Mantle migration; now points at Mantle Sepolia (5003). */
export const ARBITRUM_SEPOLIA_CHAIN_ID = MANTLE_SEPOLIA_CHAIN_ID;

export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
