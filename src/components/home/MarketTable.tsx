import { Link } from "react-router-dom";

const marketData = [
  { name: "Bitcoin", symbol: "BTC", price: "97,432.51", change: "+2.34%", high: "98,100.00", low: "95,200.00", positive: true },
  { name: "Ethereum", symbol: "ETH", price: "3,456.78", change: "+1.56%", high: "3,520.00", low: "3,380.00", positive: true },
  { name: "Solana", symbol: "SOL", price: "187.23", change: "-0.89%", high: "192.00", low: "185.00", positive: false },
  { name: "BNB", symbol: "BNB", price: "612.45", change: "+0.45%", high: "618.00", low: "605.00", positive: true },
  { name: "XRP", symbol: "XRP", price: "2.34", change: "+3.21%", high: "2.40", low: "2.25", positive: true },
  { name: "Cardano", symbol: "ADA", price: "0.89", change: "-1.23%", high: "0.92", low: "0.87", positive: false },
];

const MarketTable = () => {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Market Overview</h2>
          <Link to="/market" className="text-sm text-primary hover:underline">
            View All →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Price</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">24h Change</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">24h High</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">24h Low</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {marketData.map((coin) => (
                <tr key={coin.symbol} className="border-b border-border/50 hover:bg-card/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
                        {coin.symbol.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{coin.name}</p>
                        <p className="text-xs text-muted-foreground">{coin.symbol}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-4 px-4 font-medium text-foreground text-sm">${coin.price}</td>
                  <td className={`text-right py-4 px-4 font-medium text-sm ${coin.positive ? "text-green-400" : "text-red-400"}`}>
                    {coin.change}
                  </td>
                  <td className="text-right py-4 px-4 text-sm text-muted-foreground hidden sm:table-cell">${coin.high}</td>
                  <td className="text-right py-4 px-4 text-sm text-muted-foreground hidden sm:table-cell">${coin.low}</td>
                  <td className="text-right py-4 px-4">
                    <Link to="/spot/crypto" className="text-xs px-3 py-1 bg-primary text-primary-foreground rounded font-medium hover:opacity-90 transition-opacity">
                      Trade
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default MarketTable;
