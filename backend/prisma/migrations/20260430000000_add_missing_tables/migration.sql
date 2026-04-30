-- Migration: add_missing_tables
-- Adds VerificationCode, OptionsOrder, and missing columns that were omitted
-- from the initial migration but are present in schema.prisma.
-- All statements are idempotent (safe to run even if objects already exist).

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. VerificationCode  (required by /auth/send-code and /auth/register)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "VerificationCode" (
    "id"        TEXT         NOT NULL,
    "target"    TEXT         NOT NULL,
    "code"      TEXT         NOT NULL,
    "type"      TEXT         NOT NULL DEFAULT 'REGISTER',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used"      BOOLEAN      NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationCode_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "VerificationCode_target_type_idx" ON "VerificationCode"("target", "type");
CREATE INDEX IF NOT EXISTS "VerificationCode_expiresAt_idx"   ON "VerificationCode"("expiresAt");

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. OptionsOrder  (used by futures/options trading)
--    Table + index use IF NOT EXISTS; FK uses a DO block to skip if it
--    already exists (avoids the duplicate_object error seen previously).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "OptionsOrder" (
    "id"            TEXT             NOT NULL,
    "userId"        TEXT             NOT NULL,
    "pair"          TEXT             NOT NULL,
    "side"          TEXT             NOT NULL,
    "interval"      TEXT             NOT NULL,
    "profitRate"    DOUBLE PRECISION NOT NULL,
    "callThreshold" DOUBLE PRECISION NOT NULL,
    "amount"        DOUBLE PRECISION NOT NULL,
    "entryPrice"    DOUBLE PRECISION NOT NULL,
    "settlePrice"   DOUBLE PRECISION,
    "status"        TEXT             NOT NULL DEFAULT 'PENDING',
    "pnl"           DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expiresAt"     TIMESTAMP(3)     NOT NULL,
    "settledAt"     TIMESTAMP(3),
    "createdAt"     TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OptionsOrder_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "OptionsOrder_userId_idx" ON "OptionsOrder"("userId");

-- Add FK only if it does not already exist
DO $$ BEGIN
  ALTER TABLE "OptionsOrder"
    ADD CONSTRAINT "OptionsOrder_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. User.forceWin  (admin override column)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS "forceWin" BOOLEAN NOT NULL DEFAULT false;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Conversion.accountType  (which account the swap was done in)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "Conversion"
    ADD COLUMN IF NOT EXISTS "accountType" TEXT NOT NULL DEFAULT 'SPOT';
