"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import Link from "next/link";
import { CandlestickChart, generateCandlestickData } from "../components/CandlestickChart";
import { ALL_CREATORS, type CreatorModel } from "../lib/models";

import "@solana/wallet-adapter-react-ui/styles.css";

const SOL_PRICE = 127.03;
const TIMEFRAMES = ["1m", "5m", "15m", "1H", "4H", "1D", "1W"];

// GoonerFi Logo Component
function GoonerFiLogo({ className = "h-6" }: { className?: string }) {
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

type CreatorWithPrice = CreatorModel & {
  currentPrice: number;
  change24h: number;
};

function TradingPanel({ creator }: { creator: CreatorWithPrice | null }) {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [side, setSide] = useState<"long" | "short">("long");
  const [amount, setAmount] = useState("");
  const [leverage, setLeverage] = useState(10);

  if (!creator) return null;

  const handleTrade = () => {
    if (!connected) { setVisible(true); return; }
    alert(`${side.toUpperCase()} ${creator.name} @ ${leverage}x`);
  };

  const solAmount = amount ? parseFloat(amount) : 0;
  const positionSize = solAmount * SOL_PRICE * leverage;
  const liqPrice = side === "long" 
    ? creator.currentPrice * (1 - 1/leverage) 
    : creator.currentPrice * (1 + 1/leverage);

  return (
    <div className="h-full flex flex-col text-[9px] text-white p-1.5 gap-1.5">
      <div className="flex">
        <button onClick={() => setSide("long")} className={`flex-1 py-1 font-bold ${side === "long" ? "bg-[#22c55e]/20 text-[#22c55e] border-b-2 border-[#22c55e]" : "text-white/40"}`}>LONG</button>
        <button onClick={() => setSide("short")} className={`flex-1 py-1 font-bold ${side === "short" ? "bg-[#ef4444]/20 text-[#ef4444] border-b-2 border-[#ef4444]" : "text-white/40"}`}>SHORT</button>
      </div>
      <div className="flex justify-between"><span className="text-white/40">Price</span><span className="font-mono">${creator.currentPrice.toFixed(2)}</span></div>
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="SOL amount" className="w-full bg-[#0a1628] border border-[#1e3a5f] rounded px-2 py-1 outline-none" />
      <div className="flex gap-0.5">{["0.1","0.5","1","5"].map(v=><button key={v} onClick={()=>setAmount(v)} className="flex-1 bg-[#1e3a5f] rounded py-0.5 hover:bg-[#3b82f6]">{v}</button>)}</div>
      <div className="flex justify-between"><span className="text-white/40">Leverage</span><span className="font-bold">{leverage}x</span></div>
      <input type="range" min="1" max="50" value={leverage} onChange={(e) => setLeverage(+e.target.value)} className="w-full h-1 accent-[#3b82f6]" />
      <div className="space-y-0.5 border-t border-[#1e3a5f] pt-1">
        <div className="flex justify-between"><span className="text-white/40">Size</span><span className="font-mono">${positionSize.toFixed(2)}</span></div>
        <div className="flex justify-between"><span className="text-white/40">Liq</span><span className="text-[#ef4444] font-mono">${liqPrice.toFixed(2)}</span></div>
      </div>
      <button onClick={handleTrade} className={`w-full py-1.5 rounded font-bold ${side === "long" ? "bg-[#22c55e]" : "bg-[#ef4444]"}`}>
        {connected ? side.toUpperCase() : "CONNECT"}
      </button>
    </div>
  );
}

function TradePage() {
  const [creators, setCreators] = useState<CreatorWithPrice[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState("15m");
  const [showMA, setShowMA] = useState(false);
  const [showEMA, setShowEMA] = useState(false);
  const [showBB, setShowBB] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const data: CreatorWithPrice[] = ALL_CREATORS.map((c) => ({
      ...c,
      currentPrice: Math.random() * 80 + 20,
      change24h: (Math.random() - 0.5) * 20,
    }));
    setCreators(data);
    if (data.length) setSelectedId(data[0].id);
  }, []);

  const updateSize = useCallback(() => {
    if (chartRef.current) {
      const r = chartRef.current.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        setChartSize({ width: Math.floor(r.width), height: Math.floor(r.height) });
      }
    }
  }, []);

  useEffect(() => {
    // Initial size after a short delay to ensure DOM is ready
    const timer = setTimeout(updateSize, 100);
    window.addEventListener('resize', updateSize);
    
    const obs = new ResizeObserver(() => {
      updateSize();
    });
    if (chartRef.current) obs.observe(chartRef.current);
    
    return () => { 
      clearTimeout(timer);
      obs.disconnect(); 
      window.removeEventListener('resize', updateSize); 
    };
  }, [updateSize]);

  const selected = creators.find(c => c.id === selectedId);
  
  useEffect(() => {
    if (selected) {
      setChartData(generateCandlestickData(selected.currentPrice, selected.change24h, timeframe));
    }
  }, [selected, timeframe]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a1628] text-white overflow-hidden">
      {/* Header */}
      <div className="h-6 flex items-center justify-between px-2 border-b border-[#1e3a5f] bg-[#0f2140] flex-shrink-0">
        <div className="flex items-center gap-2 text-[10px]">
          <Link href="/" className="flex items-center gap-1">
            <GoonerFiLogo className="h-5" />
          </Link>
          <span className="text-white/30">|</span>
          <span className="text-white/50">SOL</span>
          <span className="text-[#22c55e] font-mono font-bold">${SOL_PRICE}</span>
        </div>
        <div className="scale-75 origin-right"><WalletMultiButton /></div>
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Creator list with full names and OF links */}
        <div className="w-44 flex-shrink-0 border-r border-[#1e3a5f] bg-[#0f2140] overflow-y-auto">
          {creators.map(c => (
            <div
              key={c.id}
              className={`w-full px-2 py-1 border-b border-[#1e3a5f]/50 ${c.id === selectedId ? "bg-[#1e3a5f]" : "hover:bg-[#1e3a5f]/30"}`}
            >
              <button
                onClick={() => setSelectedId(c.id)}
                className="w-full flex items-center gap-2 text-left"
              >
                <img src={c.avatarUrl} className="h-6 w-6 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold text-white truncate">{c.name}</div>
                  <div className="flex items-center gap-1">
                    <span className={`text-[9px] font-mono ${c.change24h >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                      {c.change24h >= 0 ? "+" : ""}{c.change24h.toFixed(1)}%
                    </span>
                    <span className="text-[9px] text-white/40">${c.currentPrice.toFixed(2)}</span>
                  </div>
                </div>
              </button>
              <a 
                href={c.socials.onlyfans} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-[8px] text-[#00aeef] hover:underline mt-0.5 truncate"
              >
                {c.socials.onlyfans.replace('https://onlyfans.com/', 'onlyfans.com/')}
              </a>
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {selected && (
            <>
              {/* Toolbar */}
              <div className="h-7 flex items-center gap-2 px-2 border-b border-[#1e3a5f] bg-[#0f2140] flex-shrink-0">
                <img src={selected.avatarUrl} className="h-4 w-4 rounded-full" />
                <span className="text-[11px] font-bold text-white">{selected.name}</span>
                <span className={`text-[11px] font-mono font-bold ${selected.change24h >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                  ${selected.currentPrice.toFixed(2)}
                </span>
                <span className={`text-[10px] font-mono ${selected.change24h >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                  ({selected.change24h >= 0 ? "+" : ""}{selected.change24h.toFixed(2)}%)
                </span>
                
                <div className="w-px h-4 bg-[#1e3a5f] mx-1" />
                
                {TIMEFRAMES.map(tf => (
                  <button 
                    key={tf} 
                    onClick={() => setTimeframe(tf)} 
                    className={`px-1.5 py-0.5 text-[9px] rounded ${timeframe === tf ? "bg-[#3b82f6] text-white" : "text-white/50 hover:text-white hover:bg-[#1e3a5f]"}`}
                  >
                    {tf}
                  </button>
                ))}
                
                <div className="w-px h-4 bg-[#1e3a5f] mx-1" />
                
                <button onClick={() => setShowMA(!showMA)} className={`px-1.5 py-0.5 text-[9px] rounded ${showMA ? "bg-[#f59e0b] text-white" : "text-white/50 hover:bg-[#1e3a5f]"}`}>MA</button>
                <button onClick={() => setShowEMA(!showEMA)} className={`px-1.5 py-0.5 text-[9px] rounded ${showEMA ? "bg-[#22c55e] text-white" : "text-white/50 hover:bg-[#1e3a5f]"}`}>EMA</button>
                <button onClick={() => setShowBB(!showBB)} className={`px-1.5 py-0.5 text-[9px] rounded ${showBB ? "bg-[#a855f7] text-white" : "text-white/50 hover:bg-[#1e3a5f]"}`}>BB</button>
                
                <div className="flex-1" />
                
                <a href={selected.socials.onlyfans} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#00aeef] font-bold hover:underline">
                  OnlyFans ↗
                </a>
              </div>

              {/* Chart container */}
              <div ref={chartRef} className="flex-1 bg-[#0a1628]" style={{ minHeight: 400 }}>
                <CandlestickChart 
                  data={chartData} 
                  width={chartSize.width} 
                  height={chartSize.height} 
                  showMA={showMA} 
                  showEMA={showEMA} 
                  showBB={showBB} 
                />
              </div>
            </>
          )}
        </div>

        {/* Trading panel */}
        <div className="w-36 flex-shrink-0 border-l border-[#1e3a5f] bg-[#0f2140]">
          <TradingPanel creator={selected || null} />
        </div>
      </div>
    </div>
  );
}

export default function Trade() {
  const [endpoint] = useState(() => clusterApiUrl("devnet"));
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <TradePage />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
