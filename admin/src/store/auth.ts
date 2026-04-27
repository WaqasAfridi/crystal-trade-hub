import { create } from "zustand";

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MODERATOR" | "SUPPORT";
}

interface AuthState {
  token: string | null;
  user: AdminUser | null;
  setAuth: (token: string, user: AdminUser) => void;
  setUser: (user: AdminUser) => void;
  logout: () => void;
}

const loadToken = () => localStorage.getItem("admin_token");
const loadUser = (): AdminUser | null => {
  try {
    const raw = localStorage.getItem("admin_user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export const useAuth = create<AuthState>((set) => ({
  token: loadToken(),
  user: loadUser(),
  setAuth: (token, user) => {
    localStorage.setItem("admin_token", token);
    localStorage.setItem("admin_user", JSON.stringify(user));
    set({ token, user });
  },
  setUser: (user) => {
    localStorage.setItem("admin_user", JSON.stringify(user));
    set({ user });
  },
  logout: () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    set({ token: null, user: null });
  },
}));

// Role-based permission helper
export const can = (role: AdminUser["role"] | undefined, ...allowed: AdminUser["role"][]) =>
  !!role && allowed.includes(role);
