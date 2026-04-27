import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface UserTokenPayload {
  sub: string;       // user id
  role: "user";
}

export interface AdminTokenPayload {
  sub: string;       // admin id
  role: "admin";
  adminRole: string; // SUPER_ADMIN, ADMIN, MODERATOR, SUPPORT
}

export const signUserToken = (payload: Omit<UserTokenPayload, "role">) =>
  jwt.sign({ ...payload, role: "user" }, env.jwt.userSecret, {
    expiresIn: env.jwt.userExpiresIn,
  } as SignOptions);

export const signAdminToken = (payload: Omit<AdminTokenPayload, "role">) =>
  jwt.sign({ ...payload, role: "admin" }, env.jwt.adminSecret, {
    expiresIn: env.jwt.adminExpiresIn,
  } as SignOptions);

export const verifyUserToken = (token: string): UserTokenPayload => {
  return jwt.verify(token, env.jwt.userSecret) as UserTokenPayload;
};

export const verifyAdminToken = (token: string): AdminTokenPayload => {
  return jwt.verify(token, env.jwt.adminSecret) as AdminTokenPayload;
};
