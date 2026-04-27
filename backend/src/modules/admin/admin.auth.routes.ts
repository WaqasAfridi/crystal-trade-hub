import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { hashPassword, verifyPassword } from "../../utils/password";
import { signAdminToken } from "../../utils/jwt";
import { ok, created } from "../../utils/response";
import { unauthorized, notFound, conflict, forbidden } from "../../utils/errors";
import { validate } from "../../middleware/validate";
import { requireAdmin, requireAdminRole } from "../../middleware/auth";
import { audit } from "./audit";

const router = Router();

// ── Admin login ─────────────────────────────────────────────────────────────
const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { username, password } = req.body as z.infer<typeof loginSchema>;
    const admin = await prisma.admin.findFirst({
      where: { OR: [{ username }, { email: username.toLowerCase() }] },
    });
    if (!admin || !admin.isActive) throw unauthorized("Invalid credentials");
    if (!(await verifyPassword(password, admin.passwordHash))) throw unauthorized("Invalid credentials");
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date(), lastLoginIp: req.ip || null },
    });
    const token = signAdminToken({ sub: admin.id, adminRole: admin.role });
    await audit(admin.id, "ADMIN_LOGIN", admin.id, { username: admin.username }, req.ip);
    return ok(res, {
      token,
      admin: {
        id: admin.id, username: admin.username, email: admin.email,
        fullName: admin.fullName, role: admin.role,
      },
    }, "Logged in");
  }),
);

// ── Current admin ───────────────────────────────────────────────────────────
router.get(
  "/me",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const admin = await prisma.admin.findUnique({
      where: { id: req.adminId },
      select: { id: true, username: true, email: true, fullName: true, role: true, createdAt: true, lastLoginAt: true },
    });
    if (!admin) throw notFound("Admin not found");
    return ok(res, admin);
  }),
);

// ── Manage admins (SUPER_ADMIN only) ────────────────────────────────────────
router.get(
  "/",
  requireAdmin,
  requireAdminRole("SUPER_ADMIN"),
  asyncHandler(async (_req, res) => {
    const admins = await prisma.admin.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, username: true, email: true, fullName: true,
        role: true, isActive: true, lastLoginAt: true, createdAt: true,
      },
    });
    return ok(res, admins);
  }),
);

const createSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  fullName: z.string().optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "MODERATOR", "SUPPORT"]).default("MODERATOR"),
});

router.post(
  "/",
  requireAdmin,
  requireAdminRole("SUPER_ADMIN"),
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof createSchema>;
    const dup = await prisma.admin.findFirst({
      where: { OR: [{ username: data.username }, { email: data.email }] },
    });
    if (dup) throw conflict("Username or email already exists");
    const admin = await prisma.admin.create({
      data: { ...data, passwordHash: await hashPassword(data.password) },
      select: { id: true, username: true, email: true, role: true, isActive: true, createdAt: true },
    });
    await audit(req.adminId!, "ADMIN_CREATE", admin.id, { username: admin.username, role: admin.role }, req.ip);
    return created(res, admin, "Admin created");
  }),
);

const updateSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "MODERATOR", "SUPPORT"]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).max(72).optional(),
});

router.patch(
  "/:id",
  requireAdmin,
  requireAdminRole("SUPER_ADMIN"),
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    if (req.params.id === req.adminId) {
      const body = req.body as z.infer<typeof updateSchema>;
      if (body.role || body.isActive === false) throw forbidden("You cannot change your own role/status");
    }
    const data: any = { ...req.body };
    if (data.password) {
      data.passwordHash = await hashPassword(data.password);
      delete data.password;
    }
    const admin = await prisma.admin.update({
      where: { id: req.params.id },
      data,
      select: { id: true, username: true, email: true, role: true, isActive: true },
    });
    await audit(req.adminId!, "ADMIN_UPDATE", admin.id, data, req.ip);
    return ok(res, admin);
  }),
);

router.delete(
  "/:id",
  requireAdmin,
  requireAdminRole("SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    if (req.params.id === req.adminId) throw forbidden("Cannot delete yourself");
    await prisma.admin.delete({ where: { id: req.params.id } });
    await audit(req.adminId!, "ADMIN_DELETE", req.params.id, undefined, req.ip);
    return ok(res, { ok: true });
  }),
);

// ── Audit log ───────────────────────────────────────────────────────────────
router.get(
  "/audit-log",
  requireAdmin,
  requireAdminRole("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const pageSize = Math.min(100, parseInt((req.query.pageSize as string) || "50", 10));
    const [items, total] = await Promise.all([
      prisma.adminAuditLog.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize, take: pageSize,
        include: { admin: { select: { username: true, role: true } } },
      }),
      prisma.adminAuditLog.count(),
    ]);
    return ok(res, { items, total, page, pageSize });
  }),
);

export default router;
