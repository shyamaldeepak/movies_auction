# 🎬 Cinema Draft — Real-Time Live Movie Auction Engine

A high-performance, real-time Hollywood Movie Draft & Box Office Auction platform engineered with the exact requested enterprise tech stack:

---

## 🛠 Supported Tech Stack Implementation

| Layer | Technologies & Implementations |
| :--- | :--- |
| **Core Frontend** | **React 19**, **Vite 6**, **React Router 7** |
| **Styling & Motion** | **Tailwind CSS v4**, **Framer Motion**, **Lucide Icons** |
| **Live Bidding Engine** | **Firebase RTDB**, **7-Server Cluster Engine**, **BroadcastChannel**, **Web Locks API** (`navigator.locks`) |
| **Directory & Storage** | **Cloudflare Workers**, **Cloudflare D1 (SQLite)**, **LocalStorage / SessionStorage** |
| **AI Evaluation Engine** | **Groq Cloud API** (`qwen/qwen3.8-27b` & `qwen-2.5-32b-it`), **Strict Zod JSON Schema Validation** |
| **Export & Sharing** | **html-to-image**, **canvas-confetti**, **Web Share API** |

---

## 🌟 Key Features

### 1. ⚡ Live Distributed Bidding Engine
- **7-Server Multi-Region Cluster**:
  - `US-East-Primary` (Virginia - Primary Leader)
  - `US-West-Replication` (Oregon)
  - `EU-Central-EMEA` (Frankfurt)
  - `AP-East-APAC` (Tokyo)
  - `AP-South-India` (Mumbai)
  - `SA-East-LatAm` (São Paulo)
  - `Edge-Relay-Anycast` (Global Edge)
  - Dynamic leader election, latency telemetry (12ms - 85ms), and heartbeat consensus.
- **Web Locks API Concurrency**:
  - Uses `navigator.locks.request('auction-bid-lock')` to eliminate bid collisions, double-spending virtual budgets, and simultaneous timer race conditions.
- **BroadcastChannel Multi-Tab Synchronization**:
  - Instantaneous zero-latency cross-tab synchronization of bids, lots, timers, and hammer states.
- **Firebase Realtime Database (RTDB)**:
  - Plug-and-play Firebase RTDB integration via `services/biddingEngine/firebaseBridge.ts` with transparent fallback to local synchronized cluster.
- **Anti-Sniping Engine**:
  - Automatically extends countdown timer (+5s to 8s) if a bid is placed in the final 6 seconds.
- **Autonomous AI Studio Bots**:
  - AI competitors (*A24 Prestige Lab*, *MegaCorp Blockbusters*, *Horizon CineVault*) that evaluate ROI, budget margins, and place realistic competing bids.

### 2. 🗄️ Cloudflare Workers & Cloudflare D1 (SQLite) Directory
- **D1 Database Schema** (`workers/schema.sql`):
  - Relational tables for `movies`, `auctions`, and `bids` with JSON serialization and indexes.
- **Cloudflare Worker** (`workers/index.ts` & `wrangler.jsonc`):
  - Global edge endpoints: `GET /api/movies`, `POST /api/movies`, `GET /api/health`.
- **Interactive D1 SQL Terminal**:
  - Query and inspect movies live with SQL queries in the browser (e.g. `SELECT * FROM movies WHERE genre = 'Sci-Fi' ORDER BY buzz_score DESC`).
- **Offline / Session Persistence**:
  - Client-side D1 caching layer backed by `localStorage` and `sessionStorage`.

### 3. 🧠 Groq Cloud AI Slate Evaluation Engine
- **Strict JSON Schema Validation**:
  - Powered by Zod schema enforcing structured outputs:
    - Overall Studio Grade (`A+`, `A`, `B+`, `C`, etc.)
    - Estimated Worldwide Box Office Gross ($M)
    - Net Profit / Margin Projections
    - Return on Investment (ROI %)
    - Academy Awards & Oscar Wins forecast
    - Rotten Tomatoes buzz score & Critical consensus review
    - Studio Superlatives (*"Steal of the Auction"*, *"Riskiest Overpay"*, *"Flagship Anchor"*)
    - Board of Directors Executive Verdict
- **Model Support**:
  - Direct integration with `qwen/qwen3.8-27b`, `qwen/qwen-2.5-32b-it`, `llama-3.3-70b-versatile`, or `deepseek-r1-distill-llama-70b`.
  - Built-in dynamic fallback simulation so the evaluation works out of the box even without an API key!

### 4. 🏆 Export & Sharing
- **html-to-image**:
  - 1-Click generation of high-resolution Studio Slate Certificates & Trophy Cards as PNG files.
- **canvas-confetti**:
  - Celebratory fireworks on winning bids, auction completion, and AI grading reveals.
- **Web Share API**:
  - Direct sharing to native OS share sheet (mobile/desktop) or clipboard copy fallback.

### 5. 🔊 Pure Web Audio API Sound Design
- Real-time synthetic wooden gavel strikes, metallic bidding chimes, countdown warning ticks, and victory fanfares (zero external audio file dependencies).

---

## 🚀 Getting Started

### 1. Install & Build
```bash
# Run development server
npm run dev

# Run production build & type check
npm run build
```

### 2. Cloudflare D1 & Worker Deployment (Optional)
```bash
# Create Cloudflare D1 database
npx wrangler d1 create movies_auction_d1

# Run SQL schema migration
npx wrangler d1 execute movies_auction_d1 --file=workers/schema.sql

# Deploy edge worker
npx wrangler deploy
```

---

## 📂 Project Directory Structure

```
movies auction/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── wrangler.jsonc
├── workers/
│   ├── index.ts               # Cloudflare Worker Edge API
│   └── schema.sql             # Cloudflare D1 SQLite Schema & Migrations
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css              # Tailwind CSS v4 theme & animations
│   ├── types/
│   │   ├── auction.ts         # Room, Lot, Bid, Studio, ClusterNode types
│   │   ├── movie.ts           # Movie property specifications
│   │   └── groq.ts            # Groq AI & Zod Strict JSON Schema
│   ├── data/
│   │   └── mockMovies.ts      # Curated cinema catalogue (Sci-Fi, Blockbuster, Prestige)
│   ├── services/
│   │   ├── biddingEngine/
│   │   │   ├── clusterManager.ts # 7-Server Cluster Engine & Leader consensus
│   │   │   ├── webLockService.ts # Web Locks API atomic execution
│   │   │   ├── broadcastSync.ts  # BroadcastChannel multi-tab bus
│   │   │   └── firebaseBridge.ts # Firebase RTDB connector & fallback
│   │   ├── storage/
│   │   │   └── d1Client.ts       # Cloudflare D1 SQLite client & browser storage
│   │   ├── ai/
│   │   │   └── groqEvaluator.ts  # Groq Cloud API caller with strict schema
│   │   └── export/
│   │       └── shareService.ts   # html-to-image, canvas-confetti, Web Share API
│   ├── utils/
│   │   └── audioEffects.ts    # Web Audio API procedural sound engine
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── ClusterStatusModal.tsx # 7-Server Cluster telemetry & failover
│   │   ├── GroqConfigModal.tsx    # Groq API Key & Model selector
│   │   ├── MovieLotCard.tsx       # Spotlight movie lot presentation
│   │   ├── BiddingPaddle.tsx      # Quick raise paddles & All-In button
│   │   ├── AuctionHammer.tsx      # Going Once / Twice / Sold animations
│   │   ├── LiveBidFeed.tsx        # Real-time bid ticker with lock latency
│   │   ├── StudioSlateRoster.tsx  # Studio Dugout & budget meters
│   │   ├── AIEvaluationReport.tsx # Groq AI Scorecard & Oscar forecast
│   │   └── ExportSlateCard.tsx    # High-res slate certificate export
│   └── pages/
│       ├── AuctionRoomPage.tsx    # Live auction arena
│       ├── MovieDirectoryPage.tsx # Cloudflare D1 query terminal & catalog
│       └── PostAuctionPage.tsx    # Studio Slate Showcase & AI Grade
```

