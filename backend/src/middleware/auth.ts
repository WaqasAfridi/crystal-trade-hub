import type { Request, Response, NextFunction } from "express";
import { verifyUserToken, verifyAdminToken } from "../utils/jwt";
import { unauthorized, forbidden } from "../utils/errors";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      adminId?: string;
      adminRole?: string;
    }
  }
}

const extractToken = (req: Request): string | null => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) return auth.slice(7).trim();
  // also support cookie if the frontend prefers it
  if (req.cookies?.token) return req.cookies.token;
  return null;
};

// User authentication
export const requireUser = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    if (!token) throw unauthorized("Missing token");
    const payload = verifyUserToken(token);
    if (payload.role !== "user") throw unauthorized("Invalid token role");
    req.userId = payload.sub;
    next();
  } catch (e) {
    next(unauthorized("Invalid or expired token"));
  }
};

// Optional auth — sets req.userId if a valid token is present, otherwise continues
export const optionalUser = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    if (token) {
      const payload = verifyUserToken(token);
      if (payload.role === "user") req.userId = payload.sub;
    }
  } catch { /* ignore */ }
  next();
};

// Admin authentication (any admin role)
export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    if (!token) throw unauthorized("Missing admin token");
    const payload = verifyAdminToken(token);
    if (payload.role !== "admin") throw unauthorized("Invalid token role");
    req.adminId = payload.sub;
    req.adminRole = payload.adminRole;
    next();
  } catch {
    next(unauthorized("Invalid or expired admin token"));
  }
};

// Restrict to specific admin roles
export const requireAdminRole = (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.adminRole || !roles.includes(req.adminRole)) return next(forbidden("Insufficient permissions"));
    next();
  };
