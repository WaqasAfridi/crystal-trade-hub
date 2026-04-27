import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Globe,
  Menu,
  X,
  Bell,
  Download,
  Upload,
  RefreshCw,
  Send,
  LayoutDashboard,
  FileText,
  Clock,
  Receipt,
  ArrowLeftRight,
  Award,
  Ticket,
  Brain,
  ClipboardList,
  User,
  Gift,
  UserPlus,
  Monitor,
  Power,
  Check,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import BuyModal from "../modals/BuyModal";
import { useAuth } from "@/contexts/AuthContext";

/* ── Nav dropdown data ─────────────────────────────────────────── */
const spotMenu = [
  {
    title: "Crypto",
    desc: "Initiated the blockchain revolution by establishing the principles of digital scarcity and decentralized value storage.",
    icon: "/navbar-icons/white bitcoin icon.png",
    href: "/spot/crypto",
    protected: true,
  },
];
const futuresMenu = [
  {
    title: "Crypto",
    desc: "Initiated the blockchain revolution by establishing the principles of digital scarcity and decentralized value storage.",
    icon: "/navbar-icons/white bitcoin icon.png",
    href: "/futures/crypto",
    protected: false,
  },
  {
    title: "US stocks",
    desc: "High growth potential, the first choice for pursuing capital appreciation.",
    icon: "/navbar-icons/US stocks icon.png",
    href: "/futures/stocks",
    protected: false,
  },
  {
    title: "FX",
    desc: "Initiated the blockchain revolution by establishing the principles of digital scarcity and decentralized value storage.",
    icon: "/navbar-icons/FX icon.png",
    href: "/futures/fx",
    protected: false,
  },
];
const financeMenu = [
  {
    title: "Finance",
    desc: "Intelligent investment and technology leadership help you grasp market trends.",
    icon: "/navbar-icons/finance icon.png",
    href: "/finance",
    protected: true,
  },
];

/* ── Assets dropdown items ─────────────────────────────────────── */
const assetsMenu = [
  { label: "Deposit",           icon: Download,       href: "/assets/deposit" },
  { label: "Withdraw",          icon: Upload,         href: "/assets/withdraw" },
  { label: "Convert",           icon: RefreshCw,      href: "/assets/convert" },
  { label: "Transfer",          icon: Send,           href: "/assets/transfer" },
  { label: "Overview",          icon: LayoutDashboard, href: "/assets/overview" },
  { label: "Funding Records",   icon: FileText,       href: "/assets/funding-records" },
  { label: "History",           icon: Clock,          href: "/assets/history" },
  { label: "Financial Records", icon: Receipt,        href: "/assets/financial-records" },
  { label: "Exchange History",  icon: ArrowLeftRight, href: "/assets/exchange-history" },
  { label: "Commission Record", icon: Award,          href: "/assets/commission-record" },
  { label: "Lottery records",   icon: Ticket,         href: "/assets/lottery-records" },
  { label: "AI Strategy",       icon: Brain,          href: "/assets/ai-strategy" },
  { label: "Order List",        icon: ClipboardList,  href: "/assets/order-list" },
];

/* ── Profile dropdown items ────────────────────────────────────── */
const profileMenu = [
  { label: "My Page",           icon: User,    href: "/profile" },
  { label: "RewardsHub",        icon: Gift,    href: "/rewards" },
  { label: "Invite",            icon: UserPlus, href: "/invite" },
  { label: "Simulated Trading", icon: Monitor, href: "/simulated-trading" },
];

/* ── Language list ─────────────────────────────────────────────── */
const languages = [
  { code: "en",  label: "English",          flag: "https://flagcdn.com/w40/us.png" },
  { code: "ko",  label: "한국어",            flag: "https://flagcdn.com/w40/kr.png" },
  { code: "ja",  label: "日本語",            flag: "https://flagcdn.com/w40/jp.png" },
  { code: "hi",  label: "हिंदी",             flag: "https://flagcdn.com/w40/in.png" },
  { code: "es",  label: "español",          flag: "https://flagcdn.com/w40/es.png" },
  { code: "de",  label: "Deutsch",          flag: "https://flagcdn.com/w40/de.png" },
  { code: "ar",  label: "عربي",             flag: "https://flagcdn.com/w40/sa.png" },
  { code: "vi",  label: "Tiếng Việt",       flag: "https://flagcdn.com/w40/vn.png" },
  { code: "ur",  label: "اردو",             flag: "https://flagcdn.com/w40/pk.png" },
  { code: "si",  label: "සිංහල",            flag: "https://flagcdn.com/w40/lk.png" },
  { code: "bn",  label: "বাংলা",            flag: "https://flagcdn.com/w40/bd.png" },
  { code: "pt",  label: "Português",        flag: "https://flagcdn.com/w40/pt.png" },
  { code: "fr",  label: "Français",         flag: "https://flagcdn.com/w40/fr.png" },
  { code: "nl",  label: "Nederlands",       flag: "https://flagcdn.com/w40/nl.png" },
  { code: "sv",  label: "svenska",          flag: "https://flagcdn.com/w40/se.png" },
  { code: "it",  label: "Italiano",         flag: "https://flagcdn.com/w40/it.png" },
  { code: "tr",  label: "Türkçe",           flag: "https://flagcdn.com/w40/tr.png" },
  { code: "zh",  label: "繁體中文",          flag: "https://flagcdn.com/w40/tw.png" },
];

type DropdownKey = "spot" | "futures" | "finance" | null;
type RightPanel  = "assets" | "profile" | "notifications" | "language" | null;

function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

/* ═══════════════════════════════════════════════════════════════ */
const Header = () => {
  const { user, isAuthenticated, displayName, shortId, logout } = useAuth();

  const [openMenu,    setOpenMenu]    = useState<DropdownKey>(null);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [rightPanel,  setRightPanel]  = useState<RightPanel>(null);
  const [selectedLang, setSelectedLang] = useState("en");

  const rightRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useOutsideClick(rightRef, () => setRightPanel(null));

  const togglePanel = (panel: RightPanel) =>
    setRightPanel((prev) => (prev === panel ? null : panel));

  const handleLogout = async () => {
    setRightPanel(null);
    await logout();
    navigate("/");
    toast.success("Logged out successfully.");
  };

  const avatarSrc = user?.avatarUrl ?? "/profile-avatar.png";

  /* ── Shared dropdown card style ──────────────────────────────── */
  const dropdownStyle: React.CSSProperties = {
    background: "#1b1c20",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
  };

  /* ── Center nav dropdown renderer ────────────────────────────── */
  type MenuItem = {
    title: string;
    desc: string;
    icon: string;
    href: string;
    protected: boolean;
  };

  const renderDropdown = (items: MenuItem[]) => (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full left-0 mt-0 w-72 z-50"
      style={{ paddingTop: "8px" }}
    >
      <div
        className="rounded-xl border border-white/10 shadow-2xl p-2"
        style={{ background: "#1b1c20" }}
      >
        {items.map((item) => (
          <Link
            key={item.title}
            to={item.href}
            className="block p-3 rounded-lg transition-colors"
            style={{ background: "transparent" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#31353d")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "transparent")
            }
            onClick={() => setOpenMenu(null)}
          >
            <div className="flex items-center gap-2 mb-1">
              <img
                src={item.icon}
                alt={item.title}
                className="w-5 h-5 object-contain flex-shrink-0"
                style={{ filter: "brightness(1.4) contrast(1.6)" }}
              />
              <span className="font-semibold text-white text-base">
                {item.title}
              </span>
            </div>
            <p
              className="text-sm text-white/50 leading-relaxed"
              style={{ paddingLeft: "28px" }}
            >
              {item.desc}
            </p>
          </Link>
        ))}
      </div>
    </motion.div>
  );

  const NavItem = ({
    label,
    dropdown,
    items,
  }: {
    label: string;
    dropdown?: DropdownKey;
    items?: MenuItem[];
  }) => (
    <div
      className="relative"
      onMouseEnter={() => dropdown && setOpenMenu(dropdown)}
      onMouseLeave={() => setOpenMenu(null)}
    >
      <button className="flex items-center gap-0.5 px-3 py-2 text-base font-normal text-white hover:text-white/70 transition-colors">
        {label}
        {dropdown && (
          <ChevronDown
            className={`w-3.5 h-3.5 ml-0.5 transition-transform ${
              openMenu === dropdown ? "rotate-180" : ""
            }`}
          />
        )}
      </button>
      <AnimatePresence>
        {dropdown && openMenu === dropdown && items && renderDropdown(items)}
      </AnimatePresence>
    </div>
  );

  /* ── ICO nav click guard ─────────────────────────────────────── */
  const handleIcoClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toast.error("You must login first before accessing the ICO page.", {
        duration: 3500,
      });
      navigate("/login");
    }
  };

  /* ════════════════════════════════════════════════════════════ */
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5"
      style={{
        background: "rgba(0,0,0,0.15)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="w-full px-6">
        <div className="flex items-center h-12">
          {/* ── Logo ──────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div
              className="flex items-center justify-center rounded-sm"
              style={{
                width: "32px",
                height: "22px",
                background: "#1a1a1a",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span
                style={{
                  fontSize: "8px",
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "0.03em",
                  lineHeight: 1,
                }}
              >
                ENX
              </span>
            </div>
            <span className="text-lg font-bold text-white">Enivex</span>
          </Link>

          {/* ── Desktop Nav — centred ─────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            <Link
              to="/"
              className="px-3 py-2 text-base font-normal text-white hover:text-white/70 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/market"
              className="px-3 py-2 text-base font-normal text-white hover:text-white/70 transition-colors"
            >
              Markets
            </Link>
            <NavItem label="Spot"    dropdown="spot"    items={spotMenu}    />
            <NavItem label="Futures" dropdown="futures" items={futuresMenu} />
            <NavItem label="Finance" dropdown="finance" items={financeMenu} />
            <Link
              to="/ico"
              onClick={handleIcoClick}
              className="px-3 py-2 text-base font-normal text-white hover:text-white/70 transition-colors"
            >
              ICO
            </Link>
            <button
              onClick={() => setBuyModalOpen(true)}
              className="px-3 py-2 text-base font-normal text-white hover:text-white/70 transition-colors"
            >
              Buy now
            </button>
          </nav>

          {/* ── Right side ────────────────────────────────────── */}
          <div ref={rightRef} className="flex items-center ml-auto gap-1">

            {/* ════════════════════════════════════════════════
                LOGGED-OUT state (desktop) — Login | Register | Globe
            ════════════════════════════════════════════════ */}
            {!isAuthenticated && (
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-3 py-2 text-base font-normal text-white hover:text-white/70 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm font-medium text-white rounded-full transition-colors hover:bg-white/10"
                  style={{ border: "1px solid rgba(255,255,255,0.35)" }}
                >
                  Register
                </Link>
              </div>
            )}

            {/* ════════════════════════════════════════════════
                LOGGED-IN state (desktop) — Assets | Avatar | | Bell
            ════════════════════════════════════════════════ */}
            {isAuthenticated && (
              <>
                {/* Assets dropdown */}
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => togglePanel("assets")}
                    className="flex items-center gap-1 px-4 py-2 text-base font-normal text-white hover:text-white/70 transition-colors"
                  >
                    Assets
                    <span
                      className="transition-transform"
                      style={{
                        display: "inline-block",
                        width: 0, height: 0,
                        borderLeft: "4px solid transparent",
                        borderRight: "4px solid transparent",
                        borderTop: "5px solid #fff",
                        marginLeft: "2px",
                        transform:
                          rightPanel === "assets"
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                      }}
                    />
                  </button>
                  <AnimatePresence>
                    {rightPanel === "assets" && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 z-50 w-52 rounded-xl py-2 mt-1"
                        style={dropdownStyle}
                      >
                        {assetsMenu.map((item) => (
                          <Link
                            key={item.label}
                            to={item.href}
                            onClick={() => setRightPanel(null)}
                            className="flex items-center gap-3 px-5 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <item.icon className="w-4 h-4 text-white/50" />
                            {item.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Avatar + profile dropdown */}
                <div className="relative hidden sm:block ml-2">
                  <button
                    onClick={() => togglePanel("profile")}
                    className="p-1 rounded-full transition-opacity hover:opacity-80"
                  >
                    <img
                      src={avatarSrc}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                      style={{ border: "2px solid #e879a0" }}
                      onError={(e) =>
                        ((e.currentTarget as HTMLImageElement).src =
                          "/profile-avatar.png")
                      }
                    />
                  </button>
                  <AnimatePresence>
                    {rightPanel === "profile" && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 z-50 w-56 rounded-xl py-2 mt-1"
                        style={dropdownStyle}
                      >
                        {/* User info */}
                        <Link
                          to="/profile"
                          onClick={() => setRightPanel(null)}
                          className="flex items-center gap-3 px-5 py-3 border-b border-white/8 hover:bg-white/5 transition-colors"
                          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
                        >
                          <img
                            src={avatarSrc}
                            alt="Profile"
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            style={{ border: "2px solid #e879a0" }}
                            onError={(e) =>
                              ((e.currentTarget as HTMLImageElement).src =
                                "/profile-avatar.png")
                            }
                          />
                          <div className="min-w-0">
                            <p className="text-sm text-white font-medium truncate">
                              {displayName}
                            </p>
                            <p className="text-xs text-white/40 mt-0.5">
                              User ID: {shortId}
                            </p>
                          </div>
                        </Link>
                        {profileMenu.map((item) => (
                          <Link
                            key={item.label}
                            to={item.href}
                            onClick={() => setRightPanel(null)}
                            className="flex items-center gap-3 px-5 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <item.icon className="w-4 h-4 text-white/50" />
                            {item.label}
                          </Link>
                        ))}
                        <div
                          className="mt-1 pt-1"
                          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
                        >
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-5 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors w-full"
                          >
                            <Power className="w-4 h-4 text-white/50" />
                            Log out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Separator */}
                <div className="hidden sm:block w-px h-4 bg-white/15 mx-4" />

                {/* Bell icon + notifications */}
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => togglePanel("notifications")}
                    className="p-2 text-white/70 hover:text-white transition-colors"
                  >
                    <Bell className="w-[22px] h-[22px]" />
                  </button>
                  <AnimatePresence>
                    {rightPanel === "notifications" && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 z-50 rounded-xl mt-1"
                        style={{
                          ...dropdownStyle,
                          width: "280px",
                          minHeight: "320px",
                        }}
                      >
                        <div
                          className="flex items-center justify-between px-5 py-3"
                          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
                        >
                          <span className="text-sm text-white">
                            <span className="text-green-400 font-semibold mr-1">
                              0
                            </span>
                            Notifications
                          </span>
                          <Link
                            to="/notifications"
                            onClick={() => setRightPanel(null)}
                            className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
                          >
                            View All <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                        <div className="flex flex-col items-center justify-center py-14 text-white/30">
                          <svg
                            width="64"
                            height="64"
                            viewBox="0 0 80 80"
                            fill="none"
                            className="mb-3 opacity-40"
                          >
                            <rect
                              x="20" y="15" width="40" height="50" rx="4"
                              stroke="currentColor" strokeWidth="2"
                            />
                            <line x1="28" y1="30" x2="52" y2="30" stroke="currentColor" strokeWidth="2" />
                            <line x1="28" y1="38" x2="48" y2="38" stroke="currentColor" strokeWidth="2" />
                            <line x1="28" y1="46" x2="44" y2="46" stroke="currentColor" strokeWidth="2" />
                            <circle cx="58" cy="22" r="8" stroke="currentColor" strokeWidth="2" />
                            <circle cx="18" cy="52" r="6" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          <span className="text-sm">No Data</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {/* Globe icon — always visible (language selector) */}
            <div className="relative ml-1">
              <button
                onClick={() => togglePanel("language")}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <Globe className="w-[22px] h-[22px]" />
              </button>
              <AnimatePresence>
                {rightPanel === "language" && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 z-50 rounded-xl py-2 mt-1 overflow-y-auto"
                    style={{ ...dropdownStyle, width: "240px", maxHeight: "420px" }}
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLang(lang.code);
                          setRightPanel(null);
                        }}
                        className="flex items-center gap-3 px-5 py-2.5 text-white/80 hover:text-white hover:bg-white/5 transition-colors w-full"
                        style={{ fontSize: "15px" }}
                      >
                        <img
                          src={lang.flag}
                          alt={lang.label}
                          style={{ width: "28px", height: "19px", objectFit: "cover" }}
                        />
                        <span className="flex-1 text-left">{lang.label}</span>
                        {selectedLang === lang.code && (
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 text-white/70"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ───────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-t border-white/5 overflow-hidden"
            style={{ background: "rgba(0,0,0,0.9)" }}
          >
            <nav className="flex flex-col p-4 gap-1">
              {[
                { label: "Home",    to: "/" },
                { label: "Markets", to: "/market" },
                { label: "Spot",    to: "/spot/crypto" },
                { label: "Futures", to: "/futures/crypto" },
                { label: "Finance", to: "/finance" },
                { label: "ICO",     to: "/ico" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm font-normal text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setBuyModalOpen(true);
                  setMobileOpen(false);
                }}
                className="px-4 py-3 text-sm font-normal text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
              >
                Buy now
              </button>

              {/* Auth links for mobile hamburger */}
              {!isAuthenticated && (
                <div className="flex gap-3 px-4 pt-3 border-t border-white/10 mt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 py-2.5 text-center text-sm font-medium text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 py-2.5 text-center text-sm font-medium text-black bg-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Register
                  </Link>
                </div>
              )}
              {isAuthenticated && (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="px-4 py-3 text-sm font-normal text-red-400 hover:text-red-300 hover:bg-white/5 rounded-lg transition-colors text-left flex items-center gap-2 mt-2 border-t border-white/10 pt-3"
                >
                  <Power className="w-4 h-4" />
                  Log out
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buy Modal */}
      <BuyModal isOpen={buyModalOpen} onClose={() => setBuyModalOpen(false)} />
    </header>
  );
};

export default Header;
