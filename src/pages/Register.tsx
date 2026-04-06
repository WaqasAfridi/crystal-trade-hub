import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const registerTabs = ["Email", "Phone Number"];

const Register = () => {
  const [activeTab, setActiveTab] = useState("Email");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    verificationCode: "",
    password: "",
    confirmPassword: "",
    inviteCode: "",
  });

  return (
    <div className="min-h-screen flex">
      {/* Left side */}
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
          <p className="text-lg text-muted-foreground">Create your account</p>
          <div className="mt-12 text-8xl">🚀</div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center bg-card px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-foreground mb-8">Register</h1>

          <div className="flex gap-6 mb-6 border-b border-border">
            {registerTabs.map((tab) => (
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

          <div className="space-y-4">
            <input
              type={activeTab === "Email" ? "email" : "tel"}
              placeholder={activeTab === "Email" ? "Enter Your Email" : "Enter Your Phone Number"}
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
            />

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Verification Code"
                value={formData.verificationCode}
                onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                className="flex-1 px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
              />
              <button className="px-4 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 whitespace-nowrap">
                Send Code
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Set password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary pr-10"
              />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            <input
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
            />

            <input
              type="text"
              placeholder="Invite code (optional)"
              value={formData.inviteCode}
              onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            By registering, you agree to our{" "}
            <Link to="/terms" className="font-semibold text-foreground hover:underline">Terms of Service</Link> and{" "}
            <Link to="/privacy" className="font-semibold text-foreground hover:underline">Privacy Policy</Link>
          </p>

          <button className="w-full mt-6 py-3 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-opacity">
            Register
          </button>

          <p className="text-center mt-4 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-foreground hover:underline">Login</Link>
          </p>

          <div className="flex items-center gap-4 mt-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button className="w-full mt-4 py-3 border border-border rounded-lg font-medium text-foreground hover:bg-secondary transition-colors">
            Wallet Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
