import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'motion/react';
import { useBalance } from '../hooks/useBalance';
import WalletWidget from '../components/wallet/WalletWidget';
import SplitCalculator from '../components/split/SplitCalculator';
import SplitDetails from '../components/split/SplitDetails';
import SplitEventFeed from '../components/split/SplitEventFeed';
import { CONTRACT_ID } from '../utils/stellar';

/**
 * Dashboard page — main hub with balance card, event feed, split calculator,
 * and on-chain split details viewer.
 */
export default function DashboardPage() {
  const ctx = useOutletContext();
  const { balance } = useBalance(ctx.publicKey);
  const [activeSplitId, setActiveSplitId] = useState(null);
  const [eventRefreshKey, setEventRefreshKey] = useState(0);

  const handleSplitCreated = (splitId) => {
    setActiveSplitId(splitId);
    setEventRefreshKey(k => k + 1);
    if (ctx.refreshEvents) ctx.refreshEvents();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Area */}
        <aside className="w-full lg:w-80 flex flex-col gap-6">
          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <WalletWidget
              publicKey={ctx.publicKey}
              isConnected={ctx.isConnected}
              walletName={ctx.walletName}
              onOpenModal={ctx.openModal}
            />
          </motion.div>

          {/* Not connected state */}
          {!ctx.isConnected && (
            <motion.div
              className="bg-surface-container rounded-xl p-6 inner-stroke text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="material-symbols-outlined text-4xl text-outline mb-3 block">account_balance_wallet</span>
              <p className="text-sm text-on-surface-variant mb-4">Connect your wallet to get started</p>
              <button
                onClick={ctx.openModal}
                disabled={ctx.connecting}
                className="w-full py-3 gradient-btn text-on-primary-fixed font-headline font-bold rounded-xl cursor-pointer disabled:opacity-50"
              >
                {ctx.connecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </motion.div>
          )}

          {/* On-chain Split Details */}
          {CONTRACT_ID && activeSplitId && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <SplitDetails
                splitId={activeSplitId}
                contract={ctx.contract}
                publicKey={ctx.publicKey}
                eventRefreshKey={eventRefreshKey}
              />
            </motion.div>
          )}

          {/* Event Feed */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {CONTRACT_ID ? (
              <SplitEventFeed
                events={ctx.events || []}
                loading={ctx.eventsLoading}
              />
            ) : (
              <div className="bg-surface-container-low rounded-xl p-6 inner-stroke">
                <h3 className="font-headline text-sm uppercase tracking-widest text-on-surface mb-4">
                  Contract Status
                </h3>
                <div className="flex items-start gap-3 bg-primary/5 rounded-lg p-4 border border-primary/10">
                  <span className="material-symbols-outlined text-primary text-lg">info</span>
                  <div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      No contract deployed yet. Set <code className="text-primary font-mono text-[10px]">VITE_CONTRACT_ID</code> in your <code className="text-primary font-mono text-[10px]">.env</code> file to enable on-chain splits.
                    </p>
                    <p className="text-[10px] text-outline mt-2">
                      See DEPLOYMENT.md for instructions.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </aside>

        {/* Primary Canvas: Split Calculator */}
        <motion.section
          className="flex-1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <SplitCalculator
            publicKey={ctx.publicKey}
            balance={balance}
            contract={ctx.contract}
            onSplitCreated={handleSplitCreated}
          />
        </motion.section>
      </div>

      {/* Bento Features Below */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className="col-span-1 md:col-span-2 bg-surface-container rounded-xl p-6 inner-stroke relative group"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-headline text-lg font-bold text-on-surface">Activity Stream</h3>
              <p className="text-sm text-outline">Real-time settlement tracking via Soroban</p>
            </div>
            <span className="material-symbols-outlined text-tertiary">monetization_on</span>
          </div>
          <div className="mt-8 flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {(ctx.events || []).slice(0, 4).map((event, i) => (
              <div
                key={event.id || i}
                className="flex-shrink-0 w-40 h-24 rounded-lg bg-surface-container-high p-3 flex flex-col justify-between border border-outline-variant/10"
              >
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-sm ${
                    event.eventType === 'payment_marked' ? 'text-tertiary' :
                    event.eventType === 'participant_added' ? 'text-secondary' :
                    'text-primary'
                  }`}>
                    {event.icon || 'receipt_long'}
                  </span>
                  <span className="text-[10px] text-outline font-mono">
                    L#{event.ledger || '—'}
                  </span>
                </div>
                <span className="text-xs font-bold text-on-surface truncate">
                  {event.displayName || 'Event'}
                </span>
              </div>
            ))}
            {(!ctx.events || ctx.events.length === 0) && [
              { color: 'bg-tertiary' },
              { color: 'bg-primary' },
              { color: 'bg-secondary' },
              { color: 'bg-tertiary' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-32 h-20 rounded-lg bg-surface-container-high p-3 flex flex-col justify-between border border-outline-variant/10 opacity-40"
              >
                <div className={`h-1 w-8 ${item.color} rounded-full`} />
                <span className="text-xs text-outline">Awaiting events</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-surface-container to-surface-container-highest rounded-xl p-6 inner-stroke flex flex-col justify-between"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <span
            className="material-symbols-outlined text-3xl text-primary-fixed-dim"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            bolt
          </span>
          <div>
            <h4 className="font-headline font-bold text-on-surface">Soroban Powered</h4>
            <p className="text-xs text-outline mt-2 leading-relaxed">
              Splits are stored on-chain via Soroban smart contracts with real-time event emission.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${CONTRACT_ID ? 'bg-tertiary animate-pulse' : 'bg-error'}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${CONTRACT_ID ? 'text-tertiary' : 'text-error'}`}>
                {CONTRACT_ID ? 'Contract Live' : 'Not Deployed'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
