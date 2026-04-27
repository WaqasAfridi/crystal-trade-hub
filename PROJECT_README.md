# Crystal Trade Hub — Full-Stack Project

```
crystal-trade-hub/
├── src/                    ← User-facing frontend (already existed; React + Vite)
├── backend/                ← API + database  (NEW — Node + Express + Prisma)
├── admin/                  ← Admin panel    (NEW — React + Vite)
├── FRONTEND_INTEGRATION.md ← How to wire src/ to the backend
└── README.md               ← This file
```

## Quick start

Three terminals, three commands.

### 1. Backend (port 4000)

```
cd backend
npm install
npm run setup        # generates Prisma client, runs migrations, seeds data
npm run dev
```

### 2. Admin panel (port 5174)

```
cd admin
npm install
npm run dev
```

Open http://localhost:5174 — login with `admin / Admin@12345`.

### 3. User frontend (port 5173 or 8080 — whatever your existing setup uses)

```
npm install
npm run dev
```

## What you get

- **Backend** — REST API, SQLite database, JWT auth (separate user vs admin
  tokens), bcrypt-hashed passwords, withdraw passwords, KYC file uploads, safe
  wallet credit/debit/lock helpers, atomic transactions. 27 tables covering
  users, KYC, wallets, deposits/withdrawals/transfers/conversions, spot/futures
  trading, buy-now, ICO, earn, finance, lottery, rewards, referrals,
  notifications, announcements, support tickets, admin users with roles, audit
  log, and key/value site settings.
- **Admin Panel** — 21 pages: dashboard with charts, user list and detail with
  balance adjustments, KYC review queue with image preview, deposit/withdrawal
  approval flows, buy-order confirmation, currency CRUD, deposit address CRUD,
  ICO/Earn/Finance product CRUD, lottery management with auto-draw, public
  announcements, broadcast notifications, support ticket replies, branding +
  fee + referral % settings, admin user management with 4 role levels, full
  audit log of every admin action.
- **Integration guide** — `FRONTEND_INTEGRATION.md` lists every page in your
  existing `src/` and shows the exact endpoint to call.

## Default credentials

- Admin: `admin` / `Admin@12345` (change immediately!)
- The user frontend has no users — register one through the API or your
  existing Register page after wiring it up per `FRONTEND_INTEGRATION.md`.

## Production checklist

- Change all secrets in `backend/.env` (`JWT_SECRET`, `JWT_ADMIN_SECRET`,
  `SEED_ADMIN_PASSWORD`).
- Switch from SQLite to PostgreSQL or MySQL (see `backend/README.md` § 4).
- Set `NODE_ENV=production` and the real public URLs in `CORS_ORIGINS`.
- Put `/uploads/*` (KYC files) behind authenticated signed URLs — they're
  sensitive PII.
- Run everything behind HTTPS (nginx, Caddy, or a managed PaaS).
- Plug in a real payment gateway for the BuyOrder confirm step.
- Plug in a blockchain watcher to auto-confirm Deposits and broadcast Withdrawals
  on-chain (right now they're admin-confirmed).
- Plug in email/SMS for verification codes — the current register/bind endpoints
  auto-mark contacts as verified for development convenience.

## Tech stack

| Layer        | Stack                                                              |
|--------------|--------------------------------------------------------------------|
| User UI      | React 18, Vite, TypeScript, Tailwind, shadcn/ui  (your existing)   |
| Admin UI     | React 18, Vite, TypeScript, Tailwind, react-query, recharts, zustand |
| Backend      | Node 18+, Express 4, TypeScript, Prisma ORM                        |
| Database     | SQLite (default) — swap to PostgreSQL or MySQL with one line       |
| Auth         | JWT (separate user/admin secrets), bcrypt                          |
| Validation   | zod                                                                 |
| File uploads | multer (KYC images stored in `backend/uploads/`)                   |

## What this project doesn't do (yet)

These are real-world integrations rather than code that can be written without
external accounts/services:

- Real on-chain blockchain transactions (deposits and withdrawals are
  admin-confirmed; plug in a watcher service like blockcypher / your own node).
- Real spot order matching engine (market orders execute instantly using the
  admin-managed `priceUsd`; limit orders sit `OPEN` until cancelled).
- Real futures liquidation engine (futures positions accept a `pnl` value at
  close time).
- Email / SMS / TOTP 2FA delivery (the schema and toggles are in place; plug in
  your provider — SendGrid, Twilio, etc.).
- Real fiat payment gateway for BuyNow (orders sit `PENDING` until an admin
  confirms — wire Stripe/Adyen/etc. into the buy-order confirm endpoint).

These are intentional boundaries: everything you actually need to *operate* the
platform — accounts, balances, KYC, deposits, withdrawals, products, content,
admin oversight — is fully implemented.
