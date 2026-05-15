import { Outlet } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import TopNav from './TopNav';
import SideNav from './SideNav';
import WalletSelectorModal from '../wallet/WalletSelectorModal';
import TransactionStatusPanel from '../transaction/TransactionStatusPanel';
import OnboardingStepper from '../ui/OnboardingStepper';
import AdminPanel from '../ui/AdminPanel';
import { useWallet } from '../../hooks/useWallet';
import { useContract } from '../../hooks/useContract';
import { useEvents } from '../../hooks/useEvents';
import { useBalance } from '../../hooks/useBalance';
import { useTransaction } from '../../hooks/useTransaction';

/**
 * App layout shell: TopNav + SideNav + content area.
 * Manages multi-wallet state and contract hooks at the layout level.
 * Includes wallet selector modal and transaction status panel.
 */
export default function AppLayout() {
  const wallet = useWallet();
  const contract = useContract(wallet.publicKey, wallet.signTransaction);
  const { events, latestEvent, loading: eventsLoading, refresh: refreshEvents } = useEvents();
  const { balance } = useBalance(wallet.publicKey);
  const transaction = useTransaction(wallet.signTransaction, wallet.publicKey);

  const mobileNavItems = [
    { to: '/dashboard', icon: 'grid_view', label: 'Home' },
    { to: '/wallet', icon: 'account_balance', label: 'Assets' },
    { to: '/transactions', icon: 'swap_horiz', label: 'Swap' },
    { to: '/settings', icon: 'settings', label: 'Settings' },
  ];

  // Context passed to pages via Outlet
  const outletContext = {
    ...wallet,
    contract,
    events,
    latestEvent,
    eventsLoading,
    refreshEvents,
  };

  return (
    <div className="min-h-screen bg-surface">
      <TopNav
        onWalletClick={wallet.openModal}
        isConnected={wallet.isConnected}
        walletName={wallet.walletName}
        truncatedAddr={wallet.truncatedAddr}
      />
      <SideNav
        isConnected={wallet.isConnected}
        truncatedAddr={wallet.truncatedAddr}
        walletName={wallet.walletName}
        onConnect={wallet.openModal}
        onOpenModal={wallet.openModal}
        connecting={wallet.connecting}
      />

      {/* Main Content — offset for sidebar + topnav */}
      <main className="md:pl-64 pt-24 pb-24 md:pb-12 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <Outlet context={outletContext} />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-xl z-50 flex justify-around items-center py-3 px-2 border-t border-outline-variant/10">
        {mobileNavItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex flex-col items-center gap-1 transition-colors',
                isActive ? 'text-violet-400' : 'text-outline',
              ].join(' ')
            }
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span className="text-[10px] font-headline uppercase font-bold tracking-tight">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Wallet Selector Modal */}
      <WalletSelectorModal
        isOpen={wallet.modalOpen}
        onClose={wallet.closeModal}
        onConnect={wallet.connectWithWallet}
        onDisconnect={() => {
          wallet.disconnect();
          wallet.closeModal();
        }}
        isConnected={wallet.isConnected}
        walletName={wallet.walletName}
        truncatedAddr={wallet.truncatedAddr}
        connecting={wallet.connecting}
        error={wallet.error}
      />

      {/* Transaction Status Panel (contract interactions) */}
      <TransactionStatusPanel
        status={contract.txStatus}
        txHash={contract.txHash}
        error={contract.error}
        onDismiss={contract.resetState}
      />

      {/* Wallet Error Toast */}
      {wallet.error && !wallet.modalOpen && (
        <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-error-container/90 backdrop-blur-xl text-on-error-container px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 max-w-md">
          <span className="material-symbols-outlined text-error">warning</span>
          <p className="text-sm font-body">{wallet.error}</p>
          <button
            onClick={wallet.openModal}
            className="text-xs font-headline font-bold uppercase text-error hover:underline cursor-pointer whitespace-nowrap"
          >
            Retry
          </button>
        </div>
      )}

      {/* Onboarding Stepper */}
      <OnboardingStepper
        isConnected={wallet.isConnected}
        publicKey={wallet.publicKey}
        balance={balance}
        contractTxHash={contract.txHash}
        paymentTxHash={transaction.txHash}
        onConnectClick={wallet.openModal}
      />

      {/* Admin Panel (Ctrl+Shift+L) */}
      <AdminPanel />
    </div>
  );
}
