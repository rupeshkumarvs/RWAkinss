import { useState, useMemo } from 'react';
import { validateAddress, formatXLM } from '../../utils/stellar';
import { useTransaction } from '../../hooks/useTransaction';
import { useBalance } from '../../hooks/useBalance';
import GradientButton from '../ui/GradientButton';
import TransactionStatus from './TransactionStatus';

/**
 * Send Funds card — uses multi-wallet signTransaction from context.
 * Adapted for any Stellar wallet via StellarWalletsKit.
 */
export default function SendTransaction({ publicKey, signTransaction }) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [showStatus, setShowStatus] = useState(false);

  const { balance } = useBalance(publicKey);
  const tx = useTransaction(signTransaction, publicKey);

  const isValidRecipient = useMemo(() => {
    if (!recipient.trim()) return null; // undetermined
    return validateAddress(recipient.trim());
  }, [recipient]);

  const parsedAmount = useMemo(() => parseFloat(amount) || 0, [amount]);

  const insufficientBalance = useMemo(() => {
    if (!balance) return false;
    return parsedAmount > parseFloat(balance);
  }, [parsedAmount, balance]);

  const canSubmit = useMemo(() => {
    return (
      isValidRecipient === true &&
      parsedAmount > 0 &&
      !insufficientBalance &&
      !tx.isLoading &&
      !!publicKey &&
      !!signTransaction
    );
  }, [isValidRecipient, parsedAmount, insufficientBalance, tx.isLoading, publicKey, signTransaction]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRecipient(text);
    } catch {
      // Clipboard access denied
    }
  };

  const handleMax = () => {
    if (balance) {
      // Leave 1 XLM for fees and minimum balance
      const max = Math.max(0, parseFloat(balance) - 1.5);
      setAmount(max.toFixed(7));
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setShowStatus(true);
    await tx.sendPayment(recipient.trim(), parsedAmount.toFixed(7), memo || undefined);
  };

  if (showStatus && (tx.isLoading || tx.isSuccess || tx.isError)) {
    return (
      <section className="bg-surface-container-high rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden border border-outline-variant/10">
        <TransactionStatus
          status={tx.status}
          txHash={tx.txHash}
          error={tx.error}
          onReset={() => {
            tx.reset();
            setShowStatus(false);
            setRecipient('');
            setAmount('');
            setMemo('');
          }}
        />
      </section>
    );
  }

  return (
    <section className="bg-surface-container-high rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden border border-outline-variant/10">
      {/* Decorative glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[80px]" />

      <div className="relative z-10">
        <h2 className="text-xl md:text-2xl font-black font-headline tracking-tight mb-6 md:mb-8">
          Send Funds
        </h2>

        <div className="space-y-5 md:space-y-6">
          {/* Asset */}
          <div>
            <label className="block text-[10px] font-black text-outline uppercase tracking-widest mb-2 font-headline">
              Asset
            </label>
            <div className="w-full flex items-center bg-surface-container-low p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-container to-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary-fixed text-sm">star</span>
                </div>
                <span className="font-bold text-on-surface">Stellar Lumens (XLM)</span>
              </div>
            </div>
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-[10px] font-black text-outline uppercase tracking-widest mb-2 font-headline">
              Recipient Address
            </label>
            <div className="relative">
              <input
                type="text"
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                placeholder="G..."
                className={[
                  'w-full bg-surface-container-low border-none focus:ring-1 p-4 rounded-xl text-sm font-mono placeholder:text-outline/30',
                  isValidRecipient === false
                    ? 'focus:ring-error/50 text-error'
                    : 'focus:ring-primary/30 text-on-surface',
                ].join(' ')}
              />
              <button
                onClick={handlePaste}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary font-black text-xs uppercase tracking-widest hover:underline cursor-pointer"
              >
                Paste
              </button>
            </div>
            {isValidRecipient === false && (
              <p className="text-xs text-error mt-1">Invalid Stellar address</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-[10px] font-black text-outline uppercase tracking-widest font-headline">
                Amount
              </label>
              <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
                Balance: {balance ? formatXLM(balance) : '—'} XLM
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={[
                  'w-full bg-surface-container-low border-none focus:ring-1 p-5 rounded-xl text-2xl md:text-3xl font-headline font-black',
                  insufficientBalance
                    ? 'focus:ring-error/50 text-error'
                    : 'focus:ring-primary/30 text-on-surface',
                ].join(' ')}
              />
              <button
                onClick={handleMax}
                className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-surface-container hover:bg-primary/20 rounded text-[10px] font-black text-primary transition-all cursor-pointer"
              >
                MAX
              </button>
            </div>
            {insufficientBalance && (
              <p className="text-xs text-error mt-1">Insufficient balance</p>
            )}
          </div>

          {/* Memo (optional) */}
          <div>
            <label className="block text-[10px] font-black text-outline uppercase tracking-widest mb-2 font-headline">
              Memo (Optional)
            </label>
            <input
              type="text"
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="Payment note..."
              maxLength={28}
              className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/30 p-4 rounded-xl text-sm text-on-surface placeholder:text-outline/30"
            />
          </div>

          {/* Fee Info */}
          <div className="bg-surface-container p-4 rounded-xl space-y-2 border border-outline-variant/5">
            <div className="flex justify-between text-xs">
              <span className="text-outline">Base Fee</span>
              <span className="text-on-surface font-mono">0.00001 XLM (100 stroops)</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-outline">Network</span>
              <span className="text-tertiary font-bold">Stellar Testnet</span>
            </div>
          </div>

          {/* Submit */}
          <GradientButton
            fullWidth
            disabled={!canSubmit}
            loading={tx.isLoading}
            onClick={handleSubmit}
          >
            {!publicKey ? 'Connect Wallet First' : 'Authorize Transaction'}
          </GradientButton>
        </div>
      </div>
    </section>
  );
}
