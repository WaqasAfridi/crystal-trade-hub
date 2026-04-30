import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Loader2, ChevronDown, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api";
import Header from "@/components/layout/Header";

/* ────────────────────────────────────────────────────────────────
   Country list — real flag images via flagcdn.com
──────────────────────────────────────────────────────────────── */
const COUNTRIES = [
  { code: "af", name: "Afghanistan",               dial: "+93"   },
  { code: "al", name: "Albania",                   dial: "+355"  },
  { code: "dz", name: "Algeria",                   dial: "+213"  },
  { code: "ad", name: "Andorra",                   dial: "+376"  },
  { code: "ao", name: "Angola",                    dial: "+244"  },
  { code: "ag", name: "Antigua & Barbuda",          dial: "+1268" },
  { code: "ar", name: "Argentina",                 dial: "+54"   },
  { code: "am", name: "Armenia",                   dial: "+374"  },
  { code: "au", name: "Australia",                 dial: "+61"   },
  { code: "at", name: "Austria",                   dial: "+43"   },
  { code: "az", name: "Azerbaijan",                dial: "+994"  },
  { code: "bs", name: "Bahamas",                   dial: "+1242" },
  { code: "bh", name: "Bahrain",                   dial: "+973"  },
  { code: "bd", name: "Bangladesh",                dial: "+880"  },
  { code: "bb", name: "Barbados",                  dial: "+1246" },
  { code: "by", name: "Belarus",                   dial: "+375"  },
  { code: "be", name: "Belgium",                   dial: "+32"   },
  { code: "bz", name: "Belize",                    dial: "+501"  },
  { code: "bj", name: "Benin",                     dial: "+229"  },
  { code: "bt", name: "Bhutan",                    dial: "+975"  },
  { code: "bo", name: "Bolivia",                   dial: "+591"  },
  { code: "ba", name: "Bosnia & Herzegovina",       dial: "+387"  },
  { code: "bw", name: "Botswana",                  dial: "+267"  },
  { code: "br", name: "Brazil",                    dial: "+55"   },
  { code: "bn", name: "Brunei",                    dial: "+673"  },
  { code: "bg", name: "Bulgaria",                  dial: "+359"  },
  { code: "bf", name: "Burkina Faso",              dial: "+226"  },
  { code: "bi", name: "Burundi",                   dial: "+257"  },
  { code: "cv", name: "Cabo Verde",                dial: "+238"  },
  { code: "kh", name: "Cambodia",                  dial: "+855"  },
  { code: "cm", name: "Cameroon",                  dial: "+237"  },
  { code: "ca", name: "Canada",                    dial: "+1"    },
  { code: "cf", name: "Central African Republic",  dial: "+236"  },
  { code: "td", name: "Chad",                      dial: "+235"  },
  { code: "cl", name: "Chile",                     dial: "+56"   },
  { code: "cn", name: "China",                     dial: "+86"   },
  { code: "co", name: "Colombia",                  dial: "+57"   },
  { code: "km", name: "Comoros",                   dial: "+269"  },
  { code: "cg", name: "Congo",                     dial: "+242"  },
  { code: "cd", name: "Congo (DRC)",               dial: "+243"  },
  { code: "cr", name: "Costa Rica",                dial: "+506"  },
  { code: "ci", name: "Côte d'Ivoire",             dial: "+225"  },
  { code: "hr", name: "Croatia",                   dial: "+385"  },
  { code: "cu", name: "Cuba",                      dial: "+53"   },
  { code: "cy", name: "Cyprus",                    dial: "+357"  },
  { code: "cz", name: "Czech Republic",            dial: "+420"  },
  { code: "dk", name: "Denmark",                   dial: "+45"   },
  { code: "dj", name: "Djibouti",                  dial: "+253"  },
  { code: "dm", name: "Dominica",                  dial: "+1767" },
  { code: "do", name: "Dominican Republic",        dial: "+1809" },
  { code: "ec", name: "Ecuador",                   dial: "+593"  },
  { code: "eg", name: "Egypt",                     dial: "+20"   },
  { code: "sv", name: "El Salvador",               dial: "+503"  },
  { code: "gq", name: "Equatorial Guinea",         dial: "+240"  },
  { code: "er", name: "Eritrea",                   dial: "+291"  },
  { code: "ee", name: "Estonia",                   dial: "+372"  },
  { code: "sz", name: "Eswatini",                  dial: "+268"  },
  { code: "et", name: "Ethiopia",                  dial: "+251"  },
  { code: "fj", name: "Fiji",                      dial: "+679"  },
  { code: "fi", name: "Finland",                   dial: "+358"  },
  { code: "fr", name: "France",                    dial: "+33"   },
  { code: "ga", name: "Gabon",                     dial: "+241"  },
  { code: "gm", name: "Gambia",                    dial: "+220"  },
  { code: "ge", name: "Georgia",                   dial: "+995"  },
  { code: "de", name: "Germany",                   dial: "+49"   },
  { code: "gh", name: "Ghana",                     dial: "+233"  },
  { code: "gr", name: "Greece",                    dial: "+30"   },
  { code: "gd", name: "Grenada",                   dial: "+1473" },
  { code: "gt", name: "Guatemala",                 dial: "+502"  },
  { code: "gn", name: "Guinea",                    dial: "+224"  },
  { code: "gw", name: "Guinea-Bissau",             dial: "+245"  },
  { code: "gy", name: "Guyana",                    dial: "+592"  },
  { code: "ht", name: "Haiti",                     dial: "+509"  },
  { code: "hn", name: "Honduras",                  dial: "+504"  },
  { code: "hk", name: "Hong Kong",                 dial: "+852"  },
  { code: "hu", name: "Hungary",                   dial: "+36"   },
  { code: "is", name: "Iceland",                   dial: "+354"  },
  { code: "in", name: "India",                     dial: "+91"   },
  { code: "id", name: "Indonesia",                 dial: "+62"   },
  { code: "ir", name: "Iran",                      dial: "+98"   },
  { code: "iq", name: "Iraq",                      dial: "+964"  },
  { code: "ie", name: "Ireland",                   dial: "+353"  },
  { code: "il", name: "Israel",                    dial: "+972"  },
  { code: "it", name: "Italy",                     dial: "+39"   },
  { code: "jm", name: "Jamaica",                   dial: "+1876" },
  { code: "jp", name: "Japan",                     dial: "+81"   },
  { code: "jo", name: "Jordan",                    dial: "+962"  },
  { code: "kz", name: "Kazakhstan",                dial: "+7"    },
  { code: "ke", name: "Kenya",                     dial: "+254"  },
  { code: "ki", name: "Kiribati",                  dial: "+686"  },
  { code: "kw", name: "Kuwait",                    dial: "+965"  },
  { code: "kg", name: "Kyrgyzstan",                dial: "+996"  },
  { code: "la", name: "Laos",                      dial: "+856"  },
  { code: "lv", name: "Latvia",                    dial: "+371"  },
  { code: "lb", name: "Lebanon",                   dial: "+961"  },
  { code: "ls", name: "Lesotho",                   dial: "+266"  },
  { code: "lr", name: "Liberia",                   dial: "+231"  },
  { code: "ly", name: "Libya",                     dial: "+218"  },
  { code: "li", name: "Liechtenstein",             dial: "+423"  },
  { code: "lt", name: "Lithuania",                 dial: "+370"  },
  { code: "lu", name: "Luxembourg",                dial: "+352"  },
  { code: "mg", name: "Madagascar",                dial: "+261"  },
  { code: "mw", name: "Malawi",                    dial: "+265"  },
  { code: "my", name: "Malaysia",                  dial: "+60"   },
  { code: "mv", name: "Maldives",                  dial: "+960"  },
  { code: "ml", name: "Mali",                      dial: "+223"  },
  { code: "mt", name: "Malta",                     dial: "+356"  },
  { code: "mh", name: "Marshall Islands",          dial: "+692"  },
  { code: "mr", name: "Mauritania",                dial: "+222"  },
  { code: "mu", name: "Mauritius",                 dial: "+230"  },
  { code: "mx", name: "Mexico",                    dial: "+52"   },
  { code: "fm", name: "Micronesia",                dial: "+691"  },
  { code: "md", name: "Moldova",                   dial: "+373"  },
  { code: "mc", name: "Monaco",                    dial: "+377"  },
  { code: "mn", name: "Mongolia",                  dial: "+976"  },
  { code: "me", name: "Montenegro",                dial: "+382"  },
  { code: "ma", name: "Morocco",                   dial: "+212"  },
  { code: "mz", name: "Mozambique",                dial: "+258"  },
  { code: "mm", name: "Myanmar",                   dial: "+95"   },
  { code: "na", name: "Namibia",                   dial: "+264"  },
  { code: "nr", name: "Nauru",                     dial: "+674"  },
  { code: "np", name: "Nepal",                     dial: "+977"  },
  { code: "nl", name: "Netherlands",               dial: "+31"   },
  { code: "nz", name: "New Zealand",               dial: "+64"   },
  { code: "ni", name: "Nicaragua",                 dial: "+505"  },
  { code: "ne", name: "Niger",                     dial: "+227"  },
  { code: "ng", name: "Nigeria",                   dial: "+234"  },
  { code: "mk", name: "North Macedonia",           dial: "+389"  },
  { code: "no", name: "Norway",                    dial: "+47"   },
  { code: "om", name: "Oman",                      dial: "+968"  },
  { code: "pk", name: "Pakistan",                  dial: "+92"   },
  { code: "pw", name: "Palau",                     dial: "+680"  },
  { code: "pa", name: "Panama",                    dial: "+507"  },
  { code: "pg", name: "Papua New Guinea",          dial: "+675"  },
  { code: "py", name: "Paraguay",                  dial: "+595"  },
  { code: "pe", name: "Peru",                      dial: "+51"   },
  { code: "ph", name: "Philippines",               dial: "+63"   },
  { code: "pl", name: "Poland",                    dial: "+48"   },
  { code: "pt", name: "Portugal",                  dial: "+351"  },
  { code: "qa", name: "Qatar",                     dial: "+974"  },
  { code: "ro", name: "Romania",                   dial: "+40"   },
  { code: "ru", name: "Russia",                    dial: "+7"    },
  { code: "rw", name: "Rwanda",                    dial: "+250"  },
  { code: "kn", name: "Saint Kitts & Nevis",       dial: "+1869" },
  { code: "lc", name: "Saint Lucia",               dial: "+1758" },
  { code: "vc", name: "Saint Vincent & Grenadines",dial: "+1784" },
  { code: "ws", name: "Samoa",                     dial: "+685"  },
  { code: "sm", name: "San Marino",                dial: "+378"  },
  { code: "st", name: "São Tomé & Príncipe",       dial: "+239"  },
  { code: "sa", name: "Saudi Arabia",              dial: "+966"  },
  { code: "sn", name: "Senegal",                   dial: "+221"  },
  { code: "rs", name: "Serbia",                    dial: "+381"  },
  { code: "sc", name: "Seychelles",                dial: "+248"  },
  { code: "sl", name: "Sierra Leone",              dial: "+232"  },
  { code: "sg", name: "Singapore",                 dial: "+65"   },
  { code: "sk", name: "Slovakia",                  dial: "+421"  },
  { code: "si", name: "Slovenia",                  dial: "+386"  },
  { code: "sb", name: "Solomon Islands",           dial: "+677"  },
  { code: "so", name: "Somalia",                   dial: "+252"  },
  { code: "za", name: "South Africa",              dial: "+27"   },
  { code: "ss", name: "South Sudan",               dial: "+211"  },
  { code: "es", name: "Spain",                     dial: "+34"   },
  { code: "lk", name: "Sri Lanka",                 dial: "+94"   },
  { code: "sd", name: "Sudan",                     dial: "+249"  },
  { code: "sr", name: "Suriname",                  dial: "+597"  },
  { code: "se", name: "Sweden",                    dial: "+46"   },
  { code: "ch", name: "Switzerland",               dial: "+41"   },
  { code: "sy", name: "Syria",                     dial: "+963"  },
  { code: "tw", name: "Taiwan",                    dial: "+886"  },
  { code: "tj", name: "Tajikistan",                dial: "+992"  },
  { code: "tz", name: "Tanzania",                  dial: "+255"  },
  { code: "th", name: "Thailand",                  dial: "+66"   },
  { code: "tl", name: "Timor-Leste",               dial: "+670"  },
  { code: "tg", name: "Togo",                      dial: "+228"  },
  { code: "to", name: "Tonga",                     dial: "+676"  },
  { code: "tt", name: "Trinidad & Tobago",         dial: "+1868" },
  { code: "tn", name: "Tunisia",                   dial: "+216"  },
  { code: "tr", name: "Turkey",                    dial: "+90"   },
  { code: "tm", name: "Turkmenistan",              dial: "+993"  },
  { code: "tv", name: "Tuvalu",                    dial: "+688"  },
  { code: "ug", name: "Uganda",                    dial: "+256"  },
  { code: "ua", name: "Ukraine",                   dial: "+380"  },
  { code: "ae", name: "United Arab Emirates",      dial: "+971"  },
  { code: "gb", name: "United Kingdom",            dial: "+44"   },
  { code: "us", name: "United States",             dial: "+1"    },
  { code: "uy", name: "Uruguay",                   dial: "+598"  },
  { code: "uz", name: "Uzbekistan",                dial: "+998"  },
  { code: "vu", name: "Vanuatu",                   dial: "+678"  },
  { code: "ve", name: "Venezuela",                 dial: "+58"   },
  { code: "vn", name: "Vietnam",                   dial: "+84"   },
  { code: "ye", name: "Yemen",                     dial: "+967"  },
  { code: "zm", name: "Zambia",                    dial: "+260"  },
  { code: "zw", name: "Zimbabwe",                  dial: "+263"  },
];

const flagUrl = (code: string) =>
  `https://flagcdn.com/w20/${code.toLowerCase()}.png`;

/* ────────────────────────────────────────────────────────────────
   Country Dropdown
──────────────────────────────────────────────────────────────── */
function CountryDropdown({
  selected,
  onChange,
}: {
  selected: (typeof COUNTRIES)[0];
  onChange: (c: (typeof COUNTRIES)[0]) => void;
}) {
  const [open, setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial.includes(search)
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "0 12px",
          height: "100%",
          background: "#fff",
          borderRight: "1px solid #e5e7eb",
          borderRadius: "8px 0 0 8px",
          minWidth: "92px",
          cursor: "pointer",
          border: "none",
          borderRight: "1px solid #e5e7eb",
        }}
      >
        <img
          src={flagUrl(selected.code)}
          alt={selected.name}
          width={22}
          height={15}
          style={{ objectFit: "cover", borderRadius: "2px", flexShrink: 0 }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <span style={{ fontSize: "13px", color: "#555", flexShrink: 0 }}>{selected.dial}</span>
        <ChevronDown
          style={{
            width: "13px",
            height: "13px",
            color: "#aaa",
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.15s",
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            zIndex: 100,
            width: "270px",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}
        >
          {/* Search bar */}
          <div style={{ padding: "8px", borderBottom: "1px solid #f0f0f0" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "7px 10px", background: "#f5f5f5", borderRadius: "7px",
            }}>
              <Search style={{ width: "14px", height: "14px", color: "#aaa", flexShrink: 0 }} />
              <input
                autoFocus
                type="text"
                placeholder="Search country or code…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  fontSize: "13px", color: "#333", background: "transparent",
                  border: "none", outline: "none", width: "100%",
                }}
              />
            </div>
          </div>
          {/* List */}
          <div style={{ overflowY: "auto", maxHeight: "240px" }}>
            {filtered.length === 0 ? (
              <p style={{ textAlign: "center", fontSize: "13px", color: "#aaa", padding: "16px" }}>
                No results
              </p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { onChange(c); setOpen(false); setSearch(""); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    width: "100%", padding: "9px 14px", textAlign: "left",
                    background: c.code === selected.code ? "#f5f5f5" : "#fff",
                    border: "none", cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f5f5f5"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = c.code === selected.code ? "#f5f5f5" : "#fff"; }}
                >
                  <img
                    src={flagUrl(c.code)}
                    alt={c.name}
                    width={22}
                    height={15}
                    style={{ objectFit: "cover", borderRadius: "2px", flexShrink: 0 }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <span style={{ fontSize: "13px", color: "#222", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.name}
                  </span>
                  <span style={{ fontSize: "12px", color: "#888", flexShrink: 0 }}>{c.dial}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Shared input style
──────────────────────────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 16px",
  fontSize: "14px",
  color: "#1a1a1a",
  background: "#fff",
  border: "1px solid #dde1e7",
  borderRadius: "8px",
  outline: "none",
  boxSizing: "border-box",
};

const loginTabs = ["Email", "Phone Number", "Username"] as const;
type LoginTab = (typeof loginTabs)[number];

/* ────────────────────────────────────────────────────────────────
   Login Page
──────────────────────────────────────────────────────────────── */
const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  if (isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname ?? "/";
    navigate(from, { replace: true });
  }

  const [activeTab,    setActiveTab]    = useState<LoginTab>("Email");
  const [showPassword, setShowPassword] = useState(false);
  const [identifier,   setIdentifier]   = useState("");
  const [password,     setPassword]     = useState("");
  const [isLoading,    setIsLoading]    = useState(false);

  const defaultCountry = COUNTRIES.find((c) => c.code === "pk")!;
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);

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
      const fullIdentifier =
        activeTab === "Phone Number"
          ? `${selectedCountry.dial}${identifier.trim()}`
          : identifier.trim();
      await login(fullIdentifier, password);
      const from =
        (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401)       toast.error("Invalid credentials. Please check your details.");
        else if (err.status === 429)  toast.error("Too many attempts. Please wait a few minutes.");
        else                          toast.error(err.message || "Login failed. Please try again.");
      } else {
        toast.error("Unable to connect to server. Is the backend running?");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Cross-shaped decorative element (2×2 grid of rounded rects, partially clipped at corners) */
  const crossSq  = 128;   // each square's size
  const crossGap = 24;    // gap between squares
  const crossTotal = crossSq * 2 + crossGap; // total size of the 2×2 group

  const CrossDecor = ({ posStyle }: { posStyle: React.CSSProperties }) => (
    <div style={{ position: "absolute", width: crossTotal, height: crossTotal, ...posStyle }}>
      {(["TL","TR","BL","BR"] as const).map((pos) => (
        <div
          key={pos}
          style={{
            position: "absolute",
            width:  crossSq,
            height: crossSq,
            background: "rgba(255,255,255,0.038)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: "22px",
            ...(pos === "TL" ? { top: 0,        left: 0       } :
                pos === "TR" ? { top: 0,        right: 0      } :
                pos === "BL" ? { bottom: 0,     left: 0       } :
                               { bottom: 0,     right: 0      }),
          }}
        />
      ))}
    </div>
  );

  return (
    <>
      {/* ── Existing app Header (fixed, h=48px, z-50) ────────── */}
      <Header />

      {/* ── Page body sits below the fixed 48px header ───────── */}
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          paddingTop: "48px",   /* header offset */
        }}
      >
        {/* ══════════════════════════════════════════════════════
            LEFT PANEL — dark hero
        ══════════════════════════════════════════════════════ */}
        <div
          className="hidden lg:block"
          style={{
            flex: "0 0 45.6%",
            background: "#141414",
            position: "relative",
            overflow: "hidden",
            minHeight: "calc(100vh - 48px)",
          }}
        >
          {/* Dot-grid texture */}
          <div
            style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)",
              backgroundSize: "58px 58px",
            }}
          />

          {/* Decorative cross shapes — top-left and bottom-right, partially clipped */}
          <CrossDecor posStyle={{ top: -crossSq * 0.45, left: -crossSq * 0.45 }} />
          <CrossDecor posStyle={{ bottom: -crossSq * 0.45, right: -crossSq * 0.45 }} />

          {/* ── Text + illustration, fully centered in the dark panel ── */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "5% 8%",
            }}
          >
            {/* Heading — single element, both lines same size, centered */}
            <h2
              style={{
                color: "#fff",
                fontSize: "36px",
                fontWeight: 400,
                margin: "0 0 44px",
                lineHeight: 1.45,
                textAlign: "left",
              }}
            >
              Welcome to <strong style={{ fontWeight: 700 }}>Enivex</strong><br />
              Start a new trading journey
            </h2>

            {/* Hero illustration — bigger and centered */}
            <img
              src="/login-hero.png"
              alt="Enivex crypto trading illustration"
              style={{
                width: "90%",
                maxWidth: "520px",
                objectFit: "contain",
                display: "block",
              }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            RIGHT PANEL — white form
        ══════════════════════════════════════════════════════ */}
        <div
          style={{
            flex: 1,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 40px",
            minHeight: "calc(100vh - 48px)",
          }}
        >
          <div style={{ width: "100%", maxWidth: "430px" }}>

            {/* ── "Login" title ────────────────────────────── */}
            <h1
              style={{
                fontSize: "52px",
                fontWeight: 700,
                color: "#0a0a0a",
                margin: "0 0 28px 0",
                letterSpacing: "-1px",
                lineHeight: 1.1,
              }}
            >
              Login
            </h1>

            {/* ── Tabs ─────────────────────────────────────── */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid #e5e7eb",
                marginBottom: "24px",
              }}
            >
              {loginTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => { setActiveTab(tab); setIdentifier(""); }}
                  style={{
                    padding: "0 0 13px 0",
                    marginRight: "28px",
                    fontSize: "14px",
                    fontWeight: activeTab === tab ? 700 : 400,
                    color: activeTab === tab ? "#111" : "#aaa",
                    borderTop: "none",
                    borderLeft: "none",
                    borderRight: "none",
                    borderBottom: `2.5px solid ${activeTab === tab ? "#111" : "transparent"}`,
                    background: "none",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "color 0.15s",
                    marginBottom: "-1px",   /* sit on top of container border */
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* ── Form ─────────────────────────────────────── */}
            <form onSubmit={handleSubmit}>

              {/* Identifier field */}
              {activeTab === "Phone Number" ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "stretch",
                    border: "1px solid #dde1e7",
                    borderRadius: "8px",
                    overflow: "visible",
                    marginBottom: "16px",
                    height: "50px",
                  }}
                >
                  <CountryDropdown
                    selected={selectedCountry}
                    onChange={setSelectedCountry}
                  />
                  <input
                    type="tel"
                    placeholder="Please enter phone number"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: "0 14px",
                      fontSize: "14px",
                      color: "#1a1a1a",
                      background: "#fff",
                      border: "none",
                      outline: "none",
                      borderRadius: "0 8px 8px 0",
                      minWidth: 0,
                    }}
                  />
                </div>
              ) : (
                <input
                  type={activeTab === "Email" ? "email" : "text"}
                  placeholder={
                    activeTab === "Email" ? "Enter Your Email" : "Please enter your username"
                  }
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isLoading}
                  autoComplete={activeTab === "Email" ? "email" : "username"}
                  style={{ ...inputStyle, marginBottom: "16px" }}
                />
              )}

              {/* Password row */}
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <label style={{ fontSize: "13px", color: "#555" }}>Login password</label>
                  <Link
                    to="/forgot-password"
                    style={{
                      fontSize: "13px",
                      color: "#555",
                      textDecoration: "none",
                    }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Please enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="current-password"
                    style={{ ...inputStyle, paddingRight: "44px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#aaa",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {showPassword
                      ? <Eye style={{ width: "16px", height: "16px" }} />
                      : <EyeOff style={{ width: "16px", height: "16px" }} />
                    }
                  </button>
                </div>
              </div>

              {/* Agreement text */}
              <p
                style={{
                  fontSize: "12px",
                  color: "#888",
                  lineHeight: 1.6,
                  margin: "0 0 20px 0",
                }}
              >
                Logging in implies agreement{" "}
                <Link
                  to="/terms"
                  style={{ fontWeight: 700, color: "#111", textDecoration: "none" }}
                >
                  Terms of Service
                </Link>
                {" "},{" "}
                <Link
                  to="/privacy"
                  style={{ fontWeight: 700, color: "#111", textDecoration: "none" }}
                >
                  Privacy Policy
                </Link>
                {" "},{" "}
                <Link
                  to="/aml"
                  style={{ fontWeight: 700, color: "#111", textDecoration: "none" }}
                >
                  Anti-Money Laundering Agreement
                </Link>
              </p>

              {/* Login button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "15px 0",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#fff",
                  background: "#111",
                  border: "none",
                  borderRadius: "100px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.7 : 1,
                  transition: "opacity 0.15s",
                  letterSpacing: "0.01em",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
                    Logging in…
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {/* Register link */}
            <p
              style={{
                textAlign: "center",
                marginTop: "16px",
                fontSize: "14px",
                color: "#888",
              }}
            >
              No account?{" "}
              <Link
                to="/register"
                style={{ fontWeight: 700, color: "#111", textDecoration: "none" }}
              >
                Register
              </Link>
            </p>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                margin: "20px 0",
              }}
            >
              <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
              <span style={{ fontSize: "13px", color: "#aaa" }}>or</span>
              <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
            </div>

            {/* Wallet login button */}
            <button
              type="button"
              onClick={() => toast.info("Wallet login coming soon.")}
              style={{
                width: "100%",
                padding: "14px 0",
                fontSize: "15px",
                fontWeight: 500,
                color: "#333",
                background: "transparent",
                border: "1px solid #d1d5db",
                borderRadius: "100px",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f9fafb"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              Wallet login
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
