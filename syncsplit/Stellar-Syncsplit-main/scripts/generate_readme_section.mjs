#!/usr/bin/env node

/**
 * generate_readme_section.mjs
 *
 * Reads exported transaction logs (JSON) and optional feedback summary,
 * then generates a markdown section ready to paste into README.md.
 *
 * Usage:
 *   node scripts/generate_readme_section.mjs <transaction_log.json> [feedback_summary.json]
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXPERT = 'https://stellar.expert/explorer/testnet';

function truncate(addr) {
  if (!addr || addr.length < 12) return addr || '—';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function loadJSON(path) {
  try { return JSON.parse(readFileSync(resolve(path), 'utf-8')); }
  catch (e) { console.error(`Cannot read: ${path} — ${e.message}`); return null; }
}

function main() {
  const txPath = process.argv[2];
  const fbPath = process.argv[3];

  if (!txPath) {
    console.error('Usage: node scripts/generate_readme_section.mjs <tx_log.json> [feedback.json]');
    process.exit(1);
  }

  const txData = loadJSON(txPath);
  if (!txData) process.exit(1);

  const transactions = txData.transactions || [];
  const errors = txData.errors || [];
  const actions = txData.actions || [];
  const feedback = fbPath ? loadJSON(fbPath) : null;

  // Unique wallets
  const wallets = [...new Set(transactions.map(t => t.wallet).filter(Boolean))];

  let md = '';

  // Header
  md += '## Level 5 — Real User Testing Results\n\n';
  md += '> All transactions below are **real** and verifiable on [Stellar Expert](https://stellar.expert/explorer/testnet).\n\n';

  // User table
  md += '### Onboarded Users\n\n';
  md += '| # | Wallet Address | Explorer Link |\n';
  md += '|---|---|---|\n';
  wallets.forEach((w, i) => {
    md += `| ${i + 1} | \`${truncate(w)}\` | [View Account](${EXPERT}/account/${w}) |\n`;
  });
  md += `\n**Total Users**: ${wallets.length}\n\n`;

  // Transaction table
  md += '### Transaction Log\n\n';
  md += '| # | Action | TX Hash | Timestamp | Explorer |\n';
  md += '|---|---|---|---|---|\n';
  transactions.forEach((tx, i) => {
    const hash = tx.txHash ? `\`${tx.txHash.slice(0, 8)}...${tx.txHash.slice(-4)}\`` : '—';
    const link = tx.txHash ? `[View TX](${EXPERT}/tx/${tx.txHash})` : '—';
    const time = tx.timestamp ? tx.timestamp.slice(0, 19).replace('T', ' ') : '—';
    md += `| ${i + 1} | ${tx.action || '—'} | ${hash} | ${time} | ${link} |\n`;
  });
  md += `\n**Total Transactions**: ${transactions.length}\n\n`;

  // Error summary
  if (errors.length > 0) {
    md += '### Error Summary\n\n';
    const typeCounts = {};
    errors.forEach(e => { typeCounts[e.errorType] = (typeCounts[e.errorType] || 0) + 1; });
    md += '| Error Type | Count |\n|---|---|\n';
    Object.entries(typeCounts).forEach(([type, count]) => {
      md += `| ${type} | ${count} |\n`;
    });
    md += '\n';
  }

  // Feedback summary
  if (feedback) {
    md += '### User Feedback Summary\n\n';
    md += `- **Responses**: ${feedback.totalResponses}\n`;
    md += `- **Average Rating**: ${feedback.averageRating} / 5\n`;
    md += `- **Unique Testers**: ${feedback.uniqueUsers}\n\n`;

    if (feedback.useAgain) {
      md += '| Would Use Again | Count |\n|---|---|\n';
      Object.entries(feedback.useAgain).forEach(([k, v]) => { md += `| ${k} | ${v} |\n`; });
      md += '\n';
    }

    if (feedback.highlights?.length) {
      md += '**What Users Liked**:\n';
      feedback.highlights.forEach(h => { md += `> "${h}"\n\n`; });
    }

    if (feedback.topIssues?.length) {
      md += '**Common Issues**:\n';
      feedback.topIssues.forEach(([kw, count]) => { md += `- "${kw}" — mentioned ${count}x\n`; });
      md += '\n';
    }

    // Improvements
    md += '### Planned Improvements\n\n';
    md += 'Based on user feedback:\n\n';
    if (feedback.topIssues?.length) {
      feedback.topIssues.slice(0, 5).forEach(([kw]) => {
        const fixes = {
          wallet: 'Improve wallet connection reliability and error messages',
          connect: 'Add connection retry logic and clearer install prompts',
          transaction: 'Add transaction retry and better status tracking',
          failed: 'Improve error handling with actionable recovery steps',
          slow: 'Optimize RPC calls and add loading skeleton states',
          confusing: 'Enhance onboarding flow with better tooltips',
          loading: 'Add progressive loading indicators',
          mobile: 'Improve responsive design for mobile devices',
          balance: 'Add auto-fund prompt when balance is low',
          timeout: 'Increase timeout thresholds and add retry logic',
        };
        md += `- ${fixes[kw] || `Address "${kw}" related issues`}\n`;
      });
    } else {
      md += '- Continuous UI/UX refinement based on tester feedback\n';
      md += '- Performance optimization for transaction pipeline\n';
    }
    md += '\n';
  }

  md += '---\n';

  // Output
  console.log(md);

  const outPath = resolve(__dirname, 'level5_readme_section.md');
  writeFileSync(outPath, md);
  console.log(`\nWritten to: ${outPath}`);
}

main();
