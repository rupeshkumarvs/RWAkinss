import { useState, useCallback } from 'react';
import {
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  Memo,
} from '@stellar/stellar-sdk';
import { HORIZON_URL, NETWORK_PASSPHRASE } from '../utils/stellar';
import { logTransaction, logError } from '../utils/logger';

/**
 * Transaction states: idle → building → signing → submitting → success | error
 */
const STATUS = {
  IDLE: 'idle',
  BUILDING: 'building',
  SIGNING: 'signing',
  SUBMITTING: 'submitting',
  SUCCESS: 'success',
  ERROR: 'error',
};

/**
 * Hook to build, sign, and submit Stellar transactions.
 *
 * Now uses the unified signTransaction function from useWallet (StellarWalletsKit)
 * instead of direct Freighter API calls.
 *
 * @param {Function} signTransaction - Sign function from useWallet
 * @param {string} publicKey - Currently connected public key
 *
 * Returns: { sendPayment, status, txHash, error, reset }
 */
export function useTransaction(signTransaction, publicKey) {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  const reset = useCallback(() => {
    setStatus(STATUS.IDLE);
    setTxHash(null);
    setError(null);
  }, []);

  /**
   * Send XLM from the connected wallet (any wallet via StellarWalletsKit).
   *
   * @param {string} destination — recipient Stellar address
   * @param {string} amount — XLM amount as string
   * @param {string} [memo] — optional memo text
   */
  const sendPayment = useCallback(async (destination, amount, memo) => {
    setStatus(STATUS.BUILDING);
    setTxHash(null);
    setError(null);

    try {
      if (!publicKey) {
        throw new Error('No wallet connected. Please connect a wallet first.');
      }

      if (!signTransaction) {
        throw new Error('Wallet sign function not available. Please reconnect your wallet.');
      }

      // 1. Load sender account from Horizon
      const accountResponse = await fetch(`${HORIZON_URL}/accounts/${publicKey}`);
      if (!accountResponse.ok) {
        if (accountResponse.status === 404) {
          throw new Error('Account not funded. Use Friendbot to fund your testnet account.');
        }
        throw new Error('Failed to load sender account.');
      }
      const accountData = await accountResponse.json();

      // 2. Build the transaction
      const account = {
        accountId: () => publicKey,
        sequenceNumber: () => accountData.sequence,
        incrementSequenceNumber: () => {
          accountData.sequence = (BigInt(accountData.sequence) + 1n).toString();
        },
      };

      const builder = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      builder.addOperation(
        Operation.payment({
          destination,
          asset: Asset.native(),
          amount: String(amount),
        })
      );

      if (memo) {
        builder.addMemo(Memo.text(memo));
      }

      builder.setTimeout(180);
      const transaction = builder.build();

      // 3. Sign via wallet (StellarWalletsKit or Freighter fallback)
      setStatus(STATUS.SIGNING);
      const { signedTxXdr } = await signTransaction(transaction.toXDR(), {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: publicKey,
      });

      // 4. Submit to Horizon
      setStatus(STATUS.SUBMITTING);
      const submitResponse = await fetch(`${HORIZON_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `tx=${encodeURIComponent(signedTxXdr)}`,
      });

      const submitData = await submitResponse.json();

      if (!submitResponse.ok) {
        const extras = submitData?.extras?.result_codes;
        const detail = extras?.operations
          ? extras.operations.join(', ')
          : submitData.detail || 'Transaction failed';
        throw new Error(detail);
      }

      setTxHash(submitData.hash);
      setStatus(STATUS.SUCCESS);
      logTransaction({ wallet: publicKey, txHash: submitData.hash, action: 'send_xlm', details: { destination, amount, memo } });
    } catch (err) {
      const msg = err.message || 'Transaction failed';

      // User-friendly error mapping
      if (msg.includes('User declined') || msg.includes('rejected') || msg.includes('cancelled')) {
        setError('Transaction was rejected in your wallet.');
        logError({ wallet: publicKey, action: 'send_xlm', errorType: 'transaction', message: 'User rejected', details: { destination, amount } });
      } else if (msg.includes('op_underfunded') || msg.includes('insufficient')) {
        setError('Insufficient XLM balance for this transaction.');
        logError({ wallet: publicKey, action: 'send_xlm', errorType: 'transaction', message: 'Insufficient balance', details: { destination, amount } });
      } else if (msg.includes('op_no_destination')) {
        setError('Destination account does not exist. It may need to be funded first.');
        logError({ wallet: publicKey, action: 'send_xlm', errorType: 'transaction', message: 'No destination', details: { destination, amount } });
      } else {
        setError(msg);
        logError({ wallet: publicKey, action: 'send_xlm', errorType: 'transaction', message: msg, details: { destination, amount } });
      }

      setStatus(STATUS.ERROR);
    }
  }, [publicKey, signTransaction]);

  return {
    sendPayment,
    status,
    txHash,
    error,
    reset,
    isIdle: status === STATUS.IDLE,
    isBuilding: status === STATUS.BUILDING,
    isSigning: status === STATUS.SIGNING,
    isSubmitting: status === STATUS.SUBMITTING,
    isSuccess: status === STATUS.SUCCESS,
    isError: status === STATUS.ERROR,
    isLoading: [STATUS.BUILDING, STATUS.SIGNING, STATUS.SUBMITTING].includes(status),
  };
}
