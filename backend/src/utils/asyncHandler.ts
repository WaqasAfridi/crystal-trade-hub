import type { Request, Response, NextFunction } from "express";

// Wraps async route handlers so thrown/rejected errors flow into errorHandler.
export const asyncHandler =
  <T extends (req: Request, res: Response, next: NextFunction) => Promise<any>>(fn: T) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
