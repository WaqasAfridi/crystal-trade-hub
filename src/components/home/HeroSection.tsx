import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import EthereumCrystal from "./EthereumCrystal";
import FloatingCoins from "./FloatingCoins";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Concentric circles background */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border border-border/20"
            style={{
              width: `${i * 25}%`,
              height: `${i * 25}%`,
            }}
          />
        ))}
      </div>

      <FloatingCoins />

      {/* 3D Crystal */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-80 sm:w-80 sm:h-96">
          <EthereumCrystal />
        </div>
      </div>

      {/* Text content */}
      <div className="relative z-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-light text-muted-foreground mb-8"
        >
          Unlock the World of Digital Currencies
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link
            to="/recharge"
            className="inline-flex items-center gap-2 px-8 py-3 border border-primary text-primary rounded-full hover:bg-primary hover:text-primary-foreground transition-all font-medium glow-pulse"
          >
            Deposit Now <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
