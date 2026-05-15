/**
 * logger.js
 *
 * Centralized logging system for SyncSplit Level 5 automation.
 * Captures transactions, errors, and user actions in localStorage.
 * All data is from real user interactions — no simulated entries.
 *
 * Storage keys:
 *   syncsplit_tx_log      — successful transactions
 *   syncsplit_error_log   — wallet/tx/contract errors
 *   syncsplit_action_log  — onboarding steps & user actions
 */

const STORAGE_KEYS = {
  TRANSACTIONS: 'syncsplit_tx_log',
  ERRORS: 'syncsplit_error_log',
  ACTIONS: 'syncsplit_action_log',
};

const STELLAR_EXPERT_BASE = 'https://stellar.expert/explorer/testnet';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncate(address, start = 6, end = 4) {
  if (!address || address.length <= start + end + 3) return address || '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

function readLog(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLog(key, entries) {
  try {
    localStorage.setItem(key, JSON.stringify(entries));
  } catch (err) {
    console.warn('[SyncSplitLogger] localStorage write failed:', err.message);
  }
}

function appendEntry(key, entry) {
  const entries = readLog(key);
  entries.push(entry);
  writeLog(key, entries);
  return entry;
}

// ─── Transaction Logging ──────────────────────────────────────────────────────

/**
 * Log a successful transaction (contract call or XLM payment).
 *
 * @param {Object} params
 * @param {string} params.wallet    — full public key (G...)
 * @param {string} params.txHash    — transaction hash
 * @param {string} params.action    — e.g. 'create_split', 'add_participant', 'send_xlm'
 * @param {Object} [params.details] — additional context (amount, splitId, destination, etc.)
 * @returns {Object} the logged entry
 */
export function logTransaction({ wallet, txHash, action, details = {} }) {
  const entry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    wallet: wallet || 'unknown',
    walletTruncated: truncate(wallet),
    txHash: txHash || null,
    action,
    details,
    stellarExpertUrl: txHash ? `${STELLAR_EXPERT_BASE}/tx/${txHash}` : null,
    accountUrl: wallet ? `${STELLAR_EXPERT_BASE}/account/${wallet}` : null,
  };

  appendEntry(STORAGE_KEYS.TRANSACTIONS, entry);
  console.log(`[SyncSplitLogger] TX logged: ${action}`, { txHash, wallet: truncate(wallet) });
  return entry;
}

// ─── Error Logging ────────────────────────────────────────────────────────────

/**
 * Log an error event.
 *
 * @param {Object} params
 * @param {string} [params.wallet]    — public key if available
 * @param {string} params.action      — what was attempted: 'wallet_connect', 'create_split', 'send_xlm', etc.
 * @param {string} params.errorType   — category: 'wallet', 'transaction', 'contract', 'network'
 * @param {string} params.message     — error message
 * @param {Object} [params.details]   — additional context
 * @returns {Object} the logged entry
 */
export function logError({ wallet, action, errorType, message, details = {} }) {
  const entry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    wallet: wallet || null,
    walletTruncated: truncate(wallet),
    action,
    errorType,
    message,
    details,
  };

  appendEntry(STORAGE_KEYS.ERRORS, entry);
  console.warn(`[SyncSplitLogger] ERROR logged: [${errorType}] ${action} — ${message}`);
  return entry;
}

// ─── User Action Logging ──────────────────────────────────────────────────────

/**
 * Log a user action / onboarding step.
 *
 * @param {Object} params
 * @param {string} [params.wallet]  — public key if connected
 * @param {string} params.action    — e.g. 'wallet_connected', 'wallet_funded', 'onboarding_step_3'
 * @param {Object} [params.details] — additional context
 * @returns {Object} the logged entry
 */
export function logUserAction({ wallet, action, details = {} }) {
  const entry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    wallet: wallet || null,
    walletTruncated: truncate(wallet),
    action,
    details,
  };

  appendEntry(STORAGE_KEYS.ACTIONS, entry);
  console.log(`[SyncSplitLogger] Action logged: ${action}`);
  return entry;
}

// ─── Retrieval ────────────────────────────────────────────────────────────────

/** Get all transaction logs. */
export function getTransactions() {
  return readLog(STORAGE_KEYS.TRANSACTIONS);
}

/** Get all error logs. */
export function getErrors() {
  return readLog(STORAGE_KEYS.ERRORS);
}

/** Get all user action logs. */
export function getUserActions() {
  return readLog(STORAGE_KEYS.ACTIONS);
}

// ─── Export & Clear ───────────────────────────────────────────────────────────

/**
 * Export all logs as a single JSON object.
 * @returns {Object} { transactions, errors, actions, exportedAt, appVersion }
 */
export function exportAll() {
  return {
    transactions: getTransactions(),
    errors: getErrors(),
    actions: getUserActions(),
    exportedAt: new Date().toISOString(),
    appVersion: 'SyncSplit v1.0',
    contractId: import.meta.env?.VITE_CONTRACT_ID || 'N/A',
  };
}

/**
 * Download all logs as a JSON file.
 */
export function downloadLogs() {
  const data = exportAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `syncsplit_logs_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Clear all logs. */
export function clearAll() {
  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  localStorage.removeItem(STORAGE_KEYS.ERRORS);
  localStorage.removeItem(STORAGE_KEYS.ACTIONS);
  console.log('[SyncSplitLogger] All logs cleared.');
}

// ─── Global Access (for console debugging) ────────────────────────────────────

if (typeof window !== 'undefined') {
  window.SyncSplitLogger = {
    logTransaction,
    logError,
    logUserAction,
    getTransactions,
    getErrors,
    getUserActions,
    exportAll,
    downloadLogs,
    clearAll,
  };
}
