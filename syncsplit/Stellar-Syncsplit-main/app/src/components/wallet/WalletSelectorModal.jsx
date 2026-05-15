import { motion, AnimatePresence } from 'motion/react';

const WALLETS = [
  {
    id: 'freighter',
    name: 'Freighter',
    description: 'Popular Stellar browser extension',
    icon: 'account_balance_wallet',
    color: 'from-violet-500 to-indigo-600',
    installUrl: 'https://www.freighter.app/',
  },
  {
    id: 'xbull',
    name: 'xBull Wallet',
    description: 'Multi-platform Stellar wallet',
    icon: 'shield',
    color: 'from-cyan-500 to-blue-600',
    installUrl: 'https://xbull.app/',
  },
  {
    id: 'albedo',
    name: 'Albedo',
    description: 'Web-based Stellar signer',
    icon: 'language',
    color: 'from-amber-500 to-orange-600',
    installUrl: 'https://albedo.link/',
  },
];

/**
 * Glassmorphic wallet selector modal.
 * Shows available wallets with connect/switch/disconnect actions.
 * Matches the SYNC_SPLIT "Digital Kineticism" design system.
 */
export default function WalletSelectorModal({
  isOpen,
  onClose,
  onConnect,
  onDisconnect,
  isConnected,
  walletName,
  truncatedAddr,
  connecting,
  error,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-surface-container-lowest/70 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-2xl glass-card border border-outline-variant/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] glass-border"
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Interior Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-container/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-secondary/10 blur-3xl pointer-events-none" />

            <div className="relative p-8">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-container to-secondary flex items-center justify-center shadow-lg shadow-primary-container/20">
                    <span
                      className="material-symbols-outlined text-on-primary-fixed text-lg"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      account_balance_wallet
                    </span>
                  </div>
                  <div>
                    <h2 className="font-headline text-lg font-bold tracking-tight text-on-surface">
                      {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
                    </h2>
                    <p className="font-label text-[10px] uppercase tracking-widest text-outline">
                      Stellar Testnet
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-highest transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {/* Connected State */}
              {isConnected && (
                <motion.div
                  className="mb-6 bg-tertiary/5 border border-tertiary/20 rounded-xl p-4"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-tertiary shadow-[0_0_8px_rgba(78,222,162,0.6)]" />
                    <span className="text-sm font-headline font-bold text-tertiary uppercase tracking-wider">
                      {walletName || 'Connected'}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-outline-variant">{truncatedAddr}</p>
                  <button
                    onClick={onDisconnect}
                    className="mt-3 w-full py-2.5 bg-error/10 hover:bg-error/20 text-error rounded-lg text-xs font-headline font-bold uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Disconnect
                  </button>
                </motion.div>
              )}

              {/* Wallet List */}
              <div className="space-y-3">
                <p className="text-[10px] font-headline font-bold uppercase tracking-widest text-outline mb-2">
                  {isConnected ? 'Switch Wallet' : 'Select a Wallet'}
                </p>

                {WALLETS.map((wallet, i) => {
                  const isActive = isConnected && walletName === wallet.id;

                  return (
                    <motion.button
                      key={wallet.id}
                      onClick={() => onConnect(wallet.id)}
                      disabled={connecting || isActive}
                      className={[
                        'w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 cursor-pointer group',
                        isActive
                          ? 'bg-primary/10 border border-primary/30'
                          : 'bg-surface-container-high/50 border border-outline-variant/10 hover:bg-surface-container-highest hover:border-primary/20',
                        connecting ? 'opacity-60 cursor-wait' : '',
                      ].join(' ')}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      whileHover={!connecting && !isActive ? { scale: 1.01 } : {}}
                      whileTap={!connecting && !isActive ? { scale: 0.98 } : {}}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${wallet.color} flex items-center justify-center shadow-lg`}>
                        <span className="material-symbols-outlined text-white text-lg">
                          {wallet.icon}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-headline text-sm font-bold text-on-surface flex items-center gap-2">
                          {wallet.name}
                          {isActive && (
                            <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-black uppercase">
                              Active
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-outline-variant">{wallet.description}</p>
                      </div>
                      <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">
                        {isActive ? 'check_circle' : 'arrow_forward'}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Loading State */}
              {connecting && (
                <motion.div
                  className="mt-4 flex items-center justify-center gap-3 py-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-primary font-headline font-bold">
                    Connecting...
                  </span>
                </motion.div>
              )}

              {/* Error State */}
              {error && (
                <motion.div
                  className="mt-4 bg-error/10 border border-error/20 rounded-xl p-4 flex items-start gap-3"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="material-symbols-outlined text-error text-lg flex-shrink-0">warning</span>
                  <p className="text-xs text-error leading-relaxed">{error}</p>
                </motion.div>
              )}

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-outline-variant/10 flex items-start gap-3">
                <span className="material-symbols-outlined text-outline text-lg">info</span>
                <p className="text-[11px] leading-relaxed text-outline">
                  Wallet extensions run locally in your browser. Your keys never leave your device.
                  Need a wallet?{' '}
                  <a
                    href="https://www.freighter.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-bold hover:underline"
                  >
                    Get Freighter
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
