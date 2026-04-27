import { useState } from "react";

const Finance = () => {
  const [hoveredMyHolding, setHoveredMyHolding] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <div className="bg-black w-full" style={{ height: "320px" }}>
        <div className="mx-auto px-20 h-full flex items-center justify-between" style={{ maxWidth: "1680px" }}>
          <div className="flex flex-col gap-6">
            <h1 className="text-white text-2xl font-medium whitespace-nowrap">
              Empowering You to Explore More Trading Opportunities and Financial Products
            </h1>
            <div>
              <button className="bg-white text-black text-xl font-semibold px-10 py-3 rounded-full hover:bg-gray-100 transition-colors">
                Start Earning Profits
              </button>
            </div>
          </div>
          <div className="flex-shrink-0 pl-12 flex items-center h-full">
            <img
              src="/licai1.png"
              alt="Finance Illustration"
              className="w-auto object-contain"
              style={{ height: "288px", minWidth: "320px" }}
            />
          </div>
        </div>
      </div>

      {/* Cards Row */}
      <div className="mx-auto px-20 py-10 flex items-stretch justify-between gap-4" style={{ maxWidth: "1680px" }}>
        {/* Left Card */}
        <div
          className="rounded-xl overflow-hidden relative flex flex-col justify-center p-7"
          style={{
            background: "linear-gradient(135deg, #1a3a8f 0%, #0d2255 60%, #0a1a44 100%)",
            width: "380px",
            height: "160px",
          }}
        >
          <p className="font-semibold text-xl leading-snug" style={{ color: "#00f5c8" }}>
            High certainty of maturity returns
          </p>
          <p className="text-white text-base mt-2">A good choice in volatile markets .</p>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right Card */}
        <div
          className="rounded-xl overflow-hidden relative flex flex-col justify-center p-7"
          style={{
            background: "linear-gradient(135deg, #12122a 0%, #1a1a3a 60%, #0f0f22 100%)",
            width: "380px",
            height: "160px",
          }}
        >
          <p className="font-semibold text-xl leading-snug" style={{ color: "#f9626b" }}>
            Over 10,000 people repurchased
          </p>
          <p className="text-white text-base mt-2">Purchased many times, trustworthy</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="mx-auto px-20 pb-16" style={{ maxWidth: "1680px" }}>
        {/* Tab + My Holding row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-black font-semibold text-base">All</span>
          <button
            className="flex items-center gap-1.5 text-gray-500 text-sm hover:text-gray-700 transition-colors"
            onMouseEnter={() => setHoveredMyHolding(true)}
            onMouseLeave={() => setHoveredMyHolding(false)}
          >
            <i
              className="fa-regular fa-paper-plane text-sm"
              style={{ color: hoveredMyHolding ? "#555" : "#aaa" }}
            />
            <span>My Holding</span>
          </button>
        </div>

        {/* Table */}
        <div className="w-full border border-gray-100 rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-gray-400 font-normal px-4 py-3">Name</th>
                <th className="text-left text-gray-400 font-normal px-4 py-3">Minimum Return</th>
                <th className="text-left text-gray-400 font-normal px-4 py-3">Maximum Return</th>
                <th className="text-left text-gray-400 font-normal px-4 py-3">Buyer Count</th>
                <th className="text-left text-gray-400 font-normal px-4 py-3">Purchasing Price</th>
                <th className="text-left text-gray-400 font-normal px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Empty state — no rows */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Finance;
