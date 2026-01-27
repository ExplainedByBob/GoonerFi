"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { Navigation } from "./components/Navigation";
import { ALL_CREATORS } from "./lib/models";

import "@solana/wallet-adapter-react-ui/styles.css";

// GoonerFi Logo Component
function GoonerFiLogo({ className = "h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Woman silhouette */}
      <path d="M18 8c2-3 5-5 8-4 4 1 6 5 5 10-1 4-3 7-5 10l-2 5c-1 4-2 9-3 14-1 3-2 5-3 6l-2-1c1-3 2-7 3-12 1-5 2-9 4-13l1-4c-2-1-4-4-5-8-1-3 0-5 1-7l-2 4z" fill="#1e3a5f"/>
      <ellipse cx="20" cy="12" rx="3" ry="4" fill="#1e3a5f"/>
      <path d="M14 25c3-1 7 0 10 4 2 3 2 8-1 12-4 4-10 3-13-1-3-5-1-12 4-15z" fill="#1e3a5f"/>
      {/* Text */}
      <text x="35" y="32" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="#1e3a5f">Gooner Fi</text>
    </svg>
  );
}

// Solana Logo Component
function SolanaLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 397.7 311.7" fill="none" xmlns="http://www.w3.org/2000/svg">
      <linearGradient id="solana-gradient-1" x1="360.879" y1="351.455" x2="141.213" y2="-69.294" gradientUnits="userSpaceOnUse" gradientTransform="matrix(1 0 0 -1 0 314)">
        <stop offset="0" stopColor="#00FFA3"/>
        <stop offset="1" stopColor="#DC1FFF"/>
      </linearGradient>
      <path fill="url(#solana-gradient-1)" d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z"/>
      <linearGradient id="solana-gradient-2" x1="264.829" y1="401.601" x2="45.163" y2="-19.148" gradientUnits="userSpaceOnUse" gradientTransform="matrix(1 0 0 -1 0 314)">
        <stop offset="0" stopColor="#00FFA3"/>
        <stop offset="1" stopColor="#DC1FFF"/>
      </linearGradient>
      <path fill="url(#solana-gradient-2)" d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z"/>
      <linearGradient id="solana-gradient-3" x1="312.548" y1="376.688" x2="92.882" y2="-44.061" gradientUnits="userSpaceOnUse" gradientTransform="matrix(1 0 0 -1 0 314)">
        <stop offset="0" stopColor="#00FFA3"/>
        <stop offset="1" stopColor="#DC1FFF"/>
      </linearGradient>
      <path fill="url(#solana-gradient-3)" d="M333.1,120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8,0-8.7,7-4.6,11.1l62.7,62.7c2.4,2.4,5.7,3.8,9.2,3.8h317.4c5.8,0,8.7-7,4.6-11.1L333.1,120.1z"/>
    </svg>
  );
}

// Featured creator card for homepage
function FeaturedCreator({ name, handle, avatarUrl, earnings }: { name: string; handle: string; avatarUrl: string; earnings: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#1e3a5f] bg-[#0f2140]/50 p-3 backdrop-blur">
      <img src={avatarUrl} alt={name} className="h-10 w-10 rounded-full object-cover" />
      <div className="flex-1">
        <div className="font-semibold text-white">{name}</div>
        <div className="text-xs text-blue-300/70">{handle}</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-[#3b82f6]">{earnings}</div>
        <div className="text-xs text-blue-300/50">monthly</div>
      </div>
    </div>
  );
}

function HomePage() {
  const featuredCreators = ALL_CREATORS.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      {/* Header */}
      <header className="border-b border-[#1e3a5f]/50 bg-[#0a1628]/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <GoonerFiLogo className="h-10" />
          </Link>
          <div className="flex items-center gap-6">
            <Navigation />
            <WalletMultiButton />
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#3b82f6]/10 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#3b82f6]/5 rounded-full blur-3xl" />
          
          <div className="relative mx-auto max-w-7xl px-6 py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Text */}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#1e3a5f] bg-[#0f2140]/50 px-4 py-2 mb-6">
                  <SolanaLogo className="h-4 w-4" />
                  <span className="text-sm text-blue-200/80">Powered by Solana</span>
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                  Trade Creator
                  <span className="block text-[#3b82f6]">Virality</span>
                </h1>
                
                <p className="text-lg text-blue-200/70 mb-8 max-w-lg">
                  Go long or short on top OnlyFans creators based on real-time social metrics. 
                  Leverage up to 50x on creator performance with instant settlement.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/trade"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#3b82f6] px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-[#60a5fa] hover:shadow-blue-500/40"
                  >
                    Start Trading
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <a
                    href="#how-it-works"
                    className="inline-flex items-center gap-2 rounded-lg border border-[#1e3a5f] bg-[#0f2140]/50 px-6 py-3 font-semibold text-white transition hover:bg-[#1e3a5f]"
                  >
                    Learn More
                  </a>
                </div>
              </div>
              
              {/* Right side - Featured Creators */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628] via-transparent to-[#0a1628] z-10 pointer-events-none lg:hidden" />
                <div className="space-y-3">
                  <div className="text-sm font-medium text-blue-300/70 mb-4">Top Earning Creators</div>
                  {featuredCreators.map((creator) => (
                    <FeaturedCreator
                      key={creator.id}
                      name={creator.name}
                      handle={creator.handle}
                      avatarUrl={creator.avatarUrl}
                      earnings={creator.monthlyEarnings}
                    />
                  ))}
                  <Link 
                    href="/trade"
                    className="block text-center text-sm text-[#3b82f6] hover:text-[#60a5fa] mt-4"
                  >
                    View all 50+ creators →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-[#1e3a5f]/50 bg-[#0f2140]/30">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">$4.2M</div>
                <div className="text-sm text-blue-300/70">24h Volume</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">50+</div>
                <div className="text-sm text-blue-300/70">Creator Markets</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">50x</div>
                <div className="text-sm text-blue-300/70">Max Leverage</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">0.1%</div>
                <div className="text-sm text-blue-300/70">Trading Fee</div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">How it works</h2>
              <p className="text-blue-200/70 max-w-2xl mx-auto">
                Trade creator virality in three simple steps. No complex setup required.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#3b82f6]/20 to-[#60a5fa]/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition" />
                <div className="relative rounded-xl border border-[#1e3a5f] bg-[#0f2140] p-8">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-[#3b82f6]/20 text-[#3b82f6] font-bold text-xl mb-6">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Connect Wallet</h3>
                  <p className="text-blue-200/70">
                    Link your Phantom or Solflare wallet. Deposit SOL or USDC to start trading.
                  </p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#3b82f6]/20 to-[#60a5fa]/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition" />
                <div className="relative rounded-xl border border-[#1e3a5f] bg-[#0f2140] p-8">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-[#3b82f6]/20 text-[#3b82f6] font-bold text-xl mb-6">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Choose Your Position</h3>
                  <p className="text-blue-200/70">
                    Go long if you think a creator will trend, or short if you think they'll fade.
                  </p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#3b82f6]/20 to-[#60a5fa]/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition" />
                <div className="relative rounded-xl border border-[#1e3a5f] bg-[#0f2140] p-8">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-[#3b82f6]/20 text-[#3b82f6] font-bold text-xl mb-6">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Take Profit</h3>
                  <p className="text-blue-200/70">
                    Close your position anytime. Profits are settled instantly to your wallet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-[#0f2140]/30">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">
                  Built for serious traders
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center">
                      <svg className="h-5 w-5 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Lightning Fast</h3>
                      <p className="text-blue-200/70 text-sm">Sub-second execution on Solana. No waiting, no slippage.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center">
                      <svg className="h-5 w-5 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Non-Custodial</h3>
                      <p className="text-blue-200/70 text-sm">Your funds stay in your wallet. Trade directly from Phantom or Solflare.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center">
                      <svg className="h-5 w-5 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Real-Time Oracle</h3>
                      <p className="text-blue-200/70 text-sm">Prices updated from live social metrics via Switchboard oracles.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-[#3b82f6]/10 rounded-2xl blur-2xl" />
                <div className="relative rounded-xl border border-[#1e3a5f] bg-[#0f2140] p-6 space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-[#1e3a5f]">
                    <span className="text-blue-200/70">Position</span>
                    <span className="text-[#3b82f6] font-semibold">LONG Sophie Rain</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200/70">Entry Price</span>
                    <span className="text-white">$45.20</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200/70">Mark Price</span>
                    <span className="text-white">$52.80</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200/70">Leverage</span>
                    <span className="text-white">10x</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-[#1e3a5f]">
                    <span className="text-blue-200/70">Unrealized PnL</span>
                    <span className="text-[#3b82f6] font-bold">+$168.14 (+16.8%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="relative rounded-2xl border border-[#1e3a5f] bg-gradient-to-r from-[#0f2140] to-[#1e3a5f]/50 p-12 text-center overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#3b82f6]/10 rounded-full blur-3xl" />
              <div className="relative">
                <h2 className="text-3xl font-bold text-white mb-4">Ready to start trading?</h2>
                <p className="text-blue-200/70 mb-8 max-w-lg mx-auto">
                  Join thousands of traders already profiting from creator virality markets.
                </p>
                <Link
                  href="/trade"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#3b82f6] px-8 py-4 font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-[#60a5fa]"
                >
                  Launch Trading App
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e3a5f]/50 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-[#3b82f6]">
                <span className="text-sm font-black text-white">G</span>
              </div>
              <span className="font-bold text-white">GoonerFi</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-blue-300/70">
              <a href="#" className="hover:text-white transition">Docs</a>
              <a href="#" className="hover:text-white transition">Twitter</a>
              <a href="#" className="hover:text-white transition">Discord</a>
            </div>
            <div className="text-sm text-blue-300/50">
              © 2026 GoonerFi. Built on Solana.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  const [endpoint] = useState(() => clusterApiUrl("devnet"));
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <HomePage />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
