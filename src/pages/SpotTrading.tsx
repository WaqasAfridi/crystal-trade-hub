import { useState } from "react";
import { motion } from "framer-motion";

const SpotTrading = () => {
  const [orderType, setOrderType] = useState("limit");
  const [side, setSide] = useState<"buy" | "sell">("buy");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-4">
          {/* Chart area */}
          <div className="lg:col-span-3 bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-lg font-bold text-foreground">BTC/USDT</h2>
              <span className="text-2xl font-bold text-green-400">$97,432.51</span>
              <span className="text-sm text-green-400">+2.34%</span>
            </div>
            <div className="h-80 bg-secondary/30 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Trading Chart</p>
            </div>
            {/* Time intervals */}
            <div className="flex gap-2 mt-3">
              {["1m", "5m", "15m", "1H", "4H", "1D", "1W"].map((t) => (
                <button key={t} className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors">
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Order panel */}
          <div className="bg-card border border-border rounded-xl p-4">
            {/* Buy/Sell toggle */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-secondary rounded-lg mb-4">
              <button
                onClick={() => setSide("buy")}
                className={`py-2 rounded-md text-sm font-medium transition-colors ${side === "buy" ? "bg-green-500 text-white" : "text-muted-foreground"}`}
              >
                Buy
              </button>
              <button
                onClick={() => setSide("sell")}
                className={`py-2 rounded-md text-sm font-medium transition-colors ${side === "sell" ? "bg-red-500 text-white" : "text-muted-foreground"}`}
              >
                Sell
              </button>
            </div>

            {/* Order type */}
            <div className="flex gap-4 mb-4">
              {["limit", "market"].map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`text-sm capitalize ${orderType === type ? "text-foreground font-medium" : "text-muted-foreground"}`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {orderType === "limit" && (
                <div>
                  <label className="text-xs text-muted-foreground">Price (USDT)</label>
                  <input
                    type="number"
                    placeholder="97,432.51"
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}
              <div>
                <label className="text-xs text-muted-foreground">Amount (BTC)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              {/* Percentage buttons */}
              <div className="grid grid-cols-4 gap-1">
                {["25%", "50%", "75%", "100%"].map((pct) => (
                  <button key={pct} className="py-1 text-xs text-muted-foreground bg-secondary rounded hover:bg-secondary/80">{pct}</button>
                ))}
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Total (USDT)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <button className={`w-full py-3 rounded-lg font-semibold text-sm ${side === "buy" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                {side === "buy" ? "Buy BTC" : "Sell BTC"}
              </button>
            </div>
          </div>
        </div>

        {/* Order book and recent trades */}
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-3 text-sm">Order Book</h3>
            <div className="space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`ask-${i}`} className="flex justify-between text-xs">
                  <span className="text-red-400">{(97500 - i * 15).toFixed(2)}</span>
                  <span className="text-muted-foreground">{(Math.random() * 5).toFixed(4)}</span>
                  <span className="text-muted-foreground">{(Math.random() * 100000).toFixed(2)}</span>
                </div>
              ))}
              <div className="py-1 text-center text-sm font-bold text-green-400">97,432.51</div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`bid-${i}`} className="flex justify-between text-xs">
                  <span className="text-green-400">{(97420 - i * 15).toFixed(2)}</span>
                  <span className="text-muted-foreground">{(Math.random() * 5).toFixed(4)}</span>
                  <span className="text-muted-foreground">{(Math.random() * 100000).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-3 text-sm">Recent Trades</h3>
            <div className="space-y-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className={i % 3 === 0 ? "text-red-400" : "text-green-400"}>
                    {(97400 + Math.random() * 100).toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">{(Math.random() * 2).toFixed(4)}</span>
                  <span className="text-muted-foreground">12:{(30 + i).toString().padStart(2, "0")}:45</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotTrading;
