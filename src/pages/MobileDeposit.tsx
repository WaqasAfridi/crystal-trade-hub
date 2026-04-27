import { useState, useEffect, useCallback, useRef } from "react";
import { MOBILE_BOTTOM_NAV_H } from "@/components/mobile/MobileBottomNav";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Check, Loader2, AlertCircle, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// ── Types ──────────────────────────────────────────────────────────────────
interface Currency {
  id: string;
  symbol: string;
  name: string;
  iconUrl?: string | null;
  depositEnabled: boolean;
}

interface DepositAddress {
  id: string;
  network: string;
  address: string;
  qrUrl?: string | null;
}

interface AddressData {
  currency: { symbol: string; name: string };
  addresses: DepositAddress[];
}

interface DepositRecord {
  id: string;
  currencySymbol: string;
  amount: number;
  network?: string | null;
  status: string;
  createdAt: string;
}

type Tab = "automatic" | "manual";

// ── Clipboard SVG icon ─────────────────────────────────────────────────────
const ClipboardHistoryIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect x="6" y="3" width="10" height="3" rx="1.5" stroke="white" strokeWidth="1.6"/>
    <rect x="4" y="5" width="14" height="14" rx="2" stroke="white" strokeWidth="1.6"/>
    <line x1="8" y1="10" x2="14" y2="10" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="8" y1="13" x2="12" y2="13" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

// ── Voucher placeholder SVG ────────────────────────────────────────────────
const VoucherPlaceholder = () => (
  <svg width="120" height="88" viewBox="0 0 120 88" fill="none">
    <rect x="12" y="8" width="72" height="72" rx="4" fill="none" stroke="rgba(100,160,220,0.35)" strokeWidth="1.5" strokeDasharray="4 3"/>
    <circle cx="36" cy="44" r="16" fill="none" stroke="rgba(100,160,220,0.5)" strokeWidth="1.5"/>
    <path d="M28 44 Q36 36 44 44 Q36 52 28 44Z" fill="rgba(100,160,220,0.3)" stroke="rgba(100,160,220,0.5)" strokeWidth="1"/>
    <circle cx="36" cy="44" r="5" fill="none" stroke="rgba(100,160,220,0.6)" strokeWidth="1.5"/>
    <line x1="56" y1="34" x2="76" y2="34" stroke="rgba(100,160,220,0.4)" strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="56" y1="41" x2="80" y2="41" stroke="rgba(100,160,220,0.3)" strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="56" y1="48" x2="74" y2="48" stroke="rgba(100,160,220,0.3)" strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="56" y1="55" x2="70" y2="55" stroke="rgba(100,160,220,0.25)" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="92" cy="62" r="14" fill="none" stroke="rgba(100,160,220,0.4)" strokeWidth="1.5"/>
    <path d="M84 62 Q92 54 100 62 Q92 70 84 62Z" fill="rgba(100,160,220,0.15)" stroke="rgba(100,160,220,0.4)" strokeWidth="1"/>
    <circle cx="92" cy="62" r="4" fill="rgba(100,160,220,0.25)" stroke="rgba(100,160,220,0.5)" strokeWidth="1"/>
    <path d="M86 70 L88 76 L92 74 L96 76 L98 70" fill="none" stroke="rgba(100,160,220,0.4)" strokeWidth="1.3" strokeLinejoin="round"/>
  </svg>
);

// ── Currency icon fallback ─────────────────────────────────────────────────
const SYMBOL_COLORS: Record<string, string> = {
  USDT: "#26a17b", BTC: "#f7931a", ETH: "#627eea",
  BNB: "#f0b90b", XRP: "#346aa9", SHIB: "#e8a806",
  DAI: "#f5a623", USDC: "#2775ca",
};

const CurrencyIcon = ({ symbol, iconUrl, size = 28 }: { symbol: string; iconUrl?: string | null; size?: number }) => {
  const [err, setErr] = useState(false);
  const localMap: Record<string, string> = {
    BTC: "/crypto-logos/btc.svg", ETH: "/crypto-logos/eth.svg",
    XRP: "/crypto-logos/xrp.svg", BNB: "/crypto-logos/bnb.svg",
    LTC: "/crypto-logos/ltc.svg",
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
      fontSize: size * 0.36, fontWeight: 700, color: "#fff", flexShrink: 0,
    }}>
      {symbol.slice(0, 2)}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  MobileDeposit
// ═══════════════════════════════════════════════════════════════════════════
const MobileDeposit = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [tab, setTab] = useState<Tab>("automatic");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [currencySheetOpen, setCurrencySheetOpen] = useState(false);
  const [networkSheetOpen, setNetworkSheetOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Manual tab state
  const [amount, setAmount] = useState("");
  const [voucherUrl, setVoucherUrl] = useState("");
  const [voucherPreview, setVoucherPreview] = useState("");
  const [uploadingVoucher, setUploadingVoucher] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const voucherRef = useRef<HTMLInputElement>(null);

  // Fetch currencies
  useEffect(() => {
    api.get<Currency[]>("/markets/currencies")
      .then((list) => {
        const depositable = list.filter((c) => c.depositEnabled);
        setCurrencies(depositable);
        if (depositable.length > 0) setSelectedSymbol(depositable[0].symbol);
      })
      .catch(() => {})
      .finally(() => setLoadingCurrencies(false));
  }, []);

  // Fetch addresses when currency changes
  const fetchAddresses = useCallback(async (symbol: string) => {
    if (!symbol || !token) return;
    setLoadingAddresses(true);
    setAddressData(null);
    setSelectedNetwork("");
    try {
      const data = await api.get<AddressData>(`/deposits/addresses/${symbol}`, token);
      setAddressData(data);
      if (data.addresses.length > 0) setSelectedNetwork(data.addresses[0].network);
    } catch {
      setAddressData(null);
    } finally {
      setLoadingAddresses(false);
    }
  }, [token]);

  useEffect(() => { if (selectedSymbol) fetchAddresses(selectedSymbol); }, [selectedSymbol, fetchAddresses]);

  const selectedCurrency = currencies.find((c) => c.symbol === selectedSymbol);
  const activeAddress = addressData?.addresses.find((a) => a.network === selectedNetwork);

  const handleCopy = () => {
    if (!activeAddress?.address) return;
    navigator.clipboard.writeText(activeAddress.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVoucherChange = async (file: File) => {
    setVoucherPreview(URL.createObjectURL(file));
    setUploadingVoucher(true);
    try {
      const fd = new FormData();
      fd.append("voucher", file);
      const res = await fetch(
        `${(import.meta as any).env?.VITE_API_URL ?? "http://localhost:4000"}/api/deposits/upload-voucher`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd },
      );
      const json = await res.json();
      setVoucherUrl(json?.data?.url ?? "");
    } catch { setVoucherUrl(""); }
    finally { setUploadingVoucher(false); }
  };

  const handleSubmit = async () => {
    if (!amount || !selectedSymbol || !token || !voucherUrl) return;
    setSubmitError("");
    setSubmitting(true);
    try {
      await api.post("/deposits/", {
        currencySymbol: selectedSymbol,
        amount: parseFloat(amount),
        network: selectedNetwork || undefined,
        toAddress: activeAddress?.address || undefined,
        voucherUrl: voucherUrl || undefined,
      }, token);
      setSubmitSuccess(true);
      setAmount(""); setVoucherUrl(""); setVoucherPreview("");
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Submission failed");
    } finally { setSubmitting(false); }
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setAmount(""); setVoucherUrl(""); setVoucherPreview("");
    setSubmitError(""); setSubmitSuccess(false);
  };

  // ── Shared QR + fields content ─────────────────────────────────────────
  const QrAndFields = () => (
    <>
      {/* QR Code */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0 8px" }}>
        <div style={{
          width: 160, height: 160, background: "#fff", borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 6, flexShrink: 0,
        }}>
          {loadingAddresses ? (
            <Loader2 style={{ color: "#999" }} className="w-8 h-8 animate-spin" />
          ) : activeAddress?.qrUrl ? (
            <img src={activeAddress.qrUrl} alt="QR" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="2" stroke="#ccc" strokeWidth="2"/>
                <rect x="8" y="8" width="8" height="8" fill="#ccc"/>
                <rect x="28" y="4" width="16" height="16" rx="2" stroke="#ccc" strokeWidth="2"/>
                <rect x="32" y="8" width="8" height="8" fill="#ccc"/>
                <rect x="4" y="28" width="16" height="16" rx="2" stroke="#ccc" strokeWidth="2"/>
                <rect x="8" y="32" width="8" height="8" fill="#ccc"/>
                <line x1="28" y1="28" x2="44" y2="28" stroke="#ccc" strokeWidth="2"/>
                <line x1="28" y1="36" x2="36" y2="36" stroke="#ccc" strokeWidth="2"/>
                <line x1="40" y1="36" x2="44" y2="36" stroke="#ccc" strokeWidth="2"/>
                <line x1="28" y1="44" x2="44" y2="44" stroke="#ccc" strokeWidth="2"/>
              </svg>
              <span style={{ fontSize: 10, color: "#aaa", textAlign: "center" }}>No QR</span>
            </div>
          )}
        </div>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 12, textAlign: "center", lineHeight: 1.5 }}>
          Copy your unique address or use QR code to deposit
        </p>
      </div>

      {/* 1. Currency */}
      <div style={{ padding: "0 16px 12px" }}>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginBottom: 8 }}>1.Currency</p>
        <button
          onClick={() => setCurrencySheetOpen(true)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10, padding: "12px 14px", cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {loadingCurrencies
              ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: "rgba(255,255,255,0.4)" }} />
              : selectedCurrency
                ? <CurrencyIcon symbol={selectedCurrency.symbol} iconUrl={selectedCurrency.iconUrl} size={24} />
                : null
            }
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 500 }}>
              {selectedCurrency?.symbol ?? "Select"}
            </span>
          </div>
          <ChevronRight style={{ color: "rgba(255,255,255,0.3)", width: 18, height: 18 }} />
        </button>
      </div>

      {/* 2. Network */}
      <div style={{ padding: "0 16px 12px" }}>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginBottom: 8 }}>2.Network</p>
        <button
          onClick={() => addressData && addressData.addresses.length > 0 && setNetworkSheetOpen(true)}
          disabled={loadingAddresses || !addressData}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10, padding: "12px 14px", cursor: "pointer", opacity: (!addressData || loadingAddresses) ? 0.5 : 1,
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 500 }}>
            {loadingAddresses ? "Loading…" : (selectedNetwork || "—")}
          </span>
          <ChevronRight style={{ color: "rgba(255,255,255,0.3)", width: 18, height: 18 }} />
        </button>
      </div>

      {/* No addresses notice */}
      {!loadingAddresses && addressData && addressData.addresses.length === 0 && (
        <div style={{ margin: "0 16px 12px", background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)", borderRadius: 10, padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <AlertCircle style={{ width: 15, height: 15, color: "#fbbf24", flexShrink: 0, marginTop: 1 }} />
          <p style={{ color: "#fde68a", fontSize: 12, lineHeight: 1.5 }}>
            No deposit addresses configured for {selectedSymbol} yet.
          </p>
        </div>
      )}

      {/* 3. Address */}
      {activeAddress && (
        <div style={{ padding: "0 16px 12px" }}>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginBottom: 8 }}>3.Address</p>
          <div style={{
            background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
          }}>
            <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, fontFamily: "monospace", wordBreak: "break-all", flex: 1, lineHeight: 1.5 }}>
              {activeAddress.address}
            </span>
            <button onClick={handleCopy} style={{ flexShrink: 0, color: copied ? "#22c55e" : "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              {copied ? <Check style={{ width: 18, height: 18 }} /> : <Copy style={{ width: 18, height: 18 }} />}
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* ── Full-screen overlay ─────────────────────────────────────── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 60,
        background: "#0b0b0e", display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>

        {/* ── Custom Header ─────────────────────────────────────────── */}
        <header style={{
          height: 48, flexShrink: 0, display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 16px",
          background: "#0b0b0e", borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{ color: "#fff", background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}
          >
            <ArrowLeft style={{ width: 22, height: 22 }} />
          </button>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>Deposit</span>
          <button
            onClick={() => navigate("/assets/funding-records")}
            style={{ color: "#fff", background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}
          >
            <ClipboardHistoryIcon />
          </button>
        </header>

        {/* ── Tabs ──────────────────────────────────────────────────── */}
        <div style={{
          flexShrink: 0, padding: "10px 16px",
          background: "#0b0b0e",
        }}>
          <div style={{
            display: "flex", background: "#1a1a1f", borderRadius: 10, padding: 3, gap: 2,
          }}>
            {(["automatic", "manual"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                style={{
                  flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                  border: "none", cursor: "pointer", transition: "all 0.2s",
                  background: tab === t ? "#fff" : "transparent",
                  color: tab === t ? "#0b0b0e" : "rgba(255,255,255,0.45)",
                }}
              >
                {t === "automatic" ? "Automatic Recharge" : "Manual Recharge"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable Content ────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch" as any }}>

          {/* ── AUTOMATIC RECHARGE TAB ──────────────────────────────── */}
          {tab === "automatic" && (
            <div style={{ paddingBottom: 32 }}>
              <QrAndFields />
            </div>
          )}

          {/* ── MANUAL RECHARGE TAB ─────────────────────────────────── */}
          {tab === "manual" && (
            <div>
              <QrAndFields />

              {/* Deposit Quantity */}
              <div style={{ padding: "0 16px 12px" }}>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginBottom: 8 }}>Deposit Quantity</p>
                <div style={{
                  background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10, padding: "12px 14px",
                }}>
                  <input
                    type="number"
                    min="0"
                    placeholder="Please enter the deposit quantity"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{
                      width: "100%", background: "transparent", border: "none", outline: "none",
                      color: "#fff", fontSize: 14,
                    }}
                  />
                </div>
              </div>

              {/* Transfer Voucher */}
              <div style={{ padding: "0 16px 16px" }}>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginBottom: 8 }}>Transfer Voucher</p>
                <input
                  ref={voucherRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVoucherChange(f); e.target.value = ""; }}
                />
                <div
                  onClick={() => voucherRef.current?.click()}
                  style={{
                    background: "#1a1a1f", border: "2px dashed rgba(100,160,220,0.25)",
                    borderRadius: 10, minHeight: 160, display: "flex", alignItems: "center",
                    justifyContent: "center", cursor: "pointer", overflow: "hidden",
                  }}
                >
                  {uploadingVoucher ? (
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: "rgba(255,255,255,0.3)" }} />
                  ) : voucherPreview ? (
                    <img src={voucherPreview} alt="Voucher" style={{ maxHeight: 200, objectFit: "contain" }} />
                  ) : (
                    <VoucherPlaceholder />
                  )}
                </div>
              </div>

              {submitError && (
                <div style={{ margin: "0 16px 8px", display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertCircle style={{ width: 14, height: 14, color: "#f87171" }} />
                  <span style={{ color: "#f87171", fontSize: 12 }}>{submitError}</span>
                </div>
              )}
              {submitSuccess && (
                <div style={{ margin: "0 16px 8px", display: "flex", alignItems: "center", gap: 6 }}>
                  <Check style={{ width: 14, height: 14, color: "#4ade80" }} />
                  <span style={{ color: "#4ade80", fontSize: 12 }}>Deposit submitted! Awaiting confirmation.</span>
                </div>
              )}

              {/* Deposit button — normal page flow */}
              <div style={{ padding: `16px 16px ${MOBILE_BOTTOM_NAV_H + 24}px` }}>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !amount || !voucherUrl}
                  style={{
                    width: "100%", padding: "15px", borderRadius: 12, border: "none",
                    background: "#ffffff", color: "#0b0b0e", fontSize: 15, fontWeight: 600,
                    cursor: submitting || !amount || !voucherUrl ? "not-allowed" : "pointer",
                    opacity: submitting || !amount || !voucherUrl ? 0.5 : 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? "Submitting…" : "Deposit"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Currency Bottom Sheet ──────────────────────────────────── */}
      <AnimatePresence>
        {currencySheetOpen && (
          <>
            <motion.div
              key="currency-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCurrencySheetOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(0,0,0,0.5)" }}
            />
            <motion.div
              key="currency-sheet"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 71,
                background: "#fff", borderRadius: "16px 16px 0 0",
                maxHeight: "70vh", display: "flex", flexDirection: "column",
              }}
            >
              {/* Sheet header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 12px" }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>Please select currency</span>
                <button onClick={() => setCurrencySheetOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#999", padding: 0 }}>
                  <X style={{ width: 20, height: 20 }} />
                </button>
              </div>

              {/* Warning note */}
              <div style={{ margin: "0 16px 12px", background: "#f8f9fb", borderRadius: 8, padding: "10px 14px" }}>
                <p style={{ color: "#888", fontSize: 12, lineHeight: 1.6 }}>
                  Please note that the system will only display the networks supported on this platform. If you recharge through other networks, your assets may be lost.
                </p>
              </div>

              {/* Currency list */}
              <div style={{ overflowY: "auto", flex: 1 }}>
                {currencies.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedSymbol(c.symbol); setCurrencySheetOpen(false); }}
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Network Bottom Sheet ───────────────────────────────────── */}
      <AnimatePresence>
        {networkSheetOpen && addressData && (
          <>
            <motion.div
              key="network-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setNetworkSheetOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(0,0,0,0.5)" }}
            />
            <motion.div
              key="network-sheet"
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
              {addressData.addresses.map((a) => (
                <button
                  key={a.id}
                  onClick={() => { setSelectedNetwork(a.network); setNetworkSheetOpen(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 20px", background: "none", border: "none", cursor: "pointer",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 500, color: "#111" }}>{a.network}</span>
                  {a.network === selectedNetwork && (
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

export default MobileDeposit;
