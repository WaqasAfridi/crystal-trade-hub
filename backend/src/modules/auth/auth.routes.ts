import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { hashPassword, verifyPassword } from "../../utils/password";
import { signUserToken } from "../../utils/jwt";
import { ok, created } from "../../utils/response";
import { badRequest, conflict, unauthorized, notFound } from "../../utils/errors";
import { generateInviteCode } from "../../utils/codes";
import { validate } from "../../middleware/validate";
import { requireUser } from "../../middleware/auth";

const router = Router();

// ── REGISTER ────────────────────────────────────────────────────────────────
const registerSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(5).max(20).optional(),
  username: z.string().min(3).max(30).optional(),
  password: z.string().min(6).max(72),
  inviteCode: z.string().trim().toUpperCase().optional(),
}).refine((d) => d.email || d.phone, { message: "Email or phone is required" });

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { email, phone, username, password, inviteCode } = req.body as z.infer<typeof registerSchema>;

    if (email) {
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) throw conflict("Email already registered");
    }
    if (phone) {
      const exists = await prisma.user.findUnique({ where: { phone } });
      if (exists) throw conflict("Phone already registered");
    }
    if (username) {
      const exists = await prisma.user.findUnique({ where: { username } });
      if (exists) throw conflict("Username already taken");
    }

    let invitedById: string | undefined;
    if (inviteCode) {
      const inviter = await prisma.user.findUnique({ where: { inviteCode } });
      if (!inviter) throw badRequest("Invalid invite code");
      invitedById = inviter.id;
    }

    // Generate a unique invite code for the new user (retry on collision)
    let myCode = generateInviteCode();
    while (await prisma.user.findUnique({ where: { inviteCode: myCode } })) {
      myCode = generateInviteCode();
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        username,
        passwordHash,
        inviteCode: myCode,
        invitedById,
      },
      select: {
        id: true, email: true, phone: true, username: true,
        inviteCode: true, vipLevel: true, createdAt: true,
      },
    });

    // Auto-create wallets for every active currency, in SPOT account
    const currencies = await prisma.currency.findMany({ where: { isActive: true }, select: { id: true } });
    if (currencies.length) {
      await prisma.wallet.createMany({
        data: currencies.map((c) => ({
          userId: user.id,
          currencyId: c.id,
          accountType: "SPOT" as const,
        })),
      });
    }

    const token = signUserToken({ sub: user.id });
    return created(res, { user, token }, "Account created");
  }),
);

// ── LOGIN ───────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  identifier: z.string().min(1),     // email | phone | username
  password: z.string().min(1),
});

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { identifier, password } = req.body as z.infer<typeof loginSchema>;

    // Try to find user by email, phone, or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          { phone: identifier },
          { username: identifier },
        ],
      },
    });
    if (!user) throw unauthorized("Invalid credentials");
    if (user.status === "BANNED") throw unauthorized("Account banned");
    if (user.status === "SUSPENDED") throw unauthorized("Account suspended");

    const okPwd = await verifyPassword(password, user.passwordHash);
    if (!okPwd) throw unauthorized("Invalid credentials");

    // Record login history
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        ip: req.ip,
        userAgent: req.headers["user-agent"] || null,
        success: true,
      },
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastLoginIp: req.ip || null },
    });

    const token = signUserToken({ sub: user.id });
    return ok(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        username: user.username,
        avatarUrl: user.avatarUrl,
        vipLevel: user.vipLevel,
        inviteCode: user.inviteCode,
      },
    }, "Logged in");
  }),
);

// ── ME (current authenticated user, full info) ──────────────────────────────
router.get(
  "/me",
  requireUser,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true, email: true, phone: true, username: true,
        avatarUrl: true, country: true, language: true,
        vipLevel: true, status: true, inviteCode: true,
        emailVerified: true, phoneVerified: true,
        twoFactorEnabled: true,
        createdAt: true, lastLoginAt: true,
        kyc: { select: { status: true, fullName: true, country: true } },
      },
    });
    if (!user) throw notFound("User not found");
    return ok(res, user);
  }),
);

// ── CHANGE PASSWORD ─────────────────────────────────────────────────────────
const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6).max(72),
});

router.post(
  "/change-password",
  requireUser,
  validate(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body as z.infer<typeof changePasswordSchema>;
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) throw notFound("User not found");
    if (!(await verifyPassword(oldPassword, user.passwordHash))) throw unauthorized("Old password incorrect");
    await prisma.user.update({
      where: { id: req.userId },
      data: { passwordHash: await hashPassword(newPassword) },
    });
    return ok(res, { ok: true }, "Password updated");
  }),
);

// ── SET / CHANGE WITHDRAW PASSWORD ──────────────────────────────────────────
const setWithdrawPasswordSchema = z.object({
  password: z.string().min(1),                  // login password for confirmation
  withdrawPassword: z.string().min(6).max(72),
});

router.post(
  "/withdraw-password",
  requireUser,
  validate(setWithdrawPasswordSchema),
  asyncHandler(async (req, res) => {
    const { password, withdrawPassword } = req.body as z.infer<typeof setWithdrawPasswordSchema>;
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) throw notFound("User not found");
    if (!(await verifyPassword(password, user.passwordHash))) throw unauthorized("Login password incorrect");
    await prisma.user.update({
      where: { id: req.userId },
      data: { withdrawPasswordHash: await hashPassword(withdrawPassword) },
    });
    return ok(res, { ok: true }, "Withdraw password set");
  }),
);

// ── LOGOUT (client-side delete; this just answers OK) ───────────────────────
router.post("/logout", requireUser, asyncHandler(async (_req, res) => ok(res, { ok: true }, "Logged out")));

export default router;
