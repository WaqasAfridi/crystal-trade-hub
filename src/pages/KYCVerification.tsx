import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, Camera, Check } from "lucide-react";

const COUNTRIES = [
  { code: "AF", flag: "🇦🇫", name: "Afghanistan" },
  { code: "AL", flag: "🇦🇱", name: "Albania" },
  { code: "DZ", flag: "🇩🇿", name: "Algeria" },
  { code: "AD", flag: "🇦🇩", name: "Andorra" },
  { code: "AO", flag: "🇦🇴", name: "Angola" },
  { code: "AG", flag: "🇦🇬", name: "Antigua and Barbuda" },
  { code: "AR", flag: "🇦🇷", name: "Argentina" },
  { code: "AM", flag: "🇦🇲", name: "Armenia" },
  { code: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "AT", flag: "🇦🇹", name: "Austria" },
  { code: "AZ", flag: "🇦🇿", name: "Azerbaijan" },
  { code: "BS", flag: "🇧🇸", name: "Bahamas" },
  { code: "BH", flag: "🇧🇭", name: "Bahrain" },
  { code: "BD", flag: "🇧🇩", name: "Bangladesh" },
  { code: "BB", flag: "🇧🇧", name: "Barbados" },
  { code: "BY", flag: "🇧🇾", name: "Belarus" },
  { code: "BE", flag: "🇧🇪", name: "Belgium" },
  { code: "BZ", flag: "🇧🇿", name: "Belize" },
  { code: "BJ", flag: "🇧🇯", name: "Benin" },
  { code: "BT", flag: "🇧🇹", name: "Bhutan" },
  { code: "BO", flag: "🇧🇴", name: "Bolivia" },
  { code: "BA", flag: "🇧🇦", name: "Bosnia and Herzegovina" },
  { code: "BW", flag: "🇧🇼", name: "Botswana" },
  { code: "BR", flag: "🇧🇷", name: "Brazil" },
  { code: "BN", flag: "🇧🇳", name: "Brunei" },
  { code: "BG", flag: "🇧🇬", name: "Bulgaria" },
  { code: "BF", flag: "🇧🇫", name: "Burkina Faso" },
  { code: "BI", flag: "🇧🇮", name: "Burundi" },
  { code: "CV", flag: "🇨🇻", name: "Cabo Verde" },
  { code: "KH", flag: "🇰🇭", name: "Cambodia" },
  { code: "CM", flag: "🇨🇲", name: "Cameroon" },
  { code: "CA", flag: "🇨🇦", name: "Canada" },
  { code: "CF", flag: "🇨🇫", name: "Central African Republic" },
  { code: "TD", flag: "🇹🇩", name: "Chad" },
  { code: "CL", flag: "🇨🇱", name: "Chile" },
  { code: "CN", flag: "🇨🇳", name: "China" },
  { code: "CO", flag: "🇨🇴", name: "Colombia" },
  { code: "KM", flag: "🇰🇲", name: "Comoros" },
  { code: "CG", flag: "🇨🇬", name: "Congo" },
  { code: "CR", flag: "🇨🇷", name: "Costa Rica" },
  { code: "HR", flag: "🇭🇷", name: "Croatia" },
  { code: "CU", flag: "🇨🇺", name: "Cuba" },
  { code: "CY", flag: "🇨🇾", name: "Cyprus" },
  { code: "CZ", flag: "🇨🇿", name: "Czech Republic" },
  { code: "DK", flag: "🇩🇰", name: "Denmark" },
  { code: "DJ", flag: "🇩🇯", name: "Djibouti" },
  { code: "DM", flag: "🇩🇲", name: "Dominica" },
  { code: "DO", flag: "🇩🇴", name: "Dominican Republic" },
  { code: "EC", flag: "🇪🇨", name: "Ecuador" },
  { code: "EG", flag: "🇪🇬", name: "Egypt" },
  { code: "SV", flag: "🇸🇻", name: "El Salvador" },
  { code: "GQ", flag: "🇬🇶", name: "Equatorial Guinea" },
  { code: "ER", flag: "🇪🇷", name: "Eritrea" },
  { code: "EE", flag: "🇪🇪", name: "Estonia" },
  { code: "SZ", flag: "🇸🇿", name: "Eswatini" },
  { code: "ET", flag: "🇪🇹", name: "Ethiopia" },
  { code: "FJ", flag: "🇫🇯", name: "Fiji" },
  { code: "FI", flag: "🇫🇮", name: "Finland" },
  { code: "FR", flag: "🇫🇷", name: "France" },
  { code: "GA", flag: "🇬🇦", name: "Gabon" },
  { code: "GM", flag: "🇬🇲", name: "Gambia" },
  { code: "GE", flag: "🇬🇪", name: "Georgia" },
  { code: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "GH", flag: "🇬🇭", name: "Ghana" },
  { code: "GR", flag: "🇬🇷", name: "Greece" },
  { code: "GD", flag: "🇬🇩", name: "Grenada" },
  { code: "GT", flag: "🇬🇹", name: "Guatemala" },
  { code: "GN", flag: "🇬🇳", name: "Guinea" },
  { code: "GW", flag: "🇬🇼", name: "Guinea-Bissau" },
  { code: "GY", flag: "🇬🇾", name: "Guyana" },
  { code: "HT", flag: "🇭🇹", name: "Haiti" },
  { code: "HN", flag: "🇭🇳", name: "Honduras" },
  { code: "HU", flag: "🇭🇺", name: "Hungary" },
  { code: "IS", flag: "🇮🇸", name: "Iceland" },
  { code: "IN", flag: "🇮🇳", name: "India" },
  { code: "ID", flag: "🇮🇩", name: "Indonesia" },
  { code: "IR", flag: "🇮🇷", name: "Iran" },
  { code: "IQ", flag: "🇮🇶", name: "Iraq" },
  { code: "IE", flag: "🇮🇪", name: "Ireland" },
  { code: "IL", flag: "🇮🇱", name: "Israel" },
  { code: "IT", flag: "🇮🇹", name: "Italy" },
  { code: "JM", flag: "🇯🇲", name: "Jamaica" },
  { code: "JP", flag: "🇯🇵", name: "Japan" },
  { code: "JO", flag: "🇯🇴", name: "Jordan" },
  { code: "KZ", flag: "🇰🇿", name: "Kazakhstan" },
  { code: "KE", flag: "🇰🇪", name: "Kenya" },
  { code: "KI", flag: "🇰🇮", name: "Kiribati" },
  { code: "KW", flag: "🇰🇼", name: "Kuwait" },
  { code: "KG", flag: "🇰🇬", name: "Kyrgyzstan" },
  { code: "LA", flag: "🇱🇦", name: "Laos" },
  { code: "LV", flag: "🇱🇻", name: "Latvia" },
  { code: "LB", flag: "🇱🇧", name: "Lebanon" },
  { code: "LS", flag: "🇱🇸", name: "Lesotho" },
  { code: "LR", flag: "🇱🇷", name: "Liberia" },
  { code: "LY", flag: "🇱🇾", name: "Libya" },
  { code: "LI", flag: "🇱🇮", name: "Liechtenstein" },
  { code: "LT", flag: "🇱🇹", name: "Lithuania" },
  { code: "LU", flag: "🇱🇺", name: "Luxembourg" },
  { code: "MG", flag: "🇲🇬", name: "Madagascar" },
  { code: "MW", flag: "🇲🇼", name: "Malawi" },
  { code: "MY", flag: "🇲🇾", name: "Malaysia" },
  { code: "MV", flag: "🇲🇻", name: "Maldives" },
  { code: "ML", flag: "🇲🇱", name: "Mali" },
  { code: "MT", flag: "🇲🇹", name: "Malta" },
  { code: "MH", flag: "🇲🇭", name: "Marshall Islands" },
  { code: "MR", flag: "🇲🇷", name: "Mauritania" },
  { code: "MU", flag: "🇲🇺", name: "Mauritius" },
  { code: "MX", flag: "🇲🇽", name: "Mexico" },
  { code: "FM", flag: "🇫🇲", name: "Micronesia" },
  { code: "MD", flag: "🇲🇩", name: "Moldova" },
  { code: "MC", flag: "🇲🇨", name: "Monaco" },
  { code: "MN", flag: "🇲🇳", name: "Mongolia" },
  { code: "ME", flag: "🇲🇪", name: "Montenegro" },
  { code: "MA", flag: "🇲🇦", name: "Morocco" },
  { code: "MZ", flag: "🇲🇿", name: "Mozambique" },
  { code: "MM", flag: "🇲🇲", name: "Myanmar" },
  { code: "NA", flag: "🇳🇦", name: "Namibia" },
  { code: "NR", flag: "🇳🇷", name: "Nauru" },
  { code: "NP", flag: "🇳🇵", name: "Nepal" },
  { code: "NL", flag: "🇳🇱", name: "Netherlands" },
  { code: "NZ", flag: "🇳🇿", name: "New Zealand" },
  { code: "NI", flag: "🇳🇮", name: "Nicaragua" },
  { code: "NE", flag: "🇳🇪", name: "Niger" },
  { code: "NG", flag: "🇳🇬", name: "Nigeria" },
  { code: "NO", flag: "🇳🇴", name: "Norway" },
  { code: "OM", flag: "🇴🇲", name: "Oman" },
  { code: "PK", flag: "🇵🇰", name: "Pakistan" },
  { code: "PW", flag: "🇵🇼", name: "Palau" },
  { code: "PA", flag: "🇵🇦", name: "Panama" },
  { code: "PG", flag: "🇵🇬", name: "Papua New Guinea" },
  { code: "PY", flag: "🇵🇾", name: "Paraguay" },
  { code: "PE", flag: "🇵🇪", name: "Peru" },
  { code: "PH", flag: "🇵🇭", name: "Philippines" },
  { code: "PL", flag: "🇵🇱", name: "Poland" },
  { code: "PT", flag: "🇵🇹", name: "Portugal" },
  { code: "QA", flag: "🇶🇦", name: "Qatar" },
  { code: "RO", flag: "🇷🇴", name: "Romania" },
  { code: "RU", flag: "🇷🇺", name: "Russia" },
  { code: "RW", flag: "🇷🇼", name: "Rwanda" },
  { code: "KN", flag: "🇰🇳", name: "Saint Kitts and Nevis" },
  { code: "LC", flag: "🇱🇨", name: "Saint Lucia" },
  { code: "VC", flag: "🇻🇨", name: "Saint Vincent and the Grenadines" },
  { code: "WS", flag: "🇼🇸", name: "Samoa" },
  { code: "SM", flag: "🇸🇲", name: "San Marino" },
  { code: "ST", flag: "🇸🇹", name: "Sao Tome and Principe" },
  { code: "SA", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "SN", flag: "🇸🇳", name: "Senegal" },
  { code: "RS", flag: "🇷🇸", name: "Serbia" },
  { code: "SC", flag: "🇸🇨", name: "Seychelles" },
  { code: "SL", flag: "🇸🇱", name: "Sierra Leone" },
  { code: "SG", flag: "🇸🇬", name: "Singapore" },
  { code: "SK", flag: "🇸🇰", name: "Slovakia" },
  { code: "SI", flag: "🇸🇮", name: "Slovenia" },
  { code: "SB", flag: "🇸🇧", name: "Solomon Islands" },
  { code: "SO", flag: "🇸🇴", name: "Somalia" },
  { code: "ZA", flag: "🇿🇦", name: "South Africa" },
  { code: "SS", flag: "🇸🇸", name: "South Sudan" },
  { code: "ES", flag: "🇪🇸", name: "Spain" },
  { code: "LK", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "SD", flag: "🇸🇩", name: "Sudan" },
  { code: "SR", flag: "🇸🇷", name: "Suriname" },
  { code: "SE", flag: "🇸🇪", name: "Sweden" },
  { code: "CH", flag: "🇨🇭", name: "Switzerland" },
  { code: "SY", flag: "🇸🇾", name: "Syria" },
  { code: "TW", flag: "🇹🇼", name: "Taiwan" },
  { code: "TJ", flag: "🇹🇯", name: "Tajikistan" },
  { code: "TZ", flag: "🇹🇿", name: "Tanzania" },
  { code: "TH", flag: "🇹🇭", name: "Thailand" },
  { code: "TL", flag: "🇹🇱", name: "Timor-Leste" },
  { code: "TG", flag: "🇹🇬", name: "Togo" },
  { code: "TO", flag: "🇹🇴", name: "Tonga" },
  { code: "TT", flag: "🇹🇹", name: "Trinidad and Tobago" },
  { code: "TN", flag: "🇹🇳", name: "Tunisia" },
  { code: "TR", flag: "🇹🇷", name: "Turkey" },
  { code: "TM", flag: "🇹🇲", name: "Turkmenistan" },
  { code: "TV", flag: "🇹🇻", name: "Tuvalu" },
  { code: "UG", flag: "🇺🇬", name: "Uganda" },
  { code: "UA", flag: "🇺🇦", name: "Ukraine" },
  { code: "AE", flag: "🇦🇪", name: "United Arab Emirates" },
  { code: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "US", flag: "🇺🇸", name: "United States" },
  { code: "UY", flag: "🇺🇾", name: "Uruguay" },
  { code: "UZ", flag: "🇺🇿", name: "Uzbekistan" },
  { code: "VU", flag: "🇻🇺", name: "Vanuatu" },
  { code: "VE", flag: "🇻🇪", name: "Venezuela" },
  { code: "VN", flag: "🇻🇳", name: "Vietnam" },
  { code: "YE", flag: "🇾🇪", name: "Yemen" },
  { code: "ZM", flag: "🇿🇲", name: "Zambia" },
  { code: "ZW", flag: "🇿🇼", name: "Zimbabwe" },
];

const ERR = "The content can not be blank";

// ── Step 1 ───────────────────────────────────────────────────────────────────
function Step1({ onNext }: { onNext: () => void }) {
  const [selectedCountry, setSelectedCountry] = useState<typeof COUNTRIES[0] | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [docSelected, setDocSelected] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const filtered = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const countryError = submitted && !selectedCountry;
  const docError = submitted && !docSelected;

  const handleContinue = () => {
    setSubmitted(true);
    if (!selectedCountry || !docSelected) return;
    onNext();
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-1" style={{ color: "#111" }}>KYC Verification</h1>
      <p className="text-sm mb-6" style={{ color: "#555" }}>Select country/region of residence and ID type</p>

      {/* Country dropdown */}
      <div className="relative mb-1">
        <div
          className="relative rounded border cursor-pointer"
          style={{ borderColor: countryError ? "#ef4444" : "#ccc" }}
          onClick={() => setDropdownOpen((v) => !v)}
        >
          <label className="absolute text-xs px-1" style={{ top: -9, left: 12, background: "#fff", color: countryError ? "#ef4444" : "#888" }}>
            Country/Region of Residence
          </label>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              {selectedCountry ? (
                <>
                  <span className="text-lg">{selectedCountry.flag}</span>
                  <span className="text-sm font-medium" style={{ color: "#111" }}>{selectedCountry.name}</span>
                </>
              ) : (
                <span className="text-sm" style={{ color: "#aaa" }}>Select your country</span>
              )}
            </div>
            <ChevronDown size={16} style={{ color: "#888", transform: dropdownOpen ? "rotate(180deg)" : "none", transition: "0.2s" }} />
          </div>
        </div>

        {dropdownOpen && (
          <div className="absolute z-50 w-full mt-1 rounded border shadow-lg" style={{ background: "#fff", borderColor: "#ddd", maxHeight: 280, overflowY: "auto" }}>
            <div className="sticky top-0 p-2" style={{ background: "#fff", borderBottom: "1px solid #eee" }}>
              <input
                type="text"
                placeholder="Search country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-3 py-1.5 text-sm rounded outline-none"
                style={{ border: "1px solid #ddd", color: "#111" }}
                autoFocus
              />
            </div>
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm" style={{ color: "#888" }}>No results</div>
            ) : (
              filtered.map((c) => (
                <div
                  key={c.code}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                  style={{ color: "#111" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  onClick={() => { setSelectedCountry(c); setDropdownOpen(false); setSearch(""); }}
                >
                  <span className="text-lg">{c.flag}</span>
                  <span className="text-sm">{c.name}</span>
                  {selectedCountry?.code === c.code && <Check size={14} style={{ marginLeft: "auto", color: "#111" }} />}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {countryError && <p className="text-xs mb-4" style={{ color: "#ef4444" }}>{ERR}</p>}
      {!countryError && <div className="mb-6" />}

      {/* Document Type */}
      <p className="text-sm font-medium mb-3" style={{ color: "#111" }}>Document Type</p>
      <div
        className="w-full flex items-center justify-between px-4 py-3 rounded border cursor-pointer transition-all"
        style={{ borderColor: docError ? "#ef4444" : "#ccc", background: "#fff" }}
        onClick={() => setDocSelected((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <img src="/kyc/ID icon.png" alt="ID" className="w-8 h-8 object-contain" />
          <span className="text-sm font-medium" style={{ color: "#111" }}>ID</span>
        </div>
        <div
          className="w-5 h-5 rounded border flex items-center justify-center flex-shrink-0"
          style={{ borderColor: docSelected ? "#111" : "#ccc", background: docSelected ? "#111" : "#fff" }}
        >
          {docSelected && <Check size={11} color="#fff" strokeWidth={3} />}
        </div>
      </div>
      {docError && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{ERR}</p>}

      <div className="flex justify-end mt-8">
        <button
          onClick={handleContinue}
          className="px-7 py-2.5 rounded-full text-sm font-semibold transition-all"
          style={{ background: "#111", color: "#fff" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#333")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#111")}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ── Step 2 ───────────────────────────────────────────────────────────────────
function Step2({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const nameError = submitted && !fullName.trim();
  const dobError = submitted && !dob;
  const idError = submitted && !idNumber.trim();

  const handleContinue = () => {
    setSubmitted(true);
    if (!fullName.trim() || !dob || !idNumber.trim()) return;
    onNext();
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6" style={{ color: "#111" }}>KYC Verification</h1>
      <p className="text-sm font-semibold mb-4" style={{ color: "#111" }}>Personal Information</p>

      {/* Full Name */}
      <div className="relative rounded border mb-1" style={{ borderColor: nameError ? "#ef4444" : "#ccc" }}>
        <label className="absolute text-xs px-1" style={{ top: -9, left: 12, background: "#fff", color: nameError ? "#ef4444" : "#888" }}>
          Identity Information
        </label>
        <input
          type="text"
          placeholder="Enter Your Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-4 py-3 text-sm outline-none bg-transparent"
          style={{ color: "#111" }}
        />
      </div>
      {nameError && <p className="text-xs mb-3" style={{ color: "#ef4444" }}>{ERR}</p>}
      {!nameError && <div className="mb-4" />}

      {/* Date of Birth */}
      <div className="relative rounded border mb-1" style={{ borderColor: dobError ? "#ef4444" : "#ccc" }}>
        <label className="absolute text-xs px-1" style={{ top: -9, left: 12, background: "#fff", color: dobError ? "#ef4444" : "#888" }}>
          Date Of Birth
        </label>
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="w-full px-4 py-3 text-sm outline-none bg-transparent"
          style={{ color: dob ? "#111" : "#aaa" }}
        />
      </div>
      {dobError && <p className="text-xs mb-3" style={{ color: "#ef4444" }}>{ERR}</p>}
      {!dobError && <div className="mb-4" />}

      {/* ID Number */}
      <div className="relative rounded border mb-1" style={{ borderColor: idError ? "#ef4444" : "#ccc" }}>
        <label className="absolute text-xs px-1" style={{ top: -9, left: 12, background: "#fff", color: idError ? "#ef4444" : "#888" }}>
          ID Number
        </label>
        <input
          type="text"
          placeholder="Enter Your Driver License Number/Passport"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          className="w-full px-4 py-3 text-sm outline-none bg-transparent"
          style={{ color: "#111" }}
        />
      </div>
      {idError && <p className="text-xs mb-3" style={{ color: "#ef4444" }}>{ERR}</p>}
      {!idError && <div className="mb-5" />}

      {/* Document Type (always checked, carried from step 1) */}
      <p className="text-sm font-semibold mb-3" style={{ color: "#111" }}>Document Type</p>
      <div className="flex items-center justify-between px-4 py-3 rounded border mb-8" style={{ borderColor: "#ccc" }}>
        <div className="flex items-center gap-3">
          <img src="/kyc/ID icon.png" alt="ID" className="w-8 h-8 object-contain" />
          <span className="text-sm font-medium" style={{ color: "#111" }}>ID</span>
        </div>
        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "#111" }}>
          <Check size={11} color="#fff" strokeWidth={3} />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button onClick={onPrev} className="px-7 py-2.5 rounded-full text-sm font-semibold" style={{ background: "transparent", color: "#111" }}>
          Previous
        </button>
        <button
          onClick={handleContinue}
          className="px-7 py-2.5 rounded-full text-sm font-semibold"
          style={{ background: "#111", color: "#fff" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#333")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#111")}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ── Step 3 ───────────────────────────────────────────────────────────────────
function Step3({ onSubmit, onPrev }: { onSubmit: () => void; onPrev: () => void }) {
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const frontError = submitted && !frontFile;
  const backError = submitted && !backFile;

  const handleFile = (file: File, setPreview: (s: string) => void, setFile: (f: File) => void) => {
    setFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (!frontFile || !backFile) return;
    onSubmit();
  };

  const illustrations = [
    { src: "/kyc/Standard id illustration.png", label: "Standard" },
    { src: "/kyc/No missing edges id illustration.png", label: "No missing edges" },
    { src: "/kyc/Bumo Lake id illustration.png", label: "Bumo Lake" },
    { src: "/kyc/Non-reflective id illustration.png", label: "Non-reflective" },
  ];

  return (
    <div className="w-full max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-1" style={{ color: "#111" }}>KYC Verification</h1>
      <p className="text-sm mb-6" style={{ color: "#555" }}>Upload a photo of your ID card or Driver's license.</p>

      {/* Illustrations — no overlay icons, they're baked into the images */}
      <div className="flex gap-4 mb-8">
        {illustrations.map((ill) => (
          <div key={ill.label} className="flex flex-col items-center gap-2 flex-1">
            <img src={ill.src} alt={ill.label} className="w-full object-contain" style={{ maxHeight: 80 }} />
            <span className="text-xs text-center" style={{ color: "#888" }}>{ill.label}</span>
          </div>
        ))}
      </div>

      {/* Upload areas */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Front */}
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: "#111" }}>ID Card / Driver's License Front</p>
          <button
            type="button"
            className="w-full rounded border-2 border-dashed flex flex-col items-center justify-center gap-2"
            style={{
              borderColor: frontError ? "#ef4444" : "#c5d5f0",
              background: frontPreview ? "transparent" : "#f0f5ff",
              minHeight: 140, cursor: "pointer", position: "relative", overflow: "hidden",
            }}
            onClick={() => frontRef.current?.click()}
          >
            {frontPreview ? (
              <img src={frontPreview} alt="Front" className="w-full h-full object-cover absolute inset-0" />
            ) : (
              <>
                <Camera size={28} style={{ color: frontError ? "#ef4444" : "#7ca7e0" }} />
                <p className="text-xs text-center px-2" style={{ color: frontError ? "#ef4444" : "#5b8fd6" }}>
                  Click to upload the front of your ID card or driver's license.
                </p>
              </>
            )}
          </button>
          <input ref={frontRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f, setFrontPreview, setFrontFile); }} />
          {frontError && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{ERR}</p>}
        </div>

        {/* Back */}
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: "#111" }}>ID Card / Driver's License Back</p>
          <button
            type="button"
            className="w-full rounded border-2 border-dashed flex flex-col items-center justify-center gap-2"
            style={{
              borderColor: backError ? "#ef4444" : "#c5d5f0",
              background: backPreview ? "transparent" : "#f0f5ff",
              minHeight: 140, cursor: "pointer", position: "relative", overflow: "hidden",
            }}
            onClick={() => backRef.current?.click()}
          >
            {backPreview ? (
              <img src={backPreview} alt="Back" className="w-full h-full object-cover absolute inset-0" />
            ) : (
              <>
                <Camera size={28} style={{ color: backError ? "#ef4444" : "#7ca7e0" }} />
                <p className="text-xs text-center px-2" style={{ color: backError ? "#ef4444" : "#5b8fd6" }}>
                  Click to upload the back of your ID card or driver's license.
                </p>
              </>
            )}
          </button>
          <input ref={backRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f, setBackPreview, setBackFile); }} />
          {backError && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{ERR}</p>}
        </div>
      </div>

      <div className="text-xs mb-6" style={{ color: "#888" }}>
        <p>1.Image size must be less than 10M</p>
        <p>2.After passing the certification, the information cannot be modified, and the platform will protect your personal information.</p>
      </div>

      <div className="flex justify-end gap-4">
        <button onClick={onPrev} className="px-7 py-2.5 rounded-full text-sm font-semibold" style={{ background: "transparent", color: "#111" }}>
          Previous
        </button>
        <button
          onClick={handleSubmit}
          className="px-7 py-2.5 rounded-full text-sm font-semibold"
          style={{ background: "#111", color: "#fff" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#333")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#111")}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function KYCVerification() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = () => {
    toast({ title: "Uploaded successfully", description: "Your KYC documents have been submitted for review." });
    setTimeout(() => navigate("/"), 1500);
  };

  return (
    <div className="min-h-screen flex items-start justify-center pt-16 px-4" style={{ background: "#fff" }}>
      {step === 1 && <Step1 onNext={() => setStep(2)} />}
      {step === 2 && <Step2 onNext={() => setStep(3)} onPrev={() => setStep(1)} />}
      {step === 3 && <Step3 onSubmit={handleSubmit} onPrev={() => setStep(2)} />}
    </div>
  );
}
