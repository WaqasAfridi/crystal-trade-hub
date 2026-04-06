const brands = [
  "BitMEX", "Uniswap", "PancakeSwap", "Coinbase", "Kraken", 
  "Binance", "Gate.io", "KuCoin", "Bybit", "OKX",
  "Bitfinex", "Huobi", "Gemini", "Crypto.com", "FTX",
];

const BrandTicker = () => {
  return (
    <div className="w-full overflow-hidden bg-card/50 border-y border-border py-4">
      <div className="ticker-animate flex items-center gap-12 whitespace-nowrap" style={{ width: "max-content" }}>
        {[...brands, ...brands].map((brand, i) => (
          <span
            key={`${brand}-${i}`}
            className="text-muted-foreground/40 text-lg font-semibold tracking-wide"
          >
            {brand}
          </span>
        ))}
      </div>
    </div>
  );
};

export default BrandTicker;
