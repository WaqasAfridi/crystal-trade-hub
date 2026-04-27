import { useRef, useState, MouseEvent } from "react";
import { Link } from "react-router-dom";

const CTASection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setMouse(null);
    setIsHovered(false);
  };

  /* Focused torch glow — tighter and brighter than the card spotlights */
  const glowBg = mouse
    ? `radial-gradient(200px circle at ${mouse.x}px ${mouse.y}px,
        rgba(80, 130, 255, 0.38) 0%,
        rgba(60, 100, 220, 0.18) 45%,
        transparent 70%)`
    : "transparent";

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative",
        background: isHovered ? "#0b0e19" : "#191a1c",
        transition: "background 0.3s ease",
        overflow: "hidden",
        padding: "64px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Mouse-following glow overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: glowBg,
          pointerEvents: "none",
          transition: "background 0.05s linear",
          zIndex: 0,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "36px",
        }}
      >
        {/* Heading */}
        <h2
          style={{
            color: "#ffffff",
            fontSize: "2.9rem",
            fontWeight: 800,
            fontFamily: "'Inter','Segoe UI',sans-serif",
            textAlign: "center",
            lineHeight: 1.2,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Ready to start your crypto journey?
        </h2>

        {/* Register button */}
        <Link
          to="/register"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 32px",
            border: "2px solid #a3e635",
            borderRadius: "999px",
            background: "transparent",
            color: "#a3e635",
            fontSize: "1rem",
            fontWeight: 700,
            fontFamily: "'Inter','Segoe UI',sans-serif",
            textDecoration: "none",
            letterSpacing: "0.01em",
            transition: "background 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(163,230,53,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          Register
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#a3e635"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </section>
  );
};

export default CTASection;
