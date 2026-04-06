import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, QrCode } from "lucide-react";

const networks = ["ERC20", "TRC20", "BEP20", "SOL"];
const coins = ["USDT", "BTC", "ETH", "BNB", "SOL"];

const Recharge = () => {
  const [selectedCoin, setSelectedCoin] = useState("USDT");
  const [selectedNetwork, setSelectedNetwork] = useState("ERC20");
  const walletAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground mb-8 text-center">Deposit</h1>

          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            {/* Select coin */}
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

            {/* Select network */}
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

            {/* QR & Address */}
            <div className="text-center">
              <div className="w-48 h-48 bg-secondary rounded-xl mx-auto flex items-center justify-center mb-4">
                <QrCode className="w-24 h-24 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mb-2">Deposit Address</p>
              <div className="flex items-center gap-2 bg-secondary rounded-lg p-3">
                <p className="text-xs text-foreground font-mono flex-1 break-all">{walletAddress}</p>
                <button className="text-primary hover:opacity-80">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <p className="text-xs text-muted-foreground">• Minimum deposit: 10 {selectedCoin}</p>
              <p className="text-xs text-muted-foreground">• Network: {selectedNetwork}</p>
              <p className="text-xs text-muted-foreground">• Deposits will be credited after 12 network confirmations</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Recharge;
