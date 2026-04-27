import { Router } from "express";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/response";
import { requireUser } from "../../middleware/auth";

const router = Router();
router.use(requireUser);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const rewards = await prisma.reward.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    const totals = rewards.reduce<Record<string, number>>((acc, r) => {
      const k = `${r.currencySymbol}|${r.type}`;
      acc[k] = (acc[k] || 0) + r.amount;
      return acc;
    }, {});
    return ok(res, { rewards, totals });
  }),
);

// Summary card data for the Rewards Hub page
router.get(
  "/summary",
  asyncHandler(async (req, res) => {
    const all = await prisma.reward.findMany({ where: { userId: req.userId } });
    const total = all.reduce((s, r) => s + r.amount, 0);
    const referral = all.filter((r) => r.type === "REFERRAL").reduce((s, r) => s + r.amount, 0);
    const signup = all.filter((r) => r.type === "SIGNUP").reduce((s, r) => s + r.amount, 0);
    const lottery = all.filter((r) => r.type === "LOTTERY").reduce((s, r) => s + r.amount, 0);
    const promo = all.filter((r) => r.type === "PROMO").reduce((s, r) => s + r.amount, 0);
    return ok(res, { total, byType: { referral, signup, lottery, promo } });
  }),
);

export default router;
