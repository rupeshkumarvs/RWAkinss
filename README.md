# RWAkins — An Autonomous AI CFO for the Underserved

**Banking-grade yield and on-chain credit for anyone with a phone and a wallet — no bank account, no jargon, no financial expertise required.**

RWAkins is a personal **AI CFO agent** that removes the complexity of real-world-asset (RWA) investing. You don't configure sliders or watch markets — you describe your financial goals in plain English, and an autonomous AI agent manages a tokenized real-world-asset portfolio for you: continuously evaluating live market data against your stated wealth rules and executing **on-chain rebalances on its own**.

> **Themes:** Financial Inclusion & FinTech · AI × Real-World Assets (RWA) — built on **Mantle**.

It manages two yield-bearing real-world assets:

- **USDY** — Ondo's tokenized US Treasury bonds. The stable, dollar-denominated, low-risk leg.
- **mETH** — Mantle Staked ETH. The growth, higher-yield leg.

Yields and prices are **not hardcoded** — they are pulled live and synced on-chain by the agent itself (see *Live & Dynamic* below).

---

## Why this matters — financial inclusion, not just DeFi

1.4 billion adults are unbanked, and billions more are **underserved**: locked out of dollar-stable savings, invisible to credit bureaus, and excluded by financial products that assume expertise they were never taught. RWAkins is built to close that gap by delivering the three pillars of financial citizenship — **savings, literacy, and credit** — to people the banks ignore.

| Barrier the underserved face | How RWAkins removes it |
|---|---|
| **No access to stable, dollar-denominated yield** — local savings eaten by inflation | A wallet + a phone is all you need — **no bank account**. USDY puts **tokenized US-Treasury yield** in anyone's hands, anywhere in the world. |
| **The financial-literacy wall** — sliders, jargon, allocation math | A **plain-English AI CFO**: say *"grow my savings but keep most of it safe,"* and the agent turns intent into a sound, risk-capped allocation. Literacy is no longer the price of entry. |
| **Credit invisibility** — no credit history means no loans | A **soulbound, on-chain Credit Passport** builds a portable credit score from real behaviour, unlocking **borrowing for the credit-invisible**. |
| **Cost** — micro-balances uneconomical on most chains | Runs on **Mantle**, an L2 with cents-level fees, so small balances are viable. |

That is what makes RWAkins a *financial-inclusion* product rather than a yield optimizer for the already-wealthy: it hands ordinary people an autonomous private banker that speaks their language.

---

## Live & Dynamic — nothing hardcoded

Every number the agent reasons over and shows is sourced live; the on-chain state is kept in sync with the real market by the agent itself. This is the technical depth behind the AI × RWA thesis.

| System | How it's live |
|---|---|
| **Wealth-rule parsing** | An LLM (Groq, OpenAI-compatible) extracts *signals* from your plain-English goal; a deterministic priority-chain turns them into the allocation. No-key fallback is a regex parser. |
| **Real DEX swaps** | Every rebalance is a **real on-chain swap** through `RWAkinsAMM` — a constant-product (x·y=k) pool with a 0.3% fee. The vault routes USDY↔mETH through it, so rebalances take **real slippage + price impact** (a 70% target lands at ~69.96%, not a clean number). No mint-at-fixed-price. |
| **mETH price** | The pool's **on-chain spot price** (`reserveUsdy/reserveMeth`) — real price discovery. The agent anchors it to the live CoinGecko price via `amm.syncToPrice()`, exactly the job arbitrageurs do on a real DEX. The dashboard reads the pool price back, so `$` and `%` reconcile. |
| **USDY & mETH yields** | Real reference APYs from DefiLlama, written on-chain via `token.setYield()` each sync; the dashboard reads `currentYield()`. The agent's outage fallback re-fetches DefiLlama live rather than using static numbers. |
| **Real-world benchmark** | The genuine **US Treasury risk-free rate** that USDY tokenizes, fetched live from the U.S. Treasury (FiscalData, keyless; upgrades to the Federal Reserve / FRED with a key) — so the on-chain treasury leg is provable against the off-chain instrument it represents. |
| **Volatility** | Annualized **realized volatility** computed from CoinGecko's 7-day hourly ETH series — not a formula. |
| **Market sentiment** | The live crypto **Fear & Greed Index** (keyless), an extra market-regime signal for the agent. |
| **Risk council** | 4 agents (Market Analyst, Risk Guardian, Yield Optimizer, Execution Planner) are **real LLM personas** debating the live numbers. The mETH ≤ 70% cap veto is enforced in code, never delegated to the model. Deterministic per-agent fallback when the LLM is unavailable. |
| **Compliance screening** | Every wallet is screened against the **Chainalysis on-chain Sanctions Oracle** (the live OFAC list institutions use) — a keyless on-chain read. |
| **Autonomous execution** | Real `vault.rebalance()` / `rebalanceFor()` on Mantle → real tx hashes + real AMM swaps, driven by an **autonomous heartbeat** so the agent acts without you. Gas-gated oracle writes only fire when the live value actually drifted. |

> **On the assets:** USDY/mETH are deployed as testnet `MockRWAToken` contracts (real Ondo USDY / Mantle mETH are mainnet-only + KYC-gated). The **swap mechanics, price discovery, yields, and volatility are all real** — only the tokens are stand-ins. Mainnet is an address swap (real USDY/mETH + a real Mantle DEX router) plus Ondo KYC away; the agent/vault logic is unchanged.

---

## The end-to-end inclusion loop: earn → build reputation → borrow

The vault is one half of a complete on-chain financial life. **Save → build a credit identity → borrow** — every step KYC-gated, risk-scored, and recorded on Mantle, the same primitives a bank offers, available permissionlessly:

| Tool | Route | What's real on-chain |
| --- | --- | --- |
| **Compliance** | `/compliance` | KYC tier + jurisdiction attested on-chain (`RWAkinsCompliance.attestKYC`); self-sovereign investment mandate; a hard-gate AI compliance check whose verdict is appended to the audit trail. Sanctioned-jurisdiction + KYC gates are enforced in **code**, never by the model. |
| **Audit Trail** | `/compliance/audit-trail` | A tamper-evident, per-wallet monotonic log of every agent decision + risk score, read straight from contract events — each linked to its Mantle tx. |
| **AI Risk System** | `/insurance-risk-system` | A 5-dimension risk score (concentration, market/vol, liquidity, leverage, yield sustainability), computed deterministically and **anchored on-chain** via `recordRisk`. |
| **Credit Passport** | `/credit` | A **soulbound (non-transferable) ERC-721** carrying a 300–900 credit score the AI engine computes from real on-chain behaviour — a portable credit identity for people with none. |
| **AI Lending** | `/lend` | Borrow USDY against USDY/mETH. The AI negotiates the APR; the **credit passport score sets the LTV**; `RWAkinsCompliance.isVerified()` is enforced on-chain before any loan opens. |

Engines are pure + auditable (`lib/creditSuite/*`, "signal-then-code" like the rebalance brain); the AI overlay (`/api/{compliance,risk,credit,lend}/*`) adds natural-language judgement but never moves a hard gate.

---

## Architecture

```
┌─────────────────────────────────────────────┐
│              Frontend (Next.js)              │
│  RainbowKit · Wagmi · Vercel AI SDK · Recharts│
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│           Agent Brain (API Routes)           │
│                                             │
│  POST /api/intent/parse                     │
│    └─ LLM: plain English → WealthRules JSON │
│                                             │
│  POST /api/rebalance/trigger                │
│    └─ Reads rules + live market data        │
│    └─ 4-agent council decides: rebalance?   │
│    └─ Returns { usdyBps, methBps, narrative}│
│                                             │
│  GET  /api/agent/heartbeat                  │
│    └─ Autonomous tick → acts on its own     │
│                                             │
│  GET  /api/portfolio/:wallet                │
│    └─ Reads live vault balances via viem    │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│         Blockchain Layer (Mantle)            │
│                                             │
│  RWAkinsVault · RWAkinsAMM · MockRWAToken    │
│  RWAkinsCompliance · CreditPassport · Lending│
└─────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, Tailwind CSS |
| Wallet | RainbowKit, Wagmi, viem |
| AI Chat | Vercel AI SDK |
| LLM | Groq (OpenAI-compatible) — provider-agnostic via `OPENAI_BASE_URL` |
| Market data | CoinGecko (price + realized vol), DefiLlama (reference yields), U.S. Treasury / FRED (risk-free benchmark), alternative.me (Fear & Greed) |
| Compliance | Chainalysis on-chain Sanctions Oracle |
| Charts | Recharts |
| Smart Contracts | Solidity 0.8.24, Foundry |
| Network | Mantle Sepolia Testnet |
| Autonomy | Scheduled heartbeat (GitHub Actions / Vercel Cron) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Foundry (for contract deployment)
- A funded Mantle Sepolia wallet (get MNT from the [Mantle faucet](https://faucet.sepolia.mantle.xyz))

### 1. Clone and install

```bash
git clone https://github.com/rupeshkumarvs/RWAkins-Turing-test-hackathon.git
cd RWAkins-Turing-test-hackathon
npm install
```

### 2. Set environment variables

```bash
cp .env.example .env.local
```

Fill in (all server-side keys — never use a `NEXT_PUBLIC_` prefix on a secret):

```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=
OPENAI_API_KEY=                 # Groq (OpenAI-compatible) key for the AI council
DEPLOYER_PRIVATE_KEY=           # funded Mantle Sepolia key — never commit this
AGENT_PRIVATE_KEY=              # on-chain attestor/agent/scorer (the deploy key)
CRON_SECRET=                    # protects the autonomous heartbeat endpoint

# Optional — upgrade the live-data sources (each works keyless without these):
FRED_API_KEY=                   # daily Federal Reserve rates instead of monthly Treasury data
SANCTIONS_RPC_URL=              # a dedicated Ethereum-mainnet RPC for sanctions screening
```

### 3. Deploy contracts

Deploys the full stack to Mantle Sepolia — the two `MockRWAToken`s (USDY, mETH), `RWAkinsAMM`, `RWAkinsVault`, plus the credit suite: `RWAkinsCompliance`, `RWAkinsCreditPassport`, and `RWAkinsLending`. All addresses are written to `lib/rwa-deployed.json` automatically, and the pages flip from "Preview · deploy pending" to "Live on Mantle" the moment they're populated.

> **Privileged writes (KYC attestation, credit scoring, risk anchoring, audit logging)** are signed server-side by the verifier/agent key. Set `AGENT_PRIVATE_KEY` to the **deploy key** (the script sets it as the on-chain `attestor` + `agent` + `scorer`). Without it the suite still computes real AI scores over live data and degrades to a decision-only response with `txHash: null` — it never fabricates a hash.

### 4. Run the frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and connect your wallet on Mantle Testnet.

### 5. Autonomy (the heartbeat)

The agent acts on its own via a scheduled call to `/api/agent/heartbeat`. A GitHub Actions workflow (`.github/workflows/heartbeat.yml`) drives the live 5-minute cadence for free; Vercel Cron keeps a daily safety-net run. Both send `Authorization: Bearer <CRON_SECRET>`; the endpoint is gas-gated, so it only acts when the live market actually drifted.

---

## How to Use

1. **Connect** your wallet on Mantle Sepolia Testnet — no bank account needed.
2. **Describe** your financial goals in the chat — plain English, no sliders.
3. **Confirm** the AI CFO's parsed allocation plan.
4. **Fund** the vault — the agent mints test USDY to your wallet and deposits it.
5. **Let it run** — the autonomous heartbeat evaluates the market and rebalances on-chain for you.
6. **Build credit & borrow** — earn a soulbound Credit Passport, then borrow against your holdings.
7. **View Activity** — every decision with its reason and Mantle tx hash.

---

## License

MIT
