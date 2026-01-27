"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

export function JupiterSwap() {
  const { connected } = useWallet();
  const [amountIn, setAmountIn] = useState("1");

  const handleSwap = async () => {
    if (!connected) return;
    // TODO: Implement Jupiter swap integration
    // For now, this is a placeholder UI
    // In production, integrate with Jupiter API or use Jupiter Plugin
    // See: https://dev.jup.ag/docs/tool-kits/plugin
    alert(
      "Jupiter swap integration pending. Connect to Jupiter API or use Jupiter Plugin for production."
    );
  };

  return (
    <div className="rounded-2xl border border-[#1e3a5f] bg-[#0f2140] p-4 shadow-xl shadow-blue-500/10">
      <h2 className="text-sm font-semibold tracking-tight text-white">
        Swap & fund position
      </h2>
      <p className="mt-1 text-xs text-blue-300/70">
        Use Jupiter liquidity to move between SOL, USDC and your OF model
        markets.
      </p>

      <div className="mt-4 space-y-3">
        <label className="block text-xs font-medium text-blue-200">
          Amount (USDC)
          <input
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#1e3a5f] bg-[#0a1628] px-3 py-2 text-sm text-white outline-none ring-blue-500/60 focus:border-[#3b82f6] focus:ring-1"
            placeholder="1.0"
          />
        </label>

        <button
          type="button"
          disabled={!connected}
          onClick={handleSwap}
          className="flex w-full items-center justify-center rounded-lg bg-[#3b82f6] px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/40 transition hover:bg-[#60a5fa] disabled:cursor-not-allowed disabled:bg-[#1e3a5f] disabled:text-blue-400 disabled:shadow-none"
        >
          {connected ? "Swap with Jupiter" : "Connect wallet to swap"}
        </button>
      </div>
    </div>
  );
}
