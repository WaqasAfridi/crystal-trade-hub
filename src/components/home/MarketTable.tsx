import { Link } from "react-router-dom";
import { useState, useRef, useCallback, useEffect } from "react";

const SYMBOLS = [
  { pair: "BTC/USDT",  symbol: "BTCUSDT",  icon: "/crypto-logos/btc.svg"  },
  { pair: "ETH/USDT",  symbol: "ETHUSDT",  icon: "/crypto-logos/eth.svg"  },
  { pair: "BNB/USDT",  symbol: "BNBUSDT",  icon: "/crypto-logos/bnb.svg"  },
  { pair: "NEO/USDT",  symbol: "NEOUSDT",  icon: "/crypto-logos/neo.svg"  },
  { pair: "LTC/USDT",  symbol: "LTCUSDT",  icon: "/crypto-logos/ltc.svg"  },
  { pair: "XRP/USDT",  symbol: "XRPUSDT",  icon: "/crypto-logos/xrp.svg"  },
  { pair: "QTUM/USDT", symbol: "QTUMUSDT", icon: "/crypto-logos/qtum.svg" },
  { pair: "IOTA/USDT", symbol: "IOTAUSDT", icon: "/crypto-logos/iota.svg" },
];

interface CoinRow {
  no: number;
  pair: string;
  icon: string;
  price: string;
  change: string;
  changePositive: boolean;
  data: number[];
}

// ── Binance public endpoints (no API key needed) ─────────────────────────────
async function fetchTicker(symbol: string) {
  const res = await fetch(
    `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
  );
  return res.json();
}

async function fetchKlines(symbol: string): Promise<number[]> {
  const res = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=30`
  );
  const data = await res.json();
  // close price is index 4 in each kline array
  return data.map((k: string[]) => parseFloat(k[4]));
}

function formatPrice(p: string): string {
  const n = parseFloat(p);
  if (n >= 1000) return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 1 });
  if (n >= 1)    return "$" + n.toFixed(2);
  return "$" + n.toFixed(4);
}

function formatChange(p: string): { label: string; positive: boolean } {
  const n = parseFloat(p);
  const positive = n >= 0;
  return { label: (positive ? "+" : "") + n.toFixed(3) + "%", positive };
}

// ── Sparkline path builder ────────────────────────────────────────────────────
function buildPath(data: number[], w: number, h: number): string {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 3;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: pad + ((max - v) / range) * (h - pad * 2),
  }));
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const pr = pts[i - 1], cu = pts[i];
    const cx = (pr.x + cu.x) / 2;
    d += ` C${cx},${pr.y} ${cx},${cu.y} ${cu.x},${cu.y}`;
  }
  return d;
}

// ── Interactive sparkline ─────────────────────────────────────────────────────
const InteractiveSparkline = ({ data, positive }: { data: number[]; positive: boolean }) => {
  const W = 130, H = 36;
  const color = positive ? "#00ff88" : "#ff4d4d";
  const [hX, setHX] = useState<number | null>(null);
  const [hY, setHY] = useState<number | null>(null);
  const [hVal, setHVal] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const linePath = buildPath(data, W, H);
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pad = 3;
  const midY = pad + ((max - (min + range / 2)) / range) * (H - pad * 2);
  const id = `sp${data[0].toFixed(0)}${data.length}`;

  const onMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.max(0, Math.min(data.length - 1, Math.round((x / W) * (data.length - 1))));
    const val = data[idx];
    setHX((idx / (data.length - 1)) * W);
    setHY(pad + ((max - val) / range) * (H - pad * 2));
    setHVal(val);
  }, [data, max, range]);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg
        ref={svgRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`}
        fill="none" xmlns="http://www.w3.org/2000/svg"
        onMouseMove={onMove} onMouseLeave={() => { setHX(null); setHY(null); setHVal(null); }}
        style={{ cursor: "crosshair", display: "block" }}
      >
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <filter id={`${id}f`} x="-20%" y="-60%" width="140%" height="220%">
            <feGaussianBlur stdDeviation="1.4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Area fill */}
        <path d={linePath + ` L${W},${H} L0,${H} Z`} fill={`url(#${id}g)`} />

        {/* Dashed midline */}
        <line x1="0" y1={midY} x2={W} y2={midY}
          stroke={color} strokeWidth="0.6" strokeDasharray="3 3" strokeOpacity="0.35" />

        {/* Glowing line */}
        <path d={linePath} stroke={color} strokeWidth="1.6" fill="none"
          strokeLinecap="round" strokeLinejoin="round" filter={`url(#${id}f)`} />

        {/* Hover cursor */}
        {hX !== null && hY !== null && (
          <>
            <line x1={hX} y1={0} x2={hX} y2={H}
              stroke={color} strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="2 2" />
            <circle cx={hX} cy={hY} r="3" fill={color} />
            <circle cx={hX} cy={hY} r="5" fill={color} fillOpacity="0.2" />
          </>
        )}
      </svg>

      {/* Tooltip */}
      {hX !== null && hVal !== null && (
        <div style={{
          position: "absolute", top: -26,
          left: Math.min(hX - 22, W - 52),
          background: "#0d1117",
          border: `1px solid ${color}44`,
          borderRadius: 4, padding: "2px 6px",
          fontSize: 11, color, whiteSpace: "nowrap",
          pointerEvents: "none",
          boxShadow: `0 0 8px ${color}25`,
        }}>
          {hVal >= 1000
            ? "$" + hVal.toLocaleString("en-US", { maximumFractionDigits: 1 })
            : "$" + hVal.toFixed(hVal >= 1 ? 3 : 5)}
        </div>
      )}
    </div>
  );
};

const CoinIcon = ({ src, pair }: { src: string; pair: string }) => (
  <img src={src} alt={pair}
    onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.4"; }}
    className="w-8 h-8 object-contain flex-shrink-0" />
);

// ── Main component ────────────────────────────────────────────────────────────
const MarketTable = () => {
  const [rows, setRows] = useState<CoinRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const results = await Promise.all(
        SYMBOLS.map(async ({ pair, symbol, icon }, i) => {
          const [ticker, klines] = await Promise.all([
            fetchTicker(symbol),
            fetchKlines(symbol),
          ]);
          const { label: change, positive: changePositive } = formatChange(ticker.priceChangePercent);
          return {
            no: i + 1,
            pair,
            icon,
            price: formatPrice(ticker.lastPrice),
            change,
            changePositive,
            data: klines,
          } as CoinRow;
        })
      );
      setRows(results);
    } catch (err) {
      console.error("Binance fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30_000);
    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <section className="pt-36 pb-24 bg-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Markets</h2>
          <p className="text-base text-muted-foreground">
            The global cryptocurrency trading market supports multi-currency transactions, offering both safety and efficiency.
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <colgroup>
              <col style={{ width: "6%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "24%" }} />
              <col style={{ width: "12%" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-sm font-medium text-white">NO</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-white">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-white">Price</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-white">24h Change</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-white">Chart</th>
                <th className="text-right py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/[0.06]">
                      <td className="py-3 px-4"><div className="h-4 w-4 bg-white/10 rounded animate-pulse" /></td>
                      <td className="py-3 px-4"><div className="h-4 w-28 bg-white/10 rounded animate-pulse" /></td>
                      <td className="py-3 px-4"><div className="h-4 w-20 bg-white/10 rounded animate-pulse" /></td>
                      <td className="py-3 px-4"><div className="h-4 w-16 bg-white/10 rounded animate-pulse" /></td>
                      <td className="py-3 px-4"><div className="h-4 w-28 bg-white/10 rounded animate-pulse" /></td>
                      <td className="py-3 px-4" />
                    </tr>
                  ))
                : rows.map((coin) => (
                    <tr key={coin.pair}
                      className="border-b border-white/[0.06] hover:bg-white/[0.025] transition-colors">
                      <td className="py-3 px-4 text-sm text-white font-medium">{coin.no}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <CoinIcon src={coin.icon} pair={coin.pair} />
                          <span className="font-medium text-foreground text-sm">{coin.pair}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground font-medium">{coin.price}</td>
                      <td className="py-3 px-4 text-sm font-semibold" style={{
                        color: coin.changePositive ? "#00ff88" : "#ff4d4d",
                        textShadow: coin.changePositive
                          ? "0 0 8px rgba(0,255,136,0.5)"
                          : "0 0 8px rgba(255,77,77,0.5)",
                      }}>
                        {coin.change}
                      </td>
                      <td className="py-3 px-4">
                        <InteractiveSparkline data={coin.data} positive={coin.changePositive} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link to="/spot/crypto"
                          className="text-xs px-4 py-1.5 rounded font-medium transition-colors"
                          style={{
                            background: "#1a1f2a",
                            color: "#e2e8f0",
                            border: "1px solid rgba(255,255,255,0.12)",
                          }}>
                          Trade
                        </Link>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* View more */}
        <div className="mt-5">
          <Link to="/market"
            className="text-sm text-foreground underline underline-offset-2 hover:text-primary transition-colors">
            View more
          </Link>
        </div>

      </div>
    </section>
  );
};

export default MarketTable;
