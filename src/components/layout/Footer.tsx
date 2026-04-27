import { useState } from "react";
import { Link } from "react-router-dom";

/* ── Minimal QR-code SVGs (placeholder patterns matching the screenshot style) ── */
const QR_IOS = (
  <svg width="90" height="90" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
    <rect width="21" height="21" fill="white"/>
    {/* top-left finder */}
    <rect x="1" y="1" width="7" height="7" fill="black"/><rect x="2" y="2" width="5" height="5" fill="white"/><rect x="3" y="3" width="3" height="3" fill="black"/>
    {/* top-right finder */}
    <rect x="13" y="1" width="7" height="7" fill="black"/><rect x="14" y="2" width="5" height="5" fill="white"/><rect x="15" y="3" width="3" height="3" fill="black"/>
    {/* bottom-left finder */}
    <rect x="1" y="13" width="7" height="7" fill="black"/><rect x="2" y="14" width="5" height="5" fill="white"/><rect x="3" y="15" width="3" height="3" fill="black"/>
    {/* data bits - iOS pattern */}
    <rect x="9" y="1" width="1" height="1" fill="black"/><rect x="11" y="1" width="1" height="1" fill="black"/>
    <rect x="8" y="2" width="1" height="1" fill="black"/><rect x="10" y="2" width="1" height="1" fill="black"/>
    <rect x="9" y="3" width="1" height="1" fill="black"/><rect x="11" y="3" width="1" height="1" fill="black"/>
    <rect x="8" y="4" width="1" height="1" fill="black"/><rect x="10" y="4" width="2" height="1" fill="black"/>
    <rect x="9" y="5" width="1" height="1" fill="black"/><rect x="11" y="5" width="1" height="1" fill="black"/>
    <rect x="1" y="8" width="1" height="1" fill="black"/><rect x="3" y="8" width="2" height="1" fill="black"/><rect x="8" y="8" width="1" height="1" fill="black"/><rect x="10" y="8" width="1" height="1" fill="black"/><rect x="13" y="8" width="2" height="1" fill="black"/><rect x="17" y="8" width="2" height="1" fill="black"/>
    <rect x="2" y="9" width="1" height="1" fill="black"/><rect x="5" y="9" width="1" height="1" fill="black"/><rect x="9" y="9" width="2" height="1" fill="black"/><rect x="14" y="9" width="1" height="1" fill="black"/><rect x="16" y="9" width="1" height="1" fill="black"/><rect x="19" y="9" width="1" height="1" fill="black"/>
    <rect x="1" y="10" width="2" height="1" fill="black"/><rect x="4" y="10" width="1" height="1" fill="black"/><rect x="8" y="10" width="1" height="1" fill="black"/><rect x="11" y="10" width="1" height="1" fill="black"/><rect x="13" y="10" width="1" height="1" fill="black"/><rect x="15" y="10" width="1" height="1" fill="black"/><rect x="18" y="10" width="2" height="1" fill="black"/>
    <rect x="2" y="11" width="2" height="1" fill="black"/><rect x="6" y="11" width="1" height="1" fill="black"/><rect x="9" y="11" width="1" height="1" fill="black"/><rect x="12" y="11" width="2" height="1" fill="black"/><rect x="16" y="11" width="2" height="1" fill="black"/>
    <rect x="1" y="12" width="1" height="1" fill="black"/><rect x="4" y="12" width="1" height="1" fill="black"/><rect x="8" y="12" width="2" height="1" fill="black"/><rect x="11" y="12" width="1" height="1" fill="black"/><rect x="14" y="12" width="1" height="1" fill="black"/><rect x="17" y="12" width="1" height="1" fill="black"/><rect x="19" y="12" width="1" height="1" fill="black"/>
    <rect x="9" y="13" width="1" height="1" fill="black"/><rect x="11" y="13" width="2" height="1" fill="black"/><rect x="15" y="13" width="1" height="1" fill="black"/><rect x="18" y="13" width="1" height="1" fill="black"/>
    <rect x="8" y="14" width="1" height="1" fill="black"/><rect x="10" y="14" width="1" height="1" fill="black"/><rect x="13" y="14" width="2" height="1" fill="black"/><rect x="16" y="14" width="1" height="1" fill="black"/><rect x="19" y="14" width="1" height="1" fill="black"/>
    <rect x="9" y="15" width="2" height="1" fill="black"/><rect x="14" y="15" width="1" height="1" fill="black"/><rect x="17" y="15" width="2" height="1" fill="black"/>
    <rect x="8" y="16" width="1" height="1" fill="black"/><rect x="11" y="16" width="1" height="1" fill="black"/><rect x="13" y="16" width="1" height="1" fill="black"/><rect x="15" y="16" width="1" height="1" fill="black"/><rect x="18" y="16" width="1" height="1" fill="black"/>
    <rect x="9" y="17" width="1" height="1" fill="black"/><rect x="12" y="17" width="2" height="1" fill="black"/><rect x="16" y="17" width="1" height="1" fill="black"/><rect x="19" y="17" width="1" height="1" fill="black"/>
    <rect x="8" y="18" width="2" height="1" fill="black"/><rect x="11" y="18" width="1" height="1" fill="black"/><rect x="14" y="18" width="2" height="1" fill="black"/><rect x="17" y="18" width="1" height="1" fill="black"/>
    <rect x="9" y="19" width="1" height="1" fill="black"/><rect x="13" y="19" width="1" height="1" fill="black"/><rect x="15" y="19" width="1" height="1" fill="black"/><rect x="18" y="19" width="2" height="1" fill="black"/>
  </svg>
);

const QR_ANDROID = (
  <svg width="90" height="90" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
    <rect width="21" height="21" fill="white"/>
    {/* top-left finder */}
    <rect x="1" y="1" width="7" height="7" fill="black"/><rect x="2" y="2" width="5" height="5" fill="white"/><rect x="3" y="3" width="3" height="3" fill="black"/>
    {/* top-right finder */}
    <rect x="13" y="1" width="7" height="7" fill="black"/><rect x="14" y="2" width="5" height="5" fill="white"/><rect x="15" y="3" width="3" height="3" fill="black"/>
    {/* bottom-left finder */}
    <rect x="1" y="13" width="7" height="7" fill="black"/><rect x="2" y="14" width="5" height="5" fill="white"/><rect x="3" y="15" width="3" height="3" fill="black"/>
    {/* data bits - Android pattern (different from iOS) */}
    <rect x="8" y="1" width="1" height="1" fill="black"/><rect x="10" y="1" width="2" height="1" fill="black"/>
    <rect x="9" y="2" width="1" height="1" fill="black"/><rect x="11" y="2" width="1" height="1" fill="black"/>
    <rect x="8" y="3" width="2" height="1" fill="black"/><rect x="11" y="3" width="1" height="1" fill="black"/>
    <rect x="9" y="4" width="1" height="1" fill="black"/><rect x="11" y="4" width="1" height="1" fill="black"/>
    <rect x="8" y="5" width="1" height="1" fill="black"/><rect x="10" y="5" width="2" height="1" fill="black"/>
    <rect x="2" y="8" width="2" height="1" fill="black"/><rect x="6" y="8" width="1" height="1" fill="black"/><rect x="9" y="8" width="1" height="1" fill="black"/><rect x="11" y="8" width="1" height="1" fill="black"/><rect x="14" y="8" width="1" height="1" fill="black"/><rect x="16" y="8" width="2" height="1" fill="black"/><rect x="19" y="8" width="1" height="1" fill="black"/>
    <rect x="1" y="9" width="1" height="1" fill="black"/><rect x="4" y="9" width="1" height="1" fill="black"/><rect x="8" y="9" width="1" height="1" fill="black"/><rect x="10" y="9" width="1" height="1" fill="black"/><rect x="13" y="9" width="2" height="1" fill="black"/><rect x="17" y="9" width="1" height="1" fill="black"/>
    <rect x="2" y="10" width="1" height="1" fill="black"/><rect x="5" y="10" width="1" height="1" fill="black"/><rect x="9" y="10" width="2" height="1" fill="black"/><rect x="14" y="10" width="2" height="1" fill="black"/><rect x="18" y="10" width="1" height="1" fill="black"/>
    <rect x="1" y="11" width="1" height="1" fill="black"/><rect x="3" y="11" width="2" height="1" fill="black"/><rect x="8" y="11" width="1" height="1" fill="black"/><rect x="11" y="11" width="1" height="1" fill="black"/><rect x="13" y="11" width="1" height="1" fill="black"/><rect x="16" y="11" width="1" height="1" fill="black"/><rect x="19" y="11" width="1" height="1" fill="black"/>
    <rect x="2" y="12" width="2" height="1" fill="black"/><rect x="6" y="12" width="1" height="1" fill="black"/><rect x="9" y="12" width="1" height="1" fill="black"/><rect x="12" y="12" width="1" height="1" fill="black"/><rect x="15" y="12" width="2" height="1" fill="black"/><rect x="19" y="12" width="1" height="1" fill="black"/>
    <rect x="8" y="13" width="2" height="1" fill="black"/><rect x="11" y="13" width="1" height="1" fill="black"/><rect x="14" y="13" width="1" height="1" fill="black"/><rect x="17" y="13" width="2" height="1" fill="black"/>
    <rect x="9" y="14" width="1" height="1" fill="black"/><rect x="12" y="14" width="1" height="1" fill="black"/><rect x="15" y="14" width="1" height="1" fill="black"/><rect x="18" y="14" width="1" height="1" fill="black"/>
    <rect x="8" y="15" width="1" height="1" fill="black"/><rect x="10" y="15" width="2" height="1" fill="black"/><rect x="13" y="15" width="2" height="1" fill="black"/><rect x="16" y="15" width="1" height="1" fill="black"/><rect x="19" y="15" width="1" height="1" fill="black"/>
    <rect x="9" y="16" width="1" height="1" fill="black"/><rect x="12" y="16" width="1" height="1" fill="black"/><rect x="14" y="16" width="1" height="1" fill="black"/><rect x="17" y="16" width="1" height="1" fill="black"/>
    <rect x="8" y="17" width="2" height="1" fill="black"/><rect x="11" y="17" width="2" height="1" fill="black"/><rect x="15" y="17" width="1" height="1" fill="black"/><rect x="18" y="17" width="2" height="1" fill="black"/>
    <rect x="9" y="18" width="1" height="1" fill="black"/><rect x="13" y="18" width="1" height="1" fill="black"/><rect x="16" y="18" width="1" height="1" fill="black"/><rect x="19" y="18" width="1" height="1" fill="black"/>
    <rect x="8" y="19" width="1" height="1" fill="black"/><rect x="10" y="19" width="2" height="1" fill="black"/><rect x="14" y="19" width="2" height="1" fill="black"/><rect x="17" y="19" width="1" height="1" fill="black"/>
  </svg>
);

const Footer = () => {
  const [hoveredBtn, setHoveredBtn] = useState<"ios" | "android" | null>(null);

  const linkStyle: React.CSSProperties = {
    fontSize: "1.1rem",
    color: "rgba(255,255,255,0.45)",
    textDecoration: "none",
    fontFamily: "'Inter','Segoe UI',sans-serif",
    lineHeight: 1.6,
    transition: "color 0.2s",
    display: "inline-block",
  };

  const headingStyle: React.CSSProperties = {
    fontSize: "1.4rem",
    fontWeight: 700,
    color: "#ffffff",
    marginBottom: "24px",
    fontFamily: "'Inter','Segoe UI',sans-serif",
    letterSpacing: "-0.01em",
  };

  const hoverLink = (e: React.MouseEvent<HTMLAnchorElement>, enter: boolean) => {
    (e.currentTarget as HTMLElement).style.color = enter ? "#ffffff" : "rgba(255,255,255,0.45)";
  };

  const btnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    padding: "18px 20px",
    background: active ? "#ffffff" : "transparent",
    border: `1px solid ${active ? "#ffffff" : "rgba(255,255,255,0.28)"}`,
    borderRadius: "10px",
    color: active ? "#000000" : "#ffffff",
    fontSize: "1.05rem",
    fontWeight: 600,
    fontFamily: "'Inter','Segoe UI',sans-serif",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "background 0.25s ease, color 0.25s ease, border-color 0.25s ease",
  });

  return (
    <footer style={{ background: "#000000", padding: "100px 0 100px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 48px" }}>

        {/* ── Logo row ── */}
        <div style={{ marginBottom: "56px", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "2px 5px", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "4px" }}>
            <span style={{ fontSize: "0.55rem", fontWeight: 800, color: "#ffffff", letterSpacing: "0.06em", fontFamily: "'Inter','Segoe UI',sans-serif", lineHeight: 1 }}>ENX</span>
          </div>
          <span style={{ fontSize: "1.4rem", fontWeight: 700, color: "#ffffff", fontFamily: "'Inter','Segoe UI',sans-serif", letterSpacing: "-0.01em" }}>Enivex</span>
        </div>

        {/* ── Columns row ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "40px" }}>

          {/* Left: nav columns */}
          <div style={{ display: "flex", gap: "64px", alignItems: "start" }}>
            <div>
              <h3 style={headingStyle}>About Us</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
                <li><Link to="/about" style={linkStyle} onMouseEnter={(e) => hoverLink(e, true)} onMouseLeave={(e) => hoverLink(e, false)}>Company introduction</Link></li>
              </ul>
            </div>
            <div>
              <h3 style={headingStyle}>Product</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
                <li><Link to="/finance" style={linkStyle} onMouseEnter={(e) => hoverLink(e, true)} onMouseLeave={(e) => hoverLink(e, false)}>Finance</Link></li>
              </ul>
            </div>
            <div>
              <h3 style={headingStyle}>Assets</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
                {[{ label: "Deposit", to: "/recharge" }, { label: "Withdraw", to: "/withdraw" }, { label: "Order List", to: "/orders" }].map(({ label, to }) => (
                  <li key={label}><Link to={to} style={linkStyle} onMouseEnter={(e) => hoverLink(e, true)} onMouseLeave={(e) => hoverLink(e, false)}>{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 style={headingStyle}>Service</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
                {[{ label: "Legal Liability", to: "/legal" }, { label: "Anti-Money Laundering Agreement", to: "/aml" }].map(({ label, to }) => (
                  <li key={label}><Link to={to} style={linkStyle} onMouseEnter={(e) => hoverLink(e, true)} onMouseLeave={(e) => hoverLink(e, false)}>{label}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: download & contact */}
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "#ffffff", marginBottom: "10px", fontFamily: "'Inter','Segoe UI',sans-serif", lineHeight: 1.35, letterSpacing: "-0.01em" }}>
              Enivex,faster and more efficient
            </p>
            <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.4)", marginBottom: "24px", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
              VIPServe:EnivexServer@gmail.com
            </p>

            {/* Download buttons */}
            <div style={{ display: "flex", gap: "14px", justifyContent: "flex-end" }}>
              {/* iOS button */}
              <button
                style={btnStyle(hoveredBtn === "ios")}
                onMouseEnter={() => setHoveredBtn("ios")}
                onMouseLeave={() => setHoveredBtn(null)}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill={hoveredBtn === "ios" ? "black" : "white"} style={{ transition: "fill 0.25s ease" }}>
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Download IOS
              </button>

              {/* Android button */}
              <button
                style={btnStyle(hoveredBtn === "android")}
                onMouseEnter={() => setHoveredBtn("android")}
                onMouseLeave={() => setHoveredBtn(null)}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill={hoveredBtn === "android" ? "black" : "white"} style={{ transition: "fill 0.25s ease" }}>
                  <path d="M17.523 0.976L15.586 4.32A7.993 7.993 0 0 0 12 3.5a7.993 7.993 0 0 0-3.586.82L6.477.976a.5.5 0 0 0-.692.18.5.5 0 0 0 .169.685l1.905 3.3A8 8 0 0 0 4 12h16a8 8 0 0 0-3.859-6.859l1.905-3.3a.5.5 0 0 0-.192-.68.5.5 0 0 0-.331-.185zM8.5 9a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM4 13v5a2 2 0 0 0 2 2h.5v2.5a1.5 1.5 0 0 0 3 0V20h5v2.5a1.5 1.5 0 0 0 3 0V20H18a2 2 0 0 0 2-2v-5H4z"/>
                </svg>
                Download Android
              </button>
            </div>

            {/* QR code — smoothly revealed on hover, aligned under the hovered button */}
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "14px",
              marginTop: hoveredBtn ? "16px" : "0px",
              opacity: hoveredBtn ? 1 : 0,
              maxHeight: hoveredBtn ? "160px" : "0px",
              overflow: "hidden",
              transition: "opacity 0.35s ease, max-height 0.35s ease, margin-top 0.35s ease",
            }}>
              {/* Spacer so QR aligns under the correct button */}
              <div style={{ flex: 1, visibility: hoveredBtn === "android" ? "hidden" : "visible" }}>
                {hoveredBtn === "ios" && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    {QR_IOS}
                    <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontFamily: "'Inter','Segoe UI',sans-serif", whiteSpace: "nowrap" }}>
                      Scan QR code · Download IOS
                    </span>
                  </div>
                )}
              </div>
              <div style={{ flex: 1, visibility: hoveredBtn === "ios" ? "hidden" : "visible" }}>
                {hoveredBtn === "android" && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    {QR_ANDROID}
                    <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontFamily: "'Inter','Segoe UI',sans-serif", whiteSpace: "nowrap" }}>
                      Scan QR code · Download Android
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
