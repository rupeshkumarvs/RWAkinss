# Mainnet Deployment Dry-Run Guide

## 🎯 Purpose
Validate mainnet deployment readiness **WITHOUT** deploying any contracts or spending gas.

## 📋 What the Dry-Run Validates

### 1. **Network Configuration**
- ✅ Verifies connection to QIE Mainnet (Chain ID: 1990)
- ✅ Tests RPC connectivity and responsiveness
- ✅ Retrieves current gas price
- ✅ Validates network is operational

### 2. **Environment Variables**
- ✅ Checks required variables (PRIVATE_KEY, etc.)
- ✅ Validates private key format
- ✅ Validates address formats for optional variables
- ✅ Warns about missing optional configurations

### 3. **Deployer Account**
- ✅ Validates deployer address
- ✅ Checks account balance
- ✅ Estimates deployment cost
- ✅ Verifies sufficient funds

### 4. **Contract Compilation**
- ✅ Verifies all contracts compile successfully
- ✅ Checks bytecode is generated
- ✅ Validates contract factories are available

### 5. **Deployment Simulation**
- ✅ Simulates contract deployments (gas estimation only)
- ✅ Validates constructor parameters
- ✅ Estimates gas for each contract
- ✅ **NO ACTUAL TRANSACTIONS SENT**

### 6. **Testnet Dependency Check**
- ✅ Scans for hardcoded testnet values
- ✅ Verifies no testnet chain IDs in mainnet config
- ✅ Checks for testnet RPC URLs
- ✅ Ensures clean separation

### 7. **Deployment Readiness Summary**
- ✅ Provides pass/fail summary
- ✅ Lists all warnings
- ✅ Gives final verdict

---

## 🚀 Running the Dry-Run

### Prerequisites
1. Set up `.env` file in `contracts/` directory with:
   ```bash
   PRIVATE_KEY=0x...
   QIE_MAINNET_RPC_URL=https://rpc1mainnet.qie.digital/
   QIE_MAINNET_CHAIN_ID=1990
   
   # Optional:
   NCRD_TOKEN_ADDRESS=0x...  # If deploying staking
   BACKEND_ADDRESS=0x...     # If granting role
   AI_SIGNER_ADDRESS=0x...   # For LendingVault
   LOAN_TOKEN_ADDRESS=0x0    # 0x0 for native QIE
   ```

2. Ensure contracts are compiled:
   ```bash
   cd contracts
   npx hardhat compile
   ```

### Execute Dry-Run

```bash
cd contracts
npx hardhat run scripts/dry-run-mainnet.ts --network qieMainnet
```

### Expected Output

```
🔍 CreditBlocks Mainnet Deployment Dry-Run
============================================================
This script validates deployment readiness WITHOUT deploying.

📡 [1/7] Validating Network Configuration...
✅ PASS Network Chain ID
   Connected to QIE Mainnet (Chain ID: 1990)

✅ PASS RPC Connectivity
   RPC is responsive. Latest block: 12345

✅ PASS Gas Price
   Gas price: 1.00 Gwei

🔐 [2/7] Validating Environment Variables...
✅ PASS Env: PRIVATE_KEY
   Private key format valid (masked: 0x1234...5678)

✅ PASS Env: QIE_MAINNET_RPC_URL
   QIE Mainnet RPC URL is set

...

📊 DRY-RUN SUMMARY
============================================================
✅ Passed: 25
❌ Failed: 0
⚠️  Warnings: 2

============================================================
✅ ALL CHECKS PASSED - Ready for mainnet deployment!
   You can proceed with: npx hardhat run scripts/deploy-mainnet.ts --network qieMainnet
============================================================
```

---

## ✅ Success Criteria

### **All Critical Checks Must Pass:**
- ✅ Network Chain ID = 1990
- ✅ RPC connectivity working
- ✅ PRIVATE_KEY is set and valid
- ✅ Deployer balance ≥ 1.0 QIEV3
- ✅ All contracts compile
- ✅ Deployment simulation succeeds
- ✅ No testnet dependencies in mainnet config

### **Warnings Are Acceptable:**
- ⚠️ Optional env vars not set (NCRD_TOKEN_ADDRESS, etc.)
- ⚠️ Low balance warnings (if still sufficient)
- ⚠️ Testnet env vars present (as long as not used)

### **Failures Must Be Fixed:**
- ❌ Wrong network
- ❌ RPC connection failed
- ❌ Missing required env vars
- ❌ Invalid address formats
- ❌ Insufficient balance
- ❌ Contract compilation errors
- ❌ Deployment simulation failures

---

## 🔍 What Gets Checked

### Network Validation
- Chain ID verification (must be 1990)
- RPC endpoint connectivity
- Latest block retrieval
- Gas price retrieval

### Environment Variables
**Required:**
- `PRIVATE_KEY` - Deployer private key (validates format)

**Optional (but validated if set):**
- `NCRD_TOKEN_ADDRESS` - For staking deployment
- `BACKEND_ADDRESS` - For role grant
- `AI_SIGNER_ADDRESS` - For LendingVault
- `LOAN_TOKEN_ADDRESS` - Loan token (defaults to 0x0 for native)

### Contract Validation
- CreditPassportNFT compilation
- LendingVault compilation
- NeuroCredStaking compilation (if token address set)

### Deployment Simulation
- Gas estimation for each contract
- Constructor parameter validation
- Transaction building (not sending)

### Testnet Dependency Check
- Hardhat config scan for testnet values
- Environment variable scan
- Network configuration validation

---

## 🚨 Common Issues & Fixes

### Issue: "Wrong network! Expected 1990"
**Fix:** Ensure you're using `--network qieMainnet` flag

### Issue: "RPC connection failed"
**Fix:** 
- Check `QIE_MAINNET_RPC_URL` in `.env`
- Verify RPC endpoint is accessible
- Try alternative RPC: `https://rpc2mainnet.qie.digital/`

### Issue: "Missing required environment variable: PRIVATE_KEY"
**Fix:** Add `PRIVATE_KEY=0x...` to `contracts/.env`

### Issue: "Invalid private key format"
**Fix:** Private key must be `0x` + 64 hex characters (66 total)

### Issue: "Insufficient balance"
**Fix:** Add QIEV3 to deployer wallet (minimum 1.0 QIEV3 recommended)

### Issue: "Contract compilation failed"
**Fix:** Run `npx hardhat compile` first

---

## 📊 Interpreting Results

### ✅ All Passed
**Status:** Ready for deployment
**Action:** Proceed with actual deployment

### ⚠️ Warnings Only
**Status:** Ready with caveats
**Action:** Review warnings, proceed if acceptable

### ❌ Failures Present
**Status:** Not ready
**Action:** Fix all failures before deploying

---

## 🔒 Safety Features

1. **No Transactions Sent**
   - Only gas estimation
   - No contract deployments
   - No state changes

2. **Read-Only Operations**
   - Network queries only
   - Balance checks
   - Contract compilation checks

3. **Validation Only**
   - No actual deployment
   - No gas spent
   - Safe to run multiple times

---

## 📝 Next Steps After Dry-Run

### If All Checks Pass:
1. Review the summary output
2. Verify estimated gas costs
3. Ensure sufficient balance
4. Proceed with actual deployment:
   ```bash
   npx hardhat run scripts/deploy-mainnet.ts --network qieMainnet
   ```

### If Warnings Present:
1. Review each warning
2. Decide if optional configs are needed
3. Set optional env vars if required
4. Re-run dry-run to verify

### If Failures Present:
1. Fix each failure
2. Re-run dry-run
3. Verify all checks pass
4. Then proceed with deployment

---

## 🎯 Success Example

```
============================================================
📊 DRY-RUN SUMMARY
============================================================
✅ Passed: 25
❌ Failed: 0
⚠️  Warnings: 1

✅ ALL CHECKS PASSED - Ready for mainnet deployment!
   You can proceed with: npx hardhat run scripts/deploy-mainnet.ts --network qieMainnet
============================================================
```

This means:
- ✅ All critical validations passed
- ⚠️ One optional warning (likely missing optional env var)
- ✅ Safe to proceed with deployment

---

## 🔄 Re-running the Dry-Run

You can run the dry-run multiple times safely:
- No gas spent
- No transactions sent
- No state changes
- Useful for validating fixes

**Recommended:** Run dry-run after any configuration changes before actual deployment.

