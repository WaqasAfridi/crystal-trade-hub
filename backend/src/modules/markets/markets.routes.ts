import { Router } from "express";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/response";

const router = Router();

// List supported currencies (used everywhere — Deposit, Withdraw, Convert, etc.)
router.get(
  "/currencies",
  asyncHandler(async (_req, res) => {
    const currencies = await prisma.currency.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true, symbol: true, name: true, type: true, iconUrl: true,
        decimals: true, priceUsd: true,
        depositEnabled: true, withdrawEnabled: true, tradeEnabled: true,
        minWithdraw: true, maxWithdraw: true, withdrawFee: true, withdrawFeePct: true,
        networks: true,
      },
    });
    return ok(res, currencies.map((c) => ({
      ...c,
      networks: tryParse(c.networks, []),
    })));
  }),
);

// Live market snapshot — proxies CoinGecko so the frontend doesn't get rate-limited
router.get(
  "/coingecko/markets",
  asyncHandler(async (req, res) => {
    const ids = (req.query.ids as string) || "bitcoin,ethereum,binancecoin,ripple,solana,litecoin";
    const vs = (req.query.vs as string) || "usd";
    const sparkline = (req.query.sparkline as string) || "true";
    const change = (req.query.price_change_percentage as string) || "24h";
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vs}&ids=${encodeURIComponent(
      ids,
    )}&sparkline=${sparkline}&price_change_percentage=${change}`;

    try {
      const r = await fetch(url);
      if (!r.ok) return ok(res, []);
      const data = await r.json();
      return ok(res, data);
    } catch {
      return ok(res, []);
    }
  }),
);

const tryParse = <T>(s: string, fallback: T): T => {
  try { return JSON.parse(s) as T; } catch { return fallback; }
};

export default router;
