import { useState } from "react";
import { motion } from "framer-motion";

const coins = ["USDT", "BTC", "ETH", "BNB"];
const accounts = ["Spot Account", "Futures Account", "Earn Account"];

const Transfer = () => {
  const [selectedCoin, setSelectedCoin] = useState("USDT");
  const [fromAccount, setFromAccount] = useState("Spot Account");
  const [toAccount, setToAccount] = useState("Futures Account");
  const [amount, setAmount] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground mb-8 text-center">Transfer</h1>

          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Coin</label>
              <div className="flex gap-2">
                {coins.map((coin) => (
                  <button
                    key={coin}
                    onClick={() => setSelectedCoin(coin)}
                    className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                      selectedCoin === coin ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                    }`}
                  >
                    {coin}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">From</label>
              <select
                value={fromAccount}
                onChange={(e) => setFromAccount(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground outline-none focus:ring-1 focus:ring-primary"
              >
                {accounts.map((acc) => <option key={acc} value={acc}>{acc}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">To</label>
              <select
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground outline-none focus:ring-1 focus:ring-primary"
              >
                {accounts.filter((a) => a !== fromAccount).map((acc) => <option key={acc} value={acc}>{acc}</option>)}
              </select>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-muted-foreground">Amount</label>
                <span className="text-xs text-muted-foreground">Available: 15,432.50 {selectedCoin}</span>
              </div>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Transfer
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Transfer;
