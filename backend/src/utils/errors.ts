// Custom error class so we can throw with a status code from anywhere
// and let the global error middleware turn it into a JSON response.

export class AppError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (msg: string, code?: string, details?: unknown) =>
  new AppError(400, msg, code || "BAD_REQUEST", details);
export const unauthorized = (msg = "Unauthorized") => new AppError(401, msg, "UNAUTHORIZED");
export const forbidden = (msg = "Forbidden") => new AppError(403, msg, "FORBIDDEN");
export const notFound = (msg = "Not found") => new AppError(404, msg, "NOT_FOUND");
export const conflict = (msg: string) => new AppError(409, msg, "CONFLICT");
export const serverError = (msg = "Internal server error") => new AppError(500, msg, "SERVER_ERROR");
