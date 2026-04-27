import { useState } from "react";
import { LayoutGrid, Flag, Settings, Activity, MoreHorizontal } from "lucide-react";

const categories = [
  { label: "All notifications",       icon: LayoutGrid },
  { label: "Task notification",       icon: Flag },
  { label: "System messages",         icon: Settings },
  { label: "Transaction notification", icon: Activity },
];

const NotificationsPage = () => {
  const [active, setActive] = useState("All notifications");
  const [hideRead, setHideRead] = useState(false);

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      {/* ── Hero Banner ─────────────────────────────────────── */}
      <div style={{
        width: "100%", background: "#111", position: "relative", overflow: "hidden",
        padding: "70px 40px 80px", textAlign: "center",
      }}>
        {/* Decorative rounded-rect shapes */}
        {[
          { top: 30, left: -30, w: 80, h: 80, r: 16 },
          { top: 60, left: 80, w: 50, h: 50, r: 12 },
          { top: -10, left: 140, w: 60, h: 60, r: 14 },
          { top: 100, left: 30, w: 40, h: 40, r: 10 },
          { top: 20, right: -20, w: 100, h: 100, r: 20 },
          { top: 80, right: 100, w: 60, h: 60, r: 14 },
          { top: -5, right: 200, w: 45, h: 45, r: 10 },
          { top: 130, right: 60, w: 50, h: 50, r: 12 },
        ].map((s, i) => (
          <div key={i} style={{
            position: "absolute",
            top: s.top, left: (s as any).left, right: (s as any).right,
            width: s.w, height: s.h, borderRadius: s.r,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }} />
        ))}
        <h1 style={{ fontSize: "36px", fontWeight: 600, color: "#fff", marginBottom: "16px", position: "relative", zIndex: 1 }}>
          Notifications
        </h1>
        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 1, lineHeight: 1.6 }}>
          Stay up to date on the latest happenings in Enivex, including latest events, cryptocurrency releases, new product features, and more.
        </p>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 40px 80px" }}>
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111" }}>Notifications</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "14px", color: "#555" }}>
              <input
                type="checkbox"
                checked={hideRead}
                onChange={() => setHideRead(!hideRead)}
                style={{ width: "16px", height: "16px", accentColor: "#111", cursor: "pointer" }}
              />
              Hide read notifications
            </label>
            <MoreHorizontal className="w-5 h-5 cursor-pointer" style={{ color: "#555" }} />
          </div>
        </div>

        {/* Two-column layout */}
        <div style={{ display: "flex", border: "1px solid #eee", borderRadius: "8px", minHeight: "500px" }}>
          {/* Left sidebar */}
          <div style={{ width: "280px", borderRight: "1px solid #eee", padding: "8px 0" }}>
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setActive(cat.label)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  width: "100%", padding: "16px 24px", border: "none", background: "none",
                  cursor: "pointer", transition: "background 0.15s",
                  fontSize: "15px",
                  fontWeight: active === cat.label ? 600 : 400,
                  color: active === cat.label ? "#111" : "#999",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f8f8f8"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <cat.icon style={{ width: "18px", height: "18px", color: active === cat.label ? "#111" : "#bbb" }} />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Right content */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ marginBottom: "12px", opacity: 0.4 }}>
              <rect x="20" y="15" width="40" height="50" rx="4" stroke="#ccc" strokeWidth="1.5" />
              <line x1="28" y1="30" x2="52" y2="30" stroke="#ccc" strokeWidth="1.5" />
              <line x1="28" y1="38" x2="48" y2="38" stroke="#ccc" strokeWidth="1.5" />
              <line x1="28" y1="46" x2="44" y2="46" stroke="#ccc" strokeWidth="1.5" />
              <circle cx="58" cy="22" r="8" stroke="#ccc" strokeWidth="1.5" />
              <circle cx="18" cy="55" r="6" stroke="#ccc" strokeWidth="1.5" />
            </svg>
            <span style={{ fontSize: "14px", color: "#ccc" }}>No Data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
