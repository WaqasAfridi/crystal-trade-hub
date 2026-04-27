import { Router } from "express";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/response";
import { requireUser } from "../../middleware/auth";

const router = Router();
router.use(requireUser);

// Returns the user's invite info + invitee tree (1 level + counts at level 2)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const me = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, inviteCode: true },
    });
    if (!me) return ok(res, null);

    const directInvitees = await prisma.user.findMany({
      where: { invitedById: me.id },
      select: { id: true, username: true, email: true, createdAt: true, vipLevel: true },
      orderBy: { createdAt: "desc" },
    });

    const directIds = directInvitees.map((u) => u.id);
    const level2Count = directIds.length
      ? await prisma.user.count({ where: { invitedById: { in: directIds } } })
      : 0;

    // Total commission earned via REFERRAL rewards
    const referralRewards = await prisma.reward.findMany({
      where: { userId: me.id, type: "REFERRAL" },
    });
    const totalCommission = referralRewards.reduce((s, r) => s + r.amount, 0);

    return ok(res, {
      inviteCode: me.inviteCode,
      directCount: directInvitees.length,
      level2Count,
      totalCommission,
      directInvitees,
      recentRewards: referralRewards.slice(-20).reverse(),
    });
  }),
);

export default router;
