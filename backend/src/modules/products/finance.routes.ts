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
  asyncHandler(async (req, res) => {
    const type = req.query.type as string | undefined;
    const products = await prisma.financeProduct.findMany({
      where: { isActive: true, ...(type ? { type } : {}) },
      orderBy: { rate: "desc" },
    });
    return ok(res, products);
  }),
);

const subscribeSchema = z.object({ amount: z.number().positive() });

router.post(
  "/products/:id/subscribe",
  requireUser,
  validate(subscribeSchema),
  asyncHandler(async (req, res) => {
    const { amount } = req.body as z.infer<typeof subscribeSchema>;
    const p = await prisma.financeProduct.findUnique({ where: { id: req.params.id } });
    if (!p || !p.isActive) throw notFound("Product not available");
    if (p.minAmount && amount < p.minAmount) throw badRequest(`Minimum is ${p.minAmount}`);
    if (p.maxAmount && amount > p.maxAmount) throw badRequest(`Maximum is ${p.maxAmount}`);

    const endAt = p.durationDays > 0
      ? new Date(Date.now() + p.durationDays * 86400 * 1000)
      : null;

    const sub = await prisma.$transaction(async (tx) => {
      await debit(tx, req.userId!, p.currencySymbol, amount, "SPOT");
      return tx.financeSubscription.create({
        data: { userId: req.userId!, productId: p.id, amount, endAt, status: "ACTIVE" },
      });
    });
    return created(res, sub, "Subscribed");
  }),
);

router.get(
  "/my-subscriptions",
  requireUser,
  asyncHandler(async (req, res) => {
    const subs = await prisma.financeSubscription.findMany({
      where: { userId: req.userId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
    return ok(res, subs);
  }),
);

export default router;
