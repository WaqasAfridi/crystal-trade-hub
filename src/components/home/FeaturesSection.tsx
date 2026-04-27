import { motion } from "framer-motion";

const topRightCards = [
  {
    image: "/learn/bitcoin-falls-below.png",
    source: "Investing.com",
    title: "Bitcoin falls below $70,000 in rangebound trade ahead of key U...",
    excerpt: "Abu Dhabi, UAE, February 10th, 2026, Chainwire. As trade, employment, and digital...",
  },
  {
    image: "/learn/gomining.png",
    source: "Chainwire",
    title: "GoMining Simple Earn Enables Autonomous Bitcoin Yield Accrua...",
    excerpt: "Vaduz, Liechtenstein, February 9th, 2026, Chainwire. xMoney ($XMN) is expanding its...",
  },
];

const bottomCards = [
  {
    image: "/learn/bitmine-reports.png",
    source: "Chainwire",
    title: "Bitmine reports $10 billion in crypto and cash holdings",
    excerpt: 'Investing.com – The ongoing weakness in Bitcoin represents "the weakest Bitcoin bear...',
  },
  {
    image: "/learn/litecoin.png",
    source: "Investing.com",
    title: "Litecoin Climbs 10% In Bullish Trade",
    excerpt: "Investing.com - Bitcoin was trading at $70,689.0 by 15:02 (20:02 GMT) on the Investing.com...",
  },
  {
    image: "/learn/bitcoin-bounces-back.png",
    source: "Investing.com",
    title: "Bitcoin bounces back from 16-month low, reclaims and holds...",
    excerpt: "Palo Alto, CA, February 6th, 2026, Chainwire. ZenO opens access to egocentric...",
  },
  {
    image: "/learn/kucoin.png",
    source: "Investing.com",
    title: "KuCoin Expands Earn Suite with KuCoin Wealth for High-Value...",
    excerpt: "Investing.com – China's central bank announced Friday that it will further tighten...",
  },
];

const SourceBadge = ({ label }: { label: string }) => (
  <span
    style={{
      display: "inline-block",
      background: "#1c1c1c",
      color: "#9ca3af",
      fontSize: "0.85rem",
      fontWeight: 600,
      padding: "5px 14px",
      borderRadius: "8px",
      marginBottom: "22px",
      letterSpacing: "0.01em",
      width: "fit-content",
    }}
  >
    {label}
  </span>
);

/* Reusable card used by both top-right and bottom rows */
const NewsCard = ({ card, delay = 0, imageHeight }: {
  card: { image: string; source: string; title: string; excerpt: string };
  delay?: number;
  imageHeight: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    style={{
      background: "#111111",
      borderRadius: "16px",
      overflow: "hidden",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      height: "100%",
    }}
  >
    <img
      src={card.image}
      alt={card.title}
      style={{ width: "100%", height: imageHeight, objectFit: "cover", display: "block", flexShrink: 0 }}
    />
    <div style={{ padding: "16px 18px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
      <SourceBadge label={card.source} />
      <h4
        style={{
          color: "#ffffff",
          fontSize: "1.05rem",
          fontWeight: 700,
          fontFamily: "'Inter','Segoe UI',sans-serif",
          lineHeight: 1.4,
          marginBottom: "18px",
          letterSpacing: "-0.01em",
        }}
      >
        {card.title}
      </h4>
      <p
        style={{
          color: "#b0b7c3",
          fontSize: "0.87rem",
          lineHeight: 1.6,
        }}
      >
        {card.excerpt}
      </p>
    </div>
  </motion.div>
);

const FeaturesSection = () => {
  return (
    <section style={{ background: "#000000" }} className="py-20 px-6">
      <div className="max-w-[1400px] mx-auto">

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2
            style={{
              color: "#ffffff",
              fontSize: "2.5rem",
              fontWeight: 700,
              fontFamily: "'Inter','Segoe UI',sans-serif",
              marginBottom: "0.6rem",
            }}
          >
            Learn about cryptocurrency
          </h2>
          <p style={{ color: "#c9d1d9", fontSize: "1.55rem", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
            Learn all about cryptocurrency to start investing
          </p>
        </motion.div>

        {/* ── TOP ROW: 4-col grid, hero spans 2 cols ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "16px",
            alignItems: "stretch",
            gridAutoRows: "460px",
          }}
        >
          {/* Hero card — spans 2 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              gridColumn: "span 2",
              borderRadius: "16px",
              overflow: "hidden",
              cursor: "pointer",
              background: "#111111",
            }}
          >
            <img
              src="/learn/when-is-best-time.png"
              alt="When is the best time to invest in crypto"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </motion.div>

          {/* Top-right cards — 1 col each */}
          {topRightCards.map((card, i) => (
            <NewsCard key={i} card={card} delay={i * 0.1} imageHeight={190} />
          ))}
        </div>

        {/* ── BOTTOM ROW: 4 equal cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "28px",
            gridAutoRows: "460px",
          }}
        >
          {bottomCards.map((card, i) => (
            <NewsCard key={i} card={card} delay={i * 0.08} imageHeight={190} />
          ))}
        </div>

        {/* View more */}
        <div>
          <a
            href="#"
            style={{
              color: "#e5e7eb",
              fontSize: "0.95rem",
              textDecoration: "underline",
              fontFamily: "'Inter','Segoe UI',sans-serif",
              cursor: "pointer",
            }}
          >
            View more
          </a>
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;
