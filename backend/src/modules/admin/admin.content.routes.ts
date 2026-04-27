import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok, created } from "../../utils/response";
import { requireAdmin, requireAdminRole } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { audit } from "./audit";
import { setSetting } from "../settings/settings.service";
import { upload } from "../../middleware/upload";
import { env } from "../../config/env";

const router = Router();
router.use(requireAdmin);

// ════════════════════════ CURRENCIES ════════════════════════
const currencySchema = z.object({
  symbol: z.string().toUpperCase().min(1).max(20),
  name: z.string().min(1),
  type: z.enum(["crypto", "fiat", "stock", "fx"]).default("crypto"),
  iconUrl: z.string().url().optional(),
  decimals: z.number().int().min(0).max(18).default(8),
  priceUsd: z.number().min(0).default(0),
  withdrawEnabled: z.boolean().default(true),
  depositEnabled: z.boolean().default(true),
  tradeEnabled: z.boolean().default(true),
  minWithdraw: z.number().min(0).default(0),
  maxWithdraw: z.number().min(0).default(0),
  withdrawFee: z.number().min(0).default(0),
  withdrawFeePct: z.number().min(0).max(100).default(0),
  networks: z.array(z.string()).default([]),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

router.get(
  "/currencies",
  asyncHandler(async (_req, res) => {
    const list = await prisma.currency.findMany({ orderBy: { sortOrder: "asc" } });
    return ok(res, list.map((c) => ({ ...c, networks: tryParse(c.networks, []) })));
  }),
);

router.post(
  "/currencies",
  requireAdminRole("SUPER_ADMIN", "ADMIN"),
  validate(currencySchema),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof currencySchema>;
    const c = await prisma.currency.create({
      data: { ...data, networks: JSON.stringify(data.networks) },
    });
    await audit(req.adminId!, "CURRENCY_CREATE", c.id, data, req.ip);
    return created(res, { ...c, networks: data.networks });
  }),
);

router.patch(
  "/currencies/:id",
  requireAdminRole("SUPER_ADMIN", "ADMIN"),
  validate(currencySchema.partial()),
  asyncHandler(async (req, res) => {
    const data: any = { ...req.body };
    if (Array.isArray(data.networks)) data.networks = JSON.stringify(data.networks);
    const c = await prisma.currency.update({ where: { id: req.params.id }, data });
    await audit(req.adminId!, "CURRENCY_UPDATE", c.id, data, req.ip);
    return ok(res, { ...c, networks: tryParse(c.networks, []) });
  }),
);

router.delete(
  "/currencies/:id",
  requireAdminRole("SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    await prisma.currency.delete({ where: { id: req.params.id } });
    await audit(req.adminId!, "CURRENCY_DELETE", req.params.id, undefined, req.ip);
    return ok(res, { ok: true });
  }),
);

// ════════════════════════ PLATFORM DEPOSIT ADDRESSES ════════════════════════
const addrSchema = z.object({
  currencyId: z.string(),
  network: z.string(),
  address: z.string(),
  qrUrl: z.string().url().nullish().transform((v) => v ?? undefined),
  isActive: z.boolean().default(true),
});

// Upload a QR code image and return its public URL
router.post(
  "/deposit-addresses/upload-qr",
  requireAdminRole("SUPER_ADMIN", "ADMIN"),
  upload.single("qr"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return ok(res, { url: null }, "No file uploaded");
    }
    const baseUrl = (req.protocol + "://" + req.get("host")) as string;
    const url = `${baseUrl}/uploads/${req.file.filename}`;
    return ok(res, { url });
  }),
);

router.get(
  "/deposit-addresses",
  asyncHandler(async (_req, res) => {
    const list = await prisma.platformDepositAddress.findMany({
      include: { currency: { select: { symbol: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return ok(res, list);
  }),
);

router.post(
  "/deposit-addresses",
  requireAdminRole("SUPER_ADMIN", "ADMIN"),
  validate(addrSchema),
  asyncHandler(async (req, res) => {
    const a = await prisma.platformDepositAddress.create({ data: req.body });
    await audit(req.adminId!, "DEPOSIT_ADDR_CREATE", a.id, req.body, req.ip);
    return created(res, a);
  }),
);

router.patch(
  "/deposit-addresses/:id",
  requireAdminRole("SUPER_ADMIN", "ADMIN"),
  validate(addrSchema.partial()),
  asyncHandler(async (req, res) => {
    const a = await prisma.platformDepositAddress.update({ where: { id: req.params.id }, data: req.body });
    await audit(req.adminId!, "DEPOSIT_ADDR_UPDATE", a.id, req.body, req.ip);
    return ok(res, a);
  }),
);

router.delete(
  "/deposit-addresses/:id",
  requireAdminRole("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req, res) => {
    await prisma.platformDepositAddress.delete({ where: { id: req.params.id } });
    await audit(req.adminId!, "DEPOSIT_ADDR_DELETE", req.params.id, undefined, req.ip);
    return ok(res, { ok: true });
  }),
);

// ════════════════════════ ICO PROJECTS ════════════════════════
const icoSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  description: z.string().optional(),
  iconUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  totalSupply: z.number().positive(),
  pricePerToken: z.number().positive(),
  minBuy: z.number().min(0).default(0),
  maxBuy: z.number().min(0).default(0),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  status: z.enum(["UPCOMING", "LIVE", "ENDED", "CANCELLED"]).default("UPCOMING"),
  isActive: z.boolean().default(true),
});

router.get("/ico", asyncHandler(async (_req, res) => ok(res, await prisma.icoProject.findMany({ orderBy: { startAt: "desc" } }))));
router.post(
  "/ico",
  requireAdminRole("SUPER_ADMIN", "ADMIN"),
  validate(icoSchema),
  asyncHandler(async (req, res) => {
    const p = await prisma.icoProject.create({ data: req.body });
    await audit(req.adminId!, "ICO_CREATE", p.id, req.body, req.ip);
    return created(res, p);
  }),
);
router.patch(
  "/ico/:id",
  requireAdminRole("SUPER_ADMIN", "ADMIN"),
  validate(icoSchema.partial()),
  asyncHandler(async (req, res) => {
    const p = await prisma.icoProject.update({ where: { id: req.params.id }, data: req.body });
    await audit(req.adminId!, "ICO_UPDATE", p.id, req.body, req.ip);
    return ok(res, p);
  }),
);
router.delete(
  "/ico/:id",
  requireAdminRole("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req, res) => {
    await prisma.icoProject.delete({ where: { id: req.params.id } });
    await audit(req.adminId!, "ICO_DELETE", req.params.id, undefined, req.ip);
    return ok(res, { ok: true });
  }),
);

// ════════════════════════ EARN PRODUCTS ════════════════════════
const earnSchema = z.object({
  name: z.string(),
  currencySymbol: z.string().toUpperCase(),
  apr: z.number().min(0),
  durationDays: z.number().int().min(0),
  minAmount: z.number().min(0).default(0),
  maxAmount: z.number().min(0).default(0),
  totalCap: z.number().min(0).default(0),
  description: z.string().optional(),
  iconUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
});

router.get("/earn", asyncHandler(async (_req, res) => ok(res, await prisma.earnProduct.findMany({ orderBy: { createdAt: "desc" } }))));
router.post(
  "/earn",
  requireAdminRole("SUPER_ADMIN", "ADMIN"),
  validate(earnSchema),
  asyncHandler(async (req, res) => {
    const p = await prisma.earnProduct.create({ data: req.body });
    await audit(req.adminId!, "EARN_CREATE", p.id, req.body, req.ip);
    return created(res, p);
  }),
);
router.patch(
  "/earn/:id",
  requireAdminRole("SUPER_ADMIN", "ADMIN"),
  validate(earnSchema.partial()),
  asyncHandler(async (req, res) => {
    const p = await prisma.earnProduct.update({ where: { id: req.params.id }, data: req.body });
    await audit(req.adminId!, "EARN_UPDATE", p.id, req.body, req.ip);
    return ok(res, p);
  }),
);
router.delete(
  "/earn/:id",
  requireAdminRole("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req, res) => {
    await prisma.earnProduct.delete({ where: { id: req.params.id } });
    await audit(req.adminId!, "EARN_DELETE", req.params.id, undefined, req.ip);
    return ok(res, { ok: true });
  }),
);

// ════════════════════════ FINANCE PRODUCTS ════════════════════════
const financeSchema = z.object({
  name: z.string(),
  type: z.string(),
  currencySymbol: z.string().toUpperCase(),
  rate: z.number().min(0),
  durationDays: z.number().int().min(0),
  minAmount: z.number().min(0).default(0),
  maxAmount: z.number().min(0).default(0),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

router.get("/finance", asyncHandler(async (_req, res) => ok(res, await prisma.financeProduct.findMany({ orderBy: { createdAt: "desc" } }))));
router.post(
  "/finance",
  requireAdminRole("SUPER_ADMIN", "ADMIN"),
  validate(financeSchema),
  asyncHandler(async (req, res) => {
    const p = await prisma.financeProduct.create({ data: req.body });
    await audit(req.adminId!, "FINANCE_CREATE", p.id, req.body, req.ip);
    return created(res, p);
  }),
);
router.patch(
  "/finance/:id",
  requireAdminRole("SUPER_ADMIN", "ADMIN"),
  validate(financeSchema.partial()),
  asyncHandler(async (req, res) => {
    const p = await prisma.financeProduct.update({ where: { id: req.params.id }, data: req.body });
    await audit(req.adminId!, "FINANCE_UPDATE", p.id, req.body, req.ip);
    return ok(res, p);
  }),
);
router.delete(
  "/finance/:id",
  requireAdminRole("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req, res) => {
    await prisma.financeProduct.delete({ where: { id: req.params.id } });
    await audit(req.adminId!, "FINANCE_DELETE", req.params.id, undefined, req.ip);
    return ok(res, { ok: true });
  }),
);

// ════════════════════════ LOTTERY ════════════════════════
const lotterySchema = z.object({
  name: z.string(),
  ticketPrice: z.number().positive(),
  drawAt: z.coerce.date(),
});

router.get(
  "/lottery",
  asyncHandler(async (_req, res) => {
    const list = await prisma.lotteryRound.findMany({
      orderBy: { drawAt: "desc" },
      include: { _count: { select: { entries: true } } },
    });
    return ok(res, list);
  }),
);

router.post(
  "/lottery",
  requireAdminRole("SUPER_ADMIN", "ADMIN"),
  validate(lotterySchema),
  asyncHandler(async (req, res) => {
    const r = await prisma.lotteryRound.create({ data: req.body });
    await audit(req.adminId!, "LOTTERY_CREATE", r.id, req.body, req.ip);
    return created(res, r);
  }),
);

router.post(
  "/lottery/:id/draw",
  requireAdminRole("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req, res) => {
    const round = await prisma.lotteryRound.findUnique({
      where: { id: req.params.id },
      include: { entries: true },
    });
    if (!round) return ok(res, null);
    if (round.status !== "OPEN") return ok(res, round);
    if (round.entries.length === 0) {
      const updated = await prisma.lotteryRound.update({ where: { id: round.id }, data: { status: "CANCELLED" } });
      return ok(res, updated, "No entries — round cancelled");
    }
    const winner = round.entries[Math.floor(Math.random() * round.entries.length)];
    const prize = round.prizePool;
    await prisma.$transaction(async (tx) => {
      await tx.lotteryEntry.update({ where: { id: winner.id }, data: { isWinner: true, prize } });
      await tx.lotteryRound.update({
        where: { id: round.id },
        data: { status: "DRAWN", winnerEntryId: winner.id },
      });
      await tx.reward.create({
        data: { userId: winner.userId, type: "LOTTERY", amount: prize, currencySymbol: "USDT", description: `Lottery: ${round.name}` },
      });
      await tx.wallet.upsert({
        where: {
          userId_currencyId_accountType: {
            userId: winner.userId,
            currencyId: (await tx.currency.findUnique({ where: { symbol: "USDT" } }))!.id,
            accountType: "SPOT",
          },
        },
        create: {
          userId: winner.userId, currencyId: (await tx.currency.findUnique({ where: { symbol: "USDT" } }))!.id,
          accountType: "SPOT", balance: prize,
        },
        update: { balance: { increment: prize } },
      });
      await tx.notification.create({
        data: { userId: winner.userId, title: "🎉 You won!", body: `You won ${prize} USDT in ${round.name}`, type: "SUCCESS" },
      });
    });
    await audit(req.adminId!, "LOTTERY_DRAW", round.id, { winnerId: winner.userId, prize }, req.ip);
    return ok(res, { winnerId: winner.userId, prize });
  }),
);

// ════════════════════════ ANNOUNCEMENTS ════════════════════════
const announcementSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  category: z.string().default("GENERAL"),
  bannerUrl: z.string().url().optional(),
  isPinned: z.boolean().default(false),
  isActive: z.boolean().default(true),
  publishAt: z.coerce.date().optional(),
});

router.get("/announcements", asyncHandler(async (_req, res) => ok(res, await prisma.announcement.findMany({ orderBy: { publishAt: "desc" } }))));
router.post(
  "/announcements",
  requireAdminRole("SUPER_ADMIN", "ADMIN"),
  validate(announcementSchema),
  asyncHandler(async (req, res) => {
    const a = await prisma.announcement.create({ data: req.body });
    await audit(req.adminId!, "ANNOUNCEMENT_CREATE", a.id, req.body, req.ip);
    return created(res, a);
  }),
);
router.patch(
  "/announcements/:id",
  requireAdminRole("SUPER_ADMIN", "ADMIN"),
  validate(announcementSchema.partial()),
  asyncHandler(async (req, res) => {
    const a = await prisma.announcement.update({ where: { id: req.params.id }, data: req.body });
    await audit(req.adminId!, "ANNOUNCEMENT_UPDATE", a.id, req.body, req.ip);
    return ok(res, a);
  }),
);
router.delete(
  "/announcements/:id",
  requireAdminRole("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req, res) => {
    await prisma.announcement.delete({ where: { id: req.params.id } });
    await audit(req.adminId!, "ANNOUNCEMENT_DELETE", req.params.id, undefined, req.ip);
    return ok(res, { ok: true });
  }),
);

// ════════════════════════ BROADCAST NOTIFICATIONS ════════════════════════
const broadcastSchema = z.object({
  title: z.string(),
  body: z.string(),
  type: z.enum(["INFO", "SUCCESS", "WARNING", "DANGER"]).default("INFO"),
  link: z.string().optional(),
  userIds: z.array(z.string()).optional(),    // empty = all users
});

router.post(
  "/notifications/broadcast",
  requireAdminRole("SUPER_ADMIN", "ADMIN"),
  validate(broadcastSchema),
  asyncHandler(async (req, res) => {
    const { title, body, type, link, userIds } = req.body as z.infer<typeof broadcastSchema>;
    const targetIds = userIds && userIds.length > 0
      ? userIds
      : (await prisma.user.findMany({ select: { id: true } })).map((u) => u.id);
    if (targetIds.length === 0) return ok(res, { sent: 0 });
    await prisma.notification.createMany({
      data: targetIds.map((uid) => ({ userId: uid, title, body, type, link })),
    });
    await audit(req.adminId!, "NOTIF_BROADCAST", undefined, { count: targetIds.length, title }, req.ip);
    return ok(res, { sent: targetIds.length });
  }),
);

// ════════════════════════ SETTINGS ════════════════════════
router.get(
  "/settings",
  asyncHandler(async (_req, res) => {
    const rows = await prisma.setting.findMany();
    const out: Record<string, any> = {};
    for (const r of rows) {
      try { out[r.key] = JSON.parse(r.value); } catch { out[r.key] = r.value; }
    }
    return ok(res, out);
  }),
);

router.patch(
  "/settings",
  requireAdminRole("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req, res) => {
    const updates = req.body as Record<string, any>;
    if (!updates || typeof updates !== "object") return ok(res, {});
    for (const [k, v] of Object.entries(updates)) {
      await setSetting(k, v);
    }
    await audit(req.adminId!, "SETTINGS_UPDATE", undefined, updates, req.ip);
    return ok(res, { ok: true, updated: Object.keys(updates) });
  }),
);

// ════════════════════════ SUPPORT TICKETS (admin view) ═════════════════════
router.get(
  "/tickets",
  asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined;
    const where = status ? { status } : {};
    const tickets = await prisma.supportTicket.findMany({
      where, orderBy: { updatedAt: "desc" }, take: 200,
      include: { user: { select: { id: true, email: true, username: true } } },
    });
    return ok(res, tickets);
  }),
);

router.get(
  "/tickets/:id",
  asyncHandler(async (req, res) => {
    const t = await prisma.supportTicket.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, email: true, username: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
    return ok(res, t);
  }),
);

const replySchema = z.object({ body: z.string().min(1) });

router.post(
  "/tickets/:id/reply",
  validate(replySchema),
  asyncHandler(async (req, res) => {
    const { body } = req.body as z.infer<typeof replySchema>;
    const t = await prisma.supportTicket.findUnique({ where: { id: req.params.id } });
    if (!t) return ok(res, null);
    const msg = await prisma.ticketMessage.create({
      data: { ticketId: t.id, senderId: req.adminId!, senderRole: "ADMIN", body },
    });
    await prisma.supportTicket.update({
      where: { id: t.id }, data: { status: "OPEN", updatedAt: new Date() },
    });
    await prisma.notification.create({
      data: { userId: t.userId, title: "Support replied", body: t.subject, type: "INFO" },
    });
    await audit(req.adminId!, "TICKET_REPLY", t.id, undefined, req.ip);
    return created(res, msg);
  }),
);

router.post(
  "/tickets/:id/close",
  asyncHandler(async (req, res) => {
    const t = await prisma.supportTicket.update({
      where: { id: req.params.id }, data: { status: "CLOSED" },
    });
    await audit(req.adminId!, "TICKET_CLOSE", t.id, undefined, req.ip);
    return ok(res, t);
  }),
);

const tryParse = <T>(s: string, fb: T): T => { try { return JSON.parse(s) as T; } catch { return fb; } };

export default router;
