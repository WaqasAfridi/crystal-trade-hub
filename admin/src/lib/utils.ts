// Tiny class-name combiner (mimics shadcn/ui's cn helper)
import clsx, { ClassValue } from "clsx";
export const cn = (...args: ClassValue[]) => clsx(...args);

// Format helpers
export const fmtNumber = (n: number, decimals = 2) =>
  Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

export const fmtUsd = (n: number) => `$${fmtNumber(n, 2)}`;

export const fmtDate = (d: string | Date | null | undefined) => {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
};

export const fmtDateOnly = (d: string | Date | null | undefined) => {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString();
};

export const truncate = (s: string, n = 8) =>
  s ? (s.length > n * 2 + 3 ? `${s.slice(0, n)}…${s.slice(-n)}` : s) : "—";
