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

// Public list (no auth required, so the marketing pages can show ICOs)
router.get(
  "/projects",
  asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined;
    const projects = await prisma.icoProject.findMany({
      where: { isActive: true, ...(status ? { status: status as any } : {}) },
      orderBy: { startAt: "asc" },
    });
    return ok(res, projects);
  }),
);

router.get(
  "/projects/:id",
  asyncHandler(async (req, res) => {
    const p = await prisma.icoProject.findUnique({ where: { id: req.params.id } });
    if (!p) throw notFound("Project not found");
    return ok(res, p);
  }),
);

// User subscribes (buys tokens) — costs USDT in SPOT wallet
const subscribeSchema = z.object({ amountUsdt: z.number().positive() });

router.post(
  "/projects/:id/subscribe",
  requireUser,
  validate(subscribeSchema),
  asyncHandler(async (req, res) => {
    const { amountUsdt } = req.body as z.infer<typeof subscribeSchema>;
    const project = await prisma.icoProject.findUnique({ where: { id: req.params.id } });
    if (!project) throw notFound("Project not found");
    if (!project.isActive || project.status !== "LIVE") throw badRequest("Project not live");
    if (project.minBuy && amountUsdt < project.minBuy) throw badRequest(`Minimum is ${project.minBuy} USDT`);
    if (project.maxBuy && amountUsdt > project.maxBuy) throw badRequest(`Maximum is ${project.maxBuy} USDT`);
    const tokens = amountUsdt / project.pricePerToken;
    if (project.soldAmount + tokens > project.totalSupply) throw badRequest("Not enough supply remaining");

    const sub = await prisma.$transaction(async (tx) => {
      await debit(tx, req.userId!, "USDT", amountUsdt, "SPOT");
      await tx.icoProject.update({
        where: { id: project.id },
        data: { soldAmount: { increment: tokens } },
      });
      return tx.icoSubscription.create({
        data: {
          userId: req.userId!, projectId: project.id,
          amountPaid: amountUsdt, tokens, status: "COMPLETED",
        },
      });
    });
    return created(res, sub, "Subscribed");
  }),
);

router.get(
  "/my-subscriptions",
  requireUser,
  asyncHandler(async (req, res) => {
    const subs = await prisma.icoSubscription.findMany({
      where: { userId: req.userId },
      include: { project: true },
      orderBy: { createdAt: "desc" },
    });
    return ok(res, subs);
  }),
);

export default router;
