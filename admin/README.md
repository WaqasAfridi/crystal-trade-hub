# Crystal Trade Hub — Admin Panel

A self-contained Vite + React + TypeScript app for administering the platform.
Talks to the backend API (`crystal-trade-hub/backend`).

## Setup

Make sure the backend is running first (`crystal-trade-hub/backend/`).

```
cd admin
npm install
npm run dev
```

Opens at **http://localhost:5174**.

## Login

Default super-admin (from backend seed):

```
username: admin
password: Admin@12345
```

Change immediately from the **Admin Users** page after logging in.

## Configuration

`admin/.env`:

```
VITE_API_URL=http://localhost:4000
```

Point this at your backend in production (e.g., `https://api.your-domain.com`).
The backend's `CORS_ORIGINS` must include the URL where the admin panel is served.

## Pages

| Path                  | What it does                                                |
|-----------------------|-------------------------------------------------------------|
| /                     | Dashboard with counters + 14-day activity chart             |
| /users                | All users — search, filter, paginate                        |
| /users/:id            | User detail: profile, KYC, wallets, history, balance adjust |
| /kyc                  | KYC review queue with approve/reject                        |
| /deposits             | Deposit list + approve/reject                               |
| /withdrawals          | Withdrawal list + approve/reject                            |
| /buy-orders           | Buy-now orders + confirm payment                            |
| /transactions         | Unified ledger (deposits/withdrawals/transfers/conv/trades) |
| /currencies           | CRUD coins/tokens, fees, networks, prices                   |
| /deposit-addresses    | Platform-controlled deposit addresses per coin/network      |
| /ico                  | Manage ICO projects                                         |
| /earn                 | Manage Earn (staking) products                              |
| /finance              | Manage Finance (savings/loan) products                      |
| /lottery              | Create rounds, draw winners                                 |
| /announcements        | Public bulletin / news                                      |
| /notifications        | Broadcast notifications to users                            |
| /tickets              | Support tickets list                                        |
| /tickets/:id          | Reply to a ticket                                           |
| /settings             | Branding, fees, referral %, maintenance mode, ticker coins  |
| /admins               | Manage admin users (SUPER_ADMIN only)                       |
| /audit-log            | Every admin action recorded                                 |

## Roles

The sidebar hides items the current admin's role can't access.

- **SUPER_ADMIN** — everything, including admin-user management
- **ADMIN** — everything except admin-user management
- **MODERATOR** — KYC review, deposit/withdrawal approval, ticket replies
- **SUPPORT** — tickets only (read-only elsewhere)

## Build for production

```
npm run build
```

Outputs static files in `admin/dist/`. Serve them behind any static host
(nginx, Caddy, Cloudflare Pages, Vercel, Netlify, S3 + CloudFront, etc.).
Set `VITE_API_URL` to your live API URL before building.
