import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';

/**
 * Fixed left sidebar navigation — desktop only (hidden on mobile → bottom nav).
 * Includes wallet widget at bottom with wallet provider name and switch action.
 */
export default function SideNav({ isConnected, truncatedAddr, walletName, onConnect, onOpenModal, connecting }) {
  const navItems = [
    { to: '/dashboard', icon: 'grid_view', label: 'Home' },
    { to: '/wallet', icon: 'account_balance', label: 'Portfolio' },
    { to: '/transactions', icon: 'swap_horiz', label: 'Transfers' },
    { to: '/settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 hidden md:flex flex-col py-8 pt-24 bg-surface-container-lowest shadow-[40px_0_60px_-15px_rgba(0,0,0,0.5)] z-40">
      {/* Nav Links */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex items-center gap-4 py-3 px-6 font-label text-sm uppercase tracking-widest transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-violet-600/20 to-transparent text-violet-400 border-l-4 border-violet-500 translate-x-1'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-surface-container border-l-4 border-transparent',
              ].join(' ')
            }
          >
            <span className="material-symbols-outlined">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Wallet Status */}
      <div className="px-6 mt-auto space-y-3">
        {isConnected ? (
          <div
            className="bg-surface-container rounded-xl p-4 inner-stroke flex items-center gap-3 cursor-pointer hover:bg-surface-container-high transition-all group"
            onClick={onOpenModal}
          >
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
              <span
                className="material-symbols-outlined text-sm text-on-primary-container"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                wallet
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] font-black uppercase text-on-surface truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                {walletName || 'Connected'}
              </p>
              <p className="text-[10px] text-outline font-mono truncate">{truncatedAddr}</p>
            </div>
            <span className="material-symbols-outlined text-outline text-sm group-hover:text-primary transition-colors">
              swap_horiz
            </span>
          </div>
        ) : (
          <motion.button
            onClick={onConnect}
            disabled={connecting}
            className="w-full py-4 gradient-btn text-on-primary-fixed font-headline font-bold rounded-xl cursor-pointer disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </motion.button>
        )}
      </div>
    </aside>
  );
}
