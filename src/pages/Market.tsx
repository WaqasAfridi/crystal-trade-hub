import { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

const tabs = ["Watchlists", "Crypto", "US stocks", "FX"];

const cryptoData = [
  { name: "Bitcoin", symbol: "BTC/USDT", price: "97,432.51", change: "+2.34%", high: "98,100.00", low: "95,200.00", positive: true },
  { name: "Ethereum", symbol: "ETH/USDT", price: "3,456.78", change: "+1.56%", high: "3,520.00", low: "3,380.00", positive: true },
  { name: "Solana", symbol: "SOL/USDT", price: "187.23", change: "-0.89%", high: "192.00", low: "185.00", positive: false },
  { name: "BNB", symbol: "BNB/USDT", price: "612.45", change: "+0.45%", high: "618.00", low: "605.00", positive: true },
  { name: "XRP", symbol: "XRP/USDT", price: "2.34", change: "+3.21%", high: "2.40", low: "2.25", positive: true },
  { name: "Cardano", symbol: "ADA/USDT", price: "0.89", change: "-1.23%", high: "0.92", low: "0.87", positive: false },
  { name: "Dogecoin", symbol: "DOGE/USDT", price: "0.32", change: "+5.67%", high: "0.34", low: "0.30", positive: true },
  { name: "Polkadot", symbol: "DOT/USDT", price: "7.89", change: "-2.10%", high: "8.15", low: "7.70", positive: false },
  { name: "Avalanche", symbol: "AVAX/USDT", price: "35.67", change: "+1.23%", high: "36.50", low: "34.80", positive: true },
  { name: "Chainlink", symbol: "LINK/USDT", price: "14.56", change: "+0.78%", high: "15.00", low: "14.20", positive: true },
];

const stocksData = [
  { name: "Apple", symbol: "AAPL", price: "189.25", change: "+0.52%", high: "190.00", low: "188.10", positive: true },
  { name: "Tesla", symbol: "TSLA", price: "245.67", change: "-1.34%", high: "250.00", low: "243.00", positive: false },
  { name: "Microsoft", symbol: "MSFT", price: "415.23", change: "+0.89%", high: "418.00", low: "412.50", positive: true },
  { name: "Amazon", symbol: "AMZN", price: "185.90", change: "+1.12%", high: "187.00", low: "184.20", positive: true },
  { name: "NVIDIA", symbol: "NVDA", price: "875.50", change: "+2.45%", high: "890.00", low: "860.00", positive: true },
];

const fxData = [
  { name: "EUR/USD", symbol: "EUR/USD", price: "1.0892", change: "+0.12%", high: "1.0910", low: "1.0875", positive: true },
  { name: "GBP/USD", symbol: "GBP/USD", price: "1.2734", change: "-0.08%", high: "1.2760", low: "1.2710", positive: false },
  { name: "USD/JPY", symbol: "USD/JPY", price: "149.85", change: "+0.23%", high: "150.10", low: "149.50", positive: true },
  { name: "AUD/USD", symbol: "AUD/USD", price: "0.6543", change: "-0.15%", high: "0.6560", low: "0.6530", positive: false },
];

const Market = () => {
  const [activeTab, setActiveTab] = useState("Crypto");
  const [search, setSearch] = useState("");

  const getDataForTab = () => {
    switch (activeTab) {
      case "Crypto": return cryptoData;
      case "US stocks": return stocksData;
      case "FX": return fxData;
      case "Watchlists": return [];
      default: return cryptoData;
    }
  };

  const data = getDataForTab().filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {/* Tabs and search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                  activeTab === tab
                    ? "text-foreground border-foreground"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Price</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">24h Change</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground hidden md:table-cell">24h High</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground hidden md:table-cell">24h Low</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
                        <Search className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No Data</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.symbol} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
                          {item.symbol.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-4 px-6 font-medium text-foreground text-sm">${item.price}</td>
                    <td className={`text-right py-4 px-6 font-medium text-sm ${item.positive ? "text-green-400" : "text-red-400"}`}>
                      {item.change}
                    </td>
                    <td className="text-right py-4 px-6 text-sm text-muted-foreground hidden md:table-cell">${item.high}</td>
                    <td className="text-right py-4 px-6 text-sm text-muted-foreground hidden md:table-cell">${item.low}</td>
                    <td className="text-right py-4 px-6">
                      <Link to="/spot/crypto" className="text-xs px-4 py-1.5 bg-primary text-primary-foreground rounded font-medium hover:opacity-90 transition-opacity">
                        Trade
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Market;
