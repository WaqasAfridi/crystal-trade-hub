import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, FileCheck2, ArrowDownToLine, ArrowUpFromLine,
  ShoppingCart, Coins, MapPin, Rocket, TrendingUp, Wallet, Ticket,
  Megaphone, Bell, MessageCircle, Settings, ShieldCheck, History, LogOut,
} from "lucide-react";
import { useAuth, can } from "../../store/auth";
import { cn } from "../../lib/utils";

type NavSection = { section: string; to?: never; label?: never; icon?: never; roles?: never };
type NavItem = {
  section?: never;
  to: string;
  label: string;
  icon: any;
  roles?: Array<"SUPER_ADMIN" | "ADMIN" | "MODERATOR" | "SUPPORT">;
};

const NAV: Array<NavSection | NavItem> = [
  { to: "/",             label: "Dashboard",        icon: LayoutDashboard },
  { section: "Users" },
  { to: "/users",        label: "All Users",        icon: Users },
  { to: "/kyc",          label: "KYC Review",       icon: FileCheck2 },
  { section: "Finance" },
  { to: "/deposits",     label: "Deposits",         icon: ArrowDownToLine },
  { to: "/withdrawals",  label: "Withdrawals",      icon: ArrowUpFromLine },
  { to: "/buy-orders",   label: "Buy Orders",       icon: ShoppingCart },
  { to: "/transactions", label: "Transactions",     icon: History },
  { section: "Catalog" },
  { to: "/currencies",        label: "Currencies",        icon: Coins,      roles: ["SUPER_ADMIN", "ADMIN"] },
  { to: "/deposit-addresses", label: "Deposit Addresses", icon: MapPin,     roles: ["SUPER_ADMIN", "ADMIN"] },
  { to: "/ico",               label: "ICO Projects",      icon: Rocket,     roles: ["SUPER_ADMIN", "ADMIN"] },
  { to: "/earn",              label: "Earn Products",     icon: TrendingUp, roles: ["SUPER_ADMIN", "ADMIN"] },
  { to: "/finance",           label: "Finance Products",  icon: Wallet,     roles: ["SUPER_ADMIN", "ADMIN"] },
  { to: "/lottery",           label: "Lottery",           icon: Ticket,     roles: ["SUPER_ADMIN", "ADMIN"] },
  { section: "Comms" },
  { to: "/announcements", label: "Announcements",   icon: Megaphone,     roles: ["SUPER_ADMIN", "ADMIN"] },
  { to: "/notifications", label: "Broadcast",       icon: Bell,          roles: ["SUPER_ADMIN", "ADMIN"] },
  { to: "/tickets",       label: "Support Tickets", icon: MessageCircle },
  { section: "System" },
  { to: "/settings",  label: "Site Settings", icon: Settings,    roles: ["SUPER_ADMIN", "ADMIN"] },
  { to: "/admins",    label: "Admin Users",   icon: ShieldCheck, roles: ["SUPER_ADMIN"] },
  { to: "/audit-log", label: "Audit Log",     icon: History,     roles: ["SUPER_ADMIN", "ADMIN"] },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-bg text-text">
      <aside className="w-64 border-r border-border bg-surface flex flex-col">
        <div className="px-5 py-4 border-b border-border">
          <div className="text-sm font-semibold">Crystal Trade Hub</div>
          <div className="text-xs text-muted">Admin Panel</div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {NAV.map((item, i) => {
            if (item.section) {
              return (
                <div key={"s-" + i} className="px-5 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  {item.section}
                </div>
              );
            }
            const navItem = item as NavItem;
            if (navItem.roles && !can(user?.role, ...navItem.roles)) return null;
            const Icon = navItem.icon;
            return (
              <NavLink
                key={navItem.to}
                to={navItem.to}
                end={navItem.to === "/"}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-5 py-2 text-sm",
                  isActive
                    ? "bg-elevated text-text border-l-2 border-white"
                    : "text-muted hover:bg-elevated hover:text-text",
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{navItem.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-border px-5 py-3">
          <div className="text-xs text-muted">Signed in as</div>
          <div className="text-sm font-medium truncate">{user?.fullName || user?.username}</div>
          <div className="text-[10px] text-muted">{user?.role}</div>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="mt-3 flex items-center gap-2 text-xs text-muted hover:text-text"
          >
            <LogOut className="w-3 h-3" /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}