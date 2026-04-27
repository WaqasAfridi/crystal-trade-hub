import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok, created } from "../../utils/response";
import { badRequest, notFound } from "../../utils/errors";
import { requireUser } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { credit, debit } from "../wallets/wallet.helpers";

const router = Router();

router.get(
  "/products",
  asyncHandler(async (_req, res) => {
    const products = await prisma.earnProduct.findMany({
      where: { isActive: true },
      orderBy: { apr: "desc" },
    });
    return ok(res, products);
  }),
);

const stakeSchema = z.object({ amount: z.number().positive() });

router.post(
  "/products/:id/stake",
  requireUser,
  validate(stakeSchema),
  asyncHandler(async (req, res) => {
    const { amount } = req.body as z.infer<typeof stakeSchema>;
    const product = await prisma.earnProduct.findUnique({ where: { id: req.params.id } });
    if (!product || !product.isActive) throw notFound("Product not found");
    if (product.minAmount && amount < product.minAmount) throw badRequest(`Minimum is ${product.minAmount}`);
    if (product.maxAmount && amount > product.maxAmount) throw badRequest(`Maximum is ${product.maxAmount}`);
    if (product.totalCap > 0 && product.filled + amount > product.totalCap) {
      throw badRequest("Pool full");
    }

    const endAt = product.durationDays > 0
      ? new Date(Date.now() + product.durationDays * 24 * 60 * 60 * 1000)
      : null;

    const sub = await prisma.$transaction(async (tx) => {
      await debit(tx, req.userId!, product.currencySymbol, amount, "SPOT");
      await credit(tx, req.userId!, product.currencySymbol, amount, "EARN"); // visible in EARN account
      await tx.earnProduct.update({ where: { id: product.id }, data: { filled: { increment: amount } } });
      return tx.earnSubscription.create({
        data: {
          userId: req.userId!, productId: product.id, amount,
          startAt: new Date(), endAt, status: "ACTIVE",
        },
      });
    });
    return created(res, sub, "Staked");
  }),
);

router.post(
  "/subscriptions/:id/redeem",
  requireUser,
  asyncHandler(async (req, res) => {
    const sub = await prisma.earnSubscription.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { product: true },
    });
    if (!sub) throw notFound("Subscription not found");
    if (sub.status !== "ACTIVE") throw badRequest("Already redeemed or cancelled");
    if (sub.product.durationDays > 0 && sub.endAt && sub.endAt > new Date()) {
      throw badRequest(`Locked until ${sub.endAt.toISOString()}`);
    }

    // Calculate accrued interest
    const days = (Date.now() - sub.startAt.getTime()) / (1000 * 60 * 60 * 24);
    const interest = sub.amount * (sub.product.apr / 100) * (days / 365);

    const updated = await prisma.$transaction(async (tx) => {
      // Move principal back from EARN to SPOT, plus credit interest in same currency
      await debit(tx, req.userId!, sub.product.currencySymbol, sub.amount, "EARN");
      await credit(tx, req.userId!, sub.product.currencySymbol, sub.amount + interest, "SPOT");
      return tx.earnSubscription.update({
        where: { id: sub.id },
        data: { status: "REDEEMED", earnedSoFar: interest },
      });
    });
    return ok(res, updated, "Redeemed");
  }),
);

router.get(
  "/my-subscriptions",
  requireUser,
  asyncHandler(async (req, res) => {
    const subs = await prisma.earnSubscription.findMany({
      where: { userId: req.userId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
    return ok(res, subs);
  }),
);

export default router;
