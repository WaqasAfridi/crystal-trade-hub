import { prisma } from "../../config/prisma";

// Get a setting value (parses JSON), with default fallback
export const getSetting = async <T = any>(key: string, fallback: T): Promise<T> => {
  const row = await prisma.setting.findUnique({ where: { key } });
  if (!row) return fallback;
  try { return JSON.parse(row.value) as T; } catch { return fallback; }
};

export const setSetting = async (key: string, value: any) => {
  const v = typeof value === "string" ? value : JSON.stringify(value);
  return prisma.setting.upsert({
    where: { key },
    update: { value: v },
    create: { key, value: v },
  });
};

// All public-readable settings keys (anything sensitive should NOT be added here)
export const PUBLIC_SETTING_KEYS = [
  "site.name",
  "site.tagline",
  "site.logoUrl",
  "site.faviconUrl",
  "site.supportEmail",
  "site.maintenanceMode",
  "site.signupEnabled",
  "site.kycRequired",
  "site.referral.tier1Pct",
  "site.referral.tier2Pct",
  "site.signupBonusUsdt",
  "site.tradingFeePct",
  "site.withdrawalFeeMinUsd",
  "site.tickerCoins",
  "site.featuredCoins",
];
