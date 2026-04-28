import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./store/auth";
import AdminLayout from "./components/layout/AdminLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import KYC from "./pages/KYC";
import Deposits from "./pages/Deposits";
import Withdrawals from "./pages/Withdrawals";
import BuyOrders from "./pages/BuyOrders";
import Transactions from "./pages/Transactions";
import Currencies from "./pages/Currencies";
import DepositAddresses from "./pages/DepositAddresses";
import IcoProjects from "./pages/IcoProjects";
import EarnProducts from "./pages/EarnProducts";
import FinanceProducts from "./pages/FinanceProducts";
import Lottery from "./pages/Lottery";
import Announcements from "./pages/Announcements";
import Broadcast from "./pages/Broadcast";
import Tickets from "./pages/Tickets";
import TicketDetail from "./pages/TicketDetail";
import Settings from "./pages/Settings";
import Admins from "./pages/Admins";
import AuditLog from "./pages/AuditLog";
import FuturesOrders from "./pages/FuturesOrders";

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth><AdminLayout /></RequireAuth>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route path="/kyc" element={<KYC />} />
        <Route path="/deposits" element={<Deposits />} />
        <Route path="/withdrawals" element={<Withdrawals />} />
        <Route path="/buy-orders" element={<BuyOrders />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/currencies" element={<Currencies />} />
        <Route path="/deposit-addresses" element={<DepositAddresses />} />
        <Route path="/ico" element={<IcoProjects />} />
        <Route path="/earn" element={<EarnProducts />} />
        <Route path="/finance" element={<FinanceProducts />} />
        <Route path="/lottery" element={<Lottery />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/notifications" element={<Broadcast />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/tickets/:id" element={<TicketDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admins" element={<Admins />} />
        <Route path="/audit-log" element={<AuditLog />} />
        <Route path="/futures-orders" element={<FuturesOrders />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
