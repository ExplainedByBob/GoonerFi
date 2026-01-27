# OF Virality DEX

A decentralized exchange on Solana for leveraged long/short trading on OnlyFans creator virality. Trade with leverage (2x-50x) based on real-time virality metrics aggregated from internet engagement, revenue, and trending data.

## Features

- **Leveraged Trading**: Open long or short positions with 2x, 5x, 10x, 20x, or 50x leverage
- **Virality Oracle**: Scans internet for engagement metrics, revenue data, and trending signals
- **Position Management**: Track open positions with real-time PnL, liquidation prices, and position details
- **Solana Wallet Integration**: Connect Phantom, Solflare, or Backpack wallets
- **Jupiter Integration**: Use Jupiter aggregator for swaps and liquidity

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling
- **Solana Web3.js** - Solana blockchain interaction
- **Solana Wallet Adapter** - Wallet connection management
- **Jupiter Aggregator** - DEX aggregation and swap routing

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── OfMarkets.tsx       # Market listing and trading interface
│   │   ├── PositionModal.tsx   # Modal for opening positions
│   │   ├── PositionsList.tsx   # Display open positions
│   │   └── JupiterSwap.tsx     # Jupiter swap integration
│   ├── contexts/
│   │   └── PositionContext.tsx # Global position state management
│   ├── lib/
│   │   ├── viralityOracle.ts   # Virality data aggregation
│   │   └── positionManager.ts  # Position calculations and management
│   ├── layout.tsx
│   └── page.tsx
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Solana wallet (Phantom, Solflare, or Backpack)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### Virality Oracle

The `ViralityOracle` class aggregates virality metrics from multiple sources:

- **Engagement Metrics**: Total engagement, engagement rate, follower/subscriber counts
- **Revenue Metrics**: Estimated revenue and revenue growth
- **Trending Metrics**: Search volume, social mentions, composite trending score
- **Platform-Specific**: Twitter/X, Instagram, TikTok, OnlyFans data

Currently uses mock data. In production, implement:
- Twitter/X API integration
- Instagram Graph API
- TikTok API
- Reddit API
- Google Trends API
- OnlyFans revenue estimation (if available)

### Position Management

Positions are managed with:
- **Entry Price**: Price when position was opened
- **Current Price**: Real-time price from virality oracle
- **Liquidation Price**: Calculated based on leverage (position closes if price hits this)
- **PnL**: Profit/Loss calculated from price movement
- **Position Size**: Collateral × Leverage

### Leverage & Liquidation

- **Long positions**: Liquidated when price drops to `entryPrice × (1 - 1/leverage)`
- **Short positions**: Liquidated when price rises to `entryPrice × (1 + 1/leverage)`

Example: 10x long at $10 entry → liquidated at $9

## Next Steps for Production

1. **On-Chain Implementation**: Deploy Solana programs for:
   - Position management smart contracts
   - Collateral vaults
   - Oracle price feeds
   - Liquidation mechanisms

2. **Real Virality Data**: Implement actual API integrations:
   - Social media APIs (Twitter, Instagram, TikTok)
   - Google Trends API
   - Revenue estimation algorithms
   - Real-time data streaming

3. **Jupiter Integration**: Connect to actual token markets:
   - Create synthetic tokens for each creator
   - Set up liquidity pools
   - Integrate with Jupiter swap routes

4. **Security**: Add:
   - Position size limits
   - Circuit breakers
   - Oracle price validation
   - Front-running protection

## License

MIT
