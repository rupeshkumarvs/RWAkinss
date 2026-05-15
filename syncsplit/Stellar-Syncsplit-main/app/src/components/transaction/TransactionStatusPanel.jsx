import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getTxExplorerUrl } from '../../utils/stellar';

const STATUS_CONFIG = {
  building: {
    icon: 'engineering',
    label: 'Building Transaction',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
  },
  simulating: {
    icon: 'science',
    label: 'Simulating Contract',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    border: 'border-secondary/20',
  },
  signing: {
    icon: 'fingerprint',
    label: 'Awaiting Signature',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    border: 'border-secondary/20',
  },
  submitting: {
    icon: 'cloud_upload',
    label: 'Submitting to Network',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
  },
  confirming: {
    icon: 'hourglass_top',
    label: 'Confirming on Chain',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
  },
  success: {
    icon: 'check_circle',
    label: 'Transaction Confirmed',
    color: 'text-tertiary',
    bg: 'bg-tertiary/10',
    border: 'border-tertiary/20',
  },
  error: {
    icon: 'error',
    label: 'Transaction Failed',
    color: 'text-error',
    bg: 'bg-error/10',
    border: 'border-error/20',
  },
};

/**
 * Persistent bottom-right toast panel for contract transaction status.
 * Shows state transitions: Building → Simulating → Signing → Submitting → Confirmed.
 * Auto-dismisses after success, stays visible on error.
 */
export default function TransactionStatusPanel({ status, txHash, error, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status && status !== 'idle') {
      setVisible(true);
    }

    // Auto-dismiss on success after 8 seconds
    if (status === 'success') {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDismiss) onDismiss();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [status, onDismiss]);

  const config = STATUS_CONFIG[status] || null;
  const isLoading = ['building', 'simulating', 'signing', 'submitting', 'confirming'].includes(status);

  if (!config) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[70] max-w-sm w-full"
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className={`glass-card backdrop-blur-2xl rounded-xl p-4 border ${config.border} shadow-2xl relative overflow-hidden`}>
            {/* Subtle glow line at top */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${config.bg}`} />

            <div className="flex items-start gap-3">
              {/* Animated Icon */}
              <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0 relative`}>
                {isLoading && (
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                )}
                <span
                  className={`material-symbols-outlined text-lg ${config.color}`}
                  style={status === 'success' ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {config.icon}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-headline font-bold ${config.color}`}>
                  {config.label}
                </p>

                {/* Loading dots */}
                {isLoading && (
                  <div className="flex gap-1 mt-1.5">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full bg-current ${config.color}`}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                )}

                {/* Error message */}
                {status === 'error' && error && (
                  <p className="text-xs text-error/80 mt-1 leading-relaxed line-clamp-2">
                    {error}
                  </p>
                )}

                {/* Success: tx hash */}
                {status === 'success' && txHash && (
                  <a
                    href={getTxExplorerUrl(txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-tertiary hover:underline mt-1 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                    View on Stellar Expert
                  </a>
                )}
              </div>

              {/* Dismiss button */}
              {(status === 'success' || status === 'error') && (
                <button
                  onClick={() => {
                    setVisible(false);
                    if (onDismiss) onDismiss();
                  }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-highest transition-colors cursor-pointer flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
