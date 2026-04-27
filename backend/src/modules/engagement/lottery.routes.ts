import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok, created } from "../../utils/response";
import { badRequest, notFound } from "../../utils/errors";
import { requireUser } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { debit } from "../wallets/wallet.helpers";

const router = Router();

router.get(
  "/rounds",
  asyncHandler(async (_req, res) => {
    const rounds = await prisma.lotteryRound.findMany({
      where: { status: "OPEN" },
      orderBy: { drawAt: "asc" },
    });
    return ok(res, rounds);
  }),
);

const enterSchema = z.object({
  numbers: z.string().min(1),    // e.g. "5,12,23,34,45"
});

router.post(
  "/rounds/:id/enter",
  requireUser,
  validate(enterSchema),
  asyncHandler(async (req, res) => {
    const { numbers } = req.body as z.infer<typeof enterSchema>;
    const round = await prisma.lotteryRound.findUnique({ where: { id: req.params.id } });
    if (!round) throw notFound("Round not found");
    if (round.status !== "OPEN") throw badRequest("Round closed");

    const entry = await prisma.$transaction(async (tx) => {
      await debit(tx, req.userId!, "USDT", round.ticketPrice, "SPOT");
      await tx.lotteryRound.update({
        where: { id: round.id },
        data: { prizePool: { increment: round.ticketPrice } },
      });
      return tx.lotteryEntry.create({
        data: {
          userId: req.userId!, roundId: round.id,
          numbers, amountPaid: round.ticketPrice,
        },
      });
    });
    return created(res, entry, "Entered lottery");
  }),
);

router.get(
  "/my-entries",
  requireUser,
  asyncHandler(async (req, res) => {
    const entries = await prisma.lotteryEntry.findMany({
      where: { userId: req.userId },
      include: { round: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return ok(res, entries);
  }),
);

export default router;
