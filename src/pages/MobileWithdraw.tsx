import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, ClipboardPaste, Loader2, AlertCircle, Check, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// ── Types ──────────────────────────────────────────────────────────────────
interface Currency {
  id: string;
  symbol: string;
  name: string;
  iconUrl?: string | null;
  withdrawEnabled: boolean;
  withdrawFee: number;
  withdrawFeePct: number;
  minWithdraw: number;
  maxWithdraw: number;
  networks: string[];
}

interface Wallet {
  symbol: string;
  accountType: string;
  balance: number;
}

// ── Clipboard history icon (matches MobileDeposit header icon style) ────────
const ClipboardHistoryIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect x="6" y="3" width="10" height="3" rx="1.5" stroke="white" strokeWidth="1.6"/>
    <rect x="4" y="5" width="14" height="14" rx="2" stroke="white" strokeWidth="1.6"/>
    <line x1="8" y1="10" x2="14" y2="10" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="8" y1="13" x2="12" y2="13" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

// ── Currency icon ──────────────────────────────────────────────────────────
const SYMBOL_COLORS: Record<string, string> = {
  USDT: "#26a17b", BTC: "#f7931a", ETH: "#627eea",
  BNB: "#f0b90b", XRP: "#346aa9", SOL: "#9945ff",
  DAI: "#f5a623", USDC: "#2775ca",
};

const CurrencyIcon = ({ symbol, iconUrl, size = 28 }: { symbol: string; iconUrl?: string | null; size?: number }) => {
  const [err, setErr] = useState(false);
  const localMap: Record<string, string> = {
    BTC: "/crypto-logos/btc.svg", ETH: "/crypto-logos/eth.svg",
    XRP: "/crypto-logos/xrp.svg", BNB: "/crypto-logos/bnb.svg",
  };
  const src = (!err && (iconUrl || localMap[symbol])) || null;

  if (src) {
    return (
      <img
        src={src}
        alt={symbol}
        width={size}
        height={size}
        style={{ borderRadius: "50%", objectFit: "contain" }}
        onError={() => setErr(true)}
      />
    );
  }
  const bg = SYMBOL_COLORS[symbol] ?? "#4a4a5a";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: "#fff", flexShrink: 0,
    }}>
      {symbol.slice(0, 1)}
    </div>
  );
};

// ── Helpers ────────────────────────────────────────────────────────────────
const formatBalance = (v: number): string => {
  if (!v || v === 0) return "0";
  return parseFloat(v.toPrecision(12)).toString();
};

const formatCryptoAmount = (v: number): string => {
  if (v === 0) return "0";
  return parseFloat(v.toPrecision(12)).toString();
};

// ═══════════════════════════════════════════════════════════════════════════
//  MobileWithdraw
// ═══════════════════════════════════════════════════════════════════════════
const MobileWithdraw = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("");

  const [wallets, setWallets] = useState<Wallet[]>([]);

  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");

  // Validation
  const [amountError, setAmountError] = useState("");
  const [addressError, setAddressError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Bottom sheets
  const [currencySheetOpen, setCurrencySheetOpen] = useState(false);
  const [networkSheetOpen, setNetworkSheetOpen] = useState(false);

  // Fetch currencies
  useEffect(() => {
    api.get<Currency[]>("/markets/currencies")
      .then((list) => {
        const withdrawable = list.filter((c) => c.withdrawEnabled);
        setCurrencies(withdrawable);
        if (withdrawable.length > 0) {
          setSelectedSymbol(withdrawable[0].symbol);
          setSelectedNetwork(withdrawable[0].networks?.[0] ?? "");
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCurrencies(false));
  }, []);

  // Fetch wallets
  useEffect(() => {
    if (!token) return;
    api.get<{ wallets: Wallet[] }>("/wallets", token)
      .then((res) => setWallets(res.wallets ?? []))
      .catch(() => {});
  }, [token]);

  // Derived values
  const selectedCurrency = currencies.find((c) => c.symbol === selectedSymbol);
  const spotWallet = wallets.find((w) => w.symbol === selectedSymbol && w.accountType === "SPOT");
  const spotBalance = spotWallet?.balance ?? 0;

  const numAmount = parseFloat(amount) || 0;
  const feePct = selectedCurrency
    ? (selectedCurrency.withdrawFeePct > 0 ? selectedCurrency.withdrawFeePct : 0.1)
    : 0.1;
  const withdrawFee = selectedCurrency?.withdrawFee ?? 0;
  const fee = withdrawFee + (numAmount * feePct) / 100;
  const actualArrival = Math.max(0, numAmount - fee);

  const handleSelectCurrency = (c: Currency) => {
    setSelectedSymbol(c.symbol);
    setSelectedNetwork(c.networks?.[0] ?? "");
    setCurrencySheetOpen(false);
    setAmount("");
    setAmountError("");
    setAddressError("");
    setSubmitError("");
    setSubmitSuccess(false);
  };

  const validate = (): boolean => {
    let valid = true;

    if (!numAmount || numAmount <= 0) {
      setAmountError("Please enter the withdrawal amount");
      valid = false;
    } else if (numAmount > spotBalance) {
      setAmountError(
        `Insufficient balance. Available: ${formatBalance(spotBalance)} ${selectedSymbol}`
      );
      valid = false;
    } else {
      setAmountError("");
    }

    if (!address.trim()) {
      setAddressError("Please enter the withdrawal address");
      valid = false;
    } else {
      setAddressError("");
    }

    return valid;
  };

  const handleWithdraw = async () => {
    if (!validate()) return;
    if (!selectedSymbol || !token) return;

    setSubmitError("");
    setSubmitting(true);
    try {
      await api.post("/withdrawals/", {
        currencySymbol: selectedSymbol,
        amount: numAmount,
        toAddress: address,
        network: selectedNetwork || undefined,
      }, token);
      setSubmitSuccess(true);
      setAmount("");
      setAddress("");
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Withdrawal failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Field row style (matches screenshot: white bg, rounded, subtle border) ─
  const fieldBox: React.CSSProperties = {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.07)",
    borderRadius: 10,
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    minHeight: 48,
  };

  const fieldBoxError: React.CSSProperties = {
    ...fieldBox,
    border: "1px solid rgba(239,68,68,0.5)",
  };

  return (
    <>
      {/* ── Full-screen overlay ───────────────────────────────────── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 60,
        background: "#f0f0f5", display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>

        {/* ── Header — identical style to MobileDeposit ─────────── */}
        <header style={{
          height: 48, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px",
          background: "#0b0b0e",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            style={{ color: "#fff", background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}
          >
            <ArrowLeft style={{ width: 22, height: 22 }} />
          </button>

          {/* Title */}
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>Withdraw</span>

          {/* Clipboard → history (withdrawal tab) */}
          <button
            onClick={() => navigate("/assets/funding-records", { state: { tab: "withdrawal" } })}
            style={{ color: "#fff", background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}
          >
            <ClipboardHistoryIcon />
          </button>
        </header>

        {/* ── Scrollable content ────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch" as any, padding: "16px 16px 40px" }}>

          {/* ── Currency ──────────────────────────────────────────── */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: "#555", marginBottom: 8, fontWeight: 500 }}>Currency</p>
            <button
              onClick={() => setCurrencySheetOpen(true)}
              style={{
                ...fieldBox,
                width: "100%", cursor: "pointer",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {loadingCurrencies
                  ? <Loader2 style={{ color: "#aaa", width: 20, height: 20 }} className="animate-spin" />
                  : selectedCurrency
                    ? <CurrencyIcon symbol={selectedCurrency.symbol} iconUrl={selectedCurrency.iconUrl} size={24} />
                    : null
                }
                <span style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>
                  {selectedSymbol || "Select"}
                </span>
              </div>
              <ChevronRight style={{ color: "#bbb", width: 18, height: 18 }} />
            </button>
          </div>

          {/* ── Network ───────────────────────────────────────────── */}
          {selectedCurrency && (selectedCurrency.networks?.length ?? 0) > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: "#555", marginBottom: 8, fontWeight: 500 }}>Network</p>
              <button
                onClick={() => setNetworkSheetOpen(true)}
                style={{
                  ...fieldBox,
                  width: "100%", cursor: "pointer",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>
                  {selectedNetwork || "—"}
                </span>
                <ChevronRight style={{ color: "#bbb", width: 18, height: 18 }} />
              </button>
            </div>
          )}

          {/* ── Withdrawal Quantity ───────────────────────────────── */}
          <div style={{ marginBottom: 4 }}>
            <p style={{ fontSize: 13, color: "#555", marginBottom: 8, fontWeight: 500 }}>Withdrawal Quantity</p>
            <div style={amountError ? fieldBoxError : fieldBox}>
              <input
                type="number"
                min="0"
                placeholder=""
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (e.target.value) setAmountError("");
                }}
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  fontSize: 15, color: "#111", minWidth: 0,
                }}
              />
              <button
                onClick={() => {
                  setAmount(spotBalance > 0 ? formatBalance(spotBalance) : "0");
                  setAmountError("");
                }}
                style={{
                  background: "#111", color: "#fff", border: "none", borderRadius: 6,
                  padding: "4px 10px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  flexShrink: 0, marginLeft: 8,
                }}
              >
                All
              </button>
            </div>

            {/* Balance display */}
            <p style={{ fontSize: 13, color: "#555", marginTop: 6, paddingLeft: 2 }}>
              Balance:{formatBalance(spotBalance)} {selectedSymbol}
            </p>

            {amountError && (
              <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                <AlertCircle style={{ width: 13, height: 13 }} />
                {amountError}
              </p>
            )}
          </div>

          {/* ── Address ───────────────────────────────────────────── */}
          <div style={{ marginTop: 16, marginBottom: 8 }}>
            <p style={{ fontSize: 13, color: "#555", marginBottom: 8, fontWeight: 500 }}>Address</p>
            <div style={addressError ? fieldBoxError : fieldBox}>
              <input
                type="text"
                placeholder=""
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (e.target.value.trim()) setAddressError("");
                }}
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  fontSize: 14, color: "#111", minWidth: 0,
                }}
              />
              <button
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    setAddress(text);
                    if (text.trim()) setAddressError("");
                  } catch {}
                }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  padding: 4, color: "#555", display: "flex", alignItems: "center",
                }}
              >
                <ClipboardPaste style={{ width: 18, height: 18 }} />
              </button>
            </div>
            {addressError && (
              <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                <AlertCircle style={{ width: 13, height: 13 }} />
                {addressError}
              </p>
            )}
          </div>

          {/* ── Service Charge / Actual Arrival ──────────────────── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: "#555" }}>Service Charge {feePct}%</span>
            <span style={{ fontSize: 13, color: "#555" }}>
              Actual Arrival:{numAmount > 0 ? formatCryptoAmount(actualArrival) : ""}
            </span>
          </div>

          {/* ── Feedback messages ─────────────────────────────────── */}
          {submitError && (
            <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <AlertCircle style={{ width: 14, height: 14, color: "#ef4444", flexShrink: 0 }} />
              <span style={{ color: "#ef4444", fontSize: 12 }}>{submitError}</span>
            </div>
          )}
          {submitSuccess && (
            <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <Check style={{ width: 14, height: 14, color: "#16a34a", flexShrink: 0 }} />
              <span style={{ color: "#16a34a", fontSize: 12 }}>Withdrawal submitted! Awaiting admin review.</span>
            </div>
          )}

          {/* ── Withdraw button ───────────────────────────────────── */}
          <button
            onClick={handleWithdraw}
            disabled={submitting}
            style={{
              width: "100%", padding: "15px", borderRadius: 12, border: "none",
              background: "#111", color: "#fff", fontSize: 15, fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {submitting && <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />}
            {submitting ? "Submitting…" : "Withdraw"}
          </button>
        </div>
      </div>

      {/* ── Currency Bottom Sheet ──────────────────────────────────── */}
      <AnimatePresence>
        {currencySheetOpen && (
          <>
            <motion.div
              key="cur-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCurrencySheetOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(0,0,0,0.5)" }}
            />
            <motion.div
              key="cur-sheet"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 71,
                background: "#fff", borderRadius: "16px 16px 0 0",
                maxHeight: "70vh", display: "flex", flexDirection: "column",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 12px" }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>Please select currency</span>
                <button onClick={() => setCurrencySheetOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#999", padding: 0 }}>
                  <X style={{ width: 20, height: 20 }} />
                </button>
              </div>
              <div style={{ overflowY: "auto", flex: 1 }}>
                {currencies.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCurrency(c)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "14px 20px", background: "none", border: "none", cursor: "pointer",
                      borderBottom: "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <CurrencyIcon symbol={c.symbol} iconUrl={c.iconUrl} size={28} />
                      <span style={{ fontSize: 15, fontWeight: 500, color: "#111" }}>{c.symbol}</span>
                    </div>
                    {c.symbol === selectedSymbol && (
                      <Check style={{ width: 18, height: 18, color: "#22c55e" }} />
                    )}
                  </button>
                ))}
                <div style={{ height: 24 }} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Network Bottom Sheet ───────────────────────────────────── */}
      <AnimatePresence>
        {networkSheetOpen && selectedCurrency && (
          <>
            <motion.div
              key="net-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setNetworkSheetOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(0,0,0,0.5)" }}
            />
            <motion.div
              key="net-sheet"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 71,
                background: "#fff", borderRadius: "16px 16px 0 0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 12px" }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>Select Network</span>
                <button onClick={() => setNetworkSheetOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#999", padding: 0 }}>
                  <X style={{ width: 20, height: 20 }} />
                </button>
              </div>
              {selectedCurrency.networks.map((net) => (
                <button
                  key={net}
                  onClick={() => { setSelectedNetwork(net); setNetworkSheetOpen(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 20px", background: "none", border: "none", cursor: "pointer",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 500, color: "#111" }}>{net}</span>
                  {net === selectedNetwork && (
                    <Check style={{ width: 18, height: 18, color: "#22c55e" }} />
                  )}
                </button>
              ))}
              <div style={{ height: 24 }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileWithdraw;
