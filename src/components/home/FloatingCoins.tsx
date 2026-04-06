const coins = [
  { name: "BTC", color: "#F7931A", symbol: "₿", top: "35%", left: "25%", size: "w-14 h-14", delay: "animate-float" },
  { name: "ETH", color: "#627EEA", symbol: "Ξ", top: "20%", left: "15%", size: "w-12 h-12", delay: "animate-float-delayed" },
  { name: "SOL", color: "#9945FF", symbol: "◎", top: "55%", left: "28%", size: "w-11 h-11", delay: "animate-float-slow" },
  { name: "LTC", color: "#BFBBBB", symbol: "Ł", top: "12%", left: "72%", size: "w-14 h-14", delay: "animate-float" },
  { name: "DOT", color: "#E6007A", symbol: "●", top: "20%", left: "80%", size: "w-12 h-12", delay: "animate-float-delayed" },
  { name: "USDT", color: "#26A17B", symbol: "$", top: "42%", left: "42%", size: "w-12 h-12", delay: "animate-float-slow" },
  { name: "XTZ", color: "#2C7DF7", symbol: "ꜩ", top: "48%", left: "68%", size: "w-14 h-14", delay: "animate-float" },
  { name: "FIL", color: "#0090FF", symbol: "⨎", top: "38%", left: "88%", size: "w-14 h-14", delay: "animate-float-delayed" },
  { name: "DOGE", color: "#C2A633", symbol: "Ð", top: "45%", left: "82%", size: "w-12 h-12", delay: "animate-float-slow" },
  { name: "UNI", color: "#FF007A", symbol: "🦄", top: "60%", left: "12%", size: "w-11 h-11", delay: "animate-float" },
  { name: "KCS", color: "#23AF91", symbol: "K", top: "8%", left: "3%", size: "w-16 h-16", delay: "animate-float-delayed" },
  { name: "BUSD", color: "#F0B90B", symbol: "B", top: "62%", left: "70%", size: "w-12 h-12", delay: "animate-float-slow" },
  { name: "HARM", color: "#00AEE9", symbol: "H", top: "58%", left: "90%", size: "w-11 h-11", delay: "animate-float" },
];

const FloatingCoins = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {coins.map((coin) => (
        <div
          key={coin.name}
          className={`absolute ${coin.size} ${coin.delay} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}
          style={{
            top: coin.top,
            left: coin.left,
            backgroundColor: coin.color,
            fontSize: coin.size.includes("16") ? "1.2rem" : coin.size.includes("14") ? "1rem" : "0.8rem",
          }}
        >
          {coin.symbol}
        </div>
      ))}
    </div>
  );
};

export default FloatingCoins;
