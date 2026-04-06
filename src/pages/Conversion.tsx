import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownUp } from "lucide-react";

const coins = ["USDT", "BTC", "ETH", "BNB", "SOL", "XRP"];

const Conversion = () => {
  const [fromCoin, setFromCoin] = useState("USDT");
  const [toCoin, setToCoin] = useState("BTC");
  const [amount, setAmount] = useState("");

  const swap = () => {
    setFromCoin(toCoin);
    setToCoin(fromCoin);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground mb-8 text-center">Convert</h1>

          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            {/* From */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">From</label>
              <div className="flex gap-2 mb-2 flex-wrap">
                {coins.map((coin) => (
                  <button
                    key={coin}
                    onClick={() => setFromCoin(coin)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                      fromCoin === coin ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                    }`}
                  >
                    {coin}
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">Available: 15,432.50 {fromCoin}</p>
            </div>

            {/* Swap button */}
            <div className="flex justify-center">
              <button onClick={swap} className="p-2 bg-secondary rounded-full hover:bg-secondary/80 transition-colors">
                <ArrowDownUp className="w-5 h-5 text-primary" />
              </button>
            </div>

            {/* To */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">To</label>
              <div className="flex gap-2 mb-2 flex-wrap">
                {coins.map((coin) => (
                  <button
                    key={coin}
                    onClick={() => setToCoin(coin)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                      toCoin === coin ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                    }`}
                  >
                    {coin}
                  </button>
                ))}
              </div>
              <div className="w-full px-4 py-3 bg-secondary rounded-lg text-foreground text-sm">
                ≈ {amount ? (parseFloat(amount) / 97432.51).toFixed(8) : "0.00"} {toCoin}
              </div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rate</span>
                <span className="text-foreground">1 BTC = 97,432.51 USDT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fee</span>
                <span className="text-foreground">0.1%</span>
              </div>
            </div>

            <button className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Convert
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Conversion;
