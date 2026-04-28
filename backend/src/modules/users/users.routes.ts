import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/response";
import { notFound } from "../../utils/errors";
import { requireUser } from "../../middleware/auth";
import { validate } from "../../middleware/validate";

const router = Router();

router.use(requireUser);

// Profile (light wrapper around /auth/me but returns more fields & is RESTful)
router.get(
  "/profile",
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true, email: true, phone: true, username: true, avatarUrl: true,
        country: true, language: true, vipLevel: true, status: true,
        inviteCode: true, emailVerified: true, phoneVerified: true,
        twoFactorEnabled: true, forceWin: true, createdAt: true,
        kyc: { select: { status: true, country: true, fullName: true } },
      },
    });
    if (!user) throw notFound("User not found");
    return ok(res, user);
  }),
);

const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  avatarUrl: z.string().url().optional(),
  country: z.string().max(80).optional(),
  language: z.string().max(10).optional(),
});

router.patch(
  "/profile",
  validate(updateProfileSchema),
  asyncHandler(async (req, res) => {
    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: req.body,
      select: { id: true, username: true, avatarUrl: true, country: true, language: true },
    });
    return ok(res, updated, "Profile updated");
  }),
);

// Login history (Security Center)
router.get(
  "/login-history",
  asyncHandler(async (req, res) => {
    const list = await prisma.loginHistory.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return ok(res, list);
  }),
);

// Bind email or phone (placeholder — in production this would send a code first)
const bindSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(5).max(20).optional(),
}).refine((d) => d.email || d.phone, { message: "Provide email or phone" });

router.post(
  "/bind",
  validate(bindSchema),
  asyncHandler(async (req, res) => {
    const { email, phone } = req.body as z.infer<typeof bindSchema>;
    const data: any = {};
    if (email) { data.email = email; data.emailVerified = true; }
    if (phone) { data.phone = phone; data.phoneVerified = true; }
    const updated = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: { id: true, email: true, phone: true, emailVerified: true, phoneVerified: true },
    });
    return ok(res, updated, "Updated");
  }),
);

export default router;
