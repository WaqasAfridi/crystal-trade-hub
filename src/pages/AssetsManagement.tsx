import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, ArrowDownToLine, ArrowUpFromLine, RefreshCcw, Send } from "lucide-react";
import { Link } from "react-router-dom";

const assets = [
  { name: "Bitcoin", symbol: "BTC", balance: "0.5432", value: "52,925.18", change: "+2.34%" },
  { name: "Ethereum", symbol: "ETH", balance: "12.456", value: "43,051.99", change: "+1.56%" },
  { name: "USDT", symbol: "USDT", balance: "15,432.50", value: "15,432.50", change: "0.00%" },
  { name: "Solana", symbol: "SOL", balance: "45.23", value: "8,463.52", change: "-0.89%" },
  { name: "BNB", symbol: "BNB", balance: "8.5", value: "5,205.83", change: "+0.45%" },
];

const AssetsManagement = () => {
  const [activeTab, setActiveTab] = useState("spot");
  const totalValue = "125,078.02";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {/* Portfolio overview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Balance (USD)</p>
              <p className="text-3xl font-bold text-foreground">${totalValue}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link to="/recharge" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
                <ArrowDownToLine className="w-4 h-4" /> Deposit
              </Link>
              <Link to="/withdraw" className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-secondary">
                <ArrowUpFromLine className="w-4 h-4" /> Withdraw
              </Link>
              <Link to="/conversion" className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-secondary">
                <RefreshCcw className="w-4 h-4" /> Convert
              </Link>
              <Link to="/transfer" className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-secondary">
                <Send className="w-4 h-4" /> Transfer
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Account tabs */}
        <div className="flex gap-4 mb-6">
          {[
            { id: "spot", label: "Spot Account" },
            { id: "futures", label: "Futures Account" },
            { id: "earn", label: "Earn Account" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                activeTab === tab.id ? "text-foreground border-primary" : "text-muted-foreground border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Assets table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Asset</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Balance</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground hidden sm:table-cell">Value (USD)</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground hidden md:table-cell">24h</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.symbol} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
                        {asset.symbol.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{asset.name}</p>
                        <p className="text-xs text-muted-foreground">{asset.symbol}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-4 px-6 font-medium text-foreground text-sm">{asset.balance}</td>
                  <td className="text-right py-4 px-6 text-sm text-muted-foreground hidden sm:table-cell">${asset.value}</td>
                  <td className={`text-right py-4 px-6 text-sm hidden md:table-cell ${asset.change.startsWith("+") ? "text-green-400" : asset.change.startsWith("-") ? "text-red-400" : "text-muted-foreground"}`}>
                    {asset.change}
                  </td>
                  <td className="text-right py-4 px-6">
                    <div className="flex gap-2 justify-end">
                      <Link to="/spot/crypto" className="text-xs px-3 py-1 bg-primary text-primary-foreground rounded font-medium hover:opacity-90">Trade</Link>
                      <Link to="/recharge" className="text-xs px-3 py-1 border border-border text-foreground rounded font-medium hover:bg-secondary">Deposit</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssetsManagement;
