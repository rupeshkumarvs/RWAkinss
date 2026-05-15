import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  getTransactions,
  getErrors,
  getUserActions,
  downloadLogs,
  clearAll,
  exportAll,
} from '../../utils/logger';

/**
 * AdminPanel — Hidden dev panel for viewing/exporting logs.
 * Activated via Ctrl+Shift+L or ?admin=true query param.
 */
export default function AdminPanel() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('transactions');
  const [data, setData] = useState({ transactions: [], errors: [], actions: [] });

  // Keyboard shortcut: Ctrl+Shift+L
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Query param check
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('admin') === 'true') {
      setOpen(true);
    }
  }, []);

  // Refresh data when opened
  useEffect(() => {
    if (open) refreshData();
  }, [open]);

  const refreshData = useCallback(() => {
    setData({
      transactions: getTransactions(),
      errors: getErrors(),
      actions: getUserActions(),
    });
  }, []);

  const handleClear = () => {
    if (window.confirm('Clear all SyncSplit logs? This cannot be undone.')) {
      clearAll();
      refreshData();
    }
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(exportAll(), null, 2));
  };

  if (!open) return null;

  const tabs = [
    { id: 'transactions', label: 'Transactions', icon: 'receipt_long', count: data.transactions.length },
    { id: 'errors', label: 'Errors', icon: 'error', count: data.errors.length },
    { id: 'actions', label: 'Actions', icon: 'timeline', count: data.actions.length },
  ];

  const currentData = data[tab] || [];

  return (
    <AnimatePresence>
      <motion.div
        key="admin-panel"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-surface-container rounded-2xl border border-outline-variant/15 shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
              <h2 className="font-headline font-bold text-on-surface">SyncSplit Logger</h2>
              <span className="text-[10px] font-mono text-outline bg-surface-container-highest px-2 py-0.5 rounded">
                Ctrl+Shift+L
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={refreshData} className="p-2 hover:bg-surface-container-highest rounded-lg transition-colors cursor-pointer" title="Refresh">
                <span className="material-symbols-outlined text-sm text-outline">refresh</span>
              </button>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-surface-container-highest rounded-lg transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-sm text-outline">close</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 pt-3 flex gap-1 border-b border-outline-variant/10">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-xs font-headline font-bold uppercase tracking-wider rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
                  tab === t.id
                    ? 'bg-surface-container-highest text-on-surface border-b-2 border-primary'
                    : 'text-outline hover:text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{t.icon}</span>
                {t.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  tab === t.id ? 'bg-primary/15 text-primary' : 'bg-surface-container-highest text-outline'
                }`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto p-4">
            {currentData.length === 0 ? (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-4xl text-outline mb-3 block">inbox</span>
                <p className="text-sm text-outline">No {tab} logged yet.</p>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-outline uppercase tracking-wider">
                    <th className="pb-2 px-2">#</th>
                    <th className="pb-2 px-2">Time</th>
                    <th className="pb-2 px-2">Wallet</th>
                    <th className="pb-2 px-2">Action</th>
                    {tab === 'transactions' && <th className="pb-2 px-2">TX Hash</th>}
                    {tab === 'errors' && <th className="pb-2 px-2">Type</th>}
                    {tab === 'errors' && <th className="pb-2 px-2">Message</th>}
                    {tab === 'actions' && <th className="pb-2 px-2">Details</th>}
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((entry, i) => (
                    <tr key={entry.id || i} className="border-t border-outline-variant/5 hover:bg-surface-container-highest/50">
                      <td className="py-2 px-2 text-outline">{i + 1}</td>
                      <td className="py-2 px-2 font-mono text-outline whitespace-nowrap">
                        {entry.timestamp?.slice(11, 19) || '—'}
                      </td>
                      <td className="py-2 px-2 font-mono text-on-surface-variant">
                        {entry.walletTruncated || '—'}
                      </td>
                      <td className="py-2 px-2 text-on-surface font-bold">
                        {entry.action || '—'}
                      </td>
                      {tab === 'transactions' && (
                        <td className="py-2 px-2">
                          {entry.txHash ? (
                            <a
                              href={entry.stellarExpertUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-primary hover:underline"
                            >
                              {entry.txHash.slice(0, 8)}...
                            </a>
                          ) : '—'}
                        </td>
                      )}
                      {tab === 'errors' && (
                        <>
                          <td className="py-2 px-2">
                            <span className="px-1.5 py-0.5 bg-error/10 text-error rounded text-[10px] font-bold uppercase">
                              {entry.errorType}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-on-surface-variant max-w-[200px] truncate" title={entry.message}>
                            {entry.message}
                          </td>
                        </>
                      )}
                      {tab === 'actions' && (
                        <td className="py-2 px-2 text-outline font-mono">
                          {entry.details ? JSON.stringify(entry.details).slice(0, 50) : '—'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-3 border-t border-outline-variant/10 flex items-center justify-between">
            <span className="text-[10px] text-outline">
              {data.transactions.length} tx · {data.errors.length} errors · {data.actions.length} actions
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleClear}
                className="px-3 py-1.5 text-xs text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer font-bold"
              >
                Clear Logs
              </button>
              <button
                onClick={handleCopyJSON}
                className="px-3 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer font-bold"
              >
                Copy JSON
              </button>
              <button
                onClick={downloadLogs}
                className="px-4 py-1.5 text-xs gradient-btn text-on-primary-fixed rounded-lg cursor-pointer font-bold"
              >
                Export JSON
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
