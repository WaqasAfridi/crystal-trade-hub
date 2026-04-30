import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

const COINS = ["USDT", "BTC", "ETH", "USDC"] as const;
type Coin = (typeof COINS)[number];

/* ─── Account types ──────────────────────────────────────────── */
type AccountType = "SPOT" | "FUTURES" | "EARN";

const ACCOUNT_OPTIONS: { value: AccountType; label: string; sub: string }[] = [
  { value: "SPOT",    label: "Spot Account",    sub: "For spot trading"      },
  { value: "FUTURES", label: "Trading Account",  sub: "For futures / options" },
  { value: "EARN",    label: "Finance Account",  sub: "For earn / staking"    },
];

/* ─── Real SVG crypto icons ───────────────────────────────────── */
const CoinIcon = ({ coin, size = 28 }: { coin: Coin; size?: number }) => {
  switch (coin) {
    case "USDT":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#26A17B" />
          <path
            d="M18 13.5v-1.6h3.8V9.5H10.2V12H14v1.5C10.3 13.7 7.8 14.6 7.8 15.6s2.5 1.9 6.2 2.1V23h3.8v-5.3c3.7-.2 6.2-1.1 6.2-2.1s-2.5-1.9-6-2.1z"
            fill="#fff"
          />
        </svg>
      );
    case "BTC":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#F7931A" />
          <path
            d="M22.7 14.4c.3-2.1-1.3-3.2-3.4-4l.7-2.7-1.7-.5-.7 2.7-.9-.2.7-2.7-1.7-.4-.7 2.7-.5-.1-2.4-.6-.5 1.9 1.3.3c.7.2.9.7.8 1.1l-.9 3.6.1.1h-.1l-1.2 4.7c-.1.2-.3.5-.8.4 0 0-1.3-.3-1.3-.3l-.8 2 2.3.6.7.2-.7 2.8 1.7.4.7-2.7.9.2-.7 2.7 1.7.4.7-2.7c2.9.5 5.1.3 6-2.3.7-2.1-.1-3.3-1.6-4.1 1.2-.3 2-.9 2.2-2.4zm-4 5.6c-.5 2-4 .9-5.1.6l.9-3.6c1.1.3 4.7.9 4.2 3zm.5-5.6c-.5 1.9-3.4.9-4.4.7l.8-3.2c1 .3 4.2.7 3.6 2.5z"
            fill="#fff"
          />
        </svg>
      );
    case "ETH":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#627EEA" />
          <path d="M16.498 6.5l-.13.44v11.66l.13.13 5.92-3.5z" fill="#fff" opacity=".6" />
          <path d="M16.498 6.5L10.578 15.23l5.92 3.5V6.5z" fill="#fff" />
          <path d="M16.498 20.8l-.07.09v4.54l.07.21 5.92-8.34z" fill="#fff" opacity=".6" />
          <path d="M16.498 25.64V20.8l-5.92-3.49z" fill="#fff" />
          <path d="M16.498 19.23l5.92-3.5-5.92-2.69z" fill="#fff" opacity=".2" />
          <path d="M10.578 15.73l5.92 3.5v-6.19z" fill="#fff" opacity=".6" />
        </svg>
      );
    case "USDC":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#2775CA" />
          <path
            d="M19.9 18c0-2.1-1.3-2.8-3.8-3.1-1.8-.2-2.1-.7-2.1-1.5 0-.9.6-1.4 1.9-1.4 1.1 0 1.7.4 2 1.3.1.2.3.3.5.3h1c.3 0 .5-.2.5-.5v-.1c-.3-1.4-1.3-2.4-2.9-2.7V9.1c0-.3-.2-.5-.5-.6h-1c-.3 0-.5.2-.5.6v1.3c-1.9.3-3.2 1.5-3.2 3.1 0 2 1.2 2.7 3.7 3 1.8.2 2.2.8 2.2 1.6 0 .9-.7 1.4-2 1.4-1.5 0-2-.6-2.2-1.5 0-.2-.2-.4-.5-.4h-1c-.3 0-.5.2-.5.5v.1c.3 1.5 1.2 2.5 3.2 2.8v1.3c0 .3.2.5.5.6h1c.3 0 .5-.2.5-.6V21c2-.3 3.2-1.5 3.2-3z"
            fill="#fff"
          />
        </svg>
      );
  }
};

/* ─── Dropdown ────────────────────────────────────────────────── */
const CoinDropdown = ({
  value,
  onChange,
  exclude,
  open,
  setOpen,
}: {
  value: Coin;
  onChange: (c: Coin) => void;
  exclude: Coin;
  open: boolean;
  setOpen: (v: boolean) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, setOpen]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <CoinIcon coin={value} size={24} />
        <span style={{ fontSize: 14, fontWeight: 500, color: "#222" }}>{value}</span>
        <ChevronDown
          style={{
            width: 14,
            height: 14,
            color: "#aaa",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.15s",
          }}
        />
      </div>

      {/* Menu */}
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            zIndex: 200,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            boxShadow: "0 6px 20px rgba(0,0,0,0.10)",
            minWidth: 140,
            overflow: "hidden",
          }}
        >
          {COINS.filter((c) => c !== exclude).map((coin) => (
            <div
              key={coin}
              onClick={() => {
                onChange(coin);
                setOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                cursor: "pointer",
                background: value === coin ? "#f5f5f5" : "#fff",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#f9fafb";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  value === coin ? "#f5f5f5" : "#fff";
              }}
            >
              <CoinIcon coin={coin} size={26} />
              <span style={{ fontSize: 14, fontWeight: 500, color: "#222" }}>
                {coin}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════ */

const ConvertPage = () => {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  /* ── Account selector — read from URL ?account=SPOT|FUTURES|EARN ── */
  const rawAccount = searchParams.get("account") as AccountType | null;
  const validAccounts: AccountType[] = ["SPOT", "FUTURES", "EARN"];
  const [accountType, setAccountType] = useState<AccountType>(
    rawAccount && validAccounts.includes(rawAccount) ? rawAccount : "SPOT"
  );
  const [accountDropOpen, setAccountDropOpen] = useState(false);
  const accountDropRef = useRef<HTMLDivElement>(null);

  // Keep URL in sync when user switches account via the selector
  const switchAccount = (acc: AccountType) => {
    setAccountType(acc);
    setSearchParams({ account: acc }, { replace: true });
    setFromAmount("");
    setQuote(null);
    setAccountDropOpen(false);
  };

  // Close account dropdown on outside click
  useEffect(() => {
    if (!accountDropOpen) return;
    const handler = (e: MouseEvent) => {
      if (accountDropRef.current && !accountDropRef.current.contains(e.target as Node))
        setAccountDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [accountDropOpen]);

  const [fromCoin, setFromCoin] = useState<Coin>("USDT");
  const [toCoin, setToCoin] = useState<Coin>("USDC");
  const [fromAmount, setFromAmount] = useState("");
  const [fromDropOpen, setFromDropOpen] = useState(false);
  const [toDropOpen, setToDropOpen] = useState(false);

  const [quote, setQuote] = useState<{
    toAmount: number;
    rate: number;
    fee: number;
  } | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // wallets keyed by accountType then symbol: { SPOT: { USDT: 100, BTC: 0.5 }, FUTURES: {...}, EARN: {...} }
  const [walletsByAccount, setWalletsByAccount] = useState<Record<AccountType, Record<string, number>>>({
    SPOT: {}, FUTURES: {}, EARN: {},
  });

  const quoteTimer = useRef<ReturnType<typeof setTimeout>>();

  /* ── Load all account wallets ─────────────────── */
  const loadWallets = useCallback(() => {
    if (!token) return;
    api
      .get<any>("/wallets/by-account", token)
      .then((data) => {
        const build = (arr: any[]) => {
          const map: Record<string, number> = {};
          (arr ?? []).forEach((w: any) => { map[w.symbol] = w.balance; });
          return map;
        };
        setWalletsByAccount({
          SPOT:    build(data?.SPOT    ?? []),
          FUTURES: build(data?.FUTURES ?? []),
          EARN:    build(data?.EARN    ?? []),
        });
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => { loadWallets(); }, [loadWallets]);

  // Available balance for the currently selected coin in the current account
  const available = walletsByAccount[accountType]?.[fromCoin] ?? 0;

  /* ── Live quote ──────────────────────────────────── */
  useEffect(() => {
    setQuote(null);
    clearTimeout(quoteTimer.current);
    const amt = parseFloat(fromAmount);
    if (!amt || amt <= 0 || !token) return;
    quoteTimer.current = setTimeout(async () => {
      setQuoting(true);
      try {
        const q = await api.post<any>(
          "/conversions/quote",
          { fromSymbol: fromCoin, toSymbol: toCoin, fromAmount: amt, accountType },
          token
        );
        setQuote({ toAmount: q.toAmount, rate: q.rate, fee: q.fee });
      } catch {}
      setQuoting(false);
    }, 500);
    return () => clearTimeout(quoteTimer.current);
  }, [fromAmount, fromCoin, toCoin, accountType, token]);

  /* ── Swap ────────────────────────────────────────── */
  const handleSwap = () => {
    setFromCoin(toCoin);
    setToCoin(fromCoin);
    setFromAmount("");
    setQuote(null);
  };

  const handleFromCoinChange = (c: Coin) => {
    if (c === toCoin) setToCoin(fromCoin);
    setFromCoin(c);
    setFromAmount("");
    setQuote(null);
  };

  const handleToCoinChange = (c: Coin) => {
    if (c === fromCoin) setFromCoin(toCoin);
    setToCoin(c);
    setQuote(null);
  };

  /* ── Submit ──────────────────────────────────────── */
  const handleSubmit = async () => {
    const amt = parseFloat(fromAmount);
    if (!amt || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (amt > available) {
      toast.error(
        `Insufficient ${fromCoin} balance in ${ACCOUNT_OPTIONS.find(a => a.value === accountType)?.label}. Available: ${available.toFixed(6)} ${fromCoin}`
      );
      return;
    }
    if (!quote) {
      toast.error("Please wait for the quote to load");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(
        "/conversions",
        { fromSymbol: fromCoin, toSymbol: toCoin, fromAmount: amt, accountType },
        token
      );
      toast.success(
        `Converted ${amt} ${fromCoin} → ${quote.toAmount.toFixed(6)} ${toCoin} (${ACCOUNT_OPTIONS.find(a => a.value === accountType)?.label})`,
        { duration: 5000 }
      );
      setFromAmount("");
      setQuote(null);
      loadWallets();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Conversion failed. Please try again."
      );
    }
    setSubmitting(false);
  };

  const amt = parseFloat(fromAmount);
  const isOverBalance = amt > 0 && amt > available;
  const canSubmit = amt > 0 && !isOverBalance && !!quote && !submitting;

  const activeAccountOption = ACCOUNT_OPTIONS.find(a => a.value === accountType)!;

  /* ─────────────────────────────────────────────────────────── */
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>

      {/* ── Sub-header ─────────────────────────────────────── */}
      <div
        style={{
          background: "#111114",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "0 24px",
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 500, color: "#fff" }}>
            Convert
          </span>
          <Link
            to="/assets/exchange-history"
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.65)",
              textDecoration: "none",
            }}
          >
            Historical orders
          </Link>
        </div>
      </div>

      {/* ── Hero (white) ───────────────────────────────────── */}
      <div style={{ background: "#fff", padding: "64px 24px" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            gap: 80,
          }}
        >
          {/* Left — headline */}
          <div style={{ flex: 1, maxWidth: 480, paddingTop: 28 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: "#e5e7eb",
                }}
              />
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: "#d1d5db",
                }}
              />
            </div>
            <h1
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: "#111",
                lineHeight: 1.25,
                marginBottom: 16,
                margin: "0 0 16px",
              }}
            >
              Just a few steps to
              <br />
              redeem instantly
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "#888",
                lineHeight: 1.75,
                margin: 0,
                maxWidth: 360,
              }}
            >
              Supports popular digital currencies such as Bitcoin, Ethereum,
              Tether, Solana, etc.
            </p>
          </div>

          {/* Right — exchange card */}
          <div
            style={{
              width: 440,
              flexShrink: 0,
              borderRadius: 16,
              padding: 28,
              background: "#fff",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            {/* ACCOUNT SELECTOR ─────────────────── */}
            <div style={{ marginBottom: 18 }}>
              <span style={{ fontSize: 12, color: "#888", fontWeight: 500, display: "block", marginBottom: 8 }}>
                Convert from account
              </span>
              <div ref={accountDropRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setAccountDropOpen(v => !v)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #111",
                    background: "#fafafa",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#111", display: "block" }}>
                      {activeAccountOption.label}
                    </span>
                    <span style={{ fontSize: 11, color: "#888" }}>{activeAccountOption.sub}</span>
                  </div>
                  <ChevronDown
                    style={{
                      width: 16, height: 16, color: "#555", flexShrink: 0,
                      transform: accountDropOpen ? "rotate(180deg)" : "none",
                      transition: "transform 0.15s",
                    }}
                  />
                </button>
                {accountDropOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: 0,
                      right: 0,
                      zIndex: 300,
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      boxShadow: "0 6px 20px rgba(0,0,0,0.10)",
                      overflow: "hidden",
                    }}
                  >
                    {ACCOUNT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => switchAccount(opt.value)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          background: accountType === opt.value ? "#f5f5f5" : "#fff",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                          borderBottom: "1px solid #f5f5f5",
                        }}
                      >
                        <div>
                          <span style={{ fontSize: 14, fontWeight: 500, color: "#111", display: "block" }}>
                            {opt.label}
                          </span>
                          <span style={{ fontSize: 11, color: "#aaa" }}>
                            {opt.sub} · Balance: {(walletsByAccount[opt.value]?.[fromCoin] ?? 0).toFixed(4)} {fromCoin}
                          </span>
                        </div>
                        {accountType === opt.value && (
                          <span style={{ fontSize: 16, color: "#111" }}>✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* FROM ─────────────────────────────── */}
            <div
              style={{
                border: isOverBalance
                  ? "1.5px solid #ef4444"
                  : "1px solid #e5e7eb",
                borderRadius: 10,
                padding: "12px 14px",
                marginBottom: 2,
                transition: "border-color 0.2s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 12, color: "#888", fontWeight: 500 }}>
                  From
                </span>
                <CoinDropdown
                  value={fromCoin}
                  onChange={handleFromCoinChange}
                  exclude={toCoin}
                  open={fromDropOpen}
                  setOpen={setFromDropOpen}
                />
              </div>
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="Please enter the amount"
                min="0"
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 14,
                  color: fromAmount ? "#111" : "#bbb",
                  padding: 0,
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* SWAP ─────────────────────────────── */}
            <div
              style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}
            >
              <div
                onClick={handleSwap}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: 16,
                  color: "#555",
                  userSelect: "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#e5e7eb";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#f3f4f6";
                }}
              >
                1↓
              </div>
            </div>

            {/* TO ───────────────────────────────── */}
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: "12px 14px",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 12, color: "#888", fontWeight: 500 }}>
                  To
                </span>
                <CoinDropdown
                  value={toCoin}
                  onChange={handleToCoinChange}
                  exclude={fromCoin}
                  open={toDropOpen}
                  setOpen={setToDropOpen}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {quoting ? (
                  <Loader2
                    style={{ width: 16, height: 16, color: "#bbb" }}
                    className="animate-spin"
                  />
                ) : (
                  <span
                    style={{
                      fontSize: 14,
                      color: quote ? "#111" : "#bbb",
                    }}
                  >
                    {quote
                      ? quote.toAmount.toFixed(6)
                      : "Please enter the amount"}
                  </span>
                )}
              </div>
            </div>

            {/* AVAILABLE ───────────────────────── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <span style={{ fontSize: 13, color: "#888" }}>Available:</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: isOverBalance ? "#ef4444" : "#222",
                }}
              >
                {available.toFixed(available > 0 ? 2 : 0)}&nbsp;&nbsp;{fromCoin}
              </span>
            </div>

            {/* Rate info (only when quoting) */}
            {quote && (
              <div
                style={{
                  background: "#f9fafb",
                  borderRadius: 8,
                  padding: "8px 12px",
                  marginBottom: 14,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 12, color: "#888" }}>
                  1 {fromCoin} ≈ {quote.rate.toFixed(6)} {toCoin}
                </span>
                <span style={{ fontSize: 12, color: "#aaa" }}>
                  Fee: {quote.fee.toFixed(6)} {toCoin}
                </span>
              </div>
            )}

            {/* EXCHANGE BUTTON ─────────────────── */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                width: "100%",
                padding: "14px 0",
                borderRadius: 9999,
                fontSize: 15,
                fontWeight: 600,
                background: canSubmit ? "#111" : "#d1d5db",
                color: canSubmit ? "#fff" : "#9ca3af",
                border: "none",
                cursor: canSubmit ? "pointer" : "not-allowed",
                transition: "opacity 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
              onMouseEnter={(e) => {
                if (canSubmit)
                  (e.currentTarget as HTMLElement).style.opacity = "0.88";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = "1";
              }}
            >
              {submitting ? (
                <>
                  <Loader2
                    style={{ width: 16, height: 16 }}
                    className="animate-spin"
                  />
                  Converting…
                </>
              ) : (
                "Exchange"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Flash redemption process ────────────────────────── */}
      <div style={{ background: "#fff", paddingBottom: 80 }}>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#111",
            textAlign: "center",
            marginBottom: 48,
            margin: "0 0 48px",
          }}
        >
          Flash redemption process
        </h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <img
              src="/convert/register.png"
              alt="Register"
              style={{ width: 64, height: 64, objectFit: "contain", marginBottom: 16 }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, color: "#333" }}>
              Register an account
            </span>
          </div>

          <div
            style={{
              width: 112,
              borderTop: "2px dashed #ccc",
              margin: "0 16px 28px",
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <img
              src="/convert/verify.png"
              alt="Verify"
              style={{ width: 64, height: 64, objectFit: "contain", marginBottom: 16 }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, color: "#333" }}>
              Verify identity
            </span>
          </div>

          <div
            style={{
              width: 112,
              borderTop: "2px dashed #ccc",
              margin: "0 16px 28px",
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <img
              src="/convert/redeem.png"
              alt="Redeem"
              style={{ width: 64, height: 64, objectFit: "contain", marginBottom: 16 }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, color: "#333" }}>
              Start redeeming
            </span>
          </div>
        </div>
      </div>

      {/* ── What is USDT? ── white background ───────────────── */}
      <div style={{ background: "#fff", borderTop: "1px solid #f0f0f0" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "60px 24px 80px",
            display: "flex",
            alignItems: "flex-start",
            gap: 64,
          }}
        >
          {/* Left — text */}
          <div style={{ flex: 1 }}>
            {/* USDT icon */}
            <div style={{ marginBottom: 12 }}>
              <CoinIcon coin="USDT" size={36} />
            </div>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#111",
                marginBottom: 28,
                margin: "0 0 28px",
              }}
            >
              What is USDT?
            </h2>

            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.8, marginBottom: 20, margin: "0 0 20px" }}>
              USDT was originally called Realcoin, Tether (USDT for short) and was jointly
              launched in 2014 by Brock Pierce, Reeve Collins and Craig Sellars. USDT is an
              Ethereum-based stablecoin that is widely considered a digital currency pegged to
              the U.S. dollar.
            </p>

            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.8, marginBottom: 20, margin: "0 0 20px" }}>
              USDT enables users to trade with fiat-style stability in the volatile digital
              currency trading market. Users can buy and sell or trade digital currencies using
              USDT without worrying about the price fluctuations of typical digital assets.
            </p>

            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.8, marginBottom: 20, margin: "0 0 20px" }}>
              In addition, USDT is a multi-chain asset. It can be used on major blockchains
              such as: EthereumSolana, Tron, Algorand, Avalanche, Bitcoin Cash's Simple Ledger
              Protocol (SLP), EOS, Liquid Network, Omni, etc.
            </p>

            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.8, margin: 0 }}>
              USDT's price stability mechanism makes it a popular stablecoin of choice in the
              digital currency trading market, allowing traders to have a more convenient way to
              trade digital assets without worrying about value fluctuations due to price.
              Currently, all major digital currencies are traded with USDT. Therefore, with USDT,
              you have higher liquidity trading.
            </p>
          </div>

          {/* Right — illustration */}
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="/convert/usdt-info.png"
              alt="USDT illustration"
              style={{ width: 220, height: 220, objectFit: "contain" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConvertPage;
