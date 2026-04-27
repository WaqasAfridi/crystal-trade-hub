import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/response";
import { badRequest, notFound } from "../../utils/errors";
import { requireAdmin, requireAdminRole } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { audit } from "./audit";
import { credit, consumeLocked, unlock } from "../wallets/wallet.helpers";

const router = Router();
router.use(requireAdmin);

// ──────────────────── DEPOSITS ────────────────────
router.get(
  "/deposits",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const pageSize = Math.min(100, parseInt((req.query.pageSize as string) || "20", 10));
    const status = req.query.status as string | undefined;
    const search = (req.query.search as string)?.trim();

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { id: search },
        { txHash: { contains: search } },
        { user: { email: { contains: search } } },
        { user: { username: { contains: search } } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.deposit.findMany({
        where, orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize, take: pageSize,
        include: { user: { select: { id: true, email: true, username: true } } },
      }),
      prisma.deposit.count({ where }),
    ]);
    return ok(res, { items, total, page, pageSize });
  }),
);

const approveDepositSchema = z.object({
  amount: z.number().positive().optional(),     // override final credited amount
  txHash: z.string().optional(),
});

router.post(
  "/deposits/:id/approve",
  requireAdminRole("SUPER_ADMIN", "ADMIN", "MODERATOR"),
  validate(approveDepositSchema),
  asyncHandler(async (req, res) => {
    const dep = await prisma.deposit.findUnique({ where: { id: req.params.id } });
    if (!dep) throw notFound("Deposit not found");
    if (dep.status !== "PENDING" && dep.status !== "PROCESSING") throw badRequest("Already finalized");

    const finalAmount = req.body.amount ?? dep.amount;
    const txHash = req.body.txHash ?? dep.txHash;

    await prisma.$transaction(async (tx) => {
      await credit(tx, dep.userId, dep.currencySymbol, finalAmount, "SPOT");
      await tx.deposit.update({
        where: { id: dep.id },
        data: {
          amount: finalAmount,
          txHash,
          status: "COMPLETED",
          reviewedById: req.adminId,
          reviewedAt: new Date(),
        },
      });
    });
    await prisma.notification.create({
      data: {
        userId: dep.userId, title: "Deposit Confirmed",
        body: `${finalAmount} ${dep.currencySymbol} has been credited to your Spot account.`,
        type: "SUCCESS",
      },
    });
    await audit(req.adminId!, "DEPOSIT_APPROVE", dep.id, { finalAmount, txHash }, req.ip);
    return ok(res, { ok: true });
  }),
);

router.post(
  "/deposits/:id/reject",
  requireAdminRole("SUPER_ADMIN", "ADMIN", "MODERATOR"),
  asyncHandler(async (req, res) => {
    const reason = (req.body?.reason as string) || "Rejected by admin";
    const dep = await prisma.deposit.findUnique({ where: { id: req.params.id } });
    if (!dep) throw notFound("Deposit not found");
    if (dep.status === "COMPLETED") throw badRequest("Already completed");
    await prisma.deposit.update({
      where: { id: dep.id },
      data: { status: "REJECTED", notes: reason, reviewedById: req.adminId, reviewedAt: new Date() },
    });
    await prisma.notification.create({
      data: { userId: dep.userId, title: "Deposit Rejected", body: reason, type: "DANGER" },
    });
    await audit(req.adminId!, "DEPOSIT_REJECT", dep.id, { reason }, req.ip);
    return ok(res, { ok: true });
  }),
);

// ──────────────────── WITHDRAWALS ────────────────────
router.get(
  "/withdrawals",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const pageSize = Math.min(100, parseInt((req.query.pageSize as string) || "20", 10));
    const status = req.query.status as string | undefined;
    const search = (req.query.search as string)?.trim();

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { id: search },
        { toAddress: { contains: search } },
        { user: { email: { contains: search } } },
        { user: { username: { contains: search } } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where, orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize, take: pageSize,
        include: { user: { select: { id: true, email: true, username: true } } },
      }),
      prisma.withdrawal.count({ where }),
    ]);
    return ok(res, { items, total, page, pageSize });
  }),
);

router.post(
  "/withdrawals/:id/approve",
  requireAdminRole("SUPER_ADMIN", "ADMIN", "MODERATOR"),
  asyncHandler(async (req, res) => {
    const txHash = req.body?.txHash as string | undefined;
    const w = await prisma.withdrawal.findUnique({ where: { id: req.params.id } });
    if (!w) throw notFound("Withdrawal not found");
    if (w.status !== "PENDING" && w.status !== "PROCESSING") throw badRequest("Already finalized");

    await prisma.$transaction(async (tx) => {
      // Funds were already locked when user submitted; now consume them (debit locked).
      await consumeLocked(tx, w.userId, w.currencySymbol, w.amount, "SPOT");
      await tx.withdrawal.update({
        where: { id: w.id },
        data: { status: "COMPLETED", txHash, reviewedById: req.adminId, reviewedAt: new Date() },
      });
    });
    await prisma.notification.create({
      data: {
        userId: w.userId, title: "Withdrawal Sent",
        body: `${w.netAmount} ${w.currencySymbol} sent to ${w.toAddress}`,
        type: "SUCCESS",
      },
    });
    await audit(req.adminId!, "WITHDRAW_APPROVE", w.id, { txHash }, req.ip);
    return ok(res, { ok: true });
  }),
);

router.post(
  "/withdrawals/:id/reject",
  requireAdminRole("SUPER_ADMIN", "ADMIN", "MODERATOR"),
  asyncHandler(async (req, res) => {
    const reason = (req.body?.reason as string) || "Rejected by admin";
    const w = await prisma.withdrawal.findUnique({ where: { id: req.params.id } });
    if (!w) throw notFound("Withdrawal not found");
    if (w.status === "COMPLETED") throw badRequest("Already completed");

    await prisma.$transaction(async (tx) => {
      // Refund: unlock the locked amount back to user balance
      await unlock(tx, w.userId, w.currencySymbol, w.amount, "SPOT");
      await tx.withdrawal.update({
        where: { id: w.id },
        data: { status: "REJECTED", rejectionReason: reason, reviewedById: req.adminId, reviewedAt: new Date() },
      });
    });
    await prisma.notification.create({
      data: { userId: w.userId, title: "Withdrawal Rejected", body: reason, type: "DANGER" },
    });
    await audit(req.adminId!, "WITHDRAW_REJECT", w.id, { reason }, req.ip);
    return ok(res, { ok: true });
  }),
);

// ──────────────────── BUY ORDERS ────────────────────
router.get(
  "/buy-orders",
  asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined;
    const where: any = {};
    if (status) where.status = status;
    const items = await prisma.buyOrder.findMany({
      where, orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, email: true, username: true } } },
      take: 100,
    });
    return ok(res, items);
  }),
);

router.post(
  "/buy-orders/:id/confirm",
  requireAdminRole("SUPER_ADMIN", "ADMIN", "MODERATOR"),
  asyncHandler(async (req, res) => {
    const o = await prisma.buyOrder.findUnique({ where: { id: req.params.id } });
    if (!o) throw notFound("Order not found");
    if (o.status === "COMPLETED") throw badRequest("Already completed");
    await prisma.$transaction(async (tx) => {
      await credit(tx, o.userId, o.currencySymbol, o.cryptoAmount, "SPOT");
      await tx.buyOrder.update({ where: { id: o.id }, data: { status: "COMPLETED" } });
    });
    await prisma.notification.create({
      data: {
        userId: o.userId, title: "Buy Order Filled",
        body: `${o.cryptoAmount} ${o.currencySymbol} has been credited.`, type: "SUCCESS",
      },
    });
    await audit(req.adminId!, "BUY_ORDER_CONFIRM", o.id, undefined, req.ip);
    return ok(res, { ok: true });
  }),
);

// ──────────────────── ALL TRANSACTIONS (unified ledger view) ────────────────
router.get(
  "/transactions",
  asyncHandler(async (req, res) => {
    const userId = req.query.userId as string | undefined;
    const limit = Math.min(200, parseInt((req.query.limit as string) || "100", 10));
    const where: any = userId ? { userId } : {};
    const [deposits, withdrawals, transfers, conversions, trades] = await Promise.all([
      prisma.deposit.findMany({ where, orderBy: { createdAt: "desc" }, take: limit }),
      prisma.withdrawal.findMany({ where, orderBy: { createdAt: "desc" }, take: limit }),
      prisma.transfer.findMany({ where, orderBy: { createdAt: "desc" }, take: limit }),
      prisma.conversion.findMany({ where, orderBy: { createdAt: "desc" }, take: limit }),
      prisma.trade.findMany({ where, orderBy: { createdAt: "desc" }, take: limit }),
    ]);
    return ok(res, { deposits, withdrawals, transfers, conversions, trades });
  }),
);

export default router;
