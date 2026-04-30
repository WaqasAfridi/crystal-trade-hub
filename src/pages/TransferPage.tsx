import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronDown, ArrowLeftRight, Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

/* ─── Types ─────────────────────────────────────────────────── */
type AccountType = "SPOT" | "FUTURES" | "EARN";

interface WalletEntry {
  symbol: string;
  name: string;
  iconUrl: string | null;
  balance: number;
  locked: number;
}

const ACCOUNT_OPTIONS: { value: AccountType; label: string }[] = [
  { value: "SPOT",    label: "Spot Account"    },
  { value: "FUTURES", label: "Trading Account"  },
  { value: "EARN",    label: "Finance Account"  },
];

const accountLabel = (v: AccountType) =>
  ACCOUNT_OPTIONS.find((a) => a.value === v)?.label ?? v;

/* ─── Coin icon (fallback to coloured circle) ────────────────── */
const CoinIcon = ({ iconUrl, symbol, size = 28 }: { iconUrl: string | null; symbol: string; size?: number }) => {
  const colors: Record<string, string> = {
    USDT: "#26a17b", BTC: "#f7931a", ETH: "#627eea", USDC: "#2775ca", BNB: "#f0b90b",
  };
  if (iconUrl) {
    return <img src={iconUrl} alt={symbol} width={size} height={size} style={{ borderRadius: "50%", objectFit: "cover" }} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: colors[symbol] ?? "#888",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ color: "#fff", fontSize: size * 0.38, fontWeight: 700 }}>{symbol[0]}</span>
    </div>
  );
};

/* ─── Generic dropdown ───────────────────────────────────────── */
const Dropdown = ({
  open, setOpen, trigger, children,
}: { open: boolean; setOpen: (v: boolean) => void; trigger: React.ReactNode; children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, setOpen]);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div onClick={() => setOpen(!open)} style={{ cursor: "pointer" }}>{trigger}</div>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 300,
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.10)", overflow: "hidden" }}>
          {children}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════ */

const TransferPage = () => {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();

  /* ── Account state ─────────────────────────── */
  const rawFrom = searchParams.get("from") as AccountType | null;
  const validAccounts: AccountType[] = ["SPOT", "FUTURES", "EARN"];

  const [fromAccount, setFromAccount] = useState<AccountType>(
    rawFrom && validAccounts.includes(rawFrom) ? rawFrom : "SPOT"
  );
  const [toAccount, setToAccount] = useState<AccountType>("FUTURES");

  const [fromDropOpen, setFromDropOpen]   = useState(false);
  const [toDropOpen, setToDropOpen]       = useState(false);
  const [symbolDropOpen, setSymbolDropOpen] = useState(false);

  /* ── Wallet data ────────────────────────────── */
  const [walletsByAccount, setWalletsByAccount] = useState<Record<AccountType, WalletEntry[]>>({
    SPOT: [], FUTURES: [], EARN: [],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /* ── Symbol & amount ────────────────────────── */
  const [selectedSymbol, setSelectedSymbol] = useState("USDT");
  const [size, setSize] = useState("");

  /* ── Load wallets ───────────────────────────── */
  const loadWallets = useCallback(async () => {
    if (!token) return;
    try {
      const data: any = await api.get("/wallets/by-account", token);
      setWalletsByAccount({
        SPOT:    data?.SPOT    ?? [],
        FUTURES: data?.FUTURES ?? [],
        EARN:    data?.EARN    ?? [],
      });
    } catch { /* silent */ }
    setLoading(false);
  }, [token]);

  useEffect(() => { loadWallets(); }, [loadWallets]);

  /* ── All unique symbols across all accounts (union, deduplicated) ── */
  const allSymbols = Array.from(
    new Set([
      ...walletsByAccount.SPOT.map((w) => w.symbol),
      ...walletsByAccount.FUTURES.map((w) => w.symbol),
      ...walletsByAccount.EARN.map((w) => w.symbol),
    ])
  );
  // Ensure at least USDT appears even before wallets load
  const symbols = allSymbols.length ? allSymbols : ["USDT"];

  /* ── Available balance of selected coin in the "From" account ── */
  const fromWallet = walletsByAccount[fromAccount]?.find((w) => w.symbol === selectedSymbol);
  const available = fromWallet?.balance ?? 0;
  const selectedCoinData = [...walletsByAccount.SPOT, ...walletsByAccount.FUTURES, ...walletsByAccount.EARN]
    .find((w) => w.symbol === selectedSymbol);

  /* ── Swap from ↔ to ─────────────────────────── */
  const handleSwap = () => {
    setFromAccount(toAccount);
    setToAccount(fromAccount);
    setSize("");
  };

  /* ── "all" button ───────────────────────────── */
  const handleAll = () => setSize(available > 0 ? String(available) : "0");

  /* ── Confirm transfer ───────────────────────── */
  const handleConfirm = async () => {
    const amt = parseFloat(size);
    if (!amt || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (amt > available) {
      toast.error(`Insufficient ${selectedSymbol} balance in ${accountLabel(fromAccount)}`);
      return;
    }
    if (fromAccount === toAccount) {
      toast.error("Source and destination accounts must differ");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(
        "/transfers",
        { currencySymbol: selectedSymbol, amount: amt, fromAccount, toAccount },
        token
      );
      toast.success(
        `Transferred ${amt} ${selectedSymbol} from ${accountLabel(fromAccount)} to ${accountLabel(toAccount)}`,
        { duration: 5000 }
      );
      setSize("");
      loadWallets();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Transfer failed. Please try again.");
    }
    setSubmitting(false);
  };

  const parsedSize = parseFloat(size);
  const isOver = parsedSize > 0 && parsedSize > available;

  /* ─────────────────────────────────────────────── */
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>

      {/* ── Dark Hero Banner ─────────────────────── */}
      <div style={{ background: "#111114", position: "relative", overflow: "hidden" }}>
        {/* Decorative squares — matches screenshot */}
        <div style={{ position: "absolute", top: 16, left: 24, display: "flex", gap: 12, opacity: 0.3 }}>
          <div style={{ width: 40, height: 40, borderRadius: 6, background: "#333" }} />
          <div style={{ width: 40, height: 40, borderRadius: 6, background: "#444" }} />
        </div>
        <div style={{ position: "absolute", top: 64, left: 24, opacity: 0.2 }}>
          <div style={{ width: 40, height: 40, borderRadius: 6, background: "#333" }} />
        </div>
        <div style={{ textAlign: "center", padding: "56px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 12 }}>
            {/* Two overlapping coins with revolving arrows — matches screenshot */}
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* ── Top-left revolving arrow (sweeps from ~200° to ~310°) ── */}
              <path
                d="M 13 10 A 16 16 0 0 0 6 20"
                stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"
              />
              {/* arrowhead pointing upward-right at end of arc */}
              <polyline points="10,7 13,10 10,14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />

              {/* ── Bottom-right revolving arrow (sweeps from ~20° to ~130°) ── */}
              <path
                d="M 35 38 A 16 16 0 0 0 42 28"
                stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"
              />
              {/* arrowhead pointing downward-left at end of arc */}
              <polyline points="38,41 35,38 38,34" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />

              {/* ── Top-right circle (empty "coin", lower z-index) ── */}
              <circle cx="28" cy="20" r="10" fill="#2a2a2a" stroke="white" strokeWidth="1.8" />
              <circle cx="28" cy="20" r="7.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1" fill="none" />

              {/* ── Bottom-left circle (Bitcoin coin, higher z-index) ── */}
              <circle cx="20" cy="28" r="11" fill="#1a1a1a" stroke="white" strokeWidth="1.8" />
              <text x="20" y="33" textAnchor="middle" fontSize="13" fontWeight="700" fill="white" fontFamily="Arial, sans-serif">₿</text>
            </svg>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", margin: 0 }}>Transfer</h1>
          </div>
          <p style={{ fontSize: 16, color: "#fff", whiteSpace: "nowrap", margin: "0 auto", lineHeight: 1.7 }}>
            Transfer funds between different accounts conveniently and securely to improve fund management efficiency.
          </p>
        </div>
      </div>

      {/* ── Transfer Card ────────────────────────── */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ borderRadius: 16, padding: "32px 28px", background: "#fff",
          border: "1px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>

          {/* SYMBOL ─────────────────────────────── */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#333", display: "block", marginBottom: 8 }}>
              Symbol
            </label>
            <Dropdown
              open={symbolDropOpen}
              setOpen={setSymbolDropOpen}
              trigger={
                <div style={{ display: "flex", alignItems: "center", padding: "12px 14px",
                  border: "1px solid #e5e7eb", borderRadius: 10, gap: 10 }}>
                  <CoinIcon iconUrl={selectedCoinData?.iconUrl ?? null} symbol={selectedSymbol} size={26} />
                  <span style={{ fontSize: 14, color: "#333", flex: 1 }}>{selectedSymbol}</span>
                  <ChevronDown style={{ width: 16, height: 16, color: "#bbb",
                    transform: symbolDropOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                </div>
              }
            >
              {loading ? (
                <div style={{ padding: "16px", display: "flex", justifyContent: "center" }}>
                  <Loader2 style={{ width: 18, height: 18, color: "#bbb" }} className="animate-spin" />
                </div>
              ) : (
                symbols.map((sym) => {
                  const coinData = [...walletsByAccount.SPOT, ...walletsByAccount.FUTURES, ...walletsByAccount.EARN]
                    .find((w) => w.symbol === sym);
                  return (
                    <div key={sym}
                      onClick={() => { setSelectedSymbol(sym); setSymbolDropOpen(false); setSize(""); }}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
                        background: selectedSymbol === sym ? "#f5f5f5" : "#fff", cursor: "pointer",
                        borderBottom: "1px solid #f5f5f5" }}
                      onMouseEnter={(e) => { if (selectedSymbol !== sym) (e.currentTarget as HTMLElement).style.background = "#f9fafb"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = selectedSymbol === sym ? "#f5f5f5" : "#fff"; }}
                    >
                      <CoinIcon iconUrl={coinData?.iconUrl ?? null} symbol={sym} size={24} />
                      <span style={{ fontSize: 14, color: "#333", fontWeight: 500 }}>{sym}</span>
                      {selectedSymbol === sym && <span style={{ marginLeft: "auto", color: "#111", fontSize: 14 }}>✓</span>}
                    </div>
                  );
                })
              )}
            </Dropdown>
          </div>

          {/* FROM / SWAP / TO ────────────────────── */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>

              {/* From */}
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#333", display: "block", marginBottom: 8 }}>
                  From
                </label>
                <Dropdown
                  open={fromDropOpen}
                  setOpen={setFromDropOpen}
                  trigger={
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 14px", border: "1px solid #e5e7eb", borderRadius: 10 }}>
                      <span style={{ fontSize: 14, color: "#555" }}>{accountLabel(fromAccount)}</span>
                      <ChevronDown style={{ width: 16, height: 16, color: "#bbb",
                        transform: fromDropOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s", flexShrink: 0 }} />
                    </div>
                  }
                >
                  {ACCOUNT_OPTIONS.filter((o) => o.value !== toAccount).map((opt) => (
                    <div key={opt.value}
                      onClick={() => { setFromAccount(opt.value); setFromDropOpen(false); setSize(""); }}
                      style={{ padding: "11px 14px", fontSize: 14, cursor: "pointer",
                        color: fromAccount === opt.value ? "#111" : "#555",
                        fontWeight: fromAccount === opt.value ? 600 : 400,
                        background: fromAccount === opt.value ? "#f5f5f5" : "#fff",
                        borderBottom: "1px solid #f5f5f5" }}
                      onMouseEnter={(e) => { if (fromAccount !== opt.value) (e.currentTarget as HTMLElement).style.background = "#f9fafb"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = fromAccount === opt.value ? "#f5f5f5" : "#fff"; }}
                    >
                      {opt.label}
                    </div>
                  ))}
                </Dropdown>
              </div>

              {/* Swap button */}
              <button onClick={handleSwap}
                style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid #e5e7eb",
                  background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", flexShrink: 0, marginBottom: 1, transition: "background 0.15s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f5f5f5"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
              >
                <ArrowLeftRight style={{ width: 17, height: 17, color: "#333" }} />
              </button>

              {/* To */}
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#333", display: "block", marginBottom: 8 }}>
                  To
                </label>
                <Dropdown
                  open={toDropOpen}
                  setOpen={setToDropOpen}
                  trigger={
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 14px", border: "1px solid #e5e7eb", borderRadius: 10 }}>
                      <span style={{ fontSize: 14, color: "#555" }}>{accountLabel(toAccount)}</span>
                      <ChevronDown style={{ width: 16, height: 16, color: "#bbb",
                        transform: toDropOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s", flexShrink: 0 }} />
                    </div>
                  }
                >
                  {ACCOUNT_OPTIONS.filter((o) => o.value !== fromAccount).map((opt) => (
                    <div key={opt.value}
                      onClick={() => { setToAccount(opt.value); setToDropOpen(false); }}
                      style={{ padding: "11px 14px", fontSize: 14, cursor: "pointer",
                        color: toAccount === opt.value ? "#111" : "#555",
                        fontWeight: toAccount === opt.value ? 600 : 400,
                        background: toAccount === opt.value ? "#f5f5f5" : "#fff",
                        borderBottom: "1px solid #f5f5f5" }}
                      onMouseEnter={(e) => { if (toAccount !== opt.value) (e.currentTarget as HTMLElement).style.background = "#f9fafb"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = toAccount === opt.value ? "#f5f5f5" : "#fff"; }}
                    >
                      {opt.label}
                    </div>
                  ))}
                </Dropdown>
              </div>
            </div>
          </div>

          {/* SIZE ───────────────────────────────── */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#333", display: "block", marginBottom: 8 }}>
              Size
            </label>
            <div style={{ display: "flex", alignItems: "center", padding: "12px 14px",
              border: `1px solid ${isOver ? "#ef4444" : "#e5e7eb"}`, borderRadius: 10,
              transition: "border-color 0.2s" }}>
              <input
                type="number"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder=""
                min="0"
                style={{ flex: 1, border: "none", outline: "none", background: "transparent",
                  fontSize: 14, color: "#333" }}
              />
              <button onClick={handleAll}
                style={{ fontSize: 13, fontWeight: 600, color: "#333", background: "none",
                  border: "none", cursor: "pointer", flexShrink: 0, marginLeft: 8, padding: 0 }}>
                all
              </button>
            </div>
          </div>

          {/* QUANTITY ──────────────────────────── */}
          <p style={{ fontSize: 13, color: isOver ? "#ef4444" : "#555", marginBottom: 24 }}>
            {loading
              ? "Loading balance..."
              : `Quantity: ${available.toLocaleString("en-US", { maximumFractionDigits: 6 })} ${selectedSymbol}`
            }
            {isOver && <span style={{ marginLeft: 8, fontWeight: 600 }}>— Insufficient balance</span>}
          </p>

          {/* CONFIRM ────────────────────────────── */}
          <button
            onClick={handleConfirm}
            disabled={submitting || isOver || !parsedSize || parsedSize <= 0}
            style={{
              width: "100%", padding: "14px 0", borderRadius: 9999, fontSize: 15, fontWeight: 600,
              background: (submitting || isOver || !parsedSize || parsedSize <= 0) ? "#d1d5db" : "#111",
              color: (submitting || isOver || !parsedSize || parsedSize <= 0) ? "#9ca3af" : "#fff",
              border: "none", cursor: (submitting || isOver || !parsedSize || parsedSize <= 0) ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => { if (!(submitting || isOver || !parsedSize || parsedSize <= 0)) (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          >
            {submitting ? (
              <><Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> Transferring…</>
            ) : (
              "Confirm"
            )}
          </button>

        </div>
      </div>
    </div>
  );
};

export default TransferPage;
