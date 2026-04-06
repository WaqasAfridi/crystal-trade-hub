import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const products = [
  {
    tag: "Investment banking firm",
    title: "Robo-Advisor",
    buyers: "51854",
    maxReturn: "0.45 %",
    progress: 75,
    image: "🏦",
  },
  {
    tag: "Stable returns",
    title: "Fixed Income",
    buyers: "32100",
    maxReturn: "0.35 %",
    progress: 60,
    image: "📈",
  },
];

const InvestmentSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-3xl font-bold text-foreground mb-4"
            >
              Plan with Confidence. Invest Smart. Worry Less
            </motion.h2>

            <div className="bg-card rounded-xl p-6 border border-border mt-6">
              <h3 className="font-semibold text-foreground mb-4">The Highest Annualized Return In History</h3>
              <div className="flex gap-8">
                <div>
                  <p className="text-2xl font-bold text-primary">13.5%</p>
                  <p className="text-sm text-muted-foreground">Current</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-400">18.6%</p>
                  <p className="text-sm text-muted-foreground">Regular</p>
                </div>
              </div>
            </div>

            <Link
              to="/buy"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 border border-primary text-primary rounded-full hover:bg-primary hover:text-primary-foreground transition-all font-medium"
            >
              Buy Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right - Product cards carousel */}
          <div className="flex gap-4 overflow-x-auto pb-4">
            {products.map((product) => (
              <div
                key={product.title}
                className="min-w-[300px] bg-card border border-border rounded-xl overflow-hidden"
              >
                <div className="h-24 bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-4xl">
                  {product.image}
                </div>
                <div className="p-4">
                  <span className="inline-block px-3 py-1 text-xs border border-primary text-primary rounded-full mb-2">
                    {product.tag}
                  </span>
                  <h3 className="font-semibold text-foreground text-lg mb-3">{product.title}</h3>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="text-xl font-bold text-foreground">{product.buyers}</span>
                      <span className="text-xs text-muted-foreground ml-2">Buyer Count</span>
                    </div>
                    <div>
                      <span className="text-xl font-bold text-primary">{product.maxReturn}</span>
                      <span className="text-xs text-muted-foreground ml-2">Maximum Return</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-green-400 rounded-full"
                      style={{ width: `${product.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button className="flex items-center justify-center min-w-[40px] text-muted-foreground hover:text-foreground">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InvestmentSection;
