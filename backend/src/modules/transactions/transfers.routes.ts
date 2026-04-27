import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok, created } from "../../utils/response";
import { badRequest } from "../../utils/errors";
import { requireUser } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { credit, debit } from "../wallets/wallet.helpers";

const router = Router();
router.use(requireUser);

const accountEnum = z.enum(["SPOT", "FUTURES", "EARN", "FUNDING"]);

const transferSchema = z.object({
  currencySymbol: z.string().toUpperCase(),
  amount: z.number().positive(),
  fromAccount: accountEnum,
  toAccount: accountEnum,
});

router.post(
  "/",
  validate(transferSchema),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof transferSchema>;
    if (data.fromAccount === data.toAccount) throw badRequest("Source and destination accounts must differ");

    const t = await prisma.$transaction(async (tx) => {
      await debit(tx, req.userId!, data.currencySymbol, data.amount, data.fromAccount);
      await credit(tx, req.userId!, data.currencySymbol, data.amount, data.toAccount);
      return tx.transfer.create({
        data: {
          userId: req.userId!,
          currencySymbol: data.currencySymbol,
          amount: data.amount,
          fromAccount: data.fromAccount,
          toAccount: data.toAccount,
          status: "COMPLETED",
        },
      });
    });
    return created(res, t, "Transfer complete");
  }),
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const pageSize = Math.min(100, parseInt((req.query.pageSize as string) || "20", 10));
    const [items, total] = await Promise.all([
      prisma.transfer.findMany({ where: { userId: req.userId }, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.transfer.count({ where: { userId: req.userId } }),
    ]);
    return ok(res, { items, total, page, pageSize });
  }),
);

export default router;
