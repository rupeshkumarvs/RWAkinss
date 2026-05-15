import { motion } from 'motion/react';
import { NavLink } from 'react-router-dom';
import GradientButton from '../components/ui/GradientButton';

/**
 * Landing page — full port of the Landing Hero prototype.
 * Standalone layout (no sidebar).
 */
export default function LandingPage() {
  return (
    <div className="bg-surface text-on-surface overflow-x-hidden">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-2xl shadow-2xl shadow-violet-900/10">
        <div className="flex justify-between items-center px-6 md:px-8 py-4">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-black tracking-tighter gradient-text font-headline">
              SYNC_SPLIT
            </span>
            <nav className="hidden md:flex gap-6 items-center">
              <NavLink
                to="/dashboard"
                className="font-label tracking-tight text-sm uppercase font-semibold text-gray-400 hover:text-gray-200 transition-all duration-300"
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/wallet"
                className="font-label tracking-tight text-sm uppercase font-semibold text-gray-400 hover:text-gray-200 transition-all duration-300"
              >
                Wallet
              </NavLink>
              <NavLink
                to="/transactions"
                className="font-label tracking-tight text-sm uppercase font-semibold text-gray-400 hover:text-gray-200 transition-all duration-300"
              >
                Transactions
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <NavLink
              to="/dashboard"
              className="px-6 py-2.5 gradient-btn text-on-primary-fixed font-headline font-bold rounded-xl text-sm"
            >
              Launch App
            </NavLink>
          </div>
        </div>
      </header>

      <main className="relative min-h-screen flex flex-col pt-24 overflow-hidden">
        {/* Kinetic Background Blobs */}
        <motion.div
          className="kinetic-blob bg-primary-container w-[500px] h-[500px] -top-24 -left-24 rounded-full"
          animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.05, 0.95, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="kinetic-blob bg-secondary w-[400px] h-[400px] top-1/2 -right-24 rounded-full"
          animate={{ x: [0, -20, 30, 0], y: [0, 20, -30, 0], scale: [1, 0.95, 1.05, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="kinetic-blob bg-tertiary w-[300px] h-[300px] bottom-0 left-1/3 rounded-full"
          animate={{ x: [0, 20, -30, 0], y: [0, -20, 10, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Hero Section */}
        <section className="relative z-10 flex-grow flex flex-col items-center justify-center px-6 text-center max-w-7xl mx-auto py-16 md:py-20">
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span className="inline-block font-label text-xs tracking-[0.3em] uppercase text-primary mb-4 bg-primary-container/10 px-4 py-1.5 rounded-full border border-primary/20">
              The Stellar Split Protocol
            </span>
            <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] max-w-5xl mb-8">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-on-surface via-on-surface to-outline-variant/50">
                SPLIT THE
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container via-secondary to-tertiary">
                CHAOS
              </span>
            </h1>
            <p className="font-body text-base sm:text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-12 leading-relaxed">
              Split bills and distribute XLM across wallets on Stellar with
              cryptographic precision. Connect your Freighter wallet and start splitting.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 md:gap-6 items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <NavLink to="/dashboard">
              <GradientButton icon="bolt" className="px-8 md:px-10 py-4 md:py-5">
                Start Splitting
              </GradientButton>
            </NavLink>
            <NavLink to="/wallet">
              <GradientButton variant="secondary" className="px-8 md:px-10 py-4 md:py-5">
                View Wallet
                <span className="material-symbols-outlined text-sm">arrow_outward</span>
              </GradientButton>
            </NavLink>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            className="mt-16 md:mt-24 w-full max-w-5xl relative group"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-container/20 to-secondary/20 blur-3xl opacity-50" />
            <div className="relative bg-surface-container-low/60 backdrop-blur-3xl border border-outline-variant/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-outline-variant/10">
                {[
                  { label: 'Total Volume', value: '$4.2B', color: 'bg-primary-container', width: 'w-2/3' },
                  { label: 'Active Splits', value: '12,842', color: 'bg-secondary', width: 'w-1/2' },
                  { label: 'Protocol TVL', value: '$920M', color: 'bg-tertiary', width: 'w-4/5' },
                ].map(stat => (
                  <div key={stat.label} className="p-6 md:p-8 flex flex-col gap-2">
                    <span className="font-label text-[10px] uppercase tracking-widest text-outline">
                      {stat.label}
                    </span>
                    <span className="text-2xl md:text-3xl font-headline font-bold">
                      {stat.value}
                    </span>
                    <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                      <div
                        className={`h-full ${stat.color} ${stat.width} shadow-[0_0_10px_rgba(124,58,237,0.5)]`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Bento Grid */}
        <section className="relative z-10 px-6 md:px-8 py-16 md:py-24 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4">
            {/* Feature 1 */}
            <motion.div
              className="md:col-span-2 bg-surface-container rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:bg-surface-container-high transition-colors duration-500 border border-outline-variant/5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-primary-container/20 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary">dynamic_feed</span>
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-headline font-bold mb-3">Instant Distribution</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Split XLM across multiple Stellar wallets with a single transaction signature.
                </p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              className="md:col-span-1 bg-surface-container-low rounded-2xl p-6 md:p-8 flex flex-col border border-outline-variant/5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <span className="material-symbols-outlined text-tertiary text-4xl mb-4">bolt</span>
              <h3 className="text-lg md:text-xl font-headline font-bold mb-2">3-5s Settlement</h3>
              <p className="text-sm text-on-surface-variant">Stellar's consensus finalizes in seconds.</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              className="md:col-span-1 bg-surface-container-high rounded-2xl p-6 md:p-8 flex flex-col border border-outline-variant/10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <span className="material-symbols-outlined text-secondary text-4xl mb-4">verified_user</span>
              <h3 className="text-lg md:text-xl font-headline font-bold mb-2">Freighter Wallet</h3>
              <p className="text-sm text-on-surface-variant">Secure signing via Freighter extension.</p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              className="md:col-span-1 bg-surface-container-low rounded-2xl p-6 md:p-8 flex flex-col border border-outline-variant/5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <span className="material-symbols-outlined text-primary text-4xl mb-4">account_tree</span>
              <h3 className="text-lg md:text-xl font-headline font-bold mb-2">Smart Splits</h3>
              <p className="text-sm text-on-surface-variant">Equal, exact, or proportional share modes.</p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              className="md:col-span-3 bg-gradient-to-br from-surface-container-low to-surface-container p-6 md:p-8 rounded-2xl flex flex-col md:flex-row gap-6 md:gap-8 items-center border border-outline-variant/5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-headline font-bold mb-3">Stellar Testnet Ready</h3>
                <p className="text-on-surface-variant leading-relaxed mb-6">
                  Connect your Freighter wallet, fund via Friendbot, and start splitting XLM on the Stellar Testnet — zero risk, full functionality.
                </p>
                <NavLink
                  to="/dashboard"
                  className="text-primary font-label text-sm uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all"
                >
                  Get Started <span className="material-symbols-outlined text-sm">east</span>
                </NavLink>
              </div>
              <div className="flex-shrink-0 flex gap-3">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <span className="material-symbols-outlined text-primary">star</span>
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <span className="material-symbols-outlined text-tertiary">rocket_launch</span>
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <span className="material-symbols-outlined text-secondary">shield</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-outline-variant/10 bg-surface-container-lowest/50 backdrop-blur-3xl pt-16 md:pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-16 md:mb-20">
          <div className="md:col-span-2">
            <span className="text-2xl md:text-3xl font-black tracking-tighter gradient-text block mb-6 font-headline">
              SYNC_SPLIT
            </span>
            <p className="text-on-surface-variant max-w-sm font-body">
              The split bill protocol built on Stellar. Distribute Lumens with
              cryptographic precision and near-instant settlement.
            </p>
          </div>
          <div>
            <h4 className="font-headline font-bold text-sm uppercase tracking-widest text-primary mb-6">
              Protocol
            </h4>
            <ul className="flex flex-col gap-3 text-sm text-on-surface-variant font-body">
              <li><NavLink to="/dashboard" className="hover:text-primary transition-colors">Dashboard</NavLink></li>
              <li><NavLink to="/wallet" className="hover:text-primary transition-colors">Wallet</NavLink></li>
              <li><NavLink to="/transactions" className="hover:text-primary transition-colors">Transactions</NavLink></li>
              <li><NavLink to="/settings" className="hover:text-primary transition-colors">Settings</NavLink></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-bold text-sm uppercase tracking-widest text-secondary mb-6">
              Resources
            </h4>
            <ul className="flex flex-col gap-3 text-sm text-on-surface-variant font-body">
              <li><a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">Stellar.org</a></li>
              <li><a href="https://www.freighter.app/" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">Freighter Wallet</a></li>
              <li><a href="https://stellar.expert" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">Stellar Expert</a></li>
              <li><a href="https://friendbot.stellar.org" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">Friendbot (Testnet)</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row justify-between items-center border-t border-outline-variant/10 pt-12 gap-6">
          <span className="text-xs text-outline font-label uppercase tracking-widest">
            © 2024 SYNC_SPLIT PROTOCOL. STELLAR TESTNET.
          </span>
        </div>
      </footer>
    </div>
  );
}
