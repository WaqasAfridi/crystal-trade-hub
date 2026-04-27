// Lightweight UI primitives — Tailwind-styled, no shadcn dependency.
import React, { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { X, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

// ── Button ──────────────────────────────────────────────────────────────────
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg";

export const Button = React.forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant; size?: ButtonSize; loading?: boolean;
}>(({ variant = "primary", size = "md", loading, className, children, disabled, ...props }, ref) => {
  const variants: Record<ButtonVariant, string> = {
    primary:   "bg-white text-black hover:bg-white/90",
    secondary: "border border-border bg-elevated hover:bg-elevated/70 text-text",
    ghost:     "hover:bg-elevated text-text",
    danger:    "bg-red-500 text-white hover:bg-red-600",
    success:   "bg-accent text-black hover:bg-accent/90",
  };
  const sizes: Record<ButtonSize, string> = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant], sizes[size], className,
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
});
Button.displayName = "Button";

// ── Card ───────────────────────────────────────────────────────────────────
export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("bg-surface border border-border rounded-xl", className)} {...props}>{children}</div>
);

export const CardHeader = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("px-6 py-4 border-b border-border", className)}>{children}</div>
);

export const CardTitle = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <h3 className={cn("text-base font-semibold", className)}>{children}</h3>
);

export const CardBody = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("p-6", className)}>{children}</div>
);

// ── Input / Textarea / Select ──────────────────────────────────────────────
export const Input = React.forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-md bg-elevated border border-border px-3 text-sm",
        "placeholder:text-muted focus:outline-none focus:border-white/30",
        "disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[80px] w-full rounded-md bg-elevated border border-border px-3 py-2 text-sm",
        "placeholder:text-muted focus:outline-none focus:border-white/30",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-10 rounded-md bg-elevated border border-border px-3 text-sm",
        "focus:outline-none focus:border-white/30",
        className,
      )}
      {...props}
    >{children}</select>
  ),
);
Select.displayName = "Select";

export const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <label className={cn("text-xs text-muted block mb-1.5", className)}>{children}</label>
);

// ── Badge (for status pills) ───────────────────────────────────────────────
type BadgeTone = "default" | "success" | "warning" | "danger" | "info" | "muted";
export const Badge = ({ tone = "default", children }: { tone?: BadgeTone; children: React.ReactNode }) => {
  const tones: Record<BadgeTone, string> = {
    default: "bg-elevated text-text border-border",
    success: "bg-green-500/15 text-green-400 border-green-500/30",
    warning: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    danger:  "bg-red-500/15 text-red-400 border-red-500/30",
    info:    "bg-blue-500/15 text-blue-400 border-blue-500/30",
    muted:   "bg-white/5 text-muted border-border",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs border font-medium", tones[tone])}>
      {children}
    </span>
  );
};

// Status -> tone map used by transactions/KYC tables
export const statusTone = (status: string): BadgeTone => {
  switch (status) {
    case "COMPLETED":
    case "APPROVED":
    case "ACTIVE":
    case "FILLED":
    case "DRAWN":
      return "success";
    case "PENDING":
    case "PROCESSING":
    case "PARTIAL":
    case "OPEN":
      return "warning";
    case "REJECTED":
    case "CANCELLED":
    case "FAILED":
    case "BANNED":
    case "SUSPENDED":
    case "DANGER":
      return "danger";
    case "INFO":
    case "UPCOMING":
    case "LIVE":
      return "info";
    default:
      return "default";
  }
};

// ── Table ───────────────────────────────────────────────────────────────────
export const Table = ({ children }: { children: React.ReactNode }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">{children}</table>
  </div>
);

export const Th = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <th className={cn("text-left text-xs font-medium text-muted uppercase tracking-wide px-4 py-3 border-b border-border", className)}>
    {children}
  </th>
);

export const Td = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <td className={cn("px-4 py-3 border-b border-border/50", className)}>{children}</td>
);

// ── Modal / Dialog ──────────────────────────────────────────────────────────
export const Modal = ({
  open, onClose, title, children, footer, size = "md",
}: {
  open: boolean; onClose: () => void;
  title?: string; children: React.ReactNode; footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) => {
  if (!open) return null;
  const sizes = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl", xl: "max-w-4xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className={cn("bg-surface border border-border rounded-xl w-full shadow-2xl", sizes[size])}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-base font-semibold">{title}</h2>
            <button onClick={onClose} className="text-muted hover:text-text"><X className="w-4 h-4" /></button>
          </div>
        )}
        <div className="p-6">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-border flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};

// ── Loading / Empty states ──────────────────────────────────────────────────
export const Loading = ({ label = "Loading…" }: { label?: string }) => (
  <div className="flex items-center justify-center gap-2 py-12 text-muted">
    <Loader2 className="w-4 h-4 animate-spin" />
    <span className="text-sm">{label}</span>
  </div>
);

export const EmptyState = ({ label = "No data" }: { label?: string }) => (
  <div className="text-center py-12 text-muted text-sm">{label}</div>
);

// ── Stat card (used on dashboard) ───────────────────────────────────────────
export const StatCard = ({
  label, value, hint, accent,
}: { label: string; value: React.ReactNode; hint?: string; accent?: string }) => (
  <Card>
    <CardBody>
      <div className="text-xs text-muted">{label}</div>
      <div className={cn("mt-2 text-2xl font-bold", accent)}>{value}</div>
      {hint && <div className="text-xs text-muted mt-1">{hint}</div>}
    </CardBody>
  </Card>
);
