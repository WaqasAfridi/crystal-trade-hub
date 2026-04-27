import { Router } from "express";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/response";
import { requireUser } from "../../middleware/auth";

const router = Router();
router.use(requireUser);

// List all my wallets across account types, with USD-equivalent value
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const wallets = await prisma.wallet.findMany({
      where: { userId: req.userId },
      include: {
        currency: {
          select: { symbol: true, name: true, iconUrl: true, decimals: true, priceUsd: true, type: true },
        },
      },
      orderBy: [{ accountType: "asc" }, { currency: { sortOrder: "asc" } }],
    });

    const enriched = wallets.map((w) => ({
      id: w.id,
      symbol: w.currency.symbol,
      name: w.currency.name,
      iconUrl: w.currency.iconUrl,
      type: w.currency.type,
      accountType: w.accountType,
      balance: w.balance,
      locked: w.locked,
      total: w.balance + w.locked,
      priceUsd: w.currency.priceUsd,
      valueUsd: (w.balance + w.locked) * w.currency.priceUsd,
    }));

    const totalUsd = enriched.reduce((sum, w) => sum + w.valueUsd, 0);

    return ok(res, { wallets: enriched, totalUsd });
  }),
);

// Wallets grouped by account type, e.g. for the AssetsManagement page tabs
router.get(
  "/by-account",
  asyncHandler(async (req, res) => {
    const wallets = await prisma.wallet.findMany({
      where: { userId: req.userId },
      include: { currency: true },
      orderBy: [{ accountType: "asc" }, { currency: { sortOrder: "asc" } }],
    });
    const grouped: Record<string, any[]> = { SPOT: [], FUTURES: [], EARN: [], FUNDING: [] };
    for (const w of wallets) {
      grouped[w.accountType] = grouped[w.accountType] || [];
      grouped[w.accountType].push({
        symbol: w.currency.symbol,
        name: w.currency.name,
        iconUrl: w.currency.iconUrl,
        balance: w.balance,
        locked: w.locked,
        priceUsd: w.currency.priceUsd,
        valueUsd: (w.balance + w.locked) * w.currency.priceUsd,
      });
    }
    return ok(res, grouped);
  }),
);

// Single wallet by symbol & account
router.get(
  "/:symbol",
  asyncHandler(async (req, res) => {
    const wallet = await prisma.wallet.findFirst({
      where: {
        userId: req.userId,
        currency: { symbol: req.params.symbol.toUpperCase() },
        accountType: (req.query.account as any) || "SPOT",
      },
      include: { currency: true },
    });
    return ok(res, wallet);
  }),
);

export default router;
