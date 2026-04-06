import { useState } from "react";
import { motion } from "framer-motion";

const coins = ["USDT", "BTC", "ETH", "BNB", "SOL"];
const networks = ["ERC20", "TRC20", "BEP20", "SOL"];

const Withdraw = () => {
  const [selectedCoin, setSelectedCoin] = useState("USDT");
  const [selectedNetwork, setSelectedNetwork] = useState("ERC20");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground mb-8 text-center">Withdraw</h1>

          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Select Coin</label>
              <div className="flex gap-2 flex-wrap">
                {coins.map((coin) => (
                  <button
                    key={coin}
                    onClick={() => setSelectedCoin(coin)}
                    className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                      selectedCoin === coin ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {coin}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Network</label>
              <div className="flex gap-2 flex-wrap">
                {networks.map((net) => (
                  <button
                    key={net}
                    onClick={() => setSelectedNetwork(net)}
                    className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                      selectedNetwork === net ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {net}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Withdrawal Address</label>
              <input
                type="text"
                placeholder="Enter address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
              />
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

            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Network Fee</span>
                <span className="text-foreground">1.00 {selectedCoin}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">You will receive</span>
                <span className="text-foreground font-medium">{amount ? (parseFloat(amount) - 1).toFixed(2) : "0.00"} {selectedCoin}</span>
              </div>
            </div>

            <button className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Withdraw
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Withdraw;
