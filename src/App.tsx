import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import Market from "./pages/Market";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ICO from "./pages/ICO";
import EarnGold from "./pages/EarnGold";
import Finance from "./pages/Finance";
import BuyNow from "./pages/BuyNow";
import SpotTrading from "./pages/SpotTrading";
import AssetsManagement from "./pages/AssetsManagement";
import Recharge from "./pages/Recharge";
import Withdraw from "./pages/Withdraw";
import Conversion from "./pages/Conversion";
import Transfer from "./pages/Transfer";
import LotteryRecords from "./pages/LotteryRecords";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/market" element={<Market />} />
            <Route path="/ico" element={<ICO />} />
            <Route path="/earn" element={<EarnGold />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/buy" element={<BuyNow />} />
            <Route path="/spot/crypto" element={<SpotTrading />} />
            <Route path="/futures/crypto" element={<SpotTrading />} />
            <Route path="/futures/stocks" element={<SpotTrading />} />
            <Route path="/futures/fx" element={<SpotTrading />} />
            <Route path="/assets" element={<AssetsManagement />} />
            <Route path="/recharge" element={<Recharge />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/conversion" element={<Conversion />} />
            <Route path="/transfer" element={<Transfer />} />
            <Route path="/lottery" element={<LotteryRecords />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
