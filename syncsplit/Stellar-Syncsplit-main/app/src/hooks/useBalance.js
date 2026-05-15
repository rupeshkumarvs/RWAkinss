import { useState, useEffect, useCallback } from 'react';
import { HORIZON_URL } from '../utils/stellar';

/**
 * Hook to fetch XLM balance from Stellar Horizon Testnet.
 *
 * @param {string|null} publicKey — Stellar public key
 * Returns: { balance, loading, error, refetch }
 */
export function useBalance(publicKey) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBalance = useCallback(async () => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${HORIZON_URL}/accounts/${publicKey}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Account not found. Fund it via Friendbot first.');
          setBalance('0');
          return;
        }
        throw new Error(`Horizon returned ${response.status}`);
      }

      const data = await response.json();
      const nativeBalance = data.balances?.find(b => b.asset_type === 'native');
      setBalance(nativeBalance ? nativeBalance.balance : '0');
    } catch (err) {
      setError(err.message || 'Failed to fetch balance');
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance,
  };
}
