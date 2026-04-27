import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Lock, Shield, Mail, Phone, FileCheck } from "lucide-react";

/* ── Coin config ──────────────────────────────────────────────── */
const COINS = [
  { id: "bitcoin",     symbol: "BTC",  name: "BTC/USDT",  color: "#f7931a" },
  { id: "ethereum",    symbol: "ETH",  name: "ETH/USDT",  color: "#627eea" },
  { id: "binancecoin", symbol: "BNB",  name: "BNB/USDT",  color: "#f3ba2f" },
  { id: "neo",         symbol: "NEO",  name: "NEO/USDT",  color: "#58bf00" },
  { id: "litecoin",    symbol: "LTC",  name: "LTC/USDT",  color: "#bfbbbb" },
  { id: "ripple",      symbol: "XRP",  name: "XRP/USDT",  color: "#23292f" },
  { id: "qtum",        symbol: "QTUM", name: "QTUM/USDT", color: "#2e9ad0" },
  { id: "iota",        symbol: "IOTA", name: "IOTA/USDT", color: "#242424" },
];

type CoinData = {
  id: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_in_7d: { price: number[] };
};

/* ── Mini sparkline SVG ───────────────────────────────────────── */
const Sparkline = ({ data, width = 200, height = 50 }: { data: number[]; width?: number; height?: number }) => {
  if (!data || data.length < 2) return <div style={{ width, height }} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });
  const pathD = `M${points.join(" L")}`;
  const areaD = `${pathD} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#sparkFill)" />
      <path d={pathD} fill="none" stroke="#22c55e" strokeWidth="1.5" />
    </svg>
  );
};

/* ═══════════════════════════════════════════════════════════════
   OVERVIEW TAB
   ═══════════════════════════════════════════════════════════════ */
const OverviewTab = () => {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const ids = COINS.map((c) => c.id).join(",");
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&sparkline=true&price_change_percentage=24h`
      );
      if (!res.ok) throw new Error("API error");
      const data: CoinData[] = await res.json();
      setCoins(data);
    } catch { /* keep previous */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { const id = setInterval(fetchData, 5000); return () => clearInterval(id); }, [fetchData]);

  const orderedCoins = COINS.map((c) => coins.find((d) => d.id === c.id)).filter(Boolean) as CoinData[];

  return (
    <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
      {/* Left column */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Identity verification card */}
        <div style={{
          background: "#fff", borderRadius: "12px", padding: "32px", marginBottom: "20px",
          border: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ maxWidth: "500px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111", lineHeight: 1.3, marginBottom: "10px" }}>
              To ensure the security of your account, please complete identity verification
            </h2>
            <p style={{ fontSize: "14px", color: "#888", marginBottom: "24px" }}>
              Verify identity and improve account security
            </p>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111", marginBottom: "6px" }}>Authentication</h3>
            <p style={{ fontSize: "14px", color: "#888", marginBottom: "20px" }}>
              Certification is required before you can purchase or recharge digital currency
            </p>
            <button style={{
              background: "#111", color: "#fff", border: "none", borderRadius: "6px",
              padding: "10px 24px", fontSize: "14px", fontWeight: 500, cursor: "pointer",
            }}>Not Verified</button>
          </div>
          <div style={{ flexShrink: 0, marginLeft: "24px" }}>
            <img src="/kyc.png" alt="Verification" style={{ width: "180px", height: "auto" }} />
          </div>
        </div>

        {/* Market section */}
        <div style={{ background: "#fff", borderRadius: "12px", padding: "24px 32px", border: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111", marginBottom: "20px" }}>Market</h2>
          <div style={{ display: "flex", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
            <span style={{ width: "200px", fontSize: "14px", color: "#888" }}>Symbol</span>
            <span style={{ flex: 1, fontSize: "14px", color: "#888" }}>Chart</span>
            <span style={{ width: "160px", fontSize: "14px", color: "#888", textAlign: "center" }}>Latest</span>
            <span style={{ width: "120px", fontSize: "14px", color: "#888", textAlign: "center" }}>Action</span>
          </div>
          {loading && orderedCoins.length === 0 ? (
            <div style={{ padding: "60px 0", textAlign: "center", color: "#ccc" }}>Loading market data...</div>
          ) : orderedCoins.length === 0 ? (
            <div style={{ padding: "60px 0", textAlign: "center", color: "#ccc" }}>Unable to load market data</div>
          ) : (
            orderedCoins.map((coin) => {
              const meta = COINS.find((c) => c.id === coin.id)!;
              const change = coin.price_change_percentage_24h ?? 0;
              const sparkData = coin?.sparkline_in_7d?.price?.slice(-48) || [];
              return (
                <div key={coin.id} style={{ display: "flex", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #f8f8f8" }}>
                  <div style={{ width: "200px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "50%", background: meta.color,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      fontSize: "10px", fontWeight: 700, color: "#fff",
                    }}>{meta.symbol.charAt(0)}</div>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 500, color: "#111" }}>{meta.name}</p>
                      <p style={{ fontSize: "12px", color: "#999" }}>{meta.symbol}</p>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}><Sparkline data={sparkData} width={220} height={45} /></div>
                  <div style={{ width: "160px", textAlign: "center" }}>
                    <p style={{ fontSize: "14px", fontWeight: 500, color: "#111" }}>
                      $ {coin.current_price < 1 ? coin.current_price.toFixed(2) : coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p style={{ fontSize: "12px", color: change >= 0 ? "#22c55e" : "#ef4444", fontWeight: 500 }}>
                      {change >= 0 ? "+" : ""}{change.toFixed(3)}%
                    </p>
                  </div>
                  <div style={{ width: "120px", textAlign: "center" }}>
                    <Link to="/spot/crypto" style={{
                      display: "inline-block", background: "#111", color: "#fff", borderRadius: "20px",
                      padding: "8px 24px", fontSize: "13px", fontWeight: 500, textDecoration: "none",
                    }}>Trade</Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right sidebar */}
      <div style={{ width: "320px", flexShrink: 0 }}>
        <div style={{
          background: "#fff", borderRadius: "12px", padding: "20px", marginBottom: "16px",
          border: "1px solid #e5e7eb", position: "relative", overflow: "hidden",
        }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111", marginBottom: "4px" }}>Invite friends</h3>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#111", marginBottom: "8px" }}>
            Invite friends to get up to 1888 USD rewards
          </p>
          <Link to="/invite" style={{ fontSize: "13px", color: "#22c55e", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}>
            Invite friends <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <div style={{ display: "flex", gap: "6px", marginTop: "12px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ddd" }} />
          </div>
          <div style={{
            position: "absolute", top: "10px", right: "-10px", width: "100px", height: "100px",
            borderRadius: "50%", background: "linear-gradient(135deg, #26a17b 0%, #1a9b6e 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px", fontWeight: 900, color: "#fff", opacity: 0.85,
          }}>₮</div>
        </div>
        <div style={{
          background: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #e5e7eb", minHeight: "300px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111" }}>Bulletin</h3>
            <Link to="/bulletin" style={{ fontSize: "13px", color: "#888", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}>
              all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: "40px" }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ marginBottom: "12px", opacity: 0.35 }}>
              <rect x="20" y="15" width="40" height="50" rx="4" stroke="#ccc" strokeWidth="1.5" />
              <line x1="28" y1="30" x2="52" y2="30" stroke="#ccc" strokeWidth="1.5" />
              <line x1="28" y1="38" x2="48" y2="38" stroke="#ccc" strokeWidth="1.5" />
              <line x1="28" y1="46" x2="44" y2="46" stroke="#ccc" strokeWidth="1.5" />
              <circle cx="58" cy="20" r="8" stroke="#ccc" strokeWidth="1.5" />
              <circle cx="18" cy="55" r="6" stroke="#ccc" strokeWidth="1.5" />
            </svg>
            <span style={{ fontSize: "13px", color: "#ccc" }}>No Data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   KYC VERIFICATION TAB
   ═══════════════════════════════════════════════════════════════ */
const KycTab = () => (
  <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px" }}>
    {/* Title bar */}
    <div style={{ padding: "16px 32px", borderBottom: "1px solid #e5e7eb" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111" }}>KYC Verification</h2>
    </div>
    {/* Content */}
    <div style={{ padding: "40px 32px 60px", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
      <img src="/kyc.png" alt="KYC" style={{ width: "180px", height: "auto", margin: "0 auto 32px" }} />
      <p style={{ fontSize: "15px", color: "#555", lineHeight: 2, textAlign: "left", marginBottom: "32px" }}>
        According to local laws and regulations, you need to complete identity authentication to
        use our services. This helps protect <strong style={{ color: "#111" }}>your account</strong> and allows you to use all Platform
        services and features.
      </p>
      <p style={{ fontSize: "15px", fontWeight: 700, color: "#111", textAlign: "left", marginBottom: "16px" }}>
        You need to provide:
      </p>
      <p style={{ fontSize: "15px", color: "#555", textAlign: "left", lineHeight: 2 }}>
        *Document and face recognition authentication
      </p>
      <p style={{ fontSize: "15px", color: "#555", textAlign: "left", lineHeight: 2, marginBottom: "32px" }}>
        *personal information
      </p>
      <button style={{
        width: "100%", padding: "16px", background: "#111", color: "#fff", border: "none",
        borderRadius: "8px", fontSize: "15px", fontWeight: 500, cursor: "pointer", marginBottom: "12px",
      }}>Start immediately</button>
      <button style={{
        width: "100%", padding: "16px", background: "#111", color: "#fff", border: "none",
        borderRadius: "8px", fontSize: "15px", fontWeight: 500, cursor: "pointer",
      }}>Advanced Certification</button>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   SECURITY CENTER TAB
   ═══════════════════════════════════════════════════════════════ */
const securityItems = [
  {
    icon: Lock,
    title: "Change Login Password",
    desc: "Used for managing your account login password",
    action: "Change",
    extra: "",
  },
  {
    icon: Shield,
    title: "Change Withdrawal Password",
    desc: "Protects your transactions and account security",
    action: "Set",
    extra: "",
  },
  {
    icon: Mail,
    title: "Email",
    desc: "Protects your transactions and account security",
    action: "Change",
    extra: "wa****@gmail.com",
  },
  {
    icon: Phone,
    title: "Phone Number",
    desc: "Protects your transactions and account security",
    action: "Bind",
    extra: "",
  },
  {
    icon: FileCheck,
    title: "Advanced Certification",
    desc: "Advanced authentication ensures identity authenticity, using information comparison and data encryption to improve security and convenience.",
    action: "Not authenticated by real name!",
    extra: "",
  },
];

const SecurityTab = () => (
  <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px" }}>
    <div style={{ padding: "16px 32px", borderBottom: "1px solid #e5e7eb" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111" }}>Security Center</h2>
    </div>
    <div style={{ padding: "16px 32px" }}>
      {securityItems.map((item, i) => (
        <div
          key={i}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "28px 0",
            borderBottom: i < securityItems.length - 1 ? "1px dashed #e5e7eb" : "1px dashed #e5e7eb",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", flex: 1 }}>
            <item.icon style={{ width: "22px", height: "22px", color: "#888", marginTop: "2px", flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: "16px", fontWeight: 600, color: "#111", marginBottom: "4px" }}>{item.title}</p>
              <p style={{ fontSize: "13px", color: "#999", maxWidth: "600px", lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
            {item.extra && (
              <span style={{ fontSize: "14px", color: "#888" }}>{item.extra}</span>
            )}
            <button style={{
              padding: item.action.length > 10 ? "10px 20px" : "8px 28px",
              border: "1px solid #ddd", borderRadius: "24px", background: "#fff",
              color: "#333", fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap",
            }}>{item.action}</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   PROFILE PAGE
   ═══════════════════════════════════════════════════════════════ */
const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("Overview");
  const tabs = ["Overview", "KYC Verification", "Security Center"];

  const renderTab = () => {
    switch (activeTab) {
      case "KYC Verification": return <KycTab />;
      case "Security Center":  return <SecurityTab />;
      default:                 return <OverviewTab />;
    }
  };

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      {/* ── Tab bar ──────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eee" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", gap: "32px" }}>
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "14px 0", fontSize: "14px", background: "none", cursor: "pointer",
                  fontWeight: activeTab === tab ? 500 : 400,
                  color: activeTab === tab ? "#111" : "#999",
                  border: "none",
                  borderBottom: `2px solid ${activeTab === tab ? "#111" : "transparent"}`,
                  transition: "color 0.2s",
                }}
              >{tab}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── User info bar (dark) — only on Overview ──────────── */}
      {activeTab === "Overview" && (
        <div style={{ background: "#1a1a1a" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <img src="/profile-avatar.png" alt="User" style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", border: "2px solid #e879a0" }} />
              <div>
                <p style={{ fontSize: "12px", color: "#999", marginBottom: "2px" }}>User</p>
                <p style={{ fontSize: "14px", color: "#fff", fontWeight: 500 }}>waqasafridi289@gmail.com</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "48px", flexWrap: "wrap" }}>
              <div>
                <p style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>Email</p>
                <p style={{ fontSize: "13px", color: "#fff" }}>waqasafridi289@gmail.com</p>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>User ID</p>
                <p style={{ fontSize: "13px", color: "#fff" }}>387386</p>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>Authentication</p>
                <button style={{ fontSize: "12px", color: "#333", background: "#fff", border: "1px solid #ddd", borderRadius: "14px", padding: "3px 14px", cursor: "pointer" }}>Verify Now</button>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>Phone Number</p>
                <button style={{ fontSize: "12px", color: "#333", background: "#fff", border: "1px solid #ddd", borderRadius: "14px", padding: "3px 14px", cursor: "pointer" }}>Verify Now</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab content ──────────────────────────────────────── */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>
        {renderTab()}
      </div>
    </div>
  );
};

export default ProfilePage;
