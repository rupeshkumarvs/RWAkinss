import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'motion/react';
import { useBalance } from '../hooks/useBalance';
import { formatXLM } from '../utils/stellar';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import QRModal from '../components/wallet/QRModal';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';

/**
 * Wallet page — portfolio overview with XLM balance and QR modal.
 */
export default function WalletPage() {
  const wallet = useOutletContext();
  const { balance, loading } = useBalance(wallet.publicKey);
  const [qrOpen, setQrOpen] = useState(false);

  return (
    <div className="space-y-12">
      {/* Hero Portfolio Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Bento */}
        <GlassCard className="lg:col-span-2 p-8 md:p-10 flex flex-col justify-between min-h-[280px] md:min-h-[320px]">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
          <div className="relative z-10">
            <span className="font-headline text-xs uppercase tracking-[0.3em] text-outline-variant">
              XLM Balance
            </span>
            {loading ? (
              <LoadingSkeleton width="70%" height="4rem" rounded="rounded-xl" className="mt-4" />
            ) : (
              <h2 className="font-headline text-5xl md:text-6xl lg:text-7xl font-bold mt-4 tracking-tighter text-on-surface">
                {formatXLM(balance || '0')}
                <span className="text-outline-variant/50 text-2xl md:text-3xl ml-2">XLM</span>
              </h2>
            )}
            {wallet.isConnected && (
              <div className="flex items-center gap-3 mt-6">
                <span className="px-3 py-1 bg-tertiary/10 text-tertiary rounded-full text-sm font-headline font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  Testnet
                </span>
                <span className="text-outline-variant text-sm font-label uppercase tracking-widest">
                  Stellar Network
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-4 mt-8 relative z-10">
            <button
              onClick={() => setQrOpen(true)}
              className="px-6 py-3 bg-on-surface text-surface rounded-xl font-headline font-bold text-sm uppercase hover:bg-primary-fixed-dim transition-colors cursor-pointer"
            >
              Receive
            </button>
            <GradientButton variant="secondary" className="px-6 py-3 text-sm">
              Send
            </GradientButton>
          </div>
        </GlassCard>

        {/* Small Info Bentos */}
        <div className="grid grid-cols-1 gap-8">
          <motion.div
            className="bg-surface-container-high kinetic-border rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col justify-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="material-symbols-outlined text-secondary text-3xl">shield</span>
              <span className="text-[10px] font-headline uppercase tracking-widest text-outline">
                Security
              </span>
            </div>
            <h3 className="font-headline text-xl md:text-2xl font-bold">Freighter Auth</h3>
            <p className="text-sm text-outline-variant mt-2 font-body">
              Hardware-backed key signing via browser extension.
            </p>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-surface-container to-surface-container-lowest kinetic-border rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col justify-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="material-symbols-outlined text-tertiary text-3xl">rocket_launch</span>
              <span className="text-[10px] font-headline uppercase tracking-widest text-outline">
                Network
              </span>
            </div>
            <h3 className="font-headline text-xl md:text-2xl font-bold">Stellar Testnet</h3>
            <p className="text-sm text-outline-variant mt-2 font-body">
              3-5 second settlement. Base fee:{' '}
              <span className="text-tertiary font-bold">0.00001 XLM</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* XLM Asset Card */}
      <section className="space-y-6">
        <div className="flex items-end justify-between px-2">
          <div>
            <h4 className="font-headline text-xs uppercase tracking-[0.4em] text-outline-variant">
              Asset Overview
            </h4>
            <h3 className="font-headline text-2xl md:text-3xl font-bold mt-2">Holdings</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* XLM Card */}
          <GlassCard className="p-6 group hover:bg-surface-container-highest/50 transition-all duration-300" delay={0.1}>
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-container/30 to-secondary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">star</span>
              </div>
              <div className="text-right">
                <p className="text-xs font-headline uppercase tracking-widest text-outline">XLM</p>
                <p className="text-xs text-tertiary">Native</p>
              </div>
            </div>
            <h4 className="text-xl md:text-2xl font-headline font-bold">
              {loading ? (
                <LoadingSkeleton width="80%" height="1.5rem" />
              ) : (
                `${formatXLM(balance || '0')} XLM`
              )}
            </h4>
            <p className="text-sm text-outline-variant mt-1 font-body">Stellar Lumens</p>
          </GlassCard>

          {/* Placeholder cards for future assets */}
          {['USDC', 'SRT', 'AQUA'].map((asset, i) => (
            <GlassCard
              key={asset}
              className="p-6 opacity-40 hover:opacity-60 transition-opacity duration-300"
              delay={0.2 + i * 0.1}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-outline text-2xl">token</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-headline uppercase tracking-widest text-outline">{asset}</p>
                  <p className="text-xs text-outline">—</p>
                </div>
              </div>
              <h4 className="text-xl md:text-2xl font-headline font-bold text-outline">0.00</h4>
              <p className="text-sm text-outline-variant mt-1 font-body">Not held</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Ecosystem Section */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <motion.div
          className="lg:col-span-3 bg-surface-container-low rounded-2xl md:rounded-3xl overflow-hidden kinetic-border p-6 md:p-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-headline text-xl font-bold mb-6">Recent Activity</h3>
          {wallet.isConnected ? (
            <div className="space-y-1">
              {[
                { icon: 'call_received', text: 'Funded via Friendbot', amount: '+10,000 XLM', color: 'text-tertiary', bg: 'bg-tertiary/10', time: 'Initial funding' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-4 flex items-center justify-between hover:bg-surface-container transition-colors rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center`}>
                      <span className={`material-symbols-outlined ${item.color} text-sm`}>{item.icon}</span>
                    </div>
                    <div>
                      <p className="font-headline text-sm font-semibold">{item.text}</p>
                      <p className="text-xs text-outline font-body">{item.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-headline ${item.color} font-bold`}>{item.amount}</p>
                    <p className="text-[10px] text-outline uppercase">Completed</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-outline-variant py-8 text-center">
              Connect your wallet to see activity
            </p>
          )}
        </motion.div>

        <motion.div
          className="lg:col-span-2 bg-surface-container rounded-2xl md:rounded-3xl kinetic-border relative overflow-hidden flex flex-col p-6 md:p-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-surface-container-lowest via-transparent to-primary/5" />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <h3 className="font-headline text-xl font-bold">Network Info</h3>
            <p className="text-sm text-outline-variant mt-2 font-body">
              Connected to Stellar Testnet via Horizon API.
            </p>
            <div className="mt-8 flex flex-col gap-6">
              {[
                { label: 'Consensus', value: 'SCP', width: 'w-full' },
                { label: 'Avg Settlement', value: '~5s', width: 'w-3/4' },
                { label: 'Base Fee', value: '100 stroops', width: 'w-1/3' },
              ].map(item => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-xs font-headline uppercase tracking-widest text-outline">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r from-primary to-secondary ${item.width}`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-8">
              <div className="p-4 bg-tertiary/5 rounded-2xl border border-tertiary/10 flex items-center gap-4">
                <span className="material-symbols-outlined text-tertiary">auto_awesome</span>
                <p className="text-xs text-on-tertiary-container font-body leading-relaxed">
                  Fund your Testnet account via{' '}
                  <a
                    href={`https://friendbot.stellar.org?addr=${wallet.publicKey || ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-tertiary font-bold underline"
                  >
                    Friendbot
                  </a>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* QR Modal */}
      <QRModal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        publicKey={wallet.publicKey}
      />
    </div>
  );
}
