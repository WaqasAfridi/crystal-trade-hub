import { useState, useEffect, useRef, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ArrowRight } from "lucide-react";

/* ─── My Account custom icons ────────────────────────────────────── */
const IconDeposit = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <rect x="3" y="3" width="20" height="20" rx="3" stroke="white" strokeWidth="1.8"/>
    <line x1="13" y1="7" x2="13" y2="16" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
    <polyline points="9,13 13,17 17,13" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <line x1="8" y1="19" x2="18" y2="19" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);
const IconWithdraw = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <rect x="3" y="3" width="20" height="20" rx="3" stroke="white" strokeWidth="1.8"/>
    <line x1="13" y1="16" x2="13" y2="7" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
    <polyline points="9,11 13,7 17,11" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <line x1="8" y1="19" x2="18" y2="19" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);
const IconICO = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <rect x="4" y="10" width="14" height="12" rx="2" stroke="white" strokeWidth="1.7"/>
    <path d="M7 10V8a4 4 0 0 1 8 0v2" stroke="white" strokeWidth="1.7" strokeLinecap="round"/>
    <circle cx="20" cy="9" r="5" fill="#0b0b0e" stroke="white" strokeWidth="1.5"/>
    <text x="20" y="12.5" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="white">$</text>
  </svg>
);
const IconFinance = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <polyline points="3,20 8,14 13,17 20,8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <polyline points="16,8 20,8 20,12" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <line x1="3" y1="23" x2="23" y2="23" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconAIStrategy = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <circle cx="13" cy="13" r="10" stroke="white" strokeWidth="1.7"/>
    <circle cx="13" cy="13" r="6.5" stroke="white" strokeWidth="1.2" strokeDasharray="2 2"/>
    <text x="13" y="16.5" textAnchor="middle" fontSize="7" fontWeight="800" fill="white">AI</text>
  </svg>
);
const IconMyHoldings = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <rect x="5" y="3" width="16" height="20" rx="2" stroke="white" strokeWidth="1.7"/>
    <line x1="9"  y1="9"  x2="17" y2="9"  stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="9"  y1="13" x2="17" y2="13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="9"  y1="17" x2="13" y2="17" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="19" cy="19" r="5" fill="#0b0b0e" stroke="white" strokeWidth="1.5"/>
    <polyline points="16.5,19 18,20.5 21.5,17" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);
const IconBuyNow = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <path d="M13 4 A9 9 0 1 1 4 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    <polyline points="4,8 4,13 9,13" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <text x="13" y="16.5" textAnchor="middle" fontSize="7" fontWeight="800" fill="white">$</text>
  </svg>
);

/* ─── Coin icons (Binance CDN — same source as Enivex) ───────────── */
const COIN_IMG = (symbol: string) =>
  `https://cdn.jsdelivr.net/gh/vadimmalykhin/binance-icons/crypto/${symbol.toLowerCase()}.svg`;

const ORBIT_COINS = {
  BTC:  COIN_IMG("btc"),
  ETH:  COIN_IMG("eth"),
  BNB:  COIN_IMG("bnb"),
  NEO:  COIN_IMG("neo"),
  LTC:  COIN_IMG("ltc"),
  XRP:  COIN_IMG("xrp"),
  QTUM: COIN_IMG("qtum"),
  ADA:  COIN_IMG("ada"),
  DOGE: COIN_IMG("doge"),
};

/* ─── Hot pairs ──────────────────────────────────────────────────── */
const HOT_PAIRS = [
  { pair: "BTC/USDT",  sym: "BTC",  price: "$78,149.9", change: "+0.64%", up: true  },
  { pair: "ETH/USDT",  sym: "ETH",  price: "$2,350.54", change: "+1.49%", up: true  },
  { pair: "BNB/USDT",  sym: "BNB",  price: "$632.8",    change: "+0.3%",  up: true  },
  { pair: "NEO/USDT",  sym: "NEO",  price: "$2.934",    change: "+2.16%", up: true  },
  { pair: "LTC/USDT",  sym: "LTC",  price: "$56.09",    change: "-0.51%", up: false },
  { pair: "XRP/USDT",  sym: "XRP",  price: "$1.4294",   change: "+0.01%", up: true  },
  { pair: "QTUM/USDT", sym: "QTUM", price: "$0.9038",   change: "+0.2%",  up: true  },
  { pair: "ADA/USDT",  sym: "ADA",  price: "$0.2528",   change: "+0.76%", up: true  },
];

/* ─── News ───────────────────────────────────────────────────────── */
const NEWS = [
  { rank: 1,  img: "/news/news-3.jpg",
    src: "Abu Dhabi, UAE, February 10th, 2026, Chainwire\nAs trade, employment, and digi...",
    title: "Bitcoin falls below $70,000 in rangebound trade ahead of key...",
    date: "2026/02/10 10:18:03" },
  { rank: 2,  img: "/news/news-2.jpg",
    src: "Vaduz, Liechtenstein, February 9th, 2026, Chainwire\nnxMoney ($XMN) is expanding it...",
    title: "GoMining Simple Earn Enables Autonomous Bitcoin Yie...",
    date: "2026/02/09 12:00:42" },
  { rank: 3,  img: "/news/news-1.jpg",
    src: "Investing.com -- The ongoing weakness in Bitcoin represents \"the weakest Bitcoin bea...",
    title: "Bitmine reports $10 billion in crypto and cash holdings",
    date: "2026/02/08 08:30:33" },
  { rank: 0,  img: "/news/news-4.jpg",
    src: "Investing.com - Bitcoin was trading at $70,689.0 by 15:02 (20:02 GMT) on the...",
    title: "Litecoin Climbs 10% In Bullish Trade",
    date: "2026/02/06 17:01:00" },
  { rank: 0,  img: "/news/news-5.jpg",
    src: "Palo Alto, CA, February 6th, 2026, Chainwire\nZenO opens access to egoc...",
    title: "Bitcoin bounces back from 16-month low, reclaims and holds...",
    date: "2026/02/06 12:01:03" },
  { rank: 0,  img: "/news/news-6.jpg",
    src: "Investing.com -- China's central bank announced Friday that it will further tighten...",
    title: "KuCoin Expands Earn Suite with KuCoin Wealth for High-Value...",
    date: "2026/02/06 10:17:03" },
];

/* ─── Finance cards ──────────────────────────────────────────────── */
const FINANCE_CARDS = [
  { id: "robo",     label: "Robo-Advisor",   img: "/finance-cards/licai1.png",
    tag: "regular", buyers: 51180, maxReturn: 0.45, progress: 0.72 },
  { id: "treasury", label: "Treasury Bonds", img: "/finance-cards/licai2.png",
    tag: "current", buyers: 16460, maxReturn: 1.20, progress: 0.41 },
];

/* ─── Banner slides — real images from Enivex ───────────────────── */
const BANNERS = ["/banners/banner-1.png", "/banners/banner-2.png",
                 "/banners/banner-3.png", "/banners/banner-4.png"];

/* ─── ICO floating coins ─────────────────────────────────────────── */
const ICO_COINS = [
  "/ico/ico-1.png","/ico/ico-2.png","/ico/ico-3.png","/ico/ico-4.png",
  "/ico/ico-5.png","/ico/ico-6.png","/ico/ico-7.png","/ico/ico-8.png",
];

/* ─── Partners logos (same images as ICO coins slider on Enivex) ── */
const PARTNER_LOGOS = [...ICO_COINS, ...ICO_COINS]; // doubled for infinite feel

/* ═══════════════════════════════════════════════════════════════════
   Gauge — "Wait and see" (Bitcoin VIX Index)
═══════════════════════════════════════════════════════════════════ */
const Gauge = ({ value = 42 }: { value?: number }) => {
  const pct    = Math.min(100, Math.max(0, value));
  const circ   = Math.PI * 70;
  const offset = circ - (pct / 100) * circ;
  const angle  = -90 + (pct / 100) * 180;
  return (
    <svg width="200" height="120" viewBox="0 0 200 120">
      <path d="M 20 95 A 80 80 0 0 1 180 95" fill="none" stroke="#1e2028" strokeWidth={12} strokeLinecap="round"/>
      <path d="M 20 95 A 80 80 0 0 1 180 95" fill="none" stroke="#22c55e" strokeWidth={12} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset} style={{ transition:"stroke-dashoffset 0.8s ease" }}/>
      <g transform={`rotate(${angle}, 100, 95)`}>
        <line x1="100" y1="95" x2="100" y2="32" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="100" cy="95" r="5" fill="#141416" stroke="#ef4444" strokeWidth="1.5"/>
      </g>
      <text x="100" y="115" textAnchor="middle" fontSize="11" fill="#aaa">Wait and see</text>
    </svg>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   OrbitAnimation — DO NOT TOUCH (hours of tuning went into this)
═══════════════════════════════════════════════════════════════════ */
const COIN_S: CSSProperties = { position: "absolute" };
const OrbitAnimation = () => (
  <div style={{
    width: "100%", height: "40vw",
    position: "relative",
    right: "-33.33vw",
    bottom: "-13.33vw",
    zIndex: 1,
    flexShrink: 0,
  }}>
    {/* Center arrow button */}
    <div style={{
      position: "absolute", top: "50%", left: "50%",
      transform: "translate(-50%,-50%)",
      zIndex: 2,
      fontSize: "8.27vw", color: "#fff",
      border: "0.13vw solid #bcff2f",
      backgroundColor: "#1c1c1e",
      borderRadius: "50%",
      padding: "2.67vw",
      display: "flex", alignItems: "center", justifyContent: "center",
      lineHeight: 1,
    }}>
      <ArrowRight style={{ width: "8.27vw", height: "8.27vw" }} />
    </div>

    {/* Orbit B — 66.67vw, 20s */}
    <div style={{
      width: "66.67vw", height: "66.67vw",
      borderRadius: "50%", border: "0.13vw solid #2f2f32",
      position: "absolute",
      top: "calc(50% - 33.33vw)", left: "calc(50% - 33.33vw)",
      animation: "orbit-spin 20s linear infinite",
    }}>
      <img src={ORBIT_COINS.XRP}  alt="XRP"  style={{ ...COIN_S, width: "5.73vw", top: "4.67vw",  left: "1.33vw"  }} />
      <img src={ORBIT_COINS.ADA}  alt="ADA"  style={{ ...COIN_S, width: "6.13vw", top: "48vw",    left: "13.33vw" }} />
      <img src={ORBIT_COINS.DOGE} alt="DOGE" style={{ ...COIN_S, width: "7.87vw", top: "20vw",    left: "-4vw"    }} />
    </div>

    {/* Orbit C — 93.33vw, 30s */}
    <div style={{
      width: "93.33vw", height: "93.33vw",
      borderRadius: "50%", border: "0.13vw solid #2f2f32",
      position: "absolute",
      top: "calc(50% - 46.67vw)", left: "calc(50% - 46.67vw)",
      animation: "orbit-spin 30s linear infinite",
    }}>
      <img src={ORBIT_COINS.BNB}  alt="BNB"  style={{ ...COIN_S, width: "5.73vw", top: "10vw",   left: "1.33vw"  }} />
      <img src={ORBIT_COINS.NEO}  alt="NEO"  style={{ ...COIN_S, width: "6.13vw", top: "60vw",   left: "13.33vw" }} />
      <img src={ORBIT_COINS.QTUM} alt="QTUM" style={{ ...COIN_S, width: "7.87vw", top: "20vw",   left: "-4vw"    }} />
    </div>

    {/* Orbit A — 40vw, 10s */}
    <div style={{
      width: "40vw", height: "40vw",
      borderRadius: "50%", border: "0.13vw solid #2f2f32",
      position: "absolute",
      top: "calc(50% - 20vw)", left: "calc(50% - 20vw)",
      animation: "orbit-spin 10s linear infinite",
    }}>
      <img src={ORBIT_COINS.BTC} alt="BTC" style={{ ...COIN_S, width: "5.73vw", top: "4.67vw",  left: "1.33vw"  }} />
      <img src={ORBIT_COINS.ETH} alt="ETH" style={{ ...COIN_S, width: "6.13vw", top: "33.33vw", left: "13.33vw" }} />
      <img src={ORBIT_COINS.LTC} alt="LTC" style={{ ...COIN_S, width: "7.87vw", top: "20vw",    left: "-4vw"    }} />
    </div>

    {/* Static outer ring */}
    <div style={{
      width: "120vw", height: "120vw",
      borderRadius: "50%", border: "0.13vw solid #2f2f32",
      position: "absolute",
      top: "calc(50% - 60vw)", left: "calc(50% - 60vw)",
    }} />
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   MobileHome — Main component
═══════════════════════════════════════════════════════════════════ */
const MobileHome = () => {
  const [bannerIdx, setBannerIdx]   = useState(0);
  const [finCardIdx, setFinCardIdx] = useState(0);
  const bannerTimer  = useRef<ReturnType<typeof setInterval> | null>(null);
  const finCardTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    bannerTimer.current  = setInterval(() => setBannerIdx(i  => (i  + 1) % BANNERS.length),       3500);
    finCardTimer.current = setInterval(() => setFinCardIdx(i => (i  + 1) % FINANCE_CARDS.length), 4000);
    return () => {
      if (bannerTimer.current)  clearInterval(bannerTimer.current);
      if (finCardTimer.current) clearInterval(finCardTimer.current);
    };
  }, []);

  return (
    <div style={{ background: "#000", minHeight: "100vh", paddingBottom: "24px", overflowX: "hidden" }}>

      {/* ══ HERO BANNER — single container so orbit bleeds behind My Account ══ */}
      {/*
          KEY LAYOUT LOGIC:
          • The outer div is position:relative + overflowX:hidden (clips wide rings
            at the right edge but lets orbit rings show at any vertical depth).
          • OrbitAnimation is wrapped in an absolutely-positioned layer that covers
            100% width/height of the hero — so the rings float behind ALL content.
          • The text and My Account blocks are position:relative + zIndex:2, so they
            render on top of (but visually through) the translucent orbit rings.
          • OrbitAnimation's own code is UNTOUCHED.
      */}
      <div style={{
        background: "#000",
        position: "relative",
        overflowX: "hidden",   /* clips the orbit rings at the right viewport edge */
        overflowY: "visible",  /* lets rings bleed downward into content below hero */
      }}>

        {/* ── Orbit layer — absolutely fills the hero, z:1 ── */}
        {/*
            Vertical maths (all in vw):
              Text block ends at ≈ 12 vw from hero top
              (paddingTop 1.5 + h6 fontSize 8.8 × lineHeight 1.2 ≈ 10.56)
              Gap is 48 vw  →  gap centre = 12 + 24 = 36 vw from hero top
              OrbitAnimation centre = 13.33 (bottom:-13.33vw shifts down)
                                    + 20   (50 % of 40 vw height)
                                    = 33.33 vw
              Δ = 36 − 33.33 = 2.67 vw  →  top: "2.67vw" centres it perfectly.
        */}
        <div style={{
          position: "absolute",
          top: "25vw", left: 0, right: 0, bottom: 0,
          zIndex: 1,
          pointerEvents: "none",   /* clicks pass through to content */
          overflow: "hidden",      /* secondary horizontal clip guard */
        }}>
          <OrbitAnimation />
        </div>

        {/* ── Trade Like A Pro text — z:2 floats above orbit ── */}
        <div style={{ position: "relative", zIndex: 2, padding: "1.5vw 2.67vw 0" }}>
          <h6 style={{
            whiteSpace: "nowrap",  /* forces single line — no wrapping */
            fontSize: "8.8vw", fontWeight: 700,
            color: "#fff",         /* "Pro" is same white — no separate colour */
            lineHeight: 2.7, margin: 0,
          }}>
            Trade Like A Pro
          </h6>
        </div>

        {/* ── My Account — z:2, orbit rings visible through #1c1c1e cards ── */}
        <div style={{ position: "relative", zIndex: 2, padding: "48vw 2.67vw 4vw" }}>
          <div style={{ marginBottom: "4vw" }}>
            <span style={{ fontSize: "5vw", fontWeight: 700, color: "#fff" }}>My Account</span>
          </div>

          {/* Deposit / Withdraw */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "2.67vw", marginBottom: "2.67vw" }}>
            {[
              { icon: <IconDeposit />,  label: "Deposit",  to: "/assets/deposit"  },
              { icon: <IconWithdraw />, label: "Withdraw", to: "/assets/withdraw" },
            ].map(item => (
              <Link key={item.label} to={item.to} style={{
                textDecoration: "none", display: "flex", flexDirection: "column",
                alignItems: "center", background: "#1c1c1e", borderRadius: "3.2vw",
                padding: "3.5vw 0", color: "#fff",
              }}>
                <span style={{ marginBottom: "1.2vw", lineHeight: 1 }}>{item.icon}</span>
                <span style={{ fontSize: "3.47vw", color: "#fff" }}>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* 5-icon grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,23%)", gap: "2.67vw" }}>
            {[
              { icon: <IconICO />,        label: "ICO",         to: "/ico"    },
              { icon: <IconFinance />,    label: "Finance",     to: "/finance"},
              { icon: <IconAIStrategy />, label: "AI Strategy", to: "/assets" },
              { icon: <IconMyHoldings />, label: "My Holdi...", to: "/assets" },
              { icon: <IconBuyNow />,     label: "Buy now",     to: "/buy"    },
            ].map(item => (
              <Link key={item.label} to={item.to} style={{
                textDecoration: "none", display: "flex", flexDirection: "column",
                alignItems: "center", background: "#1c1c1e", borderRadius: "3.2vw",
                padding: "2vw 2.67vw",
              }}>
                <span style={{ color: "rgba(255,255,255,0.9)", marginBottom: "1vw", lineHeight: 1 }}>{item.icon}</span>
                <span style={{
                  fontSize: "3.2vw", color: "#fff", textAlign: "center",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%",
                }}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      {/* ── end HERO BANNER ───────────────────────────────────────── */}

      {/* ══ PROMO BANNER SLIDER ═══════════════════════════════════════ */}
      <div style={{ padding: "0 2.67vw 2.67vw" }}>
        <div style={{ borderRadius: "3.2vw", overflow: "hidden", position: "relative" }}>
          {/* Image */}
          <img
            src={BANNERS[bannerIdx]}
            alt="promo"
            style={{ width: "100%", display: "block", objectFit: "cover", minHeight: "32vw" }}
          />
          {/* Dot indicators */}
          <div style={{
            position: "absolute", bottom: "3vw", left: "50%",
            transform: "translateX(-50%)",
            display: "flex", gap: "1.6vw",
          }}>
            {BANNERS.map((_, i) => (
              <div key={i} onClick={() => setBannerIdx(i)} style={{
                width: i === bannerIdx ? "5.33vw" : "2vw",
                height: "2vw", borderRadius: "1vw", cursor: "pointer",
                background: i === bannerIdx ? "#fff" : "rgba(255,255,255,0.45)",
                transition: "all 0.3s",
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* ══ INVITE FRIENDS ════════════════════════════════════════════ */}
      <div style={{ padding: "0 2.67vw 2.67vw" }}>
        <div style={{
          background: "linear-gradient(135deg,#0f1a2e 0%,#0a1628 50%,#0d1f35 100%)",
          borderRadius: "3.2vw", padding: "4vw",
          border: "0.13vw solid rgba(0,180,120,0.25)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          overflow: "hidden", position: "relative",
        }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.07,
            backgroundImage: "repeating-linear-gradient(0deg,#0bc98d 0,#0bc98d 1px,transparent 1px,transparent 20px),repeating-linear-gradient(90deg,#0bc98d 0,#0bc98d 1px,transparent 1px,transparent 20px)",
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: "4.27vw", fontWeight: 700, color: "#fff", marginBottom: "1.33vw" }}>Invite friends</div>
            <div style={{ fontSize: "3.2vw", color: "#c4c4c4", lineHeight: 1.5 }}>
              Invite friends to get up to 1888 USD<br />rewards
            </div>
          </div>
          <Link to="/invite" style={{
            textDecoration: "none", position: "relative", zIndex: 1,
            background: "#fff", color: "#000",
            fontSize: "3.2vw", fontWeight: 600,
            padding: "2.67vw 4vw", borderRadius: "6.67vw",
            whiteSpace: "nowrap", flexShrink: 0, marginLeft: "2.67vw",
          }}>
            Go to participate
          </Link>
        </div>
      </div>

      {/* ══ HOT SECTION ═══════════════════════════════════════════════ */}
      <div style={{ padding: "0 2.67vw 2.67vw" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.67vw" }}>
          <span style={{ fontSize: "4.53vw", fontWeight: 700, color: "#fff" }}>Hot</span>
          <Link to="/market" style={{ fontSize: "3.2vw", color: "#fff", textDecoration: "none",
            display: "flex", alignItems: "center", gap: "0.5vw" }}>
            More <ChevronRight style={{ width: "3.2vw", height: "3.2vw" }} />
          </Link>
        </div>
        {HOT_PAIRS.map(hp => (
          <Link key={hp.pair} to="/market" style={{ textDecoration: "none" }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "3vw 3.2vw", background: "#141416", borderRadius: "2.67vw", marginBottom: "2vw",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "2.67vw" }}>
                <img src={ORBIT_COINS[hp.sym as keyof typeof ORBIT_COINS]}
                  alt={hp.sym}
                  style={{ width: "9.33vw", height: "9.33vw", borderRadius: "50%", objectFit: "contain", background: "#000" }}
                />
                <div>
                  <div style={{ fontSize: "3.73vw", fontWeight: 700, color: "#fff" }}>{hp.pair}</div>
                  {/* flame icon */}
                  <span style={{ fontSize: "3vw" }}>🔥</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "3.47vw", fontWeight: 700, color: hp.up ? "#0bc98d" : "#ef4444" }}>
                  {hp.change}
                </div>
                <div style={{ fontSize: "3.2vw", color: "#fff", marginTop: "0.8vw" }}>{hp.price}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ══ CONTRACT STATISTICS ═══════════════════════════════════════ */}
      <div style={{ padding: "0 2.67vw 2.67vw" }}>
        <div style={{ background: "#141416", borderRadius: "2.67vw", padding: "4vw 3.2vw",
          minHeight: "14vw", display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: "4.53vw", fontWeight: 700, color: "#fff" }}>Contract statistics</span>
        </div>
      </div>

      {/* ══ BITCOIN VIX INDEX ═════════════════════════════════════════ */}
      <div style={{ padding: "0 2.67vw 2.67vw" }}>
        <div style={{ background: "#141416", borderRadius: "2.67vw", padding: "3.2vw" }}>
          <div style={{ marginBottom: "2.67vw" }}>
            <span style={{ fontSize: "4.53vw", fontWeight: 700, color: "#fff" }}>Bitcoin VIX Index</span>
          </div>
          <div style={{ fontSize: "3vw", color: "#888", marginBottom: "1vw", paddingLeft: "1.6vw" }}>5</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Gauge value={42} />
          </div>
        </div>
      </div>

      {/* ══ FINANCE BUTTON ════════════════════════════════════════════ */}
      <div style={{ padding: "0 2.67vw 4vw", display: "flex", justifyContent: "center" }}>
        <Link to="/finance" style={{
          textDecoration: "none", background: "#fff", color: "#000",
          fontSize: "4vw", fontWeight: 600,
          padding: "2.5vw 16vw", borderRadius: "8vw",
          display: "inline-block",
        }}>Finance</Link>
      </div>

      {/* ══ FINANCE CARD SLIDER ═══════════════════════════════════════ */}
      <div style={{ padding: "0 2.67vw 0" }}>
        <div style={{ overflowX: "auto", scrollbarWidth: "none" }}>
          <div style={{ display: "flex", gap: "3.2vw", paddingBottom: "2.67vw" }}>
            {FINANCE_CARDS.map((fc, i) => (
              <div key={fc.id} style={{
                flexShrink: 0, width: "88vw", borderRadius: "3.2vw",
                overflow: "hidden", background: "#141416",
                border: i === finCardIdx ? "1px solid #2a2a2e" : "1px solid #1e1e20",
                transition: "border-color 0.3s",
              }}>
                {/* Card image */}
                <div style={{ position: "relative" }}>
                  <img src={fc.img} alt={fc.label}
                    style={{ width: "100%", height: "42vw", objectFit: "cover", display: "block" }}
                  />
                  <span style={{
                    position: "absolute", top: "3vw", left: "3vw",
                    background: fc.tag === "regular" ? "#a259ff" : "#22d3ee",
                    color: "#fff", fontSize: "3.2vw", fontWeight: 700,
                    padding: "1vw 3vw", borderRadius: "4vw",
                  }}>Buy</span>
                </div>
                {/* Card text */}
                <div style={{ padding: "3.2vw 4vw 4vw" }}>
                  <div style={{ fontSize: "4vw", fontWeight: 700, color: "#fff", marginBottom: "2.67vw" }}>
                    {fc.label}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2vw" }}>
                    <div>
                      <span style={{ fontSize: "3.73vw", fontWeight: 700, color: "#fff" }}>{fc.buyers.toLocaleString()}</span>
                      <span style={{ fontSize: "3vw", color: "#888", marginLeft: "1vw" }}>Buyer Count</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "3.73vw", fontWeight: 700, color: "#0bc98d" }}>{fc.maxReturn}%</span>
                      <span style={{ fontSize: "3vw", color: "#888", marginLeft: "1vw" }}>Maximum Return</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: "1.5vw", background: "#2a2a2e", borderRadius: "1vw", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${fc.progress * 100}%`,
                      background: "linear-gradient(90deg,#22c55e,#0bc98d)",
                      borderRadius: "1vw", transition: "width 1s ease",
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ FINANCE INFO SECTION ══════════════════════════════════════ */}
      <div style={{ padding: "4vw 2.67vw 4vw" }}>
        <div style={{ marginBottom: "1.6vw" }}>
          <div style={{ fontSize: "5.33vw", fontWeight: 700, color: "#fff" }}>Finance</div>
          <div style={{ fontSize: "3.2vw", color: "#888", marginTop: "1vw" }}>
            Plan with Confidence. Invest Smart. Worry Less
          </div>
        </div>
        <div style={{ background: "#141416", borderRadius: "3.2vw", padding: "4vw", marginBottom: "4vw" }}>
          <div style={{ fontSize: "4.27vw", fontWeight: 700, color: "#fff", marginBottom: "3.2vw" }}>
            The Highest Annualized Return In History
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4vw" }}>
            <div>
              <div style={{ fontSize: "5.87vw", fontWeight: 800, color: "#0bc98d" }}>13.5%</div>
              <div style={{ fontSize: "3.2vw", color: "#888" }}>Current</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "5.87vw", fontWeight: 800, color: "#0bc98d" }}>18.6%</div>
              <div style={{ fontSize: "3.2vw", color: "#888" }}>Regular</div>
            </div>
          </div>
        </div>
        <Link to="/finance" style={{
          textDecoration: "none", display: "block",
          background: "#fff", color: "#000", textAlign: "center",
          fontSize: "4vw", fontWeight: 700, padding: "3.5vw",
          borderRadius: "2.67vw",
        }}>Buy Now</Link>
      </div>

      {/* ══ ICO SECTION ═══════════════════════════════════════════════ */}
      <div style={{ padding: "0 2.67vw 4vw" }}>
        <div style={{ marginBottom: "3.2vw" }}>
          <div style={{ fontSize: "5.33vw", fontWeight: 700, color: "#fff" }}>ICO</div>
          <div style={{ fontSize: "3.2vw", color: "#888", marginTop: "1vw" }}>
            Invest in Newly Issued Tokens and Tap into High Potential Returns
          </div>
        </div>

        {/* Floating coins animation area */}
        <div style={{
          background: "#0d0d10",
          borderRadius: "3.2vw",
          height: "52vw",
          position: "relative",
          overflow: "hidden",
          marginBottom: "4vw",
        }}>
          {ICO_COINS.map((src, i) => {
            const positions = [
              { top:"8%",  left:"10%",  size:"12vw", delay:"0s"    },
              { top:"5%",  left:"28%",  size:"14vw", delay:"0.5s"  },
              { top:"12%", left:"55%",  size:"13vw", delay:"1s"    },
              { top:"8%",  left:"75%",  size:"16vw", delay:"1.5s"  },
              { top:"52%", left:"5%",   size:"14vw", delay:"0.8s"  },
              { top:"55%", left:"32%",  size:"11vw", delay:"0.3s"  },
              { top:"48%", left:"60%",  size:"13vw", delay:"1.2s"  },
              { top:"50%", left:"80%",  size:"15vw", delay:"0.6s"  },
            ];
            const pos = positions[i] || positions[0];
            return (
              <img key={i} src={src} alt={`ico-${i}`}
                style={{
                  position: "absolute",
                  top: pos.top, left: pos.left,
                  width: pos.size, height: pos.size,
                  objectFit: "contain",
                  borderRadius: "50%",
                  animation: `float 6s ease-in-out ${pos.delay} infinite`,
                  filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.6))",
                }}
              />
            );
          })}
        </div>

        <Link to="/ico" style={{
          textDecoration: "none", display: "block",
          background: "#fff", color: "#000", textAlign: "center",
          fontSize: "4vw", fontWeight: 700, padding: "3.5vw",
          borderRadius: "8vw",
        }}>Start your ICO journey</Link>
      </div>

      {/* ══ NEWS SECTION ══════════════════════════════════════════════ */}
      <div style={{ padding: "0 2.67vw 4vw" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3.2vw" }}>
          <span style={{ fontSize: "4.53vw", fontWeight: 700, color: "#fff" }}>News</span>
          <Link to="/market" style={{ fontSize: "3.2vw", color: "#fff", textDecoration: "none",
            display: "flex", alignItems: "center", gap: "0.5vw" }}>
            More <ChevronRight style={{ width: "3.2vw", height: "3.2vw" }} />
          </Link>
        </div>
        {NEWS.map((n, i) => (
          <div key={i} style={{
            display: "flex", gap: "3.2vw", marginBottom: "4vw",
            paddingBottom: "4vw",
            borderBottom: i < NEWS.length - 1 ? "1px solid #1a1a1e" : "none",
          }}>
            {/* Thumbnail */}
            <div style={{ flexShrink: 0, width: "24vw", height: "18vw", borderRadius: "2vw", overflow: "hidden" }}>
              <img src={n.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.background = "#1c1c1e"; }} />
            </div>
            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1.6vw", marginBottom: "1.6vw" }}>
                {n.rank > 0 && (
                  <span style={{
                    flexShrink: 0,
                    background: n.rank === 1 ? "#22c55e" : n.rank === 2 ? "#f97316" : "#ef4444",
                    color: "#fff", fontSize: "2.8vw", fontWeight: 800,
                    width: "5.33vw", height: "5.33vw", borderRadius: "1vw",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{n.rank}</span>
                )}
                <div style={{ fontSize: "3.47vw", fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                  {n.title}
                </div>
              </div>
              <div style={{ fontSize: "3vw", color: "#666", lineHeight: 1.4, marginBottom: "1.6vw",
                whiteSpace: "pre-line", display: "-webkit-box",
                WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {n.src}
              </div>
              <div style={{ fontSize: "2.93vw", color: "#555" }}>{n.date}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ══ WHY CHOOSE US ═════════════════════════════════════════════ */}
      <div style={{ padding: "0 2.67vw 4vw" }}>
        <div style={{ background: "#141416", borderRadius: "3.2vw", padding: "5.33vw 4vw" }}>
          <div style={{ marginBottom: "5.33vw" }}>
            <div style={{ fontSize: "4.8vw", fontWeight: 700, color: "#fff" }}>Why choose us?</div>
            <div style={{ fontSize: "3.2vw", color: "#888", marginTop: "1vw" }}>Trusted by millions</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6.67vw" }}>
            {/* Stat 1 */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2vw" }}>
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <rect x="6" y="10" width="24" height="20" rx="3" stroke="#fff" strokeWidth="1.8"/>
                <polyline points="6,16 30,16" stroke="#fff" strokeWidth="1.5"/>
                <circle cx="36" cy="12" r="7" fill="#141416" stroke="#fff" strokeWidth="1.5"/>
                <line x1="36" y1="8" x2="36" y2="16" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="32" y1="12" x2="40" y2="12" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="12" y1="22" x2="20" y2="22" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="12" y1="26" x2="24" y2="26" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "4.53vw", fontWeight: 800, color: "#fff" }}>36132729+</div>
                <div style={{ fontSize: "3vw", color: "#888", marginTop: "0.5vw" }}>24h Vol</div>
              </div>
            </div>
            {/* Stat 2 */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2vw" }}>
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <rect x="6" y="6" width="18" height="22" rx="9" stroke="#fff" strokeWidth="1.8"/>
                <path d="M28 28 Q34 24 36 30 Q38 34 32 38 Q26 42 22 38" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                <circle cx="15" cy="14" r="4" stroke="#fff" strokeWidth="1.5"/>
                <line x1="15" y1="18" x2="15" y2="28" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "4.53vw", fontWeight: 800, color: "#fff" }}>+</div>
                <div style={{ fontSize: "3vw", color: "#888", marginTop: "0.5vw" }}>Number of users</div>
              </div>
            </div>
            {/* Stat 3 */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2vw" }}>
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <circle cx="22" cy="22" r="14" stroke="#fff" strokeWidth="1.8"/>
                <circle cx="22" cy="22" r="9"  stroke="#fff" strokeWidth="1.2" strokeDasharray="3 3"/>
                <polyline points="16,22 20,26 28,18" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "4.53vw", fontWeight: 800, color: "#fff" }}>&nbsp;</div>
                <div style={{ fontSize: "3vw", color: "#888", marginTop: "0.5vw" }}>Partner unit</div>
              </div>
            </div>
            {/* Stat 4 */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2vw" }}>
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <circle cx="22" cy="22" r="15" stroke="#fff" strokeWidth="1.8"/>
                <text x="22" y="27" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">$</text>
                <path d="M22 8 L22 10 M22 34 L22 36" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M8 22 L10 22 M34 22 L36 22" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "4.53vw", fontWeight: 800, color: "#fff" }}>0.01%</div>
                <div style={{ fontSize: "3vw", color: "#888", marginTop: "0.5vw" }}>Minimum transaction fees</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ PARTNERS ══════════════════════════════════════════════════ */}
      <div style={{ padding: "0 0 8vw" }}>
        <div style={{ paddingLeft: "2.67vw", marginBottom: "3.2vw" }}>
          <span style={{ fontSize: "4.53vw", fontWeight: 700, color: "#fff" }}>Partners</span>
        </div>
        {/* Auto-scrolling marquee of partner logos */}
        <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
          <div style={{
            display: "inline-flex", gap: "4vw",
            animation: "ticker-scroll 18s linear infinite",
          }}>
            {PARTNER_LOGOS.map((src, i) => (
              <div key={i} style={{
                flexShrink: 0, width: "28vw", height: "16vw",
                background: "#141416", borderRadius: "2.67vw",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
              }}>
                <img src={src} alt={`partner-${i}`}
                  style={{ maxWidth: "80%", maxHeight: "80%", objectFit: "contain" }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default MobileHome;
