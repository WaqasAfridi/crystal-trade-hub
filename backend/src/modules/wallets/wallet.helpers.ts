// Helpers for safe wallet credit/debit (use inside Prisma transactions).
// Use these from any module that touches balances (deposits, withdrawals, transfers, etc.)

import type { Prisma } from "@prisma/client";
import { badRequest, notFound } from "../../utils/errors";

type Tx = Prisma.TransactionClient;
type Account = "SPOT" | "FUTURES" | "EARN" | "FUNDING";

// Find or create a wallet by (userId, currencySymbol, accountType)
export const ensureWallet = async (
  tx: Tx,
  userId: string,
  currencySymbol: string,
  accountType: Account = "SPOT",
) => {
  const currency = await tx.currency.findUnique({ where: { symbol: currencySymbol } });
  if (!currency) throw notFound(`Currency ${currencySymbol} not supported`);

  const existing = await tx.wallet.findUnique({
    where: { userId_currencyId_accountType: { userId, currencyId: currency.id, accountType } },
  });
  if (existing) return existing;

  return tx.wallet.create({
    data: { userId, currencyId: currency.id, accountType },
  });
};

export const credit = async (
  tx: Tx,
  userId: string,
  currencySymbol: string,
  amount: number,
  accountType: Account = "SPOT",
) => {
  if (amount <= 0) throw badRequest("Amount must be > 0");
  const w = await ensureWallet(tx, userId, currencySymbol, accountType);
  return tx.wallet.update({
    where: { id: w.id },
    data: { balance: { increment: amount } },
  });
};

export const debit = async (
  tx: Tx,
  userId: string,
  currencySymbol: string,
  amount: number,
  accountType: Account = "SPOT",
) => {
  if (amount <= 0) throw badRequest("Amount must be > 0");
  const w = await ensureWallet(tx, userId, currencySymbol, accountType);
  if (w.balance < amount) throw badRequest("Insufficient balance");
  return tx.wallet.update({
    where: { id: w.id },
    data: { balance: { decrement: amount } },
  });
};

export const lock = async (
  tx: Tx,
  userId: string,
  currencySymbol: string,
  amount: number,
  accountType: Account = "SPOT",
) => {
  const w = await ensureWallet(tx, userId, currencySymbol, accountType);
  if (w.balance < amount) throw badRequest("Insufficient balance");
  return tx.wallet.update({
    where: { id: w.id },
    data: { balance: { decrement: amount }, locked: { increment: amount } },
  });
};

export const unlock = async (
  tx: Tx,
  userId: string,
  currencySymbol: string,
  amount: number,
  accountType: Account = "SPOT",
) => {
  const w = await ensureWallet(tx, userId, currencySymbol, accountType);
  if (w.locked < amount) throw badRequest("Insufficient locked balance");
  return tx.wallet.update({
    where: { id: w.id },
    data: { balance: { increment: amount }, locked: { decrement: amount } },
  });
};

export const consumeLocked = async (
  tx: Tx,
  userId: string,
  currencySymbol: string,
  amount: number,
  accountType: Account = "SPOT",
) => {
  const w = await ensureWallet(tx, userId, currencySymbol, accountType);
  if (w.locked < amount) throw badRequest("Insufficient locked balance");
  return tx.wallet.update({
    where: { id: w.id },
    data: { locked: { decrement: amount } },
  });
};
