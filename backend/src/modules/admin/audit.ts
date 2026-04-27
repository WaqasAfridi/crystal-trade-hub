// Helper for all admin routes — records what an admin did, and on whom.
import { prisma } from "../../config/prisma";

export const audit = async (
  adminId: string,
  action: string,
  target?: string,
  details?: any,
  ip?: string,
) => {
  await prisma.adminAuditLog.create({
    data: {
      adminId,
      action,
      target: target || null,
      details: details ? JSON.stringify(details) : null,
      ip: ip || null,
    },
  });
};
