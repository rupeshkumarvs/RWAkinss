/**
 * contractClient.js
 *
 * Clean abstraction layer for Soroban smart contract interactions.
 * Handles transaction building, simulation, signing, and submission.
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { SOROBAN_RPC_URL, CONTRACT_ID, NETWORK_PASSPHRASE } from './stellar';

const { SorobanRpc, TransactionBuilder, Networks, xdr, Address, nativeToScVal, scValToNative, Operation, BASE_FEE } = StellarSdk;

// ─── Soroban RPC Server Singleton ─────────────────────────────────────────────

let _server = null;

export function getSorobanServer() {
  if (!_server) {
    _server = new SorobanRpc.Server(SOROBAN_RPC_URL);
  }
  return _server;
}

// ─── Helper: Convert JS values to Soroban ScVal ──────────────────────────────

export function addressToScVal(address) {
  return new Address(address).toScVal();
}

export function u64ToScVal(value) {
  return nativeToScVal(value, { type: 'u64' });
}

export function i128ToScVal(value) {
  return nativeToScVal(value, { type: 'i128' });
}

export function stringToScVal(value) {
  return nativeToScVal(value, { type: 'string' });
}

// ─── Core: Invoke a Contract Function (Write) ────────────────────────────────

/**
 * Build, simulate, sign, and submit a Soroban contract invocation.
 *
 * @param {string} method - The contract function name
 * @param {xdr.ScVal[]} params - Array of ScVal parameters
 * @param {string} publicKey - Caller's Stellar public key
 * @param {Function} signTransaction - Wallet sign function: (xdr, opts) => { signedTxXdr }
 * @param {Function} [onStatusChange] - Callback for status updates: (status) => void
 *
 * @returns {Promise<{ result: any, txHash: string }>}
 */
export async function callContract(method, params, publicKey, signTransaction, onStatusChange) {
  const contractId = CONTRACT_ID;
  if (!contractId) {
    throw new Error('Contract ID not configured. Set VITE_CONTRACT_ID in your .env file.');
  }

  const server = getSorobanServer();
  const notify = onStatusChange || (() => {});

  try {
    // 1. Build the transaction
    notify('building');

    const account = await server.getAccount(publicKey);

    const contract = new StellarSdk.Contract(contractId);
    const operation = contract.call(method, ...params);

    let tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(operation)
      .setTimeout(180)
      .build();

    // 2. Simulate the transaction
    notify('simulating');
    const simResponse = await server.simulateTransaction(tx);

    if (SorobanRpc.Api.isSimulationError(simResponse)) {
      const errorMsg = simResponse.error || 'Contract simulation failed';
      throw new Error(`Simulation error: ${errorMsg}`);
    }

    // Assemble the transaction with the simulation results
    tx = SorobanRpc.assembleTransaction(tx, simResponse).build();

    // 3. Sign the transaction via wallet
    notify('signing');
    const { signedTxXdr } = await signTransaction(tx.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
      address: publicKey,
    });

    // 4. Submit the signed transaction
    notify('submitting');
    const signedTx = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
    const sendResponse = await server.sendTransaction(signedTx);

    // 5. Poll for result
    if (sendResponse.status === 'PENDING') {
      notify('confirming');
      let getResponse;
      let attempts = 0;
      const maxAttempts = 30;

      do {
        await new Promise(resolve => setTimeout(resolve, 2000));
        getResponse = await server.getTransaction(sendResponse.hash);
        attempts++;
      } while (getResponse.status === 'NOT_FOUND' && attempts < maxAttempts);

      if (getResponse.status === 'SUCCESS') {
        const result = getResponse.returnValue
          ? scValToNative(getResponse.returnValue)
          : null;
        return { result, txHash: sendResponse.hash };
      } else if (getResponse.status === 'FAILED') {
        throw new Error('Transaction failed on-chain. Check the transaction on Stellar Expert.');
      } else {
        throw new Error('Transaction confirmation timed out. It may still be processing.');
      }
    } else if (sendResponse.status === 'ERROR') {
      throw new Error(sendResponse.errorResult?.toString() || 'Transaction submission failed');
    }

    // Shouldn't reach here, but just in case
    return { result: null, txHash: sendResponse.hash };

  } catch (err) {
    // Map common errors to user-friendly messages
    const message = mapContractError(err);
    throw new Error(message);
  }
}

// ─── Core: Read Contract State (Read-Only Simulation) ─────────────────────────

/**
 * Read contract state without submitting a transaction.
 * Uses simulation to execute the function.
 *
 * @param {string} method - The contract function name
 * @param {xdr.ScVal[]} params - Array of ScVal parameters
 *
 * @returns {Promise<any>} The decoded return value
 */
export async function readContract(method, params = []) {
  const contractId = CONTRACT_ID;
  if (!contractId) {
    throw new Error('Contract ID not configured. Set VITE_CONTRACT_ID in your .env file.');
  }

  const server = getSorobanServer();

  // Use a dummy source account for read-only calls
  // We'll use the contract itself as a placeholder source
  const dummyKey = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';
  
  try {
    const account = await server.getAccount(dummyKey).catch(() => {
      // If dummy account doesn't exist, create a minimal Account object
      return new StellarSdk.Account(dummyKey, '0');
    });

    const contract = new StellarSdk.Contract(contractId);
    const operation = contract.call(method, ...params);

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    const simResponse = await server.simulateTransaction(tx);

    if (SorobanRpc.Api.isSimulationError(simResponse)) {
      throw new Error(simResponse.error || 'Read simulation failed');
    }

    if (simResponse.result) {
      return scValToNative(simResponse.result.retval);
    }

    return null;
  } catch (err) {
    throw new Error(mapContractError(err));
  }
}

// ─── Fetch Contract Events ───────────────────────────────────────────────────

/**
 * Fetch events from the contract using Soroban RPC.
 *
 * @param {string} [cursor] - Pagination cursor from previous fetch
 * @param {number} [limit=20] - Max events to return
 *
 * @returns {Promise<{ events: Array, cursor: string }>}
 */
export async function fetchContractEvents(cursor = null, limit = 20) {
  const contractId = CONTRACT_ID;
  if (!contractId) {
    return { events: [], cursor: null };
  }

  const server = getSorobanServer();

  try {
    const requestParams = {
      filters: [{
        type: 'contract',
        contractIds: [contractId],
      }],
      limit,
    };

    if (cursor) {
      requestParams.cursor = cursor;
    } else {
      // Get latest ledger to start from
      const latestLedger = await server.getLatestLedger();
      // Look back ~100 ledgers (~8 minutes)
      requestParams.startLedger = Math.max(1, latestLedger.sequence - 100);
    }

    const response = await server.getEvents(requestParams);

    const events = (response.events || []).map(event => ({
      id: event.id,
      type: event.type,
      ledger: event.ledger,
      pagingToken: event.pagingToken,
      contractId: event.contractId,
      topic: event.topic?.map(t => {
        try { return scValToNative(t); }
        catch { return t.toString(); }
      }),
      value: (() => {
        try { return scValToNative(event.value); }
        catch { return event.value?.toString(); }
      })(),
      timestamp: new Date().toISOString(), // Events don't have timestamps, use fetch time
    }));

    const newCursor = events.length > 0
      ? events[events.length - 1].pagingToken
      : cursor;

    return { events, cursor: newCursor };
  } catch (err) {
    console.warn('[contractClient] Event fetch failed:', err.message);
    return { events: [], cursor };
  }
}

// ─── Error Mapping ───────────────────────────────────────────────────────────

function mapContractError(err) {
  const msg = err?.message || err?.toString() || 'Unknown error';

  // User rejected transaction in wallet
  if (msg.includes('User declined') || msg.includes('rejected') || msg.includes('cancelled') || msg.includes('denied')) {
    return 'Transaction was rejected in your wallet.';
  }

  // Insufficient balance
  if (msg.includes('insufficient') || msg.includes('balance') || msg.includes('underfunded')) {
    return 'Insufficient XLM balance. Fund your account via Friendbot.';
  }

  // Wallet not connected
  if (msg.includes('No wallet') || msg.includes('not connected') || msg.includes('no address')) {
    return 'No wallet connected. Please connect a wallet first.';
  }

  // Contract not found
  if (msg.includes('not found') && msg.includes('contract')) {
    return 'Smart contract not found. Verify the contract ID in your .env file.';
  }

  // Network error
  if (msg.includes('NetworkError') || msg.includes('Failed to fetch') || msg.includes('ECONNREFUSED')) {
    return 'Network error. Please check your internet connection and try again.';
  }

  // Simulation error (contract panic)
  if (msg.includes('Simulation error')) {
    // Try to extract contract panic message
    const panicMatch = msg.match(/panic:\s*(.+)/i) || msg.match(/Error:\s*(.+)/i);
    return panicMatch ? panicMatch[1] : msg;
  }

  return msg;
}
