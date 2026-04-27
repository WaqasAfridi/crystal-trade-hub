import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  X,
  ChevronRight,
  Globe,
  Gift,
  Wallet,
  Volume2,
  Newspaper,
  Lock,
  Copy,
  Pencil,
  AlertCircle,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const MOBILE_HEADER_H = 48;

/* ─────────────────────────────────────────────────────────────────
   Custom SVG icons
───────────────────────────────────────────────────────────────── */
const DrawerMenuIcon = () => (
  <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
    <line x1="7"  y1="3"  x2="21" y2="3"  stroke="white" strokeWidth="2"   strokeLinecap="round"/>
    <line x1="7"  y1="9"  x2="21" y2="9"  stroke="white" strokeWidth="2"   strokeLinecap="round"/>
    <line x1="7"  y1="15" x2="21" y2="15" stroke="white" strokeWidth="2"   strokeLinecap="round"/>
    <polyline points="5,1  1,3  5,5"  stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <polyline points="5,7  1,9  5,11" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <polyline points="5,13 1,15 5,17" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

const TriangleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 3L22 21H2L12 3Z" stroke="#111" strokeWidth="1.8" strokeLinejoin="round"/>
    <line x1="12" y1="10" x2="12" y2="15" stroke="#111" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="12" cy="18" r="0.8" fill="#111"/>
  </svg>
);

const RewardIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="11" r="7" stroke="#111" strokeWidth="1.8"/>
    <path d="M10 18L8 26L14 23L20 26L18 18" stroke="#111" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M11 11L13 13L17 9" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ConvertIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M5 14C5 9 9 5 14 5"   stroke="#111" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M23 14C23 19 19 23 14 23" stroke="#111" strokeWidth="1.8" strokeLinecap="round"/>
    <polyline points="11,2  14,5  11,8"  stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <polyline points="17,20 14,23 17,26" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

const CryptoIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="12" stroke="#111" strokeWidth="1.8"/>
    <path d="M11 9h5c1.7 0 2.8 1 2.8 2.4 0 1-.5 1.7-1.3 2.1 1 .4 1.7 1.2 1.7 2.4 0 1.8-1.3 2.8-3.2 2.8H11V9z"
      stroke="#111" strokeWidth="1.5" strokeLinejoin="round"/>
    <line x1="13" y1="8"  x2="13" y2="10" stroke="#111" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="15" y1="8"  x2="15" y2="10" stroke="#111" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="13" y1="18" x2="13" y2="20" stroke="#111" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="15" y1="18" x2="15" y2="20" stroke="#111" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const USStocksIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="4" y="4" width="20" height="20" rx="3" stroke="#111" strokeWidth="1.8"/>
    <text x="14" y="13" textAnchor="middle" fontSize="7" fontWeight="700" fill="#111">$</text>
    <line x1="8"  y1="20" x2="8"  y2="16" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
    <line x1="12" y1="20" x2="12" y2="13" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
    <line x1="16" y1="20" x2="16" y2="15" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
    <line x1="20" y1="20" x2="20" y2="11" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const FXIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="12" stroke="#111" strokeWidth="1.8"/>
    <text x="14" y="19" textAnchor="middle" fontSize="9" fontWeight="700" fill="#111">FX</text>
  </svg>
);

const FinanceIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <ellipse cx="14" cy="8"  rx="8" ry="3" stroke="#111" strokeWidth="1.8"/>
    <path d="M6 8v5c0 1.7 3.6 3 8 3s8-1.3 8-3V8"  stroke="#111" strokeWidth="1.8"/>
    <path d="M6 13v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5" stroke="#111" strokeWidth="1.8"/>
  </svg>
);

const AIStrategyIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="12" stroke="#111" strokeWidth="1.8"/>
    <text x="14" y="13" textAnchor="middle" fontSize="7" fontWeight="700" fill="#111">AI</text>
    <path d="M8 20 Q14 15 20 20" stroke="#111" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
);

const AndroidIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="6" y="11" width="16" height="12" rx="2" stroke="#111" strokeWidth="1.8"/>
    <circle cx="11" cy="16" r="1.2" fill="#111"/>
    <circle cx="17" cy="16" r="1.2" fill="#111"/>
    <line x1="10" y1="11" x2="8"  y2="7"  stroke="#111" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="18" y1="11" x2="20" y2="7"  stroke="#111" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="8"  cy="6.5" r="1" fill="#111"/>
    <circle cx="20" cy="6.5" r="1" fill="#111"/>
    <line x1="3"  y1="14" x2="5"  y2="14" stroke="#111" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="23" y1="14" x2="25" y2="14" stroke="#111" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const IOSIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M19 8c-1 0-2 .5-2.7 1.3C15.5 8.5 14.5 8 13.5 8c-2.5 0-4.5 2.5-4.5 6 0 4 2.5 8 4.5 8 .8 0 1.5-.5 2.5-.5s1.7.5 2.5.5c2 0 3.5-4 3.5-4s-2-1-2-3.5 2-3.5 2-3.5c-1-1.5-2.5-2.5-3-2.5z"
      stroke="#111" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M17 4c0 1.5-1.5 3-3 3" stroke="#111" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const KYCIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="9" r="4" stroke="#111" strokeWidth="1.8"/>
    <path d="M6 23c0-4 3.6-7 8-7s8 3 8 7" stroke="#111" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M20 13l3 1.5v3c0 2-3 3.5-3 3.5s-3-1.5-3-3.5v-3L20 13z"
      stroke="#111" strokeWidth="1.6" strokeLinejoin="round"/>
  </svg>
);

const CertIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="5" y="4" width="18" height="20" rx="2" stroke="#111" strokeWidth="1.8"/>
    <line x1="9"  y1="10" x2="19" y2="10" stroke="#111" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="9"  y1="14" x2="19" y2="14" stroke="#111" strokeWidth="1.6" strokeLinecap="round"/>
    <polyline points="9,18 11,20 15,16" stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

/* ─────────────────────────────────────────────────────────────────
   Icon grid
───────────────────────────────────────────────────────────────── */
interface GridItem {
  icon: React.ReactNode;
  label: string;
  action: () => void;
}

const IconGrid = ({ items }: { items: GridItem[] }) => (
  <div className="grid grid-cols-4 gap-y-5 px-4 py-4">
    {items.map((item) => (
      <button
        key={item.label}
        onClick={item.action}
        className="flex flex-col items-center gap-1.5"
      >
        <div className="w-12 h-12 flex items-center justify-center">
          {item.icon}
        </div>
        <span className="text-xs text-gray-500 text-center leading-tight whitespace-pre-line">
          {item.label}
        </span>
      </button>
    ))}
  </div>
);

/* ═════════════════════════════════════════════════════════════════
   MobileHeader
═════════════════════════════════════════════════════════════════ */
const MobileHeader = () => {
  const [panelOpen, setPanelOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, displayName, shortId, logout } = useAuth();

  const avatarSrc = user?.avatarUrl ?? "/profile-avatar.png";

  const kycStatus = user?.kyc?.status ?? null;
  const kycLabel =
    kycStatus === "APPROVED"
      ? "Verified"
      : kycStatus === "PENDING"
      ? "Pending"
      : "Not Verified";
  const kycColor =
    kycStatus === "APPROVED"
      ? "#22c55e"
      : kycStatus === "PENDING"
      ? "#f59e0b"
      : "#9ca3af";

  const close = () => setPanelOpen(false);
  const go    = (path: string) => { navigate(path); close(); };

  const handleLogout = async () => {
    close();
    await logout();
    toast.success("Logged out successfully.");
  };

  /* ── Shared grid sections ─────────────────────────────────────── */
  const commonFunctions: GridItem[] = [
    { icon: <Globe   size={26} strokeWidth={1.6} color="#111"/>, label: "Language",        action: close },
    { icon: <Gift    size={26} strokeWidth={1.6} color="#111"/>, label: "Invite",           action: () => go("/invite") },
    { icon: <RewardIcon />,                                      label: "Reward center",    action: () => go("/rewards") },
    { icon: <Wallet  size={26} strokeWidth={1.6} color="#111"/>, label: "Funding\nrecords", action: () => go("/assets/funding-records") },
    { icon: <ConvertIcon />,                                     label: "Convert",          action: () => go("/assets/convert") },
  ];

  const markets: GridItem[] = [
    { icon: <CryptoIcon />,   label: "Crypto",    action: () => go("/spot/crypto") },
    { icon: <USStocksIcon />, label: "US stocks", action: () => go("/futures/stocks") },
    { icon: <FXIcon />,       label: "FX",        action: () => go("/futures/fx") },
  ];

  const finance: GridItem[] = [
    { icon: <FinanceIcon />,    label: "Finance",     action: () => go("/finance") },
    { icon: <AIStrategyIcon />, label: "AI Strategy", action: () => go("/assets/ai-strategy") },
  ];

  const other: GridItem[] = [
    { icon: <Volume2  size={26} strokeWidth={1.6} color="#111"/>,   label: "Bulletin",                action: close },
    { icon: <Newspaper size={26} strokeWidth={1.6} color="#111"/>,  label: "News",                    action: () => go("/market") },
    { icon: <Lock     size={26} strokeWidth={1.6} color="#111"/>,   label: "Security\nCenter",        action: () => go("/kyc") },
    { icon: <KYCIcon />,                                            label: "KYC",                     action: () => go("/kyc") },
    { icon: <CertIcon />,                                           label: "Advanced\nCertification", action: close },
  ];

  const downloads: GridItem[] = [
    { icon: <AndroidIcon />, label: "Android", action: close },
    { icon: <IOSIcon />,     label: "IOS",     action: close },
  ];

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          FIXED HEADER BAR
      ══════════════════════════════════════════════════════════ */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4"
        style={{ height: `${MOBILE_HEADER_H}px`, background: "#0a0a0f" }}
      >
        <Link to="/" className="flex items-center gap-1.5">
          <div
            className="flex items-center justify-center rounded-sm"
            style={{
              width: "28px",
              height: "20px",
              background: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <span style={{ fontSize: "7px", fontWeight: 700, color: "#fff", letterSpacing: "0.03em", lineHeight: 1 }}>
              ENX
            </span>
          </div>
          <span className="text-base font-bold text-white">Enivex</span>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <Link to="/notifications" className="text-white/80 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </Link>
          )}
          <button
            onClick={() => setPanelOpen((o) => !o)}
            className="text-white/80 hover:text-white transition-colors"
          >
            {panelOpen ? <X className="w-5 h-5" /> : <DrawerMenuIcon />}
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          BACKDROP
      ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed left-0 right-0 bottom-0 z-40"
            style={{ top: `${MOBILE_HEADER_H}px`, background: "rgba(0,0,0,0.35)" }}
            onClick={close}
          />
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════
          SLIDE PANEL
      ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: "easeInOut" }}
            className="fixed right-0 bottom-0 z-50 overflow-y-auto"
            style={{
              top: `${MOBILE_HEADER_H}px`,
              width: "100%",
              maxWidth: "480px",
              background: "#f5f6f8",
            }}
          >

            {/* ══════════════════════════════════════════════════
                LOGGED-OUT STATE — Login / Register buttons
            ══════════════════════════════════════════════════ */}
            {!isAuthenticated && (
              <div className="mx-3 mt-3 mb-4 flex gap-3">
                <Link
                  to="/login"
                  onClick={close}
                  className="flex-1 py-3.5 text-center text-sm font-semibold text-gray-900 bg-white rounded-2xl border border-gray-200 hover:bg-gray-50 transition-colors"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={close}
                  className="flex-1 py-3.5 text-center text-sm font-semibold text-white rounded-2xl transition-colors"
                  style={{ background: "#111" }}
                >
                  Register
                </Link>
              </div>
            )}

            {/* ══════════════════════════════════════════════════
                LOGGED-IN STATE — User card
            ══════════════════════════════════════════════════ */}
            {isAuthenticated && (
              <>
                <div className="mx-3 mt-3 mb-2 rounded-2xl bg-white px-4 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={avatarSrc}
                      alt="avatar"
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      style={{ border: "2px solid #e879a0" }}
                      onError={(e) =>
                        ((e.currentTarget as HTMLImageElement).src = "/profile-avatar.png")
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 truncate">
                          {displayName}
                        </span>
                        <span
                          className="text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: kycColor, color: "#fff" }}
                        >
                          {kycLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-gray-500">UID: {shortId}</span>
                        <button
                          className="text-gray-400 hover:text-gray-600"
                          onClick={() => {
                            navigator.clipboard.writeText(user?.id ?? "");
                            toast.success("UID copied!");
                          }}
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => go("/profile")}
                      className="text-gray-400 hover:text-gray-700 flex-shrink-0"
                    >
                      <Pencil size={18} />
                    </button>
                  </div>
                </div>

                {/* Simulated Trading */}
                <div className="mx-3 mb-4 rounded-2xl bg-white">
                  <button
                    onClick={() => go("/")}
                    className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl"
                  >
                    <TriangleIcon />
                    <span className="flex-1 text-sm font-medium text-gray-800 text-left">
                      Simulated Trading
                    </span>
                    <ChevronRight size={18} className="text-gray-400" />
                  </button>
                </div>
              </>
            )}

            {/* ── Commonly used functions ───────────────────── */}
            <p className="px-4 text-sm font-bold text-gray-900 mb-1">Commonly used functions</p>
            <div className="mx-3 rounded-2xl bg-white mb-4">
              <IconGrid items={commonFunctions} />
            </div>

            {/* ── Markets ───────────────────────────────────── */}
            <p className="px-4 text-sm font-bold text-gray-900 mb-1">Markets</p>
            <div className="mx-3 rounded-2xl bg-white mb-4">
              <IconGrid items={markets} />
            </div>

            {/* ── Finance ───────────────────────────────────── */}
            <p className="px-4 text-sm font-bold text-gray-900 mb-1">Finance</p>
            <div className="mx-3 rounded-2xl bg-white mb-4">
              <IconGrid items={finance} />
            </div>

            {/* ── Other ─────────────────────────────────────── */}
            <p className="px-4 text-sm font-bold text-gray-900 mb-1">Other</p>
            <div className="mx-3 rounded-2xl bg-white mb-4">
              <IconGrid items={other} />
            </div>

            {/* ── Download ──────────────────────────────────── */}
            <p className="px-4 text-sm font-bold text-gray-900 mb-1">Download</p>
            <div className="mx-3 rounded-2xl bg-white mb-4">
              <IconGrid items={downloads} />
            </div>

            {/* ── About Enivex ──────────────────────────────── */}
            <div className="mx-3 mb-4 rounded-2xl bg-white">
              <button className="w-full flex items-center gap-3 px-4 py-4">
                <AlertCircle size={22} className="text-gray-700" strokeWidth={1.6} />
                <span className="flex-1 text-sm font-medium text-gray-800 text-left">
                  About  Enivex
                </span>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
            </div>

            {/* ── Log out (only when logged in) ─────────────── */}
            {isAuthenticated && (
              <div className="px-3 pb-8">
                <button
                  className="w-full py-4 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                  style={{ background: "#111" }}
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            )}

            {/* Bottom padding when logged out */}
            {!isAuthenticated && <div className="pb-8" />}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileHeader;
