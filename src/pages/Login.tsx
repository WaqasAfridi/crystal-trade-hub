import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const loginTabs = ["Email", "Phone Number", "Username"];

const Login = () => {
  const [activeTab, setActiveTab] = useState("Email");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const getPlaceholder = () => {
    switch (activeTab) {
      case "Email": return "Enter Your Email";
      case "Phone Number": return "Enter Your Phone Number";
      case "Username": return "Enter Your Username";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - illustration */}
      <div className="hidden lg:flex flex-1 bg-background items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-8 h-8 bg-primary/20 rounded"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 45}deg)`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center px-12">
          <h2 className="text-3xl font-light text-foreground mb-2">
            Welcome to <span className="font-bold">Enivex</span>
          </h2>
          <p className="text-lg text-muted-foreground">Start a new trading journey</p>
          <div className="mt-12 text-8xl">🌐</div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center bg-card px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-foreground mb-8">Login</h1>

          {/* Tabs */}
          <div className="flex gap-6 mb-6 border-b border-border">
            {loginTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
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
          <div className="space-y-4">
            <input
              type={activeTab === "Email" ? "email" : "text"}
              placeholder={getPlaceholder()}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
            />

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-muted-foreground">Login password</label>
                <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Please enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary pr-10"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Logging in implies agreement{" "}
            <Link to="/terms" className="font-semibold text-foreground hover:underline">Terms of Service</Link>{" "},{" "}
            <Link to="/privacy" className="font-semibold text-foreground hover:underline">Privacy Policy</Link>{" "},{" "}
            <Link to="/aml" className="font-semibold text-foreground hover:underline">Anti-Money Laundering Agreement</Link>
          </p>

          <button className="w-full mt-6 py-3 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-opacity">
            Login
          </button>

          <p className="text-center mt-4 text-sm text-muted-foreground">
            No account?{" "}
            <Link to="/register" className="font-semibold text-foreground hover:underline">Register</Link>
          </p>

          <div className="flex items-center gap-4 mt-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button className="w-full mt-4 py-3 border border-border rounded-lg font-medium text-foreground hover:bg-secondary transition-colors">
            Wallet login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
