import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api";

const loginTabs = ["Email", "Phone Number", "Username"] as const;
type LoginTab = (typeof loginTabs)[number];

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // Redirect away if already logged in
  if (isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname ?? "/";
    navigate(from, { replace: true });
  }

  const [activeTab,    setActiveTab]    = useState<LoginTab>("Email");
  const [showPassword, setShowPassword] = useState(false);
  const [identifier,   setIdentifier]   = useState("");
  const [password,     setPassword]     = useState("");
  const [isLoading,    setIsLoading]    = useState(false);

  const getPlaceholder = () => {
    if (activeTab === "Email")       return "Enter your email";
    if (activeTab === "Phone Number") return "Enter your phone number";
    return "Enter your username";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error("Please enter your email, phone, or username.");
      return;
    }
    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    setIsLoading(true);
    try {
      await login(identifier.trim(), password);
      const from = (location.state as { from?: { pathname: string } })?.from
        ?.pathname ?? "/";
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          toast.error("Invalid credentials. Please check your details.");
        } else if (err.status === 429) {
          toast.error("Too many attempts. Please wait a few minutes.");
        } else {
          toast.error(err.message || "Login failed. Please try again.");
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
                top:    `${(i * 17 + 5) % 90}%`,
                left:   `${(i * 13 + 8) % 85}%`,
                background:
                  i % 3 === 0
                    ? "rgba(232,121,160,0.06)"
                    : i % 3 === 1
                    ? "rgba(99,102,241,0.06)"
                    : "rgba(34,197,94,0.06)",
                transform: `rotate(${i * 22}deg)`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center px-12">
          {/* Logo */}
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
            Welcome back to{" "}
            <span className="font-bold">Enivex</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Your trusted platform for global trading
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Assets", value: "$2.4B+" },
              { label: "Users",  value: "500K+"  },
              { label: "Countries", value: "180+"  },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-card px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-foreground mb-8">Login</h1>

          {/* Tabs */}
          <div className="flex gap-6 mb-6 border-b border-border">
            {loginTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setIdentifier(""); }}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type={activeTab === "Email" ? "email" : activeTab === "Phone Number" ? "tel" : "text"}
              placeholder={getPlaceholder()}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={isLoading}
              autoComplete={activeTab === "Email" ? "email" : "username"}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
            />

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-muted-foreground">
                  Login password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Please enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary pr-10 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Logging in implies agreement to{" "}
              <Link to="/terms" className="font-semibold text-foreground hover:underline">
                Terms of Service
              </Link>
              ,{" "}
              <Link to="/privacy" className="font-semibold text-foreground hover:underline">
                Privacy Policy
              </Link>
              , and{" "}
              <Link to="/aml" className="font-semibold text-foreground hover:underline">
                Anti-Money Laundering Agreement
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
                  Logging in…
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <p className="text-center mt-4 text-sm text-muted-foreground">
            No account?{" "}
            <Link
              to="/register"
              className="font-semibold text-foreground hover:underline"
            >
              Register
            </Link>
          </p>

          <div className="flex items-center gap-4 mt-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            type="button"
            className="w-full mt-4 py-3 border border-border rounded-lg font-medium text-foreground hover:bg-secondary transition-colors"
            onClick={() => toast.info("Wallet login coming soon.")}
          >
            Wallet login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
