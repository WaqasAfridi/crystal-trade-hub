import { Router } from "express";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/response";
import { requireAdmin } from "../../middleware/auth";

const router = Router();
router.use(requireAdmin);

// One-shot dashboard payload — counts, totals, recent activity
router.get(
  "/dashboard",
  asyncHandler(async (_req, res) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400 * 1000);

    const [
      userCount,
      activeUserCount,
      newUsersToday,
      newUsersWeek,
      pendingKyc,
      pendingDeposits,
      pendingWithdrawals,
      openTickets,
      totalDepositVolume,
      totalWithdrawVolume,
      recentDeposits,
      recentWithdrawals,
      recentUsers,
      walletBalances,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.kyc.count({ where: { status: "PENDING" } }),
      prisma.deposit.count({ where: { status: "PENDING" } }),
      prisma.withdrawal.count({ where: { status: "PENDING" } }),
      prisma.supportTicket.count({ where: { status: { in: ["OPEN", "PENDING"] } } }),
      prisma.deposit.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
      prisma.withdrawal.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
      prisma.deposit.findMany({
        orderBy: { createdAt: "desc" }, take: 8,
        include: { user: { select: { username: true, email: true } } },
      }),
      prisma.withdrawal.findMany({
        orderBy: { createdAt: "desc" }, take: 8,
        include: { user: { select: { username: true, email: true } } },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" }, take: 8,
        select: { id: true, username: true, email: true, createdAt: true, status: true, country: true },
      }),
      prisma.wallet.findMany({ include: { currency: { select: { symbol: true, priceUsd: true } } } }),
    ]);

    // Total platform liability (sum of all user balances * priceUsd)
    const totalPlatformUsd = walletBalances.reduce(
      (s, w) => s + (w.balance + w.locked) * (w.currency?.priceUsd || 0), 0,
    );

    return ok(res, {
      counters: {
        userCount, activeUserCount, newUsersToday, newUsersWeek,
        pendingKyc, pendingDeposits, pendingWithdrawals, openTickets,
      },
      volumes: {
        totalDepositVolume: totalDepositVolume._sum.amount || 0,
        totalWithdrawVolume: totalWithdrawVolume._sum.amount || 0,
        totalPlatformUsd,
      },
      recent: { deposits: recentDeposits, withdrawals: recentWithdrawals, users: recentUsers },
    });
  }),
);

// Time series for charts (last N days of new users + deposits + withdrawals)
router.get(
  "/timeseries",
  asyncHandler(async (req, res) => {
    const days = Math.min(90, parseInt((req.query.days as string) || "14", 10));
    const since = new Date(Date.now() - days * 86400 * 1000);
    since.setHours(0, 0, 0, 0);

    const [users, deposits, withdrawals] = await Promise.all([
      prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
      prisma.deposit.findMany({
        where: { createdAt: { gte: since }, status: "COMPLETED" },
        select: { createdAt: true, amount: true },
      }),
      prisma.withdrawal.findMany({
        where: { createdAt: { gte: since }, status: "COMPLETED" },
        select: { createdAt: true, amount: true },
      }),
    ]);

    const buckets: Record<string, { date: string; users: number; deposits: number; withdrawals: number }> = {};
    for (let i = 0; i <= days; i++) {
      const d = new Date(since.getTime() + i * 86400 * 1000);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = { date: key, users: 0, deposits: 0, withdrawals: 0 };
    }
    for (const u of users) {
      const k = u.createdAt.toISOString().slice(0, 10);
      if (buckets[k]) buckets[k].users++;
    }
    for (const d of deposits) {
      const k = d.createdAt.toISOString().slice(0, 10);
      if (buckets[k]) buckets[k].deposits += d.amount;
    }
    for (const w of withdrawals) {
      const k = w.createdAt.toISOString().slice(0, 10);
      if (buckets[k]) buckets[k].withdrawals += w.amount;
    }
    return ok(res, Object.values(buckets));
  }),
);

export default router;
