const tasks = [
  { target: 50000,  reward: 3000 },
  { target: 100000, reward: 8000 },
  { target: 20000,  reward: 1000 },
];

const RewardsHubPage = () => {
  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      {/* ── Hero Banner ─────────────────────────────────────── */}
      <div
        style={{
          width: "100%",
          height: "320px",
          background: "linear-gradient(135deg, #2a2a2a 0%, #4a4a4a 40%, #888 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "0 40px",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Text */}
          <div style={{ maxWidth: "700px" }}>
            <h1
              style={{
                fontSize: "40px",
                fontWeight: 400,
                color: "#fff",
                lineHeight: 1.3,
                marginBottom: "16px",
              }}
            >
              Join activities and earn attractive rewards in Rewards Hub.
            </h1>
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)" }}>
              Grab the rewards before they run out!
            </p>
          </div>
          {/* Illustration */}
          <img
            src="/rewards-banner.png"
            alt="Rewards"
            style={{
              height: "280px",
              objectFit: "contain",
              flexShrink: 0,
              marginRight: "-20px",
            }}
          />
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 40px 80px" }}>
        <h2 style={{ fontSize: "32px", fontWeight: 700, color: "#111", marginBottom: "32px" }}>
          Reward center
        </h2>

        {/* Recharge task heading */}
        <p
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "#111",
            marginBottom: "24px",
            textDecoration: "underline",
            textUnderlineOffset: "4px",
          }}
        >
          Recharge task
        </p>

        {/* Task cards */}
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          {tasks.map((task, i) => {
            const progress = 0;
            const pct = Math.min((progress / task.target) * 100, 100);
            return (
              <div
                key={i}
                style={{
                  flex: "1 1 280px",
                  maxWidth: "360px",
                  background: "#fff",
                  borderRadius: "16px",
                  padding: "28px 24px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  border: "1px solid #eee",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {/* Top row: progress / reward */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: "18px", color: "#888" }}>
                    {progress}/{task.target}
                  </span>
                  <span style={{ fontSize: "22px", fontWeight: 700, color: "#111" }}>
                    {task.reward}
                  </span>
                </div>

                {/* Description */}
                <p style={{ fontSize: "16px", fontWeight: 500, color: "#111", lineHeight: 1.4 }}>
                  Recharge {task.target} to get {task.reward}
                </p>

                {/* Progress bar */}
                <div
                  style={{
                    width: "100%",
                    height: "6px",
                    background: "#e5e7eb",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(pct, 2)}%`,
                      height: "100%",
                      background: "#333",
                      borderRadius: "3px",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>

                {/* Button */}
                <button
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#f5f5f5",
                    color: "#333",
                    border: "1px solid #ddd",
                    borderRadius: "24px",
                    fontSize: "15px",
                    fontWeight: 500,
                    cursor: "pointer",
                    marginTop: "4px",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "#eee";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "#f5f5f5";
                  }}
                >
                  Undone
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RewardsHubPage;
