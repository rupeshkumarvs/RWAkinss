import { useState, useEffect, useCallback, useRef } from 'react';
import { truncateAddress, NETWORK_PASSPHRASE } from '../utils/stellar';
import { logUserAction, logError } from '../utils/logger';

/**
 * Multi-wallet hook — Freighter-first with StellarWalletsKit for other wallets.
 *
 * The key insight: Freighter's `isConnected()` only returns true if the user
 * has explicitly authorized the site. For first-time connection, we must call
 * `requestAccess()` directly, which triggers the Freighter popup.
 *
 * Wallet IDs (productId): 'freighter', 'xbull', 'albedo'
 */
export function useWallet() {
  const [publicKey, setPublicKey] = useState(null);
  const [walletName, setWalletName] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [kitReady, setKitReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const kitRef = useRef(null);
  const initCalled = useRef(false);

  // ─── Initialize StellarWalletsKit (background, non-blocking) ─────────────

  useEffect(() => {
    if (initCalled.current) return;
    initCalled.current = true;

    const initKit = async () => {
      try {
        const { StellarWalletsKit } = await import('@creit-tech/stellar-wallets-kit/sdk');
        const { defaultModules } = await import('@creit-tech/stellar-wallets-kit/modules/utils');

        StellarWalletsKit.init({
          modules: defaultModules(),
          network: NETWORK_PASSPHRASE,
        });

        kitRef.current = StellarWalletsKit;
        setKitReady(true);
      } catch (err) {
        console.warn('[useWallet] StellarWalletsKit init failed, using Freighter fallback:', err.message);
      }

      // Auto-reconnect from localStorage (uses Freighter directly for reliability)
      const savedWallet = localStorage.getItem('syncsplit_wallet');
      if (savedWallet) {
        try {
          const freighterApi = await import('@stellar/freighter-api');
          const { isConnected: freighterConnected } = await freighterApi.isConnected();

          if (freighterConnected) {
            const { address } = await freighterApi.getAddress();
            if (address) {
              setPublicKey(address);
              setWalletName(savedWallet);
              setIsConnected(true);
              return;
            }
          }
        } catch {
          // Silent — can't auto-reconnect, user will connect manually
        }
        localStorage.removeItem('syncsplit_wallet');
      }
    };

    initKit();
  }, []);

  // ─── Connect with specific wallet from modal ────────────────────────────

  const connectWithWallet = useCallback(async (walletId) => {
    setConnecting(true);
    setError(null);
    setModalOpen(false);

    try {
      if (walletId === 'freighter') {
        // ── Direct Freighter API (most reliable) ──
        await connectFreighterDirect();
      } else if (kitRef.current) {
        // ── StellarWalletsKit for xBull/Albedo ──
        const SWK = kitRef.current;
        SWK.setWallet(walletId);
        const { address } = await SWK.getAddress();

        if (address) {
          setPublicKey(address);
          setIsConnected(true);
          setWalletName(walletId);
          localStorage.setItem('syncsplit_wallet', walletId);
        }
      } else {
        setError(`${walletId} requires StellarWalletsKit which failed to load. Try Freighter instead.`);
      }
    } catch (err) {
      handleConnectionError(err, walletId);
    } finally {
      setConnecting(false);
    }
  }, []);

  // ─── Direct Freighter Connection ────────────────────────────────────────

  const connectFreighterDirect = async () => {
    try {
      const freighterApi = await import('@stellar/freighter-api');

      // First check if extension exists
      const connectResult = await freighterApi.isConnected();
      if (!connectResult.isConnected) {
        throw new Error('Freighter extension not found. Please install it from freighter.app');
      }

      // Request access (triggers Freighter popup for authorization)
      const accessResult = await freighterApi.requestAccess();
      if (accessResult.error) {
        throw new Error(accessResult.error);
      }

      // Get the address
      const { address, error: addrError } = await freighterApi.getAddress();
      if (addrError) {
        throw new Error(addrError);
      }

      if (address) {
        setPublicKey(address);
        setIsConnected(true);
        setWalletName('freighter');
        localStorage.setItem('syncsplit_wallet', 'freighter');
        logUserAction({ wallet: address, action: 'wallet_connected', details: { walletId: 'freighter' } });
      } else {
        throw new Error('No address returned from Freighter. Is it set up with a Testnet account?');
      }
    } catch (err) {
      // Re-throw for the caller to handle
      throw err;
    }
  };

  // ─── Error Handling ─────────────────────────────────────────────────────

  const handleConnectionError = (err, walletId) => {
    const msg = err?.message || String(err);
    console.error(`[useWallet] ${walletId} connection error:`, msg);

    logError({ action: 'wallet_connect', errorType: 'wallet', message: msg, details: { walletId } });

    if (msg.includes('not found') || msg.includes('not installed') || msg.includes('not connected') || msg.includes('not available')) {
      setError(`${walletId} is not installed. Please install it and refresh the page.`);
    } else if (msg.includes('User declined') || msg.includes('rejected') || msg.includes('cancelled')) {
      setError('Connection was declined by user.');
    } else if (msg.includes('No address')) {
      setError('No account found in wallet. Please set up a Testnet account first.');
    } else {
      setError(msg || `Failed to connect ${walletId}.`);
    }
  };

  // ─── Simple connect (opens modal) ──────────────────────────────────────

  const connect = useCallback(() => {
    setModalOpen(true);
  }, []);

  // ─── Disconnect ─────────────────────────────────────────────────────────

  const disconnect = useCallback(() => {
    logUserAction({ wallet: publicKey, action: 'wallet_disconnected' });
    setPublicKey(null);
    setWalletName(null);
    setIsConnected(false);
    setError(null);
    localStorage.removeItem('syncsplit_wallet');
  }, [publicKey]);

  // ─── Modal Controls ────────────────────────────────────────────────────

  const openModal = useCallback(() => {
    setError(null);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  // ─── Sign Transaction (unified API) ──────────────────────────────────────

  const signTransaction = useCallback(async (txXdr, opts = {}) => {
    if (!isConnected) {
      throw new Error('No wallet connected.');
    }

    const signOpts = {
      networkPassphrase: opts.networkPassphrase || NETWORK_PASSPHRASE,
      address: opts.address || publicKey,
      ...opts,
    };

    try {
      // Try SWK first (handles all wallets)
      if (kitRef.current && walletName !== 'freighter') {
        kitRef.current.setWallet(walletName);
        const result = await kitRef.current.signTransaction(txXdr, signOpts);
        return result;
      }

      // Freighter direct
      const freighterApi = await import('@stellar/freighter-api');
      const result = await freighterApi.signTransaction(txXdr, {
        networkPassphrase: signOpts.networkPassphrase,
        address: signOpts.address,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      return {
        signedTxXdr: result.signedTxXdr,
        signerAddress: result.signerAddress,
      };
    } catch (err) {
      const msg = err?.message || '';
      if (msg.includes('User declined') || msg.includes('rejected') || msg.includes('cancelled')) {
        throw new Error('Transaction was rejected in your wallet.');
      }
      throw err;
    }
  }, [isConnected, publicKey, walletName]);

  return {
    publicKey,
    truncatedAddr: truncateAddress(publicKey, 6, 4),
    walletName,
    isConnected,
    kitReady,
    connecting,
    error,
    modalOpen,
    connect,
    disconnect,
    openModal,
    closeModal,
    signTransaction,
    connectWithWallet,
  };
}
