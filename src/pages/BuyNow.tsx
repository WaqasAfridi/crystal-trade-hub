import { useState } from "react";
import { motion } from "framer-motion";

const cryptos = [
  { name: "Bitcoin", symbol: "BTC", price: 97432.51 },
  { name: "Ethereum", symbol: "ETH", price: 3456.78 },
  { name: "Solana", symbol: "SOL", price: 187.23 },
  { name: "BNB", symbol: "BNB", price: 612.45 },
  { name: "XRP", symbol: "XRP", price: 2.34 },
];

const BuyNow = () => {
  const [selectedCrypto, setSelectedCrypto] = useState(cryptos[0]);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");

  const total = amount ? (parseFloat(amount) * selectedCrypto.price).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground mb-8 text-center">Buy Crypto</h1>

          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            {/* Select crypto */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Select Cryptocurrency</label>
              <div className="grid grid-cols-5 gap-2">
                {cryptos.map((crypto) => (
                  <button
                    key={crypto.symbol}
                    onClick={() => setSelectedCrypto(crypto)}
                    className={`p-2 rounded-lg text-center border transition-colors ${
                      selectedCrypto.symbol === crypto.symbol
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <p className="text-xs font-semibold">{crypto.symbol}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Amount ({selectedCrypto.symbol})</label>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">Price: ${selectedCrypto.price.toLocaleString()}</p>
            </div>

            {/* Payment method */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "card", label: "Card" },
                  { id: "bank", label: "Bank" },
                  { id: "wallet", label: "Wallet" },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`py-2 rounded-lg text-sm border transition-colors ${
                      paymentMethod === method.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-secondary/50 rounded-lg p-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Total (USD)</span>
                <span className="font-bold text-foreground text-lg">${total}</span>
              </div>
            </div>

            <button className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Buy {selectedCrypto.symbol}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BuyNow;
