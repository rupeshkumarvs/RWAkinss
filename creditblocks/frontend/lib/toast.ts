import { toast } from 'sonner'

export const notify = {
  success: (msg: string) =>
    toast.success(msg, {
      style: {
        background: 'rgba(74,222,128,0.1)',
        border: '1px solid rgba(74,222,128,0.3)',
        color: '#4ADE80',
      },
    }),

  error: (msg: string) =>
    toast.error(msg, {
      style: {
        background: 'rgba(248,113,113,0.1)',
        border: '1px solid rgba(248,113,113,0.3)',
        color: '#F87171',
      },
    }),

  loading: (msg: string) => toast.loading(msg),

  gold: (msg: string) =>
    toast(msg, {
      style: {
        background: 'rgba(245,197,24,0.08)',
        border: '1px solid rgba(245,197,24,0.25)',
        color: '#F5C518',
      },
    }),

  walletConnected: (address: string) =>
    notify.success(`Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`),

  walletDisconnected: () => notify.gold('Wallet disconnected'),

  txSubmitted: (hash: string) => notify.gold(`Transaction submitted: ${hash.slice(0, 10)}...`),

  txConfirmed: () => notify.success('Transaction confirmed on QIE'),

  txFailed: (err: string) => notify.error(`Transaction failed: ${err}`),

  scoreMinted: (score: number) => notify.success(`Credit passport minted! Score: ${score}/1000`),

  scoreRefreshed: (score: number) => notify.success(`Score updated to ${score}/1000`),

  stakingSuccess: (amount: string) => notify.success(`Staked ${amount} NCRD successfully`),

  rewardsClaimed: () => notify.success('Rewards claimed successfully'),
}
