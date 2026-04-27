import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api";

const registerTabs = ["Email", "Phone Number"] as const;
type RegisterTab = (typeof registerTabs)[number];

/* Password strength helper */
function getStrength(pw: string): { label: string; color: string; width: string } {
  if (pw.length === 0) return { label: "",        color: "transparent", width: "0%"   };
  if (pw.length < 6)   return { label: "Weak",    color: "#ef4444",     width: "25%"  };
  if (pw.length < 10)  return { label: "Fair",    color: "#f59e0b",     width: "50%"  };
  if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw))
                       return { label: "Good",    color: "#3b82f6",     width: "75%"  };
  return               { label: "Strong",  color: "#22c55e",     width: "100%" };
}

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate("/", { replace: true });
  }

  const [activeTab,       setActiveTab]       = useState<RegisterTab>("Email");
  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [isLoading,       setIsLoading]       = useState(false);
  const [formData,        setFormData]        = useState({
    identifier:      "",
    password:        "",
    confirmPassword: "",
    inviteCode:      "",
  });

  const strength = getStrength(formData.password);

  const update = (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { identifier, password, confirmPassword, inviteCode } = formData;

    // Validation
    if (!identifier.trim()) {
      toast.error(
        activeTab === "Email"
          ? "Please enter your email address."
          : "Please enter your phone number.",
      );
      return;
    }
    if (activeTab === "Email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const payload =
        activeTab === "Email"
          ? { email: identifier.trim().toLowerCase(), password, inviteCode: inviteCode.trim() || undefined }
          : { phone: identifier.trim(),              password, inviteCode: inviteCode.trim() || undefined };

      await register(payload);
      toast.success("Account created! Welcome to Enivex.");
      navigate("/");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          toast.error(
            activeTab === "Email"
              ? "This email is already registered."
              : "This phone number is already registered.",
          );
        } else if (err.status === 400) {
          toast.error(err.message || "Please check your details.");
        } else if (err.status === 429) {
          toast.error("Too many attempts. Please wait a few minutes.");
        } else {
          toast.error(err.message || "Registration failed. Please try again.");
        }
      } else {
        toast.error("Unable to connect to server. Is the backend running?");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left illustration ──────────────────────────────────── */}
      <div className="hidden lg:flex flex-1 bg-background items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width:  `${20 + (i % 5) * 18}px`,
                height: `${20 + (i % 5) * 18}px`,
                top:    `${(i * 19 + 7) % 90}%`,
                left:   `${(i * 11 + 5) % 85}%`,
                background:
                  i % 3 === 0
                    ? "rgba(232,121,160,0.07)"
                    : i % 3 === 1
                    ? "rgba(99,102,241,0.07)"
                    : "rgba(34,197,94,0.07)",
                transform: `rotate(${i * 22}deg)`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center px-12">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div
              className="flex items-center justify-center rounded"
              style={{
                width: "48px",
                height: "34px",
                background: "#1a1a1a",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>
                ENX
              </span>
            </div>
            <span className="text-2xl font-bold text-foreground">Enivex</span>
          </div>
          <h2 className="text-3xl font-light text-foreground mb-3">
            Join <span className="font-bold">Enivex</span> today
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Start trading with zero experience required
          </p>
          <div className="space-y-4 text-left">
            {[
              { icon: "🔐", title: "Bank-grade security",   desc: "Your assets protected 24/7" },
              { icon: "⚡", title: "Lightning fast trades",  desc: "Execute in milliseconds"    },
              { icon: "🌍", title: "Trade anything",         desc: "Crypto, Stocks, FX & more"  },
              { icon: "🎁", title: "Earn rewards",           desc: "Referral & loyalty bonuses" },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-card px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-foreground mb-2">Register</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-foreground hover:underline">
              Login
            </Link>
          </p>

          {/* Tabs */}
          <div className="flex gap-6 mb-6 border-b border-border">
            {registerTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setFormData((p) => ({ ...p, identifier: "" })); }}
                className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab
                    ? "text-foreground border-foreground"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identifier */}
            <input
              type={activeTab === "Email" ? "email" : "tel"}
              placeholder={
                activeTab === "Email"
                  ? "Enter your email"
                  : "Enter your phone number"
              }
              value={formData.identifier}
              onChange={update("identifier")}
              disabled={isLoading}
              autoComplete={activeTab === "Email" ? "email" : "tel"}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
            />

            {/* Password */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Set password (min. 6 characters)"
                  value={formData.password}
                  onChange={update("password")}
                  disabled={isLoading}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary pr-10 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength bar */}
              {formData.password.length > 0 && (
                <div className="mt-2">
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: strength.width, background: strength.color }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: strength.color }}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={update("confirmPassword")}
                disabled={isLoading}
                autoComplete="new-password"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary pr-10 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-xs text-red-500 -mt-2">Passwords do not match</p>
            )}

            {/* Invite code */}
            <input
              type="text"
              placeholder="Invite code (optional)"
              value={formData.inviteCode}
              onChange={update("inviteCode")}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
            />

            <p className="text-xs text-muted-foreground">
              By registering, you agree to our{" "}
              <Link to="/terms" className="font-semibold text-foreground hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="font-semibold text-foreground hover:underline">
                Privacy Policy
              </Link>
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 mt-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            type="button"
            className="w-full mt-4 py-3 border border-border rounded-lg font-medium text-foreground hover:bg-secondary transition-colors"
            onClick={() => toast.info("Wallet registration coming soon.")}
          >
            Wallet Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
