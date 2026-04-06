import { motion } from "framer-motion";
import { Clock, TrendingUp, Shield } from "lucide-react";

const icoProjects = [
  { name: "Enivex Token", symbol: "ENX", price: "0.25", raised: "2,450,000", target: "5,000,000", progress: 49, endDate: "2026-06-30", status: "Active" },
  { name: "DeFi Protocol", symbol: "DFP", price: "0.10", raised: "1,200,000", target: "3,000,000", progress: 40, endDate: "2026-05-15", status: "Active" },
  { name: "MetaVerse Land", symbol: "MVL", price: "0.50", raised: "4,800,000", target: "10,000,000", progress: 48, endDate: "2026-07-20", status: "Upcoming" },
];

const ICO = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Initial Coin Offering</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Get early access to promising blockchain projects at the best prices</p>
        </motion.div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            { icon: TrendingUp, label: "Total Raised", value: "$8.45M" },
            { icon: Clock, label: "Active Projects", value: "3" },
            { icon: Shield, label: "Avg. ROI", value: "245%" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-6 text-center">
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Projects */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {icoProjects.map((project, i) => (
            <motion.div
              key={project.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {project.symbol.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{project.name}</h3>
                    <p className="text-xs text-muted-foreground">{project.symbol}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${project.status === "Active" ? "bg-green-400/10 text-green-400" : "bg-yellow-400/10 text-yellow-400"}`}>
                  {project.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price</span>
                  <span className="text-foreground font-medium">${project.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Raised</span>
                  <span className="text-foreground font-medium">${project.raised}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Target</span>
                  <span className="text-foreground font-medium">${project.target}</span>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-primary">{project.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">End Date</span>
                  <span className="text-foreground">{project.endDate}</span>
                </div>
              </div>

              <button className="w-full mt-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity text-sm">
                Participate
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ICO;
