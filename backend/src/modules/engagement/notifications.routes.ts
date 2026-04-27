import { Router } from "express";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/response";
import { requireUser, optionalUser } from "../../middleware/auth";

const router = Router();

// PUBLIC bulletin / announcements (used by ProfilePage Bulletin and home banners)
router.get(
  "/announcements",
  asyncHandler(async (_req, res) => {
    const list = await prisma.announcement.findMany({
      where: { isActive: true, publishAt: { lte: new Date() } },
      orderBy: [{ isPinned: "desc" }, { publishAt: "desc" }],
      take: 50,
    });
    return ok(res, list);
  }),
);

router.get(
  "/announcements/:id",
  optionalUser,
  asyncHandler(async (req, res) => {
    const a = await prisma.announcement.findUnique({ where: { id: req.params.id } });
    return ok(res, a);
  }),
);

// PRIVATE notifications (per user) — used by /notifications page
router.get(
  "/",
  requireUser,
  asyncHandler(async (req, res) => {
    const list = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    const unread = await prisma.notification.count({
      where: { userId: req.userId, isRead: false },
    });
    return ok(res, { list, unread });
  }),
);

router.post(
  "/:id/read",
  requireUser,
  asyncHandler(async (req, res) => {
    const n = await prisma.notification.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!n) return ok(res, null);
    const updated = await prisma.notification.update({
      where: { id: n.id }, data: { isRead: true },
    });
    return ok(res, updated);
  }),
);

router.post(
  "/read-all",
  requireUser,
  asyncHandler(async (req, res) => {
    await prisma.notification.updateMany({
      where: { userId: req.userId, isRead: false },
      data: { isRead: true },
    });
    return ok(res, { ok: true });
  }),
);

export default router;
