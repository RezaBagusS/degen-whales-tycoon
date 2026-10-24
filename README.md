# 🐋 DEGEN & WHALE — The Ultimate Crypto Tycoon Simulator

<div align="center">

[![Live Demo](https://img.shields.io/badge/PLAY_NOW-degen--whales--tycoon.vercel.app-00FF88?style=for-the-badge&logo=vercel&logoColor=black)](https://degen-whales-tycoon.vercel.app)
[![Version](https://img.shields.io/badge/version-1.4.0_Production-38BDF8?style=for-the-badge)](https://github.com/RezaBagusS/degen-whales-tycoon)
[![License](https://img.shields.io/badge/license-MIT-F59E0B?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js_16-Turbopack-white?style=for-the-badge&logo=next.js&logoColor=black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-Client_Engine-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Database](https://img.shields.io/badge/Neon-Serverless_Postgres-00E599?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)

**An immersive, high-stakes idle trading floor tycoon where you rise from a broke retail trader in a dusty boarding room into a market-manipulating crypto Whale.**

[🎮 Play Live Simulator](https://degen-whales-tycoon.vercel.app) • [📖 Gameplay Features](#-key-features) • [🛠️ Architecture](#%EF%B8%8F-technology-stack) • [🚀 Quickstart](#-quickstart--local-development)

</div>

---

## 🎯 Game Overview

**DEGEN & WHALE** merges the adrenaline of **high-leverage cryptocurrency perpetual trading** with the addictive progression of an **idle tycoon empire builder**. 

You start with nothing but **$10.00 cash** in a crampy, dusty student room (*Kamar Kos Sempit*). By scalping volatile meme coins, taking calculated 100x leverage bets, building high-frequency automated mining rigs, and deploying black market insider gadgets, you accumulate generational wealth, dodge SEC crackdowns, survive hacker drain events, and eventually execute the ultimate **Rugpull Prestige** to join the elite **Whale Syndicate**.

> **100% Provably Fair Simulation:** Zero real money required, zero signup walls, and zero friction. All market dynamics and volatility run in an optimized client-side deterministic canvas engine.

---

## ⚡ Key Features

### 📈 1. Real-Time High-Octane Trading Terminal
- **Living Candlestick Canvas Engine**: High-performance HTML5 2D canvas chart with smooth real-time price action and multi-timeframe aggregation (`5s`, `15s`, `30s`, `1m`, `5m`, `15m`, `30m`, `1h`, `4h`, `1d`).
- **Flexible Leverage Spectrum**: Trade LONG or SHORT with `2x`, `10x`, `50x`, and `100x` leverage (up to `250x` with black market VIP passes).
- **Pro Risk Management**: Set Take-Profit (TP) and Stop-Loss (SL) targets with visual drag-and-drop boundary lines directly on the chart.
- **Realistic Slippage, Liquidation, & Volatility**: Simulated market orders, funding mechanics, closing taxes, and immediate liquidation alerts when margin falls below maintenance thresholds.
- **Technical Analysis Suite**: Built-in EMA-20, EMA-50, EMA-200, Bollinger Bands, and interactive chart drawing tools (Trendlines, Horizontal Support/Resistance).

### 🏭 2. Idle Tycoon Infrastructure & Mining Rigs
- **10 Escalating Infrastructure Tiers**:
  1. *Indikator Garis Keramat* (Support/Resistance Chart Pen)
  2. *Grup VIP Sinyal 'Pasti Cuan'* (Paid Alpha Signals Channel)
  3. *Layar Monitor Vertical 4x* (Multi-Monitor Battlestation)
  4. *Sniper Bot (Solana/DEX)* (Front-Running Bot)
  5. *Sewa Quant Developer* (Full-time Math Genius)
  6. *Agentic AI Trading Cluster* (Predictive Machine Learning Farm)
  7. *Bikin Exchange & Koin Sendiri* (Own the Casino)
  8. *Tim Lobi Regulator & Pajak* (Institutional Compliance Lobby)
  9. *Satelit Arbitrase Kuantum* (Zero-Latency Space Trading)
  10. *Akuisisi Mesin Cetak Bank Sentral* (Infinite Liquidity Engine)
- **Workstation Evolution**: Upgrade your real-estate from *Kamar Kos Sempit* to *Warnet VIP 24 Jam*, *Ruko Glodok*, *SCBD Penthouse Office*, up to an *Offshore Private Island*.
- **Offline Earnings & 2x Multiplier**: Idle earnings continue accruing for up to 8 hours while you are away, with optional 2x doubler rewards.

### 🕶️ 3. Black Market & Power-Ups
- **Whale Pump Whistle & Dump Horn**: Force temporary synthetic bull runs or massive market crashes on degen pairs.
- **Liquidation Shield**: High-tech insurance that breaks upon liquidation to recover **85%** of your collateral.
- **Insider Radar & Zero-Fee Passes**: Detect institutional order books and eliminate transaction fees for critical scalps.

### 📊 4. Full Financial Ledger (Buku Kas Mutasi)
- Track **100% of your empire's cashflow** in real-time.
- Instant financial summary cards: **Total Income (Masuk)**, **Total Expense (Keluar)**, and **Net Cashflow**.
- Filter transactions by category: `Semua Mutasi`, `Trade`, `Pemasukan (+)`, and `Pengeluaran (-)`.

### 🌐 5. Viral PnL Card Exporter
- Export high-resolution (1200x675) Cyberpunk Bybit/Binance-style flex cards with one click.
- Includes ROI percentages, dollar profits, entry prices, leverage badges, rank seals, and watermark links for social sharing.

### 👑 6. Whale Syndicate Prestige Loop
- Execute a **"Rugpull"** reset once your net worth reaches the required threshold.
- Convert your temporary empire into permanent **Whale Tokens**.
- Each Whale Token grants a **+0.50x global multiplier** and a **lifetime passive dividend of +$5.00/s** that persists across all future resets.

### ☁️ 7. Player Accounts & Cross-Device Cloud Sync
- **Seamless Registration & Login**: Play anonymously as a guest or create a secure cloud account (`/auth`, `/login`, `/register`).
- **PBKDF2 Native Security**: Zero-dependency password hashing with individual salt and HMAC-signed session cookies.
- **Zero Progress Loss**: Full state fidelity backup (cash, upgrades, positions, ledger, drawings) saved into PostgreSQL.
- **Instant Auto-Hydration**: Switching browsers, devices, or incognito windows automatically restores game progress without manual file imports.
- **Dual-Database Branching**: Complete physical isolation between `dev` (development database branch) and `main` (production database branch) via Neon Serverless Postgres.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Core Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack Engine) |
| **Frontend UI** | [React 19](https://react.dev/), [Tailwind CSS 3](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/) |
| **Graphics Engine** | HTML5 Canvas 2D (Deterministic Realtime Candle Rendering) |
| **Audio Synthesizer** | Web Audio API (Zero-asset, zero-latency procedural SFX) |
| **State & Storage** | LocalStorage Engine `v8` with Multi-Tab BroadcastChannel synchronization |
| **Cloud Sync & DB** | [Prisma ORM 7](https://www.prisma.io/), [Neon PostgreSQL](https://neon.tech) (Serverless Database with Branching) |
| **Security & Auth** | Node.js Crypto (PBKDF2, HMAC signed cookies) |
| **Testing** | [Playwright Test Suite](https://playwright.dev/) (21 E2E tests for trading, mechanics, & state) |
| **Deployment** | [Vercel Edge Network](https://vercel.com/) |
| **Testing** | [Playwright Test Suite](https://playwright.dev/) (21 E2E tests for trading, mechanics, & state) |
| **Deployment** | [Vercel Edge Network](https://vercel.com/) |

---

## 🚀 Quickstart & Local Development

### Prerequisites
- **Node.js**: `v20.9.0` or higher (`v22 LTS` recommended)
- **npm**: `v10.0.0` or higher

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/RezaBagusS/degen-whales-tycoon.git
cd degen-whales-tycoon

# Install dependencies
npm install
```

### 2. Launch Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The trading floor engine will spin up instantly with hot-module reloading enabled via Turbopack.

### 3. Production Build & Validation

```bash
# Verify TypeScript definitions
npm run typecheck

# Build optimized production bundle
npm run build

# Run local production server
npm run start
```

---

## 🧪 Testing Suite

The repository includes a comprehensive Playwright test suite covering game physics, trading math, save migrations, and UI hydration.

```bash
# Install Chromium test runner
npx playwright install chromium

# Run all 21 regression tests
npm test

# Test against production bundle
npm run test:production
```

### Test Coverage Highlights:
- ✅ **Income & DPS Calculus**: Verification of idle accruals, location upkeep taxes, and Whale token dividends.
- ✅ **Position Lifecycle**: Validation of Long/Short orders, margin deductions, TP/SL triggers, and liquidation thresholds.
- ✅ **State Persistence & Multi-Tab Isolation**: Protection against race conditions, storage quota limits, and multi-tab overwrite locks.
- ✅ **Offline Progress Recovery**: Calculation of offline earnings up to the 8-hour cap.

---

## 📁 Project Architecture

```text
degen-whale-nextjs/
├── prisma/
│   └── schema.prisma            # Database schema for cloud sync
├── public/                      # Static assets, icons, and audio fallbacks
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Global HTML shell, SEO metadata & font definitions
│   │   ├── page.tsx             # Main entry point mounting GameClient
│   │   ├── globals.css          # Tailwind design tokens & animations
│   │   └── api/user/            # Cloud save & leaderboard API endpoints
│   ├── components/
│   │   ├── GameClient.tsx       # Dynamic Client Component boundary (SSR: false)
│   │   ├── GameLoading.tsx      # Terminal loading animation
│   │   └── game/
│   │       ├── Game.jsx         # Core trading floor state machine & chart engine
│   │       ├── DegenShop.jsx    # Infrastructure upgrades & Black Market interface
│   │       ├── BlackMarket.js   # Special power-ups & consumables definitions
│   │       ├── PnlShareModal.jsx# Cyberpunk 1200x675 Canvas PnL card generator
│   │       ├── MemeLaunchpad.jsx# High-volatility pump-and-dump mini-game
│   │       ├── audio.js         # Procedural Web Audio API sound synthesizer
│   │       └── translations.js  # Bilingual localization (ID / EN)
│   └── config/
│       └── adsConfig.js         # Institutional partner & developer support settings
└── tests/
    ├── game.spec.js             # Core game mechanics verification
    ├── startup.spec.js          # Boot & initialization sanity checks
    └── nextjs.spec.js           # Client hydration & storage resiliency tests
```

---

## 🔒 Security & Client-Side Resiliency

1. **Storage Isolation**: Saves are isolated strictly by origin (`degen_whale_save_v8`). Automatic backward-compatible migration is included for older `v7` saves.
2. **Multi-Tab Mutex**: A `BroadcastChannel` protocol detects multiple active instances and locks secondary tabs to prevent state clobbering.
3. **Graceful Degraded Mode**: If `localStorage` is disabled or fails due to quota limits, the game automatically switches to volatile memory mode with a clear user prompt, preventing fatal crashes.
4. **Anti-Spam Ad Protection**: Server-independent 3-minute cooldowns prevent reward button spamming while preserving publisher integrity.

---

## 🤝 Contributing & Community

Contributions are welcomed! Feel free to submit issues, suggest new degen pairs, or propose new black market items.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feat/amazing-feature`)
3. Commit your Changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the Branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request against the `dev` branch

---

## ☕ Support the Developer

If you enjoy playing **Degen & Whale**, consider supporting active development:

- ☕ **Saweria (IDR / QRIS)**: [saweria.co/rezabaguss](https://saweria.co/rezabaguss)
- ⭐ **Star this repository** on GitHub!

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">

Crafted with 💚 for Degens & Whales worldwide.

</div>
