import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok, created } from "../../utils/response";
import { notFound, badRequest } from "../../utils/errors";
import { requireUser } from "../../middleware/auth";
import { validate } from "../../middleware/validate";

const router = Router();
router.use(requireUser);

const createSchema = z.object({
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
});

router.post(
  "/",
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const { subject, body, priority } = req.body as z.infer<typeof createSchema>;
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: req.userId!, subject, priority, status: "OPEN",
        messages: { create: { senderId: req.userId!, senderRole: "USER", body } },
      },
      include: { messages: true },
    });
    return created(res, ticket, "Ticket created");
  }),
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });
    return ok(res, tickets);
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const ticket = await prisma.supportTicket.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!ticket) throw notFound("Ticket not found");
    return ok(res, ticket);
  }),
);

const replySchema = z.object({ body: z.string().min(1).max(5000) });

router.post(
  "/:id/reply",
  validate(replySchema),
  asyncHandler(async (req, res) => {
    const { body } = req.body as z.infer<typeof replySchema>;
    const ticket = await prisma.supportTicket.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!ticket) throw notFound("Ticket not found");
    if (ticket.status === "CLOSED") throw badRequest("Ticket is closed");
    const msg = await prisma.ticketMessage.create({
      data: { ticketId: ticket.id, senderId: req.userId!, senderRole: "USER", body },
    });
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { status: "PENDING", updatedAt: new Date() },
    });
    return created(res, msg, "Reply sent");
  }),
);

export default router;
