<div align="center">
  <br />
  <h1>SYNC_SPLIT PROTOCOL</h1>
  <p>
    <strong>On-chain bill splitting powered by Soroban smart contracts on Stellar.</strong>
  </p>
  
  <p>
    <a href="https://app-nine-gray-18.vercel.app"><img src="https://img.shields.io/badge/LIVE_APP-app--nine--gray--18.vercel.app-7c3aed?style=for-the-badge" alt="Live App" /></a>
    <a href="https://stellar.expert/explorer/testnet/contract/CCEIBX7TF3OY5CWE5GDGZPFNNTIRTLLHDYJ4NQG4YLWYTNURUZ4YGKGF"><img src="https://img.shields.io/badge/CONTRACT-Stellar_Expert-4edea2?style=for-the-badge" alt="Contract" /></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
    <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Stellar-000000.svg?style=for-the-badge&logo=Stellar&logoColor=white" alt="Stellar" />
    <img src="https://img.shields.io/badge/Rust-000000.svg?style=for-the-badge&logo=rust&logoColor=white" alt="Rust" />
    <img src="https://img.shields.io/badge/Soroban-7c3aed.svg?style=for-the-badge&logo=stellar&logoColor=white" alt="Soroban" />
    <img src="https://img.shields.io/badge/Vercel-000000.svg?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  </p>
  <br />
</div>

> **SYNC_SPLIT** is a production-grade Level 2 Stellar dApp that splits bills on-chain using Soroban smart contracts. Featuring multi-wallet support (Freighter, xBull, Albedo), real-time event tracking, and a "Kinetic Midnight" glassmorphic UI — this is cryptographic precision meets Gen-Z design.

---

## Table of Contents

- [Live Deployment](#live-deployment)
- [Screenshots](#screenshots)
- [Demo Video](#demo-video)
- [System Architecture](#system-architecture)
- [Smart Contract Transaction Flow](#smart-contract-transaction-flow)
- [Contract Functions](#contract-functions)
- [Protocol Features](#protocol-features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Contract Deployment](#contract-deployment-optional)
- [Project Structure](#project-structure)

---

## Live Deployment

| Component | URL | Status |
|:---|:---|:---:|
| **Frontend** | [app-nine-gray-18.vercel.app](https://app-nine-gray-18.vercel.app) | Live |
| **Smart Contract** | [`CCEIBX7TF...UZ4YGKGF`](https://stellar.expert/explorer/testnet/contract/CCEIBX7TF3OY5CWE5GDGZPFNNTIRTLLHDYJ4NQG4YLWYTNURUZ4YGKGF) | Deployed |
| **Network** | Stellar Testnet | Active |
| **Deploy TX** | [`5da12c8a...b132`](https://stellar.expert/explorer/testnet/tx/5da12c8aa4a9c16ed506d28ce72ce173a272975b9cd136a56cfe16bc3aa2b132) | Confirmed |

### Contract Details

```
Contract ID   : CCEIBX7TF3OY5CWE5GDGZPFNNTIRTLLHDYJ4NQG4YLWYTNURUZ4YGKGF
WASM Hash     : 3d689e48b1106d5758d7db4d2d61ba81bafc4ea85bf113f739e2b85480373ae6
Network       : Test SDF Network ; September 2015
SDK           : soroban-sdk v22.0.0
CLI           : stellar-cli v23.0.1
```

---

## Screenshots

<table>
  <tr>
    <td align="center"><b>Landing Page</b></td>
    <td align="center"><b>Split Calculator — Dashboard</b></td>
  </tr>
  <tr>
    <td><img src="./screenshots/01_landing_page.png" alt="Landing Page" width="100%"/></td>
    <td><img src="./screenshots/02_split_calculator.png" alt="Split Calculator" width="100%"/></td>
  </tr>
  <tr>
    <td align="center"><b>Transactions & Send Funds</b></td>
    <td align="center"><b>Settings — Privacy Armor</b></td>
  </tr>
  <tr>
    <td><img src="./screenshots/03_transactions.png" alt="Transactions" width="100%"/></td>
    <td><img src="./screenshots/04_settings.png" alt="Settings" width="100%"/></td>
  </tr>
  <tr>
    <td align="center"><b>Receive Assets — QR Code</b></td>
    <td align="center"><b>Wallet Options — Connect Modal</b></td>
  </tr>
  <tr>
    <td><img src="./screenshots/05_receive_assets.png" alt="Receive Assets QR Code" width="100%"/></td>
    <td><img src="./screenshots/06_wallet_options.png" alt="Wallet Options" width="100%"/></td>
  </tr>
  <tr>
    <td align="center"><b>Deployed Transaction</b></td>
    <td align="center"><b>Smart Contract Deployment Proof</b></td>
  </tr>
  <tr>
    <td><img src="./screenshots/07_deployed_transaction.png" alt="Deployed Transaction" width="100%"/></td>
    <td><img src="./screenshots/08_contract_deployment.png" alt="Contract Deployment Proof" width="100%"/></td>
  </tr>
</table>

---

## Demo Video

> [**Watch the full demo walkthrough →**](https://drive.google.com/file/d/1JSoBAxrVnZq2nWL6ZCGpVT6uHZpy4pXK/view?usp=sharing)
>
> Covers: Wallet connection · Balance check · XLM transfer · Soroban contract · Split bill creation · Event tracking

---

## System Architecture

Full-stack architecture: React frontend ↔ StellarWalletsKit ↔ Soroban RPC ↔ Smart Contract on Stellar Testnet.

```mermaid
graph TB
    classDef frontend fill:#7c3aed,stroke:#d2bbff,stroke-width:2px,color:#fff;
    classDef wallet fill:#fbabff,stroke:#ae05c6,stroke-width:2px,color:#131318;
    classDef rpc fill:#4edea2,stroke:#007650,stroke-width:2px,color:#131318;
    classDef contract fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#131318;

    subgraph BROWSER ["Browser Environment"]
        direction TB
        UI["React + Tailwind v4 + Motion"]:::frontend
        HOOKS["useWallet · useContract · useEvents · useTransaction"]:::frontend
        SWK["StellarWalletsKit"]:::frontend
        CLIENT["contractClient.js · stellar.js"]:::frontend
    end

    subgraph WALLETS ["Wallet Extensions"]
        direction LR
        FR["Freighter"]:::wallet
        XB["xBull"]:::wallet
        AL["Albedo"]:::wallet
    end

    subgraph STELLAR ["Stellar Testnet Infrastructure"]
        direction TB
        SOROBAN_RPC["Soroban RPC Server"]:::rpc
        HORIZON["Horizon REST API"]:::rpc
        CONTRACT["Split Bill Contract (WASM)"]:::contract
        CORE["Stellar Core Consensus"]:::rpc
    end

    UI <--> |"State & Events"| HOOKS
    HOOKS <--> |"Unified API"| SWK
    HOOKS <--> |"Tx Assembly"| CLIENT
    SWK <--> |"Auth / Sign"| FR & XB & AL
    CLIENT --> |"invokeContract"| SOROBAN_RPC
    CLIENT --> |"getEvents (poll 6s)"| SOROBAN_RPC
    CLIENT --> |"getAccount / submit"| HORIZON
    SOROBAN_RPC <--> |"Execute WASM"| CONTRACT
    HORIZON <--> |"Ledger Updates"| CORE
    CONTRACT -.- |"Stored on"| CORE

    style BROWSER fill:#131318,stroke:#35343a,stroke-width:1px,stroke-dasharray:5 5
    style WALLETS fill:#131318,stroke:#35343a,stroke-width:1px,stroke-dasharray:5 5
    style STELLAR fill:#131318,stroke:#35343a,stroke-width:1px,stroke-dasharray:5 5
```

---

## Smart Contract Transaction Flow

All state-modifying operations follow the full Soroban pipeline: Build → Simulate → Sign → Submit → Confirm. Private keys **never** leave the wallet extension.

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant App as SYNC_SPLIT
    participant SWK as StellarWalletsKit
    participant W as Wallet Extension
    participant RPC as Soroban RPC
    participant SC as Split Contract

    rect rgba(124, 58, 237, 0.1)
        Note over U,App: Phase 1 — Input & Validation
        U->>App: Enter split amount, participants, addresses
        App->>App: StrKey validation + amount checks
    end

    rect rgba(78, 222, 162, 0.1)
        Note over App,RPC: Phase 2 — Build & Simulate
        App->>RPC: getAccount(publicKey)
        RPC-->>App: Account state + sequence
        App->>App: Build InvokeHostFunctionOp
        App->>RPC: simulateTransaction(tx)
        RPC->>SC: Execute WASM (dry run)
        SC-->>RPC: Return simulation result
        RPC-->>App: Assembled transaction
    end

    rect rgba(251, 171, 255, 0.1)
        Note over App,W: Phase 3 — Wallet Signing
        App->>SWK: signTransaction(xdr)
        SWK->>W: Route to active wallet
        W-->>U: Authorization prompt
        U->>W: Approve & sign
        W-->>SWK: Signed XDR envelope
        SWK-->>App: { signedTxXdr }
    end

    rect rgba(245, 158, 11, 0.1)
        Note over App,SC: Phase 4 — Submit & Confirm
        App->>RPC: sendTransaction(signedTx)
        RPC->>SC: Execute WASM (commit)
        SC-->>SC: Update state + emit events
        RPC-->>App: Transaction hash
        loop Poll every 2s (max 30 attempts)
            App->>RPC: getTransaction(hash)
            RPC-->>App: Status: PENDING | SUCCESS | FAILED
        end
        App-->>U: Success animation + Explorer link
    end
```

---

## Contract Functions

| Function | Args | Returns | Auth | Description |
|:---|:---|:---|:---:|:---|
| `create_split` | `creator, total_amount, description` | `u64` (split ID) | Creator | Creates a new split bill on-chain |
| `add_participant` | `split_id, address, amount` | `()` | Creator | Adds a participant with their owed amount |
| `mark_paid` | `split_id, address` | `()` | Participant | Marks participant as paid; auto-settles if all paid |
| `get_split` | `split_id` | `Split` | None | Returns full split state including participants |
| `get_split_count` | — | `u64` | None | Returns total number of splits created |

---

## Protocol Features

| Feature | Description |
|:---|:---|
| **Multi-Wallet** | Unified wallet support via StellarWalletsKit — Freighter, xBull, Albedo |
| **On-Chain Splits** | Bills stored as persistent state on Soroban smart contract |
| **Real-Time Events** | Live event feed via Soroban RPC polling (6s interval) |
| **Transaction Pipeline** | Full state machine: Build → Simulate → Sign → Submit → Confirm |
| **Auto-Settlement** | Contract auto-detects when all participants have paid |
| **Authorization** | Creator auth for adding participants, participant auth for marking paid |
| **StrKey Validation** | Rigorous `ed25519` public key validation before any transaction |
| **Kinetic Midnight UI** | Glassmorphism, gradient accents, spring animations via `motion/react` |
| **Live Breakdown** | Dynamic split calculation: Equal, Exact, or Proportional modes |
| **Zero-Cost Sandbox** | Fully operational on Stellar Testnet — no real funds required |

---

## Technology Stack

| Layer | Technology | Function |
|:---|:---|:---|
| **Frontend** | React (Vite) | High-performance VDOM rendering |
| **Styling** | Tailwind CSS v4 | `@theme` design tokens, glassmorphism utilities |
| **Animation** | `motion/react` | GPU-accelerated spring animations |
| **Multi-Wallet** | StellarWalletsKit | Unified Freighter + xBull + Albedo API |
| **Blockchain SDK** | `@stellar/stellar-sdk` | XDR encoding, Tx building, Soroban RPC |
| **Smart Contract** | Soroban (Rust) | On-chain split bill logic + events |
| **Contract SDK** | `soroban-sdk` v22 | Contract types, storage, auth, events |
| **Routing** | React Router v7 | SPA navigation with outlet context |
| **Hosting** | Vercel | Edge deployment with env var management |
| **Explorer** | Stellar Expert | Transaction + contract verification |

---

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [Freighter Wallet](https://www.freighter.app/) (browser extension)

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd Stellar-Project/app
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# The .env already contains the deployed contract ID
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Connect & Test
1. Install [Freighter](https://www.freighter.app/) and switch to **Testnet**
2. Fund your address via [Friendbot](https://laboratory.stellar.org/#account-creator?network=test)
3. Open `http://localhost:5173` → Connect Wallet → Create your first split!

---

## Contract Deployment (Optional)

To deploy your own instance of the contract, see [DEPLOYMENT.md](./DEPLOYMENT.md).

```bash
# Prerequisites
rustup target add wasm32-unknown-unknown
cargo install --locked stellar-cli

# Build
cd contracts/split_bill
cargo build --target wasm32-unknown-unknown --release

# Deploy
stellar keys generate --global deployer --network testnet --fund
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/split_bill.wasm \
  --source deployer --network testnet

# Verify
stellar contract invoke --id <CONTRACT_ID> \
  --source deployer --network testnet -- get_split_count
```

---

## Project Structure

```
Stellar-Project/
├── app/                          # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/           # AppLayout, TopNav, SideNav
│   │   │   ├── wallet/           # WalletSelectorModal, WalletWidget
│   │   │   ├── split/            # SplitCalculator, SplitDetails, SplitEventFeed
│   │   │   ├── transaction/      # SendTransaction, TransactionStatus, TransactionStatusPanel
│   │   │   └── ui/               # GradientButton, LoadingSkeleton, etc.
│   │   ├── hooks/
│   │   │   ├── useWallet.js      # Multi-wallet via StellarWalletsKit
│   │   │   ├── useContract.js    # Smart contract interactions
│   │   │   ├── useEvents.js      # Real-time event polling
│   │   │   ├── useTransaction.js # XLM payment state machine
│   │   │   └── useBalance.js     # Horizon balance fetching
│   │   ├── utils/
│   │   │   ├── contractClient.js # Soroban RPC abstraction layer
│   │   │   └── stellar.js        # Network config, StrKey utils
│   │   └── pages/                # Dashboard, Wallet, Transactions, Settings
│   ├── .env                      # Contract ID + network config
│   └── vite.config.js            # Polyfills for stellar-sdk
├── contracts/
│   └── split_bill/
│       ├── Cargo.toml            # soroban-sdk v22
│       └── src/lib.rs            # Full Soroban contract (5 functions, 3 events, 6 tests)
├── DEPLOYMENT.md                 # Step-by-step contract deployment guide
└── README.md                     # This file
```

---

<div align="center">
  <br />
  <p>Built on <strong>Stellar</strong> · Powered by <strong>Soroban</strong></p>
  <p>
    <a href="https://app-nine-gray-18.vercel.app">Live App</a> · 
    <a href="https://stellar.expert/explorer/testnet/contract/CCEIBX7TF3OY5CWE5GDGZPFNNTIRTLLHDYJ4NQG4YLWYTNURUZ4YGKGF">Contract</a> · 
    <a href="./DEPLOYMENT.md">Deploy Guide</a>
  </p>
</div>
