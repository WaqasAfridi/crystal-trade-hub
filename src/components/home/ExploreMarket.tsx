import { useState } from "react";
import { Link } from "react-router-dom";

const cards = [
  {
    id: "spot",
    title: "Spot",
    description: "Real-time trading in the spot market with rapid price changes.",
    illustration: "/spot-illustration.png",
    icon: "/spot-icon.png",
  },
  {
    id: "perpetual",
    title: "Perpetual contract",
    description: "Contract trading provides leveraged trading, which can achieve high returns.",
    illustration: "/perpetual-illustration.png",
    icon: "/perpetual-contract-icon.png",
  },
  {
    id: "options",
    title: "Options",
    description: "Options trading provides flexible hedging strategies to control risks and obtain returns.",
    illustration: "/options-illustration.png",
    icon: "/options-icon.png",
  },
];

const ExploreMarket = () => {
  const [activeId, setActiveId] = useState<string>("spot");
  const [animKey, setAnimKey] = useState(0);

  const activeCard = cards.find((c) => c.id === activeId) ?? cards[0];

  const activate = (id: string) => {
    if (id !== activeId) {
      setActiveId(id);
      setAnimKey((k) => k + 1);
    }
  };

  return (
    <>
      <style>{`
        @keyframes dropIn {
          0%   { opacity: 0; transform: translateY(-24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <section style={{ background: "#0a0a0a", padding: "96px 0 96px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>

          {/* ── OUTER: 2 equal columns ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "3fr 2fr",
            gap: 48,
            alignItems: "center",
          }}>

            {/* ══ LEFT COLUMN ══ */}
            <div style={{ display: "flex", flexDirection: "column" }}>

              {/* Row 1: Heading */}
              <h2 style={{
                fontSize: 32,
                fontWeight: 700,
                color: "#ffffff",
                marginBottom: 28,
              }}>
                Explore the market
              </h2>

              {/* Row 2: Paragraph */}
              <p style={{
                fontSize: 21,
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.3,
                marginBottom: 36,
                maxWidth: 620,
              }}>
                The cryptocurrency market is booming, encompassing digital
                currencies, blockchain technology, and more. The prospects are
                promising, but investment requires caution.
              </p>

              {/* Row 3: Button (left) + Illustration (right) — side by side */}
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 24,
              }}>
                {/* Button */}
                <div style={{ flexShrink: 0, paddingTop: 4 }}>
                  <Link
                    to="/register"
                    style={{
                      display: "inline-block",
                      padding: "11px 32px",
                      background: "#ffffff",
                      color: "#000000",
                      borderRadius: 50,
                      fontSize: 15,
                      fontWeight: 500,
                      textDecoration: "none",
                      border: "1px solid rgba(255,255,255,0.85)",
                      transition: "opacity 0.2s",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                  >
                    Get started
                  </Link>
                </div>

                {/* Illustration */}
                <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "flex-start", paddingLeft: "10%" }}>
                  <img
                    key={animKey}
                    src={activeCard.illustration}
                    alt="illustration"
                    style={{
                      width: "100%",
                      maxWidth: 260,
                      objectFit: "contain",
                      animation: "dropIn 0.42s cubic-bezier(0.22, 1, 0.36, 1) both",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ══ RIGHT COLUMN: stacked cards ══ */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {cards.map((card) => {
                const isActive = card.id === activeId;
                return (
                  <div
                    key={card.id}
                    onMouseEnter={() => activate(card.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 22,
                      padding: "26px 28px",
                      background: "transparent",
                      border: isActive
                        ? "1px solid rgba(255,255,255,0.18)"
                        : "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      cursor: "default",
                      transition: "border-color 0.25s",
                    }}
                  >
                    <img
                      src={card.icon}
                      alt={card.title}
                      style={{
                        width: 52,
                        height: 52,
                        minWidth: 52,
                        objectFit: "contain",
                      }}
                    />
                    <div>
                      <p style={{ fontSize: 19, fontWeight: 700, color: "#ffffff", marginBottom: 8 }}>
                        {card.title}
                      </p>
                      <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
                        {card.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default ExploreMarket;
