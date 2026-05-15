import { NavLink } from 'react-router-dom';

/**
 * Fixed top navigation bar — matches the prototype TopAppBar.
 * Glassmorphic background with gradient SYNC_SPLIT logo.
 * Shows active wallet name and truncated address.
 */
export default function TopNav({ onWalletClick, isConnected, walletName, truncatedAddr }) {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/wallet', label: 'Wallet' },
    { to: '/transactions', label: 'Transactions' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-2xl shadow-2xl shadow-violet-900/10">
      <div className="flex justify-between items-center px-6 md:px-8 py-4 w-full">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <NavLink to="/" className="text-2xl font-black tracking-tighter gradient-text font-headline">
            SYNC_SPLIT
          </NavLink>
          <nav className="hidden md:flex gap-6 items-center">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    'font-label tracking-tight text-sm uppercase font-semibold transition-all duration-300',
                    isActive
                      ? 'text-violet-400 border-b-2 border-violet-500 pb-1'
                      : 'text-gray-400 hover:text-gray-200',
                  ].join(' ')
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {isConnected && (
            <button
              onClick={onWalletClick}
              className="hidden sm:flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant/10 hover:border-primary/30 transition-all cursor-pointer group"
            >
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse-glow" />
              <span className="text-xs font-headline font-bold text-tertiary uppercase tracking-wider">
                {walletName || 'Testnet'}
              </span>
              <span className="text-xs text-outline font-mono">{truncatedAddr}</span>
              <span className="material-symbols-outlined text-outline text-sm group-hover:text-primary transition-colors">
                unfold_more
              </span>
            </button>
          )}
          <button
            onClick={onWalletClick}
            className="p-2 rounded-full hover:bg-violet-500/10 transition-all duration-300 active:scale-90 cursor-pointer"
          >
            <span className="material-symbols-outlined text-on-surface-variant">
              account_balance_wallet
            </span>
          </button>
          <button className="p-2 rounded-full hover:bg-violet-500/10 transition-all duration-300 active:scale-90 cursor-pointer">
            <span className="material-symbols-outlined text-on-surface-variant">
              notifications
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
