import "./App.css";
import { useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";

import Layout from "./components/layout/Layout";
import MobileLayout from "./components/mobile/MobileLayout";
import MobileBottomNav from "./components/mobile/MobileBottomNav";
import { useIsMobile } from "./hooks/use-mobile";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import Index from "./pages/Index";
import MobileHome from "./pages/MobileHome";
import Market from "./pages/Market";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ICO from "./pages/ICO";
import EarnGold from "./pages/EarnGold";
import Finance from "./pages/Finance";
import BuyNow from "./pages/BuyNow";
import SpotTrading from "./pages/SpotTrading";
import FuturesTrading from "./pages/FuturesTrading";
import AssetsManagement from "./pages/AssetsManagement";
import Recharge from "./pages/Recharge";
import Withdraw from "./pages/Withdraw";
import Conversion from "./pages/Conversion";
import Transfer from "./pages/Transfer";
import LotteryRecords from "./pages/LotteryRecords";
import MobileICO from "./pages/MobileICO";
import Deposit from "./pages/Deposit";
import MobileDeposit from "./pages/MobileDeposit";
import MobileHistory from "./pages/MobileHistory";
import WithdrawPage from "./pages/WithdrawPage";
import MobileWithdraw from "./pages/MobileWithdraw";
import ConvertPage from "./pages/ConvertPage";
import TransferPage from "./pages/TransferPage";
import OverviewPage from "./pages/OverviewPage";
import LotteryRecordsPage from "./pages/LotteryRecordsPage";
import ProfilePage from "./pages/ProfilePage";
import RewardsHubPage from "./pages/RewardsHubPage";
import InvitePage from "./pages/InvitePage";
import NotificationsPage from "./pages/NotificationsPage";
import NotFound from "./pages/NotFound";
import KYCVerification from "./pages/KYCVerification";

const queryClient = new QueryClient();

/* Routes that must NOT show the mobile bottom nav */
const NO_BOTTOM_NAV = ["/login", "/register", "/forgot-password"];

// ─────────────────────────────────────────────────────────────────────────────
//  ProtectedRoute — redirects unauthenticated users to /login with a toast
// ─────────────────────────────────────────────────────────────────────────────
const ProtectedRoute = ({
  children,
  message = "You must login first before accessing this page.",
}: {
  children: React.ReactNode;
  message?: string;
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const toastFired = useRef(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !toastFired.current) {
      toastFired.current = true;
      toast.error(message, { duration: 3500 });
    }
  }, [isLoading, isAuthenticated, message]);

  if (isLoading) {
    // Minimal loading spinner — keeps the page blank until auth resolves
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// ─────────────────────────────────────────────────────────────────────────────
//  Shared route tree
// ─────────────────────────────────────────────────────────────────────────────
const AppRoutes = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const Shell = isMobile ? MobileLayout : Layout;

  const showBottomNav =
    isMobile && !NO_BOTTOM_NAV.includes(location.pathname);

  return (
    <>
      <Routes>
        {/* ── Pages that use the shell (Header + Footer) ──────────────── */}
        <Route element={<Shell />}>
          {/* Public */}
          <Route path="/" element={isMobile ? <MobileHome /> : <Index />} />
          <Route path="/market" element={<Market />} />
          <Route path="/buy" element={<BuyNow />} />
          <Route path="/earn" element={<EarnGold />} />
          <Route path="/lottery" element={<LotteryRecords />} />

          {/* Futures — dedicated FuturesTrading page with Perpetual + Options tabs */}
          <Route path="/futures/crypto" element={<FuturesTrading />} />
          <Route path="/futures/stocks" element={<FuturesTrading />} />
          <Route path="/futures/fx"     element={<FuturesTrading />} />

          {/* Protected — Spot, Finance, ICO */}
          <Route
            path="/spot/crypto"
            element={
              <ProtectedRoute message="You must login first before accessing Spot trading.">
                <SpotTrading />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ico"
            element={
              <ProtectedRoute message="You must login first before accessing the ICO page.">
                {isMobile ? <MobileICO /> : <ICO />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance"
            element={
              <ProtectedRoute message="You must login first before accessing Finance.">
                <Finance />
              </ProtectedRoute>
            }
          />

          {/* Protected — Assets */}
          <Route path="/assets"                   element={<ProtectedRoute><AssetsManagement /></ProtectedRoute>} />
          <Route path="/assets/deposit" element={<ProtectedRoute>{isMobile ? <MobileDeposit /> : <Deposit />}</ProtectedRoute>} />
          <Route path="/assets/withdraw"          element={<ProtectedRoute>{isMobile ? <MobileWithdraw /> : <WithdrawPage />}</ProtectedRoute>} />
          <Route path="/assets/convert"           element={<ProtectedRoute><ConvertPage /></ProtectedRoute>} />
          <Route path="/assets/transfer"          element={<ProtectedRoute><TransferPage /></ProtectedRoute>} />
          <Route path="/assets/overview"          element={<ProtectedRoute><OverviewPage /></ProtectedRoute>} />
          <Route path="/assets/spot"               element={<ProtectedRoute><OverviewPage /></ProtectedRoute>} />
          <Route path="/assets/trading"             element={<ProtectedRoute><OverviewPage /></ProtectedRoute>} />
          <Route path="/assets/finance"             element={<ProtectedRoute><OverviewPage /></ProtectedRoute>} />
          <Route path="/assets/funding-records"   element={<ProtectedRoute>{isMobile ? <MobileHistory /> : <OverviewPage />}</ProtectedRoute>} />
          <Route path="/assets/history"           element={<ProtectedRoute>{isMobile ? <MobileHistory /> : <OverviewPage />}</ProtectedRoute>} />
          <Route path="/assets/financial-records" element={<ProtectedRoute><OverviewPage /></ProtectedRoute>} />
          <Route path="/assets/exchange-history"  element={<ProtectedRoute><OverviewPage /></ProtectedRoute>} />
          <Route path="/assets/commission-record" element={<ProtectedRoute><OverviewPage /></ProtectedRoute>} />
          <Route path="/assets/ai-strategy"       element={<ProtectedRoute><OverviewPage /></ProtectedRoute>} />
          <Route path="/assets/order-list"        element={<ProtectedRoute><OverviewPage /></ProtectedRoute>} />
          <Route path="/assets/lottery-records"   element={<ProtectedRoute><LotteryRecordsPage /></ProtectedRoute>} />

          {/* Protected — User account */}
          <Route path="/profile"       element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/rewards"       element={<ProtectedRoute><RewardsHubPage /></ProtectedRoute>} />
          <Route path="/invite"        element={<ProtectedRoute><InvitePage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/kyc"           element={<ProtectedRoute><KYCVerification /></ProtectedRoute>} />
          <Route path="/recharge"      element={<ProtectedRoute><Recharge /></ProtectedRoute>} />
          <Route path="/withdraw"      element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
          <Route path="/conversion"    element={<ProtectedRoute><Conversion /></ProtectedRoute>} />
          <Route path="/transfer"      element={<ProtectedRoute><Transfer /></ProtectedRoute>} />
        </Route>

        {/* ── Auth pages — no shell ────────────────────────────────────── */}
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Bottom nav rendered OUTSIDE the shell so no page can bury it */}
      {showBottomNav && <MobileBottomNav />}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Root
// ─────────────────────────────────────────────────────────────────────────────
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner richColors position="top-center" />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
