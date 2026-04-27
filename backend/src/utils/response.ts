// Standard JSON response envelope used by every endpoint.
import type { Response } from "express";

export const ok = <T>(res: Response, data: T, message = "OK") =>
  res.json({ success: true, message, data });

export const created = <T>(res: Response, data: T, message = "Created") =>
  res.status(201).json({ success: true, message, data });

export const fail = (res: Response, status: number, message: string, code?: string, details?: unknown) =>
  res.status(status).json({ success: false, message, code, details });
