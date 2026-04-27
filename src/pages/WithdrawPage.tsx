import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronRight, ClipboardPaste, Loader2, AlertCircle, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const FAQ_ITEMS = [
  {
    question: "Why haven't my withdrawals arrived?",
    answer:
      "After you remit the money, the funds are already in the block and need to be confirmed by the block. The block confirmation time is not fixed. If the block is still not credited after confirmation, you need to contact the other platform for verification.",
  },
  {
    question: 'What is a "network address"?',
    answer:
      "A cryptocurrency address is a unique string of letters and numbers for a cryptocurrency wallet that can be used to send and receive cryptocurrency. This address indicates the wallet's location on the blockchain.",
  },
];

const RECORD_COLUMNS = ["Type", "Currency", "Amount", "Handling fee", "Date", "Address", "State"];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-400",
  APPROVED: "text-green-400",
  COMPLETED: "text-green-400",
  REJECTED: "text-red-400",
  CANCELLED: "text-red-400",
};

const COIN_COLORS: Record<string, string> = {
  BTC: "#f7931a",
  ETH: "#627eea",
  USDC: "#2775ca",
  USDT: "#26a17b",
  DAI: "#f5ac37",
  SOL: "#9945ff",
  BNB: "#f3ba2f",
};

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

interface WithdrawalRecord {
  id: string;
  currencySymbol: string;
  amount: number;
  fee: number;
  netAmount: number;
  toAddress: string;
  network?: string | null;
  status: string;
  createdAt: string;
}

const CoinIcon = ({ symbol, iconUrl, size = 28 }: { symbol: string; iconUrl?: string | null; size?: number }) => {
  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={symbol}
        width={size}
        height={size}
        className="rounded-full object-contain flex-shrink-0"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />
    );
  }
  const bg = COIN_COLORS[symbol] ?? "#555";
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-bold"
      style={{ width: size, height: size, background: bg, fontSize: Math.max(8, size * 0.38), color: "#fff" }}
    >
      {symbol.slice(0, 1)}
    </div>
  );
};

/** Show 0 as "0", otherwise show the full number string with no decimal truncation */
const formatBalance = (value: number): string => {
  if (!value || value === 0) return "0";
  // parseFloat strips trailing zeros from String conversion
  return parseFloat(value.toString()).toString();
};

/**
 * Display a calculated crypto amount cleanly:
 * – Removes floating-point noise (e.g. 99.99999999997 → 99.9999999999)
 * – Never truncates meaningful decimal places
 * – Shows 0 as "0"
 */
const formatCryptoAmount = (value: number): string => {
  if (value === 0) return "0";
  // toPrecision(12) kills floating-point noise while keeping ~12 sig-figs
  // parseFloat then removes any trailing zeros
  return parseFloat(value.toPrecision(12)).toString();
};

const WithdrawPage = () => {
  const { token } = useAuth();

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [networkOpen, setNetworkOpen] = useState(false);

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");

  // Validation errors
  const [amountError, setAmountError] = useState("");
  const [addressError, setAddressError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [records, setRecords] = useState<WithdrawalRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    api.get<Currency[]>("/markets/currencies")
      .then((list) => {
        const withdrawable = list.filter((c) => c.withdrawEnabled);
        setCurrencies(withdrawable);
        if (withdrawable.length > 0) {
          setSelectedSymbol(withdrawable[0].symbol);
          const nets = withdrawable[0].networks ?? [];
          if (nets.length > 0) setSelectedNetwork(nets[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCurrencies(false));
  }, []);

  useEffect(() => {
    if (!token) return;
    api.get<{ wallets: Wallet[] }>("/wallets", token)
      .then((res) => setWallets(res.wallets ?? []))
      .catch(() => {});
  }, [token]);

  const fetchRecords = useCallback(async () => {
    if (!token) return;
    setLoadingRecords(true);
    try {
      const res = await api.get<{ items: WithdrawalRecord[] }>("/withdrawals/", token);
      setRecords(res.items ?? []);
    } catch { setRecords([]); }
    finally { setLoadingRecords(false); }
  }, [token]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const selectedCurrency = currencies.find((c) => c.symbol === selectedSymbol);
  const spotWallet = wallets.find((w) => w.symbol === selectedSymbol && w.accountType === "SPOT");
  const spotBalance = spotWallet?.balance ?? 0;

  const numAmount = parseFloat(amount) || 0;

  // Use DB withdrawFeePct if it's > 0, otherwise fall back to 0.1%
  const feePct = selectedCurrency
    ? (selectedCurrency.withdrawFeePct > 0 ? selectedCurrency.withdrawFeePct : 0.1)
    : 0.1;

  const withdrawFee = selectedCurrency ? selectedCurrency.withdrawFee : 0;
  const fee = withdrawFee + (numAmount * feePct) / 100;
  const actualArrival = Math.max(0, numAmount - fee);

  const handleSelectCurrency = (c: Currency) => {
    setSelectedSymbol(c.symbol);
    setCurrencyOpen(false);
    setSelectedNetwork(c.networks?.[0] ?? "");
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
      setAmountError(`Insufficient balance. Your available ${selectedSymbol} balance is ${formatBalance(spotBalance)}`);
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
      fetchRecords();
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Withdrawal failed");
    } finally { setSubmitting(false); }
  };

  const dropdownStyle = {
    border: "1px solid rgba(255,255,255,0.1)",
    background: "transparent",
  } as const;

  return (
    <div className="min-h-screen" style={{ background: "#0b0b0e" }}>
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div
          className="rounded-2xl p-10"
          style={{ background: "#111114", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left */}
            <div className="flex-1 max-w-xl">
              <h1 className="text-3xl font-bold text-white mb-5">Digital Currency Withdraw</h1>

              {/* Balance */}
              <div className="flex items-center gap-3 mb-8">
                {selectedCurrency
                  ? <CoinIcon symbol={selectedCurrency.symbol} iconUrl={selectedCurrency.iconUrl} size={32} />
                  : <div className="w-8 h-8 rounded-full bg-white/10" />
                }
                <span className="text-base text-white/80">
                  Balance {formatBalance(spotBalance)} {selectedSymbol}
                </span>
              </div>

              {/* Currency dropdown */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-white mb-3">Currency</h3>
                <div className="relative">
                  <button
                    onClick={() => { setCurrencyOpen((v) => !v); setNetworkOpen(false); }}
                    className="w-full flex items-center rounded-xl px-4 py-3"
                    style={dropdownStyle}
                  >
                    {loadingCurrencies ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white/40 mr-3" />
                    ) : selectedCurrency ? (
                      <CoinIcon symbol={selectedCurrency.symbol} iconUrl={selectedCurrency.iconUrl} size={28} />
                    ) : null}
                    <span className="text-sm text-white/70 flex-1 text-center">{selectedSymbol}</span>
                    <ChevronDown className={`w-4 h-4 text-white/40 flex-shrink-0 transition-transform ${currencyOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {currencyOpen && currencies.length > 0 && (
                      <motion.ul
                        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-20 w-full mt-1 rounded-xl overflow-hidden max-h-64 overflow-y-auto"
                        style={{ background: "#1a1a1e", border: "1px solid rgba(255,255,255,0.1)" }}
                      >
                        {currencies.map((c) => (
                          <li key={c.id}>
                            <button
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                              style={{ background: c.symbol === selectedSymbol ? "rgba(255,255,255,0.05)" : "transparent" }}
                              onClick={() => handleSelectCurrency(c)}
                            >
                              <CoinIcon symbol={c.symbol} iconUrl={c.iconUrl} size={24} />
                              <span className="text-sm" style={{ color: c.symbol === selectedSymbol ? "#fff" : "rgba(255,255,255,0.7)" }}>
                                {c.symbol}
                              </span>
                            </button>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Network dropdown */}
              {selectedCurrency && (selectedCurrency.networks?.length ?? 0) > 0 && (
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-white mb-3">Select Transfer Network</h3>
                  <div className="relative">
                    <button
                      onClick={() => { setNetworkOpen((v) => !v); setCurrencyOpen(false); }}
                      className="w-full flex items-center justify-center rounded-xl px-4 py-3 relative"
                      style={dropdownStyle}
                    >
                      <span className="text-sm text-white/70">{selectedNetwork}</span>
                      <ChevronDown className={`w-4 h-4 text-white/40 absolute right-4 transition-transform ${networkOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {networkOpen && (
                        <motion.ul
                          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute z-20 w-full mt-1 rounded-xl overflow-hidden"
                          style={{ background: "#1a1a1e", border: "1px solid rgba(255,255,255,0.1)" }}
                        >
                          {selectedCurrency.networks.map((net) => (
                            <li key={net}>
                              <button
                                className="w-full text-center px-4 py-3 text-sm hover:bg-white/5 transition-colors"
                                style={{ color: net === selectedNetwork ? "#fff" : "rgba(255,255,255,0.7)" }}
                                onClick={() => { setSelectedNetwork(net); setNetworkOpen(false); }}
                              >
                                {net}
                              </button>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Withdrawal Quantity */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-white mb-3">Withdrawal Quantity</h3>
                <div
                  className="flex items-center rounded-xl px-4 py-3"
                  style={{
                    border: amountError ? "1px solid rgba(239,68,68,0.6)" : "1px solid rgba(255,255,255,0.1)",
                    background: "transparent",
                  }}
                >
                  <input
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (e.target.value) setAmountError("");
                    }}
                    placeholder="Please enter the withdrawal amount"
                    className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                  />
                  <button
                    onClick={() => {
                      setAmount(spotBalance > 0 ? parseFloat(spotBalance.toPrecision(12)).toString() : "0");
                      setAmountError("");
                    }}
                    className="text-sm font-semibold text-white/80 hover:text-white transition-colors flex-shrink-0 ml-3"
                  >
                    All
                  </button>
                </div>
                {amountError && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {amountError}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="mb-4">
                <h3 className="text-base font-semibold text-white mb-3">Address</h3>
                <div
                  className="flex items-center rounded-xl px-4 py-3"
                  style={{
                    border: addressError ? "1px solid rgba(239,68,68,0.6)" : "1px solid rgba(255,255,255,0.1)",
                    background: "transparent",
                  }}
                >
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (e.target.value.trim()) setAddressError("");
                    }}
                    placeholder="Enter wallet address"
                    className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                  />
                  <button
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        setAddress(text);
                        if (text.trim()) setAddressError("");
                      } catch {}
                    }}
                    className="text-green-400 hover:text-green-300 transition-colors flex-shrink-0 ml-3"
                  >
                    <ClipboardPaste className="w-4 h-4" />
                  </button>
                </div>
                {addressError && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {addressError}
                  </p>
                )}
              </div>

              {/* Fee info */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-white/40">Service Charge {feePct}%</span>
                <span className="text-sm text-white/40">
                  Actual Arrival: {numAmount > 0 ? formatCryptoAmount(actualArrival) : "0"} {selectedSymbol}
                </span>
              </div>

              {submitError && (
                <p className="mb-3 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {submitError}
                </p>
              )}
              {submitSuccess && (
                <p className="mb-3 text-xs text-green-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Withdrawal submitted! Awaiting admin review.
                </p>
              )}

              {/* Withdraw button */}
              <button
                onClick={handleWithdraw}
                disabled={submitting}
                className="w-full py-3 rounded-xl text-base font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "#fff", color: "#000" }}
                onMouseEnter={(e) => { if (!submitting) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.85)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Submitting…" : "Withdraw"}
              </button>
            </div>

            {/* Right */}
            <div className="flex-1 max-w-lg">
              <h2 className="text-xl font-bold text-white mb-5">Common problem</h2>
              <div className="space-y-0">
                {FAQ_ITEMS.map((item, index) => (
                  <div key={index} className="border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <button
                      onClick={() => setOpenFaq((prev) => (prev === index ? null : index))}
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
            </div>
          </div>
        </div>

        {/* Records table */}
        <div className="rounded-2xl mt-8 p-8" style={{ background: "#111114", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base text-white/70">Recent withdrawal records</h3>
            <button className="text-sm text-white hover:text-white/70 transition-colors">View history</button>
          </div>

          <div className="rounded-lg px-4 py-3 mb-4" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="grid grid-cols-7 gap-4">
              {RECORD_COLUMNS.map((col) => (
                <span key={col} className="text-sm text-white/40">{col}</span>
              ))}
            </div>
          </div>

          {loadingRecords ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
            </div>
          ) : records.length === 0 ? (
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
              {records.map((r) => (
                <div key={r.id} className="grid grid-cols-7 gap-4 px-4 py-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                  <span className="text-sm text-white/50">Withdraw</span>
                  <span className="text-sm text-white/80 font-medium">{r.currencySymbol}</span>
                  <span className="text-sm text-white/80">{formatCryptoAmount(r.amount)}</span>
                  <span className="text-sm text-white/40">{formatCryptoAmount(r.fee)}</span>
                  <span className="text-xs text-white/40">{new Date(r.createdAt).toLocaleDateString()}</span>
                  <span className="text-xs text-white/40 truncate" title={r.toAddress}>{r.toAddress.slice(0, 10)}…</span>
                  <span className={`text-xs font-semibold ${STATUS_COLORS[r.status] ?? "text-white/50"}`}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawPage;
