import type { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { AppError } from "../utils/errors";

// Validate any of req.body / req.query / req.params with a zod schema.
// On success, the parsed (and coerced) data replaces the original.
export const validate = <T>(schema: ZodSchema<T>, target: "body" | "query" | "params" = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const data = req[target];
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const issues = (parsed.error as ZodError).issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return next(new AppError(400, "Validation failed", "VALIDATION", issues));
    }
    (req as any)[target] = parsed.data;
    next();
  };
