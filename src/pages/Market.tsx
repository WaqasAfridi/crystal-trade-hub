import { useState, useEffect } from "react";
import { Star, Search } from "lucide-react";
import { Link } from "react-router-dom";

// ── Crypto pairs ──────────────────────────────────────────────────────────────
const CRYPTO_PAIRS = [
  { symbol: "BTCUSDT",  label: "BTC/USDT",  id: "btc"  },
  { symbol: "ETHUSDT",  label: "ETH/USDT",  id: "eth"  },
  { symbol: "BNBUSDT",  label: "BNB/USDT",  id: "bnb"  },
  { symbol: "NEOUSDT",  label: "NEO/USDT",  id: "neo"  },
  { symbol: "LTCUSDT",  label: "LTC/USDT",  id: "ltc"  },
  { symbol: "XRPUSDT",  label: "XRP/USDT",  id: "xrp"  },
  { symbol: "QTUMUSDT", label: "QTUM/USDT", id: "qtum" },
  { symbol: "IOTAUSDT", label: "IOTA/USDT", id: "iota" },
];

// ── US stock list ─────────────────────────────────────────────────────────────
const STOCK_LIST = [
  { symbol: "AAPL", domain: "apple.com"     },
  { symbol: "LLY",  domain: "lilly.com"     },
  { symbol: "AMZN", domain: "amazon.com"    },
  { symbol: "COST", domain: "costco.com"    },
  { symbol: "WMT",  domain: "walmart.com"   },
  { symbol: "NVDA", domain: "nvidia.com"    },
  { symbol: "META", domain: "meta.com"      },
  { symbol: "MSFT", domain: "microsoft.com" },
  { symbol: "SCTL", domain: ""              },
  { symbol: "CLRO", domain: ""              },
];

// ── Sparkline SVG ─────────────────────────────────────────────────────────────
const Sparkline = ({ data, positive }: { data: number[]; positive: boolean }) => {
  const clean = (data ?? []).filter(v => v != null && !isNaN(v));
  if (clean.length < 2) return <div style={{ width: 80, height: 32 }} />;
  const min = Math.min(...clean);
  const max = Math.max(...clean);
  const range = max - min || 1;
  const W = 80, H = 30;
  const pts = clean
    .map((v, i) => `${(i / (clean.length - 1)) * W},${H - ((v - min) / range) * (H - 2) - 1}`)
    .join(" ");
  const color = positive ? "#22c55e" : "#ef4444";
  const uid = `grad-${positive ? "g" : "r"}-${Math.random().toString(36).slice(2,7)}`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0"    />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${pts} ${W},${H}`} fill={`url(#${uid})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
};

// ── No-data illustration ──────────────────────────────────────────────────────
const NoData = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 12 }}>
    <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
      <ellipse cx="20" cy="62" rx="11" ry="11" stroke="#d1d5db" strokeWidth="1.5"/>
      <ellipse cx="68" cy="20" rx="9"  ry="9"  stroke="#d1d5db" strokeWidth="1.5"/>
      <rect x="27" y="26" width="38" height="46" rx="3" stroke="#d1d5db" strokeWidth="1.5"/>
      <line x1="34" y1="38" x2="58" y2="38" stroke="#d1d5db" strokeWidth="1.5"/>
      <line x1="34" y1="46" x2="58" y2="46" stroke="#d1d5db" strokeWidth="1.5"/>
      <line x1="34" y1="54" x2="48" y2="54" stroke="#d1d5db" strokeWidth="1.5"/>
    </svg>
    <span style={{ color: "#9ca3af", fontSize: 14 }}>No Data</span>
  </div>
);

// ── Format helpers ────────────────────────────────────────────────────────────
const fmtPrice = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: n < 1 ? 4 : 2 });

const fmtK = (n: number) =>
  (n / 1000).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "K";

// ── Types ─────────────────────────────────────────────────────────────────────
interface CryptoRow {
  label: string; id: string;
  price: number; change: number; high: number; low: number;
  vol: number; turnover: number; sparkline: number[];
}
interface StockRow {
  symbol: string; domain: string;
  price: number; change: number; high: number; low: number;
  sparkline: number[];
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const TH: React.CSSProperties = {
  textAlign: "left", padding: "13px 14px", fontSize: 12.5,
  color: "#6b7280", fontWeight: 500, whiteSpace: "nowrap",
  borderBottom: "1px solid #e5e7eb", background: "#fff",
};
const TD: React.CSSProperties = { padding: "11px 14px", fontSize: 13, color: "#111827" };
const TRADE_BTN: React.CSSProperties = {
  border: "1px solid #111827", borderRadius: 999,
  padding: "4px 18px", fontSize: 12, color: "#111827",
  textDecoration: "none", whiteSpace: "nowrap", display: "inline-block",
};

// ── Main component ────────────────────────────────────────────────────────────
const tabs = ["Watchlists", "Crypto", "US stocks", "FX"];

const Market = () => {
  const [activeTab, setActiveTab]   = useState("Watchlists");
  const [search,    setSearch]      = useState("");
  const [cryptoRows, setCryptoRows] = useState<CryptoRow[]>([]);
  const [stockRows,  setStockRows]  = useState<StockRow[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [watchlist,  setWatchlist]  = useState<Set<string>>(new Set());

  const toggleWatch = (key: string) =>
    setWatchlist(prev => { const s = new Set(prev); s.has(key) ? s.delete(key) : s.add(key); return s; });

  // ── fetch crypto ──────────────────────────────────────────────────────────
  const loadCrypto = async () => {
    const symbols = CRYPTO_PAIRS.map(p => p.symbol);
    const [tickerRes, ...klineResArr] = await Promise.all([
      fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(symbols)}`),
      ...CRYPTO_PAIRS.map(p =>
        fetch(`https://api.binance.com/api/v3/klines?symbol=${p.symbol}&interval=1h&limit=24`)
      ),
    ]);
    const tickers: any[] = await tickerRes.json();
    const klines = await Promise.all(klineResArr.map(r => r.json().catch(() => [])));
    const rows: CryptoRow[] = tickers.map((t: any, i) => ({
      label:     CRYPTO_PAIRS[i].label,
      id:        CRYPTO_PAIRS[i].id,
      price:     parseFloat(t.lastPrice),
      change:    parseFloat(t.priceChangePercent),
      high:      parseFloat(t.highPrice),
      low:       parseFloat(t.lowPrice),
      vol:       parseFloat(t.volume),
      turnover:  parseFloat(t.quoteVolume),
      sparkline: (klines[i] as any[]).map((k: any) => parseFloat(k[4])),
    }));
    setCryptoRows(rows);
  };

  // ── fetch stocks (via CORS proxy → Yahoo Finance) ─────────────────────────
  const loadStocks = async () => {
    const proxy = (url: string) =>
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

    const syms = STOCK_LIST.map(s => s.symbol).join(",");

    const [quoteData, ...chartDataArr] = await Promise.all([
      fetch(proxy(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${syms}`))
        .then(r => r.json())
        .catch(() => ({})),
      ...STOCK_LIST.map(s =>
        fetch(proxy(`https://query1.finance.yahoo.com/v8/finance/chart/${s.symbol}?interval=1h&range=1d`))
          .then(r => r.json())
          .then(d => (d?.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? []) as number[])
          .catch(() => [] as number[])
      ),
    ]);

    const quotes: any[] = (quoteData as any)?.quoteResponse?.result ?? [];
    const rows: StockRow[] = STOCK_LIST.map((s, i) => {
      const q = quotes.find((q: any) => q.symbol === s.symbol) ?? {};
      return {
        symbol:    s.symbol,
        domain:    s.domain,
        price:     q.regularMarketPrice ?? 0,
        change:    q.regularMarketChangePercent ?? 0,
        high:      q.regularMarketDayHigh ?? 0,
        low:       q.regularMarketDayLow ?? 0,
        sparkline: chartDataArr[i] as number[],
      };
    });
    setStockRows(rows);
  };

  useEffect(() => {
    if (activeTab === "Crypto")     { setLoading(true); loadCrypto().finally(() => setLoading(false)); }
    if (activeTab === "US stocks")  { setLoading(true); loadStocks().finally(() => setLoading(false)); }
  }, [activeTab]);

  const filteredCrypto = cryptoRows.filter(r => r.label.toLowerCase().includes(search.toLowerCase()));
  const filteredStocks = stockRows.filter(r  => r.symbol.toLowerCase().includes(search.toLowerCase()));

  const CoinIcon = ({ id, size = 26 }: { id: string; size?: number }) => (
    <img src={`https://assets.coincap.io/assets/icons/${id}@2x.png`} alt={id}
      width={size} height={size} style={{ borderRadius: "50%", flexShrink: 0 }}
      onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${id.toUpperCase()}&background=555&color=fff&size=${size}&bold=true`; }}
    />
  );

  const BrandIcon = ({ domain, symbol, size = 26 }: { domain: string; symbol: string; size?: number }) =>
    domain ? (
      <img src={`https://logo.clearbit.com/${domain}`} alt={symbol}
        width={size} height={size} style={{ borderRadius: "50%", flexShrink: 0 }}
        onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${symbol}&background=374151&color=fff&size=${size}&bold=true`; }}
      />
    ) : (
      <div style={{ width: size, height: size, borderRadius: "50%", background: "#374151", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 700, flexShrink: 0 }}>
        {symbol.slice(0, 2)}
      </div>
    );

  const StarBtn = ({ id }: { id: string }) => (
    <Star size={15} style={{ cursor: "pointer", flexShrink: 0, color: watchlist.has(id) ? "#f59e0b" : "#d1d5db" }}
      fill={watchlist.has(id) ? "#f59e0b" : "none"} onClick={() => toggleWatch(id)} />
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6fa" }}>
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 24px 40px" }}>

        {/* ── Tabs + Search ──────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "22px 0 0", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", gap: 28 }}>
            {tabs.map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); setSearch(""); }}
                style={{
                  paddingBottom: 12, fontSize: 14, fontWeight: activeTab === tab ? 600 : 400,
                  color: activeTab === tab ? "#111827" : "#9ca3af",
                  background: "none", border: "none",
                  borderBottom: activeTab === tab ? "2px solid #111827" : "2px solid transparent",
                  cursor: "pointer", transition: "color .15s",
                }}
              >{tab}</button>
            ))}
          </div>
          <div style={{ position: "relative", paddingBottom: 10 }}>
            <Search style={{ position: "absolute", left: 10, top: "40%", transform: "translateY(-50%)", width: 14, height: 14, color: "#9ca3af" }} />
            <input placeholder="Search" value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 6, paddingBottom: 6, width: 210, border: "1px solid #e5e7eb", borderRadius: 20, fontSize: 13, color: "#374151", outline: "none", background: "#fff" }}
            />
          </div>
        </div>

        {/* ── Table container ────────────────────────────────────────────── */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderTop: "none", marginBottom: 24, overflowX: "auto" }}>

          {/* Watchlists */}
          {activeTab === "Watchlists" && (
            <><table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["Name","Price","24h Change","24h High","24h Low","Action"].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
            </table><NoData /></>
          )}

          {/* FX */}
          {activeTab === "FX" && (
            <><table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["Name","Price","24h Change","24h High","24h Low","Chart","Action"].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
            </table><NoData /></>
          )}

          {/* Crypto */}
          {activeTab === "Crypto" && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["Name","Price","24h Change","24h High","24h Low","24h Vol","24h Turnover","Chart","Action"].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
              <tbody>
                {loading && cryptoRows.length === 0
                  ? <tr><td colSpan={9} style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>Loading…</td></tr>
                  : filteredCrypto.map(row => (
                  <tr key={row.label} style={{ borderBottom: "1px solid #f3f4f6" }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#fafafa"}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}>
                    <td style={TD}><div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <StarBtn id={row.label} /><CoinIcon id={row.id} />
                      <span style={{ fontWeight:500 }}>{row.label}</span>
                    </div></td>
                    <td style={TD}>$ {fmtPrice(row.price)}</td>
                    <td style={{ ...TD, color: row.change >= 0 ? "#22c55e" : "#ef4444" }}>
                      {row.change >= 0 ? "+" : ""}{row.change.toFixed(2)}%
                    </td>
                    <td style={TD}>$ {fmtPrice(row.high)}</td>
                    <td style={TD}>$ {fmtPrice(row.low)}</td>
                    <td style={TD}>{fmtK(row.vol)} {row.id.toUpperCase()}</td>
                    <td style={TD}>${fmtK(row.turnover)}</td>
                    <td style={{ ...TD, padding: "6px 14px" }}><Sparkline data={row.sparkline} positive={row.change >= 0} /></td>
                    <td style={TD}><Link to="/spot/crypto" style={TRADE_BTN}>Trade</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* US stocks */}
          {activeTab === "US stocks" && (
            <>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["Name","Price","24h Change","24h High","24h Low","Chart","Action"].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
              <tbody>
                {loading && stockRows.length === 0
                  ? <tr><td colSpan={7} style={{ textAlign:"center", padding:40, color:"#9ca3af" }}>Loading…</td></tr>
                  : filteredStocks.map(row => (
                  <tr key={row.symbol} style={{ borderBottom: "1px solid #f3f4f6" }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#fafafa"}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}>
                    <td style={TD}><div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <StarBtn id={row.symbol} /><BrandIcon domain={row.domain} symbol={row.symbol} />
                      <span style={{ fontWeight:500 }}>{row.symbol}</span>
                    </div></td>
                    <td style={TD}>${row.price > 0 ? fmtPrice(row.price) : "0.00"}</td>
                    <td style={{ ...TD, color: row.change >= 0 ? "#22c55e" : "#ef4444" }}>
                      {row.change >= 0 ? "+" : ""}{row.change.toFixed(2)}%
                    </td>
                    <td style={TD}>${row.high > 0 ? fmtPrice(row.high) : "0.00"}</td>
                    <td style={TD}>${row.low  > 0 ? fmtPrice(row.low)  : "0.00"}</td>
                    <td style={{ ...TD, padding:"6px 14px" }}><Sparkline data={row.sparkline} positive={row.change >= 0} /></td>
                    <td style={TD}><Link to="/spot/crypto" style={TRADE_BTN}>Trade</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && filteredStocks.length === 0 && <NoData />}
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Market;
