'use client';

import React from 'react';
import { X } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WALLETS = [
  {
    name: 'Phantom',
    description: 'Most popular Solana wallet',
    icon: 'https://phantom.app/img/phantom-logo.svg', // Assuming a placeholder or public url, but we can build a simple icon
    link: 'https://phantom.app/',
    status: 'Install →',
    iconColor: '#AB9FF2',
  },
  {
    name: 'Solflare',
    description: 'Hardware wallet support',
    icon: 'https://solflare.com/assets/logo.svg',
    link: 'https://solflare.com/',
    status: 'Detected',
    iconColor: '#F2994A',
  },
  {
    name: 'Trust',
    description: 'Trust Wallet — mobile first',
    icon: 'https://trustwallet.com/assets/images/media/assets/trust_wallet_logo.png',
    link: 'https://trustwallet.com/',
    status: '',
    iconColor: '#3375BB',
  },
  {
    name: 'MetaMask',
    description: 'The most popular EVM wallet',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
    link: 'https://metamask.io/',
    status: 'Detected',
    iconColor: '#F6851B',
  },
];

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-[#13161F] border border-[rgba(255,255,255,0.1)] rounded-2xl overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[rgba(255,255,255,0.05)]">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-xl font-bold text-white font-cb-display">Connect Wallet</h2>
            <button 
              onClick={onClose}
              className="text-[rgba(255,255,255,0.45)] hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-[rgba(255,255,255,0.45)] font-cb-body">Choose your crypto wallet to continue</p>
        </div>

        {/* Wallet List */}
        <div className="p-4 space-y-2">
          {WALLETS.map((wallet) => (
            <a
              key={wallet.name}
              href={wallet.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition-colors group cursor-pointer border border-transparent hover:border-[rgba(255,255,255,0.05)]"
            >
              {/* Icon Placeholder */}
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
              >
                 {/* Using img if available, else a colored initial */}
                 <img src={wallet.icon} alt={wallet.name} className="w-8 h-8 object-contain" onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                 }} />
                 <span className="hidden font-bold text-lg" style={{ color: wallet.iconColor }}>{wallet.name[0]}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold font-cb-display text-base">{wallet.name}</h3>
                <p className="text-xs text-[rgba(255,255,255,0.45)] truncate font-cb-body">{wallet.description}</p>
              </div>

              {/* Status */}
              {wallet.status && (
                <div className="text-xs text-[rgba(255,255,255,0.45)] font-cb-body group-hover:text-white transition-colors">
                  {wallet.status}
                </div>
              )}
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[rgba(0,0,0,0.2)] border-t border-[rgba(255,255,255,0.05)] text-center">
          <p className="text-xs text-[rgba(255,255,255,0.3)] font-cb-body">
            By connecting, you agree to our <a href="#" className="text-[rgba(255,255,255,0.6)] hover:text-white underline decoration-[rgba(255,255,255,0.2)] underline-offset-2 transition-all">Terms of Service</a>
          </p>
        </div>
      </div>
    </div>
  );
};
