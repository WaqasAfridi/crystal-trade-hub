// ─────────────────────────────────────────────────────────────────────────────
//  Enivex API client
//  Reads VITE_API_URL from .env (falls back to http://localhost:4000/api)
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL =
  (import.meta as unknown as { env: Record<string, string> }).env
    .VITE_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let json: { data?: T; message?: string; error?: string } = {};
  try {
    json = await res.json();
  } catch {
    /* non-JSON response */
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      json.message ?? json.error ?? "Request failed",
    );
  }

  return (json.data ?? json) as T;
}

export const api = {
  get: <T = unknown>(path: string, token?: string | null) =>
    request<T>("GET", path, undefined, token),
  post: <T = unknown>(path: string, body: unknown, token?: string | null) =>
    request<T>("POST", path, body, token),
  put: <T = unknown>(path: string, body: unknown, token?: string | null) =>
    request<T>("PUT", path, body, token),
  patch: <T = unknown>(path: string, body: unknown, token?: string | null) =>
    request<T>("PATCH", path, body, token),
  delete: <T = unknown>(path: string, token?: string | null) =>
    request<T>("DELETE", path, undefined, token),
};
