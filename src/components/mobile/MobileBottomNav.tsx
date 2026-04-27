import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────────────────────────
   BOTTOM NAV HEIGHT — exported so MobileLayout can reserve space
───────────────────────────────────────────────────────────────── */
export const MOBILE_BOTTOM_NAV_H = 56; // px

/* ─────────────────────────────────────────────────────────────────
   Route → active tab
───────────────────────────────────────────────────────────────── */
type TabKey = "home" | "market" | "trade" | "finance" | "assets";

function resolveTab(pathname: string): TabKey {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/market")) return "market";
  if (
    pathname.startsWith("/spot") ||
    pathname.startsWith("/futures") ||
    pathname.startsWith("/buy") ||
    pathname.startsWith("/conversion") ||
    pathname.startsWith("/transfer")
  )
    return "trade";
  if (pathname.startsWith("/finance") || pathname.startsWith("/earn"))
    return "finance";
  if (
    pathname.startsWith("/assets") ||
    pathname.startsWith("/recharge") ||
    pathname.startsWith("/withdraw")
  )
    return "assets";
  return "home";
}

/* ─────────────────────────────────────────────────────────────────
   SVG Icons
───────────────────────────────────────────────────────────────── */
const HomeIcon = ({ active }: { active: boolean }) =>
  active ? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z" fill="#fff" />
      <path d="M9 22V13h6v9" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z" stroke="#6b7280" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 22V13h6v9" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

const MarketIcon = ({ active }: { active: boolean }) => {
  const col = active ? "#fff" : "#6b7280";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3"  y="12" width="4" height="9" rx="1" fill={col} />
      <rect x="10" y="7"  width="4" height="14" rx="1" fill={col} />
      <rect x="17" y="3"  width="4" height="18" rx="1" fill={col} />
    </svg>
  );
};

const TradeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M6 14C6 9.58 9.58 6 14 6" stroke="#111" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M22 14C22 18.42 18.42 22 14 22" stroke="#111" strokeWidth="2.2" strokeLinecap="round" />
    <polyline points="11,3 14,6 11,9"   stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <polyline points="17,19 14,22 17,25" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const FinanceIcon = ({ active }: { active: boolean }) => {
  const col = active ? "#111" : "#6b7280";
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        background: active ? "#fff" : "transparent",
        border: active ? "none" : "1.5px solid #6b7280",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <polyline points="2,13 6,8 10,11 16,4" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <polyline points="13,4 16,4 16,7"       stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
  );
};

const AssetsIcon = ({ active }: { active: boolean }) => {
  const col = active ? "#fff" : "#6b7280";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke={col} strokeWidth="1.8" fill="none" />
      <line x1="2" y1="10" x2="22" y2="10" stroke={col} strokeWidth="1.8" />
      <rect x="5" y="14" width="4" height="2" rx="0.5" fill={col} />
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────────────
   Tab config
───────────────────────────────────────────────────────────────── */
const TABS: { key: TabKey; label: string; path: string }[] = [
  { key: "home",    label: "Home",    path: "/"           },
  { key: "market",  label: "Market",  path: "/market"     },
  { key: "trade",   label: "Trade",   path: "/spot/crypto" },
  { key: "finance", label: "Finance", path: "/finance"    },
  { key: "assets",  label: "Assets",  path: "/assets"     },
];

/* ─────────────────────────────────────────────────────────────────
   The nav bar markup
───────────────────────────────────────────────────────────────── */
const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = resolveTab(location.pathname);

  return (
    <nav
      style={{
        /* ── guaranteed viewport-fixed ── */
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        /* ── visuals ── */
        height: `${MOBILE_BOTTOM_NAV_H}px`,
        background: "#16161f",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        /* iOS safe-area notch */
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const isTrade  = tab.key === "trade";

        return (
          <button
            key={tab.key}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: isTrade ? "flex-end" : "center",
              gap: isTrade ? 0 : 4,
              paddingBottom: isTrade ? 7 : 0,
              position: "relative",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {isTrade ? (
              <>
                {/* Floating white circle — pokes above the bar */}
                <div
                  style={{
                    position: "absolute",
                    bottom: `calc(100% - 18px)`,   /* overlaps bar by 18 px */
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 -2px 16px rgba(0,0,0,0.5)",
                    pointerEvents: "none",
                  }}
                >
                  <TradeIcon />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? "#fff" : "#6b7280",
                    lineHeight: 1,
                  }}
                >
                  {tab.label}
                </span>
              </>
            ) : (
              <>
                {tab.key === "home"    && <HomeIcon    active={isActive} />}
                {tab.key === "market"  && <MarketIcon  active={isActive} />}
                {tab.key === "finance" && <FinanceIcon active={isActive} />}
                {tab.key === "assets"  && <AssetsIcon  active={isActive} />}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? "#fff" : "#6b7280",
                    lineHeight: 1,
                  }}
                >
                  {tab.label}
                </span>
              </>
            )}
          </button>
        );
      })}
    </nav>
  );
};

/* ─────────────────────────────────────────────────────────────────
   MobileBottomNav — rendered via portal directly into document.body
   so NO parent CSS (transform, overflow, z-index, padding, etc.)
   can ever interfere with its fixed positioning.
───────────────────────────────────────────────────────────────── */
const MobileBottomNav = () =>
  createPortal(<NavBar />, document.body);

export default MobileBottomNav;
