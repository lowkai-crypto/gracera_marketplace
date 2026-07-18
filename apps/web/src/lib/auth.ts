import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";

import { eq, getDb, users } from "@/lib/db";

// docs/12-security-and-trust.md: bcrypt min cost 12; 15-min JWT access token,
// rotating refresh tokens.
const BCRYPT_COST = 12;
const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "30d";
const ADMIN_GATE_COOKIE_TTL = "7d";

export const ADMIN_GATE_COOKIE_NAME = "gracera_admin_gate";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

/** Authenticated, but not allowed to do this (docs/20 admin-role gating). */
export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function secret(name: "JWT_ACCESS_SECRET" | "JWT_REFRESH_SECRET"): Uint8Array {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return new TextEncoder().encode(value);
}

export type TokenPayload = {
  sub: string; // user id
  role: string;
};

export async function signAccessToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(secret("JWT_ACCESS_SECRET"));
}

export async function signRefreshToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_TTL)
    .sign(secret("JWT_REFRESH_SECRET"));
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, secret("JWT_ACCESS_SECRET"));
  return { sub: payload.sub as string, role: payload.role as string };
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, secret("JWT_REFRESH_SECRET"));
  return { sub: payload.sub as string, role: payload.role as string };
}

/** Reads and verifies the `Authorization: Bearer <token>` header (docs/10-api-reference.md). */
export async function requireAuth(request: Request): Promise<TokenPayload> {
  const header = request.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new AuthError("Missing or malformed Authorization header");
  }
  try {
    return await verifyAccessToken(token);
  } catch {
    throw new AuthError("Invalid or expired access token");
  }
}

/**
 * Gates internal-only routes meant to be called by a scheduler, not a
 * logged-in user (e.g. `POST /api/internal/run-matching`) — mirrors
 * `apps/ai-service/internal_auth.py::require_internal_secret`. If
 * `INTERNAL_JOB_SECRET` isn't configured (e.g. local dev), the check is
 * skipped rather than locking the route out of itself; it must be set in
 * any environment reachable from the internet.
 */
export function requireInternalSecret(request: Request): void {
  const expected = process.env.INTERNAL_JOB_SECRET;
  if (!expected) return;
  if (request.headers.get("x-internal-secret") !== expected) {
    throw new AuthError("Missing or invalid internal secret");
  }
}

export const ADMIN_ROLES = [
  "super_admin",
  "trust_team",
  "customer_success",
  "finance_ops",
  "content_mod",
  "data_analyst",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

/**
 * Signs the `gracera_admin_gate` cookie set at login for admin accounts
 * (docs/28: `/admin` should be "protected by role-based middleware"). This
 * is deliberately NOT the Bearer access token -- it carries only `{ sub,
 * role }` and is never read by any API route, only by `proxy.ts`'s
 * optimistic redirect check. It cannot be used to call anything; the real
 * authorization check is `requireAdminRole` below, run fresh against the DB
 * on every `/api/admin/**` request.
 */
export async function signAdminGateCookie(payload: TokenPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(ADMIN_GATE_COOKIE_TTL)
    .sign(secret("JWT_ACCESS_SECRET"));
}

export async function verifyAdminGateCookie(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, secret("JWT_ACCESS_SECRET"));
  return { sub: payload.sub as string, role: payload.role as string };
}

/**
 * The real admin authorization check, run fresh against the DB on every
 * request (never trusts the JWT's `role` claim alone, so a revoked admin
 * loses access immediately rather than waiting out the 15-min access token).
 *
 * - No `roles` option: just proves "this is a logged-in admin account" --
 *   used only by `/api/admin/me` and the MFA enroll/verify endpoints, so a
 *   brand-new staff account (`adminRole = null`, MFA not yet enrolled) can
 *   still reach Settings to enroll (docs/28's "enroll own MFA first, then
 *   super_admin grants roles to already-enrolled users" sequencing).
 * - `roles` provided: additionally requires `mfaEnabled` and that
 *   `adminRole` is one of the given roles.
 */
export async function requireAdminRole(
  request: Request,
  options?: { roles?: AdminRole[] },
): Promise<{ sub: string; email: string; adminRole: AdminRole | null; mfaEnabled: boolean }> {
  const auth = await requireAuth(request);

  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, auth.sub)).limit(1);
  if (!user || user.role !== "admin" || user.status !== "active") {
    throw new ForbiddenError("Not an active admin account");
  }

  if (options?.roles) {
    if (!user.mfaEnabled) {
      throw new ForbiddenError("MFA must be enrolled before using this");
    }
    if (!user.adminRole || !options.roles.includes(user.adminRole as AdminRole)) {
      throw new ForbiddenError("This admin role cannot access this resource");
    }
  }

  return {
    sub: user.id,
    email: user.email,
    adminRole: (user.adminRole as AdminRole | null) ?? null,
    mfaEnabled: user.mfaEnabled,
  };
}
