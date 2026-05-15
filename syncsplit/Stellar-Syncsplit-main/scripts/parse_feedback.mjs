#!/usr/bin/env node

/**
 * parse_feedback.mjs
 *
 * Parses CSV export from Google Form feedback and generates analytics.
 *
 * Usage:
 *   node scripts/parse_feedback.mjs path/to/responses.csv
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQuotes = !inQuotes; }
    else if (c === ',' && !inQuotes) { result.push(current); current = ''; }
    else { current += c; }
  }
  result.push(current);
  return result;
}

function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) { console.error('CSV needs header + data rows.'); process.exit(1); }
  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  return lines.slice(1).map(line => {
    const vals = parseCSVLine(line);
    const row = {};
    headers.forEach((h, i) => { row[h] = (vals[i] || '').trim(); });
    return row;
  });
}

function analyze(rows) {
  const ratings = rows.map(r => parseInt(r['Overall Rating'])).filter(n => !isNaN(n));
  const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2) : 'N/A';
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach(r => { if (dist[r] !== undefined) dist[r]++; });

  const wallets = [...new Set(rows.map(r => r['Wallet Address']).filter(w => w?.startsWith('G') && w.length >= 56))];

  const issueKw = {};
  const keywords = ['wallet','connect','transaction','failed','slow','confusing','error','bug','loading','mobile','freighter','balance','timeout','split'];
  rows.forEach(r => {
    const issues = (r['Issues or bugs encountered'] || '').toLowerCase();
    keywords.forEach(kw => { if (issues.includes(kw)) issueKw[kw] = (issueKw[kw] || 0) + 1; });
  });
  const topIssues = Object.entries(issueKw).sort(([,a],[,b]) => b - a).slice(0, 10);

  const useAgain = { 'Yes, definitely': 0, 'Maybe': 0, 'No': 0 };
  rows.forEach(r => { const v = r['Would you use SyncSplit again?']; if (v && useAgain[v] !== undefined) useAgain[v]++; });

  return {
    totalResponses: rows.length, uniqueUsers: wallets.length, averageRating: parseFloat(avg) || avg,
    ratingDistribution: dist, wallets, topIssues, useAgain,
    highlights: rows.map(r => r['What did you like most?']).filter(Boolean).slice(0, 5),
    featureRequests: rows.map(r => r['Feature requests']).filter(Boolean),
    rawIssues: rows.map(r => r['Issues or bugs encountered']).filter(Boolean),
  };
}

const csvPath = process.argv[2];
if (!csvPath) { console.error('Usage: node scripts/parse_feedback.mjs <csv-path>'); process.exit(1); }

const rows = parseCSV(readFileSync(resolve(csvPath), 'utf-8'));
const result = analyze(rows);

console.log('\n' + '='.repeat(50));
console.log('  SYNCSPLIT FEEDBACK SUMMARY');
console.log('='.repeat(50));
console.log(`  Responses: ${result.totalResponses} | Users: ${result.uniqueUsers} | Avg Rating: ${result.averageRating}/5`);
console.log('  Rating Distribution:', result.ratingDistribution);
console.log('  Would Use Again:', result.useAgain);
if (result.topIssues.length) { console.log('  Top Issues:', result.topIssues.map(([k,v]) => `${k}(${v})`).join(', ')); }
if (result.highlights.length) { console.log('  Highlights:'); result.highlights.forEach(h => console.log(`    > "${h}"`)); }
console.log('='.repeat(50) + '\n');

const outPath = resolve(__dirname, 'feedback_summary.json');
writeFileSync(outPath, JSON.stringify(result, null, 2));
console.log(`JSON written to: ${outPath}\n`);
