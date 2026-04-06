import { motion } from "framer-motion";
import { Shield, Zap, Globe, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const features = [
  { icon: Shield, title: "Security", desc: "Industry-leading security measures to protect your assets" },
  { icon: Zap, title: "Fast Transactions", desc: "Lightning-fast order execution and settlements" },
  { icon: Globe, title: "Global Access", desc: "Trade from anywhere in the world, 24/7" },
  { icon: BarChart3, title: "Advanced Tools", desc: "Professional-grade trading tools and analytics" },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-card/30">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
        >
          Everyone can use digital currency
        </motion.h2>
        <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
          The most trusted platform for trading digital assets
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
            >
              <feature.icon className="w-10 h-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-8 py-3 border border-primary text-primary rounded-full hover:bg-primary hover:text-primary-foreground transition-all font-medium"
        >
          Register <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default FeaturesSection;
