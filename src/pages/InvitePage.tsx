import { useState } from "react";
import { Copy, ChevronDown, FileText } from "lucide-react";

const NoData = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
    <img src="/nodata-search.png" alt="No Data" style={{ width: "80px", opacity: 0.5, marginBottom: "8px" }} />
    <span style={{ fontSize: "14px", color: "#bbb" }}>No Data</span>
  </div>
);

const InvitePage = () => {
  const [invFilter] = useState("First level member");
  const [rewardFilter] = useState("All");
  const referralCode = "9Y4HO9";
  const invitationLink = "https://enivex.com/main.h...";

  const copyText = (text: string) => { navigator.clipboard.writeText(text); };

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      {/* ── Hero Banner (black) ──────────────────────────────── */}
      <div style={{ background: "#111", width: "100%", padding: "60px 0 50px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Left: illustration + share */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <img src="/invite-share.png" alt="Share" style={{ width: "200px", height: "auto", marginBottom: "20px" }} />
            <button style={{
              padding: "10px 48px", background: "transparent", color: "#fff",
              border: "1px solid #fff", borderRadius: "24px", fontSize: "15px",
              fontWeight: 500, cursor: "pointer",
            }}>Share</button>
          </div>
          {/* Right: referral info */}
          <div style={{
            border: "1px solid rgba(255,255,255,0.3)", borderRadius: "12px",
            padding: "28px 36px", minWidth: "420px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "24px" }}>
              <span style={{ fontSize: "16px", color: "#fff" }}>Referral Code</span>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <span style={{ fontSize: "22px", fontWeight: 700, color: "#fff", letterSpacing: "2px" }}>{referralCode}</span>
                <Copy className="w-5 h-5 cursor-pointer" style={{ color: "#7bffb6" }} onClick={() => copyText(referralCode)} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "16px", color: "#fff" }}>Invitation link</span>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <span style={{ fontSize: "15px", color: "#fff" }}>{invitationLink}</span>
                <Copy className="w-5 h-5 cursor-pointer" style={{ color: "#7bffb6" }} onClick={() => copyText("https://enivex.com/main.html?#/register?code=9Y4HO9")} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Hint / Steps section ─────────────────────────────── */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "48px 40px" }}>
        <h2 style={{ fontSize: "32px", fontWeight: 700, color: "#111", marginBottom: "40px" }}>Hint</h2>
        <div style={{ display: "flex", gap: "40px", justifyContent: "space-between" }}>
          {[
            { img: "/invite-step1.png", step: "Step 1", text: "Share Your Link to Invite Friends" },
            { img: "/invite-step2.png", step: "Step 2", text: "Friends Sign Up and Deposit Using Your Invite Code" },
            { img: "/invite-step3.png", step: "Step 3", text: "Get Back from Your Friends' Trades!" },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: "left" }}>
              <img src={s.img} alt={s.step} style={{ width: "200px", height: "200px", objectFit: "contain", marginBottom: "16px" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111", marginBottom: "8px" }}>{s.step}</h3>
              <p style={{ fontSize: "14px", color: "#555", lineHeight: 1.5 }}>{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── You have accumulated ─────────────────────────────── */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 40px 48px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#111", marginBottom: "20px" }}>You have accumulated</h2>
        <div style={{
          display: "flex", background: "#f5f5f5", borderRadius: "12px", padding: "28px 32px",
        }}>
          {[
            { label: "Total commission", value: "$ 0" },
            { label: "Today's commission rebate", value: "$ 0" },
            { label: "This month's commission rebate", value: "$ 0" },
          ].map((item, i) => (
            <div key={i} style={{ flex: 1 }}>
              <p style={{ fontSize: "14px", color: "#888", marginBottom: "8px" }}>{item.label}</p>
              <p style={{ fontSize: "28px", fontWeight: 700, color: "#111" }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Overview (friend levels) ─────────────────────────── */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 40px 48px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 400, color: "#555", marginBottom: "32px" }}>Overview</h2>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "24px" }}>
          {[
            { img: "/invite-badge1.png", label: "First-level friend", count: 0 },
            { img: "/invite-badge2.png", label: "Second-level friend", count: 0 },
            { img: "/invite-badge3.png", label: "Third-level friend", count: 0 },
            { img: "/invite-badge4.png", label: "Total Invitations", count: 0 },
          ].map((b, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <img src={b.img} alt={b.label} style={{ width: "90px", height: "90px", objectFit: "contain", marginBottom: "12px" }} />
              <p style={{ fontSize: "15px", fontWeight: 600, color: "#111", marginBottom: "4px" }}>{b.label}</p>
              <p style={{ fontSize: "18px", fontWeight: 600, color: "#111" }}>{b.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Invitation record ────────────────────────────────── */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 40px 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#111" }}>Invitation record</h2>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px", border: "1px solid #ddd",
            borderRadius: "20px", padding: "6px 16px", cursor: "pointer",
          }}>
            <span style={{ fontSize: "13px", color: "#555" }}>{invFilter}</span>
            <ChevronDown className="w-4 h-4" style={{ color: "#888" }} />
          </div>
        </div>
        {/* Table header */}
        <div style={{ display: "flex", background: "#f5f5f5", padding: "12px 20px", borderRadius: "6px 6px 0 0" }}>
          <span style={{ flex: 1, fontSize: "14px", fontWeight: 500, color: "#111" }}>Name</span>
          <span style={{ width: "200px", fontSize: "14px", fontWeight: 500, color: "#111", textAlign: "right" }}>Time</span>
        </div>
        <NoData />
      </div>

      {/* ── My reward records ────────────────────────────────── */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 40px 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#111" }}>My reward records</h2>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px", border: "1px solid #ddd",
            borderRadius: "20px", padding: "6px 16px", cursor: "pointer",
          }}>
            <span style={{ fontSize: "13px", color: "#555" }}>{rewardFilter}</span>
            <ChevronDown className="w-4 h-4" style={{ color: "#888" }} />
          </div>
        </div>
        {/* Table header */}
        <div style={{ display: "flex", background: "#f5f5f5", padding: "12px 20px", borderRadius: "6px 6px 0 0" }}>
          <span style={{ flex: 1, fontSize: "14px", fontWeight: 500, color: "#111" }}>Name</span>
          <span style={{ flex: 1, fontSize: "14px", fontWeight: 500, color: "#111" }}>Amount of the transaction</span>
          <span style={{ flex: 1, fontSize: "14px", fontWeight: 500, color: "#111" }}>Type</span>
          <span style={{ flex: 1, fontSize: "14px", fontWeight: 500, color: "#111" }}>Award</span>
          <span style={{ width: "120px", fontSize: "14px", fontWeight: 500, color: "#111", textAlign: "right" }}>Time</span>
        </div>
        <NoData />
      </div>

      {/* ── Rule section ─────────────────────────────────────── */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 40px 60px" }}>
        <div style={{
          background: "#f5f5f5", borderRadius: "12px", padding: "24px 32px",
          display: "flex", alignItems: "center", gap: "12px",
        }}>
          <FileText className="w-6 h-6" style={{ color: "#888" }} />
          <h3 style={{ fontSize: "22px", fontWeight: 400, color: "#555" }}>Rule</h3>
        </div>
      </div>
    </div>
  );
};

export default InvitePage;
