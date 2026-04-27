import multer from "multer";
import path from "path";
import fs from "fs";
import { env } from "../config/env";
import { badRequest } from "../utils/errors";

// Make sure the upload directory exists
if (!fs.existsSync(env.uploads.dir)) fs.mkdirSync(env.uploads.dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploads.dir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safe}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: env.uploads.maxMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".pdf", ".heic"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) return cb(badRequest("Unsupported file type"));
    cb(null, true);
  },
});
