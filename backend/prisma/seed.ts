/**
 * Database seed — run with:  npm run db:seed
 *
 * Safe to re-run — uses upsert throughout.
 * Creates:
 *  - SUPER_ADMIN account
 *  - All 10 currencies
 *  - All 10 real deposit addresses (with dynamic QR via api.qrserver.com)
 *  - Sample EARN, FINANCE, ICO products
 *  - Default site settings
 *  - Welcome announcement
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

// ── Generates a free QR code URL from any wallet address ──────────────
const qr = (address: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}`;

// ── Currencies ────────────────────────────────────────────────────────
const CURRENCIES = [
  { symbol: "USDT", name: "Tether",   iconUrl: "https://cryptologos.cc/logos/tether-usdt-logo.png",   decimals: 6, priceUsd: 1.0,    networks: ["TRC20","ERC20","BEP20"], minWithdraw: 10,    withdrawFee: 1,      sortOrder: 1 },
  { symbol: "BTC",  name: "Bitcoin",  iconUrl: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",    decimals: 8, priceUsd: 65000,  networks: ["BTC","BEP20"],           minWithdraw: 0.001, withdrawFee: 0.0005, sortOrder: 2 },
  { symbol: "ETH",  name: "Ethereum", iconUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png",   decimals: 8, priceUsd: 3500,   networks: ["ERC20","BEP20"],          minWithdraw: 0.01,  withdrawFee: 0.005,  sortOrder: 3 },
  { symbol: "BNB",  name: "BNB",      iconUrl: "https://cryptologos.cc/logos/bnb-bnb-logo.png",        decimals: 8, priceUsd: 600,    networks: ["BEP20","BEP2"],           minWithdraw: 0.05,  withdrawFee: 0.005,  sortOrder: 4 },
  { symbol: "SOL",  name: "Solana",   iconUrl: "https://cryptologos.cc/logos/solana-sol-logo.png",     decimals: 8, priceUsd: 150,    networks: ["SOL"],                    minWithdraw: 0.1,   withdrawFee: 0.01,   sortOrder: 5 },
  { symbol: "XRP",  name: "XRP",      iconUrl: "https://cryptologos.cc/logos/xrp-xrp-logo.png",       decimals: 6, priceUsd: 0.55,   networks: ["XRP"],                    minWithdraw: 5,     withdrawFee: 0.25,   sortOrder: 6 },
  { symbol: "LTC",  name: "Litecoin", iconUrl: "https://cryptologos.cc/logos/litecoin-ltc-logo.png",   decimals: 8, priceUsd: 90,     networks: ["LTC"],                    minWithdraw: 0.1,   withdrawFee: 0.001,  sortOrder: 7 },
  { symbol: "NEO",  name: "NEO",      iconUrl: "https://cryptologos.cc/logos/neo-neo-logo.png",        decimals: 8, priceUsd: 12,     networks: ["NEO3","BEP20"],           minWithdraw: 1,     withdrawFee: 0,      sortOrder: 8 },
  { symbol: "QTUM", name: "Qtum",     iconUrl: "https://cryptologos.cc/logos/qtum-qtum-logo.png",      decimals: 8, priceUsd: 3.2,    networks: ["QTUM"],                   minWithdraw: 1,     withdrawFee: 0.01,   sortOrder: 9 },
  { symbol: "IOTA", name: "IOTA",     iconUrl: "https://cryptologos.cc/logos/iota-miota-logo.png",     decimals: 6, priceUsd: 0.18,   networks: ["IOTA","BEP20"],           minWithdraw: 10,    withdrawFee: 0.5,    sortOrder: 10 },
];

// ── Real deposit addresses from local database ────────────────────────
// QR codes are generated dynamically via api.qrserver.com (free, no API key)
const DEPOSIT_ADDRESSES = [
  { symbol: "BTC",  network: "BTC",                    address: "bc1qpyjvrve6vs0nersyz8qplc5m5rmc990g00yuuk" },
  { symbol: "ETH",  network: "ERC20",                  address: "0x3Ac3aD0a217ff42A5ACd0C7284C631690Efec190" },
  { symbol: "USDT", network: "ERC20",                  address: "0x3Ac3aD0a217ff42A5ACd0C7284C631690Efec190" },
  { symbol: "BNB",  network: "BEP20",                  address: "0x3Ac3aD0a217ff42A5ACd0C7284C631690Efec190" },
  { symbol: "SOL",  network: "Solana",                 address: "4h9q4z4CR973nGHqLCns62korm9JrGVADq15i7L2Wady" },
  { symbol: "XRP",  network: "XRP Ledger",             address: "rrhk2pqZ7R8zG7ngD5r5pDqq5dYPhRRvTV" },
  { symbol: "LTC",  network: "Litecoin",               address: "ltc1q292rtqh4nmy3n5ajyz686k7euqha4wqxdlzkf7" },
  { symbol: "NEO",  network: "BEP20",                  address: "0x3Ac3aD0a217ff42A5ACd0C7284C631690Efec190" },
  { symbol: "QTUM", network: "Qtum",                   address: "QSRDcvQyQKqDsUKHbDDRAqcgaJ3auQ8Yb1" },
  { symbol: "IOTA", network: "BNB Smart Chain (BEP20)", address: "0x3Ac3aD0a217ff42A5ACd0C7284C631690Efec190" },
];

// ── Default settings ──────────────────────────────────────────────────
const SETTINGS: Array<[string, any]> = [
  ["site.name",               "Crystal Trade Hub"],
  ["site.tagline",            "Start a new trading journey"],
  ["site.logoUrl",            "/logo.png"],
  ["site.faviconUrl",         "/favicon.ico"],
  ["site.supportEmail",       "support@crystaltradehub.local"],
  ["site.maintenanceMode",    false],
  ["site.signupEnabled",      true],
  ["site.kycRequired",        true],
  ["site.referral.tier1Pct",  30],
  ["site.referral.tier2Pct",  5],
  ["site.signupBonusUsdt",    0],
  ["site.tradingFeePct",      0.1],
  ["site.withdrawalFeeMinUsd",1],
  ["site.tickerCoins",        ["BTC","ETH","USDT","BNB","SOL","XRP"]],
  ["site.featuredCoins",      ["BTC","ETH","BNB","SOL"]],
];

// ─────────────────────────────────────────────────────────────────────
async function main() {

  // ── Admin ──────────────────────────────────────────────────────────
  console.log("→ Seeding admin…");
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin@12345";
  await prisma.admin.upsert({
    where:  { username: process.env.SEED_ADMIN_USERNAME || "admin" },
    update: {},
    create: {
      username:     process.env.SEED_ADMIN_USERNAME || "admin",
      email:        process.env.SEED_ADMIN_EMAIL    || "admin@crystaltradehub.local",
      fullName:     "Super Administrator",
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role:         "SUPER_ADMIN",
      isActive:     true,
    },
  });

  // ── Currencies ─────────────────────────────────────────────────────
  console.log("→ Seeding currencies…");
  for (const c of CURRENCIES) {
    await prisma.currency.upsert({
      where:  { symbol: c.symbol },
      update: { ...c, networks: JSON.stringify(c.networks) },
      create: { ...c, networks: JSON.stringify(c.networks) },
    });
  }

  // ── Deposit addresses ──────────────────────────────────────────────
  console.log("→ Seeding deposit addresses…");
  for (const d of DEPOSIT_ADDRESSES) {
    const currency = await prisma.currency.findUnique({ where: { symbol: d.symbol } });
    if (!currency) { console.warn(`  ⚠  Currency ${d.symbol} not found, skipping`); continue; }
    await prisma.platformDepositAddress.upsert({
      where:  { currencyId_network: { currencyId: currency.id, network: d.network } },
      update: { address: d.address, qrUrl: qr(d.address), isActive: true },
      create: { currencyId: currency.id, network: d.network, address: d.address, qrUrl: qr(d.address), isActive: true },
    });
    console.log(`  ✓  ${d.symbol} / ${d.network}`);
  }

  // ── Earn products ──────────────────────────────────────────────────
  console.log("→ Seeding earn products…");
  await prisma.earnProduct.upsert({
    where:  { id: "seed-earn-usdt-flex" },
    update: {},
    create: { id: "seed-earn-usdt-flex", name: "USDT Flexible", currencySymbol: "USDT", apr: 5.5, durationDays: 0,  minAmount: 10,    description: "Earn rewards on idle USDT, redeem anytime." },
  });
  await prisma.earnProduct.upsert({
    where:  { id: "seed-earn-btc-30" },
    update: {},
    create: { id: "seed-earn-btc-30",   name: "BTC 30-Day",    currencySymbol: "BTC",  apr: 8.0, durationDays: 30, minAmount: 0.001, description: "Lock BTC for 30 days for higher APR." },
  });

  // ── Finance product ────────────────────────────────────────────────
  console.log("→ Seeding finance products…");
  await prisma.financeProduct.upsert({
    where:  { id: "seed-fin-usdt-savings" },
    update: {},
    create: { id: "seed-fin-usdt-savings", name: "USDT Savings", type: "SAVINGS", currencySymbol: "USDT", rate: 6.5, durationDays: 90, minAmount: 100, description: "Fixed-rate USDT savings, 90-day term." },
  });

  // ── ICO project ────────────────────────────────────────────────────
  console.log("→ Seeding ICO project…");
  await prisma.icoProject.upsert({
    where:  { id: "seed-ico-cthx" },
    update: {},
    create: {
      id:            "seed-ico-cthx",
      name:          "CTHub Token",
      symbol:        "CTHX",
      description:   "Native utility token of Crystal Trade Hub.",
      totalSupply:   1_000_000,
      pricePerToken: 0.05,
      minBuy:        50,
      maxBuy:        5000,
      startAt:       new Date(),
      endAt:         new Date(Date.now() + 30 * 86400 * 1000),
      status:        "LIVE",
    },
  });

  // ── Settings ───────────────────────────────────────────────────────
  console.log("→ Seeding settings…");
  for (const [k, v] of SETTINGS) {
    await prisma.setting.upsert({
      where:  { key: k },
      update: { value: JSON.stringify(v) },
      create: { key: k, value: JSON.stringify(v) },
    });
  }

  // ── Announcement ───────────────────────────────────────────────────
  console.log("→ Seeding announcement…");
  await prisma.announcement.upsert({
    where:  { id: "seed-announce-welcome" },
    update: {},
    create: {
      id:       "seed-announce-welcome",
      title:    "Welcome to Crystal Trade Hub",
      body:     "We're live! Complete your KYC to enable withdrawals and unlock all features.",
      category: "GENERAL",
      isPinned: true,
    },
  });

  console.log("\n✅  Seed complete");
  console.log("─────────────────────────────────────────────────");
  console.log(`Admin  →  username: ${process.env.SEED_ADMIN_USERNAME || "admin"}`);
  console.log(`          password: ${adminPassword}`);
  console.log(`          email:    ${process.env.SEED_ADMIN_EMAIL || "admin@crystaltradehub.local"}`);
  console.log("(change the password immediately in the admin panel)");
}

main()
  .catch((e) => { console.error("Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
