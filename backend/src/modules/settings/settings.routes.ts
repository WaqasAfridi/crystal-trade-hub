import { Router } from "express";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/response";
import { PUBLIC_SETTING_KEYS } from "./settings.service";

const router = Router();

// Public — exposes only whitelisted keys (used by frontend to render branding/banners)
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const rows = await prisma.setting.findMany({ where: { key: { in: PUBLIC_SETTING_KEYS } } });
    const out: Record<string, any> = {};
    for (const r of rows) {
      try { out[r.key] = JSON.parse(r.value); } catch { out[r.key] = r.value; }
    }
    return ok(res, out);
  }),
);

export default router;
