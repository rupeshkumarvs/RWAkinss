import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { copyToClipboard } from '../../utils/helpers';
import { truncateAddress } from '../../utils/stellar';

/**
 * QR Code modal for receiving XLM — glassmorphic overlay
 * with kinetic corner brackets and copy-to-clipboard.
 */
export default function QRModal({ isOpen, onClose, publicKey }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(publicKey);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
            className="absolute inset-0 bg-surface-container-lowest/60 backdrop-blur-md"
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

            <div className="relative p-8 flex flex-col items-center">
              {/* Header */}
              <div className="w-full flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-container to-secondary flex items-center justify-center shadow-lg shadow-primary-container/20">
                    <span
                      className="material-symbols-outlined text-on-primary-fixed text-lg"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      qr_code_2
                    </span>
                  </div>
                  <div>
                    <h2 className="font-headline text-lg font-bold tracking-tight text-on-surface">
                      Receive Assets
                    </h2>
                    <p className="font-label text-[10px] uppercase tracking-widest text-outline">
                      Stellar Network
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

              {/* QR Code with Corner Brackets */}
              <div className="relative group">
                <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-primary-container/50 rounded-tl-lg" />
                <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-primary-container/50 rounded-tr-lg" />
                <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-primary-container/50 rounded-bl-lg" />
                <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-primary-container/50 rounded-br-lg" />

                <div className="p-4 bg-white rounded-xl shadow-[0_0_40px_rgba(124,58,237,0.15)] group-hover:scale-[1.02] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                  {publicKey ? (
                    <QRCodeSVG
                      value={publicKey}
                      size={192}
                      level="M"
                      bgColor="#ffffff"
                      fgColor="#131318"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-surface-container-high rounded-lg flex items-center justify-center text-outline text-sm">
                      No wallet connected
                    </div>
                  )}
                </div>
              </div>

              {/* Wallet Address */}
              <div className="mt-12 w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label text-[10px] uppercase tracking-widest text-outline">
                    Wallet Address
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-tertiary font-bold tracking-widest uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary shadow-[0_0_8px_rgba(78,222,162,0.8)]" />
                    Verified
                  </span>
                </div>
                <div
                  className="relative flex items-center bg-surface-container-lowest/80 rounded-xl p-4 group cursor-pointer border border-outline-variant/10 hover:border-primary-container/30 transition-all duration-300"
                  onClick={handleCopy}
                >
                  <div className="flex-1 overflow-hidden">
                    <p className="font-headline text-violet-400 font-medium truncate tracking-wide text-sm">
                      {publicKey || 'Not connected'}
                    </p>
                  </div>
                  <button
                    className="ml-4 flex items-center gap-2 px-4 py-2 bg-primary-container/10 hover:bg-primary-container text-primary hover:text-on-primary-container rounded-lg transition-all duration-300 active:scale-90 cursor-pointer"
                    onClick={handleCopy}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copied ? 'check' : 'content_copy'}
                    </span>
                    <span className="font-label text-xs font-bold uppercase tracking-tighter">
                      {copied ? 'Copied!' : 'Copy'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Warning Footer */}
              <div className="mt-8 pt-6 border-t border-outline-variant/10 w-full flex items-start gap-3">
                <span className="material-symbols-outlined text-outline text-lg">info</span>
                <p className="text-[11px] leading-relaxed text-outline">
                  Only send <span className="text-on-surface font-semibold">XLM</span> or{' '}
                  <span className="text-on-surface font-semibold">Stellar assets</span> to this
                  address. Sending other assets may result in permanent loss.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
