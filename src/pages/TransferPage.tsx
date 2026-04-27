import { useState } from "react";
import { ChevronDown, RefreshCw } from "lucide-react";

const TransferPage = () => {
  const [fromAccount, setFromAccount] = useState("Spot Account");
  const [toAccount, setToAccount] = useState("Trading Account");
  const [size, setSize] = useState("");

  const handleSwap = () => {
    setFromAccount(toAccount);
    setToAccount(fromAccount);
  };

  return (
    <div className="min-h-screen" style={{ background: "#fff" }}>
      {/* ── Dark Hero Banner ─────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ background: "#111114" }}
      >
        {/* Decorative squares */}
        <div className="absolute top-4 left-6 flex gap-3 opacity-30">
          <div className="w-10 h-10 rounded" style={{ background: "#333" }} />
          <div className="w-10 h-10 rounded" style={{ background: "#444" }} />
        </div>
        <div className="absolute top-16 left-6 opacity-20">
          <div className="w-10 h-10 rounded" style={{ background: "#333" }} />
        </div>

        <div className="text-center py-14 px-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <RefreshCw className="w-7 h-7 text-white/80" />
            <h1 className="text-3xl font-bold text-white">Transfer</h1>
          </div>
          <p className="text-sm text-white/60 max-w-2xl mx-auto leading-relaxed">
            Transfer funds between different accounts conveniently and securely
            to improve fund management efficiency.
          </p>
        </div>
      </div>

      {/* ── Transfer Card ────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-6 -mt-2">
        <div
          className="rounded-2xl p-8"
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
          }}
        >
          {/* Symbol */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block" style={{ color: "#333" }}>
              Symbol
            </label>
            <div
              className="flex items-center rounded-xl px-4 py-3 cursor-pointer"
              style={{ border: "1px solid #e5e7eb" }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                style={{ background: "#26a17b" }}
              >
                <span className="text-white text-xs font-bold">₮</span>
              </div>
              <span className="text-sm flex-1" style={{ color: "#333" }}>USDT</span>
              <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "#bbb" }} />
            </div>
          </div>

          {/* From / To */}
          <div className="mb-6">
            <div className="flex items-end gap-4">
              {/* From */}
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block" style={{ color: "#333" }}>
                  From
                </label>
                <div
                  className="flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer"
                  style={{ border: "1px solid #e5e7eb" }}
                >
                  <span className="text-sm" style={{ color: "#555" }}>{fromAccount}</span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "#bbb" }} />
                </div>
              </div>

              {/* Swap button */}
              <button
                onClick={handleSwap}
                className="flex items-center justify-center w-10 h-10 rounded-full mb-0.5 transition-colors"
                style={{ color: "#333" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#000"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#333"; }}
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              {/* To */}
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block" style={{ color: "#333" }}>
                  To
                </label>
                <div
                  className="flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer"
                  style={{ border: "1px solid #e5e7eb" }}
                >
                  <span className="text-sm" style={{ color: "#555" }}>{toAccount}</span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "#bbb" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Size */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block" style={{ color: "#333" }}>
              Size
            </label>
            <div
              className="flex items-center rounded-xl px-4 py-3"
              style={{ border: "1px solid #e5e7eb" }}
            >
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder=""
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: "#333" }}
              />
              <button
                className="text-sm font-medium flex-shrink-0 ml-3"
                style={{ color: "#333" }}
                onClick={() => setSize("0")}
              >
                all
              </button>
            </div>
          </div>

          {/* Quantity */}
          <p className="text-sm mb-6" style={{ color: "#555" }}>
            Quantity: 0 USDT
          </p>

          {/* Confirm button */}
          <button
            className="w-full py-3.5 rounded-full text-base font-medium transition-opacity"
            style={{ background: "#111", color: "#fff" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferPage;
