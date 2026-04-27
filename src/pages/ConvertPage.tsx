import { useState } from "react";
import { ChevronDown, ArrowDownUp } from "lucide-react";

const ConvertPage = () => {
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [fromCoin, setFromCoin] = useState("USDT");
  const [toCoin, setToCoin] = useState("USDC");

  return (
    <div className="min-h-screen" style={{ background: "#0b0b0e" }}>
      {/* ── Sub-header ──────────────────────────────────────── */}
      <div
        className="border-b"
        style={{
          background: "#111114",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between h-12">
          <span className="text-base font-medium text-white">Convert</span>
          <button className="text-base text-white/70 hover:text-white transition-colors">
            Historical orders
          </button>
        </div>
      </div>

      {/* ── Hero Section (white bg) ──────────────────────────── */}
      <div style={{ background: "#ffffff" }}>
        <div className="max-w-[1400px] mx-auto px-6 py-16">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-12">
            {/* Left — headline */}
            <div className="flex-1 pt-8">
              {/* Decorative squares */}
              <div className="flex gap-3 mb-6">
                <div
                  className="w-8 h-8 rounded"
                  style={{ background: "#e5e7eb" }}
                />
                <div
                  className="w-8 h-8 rounded"
                  style={{ background: "#d1d5db" }}
                />
              </div>
              <h1
                className="text-4xl font-bold leading-tight mb-4"
                style={{ color: "#111" }}
              >
                Just a few steps to
                <br />
                redeem instantly
              </h1>
              <p className="text-base leading-relaxed" style={{ color: "#888", maxWidth: "380px" }}>
                Supports popular digital currencies such as Bitcoin, Ethereum, Tether,
                Solana, etc.
              </p>
            </div>

            {/* Right — exchange card */}
            <div
              className="w-full max-w-md rounded-2xl p-8"
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
              }}
            >
              {/* From */}
              <div
                className="rounded-xl px-4 py-3 mb-2"
                style={{ border: "1px solid #e5e7eb" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium" style={{ color: "#888" }}>From</span>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: "#26a17b" }}
                    >
                      <span className="text-white text-xs font-bold">₮</span>
                    </div>
                    <span className="text-sm font-medium" style={{ color: "#333" }}>{fromCoin}</span>
                    <ChevronDown className="w-3.5 h-3.5" style={{ color: "#aaa" }} />
                  </div>
                </div>
                <input
                  type="text"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="Please enter the amount"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-gray-300"
                  style={{ color: "#333" }}
                />
              </div>

              {/* Swap icon */}
              <div className="flex justify-center py-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                  style={{ color: "#333" }}
                  onClick={() => {
                    setFromCoin(toCoin);
                    setToCoin(fromCoin);
                    setFromAmount(toAmount);
                    setToAmount(fromAmount);
                  }}
                >
                  <span className="text-xl font-light">1↓</span>
                </div>
              </div>

              {/* To */}
              <div
                className="rounded-xl px-4 py-3 mb-4"
                style={{ border: "1px solid #e5e7eb" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium" style={{ color: "#888" }}>To</span>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: "#2775ca" }}
                    >
                      <span className="text-white text-xs font-bold">$</span>
                    </div>
                    <span className="text-sm font-medium" style={{ color: "#333" }}>{toCoin}</span>
                    <ChevronDown className="w-3.5 h-3.5" style={{ color: "#aaa" }} />
                  </div>
                </div>
                <input
                  type="text"
                  value={toAmount}
                  onChange={(e) => setToAmount(e.target.value)}
                  placeholder="Please enter the amount"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-gray-300"
                  style={{ color: "#333" }}
                />
              </div>

              {/* Available */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm" style={{ color: "#888" }}>Available:</span>
                <span className="text-sm font-semibold" style={{ color: "#333" }}>
                  0 &nbsp;USDT
                </span>
              </div>

              {/* Exchange button */}
              <button
                className="w-full py-3.5 rounded-full text-base font-medium transition-opacity"
                style={{
                  background: "#111",
                  color: "#fff",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
              >
                Exchange
              </button>
            </div>
          </div>
        </div>

        {/* ── Flash redemption process ────────────────────────── */}
        <div className="pb-20 pt-8">
          <h2
            className="text-2xl font-bold text-center mb-12"
            style={{ color: "#111" }}
          >
            Flash redemption process
          </h2>
          <div className="flex items-center justify-center gap-0">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <img
                src="/convert/register.png"
                alt="Register"
                className="w-16 h-16 object-contain mb-4"
              />
              <span className="text-sm font-medium" style={{ color: "#333" }}>
                Register an account
              </span>
            </div>

            {/* Dashed line */}
            <div
              className="w-28 mx-4"
              style={{
                borderTop: "2px dashed #ccc",
                marginBottom: "28px",
              }}
            />

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <img
                src="/convert/verify.png"
                alt="Verify"
                className="w-16 h-16 object-contain mb-4"
              />
              <span className="text-sm font-medium" style={{ color: "#333" }}>
                Verify identity
              </span>
            </div>

            {/* Dashed line */}
            <div
              className="w-28 mx-4"
              style={{
                borderTop: "2px dashed #ccc",
                marginBottom: "28px",
              }}
            />

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <img
                src="/convert/redeem.png"
                alt="Redeem"
                className="w-16 h-16 object-contain mb-4"
              />
              <span className="text-sm font-medium" style={{ color: "#333" }}>
                Start redeeming
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── What is USDT? section (dark bg) ──────────────────── */}
      <div style={{ background: "#0b0b0e" }}>
        <div className="max-w-[1400px] mx-auto px-6 py-20">
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Left — text content */}
            <div className="flex-1 max-w-2xl">
              <img
                src="/convert/usdt-icon.svg"
                alt="USDT"
                className="w-10 h-10 mb-3"
              />
              <h2 className="text-2xl font-bold text-white mb-8">
                What is USDT?
              </h2>

              <p className="text-sm text-white/60 leading-relaxed mb-6">
                USDT was originally called Realcoin, Tether (USDT for short) and was
                jointly launched in 2014 by Brock Pierce, Reeve Collins and Craig
                Sellars. USDT is an Ethereum-based stablecoin that is widely
                considered a digital currency pegged to the U.S. dollar.
              </p>

              <p className="text-sm text-white/60 leading-relaxed mb-6">
                USDT enables users to trade with fiat-style stability in the volatile
                digital currency trading market. Users can buy and sell or trade
                digital currencies using USDT without worrying about the price
                fluctuations of typical digital assets.
              </p>

              <p className="text-sm text-white/60 leading-relaxed mb-6">
                In addition, USDT is a multi-chain asset. It can be used on major
                blockchains such as: EthereumSolana, Tron, Algorand, Avalanche,
                Bitcoin Cash's Simple Ledger Protocol (SLP), EOS, Liquid Network,
                Omni, etc.
              </p>

              <p className="text-sm text-white/60 leading-relaxed">
                USDT's price stability mechanism makes it a popular stablecoin of
                choice in the digital currency trading market, allowing traders to
                have a more convenient way to trade digital assets without worrying
                about value fluctuations due to price. Currently, all major digital
                currencies are traded with USDT. Therefore, with USDT, you have
                higher liquidity trading.
              </p>
            </div>

            {/* Right — illustration */}
            <div className="flex-shrink-0 flex items-center justify-center">
              <img
                src="/convert/usdt-info.png"
                alt="USDT illustration"
                className="w-56 h-56 object-contain opacity-80"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConvertPage;
