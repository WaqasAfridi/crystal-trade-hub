import { motion } from "framer-motion";

const financeProducts = [
  { title: "Robo-Advisor", desc: "AI-powered portfolio management", tag: "Investment banking firm", buyers: 51854, maxReturn: "0.45%", progress: 75 },
  { title: "Fixed Income", desc: "Stable returns with low risk", tag: "Stable returns", buyers: 32100, maxReturn: "0.35%", progress: 60 },
  { title: "Structured Products", desc: "Custom risk-reward profiles", tag: "Advanced", buyers: 12500, maxReturn: "1.20%", progress: 40 },
  { title: "DeFi Yield", desc: "Decentralized finance opportunities", tag: "DeFi", buyers: 8900, maxReturn: "2.50%", progress: 30 },
];

const Finance = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Finance</h1>
          <p className="text-muted-foreground">Intelligent investment and technology leadership help you grasp market trends</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {financeProducts.map((product, i) => (
            <motion.div
              key={product.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors"
            >
              <div className="h-32 bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
                <div className="text-5xl">
                  {i === 0 ? "🤖" : i === 1 ? "📊" : i === 2 ? "🏗️" : "🌾"}
                </div>
              </div>
              <div className="p-5">
                <span className="inline-block px-3 py-1 text-xs border border-primary text-primary rounded-full mb-3">
                  {product.tag}
                </span>
                <h3 className="font-semibold text-foreground text-lg mb-1">{product.title}</h3>
                <p className="text-xs text-muted-foreground mb-4">{product.desc}</p>
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="text-lg font-bold text-foreground">{product.buyers.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Buyer Count</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{product.maxReturn}</p>
                    <p className="text-xs text-muted-foreground">Maximum Return</p>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-green-400 rounded-full" style={{ width: `${product.progress}%` }} />
                </div>
                <button className="w-full mt-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                  Invest Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Finance;
