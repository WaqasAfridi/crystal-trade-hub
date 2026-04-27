import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { hashPassword } from "../../utils/password";
import { ok } from "../../utils/response";
import { notFound, badRequest } from "../../utils/errors";
import { requireAdmin, requireAdminRole } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { audit } from "./audit";
import { credit, debit } from "../wallets/wallet.helpers";

const router = Router();
router.use(requireAdmin);

// ── List users with search + filters + pagination ───────────────────────────
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const pageSize = Math.min(200, parseInt((req.query.pageSize as string) || "20", 10));
    const search = (req.query.search as string)?.trim();
    const status = req.query.status as string | undefined;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { phone: { contains: search } },
        { username: { contains: search } },
        { id: search },
        { inviteCode: search.toUpperCase() },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize, take: pageSize,
        select: {
          id: true, email: true, phone: true, username: true,
          status: true, vipLevel: true, country: true,
          inviteCode: true, invitedById: true,
          emailVerified: true, phoneVerified: true,
          createdAt: true, lastLoginAt: true, lastLoginIp: true,
        },
      }),
      prisma.user.count({ where }),
    ]);
    return ok(res, { items, total, page, pageSize });
  }),
);

// ── User detail (full info, balances, recent activity) ──────────────────────
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        kyc: true,
        wallets: { include: { currency: { select: { symbol: true, name: true, priceUsd: true } } } },
        invitedBy: { select: { id: true, username: true, email: true, inviteCode: true } },
        _count: {
          select: {
            invitees: true, deposits: true, withdrawals: true,
            spotOrders: true, futuresOrders: true, transfers: true,
          },
        },
      },
    });
    if (!user) throw notFound("User not found");

    const totalUsd = user.wallets.reduce(
      (s, w) => s + (w.balance + w.locked) * (w.currency.priceUsd || 0),
      0,
    );

    const [recentDeposits, recentWithdrawals, recentLogins] = await Promise.all([
      prisma.deposit.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 10 }),
      prisma.withdrawal.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 10 }),
      prisma.loginHistory.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 10 }),
    ]);
    return ok(res, { user, totalUsd, recentDeposits, recentWithdrawals, recentLogins });
  }),
);

// ── Update user (status, vip, etc.) ─────────────────────────────────────────
const updateUserSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "BANNED", "PENDING_VERIFICATION"]).optional(),
  vipLevel: z.number().int().min(0).max(20).optional(),
  emailVerified: z.boolean().optional(),
  phoneVerified: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
  username: z.string().min(3).max(30).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(5).max(20).optional(),
  password: z.string().min(6).max(72).optional(),     // admin-reset
  withdrawPassword: z.string().min(6).max(72).optional(),
});

router.patch(
  "/:id",
  validate(updateUserSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof updateUserSchema>;
    const data: any = { ...body };
    if (data.password) { data.passwordHash = await hashPassword(data.password); delete data.password; }
    if (data.withdrawPassword) { data.withdrawPasswordHash = await hashPassword(data.withdrawPassword); delete data.withdrawPassword; }
    const user = await prisma.user.update({
      where: { id: req.params.id }, data,
      select: { id: true, status: true, vipLevel: true, emailVerified: true, phoneVerified: true, twoFactorEnabled: true },
    });
    await audit(req.adminId!, "USER_UPDATE", user.id, body, req.ip);
    return ok(res, user, "User updated");
  }),
);

// ── Adjust balance (admin manual credit/debit) ──────────────────────────────
const adjustSchema = z.object({
  currencySymbol: z.string().toUpperCase(),
  accountType: z.enum(["SPOT", "FUTURES", "EARN", "FUNDING"]).default("SPOT"),
  amount: z.number(),                          // positive = credit, negative = debit
  reason: z.string().max(500).optional(),
});

router.post(
  "/:id/adjust-balance",
  requireAdminRole("SUPER_ADMIN", "ADMIN"),
  validate(adjustSchema),
  asyncHandler(async (req, res) => {
    const { currencySymbol, accountType, amount, reason } = req.body as z.infer<typeof adjustSchema>;
    if (amount === 0) throw badRequest("Amount cannot be zero");

    await prisma.$transaction(async (tx) => {
      if (amount > 0) {
        await credit(tx, req.params.id, currencySymbol, amount, accountType);
      } else {
        await debit(tx, req.params.id, currencySymbol, Math.abs(amount), accountType);
      }
    });
    await audit(req.adminId!, amount > 0 ? "BALANCE_CREDIT" : "BALANCE_DEBIT", req.params.id, {
      currencySymbol, accountType, amount, reason,
    }, req.ip);

    // Drop a notification for the user
    await prisma.notification.create({
      data: {
        userId: req.params.id,
        title: amount > 0 ? "Balance credited" : "Balance debited",
        body: `${amount > 0 ? "+" : ""}${amount} ${currencySymbol} (${accountType})${reason ? " — " + reason : ""}`,
        type: amount > 0 ? "SUCCESS" : "WARNING",
      },
    });
    return ok(res, { ok: true }, "Adjusted");
  }),
);

// ── Delete user (rare — usually we just BAN) ────────────────────────────────
router.delete(
  "/:id",
  requireAdminRole("SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    await prisma.user.delete({ where: { id: req.params.id } });
    await audit(req.adminId!, "USER_DELETE", req.params.id, undefined, req.ip);
    return ok(res, { ok: true });
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// KYC REVIEW
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/kyc/list",
  asyncHandler(async (req, res) => {
    const status = (req.query.status as string) || "PENDING";
    const list = await prisma.kyc.findMany({
      where: { status: status as any },
      orderBy: { updatedAt: "desc" },
      include: { user: { select: { id: true, email: true, phone: true, username: true } } },
    });
    return ok(res, list);
  }),
);

router.get(
  "/kyc/:id",
  asyncHandler(async (req, res) => {
    const kyc = await prisma.kyc.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { id: true, email: true, username: true, phone: true } } },
    });
    if (!kyc) throw notFound("KYC not found");
    return ok(res, kyc);
  }),
);

const kycActionSchema = z.object({ reason: z.string().optional() });

router.post(
  "/kyc/:id/approve",
  requireAdminRole("SUPER_ADMIN", "ADMIN", "MODERATOR"),
  asyncHandler(async (req, res) => {
    const kyc = await prisma.kyc.update({
      where: { id: req.params.id },
      data: { status: "APPROVED", reviewedById: req.adminId, reviewedAt: new Date(), rejectionReason: null },
    });
    await prisma.notification.create({
      data: { userId: kyc.userId, title: "KYC Approved", body: "Your identity verification has been approved.", type: "SUCCESS" },
    });
    await audit(req.adminId!, "KYC_APPROVE", kyc.userId, { kycId: kyc.id }, req.ip);
    return ok(res, kyc);
  }),
);

router.post(
  "/kyc/:id/reject",
  requireAdminRole("SUPER_ADMIN", "ADMIN", "MODERATOR"),
  validate(kycActionSchema),
  asyncHandler(async (req, res) => {
    const { reason } = req.body as z.infer<typeof kycActionSchema>;
    const kyc = await prisma.kyc.update({
      where: { id: req.params.id },
      data: {
        status: "REJECTED",
        reviewedById: req.adminId,
        reviewedAt: new Date(),
        rejectionReason: reason || "Did not meet our requirements",
      },
    });
    await prisma.notification.create({
      data: {
        userId: kyc.userId, title: "KYC Rejected",
        body: `Your KYC was rejected: ${kyc.rejectionReason}`, type: "DANGER",
      },
    });
    await audit(req.adminId!, "KYC_REJECT", kyc.userId, { kycId: kyc.id, reason }, req.ip);
    return ok(res, kyc);
  }),
);

export default router;
