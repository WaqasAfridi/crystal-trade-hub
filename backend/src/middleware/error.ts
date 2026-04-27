import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Endpoint not found", code: "NOT_FOUND" });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  // Known AppError -> use its status
  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      code: err.code,
      details: err.details,
    });
  }

  // Prisma unique-constraint
  if (err?.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: `Already exists: ${(err.meta as any)?.target?.join?.(", ") || "duplicate"}`,
      code: "DUPLICATE",
    });
  }

  // Prisma not found
  if (err?.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Record not found",
      code: "NOT_FOUND",
    });
  }

  console.error("[error]", err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : (err.message || String(err)),
    code: "SERVER_ERROR",
  });
};
