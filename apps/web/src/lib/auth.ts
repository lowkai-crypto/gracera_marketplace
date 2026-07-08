import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";

// docs/12-security-and-trust.md: bcrypt min cost 12; 15-min JWT access token,
// rotating refresh tokens.
const BCRYPT_COST = 12;
const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "30d";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
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
