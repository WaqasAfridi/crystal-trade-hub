import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok, created } from "../../utils/response";
import { badRequest, notFound } from "../../utils/errors";
import { requireUser } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { credit, debit, lock, unlock } from "../wallets/wallet.helpers";

// NOTE: This is a simplified trading layer — orders are recorded and
// market orders are executed instantly using the admin-managed Currency.priceUsd.
// A real matching engine would replace the executeMarket() helper.

const router = Router();
router.use(requireUser);

// ═════════════════════ SPOT ═════════════════════
const placeOrderSchema = z.object({
  pair: z.string().regex(/^[A-Z0-9]+\/[A-Z0-9]+$/, "Pair must be like BTC/USDT"),
  side: z.enum(["BUY", "SELL"]),
  type: z.enum(["MARKET", "LIMIT"]).default("MARKET"),
  amount: z.number().positive(),
  price: z.number().positive().optional(),
});

router.post(
  "/spot/orders",
  validate(placeOrderSchema),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof placeOrderSchema>;
    const [base, quote] = data.pair.split("/");

    if (data.type === "LIMIT" && !data.price) throw badRequest("Limit price required");

    const baseCcy = await prisma.currency.findUnique({ where: { symbol: base } });
    const quoteCcy = await prisma.currency.findUnique({ where: { symbol: quote } });
    if (!baseCcy || !quoteCcy) throw notFound("Pair contains unsupported currency");
    if (!baseCcy.tradeEnabled || !quoteCcy.tradeEnabled) throw badRequest("Trading disabled for this pair");

    const market = baseCcy.priceUsd / quoteCcy.priceUsd; // base price quoted in `quote`
    const price = data.type === "MARKET" ? market : data.price!;
    const totalQuote = data.amount * price;
    const fee = totalQuote * 0.001; // 0.1%

    const order = await prisma.$transaction(async (tx) => {
      if (data.side === "BUY") {
        // Need quote currency for market, lock for limit
        if (data.type === "MARKET") {
          await debit(tx, req.userId!, quote, totalQuote + fee, "SPOT");
          await credit(tx, req.userId!, base, data.amount, "SPOT");
        } else {
          await lock(tx, req.userId!, quote, totalQuote + fee, "SPOT");
        }
      } else {
        // SELL
        if (data.type === "MARKET") {
          await debit(tx, req.userId!, base, data.amount, "SPOT");
          await credit(tx, req.userId!, quote, totalQuote - fee, "SPOT");
        } else {
          await lock(tx, req.userId!, base, data.amount, "SPOT");
        }
      }

      const filled = data.type === "MARKET" ? data.amount : 0;
      const o = await tx.spotOrder.create({
        data: {
          userId: req.userId!,
          pair: data.pair,
          side: data.side,
          type: data.type,
          price: data.type === "LIMIT" ? data.price! : price,
          amount: data.amount,
          filled,
          total: totalQuote,
          fee,
          status: data.type === "MARKET" ? "FILLED" : "OPEN",
        },
      });

      if (data.type === "MARKET") {
        await tx.trade.create({
          data: {
            userId: req.userId!,
            orderId: o.id,
            pair: data.pair,
            side: data.side,
            price,
            amount: data.amount,
            total: totalQuote,
            fee,
          },
        });
      }
      return o;
    });

    return created(res, order, "Order placed");
  }),
);

router.get(
  "/spot/orders",
  asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined;
    const where: any = { userId: req.userId };
    if (status) where.status = status;
    const orders = await prisma.spotOrder.findMany({
      where, orderBy: { createdAt: "desc" }, take: 100,
    });
    return ok(res, orders);
  }),
);

router.post(
  "/spot/orders/:id/cancel",
  asyncHandler(async (req, res) => {
    const o = await prisma.spotOrder.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!o) throw notFound("Order not found");
    if (o.status !== "OPEN") throw badRequest("Only OPEN orders can be cancelled");

    const updated = await prisma.$transaction(async (tx) => {
      const [base, quote] = o.pair.split("/");
      if (o.side === "BUY") {
        // unlock quote currency that was locked at order placement
        await unlock(tx, req.userId!, quote, o.total + o.fee, "SPOT");
      } else {
        await unlock(tx, req.userId!, base, o.amount, "SPOT");
      }
      return tx.spotOrder.update({ where: { id: o.id }, data: { status: "CANCELLED" } });
    });
    return ok(res, updated, "Order cancelled");
  }),
);

router.get(
  "/spot/trades",
  asyncHandler(async (req, res) => {
    const trades = await prisma.trade.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return ok(res, trades);
  }),
);

// ═════════════════════ FUTURES ═════════════════════
const futuresSchema = z.object({
  market: z.enum(["futures/crypto", "futures/stocks", "futures/fx"]).default("futures/crypto"),
  pair: z.string(),
  side: z.enum(["BUY", "SELL"]),
  amount: z.number().positive(),
  leverage: z.number().int().min(1).max(125).default(1),
  type: z.enum(["MARKET", "LIMIT"]).default("MARKET"),
  entryPrice: z.number().positive().optional(),
});

router.post(
  "/futures/orders",
  validate(futuresSchema),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof futuresSchema>;
    const margin = data.amount / data.leverage;
    // Lock margin in FUTURES wallet (assumed quoted in USDT here)
    await prisma.$transaction(async (tx) => {
      await debit(tx, req.userId!, "USDT", margin, "FUTURES");
    });
    const o = await prisma.futuresOrder.create({
      data: {
        userId: req.userId!,
        market: data.market,
        pair: data.pair,
        side: data.side,
        leverage: data.leverage,
        type: data.type,
        entryPrice: data.entryPrice,
        amount: data.amount,
        margin,
        status: "OPEN",
      },
    });
    return created(res, o, "Position opened");
  }),
);

router.get(
  "/futures/orders",
  asyncHandler(async (req, res) => {
    const orders = await prisma.futuresOrder.findMany({
      where: { userId: req.userId }, orderBy: { createdAt: "desc" }, take: 100,
    });
    return ok(res, orders);
  }),
);

router.post(
  "/futures/orders/:id/close",
  asyncHandler(async (req, res) => {
    const pnl = parseFloat((req.body?.pnl ?? 0).toString());
    const o = await prisma.futuresOrder.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!o) throw notFound("Position not found");
    if (o.status !== "OPEN") throw badRequest("Position is not open");
    const updated = await prisma.$transaction(async (tx) => {
      // return margin + PnL
      await credit(tx, req.userId!, "USDT", o.margin + pnl, "FUTURES");
      return tx.futuresOrder.update({
        where: { id: o.id },
        data: { status: "FILLED", pnl, closedAt: new Date() },
      });
    });
    return ok(res, updated, "Position closed");
  }),
);

// ═════════════════════ BUY NOW ═════════════════════
const buySchema = z.object({
  currencySymbol: z.string().toUpperCase(),
  fiatSymbol: z.string().toUpperCase().default("USD"),
  fiatAmount: z.number().positive(),
  paymentMethod: z.string().optional(),
});

router.post(
  "/buy-now",
  validate(buySchema),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof buySchema>;
    const ccy = await prisma.currency.findUnique({ where: { symbol: data.currencySymbol } });
    if (!ccy) throw notFound("Currency not supported");
    if (!ccy.priceUsd) throw badRequest("Price unavailable");
    const rate = ccy.priceUsd; // simplified: assumes USD parity for fiatSymbol
    const fee = data.fiatAmount * 0.02; // 2% fee
    const cryptoAmount = (data.fiatAmount - fee) / rate;
    const order = await prisma.buyOrder.create({
      data: {
        userId: req.userId!,
        currencySymbol: data.currencySymbol,
        fiatSymbol: data.fiatSymbol,
        fiatAmount: data.fiatAmount,
        cryptoAmount,
        rate,
        fee,
        paymentMethod: data.paymentMethod,
        status: "PENDING",
      },
    });
    // In production, this would integrate with a payment gateway.
    // Once payment is confirmed, an admin/webhook flips status -> COMPLETED and credits the wallet.
    return created(res, order, "Buy order placed, awaiting payment confirmation");
  }),
);

router.get(
  "/buy-now",
  asyncHandler(async (req, res) => {
    const orders = await prisma.buyOrder.findMany({
      where: { userId: req.userId }, orderBy: { createdAt: "desc" }, take: 100,
    });
    return ok(res, orders);
  }),
);

export default router;
