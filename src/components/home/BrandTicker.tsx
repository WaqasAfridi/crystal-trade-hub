const brands = [
  { label: "Binance",       src: "/brand-logos/Binance.png"       },
  { label: "blockchain.io", src: "/brand-logos/blockchain-io.png" },
  { label: "BitMEX",        src: "/brand-logos/BitMEX.png"        },
  { label: "imToken",       src: "/brand-logos/imToken.png"       },
  { label: "Token Pocket",  src: "/brand-logos/Token Pocket.png"  },
  { label: "TradingView",   src: "/brand-logos/TradingView.png"   },
  { label: "Uniswap",       src: "/brand-logos/Uniswap.png"       },
  { label: "CoinMarketCap", src: "/brand-logos/CoinMarketCap.png" },
];

const allBrands = [...brands, ...brands];

const BrandTicker = () => {
  return (
    <div
      className="w-full overflow-hidden bg-black"
      style={{ paddingTop: "22px", paddingBottom: "22px" }}
    >
      <div
        className="ticker-animate flex items-center whitespace-nowrap"
        style={{ width: "max-content", gap: "90px" }}
      >
        {allBrands.map((brand, i) => (
          <div
            key={`${brand.label}-${i}`}
            className="flex items-center justify-center flex-shrink-0"
            style={{ height: "72px" }}
          >
            <img
              src={brand.src}
              alt={brand.label}
              draggable={false}
              style={{
                height: "100%",
                width: "auto",
                maxWidth: "220px",
                objectFit: "contain",
                userSelect: "none",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandTicker;
