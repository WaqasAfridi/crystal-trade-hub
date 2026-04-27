import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface MarketRow {
  pair: string;
  display: string;
  logo: string;
  price: string;
  change: number;
  sparkline: number[];
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const SYMBOLS = [
  {
    pair: "BTCUSDT",
    display: "BTC/USDT",
    logo: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    fallback: "/crypto-logos/btc.svg",
  },
  {
    pair: "ETHUSDT",
    display: "ETH/USDT",
    logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    fallback: "/crypto-logos/eth.svg",
  },
  {
    pair: "BNBUSDT",
    display: "BNB/USDT",
    logo: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
    fallback: "/crypto-logos/bnb.svg",
  },
  {
    pair: "NEOUSDT",
    display: "NEO/USDT",
    logo: "https://assets.coingecko.com/coins/images/480/small/NEO_512_512.png",
    fallback: "/crypto-logos/neo.svg",
  },
  {
    pair: "LTCUSDT",
    display: "LTC/USDT",
    logo: "https://assets.coingecko.com/coins/images/2/small/litecoin.png",
    fallback: "/crypto-logos/ltc.svg",
  },
  {
    pair: "XRPUSDT",
    display: "XRP/USDT",
    logo: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
    fallback: "/crypto-logos/xrp.svg",
  },
  {
    pair: "QTUMUSDT",
    display: "QTUM/USDT",
    logo: "https://assets.coingecko.com/coins/images/684/small/qtum.png",
    fallback: "/crypto-logos/qtum.svg",
  },
  {
    pair: "IOTAUSDT",
    display: "IOTA/USDT",
    logo: "https://assets.coingecko.com/coins/images/692/small/IOTA_Swirls.png",
    fallback: "/crypto-logos/iota.svg",
  },
];

const CARDS = [
  { src: "/ico/card-1.png", alt: "ICO Proterozoic" },
  { src: "/ico/card-2.png", alt: "NFT ICO" },
  { src: "/ico/card-3.png", alt: "Web 3.0" },
];

// ─── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  if (!data || data.length < 2) return <svg width="80" height="36" />;
  const W = 80, H = 36, pad = 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = H - pad - ((v - min) / range) * (H - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const color = isPositive ? "#22c55e" : "#ef4444";
  const fillColor = isPositive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)";
  const fillPts = [`${pad},${H - pad}`, ...pts, `${W - pad},${H - pad}`].join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <polygon points={fillPts} fill={fillColor} />
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Format price ───────────────────────────────────────────────────────────────
function fmtPrice(price: string): string {
  const n = parseFloat(price);
  if (isNaN(n)) return price;
  if (n >= 1000) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 1) return n.toFixed(2);
  return n.toFixed(4);
}

// ─── Main Component ─────────────────────────────────────────────────────────────
const MobileICO = () => {
  const [activeCard, setActiveCard] = useState(0);
  const [markets, setMarkets] = useState<MarketRow[]>(
    SYMBOLS.map(s => ({ ...s, price: "—", change: 0, sparkline: [] }))
  );
  const [sparklines, setSparklines] = useState<Record<string, number[]>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const carouselRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  // Auto-advance carousel
  useEffect(() => {
    carouselRef.current = setInterval(() => {
      setActiveCard(prev => (prev + 1) % CARDS.length);
    }, 3500);
    return () => { if (carouselRef.current) clearInterval(carouselRef.current); };
  }, []);

  // Fetch sparklines (1h klines, 24 periods)
  const fetchSparklines = useCallback(async () => {
    const results: Record<string, number[]> = {};
    await Promise.allSettled(
      SYMBOLS.map(async ({ pair }) => {
        try {
          const res = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=1h&limit=24`
          );
          if (!res.ok) return;
          const data: unknown[][] = await res.json();
          results[pair] = data.map(k => parseFloat(k[4] as string));
        } catch { /* ignore */ }
      })
    );
    if (mountedRef.current) setSparklines(results);
  }, []);

  // Fetch 24hr tickers
  const fetchTickers = useCallback(async () => {
    try {
      const syms = SYMBOLS.map(s => `"${s.pair}"`).join(",");
      const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=[${syms}]`);
      if (!res.ok) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any[] = await res.json();
      if (!mountedRef.current) return;
      setMarkets(prev =>
        prev.map(row => {
          const ticker = data.find((t: { symbol: string }) => t.symbol === row.pair);
          if (!ticker) return row;
          return { ...row, price: fmtPrice(ticker.lastPrice), change: parseFloat(ticker.priceChangePercent) };
        })
      );
    } catch { /* ignore */ }
  }, []);

  // Merge sparklines into markets
  useEffect(() => {
    setMarkets(prev =>
      prev.map(row => ({ ...row, sparkline: sparklines[row.pair] ?? row.sparkline }))
    );
  }, [sparklines]);

  // Init
  useEffect(() => {
    mountedRef.current = true;
    fetchSparklines();
    fetchTickers();
    timerRef.current = setInterval(fetchTickers, 5000);
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchSparklines, fetchTickers]);

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div
        style={{
          background: "#000",
          padding: "20px 16px 22px",
          position: "relative",
          overflow: "hidden",
          minHeight: "155px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: 1, paddingRight: "8px" }}>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: "5px" }}>
              ICO
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.72)", marginBottom: "16px" }}>
              Digital currency for everyone
            </div>
            <button
              style={{
                background: "#fff",
                color: "#000",
                border: "none",
                borderRadius: "20px",
                padding: "8px 20px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Start Earning Profits
            </button>
          </div>
          <div style={{ flexShrink: 0, width: "135px", height: "135px" }}>
            <img
              src="/ico/hero-image.png"
              alt="ICO Hero"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        </div>
      </div>

      {/* ── Card Carousel ────────────────────────────────────────────────────── */}
      <div style={{ background: "#fff", padding: "14px 0 12px", position: "relative" }}>
        {/* Track */}
        <div
          style={{
            overflow: "hidden",
            margin: "0 16px",
            borderRadius: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              transition: "transform 0.4s ease",
              transform: `translateX(${-activeCard * 100}%)`,
            }}
          >
            {CARDS.map((card, i) => (
              <div
                key={i}
                style={{
                  flexShrink: 0,
                  width: "100%",
                  height: "148px",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <img
                  src={card.src}
                  alt={card.alt}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "10px" }}>
          {CARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveCard(i)}
              style={{
                width: i === activeCard ? "20px" : "7px",
                height: "7px",
                borderRadius: "4px",
                background: i === activeCard ? "#333" : "#ccc",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Quick Action Icons ───────────────────────────────────────────────── */}
      <div
        style={{
          background: "#fdf6ee",
          padding: "16px 0 12px",
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        {[
          { icon: "/ico/icon-my-holdings.png", label: "My Holding" },
          { icon: "/ico/icon-preview.png", label: "Preview" },
          { icon: "/ico/icon-order.png", label: "Order" },
        ].map(({ icon, label }) => (
          <div
            key={label}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "7px", cursor: "pointer" }}
          >
            <div
              style={{
                width: "54px",
                height: "54px",
                borderRadius: "50%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={icon}
                alt={label}
                style={{ width: "54px", height: "54px", objectFit: "contain" }}
              />
            </div>
            <span style={{ fontSize: "12px", color: "#333", fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── ICO Subscription + Allocation ───────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          padding: "10px 12px 14px",
          background: "#fdf6ee",
        }}
      >
        {/* ICO Subscription */}
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "14px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: "80px",
            cursor: "pointer",
          }}
        >
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#222", lineHeight: 1.35 }}>
              ICO<br />Subscription
            </div>
            <div style={{ fontSize: "11px", color: "#aaa", marginTop: "3px" }}>Support BTC</div>
          </div>
          <img src="/ico/icon-ico-subscription.png" alt="ICO Subscription" style={{ width: "40px", height: "40px", objectFit: "contain" }} />
        </div>

        {/* Allocation */}
        <div
          style={{
            background: "#e8faf5",
            borderRadius: "12px",
            padding: "14px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: "80px",
            cursor: "pointer",
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#222" }}>Allocation</div>
          <img src="/ico/icon-allocation.png" alt="Allocation" style={{ width: "40px", height: "40px", objectFit: "contain" }} />
        </div>
      </div>

      {/* ── Markets ─────────────────────────────────────────────────────────── */}
      <div style={{ background: "#fff", marginTop: "8px", paddingBottom: "90px" }}>
        {/* Header */}
        <div style={{ padding: "14px 16px 0" }}>
          <div style={{ fontSize: "17px", fontWeight: 700, color: "#111", marginBottom: "10px" }}>Markets</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 88px 1fr",
              paddingBottom: "8px",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <span style={{ fontSize: "12px", color: "#999" }}>Symbol</span>
            <span style={{ fontSize: "12px", color: "#999", textAlign: "center" }}>Chart</span>
            <span style={{ fontSize: "12px", color: "#999", textAlign: "right", lineHeight: 1.3 }}>
              Price<br />24H Change
            </span>
          </div>
        </div>

        {/* Rows */}
        <div style={{ padding: "0 16px" }}>
          {markets.map((row) => {
            const isPositive = row.change >= 0;
            const changeColor = isPositive ? "#22c55e" : "#ef4444";
            const changeStr = (isPositive ? "+" : "") + row.change.toFixed(2) + "%";
            return (
              <div
                key={row.pair}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.1fr 88px 1fr",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid #f9f9f9",
                  cursor: "pointer",
                }}
              >
                {/* Logo + Symbol */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <img
                    src={row.logo}
                    alt={row.display}
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      objectFit: "contain",
                      background: "#f5f5f5",
                      padding: "2px",
                      flexShrink: 0,
                    }}
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      const sym = SYMBOLS.find(s => s.display === row.display);
                      if (sym && img.src !== window.location.origin + sym.fallback) {
                        img.src = sym.fallback;
                      }
                    }}
                  />
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#111" }}>{row.display}</span>
                </div>

                {/* Sparkline */}
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Sparkline data={row.sparkline} isPositive={isPositive} />
                </div>

                {/* Price + Change */}
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#111" }}>${row.price}</div>
                  <div style={{ fontSize: "11px", color: changeColor, marginTop: "2px" }}>{changeStr}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
};

export default MobileICO;
