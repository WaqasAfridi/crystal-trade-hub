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
  email:            z.string().email().optional(),
  phone:            z.string().min(5).max(20).optional(),
  username:         z.string().min(3).max(30).optional(),
  password:         z.string().min(6).max(72),
  verificationCode: z.string().length(6).optional(),   // required for email / phone
  inviteCode:       z.string().trim().toUpperCase().optional(),
}).refine((d) => d.email || d.phone || d.username, { message: "Email, phone, or username is required" });

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { email, phone, username, password, verificationCode, inviteCode } = req.body as z.infer<typeof registerSchema>;

    // ── Uniqueness checks
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

    // ── Verify OTP for email / phone registrations
    if (email || phone) {
      const target = email ?? phone!;
      if (!verificationCode) throw badRequest("Verification code is required for email/phone registration");

      const vcRecord = await prisma.verificationCode.findFirst({
        where: {
          target,
          code:      verificationCode,
          type:      "REGISTER",
          used:      false,
          expiresAt: { gte: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });
      if (!vcRecord) throw badRequest("Invalid or expired verification code");

      // Consume the code
      await prisma.verificationCode.update({ where: { id: vcRecord.id }, data: { used: true } });
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
        emailVerified: !!email,   // email OTP was verified above
        phoneVerified: !!phone,   // phone OTP was verified above
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

// ── SEND VERIFICATION CODE ───────────────────────────────────────────────────
const sendCodeSchema = z.object({
  target: z.string().min(3),
  type:   z.enum(["REGISTER", "RESET_PASSWORD"]).default("REGISTER"),
});

router.post(
  "/send-code",
  validate(sendCodeSchema),
  asyncHandler(async (req, res) => {
    const { target, type } = req.body as z.infer<typeof sendCodeSchema>;

    // Rate limit: max 5 codes per target per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await prisma.verificationCode.count({
      where: { target, createdAt: { gte: oneHourAgo } },
    });
    if (recentCount >= 5) throw badRequest("Too many requests. Please wait before requesting another code.");

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target);

    // For REGISTER: confirm the target is not already taken
    if (type === "REGISTER") {
      if (isEmail) {
        const exists = await prisma.user.findUnique({ where: { email: target } });
        if (exists) throw conflict("Email already registered");
      } else {
        const exists = await prisma.user.findUnique({ where: { phone: target } });
        if (exists) throw conflict("Phone already registered");
      }
    }

    // Invalidate any prior unused codes
    await prisma.verificationCode.updateMany({
      where: { target, type, used: false },
      data: { used: true },
    });

    const code      = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await prisma.verificationCode.create({ data: { target, code, type, expiresAt } });

    // ── Send the code ──────────────────────────────────────────────────
    // TODO: integrate SMTP (e.g. nodemailer + Brevo/SendGrid) for email
    //       and a Twilio / Vonage SMS gateway for phone numbers.
    //       The core logic is ready; just call your provider here.
    console.log(`[OTP] ${type} code for ${target}: ${code}`);
    // ────────────────────────────────────────────────────────────────

    // In non-production envs, echo the code back so developers can test
    const isDev = process.env.NODE_ENV !== "production";
    return ok(res, { sent: true, ...(isDev ? { devCode: code } : {}) }, "Verification code sent");
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
