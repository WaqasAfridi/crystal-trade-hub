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
router.use(requireUser);

// Quote — returns the rate and amount you'd receive (no commitment)
const quoteSchema = z.object({
  fromSymbol: z.string().toUpperCase(),
  toSymbol: z.string().toUpperCase(),
  fromAmount: z.number().positive(),
  accountType: z.enum(["SPOT", "FUTURES", "EARN"]).default("SPOT"),
});

router.post(
  "/quote",
  validate(quoteSchema),
  asyncHandler(async (req, res) => {
    const { fromSymbol, toSymbol, fromAmount } = req.body as z.infer<typeof quoteSchema>;
    if (fromSymbol === toSymbol) throw badRequest("Currencies must differ");
    const [from, to] = await Promise.all([
      prisma.currency.findUnique({ where: { symbol: fromSymbol } }),
      prisma.currency.findUnique({ where: { symbol: toSymbol } }),
    ]);
    if (!from || !to) throw notFound("Currency not found");
    if (!from.priceUsd || !to.priceUsd) throw badRequest("Pricing unavailable");
    const rate = from.priceUsd / to.priceUsd;
    const grossTo = fromAmount * rate;
    const fee = grossTo * 0.001; // 0.1% conversion fee
    const toAmount = grossTo - fee;
    return ok(res, { fromSymbol, toSymbol, fromAmount, rate, toAmount, feeRate: 0.001, fee });
  }),
);

const convertSchema = z.object({
  fromSymbol: z.string().toUpperCase(),
  toSymbol: z.string().toUpperCase(),
  fromAmount: z.number().positive(),
  accountType: z.enum(["SPOT", "FUTURES", "EARN"]).default("SPOT"),
});

router.post(
  "/",
  validate(convertSchema),
  asyncHandler(async (req, res) => {
    const { fromSymbol, toSymbol, fromAmount, accountType } = req.body as z.infer<typeof convertSchema>;
    if (fromSymbol === toSymbol) throw badRequest("Currencies must differ");

    const [from, to] = await Promise.all([
      prisma.currency.findUnique({ where: { symbol: fromSymbol } }),
      prisma.currency.findUnique({ where: { symbol: toSymbol } }),
    ]);
    if (!from || !to) throw notFound("Currency not found");
    if (!from.priceUsd || !to.priceUsd) throw badRequest("Pricing unavailable");

    const rate = from.priceUsd / to.priceUsd;
    const grossTo = fromAmount * rate;
    const fee = grossTo * 0.001;
    const toAmount = grossTo - fee;

    const result = await prisma.$transaction(async (tx) => {
      await debit(tx, req.userId!, fromSymbol, fromAmount, accountType);
      await credit(tx, req.userId!, toSymbol, toAmount, accountType);
      return tx.conversion.create({
        data: {
          userId: req.userId!,
          fromSymbol, toSymbol, fromAmount, toAmount, rate, fee,
          accountType,
          status: "COMPLETED",
        },
      });
    });
    return created(res, result, "Conversion complete");
  }),
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const pageSize = Math.min(100, parseInt((req.query.pageSize as string) || "20", 10));
    const [items, total] = await Promise.all([
      prisma.conversion.findMany({ where: { userId: req.userId }, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.conversion.count({ where: { userId: req.userId } }),
    ]);
    return ok(res, { items, total, page, pageSize });
  }),
);

export default router;
