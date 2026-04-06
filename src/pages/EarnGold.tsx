import { motion } from "framer-motion";
import { Coins, Gift, Trophy, Clock } from "lucide-react";

const earnProducts = [
  { name: "Flexible Savings", apy: "4.5%", minDeposit: "100 USDT", duration: "Flexible", risk: "Low" },
  { name: "Fixed 30 Days", apy: "8.2%", minDeposit: "500 USDT", duration: "30 Days", risk: "Low" },
  { name: "Fixed 90 Days", apy: "12.5%", minDeposit: "1,000 USDT", duration: "90 Days", risk: "Medium" },
  { name: "DeFi Staking", apy: "18.6%", minDeposit: "2,000 USDT", duration: "180 Days", risk: "Medium" },
  { name: "Gold Mining Pool", apy: "24.0%", minDeposit: "5,000 USDT", duration: "365 Days", risk: "High" },
];

const EarnGold = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Earn Gold</h1>
          <p className="text-muted-foreground">Grow your crypto holdings with competitive returns</p>
        </motion.div>

        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Coins, label: "Total Staked", value: "$12.5M" },
            { icon: Gift, label: "Rewards Paid", value: "$1.8M" },
            { icon: Trophy, label: "Active Users", value: "5,432" },
            { icon: Clock, label: "Avg. APY", value: "13.5%" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-5 text-center">
              <stat.icon className="w-7 h-7 text-primary mx-auto mb-2" />
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Products table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Product</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">APY</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground hidden sm:table-cell">Min Deposit</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground hidden md:table-cell">Duration</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground hidden md:table-cell">Risk</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {earnProducts.map((product) => (
                <tr key={product.name} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                  <td className="py-4 px-6 font-medium text-foreground text-sm">{product.name}</td>
                  <td className="text-right py-4 px-6 font-bold text-primary text-sm">{product.apy}</td>
                  <td className="text-right py-4 px-6 text-sm text-muted-foreground hidden sm:table-cell">{product.minDeposit}</td>
                  <td className="text-right py-4 px-6 text-sm text-muted-foreground hidden md:table-cell">{product.duration}</td>
                  <td className="text-right py-4 px-6 text-sm hidden md:table-cell">
                    <span className={`px-2 py-1 rounded text-xs ${
                      product.risk === "Low" ? "bg-green-400/10 text-green-400" :
                      product.risk === "Medium" ? "bg-yellow-400/10 text-yellow-400" :
                      "bg-red-400/10 text-red-400"
                    }`}>
                      {product.risk}
                    </span>
                  </td>
                  <td className="text-right py-4 px-6">
                    <button className="text-xs px-4 py-1.5 bg-primary text-primary-foreground rounded font-medium hover:opacity-90 transition-opacity">
                      Stake
                    </button>
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

export default EarnGold;
