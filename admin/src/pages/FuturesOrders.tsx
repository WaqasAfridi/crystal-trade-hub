import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

type Tab = "futures" | "options";
type StatusFilter = "ALL" | "OPEN" | "CLOSED" | "PENDING" | "WIN" | "LOSS" | "CANCELLED";

export default function FuturesOrders() {
  const [tab, setTab] = useState<Tab>("futures");
  const [futuresOrders, setFuturesOrders] = useState<any[]>([]);
  const [optionsOrders, setOptionsOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const pageSize = 20;

  const fetchFutures = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      const res: any = await api.get(`/admin/transactions/futures?${params}`);
      setFuturesOrders(res.data?.items || []);
      setTotal(res.data?.total || 0);
    } catch {
      setFuturesOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  const fetchOptions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      const res: any = await api.get(`/admin/transactions/options?${params}`);
      setOptionsOrders(res.data?.items || []);
      setTotal(res.data?.total || 0);
    } catch {
      setOptionsOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    if (tab === "futures") fetchFutures();
    else fetchOptions();
  }, [tab, fetchFutures, fetchOptions]);

  const handleSettleOptions = async (id: string, result: "WIN" | "LOSS") => {
    try {
      await api.post(`/admin/transactions/options/${id}/settle`, { result });
      fetchOptions();
    } catch {
      alert("Failed to settle order");
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const futureStatuses: StatusFilter[] = ["ALL", "OPEN", "CLOSED", "CANCELLED"];
  const optionStatuses: StatusFilter[] = ["ALL", "PENDING", "WIN", "LOSS", "CANCELLED"];

  const fmt = (n: number, d = 2) => n?.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) ?? "—";
  const statusColor = (s: string) => {
    if (s === "OPEN" || s === "WIN") return "#0ecb81";
    if (s === "LOSS" || s === "CANCELLED") return "#f6465d";
    if (s === "PENDING") return "#f5c518";
    return "#9ca3af";
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#e2e8f0" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0 }}>Futures / Options Orders</h1>
        <p style={{ color: "#6b7280", marginTop: 4, fontSize: 14 }}>Manage perpetual contract and options trading orders</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #1e2030", marginBottom: 20 }}>
        {(["futures", "options"] as Tab[]).map(t => (
          <button key={t} onClick={() => { setTab(t); setPage(1); setStatusFilter("ALL"); }}
            style={{ padding: "10px 24px", background: "none", border: "none", cursor: "pointer", fontSize: 15,
              fontWeight: tab === t ? 700 : 400,
              color: tab === t ? "#fff" : "#6b7280",
              borderBottom: tab === t ? "2px solid #4a90e2" : "2px solid transparent",
              marginBottom: -1, transition: "all 0.15s" }}>
            {t === "futures" ? "Perpetual Contracts" : "Options"}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by user email, pair..."
          style={{ background: "#1a1a2e", border: "1px solid #2a2a3e", borderRadius: 6, padding: "8px 12px", color: "#fff", fontSize: 14, outline: "none", width: 260 }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {(tab === "futures" ? futureStatuses : optionStatuses).map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid", fontSize: 13, cursor: "pointer",
                background: statusFilter === s ? "#2a3a5e" : "transparent",
                borderColor: statusFilter === s ? "#4a90e2" : "#2a2a3e",
                color: statusFilter === s ? "#5eb8ff" : "#6b7280" }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#0f1117", borderRadius: 8, border: "1px solid #1e2030", overflow: "hidden" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#6b7280", fontSize: 15 }}>Loading...</div>
        ) : tab === "futures" ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e2030" }}>
                {["Date", "User", "Pair", "Side", "Type", "Leverage", "Entry Price", "Amount", "Margin", "P&L", "Status"].map(h => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", color: "#6b7280", fontWeight: 500, fontSize: 13, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {futuresOrders.length === 0 ? (
                <tr><td colSpan={11} style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>No futures orders found</td></tr>
              ) : futuresOrders.map(o => (
                <tr key={o.id} style={{ borderBottom: "1px solid #1a1a24" }}>
                  <td style={{ padding: "10px 14px", color: "#9ca3af", fontSize: 13 }}>{new Date(o.createdAt).toLocaleString()}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13 }}>
                    <div style={{ color: "#fff" }}>{o.user?.username || "—"}</div>
                    <div style={{ color: "#6b7280", fontSize: 11 }}>{o.user?.email || ""}</div>
                  </td>
                  <td style={{ padding: "10px 14px", color: "#fff", fontWeight: 600 }}>{o.pair}</td>
                  <td style={{ padding: "10px 14px", color: o.side === "BUY" ? "#0ecb81" : "#f6465d", fontWeight: 600 }}>{o.side === "BUY" ? "Long" : "Short"}</td>
                  <td style={{ padding: "10px 14px", color: "#9ca3af" }}>{o.type}</td>
                  <td style={{ padding: "10px 14px", color: "#fff" }}>{o.leverage}x</td>
                  <td style={{ padding: "10px 14px", color: "#fff" }}>{o.entryPrice ? fmt(o.entryPrice) : "Market"}</td>
                  <td style={{ padding: "10px 14px", color: "#fff" }}>{fmt(o.amount)} USDT</td>
                  <td style={{ padding: "10px 14px", color: "#fff" }}>{fmt(o.margin || 0)} USDT</td>
                  <td style={{ padding: "10px 14px", color: (o.pnl || 0) >= 0 ? "#0ecb81" : "#f6465d" }}>{(o.pnl || 0) >= 0 ? "+" : ""}{fmt(o.pnl || 0)}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ background: "rgba(0,0,0,0.3)", color: statusColor(o.status), borderRadius: 4, padding: "2px 8px", fontSize: 12, border: `1px solid ${statusColor(o.status)}40` }}>{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e2030" }}>
                {["Date", "User", "Pair", "Side", "Interval", "Profit Rate", "Amount", "Entry Price", "Settle Price", "P&L", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", color: "#6b7280", fontWeight: 500, fontSize: 13, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {optionsOrders.length === 0 ? (
                <tr><td colSpan={12} style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>No options orders found</td></tr>
              ) : optionsOrders.map(o => (
                <tr key={o.id} style={{ borderBottom: "1px solid #1a1a24" }}>
                  <td style={{ padding: "10px 14px", color: "#9ca3af", fontSize: 13 }}>{new Date(o.createdAt).toLocaleString()}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13 }}>
                    <div style={{ color: "#fff" }}>{o.user?.username || "—"}</div>
                    <div style={{ color: "#6b7280", fontSize: 11 }}>{o.user?.email || ""}</div>
                  </td>
                  <td style={{ padding: "10px 14px", color: "#fff", fontWeight: 600 }}>{o.pair}</td>
                  <td style={{ padding: "10px 14px", color: o.side === "LONG" ? "#0ecb81" : "#f6465d", fontWeight: 600 }}>{o.side}</td>
                  <td style={{ padding: "10px 14px", color: "#fff" }}>{o.interval}</td>
                  <td style={{ padding: "10px 14px", color: "#fff" }}>{((o.profitRate || 0) * 100).toFixed(0)}%</td>
                  <td style={{ padding: "10px 14px", color: "#fff" }}>{fmt(o.amount)} USDT</td>
                  <td style={{ padding: "10px 14px", color: "#fff" }}>{fmt(o.entryPrice)}</td>
                  <td style={{ padding: "10px 14px", color: "#9ca3af" }}>{o.settlePrice ? fmt(o.settlePrice) : "—"}</td>
                  <td style={{ padding: "10px 14px", color: (o.pnl || 0) >= 0 ? "#0ecb81" : "#f6465d" }}>{(o.pnl || 0) >= 0 ? "+" : ""}{fmt(o.pnl || 0)}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ background: "rgba(0,0,0,0.3)", color: statusColor(o.status), borderRadius: 4, padding: "2px 8px", fontSize: 12, border: `1px solid ${statusColor(o.status)}40` }}>{o.status}</span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    {o.status === "PENDING" && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => handleSettleOptions(o.id, "WIN")}
                          style={{ padding: "4px 10px", background: "rgba(14,203,129,0.15)", border: "1px solid rgba(14,203,129,0.4)", borderRadius: 4, color: "#0ecb81", fontSize: 12, cursor: "pointer" }}>WIN</button>
                        <button onClick={() => handleSettleOptions(o.id, "LOSS")}
                          style={{ padding: "4px 10px", background: "rgba(246,70,93,0.15)", border: "1px solid rgba(246,70,93,0.4)", borderRadius: 4, color: "#f6465d", fontSize: 12, cursor: "pointer" }}>LOSS</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
          <span style={{ color: "#6b7280", fontSize: 13 }}>Total: {total} records</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: "6px 14px", background: "#1a1a2e", border: "1px solid #2a2a3e", borderRadius: 5, color: page === 1 ? "#4a4a6a" : "#fff", cursor: page === 1 ? "default" : "pointer", fontSize: 13 }}>← Prev</button>
            <span style={{ padding: "6px 14px", color: "#9ca3af", fontSize: 13 }}>Page {page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ padding: "6px 14px", background: "#1a1a2e", border: "1px solid #2a2a3e", borderRadius: 5, color: page === totalPages ? "#4a4a6a" : "#fff", cursor: page === totalPages ? "default" : "pointer", fontSize: 13 }}>Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
