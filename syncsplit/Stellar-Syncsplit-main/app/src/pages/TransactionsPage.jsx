import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'motion/react';
import SendTransaction from '../components/transaction/SendTransaction';

/**
 * Transactions page — history list with filters + send funds panel.
 * Uses multi-wallet context from AppLayout.
 */
export default function TransactionsPage() {
  const ctx = useOutletContext();
  const [filter, setFilter] = useState('all');

  const transactions = [
    {
      id: 1, type: 'received', icon: 'call_received', title: 'Received XLM',
      detail: 'From: GBCX...91ab • Split payment', amount: '+250.00 XLM',
      usd: '~$25.00 USD', status: 'Completed', statusColor: 'text-tertiary',
      statusBg: 'bg-tertiary/10', hoverBg: 'from-tertiary/5',
    },
    {
      id: 2, type: 'sent', icon: 'swap_horiz', title: 'Split Payment',
      detail: 'Dinner split with 3 friends', amount: '-142.50 XLM',
      usd: '~$14.25 USD', status: 'Pending', statusColor: 'text-primary',
      statusBg: 'bg-primary/10', hoverBg: 'from-primary/5', pulse: true,
    },
    {
      id: 3, type: 'sent', icon: 'warning', title: 'Send Funds',
      detail: 'To: GDKL...9c21 • Insufficient balance', amount: '-500.00 XLM',
      usd: 'Failed', status: 'Failed', statusColor: 'text-error',
      statusBg: 'bg-error/10', hoverBg: 'from-error/5',
    },
    {
      id: 4, type: 'received', icon: 'send', title: 'Friendbot Funding',
      detail: 'Stellar Testnet Friendbot', amount: '+10,000 XLM',
      usd: 'Initial funding', status: 'Completed', statusColor: 'text-tertiary',
      statusBg: 'bg-tertiary/10', hoverBg: 'from-tertiary/5',
    },
  ];

  const filtered = useMemo(() => {
    if (filter === 'all') return transactions;
    if (filter === 'sent') return transactions.filter(t => t.type === 'sent');
    if (filter === 'received') return transactions.filter(t => t.type === 'received');
    return transactions;
  }, [filter]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter mb-2 text-on-surface">
            Transactions
          </h1>
          <p className="text-outline font-body max-w-lg">
            Monitor your digital flow. View Stellar transfers, split payments, and settlement history.
          </p>
        </motion.div>
        <motion.div
          className="flex gap-1 bg-surface-container rounded-lg p-1"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {['all', 'sent', 'received'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                'px-5 md:px-6 py-2 text-sm font-bold uppercase tracking-wider transition-all rounded-md cursor-pointer',
                filter === f
                  ? 'bg-surface-container-high text-primary'
                  : 'text-outline hover:text-on-surface',
              ].join(' ')}
            >
              {f}
            </button>
          ))}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* History Section */}
        <div className="xl:col-span-7 2xl:xl:col-span-8 space-y-6">
          {/* Search */}
          <motion.div
            className="flex items-center gap-4 bg-surface-container-low p-2 rounded-xl glass-card kinetic-border"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex-1 flex items-center px-4 gap-3">
              <span className="material-symbols-outlined text-outline">search</span>
              <input
                type="text"
                placeholder="Search by address or memo..."
                className="bg-transparent border-none focus:ring-0 text-sm w-full text-on-surface placeholder:text-outline/50"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 hover:bg-surface-container rounded-lg text-xs font-bold uppercase tracking-widest text-outline transition-all cursor-pointer">
              Filter <span className="material-symbols-outlined text-xs">tune</span>
            </button>
          </motion.div>

          {/* Transaction List */}
          <div className="space-y-4">
            {filtered.map((tx, i) => (
              <motion.div
                key={tx.id}
                className="group relative bg-surface-container p-5 md:p-6 rounded-xl transition-all duration-300 hover:translate-x-2 glass-card kinetic-border overflow-hidden cursor-pointer"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${tx.hoverBg} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4 md:gap-5">
                    <div className={`w-10 md:w-12 h-10 md:h-12 rounded-full ${tx.statusBg} flex items-center justify-center relative`}>
                      <span className={`material-symbols-outlined ${tx.statusColor} ${tx.pulse ? 'animate-pulse' : ''}`}>
                        {tx.icon}
                      </span>
                      {tx.pulse && (
                        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-headline font-bold text-base md:text-lg">{tx.title}</h3>
                        <div className={`px-2 py-0.5 rounded ${tx.statusBg} text-[10px] font-black uppercase ${tx.statusColor} tracking-widest ${tx.pulse ? 'animate-pulse' : ''}`}>
                          {tx.status}
                        </div>
                      </div>
                      <p className="text-xs text-outline">{tx.detail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg md:text-xl font-headline font-black ${tx.statusColor}`}>
                      {tx.amount}
                    </p>
                    <p className="text-xs text-outline">{tx.usd}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center pt-4 md:pt-8">
            <button className="px-8 py-3 bg-surface-container-high text-outline rounded-full text-xs font-black uppercase tracking-[0.2em] hover:text-on-surface hover:bg-surface-container-highest transition-all cursor-pointer">
              View All History
            </button>
          </div>
        </div>

        {/* Right Column: Send Funds */}
        <div className="xl:col-span-5 2xl:xl:col-span-4 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SendTransaction
              publicKey={ctx.publicKey}
              signTransaction={ctx.signTransaction}
            />
          </motion.div>

          {/* Network Status */}
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-surface-container p-5 rounded-2xl border border-outline-variant/10">
              <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-3">
                Base Fee
              </p>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-sm">payments</span>
                <span className="text-lg font-headline font-bold text-on-surface">100 stroops</span>
              </div>
            </div>
            <div className="bg-surface-container p-5 rounded-2xl border border-outline-variant/10">
              <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-3">
                Wallet
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                <span className="text-lg font-headline font-bold text-on-surface">
                  {ctx.walletName || 'None'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
