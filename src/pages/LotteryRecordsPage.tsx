import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const LotteryRecordsPage = () => {
  const [currentPage] = useState(1);

  return (
    <div style={{ background: "#161a1e", minHeight: "100vh" }}>
      {/* ── Hero Banner ─────────────────────────────────── */}
      <div
        style={{
          width: "100%",
          height: "320px",
          backgroundImage: "url(/lottery-banner.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "0 60px",
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "42px",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "12px",
                lineHeight: 1.2,
              }}
            >
              Welfare Center
            </h1>
            <p
              style={{
                fontSize: "16px",
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.4,
              }}
            >
              Daily check-in to earn cash
            </p>
          </div>
        </div>
      </div>

      {/* ── Content Area ─────────────────────────────────── */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 60px 60px" }}>
        {/* Daily lottery count pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "#242529",
            borderRadius: "30px",
            padding: "0 32px",
            height: "48px",
            width: "fit-content",
            maxWidth: "400px",
            marginTop: "28px",
            marginBottom: "28px",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#2a2d32";
            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#242529";
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          }}
        >
          {/* Gold circle icon */}
          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f5a623 0%, #e8941a 50%, #d4820f 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 0 8px rgba(245,166,35,0.4)",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.9)",
              }}
            />
          </div>
          <span
            style={{
              color: "#fff",
              fontSize: "14px",
              fontWeight: 400,
              whiteSpace: "nowrap",
              flex: 1,
            }}
          >
            Daily lottery count：1
          </span>
          <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "#fff" }} />
        </div>

        {/* ── Prize details section ──────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div
            style={{
              width: "3px",
              height: "18px",
              background: "#7bffb6",
              borderRadius: "2px",
            }}
          />
          <span style={{ color: "#fff", fontSize: "16px", fontWeight: 500 }}>Prize details</span>
        </div>

        {/* Table */}
        <div style={{ borderRadius: "4px", overflow: "hidden", marginBottom: "16px" }}>
          {/* Table Header */}
          <div
            style={{
              display: "flex",
              background: "#242529",
              padding: "12px 20px",
            }}
          >
            {["Draw time", "Won/Not won", "Prize name", "Quantity"].map((col, i) => (
              <span
                key={i}
                style={{
                  flex: i === 0 ? 1.5 : 1,
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                {col}
              </span>
            ))}
          </div>
          {/* Table Body - No Data */}
          <div
            style={{
              padding: "40px 0",
              textAlign: "center",
              color: "#8a8c8e",
              fontSize: "14px",
              background: "#242529",
              borderTop: "1px solid #1e2024",
            }}
          >
            No Data
          </div>
        </div>

        {/* Pagination */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            marginTop: "16px",
            marginBottom: "32px",
          }}
        >
          <button
            disabled
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              border: "1px solid #8a8c8e",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "not-allowed",
              opacity: 0.5,
            }}
          >
            <ChevronLeft className="w-4 h-4" style={{ color: "#8a8c8e" }} />
          </button>
          <button
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              border: "1px solid #fff",
              background: "#fff",
              color: "#000",
              fontSize: "14px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {currentPage}
          </button>
          <button
            disabled
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              border: "1px solid #8a8c8e",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "not-allowed",
              opacity: 0.5,
            }}
          >
            <ChevronRight className="w-4 h-4" style={{ color: "#8a8c8e" }} />
          </button>
        </div>

        {/* ── Activity rules section ─────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div
            style={{
              width: "3px",
              height: "18px",
              background: "#7bffb6",
              borderRadius: "2px",
            }}
          />
          <span style={{ color: "#fff", fontSize: "16px", fontWeight: 500 }}>Activity rules</span>
        </div>
        <div style={{ padding: "20px", color: "#fff", fontSize: "13px", minHeight: "60px" }} />
      </div>
    </div>
  );
};

export default LotteryRecordsPage;
