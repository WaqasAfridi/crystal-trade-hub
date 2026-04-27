import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Mail, CheckCircle } from "lucide-react";
import { toast } from "sonner";

/*
  Forgot Password page.
  The backend doesn't yet have a /auth/forgot-password endpoint with email delivery.
  This page collects the email, shows a loading state, then a "check your email"
  confirmation screen. When the backend email service is wired up, replace the
  setTimeout mock in handleSubmit with a real API call.
*/
const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email,     setEmail]     = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent,      setSent]      = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      /*
        TODO: Replace this mock with the real API call once the endpoint exists:

        await api.post("/auth/forgot-password", { email: email.trim().toLowerCase() });
      */
      await new Promise<void>((resolve) => setTimeout(resolve, 1500)); // mock delay
      setSent(true);
    } catch {
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Success screen ────────────────────────────────────────── */
  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(34,197,94,0.12)" }}
          >
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Check your inbox
          </h1>
          <p className="text-muted-foreground mb-2">
            We've sent a password reset link to
          </p>
          <p className="font-semibold text-foreground mb-8">{email}</p>
          <p className="text-sm text-muted-foreground mb-8">
            Didn't receive it? Check your spam folder or{" "}
            <button
              onClick={() => setSent(false)}
              className="font-semibold text-foreground hover:underline"
            >
              try again
            </button>
            .
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  /* ── Main form ─────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Mail className="w-7 h-7 text-foreground" />
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2">
          Forgot password?
        </h1>
        <p className="text-muted-foreground mb-8">
          Enter the email address associated with your account and we'll send you
          a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">
              Email address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending reset link…
              </>
            ) : (
              "Send reset link"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Remembered your password?{" "}
          <Link to="/login" className="font-semibold text-foreground hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
