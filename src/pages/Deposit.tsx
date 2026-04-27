import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronDown, ChevronRight, Copy, Check, Loader2, AlertCircle, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// ── Types ──────────────────────────────────────────────────────────────────
interface Currency {
  id: string;
  symbol: string;
  name: string;
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
  txHash?: string | null;
  status: string;
  createdAt: string;
}

type Mode = "manual" | "automatic";

// ── FAQ ───────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    question: "What should I do if the deposit does not arrive?",
    answer:
      "If your recharge information is confirmed but the assets have not yet arrived, the record can be queried on the blockchain. Because the block needs confirmation, there will be a delay before it syncs to the platform wallet. Please be patient.",
  },
  {
    question: "Why is my deposit being reviewed?",
    answer:
      "The platform occasionally flags transactions for review based on various security factors. This is to protect users from bad actors. The Platform understands these processes can be frustrating, but they are necessary to protect your assets.",
  },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-400",
  APPROVED: "text-green-400",
  REJECTED: "text-red-400",
  REVIEWING: "text-blue-400",
};

// ── Component ──────────────────────────────────────────────────────────────
const Deposit = () => {
  const { token } = useAuth();

  const [mode, setMode] = useState<Mode>("manual");

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [loadingDeposits, setLoadingDeposits] = useState(true);

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [networkOpen, setNetworkOpen] = useState(false);

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

  // Fetch deposit history
  const fetchDeposits = useCallback(async () => {
    if (!token) return;
    setLoadingDeposits(true);
    try {
      const res = await api.get<{ items: DepositRecord[] }>("/deposits/", token);
      setDeposits(res.items ?? []);
    } catch { setDeposits([]); }
    finally { setLoadingDeposits(false); }
  }, [token]);

  useEffect(() => { fetchDeposits(); }, [fetchDeposits]);

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
    if (!amount || !selectedSymbol || !token) return;
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
      fetchDeposits();
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Submission failed");
    } finally { setSubmitting(false); }
  };

  const dropdownBase = {
    border: "1px solid rgba(255,255,255,0.1)",
    background: "transparent",
  } as const;

  const resetMode = () => {
    setAmount(""); setVoucherUrl(""); setVoucherPreview("");
    setSubmitError(""); setSubmitSuccess(false);
  };

  return (
    <div className="min-h-screen" style={{ background: "#0b0b0e" }}>
      <div className="max-w-[1400px] mx-auto px-6 py-8">

        {/* Main card */}
        <div className="rounded-2xl p-10" style={{ background: "#111114", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex flex-col lg:flex-row gap-12">

            {/* Left column */}
            <div className="flex-1 max-w-xl">
              <h1 className="text-2xl font-bold text-white mb-8">Digital Currency Deposit</h1>

              {/* Currency dropdown */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-white mb-3">Currency</h3>
                <div className="relative">
                  <button
                    onClick={() => { setCurrencyOpen((v) => !v); setNetworkOpen(false); }}
                    className="w-full flex items-center justify-between rounded-xl px-4 py-3"
                    style={dropdownBase}
                  >
                    <span className="text-sm text-white/40">Select currency</span>
                    <div className="flex items-center gap-2">
                      {loadingCurrencies
                        ? <Loader2 className="w-4 h-4 animate-spin text-white/40" />
                        : <span className="text-sm text-white/70">{selectedCurrency?.symbol ?? ""}</span>
                      }
                      <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${currencyOpen ? "rotate-180" : ""}`} />
                    </div>
                  </button>
                  <AnimatePresence>
                    {currencyOpen && currencies.length > 0 && (
                      <motion.ul
                        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-20 w-full mt-1 rounded-xl overflow-hidden max-h-56 overflow-y-auto"
                        style={{ background: "#1a1a1e", border: "1px solid rgba(255,255,255,0.1)" }}
                      >
                        {currencies.map((c) => (
                          <li key={c.id}>
                            <button
                              className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors"
                              style={{ color: c.symbol === selectedSymbol ? "#22c55e" : "rgba(255,255,255,0.8)" }}
                              onClick={() => { setSelectedSymbol(c.symbol); setCurrencyOpen(false); }}
                            >
                              {c.symbol} — {c.name}
                            </button>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Network dropdown */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-white mb-3">Select Transfer Network</h3>
                <div className="relative">
                  <button
                    onClick={() => { setNetworkOpen((v) => !v); setCurrencyOpen(false); }}
                    disabled={loadingAddresses || !addressData}
                    className="w-full flex items-center justify-between rounded-xl px-4 py-3 disabled:opacity-50"
                    style={dropdownBase}
                  >
                    <span className="text-sm text-white/40">Select network</span>
                    <div className="flex items-center gap-2">
                      {loadingAddresses
                        ? <Loader2 className="w-4 h-4 animate-spin text-white/40" />
                        : <span className="text-sm text-white/70">{selectedNetwork}</span>
                      }
                      <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${networkOpen ? "rotate-180" : ""}`} />
                    </div>
                  </button>
                  <AnimatePresence>
                    {networkOpen && addressData && addressData.addresses.length > 0 && (
                      <motion.ul
                        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-20 w-full mt-1 rounded-xl overflow-hidden"
                        style={{ background: "#1a1a1e", border: "1px solid rgba(255,255,255,0.1)" }}
                      >
                        {addressData.addresses.map((a) => (
                          <li key={a.id}>
                            <button
                              className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors"
                              style={{ color: a.network === selectedNetwork ? "#22c55e" : "rgba(255,255,255,0.8)" }}
                              onClick={() => { setSelectedNetwork(a.network); setNetworkOpen(false); }}
                            >
                              {a.network}
                            </button>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Automatic mode: Deposit Quantity */}
              {mode === "automatic" && (
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-white mb-3">Deposit Quantity</h3>
                  <input
                    type="number"
                    min="0"
                    placeholder="Please enter the Deposit quantity"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                    style={dropdownBase}
                  />
                </div>
              )}

              {/* No addresses notice */}
              {!loadingAddresses && addressData && addressData.addresses.length === 0 && (
                <div className="rounded-xl px-4 py-4 flex items-center gap-3 mb-6"
                  style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
                  <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <p className="text-sm text-yellow-300">No deposit addresses configured for {selectedSymbol} yet.</p>
                </div>
              )}

              {/* Address + QR */}
              {activeAddress && (
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-white mb-3">Address</h3>
                  <div className="flex gap-6 items-start">
                    <div className="flex-1">
                      <textarea
                        readOnly
                        value={activeAddress.address}
                        rows={3}
                        className="w-full rounded-xl px-4 py-3 text-sm text-white/60 font-mono resize-none outline-none"
                        style={{ ...dropdownBase, lineHeight: "1.6" }}
                      />
                      <button
                        onClick={handleCopy}
                        className="mt-2 p-1 transition-colors"
                        style={{ color: copied ? "#22c55e" : "rgba(255,255,255,0.4)" }}
                        title="Copy address"
                      >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex items-center justify-center" style={{ background: "#fff", padding: "4px" }}>
                        {activeAddress.qrUrl
                          ? <img src={activeAddress.qrUrl} alt="QR" className="w-full h-full object-contain" />
                          : <span className="text-xs text-gray-400 text-center">No QR</span>
                        }
                      </div>
                      <span className="text-sm text-white/50 mt-2">{selectedSymbol}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Automatic mode: Transfer Voucher + Deposit button */}
              {mode === "automatic" && (
                <>
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-white mb-3">Transfer Voucher</h3>
                    <input
                      ref={voucherRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVoucherChange(f); e.target.value = ""; }}
                    />
                    <div
                      onClick={() => voucherRef.current?.click()}
                      className="w-full rounded-xl cursor-pointer flex items-center justify-center overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", minHeight: "180px" }}
                    >
                      {uploadingVoucher ? (
                        <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
                      ) : voucherPreview ? (
                        <img src={voucherPreview} alt="Voucher preview" className="max-h-64 object-contain" />
                      ) : (
                        <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center text-white/30">
                          <Plus className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  </div>

                  {submitError && (
                    <p className="mb-3 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {submitError}
                    </p>
                  )}
                  {submitSuccess && (
                    <p className="mb-3 text-xs text-green-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Deposit submitted! Awaiting confirmation.
                    </p>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !amount}
                    className="w-full py-3.5 rounded-xl text-base font-semibold transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: "#ffffff", color: "#0b0b0e" }}
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? "Submitting…" : "Deposit"}
                  </button>
                </>
              )}
            </div>

            {/* Right column */}
            <div className="flex-1 max-w-lg">
              <h2 className="text-xl font-bold text-white mb-5">Common problem</h2>
              <div className="mb-8">
                {FAQ_ITEMS.map((item, index) => (
                  <div key={index} className="border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <button
                      onClick={() => setOpenFaq((p) => (p === index ? null : index))}
                      className="w-full flex items-center justify-between py-4 text-left"
                    >
                      <span className="text-[15px] text-white/90 font-medium pr-4">{item.question}</span>
                      <motion.div animate={{ rotate: openFaq === index ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
                        {openFaq === index
                          ? <ChevronDown className="w-5 h-5 text-white/40" />
                          : <ChevronRight className="w-5 h-5 text-white/40" />}
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {openFaq === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="rounded-xl px-5 py-4 mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <p className="text-sm text-white/50 leading-relaxed">{item.answer}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              <h2 className="text-xl font-bold text-white mb-5">Other recharge methods</h2>
              <div className="grid grid-cols-2 gap-4">
                {/* Toggle card */}
                <div
                  onClick={() => { setMode((m) => m === "manual" ? "automatic" : "manual"); resetMode(); }}
                  className="rounded-xl p-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  style={{ border: "1px solid #22c55e" }}
                >
                  <h4 className="text-base font-semibold text-green-400 mb-2">
                    {mode === "manual" ? "Manual recharge" : "Automatic recharge"}
                  </h4>
                  <p className="text-sm text-white/40 leading-relaxed">
                    Replenish it in time when the balance is insufficient and enjoy the unoptimized service experience!
                  </p>
                </div>
                <div className="rounded-xl p-5" style={{ border: "1px solid #22c55e" }}>
                  <h4 className="text-base font-semibold text-green-400 mb-2">Cryptocurrency top-up</h4>
                  <p className="text-sm text-white/40 leading-relaxed">
                    How to deposit coins? Top up crypto account from my wallet using currency (like BTC, USDT, etc.)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent recharge records */}
        <div className="rounded-2xl mt-8 p-8" style={{ background: "#111114", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base text-white/70">Recent recharge records</h3>
            <button className="text-sm text-white hover:text-white/70 transition-colors">View history</button>
          </div>

          <div className="rounded-lg px-4 py-3 mb-2" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="grid grid-cols-6 gap-4">
              {["Type", "Currency", "Amount", "Handling fee", "Date", "State"].map((col) => (
                <span key={col} className="text-sm text-white/40">{col}</span>
              ))}
            </div>
          </div>

          {loadingDeposits ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
            </div>
          ) : deposits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-white/25">
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
          ) : (
            <div className="space-y-1">
              {deposits.map((d) => (
                <div key={d.id} className="grid grid-cols-6 gap-4 px-4 py-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                  <span className="text-sm text-white/50">Deposit</span>
                  <span className="text-sm text-white/80 font-medium">{d.currencySymbol}</span>
                  <span className="text-sm text-white/80">{d.amount.toLocaleString()}</span>
                  <span className="text-sm text-white/40">—</span>
                  <span className="text-xs text-white/40">{new Date(d.createdAt).toLocaleDateString()}</span>
                  <span className={`text-xs font-semibold ${STATUS_COLORS[d.status] ?? "text-white/50"}`}>{d.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Deposit;
