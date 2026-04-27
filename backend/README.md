# Crystal Trade Hub — Backend

The API server + database for the Crystal Trade Hub crypto trading platform.

**Stack:** Node.js · Express · TypeScript · Prisma ORM · SQLite (default) / PostgreSQL / MySQL · JWT · bcrypt · zod · multer

---

## 1. Prerequisites

- Node.js 18+ (https://nodejs.org/)
- That's it. SQLite is bundled — no separate database to install.

## 2. First-time setup

Open a terminal in the `backend/` folder and run:

```
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

Or all in one shot:

```
npm run setup
```

When seeding finishes, the default admin credentials are printed.
Default values (from `.env`):

```
username: admin
password: Admin@12345
```

Change them in `.env` BEFORE running the seed (or change them later from the admin panel).

## 3. Running

```
npm run dev
```

The server starts on http://localhost:4000 with hot reload.

Verify with: http://localhost:4000/health

To open Prisma Studio (visual DB browser):

```
npm run prisma:studio
```

## 4. Switching database

By default we use SQLite (file: `prisma/dev.db`). To switch to PostgreSQL:

1. Edit `prisma/schema.prisma`:
   ```
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Edit `.env`:
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/crystal_trade_hub"
   ```
3. Re-run: `npx prisma migrate dev --name init` then `npm run db:seed`

## 5. API surface (high level)

### Public
- GET  /api/markets/currencies
- GET  /api/markets/coingecko/markets
- GET  /api/settings
- GET  /api/notifications/announcements
- GET  /api/ico/projects

### User auth
- POST /api/auth/register · POST /api/auth/login
- GET  /api/auth/me · POST /api/auth/change-password
- POST /api/auth/withdraw-password · POST /api/auth/logout

### User (Bearer token)
- /api/users/* · /api/kyc/* · /api/wallets/*
- /api/deposits/* · /api/withdrawals/* · /api/transfers/* · /api/conversions/*
- /api/trading/spot/* · /api/trading/futures/* · /api/trading/buy-now
- /api/ico/* · /api/earn/* · /api/finance/*
- /api/lottery/* · /api/rewards · /api/referrals
- /api/notifications/* · /api/support/*

### Admin (separate token from user)
- /api/admin/auth/*       — admin login + admin user mgmt + audit log
- /api/admin/dashboard/*  — dashboard counters + timeseries
- /api/admin/users/*      — list, detail, edit, adjust balance, KYC review
- /api/admin/finance-ops/* — approve deposits/withdrawals/buy orders
- /api/admin/content/*    — currencies, products (ico/earn/finance),
                            lottery, announcements, settings, tickets,
                            broadcast notifications

See `src/routes/index.ts` for the complete list.

### Response envelope
```
{ "success": true, "message": "OK", "data": {...} }
```

Errors:
```
{ "success": false, "message": "...", "code": "VALIDATION", "details": [...] }
```

## 6. Production checklist

- Change JWT secrets and default admin password
- Switch DATABASE_URL to managed PostgreSQL / MySQL
- Set NODE_ENV=production and real CORS_ORIGINS
- Place /uploads/* behind authenticated signed URLs
- Add HTTPS (nginx / Caddy / managed PaaS)
- Plug in payment gateway for BuyOrder
- Plug in blockchain watcher for Deposit / Withdrawal
- Plug in email/SMS for verification codes
