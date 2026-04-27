import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok, created } from "../../utils/response";
import { badRequest, notFound, unauthorized } from "../../utils/errors";
import { requireUser } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { lock, unlock } from "../wallets/wallet.helpers";
import { verifyPassword } from "../../utils/password";

const router = Router();
router.use(requireUser);

const createWithdrawalSchema = z.object({
  currencySymbol: z.string().toUpperCase(),
  amount: z.number().positive(),
  toAddress: z.string().min(1),
  network: z.string().optional(),
  withdrawPassword: z.string().optional(),
});

// Create a withdrawal request — funds are LOCKED immediately. Admin approves/rejects.
router.post(
  "/",
  validate(createWithdrawalSchema),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof createWithdrawalSchema>;

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) throw notFound("User not found");

    // KYC must be approved
    const kyc = await prisma.kyc.findUnique({ where: { userId: req.userId } });
    if (!kyc || kyc.status !== "APPROVED") throw badRequest("KYC must be approved before withdrawal");

    // Withdraw password check (if user has one set)
    if (user.withdrawPasswordHash) {
      if (!data.withdrawPassword) throw badRequest("Withdraw password required");
      const okPwd = await verifyPassword(data.withdrawPassword, user.withdrawPasswordHash);
      if (!okPwd) throw unauthorized("Withdraw password incorrect");
    }

    const currency = await prisma.currency.findUnique({ where: { symbol: data.currencySymbol } });
    if (!currency) throw notFound("Currency not supported");
    if (!currency.withdrawEnabled) throw badRequest("Withdrawals disabled for this currency");
    if (data.amount < currency.minWithdraw) throw badRequest(`Minimum withdrawal is ${currency.minWithdraw}`);
    if (currency.maxWithdraw > 0 && data.amount > currency.maxWithdraw) {
      throw badRequest(`Maximum withdrawal is ${currency.maxWithdraw}`);
    }

    const fee = currency.withdrawFee + (data.amount * currency.withdrawFeePct) / 100;
    const netAmount = data.amount - fee;
    if (netAmount <= 0) throw badRequest("Net amount must be positive after fees");

    // Lock the full amount (including fee) in user's SPOT wallet
    const w = await prisma.$transaction(async (tx) => {
      await lock(tx, req.userId!, data.currencySymbol, data.amount, "SPOT");
      return tx.withdrawal.create({
        data: {
          userId: req.userId!,
          currencySymbol: data.currencySymbol,
          amount: data.amount,
          fee,
          netAmount,
          toAddress: data.toAddress,
          network: data.network,
          status: "PENDING",
        },
      });
    });

    return created(res, w, "Withdrawal request submitted");
  }),
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const pageSize = Math.min(100, parseInt((req.query.pageSize as string) || "20", 10));
    const status = req.query.status as string | undefined;
    const where: any = { userId: req.userId };
    if (status) where.status = status;
    const [items, total] = await Promise.all([
      prisma.withdrawal.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.withdrawal.count({ where }),
    ]);
    return ok(res, { items, total, page, pageSize });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const w = await prisma.withdrawal.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!w) throw notFound("Withdrawal not found");
    return ok(res, w);
  }),
);

// User cancels a still-pending withdrawal → unlocks funds
router.post(
  "/:id/cancel",
  asyncHandler(async (req, res) => {
    const w = await prisma.withdrawal.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!w) throw notFound("Withdrawal not found");
    if (w.status !== "PENDING") throw badRequest("Only PENDING withdrawals can be cancelled");

    const updated = await prisma.$transaction(async (tx) => {
      await unlock(tx, w.userId, w.currencySymbol, w.amount, "SPOT");
      return tx.withdrawal.update({ where: { id: w.id }, data: { status: "CANCELLED" } });
    });
    return ok(res, updated, "Withdrawal cancelled");
  }),
);

export default router;
