import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

// Attach admin token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap { success, data } envelope so callers just get .data
api.interceptors.response.use(
  (res) => {
    if (res.data && typeof res.data === "object" && "data" in res.data) {
      return { ...res, data: (res.data as any).data };
    }
    return res;
  },
  (error: AxiosError<any>) => {
    const msg = error.response?.data?.message || error.message || "Request failed";
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    toast.error(msg);
    return Promise.reject(error);
  },
);

export const FILE_BASE = API_URL; // for KYC images served at /uploads/...
