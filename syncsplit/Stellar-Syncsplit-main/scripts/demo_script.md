# SyncSplit — Demo Recording Script

Step-by-step guide for recording a ~2:30 demo video showcasing real Level 5 user testing.

---

## Prerequisites

- Freighter wallet installed, set to **Testnet**
- Wallet funded via Friendbot
- Screen recording software ready (OBS, Loom, or QuickTime)
- Browser: Chrome/Brave with Freighter extension visible

---

## Recording Script

### Scene 1 — Intro (0:00 – 0:05)

**Action**: Show the landing page at `https://app-nine-gray-18.vercel.app/`

**Narration** (optional):
> "This is SyncSplit — an on-chain bill splitting protocol built on Stellar Soroban.
> Today we're demonstrating real user testing with verifiable transactions."

---

### Scene 2 — Connect Wallet (0:05 – 0:20)

1. Click **"Launch App"** on landing page
2. The onboarding stepper appears — Step 1: Connect Wallet
3. Click **"Connect Wallet"** in the sidebar or stepper
4. Freighter popup appears → Click **"Approve"**
5. Show the wallet badge in the top nav (truncated address visible)
6. Stepper auto-advances to Step 2

**Highlight**: Multi-wallet support (Freighter, xBull, Albedo)

---

### Scene 3 — Fund Wallet (0:20 – 0:30)

1. If balance is 0, click the Friendbot link in the stepper
2. Wait for funding (a few seconds)
3. Show balance updating in the Wallet Widget
4. Stepper auto-advances to Step 3

**Note**: If already funded, briefly show the balance and move on.

---

### Scene 4 — Create a Split (0:30 – 1:00)

1. In the **Split Calculator**, enter:
   - Total Amount: `100 XLM`
   - Description: `"Team dinner"`
   - Split Mode: Equal
   - Participants: 4
2. Click **"Create On-Chain Split"**
3. Show the transaction pipeline status panel:
   - Building → Simulating → Signing (Freighter popup) → Submitting → Confirming
4. Show success animation + transaction hash
5. Stepper auto-advances to Step 4
6. Show the **Split Details** card with on-chain data

---

### Scene 5 — Execute Transaction (1:00 – 1:20)

1. Navigate to **Transactions** page
2. Enter a destination address and amount (e.g., `10 XLM`)
3. Click **"Send"**
4. Show Freighter signing popup → Approve
5. Show success status with transaction hash
6. Stepper advances to Step 5

---

### Scene 6 — Copy & Verify TX Hash (1:20 – 1:35)

1. Click the transaction hash to copy
2. Open [Stellar Expert](https://stellar.expert/explorer/testnet) in a new tab
3. Paste the hash → Show the transaction on-chain
4. Highlight: source account, operations, ledger number
5. Complete the onboarding stepper (click "Done")

---

### Scene 7 — Show Logs & Export (1:35 – 1:55)

1. Press `Ctrl+Shift+L` to open the Admin Panel
2. Show the transaction log table with all recorded transactions
3. Show the error log (if any errors occurred)
4. Click **"Export JSON"** → Show the downloaded file
5. Alternatively, open DevTools Console → type `SyncSplitLogger.exportAll()` → show JSON

---

### Scene 8 — Feedback Collection (1:55 – 2:05)

1. Show/mention the Google Form link for user feedback
2. Briefly show the form structure (or a filled example)

---

### Scene 9 — Generate README Section (2:05 – 2:20)

1. Open terminal
2. Run: `node scripts/generate_readme_section.mjs syncsplit_logs.json feedback_summary.json`
3. Show the generated markdown output
4. Highlight: user table, transaction table, feedback summary

---

### Scene 10 — Outro (2:20 – 2:30)

**Narration**:
> "SyncSplit — Level 5 complete. Real users, real transactions, all verifiable on Stellar Explorer."

Show: Live app URL + GitHub repo link

---

## Tips

- **Resolution**: Record at 1920x1080 or higher
- **Browser zoom**: 90% if needed to fit more content
- **Freighter**: Keep it pinned so the popup is always visible
- **Speed**: Don't rush the transaction pipeline — let the status animations play
- **Errors**: If something fails, that's fine — it shows real error handling. Keep recording.
