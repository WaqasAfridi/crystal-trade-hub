import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const products = [
  {
    id: 0,
    tagLabel: "Investment banking firm",
    tagType: "regular",
    title: "Robo-Advisor",
    buyers: 52260,
    maxReturn: "0.45",
    progress: 100,
    image: "/finance-cards/finance-card-1.png",
  },
  {
    id: 1,
    tagLabel: "AI GPT",
    tagType: "current",
    title: "Treasury Bonds",
    buyers: 19362,
    maxReturn: "0.2",
    progress: 100,
    image: "/finance-cards/finance-card-2.png",
  },
  {
    id: 2,
    tagLabel: "Investment banking firm",
    tagType: "regular",
    title: "Robo-Advisor(2)",
    buyers: 49218,
    maxReturn: "0.83",
    progress: 100,
    image: "/finance-cards/finance-card-3.png",
  },
];

// Reduced angles (5°/10°), slight upward (-12/-22) and rightward (8/15) shift
const CARD_OFFSETS = [
  { x: 0,  y: 0,   rotate: 0,  scale: 1,     zIndex: 3 },
  { x: 8,  y: -12, rotate: 5,  scale: 0.93,  zIndex: 2 },
  { x: 15, y: -22, rotate: 10, scale: 0.865, zIndex: 1 },
];

const InvestmentSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const [buyerCounts, setBuyerCounts] = useState(products.map((p) => p.buyers));

  useEffect(() => {
    const interval = setInterval(() => {
      setBuyerCounts((prev) =>
        prev.map((count) => count + Math.floor(Math.random() * 3) + 1)
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % products.length);
      setIsAnimating(false);
    }, 300);
  }, [isAnimating]);

  const displayOrder = [0, 1, 2].map((i) => ({
    product: products[(activeIndex + i) % products.length],
    productIndex: (activeIndex + i) % products.length,
    offsetIndex: i,
  }));

  return (
    <section
      className="py-14 lg:py-20 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #07101f 0%, #0a0c14 100%)" }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 60% at 68% 55%, rgba(100,220,180,0.10) 0%, rgba(132,204,22,0.06) 40%, transparent 70%)",
        }}
      />

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 relative">
        {/* Finance pill */}
        <div className="mb-7">
          <span
            className="inline-block px-7 py-2.5 rounded-full text-base font-semibold"
            style={{ background: "#ffffff", color: "#000000" }}
          >
            Finance
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
          {/* ── LEFT SIDE ── */}
          <div className="flex flex-col gap-5 lg:w-[38%]">

            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-bold text-white leading-tight text-left"
              style={{ fontSize: "2.25rem" }}
            >
              Finance
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-left text-base"
              style={{ color: "#b7b7b7" }}
            >
              Plan with Confidence. Invest Smart. Worry Less
            </motion.p>

            {/* Stats box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-xl p-6"
              style={{ background: "#1f1f1f", width: 295 }}
            >
              {/* Row 1 — title */}
              <p className="text-white font-bold text-lg leading-snug mb-6">
                The Highest Annualized Return In History
              </p>

              {/* Row 2 — percentages + labels */}
              <div className="flex justify-between">
                <div>
                  <p className="text-3xl font-bold" style={{ color: "#25a750" }}>13.5%</p>
                  <p className="text-base mt-1" style={{ color: "#adadad" }}>Current</p>
                </div>
                <div>
                  <p className="text-3xl font-bold" style={{ color: "#25a750" }}>18.6%</p>
                  <p className="text-base mt-1" style={{ color: "#adadad" }}>Regular</p>
                </div>
              </div>
            </motion.div>

            {/* Buy Now button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                to="/buy"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm transition-all duration-300 hover:scale-105"
                style={{ border: "1.5px solid #bcff2f", color: "#bcff2f" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#bcff2f";
                  (e.currentTarget as HTMLElement).style.color = "#0a0c14";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#bcff2f";
                }}
              >
                Buy Now <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          {/* ── RIGHT SIDE — Rotated fan card stack ── */}
          <div className="flex items-center gap-5 flex-1">
            <div
              className="relative flex-1"
              style={{ height: 500, maxWidth: 800, minWidth: 380 }}
            >
              {[...displayOrder].reverse().map(({ product, productIndex, offsetIndex }) => {
                const off = CARD_OFFSETS[offsetIndex];
                return (
                  <motion.div
                    key={product.id}
                    animate={{
                      x: off.x,
                      y: off.y,
                      rotate: off.rotate,
                      scale: off.scale,
                      zIndex: off.zIndex,
                    }}
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                    className="absolute top-0 left-0 rounded-2xl overflow-hidden flex flex-col"
                    style={{
                      width: 560,
                      height: "90%",
                      background: "#15171c",
                      border: "1px solid #364140",
                      transformOrigin: "bottom center",
                    }}
                  >
                    {/* Image */}
                    <div
                      className="rounded-t-2xl"
                      style={{
                        height: "58%",
                        backgroundImage: `url(${product.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center top",
                      }}
                    />

                    {/* Content */}
                    <div
                      className="flex flex-col justify-between p-5 rounded-b-2xl"
                      style={{ height: "42%", background: "#1f1f1f" }}
                    >
                      <h6
                        className="inline-block w-fit rounded-full text-xs font-semibold px-3 py-1 mb-1"
                        style={
                          product.tagType === "regular"
                            ? { background: "#f19eff", color: "#000" }
                            : { background: "#bcff2f", color: "#000" }
                        }
                      >
                        {product.tagLabel}
                      </h6>

                      <span className="font-bold text-lg mb-1" style={{ color: "#ffffff" }}>
                        {product.title}
                      </span>

                      <div
                        className="rounded-xl p-3 flex flex-col gap-2"
                        style={{ background: "#141414" }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-bold text-lg" style={{ color: "#ffffff" }}>
                              {buyerCounts[productIndex].toLocaleString()}
                            </span>
                            <span className="text-xs ml-2" style={{ color: "#919191" }}>
                              Buyer Count
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-lg" style={{ color: "#bcff2f" }}>
                              {product.maxReturn} %
                            </span>
                            <span className="text-xs ml-2" style={{ color: "#919191" }}>
                              Maximum Return
                            </span>
                          </div>
                        </div>

                        <div
                          className="w-full rounded-full overflow-hidden"
                          style={{ height: 6, background: "rgba(255,255,255,0.08)" }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{
                              background: "linear-gradient(90deg, #719efb 0%, #bcff2f 100%)",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Right arrow */}
            <button
              onClick={handleNext}
              className="flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110"
              style={{
                width: 46,
                height: 46,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
              }}
              aria-label="Next card"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InvestmentSection;
