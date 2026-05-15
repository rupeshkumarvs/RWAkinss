# 🚀 Split Bill Contract — Deployment Guide

Deploy the Soroban Split Bill contract to Stellar Testnet.

---

## Prerequisites

### 1. Install Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### 2. Add WebAssembly target

```bash
rustup target add wasm32-unknown-unknown
```

### 3. Install Stellar CLI

```bash
cargo install --locked stellar-cli --features opt
```

Verify:

```bash
stellar --version
```

---

## Build the Contract

```bash
cd contracts/split_bill

# Build for release (optimized WASM)
cargo build --target wasm32-unknown-unknown --release
```

The compiled WASM will be at:
```
target/wasm32-unknown-unknown/release/split_bill.wasm
```

### Run Tests (Optional but recommended)

```bash
cargo test
```

---

## Deploy to Stellar Testnet

### 1. Generate a Testnet Identity

```bash
stellar keys generate --global deployer --network testnet --fund
```

This creates a funded testnet account named `deployer`.

### 2. Deploy the Contract

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/split_bill.wasm \
  --source deployer \
  --network testnet
```

**Copy the returned Contract ID.** It looks like:
```
CABC...XYZ
```

### 3. Save the Contract ID

Create/update the `.env` file in `app/`:

```bash
echo "VITE_CONTRACT_ID=<YOUR_CONTRACT_ID>" > ../app/.env
echo "VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org" >> ../app/.env
echo "VITE_HORIZON_URL=https://horizon-testnet.stellar.org" >> ../app/.env
echo "VITE_NETWORK_PASSPHRASE=Test SDF Network ; September 2015" >> ../app/.env
```

---

## Verify Deployment

### Test `create_split`

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source deployer \
  --network testnet \
  -- create_split \
  --creator deployer \
  --total_amount 1000000000 \
  --description "Test dinner split"
```

Should return `1` (the split ID).

### Test `get_split`

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source deployer \
  --network testnet \
  -- get_split \
  --split_id 1
```

### Test `add_participant`

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source deployer \
  --network testnet \
  -- add_participant \
  --split_id 1 \
  --address <PARTICIPANT_STELLAR_ADDRESS> \
  --amount 500000000
```

### Test `mark_paid`

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <PARTICIPANT_IDENTITY> \
  --network testnet \
  -- mark_paid \
  --split_id 1 \
  --address <PARTICIPANT_STELLAR_ADDRESS>
```

---

## Contract Functions Reference

| Function | Args | Returns | Auth |
|----------|------|---------|------|
| `create_split` | `creator: Address, total_amount: i128, description: String` | `u64` (split ID) | Creator |
| `add_participant` | `split_id: u64, address: Address, amount: i128` | `()` | Creator |
| `mark_paid` | `split_id: u64, address: Address` | `()` | Participant |
| `get_split` | `split_id: u64` | `Split` | None |
| `get_split_count` | — | `u64` | None |

## Events Emitted

| Event Topic | Data | When |
|------------|------|------|
| `("SPLIT", "created")` | `(split_id, creator, total_amount)` | Split created |
| `("SPLIT", "p_added")` | `(split_id, address, amount)` | Participant added |
| `("SPLIT", "paid")` | `(split_id, address)` | Payment marked |

---

## Troubleshooting

**"Account not found"**: Fund the deployer account:
```bash
stellar keys fund deployer --network testnet
```

**"Contract WASM too large"**: Ensure you're building with `--release`:
```bash
cargo build --target wasm32-unknown-unknown --release
```

**"Authorization required"**: Ensure the `--source` flag matches the required auth (creator for add_participant, participant for mark_paid).
