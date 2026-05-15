import { motion } from 'motion/react';
import { getTxExplorerUrl } from '../../utils/stellar';

/**
 * Transaction status display with animated states.
 * Shows building/signing/submitting/success/error with appropriate animations.
 */
export default function TransactionStatus({ status, txHash, error, onReset }) {
  const states = {
    building: {
      icon: 'engineering',
      label: 'Building Transaction',
      description: 'Constructing the Stellar transaction...',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    signing: {
      icon: 'fingerprint',
      label: 'Awaiting Signature',
      description: 'Please approve in Freighter wallet...',
      color: 'text-secondary',
      bg: 'bg-secondary/10',
    },
    submitting: {
      icon: 'cloud_upload',
      label: 'Submitting to Network',
      description: 'Broadcasting to Stellar Testnet...',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    success: {
      icon: 'check_circle',
      label: 'Transaction Successful!',
      description: 'Your XLM has been sent successfully.',
      color: 'text-tertiary',
      bg: 'bg-tertiary/10',
    },
    error: {
      icon: 'error',
      label: 'Transaction Failed',
      description: error || 'Something went wrong.',
      color: 'text-error',
      bg: 'bg-error/10',
    },
  };

  const current = states[status] || states.building;
  const isLoading = ['building', 'signing', 'submitting'].includes(status);

  return (
    <motion.div
      className="flex flex-col items-center text-center py-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated Icon */}
      <motion.div
        className={`w-20 h-20 rounded-full ${current.bg} flex items-center justify-center mb-6 relative`}
        animate={
          status === 'success'
            ? { scale: [1, 1.1, 1], boxShadow: ['0 0 0 0 rgba(78,222,162,0)', '0 0 30px 10px rgba(78,222,162,0.3)', '0 0 0 0 rgba(78,222,162,0)'] }
            : status === 'error'
            ? { x: [0, -5, 5, -5, 5, 0] }
            : {}
        }
        transition={
          status === 'success'
            ? { duration: 1.5, repeat: 1 }
            : status === 'error'
            ? { duration: 0.4 }
            : {}
        }
      >
        {isLoading && (
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
        )}
        <span
          className={`material-symbols-outlined text-3xl ${current.color}`}
          style={status === 'success' ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          {current.icon}
        </span>
      </motion.div>

      {/* Status Text */}
      <h3 className={`font-headline text-xl font-bold mb-2 ${current.color}`}>
        {current.label}
      </h3>
      <p className="text-sm text-outline max-w-sm">{current.description}</p>

      {/* Loading Dots */}
      {isLoading && (
        <div className="flex gap-1.5 mt-4">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      )}

      {/* Success: tx hash link */}
      {status === 'success' && txHash && (
        <a
          href={getTxExplorerUrl(txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <span className="material-symbols-outlined text-sm">open_in_new</span>
          View on Stellar Expert
        </a>
      )}

      {/* Done / Retry Button */}
      {(status === 'success' || status === 'error') && onReset && (
        <button
          onClick={onReset}
          className="mt-6 px-6 py-3 bg-surface-container-high hover:bg-surface-container-highest rounded-xl text-sm font-headline font-bold uppercase tracking-wider text-on-surface transition-all cursor-pointer"
        >
          {status === 'success' ? 'Done' : 'Try Again'}
        </button>
      )}
    </motion.div>
  );
}
