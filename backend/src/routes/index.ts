import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/users/users.routes";
import kycRoutes from "../modules/kyc/kyc.routes";
import walletRoutes from "../modules/wallets/wallets.routes";

import depositRoutes from "../modules/transactions/deposits.routes";
import withdrawalRoutes from "../modules/transactions/withdrawals.routes";
import transferRoutes from "../modules/transactions/transfers.routes";
import conversionRoutes from "../modules/transactions/conversions.routes";

import marketRoutes from "../modules/markets/markets.routes";
import tradingRoutes from "../modules/trading/trading.routes";

import icoRoutes from "../modules/products/ico.routes";
import earnRoutes from "../modules/products/earn.routes";
import financeRoutes from "../modules/products/finance.routes";

import lotteryRoutes from "../modules/engagement/lottery.routes";
import rewardsRoutes from "../modules/engagement/rewards.routes";
import referralsRoutes from "../modules/engagement/referrals.routes";
import notificationsRoutes from "../modules/engagement/notifications.routes";
import supportRoutes from "../modules/engagement/support.routes";

import settingsRoutes from "../modules/settings/settings.routes";

import adminAuthRoutes from "../modules/admin/admin.auth.routes";
import adminUsersRoutes from "../modules/admin/admin.users.routes";
import adminTxRoutes from "../modules/admin/admin.transactions.routes";
import adminContentRoutes from "../modules/admin/admin.content.routes";
import adminDashboardRoutes from "../modules/admin/admin.dashboard.routes";

const api = Router();

// Public + user-authenticated
api.use("/auth", authRoutes);
api.use("/users", userRoutes);
api.use("/kyc", kycRoutes);
api.use("/wallets", walletRoutes);

api.use("/deposits", depositRoutes);
api.use("/withdrawals", withdrawalRoutes);
api.use("/transfers", transferRoutes);
api.use("/conversions", conversionRoutes);

api.use("/markets", marketRoutes);
api.use("/trading", tradingRoutes);

api.use("/ico", icoRoutes);
api.use("/earn", earnRoutes);
api.use("/finance", financeRoutes);

api.use("/lottery", lotteryRoutes);
api.use("/rewards", rewardsRoutes);
api.use("/referrals", referralsRoutes);
api.use("/notifications", notificationsRoutes);
api.use("/support", supportRoutes);

api.use("/settings", settingsRoutes);

// Admin (everything below /admin uses admin tokens)
api.use("/admin/auth", adminAuthRoutes);
api.use("/admin/users", adminUsersRoutes);
api.use("/admin/finance-ops", adminTxRoutes);     // deposits/withdrawals/buy approvals + tx ledger
api.use("/admin/content", adminContentRoutes);    // currencies, products, lottery, announcements, settings, tickets
api.use("/admin/dashboard", adminDashboardRoutes);

export default api;
