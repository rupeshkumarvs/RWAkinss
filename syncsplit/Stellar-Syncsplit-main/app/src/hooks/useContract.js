import { useState, useCallback } from 'react';
import {
  callContract,
  readContract,
  addressToScVal,
  u64ToScVal,
  i128ToScVal,
  stringToScVal,
} from '../utils/contractClient';
import { xlmToStroops, stroopsToXlm, CONTRACT_ID } from '../utils/stellar';
import { logTransaction, logError } from '../utils/logger';

/**
 * Hook for interacting with the Split Bill smart contract.
 *
 * Returns:
 *  - createSplit, addParticipant, markPaid (write operations)
 *  - fetchSplit, fetchSplitCount (read operations)
 *  - loading, error, lastResult
 *  - contractConfigured — whether CONTRACT_ID is set
 */
export function useContract(publicKey, signTransaction) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [txStatus, setTxStatus] = useState('idle'); // idle, building, simulating, signing, submitting, confirming, success, error
  const [txHash, setTxHash] = useState(null);

  const contractConfigured = Boolean(CONTRACT_ID);

  const resetState = useCallback(() => {
    setError(null);
    setLastResult(null);
    setTxStatus('idle');
    setTxHash(null);
  }, []);

  // ─── Write: Create Split ─────────────────────────────────────────────────

  const createSplit = useCallback(async (totalAmountXlm, description) => {
    if (!publicKey || !signTransaction) {
      setError('Please connect your wallet first.');
      return null;
    }

    setLoading(true);
    setError(null);
    setTxStatus('building');
    setTxHash(null);

    try {
      const stroops = xlmToStroops(totalAmountXlm);

      const params = [
        addressToScVal(publicKey),
        i128ToScVal(stroops),
        stringToScVal(description || 'Split Bill'),
      ];

      const { result, txHash: hash } = await callContract(
        'create_split',
        params,
        publicKey,
        signTransaction,
        setTxStatus
      );

      setTxHash(hash);
      setLastResult(result);
      setTxStatus('success');
      setLoading(false);
      logTransaction({ wallet: publicKey, txHash: hash, action: 'create_split', details: { splitId: result, totalAmountXlm, description } });
      return result; // split ID

    } catch (err) {
      setError(err.message);
      setTxStatus('error');
      setLoading(false);
      logError({ wallet: publicKey, action: 'create_split', errorType: 'contract', message: err.message, details: { totalAmountXlm, description } });
      return null;
    }
  }, [publicKey, signTransaction]);

  // ─── Write: Add Participant ──────────────────────────────────────────────

  const addParticipant = useCallback(async (splitId, participantAddress, amountXlm) => {
    if (!publicKey || !signTransaction) {
      setError('Please connect your wallet first.');
      return false;
    }

    setLoading(true);
    setError(null);
    setTxStatus('building');
    setTxHash(null);

    try {
      const stroops = xlmToStroops(amountXlm);

      const params = [
        u64ToScVal(splitId),
        addressToScVal(participantAddress),
        i128ToScVal(stroops),
      ];

      const { txHash: hash } = await callContract(
        'add_participant',
        params,
        publicKey,
        signTransaction,
        setTxStatus
      );

      setTxHash(hash);
      setTxStatus('success');
      setLoading(false);
      logTransaction({ wallet: publicKey, txHash: hash, action: 'add_participant', details: { splitId, participantAddress, amountXlm } });
      return true;

    } catch (err) {
      setError(err.message);
      setTxStatus('error');
      setLoading(false);
      logError({ wallet: publicKey, action: 'add_participant', errorType: 'contract', message: err.message, details: { splitId } });
      return false;
    }
  }, [publicKey, signTransaction]);

  // ─── Write: Mark Paid ────────────────────────────────────────────────────

  const markPaid = useCallback(async (splitId, participantAddress) => {
    if (!publicKey || !signTransaction) {
      setError('Please connect your wallet first.');
      return false;
    }

    setLoading(true);
    setError(null);
    setTxStatus('building');
    setTxHash(null);

    try {
      const params = [
        u64ToScVal(splitId),
        addressToScVal(participantAddress || publicKey),
      ];

      const { txHash: hash } = await callContract(
        'mark_paid',
        params,
        publicKey,
        signTransaction,
        setTxStatus
      );

      setTxHash(hash);
      setTxStatus('success');
      setLoading(false);
      logTransaction({ wallet: publicKey, txHash: hash, action: 'mark_paid', details: { splitId, participantAddress: participantAddress || publicKey } });
      return true;

    } catch (err) {
      setError(err.message);
      setTxStatus('error');
      setLoading(false);
      logError({ wallet: publicKey, action: 'mark_paid', errorType: 'contract', message: err.message, details: { splitId } });
      return false;
    }
  }, [publicKey, signTransaction]);

  // ─── Read: Fetch Split Details ───────────────────────────────────────────

  const fetchSplit = useCallback(async (splitId) => {
    if (!contractConfigured) return null;

    setLoading(true);
    setError(null);

    try {
      const params = [u64ToScVal(splitId)];
      const result = await readContract('get_split', params);

      // Transform the contract data for UI consumption
      if (result) {
        return {
          id: Number(result.id),
          creator: result.creator,
          totalAmount: stroopsToXlm(result.total_amount),
          totalAmountRaw: result.total_amount,
          description: result.description,
          participants: (result.participants || []).map(p => ({
            address: p.address,
            amount: stroopsToXlm(p.amount),
            amountRaw: p.amount,
            paid: p.paid,
          })),
          createdAt: result.created_at,
          settled: result.settled,
        };
      }
      return null;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [contractConfigured]);

  // ─── Read: Fetch Split Count ─────────────────────────────────────────────

  const fetchSplitCount = useCallback(async () => {
    if (!contractConfigured) return 0;

    try {
      const result = await readContract('get_split_count');
      return Number(result) || 0;
    } catch {
      return 0;
    }
  }, [contractConfigured]);

  return {
    createSplit,
    addParticipant,
    markPaid,
    fetchSplit,
    fetchSplitCount,
    loading,
    error,
    lastResult,
    txStatus,
    txHash,
    resetState,
    contractConfigured,
  };
}
