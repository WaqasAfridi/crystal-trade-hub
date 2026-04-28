import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const coins: { src: string; left: string; top: string; size: number }[] = [
  { src: "/crypto-logos/Kyber Network.png", left: "3.5%", top: "6%", size: 60 },
  { src: "/crypto-logos/XRP.png", left: "-1%", top: "20%", size: 58 },
  { src: "/crypto-logos/Terra.png", left: "17%", top: "20%", size: 52 },
  { src: "/crypto-logos/Bitcoin.png", left: "27.5%", top: "43%", size: 68 },
  { src: "/crypto-logos/Yearn Finance (YFI).png", left: "33.5%", top: "49%", size: 56 },
  { src: "/crypto-logos/Solana.png", left: "21%", top: "63%", size: 58 },
  { src: "/crypto-logos/Uniswap.png", left: "10.5%", top: "73%", size: 48 },
  { src: "/crypto-logos/TRON (TRX).png", left: "46.5%", top: "84%", size: 70 },
  { src: "/crypto-logos/Tezos (XTZ).png", left: "70%", top: "56%", size: 68 },
  { src: "/crypto-logos/Dogecoin.png", left: "83%", top: "54%", size: 64 },
  { src: "/crypto-logos/Dai.png", left: "73%", top: "79%", size: 56 },
  { src: "/crypto-logos/Filecoin (FIL).png", left: "90%", top: "49%", size: 74 },
  { src: "/crypto-logos/Litecoin.png", left: "75%", top: "10%", size: 60 },
  { src: "/crypto-logos/Polkadot.png", left: "83%", top: "19%", size: 54 },
  { src: "/crypto-logos/Cardano.png", left: "94%", top: "3%", size: 76 },
];

const HeroSection = () => {
  return (
    <section
      className="relative overflow-hidden bg-background"
      style={{ height: "clamp(520px, 40vw, 760px)" }}
    >
      {/* ── Heading + CTA ─────────────────────────────────────────────── */}
      <div
        className="absolute left-0 right-0 z-30 flex flex-col items-center text-center"
        style={{ top: "12%" }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-lg sm:text-xl lg:text-2xl font-normal tracking-wide mb-5"
          style={{ color: "#c8c8c8" }}
        >
          Unlock the World of Digital Currencies
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Link
            to="/kyc"
            className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full font-medium text-sm tracking-widest transition-all duration-300"
            style={{
              border: "2px solid #adff00",
              color: "#adff00",
              background: "transparent",
              letterSpacing: "0.08em",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "#adff00";
              (e.currentTarget as HTMLElement).style.color = "#000";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "#adff00";
            }}
          >
            Deposit Now &nbsp;→
          </Link>
        </motion.div>
      </div>

      {/* ── Orbits PNG ─────────────────────────────────────────────────── */}
      <img
        src="/orbits.png"
        alt=""
        draggable={false}
        className="absolute select-none pointer-events-none"
        style={{
          width: "clamp(900px, 95vw, 1600px)",
          height: "auto",
          left: "50%",
          top: "63%",
          transform: "translate(-50%, -49.6%) scaleY(1.01)",
          opacity: 1,
          filter: "brightness(1.2) contrast(1.1)",
          zIndex: 5,
        }}
      />

      {/* ── ETH Crystal GIF ─────────────────────────────────────────────── */}
      <div
        className="absolute"
        style={{
          left: "50%",
          top: "52%",
          transform: "translate(-50%, -50%)",
          zIndex: 10,
          width: "clamp(260px, 26vw, 420px)",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <img
          src="/eth-crystal.gif"
          alt="Ethereum Crystal"
          draggable={false}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            background: "transparent",
            // 1. Change to screen (smoother than lighten)
            mixBlendMode: "screen",
            // 2. The "Crush" filter to pinch the white outlines
            filter: "contrast(1.09) brightness(1) saturate(0.8)",
          }}
        />
      </div>

      {/* ── Crypto coin logos ────────────────────────────────────────────── */}
      {coins.map((coin, i) => (
        <motion.div
          key={i}
          className="absolute z-20"
          style={{
            left: coin.left,
            top: coin.top,
            transform: "translate(-50%, -50%)",
          }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.055, type: "spring", stiffness: 200 }}
        >
          <div
            className="rounded-full overflow-hidden"
            style={{ width: coin.size, height: coin.size }}
          >
            <img
              src={coin.src}
              alt=""
              draggable={false}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      ))}
    </section>
  );
};

export default HeroSection;
