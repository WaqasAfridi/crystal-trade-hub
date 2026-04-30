import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Eye, EyeOff, Download, Upload, RefreshCw, Send,
  ChevronDown, Calendar, Loader2, TrendingUp, TrendingDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

/* ─── Tab definitions ─────────────────────────────────────────── */
const TABS = [
  "Overview","Spot Account","Trading Account","Finance Account",
  "Funding Records","History","Financial Records","Exchange History",
  "Commission Record","AI Strategy","Order List",
] as const;
type Tab = (typeof TABS)[number];

const ORDER_SUB_TABS = [
  "Spot Orders","Futures Orders","Options Orders",
];

/* ─── Helpers ─────────────────────────────────────────────────── */
const fmt = (n: number, d = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const fmtDate = (s: string | null | undefined) => {
  if (!s) return "—";
  return new Date(s).toLocaleString();
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    PENDING: "#f59e0b", PROCESSING: "#3b82f6", COMPLETED: "#22c55e",
    APPROVED: "#22c55e", ACTIVE: "#22c55e", FILLED: "#22c55e",
    WIN: "#22c55e", OPEN: "#3b82f6", REDEEMED: "#8b5cf6",
    REJECTED: "#ef4444", FAILED: "#ef4444", CANCELLED: "#6b7280",
    LOSS: "#ef4444",
  };
  const col = map[status] ?? "#888";
  return (
    <span style={{ color: col, background: col + "20", borderRadius: 4, padding: "2px 8px", fontSize: 12, fontWeight: 600 }}>
      {status}
    </span>
  );
};

/* ─── Shared UI pieces ────────────────────────────────────────── */
const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <Loader2 className="w-7 h-7 animate-spin" style={{ color: "#999" }} />
  </div>
);

const NoData = () => (
  <div className="flex flex-col items-center justify-center py-20" style={{ color: "#bbb" }}>
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mb-3 opacity-40">
      <rect x="14" y="10" width="36" height="44" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <line x1="22" y1="24" x2="42" y2="24" stroke="currentColor" strokeWidth="1.5" />
      <line x1="22" y1="32" x2="38" y2="32" stroke="currentColor" strokeWidth="1.5" />
      <line x1="22" y1="40" x2="34" y2="40" stroke="currentColor" strokeWidth="1.5" />
    </svg>
    <span className="text-sm">No Data</span>
  </div>
);

const TH = ({ cols }: { cols: string[] }) => (
  <div className="grid px-6 py-3" style={{ gridTemplateColumns: `repeat(${cols.length}, 1fr)`, background: "#f8f9fa", borderBottom: "1px solid #eee" }}>
    {cols.map(c => <span key={c} className="text-xs font-medium" style={{ color: "#888" }}>{c}</span>)}
  </div>
);

const TR = ({ cells, cols }: { cells: (React.ReactNode)[]; cols: number }) => (
  <div className="grid px-6 py-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, borderBottom: "1px solid #f5f5f5" }}>
    {cells.map((c, i) => <span key={i} className="text-sm" style={{ color: "#333" }}>{c}</span>)}
  </div>
);

/* Date range + filter bar */
const FilterRow = ({
  dateFrom, dateTo, setDateFrom, setDateTo,
  filters, onSearch, onReset,
}: {
  dateFrom: string; dateTo: string;
  setDateFrom: (v: string) => void; setDateTo: (v: string) => void;
  filters: { label: string; value: string; onChange: (v: string) => void; options: string[] }[];
  onSearch: () => void; onReset: () => void;
}) => (
  <div className="flex flex-wrap items-center gap-3 px-6 py-3" style={{ borderBottom: "1px solid #f5f5f5" }}>
    <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm" style={{ border: "1px solid #e5e7eb" }}>
      <Calendar className="w-4 h-4" style={{ color: "#aaa" }} />
      <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
        className="outline-none bg-transparent text-sm" style={{ color: "#555", width: 120 }} />
      <span style={{ color: "#888" }}>to</span>
      <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
        className="outline-none bg-transparent text-sm" style={{ color: "#555", width: 120 }} />
    </div>
    {filters.map(f => (
      <div key={f.label} className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm" style={{ border: "1px solid #e5e7eb" }}>
        <span style={{ color: "#888" }}>{f.label}:</span>
        <select value={f.value} onChange={e => f.onChange(e.target.value)}
          className="outline-none bg-transparent text-sm" style={{ color: "#333" }}>
          {f.options.map(o => <option key={o} value={o}>{o || "All"}</option>)}
        </select>
        <ChevronDown className="w-3 h-3" style={{ color: "#bbb" }} />
      </div>
    ))}
    <button onClick={onSearch} className="px-5 py-2 rounded-lg text-sm font-medium" style={{ background: "#111", color: "#fff" }}>Search</button>
    <button onClick={onReset} className="px-5 py-2 rounded-lg text-sm font-medium" style={{ border: "1px solid #ddd", color: "#555" }}>Reset</button>
  </div>
);

/* Pagination */
const Pager = ({ page, total, pageSize, setPage }: { page: number; total: number; pageSize: number; setPage: (p: number) => void }) => {
  const pages = Math.ceil(total / pageSize) || 1;
  return (
    <div className="flex items-center justify-between px-6 py-3" style={{ borderTop: "1px solid #eee" }}>
      <span className="text-xs" style={{ color: "#999" }}>Total {total} records</span>
      <div className="flex gap-2">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}
          className="px-3 py-1 rounded text-xs" style={{ border: "1px solid #ddd", color: page <= 1 ? "#ccc" : "#333" }}>← Prev</button>
        <span className="px-3 py-1 text-xs" style={{ color: "#555" }}>Page {page} / {pages}</span>
        <button disabled={page >= pages} onClick={() => setPage(page + 1)}
          className="px-3 py-1 rounded text-xs" style={{ border: "1px solid #ddd", color: page >= pages ? "#ccc" : "#333" }}>Next →</button>
      </div>
    </div>
  );
};

/* ─── Donut chart ─────────────────────────────────────────────── */
// Colors exactly matching the screenshot:
// Spot Account   → cyan   #4EC9E1
// Trading Account → teal  #29A5C8
// Finance Account → navy  #1A4FA0
const CHART_COLORS = ["#4EC9E1", "#29A5C8", "#1A4FA0"];

const DonutChart = ({ spotUsd, tradingUsd, financeUsd }: { spotUsd: number; tradingUsd: number; financeUsd: number }) => {
  const allZero = spotUsd === 0 && tradingUsd === 0 && financeUsd === 0;
  const total = allZero ? 1 : spotUsd + tradingUsd + financeUsd;
  const C = 2 * Math.PI * 54; // circumference

  // When all zero show three equal phantom segments so chart looks like screenshot
  const spotDash   = allZero ? C / 3       : (spotUsd / total) * C;
  const tradeDash  = allZero ? C / 3       : (tradingUsd / total) * C;
  const finDash    = allZero ? C / 3       : (financeUsd / total) * C;
  const spotOff    = 0;
  const tradeOff   = -(spotDash);
  const finOff     = -(spotDash + tradeDash);

  const segments = [
    { dash: spotDash,  off: spotOff,  color: CHART_COLORS[0] },
    { dash: tradeDash, off: tradeOff, color: CHART_COLORS[1] },
    { dash: finDash,   off: finOff,   color: CHART_COLORS[2] },
  ];

  const items = [
    { label: "Spot Account",    color: CHART_COLORS[0], val: spotUsd },
    { label: "Trading Account", color: CHART_COLORS[1], val: tradingUsd },
    { label: "Finance Account", color: CHART_COLORS[2], val: financeUsd },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <svg width="180" height="180" viewBox="0 0 180 180" style={{ marginBottom: 24 }}>
        {segments.map((s, i) => (
          <circle key={i} cx="90" cy="90" r="54"
            fill="none" stroke={s.color} strokeWidth="22"
            strokeDasharray={`${s.dash} ${C}`}
            strokeDashoffset={s.off}
            transform="rotate(-90 90 90)"
          />
        ))}
        {/* inner white fill to make it a donut */}
        <circle cx="90" cy="90" r="42" fill="white" />
      </svg>
      <div style={{ width: "100%" }}>
        {items.map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "#555" }}>{item.label}</span>
            </div>
            <span style={{ fontSize: 13, color: "#333", fontWeight: 600 }}>
              {allZero ? "0%" : `${((item.val / (spotUsd + tradingUsd + financeUsd)) * 100).toFixed(0)}%`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════ */
// Fetch real-time USDT prices for a list of symbols from Binance
async function fetchLivePrices(symbols: string[]): Promise<Record<string, number>> {
  const map: Record<string, number> = {};
  if (!symbols.length) return map;
  try {
    const unique = [...new Set(symbols.map(s => s.toUpperCase()))];
    const pairs = unique.filter(s => s !== "USDT").map(s => `\"${s}USDT\"`).join(",");
    const url = `https://api.binance.com/api/v3/ticker/price?symbols=[${pairs}]`;
    const res = await fetch(url);
    if (!res.ok) return map;
    const data: { symbol: string; price: string }[] = await res.json();
    data.forEach(d => {
      const base = d.symbol.replace("USDT", "");
      map[base] = parseFloat(d.price);
    });
    map["USDT"] = 1;
  } catch { /* ignore */ }
  return map;
}

const OverviewPage = () => {
  const location = useLocation();
  const { token } = useAuth();

  const getTabFromPath = (): Tab => {
    const map: Record<string, Tab> = {
      "/assets/overview": "Overview",
      "/assets/spot": "Spot Account",
      "/assets/trading": "Trading Account",
      "/assets/finance": "Finance Account",
      "/assets/funding-records": "Funding Records",
      "/assets/history": "History",
      "/assets/financial-records": "Financial Records",
      "/assets/exchange-history": "Exchange History",
      "/assets/commission-record": "Commission Record",
      "/assets/ai-strategy": "AI Strategy",
      "/assets/order-list": "Order List",
    };
    return map[location.pathname] || "Overview";
  };

  const [activeTab, setActiveTab] = useState<Tab>(getTabFromPath);
  const [orderSubTab, setOrderSubTab] = useState("Spot Orders");
  const [hideBalance, setHideBalance] = useState(false);
  // Real-time prices: symbol → USDT price
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});

  useEffect(() => { setActiveTab(getTabFromPath()); }, [location.pathname]);

  /* ── Shared date/filter state ───────────────────── */
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const resetFilters = () => { setDateFrom(""); setDateTo(""); setTypeFilter(""); setStatusFilter(""); setPage(1); };

  /* ── Data state ─────────────────────────────────── */
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState<any>(null);
  // After wallets load, fetch live Binance prices for all symbols
  useEffect(() => {
    const allWallets: any[] = [
      ...(wallets?.SPOT ?? []),
      ...(wallets?.FUTURES ?? []),
      ...(wallets?.EARN ?? []),
    ];
    const symbols = allWallets.map((w: any) => w.symbol).filter(Boolean);
    if (symbols.length) {
      fetchLivePrices(symbols).then(setLivePrices);
    }
  }, [wallets]);

  // Compute USDT value of a wallet using live Binance price (fallback to priceUsd)
  const walletUsdt = (w: any) => {
    const price = livePrices[w.symbol] ?? w.priceUsd ?? 0;
    return (w.balance + (w.locked ?? 0)) * (w.symbol === "USDT" ? 1 : price);
  };

  const [deposits, setDeposits] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any>(null);
  const [transfers, setTransfers] = useState<any>(null);
  const [conversions, setConversions] = useState<any>(null);
  const [earnSubs, setEarnSubs] = useState<any[]>([]);
  const [financeSubs, setFinanceSubs] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any>(null);
  const [spotOrders, setSpotOrders] = useState<any[]>([]);
  const [futuresOrders, setFuturesOrders] = useState<any[]>([]);
  const [optionsOrders, setOptionsOrders] = useState<any[]>([]);

  /* ── Fetch helpers ──────────────────────────────── */
  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      if (activeTab === "Overview" || activeTab === "Spot Account" || activeTab === "Trading Account" || activeTab === "Finance Account") {
        const w: any = await api.get("/wallets/by-account", token);
        setWallets(w);
      }
      if (activeTab === "Funding Records") {
        const params = new URLSearchParams({ page: String(page), pageSize: "20" });
        if (typeFilter) params.set("type", typeFilter);
        const d: any = await api.get(`/transfers?${params}`, token);
        setTransfers(d);
      }
      if (activeTab === "History") {
        const params = new URLSearchParams({ page: String(page), pageSize: "20" });
        if (statusFilter) params.set("status", statusFilter);
        if (typeFilter === "Deposit" || typeFilter === "") {
          const d: any = await api.get(`/deposits?${params}`, token);
          setDeposits(d);
        }
        if (typeFilter === "Withdraw" || typeFilter === "") {
          const w: any = await api.get(`/withdrawals?${params}`, token);
          setWithdrawals(w);
        }
      }
      if (activeTab === "Financial Records") {
        const [e, f]: any[] = await Promise.all([
          api.get("/earn/my-subscriptions", token),
          api.get("/finance/my-subscriptions", token),
        ]);
        setEarnSubs(Array.isArray(e) ? e : []);
        setFinanceSubs(Array.isArray(f) ? f : []);
      }
      if (activeTab === "Exchange History") {
        const params = new URLSearchParams({ page: String(page), pageSize: "20" });
        const c: any = await api.get(`/conversions?${params}`, token);
        setConversions(c);
      }
      if (activeTab === "Commission Record") {
        const r: any = await api.get("/referrals", token);
        setReferrals(r);
      }
      if (activeTab === "AI Strategy") {
        const e: any = await api.get("/earn/my-subscriptions", token);
        setEarnSubs(Array.isArray(e) ? e : []);
      }
      if (activeTab === "Order List") {
        const [so, fo, oo]: any[] = await Promise.all([
          api.get("/trading/spot/orders", token),
          api.get("/trading/futures/orders", token),
          api.get("/trading/options/orders", token),
        ]);
        setSpotOrders(Array.isArray(so) ? so : []);
        setFuturesOrders(Array.isArray(fo) ? fo : []);
        setOptionsOrders(Array.isArray(oo) ? oo : []);
      }
    } catch { /* silent */ }
    setLoading(false);
  }, [activeTab, token, page, typeFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [activeTab]);

  /* ── Derived values using live prices ──────────── */
  const spotWallets: any[] = wallets?.SPOT ?? [];
  const tradingWallets: any[] = wallets?.FUTURES ?? [];
  const financeWallets: any[] = wallets?.EARN ?? [];
  const spotUsd    = spotWallets.reduce((s: number, w: any) => s + walletUsdt(w), 0);
  const tradingUsd = tradingWallets.reduce((s: number, w: any) => s + walletUsdt(w), 0);
  const financeUsd = financeWallets.reduce((s: number, w: any) => s + walletUsdt(w), 0);
  const totalUsd   = spotUsd + tradingUsd + financeUsd;

  /* ── Balance header card — matches screenshot exactly ── */
  // accountUsd: the balance to show for this specific account card (null = show total)
  // convertAccount: the API accountType to pre-select on the Convert page (undefined = show selector)
  const BalanceCard = ({ accountUsd, convertAccount, transferAccount }: { accountUsd?: number; convertAccount?: "SPOT" | "FUTURES" | "EARN"; transferAccount?: "SPOT" | "FUTURES" | "EARN" }) => {
    const displayUsdt = accountUsd ?? totalUsd;
    const convertHref = convertAccount
      ? `/assets/convert?account=${convertAccount}`
      : "/assets/convert";
    const transferHref = transferAccount
      ? `/assets/transfer?from=${transferAccount}`
      : "/assets/transfer";
    const buttons = [
      { label: "Deposit",  icon: Download, href: "/recharge"  },
      { label: "Withdraw", icon: Upload,   href: "/withdraw"  },
      { label: "Convert",  icon: RefreshCw, href: convertHref },
      { label: "Transfer", icon: Send,     href: transferHref },
    ];
    return (
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: "24px 28px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          {/* Left: balance */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "#888" }}>Account Balance</span>
              <button onClick={() => setHideBalance(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 0 }}>
                {hideBalance
                  ? <EyeOff style={{ width: 16, height: 16, color: "#aaa" }} />
                  : <Eye    style={{ width: 16, height: 16, color: "#aaa" }} />}
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 30, fontWeight: 700, color: "#111", letterSpacing: "-0.5px" }}>
                {hideBalance ? "••••••" : fmt(displayUsdt, 2)}
              </span>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#333" }}>USDT</span>
            </div>
            <p style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>
              {hideBalance ? "≈$••••••" : `≈${fmt(displayUsdt, 2)}`}
            </p>
          </div>
          {/* Right: action buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {buttons.map(btn => (
              <Link key={btn.label} to={btn.href}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px",
                  borderRadius: 999, border: "1px solid #ddd", color: "#333", fontSize: 13,
                  textDecoration: "none", whiteSpace: "nowrap" }}>
                <btn.icon style={{ width: 14, height: 14 }} />
                {btn.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* ── Wallet table ───────────────────────────────── */
  const WalletTable = ({ items }: { items: any[] }) => {
    if (!items.length) return <NoData />;
    return (
      <>
        <TH cols={["Asset", "Balance", "Locked", "Value (USDT, live)", "Action"]} />
        {items.map((w: any) => {
          const liveVal = walletUsdt(w);
          const livePrice = livePrices[w.symbol] ?? w.priceUsd ?? 0;
          return (
            <TR key={w.symbol} cols={5} cells={[
              <div className="flex items-center gap-2">
                {w.iconUrl
                  ? <img src={w.iconUrl} className="w-6 h-6 rounded-full" alt={w.symbol} />
                  : <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">{w.symbol?.[0]}</div>}
                <span className="font-medium" style={{ color: "#111" }}>{w.symbol}</span>
                <span className="text-xs" style={{ color: "#aaa" }}>{w.name}</span>
              </div>,
              <span className="font-mono">{fmt(w.balance, 6)}</span>,
              <span className="font-mono text-orange-500">{fmt(w.locked ?? 0, 6)}</span>,
              <div>
                <span className="font-semibold">{fmt(liveVal, 2)} USDT</span>
                {w.symbol !== "USDT" && livePrice > 0 && (
                  <span className="block text-xs" style={{ color: "#aaa" }}>1 {w.symbol} = {fmt(livePrice, 2)} USDT</span>
                )}
              </div>,
              <div className="flex gap-2">
                <Link to="/recharge" className="text-xs px-2 py-1 rounded font-medium" style={{ background: "#22c55e20", color: "#16a34a" }}>Deposit</Link>
                <Link to="/assets/transfer" className="text-xs px-2 py-1 rounded font-medium" style={{ background: "#3b82f620", color: "#2563eb" }}>Transfer</Link>
              </div>,
            ]} />
          );
        })}
      </>
    );
  };

  /* ── Date filter helper ─────────────────────────── */
  const inRange = (dateStr: string) => {
    if (!dateFrom && !dateTo) return true;
    const d = new Date(dateStr).getTime();
    const from = dateFrom ? new Date(dateFrom).getTime() : 0;
    const to = dateTo ? new Date(dateTo).setHours(23, 59, 59, 999) : Infinity;
    return d >= from && d <= to;
  };

  /* ── Render tab content ─────────────────────────── */
  const renderContent = () => {
    if (loading) return <Spinner />;

    switch (activeTab) {

      /* ── OVERVIEW ─────────────────────────────── */
      case "Overview":
        return (
          <>
            <BalanceCard accountUsd={totalUsd} />
            <div className="flex gap-6 flex-wrap lg:flex-nowrap">
              {/* Asset Distribution */}
              <div className="flex-1 rounded-2xl p-6 min-w-0" style={{ border: "1px solid #e5e7eb" }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: "#111" }}>Asset Distribution</h3>
                <div className="grid mb-3 pb-2" style={{ gridTemplateColumns: "2fr 1fr 1fr", borderBottom: "1px solid #eee" }}>
                  {["Wallet", "Balance (USD)", "Action"].map(h =>
                    <span key={h} className="text-xs font-medium pb-2" style={{ color: "#888" }}>{h}</span>)}
                </div>
                {[
                  { name: "Spot Account", usd: spotUsd, href: "/assets/spot" },
                  { name: "Trading Account", usd: tradingUsd, href: "/assets/trading" },
                  { name: "Finance Account", usd: financeUsd, href: "/assets/finance" },
                ].map(row => (
                  <div key={row.name} className="grid py-3" style={{ gridTemplateColumns: "2fr 1fr 1fr", borderBottom: "1px solid #f5f5f5" }}>
                    <span className="text-sm font-medium" style={{ color: "#222" }}>{row.name}</span>
                    <span className="text-sm font-semibold" style={{ color: "#111" }}>
                      {hideBalance ? "••••••" : `$${fmt(row.usd)}`}
                    </span>
                    <div className="flex gap-2">
                      <Link to="/recharge" className="text-xs font-medium" style={{ color: "#22c55e" }}>Deposit</Link>
                      <span style={{ color: "#ccc" }}>/</span>
                      <Link to="/assets/transfer" className="text-xs font-medium" style={{ color: "#333" }}>Transfer</Link>
                    </div>
                  </div>
                ))}
              </div>
              {/* Distribution chart */}
              <div className="w-full lg:w-80 rounded-2xl p-6" style={{ border: "1px solid #e5e7eb" }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: "#111" }}>Distributed</h3>
                <DonutChart spotUsd={spotUsd} tradingUsd={tradingUsd} financeUsd={financeUsd} />
              </div>
            </div>
          </>
        );

      /* ── SPOT ACCOUNT ─────────────────────────── */
      case "Spot Account":
        return (
          <>
            <BalanceCard accountUsd={spotUsd} convertAccount="SPOT" transferAccount="SPOT" />
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
              <div className="px-6 pt-5 pb-2"><h3 className="text-lg font-bold" style={{ color: "#111" }}>Holdings</h3></div>
              <WalletTable items={spotWallets} />
            </div>
          </>
        );

      /* ── TRADING ACCOUNT ──────────────────────── */
      case "Trading Account":
        return (
          <>
            <BalanceCard accountUsd={tradingUsd} convertAccount="FUTURES" transferAccount="FUTURES" />
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
              <div className="px-6 pt-5 pb-2"><h3 className="text-lg font-bold" style={{ color: "#111" }}>Holdings</h3></div>
              <WalletTable items={tradingWallets} />
            </div>
          </>
        );

      /* ── FINANCE ACCOUNT ──────────────────────── */
      case "Finance Account":
        return (
          <>
            <BalanceCard accountUsd={financeUsd} convertAccount="EARN" transferAccount="EARN" />
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
              <div className="px-6 pt-5 pb-2 flex items-center justify-between">
                <h3 className="text-lg font-bold" style={{ color: "#111" }}>Holdings (Earn/Staking)</h3>
                <button onClick={() => setActiveTab("Financial Records")}
                  className="px-4 py-2 rounded-full text-xs" style={{ border: "1px solid #ddd", color: "#555" }}>
                  Financial Records
                </button>
              </div>
              <WalletTable items={financeWallets} />
            </div>
          </>
        );

      /* ── FUNDING RECORDS ──────────────────────── */
      case "Funding Records": {
        const rows: any[] = (transfers?.items ?? []).filter((t: any) => inRange(t.createdAt));
        return (
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
            <FilterRow
              dateFrom={dateFrom} dateTo={dateTo} setDateFrom={setDateFrom} setDateTo={setDateTo}
              filters={[{ label: "Type", value: typeFilter, onChange: setTypeFilter, options: ["", "SPOT", "FUTURES", "EARN", "FUNDING"] }]}
              onSearch={() => load()} onReset={resetFilters}
            />
            <TH cols={["Type", "Currency", "Amount", "From Account", "To Account", "Date", "Status"]} />
            {rows.length === 0 ? <NoData /> : rows.map((t: any) => (
              <TR key={t.id} cols={7} cells={[
                <span className="capitalize">{t.fromAccount} → {t.toAccount}</span>,
                <span className="font-semibold">{t.currencySymbol}</span>,
                <span className="font-mono text-blue-600">+{fmt(t.amount)}</span>,
                <span>{t.fromAccount}</span>,
                <span>{t.toAccount}</span>,
                <span className="text-xs" style={{ color: "#aaa" }}>{fmtDate(t.createdAt)}</span>,
                statusBadge(t.status),
              ]} />
            ))}
            <Pager page={page} total={transfers?.total ?? 0} pageSize={20} setPage={setPage} />
          </div>
        );
      }

      /* ── HISTORY (Deposits + Withdrawals) ─────── */
      case "History": {
        const deps = (deposits?.items ?? []).filter((d: any) => inRange(d.createdAt));
        const wds = (withdrawals?.items ?? []).filter((w: any) => inRange(w.createdAt));
        const rows = typeFilter === "Withdraw"
          ? wds.map((w: any) => ({ ...w, _type: "Withdraw" }))
          : typeFilter === "Deposit"
            ? deps.map((d: any) => ({ ...d, _type: "Deposit" }))
            : [
                ...deps.map((d: any) => ({ ...d, _type: "Deposit" })),
                ...wds.map((w: any) => ({ ...w, _type: "Withdraw" })),
              ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return (
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
            <FilterRow
              dateFrom={dateFrom} dateTo={dateTo} setDateFrom={setDateFrom} setDateTo={setDateTo}
              filters={[
                { label: "Type", value: typeFilter, onChange: setTypeFilter, options: ["", "Deposit", "Withdraw"] },
                { label: "Status", value: statusFilter, onChange: setStatusFilter, options: ["", "PENDING", "PROCESSING", "COMPLETED", "REJECTED", "CANCELLED"] },
              ]}
              onSearch={() => load()} onReset={resetFilters}
            />
            <TH cols={["Order ID", "Type", "Currency", "Amount", "Network", "Date", "Status"]} />
            {rows.length === 0 ? <NoData /> : rows.map((r: any) => (
              <TR key={r.id + r._type} cols={7} cells={[
                <span className="font-mono text-xs" style={{ color: "#aaa" }}>{r.id.slice(0, 12)}…</span>,
                <span style={{ color: r._type === "Deposit" ? "#16a34a" : "#dc2626" }}>{r._type}</span>,
                <span className="font-semibold">{r.currencySymbol}</span>,
                <span className="font-mono">{fmt(r.amount)}</span>,
                <span className="text-xs" style={{ color: "#888" }}>{r.network || "—"}</span>,
                <span className="text-xs" style={{ color: "#aaa" }}>{fmtDate(r.createdAt)}</span>,
                statusBadge(r.status),
              ]} />
            ))}
          </div>
        );
      }

      /* ── FINANCIAL RECORDS ────────────────────── */
      case "Financial Records": {
        const allSubs = [
          ...earnSubs.map((s: any) => ({ ...s, _category: "Earn" })),
          ...financeSubs.map((s: any) => ({ ...s, _category: "Finance" })),
        ].filter((s: any) => !statusFilter || s.status === statusFilter)
         .filter((s: any) => inRange(s.createdAt));

        return (
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
            <FilterRow
              dateFrom={dateFrom} dateTo={dateTo} setDateFrom={setDateFrom} setDateTo={setDateTo}
              filters={[{ label: "Status", value: statusFilter, onChange: setStatusFilter, options: ["", "ACTIVE", "REDEEMED", "CANCELLED"] }]}
              onSearch={() => load()} onReset={resetFilters}
            />
            <TH cols={["Order ID", "Category", "Product", "Amount", "Earnings", "Start Date", "End Date", "Status"]} />
            {allSubs.length === 0 ? <NoData /> : allSubs.map((s: any) => (
              <TR key={s.id} cols={8} cells={[
                <span className="font-mono text-xs" style={{ color: "#aaa" }}>{s.id.slice(0, 12)}…</span>,
                <span className="font-medium">{s._category}</span>,
                <span>{s.product?.name || "—"}</span>,
                <span className="font-mono">{fmt(s.amount)} {s.product?.currencySymbol || "USDT"}</span>,
                <span className="font-mono text-green-600">+{fmt(s.earnedSoFar || 0)}</span>,
                <span className="text-xs" style={{ color: "#aaa" }}>{fmtDate(s.startAt || s.createdAt)}</span>,
                <span className="text-xs" style={{ color: "#aaa" }}>{fmtDate(s.endAt)}</span>,
                statusBadge(s.status),
              ]} />
            ))}
          </div>
        );
      }

      /* ── EXCHANGE HISTORY ─────────────────────── */
      case "Exchange History": {
        const rows: any[] = (conversions?.items ?? []).filter((c: any) => inRange(c.createdAt));
        return (
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
            <FilterRow
              dateFrom={dateFrom} dateTo={dateTo} setDateFrom={setDateFrom} setDateTo={setDateTo}
              filters={[]}
              onSearch={() => load()} onReset={resetFilters}
            />
            <TH cols={["Date", "From", "From Amount", "To", "To Amount", "Rate", "Fee", "Status"]} />
            {rows.length === 0 ? <NoData /> : rows.map((c: any) => (
              <TR key={c.id} cols={8} cells={[
                <span className="text-xs" style={{ color: "#aaa" }}>{fmtDate(c.createdAt)}</span>,
                <span className="font-semibold">{c.fromSymbol}</span>,
                <span className="font-mono text-red-500">-{fmt(c.fromAmount)}</span>,
                <span className="font-semibold">{c.toSymbol}</span>,
                <span className="font-mono text-green-600">+{fmt(c.toAmount)}</span>,
                <span className="text-xs" style={{ color: "#888" }}>{fmt(c.rate, 6)}</span>,
                <span className="text-xs" style={{ color: "#888" }}>{fmt(c.fee, 4)}</span>,
                statusBadge(c.status),
              ]} />
            ))}
            <Pager page={page} total={conversions?.total ?? 0} pageSize={20} setPage={setPage} />
          </div>
        );
      }

      /* ── COMMISSION RECORD ────────────────────── */
      case "Commission Record": {
        const rewards: any[] = (referrals?.recentRewards ?? []).filter((r: any) => inRange(r.createdAt));
        return (
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
            {/* Summary card */}
            <div className="flex gap-4 px-6 py-4 flex-wrap" style={{ borderBottom: "1px solid #f5f5f5" }}>
              {[
                { label: "Total Commission", val: `${fmt(referrals?.totalCommission ?? 0)} USDT`, color: "#16a34a" },
                { label: "Direct Referrals", val: referrals?.directCount ?? 0, color: "#2563eb" },
                { label: "Level 2 Referrals", val: referrals?.level2Count ?? 0, color: "#7c3aed" },
                { label: "Invite Code", val: referrals?.inviteCode ?? "—", color: "#333" },
              ].map(card => (
                <div key={card.label} className="flex-1 min-w-[160px] rounded-xl p-4" style={{ border: "1px solid #eee" }}>
                  <p className="text-xs mb-1" style={{ color: "#888" }}>{card.label}</p>
                  <p className="text-lg font-bold" style={{ color: card.color }}>{card.val}</p>
                </div>
              ))}
            </div>
            <FilterRow
              dateFrom={dateFrom} dateTo={dateTo} setDateFrom={setDateFrom} setDateTo={setDateTo}
              filters={[]}
              onSearch={() => load()} onReset={resetFilters}
            />
            <TH cols={["Date", "Type", "Amount (USDT)", "Currency", "Description"]} />
            {rewards.length === 0 ? <NoData /> : rewards.map((r: any) => (
              <TR key={r.id} cols={5} cells={[
                <span className="text-xs" style={{ color: "#aaa" }}>{fmtDate(r.createdAt)}</span>,
                <span className="font-medium">{r.type}</span>,
                <span className="font-mono text-green-600">+{fmt(r.amount)}</span>,
                <span>{r.currencySymbol}</span>,
                <span className="text-xs" style={{ color: "#888" }}>{r.description || "Referral commission"}</span>,
              ]} />
            ))}
          </div>
        );
      }

      /* ── AI STRATEGY (Earn subscriptions) ─────── */
      case "AI Strategy": {
        const rows = earnSubs.filter((s: any) => !statusFilter || s.status === statusFilter)
                             .filter((s: any) => inRange(s.createdAt));
        return (
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
            <FilterRow
              dateFrom={dateFrom} dateTo={dateTo} setDateFrom={setDateFrom} setDateTo={setDateTo}
              filters={[{ label: "Status", value: statusFilter, onChange: setStatusFilter, options: ["", "ACTIVE", "REDEEMED"] }]}
              onSearch={() => load()} onReset={resetFilters}
            />
            <TH cols={["Order ID", "Product", "Amount", "APR", "Earnings", "Start Date", "End Date", "Status", "Action"]} />
            {rows.length === 0 ? <NoData /> : rows.map((s: any) => (
              <TR key={s.id} cols={9} cells={[
                <span className="font-mono text-xs" style={{ color: "#aaa" }}>{s.id.slice(0, 10)}…</span>,
                <div>
                  <p className="font-medium text-sm" style={{ color: "#111" }}>{s.product?.name || "—"}</p>
                  <p className="text-xs" style={{ color: "#888" }}>{s.product?.currencySymbol}</p>
                </div>,
                <span className="font-mono">{fmt(s.amount)}</span>,
                <span className="font-semibold text-green-600">{s.product?.apr ?? 0}%</span>,
                <div>
                  <p className="text-xs" style={{ color: "#888" }}>Today: +{fmt(s.earnedSoFar ?? 0, 4)}</p>
                  <p className="text-xs font-semibold text-green-600">Total: +{fmt(s.earnedSoFar ?? 0)}</p>
                </div>,
                <span className="text-xs" style={{ color: "#aaa" }}>{fmtDate(s.startAt)}</span>,
                <span className="text-xs" style={{ color: "#aaa" }}>{fmtDate(s.endAt)}</span>,
                statusBadge(s.status),
                s.status === "ACTIVE"
                  ? <Link to={`/earn`} className="text-xs px-2 py-1 rounded font-medium" style={{ background: "#ef444420", color: "#dc2626" }}>Redeem</Link>
                  : <span className="text-xs" style={{ color: "#aaa" }}>—</span>,
              ]} />
            ))}
          </div>
        );
      }

      /* ── ORDER LIST ───────────────────────────── */
      case "Order List": {
        const applyDateFilter = (arr: any[]) => arr.filter((o: any) => inRange(o.createdAt));

        return (
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
            {/* Sub-tabs */}
            <div className="flex gap-6 px-6 pt-4" style={{ borderBottom: "1px solid #eee" }}>
              {ORDER_SUB_TABS.map(sub => (
                <button key={sub} onClick={() => setOrderSubTab(sub)}
                  className="pb-3 text-sm transition-colors"
                  style={{
                    color: orderSubTab === sub ? "#111" : "#999",
                    borderBottom: orderSubTab === sub ? "2px solid #111" : "2px solid transparent",
                    fontWeight: orderSubTab === sub ? 600 : 400,
                  }}>
                  {sub}
                </button>
              ))}
            </div>

            <FilterRow
              dateFrom={dateFrom} dateTo={dateTo} setDateFrom={setDateFrom} setDateTo={setDateTo}
              filters={[{ label: "Status", value: statusFilter, onChange: setStatusFilter, options: ["", "OPEN", "FILLED", "CANCELLED", "PENDING", "WIN", "LOSS"] }]}
              onSearch={() => load()} onReset={resetFilters}
            />

            {/* Spot Orders */}
            {orderSubTab === "Spot Orders" && (() => {
              const rows = applyDateFilter(spotOrders).filter((o: any) => !statusFilter || o.status === statusFilter);
              return (
                <>
                  <TH cols={["Date", "Pair", "Side", "Type", "Price", "Amount", "Filled", "Total", "Fee", "Status"]} />
                  {rows.length === 0 ? <NoData /> : rows.map((o: any) => (
                    <TR key={o.id} cols={10} cells={[
                      <span className="text-xs" style={{ color: "#aaa" }}>{fmtDate(o.createdAt)}</span>,
                      <span className="font-semibold">{o.pair}</span>,
                      <span style={{ color: o.side === "BUY" ? "#16a34a" : "#dc2626", fontWeight: 600 }}>{o.side}</span>,
                      <span className="text-xs">{o.type}</span>,
                      <span className="font-mono">{fmt(o.price ?? 0)}</span>,
                      <span className="font-mono">{fmt(o.amount)}</span>,
                      <span className="font-mono">{fmt(o.filled ?? 0)}</span>,
                      <span className="font-mono">{fmt(o.total ?? 0)}</span>,
                      <span className="font-mono text-xs" style={{ color: "#888" }}>{fmt(o.fee ?? 0, 4)}</span>,
                      statusBadge(o.status),
                    ]} />
                  ))}
                </>
              );
            })()}

            {/* Futures Orders */}
            {orderSubTab === "Futures Orders" && (() => {
              const rows = applyDateFilter(futuresOrders).filter((o: any) => !statusFilter || o.status === statusFilter);
              return (
                <>
                  <TH cols={["Date", "Pair", "Side", "Type", "Leverage", "Entry Price", "Amount", "Margin", "P&L", "Status"]} />
                  {rows.length === 0 ? <NoData /> : rows.map((o: any) => (
                    <TR key={o.id} cols={10} cells={[
                      <span className="text-xs" style={{ color: "#aaa" }}>{fmtDate(o.createdAt)}</span>,
                      <span className="font-semibold">{o.pair}</span>,
                      <span style={{ color: o.side === "BUY" ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
                        {o.side === "BUY" ? "Long" : "Short"}
                      </span>,
                      <span className="text-xs">{o.type}</span>,
                      <span className="font-semibold">{o.leverage}x</span>,
                      <span className="font-mono">{o.entryPrice ? fmt(o.entryPrice) : "Market"}</span>,
                      <span className="font-mono">{fmt(o.amount)}</span>,
                      <span className="font-mono">{fmt(o.margin ?? 0)}</span>,
                      <span className="font-mono" style={{ color: (o.pnl ?? 0) >= 0 ? "#16a34a" : "#dc2626" }}>
                        {(o.pnl ?? 0) >= 0 ? "+" : ""}{fmt(o.pnl ?? 0)}
                        {(o.pnl ?? 0) >= 0
                          ? <TrendingUp className="inline w-3 h-3 ml-1" />
                          : <TrendingDown className="inline w-3 h-3 ml-1" />}
                      </span>,
                      statusBadge(o.status),
                    ]} />
                  ))}
                </>
              );
            })()}

            {/* Options Orders */}
            {orderSubTab === "Options Orders" && (() => {
              const rows = applyDateFilter(optionsOrders).filter((o: any) => !statusFilter || o.status === statusFilter);
              return (
                <>
                  <TH cols={["Date", "Pair", "Side", "Interval", "Profit Rate", "Amount", "Entry Price", "P&L", "Expires", "Status"]} />
                  {rows.length === 0 ? <NoData /> : rows.map((o: any) => (
                    <TR key={o.id} cols={10} cells={[
                      <span className="text-xs" style={{ color: "#aaa" }}>{fmtDate(o.createdAt)}</span>,
                      <span className="font-semibold">{o.pair}</span>,
                      <span style={{ color: o.side === "LONG" ? "#16a34a" : "#dc2626", fontWeight: 600 }}>{o.side}</span>,
                      <span className="font-medium">{o.interval}</span>,
                      <span className="font-semibold text-blue-600">{((o.profitRate ?? 0) * 100).toFixed(0)}%</span>,
                      <span className="font-mono">{fmt(o.amount)}</span>,
                      <span className="font-mono">{fmt(o.entryPrice ?? 0)}</span>,
                      <span className="font-mono" style={{ color: (o.pnl ?? 0) >= 0 ? "#16a34a" : "#dc2626" }}>
                        {(o.pnl ?? 0) >= 0 ? "+" : ""}{fmt(o.pnl ?? 0)}
                      </span>,
                      <span className="text-xs" style={{ color: "#aaa" }}>{fmtDate(o.expiresAt)}</span>,
                      statusBadge(o.status),
                    ]} />
                  ))}
                </>
              );
            })()}
          </div>
        );
      }

      default:
        return <NoData />;
    }
  };

  /* ─── Page shell ─────────────────────────────── */
  return (
    <div className="min-h-screen" style={{ background: "#fff" }}>
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Tab bar */}
        <div className="flex gap-0 overflow-x-auto" style={{ borderBottom: "1px solid #eee" }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="whitespace-nowrap text-sm px-4 py-4 transition-colors flex-shrink-0"
              style={{
                color: activeTab === tab ? "#111" : "#999",
                borderBottom: activeTab === tab ? "2px solid #111" : "2px solid transparent",
                fontWeight: activeTab === tab ? 600 : 400,
              }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="py-6">{renderContent()}</div>
      </div>
    </div>
  );
};

export default OverviewPage;
