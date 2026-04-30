import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, ChevronDown, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/api";
import Header from "@/components/layout/Header";

/* ─────────────────────────────────────────────────────────────────────────────
   COUNTRIES  (dial codes + flags)
───────────────────────────────────────────────────────────────────────────── */
const COUNTRIES = [
  { code: "af", name: "Afghanistan",               dial: "+93"   },
  { code: "al", name: "Albania",                   dial: "+355"  },
  { code: "dz", name: "Algeria",                   dial: "+213"  },
  { code: "ar", name: "Argentina",                 dial: "+54"   },
  { code: "am", name: "Armenia",                   dial: "+374"  },
  { code: "au", name: "Australia",                 dial: "+61"   },
  { code: "at", name: "Austria",                   dial: "+43"   },
  { code: "az", name: "Azerbaijan",                dial: "+994"  },
  { code: "bh", name: "Bahrain",                   dial: "+973"  },
  { code: "bd", name: "Bangladesh",                dial: "+880"  },
  { code: "be", name: "Belgium",                   dial: "+32"   },
  { code: "br", name: "Brazil",                    dial: "+55"   },
  { code: "ca", name: "Canada",                    dial: "+1"    },
  { code: "cn", name: "China",                     dial: "+86"   },
  { code: "co", name: "Colombia",                  dial: "+57"   },
  { code: "hr", name: "Croatia",                   dial: "+385"  },
  { code: "cz", name: "Czech Republic",            dial: "+420"  },
  { code: "dk", name: "Denmark",                   dial: "+45"   },
  { code: "eg", name: "Egypt",                     dial: "+20"   },
  { code: "ee", name: "Estonia",                   dial: "+372"  },
  { code: "et", name: "Ethiopia",                  dial: "+251"  },
  { code: "fi", name: "Finland",                   dial: "+358"  },
  { code: "fr", name: "France",                    dial: "+33"   },
  { code: "de", name: "Germany",                   dial: "+49"   },
  { code: "gh", name: "Ghana",                     dial: "+233"  },
  { code: "gr", name: "Greece",                    dial: "+30"   },
  { code: "hk", name: "Hong Kong",                 dial: "+852"  },
  { code: "hu", name: "Hungary",                   dial: "+36"   },
  { code: "in", name: "India",                     dial: "+91"   },
  { code: "id", name: "Indonesia",                 dial: "+62"   },
  { code: "ir", name: "Iran",                      dial: "+98"   },
  { code: "iq", name: "Iraq",                      dial: "+964"  },
  { code: "ie", name: "Ireland",                   dial: "+353"  },
  { code: "il", name: "Israel",                    dial: "+972"  },
  { code: "it", name: "Italy",                     dial: "+39"   },
  { code: "jp", name: "Japan",                     dial: "+81"   },
  { code: "jo", name: "Jordan",                    dial: "+962"  },
  { code: "kz", name: "Kazakhstan",                dial: "+7"    },
  { code: "ke", name: "Kenya",                     dial: "+254"  },
  { code: "kw", name: "Kuwait",                    dial: "+965"  },
  { code: "lb", name: "Lebanon",                   dial: "+961"  },
  { code: "my", name: "Malaysia",                  dial: "+60"   },
  { code: "mv", name: "Maldives",                  dial: "+960"  },
  { code: "mx", name: "Mexico",                    dial: "+52"   },
  { code: "ma", name: "Morocco",                   dial: "+212"  },
  { code: "nl", name: "Netherlands",               dial: "+31"   },
  { code: "nz", name: "New Zealand",               dial: "+64"   },
  { code: "ng", name: "Nigeria",                   dial: "+234"  },
  { code: "no", name: "Norway",                    dial: "+47"   },
  { code: "om", name: "Oman",                      dial: "+968"  },
  { code: "pk", name: "Pakistan",                  dial: "+92"   },
  { code: "ph", name: "Philippines",               dial: "+63"   },
  { code: "pl", name: "Poland",                    dial: "+48"   },
  { code: "pt", name: "Portugal",                  dial: "+351"  },
  { code: "qa", name: "Qatar",                     dial: "+974"  },
  { code: "ro", name: "Romania",                   dial: "+40"   },
  { code: "ru", name: "Russia",                    dial: "+7"    },
  { code: "sa", name: "Saudi Arabia",              dial: "+966"  },
  { code: "sg", name: "Singapore",                 dial: "+65"   },
  { code: "za", name: "South Africa",              dial: "+27"   },
  { code: "es", name: "Spain",                     dial: "+34"   },
  { code: "lk", name: "Sri Lanka",                 dial: "+94"   },
  { code: "se", name: "Sweden",                    dial: "+46"   },
  { code: "ch", name: "Switzerland",               dial: "+41"   },
  { code: "tw", name: "Taiwan",                    dial: "+886"  },
  { code: "th", name: "Thailand",                  dial: "+66"   },
  { code: "tn", name: "Tunisia",                   dial: "+216"  },
  { code: "tr", name: "Turkey",                    dial: "+90"   },
  { code: "ae", name: "United Arab Emirates",      dial: "+971"  },
  { code: "gb", name: "United Kingdom",            dial: "+44"   },
  { code: "us", name: "United States",             dial: "+1"    },
  { code: "uy", name: "Uruguay",                   dial: "+598"  },
  { code: "uz", name: "Uzbekistan",                dial: "+998"  },
  { code: "ve", name: "Venezuela",                 dial: "+58"   },
  { code: "vn", name: "Vietnam",                   dial: "+84"   },
  { code: "ye", name: "Yemen",                     dial: "+967"  },
  { code: "zm", name: "Zambia",                    dial: "+260"  },
  { code: "zw", name: "Zimbabwe",                  dial: "+263"  },
];
const flagUrl = (code: string) => `https://flagcdn.com/w20/${code.toLowerCase()}.png`;

/* ─────────────────────────────────────────────────────────────────────────────
   COUNTRY DROPDOWN
───────────────────────────────────────────────────────────────────────────── */
function CountryDropdown({
  selected,
  onChange,
}: {
  selected: (typeof COUNTRIES)[0];
  onChange: (c: (typeof COUNTRIES)[0]) => void;
}) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const filtered = COUNTRIES.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.dial.includes(search),
  );
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "0 10px", height: "100%", background: "#fff",
          border: "none", borderRight: "1px solid #dde1e7",
          borderRadius: "8px 0 0 8px", minWidth: "90px", cursor: "pointer",
        }}
      >
        <img src={flagUrl(selected.code)} alt={selected.name} width={20} height={14}
          style={{ objectFit: "cover", borderRadius: "2px", flexShrink: 0 }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <span style={{ fontSize: "13px", color: "#555" }}>{selected.dial}</span>
        <ChevronDown style={{
          width: 13, height: 13, color: "#aaa", flexShrink: 0,
          transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s",
        }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 100,
          width: "270px", background: "#fff", border: "1px solid #e5e7eb",
          borderRadius: "10px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", overflow: "hidden",
        }}>
          <div style={{ padding: "8px", borderBottom: "1px solid #f0f0f0" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "7px 10px", background: "#f5f5f5", borderRadius: "7px",
            }}>
              <Search style={{ width: 14, height: 14, color: "#aaa", flexShrink: 0 }} />
              <input autoFocus type="text" placeholder="Search…" value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ fontSize: "13px", color: "#333", background: "transparent", border: "none", outline: "none", width: "100%" }}
              />
            </div>
          </div>
          <div style={{ overflowY: "auto", maxHeight: "240px" }}>
            {filtered.length === 0
              ? <p style={{ textAlign: "center", fontSize: "13px", color: "#aaa", padding: "16px" }}>No results</p>
              : filtered.map((c) => (
                <button key={c.code} type="button"
                  onClick={() => { onChange(c); setOpen(false); setSearch(""); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    width: "100%", padding: "9px 14px", textAlign: "left",
                    background: c.code === selected.code ? "#f5f5f5" : "#fff",
                    border: "none", cursor: "pointer",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f5f5f5"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = c.code === selected.code ? "#f5f5f5" : "#fff"; }}
                >
                  <img src={flagUrl(c.code)} alt={c.name} width={20} height={14}
                    style={{ objectFit: "cover", borderRadius: "2px", flexShrink: 0 }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <span style={{ fontSize: "13px", color: "#222", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                  <span style={{ fontSize: "12px", color: "#888", flexShrink: 0 }}>{c.dial}</span>
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CANVAS CAPTCHA  (username tab)
───────────────────────────────────────────────────────────────────────────── */
function CaptchaCanvas({ code, onClick }: { code: string; onClick: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, W, H);
    // noise lines
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * W, Math.random() * H);
      ctx.lineTo(Math.random() * W, Math.random() * H);
      ctx.strokeStyle = `rgba(100,100,100,${0.12 + Math.random() * 0.2})`;
      ctx.lineWidth = 1.2; ctx.stroke();
    }
    // dots
    for (let i = 0; i < 25; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * W, Math.random() * H, 1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,0,0,${0.1 + Math.random() * 0.25})`; ctx.fill();
    }
    // characters
    code.split("").forEach((ch, i) => {
      ctx.save();
      ctx.translate(10 + i * 18, H / 2 + 7);
      ctx.rotate((Math.random() - 0.5) * 0.45);
      ctx.font = `bold ${19 + Math.floor(Math.random() * 4)}px monospace`;
      ctx.fillStyle = `hsl(${Math.floor(Math.random() * 260)}, 55%, 28%)`;
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    });
  }, [code]);

  return (
    <canvas
      ref={canvasRef} width={100} height={40} onClick={onClick}
      title="Click to refresh"
      style={{ display: "block", cursor: "pointer", borderRadius: "6px", border: "1px solid #dde1e7" }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */
const CAPTCHA_CHARS = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const genCaptcha = () => Array.from({ length: 5 }, () => CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)]).join("");

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "13px 16px", fontSize: "14px",
  color: "#1a1a1a", background: "#fff", border: "1px solid #dde1e7",
  borderRadius: "8px", outline: "none", boxSizing: "border-box",
};

const TABS = ["Email", "Phone Number", "Username"] as const;
type Tab = (typeof TABS)[number];

/* ─────────────────────────────────────────────────────────────────────────────
   REGISTER PAGE
───────────────────────────────────────────────────────────────────────────── */
const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) navigate("/", { replace: true });

  /* ── tab + field state ───────────────────────────────────── */
  const [activeTab,        setActiveTab]        = useState<Tab>("Email");
  const [email,            setEmail]            = useState("");
  const [phone,            setPhone]            = useState("");
  const [username,         setUsername]         = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password,         setPassword]         = useState("");
  const [confirmPassword,  setConfirmPassword]  = useState("");
  const [inviteCode,       setInviteCode]       = useState("");
  const [captchaInput,     setCaptchaInput]     = useState("");
  const [captchaCode,      setCaptchaCode]      = useState(genCaptcha);
  const [showPwd,          setShowPwd]          = useState(false);
  const [showConfirm,      setShowConfirm]      = useState(false);

  /* ── loading / countdown state ───────────────────────────── */
  const [isLoading,      setIsLoading]      = useState(false);
  const [isSendingCode,  setIsSendingCode]  = useState(false);
  const [countdown,      setCountdown]      = useState(0);   // seconds left on resend timer

  /* ── countdown tick ─────────────────────────────────────── */
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  /* ── cross decoration (same as Login) ───────────────────── */
  const crossSq    = 128;
  const crossGap   = 24;
  const crossTotal = crossSq * 2 + crossGap;

  const CrossDecor = ({ posStyle }: { posStyle: React.CSSProperties }) => (
    <div style={{ position: "absolute", width: crossTotal, height: crossTotal, ...posStyle }}>
      {(["TL", "TR", "BL", "BR"] as const).map((pos) => (
        <div key={pos} style={{
          position: "absolute", width: crossSq, height: crossSq,
          background: "rgba(255,255,255,0.038)", border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: "22px",
          ...(pos === "TL" ? { top: 0,    left: 0  } :
              pos === "TR" ? { top: 0,    right: 0 } :
              pos === "BL" ? { bottom: 0, left: 0  } :
                             { bottom: 0, right: 0 }),
        }} />
      ))}
    </div>
  );

  /* ── tab switch ─────────────────────────────────────────── */
  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setVerificationCode("");
    setCountdown(0);
  };

  /* ── refresh captcha ────────────────────────────────────── */
  const refreshCaptcha = useCallback(() => {
    setCaptchaCode(genCaptcha());
    setCaptchaInput("");
  }, []);

  /* ── send verification code ─────────────────────────────── */
  const handleSendCode = async () => {
    const target =
      activeTab === "Email"
        ? email.trim()
        : `${selectedCountry.dial}${phone.trim()}`;

    if (activeTab === "Email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
        toast.error("Please enter a valid email address first.");
        return;
      }
    } else {
      if (!phone.trim()) {
        toast.error("Please enter your phone number first.");
        return;
      }
    }

    setIsSendingCode(true);
    try {
      const data = await api.post<{ sent: boolean; devCode?: string }>(
        "/auth/send-code",
        { target, type: "REGISTER" },
      );
      toast.success("Verification code sent!");
      setCountdown(60);
      // Dev helper: echo the OTP in the toast so testers can see it
      if (data.devCode) {
        toast.info(`Dev OTP: ${data.devCode}`, { duration: 30000 });
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to send code. Please try again.");
    } finally {
      setIsSendingCode(false);
    }
  };

  /* ── form submit ────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Tab-specific validation
    if (activeTab === "Email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        toast.error("Please enter a valid email address.");
        return;
      }
      if (verificationCode.length !== 6) {
        toast.error("Please enter the 6-digit verification code.");
        return;
      }
    } else if (activeTab === "Phone Number") {
      if (!phone.trim()) {
        toast.error("Please enter your phone number.");
        return;
      }
      if (verificationCode.length !== 6) {
        toast.error("Please enter the 6-digit verification code.");
        return;
      }
    } else {
      if (username.trim().length < 3) {
        toast.error("Username must be at least 3 characters.");
        return;
      }
      if (captchaInput.toUpperCase() !== captchaCode) {
        toast.error("Captcha does not match. Please try again.");
        refreshCaptcha();
        return;
      }
    }

    if (password.length < 6 || !/[0-9!@#$%^&*]/.test(password)) {
      toast.error("Password must be at least 6 characters and include a number or symbol.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone =
        activeTab === "Phone Number"
          ? `${selectedCountry.dial}${phone.trim()}`
          : undefined;

      await register({
        email:            activeTab === "Email"        ? email.trim().toLowerCase() : undefined,
        phone:            fullPhone,
        username:         activeTab === "Username"     ? username.trim() : undefined,
        password,
        verificationCode: activeTab !== "Username"     ? verificationCode : undefined,
        inviteCode:       inviteCode.trim() || undefined,
      });
      toast.success("Account created! Welcome to Enivex.");
      navigate("/");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) toast.error("This account already exists.");
        else if (err.status === 400) toast.error(err.message || "Invalid data. Please check your details.");
        else toast.error(err.message || "Registration failed. Please try again.");
      } else {
        toast.error("Unable to connect to server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const defaultCountry = COUNTRIES.find((c) => c.code === "pk")!;
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);

  /* ───────────────────────────────────────────────────────────
     RENDER
  ─────────────────────────────────────────────────────────── */
  return (
    <>
      {/* ── Existing app Header (fixed, h=48px, z-50) ────────── */}
      <Header />

      {/* ── Page body sits below the fixed 48px header ───────── */}
      <div style={{ display: "flex", minHeight: "100vh", paddingTop: "48px" }}>

      {/* ══════════════════════════════════════════════════════════
          LEFT PANEL — identical to Login dark panel
      ══════════════════════════════════════════════════════════ */}
      <div
        className="hidden lg:block"
        style={{
          flex: "0 0 45.6%", background: "#141414",
          position: "relative", overflow: "hidden", minHeight: "calc(100vh - 48px)",
        }}
      >
        {/* Dot-grid texture */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "58px 58px",
        }} />

        {/* Cross decorations */}
        <CrossDecor posStyle={{ top: -crossSq * 0.45, left: -crossSq * 0.45 }} />
        <CrossDecor posStyle={{ bottom: -crossSq * 0.45, right: -crossSq * 0.45 }} />

        {/* Centred content */}
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: "5% 8%",
        }}>
          <h2 style={{
            color: "#fff", fontSize: "36px", fontWeight: 400,
            margin: "0 0 44px", lineHeight: 1.45, textAlign: "left",
          }}>
            Welcome to <strong style={{ fontWeight: 700 }}>Enivex</strong><br />
            Start a new trading journey
          </h2>
          <img
            src="/login-hero.png"
            alt="Enivex crypto trading illustration"
            style={{ width: "90%", maxWidth: "520px", objectFit: "contain", display: "block" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          RIGHT PANEL — white register form
      ══════════════════════════════════════════════════════════ */}
      <div style={{
        flex: 1, background: "#fff", display: "flex", alignItems: "center",
        justifyContent: "center", padding: "48px 40px",
        minHeight: "calc(100vh - 48px)", overflowY: "auto",
      }}>
        <div style={{ width: "100%", maxWidth: "430px" }}>

          {/* ── Title ───────────────────────────────────────── */}
          <h1 style={{
            fontSize: "52px", fontWeight: 700, color: "#0a0a0a",
            margin: "0 0 28px 0", letterSpacing: "-1px", lineHeight: 1.1,
          }}>
            Register
          </h1>

          {/* ── Tabs ────────────────────────────────────────── */}
          <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", marginBottom: "24px" }}>
            {TABS.map((tab) => (
              <button
                key={tab} type="button"
                onClick={() => switchTab(tab)}
                style={{
                  padding: "0 0 13px 0", marginRight: "24px",
                  fontSize: "14px",
                  fontWeight: activeTab === tab ? 700 : 400,
                  color:     activeTab === tab ? "#111" : "#aaa",
                  borderTop: "none", borderLeft: "none", borderRight: "none",
                  borderBottom: `2.5px solid ${activeTab === tab ? "#111" : "transparent"}`,
                  background: "none", cursor: "pointer", whiteSpace: "nowrap",
                  marginBottom: "-1px",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── Form ────────────────────────────────────────── */}
          <form onSubmit={handleSubmit}>

            {/* ─── Row 1: Identifier ───────────────────────── */}
            {activeTab === "Email" && (
              <input
                type="email" placeholder="Enter Your Email" value={email}
                onChange={(e) => setEmail(e.target.value)} disabled={isLoading}
                autoComplete="email"
                style={{ ...inputStyle, marginBottom: "12px" }}
              />
            )}

            {activeTab === "Phone Number" && (
              <div style={{
                display: "flex", alignItems: "stretch",
                border: "1px solid #dde1e7", borderRadius: "8px",
                overflow: "visible", marginBottom: "12px", height: "50px",
              }}>
                <CountryDropdown selected={selectedCountry} onChange={setSelectedCountry} />
                <input
                  type="tel" placeholder="Please enter phone number" value={phone}
                  onChange={(e) => setPhone(e.target.value)} disabled={isLoading}
                  style={{
                    flex: 1, padding: "0 14px", fontSize: "14px",
                    color: "#1a1a1a", background: "#fff", border: "none",
                    outline: "none", borderRadius: "0 8px 8px 0", minWidth: 0,
                  }}
                />
              </div>
            )}

            {activeTab === "Username" && (
              <input
                type="text" placeholder="Please enter your username" value={username}
                onChange={(e) => setUsername(e.target.value)} disabled={isLoading}
                autoComplete="username"
                style={{ ...inputStyle, marginBottom: "12px" }}
              />
            )}

            {/* ─── Row 2: Verification code OR Captcha ──────── */}
            {(activeTab === "Email" || activeTab === "Phone Number") && (
              <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                <input
                  type="text" placeholder="Please enter the verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  disabled={isLoading} maxLength={6}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isSendingCode || countdown > 0}
                  style={{
                    flexShrink: 0, padding: "0 18px", height: "50px",
                    fontSize: "14px", fontWeight: 600, color: "#fff",
                    background: countdown > 0 ? "#555" : "#111",
                    border: "none", borderRadius: "8px", cursor: "pointer",
                    whiteSpace: "nowrap", transition: "background 0.15s",
                    opacity: isSendingCode ? 0.7 : 1,
                  }}
                >
                  {isSendingCode
                    ? <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                    : countdown > 0 ? `${countdown}s` : "Send code"}
                </button>
              </div>
            )}

            {activeTab === "Username" && (
              <div style={{ display: "flex", gap: "10px", marginBottom: "12px", alignItems: "stretch" }}>
                <input
                  type="text"
                  placeholder="Please enter the characters shown in the picture"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value.toUpperCase().slice(0, 5))}
                  disabled={isLoading} maxLength={5}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <div style={{
                  flexShrink: 0, display: "flex", alignItems: "center",
                  border: "1px solid #dde1e7", borderRadius: "8px", overflow: "hidden",
                }}>
                  <CaptchaCanvas code={captchaCode} onClick={refreshCaptcha} />
                </div>
              </div>
            )}

            {/* ─── Password ─────────────────────────────────── */}
            <p style={{ fontSize: "13px", color: "#555", margin: "0 0 8px" }}>
              Login password (at least 6 letters, including numbers or symbols)
            </p>
            <div style={{ position: "relative", marginBottom: "12px" }}>
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Please set a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading} autoComplete="new-password"
                style={{ ...inputStyle, paddingRight: "44px" }}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                position: "absolute", right: "14px", top: "50%",
                transform: "translateY(-50%)", background: "none",
                border: "none", cursor: "pointer", color: "#aaa",
                display: "flex", alignItems: "center",
              }}>
                {showPwd ? <Eye style={{ width: 16, height: 16 }} /> : <EyeOff style={{ width: 16, height: 16 }} />}
              </button>
            </div>

            {/* ─── Confirm password ─────────────────────────── */}
            <p style={{ fontSize: "13px", color: "#555", margin: "0 0 8px" }}>
              Please confirm your password
            </p>
            <div style={{ position: "relative", marginBottom: "12px" }}>
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Please confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading} autoComplete="new-password"
                style={{
                  ...inputStyle,
                  paddingRight: "44px",
                  borderColor: confirmPassword && confirmPassword !== password ? "#ef4444" : "#dde1e7",
                }}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{
                position: "absolute", right: "14px", top: "50%",
                transform: "translateY(-50%)", background: "none",
                border: "none", cursor: "pointer", color: "#aaa",
                display: "flex", alignItems: "center",
              }}>
                {showConfirm ? <Eye style={{ width: 16, height: 16 }} /> : <EyeOff style={{ width: 16, height: 16 }} />}
              </button>
            </div>

            {/* ─── Referral Code ────────────────────────────── */}
            <p style={{ fontSize: "13px", color: "#555", margin: "0 0 8px" }}>Referral Code</p>
            <input
              type="text" placeholder="Please enter your invitation code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              disabled={isLoading}
              style={{ ...inputStyle, marginBottom: "16px" }}
            />

            {/* ─── Terms ────────────────────────────────────── */}
            <p style={{ fontSize: "12px", color: "#888", lineHeight: 1.6, margin: "0 0 20px" }}>
              Registering implies agreement{" "}
              <Link to="/terms" style={{ fontWeight: 700, color: "#111", textDecoration: "none" }}>Terms of Service</Link>
              {" "},{" "}
              <Link to="/privacy" style={{ fontWeight: 700, color: "#111", textDecoration: "none" }}>Privacy Policy</Link>
              {" "},{" "}
              <Link to="/aml" style={{ fontWeight: 700, color: "#111", textDecoration: "none" }}>Anti-Money Laundering Agreement</Link>
            </p>

            {/* ─── Submit ───────────────────────────────────── */}
            <button
              type="submit" disabled={isLoading}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "8px", width: "100%", padding: "15px 0",
                fontSize: "16px", fontWeight: 600, color: "#fff",
                background: "#111", border: "none", borderRadius: "100px",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1, transition: "opacity 0.15s",
              }}
            >
              {isLoading
                ? <><Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> Creating account…</>
                : "Register"
              }
            </button>
          </form>

          {/* ── Sign-in link ─────────────────────────────────── */}
          <p style={{ textAlign: "center", marginTop: "16px", fontSize: "14px", color: "#888" }}>
            Do you already have an account?{" "}
            <Link to="/login" style={{ fontWeight: 700, color: "#111", textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default Register;
