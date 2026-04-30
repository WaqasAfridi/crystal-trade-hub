import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { api, ApiError } from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email?: string | null;
  phone?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  vipLevel: number;
  inviteCode: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled?: boolean;
  country?: string | null;
  language?: string | null;
  status?: string;
  lastLoginAt?: string | null;
  kyc?: { status: string; fullName?: string; country?: string } | null;
}

export interface RegisterPayload {
  email?: string;
  phone?: string;
  username?: string;
  password: string;
  verificationCode?: string;   // required for email / phone tabs
  inviteCode?: string;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

interface RegisterResponse {
  token: string;
  user: AuthUser;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** Display name: email › phone › username › "User" */
  displayName: string;
  /** Short UID (last 6 chars of cuid for display) */
  shortId: string;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  /** Re-fetch user from /auth/me (e.g., after profile update) */
  refreshUser: () => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Context
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "enivex_token";

// ─────────────────────────────────────────────────────────────────────────────
//  Provider
// ─────────────────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY),
  );
  const [isLoading, setIsLoading] = useState(true);

  // Persist token to localStorage and state together
  const saveToken = useCallback((t: string) => {
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  }, []);

  const clearToken = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // ── Load user on mount ────────────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) return;
    try {
      const me = await api.get<AuthUser>("/auth/me", storedToken);
      setUser(me);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearToken();
      }
    }
  }, [clearToken]);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setIsLoading(false);
      return;
    }
    setToken(storedToken);
    api
      .get<AuthUser>("/auth/me", storedToken)
      .then(setUser)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
        }
      })
      .finally(() => setIsLoading(false));
  }, [clearToken]);

  // ── Auth actions ──────────────────────────────────────────────────────────
  const login = useCallback(
    async (identifier: string, password: string) => {
      const data = await api.post<LoginResponse>("/auth/login", {
        identifier,
        password,
      });
      saveToken(data.token);
      setUser(data.user);
    },
    [saveToken],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const data = await api.post<RegisterResponse>("/auth/register", payload);
      saveToken(data.token);
      setUser(data.user);
    },
    [saveToken],
  );

  const logout = useCallback(async () => {
    const currentToken = localStorage.getItem(TOKEN_KEY);
    if (currentToken) {
      try {
        await api.post("/auth/logout", {}, currentToken);
      } catch {
        /* ignore — clear client state regardless */
      }
    }
    clearToken();
  }, [clearToken]);

  // ── Derived helpers ───────────────────────────────────────────────────────
  const displayName =
    user?.email ?? user?.phone ?? user?.username ?? "User";

  // cuid looks like "clxxxxxxxxxx" — show last 6 chars as a short UID
  const shortId = user ? user.id.slice(-6).toUpperCase() : "";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        displayName,
        shortId,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Hook
// ─────────────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};
