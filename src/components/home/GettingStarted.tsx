import { Link } from "react-router-dom";
import { useState, useRef, MouseEvent } from "react";

const steps = [
  {
    number: "01",
    title: "Create an account",
    description: "Register an account to enjoy more privileges and services",
    buttonLabel: "Register",
    buttonTo: "/register",
    icon: "/create-account-icon.png",
  },
  {
    number: "02",
    title: "Deposit Funds",
    description: "Top up your account and start investing in cryptocurrency",
    buttonLabel: "Deposit crypto",
    buttonTo: "/recharge",
    icon: "/deposit-funds-icon.png",
  },
  {
    number: "03",
    title: "Start trading",
    description: "Sell, buy or copy trades, discover more",
    buttonLabel: "Trade",
    buttonTo: "/spot/crypto",
    icon: "/start-trading-icon.png",
  },
];

interface SpotlightCardProps {
  step: (typeof steps)[0];
}

const SpotlightCard = ({ step }: SpotlightCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [spotlight, setSpotlight] = useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSpotlight({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseLeave = () => setSpotlight(null);

  const spotlightBg = spotlight
    ? `radial-gradient(400px circle at ${spotlight.x}px ${spotlight.y}px, rgba(60, 100, 200, 0.22) 0%, rgba(40, 70, 180, 0.10) 40%, transparent 70%)`
    : "transparent";

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 12,
        padding: "36px 32px 32px 32px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "transparent",
        cursor: "default",
        transition: "border-color 0.3s",
      }}
    >
      {/* Spotlight overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: spotlightBg,
          pointerEvents: "none",
          transition: "background 0.05s",
          borderRadius: 12,
        }}
      />

      {/* Icon */}
      <img
        src={step.icon}
        alt={step.title}
        style={{
          width: 64,
          height: 64,
          objectFit: "contain",
          marginBottom: 26,
          position: "relative",
          zIndex: 1,
        }}
      />

      {/* Title */}
      <h3
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "#ffffff",
          marginBottom: 12,
          lineHeight: 1.3,
          position: "relative",
          zIndex: 1,
        }}
      >
        {step.number}.{step.title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: 15,
          color: "rgba(255,255,255,0.42)",
          lineHeight: 1.65,
          marginBottom: 36,
          flexGrow: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        {step.description}
      </p>

      {/* Button */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Link
          to={step.buttonTo}
          style={{
            display: "inline-block",
            padding: "9px 24px",
            background: "#ffffff",
            color: "#000000",
            borderRadius: 5,
            fontSize: 15,
            fontWeight: 500,
            textDecoration: "none",
            border: "1px solid rgba(255,255,255,0.85)",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.opacity = "0.85")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.opacity = "1")
          }
        >
          {step.buttonLabel}
        </Link>
      </div>
    </div>
  );
};

const GettingStarted = () => {
  return (
    <section style={{ background: "#0a0a0a", padding: "96px 0 96px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: 32,
          }}
        >
          Getting Started
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {steps.map((step) => (
            <SpotlightCard key={step.number} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default GettingStarted;
