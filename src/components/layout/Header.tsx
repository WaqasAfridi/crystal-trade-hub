import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Globe, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const spotMenu = [
  { title: "Crypto", desc: "Initiated the blockchain revolution by establishing the principles of digital scarcity and decentralized value storage.", icon: "₿", href: "/spot/crypto" },
];

const futuresMenu = [
  { title: "Crypto", desc: "Initiated the blockchain revolution by establishing the principles of digital scarcity and decentralized value storage.", icon: "₿", href: "/futures/crypto" },
  { title: "US stocks", desc: "High growth potential, the first choice for pursuing capital appreciation.", icon: "📊", href: "/futures/stocks" },
  { title: "FX", desc: "Initiated the blockchain revolution by establishing the principles of digital scarcity and decentralized value storage.", icon: "💱", href: "/futures/fx" },
];

const financeMenu = [
  { title: "Finance", desc: "Intelligent investment and technology leadership help you grasp market trends.", icon: "🏦", href: "/finance" },
];

type DropdownKey = "spot" | "futures" | "finance" | null;

const Header = () => {
  const [openMenu, setOpenMenu] = useState<DropdownKey>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const renderDropdown = (items: typeof spotMenu) => (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full left-0 mt-2 w-72 rounded-xl bg-popover border border-border shadow-2xl p-2 z-50"
    >
      {items.map((item) => (
        <Link
          key={item.title}
          to={item.href}
          className="block p-3 rounded-lg hover:bg-secondary transition-colors"
          onClick={() => setOpenMenu(null)}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{item.icon}</span>
            <span className="font-semibold text-foreground">{item.title}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
        </Link>
      ))}
    </motion.div>
  );

  const NavItem = ({ label, dropdown, items }: { label: string; dropdown?: DropdownKey; items?: typeof spotMenu }) => (
    <div
      className="relative"
      onMouseEnter={() => dropdown && setOpenMenu(dropdown)}
      onMouseLeave={() => setOpenMenu(null)}
    >
      <button
        className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
          openMenu === dropdown ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {label}
        {dropdown && <ChevronDown className={`w-3 h-3 transition-transform ${openMenu === dropdown ? "rotate-180" : ""}`} />}
      </button>
      <AnimatePresence>
        {dropdown && openMenu === dropdown && items && renderDropdown(items)}
      </AnimatePresence>
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
              <span className="text-xs font-bold text-primary">ENX</span>
            </div>
            <span className="text-lg font-bold text-foreground">Enivex</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link to="/" className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive("/") ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              Home
            </Link>
            <Link to="/market" className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive("/market") ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              Markets
            </Link>
            <NavItem label="Spot" dropdown="spot" items={spotMenu} />
            <NavItem label="Futures" dropdown="futures" items={futuresMenu} />
            <NavItem label="Finance" dropdown="finance" items={financeMenu} />
            <Link to="/ico" className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive("/ico") ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              ICO
            </Link>
            <Link to="/buy" className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive("/buy") ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              Buy now
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            <Link to="/register" className="hidden sm:block px-4 py-1.5 text-sm font-medium border border-primary text-primary rounded-full hover:bg-primary hover:text-primary-foreground transition-all">
              Register
            </Link>
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Globe className="w-5 h-5" />
            </button>
            <button className="lg:hidden p-2 text-muted-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-t border-border overflow-hidden bg-background"
          >
            <nav className="flex flex-col p-4 gap-2">
              {[
                { label: "Home", to: "/" },
                { label: "Markets", to: "/market" },
                { label: "Spot", to: "/spot/crypto" },
                { label: "Futures", to: "/futures/crypto" },
                { label: "Finance", to: "/finance" },
                { label: "ICO", to: "/ico" },
                { label: "Buy now", to: "/buy" },
                { label: "Login", to: "/login" },
                { label: "Register", to: "/register" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
