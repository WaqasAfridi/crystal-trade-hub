import { useState, useEffect, useCallback } from "react";
import { MOBILE_BOTTOM_NAV_H } from "@/components/mobile/MobileBottomNav";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// ── Types ──────────────────────────────────────────────────────────────────
interface DepositRecord {
  id: string;
  currencySymbol: string;
  amount: number;
  network?: string | null;
  txHash?: string | null;
  status: string;
  createdAt: string;
}

interface WithdrawalRecord {
  id: string;
  currencySymbol: string;
  amount: number;
  fee: number;
  netAmount: number;
  network?: string | null;
  toAddress: string;
  txHash?: string | null;
  status: string;
  createdAt: string;
}

type Tab = "deposit" | "withdrawal";

// ── Status badge ───────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  PENDING:   { bg: "rgba(245,158,11,0.12)",  color: "#d97706" },
  APPROVED:  { bg: "rgba(34,197,94,0.12)",   color: "#16a34a" },
  COMPLETED: { bg: "rgba(34,197,94,0.12)",   color: "#16a34a" },
  REJECTED:  { bg: "rgba(239,68,68,0.12)",   color: "#dc2626" },
  CANCELLED: { bg: "rgba(156,163,175,0.15)", color: "#6b7280" },
  REVIEWING: { bg: "rgba(59,130,246,0.12)",  color: "#2563eb" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = STATUS_STYLES[status] ?? { bg: "rgba(156,163,175,0.15)", color: "#6b7280" };
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 600,
      padding: "3px 8px", borderRadius: 20,
      textTransform: "capitalize" as const,
    }}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
};

// ── Empty / End indicator ──────────────────────────────────────────────────
const EndIndicator = ({ empty }: { empty: boolean }) => (
  <div style={{ textAlign: "center", padding: "32px 0 16px", color: "#b0b0b8", fontSize: 13 }}>
    {empty ? "No records yet" : "End"}
  </div>
);

// ── Deposit row ────────────────────────────────────────────────────────────
const DepositRow = ({ item }: { item: DepositRecord }) => (
  <div style={{
    background: "#fff", borderRadius: 10, margin: "0 12px 8px",
    padding: "14px 16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
      <div>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>{item.currencySymbol}</span>
        {item.network && (
          <span style={{ fontSize: 11, color: "#888", marginLeft: 6, background: "#f3f4f6", padding: "2px 7px", borderRadius: 20 }}>
            {item.network}
          </span>
        )}
      </div>
      <StatusBadge status={item.status} />
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 17, fontWeight: 700, color: "#111" }}>
        +{item.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })}
      </span>
      <span style={{ fontSize: 11, color: "#aaa" }}>
        {new Date(item.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
      </span>
    </div>
    {item.txHash && (
      <p style={{ fontSize: 11, color: "#aaa", marginTop: 4, fontFamily: "monospace", wordBreak: "break-all" }}>
        Tx: {item.txHash}
      </p>
    )}
  </div>
);

// ── Withdrawal row ─────────────────────────────────────────────────────────
const WithdrawalRow = ({ item }: { item: WithdrawalRecord }) => (
  <div style={{
    background: "#fff", borderRadius: 10, margin: "0 12px 8px",
    padding: "14px 16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
      <div>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>{item.currencySymbol}</span>
        {item.network && (
          <span style={{ fontSize: 11, color: "#888", marginLeft: 6, background: "#f3f4f6", padding: "2px 7px", borderRadius: 20 }}>
            {item.network}
          </span>
        )}
      </div>
      <StatusBadge status={item.status} />
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 17, fontWeight: 700, color: "#ef4444" }}>
        -{item.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })}
      </span>
      <span style={{ fontSize: 11, color: "#aaa" }}>
        {new Date(item.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
      </span>
    </div>
    <p style={{ fontSize: 11, color: "#bbb", marginTop: 4, fontFamily: "monospace", wordBreak: "break-all" }}>
      To: {item.toAddress}
    </p>
    {item.fee > 0 && (
      <p style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>
        Fee: {item.fee} · Net: {item.netAmount.toLocaleString(undefined, { maximumFractionDigits: 8 })}
      </p>
    )}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//  MobileHistory
// ═══════════════════════════════════════════════════════════════════════════
const MobileHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  // Allow navigating here with state: { tab: "withdrawal" } to open that tab directly
  const initialTab: Tab = (location.state as any)?.tab === "withdrawal" ? "withdrawal" : "deposit";
  const [tab, setTab] = useState<Tab>(initialTab);

  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [loadingDeposits, setLoadingDeposits] = useState(true);

  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true);

  const fetchDeposits = useCallback(async () => {
    if (!token) return;
    setLoadingDeposits(true);
    try {
      const res = await api.get<{ items: DepositRecord[] }>("/deposits/", token);
      setDeposits(res.items ?? []);
    } catch { setDeposits([]); }
    finally { setLoadingDeposits(false); }
  }, [token]);

  const fetchWithdrawals = useCallback(async () => {
    if (!token) return;
    setLoadingWithdrawals(true);
    try {
      const res = await api.get<{ items: WithdrawalRecord[] }>("/withdrawals/", token);
      setWithdrawals(res.items ?? []);
    } catch { setWithdrawals([]); }
    finally { setLoadingWithdrawals(false); }
  }, [token]);

  useEffect(() => { fetchDeposits(); }, [fetchDeposits]);
  useEffect(() => { fetchWithdrawals(); }, [fetchWithdrawals]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 60,
      background: "#f0f0f5", display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <header style={{
        height: 48, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px", background: "#0b0b0e",
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{ color: "#fff", background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}
        >
          <ArrowLeft style={{ width: 22, height: 22 }} />
        </button>
        <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>History</span>
        {/* Spacer so "History" stays perfectly centered */}
        <div style={{ width: 30 }} />
      </header>

      {/* ── Tabs ────────────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0, background: "#fff",
        display: "flex", borderBottom: "1px solid #e8e8ec",
      }}>
        {(["deposit", "withdrawal"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: "13px 0", fontSize: 14,
              fontWeight: tab === t ? 700 : 400,
              color: tab === t ? "#111" : "#9ca3af",
              background: "none", border: "none", cursor: "pointer",
              borderBottom: tab === t ? "2px solid #111" : "2px solid transparent",
              transition: "all 0.15s",
            }}
          >
            {t === "deposit" ? "Deposit" : "Withdrawals record"}
          </button>
        ))}
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", paddingTop: 12, paddingBottom: MOBILE_BOTTOM_NAV_H, WebkitOverflowScrolling: "touch" as any }}>

        {/* Deposit tab */}
        {tab === "deposit" && (
          <>
            {loadingDeposits ? (
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#aaa" }} />
              </div>
            ) : (
              <>
                {deposits.map((d) => <DepositRow key={d.id} item={d} />)}
                <EndIndicator empty={deposits.length === 0} />
              </>
            )}
          </>
        )}

        {/* Withdrawals tab */}
        {tab === "withdrawal" && (
          <>
            {loadingWithdrawals ? (
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#aaa" }} />
              </div>
            ) : (
              <>
                {withdrawals.map((w) => <WithdrawalRow key={w.id} item={w} />)}
                <EndIndicator empty={withdrawals.length === 0} />
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default MobileHistory;
