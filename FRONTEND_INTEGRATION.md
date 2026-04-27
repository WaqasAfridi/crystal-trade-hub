# Frontend Integration Guide

How to connect your existing `src/` (the user-facing site you already built) to
the new backend API. You won't need to rewrite any pages — just swap hardcoded
values for API calls.

---

## 1. Add the API client

Install axios and react-query:

```
cd C:\Users\Waqas Afridi\Desktop\crystal-trade-hub
npm install axios @tanstack/react-query
```

Create `src/lib/apiClient.ts`:

```ts
import axios from "axios";

const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("user_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => {
    if (res.data && typeof res.data === "object" && "data" in res.data) {
      return { ...res, data: (res.data as any).data };
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("user_token");
      localStorage.removeItem("user");
    }
    return Promise.reject(err);
  },
);
```

Add the env file `.env` at the project root:

```
VITE_API_URL=http://localhost:4000
```

## 2. Wrap the app with QueryClient

In `src/main.tsx` (or wherever you mount `<App />`):

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

## 3. Auth — replace your hardcoded login/register

### Login

```tsx
import { apiClient } from "@/lib/apiClient";

const handleLogin = async () => {
  const { data } = await apiClient.post("/auth/login", {
    identifier: emailOrPhone,
    password,
  });
  localStorage.setItem("user_token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  navigate("/");
};
```

### Register

```tsx
const { data } = await apiClient.post("/auth/register", {
  email,        // or phone
  password,
  inviteCode,   // optional
});
localStorage.setItem("user_token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));
```

### Get current user

```tsx
import { useQuery } from "@tanstack/react-query";

const useMe = () => useQuery({
  queryKey: ["me"],
  queryFn: async () => (await apiClient.get("/auth/me")).data,
  enabled: !!localStorage.getItem("user_token"),
});
```

### Protect routes

```tsx
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("user_token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};
```

## 4. Page-by-page mapping

| Existing page                          | Replace hardcoded data with                              |
|----------------------------------------|----------------------------------------------------------|
| `Login.tsx`                            | `POST /auth/login`                                        |
| `Register.tsx`                         | `POST /auth/register`                                     |
| `KYCVerification.tsx`                  | `POST /kyc/submit` (multipart/form-data)                  |
| `ProfilePage.tsx`                      | `GET /users/profile`, `PATCH /users/profile`              |
| `OverviewPage.tsx`                     | `GET /wallets`                                            |
| `AssetsManagement.tsx`                 | `GET /wallets/by-account`                                 |
| `Deposit.tsx`                          | `GET /deposits/addresses/:symbol`, `POST /deposits`        |
| `Recharge.tsx`                         | same as Deposit                                           |
| `Withdraw.tsx` / `WithdrawPage.tsx`    | `GET /markets/currencies`, `POST /withdrawals`            |
| `Transfer.tsx` / `TransferPage.tsx`    | `POST /transfers`, `GET /transfers`                        |
| `Conversion.tsx` / `ConvertPage.tsx`   | `POST /conversions/quote`, `POST /conversions`             |
| `SpotTrading.tsx`                      | `GET/POST /trading/spot/orders`, `GET /trading/spot/trades`|
| `BuyNow.tsx`                           | `POST /trading/buy-now`                                    |
| `Market.tsx`                           | `GET /markets/coingecko/markets` (already proxied)         |
| `ICO.tsx`                              | `GET /ico/projects`, `POST /ico/projects/:id/subscribe`    |
| `EarnGold.tsx`                         | `GET /earn/products`, `POST /earn/products/:id/stake`      |
| `Finance.tsx`                          | `GET /finance/products`                                    |
| `LotteryRecords.tsx` / `LotteryRecordsPage.tsx` | `GET /lottery/rounds`, `GET /lottery/my-entries` |
| `RewardsHubPage.tsx`                   | `GET /rewards/summary`, `GET /rewards`                     |
| `InvitePage.tsx`                       | `GET /referrals`                                           |
| `NotificationsPage.tsx`                | `GET /notifications`                                       |

## 5. Replace the existing CoinGecko hook

`src/hooks/useCryptoData.ts` — point it at the backend proxy:

```ts
const url = `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/markets/coingecko/markets?ids=bitcoin,ethereum,binancecoin,ripple,solana,litecoin&sparkline=true&price_change_percentage=24h`;
```

This avoids CoinGecko's strict rate limit on the browser.

## 6. KYC upload example

```tsx
const handleKycSubmit = async () => {
  const fd = new FormData();
  fd.append("country", country);
  fd.append("documentType", documentType);     // "ID" | "PASSPORT" | "DRIVER_LICENSE"
  fd.append("fullName", fullName);
  fd.append("dateOfBirth", dateOfBirth);
  fd.append("idNumber", idNumber);
  fd.append("front", frontFile);
  if (backFile) fd.append("back", backFile);
  if (selfieFile) fd.append("selfie", selfieFile);

  await apiClient.post("/kyc/submit", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
```

## 7. Public site settings (branding)

The backend exposes whitelisted settings publicly. Use these in your Header/Footer
to make the site name, logo, support email etc. configurable from admin without
a redeploy:

```tsx
const { data: settings } = useQuery({
  queryKey: ["public-settings"],
  queryFn: async () => (await apiClient.get("/settings")).data,
});

// settings["site.name"], settings["site.logoUrl"], settings["site.tickerCoins"], etc.
```

## 8. Logout

```ts
await apiClient.post("/auth/logout"); // optional; just clears server-side
localStorage.removeItem("user_token");
localStorage.removeItem("user");
window.location.href = "/login";
```

## 9. Order to do this in

1. Add the `apiClient` and wrap with `QueryClientProvider`.
2. Wire `Login.tsx` and `Register.tsx` first — without auth nothing else works.
3. Create the `RequireAuth` wrapper, protect the user-only pages.
4. Replace `OverviewPage` and `AssetsManagement` (most visible: balances).
5. Wire `Deposit` / `Withdraw` next (most user-impactful).
6. Then `KYCVerification` (gates withdrawals on the backend).
7. Then everything else as you reach each page.

Each page can be migrated independently — until you migrate it, it'll keep
working with hardcoded data. The backend is fully ready, so there's no order
constraint coming from the API side.

## 10. Common pitfalls

- **CORS errors** → backend `.env` must list your dev URL (e.g.,
  `http://localhost:5173`) in `CORS_ORIGINS`. The default `.env` already includes
  the Vite default ports (5173, 8080) and the admin panel (5174).
- **`401 Unauthorized` after refresh** → token is in `localStorage`. The
  interceptor in `apiClient.ts` already adds it automatically.
- **`KYC must be approved`** when withdrawing → expected. Submit + approve KYC
  from the admin panel first (or in dev, set `site.kycRequired=false` in Settings).
- **CoinGecko 429** → use the `/api/markets/coingecko/markets` proxy on the backend.
- **File uploads** → axios needs `Content-Type: multipart/form-data` AND a
  `FormData` body (not a plain object). See section 6.
