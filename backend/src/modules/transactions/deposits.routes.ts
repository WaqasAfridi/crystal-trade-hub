import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok, created } from "../../utils/response";
import { badRequest, notFound } from "../../utils/errors";
import { requireUser } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { upload } from "../../middleware/upload";

const router = Router();
router.use(requireUser);

// ── Upload a transfer voucher image ─────────────────────────────────────────
router.post(
  "/upload-voucher",
  upload.single("voucher"),
  asyncHandler(async (req, res) => {
    if (!req.file) return ok(res, { url: null }, "No file uploaded");
    const baseUrl = req.protocol + "://" + req.get("host");
    const url = `${baseUrl}/uploads/${req.file.filename}`;
    return ok(res, { url });
  }),
);

// ── List supported deposit addresses for a currency ─────────────────────────
router.get(
  "/addresses/:symbol",
  asyncHandler(async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    const currency = await prisma.currency.findUnique({ where: { symbol } });
    if (!currency) throw notFound("Currency not found");
    const addresses = await prisma.platformDepositAddress.findMany({
      where: { currencyId: currency.id, isActive: true },
    });
    return ok(res, { currency: { symbol: currency.symbol, name: currency.name }, addresses });
  }),
);

// ── User submits a deposit (e.g., after sending coins to platform address) ──
const createDepositSchema = z.object({
  currencySymbol: z.string().toUpperCase(),
  amount: z.number().positive(),
  network: z.string().optional(),
  txHash: z.string().optional(),
  fromAddress: z.string().optional(),
  toAddress: z.string().optional(),
  voucherUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

router.post(
  "/",
  validate(createDepositSchema),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof createDepositSchema>;
    const currency = await prisma.currency.findUnique({ where: { symbol: data.currencySymbol } });
    if (!currency) throw notFound("Currency not supported");
    if (!currency.depositEnabled) throw badRequest("Deposits disabled for this currency");

    const dep = await prisma.deposit.create({
      data: {
        userId: req.userId!,
        currencySymbol: data.currencySymbol,
        amount: data.amount,
        network: data.network,
        txHash: data.txHash,
        fromAddress: data.fromAddress,
        toAddress: data.toAddress,
        // voucherUrl stored in notes as JSON until migration is applied
        notes: JSON.stringify({
          ...(data.notes ? { notes: data.notes } : {}),
          ...(data.voucherUrl ? { voucherUrl: data.voucherUrl } : {}),
        }) || undefined,
        status: "PENDING",
      },
    });
    return created(res, dep, "Deposit submitted, awaiting confirmation");
  }),
);

// ── List my deposits (with pagination + status filter) ──────────────────────
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const pageSize = Math.min(100, parseInt((req.query.pageSize as string) || "20", 10));
    const status = req.query.status as string | undefined;

    const where: any = { userId: req.userId };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.deposit.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.deposit.count({ where }),
    ]);
    return ok(res, { items, total, page, pageSize });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const dep = await prisma.deposit.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!dep) throw notFound("Deposit not found");
    return ok(res, dep);
  }),
);

export default router;
