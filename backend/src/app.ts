import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";

import { env } from "./config/env";
import api from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/error";

export const buildApp = () => {
  const app = express();

  app.set("trust proxy", 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (env.corsOrigins.includes("*")) return cb(null, true);
        if (env.corsOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`CORS blocked: ${origin}`));
      },
      credentials: true,
    }),
  );

  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));
  app.use(cookieParser());

  if (!env.isProd) app.use(morgan("dev"));

  // Rate limiting on auth endpoints to slow down brute force
  app.use(
    ["/api/auth/login", "/api/auth/register", "/api/admin/auth/login"],
    rateLimit({
      windowMs: 15 * 60 * 1000,        // 15 min
      max: 30,                         // 30 attempts / window / IP
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Serve uploaded KYC files (read-only). In production put these behind auth + signed URLs.
  app.use("/uploads", express.static(path.resolve(env.uploads.dir)));

  // Health check
  app.get("/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

  app.use("/api", api);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
