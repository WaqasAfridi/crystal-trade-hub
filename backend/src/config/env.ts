import dotenv from "dotenv";
dotenv.config();

const required = (name: string, fallback?: string): string => {
  const v = process.env[name] ?? fallback;
  if (v === undefined) {
    console.error(`[env] Missing required variable: ${name}`);
    process.exit(1);
  }
  return v;
};

export const env = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  isProd: process.env.NODE_ENV === "production",

  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:8080,http://localhost:5174")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  databaseUrl: required("DATABASE_URL", "file:./dev.db"),

  jwt: {
    userSecret: required("JWT_SECRET", "dev-user-secret"),
    userExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    adminSecret: required("JWT_ADMIN_SECRET", "dev-admin-secret"),
    adminExpiresIn: process.env.JWT_ADMIN_EXPIRES_IN || "1d",
  },

  seed: {
    adminUsername: process.env.SEED_ADMIN_USERNAME || "admin",
    adminEmail: process.env.SEED_ADMIN_EMAIL || "admin@crystaltradehub.local",
    adminPassword: process.env.SEED_ADMIN_PASSWORD || "Admin@12345",
  },

  uploads: {
    dir: process.env.UPLOAD_DIR || "./uploads",
    maxMb: parseInt(process.env.MAX_UPLOAD_MB || "10", 10),
  },
};
