import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Eye, Download, Upload, RefreshCw, Send, ChevronDown, Calendar } from "lucide-react";

/* ── Tab definitions ─────────────────────────────────────────── */
const TABS = [
  "Overview","Spot Account","Trading Account","Finance Account",
  "Funding Records","History","Financial Records","Exchange History",
  "Commission Record","AI Strategy","Order List",
] as const;
type Tab = (typeof TABS)[number];

const ORDER_SUB_TABS = [
  "Cryptocurrency order","FX order","Stock contract order",
  "Spot order","Stock order","C2C Order","Staking Order",
];

/* ── Shared empty state SVG ──────────────────────────────────── */
const NoData = () => (
  <div className="flex flex-col items-center justify-center py-28" style={{ color: "#ccc" }}>
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mb-4 opacity-50">
      <rect x="20" y="15" width="40" height="50" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <line x1="28" y1="30" x2="52" y2="30" stroke="currentColor" strokeWidth="1.5" />
      <line x1="28" y1="38" x2="48" y2="38" stroke="currentColor" strokeWidth="1.5" />
      <line x1="28" y1="46" x2="44" y2="46" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="58" cy="20" r="8" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="55" r="6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
    <span className="text-sm">No Data</span>
  </div>
);

/* ── Filter bar component ────────────────────────────────────── */
const FilterBar = ({ filters, extraFilters }: { filters: { label: string; placeholder: string; type?: "date"|"select" }[]; extraFilters?: React.ReactNode }) => (
  <div className="flex flex-wrap items-center gap-3 mb-4 px-6 py-3">
    {/* Time filter */}
    <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ border: "1px solid #e5e7eb" }}>
      <span className="text-sm" style={{ color: "#555" }}>Time</span>
      <Calendar className="w-4 h-4" style={{ color: "#aaa" }} />
      <span className="text-sm" style={{ color: "#ccc" }}>Start Date</span>
      <span className="text-sm" style={{ color: "#888" }}>to</span>
      <span className="text-sm" style={{ color: "#ccc" }}>End Date</span>
    </div>
    {filters.map((f, i) => (
      <div key={i} className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ border: "1px solid #e5e7eb" }}>
        <span className="text-sm" style={{ color: "#555" }}>{f.label}</span>
        <span className="text-sm" style={{ color: f.placeholder === "Select" ? "#ccc" : "#555" }}>{f.placeholder}</span>
        {f.type !== "date" && <ChevronDown className="w-3.5 h-3.5" style={{ color: "#bbb" }} />}
      </div>
    ))}
    {extraFilters}
    <button className="px-5 py-2 rounded-lg text-sm font-medium" style={{ border: "1px solid #222", color: "#222" }}>Search</button>
    <button className="px-5 py-2 rounded-lg text-sm font-medium" style={{ border: "1px solid #e5e7eb", color: "#555" }}>Reset</button>
  </div>
);

/* ── Table header component ──────────────────────────────────── */
const TableHeader = ({ columns }: { columns: string[] }) => (
  <div className="px-6 py-3" style={{ background: "#f8f8f8", borderBottom: "1px solid #eee" }}>
    <div className="flex">
      {columns.map((col, i) => (
        <span key={i} className="flex-1 text-sm" style={{ color: "#888" }}>{col}</span>
      ))}
    </div>
  </div>
);

/* ── Balance card component ──────────────────────────────────── */
const BalanceCard = ({ showFinance }: { showFinance?: boolean }) => (
  <div className="rounded-2xl p-6 mb-6" style={{ border: "1px solid #e5e7eb" }}>
    <div className="flex items-start justify-between">
      <div>
        {showFinance && <p className="text-sm font-medium mb-1 underline" style={{ color: "#333" }}>Finance</p>}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm" style={{ color: "#888" }}>Account Balance</span>
          <Eye className="w-4 h-4" style={{ color: "#aaa" }} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold" style={{ color: "#111" }}>0</span>
          <span className="text-base font-medium" style={{ color: "#333" }}>USDT</span>
        </div>
        <p className="text-sm mt-1" style={{ color: "#aaa" }}>{showFinance ? "Total Revenue:0" : "≈$0"}</p>
      </div>
      {showFinance && (
        <img src="/coinillustration.png" alt="coins" className="w-24 h-24 object-contain" />
      )}
      <div className="flex items-center gap-2">
        {[
          { label: "Deposit", icon: Download, href: "/assets/deposit" },
          { label: "Withdraw", icon: Upload, href: "/assets/withdraw" },
          { label: "Convert", icon: RefreshCw, href: "/assets/convert" },
          { label: "Transfer", icon: Send, href: "/assets/transfer" },
        ].map((btn) => (
          <Link
            key={btn.label}
            to={btn.href}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-colors"
            style={{ border: "1px solid #ddd", color: "#333" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#999"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#ddd"; }}
          >
            <btn.icon className="w-3.5 h-3.5" />
            {btn.label}
          </Link>
        ))}
      </div>
    </div>
  </div>
);

/* ── Donut chart SVG ─────────────────────────────────────────── */
const DonutChart = () => (
  <div className="flex flex-col items-center">
    <svg width="160" height="160" viewBox="0 0 160 160" className="mb-6">
      <circle cx="80" cy="80" r="60" fill="none" stroke="#7dd3fc" strokeWidth="20" />
      <circle cx="80" cy="80" r="60" fill="none" stroke="#38bdf8" strokeWidth="20" strokeDasharray="125.6 251.2" strokeDashoffset="0" />
      <circle cx="80" cy="80" r="60" fill="none" stroke="#2563eb" strokeWidth="20" strokeDasharray="125.6 251.2" strokeDashoffset="-125.6" />
      <circle cx="80" cy="80" r="50" fill="white" />
    </svg>
    <div className="space-y-2 w-full">
      {[
        { label: "Spot Account", color: "#7dd3fc" },
        { label: "Trading Account", color: "#38bdf8" },
        { label: "Finance Account", color: "#2563eb" },
      ].map((item) => (
        <div key={item.label} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
            <span className="text-sm" style={{ color: "#555" }}>{item.label}</span>
          </div>
          <span className="text-sm font-medium" style={{ color: "#333" }}>0%</span>
        </div>
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════ */
const OverviewPage = () => {
  const location = useLocation();
  const getTabFromPath = (): Tab => {
    const map: Record<string, Tab> = {
      "/assets/overview": "Overview",
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
  const [orderSubTab, setOrderSubTab] = useState("Cryptocurrency order");

  useEffect(() => { setActiveTab(getTabFromPath()); }, [location.pathname]);

  const renderContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <>
            <BalanceCard />
            <div className="flex gap-6">
              {/* Asset Distribution */}
              <div className="flex-1 rounded-2xl p-6" style={{ border: "1px solid #e5e7eb" }}>
                <h3 className="text-xl font-bold mb-4" style={{ color: "#111" }}>Asset Distribution</h3>
                <div className="mb-3 flex" style={{ borderBottom: "1px solid #eee" }}>
                  {["Wallet","Account Balance","Action"].map((h) => (
                    <span key={h} className="flex-1 text-sm py-2" style={{ color: "#888" }}>{h}</span>
                  ))}
                </div>
                {["Spot Account","Trading Account","Finance Account"].map((name) => (
                  <div key={name} className="flex items-center py-4" style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <span className="flex-1 text-sm font-medium" style={{ color: "#222" }}>{name}</span>
                    <span className="flex-1 text-sm" style={{ color: "#333" }}>0</span>
                    <div className="flex-1 flex items-center gap-1">
                      <Link to="/assets/deposit" className="text-sm font-medium" style={{ color: "#22c55e" }}>Deposit</Link>
                      <span className="text-sm" style={{ color: "#888" }}>/</span>
                      <Link to="/assets/transfer" className="text-sm font-medium" style={{ color: "#222" }}>Transfer</Link>
                    </div>
                  </div>
                ))}
              </div>
              {/* Distributed chart */}
              <div className="w-80 rounded-2xl p-6" style={{ border: "1px solid #e5e7eb" }}>
                <h3 className="text-xl font-bold mb-6" style={{ color: "#111" }}>Distributed</h3>
                <DonutChart />
              </div>
            </div>
          </>
        );

      case "Spot Account":
      case "Trading Account":
        return (
          <>
            <BalanceCard />
            <div className="rounded-2xl" style={{ border: "1px solid #e5e7eb" }}>
              <div className="p-6 pb-0"><h3 className="text-xl font-bold mb-4" style={{ color: "#111" }}>Holding</h3></div>
              <TableHeader columns={["Currency","Total Value","Rate of Return (ROE)","Size","Action"]} />
              <NoData />
            </div>
          </>
        );

      case "Finance Account":
        return (
          <>
            <BalanceCard showFinance />
            <div className="rounded-2xl" style={{ border: "1px solid #e5e7eb" }}>
              <div className="p-6 pb-0 flex items-center justify-between">
                <h3 className="text-xl font-bold" style={{ color: "#111" }}>Holding</h3>
                <button className="px-4 py-2 rounded-full text-sm" style={{ border: "1px solid #ddd", color: "#333" }}>Financial Records</button>
              </div>
              <TableHeader columns={["Name","Total","Yesterday's Earnings","Today's Earnings","Total Revenue","End Time","Action"]} />
              <NoData />
            </div>
          </>
        );

      case "Funding Records":
        return (
          <div className="rounded-2xl" style={{ border: "1px solid #e5e7eb" }}>
            <FilterBar filters={[{ label: "Type", placeholder: "please choose", type: "select" }]} />
            <TableHeader columns={["Type","Currency","Amount","Starting Balance","Ending Balance","Date"]} />
            <NoData />
          </div>
        );

      case "History":
        return (
          <div className="rounded-2xl" style={{ border: "1px solid #e5e7eb" }}>
            <FilterBar filters={[
              { label: "Type", placeholder: "Deposit", type: "select" },
              { label: "State", placeholder: "Select", type: "select" },
            ]} />
            <TableHeader columns={["Order Number","Type","Currency","Amount","Handling fee","Date","State"]} />
            <NoData />
          </div>
        );

      case "Financial Records":
        return (
          <div className="rounded-2xl" style={{ border: "1px solid #e5e7eb" }}>
            <FilterBar filters={[{ label: "Status", placeholder: "Select", type: "select" }]} />
            <TableHeader columns={["Order Number","Category","Subscription ...","Today's Earni...","Total Revenue","Start Date","End Date","Running Times","Cycle","State","Operation"]} />
            <NoData />
          </div>
        );

      case "Exchange History":
        return (
          <div className="rounded-2xl" style={{ border: "1px solid #e5e7eb" }}>
            <FilterBar filters={[]} />
            <TableHeader columns={["From","To","Balance","Balance","Date"]} />
            <NoData />
          </div>
        );

      case "Commission Record":
        return (
          <div className="rounded-2xl" style={{ border: "1px solid #e5e7eb" }}>
            <FilterBar filters={[{ label: "Rebate Type", placeholder: "Select", type: "select" }]} />
            <TableHeader columns={["Name","Rebate Type","Time","Award"]} />
            <NoData />
          </div>
        );

      case "AI Strategy":
        return (
          <div className="rounded-2xl" style={{ border: "1px solid #e5e7eb" }}>
            <FilterBar filters={[{ label: "Status", placeholder: "Running", type: "select" }]} />
            <TableHeader columns={["Order Number","Category","Subscription ...","Running Times","lock date","Today's Earni...","Total Revenue","Start Date","End Date","State","Operation"]} />
            <NoData />
          </div>
        );

      case "Order List":
        return (
          <div className="rounded-2xl" style={{ border: "1px solid #e5e7eb" }}>
            {/* Sub-tabs */}
            <div className="flex gap-6 px-6 pt-4 pb-0" style={{ borderBottom: "1px solid #eee" }}>
              {ORDER_SUB_TABS.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setOrderSubTab(sub)}
                  className="pb-3 text-sm transition-colors"
                  style={{
                    color: orderSubTab === sub ? "#111" : "#999",
                    borderBottom: orderSubTab === sub ? "2px solid #111" : "2px solid transparent",
                    fontWeight: orderSubTab === sub ? 500 : 400,
                  }}
                >
                  {sub}
                </button>
              ))}
            </div>
            <FilterBar filters={[{ label: "Type", placeholder: "Transaction Records", type: "select" }]} />
            <TableHeader columns={["Time","Asset Class","Direction","Price","Amount","Leverage","Close Price","Fees","Close Profit (ROE)","Status"]} />
            <NoData />
          </div>
        );

      default:
        return <NoData />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#fff" }}>
      <div className="max-w-[1400px] mx-auto px-6">
        {/* ── Tab bar ────────────────────────────────────────── */}
        <div className="flex gap-6 py-4 overflow-x-auto" style={{ borderBottom: "1px solid #eee" }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="whitespace-nowrap text-sm pb-2 transition-colors flex-shrink-0"
              style={{
                color: activeTab === tab ? "#111" : "#999",
                borderBottom: activeTab === tab ? "2px solid #111" : "2px solid transparent",
                fontWeight: activeTab === tab ? 500 : 400,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Tab content ────────────────────────────────────── */}
        <div className="py-6">{renderContent()}</div>
      </div>
    </div>
  );
};

export default OverviewPage;
