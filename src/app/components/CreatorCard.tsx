"use client";

import { SimpleChart, generatePriceHistory } from "./SimpleChart";
import { useState, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

type CreatorCardProps = {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  bio: string;
  followers: string;
  monthlyEarnings: string;
  currentPrice: number;
  change24h: number;
};

export function CreatorCard({
  id,
  name,
  handle,
  avatarUrl,
  bio,
  followers,
  monthlyEarnings,
  currentPrice,
  change24h,
}: CreatorCardProps) {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [tradeAmount, setTradeAmount] = useState("");
  const [tradeType, setTradeType] = useState<"long" | "short">("long");
  const [showTrade, setShowTrade] = useState(false);

  const priceHistory = useMemo(
    () => generatePriceHistory(currentPrice, change24h),
    [currentPrice, change24h]
  );

  const handleTrade = () => {
    if (!connected) {
      setVisible(true);
      return;
    }
    
    const amount = parseFloat(tradeAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Enter a valid amount");
      return;
    }
    
    alert(`Opening ${tradeType.toUpperCase()} position on ${name} for $${amount}`);
    setTradeAmount("");
    setShowTrade(false);
  };

  return (
    <div className="rounded-xl border border-[#1e3a5f] bg-[#0f2140] p-5 backdrop-blur transition hover:bg-[#1e3a5f]/50">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-2 border-[#3b82f6]/30">
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${avatarUrl})` }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white">{name}</h3>
          <p className="text-sm text-[#60a5fa]">{handle}</p>
          <div className="mt-1 flex gap-3 text-xs text-blue-200/70">
            <span>{followers} followers</span>
            <span>•</span>
            <span>{monthlyEarnings}/mo</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className="mt-3 text-sm text-blue-100/80 line-clamp-2">{bio}</p>

      {/* Price & Chart */}
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-white">${currentPrice.toFixed(2)}</p>
          <p className={`text-sm font-semibold ${change24h >= 0 ? "text-[#3b82f6]" : "text-[#60a5fa]"}`}>
            {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}% 24h
          </p>
        </div>
        <div className="w-32">
          <SimpleChart data={priceHistory} isPositive={change24h >= 0} />
        </div>
      </div>

      {/* Trade Section */}
      {!showTrade ? (
        <button
          onClick={() => setShowTrade(true)}
          className="mt-4 w-full rounded-lg bg-[#3b82f6] py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition hover:bg-[#60a5fa]"
        >
          Trade {name.split(" ")[0]}
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          {/* Long/Short Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setTradeType("long")}
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${
                tradeType === "long"
                  ? "bg-[#3b82f6] text-white"
                  : "bg-[#1e3a5f] text-blue-300 hover:bg-[#2563eb]"
              }`}
            >
              Long ↗
            </button>
            <button
              onClick={() => setTradeType("short")}
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${
                tradeType === "short"
                  ? "bg-[#60a5fa] text-white"
                  : "bg-[#1e3a5f] text-blue-300 hover:bg-[#2563eb]"
              }`}
            >
              Short ↘
            </button>
          </div>

          {/* Amount Input */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300">$</span>
            <input
              type="number"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-[#1e3a5f] bg-[#0a1628] py-3 pl-8 pr-4 text-white placeholder-blue-400/50 outline-none focus:border-[#3b82f6]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowTrade(false)}
              className="flex-1 rounded-lg border border-[#1e3a5f] py-2 text-sm font-semibold text-blue-300 transition hover:bg-[#1e3a5f]"
            >
              Cancel
            </button>
            <button
              onClick={handleTrade}
              className={`flex-1 rounded-lg py-2 text-sm font-bold text-white transition ${
                tradeType === "long"
                  ? "bg-[#3b82f6] hover:bg-[#60a5fa]"
                  : "bg-[#60a5fa] hover:bg-[#3b82f6]"
              }`}
            >
              {connected ? `${tradeType === "long" ? "Buy" : "Sell"} Now` : "Connect Wallet"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
